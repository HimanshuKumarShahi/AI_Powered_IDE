"use client";

import { useState, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode2,
  FileText,
  FilePlus,
  FolderPlus,
  RefreshCw,
  Trash2,
  FolderInput,
  Search,
  Upload,
  X,
  Check,
  FolderTree,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileNode } from "@/lib/types";

// ── Colored Icon Helper for Sleek Developer Aesthetic ──────────────────────────
function getFileBadge(extension?: string) {
  const ext = extension?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
      return <span className="w-4 text-center text-[10px] font-bold text-sky-400 font-mono">TS</span>;
    case "js":
    case "jsx":
    case "mjs":
      return <span className="w-4 text-center text-[10px] font-bold text-yellow-400 font-mono">JS</span>;
    case "py":
      return <span className="w-4 text-center text-[10px] font-bold text-blue-400 font-mono">PY</span>;
    case "rs":
      return <span className="w-4 text-center text-[10px] font-bold text-orange-400 font-mono">RS</span>;
    case "cpp":
    case "c":
    case "h":
    case "hpp":
      return <span className="w-4 text-center text-[10px] font-bold text-indigo-400 font-mono">C+</span>;
    case "java":
      return <span className="w-4 text-center text-[10px] font-bold text-amber-500 font-mono">JV</span>;
    case "json":
      return <span className="w-4 text-center text-[10px] font-bold text-amber-300 font-mono">{}</span>;
    case "md":
    case "mdx":
      return <span className="w-4 text-center text-[10px] font-bold text-teal-400 font-mono">MD</span>;
    case "css":
    case "scss":
      return <span className="w-4 text-center text-[10px] font-bold text-pink-400 font-mono">#</span>;
    default:
      return <FileText className="w-3.5 h-3.5 text-zinc-500" />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
interface FileTreeNodeProps {
  node: FileNode;
  activeFile: string | null;
  onFileClick: (path: string) => void;
  onDelete: (path: string) => void;
  depth: number;
}

function FileTreeNode({
  node,
  activeFile,
  onFileClick,
  onDelete,
  depth,
}: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const indent = depth * 14 + 10;

  if (node.type === "directory") {
    return (
      <div>
        <div
          className="group flex items-center justify-between py-[3px] pr-2 hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          style={{ paddingLeft: indent }}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-3.5 h-3.5 flex items-center justify-center text-zinc-500 group-hover:text-zinc-300">
              {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
            {isOpen ? (
              <FolderOpen className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-amber-500/80 flex-shrink-0" />
            )}
            <span className="text-xs font-medium truncate">{node.name}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete folder "${node.name}" and all its contents?`)) {
                onDelete(node.path);
              }
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-zinc-500 transition-opacity"
            title="Delete Folder"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {isOpen &&
          node.children?.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              activeFile={activeFile}
              onFileClick={onFileClick}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
      </div>
    );
  }

  const isActive = activeFile === node.path;

  return (
    <div
      onClick={() => onFileClick(node.path)}
      className={cn(
        "group flex items-center justify-between py-[3px] pr-2 text-xs transition-colors cursor-pointer",
        isActive
          ? "bg-violet-500/15 text-violet-300 border-l-2 border-violet-500"
          : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 border-l-2 border-transparent"
      )}
      style={{ paddingLeft: isActive ? indent - 2 : indent }}
      title={node.path}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex-shrink-0 flex items-center justify-center">
          {getFileBadge(node.extension)}
        </span>
        <span className="truncate">{node.name}</span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (confirm(`Delete file "${node.name}"?`)) {
            onDelete(node.path);
          }
        }}
        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-zinc-500 transition-opacity"
        title="Delete File"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
interface FileExplorerProps {
  tree: FileNode[];
  activeFile: string | null;
  workspaceRoot: string;
  onFileClick: (path: string) => void;
  onRefresh: () => void;
  onCreateFile: (fileName: string) => Promise<void>;
  onCreateFolder: (folderName: string) => Promise<void>;
  onDeleteNode: (path: string) => Promise<void>;
  onChangeWorkspace: (newPath: string) => Promise<void>;
  onOpenWorkspaceModal?: () => void;
  onDropFiles: (files: FileList) => Promise<void>;
  isLoading?: boolean;
}

export function FileExplorer({
  tree,
  activeFile,
  workspaceRoot,
  onFileClick,
  onRefresh,
  onCreateFile,
  onCreateFolder,
  onDeleteNode,
  onChangeWorkspace,
  onOpenWorkspaceModal,
  onDropFiles,
  isLoading,
}: FileExplorerProps) {
  const [filter, setFilter] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    if (isCreatingFile) {
      await onCreateFile(newItemName.trim());
      setIsCreatingFile(false);
    } else if (isCreatingFolder) {
      await onCreateFolder(newItemName.trim());
      setIsCreatingFolder(false);
    }
    setNewItemName("");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await onDropFiles(e.dataTransfer.files);
    }
  };

  // Filter nodes recursively
  const filterTree = (nodes: FileNode[], query: string): FileNode[] => {
    if (!query) return nodes;
    const lower = query.toLowerCase();
    return nodes
      .map((node) => {
        if (node.type === "file") {
          return node.name.toLowerCase().includes(lower) ? node : null;
        }
        const filteredChildren = filterTree(node.children || [], query);
        if (node.name.toLowerCase().includes(lower) || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean) as FileNode[];
  };

  const visibleTree = filterTree(tree, filter);
  const rootFolderName =
    workspaceRoot.replace(/\\/g, "/").split("/").filter(Boolean).pop() || "workspace";

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col h-full overflow-hidden relative",
        isDraggingOver && "ring-2 ring-violet-500 bg-violet-500/5"
      )}
    >
      {/* Drag overlay notice */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-violet-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-30 pointer-events-none p-4 text-center">
          <Upload className="w-8 h-8 text-violet-400 animate-bounce mb-2" />
          <p className="text-xs font-semibold text-violet-200">Drop files here to open / upload</p>
        </div>
      )}

      {/* ── Workspace Root Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/40">
        <div
          onClick={onOpenWorkspaceModal}
          className="flex items-center gap-1.5 min-w-0 cursor-pointer hover:text-zinc-100 text-zinc-400 group"
          title={`Active Workspace: ${workspaceRoot}\nClick to switch workspace folder`}
        >
          <Folder className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
          <span className="text-xs font-bold font-mono tracking-tight truncate group-hover:text-violet-300">
            {rootFolderName}
          </span>
          <FolderTree className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsCreatingFile(true);
              setIsCreatingFolder(false);
              setNewItemName("");
            }}
            className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="New File (Ctrl+Shift+N)"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setIsCreatingFolder(true);
              setIsCreatingFile(false);
              setNewItemName("");
            }}
            className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenWorkspaceModal}
            className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Switch Workspace Folder (React apps, etc.)"
          >
            <FolderInput className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            onClick={() => setShowSearch((prev) => !prev)}
            className={cn(
              "p-1 rounded transition-colors",
              showSearch ? "text-violet-400 bg-zinc-800" : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
            )}
            title="Search / Filter Files"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRefresh}
            className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Refresh Files"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Search Input ── */}
      {showSearch && (
        <div className="p-2 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center bg-zinc-850/80 rounded border border-zinc-700/60 px-2 py-1">
            <Search className="w-3 h-3 text-zinc-500 mr-1.5 flex-shrink-0" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter files..."
              className="w-full bg-transparent text-xs text-zinc-200 focus:outline-none placeholder-zinc-500"
              autoFocus
            />
            {filter && (
              <button onClick={() => setFilter("")} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Inline Creation Input ── */}
      {(isCreatingFile || isCreatingFolder) && (
        <form onSubmit={handleCreateSubmit} className="px-3 py-2 border-b border-zinc-800 bg-zinc-900/80 flex items-center gap-2">
          {isCreatingFile ? (
            <FilePlus className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
          ) : (
            <FolderPlus className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          )}
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={isCreatingFile ? "e.g. App.tsx, script.py" : "e.g. components, src"}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 font-mono"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsCreatingFile(false);
                setIsCreatingFolder(false);
              }
            }}
          />
          <button type="submit" className="p-1 rounded bg-violet-600 hover:bg-violet-500 text-white">
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreatingFile(false);
              setIsCreatingFolder(false);
            }}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-3 h-3" />
          </button>
        </form>
      )}

      {/* ── File Tree Body ── */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-zinc-600 gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-violet-400" />
            <span className="text-[11px]">Scanning workspace...</span>
          </div>
        ) : visibleTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-600 gap-2 px-4 text-center">
            <Folder className="w-8 h-8 opacity-30 text-zinc-400" />
            <p className="text-xs text-zinc-400">No files in this workspace</p>
            <button
              onClick={onOpenWorkspaceModal}
              className="text-[11px] text-violet-400 hover:text-violet-300 underline mt-1"
            >
              Open a different project folder
            </button>
          </div>
        ) : (
          visibleTree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              activeFile={activeFile}
              onFileClick={onFileClick}
              onDelete={onDeleteNode}
              depth={0}
            />
          ))
        )}
      </div>

      {/* ── Explorer Bottom Info ── */}
      <div
        onClick={onOpenWorkspaceModal}
        className="px-3 py-2 border-t border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between text-[10px] text-zinc-400 hover:text-zinc-200 cursor-pointer font-mono transition-colors"
        title="Click to switch workspace folder"
      >
        <span className="flex items-center gap-1">
          <FolderTree className="w-3 h-3 text-violet-400" />
          <span>Switch Folder</span>
        </span>
        <span className="truncate max-w-[140px] text-zinc-500">
          {workspaceRoot.slice(-22)}
        </span>
      </div>
    </div>
  );
}
