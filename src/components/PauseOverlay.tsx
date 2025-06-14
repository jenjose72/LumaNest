export default function PauseOverlay({ onResume }) {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-xl animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-3">Game Paused</h2>
      <button 
        className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg shadow-lg transition-colors text-sm"
        onClick={onResume}
      >
        Resume Game
      </button>
    </div>
  );
}