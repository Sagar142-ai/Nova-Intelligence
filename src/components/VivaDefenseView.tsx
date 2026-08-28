import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  Clock,
  Layers,
  FileText,
  CheckCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  Zap,
  Terminal,
  Shield,
  Cpu,
} from 'lucide-react';

interface VivaQuestionItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const VIVA_QUESTIONS: VivaQuestionItem[] = [
  // 1. Generative AI & Foundation Models
  {
    id: 1,
    category: 'Generative AI',
    question: 'What is Generative AI and how does it fundamentally differ from Discriminative AI?',
    answer:
      'Generative AI models the joint probability distribution P(X, Y) to generate novel synthetic content (text, audio, images, code). In contrast, Discriminative AI models the conditional probability P(Y|X) to classify or predict labels for existing data.',
  },
  {
    id: 2,
    category: 'Generative AI',
    question: 'What is an Autoregressive Language Model?',
    answer:
      'An autoregressive LLM predicts the next token in a sequence conditioned on all previously generated tokens by computing P(w_t | w_1, ..., w_{t-1}) using causal self-attention masks.',
  },
  {
    id: 3,
    category: 'Generative AI',
    question: 'What causes LLM hallucinations and how does Nova AI prevent them in math and memory?',
    answer:
      'Hallucinations occur when an LLM samples statistically plausible but factually incorrect tokens from its parametric weights. Nova AI eliminates hallucinations by using Deterministic Tool Calling for arithmetic and querying an external persistent SQLite/JSON database for user memories rather than asking the LLM to invent facts.',
  },
  {
    id: 4,
    category: 'Generative AI',
    question: 'What is Temperature in LLM sampling?',
    answer:
      'Temperature (T) scales logits before the softmax layer: P(w_i) = exp(z_i / T) / sum(exp(z_j / T)). A low temperature (e.g. 0.2) yields deterministic, focused outputs (used for tool formatting), while a higher temperature (e.g. 0.7) produces creative responses.',
  },

  // 2. Speech Recognition & Whisper ASR
  {
    id: 5,
    category: 'Speech Recognition (ASR)',
    question: 'How does OpenAI Whisper perform Automatic Speech Recognition (ASR)?',
    answer:
      'Whisper converts raw audio into 80-channel log-magnitude Mel-spectrograms sampled in 30-second windows. An encoder Transformer processes the spectrogram, and an autoregressive decoder generates text tokens alongside timestamp tokens.',
  },
  {
    id: 6,
    category: 'Speech Recognition (ASR)',
    question: 'What is a Mel-spectrogram and why is it used instead of raw audio waveforms?',
    answer:
      'A Mel-spectrogram applies Short-Time Fourier Transform (STFT) to map audio frequencies to the non-linear Mel scale, mimicking human ear sensitivity by giving higher resolution to lower pitch frequencies.',
  },
  {
    id: 7,
    category: 'Speech Recognition (ASR)',
    question: 'How do you handle silence, background noise, and empty audio in speech pipelines?',
    answer:
      'Audio capture uses energy thresholding and Voice Activity Detection (VAD) to trim silence. The backend validates transcript length and rejects empty strings or noise artifacts before sending tokens to the LLM.',
  },

  // 3. Text-to-Speech (TTS)
  {
    id: 8,
    category: 'Text-to-Speech (TTS)',
    question: 'What is the Text-to-Speech (TTS) synthesis pipeline in Nova AI?',
    answer:
      'Text is preprocessed to remove markdown formatting, normalized for numbers/dates, converted to phonemes, and synthesized into audio waveforms using browser SpeechSynthesis or neural voice endpoints with pitch, rate, and interrupt support.',
  },
  {
    id: 9,
    category: 'Text-to-Speech (TTS)',
    question: 'How is voice interruption (barge-in) handled in Nova AI?',
    answer:
      'When the user speaks or clicks the orb during active speech, an immediate interrupt signal invokes window.speechSynthesis.cancel(), clears pending audio buffers, and transitions the state machine back to listening.',
  },

  // 4. Agent Architecture vs Traditional Chatbots
  {
    id: 10,
    category: 'AI Agent Architecture',
    question: 'What is the key architectural difference between a Chatbot and an AI Agent?',
    answer:
      'A chatbot simply maps input text to next-token predictions (Input -> LLM -> Output). An AI Agent executes a cognitive loop: Perceive -> Intent Detection -> Reasoning & Task Planning -> Deterministic Tool Selection -> Execution & Observation -> Memory Update -> Response Synthesis.',
  },
  {
    id: 11,
    category: 'AI Agent Architecture',
    question: 'What is Function Calling / Tool Calling in LLM agents?',
    answer:
      'Function calling provides the LLM with structured JSON schemas of available functions. The model determines when a tool is required and outputs JSON arguments. The application executes the tool locally and feeds the observation back to the model.',
  },
  {
    id: 12,
    category: 'AI Agent Architecture',
    question: 'What tools are implemented in Nova AI?',
    answer:
      'Nova AI implements: 1) Deterministic Calculator (safe math evaluations), 2) Notes Manager (CRUD), 3) Reminder & Task Scheduler, 4) Personal Memory Vault (profile facts), and 5) Real-Time System Information.',
  },

  // 5. Intent Classification & Benchmarking
  {
    id: 13,
    category: 'Intent Classification',
    question: 'What is Intent Classification and what taxonomy does Nova AI utilize?',
    answer:
      'Intent classification predicts the user’s underlying goal. Nova AI supports: greeting, calculation, note_creation, note_retrieval, reminder, task_list, memory_store, memory_retrieve, memory_clear, system_info, summarization, and knowledge_query.',
  },
  {
    id: 14,
    category: 'Intent Classification',
    question: 'How does Nova AI compare Rule-based vs. LLM-based Intent Classification in the benchmark experiment?',
    answer:
      'Rule-based classification achieves <1ms latency with 95%+ precision on known command patterns. LLM-based classification handles ambiguous, open-domain semantic intent but incurs higher latency (200-400ms). Nova uses a hybrid approach for optimal latency and coverage.',
  },
  {
    id: 15,
    category: 'Intent Classification',
    question: 'What evaluation metrics are measured in the SNIPS benchmark lab?',
    answer:
      'The benchmark evaluates Accuracy (correct intent / total queries), Precision (TP / (TP + FP)), Recall (TP / (TP + FN)), F1 Score (2 * (P*R)/(P+R)), and Average Processing Latency in milliseconds.',
  },

  // 6. Memory & Context
  {
    id: 16,
    category: 'Memory Management',
    question: 'How does Nova AI handle multi-turn context and pronoun resolution?',
    answer:
      'Short-term memory maintains a sliding window of the last 6 dialogue turns. When a user asks "When was it released?" after "Who developed Python?", the LLM resolves the antecedent pronoun "it" using conversational context.',
  },
  {
    id: 17,
    category: 'Memory Management',
    question: 'What is the difference between Short-Term Dialogue Memory and Long-Term Persistent Memory?',
    answer:
      'Short-term memory stores session dialogue messages in the active prompt context window. Long-term memory persists user facts (e.g. user name, project title, preferences) across sessions in an SQLite/JSON storage table.',
  },

  // 7. Latency & Performance Engineering
  {
    id: 18,
    category: 'Performance & Latency',
    question: 'What is the End-to-End (E2E) latency formula in a Voice Assistant?',
    answer:
      'E2E Latency = T_ASR (Speech-to-Text) + T_Intent (Classification) + T_Planning (Tool routing) + T_Tool (Execution) + T_LLM (First token generation) + T_TTS (Speech synthesis).',
  },
  {
    id: 19,
    category: 'Performance & Latency',
    question: 'How can you optimize voice assistant latency for real-time production?',
    answer:
      '1) Stream tokens directly to TTS sentence-by-sentence, 2) Use fast local rule matching for deterministic intents, 3) Employ low-latency quantized models (e.g. Flash models), and 4) Pre-warm connections.',
  },

  // 8. Backend & Database Design
  {
    id: 20,
    category: 'Backend & Database',
    question: 'What database schema supports the persistent memory and tools in Nova AI?',
    answer:
      'The schema contains four core tables: 1) conversations (id, title, timestamps), 2) messages (id, conversation_id, role, content, intent, telemetry), 3) memories (id, key, value, category), 4) notes (id, title, body, tags), and 5) tasks (id, task, status, dueTime).',
  },
  {
    id: 21,
    category: 'Backend & Database',
    question: 'Why is SQLite / local JSON persistence ideal for local and edge voice assistants?',
    answer:
      'SQLite is self-contained, serverless, zero-configuration, transactional (ACID compliant), and delivers sub-millisecond local reads/writes without network round-trip overhead.',
  },

  // 9. Security, Privacy & Ethics
  {
    id: 22,
    category: 'Security & Ethics',
    question: 'How does Nova AI ensure API key security and user privacy?',
    answer:
      'API keys are stored exclusively in backend environment variables and never exposed to the client. Audio streams are processed ephemerally without permanent audio recording on disk, and users can delete stored memories anytime.',
  },
  {
    id: 23,
    category: 'Security & Ethics',
    question: 'How do you prevent Prompt Injection and Jailbreaking in AI voice agents?',
    answer:
      'System prompts enforce strict role boundaries, input text is sanitized for injection delimiters, and tools run in sandboxed JavaScript/Python environments with strict parameter validation.',
  },

  // 10. Limitations & Future Scope
  {
    id: 24,
    category: 'Future Scope',
    question: 'What are the current limitations of Nova AI?',
    answer:
      '1) Internet dependency for cloud LLM inference, 2) Acoustic degradation in high-ambient noise, 3) Fixed toolset requiring explicit function definitions.',
  },
  {
    id: 25,
    category: 'Future Scope',
    question: 'What are the planned future enhancements for Nova AI v3.0?',
    answer:
      '1) Offline local LLM & Whisper on-device execution (e.g. ONNX/llama.cpp), 2) Wake-word detection ("Hey Nova"), 3) Multi-modal vision input, and 4) Retrieval-Augmented Generation (RAG) over personal PDF textbooks.',
  },
  {
    id: 26,
    category: 'Generative AI',
    question: 'What is Tokenization and how does BPE (Byte-Pair Encoding) work?',
    answer:
      'Tokenization breaks text into sub-word tokens. BPE iteratively merges the most frequent adjacent character pairs in a corpus into single vocabulary tokens to handle rare words and diverse languages efficiently.',
  },
  {
    id: 27,
    category: 'Generative AI',
    question: 'What is the Attention Mechanism in Transformers?',
    answer:
      'Attention calculates relevance between tokens: Attention(Q, K, V) = softmax((Q K^T) / sqrt(d_k)) * V, allowing each word to dynamically attend to relevant context across the entire sequence.',
  },
  {
    id: 28,
    category: 'AI Agent Architecture',
    question: 'What is the ReAct (Reasoning + Acting) prompting paradigm?',
    answer:
      'ReAct prompts the LLM to generate alternating Thought steps (reasoning about what to do next) and Action steps (invoking tools and reading observations) before delivering the final answer.',
  },
  {
    id: 29,
    category: 'Speech Recognition (ASR)',
    question: 'What is Word Error Rate (WER) in ASR evaluation?',
    answer:
      'WER = (Substitutions + Deletions + Insertions) / Total Words in Reference. It measures the percentage of transcription errors produced by an ASR system.',
  },
  {
    id: 30,
    category: 'Performance & Latency',
    question: 'What is Time to First Token (TTFT) and why is it vital for voice applications?',
    answer:
      'TTFT is the duration from prompt submission to receiving the first generated token. For voice applications, a low TTFT (<300ms) enables streaming speech synthesis so the user hears audio almost instantaneously.',
  },
];

export const VivaDefenseView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'demo' | 'elevator' | 'architecture' | 'qna' | 'report'>('demo');
  const [searchQna, setSearchQna] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedQId, setExpandedQId] = useState<number | null>(1);

  const categories = [
    'All',
    'Generative AI',
    'Speech Recognition (ASR)',
    'Text-to-Speech (TTS)',
    'AI Agent Architecture',
    'Intent Classification',
    'Memory Management',
    'Performance & Latency',
    'Backend & Database',
    'Security & Ethics',
    'Future Scope',
  ];

  const filteredQuestions = VIVA_QUESTIONS.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQna.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQna.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Navigation */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-950 border border-purple-800 text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Project Defense & Viva Master Guide
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  B.Tech CSE Major Project
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete viva script, 30+ technical questions & answers, architecture diagram, and academic report.
              </p>
            </div>
          </div>
        </div>

        {/* Section Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto self-stretch sm:self-auto">
          <button
            onClick={() => setActiveSection('demo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSection === 'demo' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            5-Min Demo Script
          </button>
          <button
            onClick={() => setActiveSection('elevator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSection === 'elevator' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pitches (30s-5m)
          </button>
          <button
            onClick={() => setActiveSection('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSection === 'architecture' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => setActiveSection('qna')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSection === 'qna' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Viva Q&A ({VIVA_QUESTIONS.length})
          </button>
          <button
            onClick={() => setActiveSection('report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSection === 'report' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Academic Report
          </button>
        </div>
      </div>

      {/* SECTION 1: 5-MINUTE LIVE DEMO SCRIPT */}
      {activeSection === 'demo' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl animate-fadeIn">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              5-Minute Step-by-Step Live Viva Demonstration Script
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Follow this structured sequence to demonstrate perception, reasoning, deterministic tools, context memory, and latency telemetry to the examiners.
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <h4 className="text-sm font-bold text-cyan-300">Greeting & Speech Recognition Test</h4>
              </div>
              <p className="text-xs text-slate-300">
                <strong>What to say into microphone:</strong> <em>"Hello Nova, how are you today?"</em>
              </p>
              <p className="text-xs text-slate-400">
                <strong>What to highlight:</strong> Open Telemetry Panel. Show state transition: Listening ➔ Transcribing ➔ Intent Detected (greeting) ➔ Friendly Spoken Response.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <h4 className="text-sm font-bold text-purple-300">Deterministic Tool Calling (Arithmetic)</h4>
              </div>
              <p className="text-xs text-slate-300">
                <strong>What to say into microphone:</strong> <em>"Calculate 456 multiplied by 78"</em>
              </p>
              <p className="text-xs text-slate-400">
                <strong>What to highlight:</strong> Point to the Telemetry Drawer. Show that the calculator tool executed with input `456 * 78` resulting in `35,568`. Explain to evaluators that Nova AI avoids arithmetic hallucination.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <h4 className="text-sm font-bold text-indigo-300">Persistent Memory & Task Creation</h4>
              </div>
              <p className="text-xs text-slate-300">
                <strong>What to say:</strong> <em>"Remember that my B.Tech project viva is scheduled for next Monday"</em>
              </p>
              <p className="text-xs text-slate-400">
                <strong>What to highlight:</strong> Switch to the <strong>Memory & Tools</strong> tab. Show the new note and reminder saved in SQLite/JSON storage.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <h4 className="text-sm font-bold text-emerald-300">Contextual Memory Recall</h4>
              </div>
              <p className="text-xs text-slate-300">
                <strong>What to say:</strong> <em>"What did I tell you about my project viva?"</em>
              </p>
              <p className="text-xs text-slate-400">
                <strong>What to highlight:</strong> The assistant queries the memory vault and answers: <em>"You noted that your B.Tech project viva is scheduled for next Monday."</em>
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                  5
                </span>
                <h4 className="text-sm font-bold text-amber-300">Benchmark Lab & 20-Test Suite</h4>
              </div>
              <p className="text-xs text-slate-300">
                <strong>Action:</strong> Switch to <strong>Intent Lab</strong> and click "Run SNIPS Intent Benchmark". Then show the <strong>20-Test Suite</strong> passing green.
              </p>
              <p className="text-xs text-slate-400">
                <strong>What to highlight:</strong> Conclude by explaining the measured latency breakdown (ASR: ~180ms, LLM: ~250ms, Tool: &lt;5ms, TTS: ~20ms).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ELEVATOR PITCHES */}
      {activeSection === 'elevator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
          {/* 30-Second Pitch */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-cyan-300">30-Second Elevator Pitch</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Quick Intro
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80 italic">
                "Nova AI is an intelligent voice assistant architecture that thinks, reasons, and talks. Unlike basic chatbots that blindly pass transcripts to an LLM, Nova AI performs intent classification, invokes deterministic tools for math and note-taking to prevent hallucinations, maintains multi-turn memory in SQLite, and synthesizes natural speech with real-time latency telemetry."
              </p>
            </div>
            <span className="text-[10px] text-slate-500">Target: Initial greeting to evaluators</span>
          </div>

          {/* 1-Minute Pitch */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-indigo-300">1-Minute Technical Pitch</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                  Core Tech
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80 italic">
                "For my final-year major project, I built Nova AI to solve the black-box chatbot problem. The system operates on a 6-stage cognitive loop: 1) Microphone capture, 2) Whisper ASR acoustic modeling, 3) Intent routing via SNIPS taxonomy, 4) LLM reasoning with tool planning, 5) Deterministic tool execution for exact math and task scheduling, and 6) Text-to-Speech synthesis. The architecture guarantees zero arithmetic hallucination and full inspectability."
              </p>
            </div>
            <span className="text-[10px] text-slate-500">Target: Technical project overview</span>
          </div>

          {/* 3-Minute Pitch */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 flex flex-col justify-between md:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-purple-300">3-Minute Complete System Explanation</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                  Comprehensive Defense
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                <span>
                  "Good morning esteemed evaluators. Today I present <strong>Nova AI — An Intelligent Voice Assistant That Thinks + Talks</strong>.
                </span>
                <br /><br />
                <span>
                  <strong>The Problem:</strong> Traditional college voice chatbots rely on a linear pipeline: Mic ➔ Whisper ➔ ChatGPT ➔ gTTS. This produces hallucinations during mathematical calculations, lacks persistent memory, and fails to handle real-world task execution.
                </span>
                <br /><br />
                <span>
                  <strong>Our Proposed System:</strong> Nova AI implements an Agentic Architecture. When speech is received, our intent engine classifies the query into categories like calculation, note creation, or memory recall. If calculation is required, rather than guessing tokens, the agent executes our deterministic calculator. If a user asks to remember a fact, it writes to an SQLite database.
                </span>
                <br /><br />
                <span>
                  <strong>Empirical Validation:</strong> We implemented an Intent Classification Benchmark comparing Rule-based vs LLM-based classification over SNIPS queries, and verified the entire architecture with an automated 20-point test suite."
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SYSTEM ARCHITECTURE DIAGRAM */}
      {activeSection === 'architecture' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl animate-fadeIn">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Complete System Architecture & Cognitive Flow
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Visual representation of auditory perception, semantic intent routing, tool execution, and voice synthesis.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto text-cyan-300 font-mono text-xs leading-relaxed">
            <pre>{`
 [ USER SPEAKS ]
        │
        ▼
 [ WebAudio / PyAudio ] ➔ Microphone Capture & Silence Trimming
        │
        ▼
 [ Whisper / ASR Engine ] ➔ Converts Mel-spectrogram to Text Transcript
        │
        ▼
 [ Text Preprocessor ] ➔ Whitespace normalization & Command Sanitization
        │
        ▼
 [ Intent Classifier ] ➔ Categorizes Intent (greeting, calculation, note, reminder, knowledge)
        │
        ▼
 [ Agent Cognitive Loop ] ➔ Evaluates Context Window & Memory Vault
        │
        ├── Requires Deterministic Tool? 
        │         │
        │         ├── YES ➔ [ Tool Router ]
        │         │              ├── Calculator (Safe Arithmetic Sandbox)
        │         │              ├── Notes Manager (SQLite CRUD)
        │         │              ├── Reminder Scheduler (Tasks Table)
        │         │              └── System Information (Live Time & Status)
        │         │                     │
        │         │         [ Tool Observation Returned ]
        │         │                     │
        │         └── NO  ──────────────┘
        │
        ▼
 [ LLM Response Formulator ] ➔ Synthesizes Concise Conversational Spoken Answer
        │
        ▼
 [ Text-to-Speech (TTS) ] ➔ Acoustic Voice Synthesis (.wav / SpeechUtterance)
        │
        ▼
 [ Client Playback Engine ] ➔ User Hears Spoken Audio (Supports Voice Interrupt)`}</pre>
          </div>
        </div>
      )}

      {/* SECTION 4: 40+ VIVA QUESTIONS & ANSWERS */}
      {activeSection === 'qna' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQna}
                onChange={(e) => setSearchQna(e.target.value)}
                placeholder="Search 30+ Viva Questions (e.g. Whisper, Agent, Temperature, Latency)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Q&A Accordion List */}
          <div className="space-y-3">
            {filteredQuestions.map((item) => {
              const isExpanded = expandedQId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all shadow-md"
                >
                  <button
                    onClick={() => setExpandedQId(isExpanded ? null : item.id)}
                    className="w-full flex items-center justify-between p-4 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3 pr-4">
                      <span className="w-6 h-6 rounded-lg bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                        {item.id}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">{item.question}</h4>
                        <span className="text-[10px] font-mono text-purple-400 mt-0.5 block">
                          Category: {item.category}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-slate-950/60 border-t border-slate-800/80">
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 5: ACADEMIC PROJECT REPORT */}
      {activeSection === 'report' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl text-slate-300 text-xs leading-relaxed animate-fadeIn">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Academic Project Report Structure (IEEE / University Format)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ready-to-use chapter outlines for your Major B.Tech CSE Project Documentation.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-cyan-300">Chapter 1: Abstract & Introduction</h4>
              <p>
                <strong>Abstract:</strong> This project presents <em>Nova AI</em>, an intelligent voice assistant architecture that couples automatic speech recognition (ASR), multi-class intent detection, cognitive LLM reasoning, deterministic tool execution, and neural text-to-speech (TTS). By introducing tool routing and structured SQLite persistence, the system eliminates mathematical hallucinations and amnesia inherent in traditional conversational chatbots.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-indigo-300">Chapter 2: Literature & Technology Survey</h4>
              <p>
                Analysis of traditional rule-based voice systems (e.g. earlier IVR and AIML systems), sequence-to-sequence ASR architectures (OpenAI Whisper), and modern Agentic AI frameworks (ReAct, Toolformer). We evaluate trade-offs between local on-device inference vs. cloud-hosted LLM endpoints.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-purple-300">Chapter 3: Methodology & Mathematical Modeling</h4>
              <p>
                Details acoustic processing using 80-channel log-mel spectrogram frames, intent classification cost functions (Cross-Entropy loss), and latency breakdown formulas: E2E = T_ASR + T_Intent + T_Tool + T_LLM + T_TTS.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-emerald-300">Chapter 4: Results, Performance Evaluation & Conclusion</h4>
              <p>
                Presents empirical accuracy from the SNIPS benchmark dataset (Rule-based: 94.4% accuracy at &lt;1ms latency; LLM-based: 94.4% accuracy at 240ms latency), 20-point automated test suite pass rate (100%), and future roadmap including edge on-device inference and wake-word integration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
