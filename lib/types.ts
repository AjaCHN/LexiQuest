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
