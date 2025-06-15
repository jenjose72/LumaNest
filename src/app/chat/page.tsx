'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Chat from '@/components/Chat';

export default function ChatSection() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-t-blue-500 border-blue-200 animate-spin"></div>
          <div className="text-xl font-medium text-slate-700">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header Navigation */}
      <nav className="bg-white shadow-sm z-10">
        <div className="container mx-auto flex justify-between items-center h-14 px-4">
          <div className="flex items-center gap-2">
            {/* Logo with Back to Home link */}
            <Link 
              href="/" 
              className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
            
            <div className="h-5 border-r border-slate-300 mx-1"></div>
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                L
              </div>
              <span className="font-semibold text-slate-700">Chat</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 bg-blue-50 py-1 px-3 rounded-full border border-blue-100">
              <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Full Screen Chat Content */}
      <div className="flex-grow h-[calc(100vh-3.5rem)]">
        <Chat />
      </div>
    </div>
  );
}