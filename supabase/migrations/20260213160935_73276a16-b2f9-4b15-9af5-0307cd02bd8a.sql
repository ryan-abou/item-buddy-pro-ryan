
-- Allow anonymous inserts to students table for kiosk self-registration
CREATE POLICY "Anyone can register as student" ON public.students FOR INSERT WITH CHECK (true);
