import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

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
        return prevSnake;
      }

      for (const segment of newSnake) {
        if (head[0] === segment[0] && head[1] === segment[1]) {
          setGameOver(true);
          setIsPlaying(false);
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

const TetrisGame = ({ onScore }: { onScore: (score: number) => void }) => {
  const [board, setBoard] = useState(() => Array(20).fill(null).map(() => Array(10).fill(0)));
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    setBoard(Array(20).fill(null).map(() => Array(10).fill(0)));
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xl font-bold text-cyber-blue neon-text">Счет: {score}</div>
      <div className="grid grid-cols-10 gap-0 border-2 border-cyber-blue neon-border bg-black/50 p-2">
        {board.flat().map((cell, index) => (
          <div
            key={index}
            className={`w-4 h-4 border border-gray-700 ${
              cell ? 'bg-cyber-blue' : 'bg-gray-900'
            }`}
          />
        ))}
      </div>
      {!isPlaying && (
        <Button onClick={startGame} className="cyber-button">
          {gameOver ? 'Играть снова' : 'Старт'}
        </Button>
      )}
    </div>
  );
};

// Main Component
export default function Index() {
  const [totalScore, setTotalScore] = useState(0);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    { id: 'snake', name: 'Змейка', description: 'Классическая игра змейка с неоновым стилем', icon: 'Zap', component: SnakeGame },
    { id: 'clicker', name: 'Кликер', description: 'Кликай и зарабатывай очки для улучшений', icon: 'MousePointer', component: ClickerGame },
    { id: 'memory', name: 'Память', description: 'Запоминай последовательность цветов', icon: 'Brain', component: MemoryGame },
    { id: 'tetris', name: 'Тетрис', description: 'Складывай блоки в линии', icon: 'Grid3x3', component: TetrisGame },
    { id: 'pong', name: 'Понг', description: 'Классический пинг-понг в киберстиле', icon: 'Circle', component: () => <div className="text-center">Скоро...</div> },
    { id: 'breakout', name: 'Арканоид', description: 'Разбивай блоки мячиком', icon: 'Square', component: () => <div className="text-center">Скоро...</div> },
    { id: 'flappy', name: 'Летающая птица', description: 'Пролетай между препятствиями', icon: 'Bird', component: () => <div className="text-center">Скоро...</div> },
    { id: 'maze', name: 'Лабиринт', description: 'Найди выход из неонового лабиринта', icon: 'MapPin', component: () => <div className="text-center">Скоро...</div> },
    { id: 'racing', name: 'Гонки', description: 'Киберспорт гонки на выживание', icon: 'Car', component: () => <div className="text-center">Скоро...</div> },
    { id: 'space', name: 'Космос', description: 'Защищай Землю от астероидов', icon: 'Rocket', component: () => <div className="text-center">Скоро...</div> },
    { id: 'puzzle', name: 'Пазл', description: 'Собирай картинки по кусочкам', icon: 'Puzzle', component: () => <div className="text-center">Скоро...</div> },
    { id: 'platformer', name: 'Платформер', description: 'Прыгай по неоновым платформам', icon: 'Mountain', component: () => <div className="text-center">Скоро...</div> },
    { id: 'match3', name: 'Три в ряд', description: 'Собирай комбинации из трех', icon: 'Gem', component: () => <div className="text-center">Скоро...</div> },
    { id: 'tower', name: 'Башня', description: 'Строй самую высокую башню', icon: 'Building', component: () => <div className="text-center">Скоро...</div> },
    { id: 'cards', name: 'Карты', description: 'Киберпанк покер и блэкджек', icon: 'Spade', component: () => <div className="text-center">Скоро...</div> },
    { id: 'rpg', name: 'РПГ', description: 'Прокачивай своего кибер-героя', icon: 'Sword', component: () => <div className="text-center">Скоро...</div> },
    { id: 'strategy', name: 'Стратегия', description: 'Командуй армией роботов', icon: 'Shield', component: () => <div className="text-center">Скоро...</div> },
    { id: 'quiz', name: 'Викторина', description: 'Проверь свои знания', icon: 'HelpCircle', component: () => <div className="text-center">Скоро...</div> },
    { id: 'rhythm', name: 'Ритм', description: 'Попадай в такт киберпанк музыки', icon: 'Music', component: () => <div className="text-center">Скоро...</div> },
    { id: 'idle', name: 'Idle', description: 'Автоматическая киберферма', icon: 'Zap', component: () => <div className="text-center">Скоро...</div> }
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
            {selectedGame && (
              <Button 
                onClick={() => setSelectedGame(null)}
                variant="outline"
                className="border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-black"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Назад к играм
              </Button>
            )}
          </div>
        </div>
      </header>

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
                  onClick={() => setSelectedGame(game.id)}
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
      </main>

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
    </div>
  );
}