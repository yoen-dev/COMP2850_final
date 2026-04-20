/**
 * NourishWell — index.html API Patch
 * ══════════════════════════════════════════════════════════════
 * 在 index.html 底部 </body> 前引入（api.js 必须先加载）：
 *   <script src="api.js"></script>
 *   <script src="patch_index.js"></script>
 *
 * 覆盖原来的 handleLogin / handleRegister，替换为真实 API 调用。
 * 原来的表单验证逻辑不变，只替换"提交成功后"的逻辑。
 * ══════════════════════════════════════════════════════════════
 */

// ── 如果已登录，直接跳转 ──────────────────────────────────────
(function () {
  if (NW.auth.isLoggedIn()) {
    window.location.href = NW.auth.isPro() ? 'pro_dashboard.html' : 'dashboard.html';
  }
})();

// ── 注入密码要求提示到注册表单 ─────────────────────────────────
(function () {
  const pwField = document.getElementById('reg-password');
  if (!pwField) return;

  const hint = document.createElement('div');
  hint.id = 'pw-requirements';
  hint.setAttribute('aria-live', 'polite');
  hint.innerHTML =
    '<ul style="list-style:none;padding:0;margin:6px 0 0 0;display:flex;flex-wrap:wrap;gap:4px 12px">' +
      '<li id="pw-req-len" style="font-size:11px;color:var(--ink-f,#6b6b6b)">✕ 8+ characters</li>' +
      '<li id="pw-req-upper" style="font-size:11px;color:var(--ink-f,#6b6b6b)">✕ Uppercase</li>' +
      '<li id="pw-req-lower" style="font-size:11px;color:var(--ink-f,#6b6b6b)">✕ Lowercase</li>' +
      '<li id="pw-req-digit" style="font-size:11px;color:var(--ink-f,#6b6b6b)">✕ Number</li>' +
      '<li id="pw-req-special" style="font-size:11px;color:var(--ink-f,#6b6b6b)">✕ Special char</li>' +
    '</ul>';

  // Insert after the strength bars (or after the password wrapper)
  const strengthBars = pwField.closest('.field').querySelector('.strength-bars');
  if (strengthBars) {
    strengthBars.insertAdjacentElement('afterend', hint);
  } else {
    pwField.closest('.pw-wrap').insertAdjacentElement('afterend', hint);
  }

  // Live-update requirement checks as user types
  pwField.addEventListener('input', function () {
    const val = this.value;
    updateReq('pw-req-len',     val.length >= 8);
    updateReq('pw-req-upper',   /[A-Z]/.test(val));
    updateReq('pw-req-lower',   /[a-z]/.test(val));
    updateReq('pw-req-digit',   /[0-9]/.test(val));
    updateReq('pw-req-special', /[^A-Za-z0-9]/.test(val));
  });

  function updateReq(id, met) {
    const el = document.getElementById(id);
    if (!el) return;
    const label = el.textContent.replace(/^[✓✕]\s*/, '');
    el.textContent = (met ? '✓ ' : '✕ ') + label;
    el.style.color = met ? 'var(--teal, #1e6b5e)' : 'var(--ink-f, #6b6b6b)';
  }
})();

// ── 密码前端验证（与后端 PasswordValidator 一致）───────────────
function isPasswordValid(pw) {
  return pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw);
}

// ── 覆盖 handleLogin ──────────────────────────────────────────
window.handleLogin = async function () {
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-password').value;
  let ok = true;

  // 前端验证（与原来一致）
  const eOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  showErr('login-email-err', !eOk); setErr('login-email', !eOk); if (!eOk) ok = false;
  showErr('login-pw-err', pw.length < 1); setErr('login-password', pw.length < 1); if (pw.length < 1) ok = false;
  if (!ok) return;

  const btn = document.getElementById('login-btn');
  btn.textContent = 'Signing in…'; btn.classList.add('loading'); btn.disabled = true;

  try {
    const data = await NW.login(email, pw);

    // 根据 role 决定跳转目标
    const dest = data.role === 'professional' ? 'pro_dashboard.html' : 'dashboard.html';
    window._redirectTo = dest;

    // 显示成功覆盖层（原来的动画）
    document.getElementById('login-form-wrap').style.display = 'none';
    document.getElementById('login-success').classList.add('show');

    // 1.2s 后跳转
    setTimeout(() => { window.location.href = dest; }, 1200);

  } catch (err) {
    btn.textContent = 'Sign in →'; btn.classList.remove('loading'); btn.disabled = false;

    if (err.status === 401) {
      // 密码错误
      showErr('login-pw-err', true);
      setErr('login-password', true);
      document.getElementById('login-pw-err').textContent = 'Incorrect email or password.';
    } else if (err.status === 404) {
      showErr('login-email-err', true);
      setErr('login-email', true);
      document.getElementById('login-email-err').textContent = 'No account found with this email.';
    } else {
      // 通用错误：显示在密码字段下
      showErr('login-pw-err', true);
      document.getElementById('login-pw-err').textContent = 'Server error — please try again.';
    }
  }
};

// ── 覆盖 handleRegister ───────────────────────────────────────
window.handleRegister = async function () {
  const first = document.getElementById('reg-first').value.trim();
  const last  = document.getElementById('reg-last').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pw    = document.getElementById('reg-password').value;
  const lic   = document.getElementById('reg-licence').value.trim();
  let ok = true;

  // 前端验证（与原来一致）
  showErr('reg-first-err', !first); setErr('reg-first', !first); if (!first) ok = false;
  showErr('reg-last-err',  !last);  setErr('reg-last',  !last);  if (!last)  ok = false;
  const eOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  showErr('reg-email-err', !eOk); setErr('reg-email', !eOk); if (!eOk) ok = false;
  if (currentRole === 'professional' && !lic) {
    showErr('reg-licence-err', true); setErr('reg-licence', true); ok = false;
  } else {
    showErr('reg-licence-err', false); setErr('reg-licence', false);
  }

  // 密码验证（与后端 PasswordValidator 规则一致）
  if (!isPasswordValid(pw)) {
    showErr('reg-pw-err', true);
    setErr('reg-password', true);
    document.getElementById('reg-pw-err').textContent =
      'Password needs 8+ chars, uppercase, lowercase, number, and special character.';
    ok = false;
  } else {
    showErr('reg-pw-err', false);
    setErr('reg-password', false);
  }

  if (!ok) return;

  const btn = document.getElementById('register-btn');
  document.getElementById('reg-btn-text').textContent = 'Creating account…';
  btn.classList.add('loading'); btn.disabled = true;

  try {
    await NW.register(first, last, email, pw, currentRole, lic || undefined);

    const dest = currentRole === 'professional' ? 'pro_dashboard.html' : 'dashboard.html';
    window._redirectTo = dest;

    document.getElementById('register-form-wrap').style.display = 'none';
    document.getElementById('register-success').classList.add('show');

    setTimeout(() => { window.location.href = dest; }, 1200);

  } catch (err) {
    document.getElementById('reg-btn-text').textContent = 'Create account →';
    btn.classList.remove('loading'); btn.disabled = false;

    if (err.status === 409) {
      showErr('reg-email-err', true);
      setErr('reg-email', true);
      document.getElementById('reg-email-err').textContent = 'This email is already registered.';
    } else if (err.status === 400) {
      // 后端验证失败（含密码不符合要求）
      const msg = err.data?.message || 'Invalid input — please check your details.';
      showErr('reg-pw-err', true);
      document.getElementById('reg-pw-err').textContent = msg;
    } else {
      showErr('reg-pw-err', true);
      document.getElementById('reg-pw-err').textContent = 'Server error — please try again.';
    }
  }
};

// ── goToDashboard 保持原逻辑（由 success overlay 按钮调用）────
window.goToDashboard = function () {
  window.location.href = window._redirectTo || 'dashboard.html';
};
