import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { AssistantStatusBar } from './components/AssistantStatusBar';
import { MicrophoneOrb } from './components/MicrophoneOrb';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { ChatTimeline } from './components/ChatTimeline';
import { ModelTrainingStudio } from './components/ModelTrainingStudio';
import { ModelComparisonArena } from './components/ModelComparisonArena';
import { MemoryDashboard } from './components/MemoryDashboard';
import { SettingsModal } from './components/SettingsModal';
import { audioService } from './services/audioService';
import { apiClient } from './services/apiClient';
import {
  AssistantState,
  AssistantSettings,
  AgentTelemetry,
  ChatMessage,
  ModelId,
  NoteItem,
  TaskItem,
  MemoryItem,
  SystemStatus,
} from './types';

const INITIAL_SETTINGS: AssistantSettings = {
  asrEngine: 'browser_speech',
  selectedModel: 'gemini-3.7-flash',
  voiceName: '',
  voiceRate: 1.0,
  voicePitch: 1.0,
  autoPlayAudio: true,
  personality: 'friendly',
  memoryEnabled: true,
  debugPanelOpen: false,
  temperature: 0.7,
  thinkingBudget: 0,
  enableFewShotTraining: true,
  enableKnowledgeDirectives: true,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'assistant' | 'chat' | 'training' | 'arena' | 'memory'
  >('assistant');
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [activeTool, setActiveTool] = useState<string | undefined>(undefined);
  const [settings, setSettings] = useState<AssistantSettings>(() => {
    const saved = localStorage.getItem('nova_settings_v2');
    return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('nova_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  const [telemetry, setTelemetry] = useState<AgentTelemetry | null>(null);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const activeSpeechTextRef = useRef<string>('');

  // Save state on change
  useEffect(() => {
    localStorage.setItem('nova_settings_v2', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('nova_messages', JSON.stringify(messages));
  }, [messages]);

  // Initial Load: Notes, Tasks, Memories, System Status, TTS Voices
  useEffect(() => {
    loadMemoryData();

    // Load browser TTS voices
    const voices = audioService.getAvailableVoices();
    setAvailableVoices(voices);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        setAvailableVoices(audioService.getAvailableVoices());
      };
    }
  }, []);

  const loadMemoryData = async () => {
    try {
      const [fetchedNotes, fetchedTasks, fetchedMemories, fetchedStatus] = await Promise.all([
        apiClient.getNotes(),
        apiClient.getTasks(),
        apiClient.getMemories(),
        apiClient.getHealth(),
      ]);
      setNotes(fetchedNotes);
      setTasks(fetchedTasks);
      setMemories(fetchedMemories);
      setSystemStatus(fetchedStatus);
    } catch (err) {
      console.error('Failed to load storage vault data:', err);
    }
  };

  // Handle Query Execution Pipeline (Multimodal Text, Audio, and Image Inputs)
  const processQuery = async (
    queryText: string,
    asrDurationMs = 0,
    imageBase64?: string,
    imageMimeType?: string
  ) => {
    if (!queryText.trim() && !imageBase64) return;

    const imageUrl = imageBase64
      ? `data:${imageMimeType || 'image/png'};base64,${imageBase64}`
      : undefined;

    // 1. Add user message
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      conversationId: 'default_conv',
      role: 'user',
      content: queryText || (imageBase64 ? '[Uploaded Image]' : ''),
      timestamp: new Date().toISOString(),
      imageUrl,
    };
    setMessages((prev) => [...prev, userMsg]);

    // 2. Set State: Thinking
    setAssistantState('thinking');
    setActiveTool(undefined);

    try {
      // 3. Call Server Agent with model, training & multimodal configuration
      const response = await apiClient.processVoiceOrText({
        text: queryText,
        conversationId: 'default_conv',
        asrLatencyMs: asrDurationMs,
        model: settings.selectedModel,
        personality: settings.personality,
        memoryEnabled: settings.memoryEnabled,
        temperature: settings.temperature,
        thinkingBudget: settings.thinkingBudget,
        enableFewShotTraining: settings.enableFewShotTraining,
        enableKnowledgeDirectives: settings.enableKnowledgeDirectives,
        imageBase64,
        imageMimeType,
        imageUrl,
      });

      // 4. Update Telemetry
      const fullTelemetry = {
        ...response.telemetry,
        latency: {
          ...response.telemetry.latency,
          asrMs: asrDurationMs || response.telemetry.latency.asrMs,
          totalMs: (asrDurationMs || response.telemetry.latency.asrMs) + response.telemetry.latency.totalMs,
        },
      };

      setTelemetry(fullTelemetry);
      if (response.telemetry.toolUsed) {
        setActiveTool(response.telemetry.toolUsed);
      }

      // 5. Add assistant message
      const assistantMsg: ChatMessage = {
        id: response.message.id || 'msg_' + (Date.now() + 1),
        conversationId: 'default_conv',
        role: 'assistant',
        content: response.message.content,
        timestamp: new Date().toISOString(),
        telemetry: fullTelemetry,
        generatedImageUrl: response.message.generatedImageUrl,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      activeSpeechTextRef.current = response.message.content;

      // Refresh memory data in case a tool mutated it
      loadMemoryData();

      // 6. Speak response if enabled
      if (settings.autoPlayAudio && response.message.content) {
        setAssistantState('speaking');
        audioService.speak(response.message.content, {
          voiceName: settings.voiceName,
          rate: settings.voiceRate,
          pitch: settings.voicePitch,
          onStart: () => {
            setAssistantState('speaking');
          },
          onEnd: () => {
            setAssistantState('idle');
            setActiveTool(undefined);
          },
          onError: () => {
            setAssistantState('idle');
            setActiveTool(undefined);
          },
        });
      } else {
        setAssistantState('idle');
        setActiveTool(undefined);
      }
    } catch (err: any) {
      console.error('Agent processing failed:', err);
      const errorMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        conversationId: 'default_conv',
        role: 'assistant',
        content: `Sorry, I encountered an issue processing that: ${err.message || 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setAssistantState('idle');
      setActiveTool(undefined);
    }
  };

  // Toggle Microphone Listener
  const handleToggleListening = () => {
    if (assistantState === 'listening') {
      audioService.stopListening();
      setAssistantState('idle');
      setInterimTranscript('');
      return;
    }

    if (assistantState === 'speaking') {
      audioService.stopSpeaking();
    }

    setAssistantState('listening');
    setInterimTranscript('');

    audioService.startListening(
      (interim) => {
        setInterimTranscript(interim);
      },
      (finalTranscript, asrMs) => {
        setAssistantState('transcribing');
        setInterimTranscript(finalTranscript);
        setTimeout(() => {
          processQuery(finalTranscript, asrMs);
        }, 200);
      },
      (error) => {
        console.warn('ASR Listening note:', error);
        setAssistantState('idle');
        setInterimTranscript('');
      }
    );
  };

  const handleStopSpeaking = () => {
    audioService.stopSpeaking();
    setAssistantState('idle');
  };

  const handleReplayAudio = (text: string) => {
    audioService.stopSpeaking();
    setAssistantState('speaking');
    audioService.speak(text, {
      voiceName: settings.voiceName,
      rate: settings.voiceRate,
      pitch: settings.voicePitch,
      onStart: () => setAssistantState('speaking'),
      onEnd: () => setAssistantState('idle'),
      onError: () => setAssistantState('idle'),
    });
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('nova_messages');
  };

  // Memory & Tool Mutators
  const handleCreateNote = async (title: string, body: string, tags?: string[]) => {
    await apiClient.createNote(title, body, tags);
    loadMemoryData();
  };

  const handleDeleteNote = async (id: string) => {
    await apiClient.deleteNote(id);
    loadMemoryData();
  };

  const handleCreateTask = async (task: string, dueTime?: string) => {
    await apiClient.createTask(task, dueTime);
    loadMemoryData();
  };

  const handleToggleTask = async (id: string, status: 'pending' | 'completed') => {
    await apiClient.updateTaskStatus(id, status);
    loadMemoryData();
  };

  const handleDeleteTask = async (id: string) => {
    await apiClient.deleteTask(id);
    loadMemoryData();
  };

  const handleCreateMemory = async (key: string, value: string, category?: string) => {
    await apiClient.createMemory(key, value, category);
    loadMemoryData();
  };

  const handleDeleteMemory = async (id: string) => {
    await apiClient.deleteMemory(id);
    loadMemoryData();
  };

  const handleClearAllMemories = async () => {
    await apiClient.clearAllMemories();
    loadMemoryData();
  };

  const lastAssistantMessage = messages
    .slice()
    .reverse()
    .find((m) => m.role === 'assistant');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. Top Navigation & Applet Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        assistantState={assistantState}
        activeModel={settings.selectedModel}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleDebug={() => setIsDebugOpen(!isDebugOpen)}
        isDebugOpen={isDebugOpen}
        hasGeminiKey={true}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Status Lifecycle Indicator */}
        <AssistantStatusBar state={assistantState} activeTool={activeTool} />

        {/* TAB 1: Voice AI Hub */}
        {activeTab === 'assistant' && (
          <div className="space-y-6 animate-fadeIn">
            <MicrophoneOrb
              state={assistantState}
              onToggleListening={handleToggleListening}
              onStopSpeaking={handleStopSpeaking}
              interimTranscript={interimTranscript}
              lastAssistantText={lastAssistantMessage?.content || ''}
              onSelectPrompt={(query) => processQuery(query)}
              activeTool={activeTool}
            />
          </div>
        )}

        {/* TAB 2: Direct Q&A & Conversation Timeline */}
        {activeTab === 'chat' && (
          <div className="animate-fadeIn">
            <ChatTimeline
              messages={messages}
              onSendMessage={(text, imgBase64, imgMime) => processQuery(text, 0, imgBase64, imgMime)}
              onReplayAudio={handleReplayAudio}
              onClearChat={handleClearChat}
              onToggleMic={handleToggleListening}
              isListening={assistantState === 'listening'}
              isProcessing={assistantState === 'thinking' || assistantState === 'executing_tool'}
            />
          </div>
        )}

        {/* TAB 3: Model Training & Tuning Studio */}
        {activeTab === 'training' && (
          <div className="animate-fadeIn">
            <ModelTrainingStudio
              activeModel={settings.selectedModel}
              onSelectModel={(model: ModelId) => setSettings((prev) => ({ ...prev, selectedModel: model }))}
              thinkingBudget={settings.thinkingBudget}
              onUpdateThinkingBudget={(budget: number) => setSettings((prev) => ({ ...prev, thinkingBudget: budget }))}
              enableFewShot={settings.enableFewShotTraining}
              onToggleFewShot={(enable: boolean) => setSettings((prev) => ({ ...prev, enableFewShotTraining: enable }))}
              enableDirectives={settings.enableKnowledgeDirectives}
              onToggleDirectives={(enable: boolean) => setSettings((prev) => ({ ...prev, enableKnowledgeDirectives: enable }))}
            />
          </div>
        )}

        {/* TAB 4: Multi-Model Arena & Comparator */}
        {activeTab === 'arena' && (
          <div className="animate-fadeIn">
            <ModelComparisonArena />
          </div>
        )}

        {/* TAB 5: Memory & Deterministic Tools */}
        {activeTab === 'memory' && (
          <div className="animate-fadeIn">
            <MemoryDashboard
              notes={notes}
              tasks={tasks}
              memories={memories}
              systemStatus={systemStatus}
              onCreateNote={handleCreateNote}
              onDeleteNote={handleDeleteNote}
              onCreateTask={handleCreateTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onCreateMemory={handleCreateMemory}
              onDeleteMemory={handleDeleteMemory}
              onClearAllMemories={handleClearAllMemories}
            />
          </div>
        )}
      </main>

      {/* 3. Live Telemetry & Inspector Drawer */}
      <TelemetryDrawer
        telemetry={telemetry}
        isOpen={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
      />

      {/* 4. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
        availableVoices={availableVoices}
      />
    </div>
  );
}
