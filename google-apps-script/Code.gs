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
const EA_SHEET_NAME = "ExpertAdvisor";
const SUBSCRIPTION_SHEET_NAME = "Subscription";
const VPS_SHEET_NAME = "VPS";

const HEADERS = [
  "Timestamp",
  "LINE User ID",
  "LINE Display Name",
  "Full Name",
  "Phone Number",
  "Email",
  "Password", // column G: SHA-256 hash, only set once a member signs in via email/password
  "Member Tier", // column H: 0/blank = Bronze Farmer, 1 = Silver Farmer, -1 = Awaiting payment confirmation
  "Free Trials Status", // column I: 0/blank = free trial available, 1 = already used
];

const SUBSCRIPTION_HEADERS = [
  "LineId",
  "SubscriptionID",
  "EA_Subscription",
  "Port_Number",
  "StartDate",
  "EndDate",
  "LotMultiplier", // column G: e.g. "x1".."x10", added after StartDate/EndDate to avoid reshuffling existing rows
  "Price", // column H
  "DurationMonths", // column I: 1, 3, or 12
  "PayStatus", // column J: 0/blank = Awaiting Confirmation, 1 = Paid
  "ProofImageUrl", // column K: Drive link to the uploaded transfer receipt
  "IncludeVPS", // column L: 0/blank = no VPS (member runs the bot themselves), 1 = VPS included
  "TradingPassword", // column M: only set when IncludeVPS is 1 - needed to log into the trading account on the VPS
];

// Lot-multiplier tiers priced on the ExpertAdvisor sheet (columns G-M).
const LOT_MULTIPLIER_TIERS = ["x1", "x2", "x3", "x4", "x5", "x7", "x10"];

// Standalone "private VPS" product, tracked on the "VPS" sheet. Row 1 is
// reserved for admin-entered pricing (see getVpsPlanPrices_/getVpsMonthlyPrice_),
// so this table's header lives on row 2 and data starts at row 3.
const VPS_SUB_HEADERS = [
  "LineId",
  "SubscriptionID",
  "StartDate",
  "EndDate",
  "MonthAmount",
  "Status", // column F: -1 = wait for proof, 0 = Create Vps, 1 = Normal, 2 = Error, 3 = End Service
  "ProofImageUrl",
  "IP", // column H: set manually once the VPS is provisioned
  "Username", // column I
  "Password", // column J
  "Name", // column K: optional member-chosen label, editable via updateVpsName
];

// Drive folder (auto-created on first use) that payment proof photos are saved into.
const PROOF_FOLDER_NAME = "Payment Proofs";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.type === "subscription") {
      return handleSubscriptionPost_(data);
    }

    if (data.type === "vpsSubscription") {
      return handleVpsSubscriptionPost_(data);
    }

    if (data.type === "updateVpsName") {
      return handleUpdateVpsNamePost_(data);
    }

    if (data.type === "setPassword") {
      return handleSetPasswordPost_(data);
    }

    return handleRegistrationPost_(data);
  } catch (err) {
    return jsonResponse_({ status: "error", message: err.message });
  }
}

function handleRegistrationPost_(data) {
  const sheet = getOrCreateSheet_(SHEET_NAME, HEADERS);

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
}

function handleSubscriptionPost_(data) {
  const hasPrice = data.price !== undefined && data.price !== null && data.price !== "";
  if (!data.lineUserId || !data.ea || !data.port || !data.lotMultiplier || !hasPrice) {
    return jsonResponse_({ status: "error", message: "Missing lineUserId, ea, port, lotMultiplier, or price." });
  }

  const sheet = getOrCreateSheet_(SUBSCRIPTION_SHEET_NAME, SUBSCRIPTION_HEADERS);
  const subscriptionId = nextSubscriptionId_(sheet);
  const durationMonths = Number(data.durationMonths) || 1;

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);

  const proofUrl = saveProofImage_(data.proofImage, data.proofImageType, "subscription_"+ data.ea + "_" + data.port + "_" + data.lineUserId + "_" + startDate);

  sheet.appendRow([
    data.lineUserId,
    subscriptionId,
    data.ea,
    data.port,
    startDate,
    endDate,
    data.lotMultiplier,
    data.price,
    durationMonths,
    0, // PayStatus starts unpaid; flipped to 1 manually once transfer proof is confirmed
    proofUrl,
    data.includeVPS ? 1 : 0,
    data.includeVPS ? (data.tradingPassword || "") : "",
  ]);

  // Keep the port number as text so Sheets doesn't reformat it.
  const portCell = sheet.getRange(sheet.getLastRow(), 4);
  portCell.setNumberFormat("@").setValue(data.port);

  if (data.isFreeTrial) {
    const membersSheet = getOrCreateSheet_(SHEET_NAME, HEADERS);
    const memberRow = findRowByUserId_(membersSheet, data.lineUserId);
    if (memberRow > -1) {
      membersSheet.getRange(memberRow, 9).setValue(1); // column I = Free Trials Status
    }
  }

  return jsonResponse_({ status: "ok", subscriptionId: subscriptionId });
}

// Header row is row 1, so getLastRow() already equals "count of existing
// subscriptions + 1" - i.e. the next sequence number.
function nextSubscriptionId_(sheet) {
  const seq = sheet.getLastRow();
  const datePart = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd");
  return "SUB-" + datePart + "-" + ("0000" + seq).slice(-4);
}

function handleVpsSubscriptionPost_(data) {
  const hasPrice = data.price !== undefined && data.price !== null && data.price !== "";
  if (!data.lineUserId || !data.monthAmount || !hasPrice) {
    return jsonResponse_({ status: "error", message: "Missing lineUserId, monthAmount, or price." });
  }

  const sheet = getOrCreateVpsSheet_();
  const subscriptionId = nextVpsSubscriptionId_(sheet);
  const monthAmount = Number(data.monthAmount) || 1;

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + monthAmount);

  const proofUrl = saveProofImage_(data.proofImage, data.proofImageType, "vps_" + data.lineUserId + "_" + startDate);

  sheet.appendRow([
    data.lineUserId,
    subscriptionId,
    startDate,
    endDate,
    monthAmount,
    -1, // Status starts at "wait for proof" until an admin provisions the VPS
    proofUrl,
    "", // IP - filled in manually once the VPS is provisioned
    "", // Username
    "", // Password
    "", // Name
  ]);

  return jsonResponse_({ status: "ok", subscriptionId: subscriptionId });
}

// Row 1 of the VPS sheet is reserved for admin-entered pricing, so the
// subscription table's header lives on row 2 - getLastRow() - 1 is the count
// of existing subscriptions (and therefore the next sequence number).
function nextVpsSubscriptionId_(sheet) {
  const seq = sheet.getLastRow() - 1;
  const datePart = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd");
  return "VPS-" + datePart + "-" + ("0000" + seq).slice(-4);
}

// Lets a member set/change the display name (column K) on one of their own
// VPS subscriptions, looked up by subscriptionId.
function handleUpdateVpsNamePost_(data) {
  if (!data.subscriptionId) {
    return jsonResponse_({ status: "error", message: "Missing subscriptionId." });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(VPS_SHEET_NAME);
  if (!sheet) return jsonResponse_({ status: "error", message: "VPS sheet not found." });

  const row = findVpsRowBySubscriptionId_(sheet, data.subscriptionId);
  if (row === -1) return jsonResponse_({ status: "error", message: "Subscription not found." });

  sheet.getRange(row, 11).setValue(data.name || ""); // column K = Name

  return jsonResponse_({ status: "ok" });
}

// VPS sheet's subscription table starts at row 3 (row 1 = pricing, row 2 = header).
function getOrCreateVpsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(VPS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(VPS_SHEET_NAME);

  const headerRange = sheet.getRange(2, 1, 1, VPS_SUB_HEADERS.length);
  const isBlank = headerRange.getValues()[0].every(function (v) { return v === "" || v === null; });
  if (isBlank) {
    headerRange.setValues([VPS_SUB_HEADERS]).setFontWeight("bold");
  }

  return sheet;
}

function findVpsRowBySubscriptionId_(sheet, subscriptionId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return -1;

  const ids = sheet.getRange(3, 2, lastRow - 2, 1).getValues(); // column B = SubscriptionID
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(subscriptionId)) return i + 3;
  }
  return -1;
}

// Sets/replaces the password hash on the member row matching data.email.
// The client already hashed the password (SHA-256) before sending it here.
function handleSetPasswordPost_(data) {
  const sheet = getOrCreateSheet_(SHEET_NAME, HEADERS);
  const row = findRowByEmail_(sheet, data.email);

  if (row === -1) {
    return jsonResponse_({ status: "error", message: "Email not found." });
  }

  sheet.getRange(row, 7).setValue(data.passwordHash || "");

  return jsonResponse_({ status: "ok" });
}

// Decodes a base64 photo from the client and saves it into a shared Drive
// folder, returning a viewable link (or "" if no photo was sent, or the save
// failed - a bad/oversized image shouldn't block recording the payment itself).
function saveProofImage_(base64Data, mimeType, filenamePrefix) {
  if (!base64Data) return "";

  try {
    const folder = getOrCreateProofFolder_();
    const decoded = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decoded, mimeType || "image/jpeg", filenamePrefix + "_" + new Date().getTime() + ".jpg");
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    // Swallowed so a bad photo doesn't block the payment row itself, but
    // logged so it's visible in Apps Script > Executions when debugging why
    // ProofImageUrl came back blank.
    Logger.log("saveProofImage_ failed: " + err.message);
    return "";
  }
}

// Keeps the proof-photo folder next to the spreadsheet itself, rather than
// buried at the Drive root, so everything payment-related lives together.
function getOrCreateProofFolder_() {
  const parentFolder = getSpreadsheetParentFolder_();
  const folders = parentFolder.getFoldersByName(PROOF_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(PROOF_FOLDER_NAME);
}

function getSpreadsheetParentFolder_() {
  const file = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId());
  const parents = file.getParents();
  return parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
}

function doGet(e) {
  if (e.parameter.action === "listEA") {
    return jsonpResponse_({ status: "ok", eaList: getEAList_(), vpsPrice: getVpsMonthlyPrice_() }, e.parameter.callback);
  }

  if (e.parameter.action === "listSubscriptions") {
    const subscriptions = getSubscriptionsByUserId_(e.parameter.lineUserId || "");
    return jsonpResponse_({ status: "ok", subscriptions: subscriptions }, e.parameter.callback);
  }

  if (e.parameter.action === "getVpsPlans") {
    return jsonpResponse_({ status: "ok", plans: getVpsPlanPrices_() }, e.parameter.callback);
  }

  if (e.parameter.action === "listVpsSubscriptions") {
    const vpsSubscriptions = getVpsSubscriptionsByUserId_(e.parameter.lineUserId || "");
    return jsonpResponse_({ status: "ok", vpsSubscriptions: vpsSubscriptions }, e.parameter.callback);
  }

  if (e.parameter.action === "login") {
    return handleLoginGet_(e);
  }

  const lineUserId = e.parameter.lineUserId;

  if (lineUserId) {
    const sheet = getOrCreateSheet_(SHEET_NAME, HEADERS);
    const row = findRowByUserId_(sheet, lineUserId);
    const result = row === -1
      ? { status: "ok", registered: false }
      : { status: "ok", registered: true, member: rowToMember_(sheet, row) };
    return jsonpResponse_(result, e.parameter.callback);
  }

  return jsonResponse_({ status: "ok", message: "LIFF registration endpoint is running." });
}

// ExpertAdvisor sheet columns: A = EA code, B = EA name, C = Version, D = Detail,
// E = MaxDD, F = Profit/Month, G = Recommended Initial Cost,
// H-N = Price per lot multiplier (x1, x2, x3, x4, x5, x7, x10).
// The EA name (column B) is what's shown in the list and stored back as EA_Subscription.
function getEAList_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(EA_SHEET_NAME);
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, 14).getValues();
  return values
    .filter(function (r) { return r[1] !== "" && r[1] !== null; })
    .map(function (r) {
      const prices = {};
      LOT_MULTIPLIER_TIERS.forEach(function (key, i) {
        const price = r[7 + i];
        if (price !== "" && price !== null) prices[key] = price;
      });

      return {
        code: r[0],
        name: r[1],
        version: r[2],
        detail: r[3],
        maxDD: r[4],
        profitPerMonth: r[5],
        recommendedInitialCost: r[6],
        prices: prices,
      };
    });
}

// "VPS" sheet, cell C1: the monthly VPS price. 3-month/12-month prices are
// derived from it client-side with the same formula as EA subscriptions
// (see computeDurationPrice_ in app.js): 3mo = C1*3*0.95, 12mo = C1*10.
function getVpsMonthlyPrice_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(VPS_SHEET_NAME);
  if (!sheet) return 0;

  const value = sheet.getRange("C1").getValue();
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

// "VPS" sheet, cells E1/F1/G1: explicit 1/3/12-month prices for the
// standalone private VPS product - unlike getVpsMonthlyPrice_, these are set
// directly by the admin rather than derived with a discount formula.
function getVpsPlanPrices_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(VPS_SHEET_NAME);
  if (!sheet) return { price1: 0, price3: 0, price12: 0 };

  const values = sheet.getRange("E1:G1").getValues()[0];
  const toNum = function (v) { const n = Number(v); return isNaN(n) ? 0 : n; };

  return { price1: toNum(values[0]), price3: toNum(values[1]), price12: toNum(values[2]) };
}

// VPS sheet columns: A = LineId, B = SubscriptionID, C = StartDate, D = EndDate,
// E = MonthAmount, F = Status, G = ProofImageUrl, H = IP, I = Username,
// J = Password, K = Name. Data starts at row 3 (row 1 = pricing, row 2 = header).
function getVpsSubscriptionsByUserId_(lineUserId) {
  if (!lineUserId) return [];

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(VPS_SHEET_NAME);
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return [];

  const values = sheet.getRange(3, 1, lastRow - 2, VPS_SUB_HEADERS.length).getValues();

  return values
    .filter(function (row) { return row[0] === lineUserId; })
    .map(function (row) {
      const startDate = row[2];
      const endDate = row[3];
      return {
        subscriptionId: row[1],
        startDate: startDate instanceof Date ? startDate.toISOString() : startDate,
        endDate: endDate instanceof Date ? endDate.toISOString() : endDate,
        monthAmount: row[4],
        status: row[5],
        ip: row[7],
        username: row[8],
        password: row[9],
        name: row[10],
      };
    });
}

// Subscription sheet columns: A = LineId, B = SubscriptionID, C = EA_Subscription,
// D = Port_Number, E = StartDate, F = EndDate, G = LotMultiplier, H = Price,
// I = DurationMonths, J = PayStatus.
function getSubscriptionsByUserId_(lineUserId) {
  if (!lineUserId) return [];

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SUBSCRIPTION_SHEET_NAME);
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, SUBSCRIPTION_HEADERS.length).getValues();

  return values
    .filter(function (row) { return row[0] === lineUserId; })
    .map(function (row) {
      const startDate = row[4];
      const endDate = row[5];
      return {
        subscriptionId: row[1],
        ea: row[2],
        port: row[3],
        startDate: startDate instanceof Date ? startDate.toISOString() : startDate,
        endDate: endDate instanceof Date ? endDate.toISOString() : endDate,
        lotMultiplier: row[6],
        price: row[7],
        payStatus: String(row[9]) === "1" ? 1 : 0,
      };
    });
}

// Email/password sign-in (used when the page isn't opened through LIFF).
// passwordHash is empty when the client is only checking whether a password
// has been set yet (see hasPassword below), not attempting to log in.
function handleLoginGet_(e) {
  const email = e.parameter.email || "";
  const passwordHash = e.parameter.passwordHash || "";

  const sheet = getOrCreateSheet_(SHEET_NAME, HEADERS);
  const row = findRowByEmail_(sheet, email);

  if (row === -1) {
    return jsonpResponse_({ status: "ok", emailFound: false, hasPassword: false }, e.parameter.callback);
  }

  const storedHash = String(sheet.getRange(row, 7).getValue() || "");
  const hasPassword = storedHash !== "";
  const passwordMatch = hasPassword && passwordHash !== "" && storedHash === passwordHash;

  const result = { status: "ok", emailFound: true, hasPassword: hasPassword, passwordMatch: passwordMatch };

  if (passwordMatch) {
    result.member = rowToMember_(sheet, row);
  }

  return jsonpResponse_(result, e.parameter.callback);
}

function rowToMember_(sheet, row) {
  const values = sheet.getRange(row, 1, 1, HEADERS.length).getValues()[0];
  const [timestamp, lineUserId, , fullname, phone, email, , memberTier, freeTrialsStatus] = values;
  return {
    fullname,
    phone,
    email,
    lineUserId,
    registeredAt: timestamp instanceof Date ? timestamp.toISOString() : timestamp,
    tier: tierLabel_(memberTier),
    freeTrialsStatus: String(freeTrialsStatus) === "1" ? 1 : 0,
  };
}

// Column H: 0/blank = Bronze Farmer, 1 = Silver Farmer, -1 = Awaiting payment confirmation (legacy).
function tierLabel_(memberTier) {
  const value = String(memberTier);
  if (value === "1") return "Silver Farmer";
  if (value === "-1") return "Awaiting payment confirmation.";
  return "Bronze Farmer";
}

function getOrCreateSheet_(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  } else if (sheet.getLastColumn() < headers.length) {
    // Backfills header cells for columns added after this sheet already had
    // data (e.g. the Password column on a pre-existing Members sheet),
    // without touching any existing headers or data.
    const missingHeaders = headers.slice(sheet.getLastColumn());
    sheet.getRange(1, sheet.getLastColumn() + 1, 1, missingHeaders.length)
      .setValues([missingHeaders])
      .setFontWeight("bold");
  }

  return sheet;
}

function findRowByEmail_(sheet, email) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return -1;

  const emails = sheet.getRange(2, 6, lastRow - 1, 1).getValues(); // column F = Email
  for (let i = 0; i < emails.length; i++) {
    if (String(emails[i][0] || "").trim().toLowerCase() === normalizedEmail) {
      return i + 2; // actual sheet row number
    }
  }
  return -1;
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
