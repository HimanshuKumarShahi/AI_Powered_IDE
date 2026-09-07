import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";

// ─── POST /api/terminal ───────────────────────────────────────────────────────
// Executes shell commands (e.g. `node main.js`, `python script.py`, `ls`, `dir`)
// inside the active workspace directory and returns stdout, stderr, and exitCode.
export async function POST(request: NextRequest) {
  let body: { command: string; cwd?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { command, cwd } = body;

  if (!command || typeof command !== "string") {
    return NextResponse.json({ error: "command is required" }, { status: 400 });
  }

  const trimmed = command.trim();
  const workingDir = cwd ? path.resolve(cwd) : process.cwd();

  // Handle "cd" command internally to change current directory
  if (trimmed.startsWith("cd ") || trimmed === "cd") {
    const target = trimmed.slice(3).trim();
    if (!target) {
      return NextResponse.json({
        stdout: workingDir,
        stderr: "",
        exitCode: 0,
        cwd: workingDir,
      });
    }

    const nextDir = path.resolve(workingDir, target);
    try {
      const stat = await fs.stat(nextDir);
      if (stat.isDirectory()) {
        return NextResponse.json({
          stdout: `Directory changed to ${nextDir}`,
          stderr: "",
          exitCode: 0,
          cwd: nextDir,
        });
      } else {
        return NextResponse.json({
          stdout: "",
          stderr: `cd: not a directory: ${target}`,
          exitCode: 1,
          cwd: workingDir,
        });
      }
    } catch {
      return NextResponse.json({
        stdout: "",
        stderr: `cd: no such directory: ${target}`,
        exitCode: 1,
        cwd: workingDir,
      });
    }
  }

  // Handle "clear" / "cls"
  if (trimmed === "clear" || trimmed === "cls") {
    return NextResponse.json({
      stdout: "",
      stderr: "",
      exitCode: 0,
      clear: true,
      cwd: workingDir,
    });
  }

  return new Promise<NextResponse>((resolve) => {
    exec(
      trimmed,
      {
        cwd: workingDir,
        timeout: 30000,
        maxBuffer: 5 * 1024 * 1024,
        windowsHide: true,
        shell: process.platform === "win32" ? "powershell.exe" : "/bin/bash",
      },
      (error, stdout, stderr) => {
        resolve(
          NextResponse.json({
            stdout: stdout || "",
            stderr: stderr || (error && !stdout ? error.message : ""),
            exitCode: error?.code ?? 0,
            cwd: workingDir,
          })
        );
      }
    );
  });
}
