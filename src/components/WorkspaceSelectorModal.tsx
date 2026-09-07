"use client";

import { useState, useEffect } from "react";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ArrowUp,
  Check,
  X,
  Search,
  FolderTree,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface WorkspaceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoot: string;
  onSelectWorkspace: (newPath: string) => Promise<void>;
}

export function WorkspaceSelectorModal({
  isOpen,
  onClose,
  currentRoot,
  onSelectWorkspace,
}: WorkspaceSelectorModalProps) {
  const [browsePath, setBrowsePath] = useState(currentRoot);
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [directories, setDirectories] = useState<{ name: string; path: string }[]>([]);
  const [suggested, setSuggested] = useState<{ name: string; path: string }[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [manualInput, setManualInput] = useState(currentRoot);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadDirectory = async (targetPath: string) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/fs/browse?path=${encodeURIComponent(targetPath)}`);
      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setBrowsePath(data.current);
        setParentPath(data.parent);
        setDirectories(data.directories || []);
        if (data.suggested) setSuggested(data.suggested);
        setManualInput(data.current);
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDirectory(currentRoot || "C:\\");
    }
  }, [isOpen, currentRoot]);

  if (!isOpen) return null;

  const handleOpenSelected = async (targetPath: string) => {
    await onSelectWorkspace(targetPath);
    onClose();
  };

  const filteredDirs = directories.filter((d) =>
    d.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Switch Workspace Folder</h2>
              <p className="text-[11px] text-zinc-400">
                Open any project from VS Code, React apps, or other folders on your PC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Path Input & Navigator Bar */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualInput.trim()) loadDirectory(manualInput.trim());
            }}
            className="flex items-center gap-2"
          >
            {parentPath && (
              <button
                type="button"
                onClick={() => loadDirectory(parentPath)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors flex-shrink-0"
                title={`Up to parent directory: ${parentPath}`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="flex-1 flex items-center bg-zinc-850 rounded-lg border border-zinc-750 px-3 py-1.5 focus-within:border-violet-500">
              <Folder className="w-3.5 h-3.5 text-amber-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Type or paste folder path (e.g. C:\Users\himan\VS Code\chai aur react)"
                className="w-full bg-transparent text-xs text-zinc-100 focus:outline-none font-mono placeholder-zinc-500"
              />
            </div>

            <button
              type="button"
              onClick={() => handleOpenSelected(manualInput.trim())}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-xs flex-shrink-0 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Open This Folder</span>
            </button>
          </form>

          {/* Quick Suggested Project Folders */}
          {suggested.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 mr-1 flex-shrink-0">
                Quick Shortcuts:
              </span>
              {suggested.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => loadDirectory(s.path)}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 text-[11px] text-zinc-300 hover:text-violet-300 font-mono flex-shrink-0 transition-colors"
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subdirectories Search Filter */}
        <div className="px-4 pt-3 pb-2 border-b border-zinc-850 flex items-center justify-between">
          <div className="flex items-center bg-zinc-850/80 rounded border border-zinc-800 px-2.5 py-1 w-64">
            <Search className="w-3 h-3 text-zinc-500 mr-1.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter subfolders..."
              className="w-full bg-transparent text-xs text-zinc-200 focus:outline-none placeholder-zinc-500"
            />
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            {filteredDirs.length} folders found
          </span>
        </div>

        {/* Directory List Browser */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-500 gap-2">
              <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              <span className="text-xs font-mono">Reading directory contents...</span>
            </div>
          ) : errorMsg ? (
            <div className="p-4 rounded-lg bg-red-950/30 border border-red-900/50 text-red-300 text-xs">
              ⚠️ {errorMsg}
            </div>
          ) : filteredDirs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-zinc-500 gap-2 text-center">
              <FolderOpen className="w-8 h-8 opacity-30 text-zinc-400" />
              <p className="text-xs text-zinc-400">No subdirectories in this path</p>
              <p className="text-[11px] text-zinc-600">
                You can click &quot;Open This Folder&quot; above to select this directory as your active workspace.
              </p>
            </div>
          ) : (
            filteredDirs.map((dir) => (
              <div
                key={dir.path}
                className="group flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/80 transition-colors border border-transparent hover:border-zinc-700/60"
              >
                <div
                  onClick={() => loadDirectory(dir.path)}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                >
                  <Folder className="w-4 h-4 text-amber-400 group-hover:text-amber-300 flex-shrink-0" />
                  <span className="text-xs font-medium text-zinc-200 group-hover:text-white truncate font-mono">
                    {dir.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => loadDirectory(dir.path)}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono"
                    title="Browse into folder"
                  >
                    Browse
                  </button>
                  <button
                    onClick={() => handleOpenSelected(dir.path)}
                    className="px-2.5 py-0.5 rounded bg-violet-600/80 hover:bg-violet-600 text-white text-[10px] font-semibold flex items-center gap-1"
                  >
                    <span>Select</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Active: <code className="text-violet-400 font-mono">{currentRoot}</code></span>
          <button
            onClick={() => handleOpenSelected(browsePath)}
            className="text-violet-400 hover:text-violet-300 font-semibold"
          >
            Open Current Path →
          </button>
        </div>
      </div>
    </div>
  );
}
