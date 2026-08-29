"use client";

import { useEffect, useMemo, useState } from "react";
import { AgeGroup, GROUP_META, WordEntry, readableTextOn } from "../lib/types";
import {
  createProgress,
  seedSample,
  ensureToday,
  DayPlan,
  loadCurrentGroup,
  saveCurrentGroup,
  loadProgress,
  saveProgress,
  clearLocalGroup,
  getTheme,
  setTheme,
  toggleWord,
  completeFormation,
  exportJSON,
  importJSON,
  isCloudOn,
  getSyncCode,
  setSyncCode,
  setCloudOn,
  pullCloud,
  pushCloud,
  LEVELS,
} from "../lib/storage";
import { wordsByGroup, formationByGroup } from "../lib/words";
import GroupSelector from "../components/GroupSelector";
import TodayPanel from "../components/TodayPanel";
import WordCard from "../components/WordCard";
import FormationPractice from "../components/FormationPractice";
import ChallengePanel from "../components/ChallengePanel";
import SettingsDrawer from "../components/SettingsDrawer";
import Celebration from "../components/Celebration";
import {
  IconLogo,
  IconBook,
  IconPuzzle,
  IconTrophy,
  IconSettings,
  IconStar,
  IconFlame,
  IconSun,
  IconMoon,
} from "../components/Icons";

type SyncState = "local" | "syncing" | "synced" | "offline";
type Tab = "words" | "formation" | "challenge";

function applyTheme(t: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
}

// 探索彩蛋：点击 Logo 触发全屏 emoji 庆祝（纯装饰，Celebration 层已 aria-hidden）
function fireLogoBurst(el: EventTarget & Element) {
  if (typeof window === "undefined") return;
  const r = el.getBoundingClientRect();
  window.dispatchEvent(
    new CustomEvent("lexiquest:celebrate", {
      detail: {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        count: 16,
        emojis: ["✨", "⭐", "🌟", "🎉", "🚀", "🧠"],
      },
    })
  );
}

// 晋级庆祝：定位闯关进度卡片（升级徽章所在），不存在则回退顶部居中
function fireLevelUp() {
  if (typeof window === "undefined") return;
  const card = document.getElementById("challenge-progress-card");
  let x = window.innerWidth / 2;
  let y = 96;
  if (card) {
    const r = card.getBoundingClientRect();
    x = r.left + r.width / 2;
    y = r.top + r.height / 2;
  }
  window.dispatchEvent(
    new CustomEvent("lexiquest:celebrate", {
      detail: {
        x,
        y,
        count: 24,
        emojis: ["🎉", "🏆", "⭐", "🌟", "✨", "🚀", "💫"],
      },
    })
  );
}

export default function Page() {
  const [progress, setProgress] = useState<ReturnType<typeof createProgress> | null>(null);
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<Tab>("words");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("local");
  const [toast, setToast] = useState<string | null>(null);

  const wordMap = useMemo<Record<string, WordEntry>>(() => {
    const m: Record<string, WordEntry> = {};
    if (progress) wordsByGroup(progress.group).forEach((w) => (m[w.id] = w));
    return m;
  }, [progress]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  async function syncPush(p: ReturnType<typeof createProgress>) {
    const code = getSyncCode();
    if (!isCloudOn() || !code) {
      setSyncState("local");
      return;
    }
    setSyncState("syncing");
    const r = await pushCloud(code, p);
    if (r.ok && r.data) {
      // L2：采纳云端合并结果，使本设备即时收敛其他设备进度。
      saveProgress(r.data);
      setProgress(r.data);
      setPlan(ensureToday(r.data).plan);
      setSyncState("synced");
    } else {
      setSyncState(r.mode === "offline" ? "offline" : "local");
      // 「云端同步失败」异常态：本地进度已保存，提示用户数据不丢（对齐 prototype/states.html）。
      showToast(r.mode === "offline" ? "离线啦～进度已存本地，联网后自动同步" : "同步失败，进度已保留在本地");
    }
  }

  async function initialSync(p: ReturnType<typeof createProgress>) {
    const code = getSyncCode();
    if (!isCloudOn() || !code) {
      setSyncState("local");
      return;
    }
    setSyncState("syncing");
    const r = await pullCloud(code);
    if (!r.ok) {
      setSyncState(r.mode === "offline" ? "offline" : "local");
      return;
    }
    if (r.data && r.data.updatedAt > p.updatedAt) {
      saveProgress(r.data);
      setProgress(r.data);
      setPlan(ensureToday(r.data).plan);
      setSyncState("synced");
    } else {
      // 本地更新更新：推送并采纳合并结果（含他端数据）。
      const pr = await pushCloud(code, p);
      if (pr.ok && pr.data) {
        saveProgress(pr.data);
        setProgress(pr.data);
        setPlan(ensureToday(pr.data).plan);
        setSyncState("synced");
      } else {
        setSyncState(pr.mode === "offline" ? "offline" : "local");
      }
    }
  }

  useEffect(() => {
    const t = getTheme();
    setThemeState(t);
    applyTheme(t);
    const g = loadCurrentGroup();
    if (g) {
      let p = loadProgress(g);
      if (!p) p = seedSample(createProgress(g));
      const res = ensureToday(p);
      saveProgress(res.progress);
      setProgress(res.progress);
      setPlan(res.plan);
      initialSync(res.progress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelectGroup(g: AgeGroup) {
    saveCurrentGroup(g);
    const p0 = seedSample(createProgress(g));
    const res = ensureToday(p0);
    saveProgress(res.progress);
    setProgress(res.progress);
    setPlan(res.plan);
    setActiveTab("words");
    if (isCloudOn() && getSyncCode()) syncPush(res.progress);
  }

  function handleToggleWord(id: string) {
    if (!progress) return;
    const oldLevel = progress.level;
    const { progress: np, gained } = toggleWord(progress, id);
    const res = ensureToday(np);
    saveProgress(res.progress);
    setProgress(res.progress);
    setPlan(res.plan);
    if (gained)
      showToast(gained > 0 ? `学会一个 +${gained} 分` : `已取消 -${-gained} 分`);
    if (np.level > oldLevel) {
      const nl = np.level;
      const title = LEVELS.find((l) => l.lv === nl)?.title ?? "";
      showToast(`晋级 Lv.${nl} · ${title}！`);
      fireLevelUp();
    }
    syncPush(res.progress);
  }

  function handleFormationResult(_id: string, correct: boolean) {
    // 「组词全错」异常态：给出鼓励性反馈，避免用户卡在挫败感（对齐 prototype/states.html）。
    if (!correct) showToast("没关系～看词根提示再试一次，记得更牢！");
  }

  function handleCompleteFormation(id: string) {
    if (!progress) return;
    const oldLevel = progress.level;
    const { progress: np, gained } = completeFormation(progress, id);
    saveProgress(np);
    setProgress(np);
    if (np.level > oldLevel) {
      const nl = np.level;
      const title = LEVELS.find((l) => l.lv === nl)?.title ?? "";
      showToast(`晋级 Lv.${nl} · ${title}！`);
      fireLevelUp();
    } else {
      showToast(`组词大成！+${gained} 分`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("lexiquest:celebrate", {
            detail: {
              x: window.innerWidth / 2,
              y: window.innerHeight * 0.42,
              count: 18,
              emojis: ["🎉", "🏆", "✨", "💡", "🧠"],
            },
          })
        );
      }
    }
    syncPush(np);
  }

  function handleToggleTheme() {
    const t: "light" | "dark" = theme === "dark" ? "light" : "dark";
    setThemeState(t);
    setTheme(t);
    applyTheme(t);
  }

  function handleToggleCloud(on: boolean) {
    setCloudOn(on);
    if (on && getSyncCode()) initialSync(progress!);
    else setSyncState("local");
  }

  function handleSaveCode(code: string) {
    setSyncCode(code);
    if (isCloudOn() && code && progress) initialSync(progress);
  }

  function handlePull() {
    if (progress) initialSync(progress);
  }

  async function handleImport(file: File) {
    try {
      const p = await importJSON(file);
      saveCurrentGroup(p.group);
      const res = ensureToday(p);
      saveProgress(res.progress);
      setProgress(res.progress);
      setPlan(res.plan);
      showToast("导入成功");
    } catch {
      showToast("导入失败：文件格式不正确");
    }
  }

  function handleClear() {
    if (progress) {
      clearLocalGroup(progress.group);
    }
    setProgress(null);
    setPlan(null);
    setSettingsOpen(false);
    showToast("已清空本机数据");
  }

  // ---------- 未选择人群 ----------
  if (!progress) {
    return (
      <main className="app">
        <div className="hd">
          <div className="logo">
            <IconLogo />
          </div>
          <div>
            <div className="ttl">英语闯关台</div>
            <div className="sub">多年龄段 · 拆分记忆 · 组词练习 · 闯关积分</div>
          </div>
        </div>
        <GroupSelector onSelect={handleSelectGroup} />
        {toast && (
          <div className="toast" role="status" aria-live="polite">
            {toast}
          </div>
        )}
      </main>
    );
  }

  const m = GROUP_META[progress.group];
  const bank = wordsByGroup(progress.group);
  const challenges = formationByGroup(progress.group);
  const todayWords = (plan?.wordIds || [])
    .map((id) => wordMap[id])
    .filter(Boolean) as WordEntry[];

  return (
    <main id="lexiquest-app" className="app">
      <div id="app-header" className="hd">
        <div
          className="logo"
          role="button"
          tabIndex={0}
          title="点我有惊喜"
          aria-label="点击 Logo 触发庆祝彩蛋"
          onClick={(e) => fireLogoBurst(e.currentTarget)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fireLogoBurst(e.currentTarget);
            }
          }}
        >
          <IconLogo />
        </div>
        <div>
          <div className="ttl">英语闯关台</div>
          <div className="sub">多年龄段英语学习工作台</div>
        </div>
        <div className="spacer" />
        <button
          className="chip"
          style={{ background: m.color, color: readableTextOn(m.color), borderColor: "transparent" }}
          onClick={() => setProgress(null)}
          title="切换年龄段"
          aria-label="切换年龄段"
        >
          {m.name}
        </button>
        <span className="chip pts">
          <IconStar size={14} /> {progress.points}
        </span>
        <span className="chip flame">
          <IconFlame size={14} /> {progress.streak}
        </span>
        <button
          className="iconbtn"
          onClick={handleToggleTheme}
          title="切换主题"
          aria-label="切换深浅色主题"
        >
          {theme === "dark" ? <IconSun /> : <IconMoon />}
        </button>
        <button
          className="iconbtn"
          onClick={() => setSettingsOpen(true)}
          title="设置"
          aria-label="打开设置"
        >
          <IconSettings />
        </button>
      </div>

      <TodayPanel plan={plan!} wordMap={wordMap} onToggle={handleToggleWord} />

      <div
        id="main-tabs"
        className="tabs"
        role="tablist"
        aria-label="学习模块"
        onKeyDown={(e) => {
          const order: Tab[] = ["words", "formation", "challenge"];
          const idx = order.indexOf(activeTab);
          if (e.key === "ArrowRight") {
            const next = order[(idx + 1) % order.length];
            setActiveTab(next);
          } else if (e.key === "ArrowLeft") {
            const next = order[(idx - 1 + order.length) % order.length];
            setActiveTab(next);
          }
        }}
      >
        <button
          role="tab"
          id="tab-words"
          aria-selected={activeTab === "words"}
          aria-controls="panel-words"
          className={activeTab === "words" ? "active" : ""}
          onClick={() => setActiveTab("words")}
        >
          <IconBook size={16} /> 每日单词
        </button>
        <button
          role="tab"
          id="tab-formation"
          aria-selected={activeTab === "formation"}
          aria-controls="panel-formation"
          className={activeTab === "formation" ? "active" : ""}
          onClick={() => setActiveTab("formation")}
        >
          <IconPuzzle size={16} /> 组词练习
        </button>
        <button
          role="tab"
          id="tab-challenge"
          aria-selected={activeTab === "challenge"}
          aria-controls="panel-challenge"
          className={activeTab === "challenge" ? "active" : ""}
          onClick={() => setActiveTab("challenge")}
        >
          <IconTrophy size={16} /> 闯关积分
        </button>
      </div>

      {activeTab === "words" && (
        <div
          id="panel-words"
          role="tabpanel"
          aria-labelledby="tab-words"
          tabIndex={-1}
        >
          <div className="section-title">
            <IconBook size={16} /> 今日单词 · 点击卡片看拆分记忆（悬停词素看释义）
          </div>
          {todayWords.length ? (
            <div className="flip-grid">
              {todayWords.map((w) => (
                <WordCard key={w.id} word={w} />
              ))}
            </div>
          ) : (
            <div className="empty">🎉 今天已经全部完成，明天再来吧！</div>
          )}
        </div>
      )}

      {activeTab === "formation" && (
        <div
          id="panel-formation"
          role="tabpanel"
          aria-labelledby="tab-formation"
          tabIndex={-1}
        >
          <div className="section-title">
            <IconPuzzle size={16} /> 组词练习 · 用同一词根/基础词拼出更多词
          </div>
          <FormationPractice
            challenges={challenges}
            formationDone={progress.formationDone}
            onComplete={handleCompleteFormation}
            onResult={handleFormationResult}
          />
        </div>
      )}

      {activeTab === "challenge" && (
        <div
          id="panel-challenge"
          role="tabpanel"
          aria-labelledby="tab-challenge"
          tabIndex={-1}
        >
          <div className="section-title">
            <IconTrophy size={16} /> 闯关积分 · 你的成长看板
          </div>
          <ChallengePanel progress={progress} />
          <div className="card" style={{ marginTop: 14 }}>
            <h2>全部词库（{bank.length} 词）</h2>
            <div className="hint">本年龄段可学的全部单词，坚持每天打卡解锁更多</div>
            <div>
              {bank.map((w) => (
                <span className="tag" key={w.id}>
                  {w.word}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bottomnav">
        <button
          className={activeTab === "words" ? "active" : ""}
          onClick={() => setActiveTab("words")}
        >
          <IconBook size={18} /> 单词
        </button>
        <button
          className={activeTab === "formation" ? "active" : ""}
          onClick={() => setActiveTab("formation")}
        >
          <IconPuzzle size={18} /> 组词
        </button>
        <button
          className={activeTab === "challenge" ? "active" : ""}
          onClick={() => setActiveTab("challenge")}
        >
          <IconTrophy size={18} /> 闯关
        </button>
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        syncState={syncState}
        cloudOn={isCloudOn()}
        syncCode={getSyncCode() || ""}
        onToggleCloud={handleToggleCloud}
        onSaveCode={handleSaveCode}
        onPull={handlePull}
        onExport={() => exportJSON(progress)}
        onImport={handleImport}
        onClear={handleClear}
      />

      <Celebration />

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </main>
  );
}
