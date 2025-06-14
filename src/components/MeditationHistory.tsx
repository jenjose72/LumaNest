'use client';

import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { useAuth } from '@/context/auth-context';

interface MeditationSession {
  $id: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export default function MeditationHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    databases
      .listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MEDITATION_COLLECTION_ID!,
        []
      )
      .then((res) => {
        const userSessions = res.documents
          .filter((doc: MeditationSession) => doc.userId === user.$id)
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        setSessions(userSessions);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="w-full max-w-xl mt-8">
      <h3 className="text-lg font-semibold text-indigo-700 mb-4">Meditation History</h3>
      {loading ? (
        <div className="text-indigo-400 text-center py-8">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="text-indigo-300 text-center py-8">No meditation sessions yet.</div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
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
    </div>
  );
}
