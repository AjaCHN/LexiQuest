"use client";
import { AgeGroup, GROUP_META } from "../lib/types";
import { IconBook, IconPuzzle, IconStar } from "./Icons";

const ORDER: AgeGroup[] = ["children", "teen", "adult"];

export default function GroupSelector({
  onSelect,
}: {
  onSelect: (g: AgeGroup) => void;
}) {
  const icons: Record<AgeGroup, JSX.Element> = {
    children: <IconBook size={24} />,
    teen: <IconStar size={24} />,
    adult: <IconPuzzle size={24} />,
  };
  return (
    <div>
      <div style={{ textAlign: "center", margin: "10px 0 4px" }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>选择你的英语学习台</h1>
        <p style={{ color: "var(--text-faint)", fontSize: 13, marginTop: 6 }}>
          不同年龄段匹配不同词库与难度，选一个开始今天的闯关吧
        </p>
      </div>
      <div className="group-grid">
        {ORDER.map((g) => {
          const m = GROUP_META[g];
          return (
            <button
              key={g}
              className="group-card"
              onClick={() => onSelect(g)}
            >
              <div className="emoji" style={{ background: m.color }}>
                {icons[g]}
              </div>
              <h3>{m.name}</h3>
              <div className="tag">{m.range}</div>
              <p>{m.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
