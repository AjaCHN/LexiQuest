# 贡献指南 · 英语闯关台 LexiQuest

感谢你关注 LexiQuest（仓库 `lexiquest`）！本文说明本地运行、目录约定与如何参与贡献。

## 1. 本地运行

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 生产构建 + 类型检查
npm run start    # 本地起生产服务（需先 build）
```

> 未绑定 Edge KV 时应用自动运行在「本地模式」，功能全部可用，仅云端同步不可用。

## 2. 目录与约定

| 位置 | 职责 |
|------|------|
| `app/page.tsx` | 唯一客户端根组件，承载全部交互状态 |
| `app/api/sync/route.ts` | 云端同步接口（Edge Runtime，KV 变量名 `my_kv`） |
| `components/*` | 展示组件，**React 组件文件用 PascalCase**（如 `WordCard.tsx`，符合 Next 官方约定） |
| `lib/types.ts` | 类型与人群元信息（`GROUP_META`） |
| `lib/words.ts` | 词库 + 组词题库（扩展见 [docs/WORD_BANK.md](./docs/WORD_BANK.md)） |
| `lib/storage.ts` | 本地存储 / 每日计划 / 积分 / 同步 |
| `app/globals.css` | 全部样式（CSS 变量、深浅色、响应式） |
| `docs/` | 架构 / 数据模型 / 部署 / 词库扩展文档 |

## 3. 开发规范

- **类型优先**：新增数据类型先改 `lib/types.ts`，再使用。
- **零外部依赖**：样式与图标不引入 CDN / UI 框架；需要新图标加到 `components/Icons.tsx`（内联 SVG）。
- **离线优先**：任何写操作都经 `saveProgress` 落 `localStorage`，再更新 state。
- **命名**：组件 PascalCase；词库 id 见 `docs/WORD_BANK.md` 前缀约定（ch-/tn-/ad-）。

## 4. 扩展词库

按 [docs/WORD_BANK.md](./docs/WORD_BANK.md) 往 `lib/words.ts` 增加 `WordEntry` / `FormationChallenge`，并跑回归清单（`npm run build` + 三档人群非空校验）。

## 5. 提交规范

- 分支命名：`feat/`、`fix/`、`docs/` 前缀。
- Commit 简洁中文或英文，说明「做什么 + 为什么」。
- 提交前确保 `npm run build` 通过。
- 涉及同步安全（见 `REVIEW.md` [S2]）的改动务必在 PR 描述中说明测试方式。

## 6. 已知问题

代码审查发现的待办项集中在 `REVIEW.md`：[S1] 沙箱预览、`[S2]` 同步鉴权、`[S3]` 接口语义、`[M1-M4]` 逻辑细节。欢迎认领修复，PR 中引用对应编号。

## 7. 安全提醒

云端同步的「同步码」即公开密钥，**请勿用于真实敏感数据**。公开部署前必须处理 `REVIEW.md` [S2] 的鉴权与合并逻辑。
