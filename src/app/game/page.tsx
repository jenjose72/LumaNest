"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Client, Account } from "appwrite";

// Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('684aa8f1001ab90bbfd9');

const account = new Account(client);

const games = [
  {
    id: "tetris",
    name: "Tetris",
    description: "The classic block-stacking puzzle game. Arrange falling pieces to create complete lines.",
    image: "/images/games/tetris.png", // Add these images to your public folder
    color: "from-indigo-500 to-purple-600",
    path: "/games/tetris",
    tags: ["Puzzle", "Classic"],
    difficulty: "Medium"
  },
  {
    id: "snake",
    name: "Snake",
    description: "Control a growing snake to collect food without hitting walls or yourself.",
    image: "/images/games/snake.png",
    color: "from-green-500 to-emerald-700",
    path: "/games/snake",
    tags: ["Arcade", "Classic"],
    difficulty: "Easy"
  },
  {
    id: "2048",
    name: "2048",
    description: "Merge tiles with the same numbers to reach 2048 and beyond in this addictive puzzle.",
    image: "/images/games/2048.png",
    color: "from-yellow-400 to-orange-600",
    path: "/games/2048",
    tags: ["Puzzle", "Strategy"],
    difficulty: "Medium"
  },
  {
    id: "memory",
    name: "Memory Match",
    description: "Test your memory by matching pairs of cards in this concentration game.",
    image: "/images/games/memory.png",
    color: "from-pink-500 to-rose-600",
    path: "/games/memory",
    tags: ["Memory", "Casual"],
    difficulty: "Easy"
  },
  {
    id: "sudoku",
    name: "Sudoku",
    description: "Fill the 9×9 grid with numbers so each column, row, and 3×3 box contains all digits from 1-9.",
    image: "/images/games/sudoku.png",
    color: "from-blue-500 to-cyan-600",
    path: "/games/sudoku",
    tags: ["Puzzle", "Numbers"],
    difficulty: "Hard"
  },
  {
    id: "wordle",
    name: "Word Puzzle",
    description: "Guess the hidden word in six attempts with color-coded feedback on your guesses.",
    image: "/images/games/wordle.png",
    color: "from-teal-500 to-green-600",
    path: "/games/wordle",
    tags: ["Word", "Puzzle"],
    difficulty: "Medium"
  }
];

export default function GamesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (error) {
        console.log("User not logged in");
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);
  
  const handlePlayGame = (path) => {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      router.push(path);
    }
  };
  
  // Filter games by tag or search query
  const filteredGames = games.filter(game => {
    const matchesFilter = filter === "all" || game.tags.includes(filter);
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  // Get unique tags for filter
  const allTags = ["all", ...new Set(games.flatMap(game => game.tags))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-900">
      {/* Back to Home button */}
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-800/70 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg border border-indigo-600/30 backdrop-blur-sm"
        >
          <span>←</span>
          <span>Back to Home</span>
        </button>
      </div>

      {/* Header with particles effect */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div id="stars" className="fixed inset-0"></div>
          <div id="stars2" className="fixed inset-0"></div>
          <div id="stars3" className="fixed inset-0"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 mb-4">
            Game Center
          </h1>
          <p className="text-lg md:text-xl text-indigo-200 max-w-3xl mx-auto">
            Take a break and boost your mental health with our collection of relaxing and entertaining games.
          </p>
        </div>
      </div>
      
      {/* Game filters and search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex overflow-x-auto pb-2 mb-4 md:mb-0 gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  filter === tag 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-indigo-900/50 text-indigo-200 hover:bg-indigo-800'
                }`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-indigo-900/50 border border-indigo-700 rounded-lg text-indigo-100 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute right-3 top-2.5 text-indigo-400">🔍</span>
          </div>
        </div>
        
        {/* Game grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGames.map((game) => (
            <div 
              key={game.id}
              className="bg-gray-900/80 backdrop-blur-lg rounded-xl overflow-hidden shadow-lg border border-indigo-500/30 transform transition-transform hover:scale-105"
            >
              <div className={`h-48 bg-gradient-to-r ${game.color} flex items-center justify-center relative overflow-hidden`}>
                {game.image ? (
                  <img 
                    src={game.image} 
                    alt={game.name} 
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <span className="text-6xl">🎮</span>
                )}
                <div className="absolute top-3 right-3 flex space-x-1">
                  {game.tags.map(tag => (
                    <span 
                      key={`${game.id}-${tag}`} 
                      className="text-xs bg-black/50 text-white px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{game.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    game.difficulty === 'Easy' ? 'bg-green-900/50 text-green-300' :
                    game.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' :
                    'bg-red-900/50 text-red-300'
                  }`}>
                    {game.difficulty}
                  </span>
                </div>
                
                <p className="text-indigo-200 text-sm mb-6 line-clamp-2">
                  {game.description}
                </p>
                
                <button
                  onClick={() => handlePlayGame(game.path)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2 rounded-lg shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Play Now</span>
                  <span>▶️</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredGames.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl text-indigo-300 mb-2">No games found</h3>
            <p className="text-indigo-200/70">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
      
      {/* Benefits section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300 mb-12 text-center">
          Gaming Benefits for Mental Health
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-indigo-900/40 backdrop-blur-sm p-6 rounded-xl border border-indigo-800/50">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Cognitive Skills</h3>
            <p className="text-indigo-200">
              Games help improve memory, attention to detail, and problem-solving abilities.
            </p>
          </div>
          
          <div className="bg-indigo-900/40 backdrop-blur-sm p-6 rounded-xl border border-indigo-800/50">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">😌</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Stress Reduction</h3>
            <p className="text-indigo-200">
              Playing games can help reduce stress and anxiety by providing a healthy distraction.
            </p>
          </div>
          
          <div className="bg-indigo-900/40 backdrop-blur-sm p-6 rounded-xl border border-indigo-800/50">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Focus & Mindfulness</h3>
            <p className="text-indigo-200">
              Games promote focused attention, helping practice mindfulness and present-moment awareness.
            </p>
          </div>
        </div>
      </div>
      
     
      
      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-indigo-500/50 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Login Required</h3>
            <p className="text-indigo-200 mb-6">
              Please login to play games and track your progress.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/auth/login")}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
              >
                Login
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Animated stars - Add CSS */}
      <style jsx>{`
        #stars {
          width: 1px;
          height: 1px;
          background: transparent;
          box-shadow: 1907px 1575px #FFF, 893px 268px #FFF, 1819px 910px #FFF, 1785px 1197px #FFF, 1037px 1108px #FFF, 1228px 925px #FFF, 1092px 56px #FFF, 1452px 249px #FFF, 1771px 549px #FFF;
          animation: animStar 50s linear infinite;
        }
        
        #stars2 {
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow: 1325px 312px #FFF, 1937px 1793px #FFF, 1718px 33px #FFF, 964px 538px #FFF, 1366px 141px #FFF, 1257px 858px #FFF, 610px 1776px #FFF, 1728px 20px #FFF;
          animation: animStar 100s linear infinite;
        }
        
        #stars3 {
          width: 3px;
          height: 3px;
          background: transparent;
          box-shadow: 387px 1052px #FFF, 1949px 1996px #FFF, 496px 1323px #FFF, 1943px 1264px #FFF, 1602px 113px #FFF, 1313px 1310px #FFF, 881px 721px #FFF;
          animation: animStar 150s linear infinite;
        }
        
        @keyframes animStar {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }
      `}</style>
    </div>
  );
}