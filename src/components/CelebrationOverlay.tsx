import React, { useMemo } from 'react';
import { ColorTheme } from '../types/game';
import { Sparkles, Trophy, Zap } from 'lucide-react';

export interface CelebrationData {
  id: number;
  type: 'level' | 'length';
  title: string;
  subtitle: string;
}

interface CelebrationOverlayProps {
  celebration: CelebrationData | null;
  theme: ColorTheme;
}

interface Particle {
  id: number;
  x: number; // percentage (0 - 100)
  startY: number; // percentage
  size: number; // px
  color: string;
  duration: number; // s
  delay: number; // s
  rotation: number; // deg
  driftX: number; // px
  driftY: number; // px
  shape: 'square' | 'rect' | 'circle';
}

const PALETTE = [
  '#cf382b', // Vermilion
  '#e0a82e', // Gold
  '#2a7248', // Emerald
  '#3b82f6', // Azure
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#10b981', // Mint
];

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  celebration,
  theme,
}) => {
  const isLight = theme === 'light';

  // Generate a fixed set of lively celebration particles when a new celebration arrives
  const particles = useMemo(() => {
    if (!celebration) return [];

    const list: Particle[] = [];
    const count = 38;

    for (let i = 0; i < count; i++) {
      const isLevel = celebration.type === 'level';
      const shapeType = i % 3 === 0 ? 'circle' : i % 2 === 0 ? 'rect' : 'square';
      const color = PALETTE[i % PALETTE.length];

      list.push({
        id: i,
        x: 10 + Math.random() * 80, // spread across 10% - 90% of screen
        startY: 5 + Math.random() * 25, // spawn near the upper area
        size: Math.floor(5 + Math.random() * 6),
        color,
        duration: 1.6 + Math.random() * 0.8,
        delay: Math.random() * 0.25,
        rotation: Math.floor(Math.random() * 360),
        driftX: (Math.random() - 0.5) * 160,
        driftY: 120 + Math.random() * 260,
        shape: shapeType,
      });
    }
    return list;
  }, [celebration]);

  if (!celebration) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none"
    >
      <style>{`
        @keyframes celebration-burst {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          70% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
            transform: translate(var(--drift-x), var(--drift-y)) rotate(var(--rot)) scale(0.6);
          }
        }
        @keyframes milestone-pop {
          0% {
            opacity: 0;
            transform: translateY(-16px) scale(0.92);
          }
          15% {
            opacity: 1;
            transform: translateY(0) scale(1.04);
          }
          25% {
            transform: translateY(0) scale(1);
          }
          85% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
        }
      `}</style>

      {/* 1. Confetti Particles drifting down gently */}
      {particles.map((p) => (
        <div
          key={`${celebration.id}-${p.id}`}
          style={
            {
              left: `${p.x}%`,
              top: `${p.startY}%`,
              width: p.shape === 'rect' ? `${p.size * 1.5}px` : `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '9999px' : '1px',
              '--drift-x': `${p.driftX}px`,
              '--drift-y': `${p.driftY}px`,
              '--rot': `${p.rotation + 360}deg`,
              animation: `celebration-burst ${p.duration}s cubic-bezier(0.25, 1, 0.5, 1) ${p.delay}s forwards`,
            } as React.CSSProperties
          }
          className="absolute shadow-sm"
        />
      ))}

      {/* 2. Floating Milestone Banner / Badge (Top-center, non-intrusive) */}
      <div className="absolute top-12 left-0 right-0 flex justify-center px-4">
        <div
          key={celebration.id}
          style={{
            animation: 'milestone-pop 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-xl backdrop-blur-md font-mono transition-colors ${
            isLight
              ? 'bg-white/95 border-[#dcd8cd] text-[#1c1f24] shadow-amber-900/10'
              : 'bg-[#1a1d22]/95 border-[#383d47] text-[#f2f0eb] shadow-black/40'
          }`}
        >
          {celebration.type === 'level' ? (
            <div className="p-1 rounded-full bg-amber-500/15 text-amber-500">
              <Zap className="w-4 h-4 fill-amber-500/30" />
            </div>
          ) : (
            <div className="p-1 rounded-full bg-[#cf382b]/15 text-[#cf382b]">
              <Trophy className="w-4 h-4" />
            </div>
          )}

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
              <span className={celebration.type === 'level' ? 'text-amber-500' : 'text-[#cf382b]'}>
                {celebration.title}
              </span>
              <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400/40" />
            </div>
            <div
              className={`text-[10px] tracking-wide ${
                isLight ? 'text-[#706c62]' : 'text-[#9c9a93]'
              }`}
            >
              {celebration.subtitle}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
