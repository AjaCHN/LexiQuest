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
    return <div className="empty">这个年龄段还没出题，换个挑战或明天再来～</div>;

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
          <div id={"formation-quiz-" + c.id} className="quiz" key={c.id}>
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
                role="button"
                tabIndex={0}
                aria-pressed={chosen.includes(i)}
                onClick={() => toggle(c.id, i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(c.id, i);
                  }
                }}
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
                <b>{correct ? "答对了，就是这个味 🎉" : "差一点点！再看看词根提示～"}</b>{" "}
                {c.explanation}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
