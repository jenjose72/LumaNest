"use client";
import { useState, useEffect } from "react";

type Journal = {
  $id: string;
  text: string;
  createdAt: string;
  mood: number;
};

export default function JournalPage() {
  const [entry, setEntry] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [mood, setMood] = useState(3); // Mood scale 1-5
  const [journals, setJournals] = useState<Journal[]>([]);

  // Fetch previous journals
  useEffect(() => {
    const fetchJournals = async () => {
      const res = await fetch("/api/getJournals");
      const data = await res.json();
      setJournals(data.journals || []);
    };
    fetchJournals();
  }, []);

  const handleSubmit = async () => {
    const res = await fetch("/api/analyzeJournal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: entry, mood }),
    });

    const data = await res.json();
    setAnalysis(data.reply);

    // Refresh journals after adding
    const res2 = await fetch("/api/getJournals");
    const data2 = await res2.json();
    setJournals(data2.journals || []);
    setEntry("");
    setMood(3);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Welcome to WellNest! 🌱</h1>
      <p className="mb-6 text-gray-600">
        How are you feeling today? Add your journal entry below.
      </p>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Add Todays Journal</h2>
        <textarea
          className="w-full p-2 border border-gray-300 rounded mb-2"
          placeholder="Write your journal entry..."
          rows={5}
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
        />
        <div className="mb-2">
          <label className="block mb-1 font-medium">Mood Level: {mood}</label>
          <input
            type="range"
            min={1}
            max={5}
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>😞</span>
            <span>😐</span>
            <span>😊</span>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Analyze Mood
        </button>
        {analysis && (
          <div className="mt-4 p-4 rounded shadow bg-blue-50">
            <strong>AI Mood Analysis:</strong>
            <p>{analysis}</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Previous Journals</h2>
        {journals.length === 0 && (
          <p className="text-gray-500">No previous journals yet.</p>
        )}
        <ul>
          {journals.map((j) => (
            <li key={j.$id} className="mb-4 p-3 bg-gray-50 rounded shadow">
              <div className="text-xs text-gray-400 mb-1">
                {new Date(j.createdAt).toLocaleString()} | Mood: {j.mood}
              </div>
              <div className="whitespace-pre-line">{j.text}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
