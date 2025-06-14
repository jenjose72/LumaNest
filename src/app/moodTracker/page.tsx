'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import MoodForm from '@/components/MoodForm';
import MoodChart from '@/components/MoodChart';

export default function MoodTrackerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showForm, setShowForm] = useState(true);
  const [chartKey, setChartKey] = useState(0); // for reloading chart

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {showForm && (
        <MoodForm
          onSubmitted={() => {
            setShowForm(false);
            setChartKey((k) => k + 1); // force MoodChart to reload
          }}
        />
      )}
      <MoodChart key={chartKey} />
    </div>
  );
}
