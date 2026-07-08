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
      statusIcon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="pulse"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
      statusTitle.textContent = 'Data Ready!';
      statusDesc.textContent = 'Navigate to DoNIDCR to auto-fill.';

      savedDataContainer.style.display = 'block';
      profilesList.innerHTML = '';
      
      profiles.forEach(p => {
        const isActive = p.id === activeId;
        const div = document.createElement('div');
        div.style.padding = '14px';
        div.style.border = isActive ? '2px solid #2563eb' : '1px solid #e2e8f0';
        div.style.borderRadius = '12px';
        div.style.cursor = 'pointer';
        div.style.backgroundColor = isActive ? '#eff6ff' : '#fff';
        div.style.position = 'relative';
        div.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        div.style.boxShadow = isActive ? '0 4px 6px -1px rgba(37, 99, 235, 0.1)' : 'none';
        
        div.innerHTML = `
          <div style="font-weight: 600; font-size: 0.95rem; color: #0f172a; margin-bottom: 4px; padding-right: 60px;">${p.name || 'Unnamed Profile'}</div>
          <div style="font-size: 0.8rem; color: #475569; display: flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            ${p.citNo || 'N/A'}
          </div>
          <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 8px;">Saved: ${p.timestamp}</div>
          ${isActive ? \`<div style="position: absolute; top: 14px; right: 14px; background: #2563eb; color: white; font-size: 0.65rem; font-weight: 700; padding: 4px 8px; border-radius: 20px; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">ACTIVE</div>\` : ''}
        `;
        
        div.onclick = () => {
          chrome.storage.local.set({ activeProfileId: p.id });
        };
        
        div.onmouseover = () => {
          if (!isActive) {
            div.style.backgroundColor = '#f8fafc';
            div.style.transform = 'translateY(-1px)';
            div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
          }
        };
        div.onmouseout = () => {
          if (!isActive) {
            div.style.backgroundColor = '#fff';
            div.style.transform = 'none';
            div.style.boxShadow = 'none';
          }
        };
        
        profilesList.appendChild(div);
      });
    } else {
      // Waiting for data
      statusContainer.className = 'status-card waiting';
      statusIcon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
      statusTitle.textContent = 'Awaiting Data';
      statusDesc.textContent = 'Please extract your NID data first.';
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
