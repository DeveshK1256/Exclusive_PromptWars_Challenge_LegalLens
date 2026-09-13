'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signedIn, setSignedIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignedIn(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="bg-indigo-600 text-white p-3 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center shadow-md">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-100">Sign in to LegalLens AI</h1>
        <p className="text-xs text-slate-400">Access your secure document workspace and legal intelligence.</p>
      </div>

      {signedIn ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-100">Signed In Successfully</h3>
          <p className="text-xs text-slate-400">Welcome back! Proceed to your document dashboard.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            Sign In
          </button>

          <div className="pt-4 border-t border-slate-800 text-center">
            <Link href="/dashboard" className="text-xs text-indigo-400 hover:underline">
              Continue in Demo Mode $\rightarrow$
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
