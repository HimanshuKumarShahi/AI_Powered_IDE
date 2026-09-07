# ─── Hitesh Choudhary's Codebox — Setup Guide ─────────────────────────────────
# Source: https://github.com/hiteshchoudhary/Codebox
#
# Codebox is a blazing-fast, Judge0-compatible code execution engine built
# for ChaiCode. It runs user code in isolated Docker containers or 
# Firecracker microVMs and exposes a REST API.
#
# ─── Prerequisites ─────────────────────────────────────────────────────────────
# 1. Docker Desktop (https://www.docker.com/products/docker-desktop)
# 2. Node.js 20+
# 3. Git
#
# ─── Step-by-Step Setup ───────────────────────────────────────────────────────
#
# Step 1: Clone the Codebox repository (anywhere on your machine)
#   git clone https://github.com/hiteshchoudhary/Codebox.git
#   cd Codebox
#
# Step 2: Install Node.js dependencies
#   npm install
#
# Step 3: Build the language runtime Docker images
#   (This builds custom images for Python, JS, C, C++, Java)
#   chmod +x ./scripts/build-images.sh   # (Linux/Mac only — skip on Windows)
#   ./scripts/build-images.sh            # or: bash ./scripts/build-images.sh
#
# Step 4: Copy and configure environment
#   cp .env.example .env
#   # The default .env works for local dev — AUTH_TOKEN=dev-token, port 3000
#
# Step 5: Start Codebox with Docker Compose
#   docker-compose up -d
#
# Step 6: Verify it's running
#   curl http://localhost:3000/health
#   # Should respond with: {"status":"ok","executor":"docker"}
#
# ─── Test Code Execution ───────────────────────────────────────────────────────
# Run a Python submission:
#
#   curl -X POST "http://localhost:3000/submissions?wait=true" \
#     -H "Content-Type: application/json" \
#     -H "X-Auth-Token: dev-token" \
#     -d '{"source_code": "print(\"Chai aur Code!\")", "language_id": 71}'
#
# Expected response:
#   {"stdout":"Chai aur Code!\n","stderr":"","status":{"id":3,"description":"Accepted"},...}
#
# ─── Language IDs (Judge0-compatible) ─────────────────────────────────────────
# Python 3       → 71
# JavaScript     → 63
# C              → 50
# C++            → 54
# Java           → 62
#
# ─── NexusIDE Connection ──────────────────────────────────────────────────────
# In your NexusIDE .env (or .env.local):
#   CODEBOX_URL=http://localhost:3000
#   CODEBOX_AUTH_TOKEN=dev-token
#
# ─── Stopping Codebox ─────────────────────────────────────────────────────────
#   docker-compose down                  # stop services
#   docker-compose down -v               # stop + remove Redis data
#
# ─── Troubleshooting ──────────────────────────────────────────────────────────
# Q: "Cannot connect to Codebox" in NexusIDE
# A: Make sure docker-compose up -d ran successfully inside the Codebox folder.
#    Run: docker ps | grep codebox
#
# Q: build-images.sh fails on Windows
# A: Use Git Bash or WSL:  bash ./scripts/build-images.sh
#    Or run the build commands manually from the script.
#
# Q: Port 3000 conflict
# A: Change the port in Codebox's docker-compose.yml (e.g., "3001:3000")
#    Then update CODEBOX_URL=http://localhost:3001 in NexusIDE .env
