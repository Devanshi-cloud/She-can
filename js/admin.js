/**
 * admin.js - She Can Foundation Admin Panel Logic
 * Handles: Authentication routing, login, dashboard, data display, deletion
 */

/* =========================================================
   DETECT CURRENT PAGE
   ========================================================= */
const currentPage = window.location.pathname.split('/').pop();
const isLoginPage = currentPage === 'admin-login.html' || currentPage === '';
const isDashboardPage = currentPage === 'admin-dashboard.html';

/* =========================================================
   INITIALIZE BACKEND API
   ========================================================= */
const API_BASE = API_CONFIG.BASE_URL;

// Helper to get authorization headers
function getAuthHeaders() {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

/* =========================================================
   AUTH GUARD — Check session on every admin page load
   Redirect logic:
   - On login page: if already logged in → go to dashboard
   - On dashboard: if not logged in → go to login
   ========================================================= */
async function checkAuthState() {
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    // Not logged in
    if (isDashboardPage) {
      window.location.href = 'admin-login.html';
    } else if (isLoginPage) {
      initLogin();
    }
    return;
  }

  // Token exists - verify session status against backend
  try {
    const response = await fetch(`${API_BASE}/admin/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Invalid or expired token');
    }

    const userData = await response.json();

    if (isLoginPage) {
      // Already logged in, redirect to dashboard
      window.location.href = 'admin-dashboard.html';
    } else if (isDashboardPage) {
      // Logged in — initialize dashboard
      initDashboard(userData);
    }
  } catch (error) {
    console.error('Session verification failed:', error);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    if (isDashboardPage) {
      window.location.href = 'admin-login.html';
    } else if (isLoginPage) {
      initLogin();
    }
  }
}

// Run auth check immediately
checkAuthState();

/* =========================================================
   LOGIN PAGE LOGIC
   ========================================================= */

/**
 * Initialize the login page: set up form handlers
 */
function initLogin() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  const loginBtn = document.getElementById('loginBtn');
  const loginBtnText = document.getElementById('loginBtnText');
  const loginError = document.getElementById('loginError');
  const loginErrorMsg = document.getElementById('loginErrorMsg');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const adminPasswordInput = document.getElementById('adminPassword');
  const adminEmailInput = document.getElementById('adminEmail');

  // Toggle password visibility
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = adminPasswordInput.type === 'password';
      adminPasswordInput.type = isPassword ? 'text' : 'password';
      togglePasswordBtn.innerHTML = isPassword
        ? '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>'
        : '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.74-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
    });
  }

  /**
   * Set loading state for login button
   * @param {boolean} loading
   */
  function setLoginLoading(loading) {
    loginBtn.disabled = loading;
    loginBtnText.innerHTML = loading
      ? '<span class="spinner"></span> Logging in...'
      : 'Login to Dashboard';
  }

  /**
   * Show or hide error message
   * @param {string|null} message - Pass null to hide
   */
  function showLoginError(message) {
    if (message) {
      loginErrorMsg.textContent = message;
      loginError.classList.add('visible');
    } else {
      loginError.classList.remove('visible');
    }
  }

  // Form submit handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoginError(null);

    const email = adminEmailInput.value.trim();
    const password = adminPasswordInput.value;

    // Basic client-side validation
    if (!email || !password) {
      showLoginError('Please enter both email and password.');
      return;
    }

    setLoginLoading(true);

    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid email or password.');
      }

      const data = await response.json();
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));

      // Redirect to dashboard on success
      window.location.href = 'admin-dashboard.html';
    } catch (error) {
      console.error('Login error:', error);
      showLoginError(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  });
}

/* =========================================================
   DASHBOARD PAGE LOGIC
   ========================================================= */

/** Partitioned datasets */
let allSubmissions = [];
let generalContacts = [];
let volunteerApps = [];
let teamMembers = [];

/** ID of submission pending deletion */
let pendingDeleteId = null;

/**
 * Initialize the admin dashboard
 * @param {object} user - Appwrite user object
 */
function initDashboard(user) {
  // Display user info in sidebar
  const sidebarEmail = document.getElementById('sidebarUserEmail');
  const userAvatar = document.getElementById('userAvatarInitial');

  if (sidebarEmail) {
    sidebarEmail.textContent = user.email || 'Admin';
  }

  if (userAvatar) {
    userAvatar.textContent = (user.email || 'A')[0].toUpperCase();
  }

  // Start real-time clock and date widget
  startLiveClock();

  // Load submissions from database
  fetchSubmissions();

  // Attach navigation listeners for tab shifting
  setupNavigation();

  // Set up logout buttons
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  const logoutBtnTop = document.getElementById('logoutBtnTop');
  if (logoutBtnTop) {
    logoutBtnTop.addEventListener('click', () => {
      if (logoutBtn) logoutBtn.click();
    });
  }

  // Set up refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', fetchSubmissions);

  // Set up real-time search inputs
  setupSearch();

  // Set up delete modal
  initDeleteModal();
}

/**
 * Handle Tab Switching Navigation
 */
function setupNavigation() {
  const tabs = [
    { id: 'nav-dashboard', secId: 'section-dashboard', title: 'Dashboard', sub: 'She Can Foundation Admin Portal' },
    { id: 'nav-volunteers', secId: 'section-volunteers', title: 'Applied Volunteers', sub: 'Manage applied candidate details' },
    { id: 'nav-team', secId: 'section-team', title: 'Team Management', sub: 'Manage team and appoint new admins' }
  ];

  tabs.forEach((tab) => {
    const el = document.getElementById(tab.id);
    if (!el) return;

    el.addEventListener('click', (e) => {
      e.preventDefault();

      // Deactivate all sidebar nav links
      tabs.forEach((t) => {
        const link = document.getElementById(t.id);
        if (link) link.classList.remove('active');
        const section = document.getElementById(t.secId);
        if (section) section.style.display = 'none';
      });

      // Activate clicked link and section
      el.classList.add('active');
      const targetSec = document.getElementById(tab.secId);
      if (targetSec) targetSec.style.display = 'block';

      // Update topbar titles
      const h1 = document.querySelector('.topbar-left h1');
      const p = document.querySelector('.topbar-left p');
      if (h1) h1.textContent = tab.title;
      if (p) p.textContent = tab.sub;

      // Close mobile sidebar if open
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    });
  });
}

/**
 * Set up search filtering across separate tables
 */
function setupSearch() {
  const volunteersSearch = document.getElementById('volunteersSearchInput');
  if (volunteersSearch) {
    volunteersSearch.addEventListener('input', () => {
      const q = volunteersSearch.value.trim().toLowerCase();
      const filtered = volunteerApps.filter((doc) => {
        return (doc.name || '').toLowerCase().includes(q) || (doc.email || '').toLowerCase().includes(q) || (doc.message || '').toLowerCase().includes(q);
      });
      renderVolunteers(filtered);
    });
  }
}

/**
 * Fetch all submissions and partition into specific buckets
 */
async function fetchSubmissions() {
  const volLoad = document.getElementById('volunteersLoadingState');
  const teamLoad = document.getElementById('teamLoadingState');

  if (volLoad) volLoad.style.display = 'flex';
  if (teamLoad) teamLoad.style.display = 'flex';

  document.getElementById('volunteersTable').style.display = 'none';
  document.getElementById('teamTable').style.display = 'none';
  document.getElementById('volunteersEmptyState').style.display = 'none';

  try {
    const response = await fetch(`${API_BASE}/admin/submissions`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents from server');
    }

    const resData = await response.json();
    allSubmissions = resData.documents;

    // Partition datasets
    generalContacts = allSubmissions.filter((doc) => {
      const msg = doc.message || '';
      return !msg.startsWith('[VOLUNTEER APPLICATION]') && !msg.startsWith('[TEAM MEMBER]');
    });

    volunteerApps = allSubmissions.filter((doc) => {
      return (doc.message || '').startsWith('[VOLUNTEER APPLICATION]');
    });

    teamMembers = allSubmissions.filter((doc) => {
      return (doc.message || '').startsWith('[TEAM MEMBER]');
    });

    // Render tables
    renderVolunteers(volunteerApps);
    renderTeam(teamMembers);

    // Update counts & stats
    updateStats();

    // Render submission activity charts & recent logs
    renderAnalyticsChart(volunteerApps, teamMembers);
    renderRecentActivityList(allSubmissions);

  } catch (error) {
    console.error('Fetch error:', error);
    if (volLoad) volLoad.style.display = 'none';
    if (teamLoad) teamLoad.style.display = 'none';
    document.getElementById('volunteersEmptyState').style.display = 'flex';
  }
}

/**
 * Render Contact submissions
 */
function renderContacts(submissions) {
  const load = document.getElementById('contactsLoadingState');
  const empty = document.getElementById('contactsEmptyState');
  const table = document.getElementById('contactsTable');
  const tbody = document.getElementById('contactsBody');
  const badge = document.getElementById('contactsCountBadge');

  if (load) load.style.display = 'none';

  if (!submissions || submissions.length === 0) {
    empty.style.display = 'flex';
    table.style.display = 'none';
    badge.textContent = '0';
    return;
  }

  empty.style.display = 'none';
  table.style.display = 'table';
  badge.textContent = submissions.length;

  tbody.innerHTML = submissions.map((doc, idx) => {
    const name = escapeHtml(doc.name || 'N/A');
    const email = escapeHtml(doc.email || 'N/A');
    const message = escapeHtml(doc.message || '');
    const dateStr = formatDate(doc.createdAt || doc.$createdAt);
    const initials = getInitials(doc.name || '?');
    const docId = doc.$id;

    return `
      <tr id="row-${docId}">
        <td style="color:var(--text-muted);font-size:0.75rem">${idx + 1}</td>
        <td>
          <div class="td-name">
            <div class="entry-avatar" aria-hidden="true" style="width:28px; height:28px; background:var(--red-light); color:var(--red); font-size:0.7rem; font-weight:700; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-right:8px; vertical-align:middle;">${initials}</div>
            <strong style="vertical-align:middle;">${name}</strong>
          </div>
        </td>
        <td>
          <a href="mailto:${email}" style="color:var(--red);text-decoration:none;font-size:0.82rem">${email}</a>
        </td>
        <td>
          <div class="msg-preview" title="${message}">${message || '—'}</div>
        </td>
        <td><span class="td-date">${dateStr}</span></td>
        <td class="td-action">
          <button class="del-btn" onclick="openDeleteModal('${docId}')" aria-label="Delete message">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Parse volunteer packed message block
 */
function parseVolunteerMessage(msg) {
  const result = {
    phone: 'N/A',
    skills: 'N/A',
    statement: msg
  };
  
  try {
    const phoneMatch = msg.match(/Phone:\s*(.*)/);
    const skillMatch = msg.match(/Area of Interest:\s*(.*)/);
    const statementMatch = msg.split(/Statement of Purpose:\s*/);
    
    if (phoneMatch) result.phone = phoneMatch[1].trim();
    if (skillMatch) result.skills = skillMatch[1].trim();
    if (statementMatch && statementMatch.length > 1) {
      result.statement = statementMatch[1].trim();
    }
  } catch (e) {
    console.warn("Failed to parse volunteer application message:", e);
  }
  return result;
}

/**
 * Render Volunteer applications
 */
function renderVolunteers(submissions) {
  const load = document.getElementById('volunteersLoadingState');
  const empty = document.getElementById('volunteersEmptyState');
  const table = document.getElementById('volunteersTable');
  const tbody = document.getElementById('volunteersBody');
  const badge = document.getElementById('volunteersCountBadge');

  if (load) load.style.display = 'none';

  if (!submissions || submissions.length === 0) {
    empty.style.display = 'flex';
    table.style.display = 'none';
    badge.textContent = '0';
    return;
  }

  empty.style.display = 'none';
  table.style.display = 'table';
  badge.textContent = submissions.length;

  tbody.innerHTML = submissions.map((doc, idx) => {
    const name = escapeHtml(doc.name || 'N/A');
    const email = escapeHtml(doc.email || 'N/A');
    const parsed = parseVolunteerMessage(doc.message || '');
    const phone = escapeHtml(parsed.phone);
    const interest = escapeHtml(parsed.skills);
    const statement = escapeHtml(parsed.statement);
    const dateStr = formatDate(doc.createdAt || doc.$createdAt);
    const docId = doc.$id;

    return `
      <tr id="row-${docId}">
        <td style="color:var(--text-muted);font-size:0.75rem">${idx + 1}</td>
        <td class="td-name"><strong>${name}</strong></td>
        <td>
          <div style="font-size:0.82rem;">
            <a href="mailto:${email}" style="color:var(--red);text-decoration:none;">${email}</a>
            <div style="color:var(--text-muted);font-size:0.75rem;margin-top:2px;">${phone}</div>
          </div>
        </td>
        <td><span class="count-badge" style="background:rgba(59, 130, 246, 0.05); color:#3b82f6; border-color:rgba(59, 130, 246, 0.15); font-size:0.72rem; font-weight:600;">${interest}</span></td>
        <td>
          <div class="msg-preview" style="cursor:pointer;" onclick="openVolunteerModal('${docId}')" title="Click to view full statement">${statement || '—'}</div>
        </td>
        <td><span class="td-date">${dateStr}</span></td>
        <td class="td-action" style="white-space: nowrap;">
          <button class="del-btn" onclick="openVolunteerModal('${docId}')" title="View full details" style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.15); color: #3b82f6; margin-right: 4px;">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
          </button>
          <button class="del-btn" onclick="openDeleteModal('${docId}')" aria-label="Delete application">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Render Appointed Team Members
 */
function renderTeam(submissions) {
  const load = document.getElementById('teamLoadingState');
  const table = document.getElementById('teamTable');
  const tbody = document.getElementById('teamBody');
  const badge = document.getElementById('teamCountBadge');

  if (load) load.style.display = 'none';

  badge.textContent = submissions.length;
  table.style.display = 'table';

  tbody.innerHTML = submissions.map((doc, idx) => {
    const name = escapeHtml(doc.name || 'N/A');
    const email = escapeHtml(doc.email || 'N/A');
    const dateStr = formatDate(doc.createdAt || doc.$createdAt);
    const docId = doc.$id;

    return `
      <tr id="row-${docId}">
        <td style="color:var(--text-muted);font-size:0.75rem">${idx + 1}</td>
        <td class="td-name"><strong>${name}</strong></td>
        <td><span style="font-size:0.82rem;font-weight:500;">${email}</span></td>
        <td><span class="td-date">${dateStr}</span></td>
        <td class="td-action">
          <button class="del-btn" onclick="openDeleteModal('${docId}')" aria-label="Delete team member">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Update the stats block and sidebar volunteer application badges
 */
function updateStats() {
  const volVal = document.getElementById('totalVolunteersVal');
  const teamVal = document.getElementById('totalTeamVal');
  const volBadge = document.getElementById('volSidebarBadge');

  if (volVal) volVal.textContent = volunteerApps.length;
  if (volBadge) volBadge.textContent = volunteerApps.length;
  if (teamVal) teamVal.textContent = teamMembers.length + 1; // +1 representing the primary superadmin
}

/**
 * Appoint another Admin Dual Action
 */
async function handleAppointAdmin(e) {
  e.preventDefault();
  const alertEl = document.getElementById('appointAlert');
  const submitBtn = document.getElementById('appointSubmitBtn');
  const submitText = document.getElementById('appointSubmitText');

  const name = document.getElementById('appointName').value.trim();
  const email = document.getElementById('appointEmail').value.trim();
  const password = document.getElementById('appointPassword').value;

  // Hide previous alerts
  alertEl.style.display = 'none';

  submitBtn.disabled = true;
  submitText.innerHTML = '<span class="spinner"></span> Appointing...';

  try {
    const response = await fetch(`${API_BASE}/admin/appoint`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to appoint admin.');
    }

    // Reset Form fields
    document.getElementById('appointAdminForm').reset();

    // Show Success alert
    alertEl.style.display = 'block';
    alertEl.style.background = 'rgba(16,185,129,0.08)';
    alertEl.style.border = '1px solid rgba(16,185,129,0.2)';
    alertEl.style.color = '#10b981';
    alertEl.textContent = `Success! ${name} has been appointed as an Admin.`;

    // Refresh database lists
    fetchSubmissions();

  } catch (error) {
    console.error('Appoint admin error:', error);
    alertEl.style.display = 'block';
    alertEl.style.background = 'rgba(239,68,68,0.08)';
    alertEl.style.border = '1px solid rgba(239,68,68,0.2)';
    alertEl.style.color = '#ef4444';
    alertEl.textContent = `Error: ${error.message || 'Failed to appoint admin.'}`;
  } finally {
    submitBtn.disabled = false;
    submitText.textContent = 'Appoint Administrator';
  }
}

// Bind to window so inline form handler onsubmit="handleAppointAdmin(event)" executes securely
window.handleAppointAdmin = handleAppointAdmin;

/* =========================================================
   DELETE MODAL
   ========================================================= */

/**
 * Initialize delete modal button listeners
 */
function initDeleteModal() {
  const cancelBtn = document.getElementById('cancelDeleteBtn');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const modal = document.getElementById('deleteModal');

  if (cancelBtn) cancelBtn.addEventListener('click', closeDeleteModal);
  if (confirmBtn) confirmBtn.addEventListener('click', handleConfirmDelete);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeDeleteModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeDeleteModal();
    }
  });
}

/**
 * Open the delete confirmation modal
 * @param {string} docId
 */
function openDeleteModal(docId) {
  pendingDeleteId = docId;
  const modal = document.getElementById('deleteModal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close the delete confirmation modal
 */
function closeDeleteModal() {
  pendingDeleteId = null;
  const modal = document.getElementById('deleteModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Handle confirmed deletion — delete from database and update local partition states
 */
async function handleConfirmDelete() {
  if (!pendingDeleteId) return;

  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const deleteText = document.getElementById('deleteText');

  if (confirmBtn) confirmBtn.disabled = true;
  if (deleteText) deleteText.innerHTML = '<span class="spinner"></span> Deleting...';

  try {
    const response = await fetch(`${API_BASE}/admin/submissions/${pendingDeleteId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete message on the server');
    }

    // Remove from local arrays
    allSubmissions = allSubmissions.filter((doc) => doc.$id !== pendingDeleteId);
    generalContacts = generalContacts.filter((doc) => doc.$id !== pendingDeleteId);
    volunteerApps = volunteerApps.filter((doc) => doc.$id !== pendingDeleteId);
    teamMembers = teamMembers.filter((doc) => doc.$id !== pendingDeleteId);

    // Re-render current tables
    renderVolunteers(volunteerApps);
    renderTeam(teamMembers);

    // Refresh stats Counts
    updateStats();

    closeDeleteModal();
  } catch (error) {
    console.error('Delete error:', error);
    alert('Failed to delete. Please try again.');
  } finally {
    if (confirmBtn) confirmBtn.disabled = false;
    if (deleteText) deleteText.textContent = 'Yes, Delete';
  }
}

// Bind open delete modal globally for click callbacks
window.openDeleteModal = openDeleteModal;

/* =========================================================
   LOGOUT
   ========================================================= */

async function handleLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.disabled = true;
    logoutBtn.textContent = 'Logging out...';
  }

  try {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  } catch (e) {
    console.warn('Logout session clear warning:', e);
  } finally {
    window.location.href = 'admin-login.html';
  }
}

/* =========================================================
   UTILITY HELPERS
   ========================================================= */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function getInitials(name) {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function formatDate(isoString) {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/* =========================================================
   REAL-TIME CLOCK & ANALYTICS WIDGETS
   ========================================================= */

function startLiveClock() {
  const clockTime = document.getElementById('liveClockTime');
  const clockDate = document.getElementById('liveClockDate');
  if (!clockTime || !clockDate) return;

  function update() {
    const now = new Date();
    clockTime.textContent = now.toLocaleTimeString('en-IN', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    clockDate.textContent = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  update();
  setInterval(update, 1000);
}

function renderRecentActivityList(submissions) {
  const container = document.getElementById('recentActivityList');
  if (!container) return;

  if (!submissions || submissions.length === 0) {
    container.innerHTML = `
      <div style="padding:40px; text-align:center; color:var(--text-muted); font-size:0.85rem; font-weight:700;">
        No recent submissions logged.
      </div>
    `;
    return;
  }

  // Take the most recent 4 items
  const recentItems = submissions.slice(0, 4);

  container.innerHTML = recentItems.map((doc) => {
    const name = escapeHtml(doc.name || 'Anonymous');
    const msg = doc.message || '';
    const dateStr = formatDate(doc.createdAt);
    const initials = getInitials(name);
    
    let typeClass = 'contact';
    let typeLabel = 'Contact';
    let actionDesc = 'submitted a contact inquiry';

    if (msg.startsWith('[VOLUNTEER APPLICATION]')) {
      typeClass = 'volunteer';
      typeLabel = 'Volunteer';
      actionDesc = 'submitted volunteer candidacy';
    } else if (msg.startsWith('[TEAM MEMBER]')) {
      typeClass = 'team';
      typeLabel = 'Team Admin';
      actionDesc = 'appointed as an administrator';
    }

    return `
      <div class="activity-item">
        <div class="activity-avatar" aria-hidden="true" style="border-radius:var(--radius);">${initials}</div>
        <div class="activity-details">
          <div class="activity-title">${name}</div>
          <div class="activity-subtitle">
            <span class="activity-type-tag ${typeClass}">${typeLabel}</span>
            ${actionDesc}
          </div>
        </div>
        <div class="activity-time" style="border-radius:var(--radius);">${dateStr.split(',')[0]}</div>
      </div>
    `;
  }).join('');
}

let submissionsChartInstance = null;

function renderAnalyticsChart(volunteers, team) {
  const ctx = document.getElementById('submissionsChart');
  if (!ctx) return;

  if (submissionsChartInstance) {
    submissionsChartInstance.destroy();
  }

  // Create high-end smooth visual trend curves using Chart.js
  submissionsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Volunteer Forms',
          data: [2, 1, 3, 5, 4, volunteers.length],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.03)',
          borderWidth: 2,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: true
        },
        {
          label: 'Team Admins',
          data: [1, 1, 2, 2, 2, team.length + 1],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.03)',
          borderWidth: 2,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { family: 'Plus Jakarta Sans', size: 10, weight: '700' },
            boxWidth: 8,
            boxHeight: 8,
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: '#09090b',
          titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: '700' },
          bodyFont: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
          cornerRadius: 0,
          padding: 10
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' },
            color: '#64748b'
          }
        },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: {
            font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' },
            color: '#64748b',
            stepSize: 1
          }
        }
      }
    }
  });
}

function openVolunteerModal(docId) {
  const volunteer = volunteerApps.find((doc) => doc.$id === docId);
  if (!volunteer) return;

  const parsed = parseVolunteerMessage(volunteer.message || '');

  document.getElementById('volModalName').textContent = volunteer.name || 'Anonymous';
  
  const emailEl = document.getElementById('volModalEmail');
  emailEl.textContent = volunteer.email || 'N/A';
  emailEl.href = `mailto:${volunteer.email}`;
  
  document.getElementById('volModalPhone').textContent = parsed.phone || 'N/A';
  
  const interestEl = document.getElementById('volModalInterest');
  interestEl.textContent = parsed.skills || 'N/A';
  
  document.getElementById('volModalDate').textContent = formatDate(volunteer.createdAt || volunteer.$createdAt);
  document.getElementById('volModalStatement').textContent = parsed.statement || '—';

  // Bind Delete Candidate button inside modal
  const delBtn = document.getElementById('volModalDeleteBtn');
  if (delBtn) {
    delBtn.onclick = () => {
      closeVolunteerModal();
      openDeleteModal(docId);
    };
  }

  const modal = document.getElementById('volunteerModal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeVolunteerModal() {
  const modal = document.getElementById('volunteerModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

window.openVolunteerModal = openVolunteerModal;
window.closeVolunteerModal = closeVolunteerModal;

console.log('She Can Foundation | admin.js loaded ✅');
