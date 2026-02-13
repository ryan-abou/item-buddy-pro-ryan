

## Fix Plan: Staff Login Cleanup, Physical Keyboard Support, and Checkout Dialog Keyboard

### Issue 1: Clear Staff Login fields when leaving the page
When navigating away from the Staff Login page, the email and password fields retain their values. Fix: reset state when the component unmounts or when the user clicks "Back."

**File: `src/pages/StaffLogin.tsx`**
- Clear `email` and `password` state in the "Back" button handler (already calls `detachInput()` and `navigate("/")`, just add `setEmail("")` and `setPassword("")` before navigating)
- Add a `useEffect` cleanup that resets fields on unmount

### Issue 2: Allow physical keyboard input alongside virtual keyboard
Currently, all inputs have `readOnly` and `inputMode="none"`, which completely blocks the built-in computer keyboard. Fix: remove `readOnly` from all input fields across the app so physical keyboard typing works normally alongside the virtual keyboard.

**Files to update:**
- `src/pages/StaffLogin.tsx` -- remove `inputMode="none"` from email and password inputs
- `src/pages/Checkout.tsx` -- remove `readOnly` and `inputMode="none"` from duration, reason, teacher, and search inputs
- `src/components/StudentIdEntry.tsx` -- remove `readOnly` and `inputMode="none"` from student ID, first name, and last name inputs

**Context sync fix in `src/contexts/KioskKeyboardContext.tsx`:**
- Since physical typing now updates the React state directly via `onChange`, the keyboard context's `valueRef` can get out of sync. Update `attachInput` to always re-sync `valueRef` when called, and update `handleKeyPress`/`handleBackspace` to read from the input element's actual value rather than relying solely on `valueRef`.

### Issue 3: Virtual keyboard not working in the checkout confirmation dialog
The Radix Dialog component uses a focus trap -- when the user taps a virtual keyboard button (which lives outside the dialog portal), the dialog's focus management interferes and steals focus back, preventing the keyboard from functioning.

**File: `src/pages/Checkout.tsx`**
- Add `onOpenAutoFocus={(e) => e.preventDefault()}` to `DialogContent` to prevent auto-focus stealing
- Add `onInteractOutside={(e) => e.preventDefault()}` to `DialogContent` to prevent the dialog from closing when clicking the virtual keyboard (which is outside the dialog)

**File: `src/contexts/KioskKeyboardContext.tsx`**
- Add `onPointerDown` with `e.preventDefault()` on the VirtualKeyboard wrapper to prevent it from stealing focus from the active input field
- This ensures the keyboard buttons fire their click handlers without triggering the dialog's "outside click" detection

**File: `src/components/VirtualKeyboard.tsx`**
- Accept an optional `onPointerDown` prop and apply it to the root container div
- This prevents focus shift when tapping keyboard keys

### Technical Summary

| File | Changes |
|------|---------|
| `src/pages/StaffLogin.tsx` | Clear email/password on unmount and on Back; remove `inputMode="none"` |
| `src/pages/Checkout.tsx` | Remove `readOnly`/`inputMode="none"` from dialog inputs; add dialog focus trap overrides |
| `src/components/StudentIdEntry.tsx` | Remove `readOnly`/`inputMode="none"` from all inputs |
| `src/contexts/KioskKeyboardContext.tsx` | Add `onPointerDown` preventDefault to keyboard wrapper; sync `valueRef` with actual input value |
| `src/components/VirtualKeyboard.tsx` | Accept and apply `onPointerDown` prop to root div |

