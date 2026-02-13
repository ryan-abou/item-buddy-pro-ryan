-- Fix user_roles SELECT: restrictive-only policies block all access
-- Drop the restrictive policy and recreate as permissive
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id) OR is_admin());