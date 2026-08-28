import React from 'react';
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  Volume2,
  Calculator,
  StickyNote,
  Bell,
  Code,
  Brain,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { AssistantState } from '../types';

interface MicrophoneOrbProps {
  state: AssistantState;
  onToggleListening: () => void;
  onStopSpeaking: () => void;
  interimTranscript: string;
  lastAssistantText: string;
  onSelectPrompt: (prompt: string) => void;
  activeTool?: string;
}

export const MicrophoneOrb: React.FC<MicrophoneOrbProps> = ({
  state,
  onToggleListening,
  onStopSpeaking,
  interimTranscript,
  lastAssistantText,
  onSelectPrompt,
  activeTool,
}) => {
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking' || state === 'executing_tool' || state === 'transcribing';

  const quickPrompts = [
    {
      label: 'Ask Any Science / AI Question',
      icon: Brain,
      query: 'Explain how attention mechanisms in Transformers compute self-attention scores.',
    },
    {
      label: 'Write Code / Algorithm',
      icon: Code,
      query: 'Write a clean Python function for binary search with edge case handling.',
    },
    {
      label: 'Instant Calculation (Exact)',
      icon: Calculator,
      query: 'Calculate 1450 multiplied by 32 plus sqrt(1024)',
    },
    {
      label: 'Save Voice Note',
      icon: StickyNote,
      query: 'Take a note: Prepare the AI project demonstration for the technical review committee',
    },
    {
      label: 'Schedule Task Reminder',
      icon: Bell,
      query: 'Remind me to review neural network hyperparameter tuning at 4 PM',
    },
    {
      label: 'Problem Solving & Logic',
      icon: Lightbulb,
      query: 'How does gradient descent optimize weights using learning rates?',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      {/* Central Visual Orb */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer Pulsating Ring 1 */}
        <div
          className={`absolute w-56 h-56 rounded-full transition-all duration-700 pointer-events-none ${
            isListening
              ? 'bg-rose-500/20 animate-ping'
              : isSpeaking
              ? 'bg-emerald-500/20 animate-pulse'
              : isThinking
              ? 'bg-cyan-500/20 animate-pulse'
              : 'bg-indigo-500/10'
          }`}
        />

        {/* Outer Halo Ring 2 */}
        <div
          className={`absolute w-44 h-44 rounded-full blur-xl transition-all duration-500 pointer-events-none ${
            isListening
              ? 'bg-rose-600/30'
              : isSpeaking
              ? 'bg-emerald-600/30'
              : isThinking
              ? 'bg-cyan-600/30'
              : 'bg-indigo-600/20'
          }`}
        />

        {/* Secondary Decorative Orbit */}
        <div
          className={`absolute w-40 h-40 rounded-full border border-dashed transition-all duration-1000 ${
            isThinking
              ? 'border-cyan-400/60 animate-spin'
              : isListening
              ? 'border-rose-400/60 animate-pulse'
              : 'border-slate-800'
          }`}
        />

        {/* The Main Action Button Orb */}
        <button
          id="btn-main-mic-orb"
          onClick={isSpeaking ? onStopSpeaking : onToggleListening}
          className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all transform active:scale-95 focus:outline-none ring-4 ${
            isListening
              ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white ring-rose-400/50 shadow-rose-500/40'
              : isSpeaking
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white ring-emerald-400/50 shadow-emerald-500/40'
              : isThinking
              ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white ring-cyan-400/50 shadow-cyan-500/40 animate-pulse'
              : 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-cyan-300 ring-slate-800 hover:ring-cyan-500/50 hover:text-white shadow-cyan-950/50 hover:shadow-cyan-500/20'
          }`}
        >
          {isSpeaking ? (
            <>
              <Square className="w-8 h-8 fill-current mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Stop</span>
            </>
          ) : isListening ? (
            <>
              <MicOff className="w-9 h-9 mb-1 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Listening</span>
            </>
          ) : isThinking ? (
            <>
              <Sparkles className="w-9 h-9 mb-1 animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {activeTool ? 'Executing' : 'Reasoning'}
              </span>
            </>
          ) : (
            <>
              <Mic className="w-9 h-9 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Speak</span>
            </>
          )}
        </button>
      </div>

      {/* State Caption & Instructions */}
      <div className="text-center max-w-lg mb-6 min-h-[60px] flex flex-col items-center justify-center">
        {isListening ? (
          <div className="flex flex-col items-center gap-1.5 animate-fadeIn">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/60">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Listening to microphone...
            </span>
            <p className="text-sm font-medium text-slate-200 italic px-4">
              "{interimTranscript || 'Ask any question or dictate a command...'}"
            </p>
          </div>
        ) : isThinking ? (
          <div className="flex flex-col items-center gap-1.5 animate-fadeIn">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              {activeTool ? `Executing Tool: ${activeTool}` : 'Processing Question & Reasoning...'}
            </span>
            <p className="text-xs text-slate-400">Synthesizing high-precision multi-model response</p>
          </div>
        ) : isSpeaking ? (
          <div className="flex flex-col items-center gap-1.5 animate-fadeIn">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
              <Volume2 className="w-3.5 h-3.5 animate-bounce text-emerald-400" />
              Speaking response... Tap orb to interrupt
            </span>
            <p className="text-sm text-slate-300 line-clamp-2 px-4 italic">
              "{lastAssistantText}"
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-slate-300">Tap orb or select a prompt below</p>
            <p className="text-xs text-slate-500">
              Instant voice responses for any question, math, coding, or task management
            </p>
          </div>
        )}
      </div>

      {/* Suggested Quick Action Chips */}
      <div className="w-full max-w-3xl">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center flex items-center justify-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          Instant Questions & Prompts
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {quickPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                id={`chip-prompt-${idx}`}
                onClick={() => onSelectPrompt(item.query)}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group shadow-sm hover:shadow-cyan-950/30"
              >
                <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-cyan-950 text-slate-400 group-hover:text-cyan-400 border border-slate-700/50 group-hover:border-cyan-800/60 transition-colors shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-300 block truncate">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    "{item.query}"
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
