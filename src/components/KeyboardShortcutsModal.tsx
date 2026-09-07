"use client";

import { X, Command, Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ["Ctrl", "Enter"], description: "Run code in active editor immediately" },
  { keys: ["F5"], description: "Run code in active editor" },
  { keys: ["Ctrl", "S"], description: "Save current active file" },
  { keys: ["Ctrl", "B"], description: "Toggle File Explorer & Git sidebar" },
  { keys: ["Ctrl", "K"], description: "Focus AI assistant chat prompt" },
  { keys: ["Ctrl", "`"], description: "Toggle Terminal & Output panel" },
  { keys: ["Ctrl", "Shift", "N"], description: "Create new file in workspace" },
  { keys: ["Enter"], description: "Send chat prompt (in AI input)" },
  { keys: ["Shift", "Enter"], description: "Insert newline in AI input" },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Keyboard Shortcuts</h2>
              <p className="text-[11px] text-zinc-400">Boost your workflow with IDE hotkeys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-800/80"
            >
              <span className="text-xs text-zinc-300">{sc.description}</span>
              <div className="flex items-center gap-1">
                {sc.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-2 py-1 text-[11px] font-mono font-medium text-zinc-200 bg-zinc-800 border border-zinc-700 rounded shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/60 text-center text-[11px] text-zinc-500">
          Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px]">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
