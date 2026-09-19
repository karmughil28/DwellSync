document.addEventListener('DOMContentLoaded', () => {
  const admin = requireAdmin();
  if (!admin) return;
  const tableBody = document.getElementById('adminAnnouncementsTable');
  const modal = document.getElementById('announcementModal');
  const form = document.getElementById('announcementForm');
  const confirmModal = document.getElementById('confirmDeleteModal');
  let deletingId = null;
  let editingId = null;

  function renderTable() {
    const announcements = getAnnouncements();
    document.getElementById('totalAnnouncements').textContent = announcements.length;
    if (announcements.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:24px;color:#94a3b8;">No announcements created yet.</td></tr>';
      return;
    }
    tableBody.innerHTML = [...announcements].reverse().map(a => {
      return '<tr><td style="font-weight:700;">' + escapeHTML(a.title) + '</td><td style="max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHTML(a.content) + '</td><td>' + formatDate(a.createdAt) + '</td><td><div style="display:flex;gap:6px;"><button class="btn btn-secondary btn-sm" onclick="editAnnouncement(\'' + a.id + '\')">Edit</button><button class="btn btn-danger btn-sm" onclick="openDeleteConfirm(\'' + a.id + '\')">Delete</button></div></td></tr>';
    }).join('');
  }

  window.editAnnouncement = (id) => {
    editingId = id;
    const a = getAnnouncements().find(x => x.id === id);
    if (!a) return;
    document.getElementById('modalTitle').textContent = 'Edit Announcement';
    document.getElementById('annTitle').value = a.title;
    document.getElementById('annContent').value = a.content;
    modal.classList.add('active');
  };

  window.openDeleteConfirm = (id) => {
    deletingId = id;
    confirmModal.classList.add('active');
  };

  document.getElementById('btnConfirmDelete').addEventListener('click', () => {
    if (!deletingId) return;
    let announcements = getAnnouncements().filter(x => x.id !== deletingId);
    saveAnnouncements(announcements);
    showToast('Announcement deleted successfully.', 'success');
    confirmModal.classList.remove('active');
    renderTable();
  });

  document.getElementById('btnCancelDelete').addEventListener('click', () => confirmModal.classList.remove('active'));
  document.getElementById('btnOpenCreateModal').addEventListener('click', () => {
    editingId = null;
    form.reset();
    document.getElementById('modalTitle').textContent = 'Create Announcement';
    modal.classList.add('active');
  });
  document.getElementById('btnCloseModal').addEventListener('click', () => modal.classList.remove('active'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('annTitle').value.trim();
    const content = document.getElementById('annContent').value.trim();
    if (!title || !content) {
      showToast('Title and content are required.', 'danger');
      return;
    }
    const announcements = getAnnouncements();
    if (editingId) {
      const idx = announcements.findIndex(x => x.id === editingId);
      if (idx !== -1) {
        announcements[idx].title = title;
        announcements[idx].content = content;
        showToast('Announcement updated successfully.', 'success');
      }
    } else {
      announcements.push({ id: 'ann-' + Date.now(), title, content, createdAt: new Date().toISOString() });
      showToast('Announcement created successfully.', 'success');
    }
    saveAnnouncements(announcements);
    modal.classList.remove('active');
    renderTable();
  });
  renderTable();
});
