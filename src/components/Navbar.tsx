// components/Navbar.tsx
'use client';

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export default function Navbar({ className = "" }: { className?: string }) {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <nav className={`bg-white shadow transition-transform duration-300 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1
              className="text-2xl font-bold text-gray-900 cursor-pointer"
              onClick={() => router.push('/')}
            >
              LumaNest
            </h1>
          </div>
          <div className="flex items-center ">
            <div className="flex items-center gap-x-4">
              <button
                onClick={() => signOut()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign out
              </button>
              <h2
                onClick={() => router.push('/profile')}
                className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer"
              >
                My profile
              </h2>
              <div
                onClick={() => router.push('/profile')}
                className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold cursor-pointer"
              >
                👤
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
