export default function DocPageExplanations() {
  return (
    <>
      <h2>How Each Page Works</h2>

      <h3>Home Page (<code>Index.tsx</code>)</h3>
      <p>This is the landing screen of the kiosk. It does the following:</p>
      <ul>
        <li>Displays three large, touch-friendly buttons: <strong>Check Out</strong>, <strong>Return</strong>, and <strong>Staff Login</strong></li>
        <li>Checks if a student was recently identified (their session is stored in React context). If so, shows their name with a "Not you?" option</li>
        <li>Includes a dark/light mode toggle (top corner) that persists across sessions using browser local storage</li>
        <li>Links to this documentation page</li>
      </ul>

      <h3>Checkout Page (<code>Checkout.tsx</code>)</h3>
      <p>This is the most complex student-facing page. It operates in phases:</p>
      <ol>
        <li><strong>Phase 1 — Identify the student:</strong> Shows the Student ID entry form. If the student isn't registered, offers a self-registration form (first name, last name). Uses the <code>student-lookup</code> and <code>student-register</code> backend functions.</li>
        <li><strong>Phase 2 — Select items:</strong> Once identified, loads all items with status "available" from the database. Displays them in a scrollable list with checkboxes. Students can:
          <ul>
            <li>Search by item name or asset tag</li>
            <li>Filter by category (e.g., "Laptops", "Chargers")</li>
            <li>Select up to their maximum allowed items (default 3, configurable per student)</li>
          </ul>
        </li>
        <li><strong>Phase 3 — Checkout details:</strong> A dialog/form asks how many days they need the items, the reason for borrowing, and optionally which teacher sent them.</li>
        <li><strong>Phase 4 — Confirmation:</strong> Shows a summary of selected items and details. On confirm, calls the <code>student-checkout</code> backend function which creates loan records and marks items as checked out.</li>
      </ol>

      <h3>Return Page (<code>Return.tsx</code>)</h3>
      <ol>
        <li>Student enters their Student ID</li>
        <li>The page calls <code>student-loans</code> to fetch all active loans for that student</li>
        <li>Displays each borrowed item with its due date. Overdue items are highlighted in red</li>
        <li>Each item has a "Return" button that calls <code>student-return</code>, which marks the loan as returned and sets the item back to available</li>
      </ol>

      <h3>Staff Login Page (<code>StaffLogin.tsx</code>)</h3>
      <ul>
        <li>Standard email/password login form</li>
        <li>Uses the authentication system (not the edge functions) to verify credentials</li>
        <li>On successful login, checks the <code>user_roles</code> table to determine if the user is "admin" or "staff"</li>
        <li>Redirects to the Admin Dashboard</li>
        <li>Includes a <strong>bootstrap mode</strong>: if no admin accounts exist yet, allows creating the first admin account without authentication</li>
      </ul>

      <h3>Admin Dashboard (<code>admin/AdminDashboard.tsx</code>)</h3>
      <p>A tabbed interface with five sections. Each tab is its own component file:</p>
      <ul>
        <li><strong>InventoryTab.tsx</strong> — searchable equipment table. Click any item to see details, current borrower, and full loan history. Admins can add items; staff can change statuses.</li>
        <li><strong>StudentsTab.tsx</strong> — searchable student list. Admins can add, activate, or deactivate students.</li>
        <li><strong>LoansTab.tsx</strong> — filterable loan history (All / Active / Overdue / Returned). Searchable by student or item.</li>
        <li><strong>StaffTab.tsx</strong> — admin-only. Create new staff/admin accounts, change roles, remove staff.</li>
        <li><strong>SettingsTab.tsx</strong> — admin-only. Configure loan duration defaults, max items per student, school name, email/SMTP settings.</li>
      </ul>
    </>
  );
}
