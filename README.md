# ⚡ AI_IDE — Local-First AI-Powered Code Editor

A self-hosted, offline-capable, web-based IDE built with **Next.js (App Router)**, **Tailwind CSS v4**, and the **Monaco Editor**. It pairs local code execution through **Docker (Codebox)** with a dual-mode AI engine: cloud-based **Google Gemini** for high-speed inference, and offline **Llama 3.2** via **Docker Model Runner** for fully air-gapped workflows.

---

## ✨ Features

- **Multi-Language Execution:** Compile and run Python, JavaScript, C, C++, and Java inside isolated Docker containers via Hitesh Choudhary's [Codebox](https://github.com/hiteshchoudhary/Codebox).
- **Dual AI Integration:**
  - **Online Mode:** Google Gemini (`gemini-2.5-flash` / `gemini-3.5-flash`) via the official `@google/genai` SDK.
  - **Offline Mode:** Local Llama 3.2 (3B) running inside Docker on port `12434` using Docker Model Runner.
- **Dynamic Model Switching:** Change AI models directly inside `.env.local` without touching frontend or backend source code.
- **VS Code Experience:** Powered by Monaco Editor with syntax highlighting, automatic indentation, and a custom dark theme.
- **Split Workspace:** Dual-panel layout dividing live terminal output and contextual AI code assistance (explaining logic or debugging errors).
- **Zero Cloud Costs:** Designed to run 100% on your laptop's local hardware without requiring paid virtual machines or cloud subscriptions.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                 Next.js Frontend (Port 3000)                │
│       Monaco Editor  │  Terminal Output  │  AI Assistant    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
        POST /api/run                  POST /api/chat
               │                              │
               ▼                              ├──────────────────────────┐
┌──────────────────────────────┐              ▼                          ▼
│     Codebox Container        │   ┌─────────────────────┐    ┌─────────────────────┐
│     (Docker @ Port 2358)     │   │   Google Gemini     │    │ Docker Model Runner │
│  Compiles & Runs User Code   │   │   Cloud API (Free)  │    │ (Llama 3.2 @ 12434) │
└──────────────────────────────┘   └─────────────────────┘    └─────────────────────┘