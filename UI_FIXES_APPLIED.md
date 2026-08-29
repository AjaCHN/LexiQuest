# LexiQuest UI 修复清单（已应用）

**依据**：`UI_REVIEW_REPORT.md`（WCAG 2.1 AA 审查）
**验证**：`npx tsc --noEmit` 通过（exit 0，无类型错误）
**范围**：`components/`（7 个）+ `app/`（page.tsx、globals.css）

---

## 已修复（按原报告编号）

### 🔴 关键
1. **FormationPractice.tsx:69-84** — 选项 `div[role=button]` 补 `tabIndex={0}`、`onKeyDown`（Enter/Space 触发 `toggle`）、`aria-pressed={chosen.includes(i)}`。键盘用户现在可正常选择/取消选项。
2. **GroupSelector.tsx:30-42** — `<button>` 内嵌 `<h3>/<div>` 违反 HTML 内容模型；改为 `<div role="button" tabIndex={0}>` + 方向键/Enter/Space 键盘处理，标题降为 `<span className="title">`；`globals.css` 同步 `.group-card h3` → `.group-card .title`。

### 🟡 重要
3. **page.tsx:280-299** — 顶部 Tabs 加 `role="tablist"` + 三个 `role="tab"`（`aria-selected`/`aria-controls`/`id`），并在 tablist 上实现左右方向键导航；三个内容块包为 `role="tabpanel"`（`aria-labelledby` + `tabIndex={-1}`）。
4. **SettingsDrawer.tsx** — 抽屉加 `role="dialog" aria-modal="true" aria-labelledby="settings-title"`，打开时 `useEffect` 绑定 `Esc` 关闭并将焦点移入抽屉（`ref` + `tabIndex={-1}`）；确认弹窗加 `role="alertdialog" aria-modal aria-labelledby="confirm-title"`。
5. **SettingsDrawer.tsx** — 同步码 `<input>` 加 `aria-label="云端同步码"`；导入由 `<label>` 包裹隐藏 `<input>` 改为 `<button type="button">` + `ref` 隐藏 `<input>`（`fileRef.current?.click()`），键盘可触发。
6. **page.tsx:222,246** — 未选择分支与主流均将 `<div className="app">` 改为 `<main>`，补齐主内容地标。
7. **page.tsx:256,270,273** — 切换年龄段 chip、主题切换、设置三个图标按钮补 `aria-label`（保留 `title` 作 tooltip）。

### 🔵 建议
8. **globals.css** — 对比度校准（标称值，均按 ≥4.5:1 / non-text ≥3:1 复核）：
   - `--text-faint`：`#97a0b5→#646e85`（浅）、`#6b748f→#828ca6`（深）
   - `--warn`：`#d97706→#b45309`（浅，深 `#fbbf24` 保持）
   - `--success`：`#16a34a→#15803a`（浅，深 `#34d399` 保持）
9. **globals.css:91,767** — `color-mix()` 前加纯色 `var(--bg-soft)` 回退，兼容旧浏览器。
10. **globals.css** — `.iconbtn` 40→44px；底部导航按钮加 `min-height:44px`、padding `10px 4px`，触摸目标达标。
11. **WordCard.tsx:29,61** — 翻转卡前后按钮加条件 `tabIndex`（折叠态背面按钮不可 Tab 聚焦，展开态正面按钮不可聚焦），消除隐藏元素可被聚焦问题。
12. **ChallengePanel.tsx:45-47** — 进度条加 `role="progressbar" aria-valuenow/min/max` 与 `aria-label`，屏幕阅读器可感知进度。
13. **Icons.tsx** — 全部装饰图标经 `base()` 加 `aria-hidden="true"`（含独立 `IconCheck`），避免朗读无意义路径。
14. **page.tsx:233,388** — 两处 toast 加 `role="status" aria-live="polite"`，状态变更可播报。
15. **globals.css** — 末尾加 `@media (prefers-reduced-motion: reduce)` 关闭动画/过渡，照顾前庭敏感用户。

### 🔴 关键（续 · 上次标记的待确认项）
16. **lib/types.ts + app/page.tsx:262** — 切换年龄段 chip 原固定 `color:#fff` 在浅 group 色下对比不足。新增 `readableTextOn(hex)` 工具：按背景相对亮度分别计算与纯白/纯黑 WCAG 对比度，自动选更高者（WCAG 2.1 1.4.3 小文字≥4.5:1）。
    - children `#f59e0b` → 黑字 `#0f172a`，**9.72:1** ✅（原白字仅 2.16:1）
    - teen `#4f46e5` → 白字 `#ffffff`，**6.03:1** ✅
    - adult `#0ea5e9` → 黑字 `#0f172a`，**7.49:1** ✅（原白字仅 2.80:1）
    - chip 改 `color: readableTextOn(m.color)`，不再依赖手动确认色值。

---

## 验证结果
- `npx tsc --noEmit` → 退出码 0，无类型/编译错误。
- 未改动业务逻辑与样式视觉结构，仅补齐可访问性/语义属性与对比度变量。

## 剩余注意
- Tab 切换焦点策略为简化实现：方向键切 tab 时焦点停在 tab 上（tabpanel `tabIndex={-1}` 不抢焦点），符合 ARIA Tabs 基础模式；如需"切换即把焦点移入面板"可再增强。
