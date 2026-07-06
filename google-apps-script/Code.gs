/**
 * ============================================================
 * Google Apps Script backend for the LIFF Member Registration form.
 *
 * SETUP:
 * 1. Create (or open) a Google Sheet that will store members.
 * 2. In the Sheet, go to Extensions > Apps Script.
 * 3. Delete any starter code and paste this whole file in.
 * 4. Change SHEET_NAME below if you want a different tab name.
 * 5. Click Deploy > New deployment.
 *      - Select type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 6. Copy the Web app URL (ends with /exec) into app.js -> GAS_WEB_APP_URL.
 * 7. Re-run "Deploy > Manage deployments" and pick "New version" any
 *    time you edit this script, otherwise your changes won't go live.
 * ============================================================
 */

const SHEET_NAME = "Members";

const HEADERS = [
  "Timestamp",
  "LINE User ID",
  "LINE Display Name",
  "Full Name",
  "Phone Number",
  "Email",
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const sheet = getOrCreateSheet_();

    // Prevent duplicate registration for the same LINE user ID.
    if (data.lineUserId && findRowByUserId_(sheet, data.lineUserId) > -1) {
      return jsonResponse_({ status: "duplicate", message: "This LINE user is already registered." });
    }

    sheet.appendRow([
      new Date(),
      data.lineUserId || "",
      data.lineDisplayName || "",
      data.fullname || "",
      data.phone || "",
      data.email || "",
    ]);

    // Sheets auto-detects numeric-looking strings and strips a leading 0
    // (e.g. "0812345678" -> 812345678) unless the cell is forced to text.
    const phoneCell = sheet.getRange(sheet.getLastRow(), 5);
    phoneCell.setNumberFormat("@").setValue(data.phone || "");

    return jsonResponse_({ status: "ok" });
  } catch (err) {
    return jsonResponse_({ status: "error", message: err.message });
  }
}

function doGet(e) {
  const lineUserId = e.parameter.lineUserId;

  if (lineUserId) {
    const sheet = getOrCreateSheet_();
    const row = findRowByUserId_(sheet, lineUserId);
    const result = row === -1
      ? { status: "ok", registered: false }
      : { status: "ok", registered: true, member: rowToMember_(sheet, row) };
    return jsonpResponse_(result, e.parameter.callback);
  }

  return jsonResponse_({ status: "ok", message: "LIFF registration endpoint is running." });
}

function rowToMember_(sheet, row) {
  const values = sheet.getRange(row, 1, 1, HEADERS.length).getValues()[0];
  const [timestamp, , , fullname, phone, email] = values;
  return {
    fullname,
    phone,
    email,
    registeredAt: timestamp instanceof Date ? timestamp.toISOString() : timestamp,
  };
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }

  return sheet;
}

function findRowByUserId_(sheet, lineUserId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const ids = sheet.getRange(2, 2, lastRow - 1, 1).getValues(); // column B = LINE User ID
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === lineUserId) {
      return i + 2; // actual sheet row number
    }
  }
  return -1;
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Apps Script web apps don't send CORS headers, so a plain fetch() can't read
// a GET response cross-origin. JSONP (a <script> tag hitting this URL with a
// ?callback= param) sidesteps that entirely, so the lookup uses it instead.
function jsonpResponse_(obj, callback) {
  if (!callback) return jsonResponse_(obj);

  return ContentService
    .createTextOutput(callback + "(" + JSON.stringify(obj) + ")")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
