"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { features } from "@/lib/constants";
import Navbar from "@/components/Navbar";

export default function Home() {
  const { user, loading } = useAuth();
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
      <Navbar />
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
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold">
                  {feature.icon || feature.title.charAt(0)}
                </div>
              </div>
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
