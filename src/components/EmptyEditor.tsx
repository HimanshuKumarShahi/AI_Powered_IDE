"use client";

import {
  FilePlus,
  FolderTree,
  Terminal,
  Sparkles,
  Command,
  Keyboard,
  Code2,
  Play,
  ArrowRight,
} from "lucide-react";

interface EmptyEditorProps {
  onNewFile: () => void;
  onOpenFolder: () => void;
  onOpenShortcuts: () => void;
  workspaceRoot: string;
}

export function EmptyEditor({
  onNewFile,
  onOpenFolder,
  onOpenShortcuts,
  workspaceRoot,
}: EmptyEditorProps) {
  const shortRoot = workspaceRoot.replace(/\\/g, "/").split("/").slice(-2).join("/");

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-950 p-6 text-center select-none overflow-y-auto">
      {/* Brand & Title */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Code2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight font-mono">
            Nexus<span className="text-violet-400">IDE</span> <span className="text-xs font-normal text-zinc-500 font-sans">PRO</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            No open files in <code className="text-violet-400 font-mono text-[11px]">{shortRoot}</code>
          </p>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full mb-6">
        <button
          onClick={onNewFile}
          className="group flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-violet-500/40 transition-all text-left shadow-xs cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
            <FilePlus className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">New File</span>
              <kbd className="text-[9px] font-mono text-zinc-500 bg-zinc-800 px-1 rounded">Ctrl+Shift+N</kbd>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Create untitled scratchpad or script</p>
          </div>
        </button>

        <button
          onClick={onOpenFolder}
          className="group flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/40 transition-all text-left shadow-xs cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">Switch Folder</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Open React, Python, or VS Code apps</p>
          </div>
        </button>
      </div>

      {/* Keyboard Shortcuts Hint Bar */}
      <div
        onClick={onOpenShortcuts}
        className="flex items-center gap-4 text-xs text-zinc-500 font-mono bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-300 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px]">Ctrl+Enter</kbd>
          <span>Run</span>
        </span>
        <span>·</span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px]">Ctrl+S</kbd>
          <span>Save</span>
        </span>
        <span>·</span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px]">Ctrl+B</kbd>
          <span>Sidebar</span>
        </span>
      </div>
    </div>
  );
}
