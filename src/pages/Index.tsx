import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import AudioControls from '@/components/AudioControls';
import { audioManager } from '@/utils/audio';

// Game Components
const SnakeGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [snake, setSnake] = useState([[10, 10]]);
  const [food, setFood] = useState([15, 15]);
  const [direction, setDirection] = useState([0, 1]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout>();

  const resetGame = () => {
    setSnake([[10, 10]]);
    setFood([15, 15]);
    setDirection([0, 1]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !isPlaying) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = [...newSnake[0]];
      head[0] += direction[0];
      head[1] += direction[1];

      if (head[0] < 0 || head[0] >= 20 || head[1] < 0 || head[1] >= 20) {
        setGameOver(true);
        setIsPlaying(false);
        audioManager.playGameOverSound();
        return prevSnake;
      }

      for (const segment of newSnake) {
        if (head[0] === segment[0] && head[1] === segment[1]) {
          setGameOver(true);
          setIsPlaying(false);
          audioManager.playGameOverSound();
          return prevSnake;
        }
      }

      newSnake.unshift(head);

      if (head[0] === food[0] && head[1] === food[1]) {
        const newScore = score + 10;
        setScore(newScore);
        onScore(newScore);
        setFood([Math.floor(Math.random() * 20), Math.floor(Math.random() * 20)]);
        new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFKHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjiUz/LMeiwFJHfH8N2QQAoUXrPp66hVFApGn+DyvmAaAjuUz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAa').play().catch(() => {});
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPlaying, score, onScore]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setTimeout(moveSnake, 150);
    }
    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, [moveSnake, isPlaying, gameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction[0] !== 1) setDirection([-1, 0]);
          break;
        case 'ArrowDown':
          if (direction[0] !== -1) setDirection([1, 0]);
          break;
        case 'ArrowLeft':
          if (direction[1] !== 1) setDirection([0, -1]);
          break;
        case 'ArrowRight':
          if (direction[1] !== -1) setDirection([0, 1]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPlaying]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">Счет: {score}</div>
      <div className="grid grid-cols-20 gap-0 border-2 border-cyber-blue neon-border bg-black/50 p-2">
        {Array.from({ length: 400 }, (_, i) => {
          const row = Math.floor(i / 20);
          const col = i % 20;
          const isSnake = snake.some(([r, c]) => r === row && c === col);
          const isFood = food[0] === row && food[1] === col;
          
          return (
            <div
              key={i}
              className={`w-3 h-3 ${
                isSnake ? 'bg-cyber-blue' : isFood ? 'bg-cyber-red' : 'bg-gray-800'
              }`}
            />
          );
        })}
      </div>
      {!isPlaying && (
        <Button onClick={resetGame} className="cyber-button">
          {gameOver ? 'Играть снова' : 'Старт'}
        </Button>
      )}
      {gameOver && <div className="text-cyber-red neon-text">Игра окончена!</div>}
    </div>
  );
};

const ClickerGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [clicks, setClicks] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [autoClicker, setAutoClicker] = useState(0);

  useEffect(() => {
    if (autoClicker > 0) {
      const interval = setInterval(() => {
        setClicks(prev => {
          const newScore = prev + autoClicker;
          onScore(newScore);
          return newScore;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoClicker, onScore]);

  const handleClick = () => {
    const newScore = clicks + multiplier;
    setClicks(newScore);
    onScore(newScore);
    new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFKHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjiUz/LMeiwFJHfH8N2QQAoUXrPp66hVFApGn+DyvmAaAjuUz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjuVz/LMeiwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAa').play().catch(() => {});
  };

  const buyMultiplier = () => {
    if (clicks >= 50) {
      setClicks(prev => prev - 50);
      setMultiplier(prev => prev + 1);
    }
  };

  const buyAutoClicker = () => {
    if (clicks >= 100) {
      setClicks(prev => prev - 100);
      setAutoClicker(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-2xl font-bold text-cyber-blue neon-text">Клики: {clicks}</div>
      <Button
        onClick={handleClick}
        className="w-32 h-32 text-xl cyber-button rounded-full"
      >
        КЛИК!
      </Button>
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={buyMultiplier}
          disabled={clicks < 50}
          className="cyber-button"
        >
          x{multiplier + 1} (50 кликов)
        </Button>
        <Button
          onClick={buyAutoClicker}
          disabled={clicks < 100}
          className="cyber-button"
        >
          Авто +{autoClicker + 1}/сек (100)
        </Button>
      </div>
    </div>
  );
};

const MemoryGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const colors = ['bg-cyber-red', 'bg-cyber-blue', 'bg-cyber-purple', 'bg-neon-green'];
  const sounds = [330, 262, 294, 220];

  const playSound = (frequency: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const startGame = () => {
    setSequence([Math.floor(Math.random() * 4)]);
    setPlayerSequence([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setIsShowingSequence(true);
  };

  const showSequence = useCallback(() => {
    if (sequence.length === 0) return;
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < sequence.length) {
        playSound(sounds[sequence[index]]);
        index++;
      } else {
        clearInterval(interval);
        setIsShowingSequence(false);
      }
    }, 600);
  }, [sequence]);

  useEffect(() => {
    if (isShowingSequence && sequence.length > 0) {
      showSequence();
    }
  }, [isShowingSequence, showSequence]);

  const handleColorClick = (colorIndex: number) => {
    if (isShowingSequence || gameOver) return;

    const newPlayerSequence = [...playerSequence, colorIndex];
    setPlayerSequence(newPlayerSequence);
    playSound(sounds[colorIndex]);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      const newScore = score + 1;
      setScore(newScore);
      onScore(newScore);
      setPlayerSequence([]);
      
      setTimeout(() => {
        const newSequence = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(newSequence);
        setIsShowingSequence(true);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">Уровень: {score}</div>
      <div className="grid grid-cols-2 gap-4">
        {colors.map((color, index) => (
          <Button
            key={index}
            onClick={() => handleColorClick(index)}
            disabled={isShowingSequence || gameOver}
            className={`w-24 h-24 ${color} border-2 border-white hover:brightness-150 transition-all`}
          />
        ))}
      </div>
      {!isPlaying && (
        <Button onClick={startGame} className="cyber-button">
          {gameOver ? 'Играть снова' : 'Старт'}
        </Button>
      )}
      {gameOver && <div className="text-cyber-red neon-text">Игра окончена!</div>}
    </div>
  );
};

const PongGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [ballPos, setBallPos] = useState({ x: 200, y: 150 });
  const [ballDir, setBallDir] = useState({ x: 2, y: 2 });
  const [playerY, setPlayerY] = useState(130);
  const [aiY, setAiY] = useState(130);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const gameRef = useRef<NodeJS.Timeout>();

  const resetGame = () => {
    setBallPos({ x: 200, y: 150 });
    setBallDir({ x: 2, y: 2 });
    setPlayerY(130);
    setAiY(130);
    setScore({ player: 0, ai: 0 });
    setIsPlaying(true);
  };

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    setBallPos(prev => {
      let newX = prev.x + ballDir.x;
      let newY = prev.y + ballDir.y;
      let newDirX = ballDir.x;
      let newDirY = ballDir.y;

      if (newY <= 10 || newY >= 290) {
        newDirY = -newDirY;
        audioManager.playBounceSound();
      }

      if (newX <= 30 && newY >= playerY && newY <= playerY + 60) {
        newDirX = -newDirX;
        audioManager.playHitSound();
      }

      if (newX >= 370 && newY >= aiY && newY <= aiY + 60) {
        newDirX = -newDirX;
        audioManager.playHitSound();
      }

      if (newX <= 0) {
        setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
        return { x: 200, y: 150 };
      }
      if (newX >= 400) {
        setScore(prev => ({ ...prev, player: prev.player + 1 }));
        onScore(score.player + 1);
        return { x: 200, y: 150 };
      }

      setBallDir({ x: newDirX, y: newDirY });
      return { x: newX, y: newY };
    });

    setAiY(prev => {
      const center = prev + 30;
      if (center < ballPos.y - 5) return Math.min(prev + 2, 240);
      if (center > ballPos.y + 5) return Math.max(prev - 2, 0);
      return prev;
    });
  }, [isPlaying, ballDir, ballPos.y, playerY, aiY, score.player, onScore]);

  useEffect(() => {
    if (isPlaying) {
      gameRef.current = setTimeout(updateGame, 16);
    }
    return () => {
      if (gameRef.current) clearTimeout(gameRef.current);
    };
  }, [updateGame, isPlaying]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowUp') setPlayerY(prev => Math.max(prev - 20, 0));
      if (e.key === 'ArrowDown') setPlayerY(prev => Math.min(prev + 20, 240));
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">
        Игрок: {score.player} | ИИ: {score.ai}
      </div>
      <div className="relative w-96 h-72 border-2 border-cyber-blue neon-border bg-black/50">
        <div 
          className="absolute w-2 h-16 bg-cyber-blue"
          style={{ left: '20px', top: `${playerY}px` }}
        />
        <div 
          className="absolute w-2 h-16 bg-cyber-red"
          style={{ right: '20px', top: `${aiY}px` }}
        />
        <div 
          className="absolute w-3 h-3 bg-cyber-purple rounded-full"
          style={{ left: `${ballPos.x}px`, top: `${ballPos.y}px` }}
        />
        <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-600 opacity-50" />
      </div>
      {!isPlaying && (
        <Button onClick={resetGame} className="cyber-button">
          Старт
        </Button>
      )}
      <div className="text-sm text-muted-foreground">Управление: ↑ ↓</div>
    </div>
  );
};

const BreakoutGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [ballPos, setBallPos] = useState({ x: 200, y: 250 });
  const [ballDir, setBallDir] = useState({ x: 2, y: -2 });
  const [paddleX, setPaddleX] = useState(175);
  const [blocks, setBlocks] = useState(() => Array(40).fill(true));
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameRef = useRef<NodeJS.Timeout>();

  const resetGame = () => {
    setBallPos({ x: 200, y: 250 });
    setBallDir({ x: 2, y: -2 });
    setPaddleX(175);
    setBlocks(Array(40).fill(true));
    setScore(0);
    setIsPlaying(true);
  };

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    setBallPos(prev => {
      let newX = prev.x + ballDir.x;
      let newY = prev.y + ballDir.y;
      let newDirX = ballDir.x;
      let newDirY = ballDir.y;

      if (newX <= 0 || newX >= 395) newDirX = -newDirX;
      if (newY <= 0) newDirY = -newDirY;

      if (newY >= 280 && newX >= paddleX && newX <= paddleX + 50) {
        newDirY = -Math.abs(newDirY);
        audioManager.playBounceSound();
      }

      const blockRow = Math.floor((newY - 20) / 20);
      const blockCol = Math.floor(newX / 50);
      const blockIndex = blockRow * 8 + blockCol;

      if (blockRow >= 0 && blockRow < 5 && blockCol >= 0 && blockCol < 8 && blocks[blockIndex]) {
        setBlocks(prev => {
          const newBlocks = [...prev];
          newBlocks[blockIndex] = false;
          return newBlocks;
        });
        setScore(prev => {
          const newScore = prev + 10;
          onScore(newScore);
          return newScore;
        });
        newDirY = -newDirY;
        audioManager.playHitSound();
      }

      if (newY >= 300) {
        setIsPlaying(false);
        return prev;
      }

      setBallDir({ x: newDirX, y: newDirY });
      return { x: newX, y: newY };
    });
  }, [isPlaying, ballDir, paddleX, blocks, onScore]);

  useEffect(() => {
    if (isPlaying) {
      gameRef.current = setTimeout(updateGame, 16);
    }
    return () => {
      if (gameRef.current) clearTimeout(gameRef.current);
    };
  }, [updateGame, isPlaying]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft') setPaddleX(prev => Math.max(prev - 15, 0));
      if (e.key === 'ArrowRight') setPaddleX(prev => Math.min(prev + 15, 350));
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">Счет: {score}</div>
      <div className="relative w-96 h-72 border-2 border-cyber-blue neon-border bg-black/50">
        {blocks.map((exists, i) => {
          if (!exists) return null;
          const row = Math.floor(i / 8);
          const col = i % 8;
          return (
            <div
              key={i}
              className="absolute w-12 h-4 bg-cyber-red border border-cyber-blue"
              style={{
                left: `${col * 50}px`,
                top: `${20 + row * 20}px`
              }}
            />
          );
        })}
        <div 
          className="absolute w-3 h-3 bg-cyber-purple rounded-full"
          style={{ left: `${ballPos.x}px`, top: `${ballPos.y}px` }}
        />
        <div 
          className="absolute w-12 h-2 bg-cyber-blue"
          style={{ left: `${paddleX}px`, top: '280px' }}
        />
      </div>
      {!isPlaying && (
        <Button onClick={resetGame} className="cyber-button">
          {blocks.every(b => !b) ? 'Победа! Снова?' : 'Старт'}
        </Button>
      )}
      <div className="text-sm text-muted-foreground">Управление: ← →</div>
    </div>
  );
};

const SpaceGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [shipX, setShipX] = useState(200);
  const [bullets, setBullets] = useState<{x: number, y: number}[]>([]);
  const [asteroids, setAsteroids] = useState<{x: number, y: number}[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameRef = useRef<NodeJS.Timeout>();

  const resetGame = () => {
    setShipX(200);
    setBullets([]);
    setAsteroids([]);
    setScore(0);
    setIsPlaying(true);
  };

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    setBullets(prev => prev.map(b => ({ ...b, y: b.y - 5 })).filter(b => b.y > 0));

    setAsteroids(prev => {
      let newAsteroids = prev.map(a => ({ ...a, y: a.y + 2 })).filter(a => a.y < 300);
      
      if (Math.random() < 0.02) {
        newAsteroids.push({ x: Math.random() * 380, y: 0 });
      }

      return newAsteroids;
    });

    setBullets(prevBullets => {
      setAsteroids(prevAsteroids => {
        const newBullets = [...prevBullets];
        const newAsteroids = [...prevAsteroids];
        
        for (let i = newBullets.length - 1; i >= 0; i--) {
          for (let j = newAsteroids.length - 1; j >= 0; j--) {
            const bullet = newBullets[i];
            const asteroid = newAsteroids[j];
            
            if (Math.abs(bullet.x - asteroid.x) < 15 && Math.abs(bullet.y - asteroid.y) < 15) {
              newBullets.splice(i, 1);
              newAsteroids.splice(j, 1);
              setScore(prev => {
                const newScore = prev + 10;
                onScore(newScore);
                audioManager.playExplosionSound();
                return newScore;
              });
              break;
            }
          }
        }
        
        return newAsteroids;
      });
      
      return newBullets;
    });

    asteroids.forEach(asteroid => {
      if (Math.abs(shipX - asteroid.x) < 20 && asteroid.y > 250) {
        setIsPlaying(false);
      }
    });
  }, [isPlaying, asteroids, shipX, onScore]);

  useEffect(() => {
    if (isPlaying) {
      gameRef.current = setTimeout(updateGame, 16);
    }
    return () => {
      if (gameRef.current) clearTimeout(gameRef.current);
    };
  }, [updateGame, isPlaying]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft') setShipX(prev => Math.max(prev - 10, 0));
      if (e.key === 'ArrowRight') setShipX(prev => Math.min(prev + 10, 380));
      if (e.key === ' ') {
        e.preventDefault();
        setBullets(prev => [...prev, { x: shipX, y: 270 }]);
        audioManager.playClickSound();
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isPlaying, shipX]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">Счет: {score}</div>
      <div className="relative w-96 h-72 border-2 border-cyber-blue neon-border bg-black/50">
        <div 
          className="absolute w-4 h-6 bg-cyber-blue"
          style={{ left: `${shipX}px`, top: '270px' }}
        />
        {bullets.map((bullet, i) => (
          <div
            key={i}
            className="absolute w-1 h-3 bg-cyber-green"
            style={{ left: `${bullet.x}px`, top: `${bullet.y}px` }}
          />
        ))}
        {asteroids.map((asteroid, i) => (
          <div
            key={i}
            className="absolute w-6 h-6 bg-cyber-red rounded"
            style={{ left: `${asteroid.x}px`, top: `${asteroid.y}px` }}
          />
        ))}
      </div>
      {!isPlaying && (
        <Button onClick={resetGame} className="cyber-button">
          Старт
        </Button>
      )}
      <div className="text-sm text-muted-foreground">
        Управление: ← → Пробел
      </div>
    </div>
  );
};

const FlappyGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [birdY, setBirdY] = useState(150);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<{x: number, gap: number}[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameRef = useRef<NodeJS.Timeout>();

  const resetGame = () => {
    setBirdY(150);
    setVelocity(0);
    setPipes([{ x: 400, gap: 150 }]);
    setScore(0);
    setIsPlaying(true);
  };

  const jump = () => {
    if (isPlaying) {
      setVelocity(-8);
      audioManager.playJumpSound();
    }
  };

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    setBirdY(prev => {
      const newY = prev + velocity;
      if (newY < 0 || newY > 280) {
        setIsPlaying(false);
        return prev;
      }
      return newY;
    });

    setVelocity(prev => prev + 0.5);

    setPipes(prev => {
      let newPipes = prev.map(p => ({ ...p, x: p.x - 2 })).filter(p => p.x > -60);
      
      if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 200) {
        newPipes.push({ x: 400, gap: 100 + Math.random() * 100 });
      }

      newPipes.forEach(pipe => {
        if (pipe.x < 50 && pipe.x > 48) {
          setScore(prev => {
            const newScore = prev + 1;
            onScore(newScore);
            return newScore;
          });
        }
      });

      return newPipes;
    });
  }, [isPlaying, velocity, birdY, onScore]);

  useEffect(() => {
    if (isPlaying) {
      gameRef.current = setTimeout(updateGame, 16);
    }
    return () => {
      if (gameRef.current) clearTimeout(gameRef.current);
    };
  }, [updateGame, isPlaying]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">Счет: {score}</div>
      <div className="relative w-96 h-72 border-2 border-cyber-blue neon-border bg-black/50 overflow-hidden">
        <div 
          className="absolute w-6 h-6 bg-cyber-red rounded-full"
          style={{ left: '40px', top: `${birdY}px` }}
        />
        {pipes.map((pipe, i) => (
          <div key={i}>
            <div
              className="absolute w-12 bg-cyber-blue"
              style={{
                left: `${pipe.x}px`,
                top: '0px',
                height: `${pipe.gap}px`
              }}
            />
            <div
              className="absolute w-12 bg-cyber-blue"
              style={{
                left: `${pipe.x}px`,
                top: `${pipe.gap + 80}px`,
                height: `${300 - pipe.gap - 80}px`
              }}
            />
          </div>
        ))}
      </div>
      {!isPlaying && (
        <Button onClick={resetGame} className="cyber-button">
          Старт
        </Button>
      )}
      <Button onClick={jump} className="cyber-button" disabled={!isPlaying}>
        Прыжок (Пробел)
      </Button>
    </div>
  );
};

const MazeGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [maze] = useState(() => {
    const m = Array(15).fill(null).map(() => Array(15).fill(1));
    for (let i = 1; i < 14; i += 2) {
      for (let j = 1; j < 14; j += 2) {
        m[i][j] = 0;
        if (Math.random() > 0.5 && j < 13) m[i][j + 1] = 0;
        if (Math.random() > 0.5 && i < 13) m[i + 1][j] = 0;
      }
    }
    m[13][13] = 2; // exit
    return m;
  });
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);

  const movePlayer = (dx: number, dy: number) => {
    setPlayerPos(prev => {
      const newX = prev.x + dx;
      const newY = prev.y + dy;
      
      if (newX >= 0 && newX < 15 && newY >= 0 && newY < 15 && maze[newY][newX] !== 1) {
        if (maze[newY][newX] === 2) {
          setWon(true);
          const newScore = score + 100;
          setScore(newScore);
          onScore(newScore);
        }
        return { x: newX, y: newY };
      }
      return prev;
    });
  };

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (won) return;
      switch (e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [won]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">
        {won ? 'Победа!' : 'Найди выход'}
      </div>
      <div className="grid grid-cols-15 gap-0 border-2 border-cyber-blue neon-border">
        {maze.flat().map((cell, i) => {
          const row = Math.floor(i / 15);
          const col = i % 15;
          const isPlayer = playerPos.x === col && playerPos.y === row;
          
          return (
            <div
              key={i}
              className={`w-4 h-4 ${
                isPlayer ? 'bg-cyber-red' :
                cell === 1 ? 'bg-gray-800' :
                cell === 2 ? 'bg-cyber-green' : 'bg-gray-900'
              }`}
            />
          );
        })}
      </div>
      <div className="text-sm text-muted-foreground">Управление: ← → ↑ ↓</div>
    </div>
  );
};

const RacingGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [carX, setCarX] = useState(200);
  const [obstacles, setObstacles] = useState<{x: number, y: number}[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameRef = useRef<NodeJS.Timeout>();

  const resetGame = () => {
    setCarX(200);
    setObstacles([]);
    setScore(0);
    setIsPlaying(true);
  };

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    setScore(prev => {
      const newScore = prev + 1;
      onScore(newScore);
      return newScore;
    });

    setObstacles(prev => {
      let newObstacles = prev.map(o => ({ ...o, y: o.y + 5 })).filter(o => o.y < 300);
      
      if (Math.random() < 0.03) {
        newObstacles.push({ x: 100 + Math.random() * 200, y: 0 });
      }

      newObstacles.forEach(obstacle => {
        if (Math.abs(carX - obstacle.x) < 30 && obstacle.y > 240) {
          setIsPlaying(false);
        }
      });

      return newObstacles;
    });
  }, [isPlaying, carX, onScore]);

  useEffect(() => {
    if (isPlaying) {
      gameRef.current = setTimeout(updateGame, 50);
    }
    return () => {
      if (gameRef.current) clearTimeout(gameRef.current);
    };
  }, [updateGame, isPlaying]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft') setCarX(prev => Math.max(prev - 15, 100));
      if (e.key === 'ArrowRight') setCarX(prev => Math.min(prev + 15, 300));
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">Расстояние: {score}</div>
      <div className="relative w-96 h-72 border-2 border-cyber-blue neon-border bg-black/50">
        <div 
          className="absolute w-8 h-12 bg-cyber-blue rounded"
          style={{ left: `${carX}px`, top: '250px' }}
        />
        {obstacles.map((obstacle, i) => (
          <div
            key={i}
            className="absolute w-8 h-8 bg-cyber-red rounded"
            style={{ left: `${obstacle.x}px`, top: `${obstacle.y}px` }}
          />
        ))}
        <div className="absolute left-24 top-0 w-1 h-full bg-white opacity-30" />
        <div className="absolute right-24 top-0 w-1 h-full bg-white opacity-30" />
      </div>
      {!isPlaying && (
        <Button onClick={resetGame} className="cyber-button">
          Старт
        </Button>
      )}
      <div className="text-sm text-muted-foreground">Управление: ← →</div>
    </div>
  );
};

const PuzzleGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [tiles, setTiles] = useState(() => {
    const arr = Array.from({ length: 15 }, (_, i) => i + 1);
    arr.push(0);
    return arr.sort(() => Math.random() - 0.5);
  });
  const [moves, setMoves] = useState(0);

  const moveTile = (index: number) => {
    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / 4);
    const col = index % 4;
    const emptyRow = Math.floor(emptyIndex / 4);
    const emptyCol = emptyIndex % 4;

    if ((Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
        (Math.abs(col - emptyCol) === 1 && row === emptyRow)) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves(prev => prev + 1);

      const isSolved = newTiles.every((tile, i) => tile === (i + 1) % 16);
      if (isSolved) {
        onScore(1000 - moves);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">Ходы: {moves}</div>
      <div className="grid grid-cols-4 gap-1 border-2 border-cyber-blue neon-border p-2">
        {tiles.map((tile, index) => (
          <div
            key={index}
            onClick={() => moveTile(index)}
            className={`w-16 h-16 flex items-center justify-center text-xl font-bold cursor-pointer transition-all ${
              tile === 0 
                ? 'bg-transparent' 
                : 'bg-cyber-blue text-black hover:bg-cyber-purple hover:text-white'
            }`}
          >
            {tile || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

const PlatformerGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 200 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [platforms] = useState([
    { x: 0, y: 250, w: 100, h: 20 },
    { x: 150, y: 200, w: 80, h: 20 },
    { x: 280, y: 150, w: 80, h: 20 },
    { x: 150, y: 100, w: 80, h: 20 }
  ]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameRef = useRef<NodeJS.Timeout>();

  const resetGame = () => {
    setPlayerPos({ x: 50, y: 200 });
    setVelocity({ x: 0, y: 0 });
    setScore(0);
    setIsPlaying(true);
  };

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    setPlayerPos(prev => {
      let newX = prev.x + velocity.x;
      let newY = prev.y + velocity.y;

      if (newX < 0 || newX > 380) newX = prev.x;
      if (newY > 280) {
        setIsPlaying(false);
        return prev;
      }

      let onPlatform = false;
      platforms.forEach(platform => {
        if (newX + 20 > platform.x && newX < platform.x + platform.w &&
            newY + 20 > platform.y && newY + 20 < platform.y + platform.h + 10) {
          if (velocity.y > 0) {
            newY = platform.y - 20;
            setVelocity(prev => ({ ...prev, y: 0 }));
            onPlatform = true;
          }
        }
      });

      if (!onPlatform && newY === prev.y) {
        setVelocity(prev => ({ ...prev, y: prev.y + 0.5 }));
      }

      if (newY < 120) {
        setScore(prev => {
          const newScore = prev + 1;
          onScore(newScore);
          return newScore;
        });
      }

      return { x: newX, y: newY };
    });
  }, [isPlaying, velocity, platforms, onScore]);

  useEffect(() => {
    if (isPlaying) {
      gameRef.current = setTimeout(updateGame, 16);
    }
    return () => {
      if (gameRef.current) clearTimeout(gameRef.current);
    };
  }, [updateGame, isPlaying]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft') setVelocity(prev => ({ ...prev, x: -3 }));
      if (e.key === 'ArrowRight') setVelocity(prev => ({ ...prev, x: 3 }));
      if (e.key === ' ') {
        e.preventDefault();
        setVelocity(prev => ({ ...prev, y: -10 }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        setVelocity(prev => ({ ...prev, x: 0 }));
      }
    };

    window.addEventListener('keydown', handleKeys);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeys);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">Высота: {score}</div>
      <div className="relative w-96 h-72 border-2 border-cyber-blue neon-border bg-black/50">
        <div 
          className="absolute w-5 h-5 bg-cyber-red rounded"
          style={{ left: `${playerPos.x}px`, top: `${playerPos.y}px` }}
        />
        {platforms.map((platform, i) => (
          <div
            key={i}
            className="absolute bg-cyber-blue"
            style={{
              left: `${platform.x}px`,
              top: `${platform.y}px`,
              width: `${platform.w}px`,
              height: `${platform.h}px`
            }}
          />
        ))}
      </div>
      {!isPlaying && (
        <Button onClick={resetGame} className="cyber-button">
          Старт
        </Button>
      )}
      <div className="text-sm text-muted-foreground">← → Пробел</div>
    </div>
  );
};

const Match3Game = ({ onScore }: { onScore: (score: number) => void }) => {
  const colors = ['bg-cyber-red', 'bg-cyber-blue', 'bg-cyber-purple', 'bg-neon-green', 'bg-cyber-dark'];
  const [board, setBoard] = useState(() => 
    Array(64).fill(null).map(() => Math.floor(Math.random() * 5))
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const swapTiles = (index1: number, index2: number) => {
    const newBoard = [...board];
    [newBoard[index1], newBoard[index2]] = [newBoard[index2], newBoard[index1]];
    
    // Check for matches
    let hasMatch = false;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 6; j++) {
        const idx = i * 8 + j;
        if (newBoard[idx] === newBoard[idx + 1] && newBoard[idx] === newBoard[idx + 2]) {
          hasMatch = true;
          setScore(prev => {
            const newScore = prev + 30;
            onScore(newScore);
            return newScore;
          });
        }
      }
    }
    
    if (hasMatch) {
      setBoard(newBoard);
    }
  };

  const handleTileClick = (index: number) => {
    if (selected === null) {
      setSelected(index);
    } else {
      const row1 = Math.floor(selected / 8);
      const col1 = selected % 8;
      const row2 = Math.floor(index / 8);
      const col2 = index % 8;
      
      if (Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1) {
        swapTiles(selected, index);
      }
      setSelected(null);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">Счет: {score}</div>
      <div className="grid grid-cols-8 gap-1 border-2 border-cyber-blue neon-border p-2">
        {board.map((color, index) => (
          <div
            key={index}
            onClick={() => handleTileClick(index)}
            className={`w-8 h-8 cursor-pointer border-2 transition-all ${
              colors[color]
            } ${selected === index ? 'border-white' : 'border-gray-600'}`}
          />
        ))}
      </div>
    </div>
  );
};

const TowerGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [blocks, setBlocks] = useState<{x: number, w: number}[]>([{ x: 150, w: 100 }]);
  const [currentBlock, setCurrentBlock] = useState({ x: 0, w: 100, moving: true });
  const [direction, setDirection] = useState(1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameRef = useRef<NodeJS.Timeout>();

  const updateGame = useCallback(() => {
    if (!currentBlock.moving || gameOver) return;

    setCurrentBlock(prev => {
      let newX = prev.x + direction * 2;
      let newDir = direction;

      if (newX <= 0 || newX + prev.w >= 400) {
        newDir = -direction;
        newX = prev.x + newDir * 2;
      }

      setDirection(newDir);
      return { ...prev, x: newX };
    });
  }, [currentBlock.moving, gameOver, direction]);

  useEffect(() => {
    if (currentBlock.moving && !gameOver) {
      gameRef.current = setTimeout(updateGame, 50);
    }
    return () => {
      if (gameRef.current) clearTimeout(gameRef.current);
    };
  }, [updateGame, currentBlock.moving, gameOver]);

  const dropBlock = () => {
    if (!currentBlock.moving) return;

    const lastBlock = blocks[blocks.length - 1];
    const overlap = Math.min(
      lastBlock.x + lastBlock.w,
      currentBlock.x + currentBlock.w
    ) - Math.max(lastBlock.x, currentBlock.x);

    if (overlap <= 0) {
      setGameOver(true);
      return;
    }

    const newX = Math.max(lastBlock.x, currentBlock.x);
    const newBlock = { x: newX, w: overlap };

    setBlocks(prev => [...prev, newBlock]);
    setScore(prev => {
      const newScore = prev + 1;
      onScore(newScore);
      return newScore;
    });

    setCurrentBlock({
      x: 0,
      w: overlap,
      moving: true
    });
    setDirection(1);
  };

  const resetGame = () => {
    setBlocks([{ x: 150, w: 100 }]);
    setCurrentBlock({ x: 0, w: 100, moving: true });
    setDirection(1);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">Этажи: {score}</div>
      <div className="relative w-96 h-72 border-2 border-cyber-blue neon-border bg-black/50 overflow-hidden">
        {blocks.map((block, i) => (
          <div
            key={i}
            className="absolute bg-cyber-blue border border-cyber-purple"
            style={{
              left: `${block.x}px`,
              bottom: `${i * 20}px`,
              width: `${block.w}px`,
              height: '20px'
            }}
          />
        ))}
        {!gameOver && (
          <div
            className="absolute bg-cyber-red border border-cyber-purple opacity-80"
            style={{
              left: `${currentBlock.x}px`,
              bottom: `${blocks.length * 20}px`,
              width: `${currentBlock.w}px`,
              height: '20px'
            }}
          />
        )}
      </div>
      <Button onClick={dropBlock} disabled={!currentBlock.moving || gameOver} className="cyber-button">
        Бросить блок
      </Button>
      {gameOver && (
        <Button onClick={resetGame} className="cyber-button">
          Играть снова
        </Button>
      )}
    </div>
  );
};

const CardsGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [cards, setCards] = useState<number[]>([]);
  const [dealerCards, setDealerCards] = useState<number[]>([]);
  const [playerSum, setPlayerSum] = useState(0);
  const [dealerSum, setDealerSum] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
  const [result, setResult] = useState('');

  const getRandomCard = () => Math.min(Math.floor(Math.random() * 13) + 1, 10);

  const calculateSum = (cardArray: number[]) => {
    return cardArray.reduce((sum, card) => sum + card, 0);
  };

  const startGame = () => {
    const playerCards = [getRandomCard(), getRandomCard()];
    const dealerCards = [getRandomCard()];
    
    setCards(playerCards);
    setDealerCards(dealerCards);
    setPlayerSum(calculateSum(playerCards));
    setDealerSum(calculateSum(dealerCards));
    setGameState('playing');
    setResult('');
  };

  const hit = () => {
    const newCard = getRandomCard();
    const newCards = [...cards, newCard];
    const newSum = calculateSum(newCards);
    
    setCards(newCards);
    setPlayerSum(newSum);
    
    if (newSum > 21) {
      setResult('Перебор! Дилер выиграл');
      setGameState('end');
    }
  };

  const stand = () => {
    let newDealerCards = [...dealerCards];
    let newDealerSum = dealerSum;
    
    while (newDealerSum < 17) {
      const newCard = getRandomCard();
      newDealerCards.push(newCard);
      newDealerSum = calculateSum(newDealerCards);
    }
    
    setDealerCards(newDealerCards);
    setDealerSum(newDealerSum);
    
    if (newDealerSum > 21) {
      setResult('Дилер перебрал! Вы выиграли');
      onScore(21);
    } else if (playerSum > newDealerSum) {
      setResult('Вы выиграли!');
      onScore(21);
    } else if (playerSum < newDealerSum) {
      setResult('Дилер выиграл');
    } else {
      setResult('Ничья');
    }
    
    setGameState('end');
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">Блэкджек</div>
      
      {gameState !== 'start' && (
        <>
          <div className="space-y-2">
            <div className="text-cyber-blue">Дилер ({dealerSum})</div>
            <div className="flex space-x-2">
              {dealerCards.map((card, i) => (
                <div key={i} className="w-12 h-16 bg-cyber-dark border border-cyber-blue flex items-center justify-center text-white">
                  {card}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-cyber-red">Игрок ({playerSum})</div>
            <div className="flex space-x-2">
              {cards.map((card, i) => (
                <div key={i} className="w-12 h-16 bg-cyber-dark border border-cyber-red flex items-center justify-center text-white">
                  {card}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      {result && <div className="text-xl text-cyber-purple neon-text">{result}</div>}
      
      <div className="flex space-x-2">
        {gameState === 'start' && (
          <Button onClick={startGame} className="cyber-button">Начать игру</Button>
        )}
        {gameState === 'playing' && (
          <>
            <Button onClick={hit} className="cyber-button">Взять карту</Button>
            <Button onClick={stand} className="cyber-button">Хватит</Button>
          </>
        )}
        {gameState === 'end' && (
          <Button onClick={startGame} className="cyber-button">Новая игра</Button>
        )}
      </div>
    </div>
  );
};

const RPGGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [player, setPlayer] = useState({ hp: 100, attack: 10, level: 1, exp: 0 });
  const [enemy, setEnemy] = useState({ hp: 50, attack: 8, name: 'Робот-1' });
  const [inCombat, setInCombat] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const startCombat = () => {
    setEnemy({
      hp: 30 + player.level * 20,
      attack: 5 + player.level * 3,
      name: `Киборг-${player.level}`
    });
    setInCombat(true);
    setLog(['Бой начался!']);
  };

  const attack = () => {
    if (!inCombat) return;

    const playerDamage = player.attack + Math.floor(Math.random() * 10);
    const newEnemyHp = enemy.hp - playerDamage;

    let newLog = [...log, `Вы нанесли ${playerDamage} урона`];

    if (newEnemyHp <= 0) {
      const expGain = 20 * player.level;
      setPlayer(prev => {
        const newExp = prev.exp + expGain;
        if (newExp >= 100) {
          onScore(prev.level + 1);
          return {
            ...prev,
            level: prev.level + 1,
            exp: newExp - 100,
            attack: prev.attack + 2,
            hp: 100
          };
        }
        return { ...prev, exp: newExp };
      });
      newLog.push(`Враг побежден! +${expGain} опыта`);
      setInCombat(false);
    } else {
      setEnemy(prev => ({ ...prev, hp: newEnemyHp }));
      
      const enemyDamage = enemy.attack + Math.floor(Math.random() * 5);
      const newPlayerHp = player.hp - enemyDamage;
      
      if (newPlayerHp <= 0) {
        newLog.push('Вы погибли!');
        setPlayer({ hp: 100, attack: 10, level: 1, exp: 0 });
        setInCombat(false);
      } else {
        newLog.push(`Враг нанес ${enemyDamage} урона`);
        setPlayer(prev => ({ ...prev, hp: newPlayerHp }));
      }
    }

    setLog(newLog.slice(-5));
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">
        Уровень {player.level}
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="space-y-2">
          <div className="text-cyber-blue">Игрок</div>
          <div className="text-sm">HP: {player.hp}/100</div>
          <div className="text-sm">Атака: {player.attack}</div>
          <div className="text-sm">Опыт: {player.exp}/100</div>
        </div>
        
        {inCombat && (
          <div className="space-y-2">
            <div className="text-cyber-red">{enemy.name}</div>
            <div className="text-sm">HP: {enemy.hp}</div>
            <div className="text-sm">Атака: {enemy.attack}</div>
          </div>
        )}
      </div>
      
      <div className="h-20 w-full max-w-md border border-cyber-blue p-2 text-xs overflow-y-auto">
        {log.map((entry, i) => (
          <div key={i} className="text-muted-foreground">{entry}</div>
        ))}
      </div>
      
      <div className="flex space-x-2">
        {!inCombat ? (
          <Button onClick={startCombat} className="cyber-button">Найти врага</Button>
        ) : (
          <Button onClick={attack} className="cyber-button">Атаковать</Button>
        )}
      </div>
    </div>
  );
};

const StrategyGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [units, setUnits] = useState<{x: number, y: number, team: number}[]>([
    { x: 1, y: 7, team: 1 },
    { x: 2, y: 7, team: 1 },
    { x: 6, y: 0, team: 2 },
    { x: 7, y: 0, team: 2 }
  ]);
  const [selected, setSelected] = useState<number | null>(null);
  const [turn, setTurn] = useState(1);
  const [score, setScore] = useState(0);

  const moveUnit = (toX: number, toY: number) => {
    if (selected === null) return;

    const unit = units[selected];
    if (unit.team !== turn) return;

    const distance = Math.abs(unit.x - toX) + Math.abs(unit.y - toY);
    if (distance > 2) return;

    const targetUnit = units.find(u => u.x === toX && u.y === toY);
    
    if (targetUnit) {
      if (targetUnit.team !== unit.team) {
        // Attack
        setUnits(prev => prev.filter((_, i) => i !== units.indexOf(targetUnit)));
        setScore(prev => {
          const newScore = prev + 10;
          onScore(newScore);
          return newScore;
        });
      }
    } else {
      // Move
      setUnits(prev => prev.map((u, i) => 
        i === selected ? { ...u, x: toX, y: toY } : u
      ));
    }

    setSelected(null);
    setTurn(turn === 1 ? 2 : 1);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">
        Ход: Команда {turn} | Счет: {score}
      </div>
      
      <div className="grid grid-cols-8 gap-1 border-2 border-cyber-blue neon-border p-2">
        {Array.from({ length: 64 }, (_, i) => {
          const x = i % 8;
          const y = Math.floor(i / 8);
          const unit = units.find(u => u.x === x && u.y === y);
          
          return (
            <div
              key={i}
              onClick={() => unit ? setSelected(units.indexOf(unit)) : moveUnit(x, y)}
              className={`w-8 h-8 border border-gray-600 cursor-pointer flex items-center justify-center text-xs ${
                selected === units.indexOf(unit) ? 'bg-cyber-purple' :
                unit ? (unit.team === 1 ? 'bg-cyber-blue' : 'bg-cyber-red') : 'bg-gray-800'
              }`}
            >
              {unit && (unit.team === 1 ? '🤖' : '👾')}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const QuizGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const questions = [
    { q: 'Какой язык программирования используется для веб-разработки?', a: ['JavaScript', 'Python', 'C++', 'Java'], correct: 0 },
    { q: 'Что означает CSS?', a: ['Computer Style Sheets', 'Creative Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets'], correct: 2 },
    { q: 'Кто создал Linux?', a: ['Билл Гейтс', 'Стив Джобс', 'Линус Торвальдс', 'Марк Цукерберг'], correct: 2 },
    { q: 'Что такое HTML?', a: ['Язык программирования', 'База данных', 'Язык разметки', 'Операционная система'], correct: 2 }
  ];

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const selectAnswer = (index: number) => {
    if (answered) return;
    
    setSelectedAnswer(index);
    setAnswered(true);
    
    if (index === questions[currentQ].correct) {
      const newScore = score + 10;
      setScore(newScore);
      onScore(newScore);
    }
    
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrentQ(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
  };

  if (currentQ >= questions.length) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="text-2xl font-bold text-cyber-blue neon-text">
          Игра окончена!
        </div>
        <div className="text-xl text-cyber-purple">
          Итоговый счет: {score}/{questions.length * 10}
        </div>
        <Button onClick={resetGame} className="cyber-button">
          Играть снова
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 max-w-md">
      <div className="text-xl font-bold text-cyber-blue neon-text">
        Вопрос {currentQ + 1}/{questions.length} | Счет: {score}
      </div>
      
      <div className="text-center p-4 border border-cyber-blue rounded">
        {questions[currentQ].q}
      </div>
      
      <div className="w-full space-y-2">
        {questions[currentQ].a.map((answer, i) => (
          <Button
            key={i}
            onClick={() => selectAnswer(i)}
            disabled={answered}
            className={`w-full cyber-button text-left justify-start ${
              answered && i === questions[currentQ].correct ? 'bg-green-600' :
              answered && i === selectedAnswer && i !== questions[currentQ].correct ? 'bg-red-600' : ''
            }`}
          >
            {answer}
          </Button>
        ))}
      </div>
    </div>
  );
};

const RhythmGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [notes, setNotes] = useState<{lane: number, y: number}[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameRef = useRef<NodeJS.Timeout>();

  const resetGame = () => {
    setNotes([]);
    setScore(0);
    setCombo(0);
    setIsPlaying(true);
  };

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    setNotes(prev => {
      let newNotes = prev.map(n => ({ ...n, y: n.y + 3 })).filter(n => n.y < 300);
      
      if (Math.random() < 0.05) {
        newNotes.push({ lane: Math.floor(Math.random() * 4), y: 0 });
      }
      
      return newNotes;
    });
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      gameRef.current = setTimeout(updateGame, 16);
    }
    return () => {
      if (gameRef.current) clearTimeout(gameRef.current);
    };
  }, [updateGame, isPlaying]);

  const hitNote = (lane: number) => {
    const noteIndex = notes.findIndex(n => n.lane === lane && n.y > 200 && n.y < 280);
    
    if (noteIndex !== -1) {
      setNotes(prev => prev.filter((_, i) => i !== noteIndex));
      setScore(prev => {
        const newScore = prev + (10 * (combo + 1));
        onScore(newScore);
        return newScore;
      });
      setCombo(prev => prev + 1);
    } else {
      setCombo(0);
    }
  };

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      switch (e.key) {
        case 'a': hitNote(0); break;
        case 's': hitNote(1); break;
        case 'd': hitNote(2); break;
        case 'f': hitNote(3); break;
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isPlaying, notes, combo]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">
        Счет: {score} | Комбо: x{combo}
      </div>
      
      <div className="relative w-80 h-72 border-2 border-cyber-blue neon-border bg-black/50">
        {[0, 1, 2, 3].map(lane => (
          <div
            key={lane}
            className="absolute w-20 h-full border-r border-cyber-blue opacity-30"
            style={{ left: `${lane * 80}px` }}
          />
        ))}
        
        {notes.map((note, i) => (
          <div
            key={i}
            className="absolute w-16 h-8 bg-cyber-red rounded"
            style={{
              left: `${note.lane * 80 + 10}px`,
              top: `${note.y}px`
            }}
          />
        ))}
        
        <div className="absolute bottom-8 left-0 w-full h-8 bg-cyber-blue opacity-50" />
      </div>
      
      <div className="flex space-x-2">
        {['A', 'S', 'D', 'F'].map(key => (
          <Button
            key={key}
            className="cyber-button w-16"
            onMouseDown={() => hitNote(['A', 'S', 'D', 'F'].indexOf(key))}
          >
            {key}
          </Button>
        ))}
      </div>
      
      {!isPlaying && (
        <Button onClick={resetGame} className="cyber-button">
          Старт
        </Button>
      )}
    </div>
  );
};

const IdleGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [resources, setResources] = useState({ energy: 0, crystals: 0, robots: 1 });
  const [upgrades, setUpgrades] = useState({ energyRate: 1, crystalRate: 1, robotCost: 10 });

  useEffect(() => {
    const interval = setInterval(() => {
      setResources(prev => ({
        ...prev,
        energy: prev.energy + upgrades.energyRate * prev.robots,
        crystals: prev.crystals + upgrades.crystalRate
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [upgrades]);

  const buyRobot = () => {
    if (resources.energy >= upgrades.robotCost) {
      setResources(prev => ({
        ...prev,
        energy: prev.energy - upgrades.robotCost,
        robots: prev.robots + 1
      }));
      setUpgrades(prev => ({ ...prev, robotCost: Math.floor(prev.robotCost * 1.5) }));
      onScore(resources.robots + 1);
    }
  };

  const upgradeEnergy = () => {
    const cost = upgrades.energyRate * 20;
    if (resources.energy >= cost) {
      setResources(prev => ({ ...prev, energy: prev.energy - cost }));
      setUpgrades(prev => ({ ...prev, energyRate: prev.energyRate + 1 }));
    }
  };

  const upgradeCrystals = () => {
    const cost = upgrades.crystalRate * 50;
    if (resources.crystals >= cost) {
      setResources(prev => ({ ...prev, crystals: prev.crystals - cost }));
      setUpgrades(prev => ({ ...prev, crystalRate: prev.crystalRate + 1 }));
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">
        Киберферма
      </div>
      
      <div className="grid grid-cols-1 gap-2 text-center">
        <div className="text-cyber-blue">⚡ Энергия: {Math.floor(resources.energy)}</div>
        <div className="text-cyber-purple">💎 Кристаллы: {Math.floor(resources.crystals)}</div>
        <div className="text-cyber-green">🤖 Роботы: {resources.robots}</div>
      </div>
      
      <div className="space-y-2">
        <Button
          onClick={buyRobot}
          disabled={resources.energy < upgrades.robotCost}
          className="cyber-button w-full"
        >
          Купить робота ({upgrades.robotCost} энергии)
        </Button>
        
        <Button
          onClick={upgradeEnergy}
          disabled={resources.energy < upgrades.energyRate * 20}
          className="cyber-button w-full"
        >
          Улучшить энергию ({upgrades.energyRate * 20} энергии)
        </Button>
        
        <Button
          onClick={upgradeCrystals}
          disabled={resources.crystals < upgrades.crystalRate * 50}
          className="cyber-button w-full"
        >
          Улучшить кристаллы ({upgrades.crystalRate * 50} кристаллов)
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        <div>Энергия/сек: {upgrades.energyRate * resources.robots}</div>
        <div>Кристаллы/сек: {upgrades.crystalRate}</div>
      </div>
    </div>
  );
};

const TetrisGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<{shape: number[][], x: number, y: number} | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout>();

  const GRID_WIDTH = 10;
  const GRID_HEIGHT = 20;

  const tetrisPieces = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,0],[1,1,1]], // T
    [[0,1,1],[1,1,0]], // S
    [[1,1,0],[0,1,1]], // Z
    [[1,0,0],[1,1,1]], // J
    [[0,0,1],[1,1,1]]  // L
  ];

  const initGrid = () => {
    return Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0));
  };

  const spawnPiece = () => {
    const piece = tetrisPieces[Math.floor(Math.random() * tetrisPieces.length)];
    return {
      shape: piece,
      x: Math.floor(GRID_WIDTH / 2) - Math.floor(piece[0].length / 2),
      y: 0
    };
  };

  const resetGame = () => {
    setGrid(initGrid());
    setCurrentPiece(spawnPiece());
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    audioManager.playMenuSound();
  };

  const canMovePiece = (piece: any, dx: number, dy: number, newGrid = grid) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + dx;
          const newY = piece.y + y + dy;
          
          if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) return false;
          if (newY >= 0 && newGrid[newY][newX]) return false;
        }
      }
    }
    return true;
  };

  const placePiece = (piece: any, gameGrid: number[][]) => {
    const newGrid = gameGrid.map(row => [...row]);
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const gridY = piece.y + y;
          const gridX = piece.x + x;
          if (gridY >= 0) {
            newGrid[gridY][gridX] = 1;
          }
        }
      }
    }
    return newGrid;
  };

  const clearLines = (gameGrid: number[][]) => {
    let linesCleared = 0;
    const newGrid = gameGrid.filter(row => {
      if (row.every(cell => cell === 1)) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (newGrid.length < GRID_HEIGHT) {
      newGrid.unshift(Array(GRID_WIDTH).fill(0));
    }

    if (linesCleared > 0) {
      audioManager.playSuccessSound();
      const points = linesCleared * 100 * linesCleared;
      setScore(prev => prev + points);
      onScore(points);
    }

    return newGrid;
  };

  const gameLoop = useCallback(() => {
    if (!currentPiece || gameOver || !isPlaying) return;

    if (canMovePiece(currentPiece, 0, 1)) {
      setCurrentPiece(prev => prev ? {...prev, y: prev.y + 1} : null);
    } else {
      const newGrid = placePiece(currentPiece, grid);
      const clearedGrid = clearLines(newGrid);
      setGrid(clearedGrid);
      
      const newPiece = spawnPiece();
      if (!canMovePiece(newPiece, 0, 0, clearedGrid)) {
        setGameOver(true);
        setIsPlaying(false);
        audioManager.playErrorSound();
      } else {
        setCurrentPiece(newPiece);
        audioManager.playCollectSound();
      }
    }
  }, [currentPiece, grid, gameOver, isPlaying]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setTimeout(gameLoop, 500);
      return () => {
        if (gameLoopRef.current) {
          clearTimeout(gameLoopRef.current);
        }
      };
    }
  }, [gameLoop, isPlaying, gameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentPiece || !isPlaying || gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          if (canMovePiece(currentPiece, -1, 0)) {
            setCurrentPiece(prev => prev ? {...prev, x: prev.x - 1} : null);
          }
          break;
        case 'ArrowRight':
          if (canMovePiece(currentPiece, 1, 0)) {
            setCurrentPiece(prev => prev ? {...prev, x: prev.x + 1} : null);
          }
          break;
        case 'ArrowDown':
          if (canMovePiece(currentPiece, 0, 1)) {
            setCurrentPiece(prev => prev ? {...prev, y: prev.y + 1} : null);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPiece, isPlaying, gameOver]);

  const renderGrid = () => {
    const displayGrid = grid.map(row => [...row]);
    
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const gridY = currentPiece.y + y;
            const gridX = currentPiece.x + x;
            if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
              displayGrid[gridY][gridX] = 2;
            }
          }
        }
      }
    }

    return displayGrid.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className={`w-6 h-6 border border-gray-600 ${
              cell === 1 ? 'bg-cyber-blue' : 
              cell === 2 ? 'bg-cyber-purple' : 
              'bg-gray-900'
            }`}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="text-2xl font-bold text-cyber-blue neon-text">
        Счет: {score}
      </div>
      
      <div className="border-2 border-cyber-blue rounded-lg p-2 bg-gray-900">
        {renderGrid()}
      </div>

      {gameOver && (
        <div className="text-center space-y-2">
          <div className="text-red-500 font-bold">Игра окончена!</div>
          <div className="text-cyber-blue">Финальный счет: {score}</div>
        </div>
      )}

      <div className="flex space-x-2">
        <Button 
          onClick={resetGame}
          className="bg-cyber-green hover:bg-cyber-green/80 text-black font-bold"
        >
          {gameOver ? 'Играть снова' : 'Новая игра'}
        </Button>
      </div>

      <div className="text-xs text-gray-400 text-center">
        ← → перемещение<br/>
        ↓ ускорение
      </div>
    </div>
  );
};

// Main Component
export default function Index() {
  const [totalScore, setTotalScore] = useState(0);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showAudioControls, setShowAudioControls] = useState(false);

  useEffect(() => {
    // Start background music when component mounts
    const timer = setTimeout(() => {
      audioManager.startBackgroundMusic();
    }, 1000);

    return () => {
      clearTimeout(timer);
      audioManager.stopBackgroundMusic();
    };
  }, []);

  const games = [
    { id: 'snake', name: 'Змейка', description: 'Классическая игра змейка с неоновым стилем', icon: 'Zap', component: SnakeGame },
    { id: 'clicker', name: 'Кликер', description: 'Кликай и зарабатывай очки для улучшений', icon: 'MousePointer', component: ClickerGame },
    { id: 'memory', name: 'Память', description: 'Запоминай последовательность цветов', icon: 'Brain', component: MemoryGame },
    { id: 'tetris', name: 'Тетрис', description: 'Складывай блоки в линии', icon: 'Grid3x3', component: TetrisGame },
    { id: 'pong', name: 'Понг', description: 'Классический пинг-понг в киберстиле', icon: 'Circle', component: PongGame },
    { id: 'breakout', name: 'Арканоид', description: 'Разбивай блоки мячиком', icon: 'Square', component: BreakoutGame },
    { id: 'flappy', name: 'Летающая птица', description: 'Пролетай между препятствиями', icon: 'Bird', component: FlappyGame },
    { id: 'maze', name: 'Лабиринт', description: 'Найди выход из неонового лабиринта', icon: 'MapPin', component: MazeGame },
    { id: 'racing', name: 'Гонки', description: 'Киберспорт гонки на выживание', icon: 'Car', component: RacingGame },
    { id: 'space', name: 'Космос', description: 'Защищай Землю от астероидов', icon: 'Rocket', component: SpaceGame },
    { id: 'puzzle', name: 'Пазл', description: 'Собирай картинки по кусочкам', icon: 'Puzzle', component: PuzzleGame },
    { id: 'platformer', name: 'Платформер', description: 'Прыгай по неоновым платформам', icon: 'Mountain', component: PlatformerGame },
    { id: 'match3', name: 'Три в ряд', description: 'Собирай комбинации из трех', icon: 'Gem', component: Match3Game },
    { id: 'tower', name: 'Башня', description: 'Строй самую высокую башню', icon: 'Building', component: TowerGame },
    { id: 'cards', name: 'Карты', description: 'Киберпанк покер и блэкджек', icon: 'Spade', component: CardsGame },
    { id: 'rpg', name: 'РПГ', description: 'Прокачивай своего кибер-героя', icon: 'Sword', component: RPGGame },
    { id: 'strategy', name: 'Стратегия', description: 'Командуй армией роботов', icon: 'Shield', component: StrategyGame },
    { id: 'quiz', name: 'Викторина', description: 'Проверь свои знания', icon: 'HelpCircle', component: QuizGame },
    { id: 'rhythm', name: 'Ритм', description: 'Попадай в такт киберпанк музыки', icon: 'Music', component: RhythmGame },
    { id: 'idle', name: 'Idle', description: 'Автоматическая киберферма', icon: 'Zap', component: IdleGame }
  ];

  const handleScore = (score: number) => {
    setTotalScore(prev => Math.max(prev, score));
  };

  const SelectedGameComponent = selectedGame ? games.find(g => g.id === selectedGame)?.component : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-black text-cyber-red neon-text font-['Orbitron']">
                RED HACKER GAMES
              </div>
              <div className="text-lg text-cyber-blue neon-text">
                Общий счет: {totalScore}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowAudioControls(!showAudioControls)}
                variant="outline"
                className="border-cyber-purple text-cyber-purple hover:bg-cyber-purple hover:text-black"
              >
                <Icon name="Volume2" size={16} className="mr-2" />
                Звук
              </Button>
              {selectedGame && (
                <Button 
                  onClick={() => {
                    setSelectedGame(null);
                    audioManager.playMenuSound();
                  }}
                  variant="outline"
                  className="border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-black"
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Назад к играм
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Audio Controls Modal */}
      {showAudioControls && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative">
            <Button
              onClick={() => setShowAudioControls(false)}
              className="absolute -top-2 -right-2 z-10 w-8 h-8 p-0 rounded-full bg-cyber-red hover:bg-cyber-red/80"
            >
              <Icon name="X" size={16} />
            </Button>
            <AudioControls />
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {!selectedGame ? (
          <>
            {/* Hero Section */}
            <section className="text-center mb-12">
              <h1 className="text-6xl font-black mb-4 text-transparent bg-gradient-to-r from-cyber-red via-cyber-blue to-cyber-purple bg-clip-text neon-text">
                КИБЕРСПОРТ АРЕНА
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                20 захватывающих игр в стиле киберпанк
              </p>
              <div className="flex justify-center items-center space-x-4 text-cyber-blue">
                <Icon name="Gamepad2" size={24} />
                <span>Создано Red Hacker</span>
                <Icon name="Zap" size={24} />
              </div>
            </section>

            {/* Games Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map((game) => (
                <Card
                  key={game.id}
                  className="game-card cursor-pointer"
                  onClick={() => {
                    setSelectedGame(game.id);
                    audioManager.playMenuSound();
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-cyber-blue neon-text flex items-center space-x-2">
                        <Icon name={game.icon as any} size={20} />
                        <span>{game.name}</span>
                      </CardTitle>
                      <Icon name="Play" size={16} className="text-cyber-red" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground">
                      {game.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </section>
          </>
        ) : (
          <section className="flex justify-center">
            <Card className="game-card w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="text-center text-2xl text-cyber-blue neon-text">
                  {games.find(g => g.id === selectedGame)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                {SelectedGameComponent && <SelectedGameComponent onScore={handleScore} />}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-border bg-card/50 mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center space-y-4">
              <div className="text-cyber-red neon-text font-bold text-lg">
                Создано Red Hacker
              </div>
              <a
                href="https://t.me/red_hacker88"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-cyber-blue hover:text-cyber-purple transition-colors neon-text"
              >
                <Icon name="MessageCircle" size={20} />
                <span>Telegram канал автора</span>
              </a>
              <div className="text-sm text-muted-foreground">
                Все игры созданы с использованием современных веб-технологий
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}