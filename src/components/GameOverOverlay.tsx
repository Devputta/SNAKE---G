import React from 'react';
import { ColorTheme } from '../types/game';

interface GameOverOverlayProps {
  score: number;
  length: number;
  foodEaten: number;
  survivalTime: number;
  highScore: number;
  speedLevel: number;
  isNewRecord: boolean;
  onRetry: () => void;
  onOpenRecords: () => void;
  theme: ColorTheme;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  score,
  length,
  survivalTime,
  highScore,
  speedLevel,
  isNewRecord,
  onRetry,
  onOpenRecords,
  theme,
}) => {
  const isLight = theme === 'light';

  const formattedScore = score.toString().padStart(6, '0');
  const formattedBest = highScore.toString().padStart(6, '0');

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-100 font-mono">
      {/* Editorial Letterpress Card */}
      <div
        className={`w-full max-w-sm rounded-lg p-6 text-center space-y-5 border transition-colors shadow-sm ${
          isLight
            ? 'bg-[#faf8f5] border-[#dcd8cd] text-[#1c1f24]'
            : 'bg-[#181a1d] border-[#2c3038] text-[#eae8e3]'
        }`}
      >
        {/* Header / Notice */}
        <div className="space-y-1">
          {isNewRecord && (
            <div className="text-[11px] font-bold tracking-widest text-[#cf382b] uppercase">
              NEW BEST SCORE
            </div>
          )}
          <h2 className="text-xl font-bold tracking-wider">
            CAUGHT TAIL
          </h2>
          <p className={`text-xs ${isLight ? 'text-[#7d7a70]' : 'text-[#878a94]'}`}>
            Self-collision ended the run
          </p>
        </div>

        {/* Clean Ledger Grid (Integrated typographic reading, NO cards) */}
        <div
          className={`py-3.5 border-y space-y-2 text-xs tabular-nums ${
            isLight ? 'border-[#e4e1d7]' : 'border-[#282b33]'
          }`}
        >
          <div className="flex justify-between items-baseline">
            <span className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
              Final Score
            </span>
            <span className="font-bold text-sm tracking-wide">
              {formattedScore}
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
              Snake Length
            </span>
            <span className="font-medium">
              {length} units
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
              Pace Reached
            </span>
            <span className="font-medium">
              Level {speedLevel}
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
              Survival Time
            </span>
            <span className="font-medium">
              {survivalTime.toFixed(1)}s
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-[#8c897f]' : 'text-[#70757d]'}`}>
              Career Best
            </span>
            <span className={`font-semibold ${isLight ? 'text-[#cf382b]' : '#e0584b'}`}>
              {formattedBest}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1 text-xs">
          <button
            autoFocus
            type="button"
            onClick={onRetry}
            className={`w-full py-2.5 px-4 font-semibold tracking-wider rounded border transition-colors cursor-pointer ${
              isLight
                ? 'bg-[#1c1f24] hover:bg-[#2d323b] text-white border-[#1c1f24]'
                : 'bg-[#eae8e3] hover:bg-white text-[#141619] border-[#eae8e3]'
            }`}
          >
            AGAIN (SPACE / R)
          </button>

          <button
            type="button"
            onClick={onOpenRecords}
            className={`w-full py-2 px-4 tracking-wider transition-colors cursor-pointer ${
              isLight
                ? 'text-[#5a574f] hover:text-[#1c1f24]'
                : 'text-[#9c9a93] hover:text-white'
            }`}
          >
            CAREER LEDGER
          </button>
        </div>
      </div>
    </div>
  );
};
