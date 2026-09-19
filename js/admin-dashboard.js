document.addEventListener('DOMContentLoaded', () => {
  const admin = requireAdmin();
  if (!admin) return;
  const residents = getUsers();
  const complaints = getComplaints();

  document.getElementById('statTotalHouses').textContent = '15';
  document.getElementById('statRegistered').textContent = residents.length;
  document.getElementById('statOpenComplaints').textContent = complaints.filter(c => c.status === COMPLAINT_STATUS.PENDING).length;
  document.getElementById('statInProgress').textContent = complaints.filter(c => c.status === COMPLAINT_STATUS.IN_PROGRESS).length;
  document.getElementById('statCompleted').textContent = complaints.filter(c => c.status === COMPLAINT_STATUS.COMPLETED || c.status === COMPLAINT_STATUS.RESIDENT_CONFIRMED || c.status === COMPLAINT_STATUS.CLOSED).length;

  const cTbody = document.getElementById('adminRecentComplaints');
  const recentC = [...complaints].reverse().slice(0, 5);
  cTbody.innerHTML = recentC.length === 0 ? '<tr><td colspan="7" style="text-align:center;padding:20px;color:#94a3b8;">No maintenance tickets submitted.</td></tr>' : recentC.map(c => {
    const pillClass = 'priority-' + c.priority.toLowerCase();
    const badgeClass = 'badge-' + c.status.toLowerCase().replace(/\s+/g, '');
    return '<tr><td style="font-weight:700;color:var(--color-primary);">' + c.flat + '</td><td>' + escapeHTML(c.residentName) + '</td><td style="font-weight:600;">' + escapeHTML(c.title) + '</td><td>' + c.category + '</td><td><span class="priority-pill ' + pillClass + '">' + c.priority + '</span></td><td><span class="badge ' + badgeClass + '">' + c.status + '</span></td><td>' + formatDate(c.createdAt) + '</td></tr>';
  }).join('');

  const rTbody = document.getElementById('adminRecentResidents');
  const recentR = [...residents].reverse().slice(0, 5);
  rTbody.innerHTML = recentR.length === 0 ? '<tr><td colspan="4" style="text-align:center;padding:20px;color:#94a3b8;">No residents registered yet.</td></tr>' : recentR.map(r => {
    const badgeClass = r.status === 'Active' ? 'badge-completed' : 'badge-closed';
    return '<tr><td style="font-weight:600;">' + escapeHTML(r.name) + '</td><td style="font-weight:700;">' + r.flat + '</td><td>' + r.type + '</td><td><span class="badge ' + badgeClass + '">' + r.status + '</span></td></tr>';
  }).join('');
});
