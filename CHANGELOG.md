# Changelog · 英语闯关台 LexiQuest

遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/) 约定，版本号语义采用近似 `MAJOR.MINOR.PATCH`。

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
