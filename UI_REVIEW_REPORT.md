# LexiQuest UI 代码审查报告

**审查范围**：`app/`（layout.tsx、page.tsx、globals.css）+ `components/`（7 个组件）
**审查依据**：WCAG 2.1 AA、WAI-ARIA Authoring Practices、响应式设计最佳实践、Material Design / Apple HIG 触摸目标规范
**审查日期**：2026-08-29
**总体结论**：代码视觉完成度较高、设计 Token 系统化、主流程可访问性基础尚可，但存在 **2 个关键可访问性缺陷**（键盘不可操作、无效 HTML 结构）与若干对比度/语义化问题，建议优先修复关键项。

---

## 一、问题汇总

| 等级 | 数量 | 说明 |
|------|------|------|
| 🔴 关键 | 2 | 影响核心功能或违反 HTML/可访问性硬规范 |
| 🟡 重要 | 5 | 语义化、ARIA、表单可访问性缺失 |
| 🔵 建议 | 10 | 对比度、焦点管理、动效偏好等体验增强 |

**主要改进方向**：补齐键盘可操作性 → 修复无效 HTML 结构 → 补全地标与 ARIA → 校准对比度 → 增加动效/状态的无障碍兜底。

---

## 二、详细问题（file:line）

### 🔴 关键

**1. `components/FormationPractice.tsx:69-84` — 选项 div 键盘完全不可操作**
选项用 `<div role="button" onClick={toggle}>` 实现，但**缺少 `tabIndex`、`onKeyDown` 与 `aria-pressed`**。键盘用户无法聚焦、无法用 Enter/Space 选择，屏幕阅读器也无法感知选中状态（role=button 但未实现键盘交互，违反 WCAG 2.1.1 Keyboard；选中态未用 `aria-pressed` 违背 4.1.2）。
```tsx
// 修复：补全键盘与状态语义
<div
  role="button"
  tabIndex={0}
  aria-pressed={chosen.includes(i)}
  onClick={() => toggle(c.id, i)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(c.id, i);
    }
  }}
>
```
> 更优方案：改用原生 `<input type="checkbox">` + `<label>`，自带键盘与可达名称，CSS 隐藏默认框、用 `.box` 呈现勾选态。

**2. `components/GroupSelector.tsx:30-42` — `<button>` 内嵌套 `<h3>`/`<div>` 属无效 HTML**
`<button>` 的内容模型仅允许 *phrasing content*，内部出现 `<h3>`（flow）与 `<div>`（flow）违反 HTML 规范（WCAG 4.1.1 Parsing / 4.1.2）。部分屏幕阅读器会丢弃或错解析按钮内容。
```tsx
// 修复：改用 div+role=button 并补全键盘，标题降级为 span
<div
  className="group-card"
  role="button"
  tabIndex={0}
  onClick={() => onSelect(g)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(g); }
  }}
>
  <div className="emoji" style={{ background: m.color }}>{icons[g]}</div>
  <span className="gc-title">{m.name}</span>
  <div className="tag">{m.range}</div>
  <p>{m.desc}</p>
</div>
```
> 同步在 `globals.css` 将 `.group-card h3` 样式迁移到 `.gc-title`。

---

### 🟡 重要

**3. `app/page.tsx:280-299` — 顶部 Tabs 缺 ARIA Tab 模式**
三个切换按钮用普通 `<button>` 实现 Tab 栏，缺少 `role="tablist"/"tab"`、`aria-selected`、`aria-controls` 及方向键导航（WCAG 4.1.2、ARIA Tabs 模式）。
```tsx
<div id="main-tabs" className="tabs" role="tablist">
  <button role="tab" aria-selected={activeTab==="words"} aria-controls="panel-words"
    id="tab-words" onClick={()=>setActiveTab("words")}>…</button>
  {/* 键盘：左右方向键移动焦点并切换 */}
</div>
```

**4. `components/SettingsDrawer.tsx:48-49, 133-156` — 抽屉与确认弹窗缺 dialog 语义**
`.overlay/.drawer` 及 `.modal` 未声明 `role="dialog"` / `aria-modal` / `aria-labelledby`，且无 `Esc` 关闭与焦点管理（WCAG 2.1.1、2.4.3 焦点顺序）。
```tsx
<div id="settings-drawer" className="drawer" role="dialog" aria-modal="true"
  aria-labelledby="settings-title" onClick={(e)=>e.stopPropagation()}>
  <h2 id="settings-title">设置</h2>
  {/* 打开时 useEffect 聚焦首个可聚焦元素；监听 Esc 调 onClose；关闭时焦点归位 */}
</div>
```

**5. `components/SettingsDrawer.tsx:78-83, 107-118` — 输入与文件选择缺 label 关联**
同步码 `<input type="text">` 无 `id`/`aria-label` 关联（其上 `<label>` 无 `htmlFor`）；导入用 `<label>` 包裹 `display:none` 的 `<input>`，键盘用户无法聚焦 label 触发文件选择（WCAG 1.3.1、3.3.2 Label、2.1.1）。
```tsx
<input id="sync-code" type="text" aria-label="云端同步码"
  placeholder="设置同步码（多设备填同一个即可共享）" value={code}
  onChange={(e)=>setCode(e.target.value)} />
// 导入改为：<button onClick={()=>fileRef.current?.click()}>导入恢复</button>
//          <input ref={fileRef} type="file" accept="application/json" hidden ... />
```

**6. `app/page.tsx:246` — 主内容区未用 `<main>` 地标**
`#lexiquest-app` 用 `<div className="app">` 包裹全部主内容，缺少 `<main>` 地标，屏幕阅读器用户无法用地标快速跳转（WCAG 1.3.1）。建议将最外层容器改为 `<main>`（header 用 `<header>` 已具备）。

**7. `app/page.tsx:270, 273` 等多处 — 图标按钮用 `title` 作可访问名称**
主题切换、设置等 `iconbtn` 仅设 `title`，部分辅助技术不朗读 `title`（WCAG 2.5.3 Label in Name / 4.1.2）。建议补 `aria-label`。
```tsx
<button className="iconbtn" onClick={handleToggleTheme} aria-label="切换深浅色主题">…</button>
```

---

### 🔵 建议

**8. `app/globals.css:7, 35` — `--text-faint` 对比度不足（小文字）**
`--text-faint` 浅色 `#97a0b5` 对 `--bg #f5f6fb` ≈ **2.4:1**；深色 `#6b748f` 对 `--bg #0f1320` ≈ **3.98:1**。二者用于 `.sub/.hint/.note/.meta/.tag`（11–12px 小文字），均低于 AA 4.5:1（WCAG 1.4.3）。建议加深至 `#6b748f`（浅）/ `#8b93a7`（深）以上档位并复核。

**9. `app/globals.css:138-142, 17` — `.chip.flame` 警示文字对比度不足**
浅色主题下 `--warn #d97706` 文字对 `--warn-soft` 背景 ≈ **2.9:1**（"火焰/连续天数"强调信息），远低于 4.5:1；深色主题 OK（WCAG 1.4.3）。建议浅色改用更深的琥珀（如 `#b45309`）或加深背景。

**10. `app/globals.css:594-597, 20` — 已达成徽标 `--success` 文字 < 3:1**
`.lvl.done .badge` 用 `--success #16a34a` 文字对 `--bg-sunken #eef0f6` ≈ **2.94:1**，低于 non-text 3:1 阈值（WCAG 1.4.11）。建议加深 success 或提升背景对比。

**11. `components/WordCard.tsx:17, 39` — 翻转卡背面按钮折叠态可被 Tab 聚焦**
`.face.back` 仅 `backface-visibility:hidden` 视觉隐藏，内部"返回"按钮在折叠态仍可被键盘 Tab 并会被屏幕阅读器朗读（WCAG 2.4.3）。建议翻转时管理焦点：
```tsx
<button className="btn sm ghost flipbtn" tabIndex={open ? 0 : -1} onClick={()=>setOpen(false)}>返回</button>
// 进阶：未 open 时给背面容器加 inert（现代浏览器）
```

**12. `components/ChallengePanel.tsx:45-47` — 进度条缺 progressbar 语义**
`.lvl-bar > i` 视觉进度条无 `role="progressbar"`、`aria-valuenow/min/max`，屏幕阅读器无法感知进度（WCAG 1.1.1/4.1.2）。
```tsx
<div className="lvl-bar" role="progressbar" aria-valuenow={Math.round(ni.pct)}
  aria-valuemin={0} aria-valuemax={100} aria-label="距下一关进度">
  <i style={{ width: ni.pct + "%" }} />
</div>
```

**13. `components/Icons.tsx`（全部）— 装饰图标建议 `aria-hidden`**
Logo、Star、Trophy 等纯装饰 SVG 未标 `aria-hidden`，部分屏读会朗读无意义路径（WCAG 1.1.1）。父级有文字/aria-label 时，给 svg 加 `aria-hidden="true"`。

**14. `app/globals.css:91, 767` — `color-mix()` 缺回退**
`color-mix(in srgb, …)` 在 Safari<16.2 / Firefox<113 不支持，会降级为透明背景导致头部/底栏透底（WCAG 1.4.3 间接影响）。建议先写纯色回退再覆盖：
```css
background: var(--bg-soft);                 /* 回退 */
background: color-mix(in srgb, var(--bg-soft) 88%, transparent);
```

**15. `app/globals.css:143-155, 773-785` — 触摸目标略小于 44px**
`.iconbtn` 为 40×40，底部导航按钮 `padding:8px 4px` 字号 11px，实际可点高度可能 < 44px（WCAG 2.5.5 Target Size，AAA 级；移动端强烈建议 ≥44px）。建议 iconbtn 提到 44×44、底栏按钮增加纵向 padding。

**附加建议 A. `app/page.tsx:233, 388` — Toast 缺状态播报**
`.toast` 出现 1.6s 自动消失且无 `role="status"`/`aria-live`，屏幕阅读器用户收不到"已加分/导入成功"等反馈（WCAG 4.1.3 Status Messages）。
```tsx
<div className="toast" role="status" aria-live="polite">{toast}</div>
```

**附加建议 B. `app/globals.css` 动效 — 缺 `prefers-reduced-motion`**
`flip 0.5s`、`.drawer` slidein、进度条过渡未对 `prefers-reduced-motion: reduce` 关闭（WCAG 2.3.3 Animation from Interactions，属 AAA；建议增加以照顾前庭敏感用户）。
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## 三、已合规项（亮点）

- `app/layout.tsx:24` `<html lang="zh-CN">` 正确声明语言；`viewport` 含 `device-width`/`viewportFit:cover`，响应式友好。
- `app/layout.tsx:29-45` GA 用 `next/script` `afterInteractive`，不阻塞首屏。
- `components/TodayPanel.tsx:37` 勾选按钮带 `aria-label="完成"`，可访问名称正确。
- `app/globals.css` 设计 Token 系统化（明暗双主题 CSS 变量），`.btn/.tabs button/.opt` 均设 `min-height:44px`，主操作触摸目标达标。
- `app/globals.css:750-795` 存在 760px 断点，移动端切换到底部导航，响应式骨架合理。
- `components/WordCard.tsx:8-15` 朗读功能（`speechSynthesis`）为视障用户提供单词发音，体验加分。

---

## 四、修复优先级

1. **立即修**：#1（FormationPractice 键盘）、#2（GroupSelector 无效 HTML）—— 否则键盘/辅助技术用户核心路径受阻。
2. **尽快修**：#3 Tabs ARIA、#4 Drawer dialog、#5 label 关联、#6 main 地标、#7 aria-label。
3. **体验增强**：#8–#15 及附加 A/B 对比度与动效兜底。
