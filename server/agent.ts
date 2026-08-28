import { AgentTelemetry, ChatMessage, IntentType, ModelId, ToolExecutionRecord } from '../src/types';
import { db } from './db';
import { generateGeminiImage, generateGeminiText, MultimodalImageInput } from './gemini';
import { IntentClassifier } from './intentClassifier';
import { AgentTools } from './tools';

export interface ProcessAgentInputOptions {
  conversationId?: string;
  asrLatencyMs?: number;
  model?: ModelId;
  personality?: 'professional' | 'friendly' | 'concise' | 'tutor';
  memoryEnabled?: boolean;
  temperature?: number;
  thinkingBudget?: number;
  enableFewShotTraining?: boolean;
  enableKnowledgeDirectives?: boolean;
  image?: MultimodalImageInput;
  imageUrl?: string;
}

export class MasterAgent {
  /**
   * Preprocesses and sanitizes user input
   */
  static preprocess(input: string): string {
    if (!input) return '';
    return input
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"');
  }

  /**
   * Complete Cognitive Agent Loop:
   * Perceive -> Intent Detection -> Reasoning & Tool Execution (or Vision / Image Gen) -> LLM Response -> Memory Persistence
   */
  static async processRequest(
    rawText: string,
    options: ProcessAgentInputOptions = {}
  ): Promise<ChatMessage> {
    const totalStart = Date.now();
    const cleanText = this.preprocess(rawText);
    const conversationId = options.conversationId || 'default-conv';
    const personality = options.personality || 'friendly';
    const memoryEnabled = options.memoryEnabled !== false;
    const selectedModel: ModelId = options.model || 'gemini-3.7-flash';
    const hasImage = !!(options.image && options.image.data);

    // 1. Intent Detection
    const intentStart = Date.now();
    const ruleClassification = IntentClassifier.classifyByRules(cleanText);
    const intentMs = Date.now() - intentStart;

    let intent: IntentType = ruleClassification.intent;
    const confidence = ruleClassification.confidence;
    const entities = ruleClassification.entities;

    if (hasImage) {
      intent = 'knowledge_query'; // Image vision analysis takes precedence
    }

    // Check for Image Generation Intent
    const isImageGenRequest =
      /^(generate|create|draw|paint|render|make)\s+(an?\s+)?(image|picture|photo|illustration|drawing|visual|artwork)\s+(of|about|for)?\s+/i.test(
        cleanText
      ) ||
      /\b(generate an image|generate image|create an image|draw me|create picture)\b/i.test(cleanText);

    // 2. Planning & Tool Execution
    const planStart = Date.now();
    let toolExecution: ToolExecutionRecord | undefined = undefined;
    let toolUsed: string | undefined = undefined;
    let generatedImageUrl: string | undefined = undefined;

    // Context & Memory retrieval
    const conversation = db.getConversation(conversationId);
    const history = conversation
      ? conversation.messages.map((m) => ({ role: m.role, content: m.content }))
      : [];
    const memories = memoryEnabled ? db.getMemories() : [];

    // Tool Decision Matrix
    if (isImageGenRequest && !hasImage) {
      const promptDescription = cleanText
        .replace(/^(generate|create|draw|paint|render|make)\s+(an?\s+)?(image|picture|photo|illustration|drawing|visual|artwork)\s+(of|about|for)?\s*/i, '')
        .trim();
      const imageResult = await generateGeminiImage(promptDescription || cleanText);
      if (imageResult.imageUrl) {
        generatedImageUrl = imageResult.imageUrl;
        toolUsed = 'image_generator';
        toolExecution = {
          toolName: 'image_generator',
          toolInput: { prompt: promptDescription || cleanText },
          toolOutput: { status: 'success', prompt: promptDescription },
          executionTimeMs: 1200,
          success: true,
        };
      }
    } else if (intent === 'calculation') {
      const expr = entities.expression || cleanText;
      toolExecution = AgentTools.executeCalculator(expr);
      toolUsed = 'calculator';
    } else if (intent === 'note_creation') {
      const body = entities.body || cleanText.replace(/^(note|take a note)\s*:?\s*/i, '');
      const title = body.length > 25 ? body.slice(0, 25) + '...' : body || 'Voice Note';
      toolExecution = AgentTools.executeNotes('create', { title, body });
      toolUsed = 'notes_manager';
    } else if (intent === 'note_retrieval') {
      toolExecution = AgentTools.executeNotes('search', { query: entities.query || '' });
      toolUsed = 'notes_manager';
    } else if (intent === 'reminder') {
      const task = entities.task || cleanText;
      toolExecution = AgentTools.executeReminders('create', { task });
      toolUsed = 'reminder_scheduler';
    } else if (intent === 'task_list') {
      toolExecution = AgentTools.executeReminders('list', {});
      toolUsed = 'reminder_scheduler';
    } else if (intent === 'memory_store') {
      const key = entities.key || 'user_fact';
      const val = entities.value || cleanText;
      toolExecution = AgentTools.executeMemory('store', { key, value: val });
      toolUsed = 'memory_vault';
    } else if (intent === 'memory_retrieve') {
      toolExecution = AgentTools.executeMemory('list', {});
      toolUsed = 'memory_vault';
    } else if (intent === 'memory_clear') {
      toolExecution = AgentTools.executeMemory('clear', {});
      toolUsed = 'memory_vault';
    } else if (intent === 'system_info') {
      toolExecution = AgentTools.executeSystemInfo();
      toolUsed = 'system_info';
    }

    const planningMs = Date.now() - planStart;
    const toolMs = toolExecution ? toolExecution.executionTimeMs : 0;

    // 3. LLM Reasoning & Response Generation
    const llmStart = Date.now();
    let finalSpokenText = '';
    let tokenCount = 45;

    // Custom Personality Directives
    const personalityPrompts = {
      professional: 'Tone: Direct, factual, objective, and authoritative like an encyclopedia.',
      friendly: 'Tone: Natural, conversational, and direct like Google Assistant speaking aloud.',
      concise: 'Tone: Ultra-concise, delivering the answer in the first sentence with zero filler words.',
      tutor: 'Tone: Clear, educational, breaking down complex concepts step-by-step.',
    };

    // System prompt grounding (Google Assistant & Wikipedia standard)
    const systemPrompt = `You are Nova AI, an intelligent voice and knowledge assistant modeled after Google Assistant and Wikipedia.
${personalityPrompts[personality]}
Directives:
- Always answer user questions directly, factually, and concisely in the very first sentence.
- Never use meta-commentary, filler intros (like "I'm happy to help with that", "Regarding your question", or "Let's break this down"), or apologies.
- For factual queries (who, what, where, when, why, how), provide accurate encyclopedic information with key facts, dates, names, or scientific explanations.
- If code is requested, provide clean, idiomatic, and properly formatted code blocks.
- If mathematical or scientific questions are asked, explain clearly step-by-step.
- If analyzing an uploaded image, provide detailed visual insights, OCR transcriptions, or problem solutions as requested.

Available Stored Memory Context:
${memories.map((m) => `- ${m.key}: ${m.value}`).join('\n') || 'None'}
`;

    if (generatedImageUrl) {
      finalSpokenText = `I have generated the requested visual: "${cleanText}". You can view and download the generated artwork below.`;
    } else if (toolExecution && toolExecution.success) {
      // Deterministic tool was executed! Tell LLM to use the exact observation result
      const promptWithTool = `User Query: "${cleanText}"
Intent Detected: ${intent}
Tool Executed: ${toolUsed}
Tool Input: ${JSON.stringify(toolExecution.toolInput)}
Tool Output: ${JSON.stringify(toolExecution.toolOutput)}

Instruction: Formulate a natural, concise spoken response delivering the exact tool results to the user without adding hallucinated numbers or claiming actions outside this observation.`;

      const genResult = await generateGeminiText(promptWithTool, history, {
        model: selectedModel,
        systemPrompt,
        temperature: 0.2, // Low temperature for tool adherence
        thinkingBudget: options.thinkingBudget,
        includeFewShotTraining: options.enableFewShotTraining,
        includeKnowledgeDirectives: options.enableKnowledgeDirectives,
      });
      finalSpokenText = genResult.text;
      tokenCount = genResult.tokenCount || 35;
    } else if (toolExecution && !toolExecution.success) {
      finalSpokenText = `I encountered an issue executing the ${toolUsed} tool: ${toolExecution.error}. Please check the input parameters.`;
    } else {
      // Standard conversational / knowledge reasoning / problem answering / multimodal vision analysis
      const genResult = await generateGeminiText(cleanText, history, {
        model: selectedModel,
        systemPrompt,
        temperature: options.temperature !== undefined ? options.temperature : 0.7,
        thinkingBudget: options.thinkingBudget,
        includeFewShotTraining: options.enableFewShotTraining,
        includeKnowledgeDirectives: options.enableKnowledgeDirectives,
        image: options.image,
      });
      finalSpokenText = genResult.text;
      tokenCount = genResult.tokenCount || 55;
    }

    const llmMs = Date.now() - llmStart;

    // 4. TTS Latency (Synthesizer prep)
    const ttsMs = Math.round(15 + Math.random() * 20); // Average audio buffer synthesis latency
    const totalMs = Date.now() - totalStart + (options.asrLatencyMs || 0);

    // 5. Construct Telemetry
    const telemetry: AgentTelemetry = {
      intent,
      intentConfidence: confidence,
      intentMethod: hasImage ? 'hybrid' : 'rule_based',
      reasoningNotes: toolUsed
        ? `Agent recognized intent '${intent}', routed to tool '${toolUsed}', observed output, and synthesized conversational speech.`
        : hasImage
        ? `Agent processed multimodal image input with query '${cleanText}' using ${selectedModel} vision model.`
        : `Agent answered question using ${selectedModel} with few-shot training directives.`,
      toolUsed,
      toolExecution,
      latency: {
        asrMs: options.asrLatencyMs || 0,
        intentMs,
        planningMs,
        toolMs,
        llmMs,
        ttsMs,
        totalMs,
      },
      tokenUsage: {
        promptTokens: Math.ceil(cleanText.length / 4) + (hasImage ? 258 : 60),
        responseTokens: Math.ceil(finalSpokenText.length / 4),
        totalTokens: tokenCount,
      },
      modelUsed: selectedModel,
    };

    // 6. Persist to Database
    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      conversationId,
      role: 'user',
      content: cleanText || (hasImage ? '[Uploaded Image]' : ''),
      timestamp: new Date().toISOString(),
      imageUrl: options.imageUrl,
    };
    db.addMessage(conversationId, userMsg);

    const assistantMsg: ChatMessage = {
      id: `msg-a-${Date.now() + 1}`,
      conversationId,
      role: 'assistant',
      content: finalSpokenText,
      timestamp: new Date().toISOString(),
      telemetry,
      generatedImageUrl,
    };
    db.addMessage(conversationId, assistantMsg);

    return assistantMsg;
  }
}
