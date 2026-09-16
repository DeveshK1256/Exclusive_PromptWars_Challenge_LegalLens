'use client';

import React, { useState } from 'react';
import { Settings, User, Shield, Key, Bell, CheckCircle, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function SettingsPage() {
  const { theme } = useTheme();
  const [contextRole, setContextRole] = useState('Employee');
  const [complexity, setComplexity] = useState('very_simple');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          Account & Legal Preference Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Configure your perspective role (`context_role`), preferred simplification level, and privacy controls.
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2 font-semibold" role="status" aria-live="polite">
          <CheckCircle className="w-5 h-5" aria-hidden="true" />
          Settings successfully updated!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Context Role Preference */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            Personal Impact Role (`context_role`)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            LegalLens AI tailors personal impact explanations to your specific perspective in documents.
          </p>

          <label htmlFor="settings-role-select" className="sr-only">Personal Impact Role Context</label>
          <select
            id="settings-role-select"
            value={contextRole}
            onChange={(e) => setContextRole(e.target.value)}
            aria-label="Personal Impact Role Context"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="Employee">Employee / Job Applicant</option>
            <option value="Tenant">Tenant / Resident</option>
            <option value="Freelancer">Freelancer / Independent Contractor</option>
            <option value="Consumer">Consumer / Service Subscriber</option>
            <option value="BusinessOwner">Small Business Owner</option>
          </select>
        </div>

        {/* Simplification Level */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Default Simplification Complexity Level
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Choose your default target reading level for document summaries and explanations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'very_simple', label: 'Very Simple', desc: '5th-grade reading level, plain language' },
              { id: 'student', label: 'Student Level', desc: 'High school reading level, balanced detail' },
              { id: 'professional', label: 'Professional', desc: 'Business executive style, structured points' },
              { id: 'legal_terminology', label: 'Legal Terminology', desc: 'Preserves technical legal phrasing' },
            ].map((level) => (
              <label
                key={level.id}
                onClick={() => setComplexity(level.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  complexity === level.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-slate-900 dark:text-slate-100'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-slate-200">
                  <span>{level.label}</span>
                  <input
                    type="radio"
                    name="complexity"
                    value={level.id}
                    checked={complexity === level.id}
                    onChange={() => setComplexity(level.id)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{level.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Theme Preference */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Appearance & Visual Theme
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Switch between Dark Mode and Light Mode for LegalLens AI.
          </p>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-xs text-slate-600 dark:text-slate-400">Currently active theme: <strong className="text-slate-900 dark:text-slate-200 capitalize">{theme} Mode</strong></span>
          </div>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
        >
          Save Preferences
        </button>
      </form>
    </div>
  );
}
