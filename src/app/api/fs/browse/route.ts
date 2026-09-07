import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// ─── GET /api/fs/browse?path=<dir> ────────────────────────────────────────────
// Returns directory contents (subdirectories and metadata) so users can easily
// browse and switch to any workspace on their machine (e.g. React projects, etc.)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetPath = searchParams.get("path") || process.cwd();

  try {
    const resolved = path.resolve(targetPath);
    const entries = await fs.readdir(resolved, { withFileTypes: true });

    const directories: { name: string; path: string }[] = [];
    const parent = path.dirname(resolved);

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".next") continue;

      if (entry.isDirectory()) {
        directories.push({
          name: entry.name,
          path: path.join(resolved, entry.name),
        });
      }
    }

    directories.sort((a, b) => a.name.localeCompare(b.name));

    // Common VS Code / User parent directories to suggest
    const userProfile = process.env.USERPROFILE || process.env.HOME || "C:\\Users";
    const vscodeProjects = path.join(userProfile, "VS Code");

    return NextResponse.json({
      current: resolved,
      parent: parent !== resolved ? parent : null,
      directories,
      suggested: [
        { name: "Current Project (ai_ide)", path: process.cwd() },
        { name: "VS Code Projects Folder", path: vscodeProjects },
        { name: "Home Directory", path: userProfile },
      ],
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
