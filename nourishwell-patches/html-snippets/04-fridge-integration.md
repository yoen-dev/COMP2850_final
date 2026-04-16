# SNIPPET 04 — Fridge Mode ↔ Search integration

你已经粘贴了 snippet 03 之后，冰箱面板会出现，但现在当用户在**搜索框里**输入内容时，冰箱排序会被覆盖（因为 `applyAllFilters` 会隐藏不匹配的卡片）。

这个小修改让两者协同工作。

---

## 要改的地方

在 `dashboard.html` 搜索 `function applyAllFilters`（约 line 1829）。

找到函数**最后一行**（`}` 之前）。

## 加一行

函数的最后应该是类似这样：

```javascript
  document.querySelectorAll('.recipe-card').forEach(function(card){
    // ... 已有的过滤逻辑 ...
    card.style.display = show ? '' : 'none';
  });
}   // ← function applyAllFilters 的结束大括号
```

**就在结束大括号 `}` 之前**，加一行：

```javascript
  // Keep fridge-mode sorting in sync with filter changes
  if (typeof applyFridgeSort === 'function') applyFridgeSort();
}
```

---

## 效果

- 用户勾选了冰箱里有 🍅、🥚 之后
- 同时又输入了搜索词 "breakfast"
- 食谱列表会先按搜索 + 过滤筛选，再按冰箱匹配数排序（多的在前）
- 每张卡片左上角显示 "2/4 match" badge

demo 时就是一个完整的 story：
> "我早餐想做点有鸡蛋的，但我冰箱里还有番茄和蘑菇——" 勾选、搜索、显示带 badge 的结果。
