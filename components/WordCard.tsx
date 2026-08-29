"use client";
import { useState } from "react";
import { WordEntry } from "../lib/types";
import { IconPlay } from "./Icons";

export default function WordCard({ word }: { word: WordEntry }) {
  const [open, setOpen] = useState(false);
  // 与原型 PROTO_DATA 保持一致：词素类型中文标签，用于悬停释义提示。
  const PART_LABEL: Record<string, string> = {
    prefix: "前缀",
    root: "词根",
    suffix: "后缀",
    base: "基础词",
  };
  const speak = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(word.word);
      u.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  };
  return (
    <div id={"word-card-" + word.id} className={"flip" + (open ? " open" : "")}>
      <div className="flip-inner">
        <div className="face">
          <div className="word">{word.word}</div>
          <div className="phon">{word.phonetic}</div>
          <span className="pos">{word.pos}</span>
          <div className="meaning">{word.meaning}</div>
          <div className="ex">
            {word.example.en}
            <br />
            {word.example.zh}
          </div>
          <button
            className="btn sm ghost flipbtn"
            tabIndex={open ? -1 : 0}
            onClick={(e) => {
              setOpen(true);
              speak();
              const r = e.currentTarget.getBoundingClientRect();
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("lexiquest:celebrate", {
                    detail: {
                      x: r.left + r.width / 2,
                      y: r.top + r.height / 2,
                      count: 8,
                      emojis: ["✨", "💡", "🌟"],
                    },
                  })
                );
              }
            }}
          >
            <IconPlay size={15} /> 看拆分
          </button>
        </div>
        <div className="face back">
          <div className="word">{word.word}</div>
          <div className="parts">
            {word.parts.map((p, i) => (
              <span
                key={i}
                className={"part " + p.type}
                title={`${PART_LABEL[p.type] || p.type} ${p.text}：${p.hint}`}
              >
                {p.text}
              </span>
            ))}
          </div>
          <div className="part-hint">
            {word.parts.map((p, i) => (
              <div key={i}>
                <b>{p.text}</b> · {p.hint}
              </div>
            ))}
          </div>
          <div className="meaning">{word.meaning}</div>
          <div className="ex">
            {word.example.en}
            <br />
            {word.example.zh}
          </div>
          <button
            className="btn sm ghost flipbtn"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
}
