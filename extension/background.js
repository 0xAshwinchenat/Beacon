// Fallback 1x1 transparent PNG for notifications icon
const fallbackIconUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Action 1: Auto-Synchronize configuration from dashboard bridge
  if (request.action === 'syncConfig') {
    const { token, dashboardUrl } = request.config;
    
    chrome.storage.local.set({
      supabase_token: token,
      dashboard_url: dashboardUrl
    }, () => {
      sendResponse({ success: true });
      // Notify user silently of successful auto-sync on fresh login
      chrome.storage.local.get(['last_sync_time'], (res) => {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        // Show notification at most once per hour to avoid spamming
        if (!res.last_sync_time || (now - res.last_sync_time > oneHour)) {
          showNotification('Beacon Active', 'Session successfully synchronized with dashboard.', false);
          chrome.storage.local.set({ last_sync_time: now });
        }
      });
    });
    return true;
  }

  // Action 2: Track job application via Next.js API Proxy
  if (request.action === 'trackJob') {
    const job = request.job;

    // Retrieve synced credentials
    chrome.storage.local.get(['supabase_token', 'dashboard_url', 'tracked_jobs'], (result) => {
      const { supabase_token, dashboard_url, tracked_jobs = [] } = result;

      if (!supabase_token || !dashboard_url) {
        sendResponse({ 
          success: false, 
          error: 'Extension not authorized! Please open your Beacon Dashboard at least once to sync credentials.' 
        });
        showNotification(
          'Authorization Required', 
          'Open your Beacon Dashboard (e.g. localhost:3000) to automatically sync your session.', 
          true
        );
        return;
      }

      const cleanDashboardUrl = dashboard_url.replace(/\/$/, '');
      const apiUrl = `${cleanDashboardUrl}/api/jobs`;

      // Map to API proxy format (matching NEXT.JS POST route specs)
      const apiPayload = {
        job_title: job.jobTitle,
        company_name: job.companyName,
        location: job.location,
        platform: job.platform,
        url: job.url,
        notes: '',
        job_description: job.jobDescription,
        date_applied: job.dateApplied,
        status: 'Applied' // default board column
      };

      // POST to our Next.js API route with the Bearer authorization token
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase_token}`
        },
        body: JSON.stringify(apiPayload)
      })
      .then(async (response) => {
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `Server error ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Save to local history list (last 5 tracked jobs)
        const updatedJobs = [job, ...tracked_jobs].slice(0, 5);
        chrome.storage.local.set({ tracked_jobs: updatedJobs }, () => {
          sendResponse({ success: true, data });
          showNotification(
            'Job Tracked!',
            `${job.jobTitle} at ${job.companyName} has been saved to your board.`
          );
        });
      })
      .catch((error) => {
        console.error('API Error:', error);
        sendResponse({ success: false, error: error.message });
        showNotification(
          'Tracking Failed',
          `Could not track job: ${error.message}`,
          true
        );
      });
    });

    return true; // Keep the message channel open for async sendResponse
  }
});

// Helper to show notifications
function showNotification(title, message, isError = false) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: fallbackIconUrl,
    title: title,
    message: message,
    priority: isError ? 2 : 0
  });
}
