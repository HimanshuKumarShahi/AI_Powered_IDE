"use client";

import { useState } from "react";
import {
  Server,
  Zap,
  CheckCircle2,
  XCircle,
  Play,
  Copy,
  Check,
  ExternalLink,
  X,
  Loader2,
  Terminal,
  ShieldCheck,
  Cpu,
} from "lucide-react";

interface CodeboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  runnerEngine: string;
  onSelectEngine: (engine: "native" | "codebox") => void;
}

export function CodeboxModal({
  isOpen,
  onClose,
  runnerEngine,
  onSelectEngine,
}: CodeboxModalProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleCheckHealth = async () => {
    setIsChecking(true);
    setHealthStatus(null);
    try {
      // Test through /api/run with a test ping
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: "print('Codebox Ping Test')",
          language_id: 71,
        }),
      });
      const data = await res.json();
      setHealthStatus(data);
    } catch (err) {
      setHealthStatus({ error: (err as Error).message });
    } finally {
      setIsChecking(false);
    }
  };

  const handleTestCodebox = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: "def solve():\n    return 'Chai aur Code from Codebox!'\nprint(solve())",
          language_id: 71,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ error: (err as Error).message });
    } finally {
      setIsTesting(false);
    }
  };

  const dockerCommands = `# 1. Clone Hitesh Sir's Codebox
git clone https://github.com/hiteshchoudhary/Codebox.git
cd Codebox

# 2. Install dependencies & build language images
npm install
bash ./scripts/build-images.sh

# 3. Start Codebox
docker-compose up -d

# 4. Verify running on port 3000
curl http://localhost:3000/health`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-100">Hitesh Sir&apos;s Codebox Engine</h2>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-orange-500/20 text-orange-400 rounded border border-orange-500/30">
                  DOCKER
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Sandboxed code execution engine built for ChaiCode platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Active Engine Card */}
          <div className="p-3.5 rounded-lg bg-zinc-850 border border-zinc-750 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">
                Current Active Runner:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 font-mono">
                  {runnerEngine}
                </span>
              </div>
            </div>
            <button
              onClick={handleCheckHealth}
              disabled={isChecking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
            >
              {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-violet-400" />}
              <span>Test Connection</span>
            </button>
          </div>

          {/* Health Status display if checked */}
          {healthStatus && (
            <div className={`p-3 rounded-lg border text-xs font-mono ${
              healthStatus.status?.id === 3
                ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-300"
                : "bg-amber-950/30 border-amber-900/50 text-amber-300"
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {healthStatus.status?.id === 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-amber-400" />
                )}
                <span>Engine Diagnostic: {healthStatus.engine || "System Runner"}</span>
              </div>
              <p className="text-[11px] opacity-90">{healthStatus.hint || healthStatus.stdout || "Ready to execute code"}</p>
            </div>
          )}

          {/* How NexusIDE Uses Codebox */}
          <div className="space-y-1.5 text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-800">
            <h4 className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
              <span>How Code Execution Works in NexusIDE</span>
            </h4>
            <p className="text-[11px] text-zinc-400">
              NexusIDE sends code to <code className="text-violet-400 font-mono">POST /api/run</code>.
              If Codebox is running on Docker, it forwards to <code className="text-orange-400 font-mono">http://localhost:3000/submissions?wait=true</code> with <code className="text-zinc-300 font-mono">X-Auth-Token: dev-token</code>.
            </p>
            <p className="text-[11px] text-zinc-400">
              If Docker is not running, NexusIDE <strong>gracefully executes your code natively</strong> using your computer&apos;s installed Python 3.12 or Node.js runtime, so you never get blocked by Docker errors!
            </p>
          </div>

          {/* Interactive Live Test */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">Run Quick Test Submission:</span>
              <button
                onClick={handleTestCodebox}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
              >
                {isTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-white" />}
                <span>Execute Test</span>
              </button>
            </div>

            {testResult && (
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs">
                <span className="text-[10px] text-zinc-500 block mb-1">Execution Response:</span>
                <pre className="text-emerald-400 whitespace-pre-wrap">{testResult.stdout || testResult.stderr || JSON.stringify(testResult, null, 2)}</pre>
                <div className="flex items-center gap-3 text-[10px] text-zinc-500 pt-1.5 border-t border-zinc-850 mt-1.5">
                  <span>Engine: {testResult.engine}</span>
                  <span>Time: {testResult.time}s</span>
                  <span>Status: {testResult.status?.description}</span>
                </div>
              </div>
            )}
          </div>

          {/* Setup Codebox in Docker Instructions */}
          <div className="space-y-2 pt-1 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">
                How to Start Codebox in Docker:
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(dockerCommands);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? "Copied" : "Copy commands"}</span>
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 font-mono leading-relaxed overflow-x-auto">
              <code>{dockerCommands}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-400">
          <a
            href="https://github.com/hiteshchoudhary/Codebox"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-orange-400 hover:text-orange-300 font-medium"
          >
            <span>GitHub: hiteshchoudhary/Codebox</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
