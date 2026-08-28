# 英语闯关台 LexiQuest 开发任务清单

> 项目 slug：`lexiquest`｜规格见 [../site-setup.md](../site-setup.md)｜审查见 `../../REVIEW.md`
> 任务粒度：单个开发者 30–60 分钟可完成，附验收标准。优先级 P0 > P1 > P2。

## 规格摘要
- **原始需求**：三档年龄段、每日单词（含逾期顺延）、拆分记忆卡、组词练习、闯关积分、云端同步、数据备份、响应式深色模式。
- **技术栈**：Next.js 14（App Router + TS）、纯 CSS、EdgeOne Pages + Edge KV（`my_kv`）、Web Speech API。
- **目标**：本地零配置可运行；部署后无登录跨设备同步。

## 开发任务

### [ ] T1 · 加 `allowedDevOrigins`（P0，修复 S1）
**描述**：在 `next.config.mjs` 增加 `allowedDevOrigins: ["127.0.0.1"]`，使沙箱 `127.0.0.1` 预览下 HMR 正常、按钮可点击。
**验收**：在 127.0.0.1 访问 dev server，点击切换人群/完成单词均生效，无 hydration 报错。
**参考**：REVIEW.md [S1]。

### [ ] T2 · 修正同步接口无 code 的返回语义（P0，修复 S3）
**描述**：`app/api/sync/route.ts` GET 无 `code` 时返回 `{ mode:"local" }` 而非 `cloud`，与未绑 KV 降级语义一致。
**验收**：`GET /api/sync`（无 code、有 KV）返回 `mode:"local"`；前端 `pullCloud` 据此正确进入本地分支。
**参考**：REVIEW.md [S3]。

### [ ] T3 · 加固云端同步鉴权与合并（P1，修复 S2）
**描述**：服务端对 `code` 做格式校验（`^[A-Za-z0-9]{8,}$`）；写入叠加随机 `uid`/签名防任意覆盖；冲突时合并 `history`/`formationDone` 集合而非整条覆盖。
**验收**：弱码被拒；两设备并发学习后进度不丢（集合并集）；非法 code 不读写他人数据。
**参考**：REVIEW.md [S2]、docs/DEPLOYMENT.md §6。

### [ ] T4 · 导入文件校验 group 合法性（P1，修复 M2）
**描述**：`lib/storage.ts` `importJSON` 增加 `if (!["children","teen","adult"].includes(p.group)) throw`。
**验收**：导入非法 group 文件 → toast「文件格式不正确」，且当前进度不被破坏。
**参考**：REVIEW.md [M2]。

### [ ] T5 · 复用进度清除函数（P2，修复 M3）
**描述**：在 `storage.ts` 导出 `clearProgress(group)`（含云端清除钩子），`page.tsx` `handleClear` 复用，移除硬编码 `wb_english_progress_` 前缀。
**验收**：清空本机 +（若开启）云端数据一致；改前缀不遗漏。
**参考**：REVIEW.md [M3]。

### [ ] T6 · 取消完成词时回退 streak（P2，修复 M1）
**描述**：`toggleWord` 取消且当日 `doneWordIds` 变空、`lastActive===today` 时，回退 streak 与 lastActive（需记录前一日 streak）。
**验收**：连续 3 天后取消当日最后完成词，streak 正确回到 2 而非虚高 3。
**参考**：REVIEW.md [M1]。

### [ ] T7 · 逾期词排布策略（P2，修复 M4）
**描述**：长期断签时，逾期词优先排末尾或限制每日逾期数量，保证出现一定比例新词。
**验收**：连续断签 5 天后打开，今日列表仍含新词而非全为逾期旧词。
**参考**：REVIEW.md [M4]。

### [ ] T8 · 词库扩充（P2，功能增强）
**描述**：按 `docs/WORD_BANK.md` 将每档单词从 10 扩充到 20–30，组词每档 2→4 题。
**验收**：三档 `wordsByGroup` 非空；`npm run build` 通过；轮转取词均匀。
**参考**：docs/WORD_BANK.md。

### [ ] T9 · 补充关键算法注释（P2，可维护性，L2）
**描述**：为 `ensureToday`（顺延）、`toggleWord`（积分/streak）、`completeFormation` 补 1–2 行意图说明。
**验收**：`npm run build` 通过；核心分支均有中文意图注释。

### [ ] T10 · 升级 Next.js 到 16.x（P3，L1）
**描述**：升级 Next 14.2.5 → 16.x，跟随 EdgeOne 适配器，回归全功能。
**验收**：`npm run build` + 本地/线上冒烟全部通过；`/api/sync` 在 Edge 仍可读写 KV。
**参考**：REVIEW.md [L1]。

## 质量红线
- [ ] 所有写操作经 `saveProgress` 落 localStorage 后再 `setState`。
- [ ] 组件文件 PascalCase，纯 CSS / 内联 SVG，零外部 CDN。
- [ ] 不写 `npm run dev &` 之类后台命令；假设开发服务器已在运行。
- [ ] 移动端响应式 + 深色模式必须可用。
- [ ] 部署后实测 KV 注入（`globalThis.my_kv`），不假设本地降级以外的行为。

## 备注
- T1–T2 为「立即修复」，建议一次性改完并重新构建验证。
- T3–T4 为「上线前加固」，公开部署前必须完成。
- T5–T7、T9 为后续优化，T8/T10 视资源排期。
- 完整审查结论与严重度见 `../../REVIEW.md`。
