import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  Zap,
  BookOpen,
  Cpu,
  RefreshCw,
  Send,
  MessageSquare,
} from 'lucide-react';
import { KnowledgeDirective, ModelId, TrainingExample } from '../types';
import { apiClient } from '../services/apiClient';

interface ModelTrainingStudioProps {
  activeModel: ModelId;
  onSelectModel: (model: ModelId) => void;
  thinkingBudget: number;
  onUpdateThinkingBudget: (budget: number) => void;
  enableFewShot: boolean;
  onToggleFewShot: (enabled: boolean) => void;
  enableDirectives: boolean;
  onToggleDirectives: (enabled: boolean) => void;
}

export function ModelTrainingStudio({
  activeModel,
  onSelectModel,
  thinkingBudget,
  onUpdateThinkingBudget,
  enableFewShot,
  onToggleFewShot,
  enableDirectives,
  onToggleDirectives,
}: ModelTrainingStudioProps) {
  const [activeTab, setActiveTab] = useState<'fewshot' | 'directives' | 'test'>('fewshot');
  const [examples, setExamples] = useState<TrainingExample[]>([]);
  const [directives, setDirectives] = useState<KnowledgeDirective[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // New training form state
  const [newPrompt, setNewPrompt] = useState('');
  const [newOutput, setNewOutput] = useState('');
  const [newCategory, setNewCategory] = useState('Social Media & Internet Culture');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // New directive form state
  const [newDirectiveTitle, setNewDirectiveTitle] = useState('');
  const [newDirectiveContent, setNewDirectiveContent] = useState('');

  // Live Playground Test State
  const [testPrompt, setTestPrompt] = useState('What does FYP stand for and how does the TikTok algorithm rank content?');
  const [testResponse, setTestResponse] = useState('');
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedExamples, fetchedDirectives] = await Promise.all([
        apiClient.getTrainingExamples(),
        apiClient.getKnowledgeDirectives(),
      ]);
      setExamples(fetchedExamples);
      setDirectives(fetchedDirectives);
    } catch (err) {
      console.error('Failed to load training data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim() || !newOutput.trim()) return;

    try {
      const created = await apiClient.createTrainingExample(newPrompt, newOutput, newCategory);
      setExamples((prev) => [created, ...prev]);
      setNewPrompt('');
      setNewOutput('');
    } catch (err) {
      console.error('Failed to save training pair:', err);
    }
  };

  const handleToggleExample = async (id: string, active: boolean) => {
    try {
      await apiClient.toggleTrainingExample(id, active);
      setExamples((prev) =>
        prev.map((item) => (item.id === id ? { ...item, active } : item))
      );
    } catch (err) {
      console.error('Failed to toggle example:', err);
    }
  };

  const handleDeleteExample = async (id: string) => {
    try {
      await apiClient.deleteTrainingExample(id);
      setExamples((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete training example:', err);
    }
  };

  const handleAddDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirectiveTitle.trim() || !newDirectiveContent.trim()) return;

    try {
      const created = await apiClient.createKnowledgeDirective(
        newDirectiveTitle,
        newDirectiveContent
      );
      setDirectives((prev) => [created, ...prev]);
      setNewDirectiveTitle('');
      setNewDirectiveContent('');
    } catch (err) {
      console.error('Failed to add directive:', err);
    }
  };

  const handleToggleDirective = async (id: string, active: boolean) => {
    try {
      await apiClient.toggleKnowledgeDirective(id, active);
      setDirectives((prev) =>
        prev.map((item) => (item.id === id ? { ...item, active } : item))
      );
    } catch (err) {
      console.error('Failed to toggle directive:', err);
    }
  };

  const handleDeleteDirective = async (id: string) => {
    try {
      await apiClient.deleteKnowledgeDirective(id);
      setDirectives((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete directive:', err);
    }
  };

  const handleRunLiveTest = async () => {
    if (!testPrompt.trim()) return;
    setIsTesting(true);
    setTestResponse('');
    const startTime = Date.now();

    try {
      const result = await apiClient.processVoiceOrText({
        text: testPrompt,
        model: activeModel,
        thinkingBudget,
        enableFewShotTraining: enableFewShot,
        enableKnowledgeDirectives: enableDirectives,
      });

      setTestResponse(result.message.content);
      setTestLatency(Date.now() - startTime);
    } catch (err: any) {
      setTestResponse(`Error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const models: Array<{ id: ModelId; name: string; tag: string; desc: string }> = [
    {
      id: 'gemini-3.7-flash',
      name: 'Gemini 3.7 Flash',
      tag: 'Hybrid Speed & Thinking (Recommended)',
      desc: 'Next-gen multimodal flagship model with configurable Chain-of-Thought reasoning budget.',
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      tag: 'Deep Analytical Reasoning',
      desc: 'Highest reasoning depth for complex math, structured algorithms, and multi-step logic.',
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      tag: 'Ultra-Low Latency',
      desc: 'High-speed production model optimized for instantaneous voice conversational turnarounds.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Brain className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Model Training & Tuning Studio
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Fine-tune the assistant with In-Context Few-Shot Exemplar Pairs, Custom Domain Directives, and Multi-Model Reasoning.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Reload Training Data
            </button>
          </div>
        </div>

        {/* Multi-Model Selector Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          {models.map((m) => {
            const isSelected = activeModel === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectModel(m.id)}
                className={`text-left p-4 rounded-xl border transition-all relative ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-cyan-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-1.5">
                  <Cpu className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="text-sm font-bold text-white">{m.name}</span>
                </div>
                <div className="text-[11px] font-semibold text-cyan-400 mb-1">{m.tag}</div>
                <div className="text-xs text-slate-400 line-clamp-2">{m.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Global Hyperparameter Controls */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={enableFewShot}
                onChange={(e) => onToggleFewShot(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Enable In-Context Few-Shot Training ({examples.filter((e) => e.active).length} Active)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={enableDirectives}
                onChange={(e) => onToggleDirectives(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Inject Domain Directives ({directives.filter((d) => d.active).length} Active)</span>
            </label>
          </div>

          {activeModel === 'gemini-3.7-flash' && (
            <div className="flex items-center gap-3">
              <span className="text-slate-400 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Thinking Budget:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="4096"
                  step="512"
                  value={thinkingBudget}
                  onChange={(e) => onUpdateThinkingBudget(Number(e.target.value))}
                  className="w-28 accent-cyan-400 cursor-pointer"
                />
                <span className="font-mono text-cyan-300 font-bold">
                  {thinkingBudget === 0 ? 'Off (0 tokens)' : `${thinkingBudget} tok`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('fewshot')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'fewshot'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Few-Shot Training Dataset ({examples.length})
        </button>

        <button
          onClick={() => setActiveTab('directives')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'directives'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Domain Directives ({directives.length})
        </button>

        <button
          onClick={() => setActiveTab('test')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'test'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Live Model Quality Sandbox
        </button>
      </div>

      {/* TAB 1: Few-Shot Training Dataset */}
      {activeTab === 'fewshot' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Training Pair Form */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg h-fit space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Plus className="w-4 h-4 text-cyan-400" />
              Add Training Pair (Input ➔ Target Output)
            </div>
            <p className="text-xs text-slate-400">
              Provide an ideal query and the exact high-quality answer format you want your model to learn.
            </p>

            <form onSubmit={handleAddExample} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Category / Domain</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Science, Coding, Math, Conciseness"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">User Query (Prompt)</label>
                <textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  rows={3}
                  placeholder="e.g. Explain how transformers handle long range dependencies in 2 sentences."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ideal Model Output</label>
                <textarea
                  value={newOutput}
                  onChange={(e) => setNewOutput(e.target.value)}
                  rows={4}
                  placeholder="e.g. Transformers use self-attention to compute pairwise relationships between all tokens..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Training Dataset
              </button>
            </form>
          </div>

          {/* Training Dataset List */}
          <div className="lg:col-span-2 space-y-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pb-1">
              {[
                'All',
                'Social Media & Platforms',
                'Social Media & Analytics',
                'Social Media & Internet Slang',
                'Social Media & Internet Culture',
                'Creator Economy & YouTube',
                'Social Media Marketing & UGC',
                'Content Creation & Virality',
                'Social Media & Content Moderation',
                'Wikipedia & Science',
                'Google Assistant & Geography',
                'Deep Learning',
              ].map((cat) => {
                const isSelected = selectedCategoryFilter === cat;
                const count =
                  cat === 'All'
                    ? examples.length
                    : examples.filter((e) => e.category.toLowerCase().includes(cat.toLowerCase())).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Showing {
                  selectedCategoryFilter === 'All'
                    ? examples.length
                    : examples.filter((e) => e.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase())).length
                } Exemplars
              </span>
              <span>In-Context Prompt Injection Active</span>
            </div>

            {examples.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                No training pairs yet. Add your first input/output exemplar pair on the left.
              </div>
            ) : (
              examples
                .filter((item) =>
                  selectedCategoryFilter === 'All'
                    ? true
                    : item.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase())
                )
                .map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.active
                      ? 'bg-slate-900/80 border-slate-800 shadow-md'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-800 text-cyan-400">
                      {item.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400">
                        <input
                          type="checkbox"
                          checked={item.active}
                          onChange={(e) => handleToggleExample(item.id, e.target.checked)}
                          className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                        />
                        <span className="text-[11px]">{item.active ? 'Trained' : 'Inactive'}</span>
                      </label>
                      <button
                        onClick={() => handleDeleteExample(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Delete exemplar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-cyan-400 block mb-1">User Query:</span>
                      <p className="text-slate-200">{item.input}</p>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
                      <span className="font-bold text-emerald-400 block mb-1">Trained Target Output:</span>
                      <p className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap">{item.output}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Domain Directives */}
      {activeTab === 'directives' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Directive Form */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg h-fit space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Plus className="w-4 h-4 text-cyan-400" />
              Add Domain Knowledge Directive
            </div>
            <p className="text-xs text-slate-400">
              Provide behavioral guidelines, tone constraints, or technical knowledge rules injected into every prompt.
            </p>

            <form onSubmit={handleAddDirective} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Directive Title</label>
                <input
                  type="text"
                  value={newDirectiveTitle}
                  onChange={(e) => setNewDirectiveTitle(e.target.value)}
                  placeholder="e.g. Mathematical Rigor & Code Precision"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Instruction / Rule Content</label>
                <textarea
                  value={newDirectiveContent}
                  onChange={(e) => setNewDirectiveContent(e.target.value)}
                  rows={4}
                  placeholder="e.g. Whenever generating code, always include type hints and handle edge cases gracefully."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Directive
              </button>
            </form>
          </div>

          {/* Directives List */}
          <div className="lg:col-span-2 space-y-3">
            {directives.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                No directives configured.
              </div>
            ) : (
              directives.map((dir) => (
                <div
                  key={dir.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    dir.active
                      ? 'bg-slate-900/80 border-slate-800 shadow-md'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      {dir.title}
                    </h4>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400">
                        <input
                          type="checkbox"
                          checked={dir.active}
                          onChange={(e) => handleToggleDirective(dir.id, e.target.checked)}
                          className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                        />
                        <span className="text-[11px]">{dir.active ? 'Active' : 'Disabled'}</span>
                      </label>
                      <button
                        onClick={() => handleDeleteDirective(dir.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                    {dir.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Live Model Quality Sandbox */}
      {activeTab === 'test' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Live Model Execution Playground
            </h3>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800">
              Active: {activeModel}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Submit any challenging question to evaluate the trained model's response quality in real-time.
          </p>

          <div className="space-y-3">
            <textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              rows={3}
              placeholder="Ask any complex technical question, coding challenge, or reasoning puzzle..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none font-sans"
            />

            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[11px] font-semibold text-cyan-400 block mb-1.5">
                  🔥 Social Media & Digital Culture Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'What does FYP stand for and how does the TikTok algorithm rank content?',
                    'What is the difference between Reach and Impressions?',
                    'What do the slang terms "No Cap", "Rizz", and "Delulu" mean?',
                    'How does YouTube monetization, CPM, and RPM work?',
                    'What is the 3-Second Hook Rule for viral short-form video?',
                    'What does getting "Ratioed" mean on Twitter / X?',
                    'What is User-Generated Content (UGC) and why do brands prioritize it?',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTestPrompt(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  📚 General Wikipedia & Science Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'What is photosynthesis?',
                    'Who was Albert Einstein?',
                    'Why is the sky blue?',
                    'What is the speed of light?',
                    'What is the capital of France?',
                    'How does an internal combustion engine work?',
                    'Calculate 15% of 4500 + 250',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTestPrompt(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleRunLiveTest}
                  disabled={isTesting || !testPrompt.trim()}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-md cursor-pointer"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Inferencing...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Test Model Quality
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Result Output */}
          {testResponse && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Output Response (Generated in {testLatency} ms)
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Model: {activeModel} • Few-Shot: {enableFewShot ? 'On' : 'Off'}
                </span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {testResponse}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
