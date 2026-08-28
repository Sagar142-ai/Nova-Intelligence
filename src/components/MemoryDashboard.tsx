import React, { useState } from 'react';
import {
  Database,
  StickyNote,
  CheckSquare,
  Sparkles,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  Tag,
  Cpu,
  Key,
} from 'lucide-react';
import { MemoryItem, NoteItem, SystemStatus, TaskItem } from '../types';

interface MemoryDashboardProps {
  notes: NoteItem[];
  tasks: TaskItem[];
  memories: MemoryItem[];
  systemStatus: SystemStatus | null;
  onCreateNote: (title: string, body: string, tags?: string[]) => void;
  onDeleteNote: (id: string) => void;
  onCreateTask: (task: string, dueTime?: string) => void;
  onToggleTask: (id: string, status: 'pending' | 'completed') => void;
  onDeleteTask: (id: string) => void;
  onCreateMemory: (key: string, value: string, category?: string) => void;
  onDeleteMemory: (id: string) => void;
  onClearAllMemories: () => void;
}

export const MemoryDashboard: React.FC<MemoryDashboardProps> = ({
  notes,
  tasks,
  memories,
  systemStatus,
  onCreateNote,
  onDeleteNote,
  onCreateTask,
  onToggleTask,
  onDeleteTask,
  onCreateMemory,
  onDeleteMemory,
  onClearAllMemories,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'memories' | 'system'>('notes');
  const [searchQuery, setSearchQuery] = useState('');

  // New Note Modal / Form State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteBody, setNewNoteBody] = useState('');

  // New Task State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  // New Memory State
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [newMemoryKey, setNewMemoryKey] = useState('');
  const [newMemoryValue, setNewMemoryValue] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState('general');

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter((t) =>
    t.task.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMemories = memories.filter(
    (m) =>
      m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() && !newNoteBody.trim()) return;
    onCreateNote(newNoteTitle || 'Untitled Note', newNoteBody, ['ManualEntry']);
    setNewNoteTitle('');
    setNewNoteBody('');
    setShowNoteModal(false);
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onCreateTask(newTaskText.trim());
    setNewTaskText('');
    setShowTaskModal(false);
  };

  const handleCreateMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryKey.trim() || !newMemoryValue.trim()) return;
    onCreateMemory(newMemoryKey.trim(), newMemoryValue.trim(), newMemoryCategory);
    setNewMemoryKey('');
    setNewMemoryValue('');
    setShowMemoryModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Agent Storage & Persistent Memory Vault
          </h2>
          <p className="text-xs text-slate-400">
            Structured persistent data backing deterministic tools, tasks, and dialogue memory.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'notes'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            Notes ({notes.length})
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'tasks'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Tasks ({tasks.length})
          </button>

          <button
            onClick={() => setActiveTab('memories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'memories'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Memories ({memories.length})
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'system'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            System
          </button>
        </div>
      </div>

      {/* Search & Add Bar */}
      {activeTab !== 'system' && (
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'notes' && (
              <button
                id="btn-add-note"
                onClick={() => setShowNoteModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md shadow-cyan-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Note
              </button>
            )}

            {activeTab === 'tasks' && (
              <button
                id="btn-add-task"
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md shadow-cyan-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
            )}

            {activeTab === 'memories' && (
              <>
                <button
                  id="btn-add-memory"
                  onClick={() => setShowMemoryModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md shadow-cyan-500/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Memory
                </button>
                {memories.length > 0 && (
                  <button
                    onClick={onClearAllMemories}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: NOTES */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-slate-100">{note.title}</h3>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {note.body}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 mt-4 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                <div className="flex items-center gap-1 flex-wrap">
                  {note.tags?.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No notes found</p>
              <p className="text-xs mt-1">Say "Take a note that..." or click Add Note above.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TASKS & REMINDERS */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-950/60 border-slate-900 text-slate-500'
                    : 'bg-slate-900/90 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                  <button
                    onClick={() => onToggleTask(task.id, isCompleted ? 'pending' : 'completed')}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-700 hover:border-cyan-500'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm block truncate ${
                        isCompleted ? 'line-through text-slate-500' : 'font-medium'
                      }`}
                    >
                      {task.task}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      Due: {task.dueTime ? new Date(task.dueTime).toLocaleString() : 'Soon'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No tasks found</p>
              <p className="text-xs mt-1">Say "Remind me to..." or click Add Task above.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERSONAL MEMORIES */}
      {activeTab === 'memories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-3 shadow-lg"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                    {mem.key}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                    {mem.category}
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1 font-medium">{mem.value}</p>
                <span className="text-[10px] text-slate-500 block">
                  Last updated: {new Date(mem.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <button
                onClick={() => onDeleteMemory(mem.id)}
                className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {filteredMemories.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No user profile facts stored yet</p>
              <p className="text-xs mt-1">Say "Remember that my name is..." to teach Nova personal context.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SYSTEM INFO */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-500 uppercase block">Assistant Runtime</span>
            <span className="text-lg font-bold text-white mt-1 block">Nova AI v2.0</span>
            <span className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Operational
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-500 uppercase block">LLM Engine</span>
            <span className="text-lg font-bold text-indigo-300 mt-1 block">Gemini 3.7 Flash</span>
            <span className="text-xs text-slate-400 mt-2 block">Cognitive Reasoner</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-500 uppercase block">Server Uptime</span>
            <span className="text-lg font-bold text-cyan-300 mt-1 block">
              {systemStatus?.uptimeSeconds ? `${systemStatus.uptimeSeconds}s` : 'Active'}
            </span>
            <span className="text-xs text-slate-400 mt-2 block">Node {process.version || 'v22'}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-500 uppercase block">Persistent Store</span>
            <span className="text-lg font-bold text-amber-300 mt-1 block">SQLite / JSON Vault</span>
            <span className="text-xs text-slate-400 mt-2 block">
              {notes.length} notes, {tasks.length} tasks
            </span>
          </div>
        </div>
      )}

      {/* CREATE NOTE MODAL */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNoteSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white">Create New Note</h3>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Note Title (e.g., Project Checklist)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <textarea
              value={newNoteBody}
              onChange={(e) => setNewNoteBody(e.target.value)}
              placeholder="Note content..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
              >
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTaskSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white">Create Task / Reminder</h3>
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Task description..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
              >
                Set Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE MEMORY MODAL */}
      {showMemoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateMemorySubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white">Add Long-term Memory Fact</h3>
            <input
              type="text"
              value={newMemoryKey}
              onChange={(e) => setNewMemoryKey(e.target.value)}
              placeholder="Key (e.g. user_university, major_subject)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="text"
              value={newMemoryValue}
              onChange={(e) => setNewMemoryValue(e.target.value)}
              placeholder="Value (e.g. Computer Science Engineering)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMemoryModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
              >
                Save Memory
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
