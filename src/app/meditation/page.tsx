'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/Navbar';
import MeditationTimer from '@/components/MeditationTimer';
import MeditationHistory from '@/components/MeditationHistory';
import MeditationHistoryGraph from '@/components/MeditationHistoryGraph';
import { useScrollDirection } from '@/components/hooks/useScrollDirection';

export default function MeditationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const scrollDirection = useScrollDirection();

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
    <div className="min-h-screen flex flex-col items-center bg-gray-50">
      {/* Navbar with hide/show on scroll */}
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
          scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <Navbar />
      </div>
      {/* Padding to prevent content being hidden under navbar */}
      <div className="pt-20 w-full flex flex-col items-center py-12 px-4">
        <MeditationTimer onSessionSaved={() => setRefreshKey((k) => k + 1)} />
        <MeditationHistory key={refreshKey} />
        <MeditationHistoryGraph />
      </div>
    </div>
  );
}
