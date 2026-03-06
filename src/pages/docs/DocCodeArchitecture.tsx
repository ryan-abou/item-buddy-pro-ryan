export default function DocCodeArchitecture() {
  return (
    <>
      <h2>Code Architecture Overview</h2>
      <p>
        The codebase is organized into clear folders, each with a specific responsibility. Here's what lives where and why:
      </p>

      <h3>Folder Structure</h3>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Folder</th>
              <th>What It Contains</th>
              <th>Plain-English Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>src/pages/</code></td>
              <td>Full-screen views (Index, Checkout, Return, StaffLogin, admin/)</td>
              <td>Each file here is a "screen" the user sees. The URL determines which page loads.</td>
            </tr>
            <tr>
              <td><code>src/components/</code></td>
              <td>Reusable UI pieces (VirtualKeyboard, StudentIdEntry, NavLink)</td>
              <td>Building blocks used across multiple pages. E.g., the virtual keyboard appears on checkout, return, and login screens.</td>
            </tr>
            <tr>
              <td><code>src/contexts/</code></td>
              <td>Shared state managers (StudentContext, AuthContext, KioskKeyboardContext)</td>
              <td>These hold data that multiple pages need — like "which student is currently identified" or "is a staff member logged in?"</td>
            </tr>
            <tr>
              <td><code>src/lib/</code></td>
              <td>Helper functions (supabase-helpers.ts, utils.ts)</td>
              <td>Code that talks to the backend database. Pages call these helpers instead of making raw network requests.</td>
            </tr>
            <tr>
              <td><code>src/hooks/</code></td>
              <td>Custom React hooks (use-kiosk-input, use-mobile, use-toast)</td>
              <td>Reusable logic for detecting mobile devices, managing keyboard input on kiosks, and showing notification popups.</td>
            </tr>
            <tr>
              <td><code>supabase/functions/</code></td>
              <td>Backend serverless functions</td>
              <td>Code that runs <strong>on the server</strong>, not in the browser. Handles sensitive operations like database writes with full privileges.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>How Data Flows Through the App</h3>
      <ol>
        <li><strong>User interacts</strong> with a page (e.g., enters Student ID on the Checkout screen)</li>
        <li><strong>Page calls a helper function</strong> in <code>src/lib/</code> (e.g., "look up this student")</li>
        <li><strong>Helper sends a request</strong> to a backend function in <code>supabase/functions/</code></li>
        <li><strong>Backend function validates the input</strong>, queries the database using a privileged key, and returns results</li>
        <li><strong>Page updates</strong> to show the result (e.g., displays the student's name or an error message)</li>
      </ol>
      <p>
        This architecture ensures that <strong>the browser never directly accesses the database</strong>. All data passes through server-side functions that enforce security rules.
      </p>
    </>
  );
}
