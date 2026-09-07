<div align="center">

# ⟨/⟩ NexusIDE PRO

### A fully local, offline-capable, high-performance AI developer workstation

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-4.7-007ACC?style=for-the-badge&logo=visualstudiocode)](https://microsoft.github.io/monaco-editor)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Codebox](https://img.shields.io/badge/Codebox-Hitesh_Choudhary-FF6B35?style=for-the-badge)](https://github.com/hiteshchoudhary/Codebox)
[![Dual Execution](https://img.shields.io/badge/Execution-Native_+_Docker-emerald?style=for-the-badge)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

*Code with Monaco. Open any React or Python workspace. Run in CLI terminal or via Hitesh Sir'"'"'s Codebox. Stream local/cloud AI.*

</div>

---

## 📑 Table of Contents
1. [What is NexusIDE & How It Works](#-1-what-is-nexuside--how-it-works)
2. [Hitesh Choudhary'"'"'s Codebox — Where & How It Is Used](#-2-hitesh-choudharys-codebox--where--how-it-is-used)
3. [Zero Docker Friction: How Code is Tested & Verified](#-3-zero-docker-friction-how-code-is-tested--verified)
4. [Switching & Accessing ANY Folder (React, Next.js, Python, etc.)](#-4-switching--accessing-any-folder)
5. [Tab Management & Empty Editor Canvas](#-5-tab-management--empty-editor-canvas)
6. [Interactive Command-Line (CLI) Terminal](#-6-interactive-command-line-cli-terminal)
7. [Tech Stack & Architecture](#-7-tech-stack--architecture)
8. [Important AI Models & Intelligence Engines](#-8-important-ai-models--intelligence-engines)
9. [Complete Repository File Structure](#-9-complete-repository-file-structure)
10. [Key Usages & What You Can Build](#-10-key-usages--what-you-can-build)
11. [Step-by-Step Guide: How to Use](#-11-step-by-step-guide-how-to-use)
12. [Keyboard Shortcuts](#-12-keyboard-shortcuts)
13. [Resources & Official Links](#-13-resources--official-links)
14. [Conclusion](#-14-conclusion)

---

## 🌟 1. What is NexusIDE & How It Works

**NexusIDE PRO** is a desktop-grade web developer workstation built with Next.js (App Router), React 19, Monaco Editor, Tailwind CSS v4, and dual AI integration.

It is designed for developers who want:
- The editing power of VS Code (Monaco Editor).
- Instant code execution without needing external cloud servers or paid subscriptions.
- Seamless ability to open and work on **any local folder** (like your React, Python, or Django projects).
- Dual AI pairs: Google Gemini 2.0 Flash in the cloud or Meta Llama 3.2 100% offline.
- An interactive PowerShell/Bash CLI terminal right inside the app.

---

## 🐳 2. Hitesh Choudhary'"'"'s Codebox — Where & How It Is Used

> **"Where do you use Codebox and how do I use it?"**

### What is Codebox?
**Codebox** is an open-source, Judge0-compatible code execution engine created by **Hitesh Choudhary** for the [ChaiCode](https://chaicode.com) ecosystem. It runs code in isolated Docker containers or Firecracker microVMs.
- **Repository:** https://github.com/hiteshchoudhary/Codebox

### Where Codebox is used in this codebase:
1. **Backend API Proxy:** [`src/app/api/run/route.ts`](file:///c:/Users/himan/VS%20Code/ai_ide/src/app/api/run/route.ts)
   - When you click "Run", NexusIDE sends your source code, language ID, and stdin to `http://localhost:3000/submissions?wait=true` with the header `X-Auth-Token: dev-token`.
2. **In-App Control Modal:** Click the **"Codebox"** button in the top navigation bar to open the Codebox Management Dialog.
   - Pings Codebox health.
   - Allows sending a live test submission (`print("Chai aur Code!")`).
   - Copies Docker compose commands.
3. **Setup Documentation:** Full guide located in `docker/codebox/SETUP.md`.

### How to start and use Codebox in Docker:
```bash
# 1. Clone Hitesh Sir'"'"'s Codebox in a separate folder
git clone https://github.com/hiteshchoudhary/Codebox.git
cd Codebox

# 2. Install dependencies and build language Docker images
npm install
bash ./scripts/build-images.sh

# 3. Start Codebox with Docker Compose
docker-compose up -d

# 4. Verify Codebox is active
curl http://localhost:3000/health
```

---

## ⚡ 3. Zero Docker Friction: How Code is Tested & Verified

> **"If Docker is not running, how does NexusIDE test that my code works correctly?"**

NexusIDE features an intelligent **Dual Execution Engine**:
1. **Native Host Runner (Automatic Fallback):**
   - If Docker is not running, NexusIDE detects your local computer'"'"'s installed runtimes:
     - 🐍 **Python 3.12.10:** Executed via your native `python` binary.
     - 🟨 **JavaScript / Node.js v25.0.0:** Executed via your native `node` binary.
     - 🔷 **TypeScript:** Executed natively using Node 25 strip-types.
     - ⚙️ **C / C++:** Compiled and run via `gcc` / `g++`.
   - Execution duration: **~0.20 seconds** (instant!).
2. **How verification works:**
   - **Exit code check:** Exit code `0` indicates success; non-zero codes indicate errors.
   - **Diagnostics:** Full stdout, stderr, and compiler diagnostics are parsed and color-coded.
   - **Execution Stats:** Measures execution time in seconds and memory usage in MB.

---

## 📂 4. Switching & Accessing ANY Folder

> **"If I want to switch to another folder like React, how do I access any VS Code project in NexusIDE?"**

You can open **any directory on your computer**:
1. In the File Explorer header or top navigation bar, click **"Switch Folder"**.
2. The **Workspace Selector Modal** opens, showing:
   - **Quick Shortcuts:** Direct access to your VS Code projects (e.g. `C:\Users\himan\VS Code\chai aur react`, `chai aur Backend`, `NextJS`, `python`, etc.).
   - **Directory Browser:** Navigate through subfolders and parent directories (`..`).
   - **Path Input:** Paste any folder path from your computer and click **"Open This Folder"**.
3. When opened:
   - The File Explorer loads that folder'"'"'s entire file tree.
   - Git automatically checks the repository status of that folder.
   - The built-in CLI Terminal immediately changes its working directory (`cwd`) to that folder, so commands like `npm run dev` or `python script.py` run directly inside your project!

---

## 📑 5. Tab Management & Empty Editor Canvas

> **"When I click X on a file in Monaco editor and no files remain, what happens?"**

- Previously, closing the last open tab was blocked.
- **Now Fixed:** You can close any tab by clicking `X`. When all tabs are closed:
  - NexusIDE smoothly displays the **Empty / Welcome Canvas**.
  - Provides instant buttons to create a **New File (`Ctrl+Shift+N`)**, **Switch Workspace Folder**, or open files from the explorer.
  - Clicking any file in the File Explorer or clicking `+` in the tab bar immediately opens a fresh editor tab.

---

## 💻 6. Interactive Command-Line (CLI) Terminal

In the bottom panel, click the **"CLI Terminal"** tab:
- **Interactive Shell:** Real command prompt `PS C:\Users\himan\VS Code\ai_ide>`.
- **Run any command:**
  ```powershell
  python main.py
  node run.js
  npm test
  dir
  git status
  cd "chai aur react"
  ```
- **Command History:** Use **Up Arrow** and **Down Arrow** to recall previous commands.
- **Run in CLI Button:** Click the green button to immediately execute your open file in the CLI.

---

## 🛠️ 7. Tech Stack & Architecture

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 16.3 (App Router) | High-speed server & API routing |
| **UI Engine** | React 19 + Tailwind CSS v4 | Dark mode aesthetic, responsive panels |
| **Editor** | Monaco Editor 4.7 (`@monaco-editor/react`) | VS Code editing engine & IntelliSense |
| **Execution** | Dual Engine: Native Host Runner + Docker Codebox | Zero-setup execution + optional sandboxing |
| **Cloud AI** | Google Gemini 2.0 Flash (`@google/genai`) | Low-latency coding intelligence (~180ms) |
| **Local AI** | Meta Llama 3.2 via Docker Model Runner | 100% offline & private AI pair programmer |
| **Version Control**| Simple-Git | Local staging and commit management |

---

## 🧠 8. Important AI Models & Intelligence Engines

| Model | Mode | Speed | Purpose |
|-------|------|-------|---------|
| **Gemini 2.0 Flash** | Cloud | ~180ms | Recommended: High-speed coding, bug fixing, test generation |
| **Gemini 1.5 Pro** | Cloud | ~800ms | Complex architectural refactoring & deep reasoning |
| **Llama 3.2 3B** | Offline | ~320ms | 100% private offline development via Docker Model Runner |
| **DeepSeek R1** | Local | ~600ms | Local algorithmic & competitive programming reasoning |

---

## 🗂️ 9. Complete Repository File Structure

```
ai_ide/
├── .env                              ← Environment configuration
├── .env.local.example                ← Template configuration
├── package.json                      ← Project dependencies & scripts
├── README.md                         ← Full SaaS documentation
│
├── docker/
│   └── codebox/
│       └── SETUP.md                  ← Hitesh Choudhary Codebox setup reference
│
└── src/
    ├── app/
    │   ├── globals.css               ← Dark theme CSS variables
    │   ├── layout.tsx                ← Layout with Geist fonts & dark theme
    │   ├── page.tsx                  ← Main orchestrator (state, tabs, shortcuts)
    │   └── api/
    │       ├── chat/route.ts         ← AI streaming route (Gemini & Llama)
    │       ├── fs/route.ts           ← File system CRUD (create/delete/rename)
    │       ├── fs/browse/route.ts    ← Workspace directory browser
    │       ├── git/route.ts          ← Git status and commits
    │       ├── run/route.ts          ← Dual Execution (Native Runner + Codebox)
    │       └── terminal/route.ts     ← Interactive CLI command execution
    │
    ├── components/
    │   ├── ChatPanel.tsx             ← AI Assistant panel with action chips
    │   ├── CodeboxModal.tsx          ← Hitesh Sir'"'"'s Codebox diagnostics modal
    │   ├── EditorTabBar.tsx          ← Multi-tab editor bar with dirty indicators
    │   ├── EmptyEditor.tsx           ← No-files-open welcome screen
    │   ├── FileExplorer.tsx          ← File tree with new file/folder & drag-drop
    │   ├── GitPanel.tsx              ← Local Git source control UI
    │   ├── Header.tsx                ← Top bar with Model Selector & Run button
    │   ├── KeyboardShortcutsModal.tsx← Hotkey cheat sheet modal
    │   ├── ModelSelectorModal.tsx    ← AI model selection dialog
    │   ├── ResizableHandle.tsx       ← Drag-to-resize divider
    │   ├── StatusBar.tsx             ← Bottom status bar
    │   ├── TerminalPanel.tsx         ← Interactive CLI Terminal + Code Runner
    │   └── WorkspaceSelectorModal.tsx← Open ANY folder / project modal
    │
    └── lib/
        ├── languages.ts              ← 6 supported languages & starter templates
        ├── models.ts                 ← AI model registry & descriptions
        ├── types.ts                  ← TypeScript definitions
        └── utils.ts                  ← Tailwind class merger
```

---

## 🎯 10. Key Usages & What You Can Build

1. **Full-Stack Development Workstation:** Open your React or Next.js projects, write code in Monaco, run `npm run dev` in the CLI terminal, and ask AI to fix bugs.
2. **Competitive Programming Arena:** Write Python or C++ solutions, test them with Stdin inputs, and verify runtime duration in milliseconds.
3. **100% Offline Python / Scripting Environment:** Write and execute scripts with zero internet connectivity.
4. **AI Pair Programming:** Highlight any function, click **"Fix Bug"** or **"Optimize"**, and insert the AI'"'"'s code directly into your editor with one click.

---

## 🚀 11. Step-by-Step Guide: How to Use

1. **Start the App:** Run `npm run dev` and open `http://localhost:3000`.
2. **Open Your Project Folder:** Click **"Switch Folder"** and select any directory (e.g. `C:\Users\himan\VS Code\chai aur react`).
3. **Edit Code:** Click any file in the explorer or click `+ File` to create one.
4. **Run Code:** Press **`Ctrl + Enter`** or click **"Run"**.
5. **Use CLI Terminal:** Switch to the **CLI Terminal** tab to run shell commands (`python script.py`, `node app.js`, etc.).
6. **Ask AI:** Use the right chat panel with quick action chips (`Fix Bug`, `Optimize`, `Explain`).
7. **Switch AI Models:** Click the **Model Selector** in the header to switch between Gemini Cloud and Offline Llama.
8. **Test Codebox:** Click **"Codebox"** in the header to view connection diagnostics or test Docker execution.

---

## ⌨️ 12. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **`Ctrl + Enter`** / **`Cmd + Enter`** | **Run Code immediately** (in Monaco or window) |
| **`F5`** | Run Code |
| **`Ctrl + S`** | Save active file |
| **`Ctrl + B`** | Toggle File Explorer / Git sidebar |
| **`Ctrl + Shift + N`** | Create new file |
| **`Up / Down Arrows`** | Cycle CLI Terminal command history |
| **`?`** | Open Keyboard Shortcuts Modal |

---

## 🔗 13. Resources & Official Links

- **Hitesh Choudhary'"'"'s Codebox:** [github.com/hiteshchoudhary/Codebox](https://github.com/hiteshchoudhary/Codebox)
- **ChaiCode Ecosystem:** [chaicode.com](https://chaicode.com)
- **Google AI Studio (Free Gemini API Key):** [aistudio.google.com](https://aistudio.google.com/app/apikey)
- **Monaco Editor:** [microsoft.github.io/monaco-editor](https://microsoft.github.io/monaco-editor/)
- **Next.js Documentation:** [nextjs.org/docs](https://nextjs.org/docs)

---

## 🏆 14. Conclusion

**NexusIDE PRO** delivers a unified, high-performance developer experience combining **Monaco Editor**, a **Dual Execution Engine**, a **Real Interactive CLI Terminal**, **Full Workspace Directory Access**, and **Dual Cloud/Offline AI**.

Whether you'"'"'re developing a React application from your existing VS Code folders, testing algorithms with Python, or leveraging Hitesh Sir'"'"'s Docker Codebox engine, NexusIDE puts speed, flexibility, and privacy in your hands.

---

<div align="center">
  <p>Built with ❤️ for developers who love fast, private, and powerful tools.</p>
</div>
