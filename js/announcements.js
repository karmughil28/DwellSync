document.addEventListener('DOMContentLoaded', () => {
  const user = requireResident();
  if (!user) return;
  const listContainer = document.getElementById('announcementsContainer');
  const announcements = getAnnouncements();
  if (announcements.length === 0) {
    listContainer.innerHTML = '<div class="card card-body" style="text-align:center;color:#94a3b8;">No announcements available.</div>';
    return;
  }
  listContainer.innerHTML = [...announcements].reverse().map(a => {
    return '<div class="card"><div class="card-header"><strong style="color:var(--color-primary);font-size:15px;">' + escapeHTML(a.title) + '</strong><span style="font-size:12px;color:#94a3b8;">' + formatDate(a.createdAt) + '</span></div><div class="card-body"><p style="color:#334155;white-space:pre-wrap;">' + escapeHTML(a.content) + '</p><div style="margin-top:16px;padding-top:10px;border-top:1px solid #f1f5f9;font-size:12px;color:#94a3b8;">Author: <strong>Building Administration Office</strong></div></div></div>';
  }).join('');
});
