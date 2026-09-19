const STORAGE_KEYS = {
  USERS: 'dwellsync_users',
  COMPLAINTS: 'dwellsync_complaints',
  ANNOUNCEMENTS: 'dwellsync_announcements',
  SESSION: 'dwellsync_session'
};

const ALL_FLATS = [
  'A-101', 'A-102', 'A-103', 'A-104', 'A-105',
  'A-106', 'A-107', 'A-108', 'A-109', 'A-110',
  'A-111', 'A-112', 'A-113', 'A-114', 'A-115'
];

const COMPLAINT_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  RESIDENT_CONFIRMED: 'Resident Confirmed',
  CLOSED: 'Closed'
};

function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || []; } catch(e) { return []; }
}
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}
function getComplaints() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) || []; } catch(e) { return []; }
}
function saveComplaints(complaints) {
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
}
function getAnnouncements() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) || []; } catch(e) { return []; }
}
function saveAnnouncements(announcements) {
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
}
function getCurrentUser() {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.SESSION)); } catch(e) { return null; }
}
function setCurrentUser(user) {
  sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
}
function logoutUser() {
  const user = getCurrentUser();
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);
  if (user && user.role === 'admin') {
    window.location.href = window.location.pathname.includes('/admin/') ? 'admin-login.html' : 'admin/admin-login.html';
  } else {
    window.location.href = window.location.pathname.includes('/admin/') ? '../resident-login.html' : 'resident-login.html';
  }
}
function requireLogin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = window.location.pathname.includes('/admin/') ? 'admin-login.html' : 'resident-login.html';
    return null;
  }
  return user;
}
function requireResident() {
  const user = requireLogin();
  if (!user) return null;
  if (user.role !== 'resident') {
    window.location.href = 'admin/admin-dashboard.html';
    return null;
  }
  return user;
}
function requireAdmin() {
  const user = requireLogin();
  if (!user) return null;
  if (user.role !== 'admin') {
    window.location.href = '../dashboard.html';
    return null;
  }
  return user;
}
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.25s';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}
function escapeHTML(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
