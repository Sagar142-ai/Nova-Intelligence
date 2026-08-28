import React, { useState, useEffect } from 'react';
import {
  Layers,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { TestCase, TestResult } from '../types';
import { apiClient } from '../services/apiClient';

export const TestSuiteRunner: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [currentRunningId, setCurrentRunningId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    loadTestCases();
  }, []);

  const loadTestCases = async () => {
    try {
      const data = await apiClient.getTestCases();
      setTestCases(data);
    } catch (err) {
      console.error('Failed to load test suite cases:', err);
    }
  };

  const handleRunSingle = async (testId: string) => {
    setCurrentRunningId(testId);
    try {
      const result = await apiClient.runSingleTest(testId);
      setTestResults((prev) => ({ ...prev, [testId]: result }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [testId]: {
          testId,
          passed: false,
          actualIntent: 'unknown',
          response: '',
          latencyMs: 0,
          error: err.message,
        },
      }));
    } finally {
      setCurrentRunningId(null);
    }
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    for (const test of testCases) {
      setCurrentRunningId(test.id);
      try {
        const result = await apiClient.runSingleTest(test.id);
        setTestResults((prev) => ({ ...prev, [test.id]: result }));
      } catch (err: any) {
        setTestResults((prev) => ({
          ...prev,
          [test.id]: {
            testId: test.id,
            passed: false,
            actualIntent: 'unknown',
            response: '',
            latencyMs: 0,
            error: err.message,
          },
        }));
      }
    }
    setCurrentRunningId(null);
    setIsRunningAll(false);
  };

  const categories = ['All', 'Conversation', 'Calculation', 'Notes', 'Reminders', 'Memory', 'Context', 'System', 'Error Handling'];

  const filteredTests =
    selectedCategory === 'All'
      ? testCases
      : testCases.filter((t) => t.category === selectedCategory);

  const completedCount = Object.keys(testResults).length;
  const passedCount = Object.values(testResults).filter((r: TestResult) => r.passed).length;
  const failedCount = completedCount - passedCount;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                20-Point Automated Viva Test Suite
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Comprehensive Verification
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                End-to-end verification covering calculations, notes, reminders, memory, pronouns, and edge cases.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-run-all-tests"
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isRunningAll ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Executing Suite ({completedCount}/{testCases.length})...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Run All 20 Tests
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress & Pass/Fail Bar */}
      {completedCount > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-3">
              <span className="text-slate-300">
                Executed: <strong>{completedCount}</strong> of {testCases.length}
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {passedCount} Passed
              </span>
              {failedCount > 0 && (
                <span className="text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> {failedCount} Failed
                </span>
              )}
            </div>
            <span className="font-mono text-cyan-300">
              {Math.round((passedCount / Math.max(completedCount, 1)) * 100)}% Pass Rate
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-300"
              style={{ width: `${(passedCount / testCases.length) * 100}%` }}
            />
            <div
              className="bg-rose-500 transition-all duration-300"
              style={{ width: `${(failedCount / testCases.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Test Cases List */}
      <div className="space-y-3">
        {filteredTests.map((test) => {
          const result = testResults[test.id];
          const isRunning = currentRunningId === test.id;

          return (
            <div
              key={test.id}
              className={`bg-slate-900/80 border rounded-2xl p-4 transition-all ${
                isRunning
                  ? 'border-cyan-500 shadow-lg shadow-cyan-500/10'
                  : result
                  ? result.passed
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-rose-500/30 bg-rose-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {test.id.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-white">{test.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-indigo-300 border border-indigo-900/60">
                      {test.category}
                    </span>
                    {test.expectedTool && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-900/60">
                        Tool: {test.expectedTool}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 font-mono bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    Input: "{test.input}"
                  </p>

                  <p className="text-xs text-slate-400">{test.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {result && (
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
                        {result.passed ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> PASSED
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> FAILED
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {result.latencyMs} ms
                      </span>
                    </div>
                  )}

                  <button
                    id={`btn-run-test-${test.id}`}
                    onClick={() => handleRunSingle(test.id)}
                    disabled={isRunning || isRunningAll}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 border border-slate-700 transition-all disabled:opacity-40"
                    title="Run single test case"
                  >
                    {isRunning ? (
                      <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Viva Defense Note & Response Preview */}
              <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 text-slate-400">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-0.5">
                    Viva Evaluation Focus:
                  </span>
                  {test.vivaNote}
                </div>

                {result && (
                  <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/60 text-slate-300 font-mono text-[11px]">
                    <span className="text-[10px] font-semibold text-cyan-400 uppercase block mb-0.5">
                      Observed Assistant Response:
                    </span>
                    <p className="truncate">"{result.response}"</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
