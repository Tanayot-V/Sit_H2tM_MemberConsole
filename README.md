# LIFF Member Registration

Static site (`index.html` + `style.css` + `app.js`) that runs inside a LINE LIFF app, collects Full Name / Phone / Email, attaches the user's LINE ID, and saves each submission as a new row in a Google Sheet.

On load, it looks up the LINE user in the Sheet: already a member → shows a read-only member details dashboard; not yet registered → shows the registration form.

From the dashboard, members can also tap **Subscription EA** to pick an Expert Advisor (from the `ExpertAdvisor` sheet) and enter a port number. Confirming appends a row to the `Subscription` sheet with a generated `SubscriptionID`, the chosen EA, port, start date (now), and end date (start + 1 month). A user can submit multiple subscriptions — no duplicate check.

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

([config.example.js](config.example.js) is just a template for reference.)

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
