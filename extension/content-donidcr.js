// This script runs on the official DoNIDCR portal (*://enrollment.donidcr.gov.np/*)

chrome.storage.local.get(["autoFillScript"], (result) => {
  if (result.autoFillScript) {
    // Wait for the DOM to be fully loaded to ensure we don't inject before body exists
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => injectFloatingButton(result.autoFillScript));
    } else {
      injectFloatingButton(result.autoFillScript);
    }
  }
});

function injectFloatingButton(scriptContent) {
  // Prevent multiple injections
  if (document.getElementById("smart-nid-autofill-btn")) return;

  const btn = document.createElement("button");
  btn.id = "smart-nid-autofill-btn";
  btn.innerHTML = "✨ Auto-Fill Form ✨";
  
  // Styling the floating button
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "40px",
    right: "40px",
    padding: "16px 28px",
    backgroundColor: "#003893", // DoNIDCR blue
    color: "white",
    border: "none",
    borderRadius: "50px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(0, 56, 147, 0.4)",
    zIndex: "999999",
    transition: "all 0.2s ease-in-out",
    fontFamily: "sans-serif"
  });

  btn.onmouseover = () => {
    btn.style.transform = "scale(1.05) translateY(-5px)";
    btn.style.boxShadow = "0 15px 30px rgba(0, 56, 147, 0.5)";
  };
  btn.onmouseout = () => {
    btn.style.transform = "scale(1) translateY(0)";
    btn.style.boxShadow = "0 10px 25px rgba(0, 56, 147, 0.4)";
  };

  btn.onclick = () => {
    // Inject the script into the page context
    // This is required because content scripts run in an isolated world,
    // but we need to access window variables or trigger DOM events on the main page.
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    (document.head || document.documentElement).appendChild(scriptEl);
    scriptEl.remove(); // Cleanup the script tag

    // Clear storage so the button doesn't keep appearing on future visits
    chrome.storage.local.remove(["autoFillScript"]);
    
    // Change button text to success
    btn.innerHTML = "✅ Filled Successfully!";
    btn.style.backgroundColor = "#28a745";
    btn.style.boxShadow = "0 10px 25px rgba(40, 167, 69, 0.4)";
    
    setTimeout(() => {
      btn.style.opacity = "0";
      setTimeout(() => btn.remove(), 300);
    }, 3000);
  };

  document.body.appendChild(btn);
}
