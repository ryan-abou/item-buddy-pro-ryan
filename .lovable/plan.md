

# IT Equipment Checkout System — Complete Documentation

This is a comprehensive overview of the entire application, written so that any department (IT, administration, or otherwise) can understand what it does, how it works, and how to use it.

---

## What Is This Application?

This is a **self-service IT equipment checkout kiosk** built as a web app. It runs in a browser (designed for a Raspberry Pi touchscreen or any computer) and lets **students borrow and return IT equipment** (laptops, chargers, cables, etc.) without needing a staff member present. Staff and admins manage everything through a separate admin dashboard.

---

## Who Uses It?

| Role | How They Access It | What They Can Do |
|------|--------------------|------------------|
| **Students** | Walk up to the kiosk, enter their Student ID | Check out equipment, return equipment |
| **Staff** | Log in with email/password via "Staff Login" | View inventory, students, and loans |
| **Admins** | Log in the same way (have admin role) | Everything staff can do, plus: add/remove items, manage students, manage staff accounts, change settings |

---

## The Student Experience (Kiosk Mode)

### Home Screen
- Three big buttons: **Check Out**, **Return**, and **Staff Login**
- Dark/light mode toggle in the top corner
- If a student is already identified (entered their ID recently), their name appears with a "Not you?" link

### Checking Out Equipment
1. Student taps **Check Out**
2. Enters their **Student ID** (6-12 digit number) using the on-screen virtual keyboard or a physical keyboard
3. If the student isn't in the system, they can **self-register** by entering their first and last name
4. Once identified, they see a list of all **available items** with checkboxes
5. They can **search** by name or asset tag, and **filter by category**
6. They select one or more items (up to their max limit, default 3)
7. A floating bar appears at the bottom showing how many items are selected
8. They tap **Continue**, which opens a form asking:
   - How many days they need the items (required)
   - Why they need them (required)
   - Which teacher sent them (optional)
9. A summary appears, and they confirm the checkout
10. The system records the loan and marks items as "checked out"

### Returning Equipment
1. Student taps **Return**
2. Enters their Student ID
3. Sees a list of all items they currently have checked out, with due dates
4. Overdue items are highlighted in red
5. They tap **Return** next to each item to return it
6. The item goes back to "available" status

### Session Management
- After 60 seconds of inactivity, the student session automatically clears and returns to the home screen
- This prevents the next student from accessing the previous student's account

---

## The Staff/Admin Experience

### Logging In
- Tap **Staff Login** on the home screen
- Enter email and password
- Redirected to the **Admin Dashboard**

### Admin Dashboard Tabs

#### 1. Inventory Tab
- Shows all equipment in a searchable table
- Columns: Asset Tag, Name, Category, Location, Status
- Click any item to see full details: condition, description, who currently has it, and complete loan history
- Staff can change item status (Available, Maintenance, Lost, Retired)
- Admins can add new items

#### 2. Students Tab
- Searchable list of all registered students
- Shows: Student ID, Name, Email, Grade, Active/Inactive status
- Admins can add new students or deactivate/activate them

#### 3. Loans Tab
- Complete history of all loans (past and present)
- Filterable by: All, Active, Overdue, Returned
- Shows: Student name, Item name, Checkout date, Due date, Return date, Status, Reason, Teacher
- Searchable by student name/ID or item name/asset tag

#### 4. Staff Tab (Admin Only)
- Manage staff and admin accounts
- Create new accounts with email, password, name, and role (Staff or Admin)
- Change roles or remove staff members

#### 5. Settings Tab (Admin Only)
- Configure loan defaults (default duration, max items per student, overdue reminder days)
- Email/SMTP settings for notifications
- School/organization name

---

## Database Structure

The system stores data in these tables:

| Table | Purpose |
|-------|---------|
| **students** | Student records (student_id, name, email, grade, max_items, active flag) |
| **items** | Equipment inventory (asset_tag, name, category, status, condition, location, default loan duration) |
| **loans** | Checkout/return records (links student to item, tracks dates, status, reason, teacher) |
| **profiles** | Staff user profiles (linked to login accounts) |
| **user_roles** | Maps staff users to roles (admin or staff) |
| **settings** | Key-value configuration store |
| **audit_log** | Tracks all checkout/return actions for accountability |
| **email_logs** | Records of any notification emails sent |

### Item Statuses
- **Available** — can be checked out
- **Checked Out** — currently borrowed by a student
- **Maintenance** — temporarily unavailable
- **Lost** — reported missing
- **Retired** — permanently removed from service

### Loan Statuses
- **Active** — currently checked out
- **Returned** — brought back
- **Overdue** — past due date (calculated automatically)

---

## Security Model

- **Students do not have login accounts.** They identify by Student ID only. They cannot access the admin dashboard or see other students' data.
- **All student-facing operations** (lookup, register, checkout, return, view loans) go through secure **backend functions** that use a privileged service key. Students never directly query the database.
- **Staff/Admin operations** require email/password authentication. The system checks roles server-side.
- **Row-Level Security (RLS)** is enabled on every table, ensuring even if someone bypasses the UI, the database itself enforces access rules.
- **Rate limiting**: Checkout is limited to 5 attempts per student per hour to prevent abuse.
- **Input validation**: All backend functions validate formats (UUID, date, string lengths) before processing.

---

## Virtual Keyboard

The app includes a built-in on-screen keyboard for touchscreen kiosks. It supports:
- **Numeric mode** — for Student ID entry
- **Alpha mode** — for names and teacher fields
- **Full mode** — switches between letters and numbers (for email/password on staff login)

Physical keyboards also work simultaneously — inputs accept both.

---

## Technical Stack (for IT departments)

| Component | Technology |
|-----------|-----------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui components |
| Backend | Lovable Cloud (database, auth, serverless functions) |
| Hosting | Lovable (lovable.app domain, or custom domain) |
| Font | Poppins (Google Fonts) |
| Theme | Dark mode by default, toggleable |

---

## How to Deploy on a Raspberry Pi Kiosk

1. Open the published URL (e.g., `https://item-buddy-pro.lovable.app`) in a full-screen browser (Chromium kiosk mode)
2. No software installation needed — it's a web app
3. Ensure the Pi has internet access to reach the backend
4. The virtual keyboard handles all input on touchscreens

---

## First-Time Setup

1. Navigate to the app URL
2. Go to **Staff Login**
3. The first admin account needs to be created via the backend (bootstrap mode — no existing admin required for the very first account)
4. Once logged in as admin, use the **Staff Tab** to create additional staff/admin accounts
5. Use the **Inventory Tab** to add your equipment
6. Use the **Students Tab** to pre-register students, or let students self-register at the kiosk
7. Configure defaults in the **Settings Tab**

