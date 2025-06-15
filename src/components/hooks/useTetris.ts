'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Tetris game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMPTY_CELL = 0;

// Define tetromino shapes with enhanced colors
const TETROMINOES = [
  // I-piece (cyan)
  {
    shape: [[1, 1, 1, 1]],
    color: 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-inner shadow-cyan-200',
    border: 'border-cyan-700',
  },
  // J-piece (blue)
  {
    shape: [[1, 0, 0], [1, 1, 1]],
    color: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-inner shadow-blue-200',
    border: 'border-blue-700',
  },
  // L-piece (orange)
  {
    shape: [[0, 0, 1], [1, 1, 1]],
    color: 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-inner shadow-orange-200',
    border: 'border-orange-700',
  },
  // O-piece (yellow)
  {
    shape: [[1, 1], [1, 1]],
    color: 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-inner shadow-yellow-100',
    border: 'border-yellow-600',
  },
  // S-piece (green)
  {
    shape: [[0, 1, 1], [1, 1, 0]],
    color: 'bg-gradient-to-br from-green-400 to-green-600 shadow-inner shadow-green-200',
    border: 'border-green-700',
  },
  // T-piece (purple)
  {
    shape: [[0, 1, 0], [1, 1, 1]],
    color: 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-inner shadow-purple-200',
    border: 'border-purple-700',
  },
  // Z-piece (red)
  {
    shape: [[1, 1, 0], [0, 1, 1]],
    color: 'bg-gradient-to-br from-red-400 to-red-600 shadow-inner shadow-red-200',
    border: 'border-red-700',
  },
];

export function createEmptyBoard() {
  return Array.from(Array(BOARD_HEIGHT), () => Array(BOARD_WIDTH).fill(EMPTY_CELL));
}

export function useTetris() {
  // Game state
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  // Animation states
  const [animatingRows, setAnimatingRows] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [scorePopupValue, setScorePopupValue] = useState(0);

  const animationTimeoutRef = useRef(null);
  const scorePopupTimeoutRef = useRef(null);

  // Generate a random tetromino
  const getRandomTetromino = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * TETROMINOES.length);
    return {
      ...TETROMINOES[randomIndex],
      id: Date.now(),
    };
  }, []);

  // Start a new game
  const startGame = useCallback(() => {
    setGameOver(false);
    setBoard(createEmptyBoard());
    setScore(0);
    setLevel(1);
    setLines(0);
    setAnimatingRows([]);
    setIsAnimating(false);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    if (scorePopupTimeoutRef.current) {
      clearTimeout(scorePopupTimeoutRef.current);
    }

    // Generate both current and next piece
    const firstPiece = getRandomTetromino();
    const secondPiece = getRandomTetromino();

    setCurrentPiece(firstPiece);
    setNextPiece(secondPiece);

    const startPos = {
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(firstPiece.shape[0].length / 2),
      y: 0,
    };

    setPosition(startPos);
    setGameStarted(true);
    setIsPaused(false);
  }, [getRandomTetromino]);

  // Check for collisions
  const hasCollision = useCallback((shape, pos) => {
    if (!shape) return true;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const boardX = pos.x + x;
          const boardY = pos.y + y;

          // Check boundaries
          if (
            boardX < 0 ||
            boardX >= BOARD_WIDTH ||
            boardY >= BOARD_HEIGHT ||
            // Check collision with other pieces
            (boardY >= 0 && board[boardY] && board[boardY][boardX] !== EMPTY_CELL)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, [board]);

  // Spawn a new tetromino piece
  const spawnNewPiece = useCallback(() => {
    // Use the next piece as current piece
    const newCurrentPiece = nextPiece || getRandomTetromino();
    // Generate a new next piece
    const newNextPiece = getRandomTetromino();

    const startPos = {
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newCurrentPiece.shape[0].length / 2),
      y: 0,
    };

    setCurrentPiece(newCurrentPiece);
    setNextPiece(newNextPiece);
    setPosition(startPos);

    // Check for game over
    if (hasCollision(newCurrentPiece.shape, startPos)) {
      setGameOver(true);
    }
  }, [nextPiece, getRandomTetromino, hasCollision]);

  // Rotate a tetromino piece
  const rotatePiece = useCallback((piece) => {
    const rotated = [];
    for (let i = 0; i < piece[0].length; i++) {
      const row = [];
      for (let j = piece.length - 1; j >= 0; j--) {
        row.push(piece[j][i]);
      }
      rotated.push(row);
    }
    return rotated;
  }, []);

  // Try to perform a move
  const tryMove = useCallback((dx, dy, rotate = false) => {
    if (!currentPiece || gameOver || isPaused || isAnimating) return false;

    const newPos = { x: position.x + dx, y: position.y + dy };
    let newShape = currentPiece.shape;

    if (rotate) {
      newShape = rotatePiece(currentPiece.shape);
    }

    if (!hasCollision(newShape, newPos)) {
      setPosition(newPos);
      if (rotate) {
        setCurrentPiece({ ...currentPiece, shape: newShape });
      }
      return true;
    }
    return false;
  }, [currentPiece, position, gameOver, isPaused, isAnimating, rotatePiece, hasCollision]);

  // Lock the current piece to the board
  const lockPiece = useCallback(() => {
    if (!currentPiece || isAnimating) return;

    const newBoard = [...board];

    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const boardY = position.y + y;
          if (boardY < 0) {
            setGameOver(true);
            return;
          }
          const boardX = position.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = {
              color: currentPiece.color,
              border: currentPiece.border,
            };
          }
        }
      }
    }

    // Check for completed lines
    const completedRows = [];
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== EMPTY_CELL)) {
        completedRows.push(y);
      }
    }

    setBoard(newBoard);

    // If there are completed lines, start the animation
    if (completedRows.length > 0) {
      // Play sound effect for line clear
      const clearSound = document.getElementById('clear-sound');
      if (clearSound) {
        clearSound.currentTime = 0;
        clearSound.play().catch(e => console.log('Error playing sound:', e));
      }

      setAnimatingRows(completedRows);
      setIsAnimating(true);

      // After animation, remove lines and spawn new piece
      animationTimeoutRef.current = setTimeout(() => {
        clearLines(completedRows, newBoard);
      }, 600); // Animation duration in milliseconds
    } else {
      spawnNewPiece();
    }
  }, [board, currentPiece, position, isAnimating, spawnNewPiece, clearLines]);

  // Clear completed lines with animation
  const clearLines = useCallback((completedRows, currentBoard) => {
    const newBoard = [...currentBoard];

    // Remove completed rows
    for (let i = 0; i < completedRows.length; i++) {
      const rowIndex = completedRows[i] - i; // Adjust index after each removal
      newBoard.splice(rowIndex, 1);
      newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL));
    }

    // Update score
    const linesCleared = completedRows.length;
    if (linesCleared > 0) {
      const linePoints = [0, 40, 100, 300, 1200];
      const pointsEarned = linePoints[linesCleared] * level;
      const newScore = score + pointsEarned;
      const newLines = lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;

      setScore(newScore);
      setLines(newLines);
      setLevel(newLevel);

      // Show score popup
      setScorePopupValue(pointsEarned);
      setShowScorePopup(true);

      scorePopupTimeoutRef.current = setTimeout(() => {
        setShowScorePopup(false);
      }, 1500);
    }

    setBoard(newBoard);
    setAnimatingRows([]);
    setIsAnimating(false);
    spawnNewPiece();
  }, [score, lines, level, spawnNewPiece]);

  // Drop the current piece one row
  const dropPiece = useCallback(() => {
    if (isAnimating) return false;

    if (!tryMove(0, 1)) {
      lockPiece();
      return false;
    }
    return true;
  }, [tryMove, lockPiece, isAnimating]);

  // Hard drop the piece
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    let newY = position.y;

    // Calculate how far down we can go
    while (
      !hasCollision(currentPiece.shape, { x: position.x, y: newY + 1 })
    ) {
      newY++;
    }

    // Create a new board with the piece placed at the final position
    const newBoard = [...board];
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const boardY = newY + y;
          const boardX = position.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }

    // Check for line clears and update state
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== EMPTY_CELL)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL));
        linesCleared++;
        y++; // recheck same line
      }
    }

    // Update score, lines, level
    if (linesCleared > 0) {
      const linePoints = [0, 40, 100, 300, 1200];
      const newScore = score + linePoints[linesCleared] * level;
      const newLines = lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;

      setScore(newScore);
      setLines(newLines);
      setLevel(newLevel);
    }

    // Apply new board and reset piece
    setBoard(newBoard);
    setCurrentPiece(null);
    setPosition({ x: 0, y: 0 });
    spawnNewPiece();
  }, [board, currentPiece, gameOver, isPaused, hasCollision, position, score, lines, level, spawnNewPiece]);

  // Handle keyboard controls
  const handleKeyDown = useCallback((e) => {
    if (!gameStarted || gameOver) return;

    // Prevent default behavior for game controls to avoid scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === 'p' || e.key === 'P') {
      setIsPaused(prev => !prev);
      return;
    }

    if (isPaused || isAnimating) return;

    // Play a soft tick sound for moves
    const moveSound = document.getElementById('move-sound');

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (tryMove(-1, 0) && moveSound) {
          moveSound.currentTime = 0;
          moveSound.volume = 0.3;
          moveSound.play().catch(e => { });
        }
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (tryMove(1, 0) && moveSound) {
          moveSound.currentTime = 0;
          moveSound.volume = 0.3;
          moveSound.play().catch(e => { });
        }
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        dropPiece();
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (tryMove(0, 0, true) && moveSound) {
          moveSound.currentTime = 0;
          moveSound.volume = 0.5;
          moveSound.play().catch(e => { });
        }
        break;
      case ' ':
        hardDrop();
        break;
      default:
        break;
    }
  }, [gameStarted, gameOver, isPaused, isAnimating, tryMove, dropPiece, hardDrop]);

  // Get ghost piece position (preview of where piece will land)
  const getGhostPosition = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return null;

    let ghostY = position.y;

    // Find the lowest possible position
    while (!hasCollision(
      currentPiece.shape,
      { x: position.x, y: ghostY + 1 }
    )) {
      ghostY++;
    }

    return { x: position.x, y: ghostY };
  }, [currentPiece, position, gameOver, isPaused, hasCollision]);

  // Game loop - handle automatic piece falling
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused || isAnimating) return;

    const dropSpeed = 1000 / level;
    const intervalId = setInterval(() => {
      dropPiece();
    }, dropSpeed);

    return () => {
      clearInterval(intervalId);
    };
  }, [gameStarted, gameOver, isPaused, isAnimating, level, dropPiece]);

  // Setup keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Clear animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (scorePopupTimeoutRef.current) {
        clearTimeout(scorePopupTimeoutRef.current);
      }
    };
  }, []);

  // Mobile control handler
  const handleTouchControl = (action) => {
    if (!gameStarted || gameOver || isPaused || isAnimating) return;

    // Play a soft tick sound for moves
    const moveSound = document.getElementById('move-sound');

    switch (action) {
      case 'left':
        if (tryMove(-1, 0) && moveSound) {
          moveSound.currentTime = 0;
          moveSound.volume = 0.3;
          moveSound.play().catch(e => { });
        }
        break;
      case 'right':
        if (tryMove(1, 0) && moveSound) {
          moveSound.currentTime = 0;
          moveSound.volume = 0.3;
          moveSound.play().catch(e => { });
        }
        break;
      case 'down':
        dropPiece();
        break;
      case 'rotate':
        if (tryMove(0, 0, true) && moveSound) {
          moveSound.currentTime = 0;
          moveSound.volume = 0.5;
          moveSound.play().catch(e => { });
        }
        break;
      case 'drop':
        hardDrop();
        break;
      default:
        break;
    }
  };

  return {
    // Game state
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
    // Game actions
    startGame,
    setIsPaused,
    // Helper functions
    getGhostPosition,
    handleTouchControl,
    EMPTY_CELL,
    // Board dimensions
    BOARD_WIDTH,
    BOARD_HEIGHT
  };
}