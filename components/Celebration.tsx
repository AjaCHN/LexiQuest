"use client";

import { useEffect, useState } from "react";

type Burst = { id: number; x: number; y: number; emoji: string; dx: number; dur: number };

const POOL = ["🎉", "✨", "⭐", "🌟", "💫", "🏆", "🔥", "💡", "📚", "🚀", "🧠"];

/**
 * 全局庆祝层：任意组件通过派发事件触发 emoji 迸发。
 * - 纯装饰：容器 aria-hidden，不进入任何 live region，读屏用户无感。
 * - 无障碍：动效时长由 globals.css 的 prefers-reduced-motion 归零，reduced-motion 用户看到"瞬现即隐"。
 * - 自清理：emoji 在动画结束后由定时器回收，避免 DOM 堆积。
 *
 * 触发示例：
 *   window.dispatchEvent(new CustomEvent("lexiquest:celebrate", {
 *     detail: { x: 200, y: 120, count: 16, emojis: ["🎉","🏆"] },
 *   }));
 */
export default function Celebration() {
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    let n = 0;
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      const x = typeof d.x === "number" ? d.x : window.innerWidth / 2;
      const y = typeof d.y === "number" ? d.y : window.innerHeight / 2;
      const count = Math.min(Math.max(d.count || 14, 1), 40);
      const pool = Array.isArray(d.emojis) && d.emojis.length ? d.emojis : POOL;
      const added: Burst[] = [];
      for (let i = 0; i < count; i++) {
        added.push({
          id: ++n,
          x,
          y,
          emoji: pool[Math.floor(Math.random() * pool.length)],
          dx: Math.random() * 160 - 80,
          dur: 0.9 + Math.random() * 0.6,
        });
      }
      const ids = new Set(added.map((a) => a.id));
      setBursts((b) => [...b, ...added]);
      window.setTimeout(
        () => setBursts((b) => b.filter((x) => !ids.has(x.id))),
        1600
      );
    };
    window.addEventListener("lexiquest:celebrate", handler as EventListener);
    return () =>
      window.removeEventListener("lexiquest:celebrate", handler as EventListener);
  }, []);

  return (
    <div className="celebration-layer" aria-hidden="true">
      {bursts.map((b) => (
        <span
          key={b.id}
          className="celebrate-emoji"
          style={
            {
              left: b.x,
              top: b.y,
              "--dx": b.dx + "px",
              "--dur": b.dur + "s",
            } as React.CSSProperties
          }
        >
          {b.emoji}
        </span>
      ))}
    </div>
  );
}
