/**
 * NourishWell — Welcome Modal & Profile System
 * ══════════════════════════════════════════════════════════════
 * Self-contained script — just add before </body>:
 *   <script src="welcome-modal.js"></script>
 *
 * Features:
 *  - First-time welcome modal (2-step) for new users
 *  - BMI / BMR / TDEE / calorie target calculation
 *  - Syncs profile data to Settings → Health Profile
 *  - Updates dashboard display (donut target, profile line, meal planner)
 *  - Triggers for both new subscribers AND pros switching to subscriber view
 *  - Stores in localStorage, ready for backend API integration
 * ══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  // ── Profile Storage ──────────────────────────────────────────
  const PROFILE_KEY = 'nw-user-profile';

  function getProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveProfile(p) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  }

  function isProfileComplete(p) {
    return p && p.gender && p.heightCm && p.weightKg && p.activityLevel && p.goal && p.dateOfBirth;
  }

  // ── Calculation Engine ───────────────────────────────────────
  function calcAge(dob) {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function calcBMI(weightKg, heightCm) {
    const hm = heightCm / 100;
    return +(weightKg / (hm * hm)).toFixed(1);
  }

  function bmiCategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  // Mifflin-St Jeor
  function calcBMR(weightKg, heightCm, age, gender) {
    if (gender === 'female') return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5; // male or default
  }

  const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725
  };

  const ACTIVITY_LABELS = {
    sedentary: 'Sedentary',
    lightly_active: 'Lightly Active',
    moderately_active: 'Moderately Active',
    very_active: 'Very Active'
  };

  const GOAL_OFFSETS = {
    lose: -500,
    maintain: 0,
    gain: 300
  };

  const GOAL_LABELS = {
    lose: 'Lose Weight',
    maintain: 'Maintain Weight',
    gain: 'Gain Muscle'
  };

  function calcTDEE(bmr, activityLevel) {
    return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55));
  }

  function calcTarget(tdee, goal) {
    return Math.max(1200, tdee + (GOAL_OFFSETS[goal] || 0));
  }

  function computeAll(p) {
    const age = calcAge(p.dateOfBirth);
    const bmi = calcBMI(p.weightKg, p.heightCm);
    const bmr = calcBMR(p.weightKg, p.heightCm, age, p.gender);
    const tdee = calcTDEE(bmr, p.activityLevel);
    const target = calcTarget(tdee, p.goal);
    return { age, bmi, bmiCategory: bmiCategory(bmi), bmr: Math.round(bmr), tdee, target };
  }

  // ── Apply Profile to Dashboard ───────────────────────────────
  function applyToDashboard(profile) {
    if (!profile) return;
    const stats = computeAll(profile);

    // 1. Update "62 kg · Moderately Active" line
    const profileLine = document.querySelector('#profile-summary-line');
    // Fallback: find by content if no id
    if (profileLine) {
      profileLine.innerHTML = profile.weightKg + ' kg · ' + (ACTIVITY_LABELS[profile.activityLevel] || profile.activityLevel) +
        ' · BMI ' + stats.bmi + ' <span style="color:var(--ink-f)">(' + stats.bmiCategory + ')</span>';
    } else {
      // Try to find the original hardcoded span
      document.querySelectorAll('span').forEach(function (el) {
        if (el.textContent.includes('62 kg') || el.textContent.includes('kg · ')) {
          el.innerHTML = profile.weightKg + ' kg · ' + (ACTIVITY_LABELS[profile.activityLevel] || profile.activityLevel) +
            ' · BMI ' + stats.bmi + ' <span style="color:var(--ink-f)">(' + stats.bmiCategory + ')</span>';
          el.id = 'profile-summary-line';
        }
      });
    }

    // 2. Update DAILY_TARGET constant and donut card target
    if (typeof window.DAILY_TARGET !== 'undefined') window.DAILY_TARGET = stats.target;

    // Update donut card "/ 2,400" text
    const totalNum = document.querySelector('.dc-total-num');
    if (totalNum) {
      const sub = totalNum.querySelector('.dc-total-sub');
      if (sub) sub.textContent = '/ ' + stats.target.toLocaleString();
    }

    // 3. Meal planner target label
    const mpLabel = document.getElementById('mp-target-label');
    if (mpLabel) mpLabel.textContent = stats.target.toLocaleString() + ' kcal';

    // 4. Re-run updateDonut if available (it reads from mealLog)
    if (typeof window.updateDonut === 'function') {
      // Patch the target value before calling
      window._nwDailyTarget = stats.target;
      window.updateDonut();
    }

    // 5. Update settings Health Profile fields
    applyToSettings(profile, stats);
  }

  function applyToSettings(profile, stats) {
    // Personal Details fields
    const fields = {
      'settings-gender': profile.gender,
      'settings-dob': profile.dateOfBirth,
      'settings-height': profile.heightCm,
      'settings-weight': profile.weightKg,
      'settings-activity': profile.activityLevel,
      'settings-goal': profile.goal,
      'settings-calorie-target': stats ? stats.target : ''
    };
    Object.keys(fields).forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.value = fields[id];
    });

    // BMI display
    const bmiEl = document.getElementById('settings-bmi-display');
    if (bmiEl && stats) {
      bmiEl.textContent = 'BMI: ' + stats.bmi + ' (' + stats.bmiCategory + ')';
      bmiEl.style.color = stats.bmi >= 18.5 && stats.bmi < 25 ? 'var(--teal)' : 'var(--amber)';
    }
  }

  // ── Inject Settings Fields (Gender + Goal into Health Profile) ─
  function patchSettings() {
    const healthProfile = document.querySelector('#overlay-personal .settings-inner');
    if (!healthProfile) return;

    // Find the Health Profile card (contains "Height (cm)")
    const cards = healthProfile.querySelectorAll('div[style*="border-radius:16px"]');
    let hpCard = null;
    cards.forEach(function (c) {
      if (c.textContent.includes('Height (cm)')) hpCard = c;
    });
    if (!hpCard) return;

    // Find the 2x2 grid inside health profile
    const grid = hpCard.querySelector('div[style*="grid-template-columns"]');
    if (!grid) return;

    // Add IDs to existing fields
    const inputs = grid.querySelectorAll('input, select');
    if (inputs[0]) inputs[0].id = 'settings-height';
    if (inputs[1]) inputs[1].id = 'settings-weight';
    if (inputs[2]) inputs[2].id = 'settings-activity';
    if (inputs[3]) inputs[3].id = 'settings-calorie-target';

    // Change activity level select to use our keys
    if (inputs[2] && inputs[2].tagName === 'SELECT') {
      inputs[2].innerHTML =
        '<option value="sedentary">Sedentary</option>' +
        '<option value="lightly_active">Lightly Active</option>' +
        '<option value="moderately_active">Moderately Active</option>' +
        '<option value="very_active">Very Active</option>';
    }

    // Insert Gender before Height
    const genderDiv = document.createElement('div');
    genderDiv.innerHTML =
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--ink-f);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Gender</div>' +
      '<select id="settings-gender" style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;font-family:\'Bricolage Grotesque\',sans-serif;font-size:13px;color:var(--ink);outline:none;background:var(--white)">' +
        '<option value="male">Male</option><option value="female">Female</option><option value="other">Prefer not to say</option>' +
      '</select>';
    grid.insertBefore(genderDiv, grid.firstChild);

    // Insert Goal before calorie target
    const goalDiv = document.createElement('div');
    goalDiv.innerHTML =
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--ink-f);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Goal</div>' +
      '<select id="settings-goal" style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;font-family:\'Bricolage Grotesque\',sans-serif;font-size:13px;color:var(--ink);outline:none;background:var(--white)">' +
        '<option value="lose">Lose Weight</option><option value="maintain">Maintain Weight</option><option value="gain">Gain Muscle</option>' +
      '</select>';
    // Insert before calorie target (last field)
    const calorieField = inputs[3] ? inputs[3].parentElement : null;
    if (calorieField) grid.insertBefore(goalDiv, calorieField);

    // Insert DOB field
    const dobDiv = document.createElement('div');
    dobDiv.innerHTML =
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--ink-f);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Date of Birth</div>' +
      '<input type="date" id="settings-dob" style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;font-family:\'Bricolage Grotesque\',sans-serif;font-size:13px;color:var(--ink);outline:none">';
    grid.insertBefore(dobDiv, grid.children[1]); // after gender

    // Add BMI display
    const bmiDiv = document.createElement('div');
    bmiDiv.style.cssText = 'grid-column:1/-1;padding:10px 14px;background:var(--teal-lll);border:1px solid var(--teal-ll);border-radius:8px;font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:600';
    bmiDiv.id = 'settings-bmi-display';
    bmiDiv.textContent = 'BMI: —';
    grid.appendChild(bmiDiv);

    // Make calorie target readonly (auto-calculated)
    if (inputs[3]) {
      inputs[3].readOnly = true;
      inputs[3].style.background = 'var(--paper)';
      inputs[3].style.color = 'var(--ink-f)';
      inputs[3].title = 'Auto-calculated from your profile';
    }

    // Hook the Update Profile button
    const updateBtn = hpCard.querySelector('button');
    if (updateBtn) {
      updateBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const p = readSettingsProfile();
        if (p) {
          saveProfile(p);
          applyToDashboard(p);
          showToast('Profile updated', '#1e6b5e');
        }
      });
    }

    // Auto-recalculate on field changes
    ['settings-gender', 'settings-dob', 'settings-height', 'settings-weight', 'settings-activity', 'settings-goal'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', recalcSettings);
        el.addEventListener('input', recalcSettings);
      }
    });
  }

  function readSettingsProfile() {
    return {
      gender: (document.getElementById('settings-gender') || {}).value || 'other',
      dateOfBirth: (document.getElementById('settings-dob') || {}).value || '2000-01-01',
      heightCm: parseFloat((document.getElementById('settings-height') || {}).value) || 170,
      weightKg: parseFloat((document.getElementById('settings-weight') || {}).value) || 70,
      activityLevel: (document.getElementById('settings-activity') || {}).value || 'moderately_active',
      goal: (document.getElementById('settings-goal') || {}).value || 'maintain'
    };
  }

  function recalcSettings() {
    const p = readSettingsProfile();
    if (!p.dateOfBirth || !p.heightCm || !p.weightKg) return;
    const stats = computeAll(p);
    const calEl = document.getElementById('settings-calorie-target');
    if (calEl) calEl.value = stats.target;
    const bmiEl = document.getElementById('settings-bmi-display');
    if (bmiEl) {
      bmiEl.textContent = 'BMI: ' + stats.bmi + ' (' + stats.bmiCategory + ')';
      bmiEl.style.color = stats.bmi >= 18.5 && stats.bmi < 25 ? 'var(--teal)' : 'var(--amber)';
    }
  }

  // ── Welcome Modal ────────────────────────────────────────────
  function injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
      #nw-welcome-overlay {
        position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;
        background:rgba(10,20,16,0.7);backdrop-filter:blur(6px);
        display:flex;align-items:center;justify-content:center;
        opacity:0;transition:opacity 0.3s;
      }
      #nw-welcome-overlay.visible { opacity:1; }
      #nw-welcome-card {
        background:var(--white,#fff);border-radius:24px;
        width:520px;max-width:92vw;max-height:90vh;overflow-y:auto;
        box-shadow:0 32px 80px rgba(10,20,16,0.25);
        padding:0;
        transform:translateY(20px);transition:transform 0.3s;
      }
      #nw-welcome-overlay.visible #nw-welcome-card { transform:translateY(0); }
      .wm-header {
        background:var(--ink,#0a1410);color:#fff;padding:32px 32px 24px;
        border-radius:24px 24px 0 0;
      }
      .wm-header h2 {
        font-family:'Instrument Serif',serif;font-size:28px;font-weight:400;
        font-style:italic;margin:0 0 6px;
      }
      .wm-header p {
        font-family:'JetBrains Mono',monospace;font-size:10px;
        color:rgba(255,255,255,0.5);letter-spacing:0.04em;margin:0;
      }
      .wm-body { padding:28px 32px 32px; }
      .wm-steps { display:flex;gap:8px;margin-bottom:24px; }
      .wm-step {
        flex:1;height:4px;border-radius:4px;background:var(--fog,#dce6e0);
        transition:background 0.3s;
      }
      .wm-step.active { background:var(--teal,#1e6b5e); }
      .wm-step.done { background:var(--teal-l,#2f8f7f); }
      .wm-field { margin-bottom:18px; }
      .wm-label {
        font-family:'JetBrains Mono',monospace;font-size:9px;
        color:var(--ink-f,#6b8878);letter-spacing:0.08em;
        text-transform:uppercase;margin-bottom:6px;display:block;
      }
      .wm-input {
        width:100%;padding:11px 14px;border:1px solid var(--border,#d4dfd8);
        border-radius:10px;font-family:'Bricolage Grotesque',sans-serif;
        font-size:14px;color:var(--ink,#0a1410);outline:none;
        transition:border-color 0.2s,box-shadow 0.2s;
        background:var(--white,#fff);
      }
      .wm-input:focus {
        border-color:var(--teal,#1e6b5e);
        box-shadow:0 0 0 3px rgba(30,107,94,0.1);
      }
      .wm-row { display:grid;grid-template-columns:1fr 1fr;gap:14px; }
      .wm-option-group { display:flex;flex-wrap:wrap;gap:8px; }
      .wm-option {
        padding:10px 18px;border:1.5px solid var(--border,#d4dfd8);
        border-radius:10px;font-size:13px;font-weight:600;
        color:var(--ink-m,#3d5448);cursor:pointer;transition:all 0.2s;
        background:var(--white,#fff);
      }
      .wm-option:hover { border-color:var(--teal-l,#2f8f7f);background:var(--teal-lll,#e8f4f2); }
      .wm-option.selected {
        border-color:var(--teal,#1e6b5e);background:var(--teal,#1e6b5e);
        color:#fff;
      }
      .wm-btn {
        width:100%;padding:14px;border:none;border-radius:12px;
        font-family:'Bricolage Grotesque',sans-serif;font-size:14px;
        font-weight:700;cursor:pointer;transition:all 0.2s;
      }
      .wm-btn-primary {
        background:var(--ink,#0a1410);color:#fff;margin-top:8px;
      }
      .wm-btn-primary:hover { background:var(--teal,#1e6b5e); }
      .wm-btn-primary:disabled {
        opacity:0.4;cursor:not-allowed;
      }
      .wm-btn-secondary {
        background:transparent;color:var(--ink-f,#6b8878);
        font-size:12px;font-weight:500;margin-top:4px;
      }
      .wm-btn-secondary:hover { color:var(--ink,#0a1410); }
      .wm-result {
        background:var(--teal-lll,#e8f4f2);border:1px solid var(--teal-ll,#b8ddd8);
        border-radius:14px;padding:20px;margin-bottom:20px;text-align:center;
      }
      .wm-result-num {
        font-size:36px;font-weight:800;color:var(--teal,#1e6b5e);
        font-family:'Bricolage Grotesque',sans-serif;
      }
      .wm-result-label {
        font-family:'JetBrains Mono',monospace;font-size:10px;
        color:var(--ink-f,#6b8878);letter-spacing:0.06em;
        text-transform:uppercase;margin-top:4px;
      }
      .wm-result-detail {
        display:flex;justify-content:center;gap:24px;margin-top:14px;
      }
      .wm-result-item {
        text-align:center;
      }
      .wm-result-item-num {
        font-size:18px;font-weight:700;color:var(--ink,#0a1410);
      }
      .wm-result-item-label {
        font-family:'JetBrains Mono',monospace;font-size:8px;
        color:var(--ink-f,#6b8878);letter-spacing:0.06em;
        text-transform:uppercase;margin-top:2px;
      }
    `;
    document.head.appendChild(s);
  }

  function buildModal() {
    const overlay = document.createElement('div');
    overlay.id = 'nw-welcome-overlay';
    overlay.innerHTML = `
      <div id="nw-welcome-card">
        <div class="wm-header">
          <h2>Welcome to NourishWell</h2>
          <p>Tell us a bit about yourself so we can personalise your experience</p>
        </div>
        <div class="wm-body">
          <div class="wm-steps">
            <div class="wm-step active" id="wm-step-1"></div>
            <div class="wm-step" id="wm-step-2"></div>
            <div class="wm-step" id="wm-step-3"></div>
          </div>

          <!-- Step 1: Body -->
          <div id="wm-page-1">
            <div class="wm-field">
              <span class="wm-label">Gender</span>
              <div class="wm-option-group" id="wm-gender">
                <div class="wm-option" data-val="male">👨 Male</div>
                <div class="wm-option" data-val="female">👩 Female</div>
                <div class="wm-option" data-val="other">🤝 Prefer not to say</div>
              </div>
            </div>
            <div class="wm-field">
              <span class="wm-label">Date of Birth</span>
              <input type="date" class="wm-input" id="wm-dob" max="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="wm-row">
              <div class="wm-field">
                <span class="wm-label">Height (cm)</span>
                <input type="number" class="wm-input" id="wm-height" placeholder="e.g. 170" min="100" max="250">
              </div>
              <div class="wm-field">
                <span class="wm-label">Weight (kg)</span>
                <input type="number" class="wm-input" id="wm-weight" placeholder="e.g. 70" min="30" max="300" step="0.1">
              </div>
            </div>
            <button class="wm-btn wm-btn-primary" id="wm-next-1" disabled>Next →</button>
          </div>

          <!-- Step 2: Lifestyle -->
          <div id="wm-page-2" style="display:none">
            <div class="wm-field">
              <span class="wm-label">Activity Level</span>
              <div class="wm-option-group" id="wm-activity">
                <div class="wm-option" data-val="sedentary">🪑 Sedentary<br><span style="font-size:10px;font-weight:400;color:var(--ink-f)">Little or no exercise</span></div>
                <div class="wm-option" data-val="lightly_active">🚶 Lightly Active<br><span style="font-size:10px;font-weight:400;color:var(--ink-f)">Light exercise 1–3 days/week</span></div>
                <div class="wm-option" data-val="moderately_active">🏃 Moderately Active<br><span style="font-size:10px;font-weight:400;color:var(--ink-f)">Exercise 3–5 days/week</span></div>
                <div class="wm-option" data-val="very_active">🏋️ Very Active<br><span style="font-size:10px;font-weight:400;color:var(--ink-f)">Hard exercise 6–7 days/week</span></div>
              </div>
            </div>
            <div class="wm-field">
              <span class="wm-label">Your Goal</span>
              <div class="wm-option-group" id="wm-goal">
                <div class="wm-option" data-val="lose">📉 Lose Weight</div>
                <div class="wm-option" data-val="maintain">⚖️ Maintain Weight</div>
                <div class="wm-option" data-val="gain">💪 Gain Muscle</div>
              </div>
            </div>
            <button class="wm-btn wm-btn-primary" id="wm-next-2" disabled>See my plan →</button>
            <button class="wm-btn wm-btn-secondary" id="wm-back-2">← Back</button>
          </div>

          <!-- Step 3: Results -->
          <div id="wm-page-3" style="display:none">
            <div class="wm-result">
              <div class="wm-result-num" id="wm-result-target">—</div>
              <div class="wm-result-label">Your recommended daily calories</div>
              <div class="wm-result-detail">
                <div class="wm-result-item">
                  <div class="wm-result-item-num" id="wm-result-bmi">—</div>
                  <div class="wm-result-item-label">BMI</div>
                </div>
                <div class="wm-result-item">
                  <div class="wm-result-item-num" id="wm-result-bmr">—</div>
                  <div class="wm-result-item-label">BMR</div>
                </div>
                <div class="wm-result-item">
                  <div class="wm-result-item-num" id="wm-result-tdee">—</div>
                  <div class="wm-result-item-label">TDEE</div>
                </div>
              </div>
            </div>
            <div style="font-size:12px;color:var(--ink-f);line-height:1.6;margin-bottom:18px;text-align:center">
              This is calculated using the <strong>Mifflin-St Jeor</strong> equation, adjusted for your activity level and goal. You can update these anytime in <strong>Settings → Health Profile</strong>.
            </div>
            <button class="wm-btn wm-btn-primary" id="wm-finish">Start tracking →</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Show with animation
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('visible');
      });
    });

    // Wire up option groups
    wireOptionGroup('wm-gender');
    wireOptionGroup('wm-activity');
    wireOptionGroup('wm-goal');

    // Validation for step 1
    var step1Fields = ['wm-dob', 'wm-height', 'wm-weight'];
    step1Fields.forEach(function (id) {
      document.getElementById(id).addEventListener('input', validateStep1);
    });
    document.getElementById('wm-gender').addEventListener('click', function () {
      setTimeout(validateStep1, 10);
    });

    // Validation for step 2
    document.getElementById('wm-activity').addEventListener('click', function () {
      setTimeout(validateStep2, 10);
    });
    document.getElementById('wm-goal').addEventListener('click', function () {
      setTimeout(validateStep2, 10);
    });

    // Navigation
    document.getElementById('wm-next-1').addEventListener('click', function () {
      document.getElementById('wm-page-1').style.display = 'none';
      document.getElementById('wm-page-2').style.display = 'block';
      document.getElementById('wm-step-1').className = 'wm-step done';
      document.getElementById('wm-step-2').className = 'wm-step active';
    });

    document.getElementById('wm-back-2').addEventListener('click', function () {
      document.getElementById('wm-page-2').style.display = 'none';
      document.getElementById('wm-page-1').style.display = 'block';
      document.getElementById('wm-step-1').className = 'wm-step active';
      document.getElementById('wm-step-2').className = 'wm-step';
    });

    document.getElementById('wm-next-2').addEventListener('click', function () {
      // Calculate and show results
      var p = collectModalData();
      var stats = computeAll(p);

      document.getElementById('wm-result-target').textContent = stats.target.toLocaleString();
      document.getElementById('wm-result-bmi').textContent = stats.bmi;
      document.getElementById('wm-result-bmr').textContent = stats.bmr.toLocaleString();
      document.getElementById('wm-result-tdee').textContent = stats.tdee.toLocaleString();

      document.getElementById('wm-page-2').style.display = 'none';
      document.getElementById('wm-page-3').style.display = 'block';
      document.getElementById('wm-step-2').className = 'wm-step done';
      document.getElementById('wm-step-3').className = 'wm-step active';
    });

    document.getElementById('wm-finish').addEventListener('click', function () {
      var p = collectModalData();
      saveProfile(p);
      applyToDashboard(p);

      // Close modal
      overlay.classList.remove('visible');
      setTimeout(function () { overlay.remove(); }, 300);

      if (typeof showToast === 'function') {
        showToast('Profile saved! Your targets are personalised now.', '#1e6b5e');
      }
    });
  }

  function wireOptionGroup(groupId) {
    var group = document.getElementById(groupId);
    group.addEventListener('click', function (e) {
      var opt = e.target.closest('.wm-option');
      if (!opt) return;
      group.querySelectorAll('.wm-option').forEach(function (o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
    });
  }

  function getSelectedVal(groupId) {
    var sel = document.querySelector('#' + groupId + ' .wm-option.selected');
    return sel ? sel.getAttribute('data-val') : null;
  }

  function validateStep1() {
    var gender = getSelectedVal('wm-gender');
    var dob = document.getElementById('wm-dob').value;
    var height = document.getElementById('wm-height').value;
    var weight = document.getElementById('wm-weight').value;
    document.getElementById('wm-next-1').disabled = !(gender && dob && height && weight);
  }

  function validateStep2() {
    var activity = getSelectedVal('wm-activity');
    var goal = getSelectedVal('wm-goal');
    document.getElementById('wm-next-2').disabled = !(activity && goal);
  }

  function collectModalData() {
    return {
      gender: getSelectedVal('wm-gender') || 'other',
      dateOfBirth: document.getElementById('wm-dob').value,
      heightCm: parseFloat(document.getElementById('wm-height').value) || 170,
      weightKg: parseFloat(document.getElementById('wm-weight').value) || 70,
      activityLevel: getSelectedVal('wm-activity') || 'moderately_active',
      goal: getSelectedVal('wm-goal') || 'maintain'
    };
  }

  // ── Initialization ───────────────────────────────────────────
  function init() {
    injectStyles();

    // Patch settings page with extra fields
    patchSettings();

    // Load existing profile
    var profile = getProfile();

    if (isProfileComplete(profile)) {
      // Returning user — just apply values
      applyToDashboard(profile);
    } else {
      // First time — show welcome modal
      buildModal();
    }
  }

  // Expose for pro → subscriber switch trigger
  window._nwShowWelcomeModal = function () {
    var profile = getProfile();
    if (!isProfileComplete(profile)) {
      buildModal();
    }
  };

  // Expose for external use
  window._nwGetProfile = getProfile;
  window._nwApplyProfile = applyToDashboard;
  window._nwComputeProfile = computeAll;

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to let other scripts set up
    setTimeout(init, 300);
  }

})();
