'use client';

import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Brush, Label, Cell } from 'recharts';
import { databases } from '@/lib/appwrite';
import { useAuth } from '@/context/auth-context';
import { Query } from 'appwrite';

interface MeditationSession {
  $id: string;
  userId: string;
  startTime: string;
  duration: number;
}

function formatDuration(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

function getBarColor(duration: number, max: number) {
  // Red for lowest, green for highest, yellow in between
  const percent = duration / (max || 1);
  const r = Math.round(255 * (1 - percent));
  const g = Math.round(200 * percent + 55 * (1 - percent));
  return `rgb(${r},${g},80)`;
}

export default function MeditationHistoryGraph() {
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
        [
          Query.equal('userId', [user.$id]),
          Query.limit(100),
        ]
      )
      .then((res) => {
        const userSessions: MeditationSession[] = res.documents
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .map((doc) => ({
            $id: doc.$id,
            userId: doc.userId,
            startTime: doc.startTime,
            duration: doc.duration,
          }));
        setSessions(userSessions);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const maxDuration = Math.max(...sessions.map(s => s.duration), 1);

  // Prepare data for Recharts
  const chartData = sessions.map(s => ({
    id: s.$id,
    date: new Date(s.startTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
    duration: s.duration,
    startTime: s.startTime,
    color: getBarColor(s.duration, maxDuration),
  }));

  return (
    <div className="mt-8 bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center w-full max-w-4xl" style={{ height: 450 }}>
      <h3 className="text-lg font-semibold text-indigo-700 mb-4">Meditation History Histogram</h3>
      {loading ? (
        <div className="text-indigo-400 text-center py-16">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="text-indigo-300 text-center py-16">No meditation sessions yet.</div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis
              dataKey="date"
              minTickGap={10}
              tick={{ fontSize: 13, fill: '#4f46e5' }}
              interval="preserveStartEnd"
            >
              <Label value="Date" offset={-0} position="insideBottom" fontSize={16} fontWeight="bold" fill="#4f46e5" />
            </XAxis>
            <YAxis
              tick={{ fontSize: 13, fill: '#4f46e5' }}
              tickFormatter={formatDuration}
            >
              <Label
                value="Duration"
                angle={-90}
                position="insideLeft"
                fontSize={16}
                fontWeight="bold"
                fill="#4f46e5"
              />
            </YAxis>
            <Tooltip
              contentStyle={{
                background: 'rgba(30,41,59,0.97)',
                border: '2px solid #4f46e5',
                borderRadius: 12,
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
              }}
              formatter={(value: any, name: any, props: any) =>
                [formatDuration(props.payload.duration), 'Duration']
              }
              labelFormatter={(label: any, props: any) =>
                `🧘 ${props && props[0] && props[0].payload
                  ? new Date(props[0].payload.startTime).toLocaleString()
                  : ''}`
              }
            />
            <Bar
              dataKey="duration"
              radius={[6, 6, 0, 0]}
              isAnimationActive={true}
              animationDuration={900}
              stroke="#fff"
              strokeWidth={1}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            <Brush
              dataKey="date"
              height={20}
              stroke="#4f46e5"
              travellerWidth={12}
              fill="#eef2ff"
              tickFormatter={d => d}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
