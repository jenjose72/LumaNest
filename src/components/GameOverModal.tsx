export default function GameOverModal({ score, onRestart }) {
  return (
    <div className="text-center my-4 p-6 bg-red-900/80 backdrop-blur-sm rounded-xl shadow-lg border border-red-500/50 max-w-md w-full animate-pulse">
      <h2 className="text-2xl font-bold text-red-100 mb-3">Game Over</h2>
      <div className="mb-5">
        <p className="text-lg text-red-200 mb-1">Your Score</p>
        <p className="text-4xl font-bold text-white">{score}</p>
      </div>
      <button 
        className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        onClick={onRestart}
      >
        Play Again
      </button>
    </div>
  );
}