'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { databases } from '@/lib/appwrite';

interface MeditationTimerProps {
  onSessionSaved: () => void;
}

export default function MeditationTimer({ onSessionSaved }: MeditationTimerProps) {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  function startTimer() {
    setIsRunning(true);
    setStartTime(new Date());
    setSeconds(0);
    intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  async function stopTimer() {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const endTime = new Date();
    if (user && startTime) {
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MEDITATION_COLLECTION_ID!,
        'unique()',
        {
          userId: user.$id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: seconds,
        }
      );
      onSessionSaved();
    }
    setStartTime(null);
    setSeconds(0);
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 flex flex-col items-center w-full max-w-xl">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Meditation Timer</h2>
      <div className="text-5xl font-mono text-indigo-600 mb-6">
        {`${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`}
      </div>
      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="px-8 py-3 rounded-full bg-indigo-600 text-white text-lg font-semibold shadow hover:bg-indigo-700 transition"
          >
            Start
          </button>
        ) : (
          <button
            onClick={stopTimer}
            className="px-8 py-3 rounded-full bg-red-500 text-white text-lg font-semibold shadow hover:bg-red-600 transition"
          >
            Stop & Save
          </button>
        )}
      </div>
    </div>
  );
}
