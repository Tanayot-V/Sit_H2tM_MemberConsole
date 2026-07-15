# LIFF Member Registration

Static site (`index.html` + `style.css` + `app.js`) that runs inside a LINE LIFF app, collects Full Name / Phone / Email, attaches the user's LINE ID, and saves each submission as a new row in a Google Sheet.

On load, it looks up the LINE user in the Sheet: already a member → shows a read-only member details dashboard; not yet registered → shows the registration form.

From the dashboard, members can also tap **Subscription EA** to pick an Expert Advisor (from the `ExpertAdvisor` sheet) and enter a port number. Confirming appends a row to the `Subscription` sheet with a generated `SubscriptionID`, the chosen EA, port, start date (now), and end date (start + 1 month). A user can submit multiple subscriptions — no duplicate check.

Tapping **My Subscription** shows a table of the current LINE user's subscriptions (EA, port, start date, end date), read from the `Subscription` sheet filtered by LINE user ID, with a Back button to return to the dashboard.

### Email/password fallback (outside LIFF)

If `liff.init()` fails (e.g. the page is opened directly in a regular browser, not through the LIFF URL), the app falls back to an email/password login instead of a dead-end error:

- **Login** — enter email + password. Leaving password blank on a member who has never set one routes to **Set Password** instead of an error.
- **Set Password** — only reachable for an email that exists in `Members` but has no password yet (column G). On matching confirm, the password is SHA-256-hashed client-side (via `crypto.subtle`, so the plaintext password is never sent) and saved to column G, then the user is sent back to Login.
- **Login success** — matches the email's stored hash and shows the same dashboard as the LIFF path, using the LINE User ID already on that member's row (from their original LINE registration) for Subscription features.

Note: this is a plain SHA-256 hash with no salt — adequate to avoid storing plaintext, but weaker than a proper password KDF (bcrypt/scrypt/PBKDF2). Don't reuse this for anything beyond this low-stakes member dashboard.

## 1. Google Sheet + Apps Script

1. Create a new Google Sheet.
2. Add an `ExpertAdvisor` tab with columns A = EA code, B = EA name, C = description (header row + one row per EA). Column B is what's shown in the Subscription EA dropdown.
3. Extensions > Apps Script, paste in [google-apps-script/Code.gs](google-apps-script/Code.gs).
4. Deploy > New deployment > Web app > Execute as **Me**, Who has access **Anyone**.
5. Copy the `/exec` URL.

The `Members` and `Subscription` tabs are created automatically on first write if they don't exist.

## 2. Frontend config

Edit [config.js](config.js) and set:
- `LIFF_ID` — from the LINE Developers Console (see step 3).
- `GAS_WEB_APP_URL` — the `/exec` URL from step 1.

## 3. LINE Developers Console

1. Create a Messaging API (or LINE Login) channel.
2. Add a LIFF app: Endpoint URL = wherever you host `index.html` (must be HTTPS — GitHub Pages, Vercel, Netlify, Firebase Hosting all work).
3. Scopes: `profile` (needed for `liff.getProfile()`).
4. Copy the LIFF ID into `app.js`.

## 4. Host the frontend

Deploy `index.html`, `style.css`, `app.js` to any static HTTPS host, then open the site through the LIFF URL (`https://liff.line.me/<LIFF_ID>`) from inside LINE to test.

## Notes

- Duplicate LINE users (same `lineUserId`) are rejected server-side instead of creating a second row.
- The submit request uses `mode: "no-cors"`, so the frontend can't read the server's response — it's fire-and-forget by design (Apps Script redirects break normal CORS reads). Check the Sheet directly to confirm rows are being added, or check Apps Script's execution log for errors.
- The registration lookup (`doGet` with a `lineUserId` param) uses JSONP instead of `fetch`, for the same CORS reason. If the lookup fails (e.g. offline), the frontend fails open and shows the registration form; the server-side duplicate check still prevents a second row.
