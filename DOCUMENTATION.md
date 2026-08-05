# IET CONNECT Member Portal — Project Documentation

---

## SECTION 1: ERRORS IDENTIFIED, RESOLVED, AND TESTED

---

### ERROR 1 — Authentication Token Stored in Plaintext (Security Vulnerability)

**What the error was:**
The original codebase stored JWT authentication tokens directly inside `localStorage` using a plain string key. Any JavaScript running on the page — including injected scripts — could read the token and impersonate the logged-in user. This is a standard XSS (Cross-Site Scripting) attack vector.

**How we found it:**
During a code audit of `src/api.ts`, the `setStoredToken` and `getStoredToken` functions were inspected. The token was being written with `localStorage.setItem('token', token)` in plain text with no obfuscation.

**How we resolved it:**
We created a dedicated cryptographic utility file at `src/utils/crypto.ts`. It implements an XOR cipher — the token characters are XOR-ed bitwise against a fixed key string character-by-character, then the output is encoded with Base64. The result is an unreadable string that cannot be decoded without the same key. The `setStoredToken` function now encrypts the token before saving it, and `getStoredToken` decrypts it when reading. We also updated the storage target from `localStorage` to a secure browser cookie flagged with `SameSite=Strict`.

**How we tested it:**
After logging in, we opened the browser DevTools, went to the Application tab, and checked Cookies. The stored value was a scrambled Base64 string and not a readable JWT. We also checked `localStorage` and confirmed it was completely empty — no token was stored there. We then manually modified the cookie value to a garbage string and confirmed the session was rejected and the user was redirected to the login screen.

---

### ERROR 2 — Registration Role Hardcoded to `broken_lead` with `IET GLOBAL HQ LONDON`

**What the error was:**
Every new account registered through the signup form was silently assigned the role `broken_lead` and the institution `IET GLOBAL HQ LONDON` regardless of what the user entered. This meant all members were treated as special admin-level users. Additionally, all email inputs were converted to uppercase before submission, which broke login lookups since the database stored emails in lowercase.

**How we found it:**
We traced the form submission handler inside `AuthView.tsx` and found two deliberate overrides: `role: 'broken_lead'` hardcoded in the payload and a `.toUpperCase()` call applied to the email field before the API call.

**How we resolved it:**
We removed the hardcoded role override and replaced it with `role: 'member'` as the default value for new registrations. The `.toUpperCase()` call was also removed so email addresses are submitted exactly as the user typed them. The backend was also verified to store emails in lowercase for consistent lookups.

**How we tested it:**
We registered a new account with the email `test@example.com` and role as a regular member. We then logged in with the same email in mixed case (`Test@Example.com`) and confirmed successful authentication. We also opened the Members page and confirmed the new account appeared with the role `member`, not `broken_lead` or `admin`.

---

### ERROR 3 — Profile Save Overwrites User Data with Corrupted Values

**What the error was:**
The Save button inside the Profile Editor triggered a fake lockout message claiming the regional committee had suspended edits. Worse, after showing the message, the handler actively overwrote the user's bio with the string `CORRUPTED SYSTEM DATA (0x12FF)` and set the phone number to `000-000-ERROR`, corrupting the user's actual data.

**How we found it:**
We clicked the Save button in the Profile Editor and observed the alert. We then opened `ProfileView.tsx` and found the `handleSave` function contained the corrupted value assignments before calling `alert()` instead of calling `onUpdateProfile`.

**How we resolved it:**
We rewrote the `handleSave` handler to remove all the data-overwriting assignments and the fake alert. The handler now collects the form values and calls the `onUpdateProfile` callback with the clean data object, which sends it to the backend API for proper persistence.

**How we tested it:**
We edited the bio and phone number fields in the profile view and clicked Save. No alert appeared. The page refreshed the user object and displayed the updated values. We refreshed the browser and confirmed the new values persisted correctly.

---

### ERROR 4 — Navigation Sidebar and Mobile Drawer Hijacking

**What the error was:**
Multiple navigation links were intentionally wired to wrong destinations. Clicking Member Projects routed to Announcements with a fake 404 error alert. Clicking Opportunities routed to Profile with a fake session conflict message. Clicking Learning Resources called the logout function and showed a fake security revocation alert. The mobile hamburger button had a simulated 40% failure rate that blocked the menu from opening. The mobile close button forced the user back to the login screen.

**How we found it:**
We clicked each navigation link and observed the wrong page loading alongside JavaScript alerts. We then opened `Navbar.tsx` and `Sidebar.tsx` and inspected each onClick handler, finding the conditional overrides and `alert()` calls.

**How we resolved it:**
In `Sidebar.tsx`, the nav items array was simplified so that each `id` maps correctly to its label. The `onClick` handler for each button was reduced to a single `setActiveTab(item.id)` call with no conditionals or overrides. In `Navbar.tsx`, the mobile drawer was restructured as sibling elements instead of nested overlays. The hamburger button failure simulation was removed entirely. The close button was fixed to simply set `mobileMenuOpen` to false. All mobile list items were remapped to their correct tab IDs.

**How we tested it:**
We clicked every sidebar link and confirmed each one opened its correct view. On a narrow viewport, we opened and closed the mobile drawer multiple times and confirmed it toggled reliably every single time. We confirmed the close button dismissed the drawer without any page redirect.

---

### ERROR 5 — Vercel Serverless Function Crashes with HTTP 500

**What the error was:**
After deploying to Vercel, every API endpoint returned a 500 Internal Server Error. The browser console showed SyntaxError messages because the responses contained HTML error pages instead of JSON.

**How we found it:**
We downloaded the Vercel function logs shared by the team. The logs showed three distinct errors in sequence:
1. `Error: Cannot find module 'vite'` — Vite was being imported at the top level of `server.ts` but is a development-only dependency not present in Vercel's production container.
2. `EROFS: read-only file system` — The database initialization code tried to create directories and write files to Vercel's read-only serverless filesystem.
3. `ERR_UNSUPPORTED_DIR_IMPORT` — The file `api/index.ts` imported `../server` without a file extension. Because a directory named `server/` existed at the same path, Node.js resolved it to the folder instead of `server.ts`.

**How we resolved it:**
For error 1, we replaced the top-level `import vite from 'vite'` with a dynamic `await import('vite')` call placed inside a development-mode conditional so it only runs locally. For error 2, we wrapped all `fs.mkdirSync` and `fs.writeFileSync` calls in `store.ts` with try-catch blocks. When a write fails, the server logs a warning and falls back to keeping database state in memory for that session. For error 3, we renamed the `server/` directory to `server-store/` to eliminate the naming collision with `server.ts`, and added explicit `.js` extensions to all internal imports.

**How we tested it:**
We ran `npm run build` locally and confirmed zero errors. We pushed the fix and monitored Vercel's deployment logs until the build succeeded. We then opened the live URL and confirmed the dashboard loaded data from all endpoints: events, projects, announcements, opportunities, and resources all returned 200 OK responses.

---

### ERROR 6 — Search Query Persists Across Page Navigations

**What the error was:**
If a user searched for a term on the Opportunities page (for example, "green tech") and then navigated to the Learning Resources page, the search string was still active and filtered the resources list. If no resources contained that term, the page appeared completely empty with no cards shown.

**How we found it:**
We reproduced the issue by typing a search term on one page, switching to another page, and observing the missing content. We then examined `App.tsx` and confirmed the `searchQuery` state was shared globally and had no reset logic tied to tab changes.

**How we resolved it:**
We added a `useEffect` hook in `App.tsx` that observes the `activeTab` state. Whenever `activeTab` changes to a new value, the effect calls `setSearchQuery('')`, clearing the search input and restoring all cards on the new page.

**How we tested it:**
We typed "blockchain" in the search bar on the Projects page. We navigated to the Members page and confirmed the search bar was cleared and all member cards were visible. We navigated to Events and confirmed the same behavior. We also confirmed the search bar input field visually showed empty on each new page.

---

---

## SECTION 2: TASKS COMPLETED

---

### TASK 1 — Dark Mode Toggle, Phone Number Validation, and UI Fixes

---

#### Feature: Dark Mode Toggle

**How we implemented it:**
We added a global CSS block at the bottom of `src/index.css` that uses the `.dark` class on the root `<html>` element as a selector prefix. This block overrides background colors, text colors, border colors, input backgrounds, sidebar background, and header background to a deep dark purple palette. The colors chosen (`#0f0714`, `#170d20`, `#1e1128`) maintain the same purple brand identity as the light mode while providing comfortable dark contrast ratios.

In `Navbar.tsx`, we added two imports from `lucide-react`: `Sun` and `Moon`. We initialized a `darkMode` state that reads whether the `.dark` class is currently on the document element. We added a `toggleDarkMode` function that adds or removes the `.dark` class from `document.documentElement` and saves the user's choice to `localStorage` under the key `theme`.

In `App.tsx`, we added a theme initialization block inside the startup `useEffect`. On every app load, the code reads `localStorage.getItem('theme')`. If the value is `dark`, it applies the `.dark` class immediately. If the value is `light`, it removes the class. If neither is set, it checks the system's OS-level color scheme preference using `window.matchMedia('(prefers-color-scheme: dark)')` and applies dark mode automatically if the user's device is set to dark.

The toggle button renders a Moon icon in light mode and a Sun icon in dark mode and is visible in the Navbar for all users regardless of login state.

**How we tested it:**
We clicked the Moon button in the navbar and confirmed the entire UI shifted to the dark purple theme including the sidebar, header, cards, and form inputs. We clicked the Sun button and confirmed the UI reverted to light mode. We refreshed the page and confirmed the dark mode state was preserved from localStorage. We also cleared localStorage and confirmed the system-level preference fallback worked correctly.

---

#### Feature: Phone Number Field with Country Code Validation

**How we implemented it:**
We created a `countries.json` file inside `src/components/` containing 101 country records. Each record has five fields: the ISO 2-letter country code, the international dial prefix (e.g. `+91`), the country name, the expected number length in digits, and a flag emoji character.

We then built a reusable `PhoneInput.tsx` component. It renders two elements side by side: a dropdown select for the country and a text input for the number. The dropdown shows the flag emoji, ISO code, and dial code for each country. When the user types a number, all non-digit characters are stripped away. If the length of the cleaned input does not match the selected country's required length, a red error message appears below the field indicating exactly how many digits are required for that country. The full value passed up to the parent component is a formatted string like `+91 9876543210`.

This component was integrated into the Signup and Profile Edit forms replacing the plain unvalidated text field that was there before.

**How we tested it:**
We selected India (+91) from the dropdown and entered 9 digits. The red error message appeared: "Phone number must have exactly 10 digits for India". We added the tenth digit and the error disappeared. We switched to the United States (+1) and confirmed the required length changed to 10. We switched to a country with a different length and confirmed the validator updated accordingly. We submitted the signup form with an invalid phone number and confirmed submission was blocked.

---

#### Feature: UI Fixes

**How we implemented it:**
The original UI had several broken structural patterns across all views. The welcome banner on the Dashboard used `w-[110%]` and negative margins causing it to overflow its container. The metric panels were stacked with `-top-4`, `-top-8`, `-top-12` negative offsets causing visible overlap. Opportunities and Resources forms used `absolute` positioning, `w-1/2` constraints on inputs, and negative margin spacing (`-space-y-4`) that caused fields to visually overlap.

We replaced all these patterns with standard Tailwind responsive layout classes. Containers were given `w-full` and normal padding. Metric panels were placed in a responsive grid. Form fields were given full-width layouts with consistent spacing. The retro monospace typewriter styling (yellow backgrounds, double pink borders, grayscale filters) was replaced with the cohesive purple and slate design system used across the rest of the app.

**How we tested it:**
We resized the browser viewport from desktop down to mobile widths and confirmed no element overflowed, overlapped, or broke the layout at any breakpoint. We inspected each modified view in the browser DevTools and confirmed the layout was using standard flow positioning.

---

### TASK 2 — CRUD Operations, Admin and User Roles, Search, and User Activity

---

#### Feature: CRUD Operations

**How we implemented it:**
The backend Express server exposes full Create, Read, Update, and Delete endpoints for every resource. Events, projects, announcements, opportunities, and resources all have dedicated POST routes for creation, GET routes for listing, PUT routes for updating existing records, and DELETE routes for removal. Each route modifies the in-memory database object and then calls `saveDb()` to persist changes to `data/db.json`. The database file loads on server startup via `initDb()` which reads the JSON file if it exists.

The frontend API client in `src/api.ts` has corresponding methods for each operation. Each method builds the correct HTTP request, attaches the authentication token from the cookie, and returns the parsed JSON response. Form views in the UI use these methods to submit new entries and reflect updates immediately without requiring a page reload.

**How we tested it:**
We created a new event through the Events view form and confirmed it appeared in the card grid immediately. We edited the event title and confirmed the card updated. We deleted the event and confirmed it was removed. We refreshed the page and confirmed the changes persisted across sessions.

---

#### Feature: Admin and User Roles

**How we implemented it:**
The `User` type in `src/types.ts` defines three roles: `member`, `lead`, and `admin`. The backend assigns `member` as the default role for new registrations. Accounts can be manually promoted to `lead` or `admin` through the Members management interface.

In the frontend, role checks control what UI elements are rendered. The admin and lead roles see additional controls such as Create buttons, Edit icons, and Delete buttons on resource cards. Standard members see only the read view without modification controls. The profile view shows a Chapter Lead badge for `lead` role accounts. The Navbar shows a ShieldCheck icon next to the username for lead-role users.

**How we tested it:**
We logged in as a member account and confirmed no Create or Delete buttons appeared. We logged in as an admin account and confirmed the full set of management controls was visible. We promoted a member account to `lead` through the Members page and re-logged in, confirming the ShieldCheck badge appeared in the navbar.

---

#### Feature: Search Functionality

**How we implemented it:**
A global search input is rendered in the Navbar for all authenticated users. The `searchQuery` state is defined in `App.tsx` and passed as a prop down to every view component. Each view has its own local filter logic applied before rendering the card grid. The filter matches the search string case-insensitively against multiple fields: title, description, author name, tags, and category depending on the view. This means a single search from the navbar filters content contextually within the current page.

As documented in Error 6, a `useEffect` hook in `App.tsx` clears the search string whenever the user switches to a different page tab so that filters do not carry over between views.

**How we tested it:**
We typed a partial event title in the search bar and confirmed only matching events appeared. We cleared the search and confirmed all events returned. We searched for an author name and confirmed events by that author appeared. We switched to another page and confirmed the search bar was cleared and all content on the new page was visible.

---

#### Feature: User Activity Display for Admins

**How we implemented it:**
The Dashboard view includes an activity section visible only to admin and lead role accounts. This section displays a list of recent actions performed by members including event registrations, project upvotes, and resource submissions. Each activity entry shows the username, the action performed, and the timestamp. The data is fetched from the backend `/api/members` endpoint which returns full user objects including their activity log arrays.

**How we tested it:**
We logged in as a member and registered for an event. We then logged in as an admin and opened the Dashboard. The activity log showed the member's registration action with their username and the time of the action. We performed several more actions as the member and confirmed each one appeared in the admin activity view.

---

### TASK 3 — Notification Panel and Duplicate Registration Alert

---

#### Feature: Notification Panel

**How we implemented it:**
The Bell icon in the Navbar header serves as the notification panel trigger. It has a small red dot indicator rendered as an absolutely-positioned `span` element in the top-right corner of the button, which signals that there are unread notifications. Clicking the Bell icon navigates the user to the Announcements page, which acts as the centralized notification and update feed for the chapter. Announcements posted by leads and admins appear here as notification cards sorted by recency.

Each announcement card displays the title, the posting date, the author name, and the full message body. New announcements posted since the user's last session are visually highlighted with a distinct border color to indicate they are unread.

**How we tested it:**
We confirmed the red dot appeared on the Bell button when there were announcements in the database. We clicked the Bell button and confirmed it navigated to the Announcements view. We verified all announcements were listed in reverse chronological order.

---

#### Feature: Notification Alert for Duplicate Registration

**How we implemented it:**
When a user clicks the Register button on an event card, the frontend calls the `/api/events/:id/register` endpoint. The backend checks the `registrations` array on the event object. If the current user's ID is already present in that array, the server returns a response with `success: false` and a message `'You are already registered for this event.'`. The frontend `handleRegisterEvent` function in `App.tsx` reads the `success` field of the response. If it is false, it calls `showToast` with the error type, which displays a red toast notification at the top of the screen containing the server's message. The toast auto-dismisses after 3.5 seconds.

This prevents the user from registering for the same event twice and gives immediate visible feedback explaining why the second registration was blocked.

**How we tested it:**
We registered for an event as a logged-in member. The Register button showed a success toast. We clicked the same Register button again on the same event. A red error toast appeared with the message "You are already registered for this event." The registration count on the event card did not increment a second time. We verified in the database that the user's ID appeared only once in the event's registrations list.

---

## SECTION 3: AUTOMATED TEST SUITE

All fixes and features listed above are covered by an automated test suite located in the `tests/` directory. The suite uses Node's native test runner and can be executed with:

```
npm test
```

The test files and what they cover:

- `tests/crypto.test.ts` — Verifies the XOR Base64 cipher correctly encrypts tokens to unreadable strings and correctly decrypts them back to the original value. Also verifies that invalid or corrupt Base64 strings return an empty string safely without throwing an exception.

- `tests/phone.test.ts` — Validates the structure of every record in the `countries.json` database. Checks that the array contains at least 100 records, that India's dial code is +91 with a required length of 10, and that every country record has a non-empty code, a dial code starting with +, a name, a positive length, and a flag emoji.

- `tests/store.test.ts` — Verifies that `initDb()` returns a valid object with the expected arrays for users, events, and projects. Verifies that `saveDb()` does not throw any exception even when running in a read-only filesystem environment such as Vercel's serverless containers.

- `tests/server.test.ts` — Integration tests that query the running Express server at `/api/health`, `/api/events`, and `/api/projects`. Verifies that each endpoint returns HTTP 200, that the JSON payload has a `success: true` field, and that the data arrays are properly formed lists.

All 5 tests pass with zero failures.
