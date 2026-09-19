document.addEventListener('DOMContentLoaded', () => {
  const admin = requireAdmin();
  if (!admin) return;
  const tableBody = document.getElementById('residentsTableBody');
  const searchInput = document.getElementById('searchResidents');
  const modal = document.getElementById('residentModal');
  const form = document.getElementById('residentForm');
  const flatSelect = document.getElementById('resFlat');
  const resetModal = document.getElementById('resetPassModal');
  const resetForm = document.getElementById('resetPassForm');
  let resettingId = null;
  let editingId = null;

  function renderFlatOptions(selectedFlat = '') {
    const users = getUsers();
    const occupied = users.map(u => u.flat);
    flatSelect.innerHTML = '<option value="">Select Flat Assignment</option>' + ALL_FLATS.map(f => {
      const isOccupied = occupied.includes(f) && f !== selectedFlat;
      return '<option value="' + f + '" ' + (isOccupied ? 'disabled' : '') + ' ' + (f === selectedFlat ? 'selected' : '') + '>' + f + ' ' + (isOccupied ? '(Occupied)' : '') + '</option>';
    }).join('');
  }

  function renderTable() {
    const query = searchInput.value.toLowerCase();
    const users = getUsers().filter(u => u.name.toLowerCase().includes(query) || u.flat.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
    if (users.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#94a3b8;">No residents registered yet.</td></tr>';
      return;
    }
    tableBody.innerHTML = users.map(u => {
      const statusBadge = u.status === 'Active' ? 'badge-completed' : 'badge-closed';
      const toggleLabel = u.status === 'Active' ? 'Disable' : 'Enable';
      const toggleClass = u.status === 'Active' ? 'btn-danger' : 'btn-secondary';
      return '<tr><td style="font-weight:700;color:var(--color-primary);">' + u.flat + '</td><td style="font-weight:600;">' + escapeHTML(u.name) + '</td><td>' + escapeHTML(u.email) + '</td><td>' + escapeHTML(u.phone || '—') + '</td><td>' + u.type + '</td><td><span class="badge ' + statusBadge + '">' + u.status + '</span></td><td><div style="display:flex;gap:6px;"><button class="btn btn-secondary btn-sm" onclick="editResident(\'' + u.id + '\')">Edit</button><button class="btn btn-secondary btn-sm" onclick="openResetPassword(\'' + u.id + '\')">Reset Pass</button><button class="btn ' + toggleClass + ' btn-sm" onclick="toggleStatus(\'' + u.id + '\')">' + toggleLabel + '</button></div></td></tr>';
    }).join('');
  }

  window.editResident = (id) => {
    editingId = id;
    const u = getUsers().find(x => x.id === id);
    if (!u) return;
    document.getElementById('modalTitle').textContent = 'Edit Resident (' + u.flat + ')';
    renderFlatOptions(u.flat);
    flatSelect.disabled = true;
    document.getElementById('resName').value = u.name;
    document.getElementById('resEmail').value = u.email;
    document.getElementById('resPhone').value = u.phone || '';
    document.getElementById('resType').value = u.type;
    document.getElementById('passGroup').style.display = 'none';
    modal.classList.add('active');
  };

  window.openResetPassword = (id) => {
    resettingId = id;
    const u = getUsers().find(x => x.id === id);
    if (!u) return;
    document.getElementById('resetPassName').textContent = u.name + ' (' + u.flat + ')';
    document.getElementById('newPassInput').value = '';
    resetModal.classList.add('active');
  };

  resetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newPass = document.getElementById('newPassInput').value.trim();
    if (!newPass) return;
    const users = getUsers();
    const u = users.find(x => x.id === resettingId);
    if (u) {
      u.password = newPass;
      saveUsers(users);
      showToast('Password reset successfully.', 'success');
      resetModal.classList.remove('active');
    }
  });

  window.toggleStatus = (id) => {
    const users = getUsers();
    const u = users.find(x => x.id === id);
    if (u) {
      u.status = u.status === 'Active' ? 'Disabled' : 'Active';
      saveUsers(users);
      showToast('Resident status updated to ' + u.status, 'info');
      renderTable();
    }
  };

  document.getElementById('btnOpenAddModal').addEventListener('click', () => {
    editingId = null;
    form.reset();
    document.getElementById('modalTitle').textContent = 'Add Flat Resident';
    flatSelect.disabled = false;
    renderFlatOptions();
    document.getElementById('passGroup').style.display = 'block';
    modal.classList.add('active');
  });

  document.getElementById('btnCloseModal').addEventListener('click', () => modal.classList.remove('active'));
  document.getElementById('btnCloseResetModal').addEventListener('click', () => resetModal.classList.remove('active'));
  searchInput.addEventListener('input', renderTable);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const flat = flatSelect.value;
    const name = document.getElementById('resName').value.trim();
    const email = document.getElementById('resEmail').value.trim().toLowerCase();
    const phone = document.getElementById('resPhone').value.trim();
    const type = document.getElementById('resType').value;
    const users = getUsers();

    if (editingId) {
      const uIdx = users.findIndex(u => u.id === editingId);
      if (uIdx !== -1) {
        if (email !== users[uIdx].email && users.some(u => u.email === email)) {
          showToast('This email is already registered.', 'danger');
          return;
        }
        users[uIdx].name = name;
        users[uIdx].email = email;
        users[uIdx].phone = phone;
        users[uIdx].type = type;
        saveUsers(users);
        showToast('Resident updated successfully.', 'success');
      }
    } else {
      const password = document.getElementById('resPassword').value.trim();
      if (!flat || !name || !email || !password) {
        showToast('Required fields cannot be empty.', 'danger');
        return;
      }
      if (users.some(u => u.flat === flat)) {
        showToast('This flat is already registered.', 'danger');
        return;
      }
      if (email === 'admin@dwellsync.local' || users.some(u => u.email === email)) {
        showToast('This email is already registered.', 'danger');
        return;
      }
      users.push({
        id: 'res-' + Date.now(),
        flat, name, email, phone, type, password,
        status: 'Active',
        createdAt: new Date().toISOString()
      });
      saveUsers(users);
      showToast('Resident added successfully.', 'success');
    }
    modal.classList.remove('active');
    renderTable();
  });
  renderTable();
});
