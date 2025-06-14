export default function ControlsHelp() {
  return (
    <div className="bg-indigo-700/50 rounded-lg p-2 mb-3 text-xs">
      <h3 className="text-blue-200 font-semibold mb-1">Controls</h3>
      <div className="grid grid-cols-2 gap-1">
        <div className="flex items-center gap-1 text-blue-100">
          <span className="bg-indigo-600 px-1 rounded text-xs">←/A</span>
          <span>Left</span>
        </div>
        <div className="flex items-center gap-1 text-blue-100">
          <span className="bg-indigo-600 px-1 rounded text-xs">→/D</span>
          <span>Right</span>
        </div>
        <div className="flex items-center gap-1 text-blue-100">
          <span className="bg-indigo-600 px-1 rounded text-xs">↑/W</span>
          <span>Rotate</span>
        </div>
        <div className="flex items-center gap-1 text-blue-100">
          <span className="bg-indigo-600 px-1 rounded text-xs">↓/S</span>
          <span>Down</span>
        </div>
        <div className="flex items-center gap-1 text-blue-100 col-span-2">
          <span className="bg-indigo-600 px-1 rounded text-xs">Space</span>
          <span>Hard drop</span>
        </div>
      </div>
    </div>
  );
}