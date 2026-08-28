export type AssistantState =
  | 'idle'
  | 'listening'
  | 'transcribing'
  | 'thinking'
  | 'executing_tool'
  | 'speaking'
  | 'error';

export type ModelId = 'gemini-3.7-flash' | 'gemini-2.5-pro' | 'gemini-2.5-flash';

export type IntentType =
  | 'greeting'
  | 'general_conversation'
  | 'knowledge_query'
  | 'calculation'
  | 'note_creation'
  | 'note_retrieval'
  | 'note_deletion'
  | 'reminder'
  | 'task_list'
  | 'task_completion'
  | 'memory_store'
  | 'memory_retrieve'
  | 'memory_clear'
  | 'system_info'
  | 'summarization'
  | 'web_search'
  | 'help'
  | 'unknown';

export interface ToolExecutionRecord {
  toolName: string;
  toolInput: Record<string, any>;
  toolOutput: any;
  executionTimeMs: number;
  success: boolean;
  error?: string;
}

export interface LatencyBreakdown {
  asrMs: number;
  intentMs: number;
  planningMs: number;
  toolMs: number;
  llmMs: number;
  ttsMs: number;
  totalMs: number;
}

export interface AgentTelemetry {
  intent: IntentType;
  intentConfidence: number;
  intentMethod: 'rule_based' | 'llm_classifier' | 'hybrid';
  reasoningNotes?: string;
  toolUsed?: string;
  toolExecution?: ToolExecutionRecord;
  latency: LatencyBreakdown;
  tokenUsage?: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  modelUsed: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  telemetry?: AgentTelemetry;
  audioBase64?: string;
  imageUrl?: string;
  generatedImageUrl?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface NoteItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  tags?: string[];
}

export interface TaskItem {
  id: string;
  task: string;
  status: 'pending' | 'completed';
  dueTime?: string;
  createdAt: string;
}

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// Training & Fine-Tuning Schema
export interface TrainingExample {
  id: string;
  input: string;
  output: string;
  category: string;
  createdAt: string;
  active: boolean;
}

export interface KnowledgeDirective {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  active: boolean;
}

export interface ModelComparisonResult {
  model: ModelId;
  modelName: string;
  response: string;
  latencyMs: number;
  tokenCount: number;
  success: boolean;
  error?: string;
}

export interface SystemStatus {
  status: string;
  serverTime: string;
  platform: string;
  nodeVersion: string;
  uptimeSeconds: number;
  activeMemoryCount: number;
  activeNotesCount: number;
  pendingTasksCount: number;
  trainingExamplesCount: number;
  knowledgeDirectivesCount: number;
  conversationCount: number;
  hasGeminiKey: boolean;
  activeModel: ModelId;
}

export interface AssistantSettings {
  asrEngine: 'whisper' | 'browser_speech' | 'vosk';
  selectedModel: ModelId;
  personality: 'professional' | 'friendly' | 'concise' | 'tutor';
  voicePitch: number;
  voiceRate: number;
  voiceName: string;
  autoPlayAudio: boolean;
  memoryEnabled: boolean;
  debugPanelOpen: boolean;
  temperature: number;
  thinkingBudget: number; // 0 = off/speed, >0 = deep reasoning
  enableFewShotTraining: boolean;
  enableKnowledgeDirectives: boolean;
}

export interface IntentBenchmarkSample {
  id: string;
  query: string;
  expectedIntent: IntentType;
  category: string;
}

export interface BenchmarkResult {
  sampleId: string;
  query: string;
  expectedIntent: IntentType;
  predictedIntentRule: IntentType;
  predictedIntentLLM: IntentType;
  ruleCorrect: boolean;
  llmCorrect: boolean;
  ruleLatencyMs: number;
  llmLatencyMs: number;
}

export interface BenchmarkMetrics {
  totalSamples: number;
  ruleAccuracy: number;
  llmAccuracy: number;
  ruleAvgLatencyMs: number;
  llmAvgLatencyMs: number;
  results: BenchmarkResult[];
}

export interface TestCase {
  id: string;
  name: string;
  category: 'Conversation' | 'Calculation' | 'Notes' | 'Reminders' | 'Memory' | 'Context' | 'System' | 'Error Handling';
  input: string;
  expectedIntent: IntentType;
  expectedTool?: string;
  description: string;
  vivaNote: string;
}

export interface TestResult {
  testId: string;
  passed: boolean;
  actualIntent: IntentType;
  actualTool?: string;
  response: string;
  latencyMs: number;
  error?: string;
}
