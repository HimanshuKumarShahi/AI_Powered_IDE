"use client";

import { useState } from "react";
import {
  Play,
  Loader2,
  Save,
  Cpu,
  Zap,
  GitBranch,
  Code2,
  ChevronDown,
  Keyboard,
  Sparkles,
  Server,
  FolderTree,
} from "lucide-react";
import { LANGUAGES } from "@/lib/languages";
import { ModelSelectorModal } from "./ModelSelectorModal";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import type { Language, GitStatus, AIModel } from "@/lib/types";

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onRunCode: () => void;
  isRunning: boolean;
  selectedModel: AIModel;
  onSelectModel: (model: AIModel) => void;
  onSaveFile: () => void;
  activeFile: string | null;
  gitStatus: GitStatus | null;
  runnerEngine?: string;
  onOpenCodeboxModal?: () => void;
  onOpenWorkspaceModal?: () => void;
}

export function Header({
  language,
  onLanguageChange,
  onRunCode,
  isRunning,
  selectedModel,
  onSelectModel,
  onSaveFile,
  activeFile,
  gitStatus,
  runnerEngine = "Native Host Runner",
  onOpenCodeboxModal,
  onOpenWorkspaceModal,
}: HeaderProps) {
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const changedCount =
    (gitStatus?.modified.length ?? 0) +
    (gitStatus?.untracked.length ?? 0) +
    (gitStatus?.staged.length ?? 0);

  const activeFileName = activeFile
    ? activeFile.replace(/\\/g, "/").split("/").pop()
    : null;

  return (
    <>
      <header className="flex items-center justify-between px-3 h-12 bg-zinc-900 border-b border-zinc-800/80 flex-shrink-0 z-20">
        {/* ── Left: Logo + Workspace + Git ── */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-violet-500/20">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-100 font-bold text-sm tracking-tight font-mono">
                Nexus<span className="text-violet-400">IDE</span>
              </span>
              <span className="text-[9px] text-violet-400 bg-violet-400/10 border border-violet-400/20 px-1 py-0.2 rounded font-mono font-semibold leading-none">
                PRO
              </span>
            </div>
          </div>

          {/* Quick Workspace Switcher button in header */}
          <button
            onClick={onOpenWorkspaceModal}
            className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 bg-zinc-800/50 hover:bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-800 transition-colors cursor-pointer"
            title="Switch Workspace Folder (React apps, Python folders, etc.)"
          >
            <FolderTree className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-zinc-300 truncate max-w-[140px]">
              {activeFileName ? activeFileName : "Switch Folder"}
            </span>
          </button>

          {gitStatus?.branch && (
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-800/50 border border-zinc-800 px-2 py-1 rounded-md">
              <GitBranch className="w-3 h-3 text-zinc-500" />
              <span className="font-mono text-zinc-300">{gitStatus.branch}</span>
              {changedCount > 0 && (
                <span className="text-[10px] text-amber-400 font-semibold">+{changedCount}</span>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Controls (Model Selector, Language, Codebox, Run, Save, Shortcuts) ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* ── Premium Model Selector Button ── */}
          <button
            onClick={() => setIsModelModalOpen(true)}
            className="flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/70 hover:border-violet-500/50 rounded-lg px-2.5 py-1.5 transition-all text-left group shadow-xs cursor-pointer"
            title="Choose AI Model (Google Gemini Cloud / Offline Llama)"
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center ${
                selectedModel.isLocal
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "bg-violet-500/15 text-violet-400 border border-violet-500/30"
              }`}
            >
              {selectedModel.isLocal ? (
                <Cpu className="w-3 h-3" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                  {selectedModel.name}
                </span>
                <span
                  className={`text-[8px] font-mono px-1 py-0.2 rounded uppercase font-semibold ${
                    selectedModel.isLocal
                      ? "bg-amber-400/10 text-amber-400"
                      : "bg-violet-400/10 text-violet-400"
                  }`}
                >
                  {selectedModel.isLocal ? "OFFLINE" : "CLOUD"}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 ml-0.5" />
          </button>

          {/* ── Codebox / Runner Engine Button ── */}
          <button
            onClick={onOpenCodeboxModal}
            className="hidden md:flex items-center gap-1.5 text-[11px] font-mono font-medium px-2.5 py-1.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/60 hover:border-orange-500/40 transition-colors cursor-pointer"
            title="Hitesh Sir's Codebox Engine & Diagnostics"
          >
            <Server className="w-3 h-3 text-orange-400" />
            <span className="text-zinc-300">Codebox</span>
          </button>

          {/* ── Language Selector ── */}
          <div className="relative">
            <select
              value={language.id}
              onChange={(e) => {
                const lang = LANGUAGES.find((l) => l.id === Number(e.target.value));
                if (lang) onLanguageChange(lang);
              }}
              className="bg-zinc-800 hover:bg-zinc-800/90 text-zinc-200 text-xs border border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-violet-500 cursor-pointer font-medium appearance-none pr-7 shadow-xs"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* ── Save Button with Shortcut ── */}
          {activeFile && (
            <button
              onClick={onSaveFile}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 transition-colors cursor-pointer"
              title="Save File (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono text-[10px] text-zinc-500">Ctrl+S</span>
            </button>
          )}

          {/* ── Run Code Button with Shortcut Badge ── */}
          <button
            onClick={onRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm shadow-emerald-950 transition-all cursor-pointer group"
            title="Execute Code (Ctrl+Enter or F5)"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>{isRunning ? "Running..." : "Run"}</span>
            <kbd className="hidden sm:inline ml-1 px-1.5 py-0.2 text-[9px] font-mono bg-emerald-700/60 group-disabled:bg-zinc-700 text-emerald-200 rounded">
              Ctrl+↵
            </kbd>
          </button>

          {/* ── Shortcuts Modal Toggle ── */}
          <button
            onClick={() => setIsShortcutsModalOpen(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── Modals ── */}
      <ModelSelectorModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        selectedModel={selectedModel}
        onSelectModel={onSelectModel}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </>
  );
}
