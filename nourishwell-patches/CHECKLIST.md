# NourishWell 补丁完成度检查清单

照着这个单子一项一项打勾。

---

## 阶段 1：基础安装（约 10 分钟）

- [ ] 把 `css/nourishwell-patch.css` 放到项目的 `css/` 目录
- [ ] 把 `js/nourishwell-patch.js` 放到项目的 `js/` 目录
- [ ] `index.html` 的 `</style>` 后加了 `<link rel="stylesheet" href="css/nourishwell-patch.css">`
- [ ] `dashboard.html` 同上
- [ ] `pro_dashboard.html` 同上
- [ ] `qa_subscriber.html` 同上
- [ ] `qa_pro.html` 同上
- [ ] `dashboard.html` 的 `</body>` 前加了 `<script src="js/nourishwell-patch.js" defer></script>`

**验证**：打开 dashboard.html，按 `?`，应该弹出快捷键帮助窗口。

---

## 阶段 2：核心功能激活（约 15 分钟）

- [ ] Snippet 02 粘贴完成（Record Today 页有 `<div id="insights-container">`）
  - 验证：Record Today 页顶部出现 1-3 张绿/橙色的 Insight 卡
- [ ] Snippet 03 粘贴完成（Recipe 页有 `<div id="fridge-panel-host">`）
  - 验证：Recipe 页出现 🧊 What's in your fridge? 面板
- [ ] Snippet 03 里的 placeholder 更新完成
  - 验证：搜索框提示文字变成 "Search by name or ingredient..."
- [ ] Snippet 04 的 `applyFridgeSort` 一行代码加到了 `applyAllFilters` 里
  - 验证：点冰箱 chip，食谱卡重新排序且左上角显示 "2/5 match" 徽章

---

## 阶段 3：高价值功能按钮（约 10 分钟）

- [ ] Snippet 07 完成（食谱详情面板有 👨‍🍳 Cook 按钮）
  - 验证：点任意食谱 → 点 Cook → 全屏 ingredient list 出现
  - 验证：按方向键能前后翻步骤，按 Esc 能关闭
- [ ] Snippet 08 完成（顶栏有 Shortcuts 按钮）
  - 验证：点它或按 `?` 弹出快捷键列表
- [ ] Snippet 09 完成（Record Today 右上角有 Export week 按钮）
  - 验证：点它下载一个 CSV 文件

---

## 阶段 4：Pro Dashboard a11y（约 15 分钟）

按 snippet 06 一项一项做：

- [ ] 6.1 顶栏加 role/aria-label
- [ ] 6.2 Side nav 每个客户加 aria-label（5 个客户）
- [ ] 6.3 Overview stat cards 加 role="region"
- [ ] 6.4 Snapshot 表格加 aria-label / caption
- [ ] 6.5 Tab bar 转成真正的 role="tablist"
- [ ] 6.6 加 Skip link
- [ ] 6.7 Chat input 加 label
- [ ] 6.8 Client search 加 label

**验证**：在 Chrome DevTools > Lighthouse > Accessibility 跑 pro_dashboard.html，分数 ≥ 95。

---

## 阶段 5：登录页 a11y（约 10 分钟）

按 snippet 10 做：

- [ ] 10.1 auth-shell 加 role="main"
- [ ] 10.2 role-selector 转成 radiogroup，同步 aria-checked
- [ ] 10.3 密码切换按钮加 aria-pressed 和动态 aria-label
- [ ] 10.4 改用 `<form>` 标签，可以删掉 Enter 键监听器
- [ ] 10.5 Error 消息加 role="alert"，autocomplete 属性

**验证**：登录页 Lighthouse Accessibility ≥ 95；Safari/Chrome 密码管理器能识别表单。

---

## 阶段 6：最后打磨（可选）

这些不是补丁提供的，是建议你自己做的小事：

- [ ] Replace 所有 `:focus` 为 `:focus-visible`（补丁已经 override 了，这一步可选）
- [ ] 把 index.html 那套 JSDoc 注释风格抄到 dashboard.html / pro_dashboard.html 头部
- [ ] 统一按钮大小写（Sentence case 或 Title Case 选一个）
- [ ] 所有内联 `style=""` 超过 3 个相同模式的都抽成 class

---

## 最终验证清单

做完所有阶段后：

### 自动化测试

- [ ] Chrome DevTools > Lighthouse > Accessibility 每页 ≥ 95
- [ ] 浏览器控制台无 JS 错误
- [ ] axe DevTools 扫描每页 0 Serious/Critical violation

### 手动测试

- [ ] 整个 dashboard 可以**只用键盘**操作（Tab、Enter、Arrow、Esc）
- [ ] 焦点切换时有清晰的 teal 色边框
- [ ] `?` 弹出快捷键帮助
- [ ] `g r` 跳 Record, `g f` 跳 Favourites, `g p` 跳 Planner, `g s` 跳 Recipes, `g c` 跳 Compare
- [ ] `/` 聚焦搜索框
- [ ] Esc 关闭烹饪模式 / 快捷键帮助
- [ ] 冰箱模式勾选后食谱卡出现 "X/Y match" 徽章并重新排序
- [ ] Cooking mode 方向键翻页、Esc 关闭
- [ ] Export week 下载出有效 CSV
- [ ] 收藏页每张卡有 Try soon / ✓ Tried 切换
- [ ] Dark mode 下所有新加的 UI（insight、fridge、cook mode、shortcuts）看起来正常

### 屏幕阅读器测试（加分项）

- [ ] 用 VoiceOver (Mac Cmd+F5) 或 ChromeVox 听一遍导航
- [ ] 页面切换时有 "Navigated to X" 通告
- [ ] 装饰 emoji 不被读出
- [ ] 功能性 icon 有正确的 aria-label

---

## 🎁 Poster / Demo 上可以展示的亮点清单

勾选你已经实现的，方便做 poster 时选择：

- [x] 现代的 UI 设计系统（teal/amber/ink/paper 配色 + 三种字体）
- [x] 订阅者 + 专业人士双角色
- [x] 5 大功能页（Record, Recipes, Favourites, Compare, Planner）
- [x] Chart.js 数据可视化
- [x] Dark mode
- [x] Responsive (desktop / tablet / mobile)
- [x] **WCAG AA 无障碍** ← 补丁加的
- [x] **键盘导航 + 快捷键** ← 补丁加的
- [x] **主动营养反馈** ← 补丁加的
- [x] **按食材搜索（冰箱模式）** ← 补丁加的
- [x] **烹饪模式** ← 补丁加的
- [x] **数据导出 CSV** ← 补丁加的
- [x] **XSS 安全修复** ← 补丁加的
- [x] Recipe rating + comments
- [x] Ingredient exclusion filter（过敏原）
- [x] Custom recipe 添加
- [x] 多日 diary 回顾
- [x] Focus-visible
- [x] prefers-reduced-motion 支持
- [x] Skip link
- [x] LocalStorage 持久化

你的 poster 应该能轻松列出 15+ 个具体功能，每个都能在 demo 时展示 5-15 秒。
