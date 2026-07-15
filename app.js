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

const BRONZE_FARMER_PRICE = 15000;
const BRONZE_FARMER_DISCOUNT_CODE = "TeamBo";
const BRONZE_FARMER_DISCOUNT_PRICE = 10000;
const viewDashboardBtn = document.getElementById("viewDashboardBtn");
const subscribeBtn = document.getElementById("subscribeBtn");
const subscriptionBox = document.getElementById("subscriptionBox");
const subscriptionForm = document.getElementById("subscriptionForm");
const eaSelect = document.getElementById("eaSelect");
const portNumberInput = document.getElementById("portNumber");
const subscribeSubmitBtn = document.getElementById("subscribeSubmitBtn");
const subscribeCancelBtn = document.getElementById("subscribeCancelBtn");
const subscriptionLimitBox = document.getElementById("subscriptionLimitBox");
const subscriptionBecomeFarmerBtn = document.getElementById("subscriptionBecomeFarmerBtn");
const subscriptionLimitBackBtn = document.getElementById("subscriptionLimitBackBtn");
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
// Email pending a first-time password while setPasswordBox is shown.
let pendingSetPasswordEmail = null;
// { couponCode, price } captured on the Become a Farmer form, used once the
// Payment page's Finish button is pressed.
let pendingFarmerOrder = null;

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
  subscribeBtn.textContent = tier === "Non Member" ? "Get Free Trials" : "Subscription EA";
}

function showDashboard(member) {
  joinSubtitle.classList.add("hidden");
  currentLineUserId = member.lineUserId || (lineProfile && lineProfile.userId) || "";
  dbFullname.textContent = member.fullname || "-";
  dbPhone.textContent = member.phone || "-";
  dbEmail.textContent = member.email || "-";
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

// Populates the EA dropdown from the "ExpertAdvisor" sheet (JSONP, same
// no-CORS reasoning as the registration lookup).
async function loadEAOptions() {
  eaSelect.innerHTML = '<option value="" disabled selected>Loading EAs...</option>';
  eaSelect.disabled = true;

  try {
    const res = await jsonp(`${GAS_WEB_APP_URL}?action=listEA`);
    const eaList = (res && res.eaList) || [];

    eaSelect.innerHTML = '<option value="" disabled selected>Select an EA</option>';
    eaList.forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      eaSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Failed to load EA list", err);
    eaSelect.innerHTML = '<option value="" disabled selected>Failed to load EAs</option>';
  } finally {
    eaSelect.disabled = false;
  }
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
  paymentPrice.textContent = price.toLocaleString() + "฿";

  becomeFarmerBox.classList.add("hidden");
  paymentBox.classList.remove("hidden");
});

paymentBackBtn.addEventListener("click", () => {
  pendingFarmerOrder = null;
  paymentBox.classList.add("hidden");
  becomeFarmerBox.classList.remove("hidden");
});

paymentFinishBtn.addEventListener("click", async () => {
  if (!pendingFarmerOrder) return;

  paymentFinishBtn.disabled = true;
  paymentFinishBtn.textContent = "Submitting...";

  try {
    // Fire-and-forget POST, same no-cors reasoning as registration/subscription.
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
  } catch (err) {
    console.error("Become Farmer submit failed", err);
    showResult("Network error. Please check your connection and try again.", "error");
  } finally {
    paymentFinishBtn.disabled = false;
    paymentFinishBtn.textContent = "Finish";
  }
});

subscribeBtn.addEventListener("click", async () => {
  resultMsg.classList.add("hidden");
  dashboardBox.classList.add("hidden");
  subscriptionBox.classList.remove("hidden");
  subscriptionForm.classList.add("hidden");
  subscriptionLimitBox.classList.add("hidden");

  // Non-members get a single free EA trial. If they've already used it,
  // block a second subscription and push them toward Become a Farmer instead.
  if (currentTier === "Non Member") {
    let hasSubscription = false;
    try {
      const res = await jsonp(
        `${GAS_WEB_APP_URL}?action=listSubscriptions&lineUserId=${encodeURIComponent(currentLineUserId || "")}`
      );
      hasSubscription = ((res && res.subscriptions) || []).length > 0;
    } catch (err) {
      console.error("Failed to check existing subscriptions", err);
    }

    if (hasSubscription) {
      subscriptionLimitBox.classList.remove("hidden");
      return;
    }
  }

  subscriptionForm.classList.remove("hidden");
  subscriptionForm.reset();
  loadEAOptions();
});

subscribeCancelBtn.addEventListener("click", () => {
  subscriptionBox.classList.add("hidden");
  dashboardBox.classList.remove("hidden");
});

subscriptionLimitBackBtn.addEventListener("click", () => {
  subscriptionBox.classList.add("hidden");
  dashboardBox.classList.remove("hidden");
});

subscriptionBecomeFarmerBtn.addEventListener("click", () => {
  subscriptionBox.classList.add("hidden");
  becomeFarmerForm.reset();
  becomeFarmerBox.classList.remove("hidden");
});

subscriptionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultMsg.classList.add("hidden");

  const ea = eaSelect.value;
  const port = portNumberInput.value.trim();

  if (!ea || !port) {
    showResult("Please select an EA and enter a port number.", "error");
    return;
  }

  const payload = {
    type: "subscription",
    lineUserId: currentLineUserId || "",
    ea,
    port,
  };

  subscribeSubmitBtn.disabled = true;
  subscribeSubmitBtn.textContent = "Submitting...";

  try {
    // Same fire-and-forget no-cors POST as registration (see submit handler
    // above) - Apps Script's response can't be read cross-origin regardless.
    await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    subscriptionBox.classList.add("hidden");
    dashboardBox.classList.remove("hidden");
    showResult("Subscription confirmed!", "success");
  } catch (err) {
    console.error("Subscription submit failed", err);
    showResult("Network error. Please check your connection and try again.", "error");
  } finally {
    subscribeSubmitBtn.disabled = false;
    subscribeSubmitBtn.textContent = "Confirm Subscription";
  }
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
