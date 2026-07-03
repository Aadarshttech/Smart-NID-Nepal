/**
 * Smart NID Helper — Content Script for the DoNIDCR Portal
 * Runs on: *://enrollment.donidcr.gov.np/*
 *
 * Checks chrome.storage for a pending auto-fill script and injects a
 * floating "Auto-Fill Form" button when found.
 *
 * Fixes:
 * - Skips injection on error pages (500, 404, etc.)
 * - Skips pages that don't have a real form (landing, login, OTP pages)
 * - Retries storage check periodically (handles SPA-like navigation)
 * - Robust DOM safety checks
 */

(function () {
  "use strict";

  // ── Guard: Don't run on error pages ──
  function isErrorPage() {
    const bodyText = (document.body && document.body.innerText) || "";
    const title = document.title || "";

    // Check for common ASP.NET error indicators
    if (/Status\s*Code\s*:\s*(4\d\d|5\d\d)/i.test(bodyText)) return true;
    if (/Error\s*Details/i.test(bodyText) && /Status\s*Code/i.test(bodyText)) return true;
    if (/Server\s*Error/i.test(title)) return true;
    if (/Runtime\s*Error/i.test(title)) return true;
    if (document.querySelector(".error-page, .server-error, #error-page")) return true;

    return false;
  }

  // ── Guard: Check if page has a form we can fill ──
  function hasFormFields() {
    // Look for typical DoNIDCR form input IDs
    const knownFields = [
      "firstNameLoc", "firstName", "lastNameLoc", "lastName",
      "dobLoc", "dob", "ccNumberLoc", "gender",
      "mobileNo", "fFnLoc", "fFn", "mFnLoc", "mFn"
    ];

    for (const id of knownFields) {
      if (document.getElementById(id)) return true;
    }

    // Fallback: check if there are a reasonable number of input fields
    const inputs = document.querySelectorAll("input[type='text'], select, input[type='date']");
    return inputs.length >= 5;
  }

  // ── Main: Check storage and inject button ──
  function checkAndInject() {
    // Skip error pages entirely
    if (isErrorPage()) {
      console.log("Smart NID: Skipping error page.");
      return;
    }

    chrome.storage.local.get(["autoFillScript"], (result) => {
      if (chrome.runtime.lastError) {
        console.warn("Smart NID: Storage access error —", chrome.runtime.lastError.message);
        return;
      }

      if (!result.autoFillScript) {
        return; // No pending script — nothing to do
      }

      // Always show the floating button if we have a script, even if we can't
      // detect form fields yet (user might be on the mobile number / OTP page
      // and will navigate to the form page)
      injectFloatingButton(result.autoFillScript);
    });
  }

  // ── Inject the floating auto-fill button ──
  function injectFloatingButton(scriptContent) {
    // Prevent multiple injections
    if (document.getElementById("smart-nid-autofill-btn")) return;

    // Wait for document.body to exist
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => injectFloatingButton(scriptContent));
      return;
    }

    // Create container for scoped styles
    const container = document.createElement("div");
    container.id = "smart-nid-container";

    const btn = document.createElement("button");
    btn.id = "smart-nid-autofill-btn";
    btn.innerHTML = "✨ Auto-Fill Form ✨";

    // Styling the floating button
    Object.assign(btn.style, {
      position: "fixed",
      bottom: "40px",
      right: "40px",
      padding: "16px 28px",
      backgroundColor: "#003893",
      color: "white",
      border: "none",
      borderRadius: "50px",
      fontSize: "18px",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow: "0 10px 25px rgba(0, 56, 147, 0.4)",
      zIndex: "999999",
      transition: "all 0.2s ease-in-out",
      fontFamily: "sans-serif",
      lineHeight: "1.4",
      letterSpacing: "0.5px",
    });

    btn.onmouseover = () => {
      btn.style.transform = "scale(1.05) translateY(-5px)";
      btn.style.boxShadow = "0 15px 30px rgba(0, 56, 147, 0.5)";
    };
    btn.onmouseout = () => {
      btn.style.transform = "scale(1) translateY(0)";
      btn.style.boxShadow = "0 10px 25px rgba(0, 56, 147, 0.4)";
    };

    // Status indicator (shows whether form is ready)
    const statusBadge = document.createElement("div");
    statusBadge.id = "smart-nid-status";
    Object.assign(statusBadge.style, {
      position: "fixed",
      bottom: "100px",
      right: "40px",
      padding: "8px 16px",
      backgroundColor: hasFormFields() ? "#28a745" : "#f59e0b",
      color: "white",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      zIndex: "999999",
      fontFamily: "sans-serif",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      transition: "all 0.3s ease",
    });
    statusBadge.textContent = hasFormFields()
      ? "✅ Form detected — ready to fill"
      : "⏳ Navigate to the enrollment form first";

    btn.onclick = () => {
      if (!hasFormFields()) {
        // Warn the user if no form is detected
        statusBadge.textContent = "⚠️ No form found on this page. Please navigate to the enrollment form.";
        statusBadge.style.backgroundColor = "#dc3545";
        setTimeout(() => {
          statusBadge.textContent = "⏳ Navigate to the enrollment form first";
          statusBadge.style.backgroundColor = "#f59e0b";
        }, 4000);
        return;
      }

      try {
        // Inject the script into the page context
        const scriptEl = document.createElement("script");
        scriptEl.textContent = scriptContent;
        (document.head || document.documentElement).appendChild(scriptEl);
        scriptEl.remove();

        // Clear storage so the button doesn't keep appearing on future visits
        chrome.storage.local.remove(["autoFillScript"]);

        // Update button to success state
        btn.innerHTML = "✅ Filled Successfully!";
        btn.style.backgroundColor = "#28a745";
        btn.style.boxShadow = "0 10px 25px rgba(40, 167, 69, 0.4)";
        btn.style.cursor = "default";
        btn.onclick = null;

        // Update status badge
        statusBadge.textContent = "✅ All fields filled! Please review before submitting.";
        statusBadge.style.backgroundColor = "#28a745";

        // Fade out after 5 seconds
        setTimeout(() => {
          btn.style.opacity = "0";
          statusBadge.style.opacity = "0";
          setTimeout(() => container.remove(), 300);
        }, 5000);
      } catch (err) {
        console.error("Smart NID: Script injection error —", err);
        btn.innerHTML = "❌ Error — Try Again";
        btn.style.backgroundColor = "#dc3545";
        statusBadge.textContent = "❌ Injection failed. Try refreshing the page.";
        statusBadge.style.backgroundColor = "#dc3545";

        setTimeout(() => {
          btn.innerHTML = "✨ Auto-Fill Form ✨";
          btn.style.backgroundColor = "#003893";
        }, 3000);
      }
    };

    container.appendChild(statusBadge);
    container.appendChild(btn);
    document.body.appendChild(container);

    // Periodically update the status badge as the user navigates
    const statusInterval = setInterval(() => {
      if (!document.getElementById("smart-nid-status")) {
        clearInterval(statusInterval);
        return;
      }
      if (hasFormFields()) {
        statusBadge.textContent = "✅ Form detected — ready to fill";
        statusBadge.style.backgroundColor = "#28a745";
      }
    }, 2000);
  }

  // ── Run ──
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkAndInject);
  } else {
    checkAndInject();
  }
})();
