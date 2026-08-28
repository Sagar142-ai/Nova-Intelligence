import React from 'react';
import { Settings, Volume2, UserCheck, Cpu, X, ToggleLeft, ToggleRight, Sliders, Brain } from 'lucide-react';
import { AssistantSettings, ModelId } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AssistantSettings;
  onUpdateSettings: (newSettings: Partial<AssistantSettings>) => void;
  availableVoices: SpeechSynthesisVoice[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  availableVoices,
}) => {
  if (!isOpen) return null;

  const models: Array<{ id: ModelId; label: string; desc: string }> = [
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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Nova AI Model & Voice Settings</h2>
              <p className="text-xs text-slate-400">Customize LLM model, reasoning budget, and speech</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* 1. Foundation Model Selector */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Active Foundation Model
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onUpdateSettings({ selectedModel: m.id })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.selectedModel === m.id
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold ring-1 ring-cyan-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span className="block font-semibold text-white">{m.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal line-clamp-2 mt-0.5">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Thinking Mode Budget */}
          {settings.selectedModel === 'gemini-3.7-flash' && (
            <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-purple-400" />
                  Thinking / Deep Reasoning Budget
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  {settings.thinkingBudget === 0 ? 'Off (0 tokens)' : `${settings.thinkingBudget} tokens`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Enables Chain-of-Thought reasoning. Higher budgets allow deeper problem analysis before speaking.
              </p>
              <input
                type="range"
                min="0"
                max="4096"
                step="512"
                value={settings.thinkingBudget}
                onChange={(e) => onUpdateSettings({ thinkingBudget: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          )}

          {/* 3. Assistant Personality */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              Assistant Personality & Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['friendly', 'professional', 'concise', 'tutor'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onUpdateSettings({ personality: mode })}
                  className={`p-2.5 rounded-xl border text-left transition-all capitalize ${
                    settings.personality === mode
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold ring-1 ring-cyan-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span className="block font-semibold">{mode}</span>
                  <span className="text-[10px] text-slate-500 font-normal block truncate">
                    {mode === 'friendly' && 'Warm & cheerful'}
                    {mode === 'professional' && 'Formal & crisp'}
                    {mode === 'concise' && 'Minimal tokens'}
                    {mode === 'tutor' && 'Step-by-step'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Text-to-Speech Voice */}
          <div className="space-y-3">
            <label className="text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              TTS Voice Synthesis
            </label>

            <div>
              <span className="text-slate-400 block mb-1">Synthesizer Voice</span>
              <select
                value={settings.voiceName}
                onChange={(e) => onUpdateSettings({ voiceName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              >
                <option value="">Default System Natural Voice</option>
                {availableVoices.map((voice, idx) => (
                  <option key={idx} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <div className="flex justify-between mb-1 text-slate-400">
                  <span>Speech Rate:</span>
                  <span className="font-mono text-emerald-400">{settings.voiceRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={settings.voiceRate}
                  onChange={(e) => onUpdateSettings({ voiceRate: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-400">
                  <span>Speech Pitch:</span>
                  <span className="font-mono text-emerald-400">{settings.voicePitch}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={settings.voicePitch}
                  onChange={(e) => onUpdateSettings({ voicePitch: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 5. Toggles (Auto-Play & Memory & Few-Shot) */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200 block">Auto-Play Audio Response</span>
                <span className="text-slate-500 text-[11px]">
                  Automatically speak synthesized audio when response is ready
                </span>
              </div>
              <button
                onClick={() => onUpdateSettings({ autoPlayAudio: !settings.autoPlayAudio })}
                className="text-cyan-400"
              >
                {settings.autoPlayAudio ? (
                  <ToggleRight className="w-8 h-8 text-cyan-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200 block">Context & Long-Term Memory</span>
                <span className="text-slate-500 text-[11px]">
                  Allow Nova AI to save and recall personal context and notes
                </span>
              </div>
              <button
                onClick={() => onUpdateSettings({ memoryEnabled: !settings.memoryEnabled })}
                className="text-cyan-400"
              >
                {settings.memoryEnabled ? (
                  <ToggleRight className="w-8 h-8 text-cyan-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow-md shadow-cyan-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
