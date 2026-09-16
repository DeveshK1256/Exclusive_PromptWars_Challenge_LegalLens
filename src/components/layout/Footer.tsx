import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs py-8 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1 text-left">
            <p className="font-semibold text-slate-900 dark:text-slate-100">LegalLens AI — Legal Navigation Assistant</p>
            <p className="text-slate-600 dark:text-slate-300">
              Transforming complex legal documents into plain-language understanding, risk identification, and actionable next steps.
            </p>
          </div>
          <div className="flex space-x-6 text-left">
            <Link href="/privacy" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/terms#safety" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors">Safety &amp; Policy</Link>
          </div>
        </div>

        <div className="py-6 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-left space-y-1">
          <p className="text-slate-600 dark:text-slate-300">
            LegalLens AI does not provide professional legal advice. Always consult a qualified attorney for specific legal counsel.
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} LegalLens AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
