'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { databases } from '@/lib/appwrite';
import { useAuth } from '@/context/auth-context';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, TimeScale);

interface MeditationSession {
  $id: string;
  startTime: string;
  duration: number;
}

export default function MeditationHistoryGraph() {
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
        []
      )
      .then((res) => {
        const userSessions = res.documents
          .filter((doc: MeditationSession) => doc.userId === user.$id)
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        setSessions(userSessions);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const displayedSessions = showAll ? sessions : sessions.slice(-5);

  const data = {
    labels: displayedSessions.map((s) => s.startTime),
    datasets: [
      {
        label: 'Meditation Duration',
        data: displayedSessions.map((s) => s.duration),
        fill: false,
        borderColor: '#4f46e5',
        backgroundColor: '#a5b4fc',
        pointRadius: 8,
        pointHoverRadius: 14,
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#4f46e5',
        pointBorderWidth: 3,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: false, // Hide x-axis
        type: 'time' as const,
        time: { unit: 'minute' },
      },
      y: {
        display: false, // Hide y-axis
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(30,41,59,0.98)',
        titleFont: { size: 18, weight: 'bold' },
        bodyFont: { size: 16 },
        padding: 16,
        borderRadius: 10,
        borderColor: '#4f46e5',
        borderWidth: 2,
        displayColors: false,
        callbacks: {
          title: function (context: any) {
            const idx = context[0].dataIndex;
            const session = displayedSessions[idx];
            return `🧘 ${new Date(session.startTime).toLocaleString()}`;
          },
          label: function (context: any) {
            const idx = context.dataIndex;
            const session = displayedSessions[idx];
            const min = Math.floor(session.duration / 60);
            const sec = session.duration % 60;
            return `Duration: ${min}m ${sec}s`;
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 14,
        radius: 8,
        backgroundColor: '#818cf8',
        borderColor: '#4f46e5',
        borderWidth: 3,
      },
      line: {
        borderWidth: 4,
        borderColor: '#4f46e5',
        tension: 0.3,
      },
    },
    animation: {
      duration: 900,
      easing: 'easeOutCubic',
    },
  };

  return (
    <div className="mt-8 bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center w-full max-w-xl">
      <h3 className="text-lg font-semibold text-indigo-700 mb-4">Meditation History Graph</h3>
      {loading ? (
        <div className="text-indigo-400 text-center py-16">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="text-indigo-300 text-center py-16">No meditation sessions yet.</div>
      ) : (
        <div className="w-full h-80 flex items-center justify-center">
          <Line data={data} options={options} />
        </div>
      )}
      {!showAll && sessions.length > 5 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-6 px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
        >
          Show More
        </button>
      )}
    </div>
  );
}
