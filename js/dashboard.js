document.addEventListener('DOMContentLoaded', () => {
  const user = requireResident();
  if (!user) return;
  document.getElementById('resWelcomeName').textContent = user.name;
  document.getElementById('resWelcomeFlat').textContent = user.flat;

  const myComplaints = getComplaints().filter(c => c.residentEmail === user.email);
  const open = myComplaints.filter(c => c.status !== COMPLAINT_STATUS.CLOSED).length;
  const pending = myComplaints.filter(c => c.status === COMPLAINT_STATUS.PENDING).length;
  const completed = myComplaints.filter(c => c.status === COMPLAINT_STATUS.COMPLETED || c.status === COMPLAINT_STATUS.RESIDENT_CONFIRMED).length;
  const announcements = getAnnouncements();

  document.getElementById('statOpen').textContent = open;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statCompleted').textContent = completed;
  document.getElementById('statAnnouncements').textContent = announcements.length;

  const compTbody = document.getElementById('recentComplaintsBody');
  const recent = [...myComplaints].reverse().slice(0, 5);
  if (recent.length === 0) {
    compTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:24px;">No complaints lodged yet.</td></tr>';
  } else {
    compTbody.innerHTML = recent.map(c => {
      const pillClass = 'priority-' + c.priority.toLowerCase();
      const badgeClass = 'badge-' + c.status.toLowerCase().replace(/\s+/g, '');
      return '<tr><td style="font-weight:600;">' + escapeHTML(c.title) + '</td>' +
        '<td>' + c.category + '</td>' +
        '<td><span class="priority-pill ' + pillClass + '">' + c.priority + '</span></td>' +
        '<td><span class="badge ' + badgeClass + '">' + c.status + '</span></td>' +
        '<td>' + formatDate(c.createdAt) + '</td>' +
        '<td><a href="complaint-details.html?id=' + c.id + '" class="btn btn-secondary btn-sm">View</a></td></tr>';
    }).join('');
  }

  const annContainer = document.getElementById('recentAnnouncementsList');
  const recentAnn = [...announcements].reverse().slice(0, 3);
  if (recentAnn.length === 0) {
    annContainer.innerHTML = '<div style="color:#94a3b8;padding:16px;">No announcements posted.</div>';
  } else {
    annContainer.innerHTML = recentAnn.map(a => {
      return '<div style="padding:12px;background:#f8fafc;border-radius:8px;margin-bottom:10px;border:1px solid #e2e8f0;">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
        '<strong style="color:#1e293b;">' + escapeHTML(a.title) + '</strong>' +
        '<span style="font-size:11px;color:#94a3b8;">' + formatDate(a.createdAt) + '</span></div>' +
        '<p style="font-size:13px;color:#64748b;">' + escapeHTML(a.content) + '</p></div>';
    }).join('');
  }
});
