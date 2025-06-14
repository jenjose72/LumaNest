import React from 'react';

export default function NextPiecePreview({ nextPiece }) {
  if (!nextPiece) return null;
  
  // Create a small board just for the next piece
  const previewSize = {
    width: Math.max(...nextPiece.shape.map(row => row.length)),
    height: nextPiece.shape.length
  };
  
  // Center the piece if it's smaller than the preview area
  const previewBoard = Array(4).fill().map(() => Array(4).fill(false));
  
  // Calculate offset to center the piece in the preview
  const offsetX = Math.floor((4 - previewSize.width) / 2);
  const offsetY = Math.floor((4 - previewSize.height) / 2);
  
  return (
    <div className="bg-indigo-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-500/50 p-2">
      <h3 className="text-blue-300 text-xs uppercase tracking-wider font-semibold mb-1">Next Piece</h3>
      <div className="bg-indigo-700/50 p-2 rounded">
        <div className="w-full flex items-center justify-center">
          <div className="grid grid-cols-4 gap-px">
            {previewBoard.map((row, rowIndex) => (
              <React.Fragment key={`preview-row-${rowIndex}`}>
                {row.map((_, colIndex) => {
                  // Check if this cell is part of the next piece
                  let isFilled = false;
                  let color = '';
                  let border = '';
                  
                  const pieceY = rowIndex - offsetY;
                  const pieceX = colIndex - offsetX;
                  
                  if (
                    pieceY >= 0 && 
                    pieceY < nextPiece.shape.length && 
                    pieceX >= 0 && 
                    pieceX < nextPiece.shape[pieceY].length &&
                    nextPiece.shape[pieceY][pieceX] !== 0
                  ) {
                    isFilled = true;
                    color = nextPiece.color;
                    border = nextPiece.border;
                  }
                  
                  return (
                    <div
                      key={`preview-${rowIndex}-${colIndex}`}
                      className={`
                        w-4 h-4 
                        ${isFilled ? `${color} ${border}` : 'bg-indigo-800/60'} 
                        border border-indigo-700
                      `}
                    ></div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}