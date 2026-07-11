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

  // (Network interceptor removed for security and compliance)

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
      return;
    }

    // Auto-close the 'attention' modal on new enrollment
    const closeBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.trim() === 'Close' && b.offsetParent !== null);
    if (closeBtns.length > 0 && document.querySelector('.modal, .modal-dialog, .modal-content')) {
      closeBtns[0].click();
    }

    chrome.storage.local.get(["savedProfiles", "activeProfileId"], (result) => {
      if (chrome.runtime.lastError) {
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
    if (document.getElementById("smart-nid-avatar")) return;

    // Wait for document.body to exist
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => injectFloatingButton(instructions, fallbackScript));
      return;
    }

    // Create container for scoped styles
    const container = document.createElement("div");
    container.id = "smart-nid-container";

    const isReady = hasFormFields();

    const btn = document.createElement("div"); // Use div to prevent button focus outline
    btn.id = "smart-nid-avatar";

    // Guide Avatar Image
    const avatarUrl = chrome.runtime.getURL("icons/guide.png");
    const logoSvg = `
      <img src="${avatarUrl}" alt="Guide" style="width: auto; height: 160px; object-fit: contain; filter: drop-shadow(0px 10px 15px rgba(0,0,0,0.25)); flex-shrink: 0; pointer-events: none; margin-bottom: -15px;">
    `;

    // Styling the floating avatar
    Object.assign(btn.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      padding: "0",
      backgroundColor: "transparent",
      color: "#1e293b",
      border: "none",
      outline: "none", // Ensure no focus ring
      borderRadius: "0",
      cursor: "default", // It's no longer clickable
      boxShadow: "none",
      zIndex: "999999",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    });

    btn.innerHTML = `${logoSvg}`;

    // Create the dedicated Auto-Fill Action Button
    const actionBtn = document.createElement("button");
    actionBtn.id = "smart-nid-action-btn";
    actionBtn.innerHTML = "<span style='font-size:16px; margin-right:6px;'>✨</span> Auto-Fill";
    Object.assign(actionBtn.style, {
      position: "fixed",
      bottom: "45px", // Aligned with her waist/torso
      right: "130px", // Snug next to her left side
      padding: "12px 26px",
      background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)", // Rich red gradient
      color: "white",
      border: "2px solid rgba(255,255,255,0.9)", // Elegant white border
      borderRadius: "30px",
      fontSize: "15px",
      fontWeight: "700",
      letterSpacing: "0.5px",
      cursor: "pointer",
      boxShadow: "0 8px 25px rgba(185, 28, 28, 0.35), 0 0 0 1px rgba(0,0,0,0.05)",
      zIndex: "999999",
      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", // Bouncy hover
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      display: "flex",
      alignItems: "center"
    });

    if (!isReady) {
      // Add a subtle bounce animation to the avatar when waiting
      try {
        btn.animate([
          { transform: 'translateY(0)', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' },
          { transform: 'translateY(-8px)', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.3))' },
          { transform: 'translateY(0)', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }
        ], { duration: 2500, iterations: Infinity, easing: 'ease-in-out' });
      } catch (e) { /* fallback for older browsers */ }
    }

    // Chat Bubble (Status Badge)
    const statusBadge = document.createElement("div");
    statusBadge.id = "smart-nid-status";
    statusBadge.className = "smart-nid-status";
    
    // Check if we are restoring state on Appointment Tab
    const isPreviewTab = document.body.innerText.includes('Main Applicant Data') && document.body.innerText.includes('Appointment Details');
    const isApptTab = (document.body.innerText.includes('बायोमेट्रिक दिने स्थान') || document.body.innerText.includes('Appointment Details')) && !isPreviewTab;
    const isApptDone = sessionStorage.getItem('smart_nid_appointment_done') === 'true';
    
    // Reusable monitor function
    const startApptMonitor = () => {
      if (window.smartNidApptMonitor) clearInterval(window.smartNidApptMonitor);
      
      window.smartNidApptMonitor = setInterval(() => {
        const sb = document.getElementById('smart-nid-status');
        if (!sb) return;
        
        const text = document.body.innerText;
        const isNowPreview = text.includes('Main Applicant Data') && text.includes('Appointment Details');
        
        if (isNowPreview) {
           sb.innerHTML = "All done! 🎉<br/>Please check your details and <b>Submit</b> your form.";
           clearInterval(window.smartNidApptMonitor);
           sessionStorage.removeItem('smart_nid_appointment_done');
           return;
        }
        
        if (!text.includes('बायोमेट्रिक दिने स्थान')) return;
        const hasSlots = text.includes('Remaining quota') && text.includes('Time Slot');

        if (hasSlots) {
           sb.innerHTML = "Awesome! 📅<br/>Now pick a <b>time slot</b>. It will auto-continue!";
        } else {
           sb.innerHTML = "Location selected! 📍<br/>Please pick a <b>Date</b> from the calendar and click <b>Search</b>.";
        }
      }, 500);
    };

    if (isApptTab && isApptDone) {
      statusBadge.innerHTML = "Location selected! 📍<br/>Please pick a <b>Date</b> from the calendar and click <b>Search</b>.";
      statusBadge.style.backgroundColor = "#fffbeb"; 
      statusBadge.style.color = "#92400e";
      statusBadge.style.border = "1px solid #fcd34d";
      statusBadge.style.opacity = "1";
      statusBadge.style.visibility = "visible";
      statusBadge.style.transform = "translateY(0) scale(1)";
      
      startApptMonitor();
    }
    
    Object.assign(statusBadge.style, {
      position: "fixed",
      bottom: "185px",
      right: "20px",
      padding: "18px 22px",
      backgroundColor: "white",
      color: "#1e293b",
      borderRadius: "30px",
      fontSize: "14px",
      fontWeight: "500",
      zIndex: "999998",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      border: "none",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      opacity: (isApptTab && isApptDone) ? "1" : "0",
      transform: "translateY(0) scale(1)",
      transformOrigin: "bottom right",
      pointerEvents: "none",
      maxWidth: "260px",
      lineHeight: "1.55",
      letterSpacing: "0.01em"
    });
    
    // Add cloud bubble tail — two small circles trailing down toward the girl
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      #smart-nid-status {
        position: relative;
      }
      #smart-nid-cloud-dot-1 {
        position: fixed;
        bottom: 178px;
        right: 55px;
        width: 18px;
        height: 18px;
        background: white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
        z-index: 999997;
        pointer-events: none;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: ${(isApptTab && isApptDone) ? "1" : "0"};
        transform: scale(${(isApptTab && isApptDone) ? "1" : "0.8"}) translateY(${(isApptTab && isApptDone) ? "0" : "5px"});
      }
      #smart-nid-cloud-dot-2 {
        position: fixed;
        bottom: 170px;
        right: 65px;
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04);
        z-index: 999997;
        pointer-events: none;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: ${(isApptTab && isApptDone) ? "1" : "0"};
        transform: scale(${(isApptTab && isApptDone) ? "1" : "0.8"}) translateY(${(isApptTab && isApptDone) ? "0" : "5px"});
      }
      @keyframes smartNidCloudFloat {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-4px) scale(1); }
      }
      #smart-nid-status.is-floating {
        animation: smartNidCloudFloat 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(styleEl);

    // Create the trailing thought-cloud dots
    const dot1 = document.createElement("div");
    dot1.id = "smart-nid-cloud-dot-1";
    const dot2 = document.createElement("div");
    dot2.id = "smart-nid-cloud-dot-2";

    let bubbleVisibilityTimeout = null;
    let isShowingFeedback = false;

    const setBubbleVisible = (visible) => {
      // Force visible if on appt tab and done
      const isApptTab = document.body.innerText.includes('बायोमेट्रिक दिने स्थान') || document.body.innerText.includes('Appointment Details');
      const isApptDone = sessionStorage.getItem('smart_nid_appointment_done') === 'true';
      if (isApptTab && isApptDone) visible = true;

      if (visible) {
        statusBadge.style.opacity = "1";
        statusBadge.classList.add('is-floating');
        dot1.style.opacity = "1";
        dot1.style.transform = "scale(1)";
        dot2.style.opacity = "1";
        dot2.style.transform = "scale(1)";
      } else {
        statusBadge.style.opacity = "0";
        statusBadge.classList.remove('is-floating');
        dot1.style.opacity = "0";
        dot1.style.transform = "scale(0.8) translateY(5px)";
        dot2.style.opacity = "0";
        dot2.style.transform = "scale(0.8) translateY(5px)";
      }
    };

    const isLoginScreen = window.location.pathname.toLowerCase().includes('/login') || document.body.innerText.includes("Login For Individuals");
    const isMobileEntryScreen = document.body.innerText.includes("Enter your Mobile Number") || document.body.innerText.includes("मोबाइल नम्बर प्रविष्ट गर्नुहोस्");
    const isOtpScreen = document.body.innerText.includes("Enter your OTP Number") || document.body.innerText.includes("A message with a verification code");

    // Set initial text for tooltip
    if (!(isApptTab && isApptDone)) {
      if (isPreviewTab) {
        statusBadge.innerHTML = "<span style='font-size:16px;'>\u{1F389}</span> All done!<br/>Please check your details and <b>Submit</b> your form.";
      } else if (isReady) {
        statusBadge.innerHTML = "<span style='font-size:16px;'>\u{1F64F}</span> Namaste! I'm ready to fill this form.<br/>Please press the <b>Auto-Fill</b> button at my side!";
      } else {
        const newEnrollBtn = document.getElementById("newEnrollment");
        if (newEnrollBtn) {
          statusBadge.innerHTML = "<span style='font-size:16px;'>\u{1F4DD}</span> Please press the <b>Auto-Fill</b> button at my side to start a New Enrollment!";
        } else if (isOtpScreen) {
          statusBadge.innerHTML = "<span style='font-size:16px;'>\u{1F512}</span> Almost there! Please enter the <b>OTP</b> sent to your mobile device.";
        } else if (isMobileEntryScreen) {
          statusBadge.innerHTML = "<span style='font-size:16px;'>\u{1F4F1}</span> Please enter your mobile number and click the arrow to receive an OTP!";
        } else if (isLoginScreen) {
          statusBadge.innerHTML = "<span style='font-size:16px;'>\u{1F44B}</span> Namaste!<br/>You are on the login screen.<br/><br/>Please click <b>Login For Individuals</b> to get started!";
        } else {
          statusBadge.innerHTML = "<span style='font-size:16px;'>\u{1F914}</span> I don't see a form here! Open a form and I'll help you fill it.";
        }
      }
    }

    setBubbleVisible(true);
    
    bubbleVisibilityTimeout = setTimeout(() => {
      if (!isShowingFeedback && !(isApptTab && isApptDone)) setBubbleVisible(false);
    }, 5000);

    btn.onmouseover = () => {
      btn.style.transform = "scale(1.08) translateY(-5px)";
      clearTimeout(bubbleVisibilityTimeout);
      setBubbleVisible(true);
    };
    btn.onmouseout = () => {
      btn.style.transform = "scale(1) translateY(0)";
      if (!isShowingFeedback && !(isApptTab && isApptDone)) setBubbleVisible(false);
    };
    
    actionBtn.onmouseover = () => {
      actionBtn.style.transform = "translateY(-4px) scale(1.05)";
      actionBtn.style.boxShadow = "0 12px 30px rgba(185, 28, 28, 0.45), 0 0 0 1px rgba(0,0,0,0.05)";
      clearTimeout(bubbleVisibilityTimeout);
      setBubbleVisible(true);
    };
    actionBtn.onmouseout = () => {
      actionBtn.style.transform = "translateY(0) scale(1)";
      actionBtn.style.boxShadow = "0 8px 25px rgba(185, 28, 28, 0.35), 0 0 0 1px rgba(0,0,0,0.05)";
      if (!isShowingFeedback && !(isApptTab && isApptDone)) setBubbleVisible(false);
    };

    actionBtn.onclick = () => {
      isShowingFeedback = true;
      setBubbleVisible(true);
      if (!hasFormFields()) {
        const newEnrollmentBtn = document.getElementById("newEnrollment");
        
        if (newEnrollmentBtn) {
          statusBadge.innerHTML = "<span style='font-size:16px;'>\u{1F680}</span> Starting New Enrollment! I'll auto-fill everything...";
          statusBadge.style.backgroundColor = "#f0fff4";
          statusBadge.style.color = "#22543d";
          sessionStorage.setItem('smart_nid_autorun', 'true');
          
          setTimeout(() => {
            newEnrollmentBtn.click();
          }, 600);
          return;
        }

        // User clicked the avatar before reaching the form and no new enrollment btn
        if (isOtpScreen) {
          statusBadge.innerHTML = "Please enter your OTP to continue! \u{1F512}";
        } else if (isMobileEntryScreen) {
          statusBadge.innerHTML = "Please enter your mobile number to proceed! \u{1F4F1}";
        } else if (isLoginScreen) {
          statusBadge.innerHTML = "You are on the login screen! Please click <b>Login For Individuals</b> first! \u{1F60A}";
        } else {
          statusBadge.innerHTML = "Oops! You're not on the form page yet. Please click <b>New Enrollment</b> first! \u{1F60A}";
        }
        statusBadge.style.backgroundColor = "#fff5f5";
        statusBadge.style.color = "#c53030";
        statusBadge.style.boxShadow = "0 4px 20px rgba(197,48,48,0.1), 0 0 0 1px rgba(197,48,48,0.1)";
        
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
          isShowingFeedback = false;
          statusBadge.style.backgroundColor = "white";
          statusBadge.style.color = "#1e293b";
          statusBadge.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)";
          if (isOtpScreen) {
            statusBadge.innerHTML = "<span style='font-size:16px;'>\u{1F512}</span> Almost there! Please enter the <b>OTP</b> sent to your mobile device.";
          } else if (isMobileEntryScreen) {
            statusBadge.innerHTML = "<span style='font-size:16px;'>\u{1F4F1}</span> Please enter your mobile number and click the arrow to receive an OTP!";
          } else if (isLoginScreen) {
            statusBadge.innerHTML = "<span style='font-size:16px;'>\u{1F44B}</span> Namaste!<br/>You are on the login screen.<br/><br/>Please click <b>Login For Individuals</b> to get started!";
          } else {
            statusBadge.innerHTML = "<span style='font-size:16px;'>\u{1F914}</span> I don't see a form here! Open a form and I'll help you fill it.";
          }
          if (!(isApptTab && isApptDone)) setBubbleVisible(false);
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
            const isOldProfile = !instructions.some(i => i.id === 'permState' || i.id === 'pProvince');
            const processInstructions = async () => {
              const isAppointmentTab = document.body.innerText.includes('बायोमेट्रिक दिने स्थान') || document.body.innerText.includes('Appointment Details');
              let filledCount = 0;
              let skippedCount = 0;

              for (const inst of instructions) {
                if (!inst.value && !inst.textValue) continue;
                if (inst.id === 'appointmentLocation' && !isAppointmentTab) {
                   skippedCount++;
                   continue;
                }
                
                let el = document.getElementById(inst.id);
                if (!el && inst.id === 'tempAddressCopy') {
                  const labels = Array.from(document.querySelectorAll('label, span, div'));
                  const copyLabel = labels.find(l => l.innerText && l.innerText.includes('Copy Permanent Address'));
                  if (copyLabel) el = copyLabel.querySelector('input[type="checkbox"]') || copyLabel.parentElement?.querySelector('input[type="checkbox"]');
                  if (!el) el = document.querySelector('input[type="checkbox"]');
                }
                if (!el && inst.id === 'appointmentLocation') {
                  const visibleSelects = Array.from(document.querySelectorAll('select')).filter(s => s.offsetParent !== null);
                  if (visibleSelects.length > 0) {
                    el = visibleSelects[0];
                  }
                }
                if (!el) {
                  skippedCount++;
                  continue;
                }
                if (inst.type === 'text' || inst.type === 'date') {
                  el.focus();
                  el.dispatchEvent(new Event('focus', { bubbles: true }));
                  let injectVal = inst.value;
                  const englishFields = [
                    'firstName', 'middleName', 'lastName',
                    'permVillageTol', 'tempVillageTol',
                    'fatherFirstName', 'fatherMiddleName', 'fatherLastName',
                    'motherFirstName', 'motherMiddleName', 'motherLastName',
                    'grandFatherFirstName', 'grandFatherMiddleName', 'grandFatherLastName',
                    'grandMotherFirstName', 'grandMotherMiddleName', 'grandMotherLastName',
                    'spouseFirstName', 'spouseMiddleName', 'spouseLastName'
                  ];
                  if (inst.id && englishFields.includes(inst.id) && typeof injectVal === 'string') {
                    injectVal = injectVal.toUpperCase();
                  }
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                  if (nativeInputValueSetter) {
                    nativeInputValueSetter.call(el, injectVal);
                  } else {
                    el.value = injectVal;
                  }
                  el.dispatchEvent(new Event('input', { bubbles: true }));
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                  el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter', keyCode: 13 }));
                  el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter', code: 'Enter', keyCode: 13 }));
                  el.dispatchEvent(new Event('blur', { bubbles: true }));
                  el.blur();
                  filledCount++;
                } else if (inst.type === 'checkbox') {
                  const shouldBeChecked = inst.value === 'true';
                  if (el.checked !== shouldBeChecked) {
                    el.click();
                  }
                  filledCount++;
                } else if (inst.type === 'select') {
                  let attempts = 0;
                  let hasOption = false;
                  const targetVal = inst.value ? String(inst.value) : "";
                  const targetText = inst.textValue ? String(inst.textValue).toLowerCase().replace(/[\s\/]/g, '') : "";
                  while (!hasOption && attempts < 15) {
                    const options = Array.from(el.options);
                    hasOption = options.some(opt => {
                      if (targetVal && opt.value === targetVal) return true;
                      if (targetText) {
                        const optText = opt.text.toLowerCase().replace(/[\s\/]/g, '');
                        return optText === targetText || optText.includes(targetText);
                      }
                      return false;
                    });
                    if (!hasOption) {
                      await new Promise(r => setTimeout(r, 100));
                      attempts++;
                    }
                  }
                  let matched = false;
                  let valueChanged = false;
                  if (inst.value) {
                    for (let i = 0; i < el.options.length; i++) {
                      if (el.options[i].value === inst.value) {
                        if (el.value !== inst.value) {
                          const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
                          if (nativeSelectValueSetter) {
                            nativeSelectValueSetter.call(el, inst.value);
                          } else {
                            el.value = inst.value;
                          }
                          valueChanged = true;
                        }
                        matched = true;
                        break;
                      }
                    }
                  }
                  if (!matched && inst.textValue) {
                    const cleanTarget = String(inst.textValue).toLowerCase().replace(/[\s\/]/g, '');
                    let fuzzyMatch = null;
                    for (let i = 0; i < el.options.length; i++) {
                      const cleanOpt = el.options[i].text.toLowerCase().replace(/[\s\/]/g, '');
                      if (cleanOpt === cleanTarget) {
                        fuzzyMatch = el.options[i];
                        break;
                      }
                    }
                    if (!fuzzyMatch) {
                      for (let i = 0; i < el.options.length; i++) {
                        const cleanOpt = el.options[i].text.toLowerCase().replace(/[\s\/]/g, '');
                        if (cleanOpt.includes(cleanTarget) || cleanTarget.includes(cleanOpt)) {
                          fuzzyMatch = el.options[i];
                          break;
                        }
                      }
                    }
                    if (fuzzyMatch) {
                      if (el.value !== fuzzyMatch.value) {
                        const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
                        if (nativeSelectValueSetter) {
                          nativeSelectValueSetter.call(el, fuzzyMatch.value);
                        } else {
                          el.value = fuzzyMatch.value;
                        }
                        valueChanged = true;
                      }
                      matched = true;
                    }
                  }
                  if (valueChanged) {
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                  }
                  filledCount++;
                }
              }
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
                    if (pEl && pEl.value !== pProv) { 
                      pEl.value = pProv; 
                      pEl.dispatchEvent(new Event('change', { bubbles: true })); 
                    }
                  }
                }
                if (tDistInst && tDistInst.value) {
                  const tProv = getProv(tDistInst.value);
                  if (tProv) {
                    const tEl = document.getElementById('tProvince');
                    if (tEl && tEl.value !== tProv) { 
                      tEl.value = tProv; 
                      tEl.dispatchEvent(new Event('change', { bubbles: true })); 
                    }
                  }
                }
              }
              return { filledCount, skippedCount };
            };
            result = await processInstructions();
          } else {
            console.error("Smart NID: No safe instructions available for autofill.");
          }

        const originalHtml = btn.innerHTML;
        const filled = (typeof result === 'object' && result) ? result.filledCount : 0;
        const skipped = (typeof result === 'object' && result) ? result.skippedCount : 0;
        const isAppointmentTab = document.body.innerText.includes('बायोमेट्रिक दिने स्थान') || document.body.innerText.includes('Appointment Details');

        if (filled > 0 && !isAppointmentTab) {
          setTimeout(async () => {
            const nextBtn = document.getElementById("nextBtn") || Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.trim().toLowerCase() === 'next');
            if (nextBtn) {
              sessionStorage.setItem('smart_nid_autorun', 'true');
              for (let i = 0; i < 3; i++) {
                if (nextBtn.innerText.trim().toLowerCase() === 'next') {
                  nextBtn.click();
                  await new Promise(r => setTimeout(r, 50)); 
                }
              }
            }
          }, 50);
        }

        if (isAppointmentTab) {
          let attempts = 0;
          const maxAttempts = 15;
          const checkAndClick = setInterval(() => {
            attempts++;
            const swalBtn = document.querySelector('.swal-button--confirm');
            if (swalBtn) {
              swalBtn.click();
              clearInterval(checkAndClick);
              setTimeout(() => {
                const dateBox = document.getElementById('appointmentDate');
                if (dateBox) {
                  dateBox.focus();
                  dateBox.click();
                }
              }, 150);
            } else if (attempts >= maxAttempts) {
              clearInterval(checkAndClick);
              const dateBox = document.getElementById('appointmentDate');
              if (dateBox) {
                dateBox.focus();
                dateBox.click();
              }
            }
          }, 200);
          sessionStorage.setItem('smart_nid_appointment_done', 'true');
          statusBadge.innerHTML = "Location selected! 📍<br/>Please pick a <b>Date</b> from the calendar and click <b>Search</b>.";
          statusBadge.style.backgroundColor = "#fffbeb"; 
          statusBadge.style.color = "#92400e";
          statusBadge.style.border = "1px solid #fcd34d";
          setBubbleVisible(true);
          startApptMonitor();
        } else if (filled > 0 && skipped > 0) {
          statusBadge.innerHTML = `Yay! I filled <b>${filled} fields</b> for you! Moving to the next section... \u{1F389}`;
          statusBadge.style.backgroundColor = "#f0fff4";
          statusBadge.style.color = "#22543d";
        } else if (filled > 0) {
          statusBadge.innerHTML = "All done! Every field is filled! \u{2728}<br/>Moving forward or review and submit.";
          statusBadge.style.backgroundColor = "#f0fff4";
          statusBadge.style.color = "#22543d";
        } else {
          statusBadge.innerHTML = "Hmm, I couldn't find any fields to fill on this tab. \u{1F914}";
          statusBadge.style.backgroundColor = "#fffbeb";
          statusBadge.style.color = "#92400e";
          sessionStorage.removeItem('smart_nid_autorun');
        }
        
        setTimeout(() => {
          if (!(isAppointmentTab && filled > 0)) {
            const isApptTab = document.body.innerText.includes('बायोमेट्रिक दिने स्थान') || document.body.innerText.includes('Appointment Details');
            const isApptDone = sessionStorage.getItem('smart_nid_appointment_done') === 'true';
            if (isApptTab && isApptDone) return;
            isShowingFeedback = false;
            btn.innerHTML = originalHtml;
            statusBadge.style.backgroundColor = "white";
            statusBadge.style.color = "#1e293b";
            statusBadge.innerHTML = "<span style='font-size:16px;'>\u{1F64F}</span> Namaste! I'm ready to fill this form.<br/>Please press the <b>Auto-Fill</b> button at my side!";
            setBubbleVisible(false);
          }
        }, 4000);
      } catch (err) {
          console.error("Smart NID: Script injection error \u2014", err);
          sessionStorage.removeItem('smart_nid_autorun');
          statusBadge.innerHTML = "Oh no, something went wrong! \u{1F625}<br/>Try refreshing the page and clicking me again.";
          statusBadge.style.backgroundColor = "#fff5f5";
          statusBadge.style.color = "#c53030";
          setTimeout(() => {
            isShowingFeedback = false;
            btn.innerHTML = `${logoSvg}`;
            statusBadge.style.backgroundColor = "white";
            statusBadge.style.color = "#1e293b";
            statusBadge.innerHTML = "<span style='font-size:16px;'>\u{1F64F}</span> Namaste! I'm ready to fill this form for you.<br/><b>Just click me!</b>";
            setBubbleVisible(false);
          }, 3000);
        }
      });
    };

    container.appendChild(statusBadge);
    container.appendChild(dot1);
    container.appendChild(dot2);
    if (!isLoginScreen && !isMobileEntryScreen && !isOtpScreen) {
      container.appendChild(actionBtn);
    }
    container.appendChild(btn);
    document.body.appendChild(container);

    // Periodically check for Auto-run flag
    const statusInterval = setInterval(() => {
      const currentActionBtn = document.getElementById("smart-nid-action-btn");
      if (!currentActionBtn && !document.getElementById("smart-nid-avatar")) {
        clearInterval(statusInterval);
        return;
      }
      
      const formReady = hasFormFields();
      if (formReady && currentActionBtn) {
        // 🚀 Auto-Run feature for multi-tab wizard
        if (sessionStorage.getItem('smart_nid_autorun') === 'true') {
          sessionStorage.removeItem('smart_nid_autorun'); // Prevent infinite loops
          setTimeout(() => {
            currentActionBtn.click();
          }, 50); // Very rapid auto-run after React mount
        }
      }
    }, 500);
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
