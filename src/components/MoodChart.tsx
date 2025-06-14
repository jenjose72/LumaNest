'use client';

import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { useAuth } from '@/context/auth-context';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

interface Mood {
  userId: string;
  timeStamp: string;
  valence: number;
  arousal: number;
  emotionLabel: string;
}

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Last Year', value: 'year' },
  { label: 'Last Month', value: 'month' },
  { label: 'Last Week', value: 'week' },
  { label: 'Last Day', value: 'day' },
];

const orderedEmotions = [
  'sad', 'angry', 'frustrated', 'anxious', 'bored', 'tired', 'lazy',
  'calm', 'relaxed', 'hopeful', 'motivated', 'excited', 'happy',
];

const emotionEmojiMap: Record<string, string> = {
  sad: '😢',
  angry: '😠',
  frustrated: '😤',
  anxious: '😰',
  bored: '😐',
  tired: '😴',
  lazy: '😪',
  calm: '😌',
  relaxed: '😎',
  hopeful: '🤞',
  motivated: '💪',
  excited: '🤩',
  happy: '😄',
};

const emotionColorMap: Record<string, string> = {
  sad: '#3b82f6',
  angry: '#ef4444',
  frustrated: '#f59e42',
  anxious: '#6366f1',
  bored: '#a3a3a3',
  tired: '#818cf8',
  lazy: '#fbbf24',
  calm: '#38bdf8',
  relaxed: '#34d399',
  hopeful: '#facc15',
  motivated: '#10b981',
  excited: '#eab308',
  happy: '#22d3ee',
};

function filterMoods(moods: Mood[], filter: string): Mood[] {
  if (filter === 'all') return moods;
  const now = new Date();
  return moods.filter((mood: Mood) => {
    const moodDate = new Date(mood.timeStamp);
    switch (filter) {
      case 'year':
        return moodDate >= new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      case 'month':
        return moodDate >= new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      case 'week':
        return moodDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      case 'day':
        return moodDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      default:
        return true;
    }
  });
}

export default function MoodChart() {
  const { user } = useAuth();
  const [moods, setMoods] = useState<Mood[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch moods
  const fetchMoods = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MOOD_COLLECTION_ID!,
        []
      );
      const userMoods = res.documents.filter((doc: Mood) => doc.userId === user.$id);
      userMoods.sort(
        (a: Mood, b: Mood) =>
          new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()
      );
      setMoods(userMoods);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredMoods = filterMoods(moods, filter);

  // Prepare chart data
  const labels = filteredMoods.map((_, i) => i + 1); // Hide x-axis, use index
  const emotionIndices = filteredMoods.map((m) => orderedEmotions.indexOf(m.emotionLabel) + 1);

  // Use a single color for the line
  const lineColor = '#4f46e5'; // Indigo-600

  // Node colors and subtle transition effect (Chart.js uses transitions by default)
  const nodeColors = filteredMoods.map((m) => emotionColorMap[m.emotionLabel] || '#6366f1');

  const data = {
    labels,
    datasets: [
      {
        label: 'Mood',
        data: emotionIndices,
        fill: true,
        borderColor: lineColor,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.35,
        pointRadius: 8, // smaller nodes
        pointHoverRadius: 14,
        pointBackgroundColor: nodeColors,
        pointBorderColor: nodeColors,
        pointBorderWidth: 3,
        pointStyle: 'circle',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 32 },
    scales: {
      x: { display: false },
      y: {
        title: {
          display: true,
          text: 'Emotion',
          font: { size: 20, weight: 'bold' },
        },
        min: 1,
        max: orderedEmotions.length,
        ticks: {
          stepSize: 1,
          font: { size: 18, weight: 'bold' },
          callback: function (value: number | string) {
            if (typeof value === 'number') {
              const emotion = orderedEmotions[value - 1];
              return emotion ? emotion.charAt(0).toUpperCase() + emotion.slice(1) : '';
            }
            return '';
          },
        },
        grid: { color: 'rgba(200, 200, 200, 0.12)' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(30,41,59,0.98)',
        titleFont: { size: 20, weight: 'bold', family: 'inherit' },
        bodyFont: { size: 18, family: 'inherit' },
        padding: 18,
        borderRadius: 12,
        borderColor: lineColor,
        borderWidth: 2,
        displayColors: false,
        callbacks: {
          label: function (context: any) {
            const idx = context.dataIndex;
            const mood = filteredMoods[idx];
            const emoji = emotionEmojiMap[mood.emotionLabel] || '';
            const time = new Date(mood.timeStamp).toLocaleString();
            return [
              `${emoji}  ${mood.emotionLabel.charAt(0).toUpperCase() + mood.emotionLabel.slice(1)}`,
              `Time: ${time}`,
            ];
          },
          labelTextColor: function (context: any) {
            const idx = context.dataIndex;
            const mood = filteredMoods[idx];
            return emotionColorMap[mood.emotionLabel] || lineColor;
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 14,
        radius: 8,
        backgroundColor: nodeColors,
        borderColor: nodeColors,
        borderWidth: 3,
        // Chart.js animates color/size transitions by default
      },
      line: {
        borderWidth: 4,
        borderColor: lineColor,
        tension: 0.35,
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutCubic',
    },
  };

  return (
    <div
      className="mt-12 bg-gradient-to-br from-indigo-100 via-white to-indigo-50 rounded-3xl shadow-2xl p-10 flex flex-col items-center justify-center"
      style={{ height: '600px', minWidth: 'min(100vw, 700px)' }}
    >
      <div className="flex justify-between items-center mb-8 w-full">
        <h3 className="text-2xl font-bold text-indigo-700 drop-shadow">Mood Trends</h3>
        <div>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`mx-1 px-5 py-2 rounded-xl font-semibold transition-colors duration-300
                ${filter === f.value
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}
              `}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="text-indigo-400 text-center py-32 text-xl font-semibold">Loading...</div>
      ) : filteredMoods.length === 0 ? (
        <div className="text-indigo-300 text-center py-32 text-xl font-semibold">No mood data available for this period.</div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Line data={data} options={options} />
        </div>
      )}
      <div className="mt-8 text-indigo-500 italic text-center w-full text-lg">
        {filteredMoods.length > 0 && (
          <>
            <span className="text-3xl">✨</span>
            {` "Tracking your mood is the first step to mastering your mind." `}
            <span className="text-3xl">✨</span>
          </>
        )}
      </div>
    </div>
  );
}
