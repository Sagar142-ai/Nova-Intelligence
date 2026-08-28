import React from 'react';
import { Mic, AudioWaveform, Brain, Wrench, Volume2, CheckCircle2 } from 'lucide-react';
import { AssistantState } from '../types';

interface AssistantStatusBarProps {
  state: AssistantState;
  activeTool?: string;
}

export const AssistantStatusBar: React.FC<AssistantStatusBarProps> = ({ state, activeTool }) => {
  const steps = [
    {
      id: 'listening',
      name: '1. Listening',
      icon: Mic,
      active: state === 'listening',
      done: ['transcribing', 'thinking', 'executing_tool', 'speaking'].includes(state),
    },
    {
      id: 'transcribing',
      name: '2. Transcribing (ASR)',
      icon: AudioWaveform,
      active: state === 'transcribing',
      done: ['thinking', 'executing_tool', 'speaking'].includes(state),
    },
    {
      id: 'thinking',
      name: '3. Intent & Reasoning',
      icon: Brain,
      active: state === 'thinking',
      done: ['executing_tool', 'speaking'].includes(state),
    },
    {
      id: 'executing_tool',
      name: activeTool ? `4. Tool (${activeTool})` : '4. Tool Execution',
      icon: Wrench,
      active: state === 'executing_tool',
      done: state === 'speaking',
    },
    {
      id: 'speaking',
      name: '5. Speaking (TTS)',
      icon: Volume2,
      active: state === 'speaking',
      done: false,
    },
  ];

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 shadow-inner">
      <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          let colorClass = 'text-slate-500 bg-slate-950/40 border-slate-800/50';
          if (step.active) {
            colorClass =
              'text-cyan-300 bg-cyan-950/80 border-cyan-500/80 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500 animate-pulse';
          } else if (step.done) {
            colorClass = 'text-emerald-400 bg-emerald-950/30 border-emerald-500/40';
          }

          return (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-all ${colorClass}`}
              >
                {step.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${step.active ? 'animate-bounce' : ''}`} />
                )}
                <span>{step.name}</span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-3 h-0.5 rounded-full transition-colors hidden sm:block ${
                    step.done ? 'bg-emerald-500/40' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
