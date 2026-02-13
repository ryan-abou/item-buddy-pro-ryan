
-- Remove public read access from students table
DROP POLICY IF EXISTS "Anyone can read students" ON public.students;
DROP POLICY IF EXISTS "Anyone can register as student" ON public.students;

-- Staff/admin can read students
CREATE POLICY "Staff can read students"
  ON public.students FOR SELECT
  USING (is_staff_or_admin());

-- Remove public read access from loans table
DROP POLICY IF EXISTS "Anyone can read loans" ON public.loans;

-- Staff/admin can read loans
CREATE POLICY "Staff can read loans"
  ON public.loans FOR SELECT
  USING (is_staff_or_admin());
