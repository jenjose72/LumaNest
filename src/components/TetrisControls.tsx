export default function TetrisControls({ onControl, isPaused, isAnimating, gameOver }) {
  return (
    <div className="grid grid-cols-3 gap-1 mt-2">
      <button 
        className="bg-indigo-700/80 hover:bg-indigo-600/80 active:bg-indigo-800 p-2 rounded-lg text-white text-sm shadow-md disabled:opacity-50 transition-all"
        onClick={() => onControl('left')}
        disabled={isPaused || isAnimating || gameOver}
      >
        ←
      </button>
      <button 
        className="bg-indigo-700/80 hover:bg-indigo-600/80 active:bg-indigo-800 p-2 rounded-lg text-white text-sm shadow-md disabled:opacity-50 transition-all"
        onClick={() => onControl('down')}
        disabled={isPaused || isAnimating || gameOver}
      >
        ↓
      </button>
      <button 
        className="bg-indigo-700/80 hover:bg-indigo-600/80 active:bg-indigo-800 p-2 rounded-lg text-white text-sm shadow-md disabled:opacity-50 transition-all"
        onClick={() => onControl('right')}
        disabled={isPaused || isAnimating || gameOver}
      >
        →
      </button>
      <button 
        className="bg-indigo-700/80 hover:bg-indigo-600/80 active:bg-indigo-800 p-2 rounded-lg text-white text-sm shadow-md disabled:opacity-50 transition-all"
        onClick={() => onControl('rotate')}
        disabled={isPaused || isAnimating || gameOver}
      >
        ↻
      </button>
      <button 
        className="bg-pink-600/80 hover:bg-pink-500/80 active:bg-pink-700 p-2 rounded-lg text-white text-sm shadow-md col-span-2 disabled:opacity-50 transition-all"
        onClick={() => onControl('drop')}
        disabled={isPaused || isAnimating || gameOver}
      >
        ⤓
      </button>
    </div>
  );
}