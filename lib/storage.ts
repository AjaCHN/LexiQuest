import { UserProgress, AgeGroup, DayRecord, GROUP_META } from "./types";
import { wordsByGroup } from "./words";

const K_PREFIX = "wb_english_";
const K_CURRENT_GROUP = K_PREFIX + "group";
const K_UID = K_PREFIX + "uid";
const K_THEME = K_PREFIX + "theme";
const K_SYNC_CODE = K_PREFIX + "sync_code";
const K_CLOUD_ON = K_PREFIX + "cloud_on";

/** EdgeOne Pages 绑定的 KV 命名空间变量名（在控制台 Bind Namespace 时填写为 my_kv） */
export const KV_VAR = "my_kv";

export const LEVELS = [
  { lv: 1, need: 0, title: "启蒙新星" },
  { lv: 2, need: 100, title: "词汇积累者" },
  { lv: 3, need: 250, title: "构词达人" },
  { lv: 4, need: 450, title: "闯关高手" },
  { lv: 5, need: 700, title: "英语大师" },
  { lv: 6, need: 1000, title: "语言探险家" },
];

export const POINTS_PER_WORD = 10;
export const POINTS_PER_FORMATION = 20;

// ---------------- 日期工具 ----------------
export function todayStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayStr(d);
}
function dayNumber(): number {
  const d = new Date();
  return Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000
  );
}

// ---------------- 进度初始化 ----------------
export function createProgress(group: AgeGroup): UserProgress {
  return {
    group,
    points: 0,
    level: 1,
    streak: 0,
    lastActive: "",
    history: [],
    formationDone: [],
    dailyCount: 5,
    updatedAt: Date.now(),
  };
}

export function levelForPoints(points: number): number {
  let lv = 1;
  for (const l of LEVELS) if (points >= l.need) lv = l.lv;
  return lv;
}

export function nextLevelInfo(points: number): {
  current: (typeof LEVELS)[number];
  next?: (typeof LEVELS)[number];
  toNext: number;
  pct: number;
} {
  const current = [...LEVELS].reverse().find((l) => points >= l.need) ?? LEVELS[0];
  const next = LEVELS.find((l) => l.need > points);
  if (!next) return { current, toNext: 0, pct: 100 };
  const span = next.need - current.need;
  const got = points - current.need;
  return { current, next, toNext: next.need - points, pct: Math.round((got / span) * 100) };
}

// ---------------- 当前人群 ----------------
export function loadCurrentGroup(): AgeGroup | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(K_CURRENT_GROUP) as AgeGroup) || null;
}
export function saveCurrentGroup(g: AgeGroup): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(K_CURRENT_GROUP, g);
}

// ---------------- 本地读写（按年龄段分别保存） ----------------
function progressKey(g: AgeGroup): string {
  return K_PREFIX + "progress_" + g;
}
// M3：清除某人群的本机进度与当前人群标记，统一使用内部 key 常量，避免硬编码错位。
export function clearLocalGroup(group: AgeGroup): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(progressKey(group));
  localStorage.removeItem(K_CURRENT_GROUP);
}
export function loadProgress(group: AgeGroup): UserProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(progressKey(group));
    if (!raw) return null;
    const p = JSON.parse(raw) as UserProgress;
    if (!p || !p.group) return null;
    return p;
  } catch {
    return null;
  }
}
export function saveProgress(p: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(progressKey(p.group), JSON.stringify(p));
}

export function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(K_THEME) as "light" | "dark") || "light";
}
export function setTheme(t: "light" | "dark"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(K_THEME, t);
}

export function getUid(): string {
  if (typeof window === "undefined") return "anon";
  let uid = localStorage.getItem(K_UID);
  if (!uid) {
    uid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : "u" + Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem(K_UID, uid);
  }
  return uid;
}

export function getSyncCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(K_SYNC_CODE);
}
export function setSyncCode(code: string | null): void {
  if (typeof window === "undefined") return;
  if (code) localStorage.setItem(K_SYNC_CODE, code);
  else localStorage.removeItem(K_SYNC_CODE);
}
export function isCloudOn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(K_CLOUD_ON) === "1";
}
export function setCloudOn(on: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(K_CLOUD_ON, on ? "1" : "0");
}

// ---------------- 首次示例数据（含一条逾期） ----------------
export function seedSample(progress: UserProgress): UserProgress {
  const bank = wordsByGroup(progress.group);
  if (!bank.length) return progress;
  const yest = yesterdayStr();
  if (progress.history.some((r) => r.date === yest)) return progress;
  const rec: DayRecord = { date: yest, wordIds: [bank[0].id], doneWordIds: [] };
  return { ...progress, history: [rec, ...progress.history] };
}

// ---------------- 每日计划（含顺延） ----------------
export interface DayPlan extends DayRecord {
  overdue: string[];
}

export function ensureToday(progress: UserProgress): {
  progress: UserProgress;
  plan: DayPlan;
} {
  const bank = wordsByGroup(progress.group);
  const today = todayStr();
  const history = progress.history;
  const existing = history.find((r) => r.date === today);
  if (existing) {
    const y = history.find((r) => r.date === yesterdayStr());
    const overdue = y
      ? y.wordIds.filter((id) => !y.doneWordIds.includes(id) && existing.wordIds.includes(id))
      : [];
    return { progress, plan: { ...existing, overdue } };
  }
  // 顺延逻辑：若昨天有未完成的词，作为“逾期”带入今天。
  const daily = progress.dailyCount || 5;
  const n = bank.length;
  const start = dayNumber() % Math.max(1, n);
  let overdue: string[] = [];
  const y = history.find((r) => r.date === yesterdayStr());
  if (y) {
    // M4：逾期词最多取每日量的一半，避免长期断签后今日被旧词占满。
    const cap = Math.max(1, Math.ceil(daily / 2));
    overdue = y.wordIds.filter((id) => !y.doneWordIds.includes(id)).slice(0, cap);
  }
  // 其余名额用旋转选取的新鲜词补足，保证每天都有新词可学。
  const need = daily - overdue.length;
  const fresh: string[] = [];
  for (let i = 0; i < need && n > 0; i++) {
    const id = bank[(start + i) % n].id;
    if (!overdue.includes(id) && !fresh.includes(id)) fresh.push(id);
  }
  const wordIds = [...new Set([...overdue, ...fresh])];
  const rec: DayRecord = { date: today, wordIds, doneWordIds: [] };
  const newHistory = [rec, ...history].slice(0, 90);
  return { progress: { ...progress, history: newHistory }, plan: { ...rec, overdue } };
}

// ---------------- 连续天数（从历史重算，避免取消单词导致虚高） ----------------
// 定义“活跃日”= 当天有任意已完成单词；连续天数从今天（或昨天，若今天尚未学习）
// 向前回溯统计连续活跃天数。取消今天全部单词会让今天不再活跃，从而自然回退。
export function recomputeStreak(history: DayRecord[]): number {
  const active = new Set(
    history.filter((r) => (r.doneWordIds?.length || 0) > 0).map((r) => r.date)
  );
  const d = new Date();
  if (!active.has(todayStr(d))) d.setDate(d.getDate() - 1); // 今天还没完成则从昨天起算
  let streak = 0;
  while (active.has(todayStr(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// ---------------- 标记单词完成 / 取消 ----------------
export function toggleWord(
  progress: UserProgress,
  wordId: string
): { progress: UserProgress; gained: number } {
  const today = todayStr();
  let history = [...progress.history];
  let rec = history.find((r) => r.date === today);
  if (!rec) {
    rec = { date: today, wordIds: [wordId], doneWordIds: [] };
    history = [rec, ...history];
  }
  const done = rec.doneWordIds.includes(wordId);
  let gained = 0;
  if (done) {
    rec.doneWordIds = rec.doneWordIds.filter((id) => id !== wordId);
    gained = -POINTS_PER_WORD;
  } else {
    rec.doneWordIds = [...rec.doneWordIds, wordId];
    gained = POINTS_PER_WORD;
  }
  history = history.map((r) => (r.date === today ? rec : r));
  let points = Math.max(0, progress.points + gained);
  // M1：依据最新历史重算连续天数，取消单词时若今天不再活跃则自动回退。
  const streak = recomputeStreak(history);
  const updated: UserProgress = {
    ...progress,
    history,
    points,
    streak,
    level: levelForPoints(points),
    lastActive: today,
    updatedAt: Date.now(),
  };
  return { progress: updated, gained };
}

// ---------------- 完成组词练习 ----------------
export function completeFormation(
  progress: UserProgress,
  challengeId: string
): { progress: UserProgress; gained: number } {
  if (progress.formationDone.includes(challengeId))
    return { progress, gained: 0 };
  const points = progress.points + POINTS_PER_FORMATION;
  const updated: UserProgress = {
    ...progress,
    formationDone: [...progress.formationDone, challengeId],
    points,
    level: levelForPoints(points),
    updatedAt: Date.now(),
  };
  return { progress: updated, gained: POINTS_PER_FORMATION };
}

// ---------------- 导出 / 导入 ----------------
export function exportJSON(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(progress, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `english-workbench-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importJSON(file: File): Promise<UserProgress> {
  const text = await file.text();
  const p = JSON.parse(text) as UserProgress;
  // M2：校验年龄段合法性，非法文件直接报错（而非静默导入后今日无词）。
  if (!p || !p.group || !(p.group in GROUP_META) || !Array.isArray(p.history))
    throw new Error("文件格式不正确或年龄段无效");
  return { ...p, updatedAt: Date.now() };
}

// ---------------- 云端同步（Edge KV） ----------------
export async function pullCloud(
  code: string
): Promise<{ ok: boolean; data: UserProgress | null; mode: string }> {
  try {
    const res = await fetch(`/api/sync?code=${encodeURIComponent(code)}`, {
      method: "GET",
      cache: "no-store",
    });
    const j = await res.json();
    if (j.mode === "cloud") return { ok: true, data: j.data ?? null, mode: "cloud" };
    return { ok: false, data: null, mode: j.mode || "local" };
  } catch {
    return { ok: false, data: null, mode: "offline" };
  }
}

export async function pushCloud(
  code: string,
  data: UserProgress
): Promise<{ ok: boolean; mode: string; data: UserProgress | null }> {
  try {
    const res = await fetch(`/api/sync?code=${encodeURIComponent(code)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, data }),
    });
    const j = await res.json();
    // L2：接口已合并云端与他端数据，返回合并结果供客户端采纳，实现多设备收敛。
    return { ok: j.mode === "cloud", mode: j.mode || "local", data: j.data ?? null };
  } catch {
    return { ok: false, mode: "offline", data: null };
  }
}
