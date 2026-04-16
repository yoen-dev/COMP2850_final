# NourishWell 前端补丁包 — 使用说明

这份补丁不改你的五个 HTML 文件的整体结构，而是通过**两个新文件 + 少量 HTML 片段**一次性给你加上所有评分点需要的东西。

---

## 📁 文件清单

```
nourishwell-patches/
├── nourishwell-patch.css       ← 加载到所有页面
├── nourishwell-patch.js        ← 只加载到 dashboard.html
├── INSTALL.md                  ← 这份说明
└── html-snippets/
    ├── 01-head-links.html              ← 所有 HTML 文件 <head> 里加
    ├── 02-record-today-additions.html  ← dashboard.html 的 Record Today 页面加
    ├── 03-recipe-page-additions.html   ← dashboard.html 的 Recipe 页面加
    ├── 04-fridge-integration.md        ← 把 fridge 跟搜索连起来
    ├── 05-comment-xss-fix.md           ← 手工小修复
    ├── 06-pro-dashboard-aria.md        ← pro_dashboard.html 补 aria
    ├── 07-cooking-mode-button.html     ← 食谱卡加「开始烹饪」按钮
    ├── 08-header-shortcuts-btn.html    ← 顶栏加「快捷键」按钮
    ├── 09-export-button.html           ← 加「导出报告」按钮
    └── 10-auth-page-labels.md          ← 登录页 <label> 修复
```

---

## 🚀 快速开始（三步）

### 第 1 步：把两个新文件放进项目

```
your-project/
├── index.html
├── dashboard.html
├── pro_dashboard.html
├── qa_subscriber.html
├── qa_pro.html
├── css/
│   └── nourishwell-patch.css       ← 放这里
└── js/
    └── nourishwell-patch.js        ← 放这里
```

### 第 2 步：在 5 个 HTML 文件的 `<head>` 里都加上 CSS

找到你现有的 `</style>` 标签（每个文件都有一个大的 `<style>...</style>`），在它**后面**加：

```html
<link rel="stylesheet" href="css/nourishwell-patch.css">
```

### 第 3 步：**只在 `dashboard.html`** 的 `</body>` 前加 JS

找到文件末尾的 `</body>`，在它**前面**加：

```html
<script src="js/nourishwell-patch.js" defer></script>
```

这样做完后，你**已经自动得到**：

- ✅ WCAG AA 颜色对比度修复
- ✅ 可见的 focus ring（键盘用户）
- ✅ prefers-reduced-motion 支持
- ✅ XSS 漏洞修复（评论区）
- ✅ 屏幕阅读器页面切换通告
- ✅ 装饰性 emoji 自动加 `aria-hidden`
- ✅ 键盘快捷键（`/`, `g+r`, `g+f`, `?`, `Esc`）
- ✅ 所有 `role="button"` 自动支持 Enter/Space
- ✅ Dark mode 对比度提升

剩下的功能（Insight 卡、冰箱模式、烹饪模式、Cooked 标记、导出报告）需要 html-snippets/ 里的片段激活——**每个都是在页面上加一个容器元素**，补丁 JS 会自动填充内容。

---

## 📥 激活各个功能（按评分影响力排序）

下面每一项都是一个「复制 → 粘贴到指定位置」的操作。

### 🔴 必做（影响 UX 10/10 分）

**A. 修复评论区 XSS 漏洞**

打开 `dashboard.html`，搜索 `function renderComments`（在 line 1514 附近）。**不用改原代码** —— 补丁 JS 已经在运行时覆盖了它。但如果想彻底干净，可以把 line 1514-1522 那个函数删掉。

**B. Pro Dashboard 加 aria-label**  
看 `html-snippets/06-pro-dashboard-aria.md`，那里面列了每个要加的属性。

---

### 🟡 强烈建议（功能冲 Excellent）

**C. Insight 反馈卡**

在 `dashboard.html` 里搜 `<!-- Three column meal log -->`（约 line 336）。在它**之前**粘贴：

```html
<!-- Proactive Nutrition Insights -->
<div id="insights-container" class="insight-row" aria-label="Daily nutrition insights"></div>
```

补丁 JS 启动时会自动填充 1-3 张建议卡片。

**D. 冰箱模式**

在 `dashboard.html` 里搜 `<!-- Recipe page -->` 或找到 `<div class="page" id="page-recipe"`（约 line 387）。找到页面标题 `</div>` 之后，在 `<div class="recipe-top-bar"` **之前**粘贴：

```html
<!-- Fridge Mode (ingredient-based search) -->
<div id="fridge-panel-host"></div>
```

补丁 JS 启动时会自动渲染食材 chips 并重新排序食谱卡片。

**E. 食谱卡加"开始烹饪"按钮（烹饪模式）**

这个不能用 data attribute 一键搞定，需要你改下 `openRecipeDetail` 函数（约 line 929）。在 `html-snippets/07-cooking-mode-button.html` 里看具体改法。

**F. 顶栏加"快捷键"按钮**

可以让评审看到你做了键盘支持。`html-snippets/08-header-shortcuts-btn.html` 有。

**G. 导出周报按钮**

在 Record Today 页面加一个「Export CSV」按钮。`html-snippets/09-export-button.html` 有。

---

### 🟢 锦上添花

**H. 登录页 label 修复**  
`html-snippets/10-auth-page-labels.md`

**I. Recipe 搜索框 placeholder 改成让用户知道能按食材搜**

搜 `placeholder="Search recipes..."`（line 421），改成：

```html
placeholder="Search by name or ingredient (e.g. salmon, lentils)"
```

---

## 🎯 做完之后你的评分位置

做完 A、B、C、D、E、F、G 之后，按 rubric：

| 评分项 | 做前 | 做后 |
|---|---|---|
| UX [10] | Good (7-8) | **Excellent (9-10)** |
| Functionality [20] | Good (12-14) | **Good+ / Excellent (15-17)**（缺后端的部分仍然限制上限） |
| Coding Standards [10] 前端部分 | Pass (4-6) | **Good (7-8)** |

剩下的差距只能靠后端、测试、文档、Git 策略去补。

---

## ⚠️ 已知注意事项

1. **补丁 JS 会运行一个 MutationObserver**，会持续扫描 DOM 给新出现的 emoji 加 `aria-hidden`。性能代价可忽略不计，但如果你不想这个行为，注释掉 `init()` 里的那几行即可。

2. **`computeTodayNutrition()` 当前读 DOM**。如果以后你接了后端，把它改成 fetch 就行。函数签名不变。

3. **Cooking mode 需要 RECIPES 全局对象**。你已经有了（line 806-814）。新食谱如果用 addCustomRecipe 加进来的话，也会自动支持烹饪模式。

4. **Fridge mode 是纯字符串匹配**。如果用户输入 "mushroom" 而食谱里写 "mushrooms"，能匹配（因为用的是 `.includes()`）。但 "chicken" 不会匹配 "chicken stock" 以外的意外情况——精度足够做 demo。

5. **CSV 导出需要 localStorage 里有 `nw-diary-history`**。你的代码已经在写这个 key 了，所以不需要改。

---

## 🧪 怎么验证补丁生效

1. 打开 `dashboard.html`
2. 按 `?` —— 应该弹出快捷键帮助
3. 按 `Esc` —— 关闭
4. 按 `/` —— 聚焦搜索框
5. 按 `g` 然后 `f` —— 跳到 Favourites
6. 在 Favourites 页面，每张卡片应该有 `🍽️ Try soon` 按钮
7. 点击一次 → 变成 `✓ Tried`，刷新页面保持
8. 打开 Chrome DevTools > Lighthouse > Accessibility → 跑一次，应该没有 contrast 错误了
9. 打开 DevTools > Elements，任何 emoji span 应该有 `aria-hidden="true"`
