import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

// Codebox config
const CODEBOX_URL = (process.env.CODEBOX_URL || "http://localhost:3000").replace(/\/$/, "");
const CODEBOX_AUTH_TOKEN = process.env.CODEBOX_AUTH_TOKEN || "dev-token";

// Judge0 / Codebox language ID mapping
const LANGUAGE_INFO: Record<number, { name: string; ext: string; cmd: string; args: (file: string) => string[] }> = {
  71: {
    name: "Python 3",
    ext: ".py",
    cmd: "python",
    args: (file) => [file],
  },
  63: {
    name: "JavaScript",
    ext: ".js",
    cmd: "node",
    args: (file) => [file],
  },
  74: {
    name: "TypeScript",
    ext: ".ts",
    cmd: "node",
    // Node 22+ supports strip-types or we can execute with tsx/ts-node if present or run as JS
    args: (file) => ["--experimental-strip-types", file],
  },
  54: {
    name: "C++",
    ext: ".cpp",
    cmd: "g++",
    args: (file) => [file, "-o", file.replace(/\.cpp$/, ".exe")],
  },
  50: {
    name: "C",
    ext: ".c",
    cmd: "gcc",
    args: (file) => [file, "-o", file.replace(/\.c$/, ".exe")],
  },
  62: {
    name: "Java",
    ext: ".java",
    cmd: "java",
    args: (file) => [file],
  },
};

/**
 * Executes code natively on the host machine using installed runtimes (Python, Node.js, etc.)
 * This allows execution to work instantly without requiring Docker Compose to be running!
 */
async function executeLocally(
  source_code: string,
  langId: number,
  stdin: string = "",
  timeoutMs: number = 10000
) {
  const lang = LANGUAGE_INFO[langId] || LANGUAGE_INFO[71];
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexus-run-"));
  const tempFile = path.join(tempDir, `main${lang.ext}`);

  await fs.writeFile(tempFile, source_code, "utf-8");

  const startTime = Date.now();

  return new Promise<{
    stdout: string;
    stderr: string;
    compile_output: string;
    status: { id: number; description: string };
    time: string;
    memory: number;
    engine: string;
  }>((resolve) => {
    let stdout = "";
    let stderr = "";
    let killed = false;

    // Determine executable: on Windows, try python or py; for ts fallback without flags if needed
    let exe = lang.cmd;
    let args = lang.args(tempFile);

    const proc = spawn(exe, args, {
      cwd: tempDir,
      shell: true,
      windowsHide: true,
    });

    const timer = setTimeout(() => {
      killed = true;
      proc.kill("SIGTERM");
    }, timeoutMs);

    if (stdin && proc.stdin) {
      proc.stdin.write(stdin);
      proc.stdin.end();
    }

    proc.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("error", async (err) => {
      clearTimeout(timer);
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
      resolve({
        stdout: "",
        stderr: `Runtime not found on system: ${exe}.\nPlease ensure ${lang.name} is installed on PATH or start Docker Codebox.\nError: ${err.message}`,
        compile_output: "",
        status: { id: 11, description: "Runtime Missing" },
        time: "0.00",
        memory: 0,
        engine: "Native Host (Failed)",
      });
    });

    proc.on("close", async (code) => {
      clearTimeout(timer);
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

      if (killed) {
        resolve({
          stdout,
          stderr: stderr + "\n[Process timed out after 10 seconds]",
          compile_output: "",
          status: { id: 5, description: "Time Limit Exceeded" },
          time: elapsedSec,
          memory: 12000,
          engine: "Native Host",
        });
        return;
      }

      const isSuccess = code === 0;
      resolve({
        stdout,
        stderr,
        compile_output: !isSuccess && !stdout ? stderr : "",
        status: isSuccess
          ? { id: 3, description: "Accepted (Success)" }
          : { id: 11, description: `Process Exited (Code ${code})` },
        time: elapsedSec,
        memory: 15400,
        engine: "Native Host Runner",
      });
    });
  });
}

// ─── POST /api/run ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: { source_code: string; language_id: number; stdin?: string; forceLocal?: boolean };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { source_code, language_id, stdin = "", forceLocal = false } = body;

  if (!source_code || typeof source_code !== "string") {
    return NextResponse.json({ error: "source_code (string) is required" }, { status: 400 });
  }

  const langId = Number(language_id) || 71;

  // If forceLocal requested, skip Codebox docker probe
  if (forceLocal) {
    const localResult = await executeLocally(source_code, langId, stdin);
    return NextResponse.json(localResult, { status: 200 });
  }

  // Attempt Codebox (Docker) first
  try {
    const codeboxResponse = await fetch(`${CODEBOX_URL}/submissions?wait=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Auth-Token": CODEBOX_AUTH_TOKEN,
      },
      body: JSON.stringify({
        source_code,
        language_id: langId,
        stdin,
      }),
      signal: AbortSignal.timeout(3000), // Quick probe timeout: 3s
    });

    if (codeboxResponse.ok) {
      const data = await codeboxResponse.json();
      return NextResponse.json({
        stdout: data.stdout ?? "",
        stderr: data.stderr ?? "",
        compile_output: data.compile_output ?? "",
        status: data.status ?? { id: 0, description: "Unknown" },
        time: data.time ?? "0.05",
        memory: data.memory ?? 8192,
        engine: "Codebox (Docker)",
      });
    }
  } catch {
    // Codebox is offline / not running -> Seamlessly fallback to Native Runner!
  }

  // ── Seamless Fallback: Native Host Execution ─────────────────────────────────
  const fallbackResult = await executeLocally(source_code, langId, stdin);
  return NextResponse.json(
    {
      ...fallbackResult,
      hint: "Codebox Docker was offline — executed seamlessly using your local system runtime!",
    },
    { status: 200 }
  );
}
