'use client';

import React, { useState } from 'react';
import { ActionPlanResult, BeforeYouSignItem, ActionTaskCard, LawyerQuestionCard } from '../../lib/action/types';
import { ShieldAlert, HelpCircle, CheckSquare, Clock, AlertTriangle, FileText, CheckCircle2, ChevronRight, Filter } from 'lucide-react';

interface ActionPlanViewerProps {
  data: ActionPlanResult;
}

export const ActionPlanViewer: React.FC<ActionPlanViewerProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'questions' | 'tasks'>('checklist');
  const [checklist, setChecklist] = useState<BeforeYouSignItem[]>(data.checklist || []);
  const [tasks, setTasks] = useState<ActionTaskCard[]>(data.actionItems || []);

  const toggleChecklist = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
          return { ...task, status: nextStatus };
        }
        return task;
      })
    );
  };

  const completedChecklistCount = checklist.filter(c => c.checked).length;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Action Plan Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            Action Plan & Execution Strategy
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Pre-signature checklist, questions for legal counsel, and post-signing task tracker.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800" role="tablist" aria-label="Action Plan Navigation Tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'checklist'}
            aria-controls="panel-checklist"
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              activeTab === 'checklist'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
            Before You Sign ({checklist.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'questions'}
            aria-controls="panel-questions"
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              activeTab === 'questions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Lawyer Questions ({data.lawyerQuestions.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'tasks'}
            aria-controls="panel-tasks"
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            Action Tasks ({tasks.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Before You Sign Checklist */}
      {activeTab === 'checklist' && (
        <div id="panel-checklist" role="tabpanel" aria-label="Before You Sign Checklist" className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Checklist Progress: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{completedChecklistCount}</span> of{' '}
              <span className="text-slate-900 dark:text-slate-100 font-bold">{checklist.length}</span> items reviewed
            </div>
            <div
              className="w-48 bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800"
              role="progressbar"
              aria-label="Pre-signature checklist completion progress"
              aria-valuenow={checklist.length > 0 ? completedChecklistCount / checklist.length : 0}
              aria-valuemin={0}
              aria-valuemax={1}
            >
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${checklist.length > 0 ? (completedChecklistCount / checklist.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {checklist.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No high-risk checklist items flagged for this document.
              </div>
            ) : (
              checklist.map(item => {
                const severityStyles =
                  item.severity === 'red'
                    ? 'border-red-500/30 bg-red-500/5'
                    : item.severity === 'orange'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-yellow-500/20 bg-yellow-500/5';

                const badgeStyle =
                  item.severity === 'red'
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                    : item.severity === 'orange'
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                    : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';

                const nonColorLabel =
                  item.severity === 'red'
                    ? 'Red: High Severity'
                    : item.severity === 'orange'
                    ? 'Orange: Attention Area'
                    : 'Yellow: Important Clause';

                return (
                  <div
                    key={item.id}
                    className={`border rounded-xl p-4 transition-all ${severityStyles} ${
                      item.checked ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleChecklist(item.id)}
                        aria-label={`Mark ${item.title} as ${item.checked ? 'uncompleted' : 'completed'}`}
                        className="mt-0.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                      >
                        {item.checked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" aria-hidden="true" />
                        ) : (
                          <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950" />
                        )}
                      </button>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {/* WCAG 1.4.1 Non-Color Severity Badge */}
                            <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${badgeStyle}`}>
                              [{nonColorLabel}]
                            </span>
                            <h3 className={`text-sm font-bold text-slate-900 dark:text-slate-100 ${item.checked ? 'line-through text-slate-400 dark:text-slate-400' : ''}`}>
                              {item.title}
                            </h3>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{item.recommendation}</p>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/40 flex items-center text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          <FileText className="w-3 h-3 text-slate-400 dark:text-slate-500 mr-1" aria-hidden="true" />
                          Source Ref: {item.sourceReference}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Questions for Legal Professional */}
      {activeTab === 'questions' && (
        <div id="panel-questions" role="tabpanel" aria-label="Questions for Legal Professional" className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-700 dark:text-slate-300">
            <p className="font-medium text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              Recommended Questions to Ask Your Qualified Legal Attorney
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              These tailored questions highlight ambiguous terms, unilateral rights, and critical obligations for professional clarification.
            </p>
          </div>

          <div className="space-y-3">
            {data.lawyerQuestions.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No specific lawyer questions were generated for this document.
              </div>
            ) : (
              data.lawyerQuestions.map((q, idx) => (
                <div key={q.id || idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Non-Color Priority Tag */}
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                          q.priority === 'high'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                            : q.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                            : 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-500/20'
                        }`}
                      >
                        [{q.priority.toUpperCase()} Priority]
                      </span>
                      <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                        Q{idx + 1}: {q.question}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800/80">
                    <strong className="text-slate-900 dark:text-slate-200 font-semibold">Why Ask: </strong> {q.reason}
                  </p>

                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                    Source Ref: {q.source_reference}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Action Tasks */}
      {activeTab === 'tasks' && (
        <div id="panel-tasks" role="tabpanel" aria-label="Action Tasks Execution Tracker" className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Task Execution: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{completedTasksCount}</span> of{' '}
              <span className="text-slate-900 dark:text-slate-100 font-bold">{tasks.length}</span> completed
            </div>
            <div className="w-48 bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800" role="progressbar" aria-valuenow={completedTasksCount} aria-valuemin={0} aria-valuemax={tasks.length}>
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No actionable tasks generated for this document.
              </div>
            ) : (
              tasks.map(task => (
                <div
                  key={task.id}
                  className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 transition-all ${
                    task.status === 'completed' ? 'opacity-60 bg-slate-50 dark:bg-slate-950/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(task.id)}
                      aria-label={`Mark task ${task.title} as ${task.status === 'completed' ? 'pending' : 'completed'}`}
                      className="mt-0.5 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" aria-hidden="true" />
                      ) : (
                        <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950" />
                      )}
                    </button>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                              task.priority === 'high'
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                                : task.priority === 'medium'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                                : 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-500/20'
                            }`}
                          >
                            [{task.priority.toUpperCase()} Priority]
                          </span>
                          <h4 className={`text-sm font-bold text-slate-900 dark:text-slate-100 ${task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-400' : ''}`}>
                            {task.title}
                          </h4>
                        </div>

                        {task.due_date && (
                          <div className="text-xs font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            Due: {task.due_date}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{task.description}</p>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/40 flex items-center text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <FileText className="w-3 h-3 text-slate-400 dark:text-slate-500 mr-1" aria-hidden="true" />
                        Source Ref: {task.source_reference}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

