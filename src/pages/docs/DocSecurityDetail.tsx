export default function DocSecurityDetail() {
  return (
    <>
      <h2>Security — How It Works in the Code</h2>

      <h3>The Service Key Pattern</h3>
      <p>
        There are two types of database access keys in the system:
      </p>
      <ul>
        <li><strong>Anon (public) key:</strong> Used by the browser. This key can only access data that Row-Level Security policies explicitly allow. Students use this key indirectly — but since RLS blocks direct student access to most tables, they go through backend functions instead.</li>
        <li><strong>Service role key:</strong> Used <em>only</em> by backend functions running on the server. This key bypasses all RLS policies and has full database access. It is <strong>never exposed to the browser</strong>.</li>
      </ul>
      <p>
        This means even if someone inspects the browser's network traffic, they cannot find a key that gives them unrestricted database access.
      </p>

      <h3>Row-Level Security (RLS)</h3>
      <p>
        Every table in the database has RLS enabled. This is a database-level security feature (not just application code) that enforces rules like:
      </p>
      <ul>
        <li>Only authenticated staff/admin users can read the <code>items</code>, <code>students</code>, and <code>loans</code> tables directly</li>
        <li>Only admins can insert or modify <code>settings</code></li>
        <li>The <code>user_roles</code> table can only be read/written by admins</li>
        <li>Audit logs can only be inserted (never modified or deleted)</li>
      </ul>
      <p>
        Even if someone bypasses the UI entirely and sends raw database queries, RLS ensures they can only access what their role permits.
      </p>

      <h3>Rate Limiting</h3>
      <p>
        The <code>student-checkout</code> function includes rate limiting: each student can only attempt <strong>5 checkouts per hour</strong>.
        This is tracked by counting recent audit log entries for that student. If exceeded, the function returns an error and refuses to process the checkout.
        This prevents misuse such as a student rapidly checking out and returning items.
      </p>

      <h3>Input Validation</h3>
      <p>Every backend function validates its inputs before processing:</p>
      <ul>
        <li><strong>Student IDs:</strong> Must be exactly 6–12 digits (no letters, no special characters)</li>
        <li><strong>UUIDs:</strong> Database record IDs are validated against the UUID format</li>
        <li><strong>Names:</strong> Must be 1–100 characters, letters/spaces/hyphens/apostrophes only</li>
        <li><strong>Numbers:</strong> Loan duration must be a positive integer, max 365 days</li>
        <li><strong>Strings:</strong> Reason and teacher fields have maximum lengths to prevent abuse</li>
      </ul>
      <p>
        If any validation fails, the function returns a clear error message and does <strong>not</strong> touch the database.
      </p>

      <h3>Session Auto-Clear</h3>
      <p>
        After <strong>60 seconds of inactivity</strong>, the student context automatically clears. This is handled by a timer in the <code>StudentContext</code>
        that resets on every user interaction (tap, key press). When it fires, the app navigates back to the home screen and forgets the student's identity.
        This prevents "session hijacking" where the next person at the kiosk could access the previous student's account.
      </p>
    </>
  );
}
