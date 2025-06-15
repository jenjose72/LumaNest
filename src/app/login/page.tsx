"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Client, Account } from "appwrite";

// Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('684aa8f1001ab90bbfd9');

const account = new Account(client);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if there's an active session
        const session = await account.get();
        // If session exists, user is logged in, redirect to home
        if(session)
          router.push('/home');
      } catch (error) {
        // No session, user needs to log in
        setIsChecking(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await account.createEmailSession(email, password);
      router.push('/home');
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-100 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-100 to-white px-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to continue to your account</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label className="text-gray-700 text-sm font-semibold" htmlFor="password">
                Password
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-indigo-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold
              ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700"}`}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-indigo-600 font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-indigo-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-indigo-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}