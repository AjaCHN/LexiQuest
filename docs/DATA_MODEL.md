# 数据模型与存储说明 · 英语闯关台 LexiQuest

> 本文定义 LexiQuest 的类型、本地存储键、进度结构与云端同步协议，是扩展词库与排查数据问题的权威参考。

## 1. 核心类型（`lib/types.ts`）

```ts
type AgeGroup = "children" | "teen" | "adult";

interface MorphemePart {      // 词素拆分
  text: string;               // 片段文本，如 "un-"
  type: "prefix" | "root" | "suffix" | "base";  // 配色依据
  hint: string;               // 该片段中文含义/提示
}

interface WordExample { en: string; zh: string; }

interface WordEntry {         // 单词
  id: string;                 // 唯一，建议 "<组前缀>-<单词>"，如 "ch-unhappy"
  group: AgeGroup;
  word: string;               // 英文
  phonetic: string;           // 音标，如 "/ʌnˈhæpi/"
  pos: string;                // 词性，如 "adj. 形容词"
  meaning: string;            // 中文释义
  parts: MorphemePart[];      // 拆分记忆
  example: WordExample;
  tags?: string[];
}

interface FormationChallenge { // 组词练习
  id: string;
  group: AgeGroup;
  root: string;               // 词根/基础词
  rootHint: string;
  question: string;
  options: string[];          // 选项文本
  answers: number[];          // 正确选项索引（支持多选）
  explanation: string;        // 解析
}

interface DayRecord {         // 某日学习记录
  date: string;               // YYYY-MM-DD
  wordIds: string[];          // 当天安排/出现的单词
  doneWordIds: string[];      // 已完成单词
}

interface UserProgress {      // 用户进度（按人群一份）
  group: AgeGroup;
  points: number;             // 总积分
  level: number;              // 当前段位 1-6
  streak: number;             // 连续学习天数
  lastActive: string;         // 最近活跃日 YYYY-MM-DD
  history: DayRecord[];       // 学习历史（最多保留 90 天）
  formationDone: string[];    // 已完成组词练习 id
  dailyCount: number;         // 每日单词数量，默认 5
  updatedAt: number;          // 最后更新时间戳（同步冲突比较用）
}
```

### 人群元信息 `GROUP_META`

| group | name | range | color | 定位 |
|-------|------|-------|-------|------|
| children | 儿童启蒙 | 6-12 岁 | `#f59e0b` | 趣味单词 + 简单词素拆分 |
| teen | 青少年学生 | 13-22 岁 | `#4f46e5` | 中高考/四六级高频词，词根词缀拆解 |
| adult | 成人进阶 | 22 岁以上 | `#0ea5e9` | 职场生活进阶词汇，构词逻辑 |

## 2. 段位与积分（`lib/storage.ts`）

```ts
LEVELS = [
  { lv:1, need:0,    title:"启蒙新星" },
  { lv:2, need:100,  title:"词汇积累者" },
  { lv:3, need:250,  title:"构词达人" },
  { lv:4, need:450,  title:"闯关高手" },
  { lv:5, need:700,  title:"英语大师" },
  { lv:6, need:1000, title:"语言探险家" },
];
POINTS_PER_WORD = 10;       // 完成一个每日单词
POINTS_PER_FORMATION = 20;  // 完成一组组词练习
```

- 段位由 `levelForPoints(points)` 取「满足 need 的最高 lv」决定。
- `nextLevelInfo(points)` 返回当前段位、下一段位、距晋级分数 `toNext` 与进度百分比 `pct`。

## 3. 本地存储键（`lib/storage.ts`，前缀 `wb_english_`）

| Key | 内容 |
|-----|------|
| `wb_english_group` | 当前选中人群 `AgeGroup` |
| `wb_english_progress_<group>` | 该人群 `UserProgress` JSON（三个 group 各一份） |
| `wb_english_uid` | 设备匿名 id（`crypto.randomUUID()`，用于同步区分设备） |
| `wb_english_theme` | `light` / `dark` |
| `wb_english_sync_code` | 云端同步码 |
| `wb_english_cloud_on` | `1`/`0` 是否开启云端同步 |

> 所有键读取前均做 `typeof window === "undefined"` 守卫，避免 SSR 报错。

## 4. 每日计划与顺延（`ensureToday`）

- **已存在今日记录**：直接复用，并计算「昨日未完成词」作为 `overdue`。
- **新的一天**：
  1. `start = dayNumber() % 词库长度`，按 `dailyCount`（默认 5）循环取词，去重。
  2. 若存在昨日记录，将昨日 `wordIds` 中未完成的并入今日 `overdue`，合并后截断到 `daily + inc.length`。
- 历史记录保留最近 90 天（`slice(0, 90)`）。
- 首次进入写入一条「昨日逾期」示例（`seedSample`），用于演示逾期标红。

> 已知缺陷 [M4]：连续多日断签时今日列表可能被逾期词占满。属设计取舍，暂未处理。

## 5. 积分与连续天数（`toggleWord`）

- 完成时 `points += 10`（取消则 `-10`，下限 0），`lastActive` 置为今天。
- 连续天数：若昨天 `lastActive === yesterday` → `streak+1`，否则重置为 1。
- 取消已完成单词时**不回退** `streak`/`lastActive`（已知问题 [M1]）。

## 6. 云端同步协议（`app/api/sync/route.ts`）

接口：`/api/sync`，Edge Runtime，`runtime="edge"`。服务端通过 `globalThis.my_kv` 访问 Edge KV（控制台绑定变量名必须为 `my_kv`）。

### GET（拉取）
```
GET /api/sync?code=<同步码>
```
- 无 KV 绑定 → `{ mode:"local", data:null }`
- 有 KV 但无 code → `{ mode:"cloud", data:null }`（⚠️ 见 [S3]：语义应为 local）
- 正常 → `{ mode:"cloud", data: <UserProgress|null> }`
- 异常 → `{ mode:"offline", data:null }`

### POST（推送）
```
POST /api/sync?code=<同步码>
Body: { "code": "<同步码>", "data": <UserProgress> }
KV 键: sync:<code>   // 整条 JSON 覆盖写入
```
- 成功 → `{ ok:true, mode:"cloud" }`；无 KV → `{ ok:false, mode:"local" }`；异常 → `{ ok:false, mode:"offline" }`

### 冲突策略
前端 `initialSync`：拉取后若 `云端.updatedAt > 本地.updatedAt` 用云端，否则把本地 push 上去。即 **last-write-wins**。多设备并发学习可能丢进度（已知问题 [S2]）。

## 7. 导入/导出格式

- **导出** `exportJSON`：下载 `english-workbench-<YYYY-MM-DD>.json`，内容为整份 `UserProgress`。
- **导入** `importJSON`：解析后仅校验 `group` 存在且 `history` 为数组（⚠️ 未校验 group 合法性，见 [M2]）。导入会覆盖当前进度，`updatedAt` 刷新。

## 8. 安全与隐私提示

- 同步码即「云空间钥匙」：`sync:<code>` 为 KV 键，任何知道 code 的人可读/覆写该用户数据（无登录、无校验，[S2]）。
- 请勿将同步码用于真实敏感数据；上线公开站点前需加固（code 校验 + 写入签名 + 合并而非覆盖）。
- 所有数据存于浏览器本地与用户自有 KV 命名空间，开发者无法访问。
