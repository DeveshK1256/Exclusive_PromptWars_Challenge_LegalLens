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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            Action Plan & Execution Strategy
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Pre-signature checklist, questions for legal counsel, and post-signing task tracker.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'checklist'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Before You Sign ({checklist.length})
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'questions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Lawyer Questions ({data.lawyerQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Action Tasks ({tasks.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Before You Sign Checklist */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="text-xs text-slate-300 font-medium">
              Checklist Progress: <span className="text-indigo-400 font-bold">{completedChecklistCount}</span> of{' '}
              <span className="text-slate-100 font-bold">{checklist.length}</span> items reviewed
            </div>
            <div className="w-48 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${checklist.length > 0 ? (completedChecklistCount / checklist.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {checklist.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
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
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : item.severity === 'orange'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

                return (
                  <div
                    key={item.id}
                    className={`border rounded-xl p-4 transition-all ${severityStyles} ${
                      item.checked ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleChecklist(item.id)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors focus:outline-none"
                      >
                        {item.checked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <div className="w-5 h-5 rounded border border-slate-600 bg-slate-950" />
                        )}
                      </button>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${badgeStyle}`}>
                              {item.severity} Severity
                            </span>
                            <h4 className={`text-sm font-bold text-slate-100 ${item.checked ? 'line-through text-slate-400' : ''}`}>
                              {item.title}
                            </h4>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">{item.recommendation}</p>

                        <div className="pt-2 border-t border-slate-800/40 flex items-center text-[11px] text-slate-400 font-mono">
                          <FileText className="w-3 h-3 text-slate-500 mr-1" />
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
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
            <p className="font-medium text-slate-200">
              <HelpCircle className="w-4 h-4 text-indigo-400 inline mr-1.5" />
              Recommended Questions to Ask Your Qualified Legal Attorney
            </p>
            <p className="text-slate-400 mt-1">
              These tailored questions highlight ambiguous terms, unilateral rights, and critical obligations for professional clarification.
            </p>
          </div>

          <div className="space-y-3">
            {data.lawyerQuestions.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
                No specific lawyer questions were generated for this document.
              </div>
            ) : (
              data.lawyerQuestions.map((q, idx) => (
                <div key={q.id || idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                          q.priority === 'high'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : q.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                        }`}
                      >
                        {q.priority} Priority
                      </span>
                      <h4 className="text-sm font-bold text-indigo-300">
                        Q{idx + 1}: {q.question}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <strong className="text-slate-200 font-semibold">Why Ask: </strong> {q.reason}
                  </p>

                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-500" />
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
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="text-xs text-slate-300 font-medium">
              Task Execution: <span className="text-indigo-400 font-bold">{completedTasksCount}</span> of{' '}
              <span className="text-slate-100 font-bold">{tasks.length}</span> completed
            </div>
            <div className="w-48 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
                No actionable tasks generated for this document.
              </div>
            ) : (
              tasks.map(task => (
                <div
                  key={task.id}
                  className={`bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 transition-all ${
                    task.status === 'completed' ? 'opacity-60 bg-slate-950/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded border border-slate-600 bg-slate-950" />
                      )}
                    </button>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                              task.priority === 'high'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : task.priority === 'medium'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                          <h4 className={`text-sm font-bold text-slate-100 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                            {task.title}
                          </h4>
                        </div>

                        {task.due_date && (
                          <div className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due: {task.due_date}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>

                      <div className="pt-2 border-t border-slate-800/40 flex items-center text-[11px] text-slate-400 font-mono">
                        <FileText className="w-3 h-3 text-slate-500 mr-1" />
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
