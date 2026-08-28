# 词库扩展指南 · 英语闯关台 LexiQuest

> 所有单词与组词题目集中在 `lib/words.ts`。本文说明如何新增/修改词库，保持三档人群一致与字段规范。

## 1. 文件结构

`lib/words.ts` 导出三个内容 + 两个选择器：

```ts
export const WORDS: WordEntry[];                 // 全部单词（按 group 混排，靠 id 前缀区分）
export const FORMATION: FormationChallenge[];    // 全部组词练习
export function wordsByGroup(g: AgeGroup): WordEntry[];        // 按人群过滤
export function formationByGroup(g: AgeGroup): FormationChallenge[];
```

当前规模：每档 **10 个单词 + 6 组组词练习**（共 30 词 / 6 题，children/teen/adult 各 2 题）。

## 2. 新增一个单词（`WordEntry`）

复制到对应人群注释块（如 `// ---------------- 青少年学生 teen ----------------`）内，按既有风格填写：

```ts
{
  id: "tn-happiness",            // 唯一 id，建议 "<组前缀>-<单词>"：ch/tn/ad
  group: "teen",                 // children | teen | adult
  word: "happiness",
  phonetic: "/ˈhæpinəs/",
  pos: "n. 名词",
  meaning: "幸福，快乐",
  parts: [                       // 词素拆分（1~3 段皆可）
    { text: "happy",  type: "base",   hint: "快乐" },
    { text: "-ness", type: "suffix", hint: "表示“状态/性质”" },
  ],
  example: { en: "Happiness comes from within.", zh: "幸福源于内心。" },
  tags: ["情绪"],                // 可选
},
```

### 词素配色约定（`type` → 颜色）

| type | 含义 | 卡片配色（CSS 类） |
|------|------|------|
| `prefix` | 前缀 | 蓝 `.prefix` |
| `root` | 词根 | 绿 `.root` |
| `suffix` | 后缀 | 粉 `.suffix` |
| `base` | 基础词 | 紫 `.base` |

> 颜色在 `app/globals.css` 中定义；新增 `type` 值前请同步改样式与 `lib/types.ts` 的 `MorphemePart.type` 联合类型。

## 3. 新增一组组词练习（`FormationChallenge`）

```ts
{
  id: "f-tn-happy",             // 唯一 id，建议 "f-<组前缀>-<词根>"
  group: "teen",
  root: "happy",                // 词根/基础词
  rootHint: "happy = 快乐",
  question: "选出由 happy 构成的词：",
  options: ["happiness", "unhappy", "happen", "happily", "harvest"],
  answers: [0, 1, 3],          // 正确选项索引（从 0 开始，支持多选）
  explanation: "happiness（-ness 状态）、unhappy（un- 不）、happily（-ly 地）含 happy；happen/harvest 仅拼写相近。",
},
```

**关键规则**：
- `answers` 是 `options` 数组中的**下标**（`[0,1,3]` 表示第 1/2/4 项），不是单词文本。
- `options` 至少 3~5 项，包含干扰项（拼写相近但无关的词）。
- `answers` 长度即本题正确项数；`FormationPractice` 以「选中集合 == answers 集合」判定全对。

## 4. id 命名约定

| 人群 | 单词 id 前缀 | 组词 id 前缀 |
|------|------|------|
| children（儿童） | `ch-` | `f-ch-` |
| teen（青少年） | `tn-` | `f-tn-` |
| adult（成人） | `ad-` | `f-ad-` |

保持唯一即可，前缀仅作可读性约定。

## 5. 扩展后回归清单

- [ ] `npm run build` 通过（类型检查会校验 `group`/`type` 联合类型）。
- [ ] 三个 `wordsByGroup` 均非空（否则今日无词、组词显示「敬请期待」）。
- [ ] 新增单词的 `parts[].type` 在 `globals.css` 有对应配色类。
- [ ] 组词 `answers` 索引在 `options` 范围内且数量正确。
- [ ] `ensureToday` 的「轮转取词」仍能在新规模下均匀铺开（默认每日 5 词）。

## 6. 进阶：拆分数据文件

若词库增长到数百词，建议把 `WORDS` / `FORMATION` 拆到 `lib/words/*.ts` 再聚合导出，避免单文件过长。当前 30 词规模无需拆分。
