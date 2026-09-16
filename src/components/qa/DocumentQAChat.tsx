'use client';

import React, { useState } from 'react';
import { QAResponse, AnswerCitation } from '../../lib/qa/types';
import { MessageSquare, Send, ShieldCheck, AlertOctagon, HelpCircle, ExternalLink, Sparkles } from 'lucide-react';

interface DocumentQAChatProps {
  documentId: string;
  documentTitle?: string;
  rawText?: string;
  onAskQuestion?: (question: string) => Promise<QAResponse>;
}

export const DocumentQAChat: React.FC<DocumentQAChatProps> = ({
  documentId,
  documentTitle = 'Document',
  rawText,
  onAskQuestion,
}) => {
  const [questionInput, setQuestionInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<QAResponse[]>([]);

  const sampleQuestions = [
    'What are the termination notice requirements?',
    'Are there any confidentiality or non-disclosure obligations?',
    'What happens in the event of a contract breach?',
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || questionInput;
    if (!q || !q.trim() || loading) return;

    setLoading(true);
    setQuestionInput('');

    try {
      if (onAskQuestion) {
        const response = await onAskQuestion(q);
        setMessages((prev) => [...prev, response]);
      } else {
        // Fallback demo call to API endpoint
        const res = await fetch(`/api/documents/${documentId}/qa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q, rawText }),
        });
        const json = await res.json();
        if (json.data) {
          setMessages((prev) => [...prev, json.data]);
        }
      }
    } catch (err) {
      console.error('Q&A error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col h-[650px] shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Grounded Document Q&amp;A
              <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded">
                Zero-Hallucination Gate Active
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Ask questions directly grounded in {documentTitle}</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {messages.length === 0 ? (
          <div className="text-center py-10 px-4 max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Ask anything about this document</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Every answer is generated strictly from dense vector retrieved evidence and backed by traceable citations.
              </p>
            </div>

            {/* Sample Suggested Questions */}
            <div className="pt-2 text-left space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Suggested Questions</span>
              {sampleQuestions.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sq)}
                  className="w-full text-left p-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-between group"
                >
                  <span>{sq}</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="space-y-3">
              {/* User Question */}
              <div className="flex justify-end">
                <div className="bg-indigo-600 text-white text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-none max-w-md shadow-sm">
                  {msg.question}
                </div>
              </div>

              {/* AI Grounded Answer Card */}
              <div className="flex justify-start">
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs p-4 rounded-2xl rounded-tl-none max-w-xl space-y-3 shadow-sm">
                  {/* Safety Status & Confidence Header */}
                  <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-200 dark:border-slate-800/80">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Grounded Answer ({Math.round(msg.confidence * 100)}% Confidence)
                    </span>
                    {msg.isUnsupportedAnswer && (
                      <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
                        <AlertOctagon className="w-3 h-3" />
                        Not Found in Document
                      </span>
                    )}
                  </div>

                  {/* Answer Text */}
                  <p className="leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">{msg.answerText}</p>

                  {/* Citations Drawer */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-800/60">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Citations &amp; Source References ({msg.citations.length})
                      </span>
                      <div className="space-y-1.5">
                        {msg.citations.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1"
                          >
                            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">
                              <span>{c.sectionTitle}</span>
                              <span className="bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                                {c.sourceReference} (Score: {(c.relevanceScore * 100).toFixed(0)}%)
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 italic font-mono text-[10px] line-clamp-2">"{c.quotedTextSnippet}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow Ups */}
                  {msg.suggestedFollowUpQuestions && msg.suggestedFollowUpQuestions.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUpQuestions.map((fu, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSend(fu)}
                          className="text-[10px] bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-750 transition-colors"
                        >
                          + {fu}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs px-4 py-3 rounded-2xl rounded-tl-none text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500 animate-ping" />
              Retrieving grounded evidence &amp; generating cited answer...
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 rounded-b-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor="qa-input" className="sr-only">Ask a question about this document</label>
          <input
            id="qa-input"
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="Ask a question about this document..."
            aria-label="Ask a question about this document"
            disabled={loading}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !questionInput.trim()}
            aria-label="Send question"
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
};
