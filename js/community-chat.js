document.addEventListener('DOMContentLoaded', () => {
  const user = requireResident();
  if (!user) return;
  const chatChannel = ('BroadcastChannel' in window) ? new BroadcastChannel('dwellsync_community_chat') : null;
  const messagesList = document.getElementById('chatMessages');
  const activeCount = document.getElementById('activeResidentsCount');
  const activeList = document.getElementById('activeResidentsList');
  const messageInput = document.getElementById('chatMessageInput');

  let memoryMessages = [];
  const presenceMap = new Map();

  function renderMessages() {
    if (memoryMessages.length === 0) {
      messagesList.innerHTML = '<div style="text-align:center;color:#94a3b8;margin:auto;">No community messages yet. Start the conversation.</div>';
      return;
    }
    messagesList.innerHTML = memoryMessages.map(m => {
      const isMine = m.flat === user.flat && m.name === user.name;
      const cls = isMine ? 'mine' : 'theirs';
      const timeStr = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return '<div class="chat-msg ' + cls + '"><div class="chat-msg-meta"><strong>' + escapeHTML(m.name) + '</strong> <span>(' + m.flat + ')</span> <span>&bull; ' + timeStr + '</span></div><div>' + escapeHTML(m.text) + '</div></div>';
    }).join('');
    messagesList.scrollTop = messagesList.scrollHeight;
  }

  function renderPresence() {
    const list = Array.from(presenceMap.values());
    activeCount.textContent = list.length + ' Online';
    activeList.innerHTML = list.map(p => {
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f1f5f9;"><span style="width:8px;height:8px;border-radius:50%;background:#10b981;"></span><div style="font-size:13px;font-weight:600;">' + escapeHTML(p.name) + ' <span style="font-size:11px;color:#64748b;">(' + p.flat + ')</span></div></div>';
    }).join('');
  }

  function sendPresence() {
    if (chatChannel) {
      chatChannel.postMessage({ type: 'PRESENCE', payload: { name: user.name, flat: user.flat, timestamp: Date.now() } });
    }
  }

  presenceMap.set(user.flat, { name: user.name, flat: user.flat, timestamp: Date.now() });
  renderPresence();
  sendPresence();

  setInterval(() => {
    sendPresence();
    const now = Date.now();
    presenceMap.forEach((val, key) => {
      if (now - val.timestamp > 12000 && key !== user.flat) presenceMap.delete(key);
    });
    renderPresence();
  }, 5000);

  if (chatChannel) {
    chatChannel.onmessage = (e) => {
      const { type, payload } = e.data || {};
      if (type === 'MESSAGE') { memoryMessages.push(payload); renderMessages(); }
      else if (type === 'PRESENCE') { presenceMap.set(payload.flat, payload); renderPresence(); }
    };
  }

  document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;
    const msg = { name: user.name, flat: user.flat, text, timestamp: new Date().toISOString() };
    memoryMessages.push(msg);
    if (chatChannel) chatChannel.postMessage({ type: 'MESSAGE', payload: msg });
    messageInput.value = '';
    renderMessages();
  });
});
