document.addEventListener('DOMContentLoaded', () => {
  const statusContainer = document.getElementById('statusContainer');
  const statusIcon = document.getElementById('statusIcon');
  const statusTitle = document.getElementById('statusTitle');
  const statusDesc = document.getElementById('statusDesc');

  const btnOpenApp = document.getElementById('btnOpenApp');
  const btnOpenGov = document.getElementById('btnOpenGov');

  function updateUI(hasScript) {
    if (hasScript) {
      // Data is ready
      statusContainer.className = 'status-card ready';
      statusIcon.textContent = '🟢';
      statusTitle.textContent = 'Data Ready!';
      statusDesc.textContent = 'Navigate to DoNIDCR to auto-fill.';
    } else {
      // Waiting for data
      statusContainer.className = 'status-card waiting';
      statusIcon.textContent = '⚪';
      statusTitle.textContent = 'Waiting for Data';
      statusDesc.textContent = 'No data saved. Extract NID first.';
    }
  }

  // Initial check storage for the script
  chrome.storage.local.get(["autoFillScript"], (result) => {
    updateUI(!!result.autoFillScript);
  });

  // Listen for real-time changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.autoFillScript !== undefined) {
      updateUI(!!changes.autoFillScript.newValue);
    }
  });

  // Open App Button
  btnOpenApp.addEventListener('click', () => {
    // Open localhost or the vercel app. For this extension, we'll open the local app if running, 
    // or just the vercel production link. Since we don't know if local is running, 
    // opening the default URL is safest.
    chrome.tabs.create({ url: 'http://localhost:5175' });
  });

  // Open Gov Portal Button
  btnOpenGov.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://enrollment.donidcr.gov.np/' });
  });
});
