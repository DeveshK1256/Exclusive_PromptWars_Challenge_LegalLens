'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, FileText, GitCompare, ListCheck, Settings, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-brand-600 text-white p-2 rounded-lg shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Legal<span className="text-brand-600">Lens</span> AI
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="flex items-center space-x-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/documents"
              className="flex items-center space-x-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>My Documents</span>
            </Link>
            <Link
              href="/compare"
              className="flex items-center space-x-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare</span>
            </Link>
            <Link
              href="/action-plans"
              className="flex items-center space-x-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              <ListCheck className="w-4 h-4" />
              <span>Action Plans</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center space-x-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <User className="w-4 h-4 mr-1.5" />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
