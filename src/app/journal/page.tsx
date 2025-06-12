"use client";
import { useState } from "react";

export default function JournalPage() {
  const [entry, setEntry] = useState("");
  const [analysis, setAnalysis] = useState("");

  const handleSubmit = async () => {
    const res = await fetch("/api/analyzeJournal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: entry }),
    });

    const data = await res.json();
    setAnalysis(data.reply);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <textarea
        className="w-full p-2 border border-gray-300 rounded"
        placeholder="Write your journal entry..."
        rows={5}
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Analyze Mood
      </button>

      {analysis && (
        <div className="mt-4 p-4 rounded shadow">
          <strong>AI Mood Analysis:</strong>
          <p>{analysis}</p>
        </div>
      )}
    </div>
  );
}
