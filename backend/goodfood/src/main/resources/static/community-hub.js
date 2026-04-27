/**
 * NourishWell — Community Hub v1
 * ══════════════════════════════════════════════════════════════
 * Self-contained module: injects sidebar nav entry + page + all logic.
 * Load after dashboard.html's main <script>:
 *   <script src="community-hub.js"></script>
 *
 * Three tabs:
 *   1. Feed — post, like, comment; pro replies get a badge
 *   2. Ask a Pro — filtered feed showing only pro-replied threads
 *   3. Find a Pro — swipe-card expert browser, bind one expert
 *
 * All data is mock (demo mode). API hooks stubbed for later.
 * localStorage keys: nw-{userId}-community-*
 * ══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  // ── Utility ────────────────────────────────────────────────────
  /** Generate localStorage key scoped to current user ID */
  function _key(k) {
    var u = (typeof NW !== 'undefined' && NW.auth) ? NW.auth.userId : '';
    return u ? 'nw-' + u + '-community-' + k : 'nw-community-' + k;
  }
  /** Escape HTML entities in user text to prevent XSS */
  function _escHtml(s) {
    if (typeof escapeHtml === 'function') return escapeHtml(s);
    var d = document.createElement('div'); d.textContent = s; return d.innerHTML;
  }
  function _ago(ms) {
    var s = Math.floor((Date.now() - ms) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  }
  function _userName() {
    return (typeof NW !== 'undefined' && NW.auth) ? NW.auth.name || 'You' : 'You';
  }
  function _userInitials() {
    return _userName().split(' ').map(function (w) { return w[0] || ''; }).join('').toUpperCase().substring(0, 2) || '?';
  }

  // ── Mock Data ──────────────────────────────────────────────────
  var EXPERTS = [
    { id: 'dr-rivera', name: 'Dr. Ana Rivera', title: 'Registered Dietitian', speciality: 'Weight Management & Sports Nutrition', bio: 'PhD in Clinical Nutrition from UCL. 12 years helping athletes and everyday people reach their health goals through evidence-based dietary planning.', rating: 4.9, reviews: 127, clients: 34, fee: '£45/session', avatar: '🩺', color: '#1e6b5e' },
    { id: 'dr-chen', name: 'Dr. James Chen', title: 'Nutritional Therapist', speciality: 'Gut Health & Autoimmune Nutrition', bio: 'Specialising in gut microbiome optimisation and anti-inflammatory diets. Published researcher with 8 years of clinical practice.', rating: 4.8, reviews: 93, clients: 28, fee: '£55/session', avatar: '🧬', color: '#b8621f' },
    { id: 'sarah-k', name: 'Sarah Kowalski', title: 'Certified Nutritionist', speciality: 'Plant-Based & Vegan Nutrition', bio: 'Helping people thrive on plant-based diets without nutritional gaps. Certified by the Association for Nutrition (AfN).', rating: 4.7, reviews: 68, clients: 22, fee: '£35/session', avatar: '🌱', color: '#2f8f7f' },
    { id: 'dr-patel', name: 'Dr. Priya Patel', title: 'Clinical Dietitian', speciality: 'Diabetes & Metabolic Health', bio: 'NHS-trained with a focus on Type 2 diabetes reversal through dietary intervention. 15 years of clinical experience.', rating: 4.9, reviews: 156, clients: 41, fee: '£50/session', avatar: '💊', color: '#7aaad4' },
    { id: 'marcus-j', name: 'Marcus Johnson', title: 'Sports Nutritionist', speciality: 'Performance & Body Composition', bio: 'Working with professional athletes and fitness enthusiasts. SENR-registered, specialising in periodised nutrition strategies.', rating: 4.6, reviews: 51, clients: 18, fee: '£40/session', avatar: '💪', color: '#e07b78' }
  ];

  var NOW = Date.now();
  var POSTS = [
    { id: 'p1', author: 'Rose C.', initials: 'RC', isPro: false, time: NOW - 1800000, text: 'Just hit my protein target for the first time this week! 🎉 Any tips for keeping it consistent?', likes: 12, liked: false,
      comments: [
        { author: 'Dr. Ana Rivera', initials: 'AR', isPro: true, text: 'Amazing progress Rose! Try prepping protein-rich snacks — boiled eggs, Greek yoghurt, or edamame. Consistency comes from removing friction.', time: NOW - 1200000 },
        { author: 'Tom W.', initials: 'TW', isPro: false, text: 'Same here! I started batch-cooking chicken on Sundays — game changer.', time: NOW - 600000 }
      ]
    },
    { id: 'p2', author: 'Alex M.', initials: 'AM', isPro: false, time: NOW - 7200000, text: 'Struggling with sugar cravings in the evening. I usually end up having chocolate or biscuits after dinner. What healthier alternatives actually satisfy the craving?', likes: 8, liked: false,
      comments: [
        { author: 'Sarah Kowalski', initials: 'SK', isPro: true, text: 'Evening cravings often signal you need more fibre and protein at dinner. Try dark chocolate (70%+) with nuts, or frozen banana "ice cream". The key is not willpower — it\'s making sure your meals are satiating enough.', time: NOW - 5400000 },
        { author: 'Jess L.', initials: 'JL', isPro: false, text: 'Frozen grapes are my go-to! They feel like sweets.', time: NOW - 3600000 }
      ]
    },
    { id: 'p3', author: 'Dr. James Chen', initials: 'JC', isPro: true, time: NOW - 18000000, text: '📚 Quick tip: Fermented foods like kimchi, kefir, and sauerkraut can significantly improve gut diversity. Even a small daily serving makes a difference. Who\'s tried adding fermented foods to their routine?', likes: 24, liked: false,
      comments: [
        { author: 'Nina R.', initials: 'NR', isPro: false, text: 'Started making my own kombucha last month! It\'s surprisingly easy.', time: NOW - 14400000 },
        { author: 'Paul D.', initials: 'PD', isPro: false, text: 'Kefir smoothies every morning — my digestion has never been better.', time: NOW - 10800000 }
      ]
    },
    { id: 'p4', author: 'Meera K.', initials: 'MK', isPro: false, time: NOW - 43200000, text: 'How accurate are calorie counts on food labels? I\'ve been meticulously tracking but the numbers seem off sometimes.', likes: 15, liked: false,
      comments: [
        { author: 'Dr. Priya Patel', initials: 'PP', isPro: true, text: 'Great question. Food labels can be off by up to 20% legally. Focus on consistent tracking rather than perfect accuracy — the trends over time matter more than individual numbers. If you\'re seeing consistent plateaus despite a deficit, we should look at your overall metabolic picture.', time: NOW - 36000000 }
      ]
    },
    { id: 'p5', author: 'Sam T.', initials: 'ST', isPro: false, time: NOW - 86400000, text: 'Made the Mediterranean Quinoa Bowl from the NourishWell recipes yesterday — absolutely delicious and so filling for only 420 kcal! Highly recommend 🥗', likes: 19, liked: false,
      comments: [
        { author: 'Rose C.', initials: 'RC', isPro: false, text: 'That\'s one of my favourites too! Try adding some grilled halloumi on top 👌', time: NOW - 72000000 }
      ]
    },
    { id: 'p6', author: 'Li W.', initials: 'LW', isPro: false, time: NOW - 172800000, text: 'Is it true that eating after 8pm leads to weight gain? I work late shifts and can\'t really eat dinner before then.', likes: 11, liked: false,
      comments: [
        { author: 'Dr. Ana Rivera', initials: 'AR', isPro: true, text: 'This is largely a myth. Total calorie intake matters more than timing. However, eating very late can affect sleep quality, which indirectly impacts weight. For shift workers, I recommend having your main meal before your shift starts and a lighter meal afterwards. Happy to discuss your schedule in a session if you\'d like personalised advice!', time: NOW - 162000000 },
        { author: 'Marcus Johnson', initials: 'MJ', isPro: true, text: 'Agreed with Dr. Rivera. Meal timing is secondary to total intake and food quality. Many athletes eat late with no issues at all.', time: NOW - 158000000 }
      ]
    }
  ];

  // ── State ──────────────────────────────────────────────────────
  var activeTab = 'feed';
  var boundExpert = null; // id string or null
  var currentCard = 0;
  var swipeDirection = null; // for animation

  function loadState() {
    try {
      var b = localStorage.getItem(_key('bound-expert'));
      if (b) boundExpert = b;
      var l = localStorage.getItem(_key('liked'));
      if (l) {
        var liked = JSON.parse(l);
        POSTS.forEach(function (p) { if (liked.indexOf(p.id) !== -1) { p.liked = true; } });
      }
    } catch (e) { }
  }
  function saveBound() { try { localStorage.setItem(_key('bound-expert'), boundExpert || ''); } catch (e) { } }
  function saveLikes() {
    try {
      var liked = POSTS.filter(function (p) { return p.liked; }).map(function (p) { return p.id; });
      localStorage.setItem(_key('liked'), JSON.stringify(liked));
    } catch (e) { }
  }

  // ── CSS ────────────────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('nw-ch-css')) return;
    var s = document.createElement('style'); s.id = 'nw-ch-css';
    s.textContent = [
      /* Tabs */
      '.ch-tabs{display:flex;gap:4px;margin-bottom:20px;background:var(--white);border:1px solid var(--border);border-radius:12px;padding:4px}',
      '.ch-tab{flex:1;text-align:center;padding:10px 16px;font-family:"JetBrains Mono",monospace;font-size:11px;font-weight:600;color:var(--ink-f);border-radius:8px;cursor:pointer;transition:all .2s;border:none;background:transparent;letter-spacing:.02em}',
      '.ch-tab:hover{color:var(--ink);background:var(--paper)}',
      '.ch-tab.active{background:var(--ink);color:#fff}',
      '.ch-tab .ch-tab-count{font-size:9px;opacity:.6;margin-left:4px}',

      /* New post */
      '.ch-compose{background:var(--white);border:1px solid var(--border);border-radius:16px;padding:18px;margin-bottom:20px;box-shadow:0 2px 8px rgba(10,20,16,0.03)}',
      '.ch-compose-row{display:flex;gap:12px;align-items:flex-start}',
      '.ch-compose-avatar{width:38px;height:38px;border-radius:50%;background:var(--teal);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0}',
      '.ch-compose-input{flex:1;border:1px solid var(--border);border-radius:10px;padding:10px 14px;font-family:"Bricolage Grotesque",sans-serif;font-size:13px;color:var(--ink);outline:none;resize:none;min-height:42px;max-height:120px;transition:border-color .2s;background:var(--paper)}',
      '.ch-compose-input:focus{border-color:var(--teal);background:var(--white)}',
      '.ch-compose-input::placeholder{color:var(--ink-f)}',
      '.ch-compose-actions{display:flex;justify-content:flex-end;margin-top:10px}',
      '.ch-post-btn{padding:8px 20px;background:var(--ink);color:#fff;border:none;border-radius:8px;font-family:"Bricolage Grotesque",sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}',
      '.ch-post-btn:hover{background:var(--teal)}',
      '.ch-post-btn:disabled{opacity:.35;cursor:not-allowed}',

      /* Post card */
      '.ch-post{background:var(--white);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:14px;box-shadow:0 2px 8px rgba(10,20,16,0.03);transition:box-shadow .2s}',
      '.ch-post:hover{box-shadow:0 6px 20px rgba(10,20,16,0.06)}',
      '.ch-post-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}',
      '.ch-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;color:#fff}',
      '.ch-post-author{font-size:13px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:6px}',
      '.ch-pro-badge{font-family:"JetBrains Mono",monospace;font-size:8px;padding:2px 7px;border-radius:10px;background:var(--teal);color:#fff;letter-spacing:.06em;text-transform:uppercase;font-weight:600}',
      '.ch-post-time{font-family:"JetBrains Mono",monospace;font-size:9px;color:var(--ink-f)}',
      '.ch-post-body{font-size:14px;color:var(--ink);line-height:1.65;margin-bottom:14px;white-space:pre-wrap}',
      '.ch-post-actions{display:flex;align-items:center;gap:18px;padding-top:12px;border-top:1px solid var(--fog)}',
      '.ch-action{display:flex;align-items:center;gap:5px;font-family:"JetBrains Mono",monospace;font-size:10px;color:var(--ink-f);cursor:pointer;transition:color .15s;background:none;border:none;padding:4px 8px;border-radius:6px}',
      '.ch-action:hover{color:var(--teal);background:var(--teal-lll)}',
      '.ch-action.liked{color:var(--pink)}',
      '.ch-action .ch-action-icon{font-size:14px}',

      /* Comments */
      '.ch-comments{margin-top:12px;padding-top:10px;border-top:1px solid var(--fog)}',
      '.ch-comment{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--fog)}',
      '.ch-comment:last-child{border-bottom:none}',
      '.ch-comment-avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;color:#fff}',
      '.ch-comment-body{flex:1}',
      '.ch-comment-author{font-size:11px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:5px}',
      '.ch-comment-text{font-size:12px;color:var(--ink-m);line-height:1.55;margin-top:3px}',
      '.ch-comment-time{font-family:"JetBrains Mono",monospace;font-size:8px;color:var(--ink-f);margin-top:3px}',
      '.ch-comment-input-row{display:flex;gap:8px;margin-top:10px}',
      '.ch-comment-input{flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-family:"Bricolage Grotesque",sans-serif;font-size:12px;color:var(--ink);outline:none;background:var(--paper)}',
      '.ch-comment-input:focus{border-color:var(--teal);background:var(--white)}',
      '.ch-comment-send{padding:8px 14px;background:var(--ink);color:#fff;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;transition:background .2s}',
      '.ch-comment-send:hover{background:var(--teal)}',

      /* Expert cards (swipe) */
      '.ch-swipe-area{position:relative;width:380px;max-width:100%;height:480px;margin:0 auto 24px}',
      '.ch-expert-card{position:absolute;inset:0;background:var(--white);border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(10,20,16,0.08);transition:transform .4s cubic-bezier(.16,1,.3,1),opacity .4s;display:flex;flex-direction:column}',
      '.ch-expert-card.gone-left{transform:translateX(-120%) rotate(-15deg);opacity:0;pointer-events:none}',
      '.ch-expert-card.gone-right{transform:translateX(120%) rotate(15deg);opacity:0;pointer-events:none}',
      '.ch-expert-top{padding:32px 28px 20px;text-align:center;position:relative}',
      '.ch-expert-avatar{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 14px;border:3px solid var(--fog)}',
      '.ch-expert-name{font-family:"Instrument Serif",serif;font-size:22px;font-style:italic;color:var(--ink);margin-bottom:2px}',
      '.ch-expert-title{font-family:"JetBrains Mono",monospace;font-size:9px;color:var(--teal);letter-spacing:.06em;text-transform:uppercase}',
      '.ch-expert-spec{font-size:12px;color:var(--ink-f);margin-top:8px;font-weight:600}',
      '.ch-expert-bio{font-size:13px;color:var(--ink-m);line-height:1.6;padding:0 28px 16px;flex:1;overflow-y:auto}',
      '.ch-expert-stats{display:grid;grid-template-columns:1fr 1fr 1fr;border-top:1px solid var(--fog);padding:14px 28px}',
      '.ch-expert-stat{text-align:center}',
      '.ch-expert-stat-val{font-size:16px;font-weight:800;color:var(--ink)}',
      '.ch-expert-stat-lbl{font-family:"JetBrains Mono",monospace;font-size:8px;color:var(--ink-f);letter-spacing:.06em;text-transform:uppercase;margin-top:2px}',
      '.ch-expert-fee{padding:14px 28px;border-top:1px solid var(--fog);display:flex;align-items:center;justify-content:space-between}',
      '.ch-expert-fee-val{font-size:14px;font-weight:700;color:var(--ink)}',
      '.ch-expert-fee-lbl{font-family:"JetBrains Mono",monospace;font-size:9px;color:var(--ink-f)}',

      /* Swipe buttons */
      '.ch-swipe-btns{display:flex;justify-content:center;gap:20px;margin-bottom:24px}',
      '.ch-swipe-btn{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;border:2px solid var(--border);background:var(--white);transition:all .2s;box-shadow:0 4px 12px rgba(10,20,16,0.06)}',
      '.ch-swipe-btn:hover{transform:scale(1.1)}',
      '.ch-swipe-btn.skip{color:var(--ink-f)}.ch-swipe-btn.skip:hover{border-color:var(--pink);color:var(--pink);background:rgba(224,123,120,0.08)}',
      '.ch-swipe-btn.bind{color:var(--teal)}.ch-swipe-btn.bind:hover{border-color:var(--teal);background:var(--teal-lll)}',
      '.ch-card-counter{text-align:center;font-family:"JetBrains Mono",monospace;font-size:10px;color:var(--ink-f);margin-bottom:16px}',

      /* Bound state */
      '.ch-bound-card{background:var(--white);border:1px solid var(--border);border-radius:20px;padding:28px;text-align:center;box-shadow:0 4px 16px rgba(10,20,16,0.04);max-width:420px;margin:0 auto}',
      '.ch-bound-badge{display:inline-block;font-family:"JetBrains Mono",monospace;font-size:9px;padding:4px 12px;border-radius:10px;background:var(--teal-lll);color:var(--teal);letter-spacing:.06em;text-transform:uppercase;font-weight:600;margin-bottom:16px}',
      '.ch-unbind-btn{margin-top:16px;padding:8px 20px;background:transparent;color:var(--ink-f);border:1px solid var(--border);border-radius:8px;font-family:"JetBrains Mono",monospace;font-size:10px;cursor:pointer;transition:all .2s}',
      '.ch-unbind-btn:hover{border-color:var(--pink);color:var(--pink)}',

      /* Empty state */
      '.ch-empty{text-align:center;padding:48px 20px;color:var(--ink-f)}',
      '.ch-empty-icon{font-size:40px;margin-bottom:12px}',
      '.ch-empty-text{font-size:14px;line-height:1.6}',

      /* Dark mode */
      'body.dark-mode .ch-post,body.dark-mode .ch-compose,body.dark-mode .ch-expert-card,body.dark-mode .ch-bound-card{background:#142420;border-color:#2a3e34}',
      'body.dark-mode .ch-tabs{background:#142420;border-color:#2a3e34}',
      'body.dark-mode .ch-compose-input{background:#0d1a14;border-color:#2a3e34}',
      'body.dark-mode .ch-compose-input:focus{background:#142420}',
      'body.dark-mode .ch-comment-input{background:#0d1a14;border-color:#2a3e34}',
      'body.dark-mode .ch-comment{border-color:#1e3028}',
      'body.dark-mode .ch-post-actions{border-color:#1e3028}',
      'body.dark-mode .ch-comments{border-color:#1e3028}',
      'body.dark-mode .ch-expert-stats,body.dark-mode .ch-expert-fee{border-color:#1e3028}',
      'body.dark-mode .ch-swipe-btn{background:#142420;border-color:#2a3e34}',

      /* Responsive */
      '@media(max-width:768px){.ch-swipe-area{width:100%;height:440px}.ch-tabs{flex-wrap:wrap}.ch-tab{font-size:10px;padding:8px 10px}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ── Inject Nav + Page ──────────────────────────────────────────
  /** Inject community hub navigation into dashboard sidebar */
  function injectNav() {
    var nav = document.querySelector('.side-nav');
    if (!nav || document.getElementById('sn-community')) return;
    var a = document.createElement('a');
    a.id = 'sn-community';
    a.className = 'sn-item';
    a.href = '#';
    a.setAttribute('onclick', "switchPage('community',this)");
    a.innerHTML = '<span class="sn-icon">💬</span> <span class="sn-text">Community</span>';
    nav.appendChild(a);
  }

  function injectPage() {
    if (document.getElementById('page-community')) return;
    var main = document.getElementById('main-content');
    if (!main) return;
    var page = document.createElement('div');
    page.className = 'page';
    page.id = 'page-community';
    page.setAttribute('role', 'tabpanel');
    page.setAttribute('aria-label', 'Community Hub');
    page.innerHTML = '<div class="page-header"><div class="page-title">Community <em>Hub</em></div><div class="page-date">Share tips, ask experts, and find your nutritionist</div></div>'
      + '<div class="ch-tabs" role="tablist">'
      + '<button class="ch-tab active" onclick="window._chSwitchTab(\'feed\',this)" role="tab" aria-selected="true">💬 Feed</button>'
      + '<button class="ch-tab" onclick="window._chSwitchTab(\'askpro\',this)" role="tab" aria-selected="false">🩺 Ask a Pro</button>'
      + '<button class="ch-tab" onclick="window._chSwitchTab(\'findpro\',this)" role="tab" aria-selected="false">🔍 Find a Pro</button>'
      + '</div>'
      + '<div id="ch-content"></div>';
    main.appendChild(page);
  }

  // ── Tab Switch ─────────────────────────────────────────────────
  window._chSwitchTab = function (tab, btn) {
    activeTab = tab;
    document.querySelectorAll('.ch-tab').forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    if (btn) { btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); }
    renderTab();
  };

  // ── Render: Feed ───────────────────────────────────────────────
  /** Render all community posts in the feed */
  function renderFeed(filterProOnly) {
    var posts = filterProOnly
      ? POSTS.filter(function (p) { return p.comments.some(function (c) { return c.isPro; }); })
      : POSTS;

    var html = '';

    // Compose box (only on feed tab)
    if (!filterProOnly) {
      html += '<div class="ch-compose"><div class="ch-compose-row">'
        + '<div class="ch-compose-avatar">' + _userInitials() + '</div>'
        + '<textarea class="ch-compose-input" id="ch-compose-text" placeholder="Share a tip, ask a question, or celebrate a win..." rows="1" oninput="this.style.height=\'auto\';this.style.height=this.scrollHeight+\'px\';document.getElementById(\'ch-post-submit\').disabled=!this.value.trim()"></textarea>'
        + '</div><div class="ch-compose-actions"><button class="ch-post-btn" id="ch-post-submit" disabled onclick="window._chSubmitPost()">Post →</button></div></div>';
    }

    if (posts.length === 0) {
      html += '<div class="ch-empty"><div class="ch-empty-icon">🩺</div><div class="ch-empty-text">No expert-answered posts yet.<br>Ask a question in the Feed and a pro might reply!</div></div>';
    }

    posts.forEach(function (p) {
      html += renderPost(p);
    });

    return html;
  }

  /** Render a single post card with replies */
  function renderPost(p) {
    var hasPro = p.comments.some(function (c) { return c.isPro; });
    var html = '<div class="ch-post" data-post-id="' + p.id + '">'
      + '<div class="ch-post-head">'
      + '<div class="ch-avatar" style="background:' + (p.isPro ? 'var(--teal)' : 'var(--ink)') + '">' + p.initials + '</div>'
      + '<div style="flex:1"><div class="ch-post-author">' + _escHtml(p.author) + (p.isPro ? ' <span class="ch-pro-badge">Pro</span>' : '') + '</div>'
      + '<div class="ch-post-time">' + _ago(p.time) + '</div></div>'
      + (hasPro ? '<span class="ch-pro-badge" style="background:var(--teal-lll);color:var(--teal)">✓ Pro replied</span>' : '')
      + '</div>'
      + '<div class="ch-post-body">' + _escHtml(p.text) + '</div>'
      + '<div class="ch-post-actions">'
      + '<button class="ch-action' + (p.liked ? ' liked' : '') + '" onclick="window._chLike(\'' + p.id + '\')">'
      + '<span class="ch-action-icon">' + (p.liked ? '❤️' : '🤍') + '</span> ' + p.likes
      + '</button>'
      + '<button class="ch-action" onclick="window._chToggleComments(\'' + p.id + '\')">'
      + '<span class="ch-action-icon">💬</span> ' + p.comments.length + (p.comments.length === 1 ? ' reply' : ' replies')
      + '</button>'
      + '</div>';

    // Comments section (collapsed by default, toggled)
    html += '<div class="ch-comments" id="ch-comments-' + p.id + '" style="display:none">';
    p.comments.forEach(function (c) {
      html += '<div class="ch-comment">'
        + '<div class="ch-comment-avatar" style="background:' + (c.isPro ? 'var(--teal)' : 'var(--ink-m)') + '">' + c.initials + '</div>'
        + '<div class="ch-comment-body">'
        + '<div class="ch-comment-author">' + _escHtml(c.author) + (c.isPro ? ' <span class="ch-pro-badge">Pro</span>' : '') + '</div>'
        + '<div class="ch-comment-text">' + _escHtml(c.text) + '</div>'
        + '<div class="ch-comment-time">' + _ago(c.time) + '</div>'
        + '</div></div>';
    });
    html += '<div class="ch-comment-input-row">'
      + '<input class="ch-comment-input" placeholder="Write a reply..." id="ch-reply-' + p.id + '" onkeydown="if(event.key===\'Enter\')window._chReply(\'' + p.id + '\')">'
      + '<button class="ch-comment-send" onclick="window._chReply(\'' + p.id + '\')">Reply</button>'
      + '</div></div>';

    html += '</div>';
    return html;
  }

  // ── Render: Find a Pro ─────────────────────────────────────────
  function renderFindPro() {
    if (boundExpert) {
      var exp = EXPERTS.find(function (e) { return e.id === boundExpert; });
      if (!exp) { boundExpert = null; saveBound(); return renderFindPro(); }
      return '<div class="ch-bound-card">'
        + '<div class="ch-bound-badge">✓ Your nutritionist</div>'
        + '<div class="ch-expert-avatar" style="background:' + exp.color + ';margin:0 auto 14px">' + exp.avatar + '</div>'
        + '<div class="ch-expert-name">' + exp.name + '</div>'
        + '<div class="ch-expert-title" style="margin-top:4px">' + exp.title + '</div>'
        + '<div style="font-size:12px;color:var(--ink-f);margin-top:6px">' + exp.speciality + '</div>'
        + '<div style="font-size:13px;color:var(--ink-m);margin-top:14px;line-height:1.6">' + exp.bio + '</div>'
        + '<div class="ch-expert-stats" style="border:none;margin-top:16px;padding:14px 0;border-top:1px solid var(--fog);border-bottom:1px solid var(--fog)">'
        + '<div class="ch-expert-stat"><div class="ch-expert-stat-val">★ ' + exp.rating + '</div><div class="ch-expert-stat-lbl">' + exp.reviews + ' reviews</div></div>'
        + '<div class="ch-expert-stat"><div class="ch-expert-stat-val">' + exp.clients + '</div><div class="ch-expert-stat-lbl">clients</div></div>'
        + '<div class="ch-expert-stat"><div class="ch-expert-stat-val">' + exp.fee + '</div><div class="ch-expert-stat-lbl">per session</div></div>'
        + '</div>'
        + '<div style="margin-top:16px;font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--ink-f)">You can message ' + exp.name.split(' ')[0] + ' via the 📩 icon in the top bar</div>'
        + '<button class="ch-unbind-btn" onclick="window._chUnbind()">Unbind nutritionist</button>'
        + '</div>';
    }

    // Card stack
    var remaining = EXPERTS.length - currentCard;
    if (remaining <= 0) {
      return '<div class="ch-empty"><div class="ch-empty-icon">🔍</div><div class="ch-empty-text">You\'ve seen all available experts.<br><button onclick="window._chResetCards()" style="margin-top:12px;padding:8px 20px;background:var(--ink);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">Browse again</button></div></div>';
    }

    var html = '<div class="ch-card-counter">' + (currentCard + 1) + ' of ' + EXPERTS.length + ' experts</div>';
    html += '<div class="ch-swipe-area">';

    // Render cards in reverse stack order (current on top)
    for (var i = Math.min(currentCard + 2, EXPERTS.length - 1); i >= currentCard; i--) {
      var e = EXPERTS[i];
      var offset = i - currentCard;
      var scale = 1 - offset * 0.04;
      var yOff = offset * 8;
      var cls = 'ch-expert-card';
      if (i < currentCard) cls += swipeDirection === 'left' ? ' gone-left' : ' gone-right';
      html += '<div class="' + cls + '" id="ch-card-' + i + '" style="z-index:' + (100 - offset) + ';transform:scale(' + scale + ') translateY(' + yOff + 'px);opacity:' + (offset > 1 ? 0.5 : 1) + '">'
        + '<div class="ch-expert-top">'
        + '<div class="ch-expert-avatar" style="background:' + e.color + '">' + e.avatar + '</div>'
        + '<div class="ch-expert-name">' + e.name + '</div>'
        + '<div class="ch-expert-title">' + e.title + '</div>'
        + '<div class="ch-expert-spec">' + e.speciality + '</div>'
        + '</div>'
        + '<div class="ch-expert-bio">' + e.bio + '</div>'
        + '<div class="ch-expert-stats">'
        + '<div class="ch-expert-stat"><div class="ch-expert-stat-val">★ ' + e.rating + '</div><div class="ch-expert-stat-lbl">' + e.reviews + ' reviews</div></div>'
        + '<div class="ch-expert-stat"><div class="ch-expert-stat-val">' + e.clients + '</div><div class="ch-expert-stat-lbl">clients</div></div>'
        + '<div class="ch-expert-stat"><div class="ch-expert-stat-val">' + e.fee + '</div><div class="ch-expert-stat-lbl">per session</div></div>'
        + '</div>'
        + '<div class="ch-expert-fee">'
        + '<div><div class="ch-expert-fee-val">' + e.fee + '</div><div class="ch-expert-fee-lbl">Consultation fee</div></div>'
        + '<div class="ch-pro-badge">' + e.speciality.split('&')[0].trim() + '</div>'
        + '</div>'
        + '</div>';
    }
    html += '</div>';

    html += '<div class="ch-swipe-btns">'
      + '<button class="ch-swipe-btn skip" onclick="window._chSwipe(\'left\')" aria-label="Skip expert" title="Skip">✕</button>'
      + '<button class="ch-swipe-btn bind" onclick="window._chSwipe(\'right\')" aria-label="Choose this expert" title="Choose as my expert">✓</button>'
      + '</div>'
      + '<div style="text-align:center;font-size:12px;color:var(--ink-f);line-height:1.6">Swipe <strong style="color:var(--pink)">left</strong> to skip · Swipe <strong style="color:var(--teal)">right</strong> to choose your nutritionist<br><span style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--ink-f)">You can bind to one expert at a time</span></div>';

    return html;
  }

  // ── Tab Router ─────────────────────────────────────────────────
  function renderTab() {
    var el = document.getElementById('ch-content');
    if (!el) return;
    if (activeTab === 'feed') el.innerHTML = renderFeed(false);
    else if (activeTab === 'askpro') el.innerHTML = renderFeed(true);
    else if (activeTab === 'findpro') el.innerHTML = renderFindPro();
  }

  // ── Actions ────────────────────────────────────────────────────
  window._chSubmitPost = function () {
    var inp = document.getElementById('ch-compose-text');
    var text = (inp ? inp.value : '').trim();
    if (!text) return;
    POSTS.unshift({
      id: 'p-' + Date.now(),
      author: _userName(),
      initials: _userInitials(),
      isPro: false,
      time: Date.now(),
      text: text,
      likes: 0,
      liked: false,
      comments: []
    });
    renderTab();
    if (typeof showToast === 'function') showToast('Posted!', '#1e6b5e');
  };

  window._chLike = function (postId) {
    var p = POSTS.find(function (x) { return x.id === postId; });
    if (!p) return;
    if (p.liked) { p.liked = false; p.likes = Math.max(0, p.likes - 1); }
    else { p.liked = true; p.likes++; }
    saveLikes();
    // Optimistic: just update the button in-place
    var card = document.querySelector('[data-post-id="' + postId + '"]');
    if (card) {
      var btn = card.querySelector('.ch-action');
      if (btn) {
        btn.className = 'ch-action' + (p.liked ? ' liked' : '');
        btn.innerHTML = '<span class="ch-action-icon">' + (p.liked ? '❤️' : '🤍') + '</span> ' + p.likes;
      }
    }
  };

  window._chToggleComments = function (postId) {
    var el = document.getElementById('ch-comments-' + postId);
    if (!el) return;
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  };

  window._chReply = function (postId) {
    var inp = document.getElementById('ch-reply-' + postId);
    var text = (inp ? inp.value : '').trim();
    if (!text) return;
    var p = POSTS.find(function (x) { return x.id === postId; });
    if (!p) return;
    p.comments.push({
      author: _userName(),
      initials: _userInitials(),
      isPro: false,
      text: text,
      time: Date.now()
    });
    renderTab();
    // Re-open comments
    var el = document.getElementById('ch-comments-' + postId);
    if (el) el.style.display = 'block';
    if (typeof showToast === 'function') showToast('Reply posted', '#1e6b5e');
  };

  window._chSwipe = function (dir) {
    if (currentCard >= EXPERTS.length) return;
    var card = document.getElementById('ch-card-' + currentCard);
    if (card) {
      card.classList.add(dir === 'left' ? 'gone-left' : 'gone-right');
    }
    if (dir === 'right') {
      var exp = EXPERTS[currentCard];
      boundExpert = exp.id;
      saveBound();
      // ── Write bind request so pro_community.html can read it ──
      _writeBindRequest(exp);
      var expName = exp.name;
      currentCard++;
      setTimeout(function () {
        renderTab();
        // Show persistent toast with link to My Nutritionist page
        var toastEl = document.getElementById('toast');
        if (toastEl) {
          toastEl.innerHTML = '<span>✓ ' + expName + ' is now your nutritionist!</span> <button onclick="switchPage(\'mypro\',document.getElementById(\'sn-mypro\'));this.parentElement.style.display=\'none\'" style="margin-left:12px;padding:5px 14px;background:#fff;color:#1e6b5e;border:none;border-radius:6px;font-family:\'Bricolage Grotesque\',sans-serif;font-size:11px;font-weight:600;cursor:pointer">View →</button>';
          toastEl.style.background = '#1e6b5e';
          toastEl.style.display = 'flex';
          toastEl.style.alignItems = 'center';
          toastEl.style.opacity = '1';
          setTimeout(function(){ toastEl.style.opacity = '0'; setTimeout(function(){ toastEl.style.display = 'none'; }, 400); }, 6000);
        } else if (typeof showToast === 'function') {
          showToast('✓ ' + expName + ' is now your nutritionist!', '#1e6b5e');
        }
      }, 450);
      return;
    }
    currentCard++;
    setTimeout(renderTab, 400);
  };

  function _writeBindRequest(exp) {
    try {
      var BIND_KEY = 'nw-bind-requests';
      var all = JSON.parse(localStorage.getItem(BIND_KEY) || '[]');
      var userName = _userName();
      var userInitials = _userInitials();
      var userId = (typeof NW !== 'undefined' && NW.auth && NW.auth.userId) ? String(NW.auth.userId) : ('local-' + Date.now());
      // Don't duplicate if there's already a pending or accepted request
      if (all.find(function(r){ return r.proId === exp.id && r.userId === userId && (r.status === 'pending' || r.status === 'accepted'); })) return;
      // Remove any old declined/cancelled entries for this pro so re-request is clean
      all = all.filter(function(r){ return !(r.proId === exp.id && r.userId === userId); });
      all.push({
        proId:        exp.id,
        userId:       userId,
        userName:     userName,
        userInitials: userInitials,
        userGoal:     'Weight Management',
        time:         'Just now',
        status:       'pending'
      });
      localStorage.setItem(BIND_KEY, JSON.stringify(all));
    } catch(e) {}
  }

  window._chUnbind = function () {
    if (!confirm('Unbind from your current nutritionist?')) return;
    boundExpert = null;
    currentCard = 0;
    saveBound();
    // Also clear bind requests from localStorage
    try {
      var uid = (typeof NW !== 'undefined' && NW.auth) ? NW.auth.userId : '';
      var all = JSON.parse(localStorage.getItem('nw-bind-requests') || '[]');
      all = all.filter(function(r) { return r.userId !== uid && r.userId !== ('u-' + uid); });
      localStorage.setItem('nw-bind-requests', JSON.stringify(all));
    } catch(e) {}
    renderTab();
    if (typeof showToast === 'function') showToast('Nutritionist unbound', '#b8621f');
    // Update My Nutritionist page if it exists
    if (typeof renderMyPro === 'function') renderMyPro();
  };

  /** Called by dashboard.html _nwUnbind to sync community-hub state */
  window._chClearBound = function () {
    boundExpert = null;
    currentCard = 0;
    saveBound();
    renderTab();
  };

  window._chResetCards = function () {
    currentCard = 0;
    renderTab();
  };

  // ── Init ───────────────────────────────────────────────────────
  function init() {
    injectCSS();
    injectNav();
    injectPage();
    loadState();

    // Hook into switchPage to trigger render when community page is shown
    var origSwitch = window.switchPage;
    window.switchPage = function (p, el) {
      origSwitch(p, el);
      if (p === 'community') {
        // Small delay to allow retry timer in switchPage to complete if needed
        setTimeout(function() { renderTab(); }, 200);
      }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 200);
})();
