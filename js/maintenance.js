document.addEventListener('DOMContentLoaded', () => {
  const user = requireResident();
  if (!user) return;
  const tableBody = document.getElementById('complaintsTableBody');
  const allMyComplaints = getComplaints().filter(c => c.residentEmail === user.email);

  function renderTable() {
    if (allMyComplaints.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:#94a3b8;">No maintenance complaints yet. Report a problem when you need assistance.</td></tr>';
      return;
    }
    tableBody.innerHTML = [...allMyComplaints].reverse().map(c => {
      const pillClass = 'priority-' + c.priority.toLowerCase();
      const badgeClass = 'badge-' + c.status.toLowerCase().replace(/\s+/g, '');
      return '<tr><td style="font-family:monospace;font-weight:600;">' + c.id + '</td>' +
        '<td style="font-weight:600;">' + escapeHTML(c.title) + '</td>' +
        '<td>' + c.category + '</td>' +
        '<td><span class="priority-pill ' + pillClass + '">' + c.priority + '</span></td>' +
        '<td><span class="badge ' + badgeClass + '">' + c.status + '</span></td>' +
        '<td>' + formatDate(c.createdAt) + '</td>' +
        '<td><a href="complaint-details.html?id=' + c.id + '" class="btn btn-secondary btn-sm">View Details</a></td></tr>';
    }).join('');
  }
  renderTable();

  const modal = document.getElementById('newComplaintModal');
  document.getElementById('btnOpenModal').addEventListener('click', () => modal.classList.add('active'));
  document.getElementById('btnCloseModal').addEventListener('click', () => modal.classList.remove('active'));

  let photoBase64 = null;
  document.getElementById('compPhoto').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { photoBase64 = ev.target.result; };
    reader.readAsDataURL(file);
  });

  document.getElementById('newComplaintForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('compTitle').value.trim();
    const category = document.getElementById('compCategory').value;
    const priority = document.getElementById('compPriority').value;
    const desc = document.getElementById('compDesc').value.trim();

    if (!title || !desc) {
      showToast('Please fill out all required fields.', 'danger');
      return;
    }
    const complaints = getComplaints();
    const newId = 'TKT-' + (1000 + complaints.length + 1);
    const now = new Date().toISOString();

    complaints.push({
      id: newId,
      category,
      title,
      description: desc,
      priority,
      photo: photoBase64,
      residentName: user.name,
      residentEmail: user.email,
      flat: user.flat,
      status: COMPLAINT_STATUS.PENDING,
      createdAt: now,
      history: [{ message: 'Complaint submitted by resident.', timestamp: now }]
    });
    saveComplaints(complaints);
    showToast('Complaint submitted successfully.', 'success');
    modal.classList.remove('active');
    setTimeout(() => { window.location.href = 'complaint-details.html?id=' + newId; }, 500);
  });
});
