(function() {
  // 1. Check for configuration bridge (allows auto-login and credentials sync from Dashboard)
  const checkConfigBridge = () => {
    const bridge = document.getElementById('beacon-extension-bridge');
    if (bridge) {
      const token = bridge.getAttribute('data-token');
      const dashboardUrl = bridge.getAttribute('data-url');
      if (token && dashboardUrl) {
        chrome.runtime.sendMessage({ 
          action: 'syncConfig', 
          config: { token, dashboardUrl } 
        });
      }
    }
  };

  // Run immediately and listen for changes
  checkConfigBridge();
  const observer = new MutationObserver((mutations) => {
    checkConfigBridge();
  });
  observer.observe(document.documentElement, { 
    childList: true, 
    subtree: true,
    attributes: true,
    attributeFilter: ['data-token', 'data-url']
  });

  // If this is the dashboard workspace, sync configurations and do not inject button/drawer
  if (document.getElementById('beacon-extension-bridge') || (window.location.pathname.startsWith('/dashboard') && (window.location.hostname.includes('localhost') || window.location.hostname.includes('vercel.app')))) {
    return;
  }

  // Prevent duplicate insertion
  if (window.__jobTrackerInjected) return;
  window.__jobTrackerInjected = true;

  // Platform Definitions
  const PLATFORMS = {
    LINKEDIN: 'LinkedIn',
    INDEED: 'Indeed',
    NAUKRI: 'Naukri',
    INTERNSHALA: 'Internshala',
    GLASSDOOR: 'Glassdoor',
    GREENHOUSE: 'Greenhouse',
    LEVER: 'Lever',
    WORKDAY: 'Workday',
    WELLFOUND: 'Wellfound',
    INSTAHYRE: 'Instahyre',
    OTHER: 'Other'
  };

  const getPlatform = () => {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('linkedin.com')) return PLATFORMS.LINKEDIN;
    if (host.includes('indeed.com')) return PLATFORMS.INDEED;
    if (host.includes('naukri.com')) return PLATFORMS.NAUKRI;
    if (host.includes('internshala.com')) return PLATFORMS.INTERNSHALA;
    if (host.includes('glassdoor.com')) return PLATFORMS.GLASSDOOR;
    if (host.includes('greenhouse.io')) return PLATFORMS.GREENHOUSE;
    if (host.includes('lever.co')) return PLATFORMS.LEVER;
    if (host.includes('myworkdayjobs.com')) return PLATFORMS.WORKDAY;
    if (host.includes('wellfound.com')) return PLATFORMS.WELLFOUND;
    if (host.includes('instahyre.com')) return PLATFORMS.INSTAHYRE;
    return PLATFORMS.OTHER;
  };

  // Helper: Get metadata from tags
  const getMeta = (names) => {
    for (let name of names) {
      const el = document.querySelector(`meta[name='${name}'], meta[property='${name}']`);
      if (el && el.getAttribute('content')) {
        return el.getAttribute('content').trim();
      }
    }
    return '';
  };

  // Helper: Clean up URLs for tracking platforms to ensure clean links on dashboard
  const getCleanUrl = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('linkedin.com')) {
        const jobId = urlObj.searchParams.get('currentJobId');
        if (jobId) {
          return `https://www.linkedin.com/jobs/view/${jobId}/`;
        }
        const match = urlObj.pathname.match(/\/jobs\/view\/(\d+)/);
        if (match) {
          return `https://www.linkedin.com/jobs/view/${match[1]}/`;
        }
      }
      if (urlObj.hostname.includes('indeed.com')) {
        const jk = urlObj.searchParams.get('vjk') || urlObj.searchParams.get('jk');
        if (jk) {
          return `https://www.indeed.com/viewjob?jk=${jk}`;
        }
      }
    } catch (e) {
      console.warn('Error cleaning URL', e);
    }
    return url;
  };

  // Helper to show a premium toast notification on the page
  const showToast = (title, message, isError = false) => {
    let container = document.getElementById('beacon-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'beacon-toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid ${isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(99, 102, 241, 0.4)'};
      color: #f8fafc;
      padding: 16px 20px;
      border-radius: 12px;
      width: 340px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(99, 102, 241, 0.2);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      pointer-events: auto;
      transform: translateY(40px) scale(0.95);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s;
      opacity: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-sizing: border-box;
    `;

    const iconColor = isError ? '#ef4444' : '#10b981';
    const iconSvg = isError 
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;

    toast.innerHTML = `
      <div style="margin-top: 2px; flex-shrink: 0;">${iconSvg}</div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #ffffff; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${title}</div>
        <div style="font-size: 12px; color: #94a3b8; line-height: 1.4; word-wrap: break-word;">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    // Force reflow and show
    setTimeout(() => {
      toast.style.transform = 'translateY(0) scale(1)';
      toast.style.opacity = '1';
    }, 50);

    const removeToast = () => {
      toast.style.transform = 'translateY(20px) scale(0.95)';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
        if (container.children.length === 0) {
          container.remove();
        }
      }, 400);
    };

    setTimeout(removeToast, 4000);
  };

  let lastTrackedUrl = '';
  let lastTrackedTime = 0;

  // Site Scrapers
  const scrapers = {
    [PLATFORMS.LINKEDIN]: () => {
      // Find the active visible details container first to avoid querying stale DOM elements from recycled SPA views
      let container = document;
      const containers = document.querySelectorAll('.jobs-search-two-pane__details, .jobs-details, .jobs-details__main-content');
      for (const c of containers) {
        const rect = c.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && window.getComputedStyle(c).display !== 'none') {
          container = c;
          break;
        }
      }

      const title = container.querySelector('.job-details-jobs-unified-top-card__job-title')?.innerText ||
                    container.querySelector('.jobs-details__main-content h1')?.innerText ||
                    container.querySelector('.p5')?.innerText || '';
      
      const company = container.querySelector('.job-details-jobs-unified-top-card__company-name')?.innerText ||
                      container.querySelector('.jobs-unified-top-card__company-name')?.innerText ||
                      container.querySelector('.jobs-details__main-content .jobs-unified-top-card__company-name')?.innerText || '';
      
      const location = container.querySelector('.job-details-jobs-unified-top-card__bullet')?.innerText ||
                       container.querySelector('.jobs-unified-top-card__bullet-point')?.innerText || '';
      
      const description = container.querySelector('.jobs-description__content')?.innerText ||
                          container.querySelector('.jobs-description')?.innerText || '';

      return { title, company, location, description };
    },

    [PLATFORMS.INDEED]: () => {
      // Scope to active container on Indeed SPA
      let container = document;
      const containers = document.querySelectorAll('.jobsearch-RightPane, #jobsearch-ViewjobPaneWrapper, .jobsearch-JobComponent');
      for (const c of containers) {
        const rect = c.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && window.getComputedStyle(c).display !== 'none') {
          container = c;
          break;
        }
      }

      const title = container.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.innerText ||
                    container.querySelector('.jobsearch-JobInfoHeader-title')?.innerText || '';
      
      const company = container.querySelector('[data-testid="inlineHeader-companyName"]')?.innerText ||
                      container.querySelector('.jobsearch-InlineCompanyRating div')?.innerText || '';
      
      const location = container.querySelector('[data-testid="jobsearch-JobInfoHeader-companyLocation"]')?.innerText ||
                       container.querySelector('.jobsearch-JobInfoHeader-companyLocation')?.innerText || '';
      
      const description = container.querySelector('#jobDescriptionText')?.innerText ||
                          container.querySelector('.jobsearch-jobDescriptionText')?.innerText || '';

      return { title, company, location, description };
    },

    [PLATFORMS.NAUKRI]: () => {
      const title = document.querySelector('.jd-header-title')?.innerText || '';
      const company = document.querySelector('.jd-header-comp-name')?.innerText || '';
      const location = document.querySelector('.location')?.innerText || '';
      const description = document.querySelector('.job-desc')?.innerText || '';

      return { title, company, location, description };
    },

    [PLATFORMS.INTERNSHALA]: () => {
      const title = document.querySelector('.profile_title')?.innerText || '';
      const company = document.querySelector('.company_name')?.innerText || '';
      const location = document.querySelector('.location_link')?.innerText || '';
      const description = document.querySelector('.job_description')?.innerText || '';

      return { title, company, location, description };
    },

    [PLATFORMS.GLASSDOOR]: () => {
      const title = document.querySelector('[data-test="job-title"]')?.innerText ||
                    document.querySelector('.JobDetails_jobTitle__InEEW')?.innerText || '';
      const company = document.querySelector('[data-test="employer-name"]')?.innerText ||
                      document.querySelector('.JobDetails_employerName__nSpuZ')?.innerText || '';
      const location = document.querySelector('[data-test="location"]')?.innerText || '';
      const description = document.querySelector('.JobDetails_jobDescriptionWrapper___Signature')?.innerText || '';

      return { title, company, location, description };
    },

    [PLATFORMS.GREENHOUSE]: () => {
      const title = document.querySelector('#header h1')?.innerText ||
                    document.querySelector('.app-title')?.innerText || '';
      const company = document.querySelector('.company-name')?.innerText || 
                      getMeta(['og:site_name']) || '';
      const location = document.querySelector('.location')?.innerText || '';
      const description = document.querySelector('#content')?.innerText || '';

      return { title, company, location, description };
    },

    [PLATFORMS.LEVER]: () => {
      const title = document.querySelector('.posting-header h2')?.innerText || '';
      const company = document.querySelector('.posting-header .company')?.innerText || 
                      getMeta(['og:site_name']) || '';
      const location = document.querySelector('.posting-categories .location')?.innerText || '';
      const description = document.querySelector('.section-wrapper')?.innerText || '';

      return { title, company, location, description };
    },

    [PLATFORMS.WORKDAY]: () => {
      const title = document.querySelector('[data-automation-id="jobPostingHeader"]')?.innerText || '';
      const company = document.querySelector('[data-automation-id="companyName"]')?.innerText || 
                      getMeta(['og:site_name']) || '';
      const location = document.querySelector('[data-automation-id="location"]')?.innerText || '';
      const description = document.querySelector('[data-automation-id="jobDescription"]')?.innerText || '';

      return { title, company, location, description };
    },

    [PLATFORMS.WELLFOUND]: () => {
      const title = document.querySelector('.job-title')?.innerText || document.querySelector('h1')?.innerText || '';
      const company = document.querySelector('.company-name')?.innerText || '';
      const location = document.querySelector('.location')?.innerText || '';
      const description = document.querySelector('.job-description')?.innerText || '';

      return { title, company, location, description };
    },

    [PLATFORMS.INSTAHYRE]: () => {
      const title = document.querySelector('.company-desc h1')?.innerText || 
                    document.querySelector('.job-title')?.innerText || 
                    document.querySelector('h1')?.innerText || '';
      const company = document.querySelector('.company-desc h2')?.innerText || 
                      document.querySelector('a.company-link')?.innerText || 
                      document.querySelector('.company-name')?.innerText || '';
      const location = document.querySelector('.job-header .location')?.innerText || 
                       document.querySelector('.location')?.innerText || '';
      const description = document.querySelector('#job-description')?.innerText || 
                          document.querySelector('.job-description')?.innerText || '';

      return { title, company, location, description };
    }
  };

  // Fallback Scraper
  const scrapeFallback = () => {
    const title = document.querySelector('h1')?.innerText || document.title || '';
    const company = getMeta(['twitter:creator', 'application-name', 'author']) || '';
    const location = '';
    const description = getMeta(['og:description', 'description']) || '';
    return { title, company, location, description };
  };

  const scrapeJob = () => {
    const platform = getPlatform();
    let data = { title: '', company: '', location: '', description: '' };
    
    if (scrapers[platform]) {
      try {
        data = scrapers[platform]();
      } catch (err) {
        console.warn('Scraper failed, using fallback', err);
        data = scrapeFallback();
      }
    } else {
      data = scrapeFallback();
    }

    // Advanced screening: If company matches the platform name itself, empty it
    let rawCompany = (data.company || '').trim().replace(/\s+/g, ' ');
    const cleanedCompanyLower = rawCompany.toLowerCase();
    
    const platformsKeywords = ['linkedin', 'indeed', 'naukri', 'internshala', 'glassdoor', 'greenhouse', 'lever', 'workday', 'wellfound', 'instahyre', 'google', 'host'];
    
    // We only filter it if it matches the current platform (e.g. site_name is Instahyre and platform is Instahyre)
    // or if the company matches typical job boards keywords.
    const isPlatformName = platformsKeywords.some(kw => {
      // If we are on LinkedIn, and company says LinkedIn, it might be that they are applying to LinkedIn itself.
      // But typically, we should clear it if it matches our platform name AND we are scraping from that platform
      return cleanedCompanyLower === kw && kw === platform.toLowerCase();
    });

    if (isPlatformName || cleanedCompanyLower === 'og:site_name' || cleanedCompanyLower.includes('job board')) {
      rawCompany = '';
    }

    return {
      title: (data.title || '').trim().replace(/\s+/g, ' '),
      company: rawCompany.replace(/[\d\.\-\★]+$/, '').trim(), // Clean up ratings if appended
      location: (data.location || '').trim().replace(/\s+/g, ' '),
      description: (data.description || '').trim(),
      platform: platform,
      url: getCleanUrl(window.location.href),
      dateApplied: new Date().toISOString().split('T')[0]
    };
  };

  // Inject Styles
  const style = document.createElement('style');
  style.textContent = `
    #jat-floating-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff;
      border: none;
      border-radius: 50px;
      padding: 14px 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4), 0 8px 10px -6px rgba(99, 102, 241, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #jat-floating-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.5), 0 10px 10px -5px rgba(99, 102, 241, 0.5);
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
    }
    #jat-floating-btn:active {
      transform: translateY(0);
    }
    #jat-drawer {
      position: fixed;
      top: 0;
      right: -420px;
      width: 380px;
      height: 100vh;
      background: #0f172a;
      color: #f8fafc;
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
      z-index: 2147483647;
      transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 24px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      border-left: 1px solid #1e293b;
    }
    #jat-drawer.open {
      right: 0;
    }
    #jat-drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 12px;
    }
    #jat-drawer-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #f8fafc;
    }
    #jat-drawer-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 20px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }
    #jat-drawer-close:hover {
      color: #f8fafc;
    }
    .jat-form-group {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .jat-form-group label {
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .jat-form-group input, .jat-form-group select, .jat-form-group textarea {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #f8fafc;
      padding: 10px 12px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
      width: 100%;
    }
    .jat-form-group input:focus, .jat-form-group select:focus, .jat-form-group textarea:focus {
      border-color: #6366f1;
    }
    .jat-form-group textarea {
      resize: vertical;
      min-height: 80px;
    }
    #jat-submit-btn {
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      margin-top: auto;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    #jat-submit-btn:hover {
      background: #4f46e5;
    }
    #jat-submit-btn:disabled {
      background: #334155;
      color: #94a3b8;
      cursor: not-allowed;
    }
    .jat-alert {
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
      display: none;
    }
    .jat-alert-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid #10b981;
      color: #34d399;
      display: block;
    }
    .jat-alert-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #ef4444;
      color: #f87171;
      display: block;
    }
    #jat-confirm-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(4px);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      box-sizing: border-box;
    }
    #jat-confirm-overlay.show {
      opacity: 1;
      pointer-events: auto;
    }
    #jat-confirm-card {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 24px;
      width: 360px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      color: #f8fafc;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transform: scale(0.95);
      transition: transform 0.2s ease;
    }
    #jat-confirm-overlay.show #jat-confirm-card {
      transform: scale(1);
    }
    #jat-confirm-header {
      font-weight: 700;
      font-size: 16px;
      margin: 0;
      color: #f8fafc;
    }
    #jat-confirm-body {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
    }
    #jat-confirm-body strong {
      color: #f8fafc;
    }
    #jat-confirm-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }
    .jat-confirm-btn {
      flex: 1;
      border: none;
      border-radius: 6px;
      padding: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      outline: none;
    }
    .jat-confirm-btn:disabled {
      background: #334155 !important;
      color: #94a3b8 !important;
      cursor: not-allowed;
    }
    .jat-confirm-btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
    }
    .jat-confirm-btn-primary:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
    }
    .jat-confirm-btn-secondary {
      background: #1e293b;
      border: 1px solid #334155;
      color: #94a3b8;
    }
    .jat-confirm-btn-secondary:hover {
      background: #334155;
      color: #f8fafc;
    }
  `;
  document.head.appendChild(style);

  // Create Button
  const btn = document.createElement('button');
  btn.id = 'jat-floating-btn';
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
    Track Job
  `;
  document.body.appendChild(btn);

  // Create Drawer HTML
  const drawer = document.createElement('div');
  drawer.id = 'jat-drawer';
  drawer.innerHTML = `
    <div id="jat-drawer-header">
      <h3>Track This Job</h3>
      <button id="jat-drawer-close">&times;</button>
    </div>
    <div id="jat-alert" class="jat-alert"></div>
    <div style="flex: 1; overflow-y: auto; padding-right: 4px;">
      <div class="jat-form-group">
        <label>Job Title</label>
        <input type="text" id="jat-title">
      </div>
      <div class="jat-form-group">
        <label>Company</label>
        <input type="text" id="jat-company">
      </div>
      <div class="jat-form-group">
        <label>Location</label>
        <input type="text" id="jat-location">
      </div>
      <div class="jat-form-group">
        <label>Platform</label>
        <select id="jat-platform">
          <option value="LinkedIn">LinkedIn</option>
          <option value="Indeed">Indeed</option>
          <option value="Naukri">Naukri</option>
          <option value="Internshala">Internshala</option>
          <option value="Glassdoor">Glassdoor</option>
          <option value="Greenhouse">Greenhouse</option>
          <option value="Lever">Lever</option>
          <option value="Workday">Workday</option>
          <option value="Wellfound">Wellfound</option>
          <option value="Instahyre">Instahyre</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="jat-form-group">
        <label>URL</label>
        <input type="text" id="jat-url">
      </div>
      <div class="jat-form-group">
        <label>Date Applied</label>
        <input type="date" id="jat-date">
      </div>
      <div class="jat-form-group">
        <label>Job Description Preview</label>
        <textarea id="jat-description" placeholder="No description scraped. Paste highlights here..."></textarea>
      </div>
    </div>
    <button id="jat-submit-btn">Save Application</button>
  `;
  document.body.appendChild(drawer);

  // Create Custom Confirm Modal HTML
  const confirmOverlay = document.createElement('div');
  confirmOverlay.id = 'jat-confirm-overlay';
  confirmOverlay.innerHTML = `
    <div id="jat-confirm-card">
      <h4 id="jat-confirm-header">Track Application?</h4>
      <div id="jat-confirm-body">
        Did you apply to <strong id="jat-confirm-title"></strong> at <strong id="jat-confirm-company"></strong>?
      </div>
      <div id="jat-confirm-alert" class="jat-alert" style="display:none; font-size:12px; margin-bottom:0;"></div>
      <div id="jat-confirm-actions">
        <button id="jat-confirm-yes" class="jat-confirm-btn jat-confirm-btn-primary">Yes, I Applied</button>
        <button id="jat-confirm-no" class="jat-confirm-btn jat-confirm-btn-secondary">No / Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(confirmOverlay);

  // Selectors
  const drawerClose = document.getElementById('jat-drawer-close');
  const submitBtn = document.getElementById('jat-submit-btn');
  const alertEl = document.getElementById('jat-alert');

  const fields = {
    title: document.getElementById('jat-title'),
    company: document.getElementById('jat-company'),
    location: document.getElementById('jat-location'),
    platform: document.getElementById('jat-platform'),
    url: document.getElementById('jat-url'),
    date: document.getElementById('jat-date'),
    description: document.getElementById('jat-description')
  };

  let currentConfirmJob = null;

  const openConfirmModal = (jobData) => {
    currentConfirmJob = jobData;
    document.getElementById('jat-confirm-title').innerText = jobData.jobTitle;
    document.getElementById('jat-confirm-company').innerText = jobData.companyName || 'this company';
    
    const confirmAlert = document.getElementById('jat-confirm-alert');
    confirmAlert.style.display = 'none';
    confirmAlert.className = 'jat-alert';
    
    const yesBtn = document.getElementById('jat-confirm-yes');
    yesBtn.disabled = false;
    yesBtn.innerText = 'Yes, I Applied';
    
    confirmOverlay.classList.add('show');
  };

  const closeConfirmModal = () => {
    confirmOverlay.classList.remove('show');
    currentConfirmJob = null;
  };

  // Confirm Actions Event Listeners
  document.getElementById('jat-confirm-no').addEventListener('click', closeConfirmModal);
  document.getElementById('jat-confirm-yes').addEventListener('click', () => {
    const yesBtn = document.getElementById('jat-confirm-yes');
    const confirmAlert = document.getElementById('jat-confirm-alert');
    
    yesBtn.disabled = true;
    yesBtn.innerText = 'Saving...';
    confirmAlert.style.display = 'none';

    chrome.runtime.sendMessage({ action: 'trackJob', job: currentConfirmJob }, (response) => {
      if (chrome.runtime.lastError) {
        confirmAlert.innerText = 'Connection error! Extension worker might be sleeping. Try refreshing.';
        confirmAlert.className = 'jat-alert jat-alert-error';
        yesBtn.disabled = false;
        yesBtn.innerText = 'Yes, I Applied';
        return;
      }

      if (response && response.success) {
        confirmAlert.innerText = 'Success! Application saved.';
        confirmAlert.className = 'jat-alert jat-alert-success';
        setTimeout(() => {
          closeConfirmModal();
        }, 1500);
      } else {
        confirmAlert.innerText = response?.error || 'Failed to save. Open extension popup to check Supabase JWT configuration.';
        confirmAlert.className = 'jat-alert jat-alert-error';
        yesBtn.disabled = false;
        yesBtn.innerText = 'Yes, I Applied';
      }
    });
  });

  const openDrawer = () => {
    const data = scrapeJob();
    fields.title.value = data.title;
    fields.company.value = data.company;
    fields.location.value = data.location;
    fields.platform.value = data.platform;
    fields.url.value = data.url;
    fields.date.value = data.dateApplied;
    fields.description.value = data.description.substring(0, 500);

    alertEl.style.display = 'none';
    alertEl.className = 'jat-alert';
    submitBtn.disabled = false;
    submitBtn.innerText = 'Save Application';

    drawer.classList.add('open');
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
  };

  btn.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);

  // Submit Handler
  submitBtn.addEventListener('click', () => {
    submitBtn.disabled = true;
    submitBtn.innerText = 'Saving...';
    alertEl.style.display = 'none';

    const jobData = {
      jobTitle: fields.title.value.trim(),
      companyName: fields.company.value.trim(),
      location: fields.location.value.trim(),
      platform: fields.platform.value,
      url: fields.url.value.trim(),
      jobDescription: fields.description.value.substring(0, 500),
      dateApplied: fields.date.value
    };

    if (!jobData.jobTitle || !jobData.companyName) {
      alertEl.innerText = 'Job Title and Company Name are required!';
      alertEl.className = 'jat-alert jat-alert-error';
      submitBtn.disabled = false;
      submitBtn.innerText = 'Save Application';
      return;
    }

    // Send message to background script
    chrome.runtime.sendMessage({ action: 'trackJob', job: jobData }, (response) => {
      if (chrome.runtime.lastError) {
        alertEl.innerText = 'Connection error! Extension worker might be sleeping. Try refreshing.';
        alertEl.className = 'jat-alert jat-alert-error';
        submitBtn.disabled = false;
        submitBtn.innerText = 'Save Application';
        return;
      }

      if (response && response.success) {
        alertEl.innerText = 'Success! Job application saved.';
        alertEl.className = 'jat-alert jat-alert-success';
        setTimeout(() => {
          closeDrawer();
        }, 1500);
      } else {
        alertEl.innerText = response?.error || 'Failed to save application. Ensure Supabase Token is set in Extension popup.';
        alertEl.className = 'jat-alert jat-alert-error';
        submitBtn.disabled = false;
        submitBtn.innerText = 'Save Application';
      }
    });
  });

  // Listen to Clicks on Apply Buttons (auto-prompt to save)
  const applySelectors = [
    '[data-control-name="jobdetails_topcard_inapply"]',
    '#apply-button',
    '.jobs-apply-button',
    '.indeed-apply-button',
    '.apply-button',
    'button.apply',
    'a.apply'
  ];

  document.addEventListener('click', (e) => {
    const target = e.target;
    
    // 1. Check for standard external apply links/buttons (on job boards)
    const isApplyBtn = applySelectors.some(selector => {
      const match = target.matches(selector) || target.closest(selector);
      if (match) {
        // Exclude the initial "Easy Apply" trigger button, as we only want to prompt on final application submit
        const text = (match.innerText || match.textContent || '').toLowerCase();
        if (text.includes('easy apply') || text.includes('easy-apply')) {
          return false;
        }
        return true;
      }
      return false;
    });

    // 2. Check for easy apply/submit buttons (on boards or company portals)
    const buttonText = (target.innerText || target.value || '').toLowerCase().trim();
    const isSubmitBtn = 
      target.matches('button[aria-label="Submit application"]') ||
      target.closest('button[aria-label="Submit application"]') ||
      target.matches('.jobs-easy-apply-modal__submit-button') ||
      target.closest('.jobs-easy-apply-modal__submit-button') ||
      target.matches('button[data-control-name="submit_unify"]') ||
      target.closest('button[data-control-name="submit_unify"]') ||
      target.matches('input[type="submit"][value*="Submit"]') ||
      target.matches('input[type="submit"][value*="Apply"]') ||
      target.matches('button[type="submit"]') ||
      target.matches('[id*="submit-button"]') ||
      target.closest('[id*="submit-button"]') ||
      target.matches('[class*="submit-button"]') ||
      target.closest('[class*="submit-button"]') ||
      buttonText === 'submit application' || 
      buttonText === 'submit' ||
      buttonText === 'apply' ||
      buttonText === 'apply now' ||
      buttonText === 'submit application now';

    // 3. Heuristic: Check if the current page is indeed a job application/portal page
    // (This prevents prompting when users log in, search, or submit forms on non-job pages)
    const hasResumeInput = !!document.querySelector('input[type="file"][accept*="pdf"], input[type="file"][name*="resume"], input[type="file"][id*="resume"], input[type="file"][id*="cv"], input[type="file"][name*="cv"], input[type="file"][accept*="word"]');
    const url = window.location.href.toLowerCase();
    
    const isKnownJobBoardOrPortal = [
      'linkedin.com/jobs', 'indeed.com', 'naukri.com', 'internshala.com', 
      'glassdoor.com', 'greenhouse.io', 'lever.co', 'myworkdayjobs.com', 
      'wellfound.com', 'instahyre.com'
    ].some(host => url.includes(host));

    const isJobUrlContext = url.includes('/job') || url.includes('/career') || url.includes('/posting') || url.includes('/apply') || url.includes('recruiting');

    const isValidJobContext = isKnownJobBoardOrPortal || hasResumeInput || isJobUrlContext;

    if (isApplyBtn || (isSubmitBtn && isValidJobContext)) {
      // Small timeout to allow Easy Apply animations or external navigation redirect setups
      setTimeout(() => {
        if (drawer.classList.contains('open') || confirmOverlay.classList.contains('show')) return;

        const data = scrapeJob();
        const jobData = {
          jobTitle: data.title,
          companyName: data.company,
          location: data.location,
          platform: data.platform,
          url: data.url,
          jobDescription: data.description.substring(0, 500),
          dateApplied: data.dateApplied
        };

        // Double tracking prevention
        const now = Date.now();
        if (jobData.url === lastTrackedUrl && (now - lastTrackedTime < 10000)) {
          console.log('Beacon: Prevented duplicate track event for URL:', jobData.url);
          return;
        }

        // If it's a submit action (e.g., Easy Apply final click), auto-save silently!
        if (isSubmitBtn) {
          if (!jobData.jobTitle || !jobData.companyName) {
            // Missing info, let user fill it out manually in the drawer
            openDrawer();
          } else {
            // Save clean URL and time to cache to avoid duplicate submission triggers
            lastTrackedUrl = jobData.url;
            lastTrackedTime = now;

            chrome.runtime.sendMessage({ action: 'trackJob', job: jobData }, (response) => {
              if (chrome.runtime.lastError) {
                showToast('Tracking Failed', 'Connection error. Please refresh the page.', true);
                return;
              }
              if (response && response.success) {
                showToast('Job Tracked!', `Automatically saved <strong>${jobData.jobTitle}</strong> at <strong>${jobData.companyName}</strong>.`);
              } else {
                showToast('Save Failed', response?.error || 'Failed to auto-save application.', true);
              }
            });
          }
        } else {
          // Standard external Apply button
          if (!jobData.jobTitle || !jobData.companyName) {
            openDrawer();
          } else {
            openConfirmModal(jobData);
          }
        }
      }, 850);
    }
  });

  // Periodically check for SPA URL transitions to update the drawer fields if they are open
  let lastUrl = window.location.href;
  
  const updateDrawerFieldsIfOpen = () => {
    if (!drawer.classList.contains('open')) return;

    let attempts = 0;
    const maxAttempts = 6;
    const originalTitle = fields.title.value;

    const pollDetails = () => {
      const data = scrapeJob();
      if (data.title && data.title !== originalTitle) {
        fields.title.value = data.title;
        fields.company.value = data.company;
        fields.location.value = data.location;
        fields.platform.value = data.platform;
        fields.url.value = data.url;
        fields.date.value = data.dateApplied;
        fields.description.value = data.description.substring(0, 500);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(pollDetails, 400);
      }
    };
    
    setTimeout(pollDetails, 200);
  };

  const checkUrlChange = () => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      updateDrawerFieldsIfOpen();
    }
  };
  
  setInterval(checkUrlChange, 500);

})();
