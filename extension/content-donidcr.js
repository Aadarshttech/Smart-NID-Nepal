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

    chrome.storage.local.get(["savedProfiles", "activeProfileId"], (result) => {
      if (chrome.runtime.lastError) {
        console.warn("Smart NID: Storage access error —", chrome.runtime.lastError.message);
        return;
      }

      const profiles = result.savedProfiles || [];
      const activeProfile = profiles.find(p => p.id === result.activeProfileId);
      
      if (activeProfile && (activeProfile.autoFillScript || activeProfile.autoFillInstructions)) {
        injectFloatingButton(activeProfile.autoFillInstructions, activeProfile.autoFillScript);
      }
    });
  }

  // ── Inject the floating auto-fill button ──
  function injectFloatingButton(instructions, fallbackScript) {
    // Prevent multiple injections
    if (document.getElementById("smart-nid-autofill-btn")) return;

    // Wait for document.body to exist
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => injectFloatingButton(instructions, fallbackScript));
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
      <img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Flag_of_Nepal.svg" alt="Nepal Flag" style="width: 24px; height: 28px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2)); flex-shrink: 0; margin-right: ${isReady ? '8px' : '0'}; object-fit: contain;">
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
      ? `${logoSvg} <span>Auto-Fill Form</span>`
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

      // Fetch latest data dynamically when clicked
      chrome.storage.local.get(["savedProfiles", "activeProfileId"], async (result) => {
        const profiles = result.savedProfiles || [];
        const activeProfile = profiles.find(p => p.id === result.activeProfileId);
        
        if (!activeProfile) {
          btn.innerHTML = "❌ No Profile Selected";
          setTimeout(() => { btn.innerHTML = `${logoSvg} <span>Auto-Fill Form</span>`; }, 2000);
          return;
        }

        const instructions = activeProfile.autoFillInstructions;
        const fallbackScript = activeProfile.autoFillScript;

        try {
          let result = null;
          if (instructions) {
            // Check if this is an old profile (pre-v1.1) by seeing if it lacks pProvince
            const isOldProfile = !instructions.some(i => i.id === 'pProvince');

            const processInstructions = async () => {
              let filledCount = 0;
              let skippedCount = 0;

              for (const inst of instructions) {
                if (!inst.value && !inst.textValue) continue;

                const el = document.getElementById(inst.id);
                if (!el) {
                  skippedCount++;
                  console.warn('Smart NID: Field not found (likely on another tab):', inst.id);
                  continue;
                }

                if (inst.type === 'text' || inst.type === 'date') {
                  el.dispatchEvent(new Event('focus', { bubbles: true }));
                  
                  // Check if this is a nepalify field — these have special JS that
                  // processes keystrokes and validates Nepali dates. Direct .value 
                  // setting bypasses this and causes validation errors.
                  const isNepalifyField = el.classList.contains('nepalify') || el.classList.contains('nepaliDate');
                  
                  if (isNepalifyField) {
                    // For nepalify fields, set value directly with Devanagari digits
                    // (the generateAutoFill already sends Devanagari), then simulate
                    // the complete event lifecycle so the portal's validation runs.
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                    if (nativeInputValueSetter) {
                      nativeInputValueSetter.call(el, inst.value);
                    } else {
                      el.value = inst.value;
                    }
                    
                    // Simulate typing events for the last character to trigger nepalify processing
                    const lastChar = inst.value.slice(-1) || '';
                    el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: lastChar, code: 'Digit0' }));
                    el.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: lastChar, code: 'Digit0' }));
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: lastChar, code: 'Digit0' }));
                    
                    // Small delay for nepalify processing
                    await new Promise(r => setTimeout(r, 80));
                  } else {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                    if (nativeInputValueSetter) {
                      nativeInputValueSetter.call(el, inst.value);
                    } else {
                      el.value = inst.value;
                    }
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter', code: 'Enter' }));
                  }
                  
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                  el.dispatchEvent(new Event('blur', { bubbles: true }));
                  filledCount++;
                } else if (inst.type === 'select') {
                  // Wait for options to populate (for cascading dropdowns like VDC)
                  let attempts = 0;
                  while (el.options.length <= 1 && attempts < 10) {
                    await new Promise(r => setTimeout(r, 200));
                    attempts++;
                  }

                  let matched = false;
                  // Try to match by value first
                  if (inst.value) {
                    for (let i = 0; i < el.options.length; i++) {
                      if (el.options[i].value === inst.value) {
                        el.value = inst.value;
                        matched = true;
                        break;
                      }
                    }
                  }
                  
                  // If not matched by value, try to match by text content
                  if (!matched && inst.textValue) {
                    const normalized = inst.textValue.toLowerCase().trim();
                    for (let i = 0; i < el.options.length; i++) {
                      if (el.options[i].text.toLowerCase().includes(normalized)) {
                        el.value = el.options[i].value;
                        matched = true;
                        break;
                      }
                    }
                  }
                  
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                  filledCount++;
                }

                // Small delay to allow framework state updates before next field
                await new Promise(r => setTimeout(r, 50));
              }

              // Dynamically inject missing province data for old profiles
              if (isOldProfile) {
                const pDistInst = instructions.find(i => i.id === 'pDistrict');
                const tDistInst = instructions.find(i => i.id === 'tDistrict');
                
                const getProv = (d) => {
                  const n = parseInt(d, 10);
                  if (isNaN(n)) return "";
                  if (n >= 1 && n <= 14) return "1";
                  if (n >= 15 && n <= 22) return "2";
                  if (n >= 23 && n <= 35) return "3";
                  if (n >= 36 && n <= 46) return "4";
                  if (n >= 47 && n <= 58) return "5";
                  if (n >= 59 && n <= 68) return "6";
                  if (n >= 69 && n <= 77) return "7";
                  return "";
                };

                if (pDistInst && pDistInst.value) {
                  const pProv = getProv(pDistInst.value);
                  if (pProv) {
                    const pEl = document.getElementById('pProvince');
                    if (pEl) { pEl.value = pProv; pEl.dispatchEvent(new Event('change', { bubbles: true })); }
                  }
                }
                if (tDistInst && tDistInst.value) {
                  const tProv = getProv(tDistInst.value);
                  if (tProv) {
                    const tEl = document.getElementById('tProvince');
                    if (tEl) { tEl.value = tProv; tEl.dispatchEvent(new Event('change', { bubbles: true })); }
                  }
                }
              }
              
              // Return counts for status reporting
              return { filledCount, skippedCount };
            };

            // Wait for the async process to complete before updating status
            result = await processInstructions();

          } else if (fallbackScript) {
            // Fallback to inline script injection for older versions
            const scriptEl = document.createElement("script");
            scriptEl.textContent = fallbackScript;
            (document.head || document.documentElement).appendChild(scriptEl);
            scriptEl.remove();
          }

        // Do NOT clear storage here. DoNIDCR has multiple tabs (Applicant, Contact, Family)
        // that load lazily. The user needs to click the auto-fill button on each tab.
        // chrome.storage.local.remove(["autoFillScript", "draftData", "autoFillInstructions"]);

        // Update button to success state momentarily
        const originalHtml = btn.innerHTML;
        btn.style.backgroundColor = "#28a745";
        btn.style.border = "2px solid #fff";
        btn.style.boxShadow = "0 10px 25px rgba(40, 167, 69, 0.4)";
        
        // Update status badge with contextual message based on fill results
        const filled = (typeof result === 'object' && result) ? result.filledCount : 0;
        const skipped = (typeof result === 'object' && result) ? result.skippedCount : 0;
        
        if (filled > 0 && skipped > 0) {
          btn.innerHTML = `✅ Filled ${filled} fields!`;
          statusBadge.innerHTML = `✅ <b>${filled} fields filled!</b> ${skipped} fields are on other tabs — navigate there and click Auto-Fill again.`;
        } else if (filled > 0) {
          btn.innerHTML = "✅ All Filled!";
          statusBadge.innerHTML = "✅ <b>All fields on this tab filled!</b> Check the next tab.";
        } else {
          btn.innerHTML = "⚠️ No Fields Found";
          statusBadge.innerHTML = "⚠️ No fillable fields found on this tab. Navigate to the correct tab first.";
          statusBadge.style.backgroundColor = "#f59e0b";
        }
        
        if (filled > 0) statusBadge.style.backgroundColor = "#28a745";
        statusBadge.style.opacity = "1";
        statusBadge.style.transform = "translateY(0)";

        // Revert back to ready state after 3 seconds so they can use it on the next tab
        setTimeout(() => {
          btn.innerHTML = originalHtml;
          statusBadge.style.opacity = "0";
        }, 3000);
      } catch (err) {
          console.error("Smart NID: Script injection error —", err);
          btn.innerHTML = "❌ Error";
          btn.style.backgroundColor = "#dc3545";
          statusBadge.innerHTML = "❌ Injection failed. Try refreshing the page.";
          statusBadge.style.backgroundColor = "#dc3545";
          statusBadge.style.opacity = "1";
          statusBadge.style.transform = "translateY(0)";

          setTimeout(() => {
            btn.innerHTML = `${logoSvg} <span>Auto-Fill Form</span>`;
            btn.style.backgroundColor = "#28a745";
            statusBadge.style.opacity = "0";
          }, 3000);
        }
      });
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
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Flag_of_Nepal.svg" alt="Nepal Flag" style="width: 24px; height: 28px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2)); flex-shrink: 0; margin-right: 8px; object-fit: contain;">
        `;
        currentBtn.innerHTML = `${svgReady} <span>Auto-Fill Form</span>`;
        
        statusBadge.innerHTML = "✅ <b>Ready!</b> Click to auto-fill your form.";
        statusBadge.style.backgroundColor = "#28a745";
        
        // Cancel pulse animation
        currentBtn.getAnimations().forEach(anim => anim.cancel());
      }
    }, 1500);
  }

  // ── Run ──
  // Use a continuous interval to handle SPA navigation and lazy-loaded tabs.
  // This ensures the button stays alive or gets re-injected if the DOM changes.
  function startChecks() {
    checkAndInject();
    setInterval(checkAndInject, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startChecks);
  } else {
    startChecks();
  }
})();
