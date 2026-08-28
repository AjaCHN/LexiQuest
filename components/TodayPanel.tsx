"use client";
import { DayPlan } from "../lib/storage";
import { WordEntry } from "../lib/types";
import { IconCheck } from "./Icons";

export default function TodayPanel({
  plan,
  wordMap,
  onToggle,
}: {
  plan: DayPlan;
  wordMap: Record<string, WordEntry>;
  onToggle: (id: string) => void;
}) {
  const total = plan.wordIds.length;
  const done = plan.doneWordIds.length;
  return (
    <div className="today">
      <div className="section-title" style={{ margin: "0 0 8px" }}>
        📌 今天要处理
        <span className="chip" style={{ marginLeft: "auto" }}>
          {done}/{total}
        </span>
      </div>
      {total === 0 && <div className="empty">今天没有安排，去“每日单词”里挑几个学吧！</div>}
      {plan.wordIds.map((id) => {
        const w = wordMap[id];
        const isDone = plan.doneWordIds.includes(id);
        const isOverdue = plan.overdue.includes(id);
        if (!w) return null;
        return (
          <div className={"row" + (isDone ? " done" : "")} key={id}>
            <button
              className={"check" + (isDone ? " on" : "")}
              onClick={() => onToggle(id)}
              aria-label="完成"
            >
              {isDone && <IconCheck />}
            </button>
            <div style={{ flex: 1 }}>
              <div className="word">
                {w.word}{" "}
                {isOverdue && <span className="overdue">逾期 · 昨天没做完</span>}
              </div>
              <div className="meta">
                {w.phonetic} · {w.meaning}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
