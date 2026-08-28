import { NextRequest } from "next/server";

// EdgeOne Pages 上 KV 以绑定的变量名作为全局对象暴露。
// 在控制台「Bind Namespace」时，变量名请填写为 my_kv（与下方一致）。
export const runtime = "edge";

type KV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

function getKV(): KV | null {
  return (globalThis as unknown as { my_kv?: KV }).my_kv ?? null;
}

// 同步码格式约束：4~64 位字母/数字/下划线/连字符，避免脏键与意外碰撞。
const CODE_RE = /^[A-Za-z0-9_-]{4,64}$/;
function validCode(code: string | null): code is string {
  return !!code && CODE_RE.test(code);
}

// 可选服务端密钥：若在 EdgeOne 配置 SYNC_SECRET 环境变量，
// KV 键名改为 code 的 SHA-256 形式，使未持有密钥者无法枚举或读取数据。
// 未配置时退化为明文 code（仍可用，仅失去“防枚举”加固）。
async function resolveKey(code: string): Promise<string> {
  const secret =
    (process.env && process.env.SYNC_SECRET) ||
    (globalThis as unknown as { SYNC_SECRET?: string }).SYNC_SECRET;
  if (!secret) return `sync:${code}`;
  const data = new TextEncoder().encode(`${secret}:${code}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  const hex = [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `sync:${hex}`;
}

type Progress = Record<string, unknown> & {
  history?: { date: string; wordIds: string[]; doneWordIds: string[] }[];
  formationDone?: string[];
  points?: number;
  level?: number;
  streak?: number;
  lastActive?: string;
  group?: string;
  dailyCount?: number;
  updatedAt?: number;
};

// 合并两份进度，避免多设备并发写入互相覆盖：
// 取较大积分/段位、并集已完成项、按日期合并历史（并集词与已完成词）。
function mergeProgress(local: Progress | null, remote: Progress | null): Progress {
  if (!remote) return local as Progress;
  if (!local) return remote;
  const byDate = new Map<string, { date: string; wordIds: string[]; doneWordIds: string[] }>();
  const union = (
    r: { date: string; wordIds: string[]; doneWordIds: string[] }
  ) => {
    const cur = byDate.get(r.date);
    if (!cur) byDate.set(r.date, { ...r });
    else
      byDate.set(r.date, {
        date: r.date,
        wordIds: [...new Set([...cur.wordIds, ...r.wordIds])],
        doneWordIds: [...new Set([...cur.doneWordIds, ...r.doneWordIds])],
      });
  };
  [...(local.history ?? []), ...(remote.history ?? [])].forEach(union);
  return {
    group: (remote.group as string) || (local.group as string),
    points: Math.max(local.points ?? 0, remote.points ?? 0),
    level: Math.max(local.level ?? 1, remote.level ?? 1),
    streak: Math.max(local.streak ?? 0, remote.streak ?? 0),
    lastActive:
      (local.lastActive || "") >= (remote.lastActive || "")
        ? (local.lastActive as string)
        : (remote.lastActive as string),
    history: [...byDate.values()],
    formationDone: [...new Set([...(local.formationDone ?? []), ...(remote.formationDone ?? [])])],
    dailyCount: local.dailyCount || remote.dailyCount || 5,
    updatedAt: Math.max(local.updatedAt ?? 0, remote.updatedAt ?? 0),
  };
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const kv = getKV();
  if (!kv) return Response.json({ mode: "local", data: null });
  // S3：无有效同步码时返回 local（语义清晰，不误导客户端走云端）
  if (!validCode(code)) return Response.json({ mode: "local", data: null });
  try {
    const raw = await kv.get(await resolveKey(code));
    return Response.json({ mode: "cloud", data: raw ? JSON.parse(raw) : null });
  } catch {
    return Response.json({ mode: "offline", data: null });
  }
}

export async function POST(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const kv = getKV();
  if (!kv) return Response.json({ ok: false, mode: "local" });
  if (!validCode(code))
    return Response.json({ ok: false, mode: "local", error: "invalid_code" });
  try {
    const body = (await req.json()) as { data?: Progress };
    const key = await resolveKey(code);
    // S2：读取云端已有数据，与本次上传合并后再写回，避免后写覆盖先写。
    const existing = await kv.get(key);
    const merged = mergeProgress(body.data ?? null, existing ? JSON.parse(existing) : null);
    await kv.put(key, JSON.stringify(merged));
    return Response.json({ ok: true, mode: "cloud", data: merged });
  } catch {
    return Response.json({ ok: false, mode: "offline" });
  }
}
