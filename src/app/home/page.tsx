"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useScrollDirection } from "@/components/hooks/useScrollDirection";
import Link from "next/link";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

// Types for reminder data
interface ReminderState {
  dailyMood: boolean;
  meditation: boolean;
  journalEntry: boolean;
  weeklyReflection: boolean;
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const scrollDirection = useScrollDirection();
  const [reminders, setReminders] = useState<ReminderState>({
    dailyMood: false,
    meditation: false,
    journalEntry: false,
    weeklyReflection: false
  });
  const [timeOfDay, setTimeOfDay] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("morning");
    else if (hour < 18) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Check all reminder collections for today's entries using Appwrite
  useEffect(() => {
    async function checkReminders() {
      console.log("Checking reminders for user:", user);
      //if (!user?.$id) return;
      
      setIsLoading(true);
      
      try {
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.toISOString();
        
        today.setHours(23, 59, 59, 999);
        const todayEnd = today.toISOString();

        // Database and Collection IDs
        const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || ""; // Replace with your actual database ID
        const MOODS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MOOD_COLLECTION_ID || "";
        const MEDITATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MEDITATION_COLLECTION_ID || "";
        const JOURNALS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOURNAL_ID || "";
        
        console.log(user);
        // Check mood entries
        const moodEntries = await databases.listDocuments(
          DATABASE_ID,
          MOODS_COLLECTION_ID,
          [
            Query.equal('userId', user?.$id || ''),
            Query.greaterThanEqual('createdAt', todayStart),
            Query.lessThanEqual('createdAt', todayEnd)
          ]
        );
        
        // Check meditation entries
        const meditationEntries = await databases.listDocuments(
          DATABASE_ID,
          MEDITATIONS_COLLECTION_ID,
          [
            Query.equal('userId', user?.$id || ''),

          ]
        );
        
        // Check journal entries
        const journalEntries = await databases.listDocuments(
          DATABASE_ID,
          JOURNALS_COLLECTION_ID,
          [
            Query.equal('userId', user?.$id || ''),
  
          ]
        );
        
        // Update reminder states based on query results
        setReminders({
          dailyMood: moodEntries.total > 0,
          meditation: meditationEntries.total > 0,
          journalEntry: journalEntries.total > 0,
          weeklyReflection: true // Keeping this true as in your mock data
        });
      } catch (error) {
        console.error("Error checking reminders:", error);
        // Fallback to mock data if queries fail
        setReminders({
          dailyMood: false,
          meditation: true,
          journalEntry: false,
          weeklyReflection: true
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    //checkReminders();
    if (user?.$id) {
      checkReminders();
    }
  }, [user]);

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

  const countOutstandingReminders = () => {
    return Object.values(reminders).filter(value => !value).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Navbar with hide/show on scroll */}
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
          scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <Navbar />
      </div>
      
      {/* Main content */}
      <main className="max-w-6xl mx-auto p-4 pt-24 md:pt-28 md:p-8">
        {/* Welcome section */}
        <section className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                Good {timeOfDay}, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">{user?.name}</span>
              </h1>
              <p className="mt-2 text-slate-600">How are you feeling today?</p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <p className="text-xs text-slate-400">Your mental wellness journey</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Smart Reminders Section */}
        <section className="mb-8 bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Smart Reminders
            </h2>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-t-blue-500 border-blue-200 animate-spin"></div>
                <span className="text-xs font-medium text-slate-500">Checking...</span>
              </div>
            ) : (
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {countOutstandingReminders()} pending
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            {/* Mood Tracker Reminder */}
            <div className={`p-3 rounded-lg border transition-colors duration-300 ${
              isLoading 
                ? 'bg-slate-50 border-slate-200' 
                : !reminders.dailyMood 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isLoading ? (
                    <div className="h-5 w-5 mr-2 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full border-2 border-t-slate-500 border-slate-300 animate-spin"></div>
                    </div>
                  ) : !reminders.dailyMood ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span className="font-medium">
                    {isLoading 
                      ? "Checking mood entries..." 
                      : !reminders.dailyMood 
                        ? "Record your mood today" 
                        : "Mood recorded today!"}
                  </span>
                </div>
                <Link href="/moodTracker" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  {!reminders.dailyMood ? "Do it now" : "View"}
                </Link>
              </div>
            </div>
            
            {/* Meditation Reminder */}
            <div className={`p-3 rounded-lg border transition-colors duration-300 ${
              isLoading 
                ? 'bg-slate-50 border-slate-200' 
                : !reminders.meditation 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isLoading ? (
                    <div className="h-5 w-5 mr-2 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full border-2 border-t-slate-500 border-slate-300 animate-spin"></div>
                    </div>
                  ) : !reminders.meditation ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span className="font-medium">
                    {isLoading 
                      ? "Checking meditation sessions..." 
                      : !reminders.meditation 
                        ? "Take a meditation session" 
                        : "Meditation completed today!"}
                  </span>
                </div>
                <Link href="/meditation" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  {!reminders.meditation ? "Start now" : "More sessions"}
                </Link>
              </div>
            </div>
            
            {/* Journal Reminder */}
            <div className={`p-3 rounded-lg border transition-colors duration-300 ${
              isLoading 
                ? 'bg-slate-50 border-slate-200' 
                : !reminders.journalEntry 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isLoading ? (
                    <div className="h-5 w-5 mr-2 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full border-2 border-t-slate-500 border-slate-300 animate-spin"></div>
                    </div>
                  ) : !reminders.journalEntry ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span className="font-medium">
                    {isLoading 
                      ? "Checking journal entries..." 
                      : !reminders.journalEntry 
                        ? "Write in your journal today" 
                        : "Journal entry completed today!"}
                  </span>
                </div>
                <Link href="/journal" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  {!reminders.journalEntry ? "Write now" : "View journal"}
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Main Features */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Wellness Tools
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Mood Tracker */}
            <div 
              onClick={() => router.push("/mood-tracker")} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-slate-200 overflow-hidden group"
            >
              <div className="h-3 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">Mood Tracker</h3>
                <p className="text-sm text-slate-600">Track your emotions and identify patterns over time</p>
              </div>
            </div>
            
            {/* Meditation Space */}
            <div 
              onClick={() => router.push("/meditation")} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-slate-200 overflow-hidden group"
            >
              <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-400"></div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">Meditation Space</h3>
                <p className="text-sm text-slate-600">Guided sessions to help you relax and center yourself</p>
              </div>
            </div>
            
            {/* AI Journal */}
            <div 
              onClick={() => router.push("/journal")} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-slate-200 overflow-hidden group"
            >
              <div className="h-3 bg-gradient-to-r from-amber-500 to-orange-400"></div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">AI Journal</h3>
                <p className="text-sm text-slate-600">Document your thoughts with AI-guided reflection</p>
              </div>
            </div>
            
            {/* AI Chat Assistant */}
            <div 
              onClick={() => router.push("/chat")} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-slate-200 overflow-hidden group"
            >
              <div className="h-3 bg-gradient-to-r from-emerald-500 to-green-400"></div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">AI Chat Assistant</h3>
                <p className="text-sm text-slate-600">Connect with your AI wellness companion</p>
              </div>
            </div>
            
            {/* Anonymous Expression Board */}
            <div 
              onClick={() => router.push("/expression-board")} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-slate-200 overflow-hidden group"
            >
              <div className="h-3 bg-gradient-to-r from-violet-500 to-purple-400"></div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">Expression Board</h3>
                <p className="text-sm text-slate-600">Share thoughts anonymously with the community</p>
              </div>
            </div>
            
            {/* GameSpace */}
            <div 
              onClick={() => router.push("/gamespace")} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-slate-200 overflow-hidden group"
            >
              <div className="h-3 bg-gradient-to-r from-rose-500 to-pink-400"></div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">GameSpace</h3>
                <p className="text-sm text-slate-600">Play engaging games designed for mental wellness</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Your Progress */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Your Progress
          </h2>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-md font-medium text-slate-700 mb-3">Weekly Wellness Score</h3>
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-emerald-600 mr-2">78</div>
                  <div className="flex items-center text-emerald-500 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    12%
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full mt-2 mb-1">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full" style={{width: '78%'}}></div>
                </div>
                <p className="text-xs text-slate-500">Based on your mood entries and activities</p>
              </div>
              
              <div className="flex-1">
                <h3 className="text-md font-medium text-slate-700 mb-3">Activity Streak</h3>
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-blue-600 mr-2">5</div>
                  <div className="text-sm text-slate-600">days</div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <div 
                      key={day}
                      className={`h-8 w-8 rounded-md flex items-center justify-center text-xs font-medium ${
                        day <= 5 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">Keep your daily wellness activities going!</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}