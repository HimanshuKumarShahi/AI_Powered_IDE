"use client";

import { X, FileCode, Plus, ChevronRight, Circle } from "lucide-react";
import type { EditorTab } from "@/lib/types";

interface EditorTabBarProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
}

export function EditorTabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}: EditorTabBarProps) {
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const breadcrumbParts = activeTab
    ? activeTab.path.replace(/\\/g, "/").split("/").filter(Boolean)
    : [];

  return (
    <div className="flex flex-col bg-zinc-900 border-b border-zinc-800 flex-shrink-0">
      {/* ── Tabs Row ── */}
      <div className="flex items-center h-9 overflow-x-auto no-scrollbar border-b border-zinc-850">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3 h-full border-r border-zinc-800 text-xs cursor-pointer transition-colors select-none ${
                isActive
                  ? "bg-zinc-950 text-zinc-100 font-medium"
                  : "bg-zinc-900/60 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-violet-500" />
              )}

              <FileCode className={`w-3.5 h-3.5 ${isActive ? "text-violet-400" : "text-zinc-500"}`} />
              <span className="truncate max-w-[140px] font-mono text-[11px]">{tab.name}</span>

              {/* Dirty indicator / Close button */}
              <div className="flex items-center ml-1">
                {tab.isDirty ? (
                  <Circle className="w-2 h-2 fill-amber-400 text-amber-400 group-hover:hidden" />
                ) : null}
                <button
                  onClick={(e) => onCloseTab(tab.id, e)}
                  className={`p-0.5 rounded hover:bg-zinc-800 hover:text-zinc-200 text-zinc-500 transition-colors ${
                    tab.isDirty ? "hidden group-hover:block" : ""
                  }`}
                  title="Close (Ctrl+W)"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        <button
          onClick={onNewTab}
          className="px-2.5 h-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850 transition-colors flex items-center justify-center"
          title="New Untitled Tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Breadcrumbs Bar ── */}
      {breadcrumbParts.length > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950/60 text-[11px] text-zinc-500 font-mono overflow-x-auto no-scrollbar">
          {breadcrumbParts.slice(-4).map((part, index, arr) => (
            <div key={index} className="flex items-center gap-1.5 flex-shrink-0">
              <span className={index === arr.length - 1 ? "text-zinc-300 font-semibold" : ""}>
                {part}
              </span>
              {index < arr.length - 1 && <ChevronRight className="w-3 h-3 text-zinc-700" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
