'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { databases } from '@/lib/appwrite';

type Emotion =
  | 'sad'
  | 'angry'
  | 'frustrated'
  | 'anxious'
  | 'bored'
  | 'tired'
  | 'lazy'
  | 'calm'
  | 'relaxed'
  | 'hopeful'
  | 'motivated'
  | 'excited'
  | 'happy';

const emotionMap: Record<Emotion, { valence: number; arousal: number }> = {
  sad:         { valence: -5, arousal: -3 },
  angry:       { valence: -5, arousal: 4 },
  frustrated:  { valence: -3, arousal: 3 },
  anxious:     { valence: -4, arousal: 4 },
  bored:       { valence: -2, arousal: -2 },
  tired:       { valence: -2, arousal: -4 },
  lazy:        { valence: -1, arousal: -4 },
  calm:        { valence: 3, arousal: -2 },
  relaxed:     { valence: 4, arousal: -2 },
  hopeful:     { valence: 4, arousal: 2 },
  motivated:   { valence: 4, arousal: 3 },
  excited:     { valence: 5, arousal: 5 },
  happy:       { valence: 5, arousal: 5 },
};

const emotionEmojiMap: Record<Emotion, string> = {
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

const emotionColorMap: Record<Emotion, string> = {
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

const emotionList: Emotion[] = [
  'sad', 'angry', 'frustrated', 'anxious', 'bored', 'tired', 'lazy',
  'calm', 'relaxed', 'hopeful', 'motivated', 'excited', 'happy',
];

interface MoodFormProps {
  onSubmitted: () => void;
}

export default function MoodForm({ onSubmitted }: MoodFormProps) {
  const { user } = useAuth();
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!selectedEmotion || !user) {
      setError('Please select your current mood.');
      return;
    }
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const { valence, arousal } = emotionMap[selectedEmotion];
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MOOD_COLLECTION_ID!,
        'unique()',
        {
          userId: user.$id,
          timeStamp: now,
          emotionLabel: selectedEmotion,
          valence,
          arousal,
        }
      );
      onSubmitted();
    } catch (err) {
      setError('Failed to record mood. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-700 drop-shadow">
          How are you feeling right now?
        </h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-4 gap-6">
          {emotionList.map((emotion) => (
            <button
              type="button"
              key={emotion}
              className={`
                flex flex-col items-center justify-center rounded-full shadow-md
                transition-all duration-300
                border-2
                ${selectedEmotion === emotion
                  ? 'scale-110 border-indigo-600 bg-white'
                  : 'border-transparent bg-indigo-50 hover:bg-indigo-100'}
                focus:outline-none focus:ring-2 focus:ring-indigo-400
              `}
              style={{
                boxShadow:
                  selectedEmotion === emotion
                    ? `0 8px 32px 0 ${emotionColorMap[emotion]}44`
                    : '0 2px 8px 0 #0001',
                borderColor: selectedEmotion === emotion ? emotionColorMap[emotion] : 'transparent',
                background: selectedEmotion === emotion
                  ? `linear-gradient(135deg, ${emotionColorMap[emotion]}22 0%, #fff 100%)`
                  : undefined,
                transition: 'all 0.3s cubic-bezier(.4,2,.3,1)',
                minHeight: 90,
              }}
              onClick={() => setSelectedEmotion(emotion)}
            >
              <span
                className="text-3xl md:text-4xl transition-transform duration-200"
                style={{
                  filter: selectedEmotion === emotion
                    ? 'drop-shadow(0 0 8px #fff) drop-shadow(0 0 16px ' + emotionColorMap[emotion] + ')'
                    : 'none',
                  transform: selectedEmotion === emotion ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.2s',
                }}
              >
                {emotionEmojiMap[emotion]}
              </span>
              <span
                className={`mt-2 text-sm font-semibold transition-colors duration-200 ${
                  selectedEmotion === emotion
                    ? 'text-indigo-700'
                    : 'text-gray-700'
                }`}
              >
                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
              </span>
            </button>
          ))}
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transition-all duration-300"
          >
            {submitting ? 'Saving...' : 'Submit Mood'}
          </button>
        </div>
      </form>
    </div>
  );
}
