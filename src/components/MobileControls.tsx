import React from 'react';
import { Direction, ColorTheme } from '../types/game';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileControlsProps {
  onDirection: (dir: Direction) => void;
  currentDirection: Direction;
  theme: ColorTheme;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onDirection,
  currentDirection,
  theme,
}) => {
  const isLight = theme === 'light';

  const handlePress = (dir: Direction) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch {
        // ignore
      }
    }
    onDirection(dir);
  };

  return (
    <div className="w-full flex items-center justify-center py-2 select-none touch-none shrink-0 pointer-events-auto">
      {/* Tactile Drafting Cross Pad */}
      <div
        className={`relative w-40 h-32 grid grid-cols-3 grid-rows-3 gap-1 p-1 rounded-xl border ${
          isLight
            ? 'bg-[#f4f2eb] border-[#e0ddd2]'
            : 'bg-[#181a1d] border-[#292c33]'
        }`}
      >
        {/* UP */}
        <div className="col-start-2 row-start-1 flex justify-center">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handlePress('UP');
            }}
            aria-label="Move Up"
            className={`w-11 h-9 rounded-md flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${
              currentDirection === 'UP'
                ? isLight
                  ? 'bg-[#cf382b] border-[#9c2419] text-white'
                  : 'bg-[#cf382b] border-[#9c2419] text-white'
                : isLight
                ? 'bg-white border-[#d8d5ca] text-[#2c3036] active:bg-[#e8e5db]'
                : 'bg-[#22252a] border-[#363a42] text-[#d6d4ce] active:bg-[#2c3036]'
            }`}
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>

        {/* LEFT */}
        <div className="col-start-1 row-start-2 flex justify-center items-center">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handlePress('LEFT');
            }}
            aria-label="Move Left"
            className={`w-11 h-9 rounded-md flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${
              currentDirection === 'LEFT'
                ? isLight
                  ? 'bg-[#cf382b] border-[#9c2419] text-white'
                  : 'bg-[#cf382b] border-[#9c2419] text-white'
                : isLight
                ? 'bg-white border-[#d8d5ca] text-[#2c3036] active:bg-[#e8e5db]'
                : 'bg-[#22252a] border-[#363a42] text-[#d6d4ce] active:bg-[#2c3036]'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* CENTER PIVOT */}
        <div className="col-start-2 row-start-2 flex items-center justify-center">
          <div
            className={`w-3 h-3 rounded-full border ${
              isLight ? 'bg-[#d8d5ca] border-[#c4c0b3]' : 'bg-[#2b2e35] border-[#3a3f47]'
            }`}
          />
        </div>

        {/* RIGHT */}
        <div className="col-start-3 row-start-2 flex justify-center items-center">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handlePress('RIGHT');
            }}
            aria-label="Move Right"
            className={`w-11 h-9 rounded-md flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${
              currentDirection === 'RIGHT'
                ? isLight
                  ? 'bg-[#cf382b] border-[#9c2419] text-white'
                  : 'bg-[#cf382b] border-[#9c2419] text-white'
                : isLight
                ? 'bg-white border-[#d8d5ca] text-[#2c3036] active:bg-[#e8e5db]'
                : 'bg-[#22252a] border-[#363a42] text-[#d6d4ce] active:bg-[#2c3036]'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* DOWN */}
        <div className="col-start-2 row-start-3 flex justify-center">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handlePress('DOWN');
            }}
            aria-label="Move Down"
            className={`w-11 h-9 rounded-md flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${
              currentDirection === 'DOWN'
                ? isLight
                  ? 'bg-[#cf382b] border-[#9c2419] text-white'
                  : 'bg-[#cf382b] border-[#9c2419] text-white'
                : isLight
                ? 'bg-white border-[#d8d5ca] text-[#2c3036] active:bg-[#e8e5db]'
                : 'bg-[#22252a] border-[#363a42] text-[#d6d4ce] active:bg-[#2c3036]'
            }`}
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
