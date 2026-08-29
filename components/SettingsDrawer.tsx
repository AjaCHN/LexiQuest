"use client";
import { useEffect, useRef, useState } from "react";
import { IconClose, IconDownload, IconUpload, IconTrash, IconSync, IconSun, IconMoon } from "./Icons";

type SyncState = "local" | "syncing" | "synced" | "offline";

export default function SettingsDrawer({
  open,
  onClose,
  theme,
  onToggleTheme,
  syncState,
  cloudOn,
  syncCode,
  onToggleCloud,
  onSaveCode,
  onPull,
  onExport,
  onImport,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  syncState: SyncState;
  cloudOn: boolean;
  syncCode: string;
  onToggleCloud: (on: boolean) => void;
  onSaveCode: (code: string) => void;
  onPull: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClear: () => void;
}) {
  const [code, setCode] = useState(syncCode);
  const [confirmClear, setConfirmClear] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmClear) setConfirmClear(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    drawerRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, confirmClear]);
  if (!open) return null;

  const stateLabel: Record<SyncState, string> = {
    local: "本地模式",
    syncing: "同步中…",
    synced: "已同步",
    offline: "离线",
  };

  return (
    <div id="settings-drawer-overlay" className="overlay" onClick={onClose}>
    <div
      id="settings-drawer"
      className="drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      tabIndex={-1}
      ref={drawerRef}
      onClick={(e) => e.stopPropagation()}
    >
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2 id="settings-title">设置</h2>
          <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="field">
          <label>外观</label>
          <button className="btn" onClick={onToggleTheme} style={{ width: "100%" }}>
            {theme === "dark" ? <IconSun /> : <IconMoon />}
            {theme === "dark" ? "切换到浅色" : "切换到深色"}
          </button>
        </div>

        <div className="field">
          <label>云端多设备同步（EdgeOne KV）</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span className={"sync-state " + syncState}>
              <span className="dot" /> {stateLabel[syncState]}
            </span>
            <button
              className={"btn sm " + (cloudOn ? "primary" : "ghost")}
              onClick={() => onToggleCloud(!cloudOn)}
            >
              <IconSync size={15} /> {cloudOn ? "已开启" : "开启同步"}
            </button>
          </div>
          <input
            type="text"
            aria-label="云端同步码"
            placeholder="设置同步码（多设备填同一个即可共享）"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className="note">
            同步码相当于你的“云空间钥匙”。在手机和电脑上填同一个同步码，数据即可跨设备共享。
            同步码仅用于定位云端数据，请牢记；忘记则无法找回对应云端数据。
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              className="btn sm"
              onClick={() => {
                onSaveCode(code.trim());
                onPull();
              }}
            >
              保存并拉取云端
            </button>
          </div>
        </div>

        <div className="field">
          <label>数据备份</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn sm" onClick={onExport}>
              <IconDownload size={15} /> 导出 JSON
            </button>
            <button
              type="button"
              className="btn sm"
              onClick={() => fileRef.current?.click()}
            >
              <IconUpload size={15} /> 导入恢复
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              aria-hidden="true"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImport(f);
                e.target.value = "";
              }}
            />
          </div>
          <div className="note">
            本地数据存于浏览器，建议定期导出备份。导入会覆盖当前数据。
          </div>
        </div>

        <div className="field">
          <label>危险区</label>
          <button className="btn danger sm" onClick={() => setConfirmClear(true)}>
            <IconTrash size={15} /> 清空全部数据
          </button>
        </div>
      </div>

      {confirmClear && (
        <div
          className="modal"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          onClick={() => setConfirmClear(false)}
        >
          <div className="box" onClick={(e) => e.stopPropagation()}>
            <h3 id="confirm-title">确认清空？</h3>
            <p>
              将删除本机全部学习进度、积分与闯关记录，且无法恢复（云端数据不受影响）。
            </p>
            <div className="acts">
              <button className="btn ghost" onClick={() => setConfirmClear(false)}>
                取消
              </button>
              <button
                className="btn danger"
                onClick={() => {
                  onClear();
                  setConfirmClear(false);
                }}
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
