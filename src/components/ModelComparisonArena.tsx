import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Zap,
  Cpu,
  Clock,
  Coins,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { ModelComparisonResult, ModelId } from '../types';
import { apiClient } from '../services/apiClient';

export function ModelComparisonArena() {
  const [prompt, setPrompt] = useState(
    'Compare Transformer architecture with Recurrent Neural Networks (RNNs) for natural language processing.'
  );
  const [selectedModels, setSelectedModels] = useState<ModelId[]>([
    'gemini-3.7-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
  ]);
  const [results, setResults] = useState<ModelComparisonResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const availableModels: Array<{ id: ModelId; label: string; desc: string }> = [
    {
      id: 'gemini-3.7-flash',
      label: 'Gemini 3.7 Flash',
      desc: 'Next-gen multimodal flagship with thinking reasoning capabilities.',
    },
    {
      id: 'gemini-2.5-pro',
      label: 'Gemini 2.5 Pro',
      desc: 'State-of-the-art analytical depth, complex reasoning, and coding precision.',
    },
    {
      id: 'gemini-2.5-flash',
      label: 'Gemini 2.5 Flash',
      desc: 'Ultra-low latency model engineered for instant response turnarounds.',
    },
  ];

  const handleToggleModel = (id: ModelId) => {
    if (selectedModels.includes(id)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter((m) => m !== id));
      }
    } else {
      setSelectedModels([...selectedModels, id]);
    }
  };

  const handleRunComparison = async () => {
    if (!prompt.trim() || selectedModels.length === 0) return;
    setIsLoading(true);
    setResults([]);

    try {
      const data = await apiClient.compareModels(prompt, selectedModels);
      setResults(data.results);
    } catch (err: any) {
      console.error('Multi-model comparison failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const samplePrompts = [
    'How does backpropagation compute gradients through time in LSTM networks?',
    'Write a production-ready TypeScript debounce function with generic type safety.',
    'Explain the mathematical formulation of attention: Softmax((Q * K^T) / sqrt(d_k)) * V.',
    'Solve this step-by-step: If a plane flies 2400 miles in 4 hours with tailwind and 6 hours against headwind, find plane speed and wind speed.',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Layers className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Multi-Model Arena & Comparator
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Run queries in parallel across Gemini models to benchmark reasoning quality, latency, and token efficiency side-by-side.
            </p>
          </div>
        </div>

        {/* Model Selection Checkboxes */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {availableModels.map((m) => {
            const isChecked = selectedModels.includes(m.id);
            return (
              <label
                key={m.id}
                onClick={() => handleToggleModel(m.id)}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md'
                    : 'bg-slate-950/40 border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="w-4 h-4 mt-0.5 rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    {m.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Prompt Input Box */}
        <div className="mt-5 space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Type any challenging question or problem to compare model intelligence..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 resize-none font-sans"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors truncate max-w-[280px]"
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={handleRunComparison}
              disabled={isLoading || !prompt.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <Zap className="w-3.5 h-3.5 animate-spin" />
                  Comparing {selectedModels.length} Models...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Run Arena Comparison
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Comparison Grid */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-bold text-slate-200">Side-by-Side Outputs ({results.length} Models)</span>
            <span>Parallel Execution Complete</span>
          </div>

          <div className={`grid grid-cols-1 ${results.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-4`}>
            {results.map((res, idx) => {
              const isFastest = Math.min(...results.map((r) => r.latencyMs)) === res.latencyMs;

              return (
                <div
                  key={res.model}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-indigo-400" />
                          {res.modelName}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">{res.model}</span>
                      </div>

                      <button
                        onClick={() => handleCopy(res.response, idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Copy Response"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Metrics Bar */}
                    <div className="flex items-center gap-2 mb-3 text-[11px]">
                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-mono ${
                          isFastest
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                            : 'bg-slate-950 text-slate-300 border border-slate-800'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {res.latencyMs} ms {isFastest && '⚡ (Fastest)'}
                      </div>

                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                        <Coins className="w-3 h-3 text-amber-400" />
                        {res.tokenCount} tokens
                      </div>
                    </div>

                    {/* Response Text */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {res.response}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
