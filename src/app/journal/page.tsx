"use client";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";
Chart.register(LineElement, PointElement, LinearScale, CategoryScale);

type Journal = {
  $id: string;
  text: string;
  createdAt: string;
  mood: number;
};

export default function JournalPage() {
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState(3);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "You're a friendly, supportive AI journal companion...",
    },
  ]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [moodSummary, setMoodSummary] = useState<string | null>(null);

  // Fetch previous journals
  useEffect(() => {
    const fetchJournals = async () => {
      const res = await fetch("/api/getJournals");
      const data = await res.json();
      setJournals(data.journals || []);
    };
    fetchJournals();
  }, []);

  // Submit journal and start conversation
  const handleJournalSubmit = async () => {
    const res = await fetch("/api/analyzeJournal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: entry, mood }),
    });
    const data = await res.json();
    setMessages([
      {
        role: "system",
        content: "You're a friendly, supportive AI journal companion...",
      },
      { role: "user", content: entry },
      { role: "assistant", content: data.reply },
    ]);
    setShowChat(true);
    setEntry("");
    setMood(3);

    // Refresh journals
    const res2 = await fetch("/api/getJournals");
    const data2 = await res2.json();
    setJournals(data2.journals || []);
  };
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10); // 'YYYY-MM-DD'
  });

  const moodByDay = last7Days.map((date) => {
    const dayJournals = journals.filter(
      (j) => j.createdAt.slice(0, 10) === date
    );
    if (dayJournals.length === 0) return null;
    return dayJournals.reduce((sum, j) => sum + j.mood, 0) / dayJournals.length;
  });
  const data = {
    labels: last7Days,
    datasets: [
      {
        label: "Mood",
        data: moodByDay,
        fill: false,
        borderColor: "#2563eb",
        tension: 0.3,
      },
    ],
  };
  const handleSeeDetails = async () => {
    const last7Journals = journals.filter((j) =>
      last7Days.includes(j.createdAt.slice(0, 10))
    );
    const res = await fetch("/api/moodSummary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ journals: last7Journals }),
    });
    const data = await res.json();
    setMoodSummary(data.summary);
  };

  // Continue conversation (not stored)
  const handleSend = async () => {
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);

    const res = await fetch("/api/analyzeJournal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();
    setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    setInput("");
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Welcome to WellNest! 🌱</h1>
      <p className="mb-6 text-gray-600">
        How are you feeling today? Add your journal entry below.
      </p>

      {!showChat && (
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
            onClick={handleJournalSubmit}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Analyze & Chat
          </button>
        </div>
      )}

      {showChat && (
        <div className="mb-6 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Your Conversation</h2>
          <div className="conversation mb-4 max-h-64 overflow-y-auto">
            {messages
              .filter((m) => m.role !== "system")
              .map((m, idx) => (
                <div
                  key={idx}
                  className={m.role === "user" ? "text-right" : "text-left"}
                >
                  <span
                    className={
                      m.role === "user" ? "bg-blue-100" : "bg-green-100"
                    }
                  >
                    <b>{m.role === "user" ? "You" : "AI"}:</b> {m.content}
                  </span>
                </div>
              ))}
          </div>
          <input
            className="w-full p-2 border border-gray-300 rounded mb-2"
            placeholder="Type your reply..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleSend}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Send
          </button>
          <button
            onClick={() => setShowChat(false)}
            className="mt-2 ml-2 px-4 py-2 bg-gray-400 text-white rounded"
          >
            New Journal
          </button>
        </div>
      )}
      <div className="mb-6 bg-white p-4 rounded shadow w-4xl">
        <h2 className="text-lg font-semibold mb-2">Weekly Mood Analysis</h2>
        <Line data={data} />
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleSeeDetails}
        >
          See Details
        </button>
        {moodSummary && (
          <div className="mt-4 p-4 bg-blue-50 rounded shadow">
            <strong>Weekly Mood Summary:</strong>
            <p>{moodSummary}</p>
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
