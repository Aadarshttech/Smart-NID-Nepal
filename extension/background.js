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

    // Store the script and raw data — the content script on DoNIDCR will pick it up
    chrome.storage.local.set({ autoFillScript: scriptData, draftData: message.draft }, () => {
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
          // Focus the existing tab and re-inject the content script
          const existingTab = tabs[0];
          chrome.tabs.update(existingTab.id, { active: true }, () => {
            if (chrome.runtime.lastError) {
               console.warn("Smart NID: Tab update error —", chrome.runtime.lastError.message);
               // Ignore error, proceed
            }

            if (chrome.scripting && chrome.scripting.executeScript) {
              chrome.scripting.executeScript({
                target: { tabId: existingTab.id },
                files: ["content-donidcr.js"],
              }).catch((err) => {
                console.warn("Smart NID: Script injection warning —", err);
              });
            }
          });
        }
        // If no tab is open, do NOT open one — user will navigate manually
        // The ExportTab in the React app will show instructions

        sendResponse({ status: "success" });
      });
    });

    return true; // Keep message channel open for async sendResponse
  }
});
