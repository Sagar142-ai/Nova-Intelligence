import React, { useState } from 'react';
import {
  Zap,
  Activity,
  Cpu,
  Clock,
  Wrench,
  CheckCircle,
  XCircle,
  Code2,
  ChevronDown,
  ChevronUp,
  X,
  Gauge,
} from 'lucide-react';
import { AgentTelemetry } from '../types';

interface TelemetryDrawerProps {
  telemetry: AgentTelemetry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({ telemetry, isOpen, onClose }) => {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isOpen) return null;

  const lat = telemetry?.latency || {
    asrMs: 0,
    intentMs: 0,
    planningMs: 0,
    toolMs: 0,
    llmMs: 0,
    ttsMs: 0,
    totalMs: 0,
  };

  const total = Math.max(lat.totalMs, 1);

  return (
    <aside
      aria-label="Agent Telemetry & Telemetry Inspector"
      className="fixed inset-y-0 right-0 w-full sm:w-96 lg:w-[420px] bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-50 flex flex-col transition-all duration-300 animate-slideInRight"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Agent Telemetry & Inspector
            </h2>
            <p className="text-[11px] text-slate-400">Live cognitive trace & viva telemetry</p>
          </div>
        </div>
        <button
          id="btn-close-telemetry"
          onClick={onClose}
          aria-label="Close telemetry drawer"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!telemetry ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <Activity className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
            <p className="text-sm font-medium text-slate-300">No telemetry recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Speak or submit a message to observe intent classification, tool execution, and latency metrics in real time.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Intent Detection Section */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  1. Intent Classification
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {Math.round(telemetry.intentConfidence * 100)}% Conf
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase">Detected Intent</span>
                  <span className="text-sm font-bold text-cyan-300 font-mono capitalize">
                    {telemetry.intent.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase">Classifier Method</span>
                  <span className="text-xs font-mono text-slate-300 block capitalize">
                    {telemetry.intentMethod.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {telemetry.reasoningNotes && (
                <p className="text-xs text-slate-300 bg-slate-950/50 p-2 rounded border border-slate-800/50 italic">
                  "{telemetry.reasoningNotes}"
                </p>
              )}
            </div>

            {/* 2. Tool Execution Section */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-purple-400" />
                  2. Tool Execution Status
                </span>
                {telemetry.toolUsed ? (
                  <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    Executed
                  </span>
                ) : (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    Direct Reasoning
                  </span>
                )}
              </div>

              {telemetry.toolExecution ? (
                <div className="space-y-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Selected Tool:</span>
                    <span className="font-mono font-bold text-purple-300">
                      {telemetry.toolExecution.toolName}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Tool Input Arguments:</span>
                    <pre className="text-[11px] font-mono bg-slate-900 p-2 rounded text-emerald-300 overflow-x-auto border border-slate-800">
                      {JSON.stringify(telemetry.toolExecution.toolInput, null, 2)}
                    </pre>
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Tool Output Observation:</span>
                    <pre className="text-[11px] font-mono bg-slate-900 p-2 rounded text-cyan-300 overflow-x-auto border border-slate-800">
                      {JSON.stringify(telemetry.toolExecution.toolOutput, null, 2)}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>Tool Duration:</span>
                    <span className="font-mono text-purple-300">
                      {telemetry.toolExecution.executionTimeMs} ms
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 text-xs text-slate-400">
                  No external tool required. Request resolved via direct parametric LLM reasoning.
                </div>
              )}
            </div>

            {/* 3. Latency Waterfall Breakdown */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  3. Latency Breakdown (E2E)
                </span>
                <span className="text-xs font-bold text-amber-300 font-mono">
                  {lat.totalMs} ms total
                </span>
              </div>

              <div className="space-y-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                {/* ASR Latency */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>1. Speech ASR:</span>
                    <span className="font-mono text-slate-200">{lat.asrMs} ms</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${Math.min((lat.asrMs / total) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Intent Latency */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>2. Intent Classifier:</span>
                    <span className="font-mono text-slate-200">{lat.intentMs} ms</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min((lat.intentMs / total) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Tool Execution Latency */}
                {telemetry.toolUsed && (
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>3. Deterministic Tool:</span>
                      <span className="font-mono text-purple-300">{lat.toolMs} ms</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${Math.min((lat.toolMs / total) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* LLM Reasoning Latency */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>4. LLM Generation:</span>
                    <span className="font-mono text-cyan-300">{lat.llmMs} ms</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${Math.min((lat.llmMs / total) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* TTS Latency */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>5. Speech TTS Synthesis:</span>
                    <span className="font-mono text-emerald-300">{lat.ttsMs} ms</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min((lat.ttsMs / total) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Model & Token Metrics */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                4. LLM Foundation Specs
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Engine Model</span>
                  <span className="font-mono font-bold text-indigo-300">{telemetry.modelUsed}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Tokens Evaluated</span>
                  <span className="font-mono text-slate-300">
                    ~{telemetry.tokenUsage?.totalTokens || 45} tokens
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Raw Debug JSON Toggle */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="w-full flex items-center justify-between p-3 bg-slate-900/90 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  Raw Inspector JSON Payload
                </span>
                {showRawJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showRawJson && (
                <div className="p-3 bg-slate-950 border-t border-slate-800">
                  <pre className="text-[10px] font-mono text-cyan-400 overflow-x-auto max-h-48 scrollbar-thin">
                    {JSON.stringify(telemetry, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
