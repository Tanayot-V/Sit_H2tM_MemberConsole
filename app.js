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
const dbSince = document.getElementById("dbSince");
const viewDashboardBtn = document.getElementById("viewDashboardBtn");
const subscribeBtn = document.getElementById("subscribeBtn");
const subscriptionBox = document.getElementById("subscriptionBox");
const subscriptionForm = document.getElementById("subscriptionForm");
const eaSelect = document.getElementById("eaSelect");
const portNumberInput = document.getElementById("portNumber");
const subscribeSubmitBtn = document.getElementById("subscribeSubmitBtn");
const subscribeCancelBtn = document.getElementById("subscribeCancelBtn");

let lineProfile = null;
let lastRegisteredMember = null;

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

function showDashboard(member) {
  dbFullname.textContent = member.fullname || "-";
  dbPhone.textContent = member.phone || "-";
  dbEmail.textContent = member.email || "-";
  dbSince.textContent = member.registeredAt
    ? new Date(member.registeredAt).toLocaleDateString()
    : "-";
  dashboardBox.classList.remove("hidden");
}

async function initLiff() {
  try {
    await liff.init({ liffId: LIFF_ID });

    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

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
    console.error("LIFF init failed", err);
    liffLoading.classList.add("hidden");
    showResult("Failed to connect to LINE. Please reopen this page from LINE.", "error");
  }
}

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

    lastRegisteredMember = { fullname, phone, email, registeredAt: new Date().toISOString() };
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

subscribeBtn.addEventListener("click", () => {
  resultMsg.classList.add("hidden");
  dashboardBox.classList.add("hidden");
  subscriptionBox.classList.remove("hidden");
  subscriptionForm.reset();
  loadEAOptions();
});

subscribeCancelBtn.addEventListener("click", () => {
  subscriptionBox.classList.add("hidden");
  dashboardBox.classList.remove("hidden");
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
    lineUserId: lineProfile ? lineProfile.userId : "",
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

initLiff();
