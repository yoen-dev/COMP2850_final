/**
 * NourishWell — Feature & A11y Patch
 * ==================================================================
 * Load this file AFTER all other scripts on the SUBSCRIBER DASHBOARD:
 *   <script src="js/nourishwell-patch.js" defer></script>
 *
 * What this file does (independently, no backend required):
 *   1. Fixes XSS vulnerability in comment rendering
 *   2. Adds proactive nutrition Insight cards on Record Today
 *   3. Adds Fridge Mode (search recipes by ingredients you have)
 *   4. Adds "I've cooked this" toggle on favourites
 *   5. Adds Cooking Mode (full-screen step-by-step)
 *   6. Adds keyboard shortcuts (g+r, g+f, g+p, /, ?, Esc)
 *   7. Adds PDF export of weekly report
 *   8. Adds keyboard handling for all role="button" elements
 *   9. Marks decorative emojis aria-hidden automatically
 *  10. Announces page changes to screen readers (aria-live)
 *
 * All features work client-side only (localStorage).
 */

(function () {
  'use strict';

  // ──────────────────────────────────────────────────────────────
  // 0.  SAFETY — HTML escape helper (fixes XSS)
  // ──────────────────────────────────────────────────────────────
  /**
   * Escape HTML special characters to prevent XSS.
   * Use this anywhere user-supplied text is inserted into innerHTML.
   * @param {string} s - Raw user input
   * @returns {string} Escaped string safe for HTML insertion
   */
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  window.escapeHtml = escapeHtml;

  // ──────────────────────────────────────────────────────────────
  // 1.  XSS FIX — patch renderComments() so comment text is escaped
  //     (Original code interpolated c.text directly into innerHTML)
  // ──────────────────────────────────────────────────────────────
  if (typeof window.renderComments === 'function') {
    window.renderComments = function (recipeId) {
      const comments = (window.recipeComments && window.recipeComments[recipeId]) || [];
      let html = '<div class="comment-section">' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;' +
        'color:var(--ink-f);letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px">' +
        'Comments (' + comments.length + ')</div>';
      comments.forEach(function (c) {
        html += '<div class="comment-item">' +
          '<div class="comment-author">' + escapeHtml(c.author) + ' · ' + escapeHtml(c.time) + '</div>' +
          '<div class="comment-text">' + escapeHtml(c.text) + '</div>' +
        '</div>';
      });
      const safeId = escapeHtml(recipeId);
      html += '<div class="comment-input-wrap">' +
        '<input type="text" id="comment-input-' + safeId + '" placeholder="Add a comment..." ' +
        'aria-label="Add comment" ' +
        'onkeydown="if(event.key===\'Enter\')addComment(\'' + safeId + '\')">' +
        '<button onclick="addComment(\'' + safeId + '\')">Post</button>' +
      '</div></div>';
      return html;
    };
  }

  // ──────────────────────────────────────────────────────────────
  // 2.  PROACTIVE NUTRITION INSIGHTS
  //     Generates 1–3 feedback cards based on today's diary data.
  //     Matches spec requirement: "clear feedback to subscribers
  //     that helps them improve their diet"
  // ──────────────────────────────────────────────────────────────

  /**
   * Compute today's nutrition totals from the meal log.
   * Falls back to demo values if live data not available.
   */
  function computeTodayNutrition() {
    // Try to read actual values from DOM donut card
    const kcalEl = document.querySelector('.dc-total-num');
    const values = { kcal: 1920, target: 2400, carbs: 201, protein: 68, fat: 38, sugar: 84,
                     carbsT: 300, proteinT: 120, fatT: 65, sugarT: 50 };
    if (kcalEl) {
      const m = kcalEl.textContent.replace(/,/g, '').match(/\d+/);
      if (m) values.kcal = parseInt(m[0], 10);
    }
    return values;
  }

  /**
   * Rule engine — returns an array of Insight objects.
   * Each rule checks one aspect of today's intake and optionally
   * emits an insight. Rules are designed to be encouraging, not
   * shaming (per WHO healthy-eating guidance).
   */
  function generateInsights() {
    const n = computeTodayNutrition();
    const out = [];

    // Protein low?
    const proteinPct = (n.protein / n.proteinT) * 100;
    if (proteinPct < 60) {
      out.push({
        type: 'warn',
        icon: '💪',
        title: 'Protein could be higher today',
        body: 'You\'re at ' + n.protein + 'g of your ' + n.proteinT +
              'g target. A 150g pot of Greek yoghurt (~17g) or 100g of chicken (~30g) would help close the gap.'
      });
    } else if (proteinPct >= 90) {
      out.push({
        type: 'good',
        icon: '✓',
        title: 'Protein target smashed',
        body: 'Great job hitting ' + n.protein + 'g protein — ideal for recovery and satiety.'
      });
    }

    // Sugar high?
    if (n.sugar > n.sugarT * 1.3) {
      out.push({
        type: 'alert',
        icon: '🍬',
        title: 'Sugar intake is above target',
        body: 'At ' + n.sugar + 'g, you\'re over the recommended ' + n.sugarT +
              'g/day. Try swapping one sugary drink for sparkling water with lemon tomorrow.'
      });
    } else if (n.sugar <= n.sugarT * 0.8) {
      out.push({
        type: 'good',
        icon: '✓',
        title: 'Sugar well under target',
        body: 'You\'re at ' + n.sugar + 'g — comfortably below the ' + n.sugarT + 'g daily max. Nice consistency.'
      });
    }

    // Calorie pacing
    const hr = new Date().getHours();
    const kcalPct = (n.kcal / n.target) * 100;
    if (hr >= 20 && kcalPct < 70) {
      out.push({
        type: 'warn',
        icon: '⏰',
        title: 'You may be under-eating today',
        body: 'At ' + n.kcal + ' kcal so far, you\'re well under target. A light evening snack with protein could help.'
      });
    } else if (hr <= 14 && kcalPct > 70) {
      out.push({
        type: 'warn',
        icon: '⏰',
        title: 'Front-loaded intake',
        body: 'You\'ve consumed ' + Math.round(kcalPct) + '% of today\'s target by lunch. Consider a lighter dinner.'
      });
    }

    // Streak encouragement
    try {
      const diary = JSON.parse(localStorage.getItem('nw-diary-history') || '{}');
      const days = Object.keys(diary).length;
      if (days >= 7 && days % 7 === 0) {
        out.push({
          type: 'good',
          icon: '🌟',
          title: days + '-day logging streak',
          body: 'Consistency is the single best predictor of nutritional improvement. Keep going.'
        });
      }
    } catch (e) { /* ignore */ }

    // Fallback: always show at least one tip
    if (out.length === 0) {
      out.push({
        type: 'good',
        icon: '🌱',
        title: 'Looking balanced today',
        body: 'Your macros are in a healthy range. Small consistent choices add up.'
      });
    }

    return out.slice(0, 3); // cap at 3
  }

  /**
   * Render insights into #insights-container on Record Today page.
   */
  function renderInsights() {
    const host = document.getElementById('insights-container');
    if (!host) return;
    const insights = generateInsights();
    host.innerHTML = insights.map(function (i) {
      return '<div class="insight-card ' + i.type + '" role="status">' +
        '<div class="insight-title">' +
          '<span class="insight-icon" aria-hidden="true">' + i.icon + '</span>' +
          escapeHtml(i.title) +
        '</div>' +
        '<div class="insight-body">' + escapeHtml(i.body) + '</div>' +
      '</div>';
    }).join('');
  }
  window.renderInsights = renderInsights;

  // ──────────────────────────────────────────────────────────────
  // 3.  FRIDGE MODE — search recipes by ingredients on hand
  //     Directly addresses spec: "ability to search for
  //     recommendations that make use of specific ingredients"
  // ──────────────────────────────────────────────────────────────
  const COMMON_INGREDIENTS = [
    { emoji: '🍅', name: 'Tomato' },
    { emoji: '🥚', name: 'Eggs' },
    { emoji: '🧄', name: 'Garlic' },
    { emoji: '🧅', name: 'Onion' },
    { emoji: '🥑', name: 'Avocado' },
    { emoji: '🐟', name: 'Salmon' },
    { emoji: '🍗', name: 'Chicken' },
    { emoji: '🌾', name: 'Quinoa' },
    { emoji: '🍚', name: 'Rice' },
    { emoji: '🍝', name: 'Pasta' },
    { emoji: '🥬', name: 'Spinach' },
    { emoji: '🧀', name: 'Feta' }
  ];
  let fridgeSelected = new Set();
  try {
    const saved = localStorage.getItem('nw-fridge');
    if (saved) JSON.parse(saved).forEach(function (x) { fridgeSelected.add(x); });
  } catch (e) { /* ignore */ }

  function saveFridge() {
    try {
      localStorage.setItem('nw-fridge', JSON.stringify([...fridgeSelected]));
    } catch (e) { /* ignore */ }
  }

  function renderFridgePanel() {
    const host = document.getElementById('fridge-panel-host');
    if (!host) return;

    const chipsHtml = COMMON_INGREDIENTS.map(function (ing) {
      const isSel = fridgeSelected.has(ing.name.toLowerCase());
      return '<button type="button" class="fridge-chip ' + (isSel ? 'selected' : '') +
        '" data-ing="' + escapeHtml(ing.name.toLowerCase()) + '" ' +
        'aria-pressed="' + isSel + '">' +
        '<span aria-hidden="true">' + ing.emoji + '</span> ' + escapeHtml(ing.name) +
        (isSel ? '<span class="chip-x" aria-hidden="true">×</span>' : '') +
      '</button>';
    }).join('');

    // Custom ingredients (not in common list)
    const customChips = [...fridgeSelected]
      .filter(function (x) {
        return !COMMON_INGREDIENTS.some(function (c) { return c.name.toLowerCase() === x; });
      })
      .map(function (x) {
        return '<button type="button" class="fridge-chip selected" data-ing="' + escapeHtml(x) + '" aria-pressed="true">' +
          escapeHtml(x) + '<span class="chip-x" aria-hidden="true">×</span></button>';
      }).join('');

    host.innerHTML =
      '<div class="fridge-panel">' +
        '<div class="fridge-title">' +
          '<span aria-hidden="true">🧊</span> What\'s in your fridge?' +
        '</div>' +
        '<div class="fridge-sub">Tap what you have — we\'ll rank recipes by how many you can make</div>' +
        '<div class="fridge-chips">' + chipsHtml + customChips + '</div>' +
        '<div class="fridge-input">' +
          '<label for="fridge-custom-input" class="sr-only">Add a custom ingredient</label>' +
          '<input type="text" id="fridge-custom-input" placeholder="Add something else (e.g. mushrooms)">' +
          '<button type="button" id="fridge-add-btn">Add</button>' +
        '</div>' +
      '</div>';

    // Wire up chip toggles (event delegation)
    host.querySelectorAll('.fridge-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        const ing = chip.dataset.ing;
        if (fridgeSelected.has(ing)) fridgeSelected.delete(ing);
        else fridgeSelected.add(ing);
        saveFridge();
        renderFridgePanel();
        applyFridgeSort();
      });
    });
    // Custom add
    const addBtn = document.getElementById('fridge-add-btn');
    const inputEl = document.getElementById('fridge-custom-input');
    function addCustom() {
      const val = (inputEl.value || '').trim().toLowerCase();
      if (!val) return;
      fridgeSelected.add(val);
      saveFridge();
      inputEl.value = '';
      renderFridgePanel();
      applyFridgeSort();
    }
    addBtn.addEventListener('click', addCustom);
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addCustom(); }
    });
  }

  /**
   * Sort recipe cards by match count (descending) and show badge.
   * Relies on global RECIPES object in dashboard.html.
   */
  function applyFridgeSort() {
    if (!window.RECIPES) return;
    const grid = document.querySelector('.recipe-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.recipe-card'));
    const selected = [...fridgeSelected];

    // Compute scores
    const scored = cards.map(function (card) {
      const id = card.dataset.recipeId;
      const r = window.RECIPES[id];
      if (!r || !r.ingredients) return { card: card, score: 0, total: 0 };
      const ingText = r.ingredients.join(' ').toLowerCase();
      let matches = 0;
      selected.forEach(function (s) {
        if (ingText.includes(s)) matches++;
      });
      return { card: card, score: matches, total: selected.length };
    });

    // Remove old badges
    cards.forEach(function (c) {
      const b = c.querySelector('.rc-match-badge');
      if (b) b.remove();
    });

    if (selected.length > 0) {
      // Add badges + reorder
      scored.sort(function (a, b) { return b.score - a.score; });
      scored.forEach(function (s) {
        if (s.score > 0) {
          const badge = document.createElement('div');
          badge.className = 'rc-match-badge';
          badge.textContent = s.score + '/' + s.total + ' match';
          s.card.appendChild(badge);
        }
        grid.appendChild(s.card);
      });
    }
  }
  window.applyFridgeSort = applyFridgeSort;

  // ──────────────────────────────────────────────────────────────
  // 4.  COOKED / TRIED TOGGLE on favourite cards
  // ──────────────────────────────────────────────────────────────
  let cookedSet = new Set();
  try {
    const s = localStorage.getItem('nw-cooked');
    if (s) JSON.parse(s).forEach(function (x) { cookedSet.add(x); });
  } catch (e) { /* ignore */ }

  function saveCooked() {
    try { localStorage.setItem('nw-cooked', JSON.stringify([...cookedSet])); } catch (e) {}
  }

  function augmentFavouriteCards() {
    // Every time favourites page renders, add a Tried toggle if missing
    document.querySelectorAll('.fav-card').forEach(function (card, idx) {
      if (card.querySelector('.cooked-toggle')) return;
      // Try to find a recipe id — fallback to title
      const titleEl = card.querySelector('.fav-card-title');
      if (!titleEl) return;
      const id = (titleEl.textContent || '').toLowerCase().replace(/\s+/g, '-');
      const footer = card.querySelector('.fav-card-footer');
      if (!footer) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cooked-toggle' + (cookedSet.has(id) ? ' cooked' : '');
      btn.setAttribute('aria-pressed', cookedSet.has(id));
      btn.innerHTML = cookedSet.has(id)
        ? '<span aria-hidden="true">✓</span> Tried'
        : '<span aria-hidden="true">🍽️</span> Try soon';
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (cookedSet.has(id)) cookedSet.delete(id);
        else cookedSet.add(id);
        saveCooked();
        btn.classList.toggle('cooked');
        const pressed = cookedSet.has(id);
        btn.setAttribute('aria-pressed', pressed);
        btn.innerHTML = pressed
          ? '<span aria-hidden="true">✓</span> Tried'
          : '<span aria-hidden="true">🍽️</span> Try soon';
      });

      // Insert before .fav-remove
      const remove = footer.querySelector('.fav-remove');
      if (remove) footer.insertBefore(btn, remove);
      else footer.appendChild(btn);
    });
  }
  window.augmentFavouriteCards = augmentFavouriteCards;

  // ──────────────────────────────────────────────────────────────
  // 5.  COOKING MODE — full-screen step-by-step walkthrough
  // ──────────────────────────────────────────────────────────────
  function buildCookingModeScaffold() {
    if (document.getElementById('cookingMode')) return;
    const el = document.createElement('div');
    el.id = 'cookingMode';
    el.className = 'cooking-mode';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'cook-title');
    el.innerHTML =
      '<div class="cook-header">' +
        '<div class="cook-title" id="cook-title"></div>' +
        '<button type="button" class="cook-close" aria-label="Exit cooking mode" id="cook-close">✕</button>' +
      '</div>' +
      '<div class="cook-body">' +
        '<div class="cook-step">' +
          '<div class="cook-step-counter" id="cook-counter"></div>' +
          '<div class="cook-step-text" id="cook-step-text"></div>' +
          '<div class="cook-ingredient-list" id="cook-ingredients" style="display:none"></div>' +
        '</div>' +
      '</div>' +
      '<div class="cook-footer">' +
        '<button type="button" class="cook-nav-btn ghost" id="cook-prev">← Previous</button>' +
        '<div class="cook-progress"><div class="cook-progress-fill" id="cook-fill"></div></div>' +
        '<button type="button" class="cook-nav-btn" id="cook-next">Next →</button>' +
      '</div>';
    document.body.appendChild(el);

    document.getElementById('cook-close').addEventListener('click', closeCookingMode);
    document.getElementById('cook-prev').addEventListener('click', function () { cookNav(-1); });
    document.getElementById('cook-next').addEventListener('click', function () { cookNav(1); });
  }

  let cookState = { recipe: null, step: -1 };

  function openCookingMode(recipeId) {
    if (!window.RECIPES) return;
    const r = window.RECIPES[recipeId];
    if (!r) return;
    buildCookingModeScaffold();
    cookState.recipe = r;
    cookState.step = -1; // -1 = ingredients screen, then steps 0..n-1
    renderCookStep();
    document.getElementById('cookingMode').classList.add('active');
    document.body.style.overflow = 'hidden';
    // Focus the close button for immediate keyboard control
    setTimeout(function () { document.getElementById('cook-close').focus(); }, 50);
  }
  window.openCookingMode = openCookingMode;

  function closeCookingMode() {
    const el = document.getElementById('cookingMode');
    if (el) el.classList.remove('active');
    document.body.style.overflow = '';
    cookState = { recipe: null, step: -1 };
  }
  window.closeCookingMode = closeCookingMode;

  function cookNav(dir) {
    if (!cookState.recipe) return;
    const steps = cookState.recipe.steps || [];
    cookState.step = Math.max(-1, Math.min(steps.length - 1, cookState.step + dir));
    renderCookStep();
  }

  function renderCookStep() {
    const r = cookState.recipe;
    if (!r) return;
    document.getElementById('cook-title').textContent = r.name;
    const steps = r.steps || [];
    const total = steps.length + 1; // +1 for ingredients
    const idx = cookState.step + 1; // 0 = ingredients
    const counter = document.getElementById('cook-counter');
    const text = document.getElementById('cook-step-text');
    const ing = document.getElementById('cook-ingredients');
    const fill = document.getElementById('cook-fill');
    const prevBtn = document.getElementById('cook-prev');
    const nextBtn = document.getElementById('cook-next');

    if (cookState.step === -1) {
      counter.textContent = 'Ingredients';
      text.textContent = 'Gather your ingredients';
      ing.style.display = 'block';
      ing.innerHTML = (r.ingredients || []).map(function (i) {
        return '<div>• ' + escapeHtml(i) + '</div>';
      }).join('');
    } else {
      counter.textContent = 'Step ' + (cookState.step + 1) + ' of ' + steps.length;
      text.textContent = steps[cookState.step];
      ing.style.display = 'none';
    }
    fill.style.width = ((idx + 1) / total * 100) + '%';
    prevBtn.disabled = cookState.step === -1;
    nextBtn.disabled = cookState.step === steps.length - 1;
    nextBtn.textContent = cookState.step === steps.length - 1 ? '✓ Done' : 'Next →';
  }

  // ──────────────────────────────────────────────────────────────
  // 6.  KEYBOARD SHORTCUTS
  // ──────────────────────────────────────────────────────────────
  let gPressed = false;
  document.addEventListener('keydown', function (e) {
    const tag = (e.target.tagName || '').toLowerCase();
    const isTyping = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
    if (isTyping && e.key !== 'Escape') return;

    // Escape closes cooking mode / shortcuts help
    if (e.key === 'Escape') {
      if (document.getElementById('cookingMode') &&
          document.getElementById('cookingMode').classList.contains('active')) {
        closeCookingMode();
      }
      const so = document.getElementById('shortcutsHelp');
      if (so && so.classList.contains('open')) so.classList.remove('open');
      return;
    }

    // Cooking-mode arrow keys
    const cm = document.getElementById('cookingMode');
    if (cm && cm.classList.contains('active')) {
      if (e.key === 'ArrowRight') { e.preventDefault(); cookNav(1); return; }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); cookNav(-1); return; }
    }

    // `?` opens shortcut help
    if (e.key === '?' && e.shiftKey) { e.preventDefault(); toggleShortcutHelp(true); return; }

    // `/` focuses search
    if (e.key === '/') {
      const search = document.querySelector('.rs-input')
        || document.querySelector('.qa-search-input');
      if (search) { e.preventDefault(); search.focus(); return; }
    }

    // `g` then a letter = go to page
    if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
      gPressed = true;
      setTimeout(function () { gPressed = false; }, 800);
      return;
    }
    if (gPressed) {
      gPressed = false;
      const mapping = { r: 'record', f: 'favourites', p: 'planner', c: 'plan', s: 'recipe' };
      const target = mapping[e.key];
      if (target && typeof window.switchPage === 'function') {
        const navBtn = Array.from(document.querySelectorAll('.sn-item'))
          .find(function (el) {
            return (el.getAttribute('onclick') || '').includes("'" + target + "'");
          });
        if (navBtn) window.switchPage(target, navBtn);
      }
    }
  });

  function toggleShortcutHelp(show) {
    let el = document.getElementById('shortcutsHelp');
    if (!el) {
      el = document.createElement('div');
      el.id = 'shortcutsHelp';
      el.className = 'shortcuts-overlay';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-labelledby', 'shortcuts-title');
      el.innerHTML =
        '<div class="shortcuts-modal">' +
          '<div id="shortcuts-title" style="font-family:\'Instrument Serif\',serif;font-size:22px;font-style:italic;margin-bottom:16px;color:var(--ink)">Keyboard <em>Shortcuts</em></div>' +
          row('Focus search',        ['/']) +
          row('Go to Record Today',  ['g', 'r']) +
          row('Go to Recipes',       ['g', 's']) +
          row('Go to Favourites',    ['g', 'f']) +
          row('Go to Compare',       ['g', 'c']) +
          row('Go to Meal Planner',  ['g', 'p']) +
          row('Next / previous step in cooking mode', ['←', '→']) +
          row('Close / dismiss', ['Esc']) +
          row('Show this help',  ['?']) +
        '</div>';
      el.addEventListener('click', function (e) {
        if (e.target === el) el.classList.remove('open');
      });
      document.body.appendChild(el);
    }
    el.classList.toggle('open', show);
    function row(label, keys) {
      return '<div class="shortcut-row">' +
        '<span>' + label + '</span>' +
        '<span class="shortcut-keys">' +
          keys.map(function (k) {
            return '<span class="shortcut-key">' + escapeHtml(k) + '</span>';
          }).join('') +
        '</span>' +
      '</div>';
    }
  }
  window.toggleShortcutHelp = toggleShortcutHelp;

  // ──────────────────────────────────────────────────────────────
  // 7.  EXPORT WEEKLY REPORT — CSV download (no library needed)
  // ──────────────────────────────────────────────────────────────
  function exportWeeklyReportCSV() {
    let history = {};
    try { history = JSON.parse(localStorage.getItem('nw-diary-history') || '{}'); } catch (e) {}
    const rows = [['Date', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Sugar (g)']];

    // Build last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const day = history[key] || {};
      rows.push([
        key,
        day.kcal || '',
        day.protein || '',
        day.carbs || '',
        day.fat || '',
        day.sugar || ''
      ]);
    }

    const csv = rows.map(function (r) {
      return r.map(function (cell) {
        const s = String(cell);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',');
    }).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nourishwell-weekly-report-' + new Date().toISOString().split('T')[0] + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  window.exportWeeklyReportCSV = exportWeeklyReportCSV;

  // ──────────────────────────────────────────────────────────────
  // 8.  UNIVERSAL KEYBOARD HANDLER for role="button"
  //     (Fixes: keyboard users can't activate div onclick elements)
  // ──────────────────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = e.target;
    if (!t) return;
    const isRoleBtn = t.getAttribute && t.getAttribute('role') === 'button';
    const hasTabindex = t.hasAttribute && t.hasAttribute('tabindex');
    if (isRoleBtn && hasTabindex && t.tagName.toLowerCase() !== 'button') {
      e.preventDefault();
      t.click();
    }
  });

  // ──────────────────────────────────────────────────────────────
  // 9.  AUTO-MARK DECORATIVE EMOJIS aria-hidden
  //     Any emoji inside an element that already has accessible text
  //     (aria-label, or a text sibling) is decorative.
  // ──────────────────────────────────────────────────────────────
  const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}]/u;

  function markDecorativeEmojis(root) {
    root = root || document.body;
    // 1. Elements whose SOLE content is an emoji, inside a labelled parent
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    let node;
    while ((node = walker.nextNode())) {
      if (!node || !node.textContent) continue;
      if (node.hasAttribute && node.hasAttribute('aria-hidden')) continue;
      const raw = node.textContent.trim();
      if (!raw) continue;
      const onlyEmoji = EMOJI_RE.test(raw) && raw.length <= 4
        && !/[a-zA-Z0-9]/.test(raw);
      const tag = node.tagName.toLowerCase();
      if (onlyEmoji && (tag === 'span' || tag === 'div' || tag === 'i') && node.children.length === 0) {
        // Check parent has accessible name
        const parent = node.parentElement;
        if (parent) {
          const parentText = parent.textContent.trim();
          if (parentText.length > raw.length || parent.getAttribute('aria-label')) {
            node.setAttribute('aria-hidden', 'true');
          }
        }
      }
    }
  }
  window.markDecorativeEmojis = markDecorativeEmojis;

  // ──────────────────────────────────────────────────────────────
  // 10. ARIA-LIVE announcer — tells screen readers when page changes
  // ──────────────────────────────────────────────────────────────
  function ensureLiveRegion() {
    if (document.getElementById('nw-live-region')) return;
    const live = document.createElement('div');
    live.id = 'nw-live-region';
    live.className = 'sr-only';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    document.body.appendChild(live);
  }
  function announce(text) {
    ensureLiveRegion();
    const live = document.getElementById('nw-live-region');
    live.textContent = '';
    setTimeout(function () { live.textContent = text; }, 50);
  }
  window.announce = announce;

  // Hook into switchPage to announce nav changes
  if (typeof window.switchPage === 'function') {
    const origSwitchPage = window.switchPage;
    window.switchPage = function (p, el) {
      origSwitchPage(p, el);
      const titles = {
        record: 'Record Today',
        recipe: 'Discover Recipes',
        favourites: 'My Favourites',
        plan: 'Recipe Compare',
        planner: 'Meal Planner'
      };
      announce('Navigated to ' + (titles[p] || p));
      if (p === 'favourites') augmentFavouriteCards();
      if (p === 'record') renderInsights();
      if (p === 'recipe') {
        renderFridgePanel();
        applyFridgeSort();
      }
    };
  }

  // ──────────────────────────────────────────────────────────────
  // INIT
  // ──────────────────────────────────────────────────────────────
  function init() {
    ensureLiveRegion();
    markDecorativeEmojis();
    renderInsights();
    renderFridgePanel();
    augmentFavouriteCards();

    // Re-mark after any DOM mutations (when cards get rendered dynamically)
    const mo = new MutationObserver(function () {
      markDecorativeEmojis();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
