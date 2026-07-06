document.addEventListener('DOMContentLoaded', () => {
  const statusContainer = document.getElementById('statusContainer');
  const statusIcon = document.getElementById('statusIcon');
  const statusTitle = document.getElementById('statusTitle');
  const statusDesc = document.getElementById('statusDesc');

  const savedDataContainer = document.getElementById('savedDataContainer');
  const profilesList = document.getElementById('profilesList');

  const btnOpenApp = document.getElementById('btnOpenApp');
  const btnOpenGov = document.getElementById('btnOpenGov');

  function updateUI(profiles, activeId) {
    if (profiles && profiles.length > 0) {
      // Data is ready
      statusContainer.className = 'status-card ready';
      statusIcon.textContent = '🟢';
      statusTitle.textContent = 'Data Ready!';
      statusDesc.textContent = 'Navigate to DoNIDCR to auto-fill.';

      savedDataContainer.style.display = 'block';
      profilesList.innerHTML = '';
      
      profiles.forEach(p => {
        const isActive = p.id === activeId;
        const div = document.createElement('div');
        div.style.padding = '12px';
        div.style.border = isActive ? '2px solid #003893' : '1px solid #e2e8f0';
        div.style.borderRadius = '8px';
        div.style.cursor = 'pointer';
        div.style.backgroundColor = isActive ? '#f0f4f8' : '#fff';
        div.style.position = 'relative';
        div.style.transition = 'all 0.2s ease';
        
        div.innerHTML = `
          <div style="font-weight: 600; font-size: 0.95rem; color: #0f172a; margin-bottom: 2px;">${p.name}</div>
          <div style="font-size: 0.8rem; color: #475569;">Cit. No: ${p.citNo}</div>
          <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 6px;">Saved: ${p.timestamp}</div>
          ${isActive ? `<div style="position: absolute; top: 12px; right: 12px; background: #003893; color: white; font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px;">ACTIVE</div>` : ''}
        `;
        
        div.onclick = () => {
          chrome.storage.local.set({ activeProfileId: p.id });
        };
        
        div.onmouseover = () => {
          if (!isActive) div.style.backgroundColor = '#f8fafc';
        };
        div.onmouseout = () => {
          if (!isActive) div.style.backgroundColor = '#fff';
        };
        
        profilesList.appendChild(div);
      });
    } else {
      // Waiting for data
      statusContainer.className = 'status-card waiting';
      statusIcon.textContent = '⚪';
      statusTitle.textContent = 'Waiting for Data';
      statusDesc.textContent = 'No data saved. Extract NID first.';
      savedDataContainer.style.display = 'none';
    }
  }

  // Initial check storage
  chrome.storage.local.get(["savedProfiles", "activeProfileId"], (result) => {
    updateUI(result.savedProfiles, result.activeProfileId);
  });

  // Listen for real-time changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && (changes.savedProfiles || changes.activeProfileId)) {
      chrome.storage.local.get(["savedProfiles", "activeProfileId"], (result) => {
        updateUI(result.savedProfiles, result.activeProfileId);
      });
    }
  });

  // Open App Button
  btnOpenApp.addEventListener('click', () => {
    // Open localhost or the vercel app. For this extension, we'll open the local app if running, 
    // or just the vercel production link. Since we don't know if local is running, 
    // opening the default URL is safest.
    chrome.tabs.create({ url: 'http://localhost:5173' });
  });

  // Open Gov Portal Button
  btnOpenGov.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://enrollment.donidcr.gov.np/' });
  });
});
