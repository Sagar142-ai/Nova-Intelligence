import {
  AssistantSettings,
  BenchmarkMetrics,
  ChatMessage,
  Conversation,
  KnowledgeDirective,
  MemoryItem,
  ModelComparisonResult,
  ModelId,
  NoteItem,
  SystemStatus,
  TaskItem,
  TestCase,
  TestResult,
  TrainingExample,
} from '../types';

export const apiClient = {
  // System Health
  async getHealth(): Promise<SystemStatus> {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Failed to fetch system status');
    return res.json();
  },

  // Voice & Agent Process (Multimodal Text + Image + Audio)
  async processVoiceOrText(payload: {
    text?: string;
    audioBase64?: string;
    conversationId?: string;
    asrLatencyMs?: number;
    model?: ModelId;
    personality?: string;
    memoryEnabled?: boolean;
    temperature?: number;
    thinkingBudget?: number;
    enableFewShotTraining?: boolean;
    enableKnowledgeDirectives?: boolean;
    imageBase64?: string;
    imageMimeType?: string;
    imageUrl?: string;
  }): Promise<{ success: boolean; message: ChatMessage; conversationId: string; telemetry: any }> {
    const res = await fetch('/api/voice/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Voice processing failed' }));
      throw new Error(err.error || 'Server error during voice processing');
    }
    return res.json();
  },

  // Direct AI Visual Artwork / Diagram Generation
  async generateImage(prompt: string, aspectRatio?: '1:1' | '16:9' | '9:16'): Promise<{ imageUrl: string; text?: string; success: boolean }> {
    const res = await fetch('/api/image/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Image generation failed' }));
      throw new Error(err.error || 'Server error during image generation');
    }
    return res.json();
  },

  // Multi-Model Parallel Comparison
  async compareModels(
    prompt: string,
    models?: ModelId[]
  ): Promise<{ success: boolean; prompt: string; results: ModelComparisonResult[] }> {
    const res = await fetch('/api/models/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, models }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Comparison failed' }));
      throw new Error(err.error || 'Server error during model comparison');
    }
    return res.json();
  },

  // Training Dataset (Few-Shot Exemplars)
  async getTrainingExamples(): Promise<TrainingExample[]> {
    const res = await fetch('/api/training');
    if (!res.ok) throw new Error('Failed to fetch training dataset');
    return res.json();
  },

  async createTrainingExample(input: string, output: string, category?: string): Promise<TrainingExample> {
    const res = await fetch('/api/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, output, category }),
    });
    if (!res.ok) throw new Error('Failed to save training pair');
    return res.json();
  },

  async toggleTrainingExample(id: string, active: boolean): Promise<boolean> {
    const res = await fetch(`/api/training/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    return res.ok;
  },

  async deleteTrainingExample(id: string): Promise<boolean> {
    const res = await fetch(`/api/training/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Knowledge Directives
  async getKnowledgeDirectives(): Promise<KnowledgeDirective[]> {
    const res = await fetch('/api/knowledge');
    if (!res.ok) throw new Error('Failed to fetch knowledge directives');
    return res.json();
  },

  async createKnowledgeDirective(title: string, content: string): Promise<KnowledgeDirective> {
    const res = await fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    if (!res.ok) throw new Error('Failed to create directive');
    return res.json();
  },

  async toggleKnowledgeDirective(id: string, active: boolean): Promise<boolean> {
    const res = await fetch(`/api/knowledge/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    return res.ok;
  },

  async deleteKnowledgeDirective(id: string): Promise<boolean> {
    const res = await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    const res = await fetch('/api/conversations');
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  },

  async getConversation(id: string): Promise<Conversation> {
    const res = await fetch(`/api/conversations/${id}`);
    if (!res.ok) throw new Error('Failed to fetch conversation');
    return res.json();
  },

  async createConversation(title?: string): Promise<Conversation> {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    return res.json();
  },

  async clearConversation(id: string): Promise<boolean> {
    const res = await fetch(`/api/conversations/${id}/clear`, { method: 'POST' });
    return res.ok;
  },

  async deleteConversation(id: string): Promise<boolean> {
    const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Notes
  async getNotes(query?: string): Promise<NoteItem[]> {
    const url = query ? `/api/notes?q=${encodeURIComponent(query)}` : '/api/notes';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch notes');
    return res.json();
  },

  async createNote(title: string, body: string, tags?: string[]): Promise<NoteItem> {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, tags }),
    });
    if (!res.ok) throw new Error('Failed to create note');
    return res.json();
  },

  async deleteNote(id: string): Promise<boolean> {
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Tasks & Reminders
  async getTasks(): Promise<TaskItem[]> {
    const res = await fetch('/api/tasks');
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async createTask(task: string, dueTime?: string): Promise<TaskItem> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, dueTime }),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  async updateTaskStatus(id: string, status: 'pending' | 'completed'): Promise<TaskItem> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async deleteTask(id: string): Promise<boolean> {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // Memories
  async getMemories(): Promise<MemoryItem[]> {
    const res = await fetch('/api/memory');
    if (!res.ok) throw new Error('Failed to fetch memories');
    return res.json();
  },

  async createMemory(key: string, value: string, category?: string): Promise<MemoryItem> {
    const res = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, category }),
    });
    if (!res.ok) throw new Error('Failed to save memory');
    return res.json();
  },

  async deleteMemory(id: string): Promise<boolean> {
    const res = await fetch(`/api/memory/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  async clearAllMemories(): Promise<boolean> {
    const res = await fetch('/api/memory/clear', { method: 'POST' });
    return res.ok;
  },

  // Intent Benchmarking Lab
  async runIntentBenchmark(): Promise<BenchmarkMetrics> {
    const res = await fetch('/api/eval/snips', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run intent benchmark');
    return res.json();
  },

  // Automated Test Suite
  async getTestCases(): Promise<TestCase[]> {
    const res = await fetch('/api/eval/testcases');
    if (!res.ok) throw new Error('Failed to load test cases');
    return res.json();
  },

  async runSingleTest(testId: string): Promise<TestResult> {
    const res = await fetch('/api/eval/run-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testId }),
    });
    if (!res.ok) throw new Error('Failed to execute test case');
    return res.json();
  },
};
