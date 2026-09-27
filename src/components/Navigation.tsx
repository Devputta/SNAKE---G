import React, { useState, useEffect, useRef } from 'react';
import { GameState, ColorTheme } from '../types/game';
import {
  X,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Trophy,
  Settings,
  Keyboard,
  Info,
  Maximize,
  Minimize,
} from 'lucide-react';

interface NavigationProps {
  gameState: GameState;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onOpenRecords: () => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
  score: number;
  length: number;
  highScore: number;
  speedLevel: number;
  foodCount: number;
  theme: ColorTheme;
  onToggleTheme: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  gameState,
  isMenuOpen,
  onToggleMenu,
  onOpenRecords,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
  onRestart,
  score,
  length,
  highScore,
  speedLevel,
  foodCount,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === 'light';
  const isPaused = gameState === 'PAUSED' || isMenuOpen;

  const formattedScore = score.toString().padStart(6, '0');
  const formattedBest = highScore.toString().padStart(6, '0');

  // Food remaining until next speed surge (every 5 food)
  const nextSurgeIn = 5 - (foodCount % 5);

  const [showControlsTooltip, setShowControlsTooltip] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // browser permissions
    }
  };

  // Score pulse tracking: gently pulses score label when score increments
  const [scorePulsing, setScorePulsing] = useState(false);
  const prevScoreRef = useRef(score);

  useEffect(() => {
    if (score > prevScoreRef.current) {
      setScorePulsing(true);
      const timer = setTimeout(() => {
        setScorePulsing(false);
      }, 350);
      prevScoreRef.current = score;
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = score;
  }, [score]);

  return (
    <>
      {/* 1. DEDICATED TOP HEADER: Cleanly placed above the playground, never overlapping the board */}
      <header
        className={`w-full shrink-0 h-10 px-3 sm:px-6 flex items-center justify-between text-xs select-none font-mono transition-colors border-b z-20 ${
          isLight
            ? 'bg-[#f7f6f2] border-[#e8e5db] text-[#1c1f24]'
            : 'bg-[#141619] border-[#22252a] text-[#e8e6e1]'
        }`}
      >
        {/* Left: Unboxed Title & Menu Action */}
        <div className="flex items-baseline gap-2.5">
          <button
            type="button"
            onClick={onToggleMenu}
            aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu & Pause Game'}
            className={`group flex items-baseline gap-2 transition-colors cursor-pointer py-1 px-0.5 ${
              isLight ? 'text-[#1c1f24] hover:text-[#cf382b]' : 'text-[#e8e6e1] hover:text-white'
            }`}
          >
            <span className="font-bold tracking-widest text-xs sm:text-sm">
              OURO
            </span>
            <span
              className={`text-[10px] tracking-wider transition-colors ${
                isPaused
                  ? 'text-[#cf382b] font-bold'
                  : isLight
                  ? 'text-[#8c897f] group-hover:text-[#cf382b]'
                  : 'text-[#70757d] group-hover:text-white'
              }`}
            >
              {isPaused ? '[PAUSED]' : '[MENU]'}
            </span>
          </button>
        </div>

        {/* Right: Unboxed Score + Quick Fullscreen + Theme Action */}
        <div className="flex items-baseline gap-3 sm:gap-4 tabular-nums">
          <div
            className={`flex items-baseline gap-1.5 transition-all duration-300 ease-out origin-right select-none ${
              scorePulsing
                ? 'scale-110 text-[#cf382b] font-extrabold'
                : isLight
                ? 'text-[#1c1f24]'
                : 'text-[#e8e6e1]'
            }`}
          >
            <span
              className={`text-[10px] uppercase tracking-wider transition-colors ${
                scorePulsing
                  ? 'text-[#cf382b]'
                  : isLight
                  ? 'text-[#8c897f]'
                  : 'text-[#70757d]'
              }`}
            >
              Score
            </span>
            <span className="font-bold text-xs sm:text-sm tracking-wide">
              {formattedScore}
            </span>
          </div>

          {/* Quick Fullscreen button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className={`p-0.5 transition-colors cursor-pointer ${
              isLight ? 'text-[#8c897f] hover:text-[#1c1f24]' : 'text-[#70757d] hover:text-white'
            }`}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>

          {/* Quick theme trigger button */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className={`p-0.5 transition-colors cursor-pointer ${
              isLight ? 'text-[#8c897f] hover:text-[#1c1f24]' : 'text-[#70757d] hover:text-white'
            }`}
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* 2. Full Appearing Menu Bar / Drawer Overlay (Appears on click & pauses game) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/45 backdrop-blur-[1px] animate-in fade-in duration-150 font-mono">
          <div
            className={`relative w-full max-w-md rounded-lg border shadow-lg overflow-hidden transition-colors ${
              isLight
                ? 'bg-[#faf8f5] border-[#dcd8cd] text-[#1c1f24]'
                : 'bg-[#181a1d] border-[#2c3038] text-[#eae8e3]'
            }`}
          >
            {/* Menu Header with Pause Indicator */}
            <div
              className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 ${
                isLight ? 'border-[#e4e1d7] bg-[#f4f2ec]' : 'border-[#282b33] bg-[#141618]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wider uppercase">
                  GAME PAUSED
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    isLight
                      ? 'border-[#dcd8cc] bg-white text-[#7d7a70]'
                      : 'border-[#363a42] bg-[#22252a] text-[#9c9a93]'
                  }`}
                >
                  MENU
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleMenu}
                aria-label="Resume Game"
                className={`p-1 text-xs tracking-wider transition-colors cursor-pointer ${
                  isLight ? 'hover:text-[#cf382b]' : 'hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Metrics Grid (Score, Length, Level, Best) */}
            <div
              className={`grid grid-cols-2 gap-3 p-4 border-b text-xs tabular-nums ${
                isLight ? 'border-[#e4e1d7] bg-white/70' : 'border-[#282b33] bg-[#1a1c20]'
              }`}
            >
              <div className="space-y-0.5">
                <div className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                  Current Score
                </div>
                <div className="font-bold text-base text-[#1c1f24] dark:text-[#eae8e3]">
                  {formattedScore}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                  Snake Length
                </div>
                <div className="font-bold text-base text-[#1c1f24] dark:text-[#eae8e3]">
                  {length} units
                </div>
              </div>

              <div className="space-y-0.5">
                <div className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                  Pace Tier
                </div>
                <div className={`font-semibold text-xs ${isLight ? 'text-[#cf382b]' : '#e0584b'}`}>
                  Level {speedLevel} <span className="text-[10px] opacity-75">(+{nextSurgeIn} bites)</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <div className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
                  Career Best
                </div>
                <div className="font-semibold text-xs text-[#5a574f] dark:text-[#9c9a93]">
                  {formattedBest}
                </div>
              </div>
            </div>

            {/* Menu Options & Toggles */}
            <div className="p-4 space-y-2.5 text-xs">
              {/* 1. Resume Game Button (Primary) */}
              <button
                type="button"
                autoFocus
                onClick={onToggleMenu}
                className={`w-full py-2.5 px-4 rounded border font-bold tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-[#1c1f24] hover:bg-[#2d323b] text-white border-[#1c1f24]'
                    : 'bg-[#eae8e3] hover:bg-white text-[#141619] border-[#eae8e3]'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>RESUME GAME (SPACE)</span>
              </button>

              {/* 2. Fullscreen Arcade Mode Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className={`w-full py-2 px-4 rounded border font-semibold tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-[#f4f2eb] border-[#dcd8cd] text-[#2c3036]'
                    : 'bg-[#22252a] hover:bg-[#2c3036] border-[#363a42] text-[#d6d4ce]'
                }`}
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5 text-[#cf382b]" />}
                <span>{isFullscreen ? 'EXIT FULLSCREEN (F)' : 'FULLSCREEN ARCADE (F)'}</span>
              </button>

              {/* 3. Restart Run */}
              <button
                type="button"
                onClick={() => {
                  onRestart();
                  onToggleMenu();
                }}
                className={`w-full py-2 px-4 rounded border font-semibold tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-[#f4f2eb] border-[#dcd8cd] text-[#2c3036]'
                    : 'bg-[#22252a] hover:bg-[#2c3036] border-[#363a42] text-[#d6d4ce]'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESTART RUN (R)</span>
              </button>

              {/* 4. Dark & Light Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={`py-2 px-3 rounded border font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-[#f4f2eb] border-[#dcd8cd] text-[#2c3036]'
                      : 'bg-[#22252a] hover:bg-[#2c3036] border-[#363a42] text-[#d6d4ce]'
                  }`}
                >
                  {isLight ? <Moon className="w-3.5 h-3.5 text-[#cf382b]" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isLight ? 'DARK MOOD' : 'LIGHT MOOD'}</span>
                </button>

                {/* 5. Sound Audio Toggle */}
                <button
                  type="button"
                  onClick={onToggleSound}
                  className={`py-2 px-3 rounded border font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-[#f4f2eb] border-[#dcd8cd] text-[#2c3036]'
                      : 'bg-[#22252a] hover:bg-[#2c3036] border-[#363a42] text-[#d6d4ce]'
                  }`}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#275e3f]" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-[#8c897f]" />
                  )}
                  <span>{soundEnabled ? 'AUDIO: ON' : 'AUDIO: OFF'}</span>
                </button>
              </div>

              {/* 6. Navigation Links: Settings & Records */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onOpenSettings();
                  }}
                  className={`py-2 px-3 rounded border font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-[#f4f2eb] border-[#dcd8cd] text-[#2c3036]'
                      : 'bg-[#22252a] hover:bg-[#2c3036] border-[#363a42] text-[#d6d4ce]'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-[#5a574f]" />
                  <span>SETTINGS</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenRecords();
                  }}
                  className={`py-2 px-3 rounded border font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-[#f4f2eb] border-[#dcd8cd] text-[#2c3036]'
                      : 'bg-[#22252a] hover:bg-[#2c3036] border-[#363a42] text-[#d6d4ce]'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-[#b88628]" />
                  <span>RECORDS</span>
                </button>
              </div>

              {/* 7. Subtle Controls Helper & Keyboard Shortcuts (Appears only in Pause Menu) */}
              <div
                className={`p-3 rounded border text-xs space-y-2 mt-2 ${
                  isLight
                    ? 'bg-[#f4f2ec] border-[#e2ded2] text-[#4d4a43]'
                    : 'bg-[#15171a] border-[#292c33] text-[#a19f96]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider">
                    <Keyboard className="w-3.5 h-3.5 text-[#cf382b]" />
                    <span>Controls & Shortcuts</span>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setShowControlsTooltip(true)}
                      onMouseLeave={() => setShowControlsTooltip(false)}
                      onClick={() => setShowControlsTooltip((prev) => !prev)}
                      aria-label="Controls tips"
                      className={`p-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 text-[10px] ${
                        isLight ? 'text-[#8c897f] hover:text-[#1c1f24]' : 'text-[#70757d] hover:text-white'
                      }`}
                    >
                      <Info className="w-3 h-3" />
                      <span className="hidden sm:inline">Tips</span>
                    </button>

                    {/* Tooltip / Quick Hint */}
                    {showControlsTooltip && (
                      <div
                        className={`absolute right-0 bottom-full mb-1.5 w-48 p-2 rounded shadow-md border text-[10px] z-50 animate-in fade-in duration-100 ${
                          isLight
                            ? 'bg-white border-[#dcd8cc] text-[#2c3036]'
                            : 'bg-[#1e2126] border-[#363a42] text-[#e8e6e1]'
                        }`}
                      >
                        <div className="font-bold mb-0.5 text-[#cf382b]">Quick Tip</div>
                        <div>Keyboard keys operate instantly during gameplay. Press <span className="font-semibold">F</span> for full screen and <span className="font-semibold">Space</span> to pause.</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] tabular-nums pt-1 border-t border-[#e2ded2]/60 dark:border-[#292c33]/60">
                  <div className="flex items-center justify-between">
                    <span className={isLight ? 'text-[#7d7a70]' : 'text-[#70757d]'}>Steer</span>
                    <span className="font-semibold text-[#1c1f24] dark:text-[#eae8e3]">Arrows / WASD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isLight ? 'text-[#7d7a70]' : 'text-[#70757d]'}>Pause / Play</span>
                    <span className="font-semibold text-[#1c1f24] dark:text-[#eae8e3]">Space / P</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isLight ? 'text-[#7d7a70]' : 'text-[#70757d]'}>Fullscreen</span>
                    <span className="font-semibold text-[#1c1f24] dark:text-[#eae8e3]">F</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isLight ? 'text-[#7d7a70]' : 'text-[#70757d]'}>Restart</span>
                    <span className="font-semibold text-[#1c1f24] dark:text-[#eae8e3]">R</span>
                  </div>
                  <div className="flex items-center justify-between col-span-2">
                    <span className={isLight ? 'text-[#7d7a70]' : 'text-[#70757d]'}>Close Menu</span>
                    <span className="font-semibold text-[#1c1f24] dark:text-[#eae8e3]">Esc</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Footer */}
            <div
              className={`px-5 py-2.5 border-t flex justify-between items-center text-[10px] shrink-0 ${
                isLight ? 'border-[#e4e1d7] bg-[#f4f2ec] text-[#7d7a70]' : 'border-[#282b33] bg-[#141618] text-[#878a94]'
              }`}
            >
              <span>Swipe or D-Pad to steer</span>
              <span>Tap Close to resume</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
