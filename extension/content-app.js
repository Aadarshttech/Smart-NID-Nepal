/**
 * Smart NID Helper — Content Script for the React App
 * Runs on: localhost, 127.0.0.1, smart-nid-nepal.vercel.app
 *
 * Acts as a bridge between the React App and the Chrome Extension Background worker.
 *
 * Fixes:
 * - Checks chrome.runtime availability before sending messages
 * - Handles disconnected extension gracefully
 * - Retries the ready signal in case of race conditions
 */

(function () {
  "use strict";

  // 1. Let the React app know the extension is installed and ready
  function signalReady() {
    window.dispatchEvent(new CustomEvent("SMART_NID_EXTENSION_READY"));
  }

  // Signal immediately
  signalReady();

  // Also respond to pings from the app (in case app loads after this script)
  window.addEventListener("SMART_NID_PING", signalReady);

  // Re-signal after a short delay to cover late-loading React hydration
  setTimeout(signalReady, 500);
  setTimeout(signalReady, 2000);

  // 2. Listen for the transfer command from the React app
  window.addEventListener("SMART_NID_TRANSFER", (e) => {
    const scriptToTransfer = e.detail && e.detail.script;

    if (!scriptToTransfer || typeof scriptToTransfer !== "string") {
      console.error("Smart NID: Invalid or missing script in transfer event.");
      window.dispatchEvent(new CustomEvent("SMART_NID_TRANSFER_ERROR", {
        detail: { error: "Invalid script data" }
      }));
      return;
    }

    // Check if the extension runtime is still connected
    if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
      console.error("Smart NID: Chrome runtime not available. Extension may have been updated or disabled.");
      window.dispatchEvent(new CustomEvent("SMART_NID_TRANSFER_ERROR", {
        detail: { error: "Extension disconnected" }
      }));
      return;
    }

    try {
      chrome.runtime.sendMessage(
        { 
          type: "NID_TRANSFER_SCRIPT", 
          script: scriptToTransfer,
          draft: e.detail.draft,
          instructions: e.detail.instructions
        },
        (response) => {
          // Check for runtime errors (extension context invalidated)
          if (chrome.runtime.lastError) {
            console.error("Smart NID: Message send error —", chrome.runtime.lastError.message);
            window.dispatchEvent(new CustomEvent("SMART_NID_TRANSFER_ERROR", {
              detail: { error: chrome.runtime.lastError.message }
            }));
            return;
          }

          if (response && response.status === "success") {
            window.dispatchEvent(new CustomEvent("SMART_NID_TRANSFER_SUCCESS"));
          } else {
            const errorMsg = (response && response.message) || "Unknown error";
            console.error("Smart NID: Transfer failed —", errorMsg);
            window.dispatchEvent(new CustomEvent("SMART_NID_TRANSFER_ERROR", {
              detail: { error: errorMsg }
            }));
          }
        }
      );
    } catch (err) {
      console.error("Smart NID: Exception during message send —", err);
      window.dispatchEvent(new CustomEvent("SMART_NID_TRANSFER_ERROR", {
        detail: { error: err.message || "Message send failed" }
      }));
    }
  });

  // 3. Listen for the request profiles command
  window.addEventListener("SMART_NID_REQUEST_PROFILES", () => {
    if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
      window.dispatchEvent(new CustomEvent("SMART_NID_PROFILES_RESPONSE", {
        detail: { status: "error", profiles: [] }
      }));
      return;
    }

    try {
      chrome.runtime.sendMessage({ type: "NID_GET_PROFILES" }, (response) => {
        if (chrome.runtime.lastError) {
          window.dispatchEvent(new CustomEvent("SMART_NID_PROFILES_RESPONSE", {
            detail: { status: "error", profiles: [] }
          }));
          return;
        }

        window.dispatchEvent(new CustomEvent("SMART_NID_PROFILES_RESPONSE", {
          detail: { 
            status: response ? response.status : "error", 
            profiles: (response && response.profiles) || [] 
          }
        }));
      });
    } catch (err) {
      window.dispatchEvent(new CustomEvent("SMART_NID_PROFILES_RESPONSE", {
        detail: { status: "error", profiles: [] }
      }));
    }
  });
})();
