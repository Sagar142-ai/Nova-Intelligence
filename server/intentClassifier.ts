import { IntentBenchmarkSample, IntentType } from '../src/types';

export interface IntentClassificationResult {
  intent: IntentType;
  confidence: number;
  method: 'rule_based' | 'llm_classifier' | 'hybrid';
  extractedEntities: Record<string, any>;
  latencyMs: number;
}

export class IntentClassifier {
  /**
   * Rule-based intent detection engine.
   * Fast, deterministic, sub-millisecond latency.
   */
  static classifyByRules(rawText: string): { intent: IntentType; confidence: number; entities: Record<string, any> } {
    const text = rawText.trim().toLowerCase();

    // 1. Math / Calculations - Strict mathematical expression detection
    // e.g. "25 + 40", "calculate 15 * 8", "what is 120 / 4", "sqrt 144", "25% of 800"
    const strictMathRegex = /^(\s*[-+]?\d*\.?\d+\s*[\+\-\*\/\^%×÷]\s*[-+]?\d*\.?\d+(\s*[\+\-\*\/\^%×÷]\s*[-+]?\d*\.?\d+)*\s*)$/;
    const explicitCalcRegex = /^(calculate|compute|evaluate)\s+([0-9\s\+\-\*\/\^\(\)\.×÷%]+)$/i;
    const mathQuestionRegex = /^(what is|how much is)\s+([0-9\s\+\-\*\/\^\(\)\.×÷]+(\s*(plus|minus|times|multiplied by|divided by)\s*[0-9\s\+\-\*\/\^\(\)\.]+)+)\s*\??$/i;
    const percentageRegex = /^(what is|calculate|how much is)\s+(\d+(\.\d+)?)\s*%\s*(of|\*)\s*(\d+(\.\d+)?)\s*\??$/i;

    if (strictMathRegex.test(text)) {
      return { intent: 'calculation', confidence: 0.98, entities: { expression: text } };
    }
    if (explicitCalcRegex.test(text)) {
      const match = text.match(explicitCalcRegex);
      return { intent: 'calculation', confidence: 0.96, entities: { expression: match ? match[2] : text } };
    }
    if (mathQuestionRegex.test(text)) {
      const match = text.match(mathQuestionRegex);
      return { intent: 'calculation', confidence: 0.95, entities: { expression: match ? match[2] : text } };
    }
    if (percentageRegex.test(text)) {
      return { intent: 'calculation', confidence: 0.95, entities: { expression: text } };
    }

    // 2. Reminders / Alarms / Tasks
    if (/^(remind me to|set a reminder to|create a reminder for|add reminder)\s+/i.test(text)) {
      const task = text.replace(/^(remind me to|set a reminder to|create a reminder for|add reminder)\s*/i, '');
      return { intent: 'reminder', confidence: 0.92, entities: { task } };
    }
    if (/^(what are my tasks|show my tasks|list tasks|show reminders|my reminders|list reminders|pending tasks)$/i.test(text)) {
      return { intent: 'task_list', confidence: 0.95, entities: {} };
    }

    // 3. Notes Creation / Retrieval
    if (/^(take a note|create note|write note|save note|note down|add a note)\s*:?\s+/i.test(text)) {
      const noteBody = text.replace(/^(take a note that|take a note|create note|write note|save note|note down|add a note)\s*:?\s*/i, '');
      return { intent: 'note_creation', confidence: 0.93, entities: { body: noteBody } };
    }
    if (/^(show my notes|search notes|find notes|what notes do i have|list notes|my notes|get notes)$/i.test(text)) {
      return { intent: 'note_retrieval', confidence: 0.92, entities: { query: '' } };
    }

    // 4. Memory Storage / Retrieval
    if (/^(remember that|save to memory)\s+/i.test(text)) {
      const val = text.replace(/^(remember that|save to memory)\s*/i, '');
      return { intent: 'memory_store', confidence: 0.94, entities: { key: 'user_fact', value: val } };
    }
    if (/^my name is\s+([a-zA-Z\s]+)$/i.test(text)) {
      const match = text.match(/^my name is\s+([a-zA-Z\s]+)$/i);
      return { intent: 'memory_store', confidence: 0.98, entities: { key: 'user_name', value: match ? match[1].trim() : '' } };
    }
    if (/^(what is my name|who am i|what do you remember about me|tell me about myself)$/i.test(text)) {
      return { intent: 'memory_retrieve', confidence: 0.91, entities: {} };
    }
    if (/^(clear memory|forget everything|delete all memories|reset memory)$/i.test(text)) {
      return { intent: 'memory_clear', confidence: 0.96, entities: {} };
    }

    // 5. System Info (Date, Time, Day, Status)
    if (/^(what time is it|what is the time|current time|what day is today|what date is today|system status|what is today's date)\??$/i.test(text)) {
      return { intent: 'system_info', confidence: 0.98, entities: {} };
    }

    // 6. Greetings
    if (/^(hello|hi|hey|good morning|good afternoon|good evening|greetings|nova|hey nova|hello nova)[\.!]?$/i.test(text)) {
      return { intent: 'greeting', confidence: 0.98, entities: {} };
    }

    // 7. Summarization
    if (/^(summarize|give a summary of|briefly summarize)\s+/i.test(text)) {
      const target = text.replace(/^(summarize|give a summary of|briefly summarize)\s*/i, '');
      return { intent: 'summarization', confidence: 0.92, entities: { target } };
    }

    // 8. Help & Capability questions
    if (/^(help|what can you do|how to use this|show help|commands|features)\??$/i.test(text)) {
      return { intent: 'help', confidence: 0.95, entities: {} };
    }

    // 9. All other questions, inquiries, coding tasks, explanations -> knowledge_query
    return {
      intent: 'knowledge_query',
      confidence: 0.90,
      entities: { query: rawText },
    };
  }
}

export const BENCHMARK_SAMPLES: IntentBenchmarkSample[] = [
  { id: 'b-1', query: 'What is 450 multiplied by 18?', expectedIntent: 'calculation', category: 'Math' },
  { id: 'b-2', query: 'Remind me to submit project review at 5 PM', expectedIntent: 'reminder', category: 'Reminders' },
  { id: 'b-3', query: 'Take a note: Neural networks require backpropagation tuning', expectedIntent: 'note_creation', category: 'Notes' },
  { id: 'b-4', query: 'Remember that my favorite programming language is TypeScript', expectedIntent: 'memory_store', category: 'Memory' },
  { id: 'b-5', query: 'What time is it right now?', expectedIntent: 'system_info', category: 'System' },
  { id: 'b-6', query: 'Hello Nova, how are you today?', expectedIntent: 'greeting', category: 'Conversation' },
  { id: 'b-7', query: 'Explain how attention mechanism works in Transformer models', expectedIntent: 'knowledge_query', category: 'Knowledge' },
  { id: 'b-8', query: 'Show all my notes from earlier', expectedIntent: 'note_retrieval', category: 'Notes' },
  { id: 'b-9', query: 'What are my pending tasks for tomorrow?', expectedIntent: 'task_list', category: 'Tasks' },
  { id: 'b-10', query: 'What is my name?', expectedIntent: 'memory_retrieve', category: 'Memory' },
];
