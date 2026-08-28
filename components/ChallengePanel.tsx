"use client";
import { UserProgress } from "../lib/types";
import { LEVELS, nextLevelInfo, todayStr } from "../lib/storage";
import { IconStar, IconFlame, IconTrophy } from "./Icons";

export default function ChallengePanel({ progress }: { progress: UserProgress }) {
  const ni = nextLevelInfo(progress.points);
  const doneToday = (() => {
    const today = progress.history.find((r) => r.date === todayStr());
    return today ? today.doneWordIds.length : 0;
  })();
  return (
    <>
      <div className="stat-row">
        <div className="stat">
          <div className="n">{progress.points}</div>
          <div className="l">
            <IconStar size={13} /> 总积分
          </div>
        </div>
        <div className="stat">
          <div className="n">Lv.{progress.level}</div>
          <div className="l">
            <IconTrophy size={13} /> {ni.current.title}
          </div>
        </div>
        <div className="stat">
          <div className="n">{progress.streak}</div>
          <div className="l">
            <IconFlame size={13} /> 连续天数
          </div>
        </div>
      </div>

      <div className="card">
        <h2>
          闯关进度 · {ni.current.title}
          {ni.next ? ` → ${ni.next.title}` : "（已满级）"}
        </h2>
        <div className="hint">
          {ni.next
            ? `再赚 ${ni.toNext} 分即可晋级下一关`
            : "你已登顶，继续守护你的积分吧！"}
        </div>
        <div className="lvl-bar">
          <i style={{ width: ni.pct + "%" }} />
        </div>

        <div className="lvl-list">
          {LEVELS.map((l) => {
            const reached = progress.points >= l.need;
            return (
              <div className={"lvl" + (reached ? " done" : "")} key={l.lv}>
                <div className="badge">
                  <IconTrophy size={18} />
                </div>
                <div className="info">
                  <div className="t">
                    Lv.{l.lv} {l.title}
                  </div>
                  <div className="d">
                    {l.need === 0
                      ? "初始等级"
                      : `需累计 ${l.need} 积分`}
                    {reached ? " · 已达成" : ""}
                  </div>
                </div>
                {reached && <IconStar size={16} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>积分怎么赚</h2>
        <div className="hint">每天学习都能累积积分，闯过更多关卡</div>
        <div className="lvl-list">
          <div className="lvl">
            <div className="badge">+10</div>
            <div className="info">
              <div className="t">完成一个每日单词</div>
              <div className="d">今天已学 {doneToday} 个</div>
            </div>
          </div>
          <div className="lvl">
            <div className="badge">+20</div>
            <div className="info">
              <div className="t">完成一组组词练习</div>
              <div className="d">
                已完成 {progress.formationDone.length} 组
              </div>
            </div>
          </div>
          <div className="lvl">
            <div className="badge">连</div>
            <div className="info">
              <div className="t">连续每天学习</div>
              <div className="d">连续 {progress.streak} 天，别断签！</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
