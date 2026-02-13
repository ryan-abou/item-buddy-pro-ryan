
# Staff Setup Plan

## What we'll do

### 1. Create your admin account
- Sign up a test user via an edge function that creates the account and assigns the "admin" role
- Test email: `admin@test.com` / password: `admin123456`
- The edge function will use the service role to create the user, insert a profile, and assign the admin role -- all in one step

### 2. Add a Staff Management tab to the admin dashboard
- Add a new "Staff" tab (visible only to admins) in the admin dashboard
- Shows a list of all staff/admin users (pulled from `user_roles` joined with `profiles`)
- "Invite Staff" button that lets you create a new staff account by entering their email and password, and choosing their role (staff or admin)
- Ability to change a user's role or remove their access

---

## Technical Details

### Database migration
- No new tables needed -- `user_roles` and `profiles` already exist
- Add an RLS policy so admins can read all profiles (needed to list staff members)

### Edge function: `create-staff`
- Accepts `email`, `password`, `full_name`, and `role`
- Uses the Supabase Admin API (service role) to create the auth user
- Inserts a record into `user_roles` with the chosen role
- The existing `handle_new_user` trigger will auto-create the profile
- Protected: only callable by authenticated admins (checks `is_admin()` via the caller's JWT)

### Seed the first admin
- A second edge function call (or the same one bootstrapped) will create the `admin@test.com` user with the admin role
- Since no admin exists yet, the bootstrap will use a special one-time path that checks if any admin exists; if not, it allows the first creation

### Frontend changes
- **New file: `src/pages/admin/StaffTab.tsx`** -- staff list + invite dialog
- **Edit: `AdminDashboard.tsx`** -- add the Staff tab (admin-only, alongside Settings)

### Files to create/modify
1. `supabase/functions/create-staff/index.ts` -- new edge function
2. `supabase/migrations/...` -- RLS policy for admin to read all profiles
3. `src/pages/admin/StaffTab.tsx` -- new staff management UI
4. `src/pages/admin/AdminDashboard.tsx` -- add Staff tab
