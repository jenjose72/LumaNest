"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Journal = {
  $id: string;
  text: string;
  createdAt: string;
  mood: number;
};

type Message = {
  role: string;
  content: string;
};

export default function JournalPage() {
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState(3);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "You're a friendly, supportive AI journal companion...",
    },
  ]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [moodSummary, setMoodSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Instead of trying to fetch journals which might fail,
  // we'll use a local state to track journals for this session
  const [sessionJournals, setSessionJournals] = useState<{
    text: string;
    mood: number;
    createdAt: string;
  }[]>([]);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Try to fetch journals, but don't break if it fails
  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const res = await fetch("/api/getJournals");
        if (res.ok) {
          const data = await res.json();
          setJournals(data.journals || []);
        }
      } catch (error) {
        console.error("Error fetching journals:", error);
        // Just use session journals instead
      }
    };
    fetchJournals();
  }, []);

  // Submit journal and start conversation
  const handleJournalSubmit = async () => {

    if (!entry.trim()) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      // Store journal entry in session state
      const newJournal = {
        text: entry,
        mood: mood,
        createdAt: new Date().toISOString()
      };
      setSessionJournals([...sessionJournals, newJournal]);
      
      // Get AI response
      const res = await fetch("/api/analyzeJournal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: entry, mood }),
      });
      
      if (!res.ok) {
        throw new Error(`Error: ${res.status}. Please try again.`);
      }
      
      const data = await res.json();
      
      // Make sure data.reply exists before using it
      const aiResponse = data.reply || "I'm here to help with your journal entries.";
      
      setMessages([
        {
          role: "system",
          content: "You're a friendly, supportive AI journal companion...",
        },
        { role: "user", content: entry },
        { role: "assistant", content: aiResponse },
      ]);
      
      setShowChat(true);
      setEntry("");
      setMood(3);
    } catch (error: any) {
      console.error("Error submitting journal:", error);
      setError(error.message || "Failed to submit journal entry");
    } finally {
      setIsLoading(false);
    }
  };

  // Continue conversation (not stored)
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput("");
    setIsLoading(true);
    
    // Immediately add user message to chat
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/analyzeJournal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      
      if (!res.ok) {
        throw new Error(`Error: ${res.status}. Please try again.`);
      }
      
      const data = await res.json();
      
      // Make sure data.reply exists before using it
      const aiResponse = data.reply || "I'm not sure how to respond to that.";
      setMessages([...newMessages, { role: "assistant", content: aiResponse }]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError(error.message || "Failed to get AI response");
    } finally {
      setIsLoading(false);
    }

  };

  // Combine database journals with session journals for the chart
  const allJournals = [...journals, ...sessionJournals.map((j, idx) => ({
    $id: `session-${idx}`,
    ...j
  }))];

  // Create mood chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10); // 'YYYY-MM-DD'
  });

  const moodByDay = last7Days.map((date) => {
    // Filter entries by date
    const dayJournals = allJournals.filter(journal => {
      const journalDate = journal.createdAt ? journal.createdAt.slice(0, 10) : "";
      return journalDate === date;
    });
    
    if (dayJournals.length === 0) return null;
    return dayJournals.reduce((sum, j) => sum + j.mood, 0) / dayJournals.length;
  });

  const chartData = {
    labels: last7Days.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Mood Level',
        data: moodByDay,
        fill: false,
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: 'rgba(37, 99, 235, 1)',
        tension: 0.4,
        pointBorderColor: 'rgba(37, 99, 235, 1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgba(37, 99, 235, 1)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 1,
        max: 5,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          stepSize: 1,
          callback: function(value: number) {
            return ['', '😞', '😔', '😐', '🙂', '😊'][value] || value;
          }
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // Generate mood summary
  const handleSeeDetails = async () => {
    setIsChartLoading(true);
    setError("");
    
    try {
      // Generate a simple summary if no journals are available
      if (allJournals.length === 0) {
        setMoodSummary("Start journaling to see your mood patterns and receive personalized insights!");
        setIsChartLoading(false);
        return;
      }
      
      // Use the session journals if API fails
      const journalsForSummary = allJournals.filter(journal => {
        const journalDate = journal.createdAt ? journal.createdAt.slice(0, 10) : "";
        return last7Days.includes(journalDate);
      });
      
      try {
        const res = await fetch("/api/moodSummary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ journals: journalsForSummary }),
        });
        
        if (!res.ok) {
          throw new Error(`API error ${res.status}`);
        }
        
        const data = await res.json();
        setMoodSummary(data.summary || "Unable to generate mood summary.");
      } catch (error) {
        // Generate a fallback summary
        let avgMood = journalsForSummary.reduce((sum, j) => sum + j.mood, 0) / journalsForSummary.length;
        
        if (avgMood > 3.5) {
          setMoodSummary("Your mood has been generally positive this week! Keep up the good habits that are supporting your well-being.");
        } else if (avgMood < 2.5) {
          setMoodSummary("It looks like you've faced some challenges this week. Remember to be kind to yourself and practice self-care when you need it most.");
        } else {
          setMoodSummary("Your mood has been fairly balanced this week. Notice what activities and thoughts influence how you feel each day.");
        }
      }
    } catch (error: any) {
      console.error("Error getting mood summary:", error);
      setError(error.message || "Failed to generate mood summary");
    } finally {
      setIsChartLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex-1 px-4 py-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-blue-700">Journal & Mood Tracker</h1>
            <p className="mt-2 text-gray-600">Record your thoughts and track your emotional wellbeing</p>
          </div>
          
          {/* Journal Entry Form or Chat */}
          <div className="mb-6 overflow-hidden bg-white border border-blue-100 shadow-lg rounded-xl">
            {!showChat ? (
              <div className="p-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">How are you feeling today?</h2>
                <textarea
                  className="w-full p-4 transition-all border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write your journal entry... What's on your mind today?"
                  rows={6}
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                />
                <div className="mt-4">
                  <label className="block mb-2 font-medium text-gray-700">Mood Level:</label>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">😞</span>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={mood}
                      onChange={(e) => setMood(Number(e.target.value))}
                      className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-2xl">😊</span>
                    <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">Level {mood}</span>
                  </div>
                </div>
                
                {error && (
                  <div className="p-3 mt-4 text-red-700 border-l-4 border-red-500 bg-red-50">
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                
                <div className="mt-6">
                  <button
                    onClick={handleJournalSubmit}
                    disabled={isLoading || !entry.trim()}
                    className="flex items-center px-6 py-3 text-white transition-all bg-blue-600 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Save & Chat with AI"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-[500px]">
                {/* Chat Header */}
                <div className="flex items-center justify-between px-6 py-4 text-white bg-blue-600">
                  <h3 className="font-medium">AI Wellness Assistant</h3>
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-blue-100 transition-colors hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                
                {/* Chat Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 p-6 space-y-4 overflow-y-auto"
                >
                  {messages
                    .filter((m) => m.role !== "system")
                    .map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`${msg.role === "user" ? "flex justify-end" : "flex justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-blue-50 text-blue-900 rounded-bl-none"
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="px-4 py-3 shadow-sm bg-blue-50 rounded-2xl">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Chat Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
                      disabled={isLoading || !input.trim()}
                    >
                      {isLoading ? (
                        <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
          
          {/* Mood Analysis & Chart */}
          <div className="p-6 mb-6 overflow-hidden bg-white border border-blue-100 shadow-lg rounded-xl">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Weekly Mood Analysis</h2>
            
            <div className="h-64 mb-6">
              {sessionJournals.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No journal entries yet to display mood trends.</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <button
                className="flex items-center px-6 py-3 text-white transition-all bg-blue-600 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSeeDetails}
                disabled={isChartLoading}
              >
                {isChartLoading ? (
                  <>
                    <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  "Generate Mood Summary"
                )}
              </button>
            </div>
            
            {moodSummary && (
              <div className="p-5 mt-6 border border-blue-100 rounded-lg bg-blue-50">
                <h3 className="mb-2 text-lg font-medium text-blue-800">Your Weekly Mood Summary</h3>
                <p className="text-blue-900">{moodSummary}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
