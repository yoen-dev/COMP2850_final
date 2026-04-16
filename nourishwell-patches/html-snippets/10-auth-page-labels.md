# SNIPPET 10 — Auth page label & a11y fixes

index.html 的登录/注册表单已经有 `<label>` 元素了，但有几处 aria 和 role 可以加强。也一并给你。

---

## 10.1 Auth page 的 `<main>` 语义

**FIND**（在 `body class="show-auth"` 或类似的 auth 容器内）：

```html
<div class="auth-shell" id="authWrap">
```

**REPLACE WITH**:

```html
<main class="auth-shell" id="authWrap" role="main" aria-label="Authentication">
```

如果你不用 `<main>` 想保留 div，至少加 `role="main"`。

---

## 10.2 Role selector 应该是 radiogroup

**FIND**（两个 role-card）：

```html
<div class="role-selector">
  <div class="role-card active sub" id="role-sub" onclick="selectRole('subscriber')">
    ...
  </div>
  <div class="role-card pro" id="role-pro" onclick="selectRole('professional')">
    ...
  </div>
</div>
```

**REPLACE WITH**:

```html
<div class="role-selector" role="radiogroup" aria-label="Select account type">
  <div class="role-card active sub" id="role-sub"
       role="radio" tabindex="0" aria-checked="true"
       onclick="selectRole('subscriber')">
    <span class="role-icon" aria-hidden="true">🧑</span>
    <div class="role-name">Subscriber</div>
    <div class="role-desc">I want to improve my own diet</div>
    <div class="role-check" aria-hidden="true">✓</div>
  </div>
  <div class="role-card pro" id="role-pro"
       role="radio" tabindex="0" aria-checked="false"
       onclick="selectRole('professional')">
    <span class="role-icon" aria-hidden="true">👨‍⚕️</span>
    <div class="role-name">Health Professional</div>
    <div class="role-desc">I want to help clients manage their nutrition</div>
    <div class="role-check" aria-hidden="true">✓</div>
  </div>
</div>
```

**Important**: 在 JS 里更新 `selectRole()` 使它切换 `aria-checked`:

```javascript
function selectRole(role) {
  currentRole = role;
  document.getElementById('role-sub').classList.toggle('active', role === 'subscriber');
  document.getElementById('role-pro').classList.toggle('active', role === 'professional');
  document.getElementById('role-sub').setAttribute('aria-checked', role === 'subscriber');
  document.getElementById('role-pro').setAttribute('aria-checked', role === 'professional');
  document.getElementById('pro-field').classList.toggle('visible', role === 'professional');
}
```

---

## 10.3 Password toggle button

**FIND**（password 字段的 toggle 按钮，两处）:

```html
<button class="pw-toggle" onclick="togglePw('login-password', this)">👁</button>
```

**REPLACE WITH**:

```html
<button type="button" class="pw-toggle"
        onclick="togglePw('login-password', this)"
        aria-label="Show password"
        aria-pressed="false">
  <span aria-hidden="true">👁</span>
</button>
```

在 `togglePw` JS 里同步 `aria-pressed` 和 `aria-label`:

```javascript
function togglePw(id, btn) {
  const el = document.getElementById(id);
  const showing = el.type === 'text';
  el.type = showing ? 'password' : 'text';
  btn.innerHTML = '<span aria-hidden="true">' + (showing ? '👁' : '🙈') + '</span>';
  btn.setAttribute('aria-pressed', !showing);
  btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
}
```

---

## 10.4 Form 用 `<form>` 标签

目前你的注册和登录是用 div + button 手动触发的。评分标准看，用真正的 `<form>` 能让：
- 浏览器原生密码管理器工作
- Enter 键自动提交
- 无障碍工具识别这是一个表单

**FIND** (around your register fields):

```html
<div id="register-form-wrap">
  <!-- all the fields -->
  <button id="register-btn" onclick="handleRegister()">
    <span id="reg-btn-text">Create account →</span>
  </button>
</div>
```

**REPLACE WITH**:

```html
<form id="register-form-wrap"
      onsubmit="event.preventDefault();handleRegister();"
      novalidate
      aria-label="Create account form">
  <!-- all the fields -->
  <button type="submit" id="register-btn">
    <span id="reg-btn-text">Create account →</span>
  </button>
</form>
```

登录表单同理：

```html
<form id="login-form-wrap"
      onsubmit="event.preventDefault();handleLogin();"
      novalidate
      aria-label="Sign in form">
  <!-- ... -->
  <button type="submit" id="login-btn">Sign in →</button>
</form>
```

这样做之后可以删掉最下面的 `document.addEventListener('keydown', e => { if (e.key !== 'Enter') return; ... handleLogin/Register() })`——浏览器原生处理了。

---

## 10.5 Error 信息关联到 input

**FIND**:

```html
<input id="login-email" type="email" placeholder="you@example.com">
<div class="field-error" id="login-email-err">Please enter a valid email</div>
```

**REPLACE WITH**:

```html
<input id="login-email" type="email" placeholder="you@example.com"
       aria-describedby="login-email-err"
       aria-invalid="false"
       autocomplete="email">
<div class="field-error" id="login-email-err" role="alert">
  Please enter a valid email
</div>
```

在 `handleLogin` 里同步 `aria-invalid`:

```javascript
function setErr(id, show) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.toggle('error', show);
    el.setAttribute('aria-invalid', show ? 'true' : 'false');
  }
}
```

`autocomplete` 属性让密码管理器能自动填充——对老年用户、残障用户非常有用。

其他字段对应的 autocomplete 值：
- 名字 → `autocomplete="given-name"`
- 姓 → `autocomplete="family-name"`
- 邮箱 → `autocomplete="email"`
- 新密码 → `autocomplete="new-password"`
- 登录密码 → `autocomplete="current-password"`
- 专业执照 → `autocomplete="off"`

---

## ✅ 做完之后

登录页 Lighthouse a11y 分数应该从 85 左右升到 100。
