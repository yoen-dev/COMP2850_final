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
    NW.getMe().then(me => {
        window.location.replace(me.role === 'professional' ? 'pro_dashboard.html' : 'dashboard.html');
    }).catch(() => {
        NW.logout(); // token 无效，清掉
    });
}
})();

// ── 注入密码要求清单到注册表单 ─────────────────────────────────
(function () {
  const pwField = document.getElementById('reg-password');
  if (!pwField) return;

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #pw-requirements {
      margin-top: 10px; padding: 12px 14px; border-radius: 10px;
      background: var(--teal-lll, #e8f4f2);
      border: 1px solid var(--teal-ll, #b8ddd8);
      transition: border-color 0.3s;
    }
    #pw-requirements.shake {
      animation: reqShake 0.4s ease;
      border-color: var(--amber, #b8621f) !important;
    }
    @keyframes reqShake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-4px); }
      40%, 80% { transform: translateX(4px); }
    }
    .pw-req-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px; text-transform: uppercase;
      letter-spacing: 0.08em; font-weight: 600;
      color: var(--teal, #1e6b5e);
      margin-bottom: 8px;
    }
    .pw-req-row {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 3px 0;
      font-family: 'Bricolage Grotesque', sans-serif;
      font-size: 12.5px; color: var(--ink-f, #6b6b6b);
      line-height: 1.4;
      transition: color 0.2s;
    }
    .pw-req-icon {
      flex-shrink: 0; width: 18px; height: 18px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%; font-size: 11px; font-weight: 700;
      background: var(--fog, #ddd); color: var(--ink-f, #999);
      transition: background 0.25s, color 0.25s;
    }
    .pw-req-row.met .pw-req-icon {
      background: var(--teal, #1e6b5e); color: white;
    }
    .pw-req-row.met .pw-req-text { color: var(--teal, #1e6b5e); }
    .pw-req-eg {
      color: var(--ink-f, #999); font-size: 11px; font-style: italic;
    }
    .pw-req-row.met .pw-req-eg { color: var(--teal-l, #2f8f7f); }
  `;
  document.head.appendChild(style);

  // Build the checklist
  const box = document.createElement('div');
  box.id = 'pw-requirements';
  box.setAttribute('aria-live', 'polite');
  box.innerHTML =
    '<div class="pw-req-title">Password requirements</div>' +
    buildRow('pw-req-len',     'At least <strong>8 characters</strong> long', 'e.g. mypassword') +
    buildRow('pw-req-upper',   'One <strong>uppercase</strong> letter',       'e.g. A, B, Z') +
    buildRow('pw-req-lower',   'One <strong>lowercase</strong> letter',       'e.g. a, b, z') +
    buildRow('pw-req-digit',   'One <strong>number</strong>',                 'e.g. 0, 5, 9') +
    buildRow('pw-req-special', 'One <strong>special character</strong>',      'e.g. ! @ # $ &');

  function buildRow(id, text, example) {
    return '<div id="' + id + '" class="pw-req-row">' +
      '<span class="pw-req-icon">✕</span>' +
      '<span class="pw-req-text">' + text + ' <span class="pw-req-eg">(' + example + ')</span></span>' +
    '</div>';
  }

  // Insert after strength-label, or strength-bars, or pw-wrap
  const anchor =
    pwField.closest('.field').querySelector('#strength-label') ||
    pwField.closest('.field').querySelector('.strength-bars') ||
    pwField.closest('.pw-wrap');
  anchor.insertAdjacentElement('afterend', box);

  // Live-update as user types
  pwField.addEventListener('input', function () {
    const v = this.value;
    tick('pw-req-len',     v.length >= 8);
    tick('pw-req-upper',   /[A-Z]/.test(v));
    tick('pw-req-lower',   /[a-z]/.test(v));
    tick('pw-req-digit',   /[0-9]/.test(v));
    tick('pw-req-special', /[^A-Za-z0-9]/.test(v));
  });

  function tick(id, met) {
    const row = document.getElementById(id);
    if (!row) return;
    row.classList.toggle('met', met);
    row.querySelector('.pw-req-icon').textContent = met ? '✓' : '✕';
  }
})();

// ── 密码前端验证（与后端 PasswordValidator 一致）───────────────
/** Validate password meets strength requirements (8+ chars, upper, lower, digit, special) */
function isPasswordValid(pw) {
  return pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw);
}

// ── 覆盖 handleLogin ──────────────────────────────────────────
/** Handle login form submission via API */
window.handleLogin = async function () {
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-password').value;
  let ok = true;

  const eOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  showErr('login-email-err', !eOk); setErr('login-email', !eOk); if (!eOk) ok = false;
  showErr('login-pw-err', pw.length < 1); setErr('login-password', pw.length < 1); if (pw.length < 1) ok = false;
  if (!ok) return;

  const btn = document.getElementById('login-btn');
  btn.textContent = 'Signing in…'; btn.classList.add('loading'); btn.disabled = true;

  try {
    const data = await NW.login(email, pw);
    const dest = data.role === 'professional' ? 'pro_dashboard.html' : 'dashboard.html';
    window._redirectTo = dest;

    document.getElementById('login-form-wrap').style.display = 'none';
    document.getElementById('login-success').classList.add('show');
    setTimeout(() => { window.location.href = dest; }, 1200);

  } catch (err) {
    btn.textContent = 'Sign in →'; btn.classList.remove('loading'); btn.disabled = false;

    if (err.status === 401) {
      showErr('login-pw-err', true);
      setErr('login-password', true);
      document.getElementById('login-pw-err').textContent = 'Incorrect email or password.';
    } else if (err.status === 404) {
      showErr('login-email-err', true);
      setErr('login-email', true);
      document.getElementById('login-email-err').textContent = 'No account found with this email.';
    } else {
      showErr('login-pw-err', true);
      document.getElementById('login-pw-err').textContent = 'Server error — please try again.';
    }
  }
};

// ── 覆盖 handleRegister ───────────────────────────────────────
/** Handle registration form submission via API */
window.handleRegister = async function () {
  const first = document.getElementById('reg-first').value.trim();
  const last  = document.getElementById('reg-last').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pw    = document.getElementById('reg-password').value;
  const lic   = document.getElementById('reg-licence').value.trim();
  let ok = true;

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
      'Please meet all password requirements below.';
    // Shake the requirements box to draw attention
    const reqBox = document.getElementById('pw-requirements');
    if (reqBox) {
      reqBox.classList.remove('shake');
      void reqBox.offsetWidth; // force reflow to restart animation
      reqBox.classList.add('shake');
      setTimeout(() => reqBox.classList.remove('shake'), 500);
    }
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
/** Redirect to appropriate dashboard after successful auth */
window.goToDashboard = function () {
  window.location.href = window._redirectTo || 'dashboard.html';
};
