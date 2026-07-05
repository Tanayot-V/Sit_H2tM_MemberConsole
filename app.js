// LIFF_ID / GAS_WEB_APP_URL live in config.js (gitignored, see config.example.js)
const { LIFF_ID, GAS_WEB_APP_URL } = window.APP_CONFIG;

const liffLoading = document.getElementById("liffLoading");
const profileBox = document.getElementById("profileBox");
const profilePic = document.getElementById("profilePic");
const profileName = document.getElementById("profileName");
const registerForm = document.getElementById("registerForm");
const submitBtn = document.getElementById("submitBtn");
const resultMsg = document.getElementById("resultMsg");

let lineProfile = null;

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

    liffLoading.classList.add("hidden");
    registerForm.classList.remove("hidden");
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
  } catch (err) {
    console.error("Submit failed", err);
    showResult("Network error. Please check your connection and try again.", "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Register";
  }
});

initLiff();
