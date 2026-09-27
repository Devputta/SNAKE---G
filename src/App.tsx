/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Direction, GameState, PlayerStats } from './types/game';
import { GameEngine, GameEngineState } from './game/game-engine';
import { loadStats, saveStats, recordGameSession, clearStats } from './storage/progress';
import { sound } from './audio/sound';
import { Navigation } from './components/Navigation';
import { GameBoard } from './components/GameBoard';
import { MobileControls } from './components/MobileControls';
import { RecordsModal } from './components/RecordsModal';
import { SettingsModal } from './components/SettingsModal';
import { GameOverOverlay } from './components/GameOverOverlay';
import { CelebrationOverlay, CelebrationData } from './components/CelebrationOverlay';
import { MobileTapOverlay } from './components/MobileTapOverlay';

// Dynamic viewport grid calculation: perfectly fits mobile and desktop without scrolling
function calculateGridDimensions(isInvisibleMode: boolean = true): { gridWidth: number; gridHeight: number } {
  if (typeof window === 'undefined') return { gridWidth: 38, gridHeight: 24 };

  const w = window.innerWidth;
  const h = window.innerHeight;
  const isMobile = w < 768;

  const topNavH = 40; // dedicated top bar
  const bottomFooterH = isMobile ? (isInvisibleMode ? 44 : 155) : 36; // dedicated bottom bar outside playground
  const padW = isMobile ? 8 : 20;
  const padH = isMobile ? 8 : 12;

  const availableW = Math.max(240, w - padW * 2);
  const availableH = Math.max(160, h - topNavH - bottomFooterH - padH * 2);

  // In vertical mobile view with invisible taps, the grid expands tall for a full-screen vertical arcade feel
  const cellSize = isMobile ? Math.max(16, Math.min(22, Math.floor(availableW / 20))) : 23;
  const gridWidth = Math.max(14, Math.floor(availableW / cellSize));
  const gridHeight = Math.max(16, Math.floor(availableH / cellSize));

  return { gridWidth, gridHeight };
}

export default function App() {
  // 1. Player Career Stats & Preferences (defaulting to Light Mode and authentic materials)
  const [stats, setStats] = useState<PlayerStats>(() => {
    const loaded = loadStats();
    sound.setEnabled(loaded.soundEnabled);
    return loaded;
  });

  // 2. Game State & Menu Open State
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 3. Grid dimensions based on full viewport and mobile control style
  const [gridSize, setGridSize] = useState(() =>
    calculateGridDimensions(stats.mobileControlStyle === 'invisible')
  );

  // 4. Engine Instance (starts small, walls wrap around, only dies when biting itself)
  const engineRef = useRef<GameEngine>(
    new GameEngine(
      gridSize.gridWidth,
      gridSize.gridHeight,
      stats.initialSnakeLength,
      stats.initialSpeed
    )
  );

  const [engineState, setEngineState] = useState<GameEngineState>(engineRef.current.state);

  // 5. FX Triggers & Records
  const [eatTrigger, setEatTrigger] = useState(0);
  const [deathTrigger, setDeathTrigger] = useState(0);
  const [speedUpTrigger, setSpeedUpTrigger] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // 6. Milestone celebrations (Length 50, 100, 150, 200, etc. & Level Ups) - never pauses, zero gameplay effect
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);
  const lastCelebratedLengthRef = useRef(0);
  const lastCelebratedLevelRef = useRef(1);
  const celebrationTimerRef = useRef<number | null>(null);

  const triggerCelebration = useCallback(
    (type: 'level' | 'length', title: string, subtitle: string) => {
      sound.playCelebration();
      setCelebration({
        id: Date.now(),
        type,
        title,
        subtitle,
      });

      if (celebrationTimerRef.current !== null) {
        window.clearTimeout(celebrationTimerRef.current);
      }
      celebrationTimerRef.current = window.setTimeout(() => {
        setCelebration(null);
      }, 2600);
    },
    []
  );

  // Dynamic window resize listener & control mode layout updater
  useEffect(() => {
    const handleResize = () => {
      const isInvisible = stats.mobileControlStyle === 'invisible';
      const { gridWidth, gridHeight } = calculateGridDimensions(isInvisible);
      setGridSize({ gridWidth, gridHeight });
      engineRef.current.updateDimensions(gridWidth, gridHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [stats.mobileControlStyle]);

  // Update Settings
  const updateStats = useCallback((updates: Partial<PlayerStats>) => {
    setStats((prev) => {
      const next = { ...prev, ...updates };
      if (typeof updates.soundEnabled === 'boolean') {
        sound.setEnabled(updates.soundEnabled);
      }
      saveStats(next);
      return next;
    });
  }, []);

  // Clear records
  const handleResetStats = useCallback(() => {
    const fresh = clearStats();
    setStats(fresh);
    sound.setEnabled(fresh.soundEnabled);
  }, []);

  // Toggle Theme between Light & Dark
  const handleToggleTheme = useCallback(() => {
    updateStats({ theme: stats.theme === 'light' ? 'dark' : 'light' });
  }, [stats.theme, updateStats]);

  // Menu Open/Close: Clicking menu bar pauses game and shows navigation drawer
  const handleToggleMenu = useCallback(() => {
    if (isMenuOpen || gameState === 'PAUSED') {
      setIsMenuOpen(false);
      setGameState('PLAYING');
      sound.playClick();
    } else if (gameState === 'PLAYING') {
      setIsMenuOpen(true);
      setGameState('PAUSED');
      sound.playClick();
    }
  }, [isMenuOpen, gameState]);

  // Restart Game
  const restartGame = useCallback(() => {
    const isInvisible = stats.mobileControlStyle === 'invisible';
    const { gridWidth, gridHeight } = calculateGridDimensions(isInvisible);
    engineRef.current.reset(
      gridWidth,
      gridHeight,
      stats.initialSnakeLength,
      stats.initialSpeed
    );
    setEngineState({ ...engineRef.current.state });
    setIsNewRecord(false);
    setSpeedUpTrigger(0);
    lastCelebratedLengthRef.current = 0;
    lastCelebratedLevelRef.current = 1;
    setCelebration(null);
    setIsMenuOpen(false);
    setGameState('PLAYING');
    sound.playClick();
  }, [stats.initialSnakeLength, stats.initialSpeed, stats.mobileControlStyle]);

  // Steer Input
  const handleDirection = useCallback((dir: Direction) => {
    if (gameState === 'PAUSED' || isMenuOpen) {
      setIsMenuOpen(false);
      setGameState('PLAYING');
    } else if (gameState !== 'PLAYING') {
      return;
    }
    engineRef.current.queueDirection(dir);
    sound.playTurn();
  }, [gameState, isMenuOpen]);

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    updateStats({ soundEnabled: !stats.soundEnabled });
  }, [stats.soundEnabled, updateStats]);

  // Main Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let lastTime = performance.now();
    let tickAccumulator = 0;
    let animId: number;

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const tickRate = engineRef.current.state.speed / 1000;
      tickAccumulator += dt;

      while (tickAccumulator >= tickRate) {
        tickAccumulator -= tickRate;
        const result = engineRef.current.tick(tickRate);

        if (result.ateFood) {
          sound.playEat();
          setEatTrigger((prev) => prev + 1);

          // Milestone Celebration for snake length 50, 100, 150, 200, etc. (never pauses, zero effect on play)
          const currentLen = engineRef.current.state.snake.length;
          const lengthMilestone = Math.floor(currentLen / 50) * 50;
          if (
            lengthMilestone >= 50 &&
            lengthMilestone > lastCelebratedLengthRef.current &&
            currentLen >= lengthMilestone
          ) {
            lastCelebratedLengthRef.current = lengthMilestone;
            triggerCelebration(
              'length',
              `Length ${lengthMilestone}!`,
              `Monumental snake scale achieved`
            );
          }
        }

        if (result.speedIncreased) {
          sound.playSpeedUp();
          setSpeedUpTrigger((prev) => prev + 1);

          // Level Up Celebration (never pauses, zero effect on play)
          const newLvl = engineRef.current.state.speedLevel;
          if (newLvl > lastCelebratedLevelRef.current) {
            lastCelebratedLevelRef.current = newLvl;
            triggerCelebration(
              'level',
              `Level ${newLvl} Reached!`,
              `Pace tier increased • Stay sharp`
            );
          }
        }

        if (result.died) {
          sound.playGameOver();
          setDeathTrigger((prev) => prev + 1);

          // Save game record into career statistics
          const finalScore = engineRef.current.state.score;
          const finalLength = engineRef.current.state.snake.length;
          const foodEaten = engineRef.current.state.foodEaten;
          const elapsed = engineRef.current.state.elapsedSeconds;

          const { stats: updatedStats, isNewRecord: newRec } = recordGameSession(
            finalScore,
            finalLength,
            foodEaten,
            elapsed
          );

          setStats(updatedStats);
          setIsNewRecord(newRec);
          setIsMenuOpen(false);
          setGameState('GAME_OVER');
          setEngineState({ ...engineRef.current.state });
          return;
        }
      }

      setEngineState({ ...engineRef.current.state });
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  // Global Desktop Keyboard Bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        handleDirection('UP');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        handleDirection('DOWN');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleDirection('LEFT');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleDirection('RIGHT');
      } else if (e.key === 'p' || e.key === 'P' || e.key === ' ') {
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
          handleToggleMenu();
        } else if (gameState === 'GAME_OVER') {
          restartGame();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        restartGame();
      } else if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } else if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } else if (e.key === 'Escape') {
        if (isMenuOpen || gameState === 'PAUSED') {
          setIsMenuOpen(false);
          setGameState('PLAYING');
        } else if (gameState === 'PLAYING') {
          handleToggleMenu();
        } else if (gameState === 'RECORDS' || gameState === 'SETTINGS') {
          setGameState('PLAYING');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isMenuOpen, handleDirection, handleToggleMenu, restartGame]);

  // Touch Swipe Gestures for Mobile
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const minSwipeDistance = 22; // px

    if (Math.max(absX, absY) > minSwipeDistance) {
      if (absX > absY) {
        handleDirection(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        handleDirection(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    touchStartRef.current = null;
  };

  const isLight = stats.theme === 'light';

  return (
    <div
      className={`relative w-screen h-screen flex flex-col select-none overflow-hidden overscroll-none font-mono transition-colors ${
        isLight ? 'bg-[#f7f6f2] text-[#1c1f24]' : 'bg-[#141619] text-[#e8e6e1]'
      }`}
    >
      {/* 1. Disappearing Menu Bar & Drawer (Clicking pauses the game and shows full menu) */}
      <Navigation
        gameState={gameState}
        isMenuOpen={isMenuOpen}
        onToggleMenu={handleToggleMenu}
        onOpenRecords={() => {
          setIsMenuOpen(false);
          setGameState('RECORDS');
        }}
        onOpenSettings={() => {
          setIsMenuOpen(false);
          setGameState('SETTINGS');
        }}
        soundEnabled={stats.soundEnabled}
        onToggleSound={handleToggleSound}
        onRestart={restartGame}
        score={engineState.score}
        length={engineState.snake.length}
        highScore={stats.highScore}
        speedLevel={engineState.speedLevel}
        foodCount={engineState.foodEaten}
        theme={stats.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. THE PLAYGROUND: Centered, strictly bounded, completely separate from top and bottom bars */}
      <main
        className="relative flex-1 w-full min-h-0 overflow-hidden flex flex-col items-center justify-center p-1.5 sm:p-3"
        onTouchStart={stats.mobileControlStyle === 'dpad' ? handleTouchStart : undefined}
        onTouchEnd={stats.mobileControlStyle === 'dpad' ? handleTouchEnd : undefined}
      >
        <div className="relative w-full h-full min-h-0 flex items-center justify-center">
          <GameBoard
            engineState={engineState}
            reducedMotion={stats.reducedMotion}
            eatTrigger={eatTrigger}
            deathTrigger={deathTrigger}
            speedUpTrigger={speedUpTrigger}
            snakeSkinId={stats.snakeSkin}
            foodSkinId={stats.foodSkin}
            theme={stats.theme}
          />

          {/* Invisible Tap Navigation: Full vertical tap quadrants + ripples + haptics */}
          {stats.mobileControlStyle === 'invisible' && gameState === 'PLAYING' && (
            <MobileTapOverlay
              onDirection={handleDirection}
              currentDirection={engineState.direction}
              theme={stats.theme}
              showGuides={stats.showTapGuides}
              enabled={gameState === 'PLAYING'}
            />
          )}
        </div>

        {/* Game Over Dialog */}
        {gameState === 'GAME_OVER' && (
          <GameOverOverlay
            score={engineState.score}
            length={engineState.snake.length}
            foodEaten={engineState.foodEaten}
            survivalTime={engineState.elapsedSeconds}
            highScore={stats.highScore}
            speedLevel={engineState.speedLevel}
            isNewRecord={isNewRecord}
            onRetry={restartGame}
            onOpenRecords={() => setGameState('RECORDS')}
            theme={stats.theme}
          />
        )}
      </main>

      {/* 3. DEDICATED BOTTOM BAR: Outside the playground, never overlapping the board */}
      <footer
        className={`w-full shrink-0 px-3 sm:px-6 py-1.5 sm:py-2 flex flex-col md:flex-row items-center justify-between text-xs tabular-nums select-none transition-colors border-t z-20 ${
          isLight
            ? 'bg-[#f7f6f2] border-[#e8e5db] text-[#5a574f]'
            : 'bg-[#141619] border-[#22252a] text-[#9c9a93]'
        }`}
      >
        {/* Stats Row */}
        <div className="w-full flex items-center justify-between sm:justify-start sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                Length
              </span>
              <span className={`font-semibold text-xs ${isLight ? 'text-[#1c1f24]' : 'text-[#eae8e3]'}`}>
                {engineState.snake.length}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                Pace
              </span>
              <span className={`font-semibold text-xs ${isLight ? 'text-[#cf382b]' : '#e0584b'}`}>
                Lvl {engineState.speedLevel}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                Best
              </span>
              <span className={`font-semibold text-xs ${isLight ? 'text-[#1c1f24]' : 'text-[#eae8e3]'}`}>
                {stats.highScore.toString().padStart(6, '0')}
              </span>
            </div>
          </div>

          {/* Quick Mobile Controls Mode Switcher on phone bar */}
          <div className="md:hidden flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => updateStats({ mobileControlStyle: stats.mobileControlStyle === 'invisible' ? 'dpad' : 'invisible' })}
              className={`px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-semibold border transition-all cursor-pointer ${
                stats.mobileControlStyle === 'invisible'
                  ? isLight
                    ? 'bg-[#1c1f24] text-white border-[#1c1f24]'
                    : 'bg-white text-black border-white'
                  : isLight
                  ? 'border-[#d8d5ca] bg-white/70 text-[#4a473f]'
                  : 'border-[#363a42] bg-[#22252a] text-[#bbb8b0]'
              }`}
            >
              {stats.mobileControlStyle === 'invisible' ? 'TAP MODE' : 'D-PAD'}
            </button>

            {stats.mobileControlStyle === 'invisible' && (
              <button
                type="button"
                onClick={() => updateStats({ showTapGuides: !stats.showTapGuides })}
                className={`px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase border transition-all cursor-pointer ${
                  stats.showTapGuides
                    ? isLight
                      ? 'border-[#cf382b] text-[#cf382b] bg-[#cf382b]/10'
                      : 'border-[#e0584b] text-[#e0584b] bg-[#e0584b]/15'
                    : isLight
                    ? 'border-[#d8d5ca] text-[#8c897f]'
                    : 'border-[#363a42] text-[#70757d]'
                }`}
                title="Toggle invisible tap quadrant guides"
              >
                {stats.showTapGuides ? 'GUIDES: ON' : 'GUIDES'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile View Bottom Controls Area: Only displayed when physical D-Pad is chosen */}
        {stats.mobileControlStyle === 'dpad' && (
          <div className="md:hidden w-full pt-1.5 pb-1 flex justify-center pointer-events-auto">
            <MobileControls
              onDirection={handleDirection}
              currentDirection={engineState.direction}
              theme={stats.theme}
            />
          </div>
        )}
      </footer>

      {/* 3. Records Ledger Modal */}
      {gameState === 'RECORDS' && (
        <RecordsModal stats={stats} onClose={() => setGameState('PLAYING')} />
      )}

      {/* 4. Settings & Materials Modal */}
      {gameState === 'SETTINGS' && (
        <SettingsModal
          stats={stats}
          onUpdateStats={updateStats}
          onResetStats={handleResetStats}
          onClose={() => setGameState('PLAYING')}
        />
      )}
    </div>
  );
}
