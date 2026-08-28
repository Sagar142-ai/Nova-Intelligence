import React from 'react';
import {
  Mic,
  Database,
  Terminal,
  Layers,
  Settings,
  Sparkles,
  Zap,
  Brain,
  Cpu,
} from 'lucide-react';
import { AssistantState, ModelId } from '../types';

interface HeaderProps {
  activeTab: 'assistant' | 'chat' | 'training' | 'arena' | 'memory';
  setActiveTab: (tab: 'assistant' | 'chat' | 'training' | 'arena' | 'memory') => void;
  assistantState: AssistantState;
  activeModel: ModelId;
  onOpenSettings: () => void;
  onToggleDebug: () => void;
  isDebugOpen: boolean;
  hasGeminiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  assistantState,
  activeModel,
  onOpenSettings,
  onToggleDebug,
  isDebugOpen,
  hasGeminiKey,
}) => {
  const getStatusColor = () => {
    switch (assistantState) {
      case 'listening':
        return 'bg-rose-500 animate-pulse text-rose-200 border-rose-500/40';
      case 'transcribing':
        return 'bg-amber-500 animate-pulse text-amber-200 border-amber-500/40';
      case 'thinking':
        return 'bg-cyan-500 animate-pulse text-cyan-200 border-cyan-500/40';
      case 'executing_tool':
        return 'bg-purple-500 animate-pulse text-purple-200 border-purple-500/40';
      case 'speaking':
        return 'bg-emerald-500 animate-pulse text-emerald-200 border-emerald-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const getStatusLabel = () => {
    switch (assistantState) {
      case 'listening':
        return 'Listening...';
      case 'transcribing':
        return 'Transcribing...';
      case 'thinking':
        return 'Thinking & Reasoning...';
      case 'executing_tool':
        return 'Executing Tool...';
      case 'speaking':
        return 'Speaking Response...';
      default:
        return 'Ready';
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Assistant Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Nova AI
                  <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono">
                    {activeModel}
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Intelligent Multi-Model Voice & Training Engine
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              id="tab-assistant"
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'assistant'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              Voice Hub
            </button>

            <button
              id="tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Q&A & Chat
            </button>

            <button
              id="tab-training"
              onClick={() => setActiveTab('training')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'training'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              Model Training
            </button>

            <button
              id="tab-arena"
              onClick={() => setActiveTab('arena')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'arena'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Multi-Model Arena
            </button>

            <button
              id="tab-memory"
              onClick={() => setActiveTab('memory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'memory'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Memory Vault
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Live State Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{getStatusLabel()}</span>
            </div>

            {/* Developer / Telemetry Inspector Toggle */}
            <button
              id="btn-toggle-telemetry"
              onClick={onToggleDebug}
              title="Toggle Live Telemetry & Inspector Panel"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isDebugOpen
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Telemetry</span>
            </button>

            {/* Settings Button */}
            <button
              id="btn-open-settings"
              onClick={onOpenSettings}
              title="Assistant Settings & Model Hyperparameters"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 scrollbar-none border-t border-slate-900">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'assistant' ? 'bg-cyan-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Voice Hub
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'chat' ? 'bg-cyan-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Q&A
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'training' ? 'bg-cyan-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Training
          </button>
          <button
            onClick={() => setActiveTab('arena')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'arena' ? 'bg-cyan-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Arena
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'memory' ? 'bg-cyan-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Memory
          </button>
        </div>
      </div>
    </header>
  );
};
