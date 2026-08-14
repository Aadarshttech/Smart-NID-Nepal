document.addEventListener('DOMContentLoaded', () => {
  const statusContainer = document.getElementById('statusContainer');
  const statusIcon = document.getElementById('statusIcon');
  const statusTitle = document.getElementById('statusTitle');
  const statusDesc = document.getElementById('statusDesc');

  const savedDataContainer = document.getElementById('savedDataContainer');
  const profilesList = document.getElementById('profilesList');

  const btnOpenApp = document.getElementById('btnOpenApp');
  const btnOpenGov = document.getElementById('btnOpenGov');

  function escapeHTML(str) {
    return String(str || '').replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag]));
  }

  function updateUI(profiles, activeId) {
    if (profiles && profiles.length > 0) {
      // Data is ready
      statusContainer.className = 'stream-status ready';
      statusTitle.textContent = '[ STATUS: DATA_READY ]';
      statusDesc.textContent = 'Awaiting DoNIDCR injection.';

      savedDataContainer.style.display = 'block';
      profilesList.innerHTML = '';
      
      profiles.forEach(p => {
        const isActive = p.id === activeId;
        const div = document.createElement('div');
        div.style.padding = '1rem';
        div.style.borderBottom = '1px solid var(--hairline)';
        div.style.backgroundColor = isActive ? 'var(--bg-secondary)' : 'var(--bg-card)';
        div.style.position = 'relative';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.gap = '0.25rem';
        div.style.cursor = 'pointer';
        
        // Active indicator on left border
        if (isActive) {
          div.style.boxShadow = 'inset 3px 0 0 var(--crimson)';
        }
        
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--ink-primary);">${escapeHTML(p.name) || 'Unnamed Profile'}</div>
            ${isActive ? '<div style="font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: var(--crimson); text-transform: uppercase; letter-spacing: 0.05em; background: #FFE4E6; padding: 2px 6px;">[ ACTIVE ]</div>' : ''}
          </div>
          <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--ink-secondary);">
            CID: ${escapeHTML(p.citNo) || 'N/A'}
          </div>
          <div style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--ink-muted); text-transform: uppercase;">
            SAVED: ${escapeHTML(p.timestamp)}
          </div>
          <div class="delete-profile-btn" style="position: absolute; bottom: 1rem; right: 1rem; color: var(--ink-muted); cursor: pointer;" title="Delete Profile">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </div>
        `;
        
        div.querySelector('.delete-profile-btn').onclick = (e) => {
          e.stopPropagation();
          chrome.storage.local.get(["savedProfiles", "activeProfileId"], (res) => {
            const newProfiles = (res.savedProfiles || []).filter(prof => prof.id !== p.id);
            let newActive = res.activeProfileId;
            if (newActive === p.id) {
              newActive = newProfiles.length > 0 ? newProfiles[0].id : null;
            }
            chrome.storage.local.set({ savedProfiles: newProfiles, activeProfileId: newActive });
          });
        };
        
        div.querySelector('.delete-profile-btn').onmouseover = function() {
          this.style.color = 'var(--crimson)';
        };
        div.querySelector('.delete-profile-btn').onmouseout = function() {
          this.style.color = 'var(--ink-muted)';
        };
        
        div.onclick = () => {
          chrome.storage.local.set({ activeProfileId: p.id });
        };
        
        div.onmouseover = () => {
          if (!isActive) {
            div.style.backgroundColor = 'var(--bg-secondary)';
          }
        };
        div.onmouseout = () => {
          if (!isActive) {
            div.style.backgroundColor = 'var(--bg-card)';
          }
        };
        
        profilesList.appendChild(div);
      });
      // Remove last border bottom
      if (profilesList.lastElementChild) {
        profilesList.lastElementChild.style.borderBottom = 'none';
      }
    } else {
      // Waiting for data
      statusContainer.className = 'stream-status waiting';
      statusTitle.textContent = '[ STATUS: AWAITING ]';
      statusDesc.textContent = 'Extract NID data first.';
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
    chrome.tabs.create({ url: 'https://smartnid.aadarshapandit.com.np/' });
  });

  // Open Gov Portal Button
  btnOpenGov.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://enrollment.donidcr.gov.np/' });
  });
});
