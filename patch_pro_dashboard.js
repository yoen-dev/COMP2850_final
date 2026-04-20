/**
 * NourishWell — pro_dashboard.html API Patch
 * ══════════════════════════════════════════════════════════════
 * 在 pro_dashboard.html 底部 </body> 前引入（api.js 必须先加载）：
 *   <script src="api.js"></script>
 *   <script src="patch_pro_dashboard.js"></script>
 *
 * 覆盖策略：
 *  - 页面加载时：从 /api/clients 拉取客户列表，重建 clients 对象
 *  - selectClient：加载客户 diary + 消息 + 预约
 *  - sendMessage：调用 /api/messages POST
 *  - confirmAppt：调用 /api/appointments POST
 *  - toggleApptStatus：调用 /api/appointments/:id PATCH
 *  - 图表/BMI/score 展示逻辑保留原逻辑（后端暂无这些字段，用后端数据拼接）
 * ══════════════════════════════════════════════════════════════
 */

// ── 0. 鉴权守卫 ───────────────────────────────────────────────
(function () {
  if (!NW.auth.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }
  if (!NW.auth.isPro()) {
    window.location.href = 'dashboard.html';
  }
})();

// ── 全局：API 客户数据缓存（id → 客户对象，id 为后端 userId 字符串）
const _apiClients = {};

// ══════════════════════════════════════════════════════════════
// 1. 启动时拉取客户列表，动态更新侧边栏 + clients 对象
// ══════════════════════════════════════════════════════════════
async function initProDashboard() {
  try {
    const list = await NW.clients.getAll();
    // list: [{ userId, name, email, stats: { lastDiaryDate, diaryCount, status } }]

    list.forEach(client => {
      const id = String(client.userId);
      _apiClients[id] = client;

      // 如果前端 clients 对象里已有同名的（静态数据），做 id 映射
      const matchKey = Object.keys(clients).find(
        k => clients[k].name && clients[k].name.toLowerCase() === (client.name || '').toLowerCase()
      );
      if (matchKey) {
        // 给静态数据对象打上后端 id
        clients[matchKey]._apiId = id;
        clients[matchKey]._apiClient = client;
      }
    });

    // 更新侧边栏：为每个 .sn-item[data-client] 标记 apiId
    document.querySelectorAll('.sn-item[data-client]').forEach(item => {
      const localKey = item.getAttribute('data-client');
      if (clients[localKey] && clients[localKey]._apiId) {
        item.setAttribute('data-api-id', clients[localKey]._apiId);
      }
    });

    // 更新 overview 页的客户状态表格（如果有）
    _updateOverviewStats(list);

  } catch (e) {
    console.warn('[NW] initProDashboard failed:', e.message);
  }
}

function _updateOverviewStats(list) {
  // 找 overview 页里的状态表格（如果存在）
  const tbody = document.querySelector('#clientsTable tbody, .overview-table tbody');
  if (!tbody) return;
  tbody.innerHTML = list.map(c => {
    const s = c.stats || {};
    const statusClass = s.status === 'active' ? 'green' : s.status === 'warning' ? 'amber' : 'red';
    return `<tr onclick="selectClientFromTable('${c.userId}')" style="cursor:pointer">
      <td>${c.name}</td>
      <td>${c.email}</td>
      <td>${s.diaryCount || 0} entries</td>
      <td>${s.lastDiaryDate || '—'}</td>
      <td><span class="status-dot ${statusClass}"></span> ${s.status || 'unknown'}</td>
    </tr>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════════
// 2. 覆盖 selectClient：在切换客户时从 API 拉取数据
// ══════════════════════════════════════════════════════════════
var _origSelectClient = window.selectClient;
window.selectClient = async function (id, el) {
  // overview 不走 API
  if (id === 'overview') {
    if (_origSelectClient) _origSelectClient(id, el);
    return;
  }

  // 先执行原始 UI 切换逻辑（展示 loading 状态）
  if (_origSelectClient) _origSelectClient(id, el);

  const apiId = clients[id]?._apiId;
  if (!apiId) return; // 没有映射到后端 id，保留静态数据

  // 并行拉取消息 + 预约 + 日记摘要
  const today = new Date().toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

  const [messagesRes, appointmentsRes, diaryRes] = await Promise.allSettled([
    NW.messages.get(apiId),
    NW.appointments.getAll(),
    NW.clients.getDiary(apiId, monthAgo, today)
  ]);

  const c = clients[id];

  // ── 消息 ──────────────────────────────────────────────────
  if (messagesRes.status === 'fulfilled') {
    const msgs = messagesRes.value || [];
    c.messages = msgs.map(m => ({
      from: String(m.senderId) === apiId ? 'client' : 'pro',
      text: m.text,
      time: m.createdAt
        ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
      _id: m.id
    }));
    // 同步到 mailMessages 供邮件图标用
    if (window.mailMessages && window.mailMessages[id] !== undefined) {
      window.mailMessages[id] = c.messages
        .filter(m => m.from === 'client')
        .map(m => ({ from: id, text: m.text, time: m.time, unread: false }));
    }
    renderChat(c);
  }

  // ── 预约 ──────────────────────────────────────────────────
  if (appointmentsRes.status === 'fulfilled') {
    const all = appointmentsRes.value || [];
    // 筛选属于当前客户的
    const mine = all.filter(a => String(a.clientId) === apiId || String(a.proId) === NW.auth.userId);
    c._appointments_api = mine; // 缓存带 id 的原始数据
    c.appointments = mine.map(a => ({
      _id:    a.id,
      time:   a.time,
      date:   a.date,
      type:   a.type || 'Check-in',
      status: a.status || 'pending'
    }));
    renderAppointments(c);
  }

  // ── 日记摘要 ───────────────────────────────────────────────
  if (diaryRes.status === 'fulfilled') {
    const { meals, exercise, summary } = diaryRes.value || {};
    if (summary) {
      // 更新 stats 展示（如果后端有 summary 数据）
      if (summary.avgKcal)      c.stats.avg_kcal    = summary.avgKcal;
      if (summary.avgProtein)   c.stats.protein     = summary.avgProtein;
      if (summary.exerciseDays) c.stats.exercise_days = summary.exerciseDays;
    }
    // 更新热量趋势图（用最近 30 天数据）
    if (Array.isArray(meals) && meals.length > 0) {
      _buildCalorieTrend(c, meals);
    }
    renderStats(c);
  }
};

function _buildCalorieTrend(c, meals) {
  // 按日期汇总 kcal，生成最近 30 天数组
  const kcalByDate = {};
  meals.forEach(m => { kcalByDate[m.date] = (kcalByDate[m.date] || 0) + (m.kcal || 0); });
  const trend = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 3600 * 1000).toISOString().split('T')[0];
    trend.push(kcalByDate[d] || 0);
  }
  c.calorie_trend = trend;
}

// ══════════════════════════════════════════════════════════════
// 3. 覆盖 sendMessage：调用 /api/messages POST
// ══════════════════════════════════════════════════════════════
var _origSendMessage = window.sendMessage;
window.sendMessage = async function () {
  const box = document.getElementById('chatInputBox');
  const text = (box ? box.value : '').trim();
  if (!text) return;

  const apiId = currentClient && clients[currentClient]?._apiId;
  if (!apiId) {
    // 无后端映射，回退原始逻辑
    if (_origSendMessage) _origSendMessage();
    return;
  }

  // 乐观更新 UI
  const c = clients[currentClient];
  c.messages.push({ from: 'pro', text, time: 'Just now', _id: null });
  renderChat(c);
  if (box) box.value = '';
  const wrap = document.getElementById('chatMessages');
  if (wrap) wrap.scrollTop = wrap.scrollHeight;

  try {
    const res = await NW.messages.send(apiId, text);
    // 回填 id
    const entry = c.messages.find(m => m.text === text && !m._id);
    if (entry && res && res.id) entry._id = res.id;
  } catch (e) {
    console.warn('[NW] sendMessage failed:', e.message);
    proToast('Failed to send message', '#dc2626');
    // 回滚
    c.messages.pop();
    renderChat(c);
  }
};

// ══════════════════════════════════════════════════════════════
// 4. 覆盖 confirmAppt：调用 /api/appointments POST
// ══════════════════════════════════════════════════════════════
var _origConfirmAppt = window.confirmAppt;
window.confirmAppt = async function () {
  if (!currentClient) { closeApptModal(); return; }

  const date = document.getElementById('apptDate').value;
  const time = document.getElementById('apptTime').value;
  const type = document.getElementById('apptType').value;
  if (!date || !time) { proToast('Please fill in date and time', '#dc2626'); return; }

  const apiId = clients[currentClient]?._apiId;
  if (!apiId) {
    // 回退原始逻辑
    if (_origConfirmAppt) _origConfirmAppt();
    return;
  }

  // 乐观更新
  const d = new Date(date);
  const dateStr = d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
  const c = clients[currentClient];
  const newAppt = { time, date: dateStr, type, status: 'pending', _id: null };
  c.appointments.unshift(newAppt);
  closeApptModal();
  renderAppointments(c);
  proToast('✓ Appointment booked', '#1e6b5e');

  try {
    const res = await NW.appointments.create(apiId, date, time, type);
    if (res && res.id) newAppt._id = res.id;
  } catch (e) {
    console.warn('[NW] confirmAppt failed:', e.message);
    proToast('Booking saved locally only', '#b8621f');
  }
};

// ══════════════════════════════════════════════════════════════
// 5. 覆盖 toggleApptStatus：调用 /api/appointments/:id PATCH
// ══════════════════════════════════════════════════════════════
var _origToggleApptStatus = window.toggleApptStatus;
window.toggleApptStatus = async function (idx) {
  if (!currentClient) return;
  const appts = clients[currentClient].appointments;
  const appt  = appts[idx];
  if (!appt) return;

  // 乐观更新
  appt.status = appt.status === 'confirmed' ? 'pending' : 'confirmed';
  renderAppointments(clients[currentClient]);
  proToast(appt.status === 'confirmed' ? '✓ Confirmed' : 'Marked as pending');

  if (appt._id) {
    try {
      await NW.appointments.updateStatus(appt._id, appt.status);
    } catch (e) {
      console.warn('[NW] toggleApptStatus failed:', e.message);
      // 回滚
      appt.status = appt.status === 'confirmed' ? 'pending' : 'confirmed';
      renderAppointments(clients[currentClient]);
    }
  }
};

// ══════════════════════════════════════════════════════════════
// 6. Logout
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('a.logout').forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      NW.logout();
      window.location.href = 'index.html';
    });
  });
});

// ══════════════════════════════════════════════════════════════
// 7. 入口：DOMContentLoaded 后初始化
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  initProDashboard();
});
