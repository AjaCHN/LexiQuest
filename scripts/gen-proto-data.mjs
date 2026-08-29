// path scripts/gen-proto-data.mjs
// 从 lib/words.ts 提取 WORDS / FORMATION 字面量，生成 prototype/data.js（window.PROTO_DATA），
// 使原型直接使用真实词库，消除手写重复与版本漂移。
// 运行：node scripts/gen-proto-data.mjs  （或 npm run proto:data）
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "lib", "words.ts");
const out = path.join(root, "prototype", "data.js");
const code = fs.readFileSync(src, "utf8");

// 提取 `export const NAME = <字面量>;` 中的字面量（按括号深度匹配到闭合 `];`）
function extractConst(name) {
  const start = code.indexOf(`export const ${name}`);
  if (start < 0) throw new Error(`未找到 export const ${name}`);
  const eq = code.indexOf("=", start);
  let i = code.indexOf("[", eq);
  let depth = 0;
  for (; i < code.length; i++) {
    const ch = code[i];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        const literal = code.slice(code.indexOf("[", eq), i + 1);
        return literal;
      }
    }
  }
  throw new Error(`未匹配到 ${name} 的闭合数组`);
}

const wordsLiteral = extractConst("WORDS");
const formationLiteral = extractConst("FORMATION");

// 用 Function 构造求值字面量（仅数据，无副作用）
const WORDS = new Function(`return (${wordsLiteral});`)();
const FORMATION = new Function(`return (${formationLiteral});`)();

const payload = `// 自动生成，请勿手改。来源：lib/words.ts（节选真实词库）。\n// 重新生成：npm run proto:data\nwindow.PROTO_DATA = ${JSON.stringify({ WORDS, FORMATION }, null, 2)};\n`;
fs.writeFileSync(out, payload, "utf8");
console.log(`✓ 生成 ${path.relative(root, out)}：WORDS ${WORDS.length} 条，FORMATION ${FORMATION.length} 条`);
