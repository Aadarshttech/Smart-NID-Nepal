/**
 * Smart NID Helper — Background Service Worker
 *
 * Receives the auto-fill script from the React app (via content-app.js)
 * and stores it in chrome.storage.local.
 *
 * IMPORTANT: We do NOT auto-open the DoNIDCR portal because:
 * 1. The government site requires a multi-step flow: Phone → OTP → New Enrollment → Form
 * 2. Opening the root URL directly causes 500 errors on their server
 * 3. The user must complete the phone/OTP flow manually
 *
 * Instead, we just store the script. The content script (content-donidcr.js)
 * will detect when the user reaches the form page and show the auto-fill button.
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "NID_TRANSFER_SCRIPT") {
    const scriptData = message.script;

    if (!scriptData || typeof scriptData !== "string") {
      sendResponse({ status: "error", message: "Invalid script data received." });
      return true;
    }

    chrome.storage.local.get(["savedProfiles"], (result) => {
      let profiles = result.savedProfiles || [];
      const newProfile = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString(),
        name: `${message.draft?.firstName?.english || ''} ${message.draft?.lastName?.english || ''}`.trim() || 'Unknown Name',
        citNo: message.draft?.citizenshipNo || '',
        draftData: message.draft,
        additionalData: message.additional,
        autoFillInstructions: message.instructions,
        autoFillScript: scriptData
      };
      
      // Overwrite if same citizenshipNo to prevent infinite spam, otherwise push
      const existingIndex = profiles.findIndex(p => p.citNo === newProfile.citNo && p.citNo !== '');
      if (existingIndex >= 0) {
        profiles[existingIndex] = newProfile;
      } else {
        profiles.push(newProfile);
      }

      // Store the profiles and set the new one as active
      chrome.storage.local.set({ 
        savedProfiles: profiles,
        activeProfileId: newProfile.id
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("Smart NID: Storage error —", chrome.runtime.lastError.message);
          sendResponse({ status: "error", message: chrome.runtime.lastError.message });
          return;
        }

        // Check if there's already a DoNIDCR tab open
        chrome.tabs.query({ url: "*://enrollment.donidcr.gov.np/*" }, (tabs) => {
          if (chrome.runtime.lastError) {
            console.error("Smart NID: Tabs query error —", chrome.runtime.lastError.message);
            sendResponse({ status: "success" }); // Still report success as data is saved
            return;
          }

          if (tabs && tabs.length > 0) {
            // Re-inject the content script if it's already open, but DO NOT focus it
            const existingTab = tabs[0];
            if (chrome.scripting && chrome.scripting.executeScript) {
              chrome.scripting.executeScript({
                target: { tabId: existingTab.id },
                files: ["content-donidcr.js"],
              }).catch((err) => {
                console.warn("Smart NID: Script injection warning —", err);
              });
            }
          }
          // If no tab is open, do NOT open one — user will navigate manually
          // The ExportTab in the React app will show instructions

          sendResponse({ status: "success" });
        });
      });
    });

    return true; // Keep message channel open for async sendResponse
  }

  if (message.type === "NID_GET_PROFILES") {
    chrome.storage.local.get(["savedProfiles"], (result) => {
      sendResponse({ status: "success", profiles: result.savedProfiles || [] });
    });
    return true;
  }


});
