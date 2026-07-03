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

    const isReady = hasFormFields();

    const btn = document.createElement("button");
    btn.id = "smart-nid-autofill-btn";

    // Nepal Flag / Smart NID Logo SVG
    const logoSvg = `
      <svg width="24" height="24" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2)); flex-shrink: 0; margin-right: ${isReady ? '8px' : '0'}">
        <path d="M10 10 L90 50 L35 55 L90 100 L10 105 Z" fill="#DC143C" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>
        <circle cx="30" cy="40" r="8" fill="white" />
        <path d="M22 40 Q30 32 38 40" stroke="white" stroke-width="3" fill="none"/>
        <path d="M30 80 L22 88 L38 88 Z" fill="white"/>
        <circle cx="30" cy="92" r="8" fill="white" />
      </svg>
    `;

    // Styling the floating button (Initial Logo State vs Ready State)
    Object.assign(btn.style, {
      position: "fixed",
      bottom: "40px",
      right: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: isReady ? "14px 28px" : "18px",
      backgroundColor: isReady ? "#28a745" : "#003893",
      color: "white",
      border: isReady ? "2px solid #fff" : "3px solid #fff",
      borderRadius: "50px",
      fontSize: "17px",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow: isReady ? "0 10px 30px rgba(40, 167, 69, 0.4)" : "0 10px 25px rgba(0, 56, 147, 0.4)",
      zIndex: "999999",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      fontFamily: "sans-serif",
      whiteSpace: "nowrap",
      overflow: "hidden"
    });

    btn.innerHTML = isReady 
      ? `${logoSvg} <span>✨ Auto-Fill Form</span>`
      : `${logoSvg}`;

    if (!isReady) {
      // Add a subtle pulse animation when waiting (using standard DOM animate)
      try {
        btn.animate([
          { transform: 'scale(1)', boxShadow: '0 10px 25px rgba(0, 56, 147, 0.4)' },
          { transform: 'scale(1.08)', boxShadow: '0 15px 35px rgba(0, 56, 147, 0.6)' },
          { transform: 'scale(1)', boxShadow: '0 10px 25px rgba(0, 56, 147, 0.4)' }
        ], { duration: 2500, iterations: Infinity });
      } catch (e) { /* fallback for older browsers */ }
    }

    // Tooltip/Status Badge
    const statusBadge = document.createElement("div");
    statusBadge.id = "smart-nid-status";
    Object.assign(statusBadge.style, {
      position: "fixed",
      bottom: "100px",
      right: "40px",
      padding: "12px 20px",
      backgroundColor: "#1e293b",
      color: "white",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "600",
      zIndex: "999998",
      fontFamily: "sans-serif",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      transition: "all 0.3s ease",
      opacity: "0",
      transform: "translateY(10px)",
      pointerEvents: "none",
      maxWidth: "280px",
      lineHeight: "1.4"
    });
    
    // Set initial text for tooltip
    if (isReady) {
      statusBadge.innerHTML = "✅ <b>Ready!</b> Click to auto-fill your form.";
      statusBadge.style.backgroundColor = "#28a745";
    } else {
      statusBadge.innerHTML = "⏳ <b>Action Required:</b> Complete OTP and click <i>New Enrollment</i> to unlock Auto-Fill.";
      statusBadge.style.backgroundColor = "#1e293b";
    }

    btn.onmouseover = () => {
      btn.style.transform = "scale(1.08) translateY(-5px)";
      statusBadge.style.opacity = "1";
      statusBadge.style.transform = "translateY(0)";
    };
    btn.onmouseout = () => {
      btn.style.transform = "scale(1) translateY(0)";
      statusBadge.style.opacity = "0";
      statusBadge.style.transform = "translateY(10px)";
    };

    btn.onclick = () => {
      if (!hasFormFields()) {
        // User clicked the logo before reaching the form
        statusBadge.style.opacity = "1";
        statusBadge.style.transform = "translateY(0)";
        statusBadge.innerHTML = "⚠️ <b>Not on form page!</b> Navigate to <i>New Enrollment</i> first.";
        statusBadge.style.backgroundColor = "#dc3545";
        
        // Shake animation
        try {
          btn.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
          ], { duration: 400 });
        } catch(e){}

        setTimeout(() => {
          statusBadge.style.opacity = "0";
          setTimeout(() => {
            statusBadge.innerHTML = "⏳ <b>Action Required:</b> Complete OTP and click <i>New Enrollment</i> to unlock Auto-Fill.";
            statusBadge.style.backgroundColor = "#1e293b";
          }, 300);
        }, 3000);
        return;
      }

      try {
        // Inject the script into the page context
        const scriptEl = document.createElement("script");
        scriptEl.textContent = scriptContent;
        (document.head || document.documentElement).appendChild(scriptEl);
        scriptEl.remove();

        // Clear storage so the button doesn't keep appearing on future visits
        chrome.storage.local.remove(["autoFillScript", "draftData"]);

        // Update button to success state
        btn.innerHTML = "✅ Filled!";
        btn.style.backgroundColor = "#28a745";
        btn.style.border = "2px solid #fff";
        btn.style.boxShadow = "0 10px 25px rgba(40, 167, 69, 0.4)";
        btn.style.cursor = "default";
        btn.onclick = null;
        btn.onmouseover = null;
        btn.onmouseout = null;

        // Update status badge
        statusBadge.innerHTML = "✅ All fields filled! Please review before submitting.";
        statusBadge.style.backgroundColor = "#28a745";
        statusBadge.style.opacity = "1";
        statusBadge.style.transform = "translateY(0)";

        // Fade out after 5 seconds
        setTimeout(() => {
          btn.style.opacity = "0";
          statusBadge.style.opacity = "0";
          setTimeout(() => container.remove(), 300);
        }, 5000);
      } catch (err) {
        console.error("Smart NID: Script injection error —", err);
        btn.innerHTML = "❌ Error";
        btn.style.backgroundColor = "#dc3545";
        statusBadge.innerHTML = "❌ Injection failed. Try refreshing the page.";
        statusBadge.style.backgroundColor = "#dc3545";
        statusBadge.style.opacity = "1";
        statusBadge.style.transform = "translateY(0)";

        setTimeout(() => {
          btn.innerHTML = `${logoSvg} <span>✨ Auto-Fill Form</span>`;
          btn.style.backgroundColor = "#28a745";
          statusBadge.style.opacity = "0";
        }, 3000);
      }
    };

    container.appendChild(statusBadge);
    container.appendChild(btn);
    document.body.appendChild(container);

    // Periodically check if the user navigated to the form page via SPA navigation
    const statusInterval = setInterval(() => {
      const currentBtn = document.getElementById("smart-nid-autofill-btn");
      if (!currentBtn) {
        clearInterval(statusInterval);
        return;
      }
      
      const formReady = hasFormFields();
      
      if (formReady && currentBtn.style.backgroundColor !== "rgb(40, 167, 69)") { // #28a745
        // Transition to Ready state
        currentBtn.style.backgroundColor = "#28a745";
        currentBtn.style.border = "2px solid #fff";
        currentBtn.style.padding = "14px 28px";
        currentBtn.style.boxShadow = "0 10px 30px rgba(40, 167, 69, 0.4)";
        
        // Re-inject SVG with margin
        const svgReady = `
          <svg width="24" height="24" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2)); flex-shrink: 0; margin-right: 8px;">
            <path d="M10 10 L90 50 L35 55 L90 100 L10 105 Z" fill="#DC143C" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>
            <circle cx="30" cy="40" r="8" fill="white" />
            <path d="M22 40 Q30 32 38 40" stroke="white" stroke-width="3" fill="none"/>
            <path d="M30 80 L22 88 L38 88 Z" fill="white"/>
            <circle cx="30" cy="92" r="8" fill="white" />
          </svg>
        `;
        currentBtn.innerHTML = `${svgReady} <span>✨ Auto-Fill Form</span>`;
        
        statusBadge.innerHTML = "✅ <b>Ready!</b> Click to auto-fill your form.";
        statusBadge.style.backgroundColor = "#28a745";
        
        // Cancel pulse animation
        currentBtn.getAnimations().forEach(anim => anim.cancel());
      }
    }, 1500);
  }

  // ── Run ──
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkAndInject);
  } else {
    checkAndInject();
  }
})();
