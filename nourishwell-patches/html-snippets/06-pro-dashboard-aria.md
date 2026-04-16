# SNIPPET 06 — pro_dashboard.html aria 属性修复

现在 pro_dashboard.html 的 aria-label 数量只有 3 个，而订阅者端有 25 个。要让它也达到 AA 水平，需要补下面这些。

---

## 6.1 顶栏（top-nav）修复

**FIND**（约 line 308）：
```html
<nav class="top-nav">
```

**REPLACE WITH**：
```html
<nav class="top-nav" role="navigation" aria-label="Main navigation">
```

---

**FIND**（约 line 313）：
```html
<div class="tn-logo-mark">🌿</div>
```

**REPLACE WITH**：
```html
<div class="tn-logo-mark" aria-hidden="true">🌿</div>
```

---

**FIND**（约 line 329-332）：
```html
<div class="tn-icon" id="mailIcon" onclick="openMailPanel()" style="position:relative;cursor:pointer">
  <svg width="20" height="16" ...
  <div id="mailDot" ...></div>
</div>
```

**REPLACE WITH**：
```html
<div class="tn-icon" id="mailIcon" onclick="openMailPanel()"
     style="position:relative;cursor:pointer"
     role="button" tabindex="0"
     aria-label="Open client messages"
     aria-describedby="mailDotDesc">
  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="18" height="14" rx="2" stroke="rgba(255,255,255,0.85)" stroke-width="1.5"/>
    <path d="M1 4l9 6 9-6" stroke="rgba(255,255,255,0.85)" stroke-width="1.5"/>
  </svg>
  <div id="mailDot" style="width:7px;height:7px;border-radius:50%;background:#dc2626;position:absolute;top:4px;right:4px;border:1.5px solid var(--ink)" aria-hidden="true"></div>
  <span id="mailDotDesc" class="sr-only">You have unread messages</span>
</div>
```

---

**FIND**（约 line 335-338）：
```html
<div class="tn-avatar" id="proAvatarToggle" style="cursor:pointer">
  <div class="tn-avatar-pic">DR</div>
  <span class="tn-avatar-name">Dr. Rivera</span>
</div>
```

**REPLACE WITH**：
```html
<div class="tn-avatar" id="proAvatarToggle" style="cursor:pointer"
     role="button" tabindex="0"
     aria-label="Open profile menu"
     aria-haspopup="true" aria-expanded="false">
  <div class="tn-avatar-pic" aria-hidden="true">DR</div>
  <span class="tn-avatar-name">Dr. Rivera</span>
</div>
```

---

## 6.2 Side nav 客户列表

每个客户条目的 emoji status 需要 aria。以 Rose 为例（约 line 362-369）：

**FIND**：
```html
<a class="sn-item" onclick="selectClient('rose', this)" data-client="rose" href="#">
  <div class="sn-avatar" style="background:#2f8f7f">RC</div>
  <div style="flex:1">
    <div class="sn-name">Rose Campbell</div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--ink-f)">62kg · Active</div>
  </div>
  <span class="sn-status warn" onclick="cycleStatus('rose', this)">⚡ Low protein</span>
</a>
```

**REPLACE WITH**：
```html
<a class="sn-item" onclick="selectClient('rose', this)" data-client="rose" href="#"
   aria-label="Open Rose Campbell, status: low protein warning">
  <div class="sn-avatar" style="background:#2f8f7f" aria-hidden="true">RC</div>
  <div style="flex:1">
    <div class="sn-name">Rose Campbell</div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--ink-f)">62kg · Active</div>
  </div>
  <span class="sn-status warn" onclick="event.stopPropagation();cycleStatus('rose', this)"
        role="button" tabindex="0" aria-label="Change status">
    <span aria-hidden="true">⚡</span> Low protein
  </span>
</a>
```

同样对 James、Sara、Mike、Priya 做一遍。

---

## 6.3 Overview stat cards

每个 stat card 的 emoji 给 `aria-hidden`（约 line 418-439）。大 stat 数字前面加 `aria-label` 把整张卡片的含义说清楚：

**FIND**：
```html
<div class="ov-card">
  <div class="ov-num">3</div>
  <div class="ov-label">Messages Pending</div>
  <div class="ov-sub">Rose, Sara, Priya waiting on replies</div>
  ...
</div>
```

**REPLACE WITH**：
```html
<div class="ov-card" role="region" aria-label="3 pending client messages from Rose, Sara, and Priya">
  <div class="ov-num" aria-hidden="true">3</div>
  <div class="ov-label">Messages Pending</div>
  <div class="ov-sub">Rose, Sara, Priya waiting on replies</div>
  ...
</div>
```

---

## 6.4 Client snapshot table

**FIND**（约 line 449）：
```html
<table style="width:100%;border-collapse:collapse">
```

**REPLACE WITH**：
```html
<table style="width:100%;border-collapse:collapse"
       aria-label="Weekly client snapshot with 5 active clients">
  <caption class="sr-only">Click any row to open the client's detail page</caption>
```

Each `<tr onclick="selectClientFromTable('rose')">` 加 `tabindex="0"` + `role="button"`：

**FIND** (every row):
```html
<tr onclick="selectClientFromTable('rose')" style="cursor:pointer;transition:background .15s" ...>
```

**REPLACE WITH**:
```html
<tr onclick="selectClientFromTable('rose')" tabindex="0" role="button"
    aria-label="Open Rose Campbell's detail page"
    onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectClientFromTable('rose');}"
    style="cursor:pointer;transition:background .15s" ...>
```

**但这个你不用手动做** —— 补丁 JS 里有通用的 `role="button"` 键盘处理，只要加 `role="button" tabindex="0"` 就够了，不用再写 onkeydown。简化版：

```html
<tr onclick="selectClientFromTable('rose')" tabindex="0" role="button"
    aria-label="Open Rose Campbell's detail page"
    style="cursor:pointer;transition:background .15s" ...>
```

---

## 6.5 Tabs（tab-bar）

**FIND**（约 line 511-517）：
```html
<div class="tab-bar">
  <button class="tab-item active" onclick="switchTab('analytics', this)">📈 Analytics</button>
  <button class="tab-item" onclick="switchTab('chat', this)">💬 Messages</button>
  <button class="tab-item" onclick="switchTab('plan', this)">📋 Fitness Plan</button>
  <button class="tab-item" onclick="switchTab('appointments', this)">📅 Appointments</button>
</div>
```

**REPLACE WITH**：
```html
<div class="tab-bar" role="tablist" aria-label="Client sections">
  <button class="tab-item active" onclick="switchTab('analytics', this)"
          role="tab" aria-selected="true" aria-controls="tab-analytics">
    <span aria-hidden="true">📈</span> Analytics
  </button>
  <button class="tab-item" onclick="switchTab('chat', this)"
          role="tab" aria-selected="false" aria-controls="tab-chat">
    <span aria-hidden="true">💬</span> Messages
  </button>
  <button class="tab-item" onclick="switchTab('plan', this)"
          role="tab" aria-selected="false" aria-controls="tab-plan">
    <span aria-hidden="true">📋</span> Fitness Plan
  </button>
  <button class="tab-item" onclick="switchTab('appointments', this)"
          role="tab" aria-selected="false" aria-controls="tab-appointments">
    <span aria-hidden="true">📅</span> Appointments
  </button>
</div>
```

相应地，每个 `<div class="tab-content">` 加 `role="tabpanel"`。

---

## 6.6 Pro dashboard 也要加 Skip Link

在 `<body>` 标签后**立刻**加：

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

然后找到 `<div class="main" id="main-content">`（约 line 409）。如果它没有 `role="main"`，改成：

```html
<div class="main" id="main-content" role="main">
```

---

## 6.7 Chat input 区

**FIND**（约 line 595-597）：
```html
<textarea class="chat-input" id="chatInputBox" placeholder="Type your advice or message..." rows="2"></textarea>
<button class="chat-send" onclick="sendMessage()">Send →</button>
```

**REPLACE WITH**：
```html
<label for="chatInputBox" class="sr-only">Message to client</label>
<textarea class="chat-input" id="chatInputBox"
          placeholder="Type your advice or message..."
          rows="2" aria-label="Message to client"></textarea>
<button class="chat-send" onclick="sendMessage()" aria-label="Send message">
  Send <span aria-hidden="true">→</span>
</button>
```

---

## 6.8 Search clients input

**FIND**（约 line 358-359）：
```html
<input type="text" placeholder="Search clients..." oninput="filterClients(this.value)" ...>
```

**REPLACE WITH**：
```html
<label for="client-search-input" class="sr-only">Search clients by name</label>
<input type="text" id="client-search-input" placeholder="Search clients..."
       aria-label="Search clients by name"
       oninput="filterClients(this.value)" ...>
```

---

## ✅ 验收

做完之后在 pro_dashboard.html 跑 Lighthouse > Accessibility，分数应该从原来的约 75-80 提升到 95+。
