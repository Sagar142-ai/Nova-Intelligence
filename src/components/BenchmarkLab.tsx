import React, { useState } from 'react';
import {
  Activity,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart2,
  Sparkles,
  Gauge,
  Info,
} from 'lucide-react';
import { BenchmarkMetrics, BenchmarkResult } from '../types';
import { apiClient } from '../services/apiClient';

export const BenchmarkLab: React.FC = () => {
  const [metrics, setMetrics] = useState<BenchmarkMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleRunBenchmark = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.runIntentBenchmark();
      setMetrics(data);
    } catch (err) {
      console.error('Benchmark execution error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Intent Classification Experimentation Lab
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  SNIPS Benchmark
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct comparative evaluation: Rule-Based Classifier vs. LLM Classifier (Accuracy & Latency)
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-run-benchmark"
          onClick={handleRunBenchmark}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              Running Live Benchmark...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Run SNIPS Intent Benchmark
            </>
          )}
        </button>
      </div>

      {/* Academic Methodology Callout */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-white">Academic Defense Note for Viva:</span>
          <p className="text-slate-400 leading-relaxed">
            This experiment validates two architectural approaches for Intent Recognition in Voice Assistants:
            <strong> Approach 1 (Deterministic Pattern Matching)</strong> provides sub-millisecond latency (avg &lt;1ms) for common commands.
            <strong> Approach 2 (Generative LLM Semantic Parsing)</strong> offers flexible generalized intent classification across open-ended natural language.
          </p>
        </div>
      </div>

      {/* Benchmark Summary Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          {/* Rule Accuracy */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 uppercase font-medium">Rule-Based Accuracy</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-amber-400 font-mono">{metrics.ruleAccuracy}%</span>
              <span className="text-xs text-slate-500">of {metrics.totalSamples} queries</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">Deterministic Keyword & Regex</span>
          </div>

          {/* LLM Accuracy */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 uppercase font-medium">LLM Classifier Accuracy</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-cyan-400 font-mono">{metrics.llmAccuracy}%</span>
              <span className="text-xs text-slate-500">of {metrics.totalSamples} queries</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">Gemini 3.7 Flash Zero-Shot</span>
          </div>

          {/* Rule Latency */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 uppercase font-medium">Rule Engine Avg Latency</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                {metrics.ruleAvgLatencyMs} ms
              </span>
              <span className="text-xs text-emerald-500/80">Ultra-fast</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">Instant local evaluation</span>
          </div>

          {/* LLM Latency */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 uppercase font-medium">LLM Engine Avg Latency</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-indigo-400 font-mono">
                {metrics.llmAvgLatencyMs} ms
              </span>
              <span className="text-xs text-slate-500">API round-trip</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">Inference + Network hop</span>
          </div>
        </div>
      )}

      {/* Detailed Benchmark Test Results Table */}
      {metrics ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Query-Level Intent Evaluation Matrix ({metrics.results.length} samples)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">SNIPS Conversational Corpus</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Sample Utterance</th>
                  <th className="px-3 py-3">Ground Truth</th>
                  <th className="px-3 py-3">Rule-Based Intent</th>
                  <th className="px-3 py-3">Rule Latency</th>
                  <th className="px-3 py-3">LLM-Based Intent</th>
                  <th className="px-3 py-3">LLM Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {metrics.results.map((row) => (
                  <tr key={row.sampleId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-200 font-sans max-w-xs truncate">
                      "{row.query}"
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {row.expectedIntent}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        {row.ruleCorrect ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span
                          className={`font-mono text-[11px] ${
                            row.ruleCorrect ? 'text-emerald-300' : 'text-rose-300'
                          }`}
                        >
                          {row.predictedIntentRule}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-400 text-[11px]">
                      {row.ruleLatencyMs} ms
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        {row.llmCorrect ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span
                          className={`font-mono text-[11px] ${
                            row.llmCorrect ? 'text-cyan-300' : 'text-rose-300'
                          }`}
                        >
                          {row.predictedIntentLLM}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-400 text-[11px]">
                      {row.llmLatencyMs} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-200">Ready to Evaluate Intent Models</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Click "Run SNIPS Intent Benchmark" to benchmark both intent models across 18 SNIPS conversational samples and calculate empirical accuracy and latency.
          </p>
          <button
            onClick={handleRunBenchmark}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20"
          >
            Start Experiment
          </button>
        </div>
      )}
    </div>
  );
};
