# 英语闯关台 LexiQuest · 多年龄段英语学习工作台

<p align="center">
  <b>LexiQuest</b> · 仓库 <code>lexiquest</code> · Next.js 14 + 腾讯云 EdgeOne Pages · Edge KV 跨设备同步
</p>

为不同年龄段人群定制的网页版英语学习工作台，基于 **Next.js 14（App Router）** 构建，部署到 **腾讯云 EdgeOne Pages**，数据通过 **Edge KV** 实现多设备云端同步（无登录）。

> 命名：中文「英语闯关台」/ 英文 **LexiQuest**（Lexico- 词素 + Quest 闯关）/ 仓库与 npm 包名 `lexiquest`。

## 功能

- **三档年龄段**：儿童启蒙（6-12）/ 青少年学生（13-22）/ 成人进阶（22+），各自独立词库与难度。
- **每日单词**：每天自动安排若干单词，昨天没做完的会自动顺延到今天并标红「逾期」。
- **拆分记忆卡**：每张卡片把单词拆成 前缀 / 词根 / 后缀 / 基础词，颜色区分 + 含义提示，点击翻面查看，附朗读。
- **组词练习**：基于同一词根/基础词做多选组词，答对得积分，附带解析。
- **闯关积分**：完成单词 +10、组词 +20、连续打卡累计积分，6 级段位看板。
- **云端同步**：各设备填同一个「同步码」即可跨设备共享进度（基于 EdgeOne KV，无需登录）。
- **数据安全**：本地 localStorage 离线可用 + JSON 导出/导入备份 + 清空二次确认。
- **响应式**：PC 多列、手机单列 + 底部 Tab，支持深色模式，可「添加到主屏幕」当 App 用。

## 文档导航

| 文档 | 内容 |
|------|------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 技术栈、目录结构、组件树、核心数据流、降级边界 |
| [docs/DATA_MODEL.md](./docs/DATA_MODEL.md) | 全部类型、存储键、积分/段位、每日计划、同步协议、安全提示 |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | 本地开发、EdgeOne 部署、Edge KV 绑定、上线验证与安全加固 |
| [docs/WORD_BANK.md](./docs/WORD_BANK.md) | 如何向词库新增单词与组词题（字段、配色、id 约定） |
| [REVIEW.md](./REVIEW.md) | 代码审查报告与已知问题清单（综合健康度 B+） |
| [CHANGELOG.md](./CHANGELOG.md) | 版本变更记录 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 本地运行、目录约定、提 PR 规范 |

## 本地开发

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 生产构建（含类型检查）
npm run start    # 本地起生产服务（需先 build）
```

> 本地未绑定 KV 时，应用自动运行在「本地模式」，所有功能正常，仅云端同步不可用。
> **沙箱 / 127.0.0.1 预览**需 `next.config.mjs` 配置 `allowedDevOrigins: ["127.0.0.1"]`（见 [REVIEW.md](./REVIEW.md) [S1]）。

## 部署到腾讯云 EdgeOne Pages

### 方式一：Git 仓库（推荐）

1. 把本项目推到 GitHub / Gitee。
2. 打开 [EdgeOne Pages 控制台](https://edgeone.ai/pages/new) → 新建项目 → 导入 Git 仓库。
3. 构建配置（一般自动识别）：
   - 框架：**Next.js**
   - 构建命令：`npm run build`
   - 输出目录：由 Next.js 自动处理（无需手动填）
4. 点击部署，等待完成后获得在线访问链接。

### 方式二：EdgeOne CLI 直接上传

```bash
npm install -g edgeone
edgeone login                 # 选择中国站/国际站并登录
edgeone pages init           # 首次使用，按提示初始化
edgeone pages deploy         # 自动构建并部署
```

## 开启云端多设备同步（Edge KV）

云端同步需要 EdgeOne KV 存储，步骤：

1. **开通 KV**：EdgeOne Pages 控制台顶部「KV Storage」→ Apply now 申请开通。
2. **创建命名空间**：开通后 Create Namespace，取一个有业务含义的名字。
3. **绑定到项目**：进入你的 Pages 项目 → KV Storage → Bind Namespace，选择命名空间，
   变量名（Variable Name）填写 **`my_kv`**（需与 `app/api/sync/route.ts` 中的绑定名一致）。
4. **使用**：打开工作台 → 设置 → 开启「云端同步」→ 设置一个同步码。
   在手机 / 电脑上登录同一网站、填**同一个同步码**，数据即自动跨设备共享。

> 同步码相当于你的「云空间钥匙」，请牢记；忘记则无法找回对应云端数据。
> ⚠️ 当前为「无登录 + 同步码即密钥」轻量设计，请勿用于真实敏感数据，公开部署前需加固（见 [REVIEW.md](./REVIEW.md) [S2]）。

## 目录结构

```
app/
  layout.tsx          # 根布局、元信息、移动端适配
  page.tsx            # 主页面（年龄段选择 / 今天要处理 / 三个模块 / 设置）
  globals.css         # 全部样式（零外部依赖，内联）
  api/sync/route.ts   # 云端同步接口（读写 Edge KV）
components/           # 图标、拆分卡、组词、闯关、今日、设置等组件
lib/
  types.ts            # 数据类型与人群元信息
  words.ts            # 三档词库 + 组词题库
  storage.ts          # 本地存储 / 每日计划 / 积分 / 导出导入 / 云端拉推
docs/                 # 架构 / 数据模型 / 部署 / 词库扩展文档
ai/memory-bank/       # PM 规格与开发任务清单（site-setup.md / tasks/）
```

## 技术说明

- 单仓库、纯前端离线优先；无后端时全部数据存浏览器 localStorage。
- 图表与图标均为内联 SVG，不引用任何外部 CDN / 框架 / 字体。
- 云端同步走 `app/api/sync` 路由，通过 EdgeOne KV 的 `my_kv.get/put` 读写，无 KV 自动降级为本地。

## 已知问题与路线图

代码审查（[REVIEW.md](./REVIEW.md)）综合健康度 **B+**，初版可运行、结构清晰，上线前需处理：

| 编号 | 问题 | 优先级 |
|------|------|--------|
| [S1] | `next.config.mjs` 缺 `allowedDevOrigins`，沙箱预览点击失效 | 立即修复 |
| [S2] | 同步接口无鉴权 / 同步码无校验 / 并发 last-write-wins 可能丢进度 | 上线前加固 |
| [S3] | `GET /api/sync` 无 code 返回 `mode:"cloud"` 语义混乱 | 立即修复 |
| [M1] | 取消已完成单词时连续天数不回退 | 后续优化 |
| [M2] | 导入文件未校验 group 合法性 | 上线前加固 |
| [M3] | 清空逻辑硬编码 key，与 storage 重复 | 后续优化 |
| [M4] | 长期断签后今日列表可能被逾期词占满 | 后续优化 |

**路线图**：T1–T2 立即修复 → T3–T4 上线前加固 → T5–T10 后续优化（词库扩充、注释、升 Next 16.x 等），详见 [ai/memory-bank/tasks/lexiquest-tasklist.md](./ai/memory-bank/tasks/lexiquest-tasklist.md)。
