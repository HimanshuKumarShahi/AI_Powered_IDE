"use client";

import { useState } from "react";
import { Check, Sparkles, Cpu, Zap, Lock, ExternalLink, X, ShieldCheck } from "lucide-react";
import { AVAILABLE_MODELS } from "@/lib/models";
import type { AIModel } from "@/lib/types";

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: AIModel;
  onSelectModel: (model: AIModel) => void;
}

export function ModelSelectorModal({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
}: ModelSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Select AI Intelligence Engine</h2>
              <p className="text-[11px] text-zinc-400">Switch between Google Cloud models & 100% offline local runners</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model List */}
        <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {AVAILABLE_MODELS.map((model) => {
            const isSelected = selectedModel.id === model.id;
            return (
              <div
                key={model.id}
                onClick={() => {
                  onSelectModel(model);
                  onClose();
                }}
                className={`group relative p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-violet-500/10 border-violet-500/50 shadow-sm"
                    : "bg-zinc-800/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        model.isLocal
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                      }`}
                    >
                      {model.isLocal ? <Cpu className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-100 group-hover:text-violet-300 transition-colors">
                          {model.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                            model.isLocal
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {model.badge}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">{model.latency}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        {model.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center flex-shrink-0">
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-zinc-700 group-hover:border-zinc-500" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local mode sends 0% data outside your laptop</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Configured via .env</span>
        </div>
      </div>
    </div>
  );
}
