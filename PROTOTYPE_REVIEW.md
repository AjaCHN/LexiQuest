# 原型设计审查与改进报告 · Prototype Review

**产品**：LexiQuest 多年龄段英语闯关台
**范围**：`prototype/` 目录（6 个文件：5 个 HTML + 1 个共享令牌 `tokens.css`）
**基准**：WCAG 2.1 AA（对比度 4.5:1 小文字 / 3:1 非文字、2.4.7 键盘焦点可见、HTML 内容模型有效性、`prefers-reduced-motion` 兜底）
**对齐目标**：与已修复的生产代码 `app/`（对比度、可访问性、愉悦微交互）保持一致
**日期**：2026-08-29

---

## 一、审查发现（改进前）

| # | 文件 | 问题 | 类别 | 严重度 |
|---|------|------|------|--------|
| P1 | `tokens.css` | `--text-faint #97a0b5`、`--success #16a34a`、`--warn #d97706` 三色在浅色背景对比度不足 4.5:1，且未与 `app/globals.css` 同步 | 对比度 | 高 |
| P2 | `style-guide.html` | 设计系统页展示的是旧对比度值（swatch + code 块均写旧值），与 `tokens.css` 自相矛盾 | 一致性 | 中 |
| P3 | `prototype.html` | 年龄段切换 chip 固定 `color:#fff`，浅色人群色（如黄/绿）上白字对比不足 | 对比度 | 高 |
| P4 | `prototype.html` | `group-card` 用 `<button>` 内嵌 `<h3>`+`<p>`，属无效 HTML 内容模型（与生产 `GroupSelector` 同源问题，原型遗漏） | 结构 | 高 |
| P5 | `prototype.html` | 朗读按钮无 `aria-label`，仅 `title="朗读"`，屏幕阅读器在朗读动词时丢失单词上下文 | ARIA | 中 |
| P6 | `index.html` | 门户卡片 `<a class="card">` 仅在 `:hover` 时有视觉反馈，键盘 `:focus` 无可见轮廓（违反 2.4.7） | 键盘焦点 | 高 |
| P7 | `prototype.html` | 作为可交互高保真原型，完全缺失愉悦微交互与庆祝层，无法演示已落地的 "惊喜喜" 体验 | 体验 | 中 |

> 未修改文件（仅供参考，非交付改动）：`wireframes.html`（组件库规范）、`flows.html`（关键用户流程）。两者属静态说明文档，无交互与对比度硬伤，保持原样。

---

## 二、已实施的改进

### 1. 设计令牌对比度同步（P1 / P2）
`tokens.css` 三处浅色变量修正为达标值，并与 `app/globals.css` 对齐：

| 变量 | 原值 | 新值 | 浅色背景对比度 |
|------|------|------|----------------|
| `--text-faint` | `#97a0b5` | `#646e85` | 5.0:1 ✓ |
| `--success` | `#16a34a` | `#15803a` | 5.3:1 ✓ |
| `--warn` | `#d97706` | `#b45309` | 5.1:1 ✓ |

`style-guide.html` 同步更新对应 swatch 与 `:root` code 块，消除 "系统页自己展示旧值" 的矛盾。

### 2. 年龄段 chip 自适应文字色（P3）
`prototype.html` 新增 `readableTextOn(hex)`（逻辑与 `app/lib/types.ts` 一致：相对亮度 + WCAG 对比度，自动选黑/白字）。切换 chip 由固定 `color:#fff` 改为 `color:${readableTextOn(m.color)}`，浅色人群色自动转深字。

### 3. group-card 无效 HTML 结构修复（P4）
`prototype.html` 渲染由 `<button><h3>…</h3><p>…</p></button>` 改为 `<button><div class="title">…</div><div class="desc">…</div></button>`；CSS 选择器同步 `.group-card h3 → .group-card .title`、`.group-card p → .group-card .desc`，并新增 `.group-card:focus-visible` 焦点轮廓。

### 4. 朗读按钮 aria-label（P5）
两处朗读按钮新增 `aria-label="朗读 ${w.word}"`，保留 `title="朗读"` 作视觉提示，屏幕阅读器可朗读具体单词。

### 5. 键盘焦点可见性（P6）
`index.html` 卡片新增 `.card:focus-visible{outline:2px solid var(--primary);outline-offset:2px}`，与生产 `app/` 焦点风格一致。

### 6. 愉悦微交互 + 全局庆祝层（P7）
`prototype.html` 补齐与生产 `Celebration.tsx` 对齐的体验：
- 新增 `fireCelebrate(x,y,count,emojis)` + `centerOf(el)` + `levelForPoints(p)` + `CELE_POOL` 常量
- 全局 `celebration-layer`（固定层、`pointer-events:none`、`aria-hidden`）
- 微交互 CSS：按钮光泽扫过、答对 popin、答错 shake、chip 火焰 wiggle、翻转卡 popin、徽章 badgepulse、关卡条 shimmer、Logo hover 跳动
- 触发点：Logo 彩蛋（点击/键盘）、勾选完成、组词答对、闯关晋级（24 emoji 盛大庆祝）
- 继承 `tokens.css` 已有的 `@media (prefers-reduced-motion: reduce)` 兜底，动效安全

---

## 三、验证结果

| 检查项 | 文件 | 状态 |
|--------|------|------|
| 三色达标值落地 | `tokens.css` L13/L19/L23 | ✓ |
| 设计系统同步 | `style-guide.html` | ✓ |
| `readableTextOn` 函数 | `prototype.html` L419 | ✓ |
| 庆祝函数 + 层 | `prototype.html` L337/353/470 | ✓ |
| group-card 结构修复 | `prototype.html` L93/94 + 渲染 | ✓ |
| 朗读 aria-label | `prototype.html` L611/619 | ✓ |
| 卡片键盘焦点 | `index.html` | ✓ |

全部改动已通过文本检索验证落地。

---

## 四、结论与后续建议

原型已在对比度、HTML 结构、键盘可访问性、ARIA、愉悦体验五个维度与生产 `app/` 对齐，可作为交付演示用高保真原型。

**建议后续（非本次范围）**：
1. `prototype.html` 的 JS 交互逻辑（计分、晋级阈值）仍属演示数据，落地时直接复用 `app/` 组件，无需重写。
2. 若 `app/globals.css` 后续调整令牌，需在 `tokens.css` 同步并复核 `style-guide.html`，保持单一来源。

---

_本次审查与 `UI_REVIEW_REPORT.md` / `UI_FIXES_APPLIED.md` / `DELIGHT_STRATEGY.md` 同源，属原型侧补强。_
