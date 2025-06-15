'use client';

import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { useAuth } from '@/context/auth-context';
import { Query } from 'appwrite';

interface MeditationSession {
  $id: string;
  userId: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export default function MeditationHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    databases
      .listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MEDITATION_COLLECTION_ID!,
        [
          Query.equal('userId', [user.$id]),
          Query.limit(100),
        ]
      )
      .then((res) => {
        const userSessions: MeditationSession[] = res.documents
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
          .map((doc) => ({
            $id: doc.$id,
            userId: doc.userId,
            startTime: doc.startTime,
            endTime: doc.endTime,
            duration: doc.duration,
          }));
        setSessions(userSessions);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const displayedSessions = showAll ? sessions : sessions.slice(0, 5);

  return (
    <div className="w-full max-w-xl mt-8">
      <h3 className="text-lg font-semibold text-indigo-700 mb-4">Meditation History</h3>
      {loading ? (
        <div className="text-indigo-400 text-center py-8">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="text-indigo-300 text-center py-8">No meditation sessions yet.</div>
      ) : (
        <div className="grid gap-4">
          {displayedSessions.map((session) => (
            <div
              key={session.$id}
              className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center justify-between"
            >
              <div>
                <span className="font-semibold text-indigo-600">
                  {new Date(session.startTime).toLocaleDateString()}
                </span>
                <span className="ml-2 text-gray-500 text-sm">
                  {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-indigo-700 font-mono text-lg">
                {Math.floor(session.duration / 60)}m {session.duration % 60}s
              </div>
            </div>
          ))}
        </div>
      )}
      {sessions.length > 5 && (
        <div className="flex justify-center mt-6">
          {!showAll ? (
            <button
              onClick={() => setShowAll(true)}
              className="px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
            >
              Show More
            </button>
          ) : (
            <button
              onClick={() => setShowAll(false)}
              className="px-6 py-2 rounded-full bg-gray-200 text-indigo-700 font-semibold shadow hover:bg-gray-300 transition"
            >
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  );
}
