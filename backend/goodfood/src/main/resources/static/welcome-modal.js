/**
 * NourishWell — Welcome Modal & Profile System v2
 * ══════════════════════════════════════════════════════════════
 * Self-contained: <script src="welcome-modal.js"></script>
 *
 * Steps: 1) Name confirm  2) Body data  3) Lifestyle & goal
 *        4) Exercise preference  5) Results summary
 *
 * Calculates: BMI, BMR (Mifflin-St Jeor), TDEE, daily calorie
 *   target, macro split (protein/carbs/fat in grams),
 *   exercise recommendation
 *
 * Syncs: donut card, profile line, meal planner target,
 *   exercise chart target, settings Health Profile,
 *   calorie trend chart target line
 * ══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  // ── Storage ──────────────────────────────────────────────────
  var PROFILE_KEY = 'nw-user-profile';

  function getProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY)); }
    catch (e) { return null; }
  }
  function saveProfile(p) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  }
  function isProfileComplete(p) {
    return p && p.gender && p.heightCm && p.weightKg && p.activityLevel && p.goal && p.dateOfBirth;
  }

  // ── Calculation Engine ───────────────────────────────────────
  function calcAge(dob) {
    var b = new Date(dob), t = new Date();
    var age = t.getFullYear() - b.getFullYear();
    var m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
    return Math.max(age, 1);
  }
  function calcBMI(w, h) { return +(w / ((h / 100) * (h / 100))).toFixed(1); }
  function bmiCat(b) { return b < 18.5 ? 'Underweight' : b < 25 ? 'Normal' : b < 30 ? 'Overweight' : 'Obese'; }

  // Mifflin-St Jeor
  function calcBMR(w, h, age, g) {
    return g === 'female' ? 10 * w + 6.25 * h - 5 * age - 161 : 10 * w + 6.25 * h - 5 * age + 5;
  }

  var ACT_MULT = { sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725 };
  var ACT_LABEL = { sedentary: 'Sedentary', lightly_active: 'Lightly Active', moderately_active: 'Moderately Active', very_active: 'Very Active' };
  var GOAL_OFF = { lose: -500, maintain: 0, gain: 300 };
  var GOAL_LABEL = { lose: 'Lose Weight', maintain: 'Maintain Weight', gain: 'Gain Muscle' };

  function calcTDEE(bmr, act) { return Math.round(bmr * (ACT_MULT[act] || 1.55)); }
  function calcTarget(tdee, goal) { return Math.max(1200, tdee + (GOAL_OFF[goal] || 0)); }

  // Macro split based on goal (grams)
  function calcMacros(target, goal) {
    // Protein: 30% lose, 25% maintain, 35% gain
    // Carbs:   40% lose, 50% maintain, 40% gain
    // Fat:     30% lose, 25% maintain, 25% gain
    var splits = {
      lose:     { protein: 0.30, carbs: 0.40, fat: 0.30 },
      maintain: { protein: 0.25, carbs: 0.50, fat: 0.25 },
      gain:     { protein: 0.35, carbs: 0.40, fat: 0.25 }
    };
    var s = splits[goal] || splits.maintain;
    return {
      proteinG: Math.round(target * s.protein / 4),
      carbsG:   Math.round(target * s.carbs / 4),
      fatG:     Math.round(target * s.fat / 9),
      proteinPct: Math.round(s.protein * 100),
      carbsPct:   Math.round(s.carbs * 100),
      fatPct:     Math.round(s.fat * 100)
    };
  }

  // Exercise recommendation (kcal to burn per day)
  function calcExerciseRec(p) {
    if (!p.wantsExercise) return { kcalPerDay: 0, minsPerDay: 0, suggestion: 'No exercise target set' };
    // Base: 300 kcal for maintenance, 400 for lose, 200 for gain
    var base = { lose: 400, maintain: 300, gain: 200 };
    var freq = { light: 0.6, moderate: 1.0, intense: 1.4 };
    var kcal = Math.round((base[p.goal] || 300) * (freq[p.exerciseIntensity] || 1.0));
    // Approximate minutes: ~8 kcal/min moderate activity
    var rate = { light: 5, moderate: 8, intense: 12 };
    var mins = Math.round(kcal / (rate[p.exerciseIntensity] || 8));
    var suggestions = {
      light: mins + ' min of walking, yoga, or light stretching',
      moderate: mins + ' min of jogging, cycling, or swimming',
      intense: mins + ' min of running, HIIT, or weight training'
    };
    return { kcalPerDay: kcal, minsPerDay: mins, suggestion: suggestions[p.exerciseIntensity] || '' };
  }

  function computeAll(p) {
    var age = calcAge(p.dateOfBirth);
    var bmi = calcBMI(p.weightKg, p.heightCm);
    var bmr = calcBMR(p.weightKg, p.heightCm, age, p.gender);
    var tdee = calcTDEE(bmr, p.activityLevel);
    var target = calcTarget(tdee, p.goal);
    var macros = calcMacros(target, p.goal);
    var exercise = calcExerciseRec(p);
    return { age: age, bmi: bmi, bmiCategory: bmiCat(bmi), bmr: Math.round(bmr), tdee: tdee, target: target, macros: macros, exercise: exercise };
  }

  // ── Apply to Dashboard ───────────────────────────────────────
  function applyToDashboard(profile) {
    if (!profile) return;
    var stats = computeAll(profile);

    // 1. DAILY_TARGET (now let, can reassign)
    window.DAILY_TARGET = stats.target;

    // 2. Profile summary line
    var found = false;
    document.querySelectorAll('span').forEach(function (el) {
      if (el.textContent.match(/\d+\s*kg\s*·/) || el.id === 'profile-summary-line') {
        el.id = 'profile-summary-line';
        el.innerHTML = profile.weightKg + ' kg · ' + (ACT_LABEL[profile.activityLevel] || '') +
          ' · BMI ' + stats.bmi + ' <span style="color:var(--ink-f)">(' + stats.bmiCategory + ')</span>';
        found = true;
      }
    });

    // 3. Donut card — call updateDonut which now reads DAILY_TARGET
    if (typeof window.updateDonut === 'function') window.updateDonut();

    // 4. Meal planner target
    var mpLabel = document.getElementById('mp-target-label');
    if (mpLabel) mpLabel.textContent = stats.target.toLocaleString() + ' kcal';

    // 5. Exercise chart target line
    if (profile.wantsExercise && stats.exercise.kcalPerDay > 0) {
      window._nwExerciseTarget = stats.exercise.kcalPerDay;
    } else {
      window._nwExerciseTarget = 0;
    }
    // Update exercise summary text
    var exSummary = document.getElementById('exercise-recommendation');
    if (!exSummary) {
      // Create it under exercise chart
      var exChart = document.querySelector('.cc-title');
      if (exChart && exChart.textContent.includes('Exercise')) {
        var parent = exChart.closest('.chart-card');
        if (parent) {
          var div = document.createElement('div');
          div.id = 'exercise-recommendation';
          div.style.cssText = 'padding:10px 16px;background:var(--teal-lll);border:1px solid var(--teal-ll);border-radius:8px;margin-top:10px;font-size:11px;color:var(--ink-m)';
          parent.appendChild(div);
          exSummary = div;
        }
      }
    }
    if (exSummary) {
      if (profile.wantsExercise) {
        exSummary.innerHTML = '<strong style="color:var(--teal)">Daily exercise goal:</strong> ~' +
          stats.exercise.kcalPerDay + ' kcal · ' + stats.exercise.suggestion;
        exSummary.style.display = 'block';
      } else {
        exSummary.style.display = 'none';
      }
    }

    // 6. Nutrition macro recommendation
    var macroTip = document.getElementById('macro-recommendation');
    if (!macroTip) {
      var insightsEl = document.getElementById('insights-container');
      if (insightsEl) {
        var div = document.createElement('div');
        div.id = 'macro-recommendation';
        div.style.cssText = 'background:var(--white);border:1px solid var(--border);border-radius:14px;padding:16px 18px;margin-bottom:12px;box-shadow:0 4px 16px rgba(10,20,16,0.04)';
        insightsEl.parentNode.insertBefore(div, insightsEl);
        macroTip = div;
      }
    }
    if (macroTip) {
      var m = stats.macros;
      macroTip.innerHTML =
        '<div style="font-size:12px;font-weight:700;color:var(--ink);margin-bottom:8px;display:flex;align-items:center;gap:6px"><span style="font-size:14px">🥗</span> Your Daily Nutrition Targets</div>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap">' +
          macroChip('Protein', m.proteinG + 'g', m.proteinPct + '%', '#d4956a') +
          macroChip('Carbs', m.carbsG + 'g', m.carbsPct + '%', '#2f8f7f') +
          macroChip('Fat', m.fatG + 'g', m.fatPct + '%', '#7aaad4') +
        '</div>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--ink-f);margin-top:8px">' +
          'Based on ' + stats.target.toLocaleString() + ' kcal · ' + (GOAL_LABEL[profile.goal] || '') + ' · Tap avatar → Health Profile to adjust</div>';
    }

    // 7. Settings sync
    applyToSettings(profile, stats);
  }

  function macroChip(label, grams, pct, color) {
    return '<div style="flex:1;min-width:80px;background:var(--paper);border-radius:10px;padding:10px 12px;text-align:center">' +
      '<div style="font-size:18px;font-weight:800;color:' + color + '">' + grams + '</div>' +
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:8px;color:var(--ink-f);margin-top:2px">' + label + ' · ' + pct + '</div></div>';
  }

  // ── Settings Sync ────────────────────────────────────────────
  function applyToSettings(profile, stats) {
    var fields = {
      'settings-gender': profile.gender,
      'settings-dob': profile.dateOfBirth,
      'settings-height': profile.heightCm,
      'settings-weight': profile.weightKg,
      'settings-activity': profile.activityLevel,
      'settings-goal': profile.goal,
      'settings-calorie-target': stats ? stats.target : ''
    };
    Object.keys(fields).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = fields[id];
    });
    var bmiEl = document.getElementById('settings-bmi-display');
    if (bmiEl && stats) {
      bmiEl.textContent = 'BMI: ' + stats.bmi + ' (' + stats.bmiCategory + ') · BMR: ' + stats.bmr + ' · TDEE: ' + stats.tdee;
      bmiEl.style.color = (stats.bmi >= 18.5 && stats.bmi < 25) ? 'var(--teal)' : 'var(--amber)';
    }
  }

  // ── Patch Settings Page ──────────────────────────────────────
  function patchSettings() {
    var healthProfile = document.querySelector('#overlay-personal .settings-inner');
    if (!healthProfile) return;
    var cards = healthProfile.querySelectorAll('div[style*="border-radius:16px"]');
    var hpCard = null;
    cards.forEach(function (c) { if (c.textContent.includes('Height (cm)')) hpCard = c; });
    if (!hpCard) return;

    var grid = hpCard.querySelector('div[style*="grid-template-columns"]');
    if (!grid) return;

    var inputs = grid.querySelectorAll('input, select');
    if (inputs[0]) inputs[0].id = 'settings-height';
    if (inputs[1]) inputs[1].id = 'settings-weight';
    if (inputs[2]) inputs[2].id = 'settings-activity';
    if (inputs[3]) inputs[3].id = 'settings-calorie-target';

    if (inputs[2] && inputs[2].tagName === 'SELECT') {
      inputs[2].innerHTML = '<option value="sedentary">Sedentary</option><option value="lightly_active">Lightly Active</option><option value="moderately_active">Moderately Active</option><option value="very_active">Very Active</option>';
    }

    // Gender
    var gDiv = document.createElement('div');
    gDiv.innerHTML = '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--ink-f);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Gender</div><select id="settings-gender" style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;font-family:\'Bricolage Grotesque\',sans-serif;font-size:13px;color:var(--ink);outline:none;background:var(--white)"><option value="male">Male</option><option value="female">Female</option><option value="other">Prefer not to say</option></select>';
    grid.insertBefore(gDiv, grid.firstChild);

    // DOB
    var dDiv = document.createElement('div');
    dDiv.innerHTML = '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--ink-f);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Date of Birth</div><input type="date" id="settings-dob" style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;font-family:\'Bricolage Grotesque\',sans-serif;font-size:13px;color:var(--ink);outline:none">';
    grid.insertBefore(dDiv, grid.children[1]);

    // Goal
    var goDiv = document.createElement('div');
    goDiv.innerHTML = '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--ink-f);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Goal</div><select id="settings-goal" style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;font-family:\'Bricolage Grotesque\',sans-serif;font-size:13px;color:var(--ink);outline:none;background:var(--white)"><option value="lose">Lose Weight</option><option value="maintain">Maintain Weight</option><option value="gain">Gain Muscle</option></select>';
    var calField = inputs[3] ? inputs[3].parentElement : null;
    if (calField) grid.insertBefore(goDiv, calField);

    // BMI display
    var bDiv = document.createElement('div');
    bDiv.style.cssText = 'grid-column:1/-1;padding:12px 14px;background:var(--teal-lll);border:1px solid var(--teal-ll);border-radius:10px;font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:600';
    bDiv.id = 'settings-bmi-display';
    bDiv.textContent = 'BMI: —';
    grid.appendChild(bDiv);

    // Calorie target readonly
    if (inputs[3]) {
      inputs[3].readOnly = true;
      inputs[3].style.background = 'var(--paper)';
      inputs[3].title = 'Auto-calculated from your profile';
    }

    // Hook save button
    var btn = hpCard.querySelector('button');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var p = readSettingsProfile();
        if (p) { saveProfile(p); applyToDashboard(p); if (typeof showToast === 'function') showToast('Profile updated', '#1e6b5e'); }
      });
    }

    // Auto-recalc
    ['settings-gender', 'settings-dob', 'settings-height', 'settings-weight', 'settings-activity', 'settings-goal'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.addEventListener('change', recalcSettings); el.addEventListener('input', recalcSettings); }
    });
  }

  function readSettingsProfile() {
    var old = getProfile() || {};
    return {
      displayName: old.displayName || '',
      gender: (document.getElementById('settings-gender') || {}).value || 'other',
      dateOfBirth: (document.getElementById('settings-dob') || {}).value || '2000-01-01',
      heightCm: parseFloat((document.getElementById('settings-height') || {}).value) || 170,
      weightKg: parseFloat((document.getElementById('settings-weight') || {}).value) || 70,
      activityLevel: (document.getElementById('settings-activity') || {}).value || 'moderately_active',
      goal: (document.getElementById('settings-goal') || {}).value || 'maintain',
      wantsExercise: old.wantsExercise || false,
      exerciseIntensity: old.exerciseIntensity || 'moderate'
    };
  }

  function recalcSettings() {
    var p = readSettingsProfile();
    if (!p.dateOfBirth || !p.heightCm || !p.weightKg) return;
    var s = computeAll(p);
    var calEl = document.getElementById('settings-calorie-target');
    if (calEl) calEl.value = s.target;
    var bmiEl = document.getElementById('settings-bmi-display');
    if (bmiEl) {
      bmiEl.textContent = 'BMI: ' + s.bmi + ' (' + s.bmiCategory + ') · BMR: ' + s.bmr + ' · TDEE: ' + s.tdee;
      bmiEl.style.color = (s.bmi >= 18.5 && s.bmi < 25) ? 'var(--teal)' : 'var(--amber)';
    }
  }

  // ── Modal Styles ─────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('nw-wm-styles')) return;
    var s = document.createElement('style');
    s.id = 'nw-wm-styles';
    s.textContent = '\
#nw-welcome-overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:rgba(10,20,16,0.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s}\
#nw-welcome-overlay.visible{opacity:1}\
#nw-welcome-card{background:var(--white,#fff);border-radius:24px;width:540px;max-width:92vw;max-height:90vh;overflow-y:auto;box-shadow:0 32px 80px rgba(10,20,16,0.25);transform:translateY(20px);transition:transform .3s}\
#nw-welcome-overlay.visible #nw-welcome-card{transform:translateY(0)}\
.wm-header{background:var(--ink,#0a1410);color:#fff;padding:32px 32px 24px;border-radius:24px 24px 0 0}\
.wm-header h2{font-family:"Instrument Serif",serif;font-size:28px;font-weight:400;font-style:italic;margin:0 0 6px}\
.wm-header p{font-family:"JetBrains Mono",monospace;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:.04em;margin:0}\
.wm-body{padding:28px 32px 32px}\
.wm-steps{display:flex;gap:6px;margin-bottom:24px}\
.wm-step{flex:1;height:4px;border-radius:4px;background:var(--fog,#dce6e0);transition:background .3s}\
.wm-step.active{background:var(--teal,#1e6b5e)}.wm-step.done{background:var(--teal-l,#2f8f7f)}\
.wm-field{margin-bottom:16px}\
.wm-label{font-family:"JetBrains Mono",monospace;font-size:9px;color:var(--ink-f,#6b8878);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;display:block}\
.wm-input{width:100%;padding:11px 14px;border:1px solid var(--border,#d4dfd8);border-radius:10px;font-family:"Bricolage Grotesque",sans-serif;font-size:14px;color:var(--ink,#0a1410);outline:none;transition:border-color .2s,box-shadow .2s;background:var(--white,#fff)}\
.wm-input:focus{border-color:var(--teal,#1e6b5e);box-shadow:0 0 0 3px rgba(30,107,94,0.1)}\
.wm-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}\
.wm-option-group{display:flex;flex-wrap:wrap;gap:8px}\
.wm-option{padding:10px 16px;border:1.5px solid var(--border,#d4dfd8);border-radius:10px;font-size:13px;font-weight:600;color:var(--ink-m,#3d5448);cursor:pointer;transition:all .2s;background:var(--white,#fff)}\
.wm-option:hover{border-color:var(--teal-l,#2f8f7f);background:var(--teal-lll,#e8f4f2)}\
.wm-option.selected{border-color:var(--teal,#1e6b5e);background:var(--teal,#1e6b5e);color:#fff}\
.wm-option .wm-opt-sub{font-size:10px;font-weight:400;opacity:.7;margin-top:2px}\
.wm-option.selected .wm-opt-sub{opacity:.85}\
.wm-btn{width:100%;padding:14px;border:none;border-radius:12px;font-family:"Bricolage Grotesque",sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s}\
.wm-btn-primary{background:var(--ink,#0a1410);color:#fff;margin-top:8px}.wm-btn-primary:hover{background:var(--teal,#1e6b5e)}.wm-btn-primary:disabled{opacity:.4;cursor:not-allowed}\
.wm-btn-secondary{background:transparent;color:var(--ink-f,#6b8878);font-size:12px;font-weight:500;margin-top:4px}.wm-btn-secondary:hover{color:var(--ink,#0a1410)}\
.wm-result{background:var(--teal-lll,#e8f4f2);border:1px solid var(--teal-ll,#b8ddd8);border-radius:14px;padding:20px;margin-bottom:16px;text-align:center}\
.wm-result-num{font-size:36px;font-weight:800;color:var(--teal,#1e6b5e);font-family:"Bricolage Grotesque",sans-serif}\
.wm-result-label{font-family:"JetBrains Mono",monospace;font-size:10px;color:var(--ink-f,#6b8878);letter-spacing:.06em;text-transform:uppercase;margin-top:4px}\
.wm-result-detail{display:flex;justify-content:center;gap:20px;margin-top:14px;flex-wrap:wrap}\
.wm-result-item{text-align:center;min-width:60px}\
.wm-result-item-num{font-size:18px;font-weight:700;color:var(--ink,#0a1410)}\
.wm-result-item-label{font-family:"JetBrains Mono",monospace;font-size:8px;color:var(--ink-f,#6b8878);letter-spacing:.06em;text-transform:uppercase;margin-top:2px}\
.wm-avatar{width:64px;height:64px;border-radius:50%;background:var(--teal,#1e6b5e);color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;margin:0 auto 12px}\
.wm-name-display{font-size:20px;font-weight:700;color:var(--ink);text-align:center;margin-bottom:4px}\
.wm-name-hint{font-size:11px;color:var(--ink-f);text-align:center;margin-bottom:16px;line-height:1.5}\
.wm-macro-row{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}\
.wm-macro-chip{flex:1;min-width:70px;background:var(--white);border:1px solid var(--border);border-radius:10px;padding:10px;text-align:center}\
.wm-macro-val{font-size:18px;font-weight:800}.wm-macro-lbl{font-family:"JetBrains Mono",monospace;font-size:8px;color:var(--ink-f);margin-top:2px}\
';
    document.head.appendChild(s);
  }

  // ── Build Modal ──────────────────────────────────────────────
  function buildModal() {
    if (document.getElementById('nw-welcome-overlay')) return;

    // Get user's registered name
    var userName = (typeof NW !== 'undefined' && NW.auth) ? NW.auth.name : 'User';
    var initials = userName.split(' ').map(function (w) { return w[0] || ''; }).join('').toUpperCase().substring(0, 2);

    var overlay = document.createElement('div');
    overlay.id = 'nw-welcome-overlay';
    overlay.innerHTML = '<div id="nw-welcome-card">\
<div class="wm-header"><h2>Welcome to NourishWell</h2><p>Let\'s set up your personalised nutrition plan</p></div>\
<div class="wm-body">\
<div class="wm-steps"><div class="wm-step active" id="wm-s1"></div><div class="wm-step" id="wm-s2"></div><div class="wm-step" id="wm-s3"></div><div class="wm-step" id="wm-s4"></div><div class="wm-step" id="wm-s5"></div></div>\
\
<!-- Step 1: Name -->\
<div id="wm-p1">\
<div class="wm-avatar">' + initials + '</div>\
<div class="wm-name-display">' + userName + '</div>\
<div class="wm-name-hint">This is how you\'ll appear to others — professionals, comments, and your profile.<br>You can change this later in <strong>Settings → Personal Details</strong>.</div>\
<div class="wm-field"><span class="wm-label">Display Name</span><input type="text" class="wm-input" id="wm-name" value="' + userName + '"></div>\
<button class="wm-btn wm-btn-primary" id="wm-next-1">Continue →</button>\
</div>\
\
<!-- Step 2: Body -->\
<div id="wm-p2" style="display:none">\
<div class="wm-field"><span class="wm-label">Gender</span><div class="wm-option-group" id="wm-gender"><div class="wm-option" data-val="male">👨 Male</div><div class="wm-option" data-val="female">👩 Female</div><div class="wm-option" data-val="other">🤝 Prefer not to say</div></div></div>\
<div class="wm-field"><span class="wm-label">Date of Birth</span><input type="date" class="wm-input" id="wm-dob" max="' + new Date().toISOString().split('T')[0] + '"></div>\
<div class="wm-row"><div class="wm-field"><span class="wm-label">Height (cm)</span><input type="number" class="wm-input" id="wm-height" placeholder="e.g. 170" min="100" max="250"></div><div class="wm-field"><span class="wm-label">Weight (kg)</span><input type="number" class="wm-input" id="wm-weight" placeholder="e.g. 70" min="30" max="300" step="0.1"></div></div>\
<button class="wm-btn wm-btn-primary" id="wm-next-2" disabled>Next →</button>\
<button class="wm-btn wm-btn-secondary" id="wm-back-2">← Back</button>\
</div>\
\
<!-- Step 3: Activity & Goal -->\
<div id="wm-p3" style="display:none">\
<div class="wm-field"><span class="wm-label">Activity Level</span><div class="wm-option-group" id="wm-activity">\
<div class="wm-option" data-val="sedentary">🪑 Sedentary<div class="wm-opt-sub">Little or no exercise</div></div>\
<div class="wm-option" data-val="lightly_active">🚶 Lightly Active<div class="wm-opt-sub">Exercise 1–3 days/week</div></div>\
<div class="wm-option" data-val="moderately_active">🏃 Moderately Active<div class="wm-opt-sub">Exercise 3–5 days/week</div></div>\
<div class="wm-option" data-val="very_active">🏋️ Very Active<div class="wm-opt-sub">Exercise 6–7 days/week</div></div>\
</div></div>\
<div class="wm-field"><span class="wm-label">Your Goal</span><div class="wm-option-group" id="wm-goal"><div class="wm-option" data-val="lose">📉 Lose Weight</div><div class="wm-option" data-val="maintain">⚖️ Maintain</div><div class="wm-option" data-val="gain">💪 Gain Muscle</div></div></div>\
<button class="wm-btn wm-btn-primary" id="wm-next-3" disabled>Next →</button>\
<button class="wm-btn wm-btn-secondary" id="wm-back-3">← Back</button>\
</div>\
\
<!-- Step 4: Exercise -->\
<div id="wm-p4" style="display:none">\
<div class="wm-field"><span class="wm-label">Would you like exercise recommendations?</span><div class="wm-option-group" id="wm-wants-ex"><div class="wm-option" data-val="yes">✅ Yes, help me plan</div><div class="wm-option" data-val="no">🚫 No thanks</div></div></div>\
<div id="wm-ex-detail" style="display:none">\
<div class="wm-field"><span class="wm-label">Preferred Intensity</span><div class="wm-option-group" id="wm-ex-intensity">\
<div class="wm-option" data-val="light">🧘 Light<div class="wm-opt-sub">Walking, yoga, stretching</div></div>\
<div class="wm-option" data-val="moderate">🏊 Moderate<div class="wm-opt-sub">Jogging, cycling, swimming</div></div>\
<div class="wm-option" data-val="intense">🔥 Intense<div class="wm-opt-sub">Running, HIIT, weights</div></div>\
</div></div>\
</div>\
<button class="wm-btn wm-btn-primary" id="wm-next-4" disabled>See my plan →</button>\
<button class="wm-btn wm-btn-secondary" id="wm-back-4">← Back</button>\
</div>\
\
<!-- Step 5: Results -->\
<div id="wm-p5" style="display:none">\
<div class="wm-result">\
<div class="wm-result-num" id="wm-res-target">—</div>\
<div class="wm-result-label">Your daily calorie target</div>\
<div class="wm-result-detail">\
<div class="wm-result-item"><div class="wm-result-item-num" id="wm-res-bmi">—</div><div class="wm-result-item-label">BMI</div></div>\
<div class="wm-result-item"><div class="wm-result-item-num" id="wm-res-bmr">—</div><div class="wm-result-item-label">BMR</div></div>\
<div class="wm-result-item"><div class="wm-result-item-num" id="wm-res-tdee">—</div><div class="wm-result-item-label">TDEE</div></div>\
</div></div>\
<div id="wm-res-macros"></div>\
<div id="wm-res-exercise" style="margin-top:12px"></div>\
<div style="font-size:11px;color:var(--ink-f);line-height:1.6;margin:14px 0;text-align:center">Calculated using <strong>Mifflin-St Jeor</strong> equation. Update anytime in <strong>Settings → Health Profile</strong>.</div>\
<button class="wm-btn wm-btn-primary" id="wm-finish">Start tracking →</button>\
</div>\
</div></div>';

    document.body.appendChild(overlay);
    requestAnimationFrame(function () { requestAnimationFrame(function () { overlay.classList.add('visible'); }); });

    // Wire option groups
    ['wm-gender', 'wm-activity', 'wm-goal', 'wm-wants-ex', 'wm-ex-intensity'].forEach(wireOptionGroup);

    // Step 1 — name (always valid)
    document.getElementById('wm-name').addEventListener('input', function () {
      var av = document.querySelector('.wm-avatar');
      var val = this.value.trim();
      if (av && val) {
        av.textContent = val.split(' ').map(function (w) { return w[0] || ''; }).join('').toUpperCase().substring(0, 2);
      }
    });
    document.getElementById('wm-next-1').addEventListener('click', function () { goStep(2); });

    // Step 2 — body validation
    ['wm-dob', 'wm-height', 'wm-weight'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', valStep2);
    });
    document.getElementById('wm-gender').addEventListener('click', function () { setTimeout(valStep2, 10); });
    document.getElementById('wm-next-2').addEventListener('click', function () { goStep(3); });
    document.getElementById('wm-back-2').addEventListener('click', function () { goStep(1); });

    // Step 3 — activity & goal
    document.getElementById('wm-activity').addEventListener('click', function () { setTimeout(valStep3, 10); });
    document.getElementById('wm-goal').addEventListener('click', function () { setTimeout(valStep3, 10); });
    document.getElementById('wm-next-3').addEventListener('click', function () { goStep(4); });
    document.getElementById('wm-back-3').addEventListener('click', function () { goStep(2); });

    // Step 4 — exercise
    document.getElementById('wm-wants-ex').addEventListener('click', function () {
      setTimeout(function () {
        var v = getSelVal('wm-wants-ex');
        document.getElementById('wm-ex-detail').style.display = v === 'yes' ? 'block' : 'none';
        valStep4();
      }, 10);
    });
    document.getElementById('wm-ex-intensity').addEventListener('click', function () { setTimeout(valStep4, 10); });
    document.getElementById('wm-next-4').addEventListener('click', function () { showResults(); goStep(5); });
    document.getElementById('wm-back-4').addEventListener('click', function () { goStep(3); });

    // Step 5 — finish
    document.getElementById('wm-finish').addEventListener('click', function () {
      var p = collectAll();
      saveProfile(p);
      applyToDashboard(p);
      overlay.classList.remove('visible');
      setTimeout(function () { overlay.remove(); }, 300);
      if (typeof showToast === 'function') showToast('Your plan is ready!', '#1e6b5e');
    });
  }

  function goStep(n) {
    for (var i = 1; i <= 5; i++) {
      var pg = document.getElementById('wm-p' + i);
      if (pg) pg.style.display = i === n ? 'block' : 'none';
      var st = document.getElementById('wm-s' + i);
      if (st) st.className = 'wm-step' + (i < n ? ' done' : i === n ? ' active' : '');
    }
  }

  function wireOptionGroup(id) {
    var g = document.getElementById(id);
    if (!g) return;
    g.addEventListener('click', function (e) {
      var opt = e.target.closest('.wm-option');
      if (!opt) return;
      g.querySelectorAll('.wm-option').forEach(function (o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
    });
  }

  function getSelVal(id) {
    var s = document.querySelector('#' + id + ' .wm-option.selected');
    return s ? s.getAttribute('data-val') : null;
  }

  function valStep2() {
    document.getElementById('wm-next-2').disabled = !(getSelVal('wm-gender') && document.getElementById('wm-dob').value && document.getElementById('wm-height').value && document.getElementById('wm-weight').value);
  }
  function valStep3() {
    document.getElementById('wm-next-3').disabled = !(getSelVal('wm-activity') && getSelVal('wm-goal'));
  }
  function valStep4() {
    var wants = getSelVal('wm-wants-ex');
    if (!wants) { document.getElementById('wm-next-4').disabled = true; return; }
    if (wants === 'no') { document.getElementById('wm-next-4').disabled = false; return; }
    document.getElementById('wm-next-4').disabled = !getSelVal('wm-ex-intensity');
  }

  function collectAll() {
    return {
      displayName: (document.getElementById('wm-name') || {}).value || '',
      gender: getSelVal('wm-gender') || 'other',
      dateOfBirth: (document.getElementById('wm-dob') || {}).value || '',
      heightCm: parseFloat((document.getElementById('wm-height') || {}).value) || 170,
      weightKg: parseFloat((document.getElementById('wm-weight') || {}).value) || 70,
      activityLevel: getSelVal('wm-activity') || 'moderately_active',
      goal: getSelVal('wm-goal') || 'maintain',
      wantsExercise: getSelVal('wm-wants-ex') === 'yes',
      exerciseIntensity: getSelVal('wm-ex-intensity') || 'moderate'
    };
  }

  function showResults() {
    var p = collectAll();
    var s = computeAll(p);

    document.getElementById('wm-res-target').textContent = s.target.toLocaleString();
    document.getElementById('wm-res-bmi').textContent = s.bmi;
    document.getElementById('wm-res-bmr').textContent = s.bmr.toLocaleString();
    document.getElementById('wm-res-tdee').textContent = s.tdee.toLocaleString();

    // Macros
    var m = s.macros;
    document.getElementById('wm-res-macros').innerHTML =
      '<div style="font-size:11px;font-weight:700;color:var(--ink);margin-bottom:6px">Daily Macro Targets</div>' +
      '<div class="wm-macro-row">' +
        '<div class="wm-macro-chip"><div class="wm-macro-val" style="color:#d4956a">' + m.proteinG + 'g</div><div class="wm-macro-lbl">Protein · ' + m.proteinPct + '%</div></div>' +
        '<div class="wm-macro-chip"><div class="wm-macro-val" style="color:#2f8f7f">' + m.carbsG + 'g</div><div class="wm-macro-lbl">Carbs · ' + m.carbsPct + '%</div></div>' +
        '<div class="wm-macro-chip"><div class="wm-macro-val" style="color:#7aaad4">' + m.fatG + 'g</div><div class="wm-macro-lbl">Fat · ' + m.fatPct + '%</div></div>' +
      '</div>';

    // Exercise
    var exEl = document.getElementById('wm-res-exercise');
    if (p.wantsExercise) {
      exEl.innerHTML = '<div style="background:var(--teal-lll);border:1px solid var(--teal-ll);border-radius:10px;padding:12px 14px">' +
        '<div style="font-size:11px;font-weight:700;color:var(--teal);margin-bottom:4px">🏃 Daily Exercise Goal</div>' +
        '<div style="font-size:13px;color:var(--ink)">~' + s.exercise.kcalPerDay + ' kcal · ' + s.exercise.suggestion + '</div></div>';
    } else {
      exEl.innerHTML = '<div style="font-size:11px;color:var(--ink-f);text-align:center">No exercise target — you can enable this later in Settings.</div>';
    }
  }

  // ── Init ─────────────────────────────────────────────────────
  function init() {
    injectStyles();
    patchSettings();
    var profile = getProfile();
    if (isProfileComplete(profile)) {
      applyToDashboard(profile);
    } else {
      buildModal();
    }
  }

  // Expose
  window._nwShowWelcomeModal = function () { var p = getProfile(); if (!isProfileComplete(p)) buildModal(); };
  window._nwGetProfile = getProfile;
  window._nwApplyProfile = applyToDashboard;
  window._nwComputeProfile = computeAll;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 300);

})();
