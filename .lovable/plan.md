

# Plan: Expand Documentation Page with Code Explanations

## What the user wants
1. More detailed documentation that explains the actual code — how each file works, what each section does, so non-technical departments can understand
2. Export the documentation as a single downloadable file (user said "one javascript file" but likely means a downloadable document — we'll provide a .html file export since we can't generate .docx natively in the browser without a library)

## Changes

### 1. Expand `src/pages/Documentation.tsx` content

Add new sections to the existing documentation page:

**Code Architecture Overview** — explain the folder structure:
- `src/pages/` — each screen in the app (Index, Checkout, Return, StaffLogin, admin/)
- `src/components/` — reusable UI pieces (VirtualKeyboard, StudentIdEntry, NavLink)
- `src/contexts/` — shared state (StudentContext for student sessions, AuthContext for staff login, KioskKeyboardContext for virtual keyboard)
- `src/lib/` — helper functions that talk to the backend
- `supabase/functions/` — backend functions that run on the server

**How Each Page Works** — plain-English explanation:
- **Home (Index.tsx)**: Shows three buttons, checks if a student is already identified, handles dark/light mode toggle
- **Checkout (Checkout.tsx)**: Two-phase flow — first identify student, then show available items with search/filter, then confirmation dialog
- **Return (Return.tsx)**: Identify student, show their active loans, return button per item
- **Staff Login (StaffLogin.tsx)**: Email/password form, authenticates via backend, redirects to admin
- **Admin Dashboard**: Tab-based layout with Inventory, Students, Loans, Staff, Settings

**How the Backend Functions Work** — explain each edge function in simple terms:
- `student-lookup`: Receives a student ID number, searches the database, returns the student record or null
- `student-register`: Creates a new student record with first/last name
- `student-checkout`: Validates the request, checks rate limits, verifies item availability and student limits, creates a loan record, updates item status, logs the action
- `student-return`: Marks a loan as returned, sets the item back to available
- `student-loans`: Fetches all or active-only loans for a student
- `create-staff`: Creates a new staff login account (admin only)

**How Security Works in the Code** — explain the service key pattern, RLS, and rate limiting in plain terms

### 2. Add "Download as HTML" button

Add a button next to the existing "Print / Save as PDF" button that:
- Collects the `<article>` element's innerHTML
- Wraps it in a complete HTML document with inline styles
- Creates a Blob and triggers a download as `IT-Equipment-Checkout-Documentation.html`
- This HTML file can be opened in Word, Google Docs, or any browser

This is simpler and more reliable than trying to generate a .docx file (which would require a heavy library). The HTML file opens directly in Microsoft Word and preserves formatting.

### Files to edit
| File | Change |
|------|--------|
| `src/pages/Documentation.tsx` | Add expanded code explanation sections + download button |

