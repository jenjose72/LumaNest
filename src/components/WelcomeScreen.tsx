export default function WelcomeScreen({ onStartGame }) {
  return (
    <div className="text-center my-4 p-6 bg-indigo-900/70 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-500/50 max-w-md w-full animate-fade-in">
      <h2 className="text-2xl font-bold text-blue-100 mb-3">Welcome to Tetris!</h2>
      <p className="text-blue-200 mb-5 text-sm">
        The classic block-stacking game. Arrange the falling pieces to create complete rows and score points.
      </p>
      <button 
        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        onClick={onStartGame}
      >
        Start Game
      </button>
    </div>
  );
}