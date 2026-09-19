document.addEventListener('DOMContentLoaded', () => {
  const sessionUser = requireResident();
  if (!sessionUser) return;
  const users = getUsers();
  const user = users.find(u => u.id === sessionUser.id) || sessionUser;

  const nameInput = document.getElementById('profName');
  const phoneInput = document.getElementById('profPhone');
  const btnEdit = document.getElementById('btnEditProfile');
  const actionGroup = document.getElementById('profileActions');

  nameInput.value = user.name;
  phoneInput.value = user.phone || '';
  document.getElementById('profEmail').value = user.email;
  document.getElementById('profFlat').value = user.flat;
  document.getElementById('cardFlat').textContent = user.flat;
  document.getElementById('cardTenure').textContent = user.type || 'Tenant';

  btnEdit.addEventListener('click', () => {
    nameInput.disabled = false;
    phoneInput.disabled = false;
    btnEdit.style.display = 'none';
    actionGroup.style.display = 'flex';
    nameInput.focus();
  });

  document.getElementById('btnCancelEdit').addEventListener('click', () => {
    nameInput.value = user.name;
    phoneInput.value = user.phone || '';
    nameInput.disabled = true;
    phoneInput.disabled = true;
    btnEdit.style.display = 'inline-flex';
    actionGroup.style.display = 'none';
  });

  document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = nameInput.value.trim();
    const newPhone = phoneInput.value.trim();
    if (!newName || !newPhone) {
      showToast('Name and phone number are required.', 'danger');
      return;
    }
    const uIdx = users.findIndex(u => u.id === user.id);
    if (uIdx !== -1) {
      users[uIdx].name = newName;
      users[uIdx].phone = newPhone;
      saveUsers(users);
      sessionUser.name = newName;
      sessionUser.phone = newPhone;
      setCurrentUser(sessionUser);
      showToast('Profile updated successfully.', 'success');
      setTimeout(() => window.location.reload(), 600);
    }
  });
});
