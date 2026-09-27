import React, { useState, useRef, useCallback } from 'react';
import { Direction, ColorTheme } from '../types/game';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface TapRipple {
  id: number;
  x: number;
  y: number;
  direction: Direction;
}

interface MobileTapOverlayProps {
  onDirection: (dir: Direction) => void;
  currentDirection: Direction;
  theme: ColorTheme;
  showGuides: boolean;
  enabled: boolean;
}

export const MobileTapOverlay: React.FC<MobileTapOverlayProps> = ({
  onDirection,
  theme,
  showGuides,
  enabled,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<TapRipple[]>([]);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const isLight = theme === 'light';

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
  };

  const addRipple = useCallback((x: number, y: number, direction: Direction) => {
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev.slice(-3), { id, x, y, direction }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 400);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
    };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || !pointerStartRef.current || !containerRef.current) return;

    const startX = pointerStartRef.current.x;
    const startY = pointerStartRef.current.y;
    const endX = e.clientX;
    const endY = e.clientY;
    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.hypot(dx, dy);

    let chosenDir: Direction;

    // If swipe distance > 22px, treat as swipe gesture
    if (dist > 22) {
      if (Math.abs(dx) > Math.abs(dy)) {
        chosenDir = dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        chosenDir = dy > 0 ? 'DOWN' : 'UP';
      }
      addRipple(endX, endY, chosenDir);
      triggerHaptic();
      onDirection(chosenDir);
      pointerStartRef.current = null;
      return;
    }

    // Otherwise, calculate invisible tap quadrant relative to overlay boundaries
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const relX = (endX - cx) / (rect.width / 2);
    const relY = (endY - cy) / (rect.height / 2);

    if (Math.abs(relX) > Math.abs(relY)) {
      chosenDir = relX > 0 ? 'RIGHT' : 'LEFT';
    } else {
      chosenDir = relY > 0 ? 'DOWN' : 'UP';
    }

    addRipple(endX, endY, chosenDir);
    triggerHaptic();
    onDirection(chosenDir);
    pointerStartRef.current = null;
  };

  const handlePointerCancel = () => {
    pointerStartRef.current = null;
  };

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className="absolute inset-0 z-30 select-none touch-none cursor-pointer overflow-hidden"
      aria-label="Tap or swipe to steer snake"
    >
      {/* Optional Architectural Quadrant Guides */}
      {showGuides && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {/* Diagonal hairline dividers */}
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line
              x1="0"
              y1="0"
              x2="100%"
              y2="100%"
              stroke={isLight ? '#9c9789' : '#525866'}
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            <line
              x1="100%"
              y1="0"
              x2="0"
              y2="100%"
              stroke={isLight ? '#9c9789' : '#525866'}
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          </svg>

          {/* Quadrant directional cue indicators */}
          <div className="absolute top-4 inset-x-0 flex justify-center text-xs tracking-wider uppercase font-semibold">
            <span
              className={`px-2 py-0.5 rounded border text-[10px] flex items-center gap-1 ${
                isLight ? 'bg-white/80 border-[#d8d5ca] text-[#7d7a70]' : 'bg-black/60 border-[#3a3f47] text-[#9c9a93]'
              }`}
            >
              <ArrowUp className="w-3 h-3" /> UP
            </span>
          </div>

          <div className="absolute bottom-4 inset-x-0 flex justify-center text-xs tracking-wider uppercase font-semibold">
            <span
              className={`px-2 py-0.5 rounded border text-[10px] flex items-center gap-1 ${
                isLight ? 'bg-white/80 border-[#d8d5ca] text-[#7d7a70]' : 'bg-black/60 border-[#3a3f47] text-[#9c9a93]'
              }`}
            >
              <ArrowDown className="w-3 h-3" /> DOWN
            </span>
          </div>

          <div className="absolute left-3 inset-y-0 flex items-center">
            <span
              className={`px-1.5 py-1 rounded border text-[10px] flex flex-col items-center gap-0.5 ${
                isLight ? 'bg-white/80 border-[#d8d5ca] text-[#7d7a70]' : 'bg-black/60 border-[#3a3f47] text-[#9c9a93]'
              }`}
            >
              <ArrowLeft className="w-3 h-3" />
              <span>L</span>
            </span>
          </div>

          <div className="absolute right-3 inset-y-0 flex items-center">
            <span
              className={`px-1.5 py-1 rounded border text-[10px] flex flex-col items-center gap-0.5 ${
                isLight ? 'bg-white/80 border-[#d8d5ca] text-[#7d7a70]' : 'bg-black/60 border-[#3a3f47] text-[#9c9a93]'
              }`}
            >
              <ArrowRight className="w-3 h-3" />
              <span>R</span>
            </span>
          </div>
        </div>
      )}

      {/* Ripple & Direction Feedback Badges */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2 z-40 transition-all duration-300 animate-out fade-out zoom-out-90"
          style={{ left: ripple.x, top: ripple.y }}
        >
          {/* Subtle outer ripple expansion */}
          <div
            className={`w-14 h-14 rounded-full border border-dashed flex items-center justify-center animate-ping duration-300 ${
              isLight ? 'border-[#cf382b]/60 bg-[#cf382b]/10' : 'border-[#e0584b]/60 bg-[#e0584b]/15'
            }`}
          />
          {/* Direction indicator badge in center of tap */}
          <div
            className={`absolute inset-0 flex items-center justify-center rounded-full shadow-xs border ${
              isLight
                ? 'bg-white/95 text-[#cf382b] border-[#cf382b]/40'
                : 'bg-[#1c1f24]/95 text-[#e0584b] border-[#e0584b]/40'
            }`}
          >
            {ripple.direction === 'UP' && <ArrowUp className="w-4 h-4" strokeWidth={2.5} />}
            {ripple.direction === 'DOWN' && <ArrowDown className="w-4 h-4" strokeWidth={2.5} />}
            {ripple.direction === 'LEFT' && <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />}
            {ripple.direction === 'RIGHT' && <ArrowRight className="w-4 h-4" strokeWidth={2.5} />}
          </div>
        </div>
      ))}
    </div>
  );
};
