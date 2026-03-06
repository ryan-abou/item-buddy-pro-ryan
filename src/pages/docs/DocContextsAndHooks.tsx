export default function DocContextsAndHooks() {
  return (
    <>
      <h2>Shared State: Contexts and Hooks</h2>
      <p>
        React "contexts" are a way to share data across the entire app without passing it page-by-page. The app uses three:
      </p>

      <h3><code>StudentContext</code></h3>
      <p>Manages the currently identified student at the kiosk:</p>
      <ul>
        <li>Stores the student's database record (name, ID, max items) after they identify themselves</li>
        <li>Provides functions to set or clear the student</li>
        <li>Runs the <strong>60-second inactivity timer</strong> — clears the student and returns to the home screen if no interaction occurs</li>
        <li>Used by: Checkout page, Return page, Home page (to show "Welcome back" message)</li>
      </ul>

      <h3><code>AuthContext</code></h3>
      <p>Manages staff/admin authentication:</p>
      <ul>
        <li>Tracks whether a staff member is logged in and their role (admin vs. staff)</li>
        <li>Provides login/logout functions</li>
        <li>Protects admin routes — if you're not logged in, you get redirected to the login page</li>
        <li>Used by: Staff Login page, Admin Dashboard, all admin tabs</li>
      </ul>

      <h3><code>KioskKeyboardContext</code></h3>
      <p>Controls the virtual on-screen keyboard:</p>
      <ul>
        <li>Manages which input field is currently "focused" (receiving keyboard input)</li>
        <li>Handles switching between keyboard modes (numeric, alpha, full)</li>
        <li>Coordinates between the virtual keyboard component and whatever input field the student tapped</li>
        <li>Used by: Every page that has input fields (Checkout, Return, Staff Login)</li>
      </ul>

      <h3>Custom Hooks</h3>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Hook</th>
              <th>What It Does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>use-kiosk-input</code></td>
              <td>Connects a regular input field to the virtual keyboard system. When the input is tapped, it tells the keyboard context to send keystrokes to that field.</td>
            </tr>
            <tr>
              <td><code>use-mobile</code></td>
              <td>Detects if the app is running on a small screen (mobile/tablet). Some layout adjustments depend on this.</td>
            </tr>
            <tr>
              <td><code>use-toast</code></td>
              <td>Shows temporary notification messages (success, error) at the bottom of the screen. Used after checkouts, returns, and errors.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
