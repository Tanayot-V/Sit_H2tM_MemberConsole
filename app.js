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
const becomeFarmerBtn = document.getElementById("becomeFarmerBtn");
const becomeFarmerBox = document.getElementById("becomeFarmerBox");
const becomeFarmerForm = document.getElementById("becomeFarmerForm");
const couponCodeInput = document.getElementById("couponCode");
const becomeFarmerCancelBtn = document.getElementById("becomeFarmerCancelBtn");
const paymentBox = document.getElementById("paymentBox");
const paymentPrice = document.getElementById("paymentPrice");
const paymentFinishBtn = document.getElementById("paymentFinishBtn");
const paymentBackBtn = document.getElementById("paymentBackBtn");
const copyAccountBtn = document.getElementById("copyAccountBtn");
const copyAccountBtnLabel = copyAccountBtn.querySelector(".copy-btn-label");
const bankAccountNumber = document.getElementById("bankAccountNumber");

const BRONZE_FARMER_PRICE = 15000;
const BRONZE_FARMER_DISCOUNT_CODE = "TeamBo";
const BRONZE_FARMER_DISCOUNT_PRICE = 10000;
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
const multiplierGrid = document.getElementById("multiplierGrid");
const durationField = document.getElementById("durationField");
const durationGrid = document.getElementById("durationGrid");
const eaDetailPrice = document.getElementById("eaDetailPrice");
const eaSubscribeForm = document.getElementById("eaSubscribeForm");
const portNumberInput = document.getElementById("portNumber");
const eaDetailBackBtn = document.getElementById("eaDetailBackBtn");
const paymentEaRow = document.getElementById("paymentEaRow");
const paymentEaName = document.getElementById("paymentEaName");
const paymentMultiplierRow = document.getElementById("paymentMultiplierRow");
const paymentMultiplierValue = document.getElementById("paymentMultiplierValue");
const paymentDurationRow = document.getElementById("paymentDurationRow");
const paymentDurationValue = document.getElementById("paymentDurationValue");
const viewSubscriptionsBtn = document.getElementById("viewSubscriptionsBtn");
const mySubscriptionsBox = document.getElementById("mySubscriptionsBox");
const subscriptionsTableBody = document.getElementById("subscriptionsTableBody");
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

let lineProfile = null;
let lastRegisteredMember = null;
// The LINE user ID backing the currently shown dashboard - either from the
// live LIFF profile, or (for email/password sign-in) the ID stored on the
// member's row when they originally registered through LINE.
let currentLineUserId = null;
// The tier text last applied via applyTier_ - lets other flows (like the
// Subscription EA free-trial limit check) know the member's tier without
// re-fetching it.
let currentTier = "Non Member";
// Members sheet column I - 0/blank = free trial still available, 1 = already used.
// Drives both the "Get Free Trials"/"Subscription EA" button label and
// whether the EA detail page shows "Free" instead of a real price.
let currentFreeTrialsStatus = 0;
// Email pending a first-time password while setPasswordBox is shown.
let pendingSetPasswordEmail = null;
// { couponCode, price } captured on the Become a Farmer form, used once the
// Payment page's Finish button is pressed.
let pendingFarmerOrder = null;
// { ea, port, lotMultiplier, price } captured on the EA detail page, used
// once the Payment page's Finish button is pressed.
let pendingSubscriptionOrder = null;
// Which flow the Payment page's Finish/Back buttons should act on -
// "becomeFarmer" or "subscription".
let paymentFlow = null;
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

// Also used after the Payment page's Finish button, when there's no fresh
// member object to re-fetch - just the new tier state to reflect.
function applyTier_(tier) {
  currentTier = tier;
  dbTier.textContent = tier;
  dbTier.classList.toggle("tier-bronze", tier === "Bronze Farmer");
  dbTier.classList.toggle("tier-pending", tier === "Awaiting payment confirmation.");
  becomeFarmerBtn.classList.toggle("hidden", tier !== "Non Member");
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
  applyTier_(member.tier || "Non Member");
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
      tier: "Non Member",
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
    profitValue.textContent = formatProfitPerMonth_(ea.profitPerMonth);
    profitStat.appendChild(profitValue);

    stats.append(maxDDStat, profitStat);

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

function formatProfitPerMonth_(value) {
  if (value === undefined || value === null || value === "") return "-";
  const num = Number(value);
  return "$" + (isNaN(num) ? value : num.toLocaleString());
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
  eaDetailProfit.textContent = formatProfitPerMonth_(ea.profitPerMonth);
  eaDetailPrice.textContent = "-";

  // Non-member free trials are limited to 1 month, so there's nothing to pick.
  durationField.classList.toggle("hidden", isFreeTrialSubscription);
  if (isFreeTrialSubscription) {
    selectedDuration = DURATION_TIERS[0];
  }

  eaSubscribeForm.reset();
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
  if (isFreeTrialSubscription) {
    eaDetailPrice.textContent = selectedMultiplier ? "Free" : "-";
    return;
  }

  if (!selectedMultiplier || !selectedDuration) {
    eaDetailPrice.textContent = "-";
    return;
  }

  const total = computeDurationPrice_(selectedMultiplier.price, selectedDuration.months);
  eaDetailPrice.textContent = Math.round(total).toLocaleString() + "฿";
}

becomeFarmerBtn.addEventListener("click", () => {
  resultMsg.classList.add("hidden");
  dashboardBox.classList.add("hidden");
  becomeFarmerForm.reset();
  becomeFarmerBox.classList.remove("hidden");
});

becomeFarmerCancelBtn.addEventListener("click", () => {
  becomeFarmerBox.classList.add("hidden");
  dashboardBox.classList.remove("hidden");
});

becomeFarmerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const couponCode = couponCodeInput.value.trim();
  const price = couponCode === BRONZE_FARMER_DISCOUNT_CODE
    ? BRONZE_FARMER_DISCOUNT_PRICE
    : BRONZE_FARMER_PRICE;

  pendingFarmerOrder = { couponCode, price };
  paymentFlow = "becomeFarmer";
  paymentEaRow.classList.add("hidden");
  paymentMultiplierRow.classList.add("hidden");
  paymentDurationRow.classList.add("hidden");
  paymentPrice.textContent = price.toLocaleString() + "฿";

  becomeFarmerBox.classList.add("hidden");
  paymentBox.classList.remove("hidden");
});

copyAccountBtn.addEventListener("click", async () => {
  const accountNumber = bankAccountNumber.textContent.trim();

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(accountNumber);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = accountNumber;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

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

  if (paymentFlow === "subscription") {
    pendingSubscriptionOrder = null;
    eaDetailBox.classList.remove("hidden");
  } else {
    pendingFarmerOrder = null;
    becomeFarmerBox.classList.remove("hidden");
  }

  paymentFlow = null;
});

paymentFinishBtn.addEventListener("click", async () => {
  if (paymentFlow === "subscription" && !pendingSubscriptionOrder) return;
  if (paymentFlow === "becomeFarmer" && !pendingFarmerOrder) return;
  if (!paymentFlow) return;

  paymentFinishBtn.disabled = true;
  paymentFinishBtn.textContent = "Submitting...";

  try {
    if (paymentFlow === "subscription") {
      // Fire-and-forget POST, same no-cors reasoning as registration.
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
        }),
      });

      if (pendingSubscriptionOrder.isFreeTrial) {
        currentFreeTrialsStatus = 1;
        updateSubscribeBtnLabel_();
      }

      pendingSubscriptionOrder = null;

      paymentBox.classList.add("hidden");
      dashboardBox.classList.remove("hidden");
      showResult("Subscription confirmed!", "success");
    } else {
      await fetch(GAS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          type: "becomeFarmer",
          lineUserId: currentLineUserId || "",
          couponCode: pendingFarmerOrder.couponCode,
          price: pendingFarmerOrder.price,
        }),
      });

      applyTier_("Awaiting payment confirmation.");
      pendingFarmerOrder = null;

      paymentBox.classList.add("hidden");
      dashboardBox.classList.remove("hidden");
      showResult("Thank you! We'll confirm your payment shortly.", "success");
    }
  } catch (err) {
    console.error("Payment submit failed", err);
    showResult("Network error. Please check your connection and try again.", "error");
  } finally {
    paymentFinishBtn.disabled = false;
    paymentFinishBtn.textContent = "Finish";
    paymentFlow = null;
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

  const finalPrice = isFreeTrialSubscription
    ? 0
    : Math.round(computeDurationPrice_(selectedMultiplier.price, selectedDuration.months));

  pendingSubscriptionOrder = {
    ea: selectedEA.name,
    port,
    lotMultiplier: selectedMultiplier.key,
    durationMonths: selectedDuration.months,
    price: finalPrice,
    isFreeTrial: isFreeTrialSubscription,
  };

  paymentFlow = "subscription";
  paymentEaName.textContent = selectedEA.name;
  paymentMultiplierValue.textContent = selectedMultiplier.key;
  paymentDurationValue.textContent = selectedDuration.label;
  paymentEaRow.classList.remove("hidden");
  paymentMultiplierRow.classList.remove("hidden");
  paymentDurationRow.classList.remove("hidden");
  paymentPrice.textContent = isFreeTrialSubscription ? "Free" : finalPrice.toLocaleString() + "฿";

  eaDetailBox.classList.add("hidden");
  paymentBox.classList.remove("hidden");
});

function formatDate_(value) {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

async function loadMySubscriptions() {
  subscriptionsTableBody.innerHTML = "";
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
      const tr = document.createElement("tr");

      const eaTd = document.createElement("td");
      eaTd.textContent = sub.ea || "-";

      const portTd = document.createElement("td");
      portTd.textContent = sub.port || "-";

      const startTd = document.createElement("td");
      startTd.textContent = formatDate_(sub.startDate);

      const endTd = document.createElement("td");
      endTd.textContent = formatDate_(sub.endDate);

      tr.append(eaTd, portTd, startTd, endTd);
      subscriptionsTableBody.appendChild(tr);
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
