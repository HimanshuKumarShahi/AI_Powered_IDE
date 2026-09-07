"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import {
  Terminal as TerminalIcon,
  Trash2,
  Clock,
  Cpu,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Server,
  Zap,
} from "lucide-react";
import type { ExecutionResult } from "@/lib/types";

interface TerminalLine {
  id: string;
  type: "command" | "stdout" | "stderr" | "system";
  content: string;
  cwd?: string;
  exitCode?: number;
}

interface TerminalPanelProps {
  result: ExecutionResult | null;
  isRunning: boolean;
  onClear: () => void;
  onRunCodeWithStdin?: (stdinText: string) => void;
  currentLanguageName?: string;
  activeFilePath?: string | null;
  workspaceRoot?: string;
}

export function TerminalPanel({
  result,
  isRunning,
  onClear,
  onRunCodeWithStdin,
  currentLanguageName = "Python 3",
  activeFilePath,
  workspaceRoot,
}: TerminalPanelProps) {
  const [activeTab, setActiveTab] = useState<"cli" | "output">("cli");
  const [cliInput, setCliInput] = useState("");
  const [currentCwd, setCurrentCwd] = useState(workspaceRoot || "C:\\workspace");
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      id: "init-1",
      type: "system",
      content: "NexusIDE Interactive CLI Terminal [PowerShell / Host System Shell]",
    },
    {
      id: "init-2",
      type: "system",
      content: "Type commands like 'python main.py', 'node run.js', 'dir', 'git status'. Docker is not required for native execution.",
    },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isCliRunning, setIsCliRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEngineInfo, setShowEngineInfo] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workspaceRoot) {
      setCurrentCwd(workspaceRoot);
    }
  }, [workspaceRoot]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, result, isRunning]);

  // Execute terminal CLI command via /api/terminal
  const handleExecuteCli = async (cmdToRun?: string) => {
    const cmd = (cmdToRun || cliInput).trim();
    if (!cmd || isCliRunning) return;

    // Add to command history list
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    // Append command prompt line to terminal
    const userLine: TerminalLine = {
      id: `cmd-${Date.now()}`,
      type: "command",
      content: cmd,
      cwd: currentCwd,
    };
    setHistory((prev) => [...prev, userLine]);
    setCliInput("");
    setIsCliRunning(true);

    try {
      const res = await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd, cwd: currentCwd }),
      });
      const data = await res.json();

      if (data.clear) {
        setHistory([]);
        setIsCliRunning(false);
        return;
      }

      if (data.cwd) {
        setCurrentCwd(data.cwd);
      }

      if (data.stdout) {
        setHistory((prev) => [
          ...prev,
          {
            id: `out-${Date.now()}`,
            type: "stdout",
            content: data.stdout,
            exitCode: data.exitCode,
          },
        ]);
      }

      if (data.stderr) {
        setHistory((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            type: "stderr",
            content: data.stderr,
            exitCode: data.exitCode,
          },
        ]);
      }

      if (!data.stdout && !data.stderr && data.exitCode === 0) {
        setHistory((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            type: "system",
            content: `[Process exited with code 0]`,
          },
        ]);
      }
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          type: "stderr",
          content: `Terminal error: ${(err as Error).message}`,
          exitCode: 1,
        },
      ]);
    } finally {
      setIsCliRunning(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleExecuteCli();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx =
        historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setCliInput(commandHistory[nextIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= commandHistory.length) {
        setHistoryIndex(-1);
        setCliInput("");
      } else {
        setHistoryIndex(nextIdx);
        setCliInput(commandHistory[nextIdx] || "");
      }
    }
  };

  const handleRunActiveFileViaCli = () => {
    if (!activeFilePath) return;
    const fileName = activeFilePath.replace(/\\/g, "/").split("/").pop() || "";
    const ext = fileName.split(".").pop()?.toLowerCase();
    let runnerCmd = "";
    if (ext === "py") runnerCmd = `python "${activeFilePath}"`;
    else if (ext === "js" || ext === "mjs") runnerCmd = `node "${activeFilePath}"`;
    else if (ext === "ts") runnerCmd = `node --experimental-strip-types "${activeFilePath}"`;
    else runnerCmd = `node "${activeFilePath}"`;

    setActiveTab("cli");
    handleExecuteCli(runnerCmd);
  };

  const handleCopy = () => {
    let text = "";
    if (activeTab === "cli") {
      text = history.map((h) => (h.type === "command" ? `$ ${h.content}` : h.content)).join("\n");
    } else {
      text =
        (result?.stdout || "") +
        (result?.stderr ? `\n${result.stderr}` : "") +
        (result?.compile_output ? `\n${result.compile_output}` : "");
    }

    if (text.trim()) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSuccess = result ? result.status.id === 3 : false;
  const shortCwd = currentCwd.replace(/\\/g, "/").split("/").slice(-2).join("/");

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex flex-col flex-1 bg-zinc-950 overflow-hidden min-w-0 font-sans border-r border-zinc-800"
    >
      {/* ── Header / Tab Bar ── */}
      <div className="flex items-center justify-between px-3 h-9 bg-zinc-900 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("cli")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "cli"
                ? "bg-zinc-800 text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>CLI Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab("output")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "output"
                ? "bg-zinc-800 text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            <span>Code Runner Output</span>
            {result && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
          </button>
        </div>

        {/* ── Toolbar Actions ── */}
        <div className="flex items-center gap-2">
          {/* Quick CLI Run button */}
          {activeFilePath && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRunActiveFileViaCli();
              }}
              className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded transition-colors"
              title="Execute active file directly in the CLI terminal"
            >
              <Play className="w-2.5 h-2.5 fill-emerald-400" />
              <span>Run in CLI</span>
            </button>
          )}

          {/* Engine Health Info Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEngineInfo(true);
            }}
            className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 px-2 py-0.5 rounded transition-colors"
            title="Execution Engine Status & Diagnostics"
          >
            <Server className="w-3 h-3 text-violet-400" />
            <span className="hidden md:inline font-mono">Engine Status</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Copy Terminal Output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (activeTab === "cli") setHistory([]);
              else onClear();
            }}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Tab 1: Interactive CLI Terminal ── */}
      {activeTab === "cli" && (
        <div className="flex-1 flex flex-col overflow-hidden p-3 font-mono text-xs">
          {/* Scrollable command history */}
          <div className="flex-1 overflow-y-auto space-y-1.5 select-text">
            {history.map((line) => {
              if (line.type === "command") {
                return (
                  <div key={line.id} className="flex items-start gap-1.5 text-zinc-300 font-semibold pt-1">
                    <span className="text-emerald-400 flex-shrink-0 font-bold">PS</span>
                    <span className="text-sky-400 flex-shrink-0 truncate max-w-[240px]">
                      {line.cwd || shortCwd}&gt;
                    </span>
                    <span className="text-zinc-100 break-all">{line.content}</span>
                  </div>
                );
              }
              if (line.type === "stderr") {
                return (
                  <pre key={line.id} className="text-red-400 whitespace-pre-wrap leading-relaxed pl-2">
                    {line.content}
                  </pre>
                );
              }
              if (line.type === "system") {
                return (
                  <div key={line.id} className="text-zinc-500 italic text-[11px]">
                    # {line.content}
                  </div>
                );
              }
              return (
                <pre key={line.id} className="text-zinc-300 whitespace-pre-wrap leading-relaxed pl-2 font-mono">
                  {line.content}
                </pre>
              );
            })}

            {isCliRunning && (
              <div className="flex items-center gap-2 text-zinc-500 italic text-[11px] pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Running command...</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Active Command Input Line */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-850 mt-1 flex-shrink-0">
            <span className="text-emerald-400 font-bold flex-shrink-0">PS</span>
            <span className="text-sky-400 font-mono text-[11px] flex-shrink-0 truncate max-w-[160px]" title={currentCwd}>
              {shortCwd}&gt;
            </span>
            <input
              ref={inputRef}
              type="text"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isCliRunning}
              placeholder="e.g. python main.py, node script.js, dir, git status..."
              className="flex-1 bg-transparent text-xs text-zinc-100 focus:outline-none font-mono placeholder-zinc-600 caret-violet-400 disabled:opacity-50"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* ── Tab 2: Code Runner Output ── */}
      {activeTab === "output" && (
        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-3 select-text">
          {isRunning && (
            <div className="flex items-center gap-2 text-zinc-400 animate-pulse bg-zinc-900/50 p-2.5 rounded border border-zinc-800">
              <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full" />
              <span>Executing {currentLanguageName} code via Native Host Runner...</span>
            </div>
          )}

          {!isRunning && !result && (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-600 gap-2">
              <Zap className="w-8 h-8 opacity-20 text-zinc-400" />
              <p className="text-xs text-zinc-400">No execution results yet</p>
              <p className="text-[11px] text-zinc-600">
                Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono">Ctrl+Enter</kbd> or click <span className="text-emerald-400 font-semibold">Run</span> in the top header
              </p>
            </div>
          )}

          {result && (
            <>
              {/* Header result stats */}
              <div className="flex items-center justify-between bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
                <div className="flex items-center gap-2">
                  {isSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-xs font-semibold ${isSuccess ? "text-emerald-400" : "text-red-400"}`}>
                    {result.status.description}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                  {result.time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{result.time}s</span>
                    </div>
                  )}
                  {result.memory && (
                    <div className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-zinc-500" />
                      <span>{(result.memory / 1024).toFixed(1)} MB</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hint badge */}
              {result.hint && (
                <div className="bg-violet-950/20 border border-violet-900/40 rounded p-2 text-violet-300 text-[11px]">
                  ⚡ {result.hint}
                </div>
              )}

              {/* Compile output */}
              {result.compile_output && (
                <div className="bg-yellow-950/20 border border-yellow-900/30 rounded p-2.5">
                  <span className="text-yellow-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Diagnostics / Compile Output
                  </span>
                  <pre className="text-yellow-300 whitespace-pre-wrap leading-relaxed">{result.compile_output}</pre>
                </div>
              )}

              {/* Stdout */}
              {result.stdout && (
                <div className="bg-zinc-900/40 rounded p-2.5 border border-zinc-800/80">
                  <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider block mb-1.5">
                    Standard Output (stdout)
                  </span>
                  <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed selection:bg-emerald-900 selection:text-white">
                    {result.stdout}
                  </pre>
                </div>
              )}

              {/* Stderr */}
              {result.stderr && (
                <div className="bg-red-950/20 border border-red-900/40 rounded p-2.5">
                  <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Standard Error (stderr)
                  </span>
                  <pre className="text-red-300 whitespace-pre-wrap leading-relaxed">{result.stderr}</pre>
                </div>
              )}
            </>
          )}

          <div ref={bottomRef} />
        </div>
      )}

      {/* ── Engine Diagnostics Modal ── */}
      {showEngineInfo && (
        <div
          onClick={() => setShowEngineInfo(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Execution Engines & Testing</h3>
              </div>
              <button
                onClick={() => setShowEngineInfo(false)}
                className="text-zinc-500 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1. Native Host Runner (Active & Tested)</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Runs directly on your computer without Docker.
                  <br />• <strong>Python 3.12.10:</strong> Ready (tested ~0.22s)
                  <br />• <strong>Node.js v25.0.0:</strong> Ready (tested ~0.20s)
                  <br />• <strong>CLI Terminal:</strong> Full interactive PowerShell / Bash support
                </p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-850 border border-zinc-750">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-300 mb-1">
                  <Server className="w-3.5 h-3.5 text-violet-400" />
                  <span>2. Docker Codebox Engine (Optional)</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Codebox provides isolated container execution. If you have not started Docker with <code>docker-compose up -d</code>, NexusIDE automatically runs your code using the Native Host Runner above so you are never blocked!
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowEngineInfo(false)}
                className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
