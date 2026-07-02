// This script runs on the Smart NID React App.
// It acts as a bridge between the React App and the Chrome Extension Background worker.

// 1. Let the React app know the extension is installed and ready
// We dispatch this immediately and also listen for a ping in case the app loads after the script
window.dispatchEvent(new CustomEvent("SMART_NID_EXTENSION_READY"));

window.addEventListener("SMART_NID_PING", () => {
  window.dispatchEvent(new CustomEvent("SMART_NID_EXTENSION_READY"));
});

// 2. Listen for the transfer command from the React app
window.addEventListener("SMART_NID_TRANSFER", (e) => {
  const scriptToTransfer = e.detail.script;
  
  chrome.runtime.sendMessage(
    { type: "NID_TRANSFER_SCRIPT", script: scriptToTransfer },
    (response) => {
      if (response && response.status === "success") {
        window.dispatchEvent(new CustomEvent("SMART_NID_TRANSFER_SUCCESS"));
      } else {
        window.dispatchEvent(new CustomEvent("SMART_NID_TRANSFER_ERROR"));
      }
    }
  );
});
