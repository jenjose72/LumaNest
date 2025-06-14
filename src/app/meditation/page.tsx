'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import MeditationTimer from '@/components/MeditationTimer';
import MeditationHistory from '@/components/MeditationHistory';

export default function MeditationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-12 px-4">
      <MeditationTimer onSessionSaved={() => setRefreshKey((k) => k + 1)} />
      <MeditationHistory key={refreshKey} />
    </div>
  );
}
