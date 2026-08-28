# 部署与云端同步 · 英语闯关台 LexiQuest

> 本文覆盖本地开发、EdgeOne Pages 部署、Edge KV 绑定与上线后验证。LexiQuest 是纯前端 Next.js 应用，无自建后端。

## 1. 本地开发

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 生产构建（含类型检查）
npm run start    # 本地起生产服务（需先 build）
```

- 本地未绑定 Edge KV 时，应用自动运行在「本地模式」：所有功能正常，仅云端同步不可用（接口返回 `{mode:"local"}`）。
- **沙箱 / 127.0.0.1 预览**：Next.js 默认仅信任 `localhost` 来源的 HMR WebSocket。若通过 `127.0.0.1` 访问 dev server，需在 `next.config.mjs` 增加：
  ```js
  const nextConfig = {
    reactStrictMode: true,
    allowedDevOrigins: ["127.0.0.1"],
  };
  export default nextConfig;
  ```
  > 否则会出现「页面能看但点击无反应」的 hydration 失败（见 REVIEW.md [S1]）。

## 2. 部署到腾讯云 EdgeOne Pages

### 方式一：Git 仓库导入（推荐）
1. 把本项目推到 GitHub / Gitee。
2. 打开 [EdgeOne Pages 控制台](https://edgeone.ai/pages/new) → 新建项目 → 导入 Git 仓库。
3. 构建配置（通常自动识别）：
   - 框架：**Next.js**
   - 构建命令：`npm run build`
   - 输出目录：由 Next.js 自动处理（无需手动填）
4. 点击部署，完成后获得在线访问链接。

### 方式二：EdgeOne CLI 直接上传
```bash
npm install -g edgeone
edgeone login                 # 选择中国站/国际站并登录
edgeone pages init           # 首次使用，按提示初始化
edgeone pages deploy         # 自动构建并部署
```

## 3. 开启跨设备云端同步（Edge KV）

云端同步依赖 EdgeOne KV，**必须**在控制台完成以下绑定，否则回退本地模式：

1. **开通 KV**：EdgeOne Pages 控制台顶部「KV Storage」→ Apply now 申请开通。
2. **创建命名空间**：开通后 Create Namespace，取一个有业务含义的名字（如 `lexiquest-sync`）。
3. **绑定到项目**：进入你的 Pages 项目 → KV Storage → Bind Namespace，选择命名空间。
   - **变量名（Variable Name）必须填写 `my_kv`**，与 `app/api/sync/route.ts` 中 `globalThis.my_kv` 一致。
4. **应用内使用**：打开工作台 → 设置 → 开启「云端同步」→ 设置一个同步码。
   - 在手机 / 电脑上打开同一网站、填**同一个同步码**，数据即自动跨设备共享。

> 同步码相当于你的「云空间钥匙」，请牢记；忘记则无法找回对应云端数据（详见 [DATA_MODEL.md §8](./DATA_MODEL.md) 安全提示）。

## 4. 部署后验证清单

- [ ] 构建通过：`npm run build` 无类型错误。
- [ ] SSR 首屏：访问 `/` 直接渲染年龄段选择器，无白屏。
- [ ] 本地模式：`/api/sync` 返回 `{"mode":"local"}`（未绑 KV）。
- [ ] 云端模式（绑 KV 后）：
  - [ ] `GET /api/sync?code=xxx` 返回 `{"mode":"cloud", ...}`。
  - [ ] `POST /api/sync?code=xxx` 后再次 GET 能读回写入的数据。
  - [ ] 应用内「保存并拉取云端」能跨设备拿到进度。
- [ ] 移动端：`127.0.0.1` 或线上域名下按钮均可点击（确认已处理 [S1]）。

## 5. 升级与回归提示

- **Next.js 版本**：当前 14.2.5。Makers 专家团建议后续升级到 16.x 以获得更好的 EdgeOne 适配器与安全补丁；升级需完整回归。
- **切勿使用 `output: 'export'`**：会废掉 `/api/sync` 路由，云端同步失效。
- **KV 全局对象注入**：当前本地无法实测 `globalThis.my_kv` 是否真正注入，部署后必须按 §4 实测。

## 6. 上线前安全加固（必读）

公开部署前请处理 [REVIEW.md](../REVIEW.md) 的 [S2]：
1. 服务端对 `code` 做格式校验（如 `^[A-Za-z0-9]{8,}$`），非法直接拒。
2. 写入时叠加随机 `uid` 前缀或签名，避免任意覆盖。
3. 冲突时**合并** `history` / `formationDone` 集合，而非整条覆盖。
4. 文档明确声明「同步码 = 公开密钥，请勿用于真实敏感数据」。
