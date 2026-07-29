// LIFF_ID / GAS_WEB_APP_URL live in config.js (gitignored, see config.example.js)
const { LIFF_ID, GAS_WEB_APP_URL } = window.APP_CONFIG;

const liffLoading = document.getElementById("liffLoading");
const profileBox = document.getElementById("profileBox");
const profilePic = document.getElementById("profilePic");
const profileName = document.getElementById("profileName");
const registerForm = document.getElementById("registerForm");
const submitBtn = document.getElementById("submitBtn");
const resultMsg = document.getElementById("resultMsg");
const dashboardBox = document.getElementById("dashboardBox");
const dbFullname = document.getElementById("dbFullname");
const dbPhone = document.getElementById("dbPhone");
const dbEmail = document.getElementById("dbEmail");
const dbTier = document.getElementById("dbTier");
const joinSubtitle = document.getElementById("joinSubtitle");
const liffErrorBox = document.getElementById("liffErrorBox");
const liffRetryBtn = document.getElementById("liffRetryBtn");
const paymentBox = document.getElementById("paymentBox");
const paymentPrice = document.getElementById("paymentPrice");
const paymentBankDetail = document.getElementById("paymentBankDetail");
const paymentFinishBtn = document.getElementById("paymentFinishBtn");
const paymentBackBtn = document.getElementById("paymentBackBtn");
const copyAccountBtn = document.getElementById("copyAccountBtn");
const copyAccountBtnLabel = copyAccountBtn.querySelector(".copy-btn-label");
const bankAccountNumber = document.getElementById("bankAccountNumber");
const proofImageField = document.getElementById("proofImageField");
const proofImageInput = document.getElementById("proofImageInput");
const proofImagePreview = document.getElementById("proofImagePreview");
const proofImagePreviewImg = document.getElementById("proofImagePreviewImg");
const proofImageSize = document.getElementById("proofImageSize");

const viewDashboardBtn = document.getElementById("viewDashboardBtn");
const subscribeBtn = document.getElementById("subscribeBtn");
const subscriptionBox = document.getElementById("subscriptionBox");
const eaListContainer = document.getElementById("eaListContainer");
const eaListEmptyMsg = document.getElementById("eaListEmptyMsg");
const subscribeCancelBtn = document.getElementById("subscribeCancelBtn");
const eaDetailBox = document.getElementById("eaDetailBox");
const eaDetailTitle = document.getElementById("eaDetailTitle");
const eaDetailVersion = document.getElementById("eaDetailVersion");
const eaDetailText = document.getElementById("eaDetailText");
const eaDetailMaxDD = document.getElementById("eaDetailMaxDD");
const eaDetailProfit = document.getElementById("eaDetailProfit");
const eaDetailRecommendedCost = document.getElementById("eaDetailRecommendedCost");
const multiplierGrid = document.getElementById("multiplierGrid");
const durationField = document.getElementById("durationField");
const durationGrid = document.getElementById("durationGrid");
const eaDetailPrice = document.getElementById("eaDetailPrice");
const eaSubscribeForm = document.getElementById("eaSubscribeForm");
const portNumberInput = document.getElementById("portNumber");
const eaDetailBackBtn = document.getElementById("eaDetailBackBtn");
const includeVpsToggle = document.getElementById("includeVpsToggle");
const tradingPasswordField = document.getElementById("tradingPasswordField");
const tradingPasswordInput = document.getElementById("tradingPassword");
const toggleTradingPasswordBtn = document.getElementById("toggleTradingPasswordBtn");
const noVpsPopup = document.getElementById("noVpsPopup");
const noVpsContinueBtn = document.getElementById("noVpsContinueBtn");
const noVpsBackBtn = document.getElementById("noVpsBackBtn");
const paymentEaRow = document.getElementById("paymentEaRow");
const paymentEaName = document.getElementById("paymentEaName");
const paymentMultiplierRow = document.getElementById("paymentMultiplierRow");
const paymentMultiplierValue = document.getElementById("paymentMultiplierValue");
const paymentDurationRow = document.getElementById("paymentDurationRow");
const paymentDurationValue = document.getElementById("paymentDurationValue");
const paymentVpsRow = document.getElementById("paymentVpsRow");
const paymentVpsValue = document.getElementById("paymentVpsValue");
const viewSubscriptionsBtn = document.getElementById("viewSubscriptionsBtn");
const mySubscriptionsBox = document.getElementById("mySubscriptionsBox");
const subscriptionsListContainer = document.getElementById("subscriptionsListContainer");
const subscriptionsEmptyMsg = document.getElementById("subscriptionsEmptyMsg");
const subscriptionsBackBtn = document.getElementById("subscriptionsBackBtn");
const loginBox = document.getElementById("loginBox");
const loginForm = document.getElementById("loginForm");
const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const setPasswordBox = document.getElementById("setPasswordBox");
const setPasswordEmailLabel = document.getElementById("setPasswordEmailLabel");
const setPasswordForm = document.getElementById("setPasswordForm");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const setPasswordSubmitBtn = document.getElementById("setPasswordSubmitBtn");
const setPasswordCancelBtn = document.getElementById("setPasswordCancelBtn");

const vpsSubscribeBtn = document.getElementById("vpsSubscribeBtn");
const myVpsBtn = document.getElementById("myVpsBtn");
const vpsSubscriptionBox = document.getElementById("vpsSubscriptionBox");
const vpsSubscribeForm = document.getElementById("vpsSubscribeForm");
const vpsDurationGrid = document.getElementById("vpsDurationGrid");
const vpsSubPrice = document.getElementById("vpsSubPrice");
const vpsSubscribeBackBtn = document.getElementById("vpsSubscribeBackBtn");
const myVpsListBox = document.getElementById("myVpsListBox");
const vpsListContainer = document.getElementById("vpsListContainer");
const vpsListEmptyMsg = document.getElementById("vpsListEmptyMsg");
const myVpsBackBtn = document.getElementById("myVpsBackBtn");
const vpsDetailBox = document.getElementById("vpsDetailBox");
const vpsDetailTitle = document.getElementById("vpsDetailTitle");
const vpsDetailRenameBtn = document.getElementById("vpsDetailRenameBtn");
const vpsDetailStatus = document.getElementById("vpsDetailStatus");
const vpsDetailIp = document.getElementById("vpsDetailIp");
const vpsDetailUsername = document.getElementById("vpsDetailUsername");
const vpsDetailPassword = document.getElementById("vpsDetailPassword");
const vpsDetailShowPasswordBtn = document.getElementById("vpsDetailShowPasswordBtn");
const vpsDetailCopyPasswordBtn = document.getElementById("vpsDetailCopyPasswordBtn");
const vpsDetailStart = document.getElementById("vpsDetailStart");
const vpsDetailEnd = document.getElementById("vpsDetailEnd");
const vpsDetailBackBtn = document.getElementById("vpsDetailBackBtn");
const renameVpsPopup = document.getElementById("renameVpsPopup");
const renameVpsInput = document.getElementById("renameVpsInput");
const renameVpsSaveBtn = document.getElementById("renameVpsSaveBtn");
const renameVpsCancelBtn = document.getElementById("renameVpsCancelBtn");

let lineProfile = null;
let lastRegisteredMember = null;
// The LINE user ID backing the currently shown dashboard - either from the
// live LIFF profile, or (for email/password sign-in) the ID stored on the
// member's row when they originally registered through LINE.
let currentLineUserId = null;
// The tier text last applied via applyTier_.
let currentTier = "Bronze Farmer";
// Members sheet column I - 0/blank = free trial still available, 1 = already used.
// Drives both the "Get Free Trials"/"Subscription EA" button label and
// whether the EA detail page shows "Free" instead of a real price.
let currentFreeTrialsStatus = 0;
// Email pending a first-time password while setPasswordBox is shown.
let pendingSetPasswordEmail = null;
// { ea, port, lotMultiplier, price } captured on the EA detail page, used
// once the Payment page's Finish button is pressed.
let pendingSubscriptionOrder = null;
// EA objects ({ code, name, version, detail, maxDD, profitPerMonth, prices })
// fetched for the current Subscription EA list.
let eaListCache = [];
// The EA the member is currently viewing on the EA detail page.
let selectedEA = null;
// { key, price } for the lot multiplier chosen on the EA detail page.
let selectedMultiplier = null;
// Whether the EA detail page currently being viewed is the member's free
// trial (price shown as "Free" instead of the real per-multiplier price).
let isFreeTrialSubscription = false;
// { months, label } for the subscription duration chosen on the EA detail
// page. Forced to the 1-month tier (and hidden) during a free trial, since
// non-member EA access is limited to 1 month regardless.
let selectedDuration = null;
// Base64 (no data: prefix) + MIME type of the proof-of-transfer photo
// attached on the Payment page, sent as-is in the subscription POST for
// Code.gs to save to Drive.
let pendingProofImageBase64 = null;
let pendingProofImageType = null;
// Monthly VPS price (Sheet "VPS", cell C1), loaded alongside the EA list.
let vpsMonthlyPrice = 0;
// { port, includeVPS, tradingPassword } captured on eaSubscribeForm submit,
// held here while the "no VPS" confirmation popup is open since its Continue
// button fires outside the form's submit event.
let pendingEaFormValues = null;
// Standalone "private VPS" product prices (Sheet "VPS", cells E1/F1/G1 for
// 1/3/12 months) - separate from vpsMonthlyPrice, which only prices the
// "Include VPS" add-on inside an EA subscription.
let vpsPlanPrices = { price1: 0, price3: 0, price12: 0 };
// { months, label, price } chosen on the standalone VPS subscription page.
let selectedVpsDuration = null;
// { monthAmount, price } captured when continuing from the standalone VPS
// subscription page to the shared Payment page. Payment handlers check this
// (vs. pendingSubscriptionOrder) to know which flow they're finishing.
let pendingVpsOrder = null;
// VPS subscription records ({ subscriptionId, startDate, endDate, monthAmount,
// status, ip, username, password, name }) for the current member, fetched
// for the "My VPS" list.
let vpsListCache = [];
// The VPS subscription currently shown on the VPS detail page.
let selectedVpsSubscription = null;

const LOT_MULTIPLIER_TIERS = ["x1", "x2", "x3", "x4", "x5", "x7", "x10"];

// 3-month gets a 5% discount off 3x the monthly price; 12-month is priced as
// 10 months (2 months free).
const DURATION_TIERS = [
  { months: 1, label: "1 Month", note: "" },
  { months: 3, label: "3 Months", note: "5% off" },
  { months: 12, label: "12 Months", note: "2 mo free" },
];

function computeDurationPrice_(monthlyPrice, months) {
  if (months === 3) return monthlyPrice * 3 * 0.95;
  if (months === 12) return monthlyPrice * 10;
  return monthlyPrice * months;
}

// VPS is priced the same way as an EA subscription (3mo = 5% off, 12mo = 2
// months free) off the monthly rate in the "VPS" sheet, cell C1.
function computeVpsPrice_(months) {
  return computeDurationPrice_(vpsMonthlyPrice, months);
}

// Phone camera photos can be several MB - downscale + re-encode as JPEG
// client-side before base64-ing them into the no-cors POST body, since that
// body still has to travel over the network and get parsed by Apps Script.
function readAndCompressImage_(file) {
  const MAX_DIMENSION = 1400;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function splitDataUrl_(dataUrl) {
  const match = /^data:(.+);base64,(.*)$/.exec(dataUrl);
  return match ? { mimeType: match[1], base64: match[2] } : null;
}

function resetProofImage_() {
  pendingProofImageBase64 = null;
  pendingProofImageType = null;
  proofImageInput.value = "";
  proofImagePreviewImg.src = "";
  proofImageSize.textContent = "";
  proofImagePreview.classList.add("hidden");
}

proofImageInput.addEventListener("change", async () => {
  const file = proofImageInput.files[0];
  if (!file) return;

  try {
    const dataUrl = await readAndCompressImage_(file);
    const parts = splitDataUrl_(dataUrl);
    if (!parts || !parts.base64 || parts.base64.length < 100) {
      throw new Error("Compressed image came out empty - the photo likely failed to load into the canvas");
    }

    pendingProofImageBase64 = parts.base64;
    pendingProofImageType = parts.mimeType;

    const approxKB = Math.round((parts.base64.length * 3) / 4 / 1024);
    proofImagePreviewImg.src = dataUrl;
    proofImageSize.textContent = `Attached (${approxKB} KB)`;
    proofImagePreview.classList.remove("hidden");
  } catch (err) {
    console.error("Failed to process proof image", err);
    showResult("Couldn't process that image. Please try another photo.", "error");
    resetProofImage_();
  }
});

// Hashes with SHA-256 client-side so a plaintext password is never sent,
// even over the no-cors/JSONP channels used elsewhere in this file.
async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Apps Script GET responses have no CORS headers, so fetch() can't read them
// cross-origin. Loading the URL as a <script> tag sidesteps that: the server
// wraps the JSON in a call to our callback, which runs as soon as it loads.
function jsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = "jsonp_cb_" + Date.now() + "_" + Math.floor(Math.random() * 1e6);
    const script = document.createElement("script");

    function cleanup() {
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("JSONP request failed"));
    };

    const separator = url.includes("?") ? "&" : "?";
    script.src = url + separator + "callback=" + callbackName;
    document.body.appendChild(script);
  });
}

function applyTier_(tier) {
  currentTier = tier;
  dbTier.textContent = tier;
  dbTier.classList.toggle("tier-bronze", tier === "Bronze Farmer");
  dbTier.classList.toggle("tier-silver", tier === "Silver Farmer");
  dbTier.classList.toggle("tier-pending", tier === "Awaiting payment confirmation.");
}

function updateSubscribeBtnLabel_() {
  subscribeBtn.textContent = currentFreeTrialsStatus ? "Subscription EA" : "Get Free Trials";
}

function showDashboard(member) {
  joinSubtitle.classList.add("hidden");
  currentLineUserId = member.lineUserId || (lineProfile && lineProfile.userId) || "";
  dbFullname.textContent = member.fullname || "-";
  dbPhone.textContent = member.phone || "-";
  dbEmail.textContent = member.email || "-";
  currentFreeTrialsStatus = member.freeTrialsStatus ? 1 : 0;
  updateSubscribeBtnLabel_();
  applyTier_(member.tier || "Bronze Farmer");
  dashboardBox.classList.remove("hidden");
}

async function initLiff() {
  try {
    await liff.init({ liffId: LIFF_ID });
  } catch (err) {
    // liff.init() itself failed - e.g. opened outside a LIFF context. This is
    // the only case that falls back to the email/password login.
    console.error("LIFF init failed, falling back to email/password login", err);
    liffLoading.classList.add("hidden");
    loginBox.classList.remove("hidden");
    return;
  }

  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  try {
    lineProfile = await liff.getProfile();

    profilePic.src = lineProfile.pictureUrl || "";
    profileName.textContent = lineProfile.displayName || "LINE User";
    profileBox.classList.remove("hidden");

    let check;
    try {
      check = await jsonp(
        `${GAS_WEB_APP_URL}?lineUserId=${encodeURIComponent(lineProfile.userId)}`
      );
    } catch (err) {
      console.error("Registration check failed", err);
      check = { registered: false };
    }

    liffLoading.classList.add("hidden");

    if (check.registered) {
      showDashboard(check.member);
    } else {
      registerForm.classList.remove("hidden");
    }
  } catch (err) {
    // The user is confirmed logged into LINE at this point, so a failure
    // here (e.g. getProfile() erroring) must never fall back to the
    // unrelated email/password login - offer a retry instead.
    console.error("Failed to load LINE profile", err);
    liffLoading.classList.add("hidden");
    liffErrorBox.classList.remove("hidden");
  }
}

liffRetryBtn.addEventListener("click", () => location.reload());

function showResult(message, type) {
  resultMsg.textContent = message;
  resultMsg.className = "result-msg " + type;
  resultMsg.classList.remove("hidden");
}

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultMsg.classList.add("hidden");

  const fullname = document.getElementById("fullname").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!fullname || !phone || !email) {
    showResult("Please fill in every field.", "error");
    return;
  }

  const payload = {
    lineUserId: lineProfile ? lineProfile.userId : "",
    lineDisplayName: lineProfile ? lineProfile.displayName : "",
    fullname,
    phone,
    email,
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    // Apps Script web apps redirect through a googleusercontent.com URL that
    // sends no CORS headers, so the response can never be read from the
    // browser. mode: "no-cors" + "text/plain" (avoids a preflight) turns this
    // into a fire-and-forget request; Code.gs still parses the body as JSON.
    await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    registerForm.classList.add("hidden");
    showResult("Registration complete! Thank you for joining.", "success");

    lastRegisteredMember = {
      fullname,
      phone,
      email,
      lineUserId: lineProfile ? lineProfile.userId : "",
      registeredAt: new Date().toISOString(),
      tier: "Bronze Farmer",
      freeTrialsStatus: 0,
    };
    viewDashboardBtn.classList.remove("hidden");
  } catch (err) {
    console.error("Submit failed", err);
    showResult("Network error. Please check your connection and try again.", "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Register";
  }
});

viewDashboardBtn.addEventListener("click", () => {
  resultMsg.classList.add("hidden");
  viewDashboardBtn.classList.add("hidden");
  showDashboard(lastRegisteredMember);
});

// Populates the EA list from the "ExpertAdvisor" sheet (JSONP, same
// no-CORS reasoning as the registration lookup).
async function loadEAList() {
  eaListContainer.innerHTML = "";
  eaListEmptyMsg.textContent = "Loading EAs...";
  eaListEmptyMsg.classList.remove("hidden");

  try {
    const res = await jsonp(`${GAS_WEB_APP_URL}?action=listEA`);
    eaListCache = (res && res.eaList) || [];
    vpsMonthlyPrice = Number(res && res.vpsPrice) || 0;
    renderEAList_();
  } catch (err) {
    console.error("Failed to load EA list", err);
    eaListCache = [];
    eaListContainer.innerHTML = "";
    eaListEmptyMsg.textContent = "Failed to load EAs. Please try again.";
    eaListEmptyMsg.classList.remove("hidden");
  }
}

function renderEAList_() {
  eaListContainer.innerHTML = "";

  if (eaListCache.length === 0) {
    eaListEmptyMsg.textContent = "No EAs available right now.";
    eaListEmptyMsg.classList.remove("hidden");
    return;
  }

  eaListEmptyMsg.classList.add("hidden");

  eaListCache.forEach((ea) => {
    const card = document.createElement("div");
    card.className = "ea-card";

    const header = document.createElement("div");
    header.className = "ea-card-header";

    const name = document.createElement("span");
    name.className = "ea-card-name";
    name.textContent = ea.name || "-";
    header.appendChild(name);

    if (ea.version) {
      const version = document.createElement("span");
      version.className = "ea-version-badge";
      version.textContent = "v" + ea.version;
      header.appendChild(version);
    }

    const detail = document.createElement("p");
    detail.className = "ea-card-detail";
    detail.textContent = ea.detail || "";

    const stats = document.createElement("div");
    stats.className = "ea-card-stats";

    const maxDDStat = document.createElement("span");
    maxDDStat.className = "ea-stat";
    maxDDStat.innerHTML = '<span class="ea-stat-label">Max DD</span>';
    const maxDDValue = document.createElement("span");
    maxDDValue.className = "ea-stat-value";
    maxDDValue.textContent = formatMaxDD_(ea.maxDD);
    maxDDStat.appendChild(maxDDValue);

    const profitStat = document.createElement("span");
    profitStat.className = "ea-stat";
    profitStat.innerHTML = '<span class="ea-stat-label">Profit/mo</span>';
    const profitValue = document.createElement("span");
    profitValue.className = "ea-stat-value";
    profitValue.textContent = formatUsd_(ea.profitPerMonth);
    profitStat.appendChild(profitValue);

    const recommendedCostStat = document.createElement("span");
    recommendedCostStat.className = "ea-stat";
    recommendedCostStat.innerHTML = '<span class="ea-stat-label">Rec. Cost</span>';
    const recommendedCostValue = document.createElement("span");
    recommendedCostValue.className = "ea-stat-value";
    recommendedCostValue.textContent = formatUsd_(ea.recommendedInitialCost);
    recommendedCostStat.appendChild(recommendedCostValue);

    stats.append(maxDDStat, profitStat, recommendedCostStat);

    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.className = "btn ea-view-btn";
    viewBtn.textContent = "View EA";
    viewBtn.addEventListener("click", () => showEADetail_(ea));

    const footer = document.createElement("div");
    footer.className = "ea-card-footer";
    footer.append(stats, viewBtn);

    card.append(header, detail, footer);
    eaListContainer.appendChild(card);
  });
}

// MaxDD is stored as a plain number (e.g. 12) and shown as a percentage;
// Profit/Month is stored as a plain number (e.g. 500) and shown as a dollar amount.
function formatMaxDD_(value) {
  if (value === undefined || value === null || value === "") return "-";
  return value + "%";
}

function formatUsd_(value) {
  if (value === undefined || value === null || value === "") return "-";
  const num = Number(value);
  return "$" + (isNaN(num) ? value : num.toLocaleString());
}

// VPS sheet column F: -1 = wait for proof, 0 = Create Vps, 1 = Normal,
// 2 = Error, 3 = End Service.
function formatVpsStatus_(status) {
  switch (Number(status)) {
    case -1: return "Awaiting Proof Confirmation";
    case 0: return "Provisioning";
    case 1: return "Normal";
    case 2: return "Error";
    case 3: return "Service Ended";
    default: return "-";
  }
}

function showEADetail_(ea) {
  selectedEA = ea;
  selectedMultiplier = null;
  selectedDuration = null;
  isFreeTrialSubscription = !currentFreeTrialsStatus;

  subscriptionBox.classList.add("hidden");
  eaDetailBox.classList.remove("hidden");

  eaDetailTitle.textContent = ea.name || "EA Detail";
  eaDetailVersion.textContent = ea.version ? "v" + ea.version : "";
  eaDetailVersion.classList.toggle("hidden", !ea.version);
  eaDetailText.textContent = ea.detail || "";
  eaDetailMaxDD.textContent = formatMaxDD_(ea.maxDD);
  eaDetailProfit.textContent = formatUsd_(ea.profitPerMonth);
  eaDetailRecommendedCost.textContent = formatUsd_(ea.recommendedInitialCost);
  eaDetailPrice.textContent = "-";

  // Non-member free trials are limited to 1 month, so there's nothing to pick.
  durationField.classList.toggle("hidden", isFreeTrialSubscription);
  if (isFreeTrialSubscription) {
    selectedDuration = DURATION_TIERS[0];
  }

  eaSubscribeForm.reset();
  includeVpsToggle.checked = false;
  tradingPasswordField.classList.add("hidden");
  tradingPasswordInput.type = "password";
  toggleTradingPasswordBtn.textContent = "Show";
  renderMultiplierGrid_(ea);
  renderDurationGrid_();
}

function renderMultiplierGrid_(ea) {
  multiplierGrid.innerHTML = "";

  LOT_MULTIPLIER_TIERS.forEach((key) => {
    const price = ea.prices ? ea.prices[key] : undefined;
    if (price === undefined || price === "") return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "multiplier-btn";

    const label = document.createElement("span");
    label.className = "multiplier-label";
    label.textContent = key;

    const priceLabel = document.createElement("span");
    priceLabel.className = "multiplier-price";
    priceLabel.textContent = isFreeTrialSubscription ? "Free" : Number(price).toLocaleString() + "฿";

    btn.append(label, priceLabel);
    btn.addEventListener("click", () => selectMultiplier_(key, price, btn));
    multiplierGrid.appendChild(btn);
  });
}

function renderDurationGrid_() {
  durationGrid.innerHTML = "";

  DURATION_TIERS.forEach((tier) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "multiplier-btn";

    const label = document.createElement("span");
    label.className = "multiplier-label";
    label.textContent = tier.label;

    const note = document.createElement("span");
    note.className = "multiplier-price";
    note.textContent = tier.note;

    btn.append(label, note);
    btn.addEventListener("click", () => selectDuration_(tier, btn));
    durationGrid.appendChild(btn);
  });
}

function selectMultiplier_(key, price, btnEl) {
  selectedMultiplier = { key, price: isFreeTrialSubscription ? 0 : Number(price) };

  multiplierGrid.querySelectorAll(".multiplier-btn").forEach((b) => b.classList.remove("selected"));
  btnEl.classList.add("selected");

  updatePriceDisplay_();
}

function selectDuration_(tier, btnEl) {
  selectedDuration = tier;

  durationGrid.querySelectorAll(".multiplier-btn").forEach((b) => b.classList.remove("selected"));
  btnEl.classList.add("selected");

  updatePriceDisplay_();
}

function updatePriceDisplay_() {
  if (!selectedMultiplier || !selectedDuration) {
    eaDetailPrice.textContent = "-";
    return;
  }

  const eaPrice = isFreeTrialSubscription
    ? 0
    : computeDurationPrice_(selectedMultiplier.price, selectedDuration.months);
  const vpsPrice = includeVpsToggle.checked ? computeVpsPrice_(selectedDuration.months) : 0;
  const total = Math.round(eaPrice + vpsPrice);

  eaDetailPrice.textContent = total === 0 ? "Free" : total.toLocaleString() + "฿";
}

includeVpsToggle.addEventListener("change", () => {
  tradingPasswordField.classList.toggle("hidden", !includeVpsToggle.checked);
  if (!includeVpsToggle.checked) {
    tradingPasswordInput.value = "";
  }
  updatePriceDisplay_();
});

toggleTradingPasswordBtn.addEventListener("click", () => {
  const isHidden = tradingPasswordInput.type === "password";
  tradingPasswordInput.type = isHidden ? "text" : "password";
  toggleTradingPasswordBtn.textContent = isHidden ? "Hide" : "Show";
});

// Shared by the bank account copy button and each subscription card's
// "Copy Download Link" button.
async function copyTextToClipboard_(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

copyAccountBtn.addEventListener("click", async () => {
  const accountNumber = bankAccountNumber.textContent.trim();

  try {
    await copyTextToClipboard_(accountNumber);

    copyAccountBtnLabel.textContent = "Copied!";
    copyAccountBtn.classList.add("copied");
  } catch (err) {
    console.error("Copy account number failed", err);
    copyAccountBtnLabel.textContent = "Failed";
  } finally {
    setTimeout(() => {
      copyAccountBtnLabel.textContent = "Copy";
      copyAccountBtn.classList.remove("copied");
    }, 1500);
  }
});

paymentBackBtn.addEventListener("click", () => {
  paymentBox.classList.add("hidden");

  // Payment page is shared between the EA subscription flow and the
  // standalone VPS subscription flow - route back to whichever one is live.
  if (pendingVpsOrder) {
    pendingVpsOrder = null;
    vpsSubscriptionBox.classList.remove("hidden");
    return;
  }

  pendingSubscriptionOrder = null;
  eaDetailBox.classList.remove("hidden");
});

paymentFinishBtn.addEventListener("click", async () => {
  const order = pendingVpsOrder || pendingSubscriptionOrder;
  if (!order) return;

  if (order.price !== 0 && !pendingProofImageBase64) {
    showResult("Please upload a photo of your transfer receipt.", "error");
    return;
  }

  paymentFinishBtn.disabled = true;
  paymentFinishBtn.textContent = "Submitting...";

  try {
    if (pendingVpsOrder) {
      // Fire-and-forget POST, same no-cors reasoning as registration.
      await fetch(GAS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          type: "vpsSubscription",
          lineUserId: currentLineUserId || "",
          monthAmount: pendingVpsOrder.monthAmount,
          price: pendingVpsOrder.price,
          proofImage: pendingProofImageBase64,
          proofImageType: pendingProofImageType,
        }),
      });

      pendingVpsOrder = null;
      resetProofImage_();

      paymentBox.classList.add("hidden");
      dashboardBox.classList.remove("hidden");
      showResult("VPS subscription submitted!", "success");
    } else {
      await fetch(GAS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          type: "subscription",
          lineUserId: currentLineUserId || "",
          ea: pendingSubscriptionOrder.ea,
          port: pendingSubscriptionOrder.port,
          lotMultiplier: pendingSubscriptionOrder.lotMultiplier,
          durationMonths: pendingSubscriptionOrder.durationMonths,
          price: pendingSubscriptionOrder.price,
          isFreeTrial: pendingSubscriptionOrder.isFreeTrial,
          includeVPS: pendingSubscriptionOrder.includeVPS,
          tradingPassword: pendingSubscriptionOrder.tradingPassword,
          proofImage: pendingProofImageBase64,
          proofImageType: pendingProofImageType,
        }),
      });

      if (pendingSubscriptionOrder.isFreeTrial) {
        currentFreeTrialsStatus = 1;
        updateSubscribeBtnLabel_();
      }

      pendingSubscriptionOrder = null;
      resetProofImage_();

      paymentBox.classList.add("hidden");
      dashboardBox.classList.remove("hidden");
      showResult("Subscription confirmed!", "success");
    }
  } catch (err) {
    console.error("Payment submit failed", err);
    showResult("Network error. Please check your connection and try again.", "error");
  } finally {
    paymentFinishBtn.disabled = false;
    paymentFinishBtn.textContent = "Finish";
  }
});

subscribeBtn.addEventListener("click", () => {
  resultMsg.classList.add("hidden");
  dashboardBox.classList.add("hidden");
  subscriptionBox.classList.remove("hidden");
  eaListContainer.classList.remove("hidden");

  loadEAList();
});

subscribeCancelBtn.addEventListener("click", () => {
  subscriptionBox.classList.add("hidden");
  dashboardBox.classList.remove("hidden");
});

eaDetailBackBtn.addEventListener("click", () => {
  eaDetailBox.classList.add("hidden");
  subscriptionBox.classList.remove("hidden");
  pendingEaFormValues = null;
});

eaSubscribeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  resultMsg.classList.add("hidden");

  const port = portNumberInput.value.trim();

  if (!selectedMultiplier) {
    showResult("Please select a lot multiplier.", "error");
    return;
  }

  if (!selectedDuration) {
    showResult("Please select a subscription duration.", "error");
    return;
  }

  if (!port) {
    showResult("Please enter a port number.", "error");
    return;
  }

  const includeVPS = includeVpsToggle.checked;
  const tradingPassword = tradingPasswordInput.value.trim();

  if (includeVPS && !tradingPassword) {
    showResult("Please enter your trading password.", "error");
    return;
  }

  // No VPS selected - warn that the member has to run the bot themselves
  // before letting them continue, rather than silently proceeding.
  if (!includeVPS) {
    pendingEaFormValues = { port, includeVPS, tradingPassword };
    noVpsPopup.classList.remove("hidden");
    return;
  }

  finalizeSubscriptionOrder_(port, includeVPS, tradingPassword);
});

noVpsContinueBtn.addEventListener("click", () => {
  noVpsPopup.classList.add("hidden");
  if (!pendingEaFormValues) return;

  finalizeSubscriptionOrder_(
    pendingEaFormValues.port,
    pendingEaFormValues.includeVPS,
    pendingEaFormValues.tradingPassword
  );
  pendingEaFormValues = null;
});

noVpsBackBtn.addEventListener("click", () => {
  noVpsPopup.classList.add("hidden");
  pendingEaFormValues = null;
});

function finalizeSubscriptionOrder_(port, includeVPS, tradingPassword) {
  const eaPrice = isFreeTrialSubscription
    ? 0
    : computeDurationPrice_(selectedMultiplier.price, selectedDuration.months);
  const vpsPrice = includeVPS ? computeVpsPrice_(selectedDuration.months) : 0;
  const finalPrice = Math.round(eaPrice + vpsPrice);

  pendingSubscriptionOrder = {
    ea: selectedEA.name,
    port,
    lotMultiplier: selectedMultiplier.key,
    durationMonths: selectedDuration.months,
    price: finalPrice,
    isFreeTrial: isFreeTrialSubscription,
    includeVPS,
    tradingPassword,
  };

  paymentEaName.textContent = selectedEA.name;
  paymentMultiplierValue.textContent = selectedMultiplier.key;
  paymentDurationValue.textContent = selectedDuration.label;
  paymentEaRow.classList.remove("hidden");
  paymentMultiplierRow.classList.remove("hidden");
  paymentDurationRow.classList.remove("hidden");
  paymentVpsValue.textContent = includeVPS ? "Included" : "Not Included";
  paymentVpsRow.classList.remove("hidden");
  // Nothing to pay or prove when the total comes out to zero (free trial, no VPS).
  const isFullyFree = finalPrice === 0;
  paymentPrice.textContent = isFullyFree ? "Free" : finalPrice.toLocaleString() + "฿";
  paymentBankDetail.classList.toggle("hidden", isFullyFree);
  proofImageField.classList.toggle("hidden", isFullyFree);
  resetProofImage_();

  eaDetailBox.classList.add("hidden");
  paymentBox.classList.remove("hidden");
}

// Fetches the standalone VPS product's per-duration prices (Sheet "VPS",
// cells E1/F1/G1), same no-CORS/JSONP reasoning as the EA list lookup.
async function loadVpsPlans_() {
  try {
    const res = await jsonp(`${GAS_WEB_APP_URL}?action=getVpsPlans`);
    vpsPlanPrices = (res && res.plans) || { price1: 0, price3: 0, price12: 0 };
  } catch (err) {
    console.error("Failed to load VPS plan prices", err);
    vpsPlanPrices = { price1: 0, price3: 0, price12: 0 };
  }
  renderVpsDurationGrid_();
}

function renderVpsDurationGrid_() {
  vpsDurationGrid.innerHTML = "";

  DURATION_TIERS.forEach((tier) => {
    const price =
      tier.months === 3 ? vpsPlanPrices.price3 : tier.months === 12 ? vpsPlanPrices.price12 : vpsPlanPrices.price1;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "multiplier-btn";

    const label = document.createElement("span");
    label.className = "multiplier-label";
    label.textContent = tier.label;

    const priceLabel = document.createElement("span");
    priceLabel.className = "multiplier-price";
    priceLabel.textContent = Number(price).toLocaleString() + "฿";

    btn.append(label, priceLabel);
    btn.addEventListener("click", () => selectVpsDuration_(tier, price, btn));
    vpsDurationGrid.appendChild(btn);
  });
}

function selectVpsDuration_(tier, price, btnEl) {
  selectedVpsDuration = { months: tier.months, label: tier.label, price: Number(price) || 0 };

  vpsDurationGrid.querySelectorAll(".multiplier-btn").forEach((b) => b.classList.remove("selected"));
  btnEl.classList.add("selected");

  vpsSubPrice.textContent = selectedVpsDuration.price.toLocaleString() + "฿";
}

vpsSubscribeBtn.addEventListener("click", () => {
  resultMsg.classList.add("hidden");
  dashboardBox.classList.add("hidden");
  vpsSubscriptionBox.classList.remove("hidden");

  selectedVpsDuration = null;
  vpsSubPrice.textContent = "-";
  vpsSubscribeForm.reset();
  loadVpsPlans_();
});

vpsSubscribeBackBtn.addEventListener("click", () => {
  vpsSubscriptionBox.classList.add("hidden");
  dashboardBox.classList.remove("hidden");
});

vpsSubscribeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  resultMsg.classList.add("hidden");

  if (!selectedVpsDuration) {
    showResult("Please select a subscription duration.", "error");
    return;
  }

  pendingVpsOrder = {
    monthAmount: selectedVpsDuration.months,
    price: Math.round(selectedVpsDuration.price),
  };

  // Payment page is shared with the EA subscription flow - hide the rows
  // that don't apply to a standalone VPS order.
  paymentEaRow.classList.add("hidden");
  paymentMultiplierRow.classList.add("hidden");
  paymentVpsRow.classList.add("hidden");
  paymentDurationValue.textContent = selectedVpsDuration.label;
  paymentDurationRow.classList.remove("hidden");

  const isFullyFree = pendingVpsOrder.price === 0;
  paymentPrice.textContent = isFullyFree ? "Free" : pendingVpsOrder.price.toLocaleString() + "฿";
  paymentBankDetail.classList.toggle("hidden", isFullyFree);
  proofImageField.classList.toggle("hidden", isFullyFree);
  resetProofImage_();

  vpsSubscriptionBox.classList.add("hidden");
  paymentBox.classList.remove("hidden");
});

// Populates the "My VPS" list from the "VPS" sheet (JSONP, same no-CORS
// reasoning as the EA/subscription lookups).
async function loadMyVpsList_() {
  vpsListContainer.innerHTML = "";
  vpsListEmptyMsg.textContent = "Loading...";
  vpsListEmptyMsg.classList.remove("hidden");

  const lineUserId = currentLineUserId || "";

  try {
    const res = await jsonp(
      `${GAS_WEB_APP_URL}?action=listVpsSubscriptions&lineUserId=${encodeURIComponent(lineUserId)}`
    );
    vpsListCache = (res && res.vpsSubscriptions) || [];
    renderVpsList_();
  } catch (err) {
    console.error("Failed to load VPS subscriptions", err);
    vpsListCache = [];
    vpsListContainer.innerHTML = "";
    vpsListEmptyMsg.textContent = "Failed to load VPS subscriptions.";
    vpsListEmptyMsg.classList.remove("hidden");
  }
}

function renderVpsList_() {
  vpsListContainer.innerHTML = "";

  if (vpsListCache.length === 0) {
    vpsListEmptyMsg.textContent = "No VPS subscriptions yet.";
    vpsListEmptyMsg.classList.remove("hidden");
    return;
  }

  vpsListEmptyMsg.classList.add("hidden");

  vpsListCache.forEach((vps) => {
    const card = document.createElement("div");
    card.className = "sub-card";

    const header = document.createElement("div");
    header.className = "sub-card-header";

    const name = document.createElement("span");
    name.className = "sub-card-name";
    // Show the member-set name if there is one, otherwise fall back to the
    // system-generated subscription ID.
    name.textContent = vps.name || vps.subscriptionId || "-";
    header.appendChild(name);

    const grid = document.createElement("div");
    grid.className = "sub-card-grid";
    grid.append(buildSubField_("Start", formatDate_(vps.startDate)), buildSubField_("End", formatDate_(vps.endDate)));

    const detailBtn = document.createElement("button");
    detailBtn.type = "button";
    detailBtn.className = "copy-btn sub-download-btn";
    detailBtn.textContent = "Detail";
    detailBtn.addEventListener("click", () => showVpsDetail_(vps));

    card.append(header, grid, detailBtn);
    vpsListContainer.appendChild(card);
  });
}

myVpsBtn.addEventListener("click", () => {
  resultMsg.classList.add("hidden");
  dashboardBox.classList.add("hidden");
  myVpsListBox.classList.remove("hidden");
  loadMyVpsList_();
});

myVpsBackBtn.addEventListener("click", () => {
  myVpsListBox.classList.add("hidden");
  dashboardBox.classList.remove("hidden");
});

function showVpsDetail_(vps) {
  selectedVpsSubscription = vps;

  myVpsListBox.classList.add("hidden");
  vpsDetailBox.classList.remove("hidden");

  vpsDetailTitle.textContent = vps.name || vps.subscriptionId || "-";
  vpsDetailStatus.textContent = formatVpsStatus_(vps.status);
  vpsDetailIp.textContent = vps.ip || "-";
  vpsDetailUsername.textContent = vps.username || "-";
  vpsDetailStart.textContent = formatDate_(vps.startDate);
  vpsDetailEnd.textContent = formatDate_(vps.endDate);

  vpsDetailPassword.textContent = "••••••••";
  vpsDetailPassword.dataset.revealed = "false";
  vpsDetailShowPasswordBtn.textContent = "Show";
}

vpsDetailBackBtn.addEventListener("click", () => {
  vpsDetailBox.classList.add("hidden");
  myVpsListBox.classList.remove("hidden");
});

vpsDetailShowPasswordBtn.addEventListener("click", () => {
  if (!selectedVpsSubscription) return;

  const isRevealed = vpsDetailPassword.dataset.revealed === "true";
  vpsDetailPassword.textContent = isRevealed
    ? "••••••••"
    : selectedVpsSubscription.password || "-";
  vpsDetailPassword.dataset.revealed = isRevealed ? "false" : "true";
  vpsDetailShowPasswordBtn.textContent = isRevealed ? "Show" : "Hide";
});

vpsDetailCopyPasswordBtn.addEventListener("click", async () => {
  if (!selectedVpsSubscription || !selectedVpsSubscription.password) return;

  try {
    await copyTextToClipboard_(selectedVpsSubscription.password);
    vpsDetailCopyPasswordBtn.textContent = "Copied!";
  } catch (err) {
    console.error("Copy VPS password failed", err);
    vpsDetailCopyPasswordBtn.textContent = "Failed";
  } finally {
    setTimeout(() => {
      vpsDetailCopyPasswordBtn.textContent = "Copy";
    }, 1500);
  }
});

vpsDetailRenameBtn.addEventListener("click", () => {
  if (!selectedVpsSubscription) return;

  renameVpsInput.value = selectedVpsSubscription.name || "";
  renameVpsPopup.classList.remove("hidden");
  renameVpsInput.focus();
});

renameVpsCancelBtn.addEventListener("click", () => {
  renameVpsPopup.classList.add("hidden");
});

renameVpsSaveBtn.addEventListener("click", async () => {
  if (!selectedVpsSubscription) return;

  const newName = renameVpsInput.value.trim();

  renameVpsSaveBtn.disabled = true;
  renameVpsSaveBtn.textContent = "Saving...";

  try {
    // Fire-and-forget POST, same no-cors reasoning as registration.
    await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        type: "updateVpsName",
        subscriptionId: selectedVpsSubscription.subscriptionId,
        name: newName,
      }),
    });

    selectedVpsSubscription.name = newName;
    vpsDetailTitle.textContent = newName || selectedVpsSubscription.subscriptionId || "-";

    const cached = vpsListCache.find((v) => v.subscriptionId === selectedVpsSubscription.subscriptionId);
    if (cached) cached.name = newName;

    renameVpsPopup.classList.add("hidden");
  } catch (err) {
    console.error("Rename VPS failed", err);
    showResult("Network error. Please check your connection and try again.", "error");
  } finally {
    renameVpsSaveBtn.disabled = false;
    renameVpsSaveBtn.textContent = "Save";
  }
});

function formatDate_(value) {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

function buildSubField_(label, value) {
  const field = document.createElement("div");

  const labelEl = document.createElement("span");
  labelEl.className = "sub-field-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("span");
  valueEl.className = "sub-field-value";
  valueEl.textContent = value;

  field.append(labelEl, valueEl);
  return field;
}

async function loadMySubscriptions() {
  subscriptionsListContainer.innerHTML = "";
  subscriptionsEmptyMsg.textContent = "No subscriptions yet.";
  subscriptionsEmptyMsg.classList.add("hidden");

  const lineUserId = currentLineUserId || "";

  try {
    const res = await jsonp(
      `${GAS_WEB_APP_URL}?action=listSubscriptions&lineUserId=${encodeURIComponent(lineUserId)}`
    );
    const subscriptions = (res && res.subscriptions) || [];

    if (subscriptions.length === 0) {
      subscriptionsEmptyMsg.classList.remove("hidden");
      return;
    }

    subscriptions.forEach((sub) => {
      const card = document.createElement("div");
      card.className = "sub-card";

      const header = document.createElement("div");
      header.className = "sub-card-header";

      const name = document.createElement("span");
      name.className = "sub-card-name";
      name.textContent = sub.ea || "-";

      const isFree = Number(sub.price) === 0;
      const isPaid = Number(sub.payStatus) === 1;
      const statusClass = isFree ? "sub-status-free" : isPaid ? "sub-status-paid" : "sub-status-pending";
      const statusText = isFree ? "Free" : isPaid ? "Paid" : "Awaiting Confirmation";

      const status = document.createElement("span");
      status.className = "sub-status-badge " + statusClass;
      status.textContent = statusText;

      header.append(name, status);

      const grid = document.createElement("div");
      grid.className = "sub-card-grid";
      grid.append(
        buildSubField_("Port", sub.port || "-"),
        buildSubField_("Multiplier", sub.lotMultiplier || "-"),
        buildSubField_("Start", formatDate_(sub.startDate)),
        buildSubField_("End", formatDate_(sub.endDate))
      );

      const downloadBtn = document.createElement("button");
      downloadBtn.type = "button";
      downloadBtn.className = "copy-btn sub-download-btn";
      downloadBtn.textContent = "Copy Download Link";
      downloadBtn.addEventListener("click", async () => {
        // TODO: replace with the real EA file link once Drive storage is wired up.
        const downloadLink = `${GAS_WEB_APP_URL}?action=downloadEA&subscriptionId=${encodeURIComponent(sub.subscriptionId)}`;

        try {
          await copyTextToClipboard_(downloadLink);
          downloadBtn.textContent = "Copied!";
        } catch (err) {
          console.error("Copy download link failed", err);
          downloadBtn.textContent = "Failed";
        } finally {
          setTimeout(() => {
            downloadBtn.textContent = "Copy Download Link";
          }, 1500);
        }
      });

      card.append(header, grid, downloadBtn);
      subscriptionsListContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load subscriptions", err);
    subscriptionsEmptyMsg.textContent = "Failed to load subscriptions.";
    subscriptionsEmptyMsg.classList.remove("hidden");
  }
}

viewSubscriptionsBtn.addEventListener("click", () => {
  resultMsg.classList.add("hidden");
  dashboardBox.classList.add("hidden");
  mySubscriptionsBox.classList.remove("hidden");
  loadMySubscriptions();
});

subscriptionsBackBtn.addEventListener("click", () => {
  mySubscriptionsBox.classList.add("hidden");
  dashboardBox.classList.remove("hidden");
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultMsg.classList.add("hidden");

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;

  if (!email) {
    showResult("Please enter your email.", "error");
    return;
  }

  loginSubmitBtn.disabled = true;
  loginSubmitBtn.textContent = "Signing in...";

  try {
    const passwordHash = password ? await sha256Hex(password) : "";
    const res = await jsonp(
      `${GAS_WEB_APP_URL}?action=login&email=${encodeURIComponent(email)}&passwordHash=${encodeURIComponent(passwordHash)}`
    );

    if (!res.emailFound) {
      showResult("Email not found. Please register through LINE first.", "error");
      return;
    }

    // No password on file yet - route to first-time setup regardless of
    // whether the user typed one, since it can't be checked against anything.
    if (!res.hasPassword) {
      pendingSetPasswordEmail = email;
      loginBox.classList.add("hidden");
      setPasswordEmailLabel.textContent = `Setting a password for ${email}`;
      setPasswordForm.reset();
      setPasswordBox.classList.remove("hidden");
      return;
    }

    if (!password) {
      showResult("Please enter your password.", "error");
      return;
    }

    if (!res.passwordMatch) {
      showResult("Incorrect password.", "error");
      return;
    }

    loginBox.classList.add("hidden");
    showDashboard(res.member);
  } catch (err) {
    console.error("Login failed", err);
    showResult("Network error. Please check your connection and try again.", "error");
  } finally {
    loginSubmitBtn.disabled = false;
    loginSubmitBtn.textContent = "Login";
  }
});

setPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultMsg.classList.add("hidden");

  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (newPassword !== confirmPassword) {
    showResult("Passwords do not match.", "error");
    return;
  }

  setPasswordSubmitBtn.disabled = true;
  setPasswordSubmitBtn.textContent = "Saving...";

  try {
    const passwordHash = await sha256Hex(newPassword);

    // Fire-and-forget POST, same reasoning as registration/subscription.
    await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ type: "setPassword", email: pendingSetPasswordEmail, passwordHash }),
    });

    loginEmailInput.value = pendingSetPasswordEmail || "";
    loginPasswordInput.value = "";
    pendingSetPasswordEmail = null;

    setPasswordBox.classList.add("hidden");
    loginBox.classList.remove("hidden");
    showResult("Password set! Please log in.", "success");
  } catch (err) {
    console.error("Set password failed", err);
    showResult("Network error. Please check your connection and try again.", "error");
  } finally {
    setPasswordSubmitBtn.disabled = false;
    setPasswordSubmitBtn.textContent = "Set Password";
  }
});

setPasswordCancelBtn.addEventListener("click", () => {
  setPasswordForm.reset();
  pendingSetPasswordEmail = null;
  setPasswordBox.classList.add("hidden");
  loginBox.classList.remove("hidden");
});

initLiff();
