export default function DocBackendFunctions() {
  return (
    <>
      <h2>How the Backend Functions Work</h2>
      <p>
        The application uses <strong>serverless backend functions</strong> for all sensitive operations.
        These run on the server (not in the student's browser) and use a privileged service key that can
        bypass Row-Level Security to read/write data. Here's what each one does:
      </p>

      <h3><code>student-lookup</code></h3>
      <p><strong>Purpose:</strong> Find a student by their Student ID number.</p>
      <ul>
        <li><strong>Input:</strong> A student ID (6–12 digits)</li>
        <li><strong>Validation:</strong> Checks that the ID is the correct format (digits only, proper length)</li>
        <li><strong>Process:</strong> Queries the <code>students</code> table for an active student with that ID</li>
        <li><strong>Output:</strong> Returns the student record if found, or <code>null</code> if not</li>
      </ul>

      <h3><code>student-register</code></h3>
      <p><strong>Purpose:</strong> Create a new student record when a student self-registers at the kiosk.</p>
      <ul>
        <li><strong>Input:</strong> Student ID, first name, last name</li>
        <li><strong>Validation:</strong> Checks ID format, name length (1–100 chars), name characters (letters, spaces, hyphens, apostrophes only)</li>
        <li><strong>Process:</strong> Checks if the ID is already taken, then inserts a new row in the <code>students</code> table</li>
        <li><strong>Output:</strong> Returns the newly created student record</li>
        <li><strong>Auto-generated email:</strong> Creates an email in the format <code>studentid@fcstu.org</code></li>
      </ul>

      <h3><code>student-checkout</code></h3>
      <p><strong>Purpose:</strong> Process an equipment checkout (the most complex function).</p>
      <ul>
        <li><strong>Input:</strong> Student ID (database UUID), list of item IDs, number of days, reason, optional teacher name</li>
        <li><strong>Validation steps:</strong>
          <ol>
            <li>Validates all input formats (UUIDs, positive numbers, string lengths)</li>
            <li><strong>Rate limiting:</strong> Checks if this student has made more than 5 checkout attempts in the last hour. If so, blocks the request.</li>
            <li>Verifies the student exists and is active</li>
            <li>Counts how many items the student currently has checked out and ensures adding more won't exceed their limit</li>
            <li>Verifies each requested item is actually available (not already checked out, retired, etc.)</li>
          </ol>
        </li>
        <li><strong>Process:</strong>
          <ol>
            <li>Creates a <code>loan</code> record for each item (with checkout date, calculated due date, reason, teacher)</li>
            <li>Updates each item's status to "checked_out"</li>
            <li>Writes an entry to the <code>audit_log</code> table for accountability</li>
          </ol>
        </li>
        <li><strong>Output:</strong> Returns a success message with the list of created loan IDs</li>
      </ul>

      <h3><code>student-return</code></h3>
      <p><strong>Purpose:</strong> Process an equipment return.</p>
      <ul>
        <li><strong>Input:</strong> Loan ID (the specific checkout record to return)</li>
        <li><strong>Validation:</strong> Verifies the loan exists and is currently active</li>
        <li><strong>Process:</strong>
          <ol>
            <li>Updates the loan status to "returned" and sets the return timestamp</li>
            <li>Sets the item's status back to "available"</li>
            <li>Writes an audit log entry</li>
          </ol>
        </li>
        <li><strong>Output:</strong> Confirmation of the return</li>
      </ul>

      <h3><code>student-loans</code></h3>
      <p><strong>Purpose:</strong> Fetch a student's loan history.</p>
      <ul>
        <li><strong>Input:</strong> Student ID, optional filter (active only or all)</li>
        <li><strong>Process:</strong> Queries the <code>loans</code> table joined with <code>items</code> to get item names and details</li>
        <li><strong>Output:</strong> List of loan records with item information</li>
      </ul>

      <h3><code>create-staff</code></h3>
      <p><strong>Purpose:</strong> Create a new staff or admin login account.</p>
      <ul>
        <li><strong>Input:</strong> Email, password, full name, role (admin or staff)</li>
        <li><strong>Authentication:</strong> The caller must be a logged-in admin. Exception: "bootstrap mode" allows creating the first admin when none exist.</li>
        <li><strong>Process:</strong>
          <ol>
            <li>Creates an authentication account (email/password)</li>
            <li>Inserts a row in <code>user_roles</code> mapping the new user to their role</li>
          </ol>
        </li>
        <li><strong>Output:</strong> The new user's ID, email, and role</li>
      </ul>
    </>
  );
}
