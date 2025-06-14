'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTetris } from '../../../components/hooks/useTetris';
import BackgroundParticles from '../../../components/BackgroundParticles';
import WelcomeScreen from '../../../components/WelcomeScreen';
import GameOverModal from '../../../components/GameOverModal';
import ScoreDisplay from '../../../components/ScoreDisplay';
import ControlsHelp from '../../../components/ControlsHelp';
import NextPiecePreview from '../../../components/NextPiecePreview';
import TetrisControls from '../../../components/TetrisControls';
import GameBoard from '../../../components/GameBoard';
import ScaledGameContainer from '../../../components/ScaledGameContainer.tsx';

export default function TetrisPage() {
  const {
    board,
    currentPiece,
    nextPiece,
    position,
    gameOver,
    score,
    level,
    lines,
    isPaused,
    gameStarted,
    animatingRows,
    isAnimating,
    showScorePopup,
    scorePopupValue,
    startGame,
    setIsPaused,
    getGhostPosition,
    handleTouchControl,
    EMPTY_CELL
  } = useTetris();

  // Get ghost position for rendering
  const ghostPosition = getGhostPosition();
  
  // Force the body to have fixed height
  useEffect(() => {
    document.body.style.height = '100vh';
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.height = '';
      document.body.style.overflow = '';
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-between h-screen max-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 overflow-hidden">
      {/* Animated background */}
      <BackgroundParticles />
      
      {/* Game content */}
      <div className="relative z-10 w-full max-w-6xl px-4 flex flex-col items-center justify-between h-full">
        {/* Header */}
        <div className="text-center py-2 game-header">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-blue-300 game-title">
            TETRIS
          </h1>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 w-full flex items-center justify-center overflow-visible">
          {!gameStarted && !gameOver && (
            <WelcomeScreen onStartGame={startGame} />
          )}
          
          {gameOver && (
            <GameOverModal score={score} onRestart={startGame} />
          )}
          
          {/* Active game */}
          {gameStarted && (
            <ScaledGameContainer>
              {/* Game stats column */}
              <div className="w-full md:w-auto order-2 lg:order-1">
                <div className="bg-indigo-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-500/50 p-3 mb-2">
                  <ScoreDisplay score={score} level={level} lines={lines} />
                  <ControlsHelp />
                  
                  <div className="flex flex-col gap-1">
                    <button 
                      className={`${isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold px-3 py-1 rounded-lg shadow transition-colors text-sm`}
                      onClick={() => setIsPaused(!isPaused)}
                      disabled={isAnimating}
                    >
                      {isPaused ? 'Resume Game' : 'Pause Game'}
                    </button>
                    
                    <Link 
                      href="/"
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1 rounded-lg shadow text-center transition-colors text-sm"
                    >
                      Back to Home
                    </Link>
                  </div>
                </div>
                
                {/* Next piece preview */}
                <NextPiecePreview nextPiece={nextPiece} />
              </div>
              
              {/* Game board */}
              <div className="order-1 lg:order-2">
                <GameBoard 
                  board={board}
                  currentPiece={currentPiece}
                  position={position}
                  isPaused={isPaused}
                  isAnimating={isAnimating}
                  gameOver={gameOver}
                  animatingRows={animatingRows}
                  ghostPosition={ghostPosition}
                  showScorePopup={showScorePopup}
                  scorePopupValue={scorePopupValue}
                  onResume={() => setIsPaused(false)}
                  EMPTY_CELL={EMPTY_CELL}
                />
                
                {/* Mobile controls */}
                <TetrisControls 
                  onControl={handleTouchControl}
                  isPaused={isPaused}
                  isAnimating={isAnimating}
                  gameOver={gameOver}
                />
              </div>
            </ScaledGameContainer>
          )}
        </div>
        
        {/* Footer */}
        <div className="w-full py-1 text-center text-blue-200/50 text-xs game-footer">
          <p>Made with ♥ for Lumanest Hackathon</p>
        </div>
      </div>
      
      {/* Sound effect elements */}
      <audio id="move-sound" src="/sounds/tick.mp3" preload="auto"></audio>
      <audio id="drop-sound" src="/sounds/whoosh.mp3" preload="auto"></audio>
      <audio id="clear-sound" src="/sounds/clear.mp3" preload="auto"></audio>
      
      {/* Custom animation styles */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(100px, 50px) rotate(180deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }
        
        @keyframes flash {
          0%, 50%, 100% { opacity: 1; background-color: white; }
          25%, 75% { opacity: 0.5; background-color: #60a5fa; }
        }
        
        .animate-flash {
          animation: flash 0.6s linear;
        }
        
        @keyframes score-popup {
          0% { opacity: 0; transform: translate(-50%, 0); }
          20% { opacity: 1; transform: translate(-50%, -100%); }
          80% { opacity: 1; transform: translate(-50%, -120%); }
          100% { opacity: 0; transform: translate(-50%, -150%); }
        }
        
        .animate-score-popup {
          animation: score-popup 1.5s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @media (max-height: 600px) {
          .game-header {
            padding: 0;
          }
          .game-title {
            font-size: 1.5rem;
          }
          .game-footer {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}