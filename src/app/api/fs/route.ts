import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { FileNode } from "@/lib/types";

// Dynamic workspace root supporting runtime directory switching or fallback to env/cwd
let CURRENT_WORKSPACE_ROOT = process.env.WORKSPACE_ROOT
  ? path.resolve(process.env.WORKSPACE_ROOT)
  : process.cwd();

function guardPath(requestedPath: string): string {
  const resolved = path.resolve(requestedPath);
  return resolved;
}

const SKIP_DIRS = new Set([
  "node_modules", ".next", ".git", "dist", "build",
  ".cache", "__pycache__", ".turbo", "coverage", ".nyc_output",
]);

async function buildTree(dirPath: string, depth = 0): Promise<FileNode[]> {
  if (depth > 6) return [];

  let entries;
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const nodes: FileNode[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (SKIP_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const children = await buildTree(fullPath, depth + 1);
      nodes.push({ name: entry.name, path: fullPath, type: "directory", children });
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).slice(1);
      nodes.push({ name: entry.name, path: fullPath, type: "file", extension: ext });
    }
  }

  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

// ─── GET /api/fs?path=<dir> ───────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("path") || CURRENT_WORKSPACE_ROOT;

  try {
    const safePath = guardPath(requested);
    const stat = await fs.stat(safePath);
    if (!stat.isDirectory()) {
      return NextResponse.json({ error: "Provided path is not a directory" }, { status: 400 });
    }
    const tree = await buildTree(safePath);
    return NextResponse.json({ tree, root: safePath }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

// ─── POST /api/fs ─────────────────────────────────────────────────────────────
// Supports:
// 1. Create/Overwrite File: { path, content }
// 2. Create Folder: { path, isDirectory: true }
// 3. Rename: { action: "rename", oldPath, newPath }
// 4. Set Workspace Root: { action: "setRoot", rootPath }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, path: filePath, content, isDirectory, oldPath, newPath, rootPath } = body;

    if (action === "setRoot") {
      if (!rootPath) return NextResponse.json({ error: "rootPath is required" }, { status: 400 });
      const resolved = path.resolve(rootPath);
      const stat = await fs.stat(resolved);
      if (!stat.isDirectory()) {
        return NextResponse.json({ error: "Path is not a directory" }, { status: 400 });
      }
      CURRENT_WORKSPACE_ROOT = resolved;
      const tree = await buildTree(resolved);
      return NextResponse.json({ success: true, root: resolved, tree }, { status: 200 });
    }

    if (action === "rename") {
      if (!oldPath || !newPath) {
        return NextResponse.json({ error: "oldPath and newPath are required for rename" }, { status: 400 });
      }
      const safeOld = guardPath(oldPath);
      const safeNew = guardPath(newPath);
      await fs.rename(safeOld, safeNew);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!filePath) {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    const safePath = guardPath(filePath);

    if (isDirectory) {
      await fs.mkdir(safePath, { recursive: true });
      return NextResponse.json({ success: true, isDirectory: true }, { status: 200 });
    }

    await fs.mkdir(path.dirname(safePath), { recursive: true });
    await fs.writeFile(safePath, content ?? "", "utf-8");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

// ─── PUT /api/fs — Read File ──────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: filePath } = body;

    if (!filePath) {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    const safePath = guardPath(filePath);
    const content = await fs.readFile(safePath, "utf-8");
    return NextResponse.json({ content, path: safePath }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

// ─── DELETE /api/fs — Delete File or Folder ───────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: filePath } = body;

    if (!filePath) {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    const safePath = guardPath(filePath);
    await fs.rm(safePath, { recursive: true, force: true });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
