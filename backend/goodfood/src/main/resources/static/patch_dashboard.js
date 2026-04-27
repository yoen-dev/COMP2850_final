/**
 * NourishWell — dashboard.html API Patch
 * ══════════════════════════════════════════════════════════════
 * 在 dashboard.html 底部 </body> 前引入（api.js 必须先加载）：
 *   <script src="api.js"></script>
 *   <script src="patch_dashboard.js"></script>
 *
 * 覆盖策略：
 *  - 食谱列表：启动时从 /api/recipes 拉取，合并进 window.RECIPES
 *  - 收藏：从 /api/favourites 初始化 favourites Set；toggleFav 接 API
 *  - 日记：loadDiaryHistory → API；commitFoodEntries → API；deleteMeal → API
 *  - 运动：closeExPanel → API；deleteEx → API
 *  - 评分/评论：submitRating / submitComment → API
 *  - localStorage 的非核心功能（dark mode、fridge、cooked）保留原逻辑
 * ══════════════════════════════════════════════════════════════
 */

// ── 0. 鉴权守卫：验证 token 有效性，无效则清除并跳回首页 ─────
(async function () {
  if (!NW.auth.isLoggedIn()) {
    window.location.replace('index.html');
    return;
  }
  try {
    const me = await NW.getMe();
    // token 有效 → 检查角色
    // Exception: if coming from pro dashboard ("Switch to User View"), allow pro to stay
    var fromPro = false;
    try { fromPro = sessionStorage.getItem('nw-from-pro') === '1'; } catch(e) {}
    if (me.role === 'professional' && !fromPro) {
      window.location.replace('pro_dashboard.html');
      return;
    }
    // 验证通过，显示页面
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.2s';
  } catch (e) {
    // token 无效或过期 → 清除并跳回登录
    NW.logout();
    window.location.replace('index.html');
    return;
  }
})();

// ══════════════════════════════════════════════════════════════
// 1. 食谱：从 API 拉取并合并进 RECIPES
// ══════════════════════════════════════════════════════════════
/** Fetch recipes from API and merge into frontend RECIPES object */
async function fetchAndMergeRecipes() {
  try {
    const apiRecipes = await NW.recipes.getAll();
    const parsed = NW.parseRecipes(apiRecipes);

    // 将后端食谱合并进前端 RECIPES（后端 id 是数字，转成字符串 key）
    // 前端已有的 6 条静态食谱通过 name 匹配，避免重复
    const existingNames = new Set(Object.values(window.RECIPES).map(r => r.name.toLowerCase()));

    Object.entries(parsed).forEach(([key, recipe]) => {
      if (!existingNames.has(recipe.name.toLowerCase())) {
        // 全新的后端食谱（用户自定义的），直接加入
        window.RECIPES[key] = recipe;
      } else {
        // 已有的静态食谱：用后端 id 补充，保留前端的 id 字符串 key
        const existingKey = Object.keys(window.RECIPES).find(
          k => window.RECIPES[k].name.toLowerCase() === recipe.name.toLowerCase()
        );
        if (existingKey) {
          window.RECIPES[existingKey]._numericId  = recipe._numericId;
          window.RECIPES[existingKey].averageRating = recipe.averageRating;
          window.RECIPES[existingKey].ratingCount   = recipe.ratingCount;
          window.RECIPES[existingKey].commentCount  = recipe.commentCount;
          // 更新展示评分
          if (recipe.averageRating > 0) {
            const s = Math.round(recipe.averageRating);
            window.RECIPES[existingKey].rating = '★'.repeat(s) + '☆'.repeat(5 - s);
          }
        }
      }
    });

    // 重新渲染食谱页（如果当前在食谱页）
    if (typeof renderRecipesPage === 'function') renderRecipesPage();

  } catch (e) {
    console.warn('[NW] fetchAndMergeRecipes failed:', e.message);
  }
}

// ══════════════════════════════════════════════════════════════
// 2. 收藏：从 API 初始化，覆盖 toggleFav
// ══════════════════════════════════════════════════════════════
/** Initialise favourites from API, replacing localStorage data */
async function initFavourites() {
  try {
    const data = await NW.favourites.get(); // [{ recipeId, recipe }]
    // 清空旧的，重新以 API 数据为准
    // favourites 是 dashboard.html 里的全局 Set
    favourites.clear();
    data.forEach(item => {
      // 优先匹配前端字符串 key（通过 name 匹配）
      const numId = String(item.recipeId);
      const matchKey = Object.keys(window.RECIPES).find(
        k => window.RECIPES[k]._numericId === item.recipeId ||
             window.RECIPES[k].id === numId
      );
      if (matchKey) favourites.add(matchKey);
      else favourites.add(numId);
    });
    if (typeof renderFavouritesPage === 'function') renderFavouritesPage();
  } catch (e) {
    console.warn('[NW] initFavourites failed:', e.message);
  }
}

// 覆盖 toggleFav（原函数在 dashboard.html 里定义）
var _origToggleFav_api = window.toggleFav;
/** Toggle recipe favourite status via API with optimistic UI update */
window.toggleFav = async function (id, heart) {
  const numericId = window.RECIPES[id]?._numericId || parseInt(id, 10);
  const wasOn = favourites.has(id);

  // 乐观更新 UI
  if (wasOn) {
    favourites.delete(id);
    if (heart) heart.textContent = '🤍';
    showToast('Removed from favourites');
  } else {
    favourites.add(id);
    if (heart) heart.textContent = '❤️';
    showToast('❤️ Saved', '#1e6b5e');
  }

  try {
    if (wasOn) {
      await NW.favourites.remove(numericId);
    } else {
      await NW.favourites.add(numericId);
    }
  } catch (e) {
    // 回滚
    console.warn('[NW] toggleFav API failed:', e.message);
    if (wasOn) favourites.add(id);
    else favourites.delete(id);
    if (heart) heart.textContent = wasOn ? '❤️' : '🤍';
    showToast('Failed to update favourite');
  }
};

// toggleFavFromDetail 内部也调用 toggleFav，会自动走新逻辑

// ══════════════════════════════════════════════════════════════
// 3. 食谱评分：覆盖 submitRating
// ══════════════════════════════════════════════════════════════
// 找到原评分提交逻辑（dashboard.html 里用 recipeRatings 存 localStorage）
// 覆盖为 API 调用
const _nwRatingTarget = null; // 记录当前打分的 recipeId（字符串 key）

// 拦截 setRating 点击（如果 dashboard 用的是全局函数）
var _origSetRating = window.setRating;
/** Intercept rating click to track target recipe ID */
window.setRating = function (recipeId, score) {
  _nwRatingTarget = recipeId;
  if (_origSetRating) _origSetRating(recipeId, score);
};

// 覆盖评分提交（dashboard 里 submitRating 函数）
var _origSubmitRating = window.submitRating;
/** Submit recipe rating to API (overrides localStorage version) */
window.submitRating = async function (recipeId) {
  const score = recipeRatings[recipeId] || 0;
  if (!score) {
    if (_origSubmitRating) _origSubmitRating(recipeId);
    return;
  }

  const numericId = window.RECIPES[recipeId]?._numericId;
  if (!numericId) {
    if (_origSubmitRating) _origSubmitRating(recipeId);
    return;
  }

  try {
    await NW.ratings.set(numericId, score);
    showToast('Rating saved ★', '#1e6b5e');
    // 关闭弹窗（原逻辑）
    const modal = document.getElementById('ratingModal');
    if (modal) modal.style.display = 'none';
  } catch (e) {
    console.warn('[NW] submitRating failed:', e.message);
    if (_origSubmitRating) _origSubmitRating(recipeId);
  }
};

// ══════════════════════════════════════════════════════════════
// 4. 评论：覆盖 submitComment，loadComments 也从 API 取
// ══════════════════════════════════════════════════════════════
var _origSubmitComment = window.submitComment;
/** Submit recipe comment to API with XSS validation */
window.submitComment = async function (recipeId) {
  const input = document.getElementById('commentInput');
  const text = (input ? input.value : '').trim();
  if (!text) return;

  const numericId = window.RECIPES[recipeId]?._numericId;
  if (!numericId) {
    if (_origSubmitComment) _origSubmitComment(recipeId);
    return;
  }

  try {
    await NW.comments.add(numericId, text);
    if (input) input.value = '';
    // 重新加载评论
    await loadCommentsFromAPI(recipeId, numericId);
    showToast('Comment posted', '#1e6b5e');
  } catch (e) {
    console.warn('[NW] submitComment failed:', e.message);
    const msg = e.message.includes('HTML') ? 'Comment must not contain HTML tags.'
              : e.message.includes('500')  ? 'Comment too long (max 500 chars).'
              : 'Failed to post comment.';
    showToast(msg, '#e07b78');
  }
};

/** Load comments for a recipe from API and render */
async function loadCommentsFromAPI(recipeKey, numericId) {
  try {
    const data = await NW.comments.get(numericId); // [{ id, user, text, createdAt }]
    // 格式化成 dashboard 内部格式
    recipeComments[recipeKey] = data.map(c => ({
      author: c.user || c.userName || 'User',
      text:   c.text,
      time:   c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    }));
    // 重新渲染评论区（如果有对应函数）
    if (typeof renderComments === 'function') renderComments(recipeKey);
    else {
      // 直接找评论容器更新
      const container = document.getElementById('commentsContainer');
      if (container) {
        container.innerHTML = recipeComments[recipeKey].map(c =>
          `<div class="comment-item">
            <div class="comment-author">${escapeHtml(c.author)} · ${escapeHtml(c.time)}</div>
            <div class="comment-text">${escapeHtml(c.text)}</div>
          </div>`
        ).join('');
      }
    }
  } catch (e) {
    console.warn('[NW] loadComments failed:', e.message);
  }
}

// 拦截 openRecipeDetail，加载评论（不覆盖，用包装避免递归）
(function () {
  // dashboard.html 已经覆盖了一次 openRecipeDetail（加评分+评论UI）
  // 这里用 _dashOrigOpen 保存当前版本，然后替换为新版本
  const _dashOrigOpen = window.openRecipeDetail;
  window.openRecipeDetail = async function (id) {
    // 临时恢复，防止递归
    window.openRecipeDetail = _dashOrigOpen;
    try {
      _dashOrigOpen(id);
    } finally {
      // 重新挂载本包装
      window.openRecipeDetail = arguments.callee;
    }
    const numericId = window.RECIPES[id]?._numericId;
    if (numericId) {
      await loadCommentsFromAPI(id, numericId);
    }
  };
})();

// ══════════════════════════════════════════════════════════════
// 5. 食谱新增：覆盖 saveCustomRecipe
// ══════════════════════════════════════════════════════════════
var _origSaveCustomRecipe = window.saveCustomRecipe;
window.saveCustomRecipe = async function () {
  // 先运行原始逻辑（它会把食谱加进 RECIPES 对象）
  if (_origSaveCustomRecipe) _origSaveCustomRecipe();

  // 找到刚加进去的 custom 食谱（最后一个 custom:true 的）
  const customEntry = Object.values(window.RECIPES).filter(r => r.custom).pop();
  if (!customEntry) return;

  try {
    const payload = {
      name:        customEntry.name,
      emoji:       customEntry.emoji || '🍽️',
      tag:         customEntry.tag   || '',
      kcal:        customEntry.kcal  || 0,
      cost:        String(customEntry.cost || '').replace('£', ''),
      timeMin:     parseInt(customEntry.tag) || 0,
      ingredients: customEntry.ingredients || [],
      steps:       customEntry.steps       || []
    };
    const res = await NW.recipes.add(payload);
    if (res && res.id) {
      customEntry._numericId = res.id;
    }
  } catch (e) {
    console.warn('[NW] saveCustomRecipe to API failed:', e.message);
    // 不阻断：食谱已在本地 RECIPES 里，只是没持久化到后端
  }
};

// ══════════════════════════════════════════════════════════════
// 6. 食物日记：loadDiaryHistory 和 commitFoodEntries 接 API
// ══════════════════════════════════════════════════════════════

// 记录每个 entry 的后端 id（用于删除）
// 结构：_diaryIdMap[date][mealKey][index] = backendId
const _diaryIdMap = {};

// 覆盖 loadDiaryHistory（原来是从 localStorage 读）
window.loadDiaryHistory = async function () {
  // 不再读 localStorage，直接拉今天的日记
  await _loadDiaryForDate(currentDiaryDate);
};

// 覆盖 loadDateDiary（切换日期时调用）
var _origLoadDateDiary = window.loadDateDiary;
/** Load food diary for a specific date from API */
window.loadDateDiary = async function (dateStr) {
  // 保存当前日期（不再需要 saveDiaryForDate 写 localStorage）
  currentDiaryDate = dateStr;
  await _loadDiaryForDate(dateStr);

  // 更新日期显示（复用原逻辑）
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const todayEl = document.getElementById('today-date');
  if (todayEl) todayEl.textContent = days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  const picker = document.getElementById('diary-date-picker');
  if (picker) picker.value = dateStr;
};

/** Internal: fetch diary entries for date and populate mealLog */
async function _loadDiaryForDate(dateStr) {
  try {
    const data = await NW.diary.get(dateStr);
    const meals = data.meals || data || [];

    // 重置 mealLog
    Object.keys(mealLog).forEach(k => { mealLog[k] = []; });
    if (!_diaryIdMap[dateStr]) _diaryIdMap[dateStr] = {};

    meals.forEach(m => {
      const key = NW.mealTypeToKey(m.mealType);
      const idx = mealLog[key].length;
      mealLog[key].push({
        _id:     m.id,
        name:    m.foodName,
        kcal:    m.kcal,
        time:    m.time || '',
        protein: m.protein || 0,
        carbs:   m.carbs   || 0,
        fat:     m.fat     || 0,
        sugar:   m.sugar   || 0
      });
      if (!_diaryIdMap[dateStr][key]) _diaryIdMap[dateStr][key] = [];
      _diaryIdMap[dateStr][key][idx] = m.id;
    });

    renderMealLog();
    updateDonut(); if(typeof updateCalorieTrend==='function') updateCalorieTrend();
  } catch (e) {
    console.warn('[NW] _loadDiaryForDate failed:', e.message);
    Object.keys(mealLog).forEach(k => { mealLog[k] = []; });
    renderMealLog();
    updateDonut(); if(typeof updateCalorieTrend==='function') updateCalorieTrend();
  }
}

// 覆盖 commitFoodEntries（添加食物）
var _origCommitFoodEntries_api = window.commitFoodEntries;
/** Save added food items to API with optimistic UI update */
window.commitFoodEntries = async function () {
  if (!foodAdded.length) return;

  const btn = document.getElementById('mealPickerBtn');
  const label = btn ? btn.textContent : '🌅 Breakfast';
  const keyMap = {
    'Breakfast':       'breakfast',
    'Morning Snack':   'morningSnack',
    'Lunch':           'lunch',
    'Afternoon Snack': 'afternoonSnack',
    'Dinner':          'dinner',
    'Evening Snack':   'eveningSnack'
  };
  const mealKey  = Object.keys(keyMap).find(k => label.includes(k));
  const frontKey = mealKey ? keyMap[mealKey] : 'breakfast';
  const mealType = NW.keyToMealType(frontKey);

  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  // 乐观更新 UI
  foodAdded.forEach(item => mealLog[frontKey].push(item));
  renderMealLog();
  updateDonut(); if(typeof updateCalorieTrend==='function') updateCalorieTrend();
  showToast('✓ ' + foodAdded.length + ' item' + (foodAdded.length > 1 ? 's' : '') + ' added', '#1e6b5e');
  const toPost = [...foodAdded];
  foodAdded = [];

  // 后台批量发送到 API
  for (const item of toPost) {
    try {
      const res = await NW.diary.add({
        date:     currentDiaryDate,
        mealType: mealType,
        time:     timeStr,
        foodName: item.name,
        kcal:     item.kcal,
        protein:  item.protein  || 0,
        carbs:    item.carbs    || 0,
        fat:      item.fat      || 0,
        sugar:    item.sugar    || 0
      });
      // 将后端 id 回填到 mealLog entry
      if (res && res.id) {
        const entry = mealLog[frontKey].find(e => e.name === item.name && !e._id);
        if (entry) entry._id = res.id;
        if (!_diaryIdMap[currentDiaryDate]) _diaryIdMap[currentDiaryDate] = {};
        if (!_diaryIdMap[currentDiaryDate][frontKey]) _diaryIdMap[currentDiaryDate][frontKey] = [];
        _diaryIdMap[currentDiaryDate][frontKey].push(res.id);
      }
    } catch (e) {
      console.warn('[NW] diary add failed for', item.name, e.message);
    }
  }
};

// 覆盖 deleteMeal（删除单条日记条目）
var _origDeleteMeal = window.deleteMeal;
/** Delete a single diary entry via API with optimistic removal */
window.deleteMeal = async function (key, idx) {
  const entry = mealLog[key] && mealLog[key][idx];
  const backendId = entry ? entry._id : null;

  // 乐观删除
  mealLog[key].splice(idx, 1);
  renderMealLog();
  updateDonut(); if(typeof updateCalorieTrend==='function') updateCalorieTrend();

  if (backendId) {
    try {
      await NW.diary.remove(backendId);
    } catch (e) {
      console.warn('[NW] diary delete failed:', e.message);
      showToast('Failed to delete entry', '#e07b78');
    }
  }
};

// saveDiaryForDate 不再需要写 localStorage，变为 no-op
window.saveDiaryForDate = function () {};

// ══════════════════════════════════════════════════════════════
// 7. 运动日记：closeExPanel 和 deleteEx 接 API
// ══════════════════════════════════════════════════════════════

// exLog 里每个 entry 保留 _id 字段
var _origCloseExPanel = window.closeExPanel;
/** Close exercise panel and save exercises to API */
window.closeExPanel = async function () {
  if (exAdded.length > 0) {
    const now = new Date();
    const ts = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const toAdd = [...exAdded];

    // 乐观更新
    toAdd.forEach(ex => { exLog.push({ time: ts, name: ex.name, kcal: ex.kcalPerHour, _id: null }); });
    renderExerciseLog();
    updateExerciseChart();
    showToast('✓ ' + toAdd.length + ' exercise' + (toAdd.length > 1 ? 's' : '') + ' logged', '#1e6b5e');
    exAdded = [];

    // 后台发送
    for (const ex of toAdd) {
      try {
        const res = await NW.exercise.add({
          date:     currentDiaryDate,
          activity: ex.name,
          duration: ex.durationMin || 30,
          kcal:     ex.kcalPerHour
        });
        if (res && res.id) {
          const entry = exLog.find(e => e.name === ex.name && !e._id);
          if (entry) entry._id = res.id;
        }
      } catch (e) {
        console.warn('[NW] exercise add failed:', e.message);
      }
    }
  }
  document.getElementById('exDim').style.display = 'none';
  document.getElementById('exPanel').style.display = 'none';
};

// 覆盖 deleteEx
var _origDeleteEx = window.deleteEx;
/** Delete a single exercise entry via API */
window.deleteEx = async function (idx) {
  const entry = exLog[idx];
  const backendId = entry ? entry._id : null;

  exLog.splice(idx, 1);
  renderExerciseLog();

  if (backendId) {
    try {
      await NW.exercise.remove(backendId);
    } catch (e) {
      console.warn('[NW] exercise delete failed:', e.message);
    }
  }
};

// ══════════════════════════════════════════════════════════════
// 8. 覆盖 loadState：原来读 localStorage，现在改为 API 初始化
// ══════════════════════════════════════════════════════════════
var _origLoadState = window.loadState;
/** Initialise app state from API (recipes, favourites, diary) */
window.loadState = async function () {
  // 保留 dark mode（不涉及后端）
  try {
    const f = localStorage.getItem('nw-favourites');
    const c = localStorage.getItem('nw-compare');
    if (c) { compareSelected = new Set(JSON.parse(c)); }
    // 不再从 localStorage 读 favourites 和 diary —— 由 API 接管
  } catch (e) {}

  // 并行拉取食谱 + 收藏 + 今日日记
  await Promise.allSettled([
    fetchAndMergeRecipes(),
    initFavourites(),
    _loadDiaryForDate(currentDiaryDate)
  ]);
};

// ══════════════════════════════════════════════════════════════
// 9. 用户名展示
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  // 尝试更新页面上的用户名（如果有对应元素）
  const nameEl = document.getElementById('userName') || document.querySelector('.user-name');
  if (nameEl && NW.auth.name) {
    nameEl.textContent = NW.auth.name;
  }
});

// ══════════════════════════════════════════════════════════════
// 10. Logout
// ══════════════════════════════════════════════════════════════
// 覆盖原来的 logout onclick（直接跳转）
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('a.logout, [onclick*="logout"], [href*="index.html"]').forEach(el => {
    // 只处理有 logout class 的
    if (el.classList.contains('logout')) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        NW.logout();
        window.location.href = 'index.html';
      });
    }
  });
});

// ══════════════════════════════════════════════════════════════
// 11. Messages: Load & Send via API
// ══════════════════════════════════════════════════════════════
/** Cache for professional/expert info */
var _userProInfo = null;

/** Override sendMsg to send via API instead of local-only */
var _origSendMsg = window.sendMsg;
window.sendMsg = async function() {
  var inp = document.getElementById('msgInput');
  var text = (inp ? inp.value : '').trim();
  if (!text) return;

  try {
    // Get user's professional ID
    if (!_userProInfo) {
      var me = await NW.getMe();
      _userProInfo = { id: me.id, name: me.name, proId: me.proId };
    }

    if (!_userProInfo.proId) {
      console.warn('[NW] User not bound to a professional yet');
      // Fall back to local-only for now
      if (_origSendMsg) _origSendMsg();
      return;
    }

    // Send message via API
    var result = await NW.messages.send(_userProInfo.proId, text);
    console.log('[NW] Message sent:', result);

    // Update UI: add to local messages array and re-render
    var now = new Date();
    var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    if (typeof userMsgs !== 'undefined') {
      userMsgs.push({
        from: 'user',
        text: text,
        time: timeStr,
        _id: result.id
      });
      if (typeof renderMsgs === 'function') renderMsgs();
    }

    // Clear input
    if (inp) inp.value = '';
  } catch (err) {
    console.error('[NW] Failed to send message:', err);
    alert('Failed to send message: ' + (err.message || 'Unknown error'));
  }
};

/** Load messages from professional on page load */
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(async function() {
    try {
      var me = await NW.getMe();
      if (!me.proId) {
        console.log('[NW] User not bound to professional, messages not available');
        return;
      }

      _userProInfo = { id: me.id, name: me.name, proId: me.proId };

      // Fetch conversation with professional
      var messages = await NW.messages.get(me.proId);
      console.log('[NW] Loaded', messages.length, 'messages from professional');

      // Update userMsgs with API messages
      if (typeof userMsgs !== 'undefined' && messages.length > 0) {
        userMsgs = messages.map(m => ({
          from: String(m.senderId) === me.proId ? 'pro' : 'user',
          text: m.text,
          time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          _id: m.id,
          isRead: m.isRead
        }));

        // Re-render if function exists
        if (typeof renderMsgs === 'function') {
          renderMsgs();
        }
      }
    } catch (err) {
      console.warn('[NW] Failed to load messages:', err);
    }
  }, 500);
});
