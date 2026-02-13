
# Plan: Item Detail Popup, Required Email, and Email Reminders

## 1. Clickable Items in Inventory Tab

When staff clicks an item row in the Inventory tab, a dialog will open showing:
- All item details (name, asset tag, category, condition, location, description, default loan duration)
- Current status
- If checked out: who has it (student name, ID, email), checkout date, due date, reason, and teacher
- Loan history for that item

This involves updating `InventoryTab.tsx` to:
- Add a detail dialog with a selected item state
- Query active loans (with student info) when an item is clicked
- Query loan history for the item
- Display everything in a clean popup

## 2. Make Student Email Required

Currently email is optional during student self-registration. Changes:

- **StudentIdEntry.tsx**: Add validation requiring a non-empty, valid email before registration
- **Checkout.tsx**: No changes needed (registration happens via StudentIdEntry)
- The database column `students.email` is already nullable -- we enforce at the app level so existing students without emails aren't broken

## 3. Email Reminders Discussion

For automated overdue/due-soon email reminders, the approach would be:

- **Backend function**: Create an edge function `send-overdue-reminders` that queries loans where `due_date` is approaching or past, joins with students to get emails, and sends reminder emails
- **Scheduled execution**: Use a database cron job (`pg_cron` + `pg_net`) to call this function daily
- **Email delivery**: Use an SMTP service (e.g., Resend, SendGrid) -- requires an API key to be configured
- **Tracking**: Log sent reminders in the `email_logs` table to avoid duplicate sends

I'll implement the item detail popup and required email now. For email reminders, we'll need to decide on an email provider and configure the API key.

---

## Technical Details

### InventoryTab.tsx Changes
- Add `selectedItem` state and `detailOpen` dialog state
- On row click, set selectedItem and fetch active loan + history from `loans` table joined with `students`
- Render a `Dialog` showing item info and current borrower details (name, student ID, email, reason, teacher, dates)
- Show recent loan history below

### StudentIdEntry.tsx Changes
- Add email validation: require non-empty email matching a basic email pattern
- Show error toast if email is missing or invalid
- Keep email field visible with required indicator

### Files to Modify
- `src/pages/admin/InventoryTab.tsx` -- add item detail dialog with loan/student info
- `src/components/StudentIdEntry.tsx` -- make email required with validation
