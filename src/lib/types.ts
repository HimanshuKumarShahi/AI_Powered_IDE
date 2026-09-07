// ─── NexusIDE Shared Types ────────────────────────────────────────────────────

/** A node in the file explorer tree */
export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  extension?: string;
}

/** Open Editor Tab */
export interface EditorTab {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isDirty?: boolean;
}

/** A single message in the AI chat history */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  modelUsed?: string;
}

/** Result returned from the /api/run endpoint (Codebox-compatible) */
export interface ExecutionResult {
  stdout: string;
  stderr: string;
  compile_output: string;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
  error?: string;
  hint?: string;
  exitCode?: number;
}

/** Git repository status from /api/git */
export interface GitStatus {
  staged: string[];
  modified: string[];
  untracked: string[];
  deleted: string[];
  repoPath: string;
  branch?: string;
  ahead?: number;
  behind?: number;
  error?: string;
}

/** Supported Programming Language */
export interface Language {
  id: number;
  name: string;
  monacoLang: string;
  extension: string;
  codeboxSupported: boolean;
  codeboxRuntime: string;
  defaultCode: string;
}

/** AI Model Specification */
export interface AIModel {
  id: string;
  name: string;
  provider: "google" | "local" | "deepseek";
  isLocal: boolean;
  badge: string;
  latency: string;
  description: string;
}
