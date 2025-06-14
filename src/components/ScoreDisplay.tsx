export default function ScoreDisplay({ score, level, lines }) {
  return (
    <div className="grid grid-cols-3 gap-1 mb-2">
      <div className="bg-indigo-700/80 rounded-lg p-2 text-center">
        <h3 className="text-blue-300 text-xs uppercase tracking-wider font-semibold">Score</h3>
        <p className="text-lg sm:text-xl font-extrabold text-white">{score}</p>
      </div>
      <div className="bg-indigo-700/80 rounded-lg p-2 text-center">
        <h3 className="text-blue-300 text-xs uppercase tracking-wider font-semibold">Level</h3>
        <p className="text-lg sm:text-xl font-extrabold text-white">{level}</p>
      </div>
      <div className="bg-indigo-700/80 rounded-lg p-2 text-center">
        <h3 className="text-blue-300 text-xs uppercase tracking-wider font-semibold">Lines</h3>
        <p className="text-lg sm:text-xl font-extrabold text-white">{lines}</p>
      </div>
    </div>
  );
}