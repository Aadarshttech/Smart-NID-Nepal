document.addEventListener('DOMContentLoaded', () => {
  const statusContainer = document.getElementById('statusContainer');
  const statusIcon = document.getElementById('statusIcon');
  const statusTitle = document.getElementById('statusTitle');
  const statusDesc = document.getElementById('statusDesc');

  const savedDataContainer = document.getElementById('savedDataContainer');
  const savedDataGrid = document.getElementById('savedDataGrid');

  const btnOpenApp = document.getElementById('btnOpenApp');
  const btnOpenGov = document.getElementById('btnOpenGov');

  function updateUI(hasScript, draftData) {
    if (hasScript) {
      // Data is ready
      statusContainer.className = 'status-card ready';
      statusIcon.textContent = '🟢';
      statusTitle.textContent = 'Data Ready!';
      statusDesc.textContent = 'Navigate to DoNIDCR to auto-fill.';

      if (draftData) {
        savedDataContainer.style.display = 'block';
        savedDataGrid.innerHTML = `
          <div style="grid-column: span 2"><strong>Name:</strong> ${draftData.first_name_en} ${draftData.last_name_en}</div>
          <div><strong>Cit. No:</strong> ${draftData.citizenship_no}</div>
          <div><strong>District:</strong> ${draftData.district}</div>
          <div><strong>DOB (BS):</strong> ${draftData.dob_bs}</div>
          <div><strong>Gender:</strong> ${draftData.gender}</div>
        `;
      } else {
        savedDataContainer.style.display = 'none';
      }
    } else {
      // Waiting for data
      statusContainer.className = 'status-card waiting';
      statusIcon.textContent = '⚪';
      statusTitle.textContent = 'Waiting for Data';
      statusDesc.textContent = 'No data saved. Extract NID first.';
      savedDataContainer.style.display = 'none';
    }
  }

  // Initial check storage for the script
  chrome.storage.local.get(["autoFillScript", "draftData"], (result) => {
    updateUI(!!result.autoFillScript, result.draftData);
  });

  // Listen for real-time changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && (changes.autoFillScript || changes.draftData)) {
      // Get the latest values if not present in the changes object
      chrome.storage.local.get(["autoFillScript", "draftData"], (result) => {
        updateUI(!!result.autoFillScript, result.draftData);
      });
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
