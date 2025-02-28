'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;
const INITIAL_SPEED = 1000;

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]], // Z
];

const COLORS = [
  '#FF0D72', '#0DC2FF', '#0DFF72',
  '#F538FF', '#FF8E0D', '#FFE138',
  '#3877FF',
];

const DIFFICULTY_LEVELS = [
  { name: '简单', speed: 1500 },
  { name: '普通', speed: 1000 },
  { name: '困难', speed: 500 },
  { name: '专家', speed: 200 }
];

export default function TetrisGame() {
  const canvasRef = useRef(null);
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const [gameSpeed, setGameSpeed] = useState(1000);
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS[1]);
  const [linesCleared, setLinesCleared] = useState(0);
  const [nextPiece, setNextPiece] = useState(null);
  const [holdPiece, setHoldPiece] = useState(null);
  const [canHold, setCanHold] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [gridColor, setGridColor] = useState('rgba(0,0,0,0.2)');
  const [lineType, setLineType] = useState('solid');

  const createNewPiece = useCallback(() => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
      shape,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2),
      y: 0,
    };
  }, []);

  const mergePieceToBoard = useCallback((board, piece) => {
    const newBoard = board.map(row => [...row]);
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = y + piece.y;
          const boardX = x + piece.x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && 
              boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      });
    });
    return newBoard;
  }, []);

  const checkCollision = useCallback((board, piece, moveX = 0, moveY = 0) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + moveX;
          const newY = piece.y + y + moveY;
          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const checkLines = useCallback((board) => {
    let lines = 0;
    const newBoard = board.filter(row => {
      const isFull = row.every(cell => cell);
      if (isFull) lines++;
      return !isFull;
    });
    if (lines > 0) playSound('clear');
    setLinesCleared(prev => prev + lines);
    return {
      board: [...Array(lines)].map(() => Array(BOARD_WIDTH).fill('')).concat(newBoard),
      lines,
    };
  }, []);

  const startGame = () => {
    if (gameOver) resetGame();
    setIsPlaying(true);
    setGameOver(false);
  };

  const pauseGame = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const gameLoop = useCallback(() => {
    if (!isPlaying || gameOver) return;

    setBoard(prevBoard => {
      if (!currentPiece) {
        const newPiece = createNewPiece();
        if (checkCollision(prevBoard, newPiece)) {
          setGameOver(true);
          setIsPlaying(false);
          return prevBoard;
        }
        setCurrentPiece(newPiece);
        return prevBoard;
      }

      if (checkCollision(prevBoard, currentPiece, 0, 1)) {
        const mergedBoard = mergePieceToBoard(prevBoard, currentPiece);
        const { board: clearedBoard, lines } = checkLines(mergedBoard);
        setScore(s => s + lines * 100);
        setCurrentPiece(null);
        setCanHold(true);
        return clearedBoard;
      } else {
        setCurrentPiece(p => ({ ...p, y: p.y + 1 }));
        return prevBoard;
      }
    });
  }, [isPlaying, currentPiece, gameOver, checkCollision, createNewPiece, mergePieceToBoard, checkLines]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (showGrid) {
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        
        switch(lineType) {
          case 'dashed':
            ctx.setLineDash([5, 5]);
            break;
          case 'dotted':
            ctx.setLineDash([2, 2]);
            break;
          case 'double':
            ctx.lineWidth = 1;
            break;
          default: // solid
            ctx.setLineDash([]);
        }

        for (let x = 0; x <= BOARD_WIDTH; x++) {
          ctx.beginPath();
          ctx.moveTo(x * BLOCK_SIZE, 0);
          ctx.lineTo(x * BLOCK_SIZE, canvas.height);
          ctx.stroke();
        }
        
        for (let y = 0; y <= BOARD_HEIGHT; y++) {
          ctx.beginPath();
          ctx.moveTo(0, y * BLOCK_SIZE);
          ctx.lineTo(canvas.width, y * BLOCK_SIZE);
          ctx.stroke();
        }

        if (lineType === 'double') {
          ctx.lineWidth = 0.3;
          ctx.strokeStyle = gridColor;
          ctx.setLineDash([]);
          for (let x = 0; x <= BOARD_WIDTH; x++) {
            ctx.beginPath();
            ctx.moveTo(x * BLOCK_SIZE + 0.5, 0);
            ctx.lineTo(x * BLOCK_SIZE + 0.5, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y <= BOARD_HEIGHT; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * BLOCK_SIZE + 0.5);
            ctx.lineTo(canvas.width, y * BLOCK_SIZE + 0.5);
            ctx.stroke();
          }
        }
      }

      board.forEach((row, y) => {
        row.forEach((color, x) => {
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
          }
        });
      });

      if (currentPiece) {
        ctx.fillStyle = currentPiece.color;
        currentPiece.shape.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value) {
              ctx.fillRect(
                (currentPiece.x + x) * BLOCK_SIZE,
                (currentPiece.y + y) * BLOCK_SIZE,
                BLOCK_SIZE - 1,
                BLOCK_SIZE - 1
              );
            }
          });
        });
      }
    };

    draw();
  }, [board, currentPiece, showGrid, gridColor, lineType]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver || !isPlaying) return;

      if (currentPiece) {
        switch (e.key) {
          case 'ArrowLeft':
            if (!checkCollision(board, currentPiece, -1, 0)) {
              setCurrentPiece(p => ({ ...p, x: p.x - 1 }));
            }
            break;
          case 'ArrowRight':
            if (!checkCollision(board, currentPiece, 1, 0)) {
              setCurrentPiece(p => ({ ...p, x: p.x + 1 }));
            }
            break;
          case 'ArrowDown':
            if (!checkCollision(board, currentPiece, 0, 1)) {
              setCurrentPiece(p => ({ ...p, y: p.y + 1 }));
            }
            break;
          case ' ':
            while (!checkCollision(board, currentPiece, 0, 1)) {
              setCurrentPiece(p => ({ ...p, y: p.y + 1 }));
            }
            gameLoop();
            break;
          case 'ArrowUp':
            const rotated = rotatePiece(currentPiece.shape);
            if (!checkCollision(board, { ...currentPiece, shape: rotated })) {
              setCurrentPiece(p => ({ ...p, shape: rotated }));
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, currentPiece, checkCollision, gameOver, isPlaying, gameLoop]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        gameLoop();
      }, gameSpeed);
    }
    return () => clearInterval(intervalRef.current);
  }, [gameSpeed, isPlaying, gameOver, gameLoop]);

  const rotatePiece = (shape) => {
    const newShape = shape[0].map((_, i) =>
      shape.map(row => row[i]).reverse()
    );
    return newShape;
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPiece(null);
    setGameOver(false);
    setScore(0);
    setLinesCleared(0);
    setNextPiece(null);
    setHoldPiece(null);
    setCanHold(true);
    setGameTime(0);
    setCombo(0);
  };

  const handleSpeedChange = (speed) => {
    setGameSpeed(speed);
    if (isPlaying) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        gameLoop();
      }, speed);
    }
  };

  useEffect(() => {
    if (!nextPiece && isPlaying) {
      setNextPiece(createNewPiece());
    }
  }, [nextPiece, isPlaying, createNewPiece]);

  useEffect(() => {
    if (localStorage.getItem('highScore')) {
      setHighScore(parseInt(localStorage.getItem('highScore')));
    }
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('highScore', score);
    }
  }, [score]);

  const playSound = (type) => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.3;
    audio.play();
  };

  const holdCurrentPiece = () => {
    if (!canHold) return;
    
    setHoldPiece(currentPiece);
    setCurrentPiece(nextPiece);
    setNextPiece(createNewPiece());
    setCanHold(false);
  };

  useEffect(() => {
    let interval;
    if (isPlaying && !gameOver) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameOver]);

  useEffect(() => {
    console.log('Current Board:', board);
  }, [board]);

  useEffect(() => {
    console.log('Current Piece:', currentPiece);
  }, [currentPiece]);

  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '20px',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '20px'
    }}>
      <div>
        <div style={{ 
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '10px'
        }}>
          <button
            onClick={isPlaying ? pauseGame : startGame}
            style={buttonStyle}
            disabled={gameOver}
          >
            {isPlaying ? '⏸ 暂停' : '▶️ 开始游戏'}
          </button>
          <button 
            onClick={resetGame}
            style={buttonStyle}
          >
            🔄 重置
          </button>
        </div>

        <div style={{ 
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0 }}>游戏设置</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              难度选择：
              <select
                value={difficulty.name}
                onChange={(e) => {
                  const level = DIFFICULTY_LEVELS.find(l => l.name === e.target.value);
                  setDifficulty(level);
                  handleSpeedChange(level.speed);
                }}
                style={{ 
                  marginLeft: '10px',
                  padding: '5px 10px',
                  borderRadius: '4px'
                }}
              >
                {DIFFICULTY_LEVELS.map(level => (
                  <option key={level.name} value={level.name}>{level.name}</option>
                ))}
              </select>
            </label>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              手动调速（{gameSpeed}ms）：
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={gameSpeed}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
              />
              显示网格线
            </label>
            
            {showGrid && (
              <div style={{ marginTop: '10px', display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <label>
                    网格颜色：
                    <input
                      type="color"
                      value={gridColor}
                      onChange={(e) => setGridColor(e.target.value)}
                      style={colorPickerStyle}
                    />
                  </label>
                  <label>
                    线型样式：
                    <select 
                      value={lineType}
                      onChange={(e) => setLineType(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="solid">实线</option>
                      <option value="dashed">虚线</option>
                      <option value="dotted">点线</option>
                      <option value="double">双线</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0 }}>高级控制</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px'
          }}>
            <button
              onClick={holdCurrentPiece}
              style={buttonStyle}
              disabled={!canHold}
            >
              📥 暂存方块
            </button>
            <button
              onClick={() => handleSpeedChange(gameSpeed - 100)}
              style={buttonStyle}
              disabled={gameSpeed <= 100}
            >
              ⏩ 加速
            </button>
            <button
              onClick={() => handleSpeedChange(gameSpeed + 100)}
              style={buttonStyle}
              disabled={gameSpeed >= 2000}
            >
              ⏪ 减速
            </button>
            <button
              onClick={pauseGame}
              style={buttonStyle}
              disabled={!isPlaying}
            >
              ⏸ 暂停
            </button>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0 }}>游戏统计</h3>
          <div style={statsStyle}>
            <div>得分：<strong>{score}</strong></div>
            <div>消除行数：<strong>{linesCleared}</strong></div>
            <div>当前难度：<strong>{difficulty.name}</strong></div>
            <div>下落速度：<strong>{gameSpeed}ms</strong></div>
            <div>最高分：<strong>{highScore}</strong></div>
            <div>连击数：<strong>{combo}</strong></div>
            <div>游戏时间：<strong>
              {Math.floor(gameTime / 60)}分
              {Math.floor(gameTime % 60)}秒
            </strong></div>
            <div>当前等级：<strong>{Math.floor(linesCleared / 10) + 1}</strong></div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0 }}>操作说明</h3>
          <div style={controlsStyle}>
            <div>← →：左右移动</div>
            <div>↑：旋转方块</div>
            <div>↓：加速下落</div>
            <div>空格：快速到底</div>
            <div>P：暂停/继续</div>
            <div>R：重置游戏</div>
            <div>C：暂存方块</div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0 }}>下一个方块</h3>
          <div style={{ 
            width: '100px',
            height: '100px',
            position: 'relative',
            margin: '0 auto'
          }}>
            {nextPiece && (
              nextPiece.shape.map((row, y) => 
                row.map((cell, x) => 
                  cell ? (
                    <div
                      key={`${x}-${y}`}
                      style={{
                        position: 'absolute',
                        left: x * BLOCK_SIZE + 'px',
                        top: y * BLOCK_SIZE + 'px',
                        width: BLOCK_SIZE - 2 + 'px',
                        height: BLOCK_SIZE - 2 + 'px',
                        backgroundColor: nextPiece.color,
                        border: '1px solid #ddd'
                      }}
                    />
                  ) : null
                )
              )
            )}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={BOARD_WIDTH * BLOCK_SIZE}
          height={BOARD_HEIGHT * BLOCK_SIZE}
          style={{ 
            border: '2px solid #333',
            borderRadius: '8px',
            backgroundColor: '#fff',
            transition: 'all 0.3s ease'
          }}
        />
      </div>

      {gameOver && (
        <div style={gameOverStyle}>
          <h2>🎮 游戏结束 🎮</h2>
          <p>最终得分：{score}</p>
          <p>消除行数：{linesCleared}</p>
          <button 
            onClick={resetGame}
            style={{ ...buttonStyle, marginTop: '15px' }}
          >
            🔄 重新开始
          </button>
        </div>
      )}
    </div>
  );
}

function createEmptyBoard() {
  return Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(''));
}

const statsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '10px',
  fontSize: '16px'
};

const gameOverStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'rgba(0,0,0,0.9)',
  color: 'white',
  padding: '30px',
  borderRadius: '15px',
  textAlign: 'center',
  boxShadow: '0 0 20px rgba(255,255,255,0.2)',
  zIndex: 1000
};

const buttonStyle = {
  padding: '12px 24px',
  fontSize: '16px',
  cursor: 'pointer',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px'
};

const controlsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '10px',
  fontSize: '14px'
};

const colorPickerStyle = {
  width: '30px',
  height: '30px',
  padding: '2px',
  borderRadius: '4px',
  cursor: 'pointer'
};

const selectStyle = {
  padding: '5px 10px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  marginLeft: '10px'
}; 