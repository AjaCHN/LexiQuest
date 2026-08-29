export type AgeGroup = "children" | "teen" | "adult";

export interface MorphemePart {
  text: string;
  /** 词素类型，用于配色：前缀 / 词根 / 后缀 / 基础词 */
  type: "prefix" | "root" | "suffix" | "base";
  /** 该词素的中文含义或提示 */
  hint: string;
}

export interface WordExample {
  en: string;
  zh: string;
}

export interface WordEntry {
  id: string;
  group: AgeGroup;
  word: string;
  phonetic: string;
  pos: string; // 词性
  meaning: string; // 中文释义
  parts: MorphemePart[]; // 拆分记忆
  example: WordExample;
  tags?: string[];
}

export interface FormationChallenge {
  id: string;
  group: AgeGroup;
  root: string;
  rootHint: string;
  question: string;
  options: string[];
  /** 正确选项的索引（可多选） */
  answers: number[];
  explanation: string;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  wordIds: string[];
  doneWordIds: string[];
}

export interface UserProgress {
  group: AgeGroup;
  points: number;
  level: number;
  streak: number;
  lastActive: string; // YYYY-MM-DD
  history: DayRecord[];
  formationDone: string[]; // 已完成组词练习的 id
  dailyCount: number;
  updatedAt: number;
}

export interface CloudPayload {
  uid: string;
  data: UserProgress | null;
}

export const GROUP_META: Record<
  AgeGroup,
  { name: string; range: string; color: string; desc: string }
> = {
  children: {
    name: "儿童启蒙",
    range: "6-12 岁",
    color: "#f59e0b",
    desc: "趣味单词 + 简单词素拆分，图形化记忆更轻松",
  },
  teen: {
    name: "青少年学生",
    range: "13-22 岁",
    color: "#4f46e5",
    desc: "中考 / 高考 / 四六级高频词，词根词缀拆解助记",
  },
  adult: {
    name: "成人进阶",
    range: "22 岁以上",
    color: "#0ea5e9",
    desc: "职场与生活进阶词汇，拆解构词逻辑高效记忆",
  },
};

/**
 * 依据背景色相对亮度返回对比足够的文字色。
 * 与纯白/纯黑分别计算 WCAG 对比度，取更高者，确保小文字≥4.5:1、大文字≥3:1。
 */
export function readableTextOn(hex: string): string {
  const c = hex.replace("#", "").trim();
  const full =
    c.length === 3
      ? c
          .split("")
          .map((x) => x + x)
          .join("")
      : c.slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lin = (v: number) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const contrastWhite = (1.0 + 0.05) / (L + 0.05);
  const contrastBlack = (L + 0.05) / (0.0 + 0.05);
  return contrastWhite >= contrastBlack ? "#ffffff" : "#0f172a";
}
