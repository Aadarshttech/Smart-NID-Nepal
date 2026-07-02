chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "NID_TRANSFER_SCRIPT") {
    // 1. Save the script to local storage
    chrome.storage.local.set({ autoFillScript: message.script }, () => {
      // 2. Open the DoNIDCR portal root page (Opening the POST endpoint directly causes a 500 error)
      chrome.tabs.create({ url: "https://enrollment.donidcr.gov.np/" });
      sendResponse({ status: "success" });
    });
    return true; // Keep message channel open for async sendResponse
  }
});
