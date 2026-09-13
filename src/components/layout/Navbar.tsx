'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, FileText, GitCompare, ListCheck, Settings, User, LogOut } from 'lucide-react';
import { getCurrentSession, signOutUser } from '@/lib/auth';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      // 1. Check localStorage first for dynamic logged in email
      if (typeof localStorage !== 'undefined') {
        const storedEmail = localStorage.getItem('legallens_user_email');
        if (storedEmail) {
          setUserEmail(storedEmail);
          return;
        }
      }

      // 2. Check cookies for legallens_user_email
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) acc[key] = decodeURIComponent(value);
          return acc;
        }, {} as Record<string, string>);

        if (cookies['legallens_user_email']) {
          setUserEmail(cookies['legallens_user_email']);
          return;
        }

        if (cookies['legallens_demo_session'] || cookies['sb-access-token']) {
          setUserEmail('demo@legallens.ai');
          return;
        }
      }

      // 3. Supabase Auth session fallback
      try {
        const session = await getCurrentSession();
        if (session?.user?.email) {
          setUserEmail(session.user.email);
        }
      } catch {
        // Fallback
      }
    };

    checkUser();
  }, []);

  const handleSignOut = async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('legallens_user_email');
    }
    if (typeof document !== 'undefined') {
      document.cookie = "legallens_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "legallens_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    try {
      await signOutUser();
    } catch {
      // Ignore
    }
    setUserEmail(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    } else {
      router.push('/login');
    }
  };

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
            {userEmail ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  <User className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-semibold text-slate-700">{userEmail}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <User className="w-4 h-4 mr-1.5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
