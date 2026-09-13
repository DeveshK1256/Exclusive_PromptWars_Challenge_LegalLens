import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-semibold text-slate-200">LegalLens AI — Legal Navigation Assistant</p>
            <p className="text-slate-400">
              Transforming complex legal documents into plain-language understanding, risk identification, and actionable next steps.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#privacy" className="hover:text-slate-200 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-200 transition-colors">Terms of Service</a>
            <a href="#safety" className="hover:text-slate-200 transition-colors">Safety & Policy</a>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-slate-500 text-center">
          <p>
            LegalLens AI does not provide professional legal advice. Always consult a qualified attorney for specific legal counsel.
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} LegalLens AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
