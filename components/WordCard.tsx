"use client";
import { useState } from "react";
import { WordEntry } from "../lib/types";
import { IconPlay } from "./Icons";

export default function WordCard({ word }: { word: WordEntry }) {
  const [open, setOpen] = useState(false);
  const speak = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(word.word);
      u.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  };
  return (
    <div className={"flip" + (open ? " open" : "")}>
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
            onClick={() => {
              setOpen(true);
              speak();
            }}
          >
            <IconPlay size={15} /> 看拆分
          </button>
        </div>
        <div className="face back">
          <div className="word">{word.word}</div>
          <div className="parts">
            {word.parts.map((p, i) => (
              <span key={i} className={"part " + p.type}>
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
          <button className="btn sm ghost flipbtn" onClick={() => setOpen(false)}>
            返回
          </button>
        </div>
      </div>
    </div>
  );
}
