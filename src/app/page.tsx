"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

import { Header } from "@/components/Header";
import { FileExplorer } from "@/components/FileExplorer";
import { GitPanel } from "@/components/GitPanel";
import { TerminalPanel } from "@/components/TerminalPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { EditorTabBar } from "@/components/EditorTabBar";
import { StatusBar } from "@/components/StatusBar";
import { EmptyEditor } from "@/components/EmptyEditor";
import { ResizableHandle } from "@/components/ResizableHandle";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { WorkspaceSelectorModal } from "@/components/WorkspaceSelectorModal";
import { CodeboxModal } from "@/components/CodeboxModal";

import { LANGUAGES } from "@/lib/languages";
import { AVAILABLE_MODELS } from "@/lib/models";
import type {
  Language,
  FileNode,
  ChatMessage,
  ExecutionResult,
  GitStatus,
  EditorTab,
  AIModel,
} from "@/lib/types";

// Monaco Editor loaded client-side only (no SSR)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-zinc-600">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-xs font-mono">Launching Monaco Editor...</span>
      </div>
    </div>
  ),
});

export default function IDEPage() {
  // ── Language State ──────────────────────────────────────────────────────────
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);

  // ── Multi-Tab Editor State ──────────────────────────────────────────────────
  const [tabs, setTabs] = useState<EditorTab[]>([
    {
      id: "tab-1",
      name: "main.py",
      path: "main.py",
      content: LANGUAGES[0].defaultCode,
      language: LANGUAGES[0].monacoLang,
      isDirty: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string | null>("tab-1");
  const activeTab = tabs.find((t) => t.id === activeTabId) || null;

  // ── AI State ────────────────────────────────────────────────────────────────
  const [selectedModel, setSelectedModel] = useState<AIModel>(AVAILABLE_MODELS[0]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiStreaming, setIsAiStreaming] = useState<boolean>(false);

  // ── Execution & Runner State ────────────────────────────────────────────────
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runnerEngine, setRunnerEngine] = useState<string>("Native Host Runner");

  // ── File System & Workspace State ───────────────────────────────────────────
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [workspaceRoot, setWorkspaceRoot] = useState<string>("");
  const [isFsLoading, setIsFsLoading] = useState<boolean>(true);

  // ── Git & Sidebar State ─────────────────────────────────────────────────────
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"files" | "git">("files");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // ── Modals State ────────────────────────────────────────────────────────────
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isCodeboxModalOpen, setIsCodeboxModalOpen] = useState(false);

  // ── Dimensions & Cursor ─────────────────────────────────────────────────────
  const [sidebarWidth, setSidebarWidth] = useState<number>(270);
  const [editorHeightPct, setEditorHeightPct] = useState<number>(58);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  const mainAreaRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  // ── Stable Refs for Monaco Shortcuts ────────────────────────────────────────
  const runCodeRef = useRef<() => void>(() => {});
  const saveFileRef = useRef<() => void>(() => {});

  // ── Load File Tree for current workspace ────────────────────────────────────
  const loadFileTree = useCallback(async (customPath?: string) => {
    setIsFsLoading(true);
    try {
      const target = customPath || workspaceRoot;
      const url = target ? `/api/fs?path=${encodeURIComponent(target)}` : "/api/fs";
      const res = await fetch(url);
      const data = await res.json();
      setFileTree(data.tree ?? []);
      if (data.root) setWorkspaceRoot(data.root);
    } catch (err) {
      console.error("Failed to load file tree:", err);
    } finally {
      setIsFsLoading(false);
    }
  }, [workspaceRoot]);

  // ── Load Git Status for current workspace ───────────────────────────────────
  const loadGitStatus = useCallback(async (customPath?: string) => {
    try {
      const target = customPath || workspaceRoot;
      const url = target ? `/api/git?repoPath=${encodeURIComponent(target)}` : "/api/git";
      const res = await fetch(url);
      const data = await res.json();
      setGitStatus(data);
    } catch (err) {
      console.error("Failed to load git status:", err);
    }
  }, [workspaceRoot]);

  useEffect(() => {
    loadFileTree();
    loadGitStatus();
    const interval = setInterval(() => loadGitStatus(), 10000);
    return () => clearInterval(interval);
  }, [loadFileTree, loadGitStatus]);

  // ── Code Change in Active Tab ───────────────────────────────────────────────
  const handleCodeChange = (newCode: string) => {
    if (!activeTabId) return;
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, content: newCode, isDirty: true }
          : tab
      )
    );
  };

  // ── Save Active File ────────────────────────────────────────────────────────
  const handleFileSave = useCallback(async () => {
    if (!activeTab) return;
    try {
      await fetch("/api/fs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: activeTab.path, content: activeTab.content }),
      });
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTab.id ? { ...t, isDirty: false } : t))
      );
    } catch (err) {
      console.error("Failed to save file:", err);
    }
  }, [activeTab]);

  useEffect(() => {
    saveFileRef.current = handleFileSave;
  }, [handleFileSave]);

  // ── Run Code (Dual Engine) ──────────────────────────────────────────────────
  const handleRunCode = useCallback(
    async (stdinInput?: string) => {
      if (!activeTab) return;
      setIsRunning(true);
      setExecutionResult(null);

      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_code: activeTab.content,
            language_id: language.id,
            stdin: stdinInput ?? "",
          }),
        });
        const data = await res.json();
        setExecutionResult(data);
        if (data.engine) {
          setRunnerEngine(data.engine);
        }
      } catch (err) {
        setExecutionResult({
          stdout: "",
          stderr: "",
          compile_output: "",
          status: { id: -1, description: "Network Error" },
          time: "0.00",
          memory: 0,
          error: (err as Error).message,
        });
      } finally {
        setIsRunning(false);
      }
    },
    [activeTab, language.id]
  );

  useEffect(() => {
    runCodeRef.current = handleRunCode;
  }, [handleRunCode]);

  // ── Keyboard Shortcuts Listener ─────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Ctrl+Enter or Cmd+Enter -> Run Code
      if (isCtrlOrCmd && (e.key === "Enter" || e.code === "Enter" || e.code === "NumpadEnter")) {
        e.preventDefault();
        runCodeRef.current();
      }
      // F5 -> Run Code
      else if (e.key === "F5" || e.code === "F5") {
        e.preventDefault();
        runCodeRef.current();
      }
      // Ctrl+S / Cmd+S -> Save Active File
      else if (isCtrlOrCmd && (e.key === "s" || e.key === "S" || e.code === "KeyS")) {
        e.preventDefault();
        saveFileRef.current();
      }
      // Ctrl+B -> Toggle Sidebar
      else if (isCtrlOrCmd && (e.key === "b" || e.key === "B" || e.code === "KeyB")) {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  // ── Open Files & Tabs ───────────────────────────────────────────────────────
  const handleFileOpen = useCallback(async (filePath: string) => {
    const existing = tabs.find((t) => t.path === filePath);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    try {
      const res = await fetch("/api/fs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath }),
      });
      const { content, error } = await res.json();
      if (error) throw new Error(error);

      const fileName = filePath.replace(/\\/g, "/").split("/").pop() || "file";
      const ext = fileName.split(".").pop()?.toLowerCase();
      const detectedLang = LANGUAGES.find((l) => l.extension === ext) || LANGUAGES[0];

      const newTab: EditorTab = {
        id: `tab-${Date.now()}`,
        name: fileName,
        path: filePath,
        content: content ?? "",
        language: detectedLang.monacoLang,
        isDirty: false,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
      setLanguage(detectedLang);
    } catch (err) {
      console.error("Failed to open file:", err);
    }
  }, [tabs]);

  // ── Close Tab Handler (Now supports closing all tabs!) ──────────────────────
  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(nextTabs);
    if (activeTabId === tabId) {
      setActiveTabId(nextTabs.length > 0 ? nextTabs[nextTabs.length - 1].id : null);
    }
  };

  // ── New Blank Tab ───────────────────────────────────────────────────────────
  const handleNewTab = () => {
    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      name: `untitled-${tabs.length + 1}.${language.extension}`,
      path: `untitled-${tabs.length + 1}.${language.extension}`,
      content: language.defaultCode,
      language: language.monacoLang,
      isDirty: true,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  // ── File / Folder Operations ────────────────────────────────────────────────
  const handleCreateFile = async (fileName: string) => {
    const fullPath = workspaceRoot ? `${workspaceRoot}/${fileName}` : fileName;
    try {
      await fetch("/api/fs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: fullPath, content: "" }),
      });
      await loadFileTree();
      await handleFileOpen(fullPath);
    } catch (err) {
      console.error("Failed to create file:", err);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    const fullPath = workspaceRoot ? `${workspaceRoot}/${folderName}` : folderName;
    try {
      await fetch("/api/fs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: fullPath, isDirectory: true }),
      });
      await loadFileTree();
    } catch (err) {
      console.error("Failed to create folder:", err);
    }
  };

  const handleDeleteNode = async (targetPath: string) => {
    try {
      await fetch("/api/fs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: targetPath }),
      });
      setTabs((prev) => prev.filter((t) => t.path !== targetPath));
      await loadFileTree();
    } catch (err) {
      console.error("Failed to delete node:", err);
    }
  };

  // ── Switch Workspace Folder (React apps, Python folders, etc.) ──────────────
  const handleChangeWorkspace = async (newPath: string) => {
    try {
      const res = await fetch("/api/fs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setRoot", rootPath: newPath }),
      });
      const data = await res.json();
      if (data.root) {
        setWorkspaceRoot(data.root);
        setFileTree(data.tree ?? []);
        // Update Git status for the new directory
        loadGitStatus(data.root);
        // Clear open tabs from old project
        setTabs([]);
        setActiveTabId(null);
      }
    } catch (err) {
      console.error("Failed to change workspace root:", err);
    }
  };

  const handleDropFiles = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await file.text();
      const savePath = workspaceRoot ? `${workspaceRoot}/${file.name}` : file.name;
      await fetch("/api/fs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: savePath, content: text }),
      });
      await loadFileTree();
      await handleFileOpen(savePath);
    }
  };

  // ── AI Chat Assistant ───────────────────────────────────────────────────────
  const handleSendChat = useCallback(
    async (prompt: string, includeCode: boolean) => {
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: prompt,
        timestamp: new Date(),
      };
      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
        modelUsed: selectedModel.name,
      };

      setChatMessages((prev) => [...prev, userMsg, aiMsg]);
      setIsAiStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            code: includeCode ? activeTab?.content : undefined,
            useLocal: selectedModel.isLocal,
            model: selectedModel.id,
          }),
        });

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let content = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          content += decoder.decode(value, { stream: true });
          setChatMessages((prev) =>
            prev.map((m) => (m.id === aiMsg.id ? { ...m, content } : m))
          );
        }
      } catch (err) {
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsg.id
              ? { ...m, content: `⚠️ Error: ${(err as Error).message}` }
              : m
          )
        );
      } finally {
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsg.id ? { ...m, isStreaming: false } : m
          )
        );
        setIsAiStreaming(false);
      }
    },
    [activeTab, selectedModel]
  );

  const handleApplyCodeToEditor = (newCode: string) => {
    handleCodeChange(newCode);
  };

  // ── Git Commit Handler (Scoped to workspace) ────────────────────────────────
  const handleGitCommit = useCallback(
    async (files: string[], message: string) => {
      await fetch("/api/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoPath: workspaceRoot || undefined,
          files,
          message,
        }),
      });
      await loadGitStatus();
    },
    [loadGitStatus, workspaceRoot]
  );

  // ── Monaco Editor Setup & Keyboard Interception ─────────────────────────────
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCodeRef.current();
    });

    editor.addCommand(monaco.KeyCode.F5, () => {
      runCodeRef.current();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveFileRef.current();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
      setIsSidebarOpen((prev) => !prev);
    });
  };

  // ── Resize Handlers ─────────────────────────────────────────────────────────
  const handleSidebarResize = useCallback((delta: number) => {
    setSidebarWidth((prev) => Math.max(180, Math.min(500, prev + delta)));
  }, []);

  const handleEditorResize = useCallback((delta: number) => {
    if (!mainAreaRef.current) return;
    const totalHeight = mainAreaRef.current.clientHeight;
    const deltaPercent = (delta / totalHeight) * 100;
    setEditorHeightPct((prev) =>
      Math.max(25, Math.min(80, prev + deltaPercent))
    );
  }, []);

  const changedCount =
    (gitStatus?.modified.length ?? 0) +
    (gitStatus?.untracked.length ?? 0) +
    (gitStatus?.staged.length ?? 0);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden select-none font-sans">
      {/* ── TOP HEADER ───────────────────────────────────────────────────────── */}
      <Header
        language={language}
        onLanguageChange={(newLang) => {
          setLanguage(newLang);
          if (activeTabId) {
            setTabs((prev) =>
              prev.map((t) =>
                t.id === activeTabId ? { ...t, language: newLang.monacoLang } : t
              )
            );
          }
        }}
        onRunCode={() => handleRunCode()}
        isRunning={isRunning}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onSaveFile={handleFileSave}
        activeFile={activeTab?.path ?? null}
        gitStatus={gitStatus}
        runnerEngine={runnerEngine}
        onOpenCodeboxModal={() => setIsCodeboxModalOpen(true)}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
      />

      {/* ── WORKSPACE BODY ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT SIDEBAR (File Explorer & Git) ──────────────────────────────── */}
        {isSidebarOpen && (
          <>
            <div
              style={{ width: sidebarWidth }}
              className="flex flex-col border-r border-zinc-800 bg-zinc-900/60 flex-shrink-0 overflow-hidden"
            >
              {/* Sidebar Tabs */}
              <div className="flex border-b border-zinc-800 flex-shrink-0">
                <button
                  onClick={() => setSidebarTab("files")}
                  className={`flex-1 py-2 text-[11px] font-semibold transition-colors ${
                    sidebarTab === "files"
                      ? "text-zinc-100 border-b-2 border-violet-500 bg-zinc-800/40"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Files
                </button>
                <button
                  onClick={() => setSidebarTab("git")}
                  className={`flex-1 py-2 text-[11px] font-semibold transition-colors relative ${
                    sidebarTab === "git"
                      ? "text-zinc-100 border-b-2 border-violet-500 bg-zinc-800/40"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Git
                  {changedCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-violet-600 text-white font-mono">
                      {changedCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-hidden">
                {sidebarTab === "files" ? (
                  <FileExplorer
                    tree={fileTree}
                    activeFile={activeTab?.path ?? null}
                    workspaceRoot={workspaceRoot}
                    onFileClick={handleFileOpen}
                    onRefresh={loadFileTree}
                    onCreateFile={handleCreateFile}
                    onCreateFolder={handleCreateFolder}
                    onDeleteNode={handleDeleteNode}
                    onChangeWorkspace={handleChangeWorkspace}
                    onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
                    onDropFiles={handleDropFiles}
                    isLoading={isFsLoading}
                  />
                ) : (
                  <GitPanel
                    status={gitStatus}
                    onCommit={handleGitCommit}
                    onRefresh={loadGitStatus}
                  />
                )}
              </div>
            </div>

            <ResizableHandle direction="horizontal" onDelta={handleSidebarResize} />
          </>
        )}

        {/* ── MAIN AREA (Editor Tabs / Empty Welcome + Monaco + Bottom Panel) ─── */}
        <div ref={mainAreaRef} className="flex flex-col flex-1 overflow-hidden">
          {/* Top Tabs Bar */}
          <EditorTabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={(id) => {
              setActiveTabId(id);
              const selected = tabs.find((t) => t.id === id);
              if (selected) {
                const ext = selected.path.split(".").pop()?.toLowerCase();
                const matchedLang = LANGUAGES.find((l) => l.extension === ext);
                if (matchedLang) setLanguage(matchedLang);
              }
            }}
            onCloseTab={handleCloseTab}
            onNewTab={handleNewTab}
          />

          {/* Editor Area (Monaco if tab open, EmptyEditor welcome screen if 0 tabs) */}
          <div
            style={{ height: `${editorHeightPct}%` }}
            className="overflow-hidden flex-shrink-0 relative bg-zinc-950"
          >
            {activeTab ? (
              <MonacoEditor
                height="100%"
                language={activeTab.language || language.monacoLang}
                value={activeTab.content}
                onChange={(val) => handleCodeChange(val ?? "")}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily:
                    "var(--font-geist-mono), 'Cascadia Code', 'Fira Code', monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  wordWrap: "on",
                  lineNumbers: "on",
                  folding: true,
                  formatOnPaste: true,
                  tabSize: 2,
                  scrollBeyondLastLine: false,
                  cursorBlinking: "phase",
                  smoothScrolling: true,
                  padding: { top: 10, bottom: 10 },
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                  automaticLayout: true,
                }}
              />
            ) : (
              <EmptyEditor
                onNewFile={handleNewTab}
                onOpenFolder={() => setIsWorkspaceModalOpen(true)}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
                workspaceRoot={workspaceRoot}
              />
            )}
          </div>

          {/* Vertical Divider */}
          <ResizableHandle direction="vertical" onDelta={handleEditorResize} />

          {/* ── BOTTOM PANEL (CLI Terminal / Output + AI Assistant) ───────────── */}
          <div className="flex flex-1 overflow-hidden border-t border-zinc-800">
            {/* Terminal / Output */}
            <TerminalPanel
              result={executionResult}
              isRunning={isRunning}
              onClear={() => setExecutionResult(null)}
              onRunCodeWithStdin={(stdinText) => handleRunCode(stdinText)}
              currentLanguageName={language.name}
              activeFilePath={activeTab?.path}
              workspaceRoot={workspaceRoot}
            />

            {/* AI Assistant */}
            <ChatPanel
              messages={chatMessages}
              isStreaming={isAiStreaming}
              selectedModel={selectedModel}
              onSend={handleSendChat}
              onClear={() => setChatMessages([])}
              onApplyCodeToEditor={handleApplyCodeToEditor}
            />
          </div>
        </div>
      </div>

      {/* ── STATUS BAR ───────────────────────────────────────────────────────── */}
      <StatusBar
        language={language}
        selectedModel={selectedModel}
        gitStatus={gitStatus}
        cursorPosition={cursorPosition}
        runnerEngine={runnerEngine}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* ── Modals ── */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <WorkspaceSelectorModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        currentRoot={workspaceRoot}
        onSelectWorkspace={handleChangeWorkspace}
      />

      <CodeboxModal
        isOpen={isCodeboxModalOpen}
        onClose={() => setIsCodeboxModalOpen(false)}
        runnerEngine={runnerEngine}
        onSelectEngine={(engine) => {
          setRunnerEngine(engine === "codebox" ? "Codebox (Docker)" : "Native Host Runner");
        }}
      />
    </div>
  );
}
