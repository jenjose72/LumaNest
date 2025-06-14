import React from 'react';
import PauseOverlay from './PauseOverlay';

export default function GameBoard({ 
  board, 
  currentPiece, 
  position, 
  isPaused, 
  isAnimating, 
  gameOver, 
  animatingRows, 
  ghostPosition, 
  showScorePopup, 
  scorePopupValue,
  onResume,
  EMPTY_CELL
}) {
  return (
    <div className="relative">
      {isPaused && (
        <PauseOverlay onResume={onResume} />
      )}
      
      {/* Score popup animation */}
      {showScorePopup && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 animate-score-popup">
          <div className="text-yellow-300 font-extrabold text-4xl whitespace-nowrap">
            +{scorePopupValue}
          </div>
        </div>
      )}
      
      {/* Game board with 3D effect */}
      <div className="bg-indigo-900/90 p-2 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)] border-2 border-indigo-600/70 relative overflow-hidden">
        {/* Board top edge */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-indigo-800 transform -translate-y-2">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500"></div>
        </div>
        
        <div className="bg-gray-900/80 rounded-lg overflow-hidden border border-indigo-600/50">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => {
                // Determine if this cell contains the current piece
                let isFilled = cell !== EMPTY_CELL;
                let color = isFilled ? cell.color : '';
                let border = isFilled ? cell.border : '';
                let isRowAnimating = animatingRows.includes(rowIndex);
                
                // Check if current piece occupies this cell
                if (currentPiece && !gameOver && !isPaused && !isAnimating) {
                  for (let y = 0; y < currentPiece.shape.length; y++) {
                    for (let x = 0; x < currentPiece.shape[y].length; x++) {
                      if (
                        currentPiece.shape[y][x] !== 0 && 
                        position.y + y === rowIndex && 
                        position.x + x === colIndex
                      ) {
                        isFilled = true;
                        color = currentPiece.color;
                        border = currentPiece.border;
                      }
                    }
                  }
                }
                
                // Check if ghost piece occupies this cell
                let isGhost = false;
                
                if (currentPiece && ghostPosition && !isPaused && !isAnimating && !gameOver) {
                  for (let y = 0; y < currentPiece.shape.length; y++) {
                    for (let x = 0; x < currentPiece.shape[y].length; x++) {
                      if (
                        currentPiece.shape[y][x] !== 0 && 
                        ghostPosition.y + y === rowIndex && 
                        ghostPosition.x + x === colIndex && 
                        !isFilled // Don't show ghost where actual piece is
                      ) {
                        isGhost = true;
                      }
                    }
                  }
                }
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 
                      ${isFilled ? `${color} ${border}` : 'bg-gray-900/60'}
                      ${isGhost ? 'border-dashed border-white/30' : 'border border-gray-800'}
                      ${isRowAnimating ? 'animate-flash bg-white' : ''}
                      transition-all duration-100
                    `}
                  ></div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}