# Changelog · 英语闯关台 LexiQuest

遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/) 约定，版本号语义采用近似 `MAJOR.MINOR.PATCH`。

## [Unreleased]

### 清理（冗余移除）
- 删除 `review_results.json`（107KB 静态分析脚本中间产物，无代码引用，已从 git 跟踪移除）。
- 删除 `REVIEW-2026-08-28.md`：与 `REVIEW.md` §七 修复闭环结论重复的带日期审查副本。
- 删除本地构建/安装日志冗余（`build_log.txt` / `build2_log.txt` / `lockonly_log.txt` / `npm_install_log.txt`，均已被 `.gitignore` 忽略）。

## [2.0.7] - 2026-08-29

### 修复（应用与原型文案对齐）
- `app/page.tsx` 今日单词标题补充「（悬停词素看释义）」，与原型高保真主原型一致。
- `components/SettingsDrawer.tsx` 云端同步状态文案 `同步中` → `同步中…`（省略号），对齐原型。
- `prototype/prototype.html` 移动端 header 副标题统一为「多年龄段英语学习工作台」，消除与原型桌面端/应用文案的不一致。
- 注：等级系统（LEVELS 名称与阈值）已于 v2.0.5 原型整改中与应用 `lib/storage.ts` 对齐，本次为残余文案收口。

## [2.0.5] - 2026-08-29

### 修复（原型审查整改）
- **P0 交互状态丢失**：重构 `prototype.html` 事件绑定，翻转卡、今日勾选、组词提交、设置抽屉改为局部 DOM 更新（新增 `renderTab`/`openDrawer`/`bindLocal`/`updatePoints`），不再整页 `render()`，跨操作保留翻卡与积分状态。
- **P1 令牌漂移**：`tokens.css` 暗色模式新增与 `app/globals.css` 一致的真实阴影（`--shadow/--shadow-lg` 改为 `rgba(0,0,0,.35/.5)`）；删除未使用的死代码 `--c-ch/--c-tn/--c-ad`。
- **P1 死代码清理**：移除 `prototype.html` 中未使用的 `PART_COLOR`、`COMPONENT_MAP`/`MAP` 常量。
- **P2 可访问性**：翻转卡加 `role="button" aria-pressed tabindex`（支持键盘翻转）；组词选项加 `role="checkbox" aria-checked`；设置抽屉加 `role="dialog" aria-modal` + Esc 关闭 + 焦点陷阱；图标按钮补 `aria-label`；tablist/tab/tabpanel 语义补全。
- **P3 映射统一**：`prototype.html` 各区块写入 `data-component` 指向 `app/components/*`；`wireframes.html`/`flows.html` 补「对应组件见 index.html 映射表」说明，并修正两文件残留的 `v2.0.2` 标题为 v2.0.5。
- 五份原型标题统一同步至 v2.0.5。

## [2.0.4] - 2026-08-29

### 改进（原型完善）
- 抽取共享设计令牌 `prototype/tokens.css`（与 `app/globals.css` 对齐），4 份原型 HTML 改为 `<link>` 引入，消除各文件内联令牌重复与漂移风险。
- 新增 `prototype/index.html` 原型门户：统一导航 + 原型区块到真实组件（app/components/*）的映射表，作为原型体系入口。
- `prototype.html` 增强：词素元素加悬停释义（title）、积分/连续打卡数字滚动动画、今日全部完成时的真实空状态、`prefers-reduced-motion` 动效降级，并标注各区块对应实现组件。
- 四份原型标题统一同步至 v2.0.4。

## [2.0.3] - 2026-08-29

### 新增（原型设计体系）
- 新增 `prototype.html`：高保真可交互主原型，含人群选择、每日单词翻转卡（词素着色 + 朗读）、组词练习（多选即时反馈）、闯关积分看板、设置抽屉与深色模式，使用 `lib/words.ts` 真实词库节选数据。
- 新增 `wireframes.html`：组件库规范，覆盖基础组件（按钮/输入框/开关等）、复合组件（表单/卡片/抽屉等）、业务组件（人群卡/翻转卡/组词题/段位看板等）及使用规则。
- 新增 `style-guide.html`：视觉设计系统，定义配色、词素语义色、字体排印、间距圆角、阴影层级与暗色主题。
- 新增 `flows.html`：关键用户流程原型，含首次上手、每日单词学习、组词练习、闯关积分、云端同步五条主链路及分支/异常态。
- 四份原型与代码库 `app/globals.css` 设计令牌保持一致，便于后续实现对齐。

### 修复（构建与依赖对齐）
- **构建失败修复**：`.gitignore` 补充忽略 `.codebuddy/`（项目本地记忆目录），避免 EdgeOne 构建沙箱因克隆仓库缺失该目录、Next 16 Turbopack `stat('.codebuddy')` 触发 ENOENT 导致 `next build` 失败。

### 修复（文档与依赖对齐）
- **依赖版本对齐**：`package.json` 的 `next` / `react` / `react-dom` 由 `^15.5.0` / `^19.0.0` 修正为与 `package-lock.json` 一致的 `14.2.5` / `18.3.1`（精确定位，避免与锁文件漂移、保证可复现安装）。
- **锁文件命名对齐**：`package-lock.json` 的 `name` 由旧名 `english-learning-workbench` 改为 `lexiquest`，与 `package.json` 一致。
- **文档笔误修正**：`docs/WORD_BANK.md` 词库规模由「每档 10 词 + 6 组组词」修正为「每档 10 词 + 2 组组词」（共 30 词 / 6 题）。
- 全文档集（README / ARCHITECTURE / DATA_MODEL / DEPLOYMENT / WORD_BANK / CONTRIBUTING / overview / ai/memory-bank）技术栈口径统一为 Next.js 14.2.5 + React 18.3.1。

## [2.0.2] - 2026-08-28

### 新增（集成 Google Analytics 4）
- 在 `app/layout.tsx` 通过 `next/script` 的 `Script` 组件注入 GA4（衡量 ID `G-W806DBME5G`），采用 `afterInteractive` 策略，不阻塞首屏渲染。
- 使用官方推荐的双段方案：先内联 `gtag` 配置（`#ga-init`），再异步加载 `gtag.js`（`#ga-loader`），数据层自动缓冲重放。
- 不引入 `@next/third-parties` 等额外依赖，保持项目零 npm 依赖原则；脚本带语义化 `id` 便于调试与屏蔽。
- `overview.md` 功能段补充 GA4 说明，保持文档与代码一致。

## [2.0.1] - 2026-08-28

### 重构（KV 访问抽象化，应对 Edge Runtime 弃用）
- 新增 `lib/kv.ts`：集中封装 Edge Runtime 的 KV 绑定读取（`getKvBinding`）、可选同步密钥读取（`getSyncSecret`）与 `KV` 类型。
- `app/api/sync/route.ts` 移除内联的 `globalThis.my_kv` / `SYNC_SECRET` 裸访问与重复类型定义，改为从 `lib/kv` 导入，降低同步逻辑的运行时耦合。
- 在 `runtime = "edge"` 处补充注释：说明 Next 16 已弃用 Edge Runtime，但 EdgeOne Makers 当前仅在 edge runtime 注入 KV 绑定，故保留 edge；未来平台在 nodejs 提供 KV 时仅需改 `lib/kv.ts` 实现，调用方无需改动（单一迁移点）。
- 验证：`tsc --noEmit` 通过；业务逻辑（合并、校验、降级）未变更。

## [2.0.0] - 2026-08-28

### 升级（破坏性框架升级）
- **Next.js 14.2.5 → 16.3.3** + **React 18.3.1 → 19.2.0** + **react-dom 19.2.0**（`@types/react` / `@types/react-dom` 同步至 19.2.0）。
- **破坏性变更适配**：
  - `components/GroupSelector.tsx`：全局 `JSX.Element` 命名空间在 React 19 类型中已移除，改为导入 `ReactElement`。
  - `tsconfig.json`：Next 16 构建时自动将 `jsx` 设为 `react-jsx`、新增 `.next/dev/types` include（保留框架维护项）。
- **构建验证通过**：`tsc --noEmit` + `next build`（Turbopack）均成功。`/api/sync` 仍识别为动态路由。
- **已知债务（非阻塞）**：Next 16 已将 **Edge Runtime 标记为弃用**（构建告警），`app/api/sync` 的 `runtime='edge'` + `globalThis.my_kv` 当前仍可运行，后续需评估迁移到 nodejs runtime 或 EdgeOne 替代 KV 方案。
- **同步更新技术栈口径**：README / overview / ARCHITECTURE / REVIEW 由 Next.js 14 更新为 16。

## [1.0.1] - 2026-08-28

### 完善（UI 可访问性与测试定位）
- **补充语义化 `id`**：为所有主要 UI 容器添加语义化 `id`（`#lexiquest-app`、`#app-header`、`#main-tabs`、`#word-card-{id}`、`#today-panel`、`#settings-drawer[-overlay]`、`#formation-quiz-{id}`、`#challenge-stat-row`、`#challenge-progress-card`、`#group-selector-grid`），便于调试、e2e 选择器与无障碍锚点。
- **REVIEW.md 修复状态对齐**：复核确认原报告 [S1]–[S3]、[M1]–[M4] 均已在代码中实现（附代码佐证），新增 §七 修复状态表与 [S4] 语义化 id 完善记录。

## [1.0.0] - 2026-08-28

### 新增（初版交付）
- **三档年龄段**：儿童启蒙（6-12）/ 青少年学生（13-22）/ 成人进阶（22+），各自独立词库与难度。
- **每日单词**：每天自动安排若干单词，昨日未完成的自动顺延到今天并标红「逾期·昨天没做完」。
- **拆分记忆卡**：点击卡片翻面，颜色区分词素（前缀蓝 / 词根绿 / 后缀粉 / 基础词紫），附例句与朗读（Web Speech API）。
- **组词练习**：同一词根/基础词多选组词，提交后显示解析，答对 +20 分。
- **闯关积分**：完成单词 +10、组词 +20、连续打卡累计；6 级段位看板与晋级进度。
- **云端同步**：各设备填同一个「同步码」即可跨设备共享进度（Edge KV，无需登录）。
- **数据安全**：localStorage 离线可用 + JSON 导出/导入 + 清空二次确认。
- **响应式 + 深色模式**：PC 多列、手机单列 + 底部 Tab，可「添加到主屏幕」当 App。
- **零依赖样式**：全部样式内联、图标为内联 SVG，不引用任何外部 CDN / 框架 / 字体。

### 文档
- `README.md` 功能说明 + 本地运行 + EdgeOne 部署 + KV 绑定。
- `docs/ARCHITECTURE.md`、`docs/DATA_MODEL.md`、`docs/DEPLOYMENT.md`、`docs/WORD_BANK.md`。
- `REVIEW.md` 代码审查报告（综合健康度 B+）。

### 已知问题（详见 REVIEW.md）
- [S1] `next.config.mjs` 缺 `allowedDevOrigins: ["127.0.0.1"]`，沙箱预览点击失效。
- [S2] 云端同步接口无鉴权、同步码无校验、多设备并发 last-write-wins 可能丢进度。
- [S3] `GET /api/sync` 无 code 时返回 `mode:"cloud"` 语义混乱（应为 `local`）。
- [M1] 取消已完成单词时连续天数（streak）不回退。
- [M2] 导入文件未校验 `group` 合法性。
- [M3] 清空逻辑硬编码 key，与 `storage.ts` 重复。
- [M4] 长期断签后今日列表可能被逾期词占满。

---

## 版本说明
- `[1.0.0]` 初版功能完整，可本地运行与构建；云端同步需按 `docs/DEPLOYMENT.md` 在 EdgeOne 控制台绑定 KV 后生效。
- 后续版本规划见 `README.md` 的「已知问题与路线图」。
