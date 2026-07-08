# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static LIFF (LINE Front-end Framework) site: `index.html` + `style.css` + `app.js`. It runs inside a LINE app, collects Full Name / Phone / Email, attaches the user's LINE ID, and appends each submission as a row in a Google Sheet via a Google Apps Script web app backend (`google-apps-script/Code.gs`).

No build step, no package manager, no framework — plain HTML/CSS/JS loaded directly by the browser.

## Running / testing locally

There is no dev server or test suite. To iterate:
- Open `index.html` directly, or serve the folder with any static file server.
- Full functionality (LIFF login, LINE profile, registration) only works when the page is opened through the LIFF URL (`https://liff.line.me/<LIFF_ID>`) from inside the LINE app, since `liff.init()` requires a real LINE session.
- To test the Apps Script backend independently, hit the deployed `/exec` URL directly (see `config.js` for `GAS_WEB_APP_URL`), or check the Sheet/Apps Script execution log — the frontend never reads the POST response (see CORS note below), so the Sheet is the source of truth for whether a submission worked.

## Deploying

- Frontend: any static HTTPS host (GitHub Pages, Vercel, Netlify, Firebase Hosting).
- Backend: paste `google-apps-script/Code.gs` into the Apps Script editor bound to the target Google Sheet, then Deploy > New deployment > Web app (Execute as **Me**, Access **Anyone**). Any edit to `Code.gs` requires **Deploy > Manage deployments > New version** to go live — saving alone does not update the running `/exec` endpoint.

## Architecture

**Two independent halves that only talk over HTTP:**

1. **Frontend (`app.js`)** — a single linear flow driven by LIFF state, no framework/router:
   - `initLiff()` calls `liff.init()`, forces login if needed, then fetches the LINE profile.
   - It looks up the user by `lineUserId` against the Sheet (JSONP GET — see below). Already registered → render the read-only dashboard (`showDashboard`). Not registered → reveal `registerForm`.
   - Form submit POSTs the payload and, on success, shows a "View My Dashboard" button backed by the just-submitted data held in memory (`lastRegisteredMember`) rather than re-querying the server.

2. **Backend (`google-apps-script/Code.gs`)** — `doGet`/`doPost` against a sheet tab named `Members` (auto-created with headers on first write). `findRowByUserId_` linear-scans column B to enforce one row per `lineUserId`, both for the duplicate-check on POST and the registration lookup on GET.

**Why the networking looks unusual — both directions route around CORS, not with `fetch`+JSON normally:**
- POST (`registerForm` submit) uses `fetch(..., { mode: "no-cors" })`. Apps Script redirects through a `googleusercontent.com` URL with no CORS headers, so the response can never be read by the browser regardless. This makes registration fire-and-forget by design; errors surface only via the Sheet or the Apps Script execution log, never in the UI.
- GET (registration lookup) uses hand-rolled JSONP (`jsonp()` in `app.js`, `jsonpResponse_()` in `Code.gs`) instead of `fetch`, for the same CORS reason — a `<script>` tag sidesteps it entirely.
- If the JSONP lookup fails (e.g. offline), the frontend **fails open** to the registration form; the server-side duplicate check in `doPost` still prevents a second row for the same `lineUserId`.

**Config:** `config.js` (gitignored is *not* the pattern here — it's actually committed) holds `LIFF_ID` and `GAS_WEB_APP_URL` as `window.APP_CONFIG`, loaded via `<script src="config.js">` before `app.js` in `index.html`. `config.example.js` is a template only, not consumed by the app. Since this is a client-side app, these values are visible to any visitor regardless, so committing real values is intentional (see comments in both files).

**Sheet layout:** columns are fixed by `HEADERS` in `Code.gs`: Timestamp, LINE User ID, LINE Display Name, Full Name, Phone Number, Email. Phone is force-written as text (`setNumberFormat("@")`) to stop Sheets from stripping a leading `0`.
