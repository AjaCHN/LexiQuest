"use client";
import { useState } from "react";
import { FormationChallenge } from "../lib/types";
import { IconCheck, IconSparkle } from "./Icons";

export default function FormationPractice({
  challenges,
  formationDone,
  onComplete,
}: {
  challenges: FormationChallenge[];
  formationDone: string[];
  onComplete: (id: string) => void;
}) {
  const [sel, setSel] = useState<Record<string, number[]>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const toggle = (id: string, i: number) => {
    if (submitted[id]) return;
    setSel((s) => {
      const cur = s[id] || [];
      const next = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i];
      return { ...s, [id]: next };
    });
  };

  const submit = (c: FormationChallenge) => {
    if (submitted[c.id]) return;
    const chosen = sel[c.id] || [];
    const correct =
      chosen.length === c.answers.length &&
      c.answers.every((a) => chosen.includes(a));
    setSubmitted((s) => ({ ...s, [c.id]: true }));
    if (correct && !formationDone.includes(c.id)) onComplete(c.id);
  };

  if (!challenges.length)
    return <div className="empty">该年龄段暂无组词练习，敬请期待。</div>;

  return (
    <>
      {challenges.map((c) => {
        const isDone = formationDone.includes(c.id);
        const sub = submitted[c.id];
        const chosen = sel[c.id] || [];
        const correct =
          chosen.length === c.answers.length &&
          c.answers.every((a) => chosen.includes(a));
        return (
          <div className="quiz" key={c.id}>
            <div className="q">{c.question}</div>
            <div className="root">
              词根/基础：<b>{c.root}</b> —— {c.rootHint}
              {isDone && (
                <span className="tag" style={{ color: "var(--success)" }}>
                  已完成 +20
                </span>
              )}
            </div>
            {c.options.map((opt, i) => {
              const isAnswer = c.answers.includes(i);
              let cls = "opt";
              if (chosen.includes(i)) cls += " sel";
              if (sub) {
                if (isAnswer) cls += " right";
                else if (chosen.includes(i)) cls += " wrong";
              }
              return (
                <div
                  className={cls}
                  key={i}
                  onClick={() => toggle(c.id, i)}
                  role="button"
                >
                  <span className="box">
                    {sub && isAnswer ? (
                      <IconCheck />
                    ) : chosen.includes(i) && !sub ? (
                      <IconCheck />
                    ) : null}
                  </span>
                  {opt}
                </div>
              );
            })}
            {!sub ? (
              <button
                className="btn primary sm"
                onClick={() => submit(c)}
                disabled={(chosen.length === 0)}
                style={{ opacity: chosen.length === 0 ? 0.5 : 1 }}
              >
                提交答案
              </button>
            ) : (
              <div className="exp">
                <IconSparkle size={14} />{" "}
                <b>{correct ? "答对了！" : "再看看："}</b> {c.explanation}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
