# 英语闯关台 LexiQuest · 多年龄段英语学习工作台 — 交付概览

> 仓库 `lexiquest`｜命名：中文「英语闯关台」/ 英文 **LexiQuest** / slug `lexiquest`

基于 **Next.js 16（App Router + TypeScript）** 构建，部署到 **腾讯云 EdgeOne Pages**，数据通过 **Edge KV** 实现多设备云端同步。

## 已实现功能
- **三档年龄段**：儿童启蒙 / 青少年学生 / 成人进阶，各自独立词库与难度（各 10 词，含 前缀/词根/后缀/基础词 拆分 + 含义提示；每档 2 组组词练习）。
- **每日单词**：每天自动安排若干单词，昨天未完成的自动顺延到今天并标红「逾期·昨天没做完」。
- **拆分记忆卡**：点击卡片翻面，颜色区分词素（前缀蓝 / 词根绿 / 后缀粉 / 基础词紫），附例句与朗读。
- **组词练习**：同一词根/基础词多选组词，提交后显示解析，答对 +20 分。
- **闯关积分**：完成单词 +10、组词 +20、连续打卡累计；6 级段位看板与晋级进度。
- **云端同步**：各设备填同一个「同步码」即可跨设备共享进度（Edge KV，无需登录）；未绑 KV 自动降级本地模式。
- **数据安全**：localStorage 离线可用 + JSON 导出/导入 + 清空二次确认。
- **响应式 + 深色模式**：PC 多列、手机单列 + 底部 Tab，可「添加到主屏幕」当 App。

## 关键文件
- `app/page.tsx` — 主页编排（人群选择 / 今天要处理 / 三模块 / 设置）
- `app/api/sync/route.ts` — 云端同步接口（读写 Edge KV）
- `lib/words.ts` — 三档词库 + 组词题库
- `lib/storage.ts` — 本地存储 / 每日计划 / 积分等级 / 导出导入 / 云端拉推
- `lib/types.ts` — 数据类型与人群元信息
- `components/*` — 图标 / 拆分卡 / 组词 / 闯关 / 今日 / 设置
- `docs/*` — 架构 / 数据模型 / 部署 / 词库扩展文档
- `README.md` — 本地运行 + EdgeOne 部署 + KV 绑定 + 文档导航
- `REVIEW.md` — 代码审查报告与已知问题
- `ai/memory-bank/` — PM 规格（`site-setup.md`）+ 开发任务清单（`tasks/lexiquest-tasklist.md`）

## 验证结果
- `npm install` 成功（28 包；darwin swc 清理告警可忽略）。
- `npm run build` 通过，类型检查无误；路由 `/` 静态、`/api/sync` edge 动态。
- `next start` 返回 HTTP 200，SSR 首屏直接渲染年龄段选择器（无白屏）；`/api/sync` 本地返回 `{"mode":"local"}`。

## 文档交付清单
- `README.md`（含文档导航、已知问题与路线图）
- `docs/ARCHITECTURE.md`、`docs/DATA_MODEL.md`、`docs/DEPLOYMENT.md`、`docs/WORD_BANK.md`
- `CHANGELOG.md`（v1.0.0）、`CONTRIBUTING.md`
- `REVIEW.md`（既有，综合健康度 B+）
- `ai/memory-bank/site-setup.md`、`ai/memory-bank/tasks/lexiquest-tasklist.md`

## 部署说明（需用户在 EdgeOne 控制台操作）
1. 构建：`npm run build`；部署用 Git 导入或 `edgeone pages deploy`。
2. 云端同步：控制台开通 KV → 建命名空间 → 绑定到项目，变量名填 **`my_kv`**（与 route.ts 一致）。
3. 应用中：设置 → 开启云端同步 → 设同步码；多设备填同一同步码即共享。

> 本环境无 EdgeOne 登录凭据，未实际推送上线；代码与文档已就绪，按 `docs/DEPLOYMENT.md` 即可一键部署。
> 上线前建议处理 `REVIEW.md` 的 [S1]–[S3]（沙箱预览、同步鉴权、接口语义），详见 `README.md` 路线图。
