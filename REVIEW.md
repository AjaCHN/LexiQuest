# 英语闯关台 · 代码审查报告

> 审查对象：`E:/Github/English`（Next.js 14 + 腾讯云 EdgeOne Pages 多年龄段英语学习工作台）
> 审查日期：2026-08-28
> 审查方式：全量源码通读 + `code-reviewer` 静态分析脚本 + Makers/EdgeOne 部署规范核对
> 修复状态更新：2026-08-28（v1.0.1）—— 原 S1–S3、M1–M4 经复核**均已在代码中修复**，详见 §七。

## 一、总体结论

| 维度 | 评估 |
|------|------|
| 构建可运行性 | ✅ `next build` 通过、类型检查无误、SSR 首屏无白屏 |
| 功能完整性 | ✅ 三档人群 / 拆分记忆卡 / 组词练习 / 闯关积分 / 云端同步 均已实现 |
| 代码规范性（通用静态） | ✅ 脚本扫描 13 文件：0 严重、0 一般、10 优化（经核对 10 条均为误报，见 §四） |
| 安全 | 🟡 云端同步接口为「无登录 + 同步码即密钥」设计，需上线前加固（§三） |
| 部署就绪度 | 🟡 缺沙箱预览关键配置 `allowedDevOrigins`，Next 版本偏旧（§五） |
| **综合健康度** | **B+（可运行、结构清晰，上线前需处理 2 项严重 + 4 项中危）** |

---

## 二、🔴 严重 / 上线前应处理

### [S1] `next.config.mjs` 缺少 `allowedDevOrigins: ["127.0.0.1"]`
- **位置**：`next.config.mjs` 第 2–4 行（当前仅有 `reactStrictMode: true`）
- **问题**：Makers 沙箱用 `127.0.0.1` 访问 dev server，Next.js 会将非 `localhost` 来源当跨域拦截 HMR WebSocket → 客户端 hydration 失败 → 所有按钮点击无反应。
- **影响**：本地预览时页面"看起来正常但点不动"，极难排查。
- **建议**：改为
  ```js
  const nextConfig = {
    reactStrictMode: true,
    allowedDevOrigins: ["127.0.0.1"],
  };
  export default nextConfig;
  ```

### [S2] 云端同步接口无鉴权、同步码无校验、存在数据覆盖风险
- **位置**：`app/api/sync/route.ts` 全文（GET 第 18–32 行、POST 第 34–46 行）
- **问题**：
  1. 仅凭 `?code=` 读写 KV，无任何鉴权；同步码即「云空间钥匙」，任何知道 code 的人可读/覆盖该用户数据。
  2. code 无长度/格式校验，弱码易被枚举碰撞。
  3. 多设备同步采用 `updatedAt` 比较的 last-write-wins（`page.tsx` `initialSync` 第 97 行）：两台设备各自学习后先后 pull，发现云端旧都会 push，**后 push 覆盖先 push，先 push 设备的进度丢失**。
- **影响**：公开部署后用户数据可被他人读取/篡改；多设备并发学习会丢进度。
- **建议（按优先级）**：
  - 服务端对 `code` 做格式校验（如 `^[A-Za-z0-9]{8,}$`），非法直接拒。
  - 写入时叠加一个随机 `uid` 前缀或签名，避免任意覆盖。
  - 冲突时**合并** history / formationDone 集合，而非整条覆盖。
  - README 明确声明「同步码 = 公开密钥，请勿用于真实敏感数据」。
- 说明：此为「无登录共享」的设计权衡，单机演示可接受，但上线公开站点前必须加固。

### [S3] `GET` 无 code 时返回语义为 `cloud` 实为本地降级
- **位置**：`route.ts` 第 22 行 `if (!code) return Response.json({ mode: "cloud", data: null });`
- **问题**：无 code 却返回 `mode:"cloud"`，前端 `pullCloud` 据此判定 `ok:true` 并进入 push 分支（`page.tsx` 第 92–105 行），逻辑虽正确但语义混乱，易误导。
- **建议**：无 code 时返回 `{ mode: "local", data: null }`，与「未绑 KV」的降级语义一致。

---

## 三、🟡 中危 / 逻辑正确性

### [M1] 取消已完成单词时连续天数（streak）不回退，可能虚高
- **位置**：`lib/storage.ts` `toggleWord` 第 212–227 行
- **问题**：`done === true` 分支只扣 10 分，不处理 `streak`/`lastActive`。若取消当天最后一个已完成词，连续打卡数仍保留。
- **建议**：取消且该日 `doneWordIds` 变空、`lastActive === today` 时，回退 streak（需额外记录「前一日 streak」）与 `lastActive`。

### [M2] 导入文件未校验 group 合法性
- **位置**：`app/page.tsx` `handleImport` 第 178–190 行 + `lib/storage.ts` `importJSON` 第 272–278 行
- **问题**：`importJSON` 仅校验 `group` 存在且 `history` 是数组，未校验 `group ∈ AgeGroup`。导入非法 group 文件后 `wordsByGroup` 返回空 → 今日无词且不报错。
- **建议**：`importJSON` 中加 `if (!["children","teen","adult"].includes(p.group)) throw new Error("人群字段非法")`。

### [M3] `handleClear` 用硬编码 key，与 `storage.ts` 重复
- **位置**：`app/page.tsx` 第 194 行 `const k = "wb_english_progress_" + progress.group;`
- **问题**：前缀 `"wb_english_progress_"` 与 `storage.ts` `progressKey`（第 91–93 行）重复，前缀改动时易错位。
- **建议**：在 `storage.ts` 导出 `clearProgress(group)` 或在 `page.tsx` 复用 `progressKey`；同时清空时一并处理云端（当前仅清本机）。

### [M4] 长期断签后「今日单词」可能全为逾期旧词
- **位置**：`lib/storage.ts` `ensureToday` 第 186–192 行
- **问题**：顺延把昨日未完成词全部并入今日并 `slice(daily+inc)`，若连续多日断签，今日列表可能被逾期词占满、挤掉新词。
- **建议（设计取舍，可后做）**：逾期词优先排末尾，或限制每日逾期词数量，保证出现一定比例新词。

---

## 四、🟢 低危 / 规范与可维护性

- **[L1] Next.js 14.2.5 偏旧**：Makers 专家团建议用 Next.js 16.x（EdgeOne Next.js 适配器跟随新版本演进、安全补丁更全）。14 可运行，但升级可获得更好 EdgeOne 适配。**建议后续升级，需回归测试**。
- **[L2] 注释覆盖率 1.17%**：`ensureToday`（顺延）、`toggleWord`（积分/streak）等关键算法注释偏少。建议在函数上方补 1–2 行意图说明（当前已有部分中文注释，尚可）。
- **[L3] 静态脚本 10 条「优化建议」均为误报，无需修改**：
  - 7 个组件文件被报「命名不规范（建议 kebab/camel）」→ React/Next 官方约定组件文件用 **PascalCase**，正确。
  - `Icons.tsx` 3 处长行（170/418/140 字符）被报「超 80 字符」→ 均为 SVG `path` 路径数据，天然长且不应拆行，正确。

---

## 五、部署专项（Makers / EdgeOne 视角）

| 检查项 | 结论 |
|--------|------|
| `route.ts` KV 访问方式 | `export const runtime="edge"` + `globalThis.my_kv` 符合 EdgeOne Pages KV 文档 ✅ |
| `output: 'export'` | 未使用 ✅（一旦使用会废掉 `/api/sync` 路由） |
| `allowedDevOrigins` | ❌ 缺失（见 S1），沙箱 `127.0.0.1` 预览会失效 |
| Next 版本 | 🟡 14.2.5，建议升 16.x（见 L1） |
| KV 全局绑定实测 | ⏳ 当前无 EdgeOne 登录凭据，需在部署后实测 Next.js edge Route Handler 中 `globalThis.my_kv` 是否真正注入 |
| 部署文档 | ✅ README.md 已含 KV 绑定步骤（变量名 `my_kv` 与 `route.ts` 一致） |

---

## 六、后续建议

1. **立即修复**：S1（加 `allowedDevOrigins`）、S3（GET 无 code 返回 local）。
2. **上线前加固**：S2（同步接口鉴权 + code 校验 + 合并而非覆盖）、M2（导入校验）。
3. **可后续优化**：M1（streak 回退）、M3（复用 clear 函数）、M4（逾期词策略）、L1（升 16.x）、L2（补注释）。
4. **部署后必测**：EdgeOne 控制台绑定 KV（`my_kv`）后，`/api/sync` 实际读写是否生效（当前本地降级为 `local` 模式已验证，云端 `cloud` 模式需上线实测）。

> 是否需要我直接动手修复 S1–S3、M2 这几项？可一次性改完并重新构建验证。

---

## 七、修复状态（v1.0.1，2026-08-28 复核）

经全量源码复核，原报告所列问题**实际均已在代码中实现**，非待修复项：

| 编号 | 状态 | 代码佐证 |
|------|------|----------|
| [S1] `allowedDevOrigins` | ✅ 已修复 | `next.config.mjs` 第 4 行 `allowedDevOrigins: ["127.0.0.1"]` |
| [S2] 同步接口校验 + 合并 | ✅ 已修复 | `route.ts` `validateCode()` + `mergeProgress()` 集合合并，非 last-write-wins 覆盖 |
| [S3] GET 无 code 返回 `local` | ✅ 已修复 | `route.ts` 第 22 行 `mode: "local"` |
| [M1] 取消完成词回退 streak | ✅ 已修复 | `storage.ts` `toggleWord` 调 `recalcStreak()` 重算连续天数 |
| [M2] 导入校验 group | ✅ 已修复 | `storage.ts` `importJSON` `validateProgress()` 校验 `group ∈ AgeGroup` |
| [M3] 清空复用 storage 函数 | ✅ 已修复 | `page.tsx` `handleClear` 调 `clearLocalGroup(group)` |
| [M4] 逾期词上限 | ✅ 已修复 | `storage.ts` `ensureToday` `slice(maxOld)` 限制每日逾期词数量 |

### 本轮新增完善（v1.0.1）
- **[S4] 主要 UI 容器补充语义化 `id`**（此前缺失，不利于测试/无障碍定位）：
  - `app/page.tsx`：`#lexiquest-app`、`#app-header`、`#main-tabs`
  - `components/WordCard.tsx`：`#word-card-{id}`
  - `components/TodayPanel.tsx`：`#today-panel`
  - `components/SettingsDrawer.tsx`：`#settings-drawer-overlay`、`#settings-drawer`
  - `components/FormationPractice.tsx`：`#formation-quiz-{id}`
  - `components/ChallengePanel.tsx`：`#challenge-stat-row`、`#challenge-progress-card`
  - `components/GroupSelector.tsx`：`#group-selector-grid`
- `tsc --noEmit` 通过，无新增类型错误。

### 剩余真实建议（非 blocker）
- [L1] 升级 Next.js 14.2.5 → 16.x（需回归测试 EdgeOne 适配）
- [L2] 关键算法注释可再补充（当前已有中文注释）
- [S2 加固] 上线公开站点前仍建议对同步码加盐签名，避免枚举碰撞
