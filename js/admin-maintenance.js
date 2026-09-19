document.addEventListener('DOMContentLoaded', () => {
  const admin = requireAdmin();
  if (!admin) return;
  const tableBody = document.getElementById('adminMaintenanceTableBody');
  const searchInput = document.getElementById('searchComplaint');
  const catFilter = document.getElementById('filterCat');
  const prioFilter = document.getElementById('filterPrio');
  const statusFilter = document.getElementById('filterStatus');
  const modal = document.getElementById('ticketModal');

  function renderTable() {
    const q = searchInput.value.toLowerCase();
    const cat = catFilter.value;
    const prio = prioFilter.value;
    const st = statusFilter.value;
    const complaints = getComplaints().filter(c => {
      const mText = !q || c.title.toLowerCase().includes(q) || c.residentName.toLowerCase().includes(q) || c.flat.toLowerCase().includes(q);
      const mCat = !cat || c.category === cat;
      const mPrio = !prio || c.priority === prio;
      const mSt = !st || c.status === st;
      return mText && mCat && mPrio && mSt;
    });

    if (complaints.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#94a3b8;">No maintenance complaints match the filter.</td></tr>';
      return;
    }
    tableBody.innerHTML = [...complaints].reverse().map(c => {
      const pillClass = 'priority-' + c.priority.toLowerCase();
      const badgeClass = 'badge-' + c.status.toLowerCase().replace(/\s+/g, '');
      return '<tr><td style="font-weight:600;">' + escapeHTML(c.title) + '</td><td>' + escapeHTML(c.residentName) + '</td><td style="font-weight:700;color:var(--color-primary);">' + c.flat + '</td><td>' + c.category + '</td><td><span class="priority-pill ' + pillClass + '">' + c.priority + '</span></td><td><span class="badge ' + badgeClass + '">' + c.status + '</span></td><td>' + formatDate(c.createdAt) + '</td><td><button class="btn btn-secondary btn-sm" onclick="manageTicket(\'' + c.id + '\')">Manage</button></td></tr>';
    }).join('');
  }

  window.manageTicket = (id) => {
    const complaints = getComplaints();
    const c = complaints.find(x => x.id === id);
    if (!c) return;
    document.getElementById('modalTicketTitle').textContent = c.title + ' (#' + c.id + ')';
    document.getElementById('modalResidentInfo').textContent = c.residentName + ' • Flat ' + c.flat + ' • ' + c.category;
    document.getElementById('modalDesc').textContent = c.description;
    document.getElementById('modalStatusBadge').textContent = c.status;
    document.getElementById('modalStatusBadge').className = 'badge badge-' + c.status.toLowerCase().replace(/\s+/g, '');

    const photoEl = document.getElementById('modalPhoto');
    if (c.photo) { photoEl.style.display = 'block'; photoEl.src = c.photo; } else { photoEl.style.display = 'none'; }

    document.getElementById('modalAuditLog').innerHTML = (c.history || []).map(h => {
      return '<li style="margin-bottom:8px;"><strong>' + escapeHTML(h.message) + '</strong><div style="font-size:11px;color:#94a3b8;">' + formatDate(h.timestamp) + '</div></li>';
    }).join('');

    document.getElementById('statusActions').innerHTML = 
      '<button class="btn btn-sm btn-primary" onclick="updateTicketStatus(\'' + c.id + '\', \'' + COMPLAINT_STATUS.IN_PROGRESS + '\')">Set: In Progress</button> ' +
      '<button class="btn btn-sm btn-accent" onclick="updateTicketStatus(\'' + c.id + '\', \'' + COMPLAINT_STATUS.COMPLETED + '\')">Set: Completed</button> ' +
      '<button class="btn btn-sm btn-secondary" onclick="updateTicketStatus(\'' + c.id + '\', \'' + COMPLAINT_STATUS.CLOSED + '\')">Close Ticket</button>';
    modal.classList.add('active');
  };

  window.updateTicketStatus = (id, newStatus) => {
    const complaints = getComplaints();
    const c = complaints.find(x => x.id === id);
    if (!c) return;
    c.status = newStatus;
    c.history.push({ message: 'Status updated to ' + newStatus + ' by Administrator.', timestamp: new Date().toISOString() });
    saveComplaints(complaints);
    showToast('Ticket updated to ' + newStatus, 'success');
    modal.classList.remove('active');
    renderTable();
  };

  document.getElementById('btnCloseModal').addEventListener('click', () => modal.classList.remove('active'));
  [searchInput, catFilter, prioFilter, statusFilter].forEach(el => el.addEventListener('input', renderTable));
  renderTable();
});
