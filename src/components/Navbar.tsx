'use client';

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar({ className = "" }: { className?: string }) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <nav className={`bg-white shadow-sm z-10 ${className}`}>
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        <div className="flex items-center gap-2">
          {/* Logo and App Name */}
          <div 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              L
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              LumaNest
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/mood-tracker" className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
              Mood Tracker
            </Link>
            <Link href="/meditation" className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
              Meditation
            </Link>
            <Link href="/journal" className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
              Journal
            </Link>
            <Link href="/chat" className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
              Chat
            </Link>
          </div>

          {/* User Profile and Sign Out */}
          <div className="flex items-center gap-4">
            <div 
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 bg-blue-50 py-1 px-3 rounded-full border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                {user?.name?.charAt(0).toUpperCase() || '👤'}
              </div>
              <span className="text-sm font-medium text-slate-700">
                My Profile
              </span>
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
      </div>
    </nav>
  );
}