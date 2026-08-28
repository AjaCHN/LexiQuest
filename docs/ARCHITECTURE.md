# 架构与数据流 · 英语闯关台 LexiQuest

> 本文描述 LexiQuest（仓库 `lexiquest`）的整体架构、目录结构、组件关系与核心数据流，供开发与维护参考。

## 1. 技术栈

| 维度 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js 16.3.3（App Router，Turbopack） | 单页应用，主路由 `/`，客户端渲染为主 |
| 语言 | TypeScript 5.5.4 | 全量类型约束 |
| 运行时 | Node 20（构建）/ Edge Runtime（同步接口，Next 16 已标记弃用） | `app/api/sync` 走 Edge Runtime |
| 样式 | 纯 CSS（`app/globals.css`，812 行） | 零外部依赖、零 UI 框架，内联 SVG 图标 |
| 存储 | 浏览器 `localStorage`（离线优先） | 无后端时全部数据存本地 |
| 云端同步 | 腾讯云 EdgeOne Pages + Edge KV | 变量名 `my_kv`，无需登录 |
| 语音 | Web Speech API（`speechSynthesis`） | 单词朗读，不支持时静默降级 |

**设计原则**：离线优先（Offline-first）、零外部 CDN、单仓库纯前端。未绑定 KV 时自动降级为「本地模式」，所有功能正常，仅云端同步不可用。

## 2. 目录结构

```
app/
  layout.tsx          # 根布局、元信息（标题/描述）、移动端 viewport
  page.tsx            # 主页面编排（"use client"，376 行）
  globals.css         # 全部样式（CSS 变量、深浅色、响应式、动画）
  api/sync/route.ts   # 云端同步接口（Edge Runtime，读写 Edge KV）
components/
  GroupSelector.tsx   # 三档年龄段选择卡片
  TodayPanel.tsx      # "今天要处理"（done/total、逾期标红）
  WordCard.tsx        # 单词翻转记忆卡（正面释义 / 背面词素拆分 + 朗读）
  FormationPractice.tsx # 组词练习（多选、提交、解析）
  ChallengePanel.tsx  # 闯关积分看板（积分/段位/连续天数）
  SettingsDrawer.tsx  # 设置抽屉（主题/同步码/备份/清空）
  Icons.tsx           # 内联 SVG 图标集合（29 个 export）
lib/
  types.ts            # 数据类型 + GROUP_META 人群元信息
  words.ts            # 三档词库 WORDS + 组词题库 FORMATIONS
  storage.ts          # 本地存储/每日计划/积分/导出导入/云端拉推
docs/                 # 本文档集
```

## 3. 渲染模型

- `app/layout.tsx` 为服务端组件，仅注入 `<html>/<body>` 与 `metadata`/`viewport`。
- `app/page.tsx` 顶部 `"use client"`，是唯一的客户端根组件，承载全部交互状态（`progress` / `plan` / `theme` / `activeTab` / `syncState` / `toast`）。
- 构建产物：`/` 为静态预渲染，`/api/sync` 为 Edge 动态路由（见 `route.ts` 的 `export const runtime = "edge"`）。

## 4. 组件树

```
<Page> (client root)
├─ 头部 hd：Logo + 标题「英语闯关台」+ 当前人群 + 积分 + 连续 + 主题/设置按钮
├─ <GroupSelector>            （未选人群时显示）
├─ <TodayPanel plan wordMap onToggle>
├─ 标签页 tabs：每日单词 / 组词练习 / 闯关积分
│   ├─ words   → <WordCard> 网格
│   ├─ formation → <FormationPractice>
│   └─ challenge → <ChallengePanel> + 全部词库
├─ <SettingsDrawer>          （抽屉）
└─ 底部导航 bottomnav（移动端）
```

## 5. 核心数据流

### 5.1 启动与人群选择
1. 挂载 `useEffect` → 读取 `localStorage` 当前人群（`loadCurrentGroup`）。
2. 有则 `loadProgress` → 无则 `seedSample(createProgress(g))`（写入一条昨日逾期示例）。
3. `ensureToday(progress)` 生成今日计划 `DayPlan`（含 `overdue`）。
4. `saveProgress` 落盘，设置 `progress` / `plan`。
5. 若已开启云端同步且填了同步码 → `initialSync` 拉取并合并。

### 5.2 完成一个每日单词
`handleToggleWord(id)`
→ `toggleWord(progress, id)` 计算积分（±10）、更新 `history`、连续天数 `streak`、段位 `level`
→ `ensureToday` 重建 `plan`
→ `saveProgress` + `setState`
→ `syncPush` 推送到云端（若开启）

### 5.3 组词练习
`FormationPractice` 本地多选 → 提交比对 `answers` 索引 → 全对且未完成过 → `onComplete(id)`
→ `completeFormation(progress, id)`（积分 +20，记入 `formationDone`）
→ 落盘 + 推送。

### 5.4 云端同步（Edge KV）
- **拉取** `GET /api/sync?code=<code>` → `pullCloud`。服务端有 KV 且 code 有效返回 `{mode:"cloud", data}`；无 KV 返回 `{mode:"local"}`；异常返回 `{mode:"offline"}`。
- **推送** `POST /api/sync?code=<code>` body `{code, data}` → `pushCloud`。
- 冲突策略：当前为 **last-write-wins**（`updatedAt` 较大者覆盖）。详见 [DATA_MODEL.md §6](./DATA_MODEL.md) 与 [REVIEW.md](../REVIEW.md) 的 [S2]。

## 6. 状态同步要点

- 所有写操作都走 `saveProgress(p)`（写入 `wb_english_progress_<group>`），再 `setState`，保证 UI 与存储一致。
- 三个年龄段进度**互相独立**，各自一套 `UserProgress`，切换人群通过 `wb_english_group` 记忆。
- 主题、同步码、云开关、uid 各自独立 key（详见 [DATA_MODEL.md §3](./DATA_MODEL.md)）。

## 7. 降级与边界

| 场景 | 行为 |
|------|------|
| 未绑定 Edge KV | `/api/sync` 返回 `{mode:"local"}`，前端显示「本地模式」，功能全可用 |
| 网络失败 | `pullCloud/pushCloud` catch → `mode:"offline"`，不影响本地 |
| 不支持语音 | `speechSynthesis` 不存在 → 点击朗读无效但不报错 |
| 导入非法文件 | `importJSON` 抛错 → toast「文件格式不正确」 |
| 词库为空 | 今日无词、组词显示「敬请期待」，无崩溃 |

> 已知问题（沙箱预览、同步鉴权、streak 回退等）见 [REVIEW.md](../REVIEW.md) 与 [README.md](../README.md#已知问题与路线图)。
