"use client";

import { useEffect, useMemo, useState } from "react";
import { AgeGroup, GROUP_META, WordEntry } from "../lib/types";
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
} from "../lib/storage";
import { wordsByGroup, formationByGroup } from "../lib/words";
import GroupSelector from "../components/GroupSelector";
import TodayPanel from "../components/TodayPanel";
import WordCard from "../components/WordCard";
import FormationPractice from "../components/FormationPractice";
import ChallengePanel from "../components/ChallengePanel";
import SettingsDrawer from "../components/SettingsDrawer";
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
    const { progress: np, gained } = toggleWord(progress, id);
    const res = ensureToday(np);
    saveProgress(res.progress);
    setProgress(res.progress);
    setPlan(res.plan);
    if (gained) showToast(gained > 0 ? `已完成 +${gained} 分` : `已取消 -${-gained} 分`);
    syncPush(res.progress);
  }

  function handleCompleteFormation(id: string) {
    if (!progress) return;
    const { progress: np, gained } = completeFormation(progress, id);
    saveProgress(np);
    setProgress(np);
    showToast(`组词完成 +${gained} 分`);
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
      <div className="app">
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
        {toast && <div className="toast">{toast}</div>}
      </div>
    );
  }

  const m = GROUP_META[progress.group];
  const bank = wordsByGroup(progress.group);
  const challenges = formationByGroup(progress.group);
  const todayWords = (plan?.wordIds || [])
    .map((id) => wordMap[id])
    .filter(Boolean) as WordEntry[];

  return (
    <div id="lexiquest-app" className="app">
      <div id="app-header" className="hd">
        <div className="logo">
          <IconLogo />
        </div>
        <div>
          <div className="ttl">英语闯关台</div>
          <div className="sub">多年龄段英语学习工作台</div>
        </div>
        <div className="spacer" />
        <button
          className="chip"
          style={{ background: m.color, color: "#fff", borderColor: "transparent" }}
          onClick={() => setProgress(null)}
          title="切换年龄段"
        >
          {m.name}
        </button>
        <span className="chip pts">
          <IconStar size={14} /> {progress.points}
        </span>
        <span className="chip flame">
          <IconFlame size={14} /> {progress.streak}
        </span>
        <button className="iconbtn" onClick={handleToggleTheme} title="切换主题">
          {theme === "dark" ? <IconSun /> : <IconMoon />}
        </button>
        <button className="iconbtn" onClick={() => setSettingsOpen(true)} title="设置">
          <IconSettings />
        </button>
      </div>

      <TodayPanel plan={plan!} wordMap={wordMap} onToggle={handleToggleWord} />

      <div id="main-tabs" className="tabs">
        <button
          className={activeTab === "words" ? "active" : ""}
          onClick={() => setActiveTab("words")}
        >
          <IconBook size={16} /> 每日单词
        </button>
        <button
          className={activeTab === "formation" ? "active" : ""}
          onClick={() => setActiveTab("formation")}
        >
          <IconPuzzle size={16} /> 组词练习
        </button>
        <button
          className={activeTab === "challenge" ? "active" : ""}
          onClick={() => setActiveTab("challenge")}
        >
          <IconTrophy size={16} /> 闯关积分
        </button>
      </div>

      {activeTab === "words" && (
        <>
          <div className="section-title">
            <IconBook size={16} /> 今日单词 · 点击卡片看拆分记忆
          </div>
          {todayWords.length ? (
            <div className="flip-grid">
              {todayWords.map((w) => (
                <WordCard key={w.id} word={w} />
              ))}
            </div>
          ) : (
            <div className="empty">今天没有安排，去“闯关积分”看看你的进度吧！</div>
          )}
        </>
      )}

      {activeTab === "formation" && (
        <>
          <div className="section-title">
            <IconPuzzle size={16} /> 组词练习 · 用同一词根/基础词拼出更多词
          </div>
          <FormationPractice
            challenges={challenges}
            formationDone={progress.formationDone}
            onComplete={handleCompleteFormation}
          />
        </>
      )}

      {activeTab === "challenge" && (
        <>
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
        </>
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

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
