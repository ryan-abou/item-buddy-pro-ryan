
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Create item status enum
CREATE TYPE public.item_status AS ENUM ('available', 'checked_out', 'maintenance', 'lost', 'retired');

-- Create loan status enum
CREATE TYPE public.loan_status AS ENUM ('active', 'returned', 'overdue');

-- Students table (no auth required)
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  grade TEXT,
  max_items INTEGER NOT NULL DEFAULT 3,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff profiles (linked to auth)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Items table
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_tag TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  description TEXT,
  status item_status NOT NULL DEFAULT 'available',
  condition TEXT DEFAULT 'Good',
  location TEXT,
  default_loan_duration INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Loans table
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id),
  student_id UUID NOT NULL REFERENCES public.students(id),
  staff_id UUID REFERENCES auth.users(id),
  checkout_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date TIMESTAMPTZ NOT NULL,
  return_at TIMESTAMPTZ,
  status loan_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Settings table
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email logs table
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  loan_id UUID REFERENCES public.loans(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log table
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  student_id UUID REFERENCES public.students(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function: check role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Helper: is staff (includes admin)
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
  )
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- Students: anyone can read (for kiosk lookup), staff/admin can manage
CREATE POLICY "Anyone can read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Staff can insert students" ON public.students FOR INSERT WITH CHECK (public.is_staff_or_admin());
CREATE POLICY "Staff can update students" ON public.students FOR UPDATE USING (public.is_staff_or_admin());
CREATE POLICY "Admin can delete students" ON public.students FOR DELETE USING (public.is_admin());

-- Profiles: own profile readable, admin sees all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_staff_or_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- User roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admin can manage roles" ON public.user_roles FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update roles" ON public.user_roles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin can delete roles" ON public.user_roles FOR DELETE USING (public.is_admin());

-- Items: anyone can read (kiosk), staff/admin can manage
CREATE POLICY "Anyone can read items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Admin can insert items" ON public.items FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Staff can update items" ON public.items FOR UPDATE USING (public.is_staff_or_admin());
CREATE POLICY "Admin can delete items" ON public.items FOR DELETE USING (public.is_admin());

-- Loans: anyone can read (for kiosk my-items), staff/admin can manage
CREATE POLICY "Anyone can read loans" ON public.loans FOR SELECT USING (true);
CREATE POLICY "Staff can insert loans" ON public.loans FOR INSERT WITH CHECK (public.is_staff_or_admin());
CREATE POLICY "Staff can update loans" ON public.loans FOR UPDATE USING (public.is_staff_or_admin());
CREATE POLICY "Admin can delete loans" ON public.loans FOR DELETE USING (public.is_admin());

-- Settings: admin only
CREATE POLICY "Admin can read settings" ON public.settings FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can insert settings" ON public.settings FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update settings" ON public.settings FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin can delete settings" ON public.settings FOR DELETE USING (public.is_admin());

-- Email logs: admin only read
CREATE POLICY "Admin can read email logs" ON public.email_logs FOR SELECT USING (public.is_staff_or_admin());
CREATE POLICY "Staff can insert email logs" ON public.email_logs FOR INSERT WITH CHECK (public.is_staff_or_admin());

-- Audit log: staff/admin can read, anyone can insert (via edge function)
CREATE POLICY "Staff can read audit log" ON public.audit_log FOR SELECT USING (public.is_staff_or_admin());
CREATE POLICY "Staff can insert audit log" ON public.audit_log FOR INSERT WITH CHECK (public.is_staff_or_admin());
