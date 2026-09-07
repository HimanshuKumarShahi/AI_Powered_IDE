"use client";

import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
} from "react";
import {
  Bot,
  Send,
  Code2,
  Loader2,
  User,
  Zap,
  Cpu,
  Trash2,
  Sparkles,
  Copy,
  Check,
  ArrowDownToLine,
  Bug,
  FileCheck2,
  FileQuestion,
  Wand2,
} from "lucide-react";
import type { ChatMessage, AIModel } from "@/lib/types";

// ─── Code Block with Copy & Insert to Editor ──────────────────────────────────
function CodeBlock({
  code,
  language,
  onApplyToEditor,
}: {
  code: string;
  language: string;
  onApplyToEditor?: (code: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden font-mono text-xs shadow-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/80 border-b border-zinc-800 text-zinc-400">
        <span className="text-[10px] uppercase font-semibold text-violet-400">{language || "code"}</span>
        <div className="flex items-center gap-1.5">
          {onApplyToEditor && (
            <button
              onClick={() => onApplyToEditor(code)}
              className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 px-1.5 py-0.5 rounded transition-colors"
              title="Apply this code directly to your Monaco editor"
            >
              <ArrowDownToLine className="w-3 h-3 text-emerald-400" />
              <span>Apply to Editor</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 px-1.5 py-0.5 rounded transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
      <pre className="p-3 overflow-x-auto text-zinc-200 leading-relaxed font-mono selection:bg-violet-900 selection:text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Markdown / Content Formatter ─────────────────────────────────────────────
function FormattedMessage({
  content,
  onApplyToEditor,
}: {
  content: string;
  onApplyToEditor?: (code: string) => void;
}) {
  // Regex to split code blocks: ```lang ... ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-1 text-xs leading-relaxed text-zinc-200">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0]?.trim() || "";
          // Check if first line is language specifier
          const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const lang = hasLang ? firstLine : "";
          const code = hasLang ? lines.slice(1).join("\n") : lines.join("\n");

          return (
            <CodeBlock
              key={index}
              code={code}
              language={lang}
              onApplyToEditor={onApplyToEditor}
            />
          );
        }

        // Regular markdown text
        return (
          <div key={index} className="whitespace-pre-wrap break-words">
            {part}
          </div>
        );
      })}
    </div>
  );
}

// ─── Single Message Bubble ────────────────────────────────────────────────────
function MessageBubble({
  message,
  selectedModel,
  onApplyToEditor,
}: {
  message: ChatMessage;
  selectedModel: AIModel;
  onApplyToEditor?: (code: string) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs ${
          isUser
            ? "bg-zinc-800 border border-zinc-700 text-zinc-300"
            : selectedModel.isLocal
            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
            : "bg-violet-500/10 border border-violet-500/30 text-violet-400"
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble Container */}
      <div
        className={`max-w-[88%] rounded-xl px-3.5 py-2.5 shadow-xs ${
          isUser
            ? "bg-violet-600/20 text-zinc-100 border border-violet-500/30 rounded-tr-xs"
            : "bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-tl-xs"
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-zinc-800/60 text-[10px] text-zinc-400 font-mono">
            <span className="font-semibold text-violet-400">{message.modelUsed || selectedModel.name}</span>
            <span className="text-zinc-600">·</span>
            <span>{selectedModel.isLocal ? "Offline" : "Cloud"}</span>
          </div>
        )}

        {message.isStreaming && message.content === "" ? (
          <div className="flex items-center gap-2 text-zinc-400 py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
            <span className="italic text-xs font-mono">Thinking with {selectedModel.name}...</span>
          </div>
        ) : (
          <FormattedMessage content={message.content} onApplyToEditor={onApplyToEditor} />
        )}

        {message.isStreaming && message.content !== "" && (
          <span className="inline-block w-1.5 h-3.5 bg-violet-400 animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </div>
  );
}

// ─── Chat Panel Component ─────────────────────────────────────────────────────
interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  selectedModel: AIModel;
  onSend: (prompt: string, includeCode: boolean) => void;
  onClear: () => void;
  onApplyCodeToEditor?: (code: string) => void;
}

export function ChatPanel({
  messages,
  isStreaming,
  selectedModel,
  onSend,
  onClear,
  onApplyCodeToEditor,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [includeCode, setIncludeCode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed, includeCode);
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick Action Prompts
  const quickActions = [
    { label: "Fix Bug", icon: Bug, prompt: "Review my code, identify any bugs or runtime issues, and show the fixed version." },
    { label: "Optimize", icon: Zap, prompt: "Optimize this code for maximum performance, lower time complexity, and clean architecture." },
    { label: "Explain", icon: FileQuestion, prompt: "Explain step-by-step how this code works and what each part does." },
    { label: "Add Tests", icon: FileCheck2, prompt: "Write comprehensive unit test cases and edge cases for this code." },
  ];

  return (
    <div className="flex flex-col flex-1 bg-zinc-950 overflow-hidden min-w-0 font-sans">
      {/* ── Panel Header ── */}
      <div className="flex items-center justify-between px-3 h-9 bg-zinc-900 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-200">AI Assistant</span>
          <span className="text-[10px] text-zinc-500 font-mono">({selectedModel.name})</span>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClear}
              className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Messages Stream ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 text-zinc-600 gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-200">Nexus AI Assistant Ready</h3>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-[280px]">
                Ask questions, fix bugs, or click a quick action below to analyze your active code.
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            selectedModel={selectedModel}
            onApplyToEditor={onApplyCodeToEditor}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Action Chips ── */}
      <div className="px-3 pt-2 pb-1 border-t border-zinc-850 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(action.prompt)}
              disabled={isStreaming}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 hover:text-violet-300 transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Icon className="w-3 h-3 text-violet-400" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Chat Input ── */}
      <div className="p-2.5 border-t border-zinc-800 bg-zinc-900/50 flex-shrink-0">
        <div className="bg-zinc-850 rounded-lg border border-zinc-750 focus-within:border-violet-500/80 transition-colors p-2 flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI anything about your code... (Enter to send, Shift+Enter for newline)"
            rows={2}
            disabled={isStreaming}
            className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none font-sans leading-relaxed disabled:opacity-50"
          />

          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
            <label className="flex items-center gap-1.5 text-[10px] text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCode}
                onChange={(e) => setIncludeCode(e.target.checked)}
                className="w-3 h-3 accent-violet-500 rounded cursor-pointer"
              />
              <Code2 className="w-3 h-3 text-zinc-500" />
              <span>Include active file context</span>
            </label>

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              className="flex items-center gap-1 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-semibold px-3 py-1 rounded-md transition-colors cursor-pointer"
            >
              {isStreaming ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
