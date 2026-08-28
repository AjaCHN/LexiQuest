// lib/kv.ts v2.0.1
// Edge Runtime KV 访问抽象层。
//
// 部署环境：腾讯云 EdgeOne Pages（Makers）。KV 命名空间绑定（如 my_kv）
// 由平台注入到 Edge Runtime 的全局对象，路由处理器需声明
// `export const runtime = "edge"` 才能访问。
//
// 注意：Next.js 16 已将 Edge Runtime 标记为「弃用」（构建期告警）。
// 但 EdgeOne Makers 当前仅在 edge runtime 提供 KV 绑定，故本模块
// 仍基于 edge 全局对象实现；若未来平台在 nodejs runtime 提供等价
// KV（如环境变量注入的客户端），只需替换下方 getKvBinding 实现，
// 调用方（app/api/sync/route.ts）无需改动 —— 这是本抽象层的核心价值。

export type KV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

// EdgeOne 控制台「Bind Namespace」时填写的变量名需与此一致。
const KV_BINDING_NAME = "my_kv";
// 可选服务端密钥：配置后 KV 键名改为 code 的 SHA-256，防止未持密钥者枚举。
const SECRET_BINDING_NAME = "SYNC_SECRET";

function readGlobal<T>(name: string): T | undefined {
  return (globalThis as unknown as Record<string, T | undefined>)[name];
}

// 读取 Edge Runtime 注入的 KV 绑定；未配置时返回 null。
// 返回 null 时调用方应降级为「仅本地」模式（见 route.ts 的 mode:"local"）。
export function getKvBinding(): KV | null {
  return (readGlobal<KV>(KV_BINDING_NAME) as KV | undefined) ?? null;
}

// 读取可选同步密钥；未配置时返回空串（退化为明文 code，仍可用）。
export function getSyncSecret(): string {
  const fromEnv = process.env && process.env[SECRET_BINDING_NAME];
  if (fromEnv) return fromEnv;
  return readGlobal<string>(SECRET_BINDING_NAME) ?? "";
}
