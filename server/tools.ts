import { db } from './db';
import { ToolExecutionRecord } from '../src/types';

export class AgentTools {
  /**
   * Calculator tool: Performs precise deterministic mathematical evaluations.
   * Prevents LLM arithmetic hallucinations.
   */
  static executeCalculator(expression: string): ToolExecutionRecord {
    const startTime = Date.now();
    try {
      // Clean and normalize expression
      let sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/plus/gi, '+')
        .replace(/minus/gi, '-')
        .replace(/multiplied by/gi, '*')
        .replace(/times/gi, '*')
        .replace(/divided by/gi, '/')
        .replace(/over/gi, '/')
        .replace(/to the power of/gi, '**')
        .replace(/\^/g, '**')
        .replace(/percent of/gi, '* 0.01 *')
        .replace(/%/g, '* 0.01')
        .replace(/[^0-9+\-*/().\s*sqrtpieEsincoatn]/g, '');

      // Handle square root
      sanitized = sanitized.replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)');
      sanitized = sanitized.replace(/sqrt\s*([0-9.]+)/g, 'Math.sqrt($1)');

      // Safe mathematical evaluation using Function sandbox
      const mathScope = {
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        sqrt: Math.sqrt,
        pow: Math.pow,
        abs: Math.abs,
        pi: Math.PI,
        PI: Math.PI,
        e: Math.E,
        E: Math.E,
        round: Math.round,
        floor: Math.floor,
        ceil: Math.ceil,
      };

      const evalFunc = new Function(...Object.keys(mathScope), `"use strict"; return (${sanitized});`);
      const result = evalFunc(...Object.values(mathScope));

      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error(`Invalid arithmetic calculation result: ${result}`);
      }

      // Format result nicely
      const formattedResult = Number.isInteger(result)
        ? result.toLocaleString('en-US')
        : Number(result.toFixed(4)).toString();

      return {
        toolName: 'calculator',
        toolInput: { expression, sanitized },
        toolOutput: {
          originalExpression: expression,
          evaluatedResult: result,
          formatted: formattedResult,
          explanation: `${expression} = ${formattedResult}`,
        },
        executionTimeMs: Date.now() - startTime,
        success: true,
      };
    } catch (err: any) {
      return {
        toolName: 'calculator',
        toolInput: { expression },
        toolOutput: null,
        executionTimeMs: Date.now() - startTime,
        success: false,
        error: err.message || 'Calculation evaluation failed',
      };
    }
  }

  /**
   * Notes Tool: CRUD operations for notes.
   */
  static executeNotes(action: 'create' | 'search' | 'list' | 'delete', params: { title?: string; body?: string; query?: string; id?: string; tags?: string[] }): ToolExecutionRecord {
    const startTime = Date.now();
    try {
      let output: any = null;

      if (action === 'create') {
        const title = params.title || 'Voice Note';
        const body = params.body || '';
        const note = db.createNote(title, body, params.tags || ['VoiceAssistant']);
        output = { action: 'created', note, message: `Note "${note.title}" created successfully.` };
      } else if (action === 'search') {
        const query = params.query || '';
        const results = db.searchNotes(query);
        output = { action: 'search_results', count: results.length, notes: results };
      } else if (action === 'delete') {
        const id = params.id || '';
        const success = db.deleteNote(id);
        output = { action: 'deleted', success, id };
      } else {
        const allNotes = db.getNotes();
        output = { action: 'listed', count: allNotes.length, notes: allNotes.slice(0, 10) };
      }

      return {
        toolName: 'notes_manager',
        toolInput: { action, ...params },
        toolOutput: output,
        executionTimeMs: Date.now() - startTime,
        success: true,
      };
    } catch (err: any) {
      return {
        toolName: 'notes_manager',
        toolInput: { action, ...params },
        toolOutput: null,
        executionTimeMs: Date.now() - startTime,
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Reminder & Task Tool: Manage deadlines and reminders.
   */
  static executeReminders(action: 'create' | 'list' | 'complete' | 'delete', params: { task?: string; dueTime?: string; id?: string }): ToolExecutionRecord {
    const startTime = Date.now();
    try {
      let output: any = null;

      if (action === 'create') {
        const taskText = params.task || 'Untitled reminder';
        const dueTime = params.dueTime || new Date(Date.now() + 86400000).toISOString();
        const taskItem = db.createTask(taskText, dueTime);
        output = { action: 'created', task: taskItem, message: `Reminder set for: "${taskItem.task}"` };
      } else if (action === 'complete') {
        const id = params.id || '';
        const updated = db.updateTaskStatus(id, 'completed');
        output = { action: 'completed', task: updated };
      } else if (action === 'delete') {
        const id = params.id || '';
        const success = db.deleteTask(id);
        output = { action: 'deleted', success, id };
      } else {
        const tasks = db.getTasks();
        output = { action: 'listed', count: tasks.length, tasks };
      }

      return {
        toolName: 'reminder_scheduler',
        toolInput: { action, ...params },
        toolOutput: output,
        executionTimeMs: Date.now() - startTime,
        success: true,
      };
    } catch (err: any) {
      return {
        toolName: 'reminder_scheduler',
        toolInput: { action, ...params },
        toolOutput: null,
        executionTimeMs: Date.now() - startTime,
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Memory Tool: Store and recall personal user context.
   */
  static executeMemory(action: 'store' | 'retrieve' | 'list' | 'clear', params: { key?: string; value?: string; category?: string }): ToolExecutionRecord {
    const startTime = Date.now();
    try {
      let output: any = null;

      if (action === 'store') {
        const key = params.key || 'fact';
        const value = params.value || '';
        const memory = db.setMemory(key, value, params.category || 'general');
        output = { action: 'stored', memory, message: `Saved memory: ${key} = ${value}` };
      } else if (action === 'retrieve') {
        const key = params.key || '';
        const memory = db.getMemoryByKey(key);
        output = { action: 'retrieved', found: !!memory, memory };
      } else if (action === 'clear') {
        db.clearAllMemories();
        output = { action: 'cleared', message: 'All personal memories have been cleared.' };
      } else {
        const memories = db.getMemories();
        output = { action: 'listed', count: memories.length, memories };
      }

      return {
        toolName: 'memory_vault',
        toolInput: { action, ...params },
        toolOutput: output,
        executionTimeMs: Date.now() - startTime,
        success: true,
      };
    } catch (err: any) {
      return {
        toolName: 'memory_vault',
        toolInput: { action, ...params },
        toolOutput: null,
        executionTimeMs: Date.now() - startTime,
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * System Info Tool: Safe local system parameters.
   */
  static executeSystemInfo(): ToolExecutionRecord {
    const startTime = Date.now();
    try {
      const now = new Date();
      const output = {
        currentTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        currentDate: now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestampISO: now.toISOString(),
        systemStatus: 'Operational',
        uptimeSeconds: Math.floor(process.uptime()),
        stats: {
          activeMemories: db.getMemories().length,
          savedNotes: db.getNotes().length,
          pendingTasks: db.getTasks().filter((t) => t.status === 'pending').length,
          totalConversations: db.getConversations().length,
        },
      };

      return {
        toolName: 'system_info',
        toolInput: {},
        toolOutput: output,
        executionTimeMs: Date.now() - startTime,
        success: true,
      };
    } catch (err: any) {
      return {
        toolName: 'system_info',
        toolInput: {},
        toolOutput: null,
        executionTimeMs: Date.now() - startTime,
        success: false,
        error: err.message,
      };
    }
  }
}
