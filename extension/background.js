chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "NID_TRANSFER_SCRIPT") {
    // 1. Save the script to local storage
    chrome.storage.local.set({ autoFillScript: message.script }, () => {
      // 2. Open the DoNIDCR portal
      chrome.tabs.create({ url: "https://enrollment.donidcr.gov.np/PreEnrollment/enterMobileNumber" });
      sendResponse({ status: "success" });
    });
    return true; // Keep message channel open for async sendResponse
  }
});
