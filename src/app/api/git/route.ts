import { NextRequest, NextResponse } from "next/server";
import simpleGit from "simple-git";

// ─── GET /api/git?repoPath=<path> ─────────────────────────────────────────────
// Returns the current git status of the repository at repoPath.
// Only reads — never writes to any remote. Safe to use on any local repo.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repoPath = searchParams.get("repoPath") || process.cwd();

  try {
    const git = simpleGit(repoPath);
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return NextResponse.json({
        staged: [],
        modified: [],
        untracked: [],
        deleted: [],
        repoPath,
        branch: null,
        error: "Not a git repository",
      });
    }

    const status = await git.status();

    return NextResponse.json({
      staged: status.staged,
      modified: status.modified,
      untracked: status.not_added,
      deleted: status.deleted,
      repoPath,
      branch: status.current ?? "unknown",
      ahead: status.ahead,
      behind: status.behind,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ─── POST /api/git — Stage selected files and commit locally ──────────────────
// NOTE: This ONLY performs `git add` + `git commit` — it NEVER calls `git push`.
//       Nothing is sent to GitHub, GitLab, or any remote. Purely local operation.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { repoPath, files, message } = body;

  if (!message?.trim()) {
    return NextResponse.json(
      { error: "commit message is required" },
      { status: 400 }
    );
  }

  try {
    const git = simpleGit(repoPath || process.cwd());

    // Stage specified files, or all changed files if none specified
    if (Array.isArray(files) && files.length > 0) {
      await git.add(files);
    } else {
      await git.add(".");
    }

    const result = await git.commit(message.trim());

    return NextResponse.json({
      success: true,
      commit: result.commit,
      branch: result.branch,
      summary: result.summary,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
