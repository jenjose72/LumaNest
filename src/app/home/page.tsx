"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { features } from "@/lib/constants";

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">LumaNest</h1>
            </div>
            <div className="flex items-center ">
              <div className="flex items-center gap-x-4">
                <button
                  onClick={() => signOut()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign out
                </button>
                <h2 onClick={() => router.push('/profile')}
                 className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer">
                  My profile
                </h2>
                <div onClick={() => router.push('/profile')}
                 className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold cursor-pointer">
                  👤
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-12 text-center">
          <span className="text-gray-700 mr-4">Welcome, {user?.name}</span>
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              onClick={() => router.push(feature.route)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300 cursor-pointer p-6 border border-gray-200"
            >
              {/* Icon placeholder */}
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold">
                  {feature.icon || feature.title.charAt(0)}
                </div>
              </div>

              {/* App title */}
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h2>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
