"use client";

import { useState } from "react";
import { GitCommit, Check, RefreshCw, GitBranch, Plus, Minus } from "lucide-react";
import type { GitStatus } from "@/lib/types";

interface GitPanelProps {
  status: GitStatus | null;
  onCommit: (files: string[], message: string) => Promise<void>;
  onRefresh: () => void;
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  staged:    { label: "S", color: "text-emerald-400" },
  modified:  { label: "M", color: "text-yellow-400" },
  untracked: { label: "U", color: "text-blue-400" },
  deleted:   { label: "D", color: "text-red-400" },
};

export function GitPanel({ status, onCommit, onRefresh }: GitPanelProps) {
  const [commitMessage, setCommitMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isCommitting, setIsCommitting] = useState(false);

  const allChanges = [
    ...(status?.staged    ?? []).map((f) => ({ path: f, status: "staged"    as const })),
    ...(status?.modified  ?? []).map((f) => ({ path: f, status: "modified"  as const })),
    ...(status?.untracked ?? []).map((f) => ({ path: f, status: "untracked" as const })),
    ...(status?.deleted   ?? []).map((f) => ({ path: f, status: "deleted"   as const })),
  ];

  const toggleFile = (filePath: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      next.has(filePath) ? next.delete(filePath) : next.add(filePath);
      return next;
    });
  };

  const selectAll = () =>
    setSelectedFiles(new Set(allChanges.map((f) => f.path)));

  const deselectAll = () => setSelectedFiles(new Set());

  const handleCommit = async () => {
    if (!commitMessage.trim() || selectedFiles.size === 0) return;
    setIsCommitting(true);
    try {
      await onCommit(Array.from(selectedFiles), commitMessage);
      setCommitMessage("");
      setSelectedFiles(new Set());
    } finally {
      setIsCommitting(false);
    }
  };

  if (!status) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-700 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <p className="text-xs">Loading git status...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Branch bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <GitBranch className="w-3.5 h-3.5 text-zinc-600" />
          <span className="font-mono">{status.branch ?? "unknown"}</span>
          {status.error && (
            <span className="text-red-400 text-[10px]">({status.error})</span>
          )}
        </div>
        <button
          onClick={onRefresh}
          className="text-zinc-600 hover:text-zinc-400 transition-colors"
          title="Refresh git status"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {allChanges.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-700 gap-2">
          <Check className="w-6 h-6 text-emerald-700" />
          <p className="text-xs">Working tree clean</p>
        </div>
      ) : (
        <>
          {/* File list */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">
                Changes ({allChanges.length})
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  All
                </button>
                <button
                  onClick={deselectAll}
                  className="text-[10px] text-zinc-600 hover:text-zinc-400 flex items-center gap-0.5"
                >
                  <Minus className="w-2.5 h-2.5" />
                  None
                </button>
              </div>
            </div>

            {allChanges.map(({ path: filePath, status: fileStatus }) => {
              const badge = STATUS_BADGE[fileStatus];
              const fileName = filePath.replace(/\\/g, "/").split("/").pop();
              return (
                <label
                  key={filePath}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800/50 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(filePath)}
                    onChange={() => toggleFile(filePath)}
                    className="w-3 h-3 accent-violet-500 flex-shrink-0"
                  />
                  <span
                    className={`text-[10px] font-bold font-mono w-3.5 flex-shrink-0 ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-400 group-hover:text-zinc-200 truncate">
                      {fileName}
                    </p>
                    <p className="text-[9px] text-zinc-700 truncate font-mono">
                      {filePath}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Commit section */}
          <div className="border-t border-zinc-800 p-3 space-y-2 flex-shrink-0">
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Commit message (required)..."
              rows={2}
              className="w-full bg-zinc-800 text-zinc-200 text-xs border border-zinc-700 rounded-md p-2 resize-none focus:outline-none focus:border-violet-500 placeholder-zinc-600"
            />
            <button
              onClick={handleCommit}
              disabled={
                !commitMessage.trim() ||
                selectedFiles.size === 0 ||
                isCommitting
              }
              className="w-full flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-semibold py-2 rounded-md transition-colors"
            >
              {isCommitting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <GitCommit className="w-3.5 h-3.5" />
              )}
              {isCommitting
                ? "Committing..."
                : `Commit${selectedFiles.size > 0 ? ` (${selectedFiles.size})` : ""}`}
            </button>
            <p className="text-[10px] text-zinc-700 text-center">
              Local only — no remote push
            </p>
          </div>
        </>
      )}
    </div>
  );
}
