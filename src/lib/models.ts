import type { AIModel } from "./types";

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    isLocal: false,
    badge: "Fastest Cloud",
    latency: "~180ms",
    description: "Next-gen multimodal model with sub-second latency and strong code generation.",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    isLocal: false,
    badge: "Deep Reasoning",
    latency: "~800ms",
    description: "State-of-the-art reasoning for large refactors, architecture designs, and bug investigations.",
  },
  {
    id: "ai/llama3.2",
    name: "Llama 3.2 3B (Offline)",
    provider: "local",
    isLocal: true,
    badge: "Private Local",
    latency: "~320ms",
    description: "Runs 100% offline via Docker Model Runner on localhost:12434 with zero data leaving your machine.",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1 (Local)",
    provider: "deepseek",
    isLocal: true,
    badge: "Reasoning Local",
    latency: "~600ms",
    description: "Open-weights reasoning powerhouse hosted via local Ollama / Docker container.",
  },
];
