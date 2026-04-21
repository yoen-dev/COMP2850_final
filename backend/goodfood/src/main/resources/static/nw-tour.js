/**
 * NourishWell — Guided Tour v2
 * ══════════════════════════════════════════════════════════════
 * Card-based walkthrough with SVG illustrations.
 * Auto-shows on first login, available via Tour button anytime.
 * <script src="nw-tour.js"></script>
 * ══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  // ── Per-user tour key ────────────────────────────────────────
  function tourKey() {
    var uid = (typeof NW !== 'undefined' && NW.auth) ? NW.auth.userId : '';
    return uid ? 'nw-' + uid + '-tour-seen' : 'nw-tour-seen';
  }

  // ── Tour Slides Data ─────────────────────────────────────────
  var slides = [
    {
      title: 'Welcome to NourishWell',
      body: 'Your personal nutrition companion. Track meals, discover recipes, plan your day, and reach your health goals — all in one place. Let\'s take a quick look around.',
      illustration: function () {
        return '<div style="display:flex;align-items:center;justify-content:center;gap:16px;padding:20px 0">' +
          '<div style="font-size:40px">🌿</div>' +
          '<div style="text-align:left"><div style="font-family:\'Instrument Serif\',serif;font-size:24px;font-style:italic;color:var(--ink)">Good food,</div>' +
          '<div style="font-family:\'Instrument Serif\',serif;font-size:24px;font-style:italic;color:var(--teal)"><em>understood.</em></div></div>' +
        '</div>';
      }
    },
    {
      title: 'Daily Nutrition Tracker',
      body: 'The donut chart shows your calorie intake and macro breakdown in real time. As you log meals, it fills up towards your personalised daily target. The percentage tells you how far along you are.',
      illustration: function () {
        return '<div style="display:flex;align-items:center;justify-content:center;gap:20px;padding:10px 0">' +
          '<svg width="90" height="90" viewBox="0 0 90 90">' +
            '<circle cx="45" cy="45" r="32" fill="none" stroke="rgba(30,107,94,0.15)" stroke-width="10"/>' +
            '<circle cx="45" cy="45" r="32" fill="none" stroke="#2f8f7f" stroke-width="10" stroke-dasharray="120 81" stroke-linecap="round" transform="rotate(-90 45 45)"/>' +
            '<circle cx="45" cy="45" r="32" fill="none" stroke="#d4956a" stroke-width="10" stroke-dasharray="40 161" stroke-linecap="butt" transform="rotate(125 45 45)"/>' +
            '<text x="45" y="43" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)" font-family="Bricolage Grotesque,sans-serif">1,420</text>' +
            '<text x="45" y="55" text-anchor="middle" font-size="7" fill="var(--ink-f)" font-family="JetBrains Mono,monospace">kcal</text>' +
          '</svg>' +
          '<div style="font-size:11px;color:var(--ink-f);line-height:1.7">' +
            '<div><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#2f8f7f;margin-right:5px"></span>Carbs</div>' +
            '<div><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#d4956a;margin-right:5px"></span>Protein</div>' +
            '<div><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#7aaad4;margin-right:5px"></span>Fat</div>' +
            '<div><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#e07b78;margin-right:5px"></span>Sugar</div>' +
          '</div>' +
        '</div>';
      }
    },
    {
      title: 'Log Meals & Exercise',
      body: 'Tap "Record Meal" to log food across 6 time slots (Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner, Evening Snack). Tap "Exercise" to log workouts. Everything updates your charts instantly.',
      illustration: function () {
        return '<div style="display:flex;gap:12px;justify-content:center;padding:10px 0">' +
          miniCard('🍽️', 'Record Meal', 'Log what you ate') +
          miniCard('🏃', 'Exercise', 'Log your activity') +
        '</div>';
      }
    },
    {
      title: 'Exercise & Calorie Charts',
      body: 'The bar chart tracks your daily exercise calories burned (with a target line if you set one). The line chart shows your calorie intake trend over the week with a target reference line. Switch between Week, Month, and Year views.',
      illustration: function () {
        return '<div style="display:flex;gap:16px;justify-content:center;padding:10px 0;flex-wrap:wrap">' +
          // Mini bar chart
          '<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:10px 14px;min-width:130px">' +
            '<div style="font-size:8px;font-weight:700;color:var(--ink);margin-bottom:8px">Exercise Activity</div>' +
            '<div style="display:flex;align-items:flex-end;gap:4px;height:50px">' +
              miniBar(60) + miniBar(85) + miniBar(0) + miniBar(70) + miniBar(95) + miniBar(45) + miniBar(75) +
            '</div>' +
            '<div style="height:1px;background:var(--amber);opacity:0.5;margin-top:-20px;margin-bottom:19px;border-top:1.5px dashed var(--amber)"></div>' +
          '</div>' +
          // Mini line chart
          '<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:10px 14px;min-width:130px">' +
            '<div style="font-size:8px;font-weight:700;color:var(--ink);margin-bottom:8px">Calorie Trend</div>' +
            '<svg width="120" height="50" viewBox="0 0 120 50">' +
              '<line x1="0" y1="18" x2="120" y2="18" stroke="var(--amber)" stroke-width="1" stroke-dasharray="3 2"/>' +
              '<polyline points="0,30 20,22 40,38 60,15 80,28 100,20 120,25" fill="none" stroke="var(--teal)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
              '<polyline points="0,30 20,22 40,38 60,15 80,28 100,20 120,25" fill="rgba(30,107,94,0.1)" stroke="none"/>' +
            '</svg>' +
          '</div>' +
        '</div>';
      }
    },
    {
      title: 'Browse & Search Recipes',
      body: 'Explore our recipe library with search, category filters (Healthy, Quick, Vegan, High Protein, Comfort), and the Fridge Mode — tap ingredients you have and we\'ll rank recipes by what you can make.',
      illustration: function () {
        return '<div style="padding:8px 0">' +
          '<div style="display:flex;align-items:center;gap:8px;background:var(--white);border:1px solid var(--border);border-radius:10px;padding:8px 12px;margin-bottom:8px">' +
            '<span style="font-size:14px;color:var(--ink-f)">🔍</span>' +
            '<span style="font-size:11px;color:var(--ink-f)">Search by name or ingredient...</span>' +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
            filterTag('All', true) + filterTag('Healthy') + filterTag('Quick') + filterTag('Vegan') + filterTag('High Protein') +
          '</div>' +
        '</div>';
      }
    },
    {
      title: 'Recipe Details, Ratings & Comments',
      body: 'Click any recipe card to open its detail panel — see full ingredients, step-by-step instructions, and nutritional info. You can rate recipes with stars, leave comments, and follow along while cooking.',
      illustration: function () {
        return '<div style="display:flex;gap:12px;justify-content:center;padding:8px 0">' +
          '<div style="background:var(--white);border:1px solid var(--border);border-radius:12px;width:100px;overflow:hidden;text-align:center">' +
            '<div style="height:60px;background:var(--teal-lll);display:flex;align-items:center;justify-content:center;font-size:28px">🥗</div>' +
            '<div style="padding:8px 6px">' +
              '<div style="font-size:10px;font-weight:700;color:var(--ink)">Quinoa Bowl</div>' +
              '<div style="font-size:8px;color:var(--ink-f)">420 kcal</div>' +
              '<div style="font-size:10px;color:var(--amber);margin-top:2px">★★★★☆</div>' +
            '</div>' +
          '</div>' +
          '<div style="background:var(--white);border:1px solid var(--border);border-radius:12px;width:100px;overflow:hidden;text-align:center">' +
            '<div style="height:60px;background:var(--amber-ll);display:flex;align-items:center;justify-content:center;font-size:28px">🍳</div>' +
            '<div style="padding:8px 6px">' +
              '<div style="font-size:10px;font-weight:700;color:var(--ink)">Shakshuka</div>' +
              '<div style="font-size:8px;color:var(--ink-f)">380 kcal</div>' +
              '<div style="font-size:10px;color:var(--amber);margin-top:2px">★★★★★</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      }
    },
    {
      title: 'Save Your Favourites',
      body: 'Tap the heart icon on any recipe to save it to your Favourites page. Your favourites are also used by the Meal Planner and Recipe Compare features, so the more you save, the smarter they get.',
      illustration: function () {
        return '<div style="display:flex;align-items:center;justify-content:center;gap:16px;padding:16px 0">' +
          '<div style="font-size:36px">🤍</div>' +
          '<div style="font-size:24px;color:var(--ink-f)">→</div>' +
          '<div style="font-size:36px">❤️</div>' +
        '</div>';
      }
    },
    {
      title: 'Compare Recipes Side by Side',
      body: 'Select up to 4 recipes from your favourites and compare their nutritional data with a grouped bar chart. See calories, protein, carbs, and fat at a glance to make informed choices.',
      illustration: function () {
        return '<div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:12px 16px;margin:8px 0">' +
          '<div style="font-size:9px;font-weight:700;color:var(--ink);margin-bottom:10px">Nutritional Comparison</div>' +
          '<div style="display:flex;align-items:flex-end;gap:3px;height:60px;justify-content:center">' +
            // Group 1 - Calories
            '<div style="display:flex;gap:1px;align-items:flex-end;margin-right:10px">' +
              compBar(55, '#2f8f7f') + compBar(45, '#d4956a') + compBar(50, '#7aaad4') +
            '</div>' +
            // Group 2 - Protein
            '<div style="display:flex;gap:1px;align-items:flex-end;margin-right:10px">' +
              compBar(25, '#2f8f7f') + compBar(30, '#d4956a') + compBar(20, '#7aaad4') +
            '</div>' +
            // Group 3 - Carbs
            '<div style="display:flex;gap:1px;align-items:flex-end;margin-right:10px">' +
              compBar(35, '#2f8f7f') + compBar(28, '#d4956a') + compBar(40, '#7aaad4') +
            '</div>' +
            // Group 4 - Fat
            '<div style="display:flex;gap:1px;align-items:flex-end">' +
              compBar(15, '#2f8f7f') + compBar(20, '#d4956a') + compBar(12, '#7aaad4') +
            '</div>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-around;margin-top:6px;font-family:\'JetBrains Mono\',monospace;font-size:7px;color:var(--ink-f)">' +
            '<span>Calories</span><span>Protein</span><span>Carbs</span><span>Fat</span>' +
          '</div>' +
        '</div>';
      }
    },
    {
      title: 'Smart Meal Planner',
      body: 'Plan your full day within your calorie budget. Pick favourites first, then use Smart Fill to auto-complete with balanced suggestions. Lock meals you like, swap or refresh the rest. Your personalised target is calculated from your profile.',
      illustration: function () {
        return '<div style="padding:8px 0">' +
          '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:8px">' +
            mealSlot('🌅', 'Breakfast', '420 kcal', true) +
            mealSlot('☀️', 'Lunch', '550 kcal', false) +
            mealSlot('🌙', 'Dinner', '—', false) +
          '</div>' +
          '<div style="background:var(--fog);border-radius:6px;height:6px;overflow:hidden;margin:0 20px">' +
            '<div style="width:62%;height:100%;background:linear-gradient(90deg,var(--teal),var(--teal-l));border-radius:6px"></div>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;margin:3px 20px 0;font-family:\'JetBrains Mono\',monospace;font-size:7px;color:var(--ink-f)"><span>0</span><span>2,100 kcal</span></div>' +
        '</div>';
      }
    },
    {
      title: 'Messages & Professional Support',
      body: 'If you\'re connected to a health professional, use the message panel (envelope icon) to chat directly. They can view your progress and send personalised nutritional advice.',
      illustration: function () {
        return '<div style="padding:10px 0;display:flex;flex-direction:column;gap:6px;max-width:260px;margin:0 auto">' +
          msgBubble('pro', 'Great progress this week! Try adding more protein.') +
          msgBubble('user', 'Thanks! Any recipe suggestions?') +
          msgBubble('pro', 'Try the Grilled Salmon — 480 kcal, 38g protein 💪') +
        '</div>';
      }
    },
    {
      title: 'Settings & Health Profile',
      body: 'Click your avatar (top right) to access Personal Details and Preferences. Your Health Profile stores your height, weight, activity level, and goal — these drive all your calorie and macro calculations. Update anytime.',
      illustration: function () {
        return '<div style="display:flex;align-items:center;gap:12px;justify-content:center;padding:12px 0">' +
          '<div style="width:44px;height:44px;border-radius:50%;background:var(--teal);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700">RC</div>' +
          '<div>' +
            '<div style="font-size:12px;font-weight:700;color:var(--ink)">Rose Campbell</div>' +
            '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--ink-f)">165 cm · 62 kg · Moderately Active</div>' +
            '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--teal)">Goal: Maintain · 2,100 kcal/day</div>' +
          '</div>' +
        '</div>';
      }
    },
    {
      title: 'Dark Mode, Export & Shortcuts',
      body: 'Toggle dark mode with the moon icon. Export your weekly diary as CSV. Press "?" to see keyboard shortcuts for quick navigation. The Help page has searchable answers about every feature.',
      illustration: function () {
        return '<div style="display:flex;gap:10px;justify-content:center;padding:12px 0">' +
          iconChip('🌙', 'Dark mode') +
          iconChip('📥', 'Export CSV') +
          iconChip('⌨️', 'Shortcuts') +
          iconChip('❓', 'Help') +
        '</div>';
      }
    },
    {
      title: 'You\'re All Set!',
      body: 'Start by logging your first meal, browsing recipes, or setting up your Health Profile. You can reopen this tour anytime from the Tour button in the top bar. Enjoy NourishWell!',
      illustration: function () {
        return '<div style="text-align:center;padding:16px 0">' +
          '<div style="font-size:48px;margin-bottom:8px">🎉</div>' +
          '<div style="font-family:\'Instrument Serif\',serif;font-size:22px;font-style:italic;color:var(--teal)">Happy tracking!</div>' +
        '</div>';
      }
    }
  ];

  // ── Illustration Helpers ─────────────────────────────────────
  function miniCard(emoji, title, sub) {
    return '<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:10px;min-width:130px">' +
      '<div style="width:36px;height:36px;border-radius:10px;background:var(--teal-lll);display:flex;align-items:center;justify-content:center;font-size:18px">' + emoji + '</div>' +
      '<div><div style="font-size:11px;font-weight:700;color:var(--ink)">' + title + '</div>' +
      '<div style="font-size:9px;color:var(--ink-f)">' + sub + '</div></div></div>';
  }

  function miniBar(h) {
    var c = h === 0 ? 'var(--fog)' : h > 70 ? 'var(--teal)' : 'var(--teal-l)';
    return '<div style="width:10px;height:' + Math.max(h, 4) + '%;background:' + c + ';border-radius:2px 2px 0 0"></div>';
  }

  function compBar(h, color) {
    return '<div style="width:12px;height:' + h + 'px;background:' + color + ';border-radius:2px 2px 0 0"></div>';
  }

  function filterTag(label, active) {
    var bg = active ? 'var(--teal)' : 'var(--white)';
    var color = active ? '#fff' : 'var(--ink-m)';
    var border = active ? 'var(--teal)' : 'var(--border)';
    return '<span style="padding:4px 10px;border-radius:6px;font-size:9px;font-weight:600;background:' + bg + ';color:' + color + ';border:1px solid ' + border + '">' + label + '</span>';
  }

  function mealSlot(emoji, label, kcal, locked) {
    var border = locked ? '1.5px solid var(--teal)' : '1.5px dashed var(--border)';
    var badge = locked ? '<span style="font-size:8px;color:var(--teal)">🔒</span>' : '';
    return '<div style="border:' + border + ';border-radius:10px;padding:8px 10px;text-align:center;min-width:70px">' +
      '<div style="font-size:16px">' + emoji + '</div>' +
      '<div style="font-size:9px;font-weight:700;color:var(--ink);margin-top:2px">' + label + '</div>' +
      '<div style="font-size:8px;color:var(--ink-f)">' + kcal + '</div>' +
      badge + '</div>';
  }

  function msgBubble(from, text) {
    var isPro = from === 'pro';
    return '<div style="display:flex;justify-content:' + (isPro ? 'flex-start' : 'flex-end') + '">' +
      '<div style="max-width:85%;background:' + (isPro ? 'var(--paper)' : 'var(--ink)') + ';color:' + (isPro ? 'var(--ink)' : '#fff') +
        ';border-radius:' + (isPro ? '4px 12px 12px 12px' : '12px 4px 12px 12px') + ';padding:6px 10px;font-size:10px;line-height:1.4">' +
      (isPro ? '<div style="font-size:7px;color:var(--teal);font-weight:700;margin-bottom:2px">Dr. Rivera</div>' : '') +
      text + '</div></div>';
  }

  function iconChip(emoji, label) {
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">' +
      '<div style="width:36px;height:36px;border-radius:10px;background:var(--paper);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:16px">' + emoji + '</div>' +
      '<span style="font-size:8px;color:var(--ink-f)">' + label + '</span></div>';
  }

  // ── Inject Styles ────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('nw-tour-styles')) return;
    var s = document.createElement('style');
    s.id = 'nw-tour-styles';
    s.textContent = '\
#nw-tour-overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:99998;background:rgba(10,20,16,0.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s}\
#nw-tour-overlay.visible{opacity:1}\
#nw-tour-card{background:var(--white,#fff);border-radius:24px;width:480px;max-width:92vw;max-height:88vh;overflow:hidden;box-shadow:0 32px 80px rgba(10,20,16,0.3);display:flex;flex-direction:column;transform:scale(0.95);transition:transform .3s}\
#nw-tour-overlay.visible #nw-tour-card{transform:scale(1)}\
#nw-tour-illust{background:var(--paper,#f5f7f5);border-bottom:1px solid var(--fog,#dce6e0);padding:16px 24px;min-height:100px;display:flex;align-items:center;justify-content:center}\
#nw-tour-body{padding:24px 28px 20px;flex:1;overflow-y:auto}\
#nw-tour-title{font-family:"Instrument Serif",serif;font-size:22px;font-style:italic;color:var(--ink,#0a1410);margin-bottom:8px}\
#nw-tour-text{font-size:13px;color:var(--ink-m,#3d5448);line-height:1.65;margin-bottom:16px}\
#nw-tour-footer{display:flex;align-items:center;justify-content:space-between;padding:0 28px 20px}\
.nw-tour-pips{display:flex;gap:4px;align-items:center}\
.nw-tour-pip{width:16px;height:3px;border-radius:2px;background:var(--fog,#dce6e0);transition:all .3s}\
.nw-tour-pip.done{background:var(--teal-l,#2f8f7f)}\
.nw-tour-pip.active{background:var(--teal,#1e6b5e);width:24px}\
.nw-tour-actions{display:flex;gap:8px;align-items:center}\
.nw-tour-skip{font-family:"JetBrains Mono",monospace;font-size:10px;color:var(--ink-f,#6b8878);background:none;border:none;cursor:pointer;padding:6px 10px;border-radius:6px;transition:all .2s}\
.nw-tour-skip:hover{color:var(--ink);background:var(--paper)}\
.nw-tour-next{font-size:12px;font-weight:600;padding:9px 20px;border-radius:8px;border:none;background:var(--teal,#1e6b5e);color:#fff;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:5px}\
.nw-tour-next:hover{background:var(--teal-l,#2f8f7f)}\
.nw-tour-counter{font-family:"JetBrains Mono",monospace;font-size:9px;color:var(--ink-f,#6b8878);letter-spacing:.06em}\
';
    document.head.appendChild(s);
  }

  // ── Build & Show Tour ────────────────────────────────────────
  var currentSlide = 0;
  var overlay = null;

  function buildTour() {
    if (document.getElementById('nw-tour-overlay')) return;
    injectStyles();

    overlay = document.createElement('div');
    overlay.id = 'nw-tour-overlay';
    overlay.innerHTML =
      '<div id="nw-tour-card">' +
        '<div id="nw-tour-illust"></div>' +
        '<div id="nw-tour-body">' +
          '<div id="nw-tour-title"></div>' +
          '<div id="nw-tour-text"></div>' +
        '</div>' +
        '<div id="nw-tour-footer">' +
          '<div class="nw-tour-pips" id="nw-tour-pips"></div>' +
          '<div class="nw-tour-actions">' +
            '<div class="nw-tour-counter" id="nw-tour-counter"></div>' +
            '<button class="nw-tour-skip" id="nw-tour-skip">Skip</button>' +
            '<button class="nw-tour-next" id="nw-tour-next">Next →</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    document.getElementById('nw-tour-skip').addEventListener('click', closeTour);
    document.getElementById('nw-tour-next').addEventListener('click', nextSlide);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeTour();
    });

    currentSlide = 0;
    renderSlide();

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { overlay.classList.add('visible'); });
    });
  }

  function renderSlide() {
    var s = slides[currentSlide];
    document.getElementById('nw-tour-illust').innerHTML = s.illustration();
    document.getElementById('nw-tour-title').textContent = s.title;
    document.getElementById('nw-tour-text').textContent = s.body;
    document.getElementById('nw-tour-counter').textContent = (currentSlide + 1) + ' / ' + slides.length;

    var isLast = currentSlide === slides.length - 1;
    document.getElementById('nw-tour-next').innerHTML = isLast ? 'Get started ✓' : 'Next →';
    document.getElementById('nw-tour-skip').style.display = isLast ? 'none' : 'block';

    // Pips
    document.getElementById('nw-tour-pips').innerHTML = slides.map(function (_, i) {
      var cls = 'nw-tour-pip';
      if (i < currentSlide) cls += ' done';
      if (i === currentSlide) cls += ' active';
      return '<div class="' + cls + '"></div>';
    }).join('');
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      renderSlide();
    } else {
      closeTour();
    }
  }

  function closeTour() {
    localStorage.setItem(tourKey(), '1');
    if (overlay) {
      overlay.classList.remove('visible');
      setTimeout(function () { if (overlay) overlay.remove(); overlay = null; }, 300);
    }
  }

  // ── First-time prompt ────────────────────────────────────────
  function showFirstTimePrompt() {
    injectStyles();
    var prompt = document.createElement('div');
    prompt.id = 'nw-tour-overlay';
    prompt.innerHTML =
      '<div id="nw-tour-card" style="width:400px">' +
        '<div id="nw-tour-illust">' +
          '<div style="text-align:center;padding:20px 0">' +
            '<div style="font-size:40px;margin-bottom:8px">🗺️</div>' +
            '<div style="font-family:\'Instrument Serif\',serif;font-size:22px;font-style:italic;color:var(--ink)">Quick Tour?</div>' +
          '</div>' +
        '</div>' +
        '<div id="nw-tour-body">' +
          '<div style="font-size:13px;color:var(--ink-m);line-height:1.65;text-align:center;margin-bottom:16px">' +
            'Would you like a quick walkthrough of NourishWell\'s features? It takes about 2 minutes.' +
          '</div>' +
          '<div style="display:flex;gap:10px">' +
            '<button id="nw-tour-yes" style="flex:1;padding:12px;border:none;border-radius:10px;background:var(--ink);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:\'Bricolage Grotesque\',sans-serif;transition:background .2s" onmouseover="this.style.background=\'var(--teal)\'" onmouseout="this.style.background=\'var(--ink)\'">Yes, show me around →</button>' +
            '<button id="nw-tour-no" style="flex:0 0 auto;padding:12px 20px;border:1px solid var(--border);border-radius:10px;background:var(--white);color:var(--ink-f);font-size:12px;cursor:pointer;font-family:\'Bricolage Grotesque\',sans-serif;transition:all .2s" onmouseover="this.style.borderColor=\'var(--ink)\'" onmouseout="this.style.borderColor=\'var(--border)\'">Skip</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(prompt);

    document.getElementById('nw-tour-yes').addEventListener('click', function () {
      prompt.remove();
      buildTour();
    });
    document.getElementById('nw-tour-no').addEventListener('click', function () {
      localStorage.setItem(tourKey(), '1');
      prompt.classList.remove('visible');
      setTimeout(function () { prompt.remove(); }, 300);
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { prompt.classList.add('visible'); });
    });
  }

  // ── Hook startTour button ────────────────────────────────────
  window.startTour = function () {
    buildTour();
  };

  // ── Init ─────────────────────────────────────────────────────
  function init() {
    var seen = localStorage.getItem(tourKey());
    if (!seen) {
      // Wait for welcome modal to finish first (if it exists)
      var waitForWelcome = setInterval(function () {
        var welcomeModal = document.getElementById('nw-welcome-overlay');
        if (!welcomeModal) {
          clearInterval(waitForWelcome);
          // Small delay after welcome modal closes
          setTimeout(function () {
            if (!localStorage.getItem(tourKey())) {
              showFirstTimePrompt();
            }
          }, 800);
        }
      }, 500);
      // Safety timeout — don't wait forever
      setTimeout(function () { clearInterval(waitForWelcome); }, 30000);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 500);

})();
