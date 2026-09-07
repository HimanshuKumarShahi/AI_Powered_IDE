"use client";

import { GitBranch, Zap, Cpu, Keyboard, Sparkles } from "lucide-react";
import type { GitStatus, Language, AIModel } from "@/lib/types";

interface StatusBarProps {
  language: Language;
  selectedModel: AIModel;
  gitStatus: GitStatus | null;
  cursorPosition: { line: number; column: number };
  runnerEngine?: string;
  onOpenShortcuts: () => void;
}

export function StatusBar({
  language,
  selectedModel,
  gitStatus,
  cursorPosition,
  runnerEngine = "Native Host Runner",
  onOpenShortcuts,
}: StatusBarProps) {
  return (
    <footer className="h-6 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between px-3 text-[10px] text-zinc-400 font-mono select-none flex-shrink-0 z-10">
      {/* Left items */}
      <div className="flex items-center gap-3">
        {gitStatus?.branch && (
          <div className="flex items-center gap-1 hover:text-zinc-200 cursor-pointer">
            <GitBranch className="w-3 h-3 text-violet-400" />
            <span>{gitStatus.branch}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-emerald-400">
          <Zap className="w-3 h-3" />
          <span>{runnerEngine}</span>
        </div>
      </div>

      {/* Center items: Shortcut tip */}
      <div
        onClick={onOpenShortcuts}
        className="hidden md:flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
      >
        <Keyboard className="w-3 h-3 text-zinc-600" />
        <span>Ctrl+Enter: Run Code · Ctrl+S: Save · Ctrl+B: Toggle Sidebar</span>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
        </div>

        <span>UTF-8</span>

        <span className="text-zinc-300 font-semibold">{language.name}</span>

        <div className="flex items-center gap-1 text-violet-400 font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>{selectedModel.name}</span>
        </div>
      </div>
    </footer>
  );
}
