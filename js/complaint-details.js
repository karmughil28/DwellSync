document.addEventListener('DOMContentLoaded', () => {
  const user = requireLogin();
  if (!user) return;
  const complaintId = new URLSearchParams(window.location.search).get('id');
  const complaints = getComplaints();
  const complaint = complaints.find(c => c.id === complaintId);

  if (!complaint) {
    document.getElementById('detailsContainer').innerHTML = '<div class="card card-body"><h2>Complaint Not Found</h2></div>';
    return;
  }
  if (user.role === 'resident' && complaint.residentEmail !== user.email) {
    document.getElementById('detailsContainer').innerHTML = '<div class="card card-body"><h2 style="color:var(--color-danger);">Access Denied</h2></div>';
    return;
  }

  document.getElementById('complaintId').textContent = complaint.id;
  document.getElementById('complaintTitle').textContent = complaint.title;
  document.getElementById('complaintCategory').textContent = complaint.category;
  document.getElementById('complaintFlat').textContent = complaint.flat;
  document.getElementById('complaintDesc').textContent = complaint.description;
  document.getElementById('complaintPriority').textContent = complaint.priority;
  document.getElementById('complaintPriority').className = 'priority-pill priority-' + complaint.priority.toLowerCase();
  document.getElementById('complaintStatusBadge').textContent = complaint.status;
  document.getElementById('complaintStatusBadge').className = 'badge badge-' + complaint.status.toLowerCase().replace(/\s+/g, '');
  document.getElementById('complaintDate').textContent = formatDate(complaint.createdAt);

  if (complaint.photo) {
    document.getElementById('photoContainer').style.display = 'block';
    document.getElementById('complaintPhoto').src = complaint.photo;
  }

  const stages = [COMPLAINT_STATUS.PENDING, COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.COMPLETED, COMPLAINT_STATUS.RESIDENT_CONFIRMED, COMPLAINT_STATUS.CLOSED];
  const currentIdx = stages.indexOf(complaint.status);
  document.querySelectorAll('.step-item').forEach((step, idx) => {
    if (idx < currentIdx) step.classList.add('completed');
    else if (idx === currentIdx) step.classList.add('active');
  });

  document.getElementById('historyList').innerHTML = (complaint.history || []).map(h => {
    return '<li class="audit-entry"><div style="font-weight:500;color:#1e293b;">' + escapeHTML(h.message) + '</div><div style="font-size:11.5px;color:#94a3b8;">' + formatDate(h.timestamp) + '</div></li>';
  }).join('');

  if (user.role === 'resident' && complaint.status === COMPLAINT_STATUS.COMPLETED) {
    const confirmBox = document.getElementById('residentConfirmBox');
    confirmBox.style.display = 'block';
    document.getElementById('btnConfirmCompletion').addEventListener('click', () => {
      const now = new Date().toISOString();
      complaint.status = COMPLAINT_STATUS.RESIDENT_CONFIRMED;
      complaint.history.push({ message: 'Resident confirmed work completion.', timestamp: now });
      complaint.status = COMPLAINT_STATUS.CLOSED;
      complaint.history.push({ message: 'Complaint closed.', timestamp: new Date(Date.now() + 1000).toISOString() });
      saveComplaints(complaints);
      showToast('Resolution confirmed. Ticket closed.', 'success');
      setTimeout(() => window.location.reload(), 600);
    });
  }
});
