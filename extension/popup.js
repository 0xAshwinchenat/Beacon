document.addEventListener('DOMContentLoaded', () => {
  const tabHistory = document.getElementById('tabHistory');
  const tabSettings = document.getElementById('tabSettings');
  const panelHistory = document.getElementById('panelHistory');
  const panelSettings = document.getElementById('panelSettings');

  const connectedUrlInput = document.getElementById('connectedUrl');
  const sessionExpiresInput = document.getElementById('sessionExpires');
  const btnForceSync = document.getElementById('btnForceSync');
  const btnOpenDashboard = document.getElementById('btnOpenDashboard');
  const jobList = document.getElementById('jobList');
  const emptyState = document.getElementById('emptyState');
  const alertEl = document.getElementById('alert');

  const statusBadge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');

  // Tab Switching Logic
  tabHistory.addEventListener('click', () => {
    tabHistory.classList.add('active');
    tabSettings.classList.remove('active');
    panelHistory.classList.add('active');
    panelSettings.classList.remove('active');
    loadHistory();
  });

  tabSettings.addEventListener('click', () => {
    tabSettings.classList.add('active');
    tabHistory.classList.remove('active');
    panelSettings.classList.add('active');
    panelHistory.classList.remove('active');
  });

  // Load Configurations
  chrome.storage.local.get(['supabase_token', 'dashboard_url', 'tracked_jobs'], (result) => {
    if (result.dashboard_url) {
      connectedUrlInput.value = result.dashboard_url;
    } else {
      connectedUrlInput.value = 'Not Synced';
    }
    
    updateStatus(result.supabase_token);
    loadHistory(result.tracked_jobs || []);
  });

  // Sync Account / Force Open Dashboard to configure
  btnForceSync.addEventListener('click', () => {
    chrome.storage.local.get(['dashboard_url'], (result) => {
      const url = result.dashboard_url || 'http://localhost:3000/dashboard';
      chrome.tabs.create({ url });
    });
  });

  // Open Dashboard via Footer Button
  btnOpenDashboard.addEventListener('click', () => {
    chrome.storage.local.get(['dashboard_url'], (result) => {
      const url = result.dashboard_url || 'http://localhost:3000/dashboard';
      chrome.tabs.create({ url });
    });
  });

  // Function to show alert message
  function showAlert(message, type) {
    alertEl.innerText = message;
    alertEl.style.display = type === 'none' ? 'none' : 'block';
    alertEl.className = 'alert';
    if (type === 'success') alertEl.classList.add('alert-success');
    if (type === 'error') alertEl.classList.add('alert-error');
  }

  // Update connection status based on token expiration
  function updateStatus(token) {
    if (!token) {
      statusBadge.className = 'status-badge disconnected';
      statusText.innerText = 'Not Configured';
      sessionExpiresInput.value = 'Not Synced';
      return;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const expTimestamp = decodedPayload.exp;
      const currentTimestamp = Math.floor(Date.now() / 1000);

      const expirationDate = new Date(expTimestamp * 1000);
      const timeString = expirationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateString = expirationDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

      if (currentTimestamp > expTimestamp) {
        statusBadge.className = 'status-badge disconnected';
        statusText.innerText = 'Session Expired';
        sessionExpiresInput.value = `Expired on ${dateString} at ${timeString}`;
      } else {
        statusBadge.className = 'status-badge connected';
        statusText.innerText = 'Connected';
        
        // Calculate remaining minutes
        const diffMin = Math.round((expTimestamp - currentTimestamp) / 60);
        if (diffMin < 60) {
          sessionExpiresInput.value = `Expires in ${diffMin}m (${timeString})`;
        } else {
          sessionExpiresInput.value = `Expires today at ${timeString}`;
        }
      }
    } catch (err) {
      statusBadge.className = 'status-badge disconnected';
      statusText.innerText = 'Invalid Config';
      sessionExpiresInput.value = 'Configuration Error';
    }
  }

  // Render last 5 tracked jobs
  function loadHistory(storedJobs) {
    if (storedJobs) {
      renderJobs(storedJobs);
    } else {
      chrome.storage.local.get(['tracked_jobs'], (result) => {
        renderJobs(result.tracked_jobs || []);
      });
    }
  }

  function renderJobs(jobs) {
    jobList.innerHTML = '';
    if (jobs.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    jobs.forEach(job => {
      const li = document.createElement('li');
      li.className = 'job-item';

      const platformClass = `badge-${(job.platform || 'other').toLowerCase()}`;

      li.innerHTML = `
        <div class="job-item-header">
          <div>
            <h4 class="job-title">${escapeHTML(job.jobTitle)}</h4>
            <p class="job-company">${escapeHTML(job.companyName)}</p>
          </div>
          <span class="platform-badge ${platformClass}">${escapeHTML(job.platform)}</span>
        </div>
        <div style="font-size: 10px; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 4px;">
          <span>Applied: ${job.dateApplied}</span>
          <span style="cursor: pointer; color: var(--accent)" class="open-link" data-url="${escapeHTML(job.url)}">View Post</span>
        </div>
      `;

      li.querySelector('.open-link').addEventListener('click', (e) => {
        chrome.tabs.create({ url: e.target.getAttribute('data-url') });
      });

      jobList.appendChild(li);
    });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Real-time synchronization for popup UI if storage changes in background
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      if (changes.supabase_token || changes.dashboard_url) {
        chrome.storage.local.get(['supabase_token', 'dashboard_url'], (result) => {
          connectedUrlInput.value = result.dashboard_url || 'Not Synced';
          updateStatus(result.supabase_token);
        });
      }
      if (changes.tracked_jobs) {
        renderJobs(changes.tracked_jobs.newValue || []);
      }
    }
  });
});
