'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${
        theme === 'dark'
          ? 'bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-850 hover:border-amber-500/30'
          : 'bg-slate-100 text-indigo-600 border-slate-200 hover:bg-slate-200 hover:border-indigo-300'
      } ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
          <span className="hidden sm:inline text-slate-200">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
          <span className="hidden sm:inline text-slate-700">Dark</span>
        </>
      )}
    </button>
  );
};
