import React, { useEffect, useRef } from 'react';
import { Direction, Point, SnakeSkinId, FoodSkinId, ColorTheme } from '../types/game';
import { GameEngineState } from '../game/game-engine';
import { SNAKE_SKINS, FOOD_SKINS } from '../types/skins';

interface EatRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface GameBoardProps {
  engineState: GameEngineState;
  reducedMotion: boolean;
  eatTrigger: number;
  deathTrigger: number;
  speedUpTrigger: number;
  snakeSkinId: SnakeSkinId;
  foodSkinId: FoodSkinId;
  theme: ColorTheme;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  engineState,
  reducedMotion,
  eatTrigger,
  snakeSkinId,
  foodSkinId,
  theme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<EatRipple[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const isLight = theme === 'light';
  const snakeSkin = SNAKE_SKINS[snakeSkinId] || SNAKE_SKINS['sumi-ink'];
  const foodSkin = FOOD_SKINS[foodSkinId] || FOOD_SKINS['vermilion-pip'];

  // Refined tactile feedback on eating food (single crisp expanding ring, not a particle storm)
  useEffect(() => {
    if (eatTrigger === 0 || reducedMotion) return;
    const food = engineState.food;
    if (!food) return;

    ripplesRef.current.push({
      x: food.x + 0.5,
      y: food.y + 0.5,
      radius: 2,
      maxRadius: 18,
      alpha: 0.8,
      color: foodSkin.fillColor,
    });
  }, [eatTrigger, reducedMotion, engineState.food, foodSkin]);

  // Main canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;

      const { gridWidth, gridHeight, snake, food } = engineState;

      const rect = container.getBoundingClientRect();
      const containerW = Math.max(120, Math.floor(rect.width));
      const containerH = Math.max(120, Math.floor(rect.height));

      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const pixelW = Math.floor(containerW * dpr);
      const pixelH = Math.floor(containerH * dpr);

      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
      }

      canvas.style.width = `${Math.floor(containerW)}px`;
      canvas.style.height = `${Math.floor(containerH)}px`;

      ctx.save();
      ctx.scale(dpr, dpr);

      const cellW = containerW / gridWidth;
      const cellH = containerH / gridHeight;

      // 1. Board Background: Tactile Archival Paper / Graphite Plate (NO DOTS)
      ctx.fillStyle = isLight ? '#f9f8f4' : '#141619';
      ctx.fillRect(0, 0, containerW, containerH);

      // 2. Faint, hairline drafting grid lines (almost invisible, pure architectural structure)
      ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.035)' : 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 1; x < gridWidth; x++) {
        const px = Math.floor(x * cellW) + 0.5;
        ctx.moveTo(px, 0);
        ctx.lineTo(px, containerH);
      }
      for (let y = 1; y < gridHeight; y++) {
        const py = Math.floor(y * cellH) + 0.5;
        ctx.moveTo(0, py);
        ctx.lineTo(containerW, py);
      }
      ctx.stroke();

      // 3. Perimeter Framing Boundary
      ctx.strokeStyle = isLight ? '#e0ddd3' : '#2b2f36';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0.5, 0.5, containerW - 1, containerH - 1);

      // 4. Architectural Corner Registration Marks (+)
      const markLen = 7;
      ctx.strokeStyle = isLight ? '#9c9789' : '#525866';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      // Top Left
      ctx.moveTo(12, 12 - markLen); ctx.lineTo(12, 12 + markLen);
      ctx.moveTo(12 - markLen, 12); ctx.lineTo(12 + markLen, 12);
      // Top Right
      ctx.moveTo(containerW - 12, 12 - markLen); ctx.lineTo(containerW - 12, 12 + markLen);
      ctx.moveTo(containerW - 12 - markLen, 12); ctx.lineTo(containerW - 12 + markLen, 12);
      // Bottom Left
      ctx.moveTo(12, containerH - 12 - markLen); ctx.lineTo(12, containerH - 12 + markLen);
      ctx.moveTo(12 - markLen, containerH - 12); ctx.lineTo(12 + markLen, containerH - 12);
      // Bottom Right
      ctx.moveTo(containerW - 12, containerH - 12 - markLen); ctx.lineTo(containerW - 12, containerH - 12 + markLen);
      ctx.moveTo(containerW - 12 - markLen, containerH - 12); ctx.lineTo(containerW - 12 + markLen, containerH - 12);
      ctx.stroke();

      // 5. Render FOOD: Memorable, physical graphic mark (NO generic glowing blue spheres)
      if (food) {
        renderFoodMark(ctx, food, cellW, cellH, foodSkin);
      }

      // 6. Render SNAKE: Tangible architectural segments with recognizable head
      const snakeLen = snake.length;

      for (let i = snakeLen - 1; i >= 0; i--) {
        const segment = snake[i];
        const sx = segment.x * cellW;
        const sy = segment.y * cellH;
        const isHead = i === 0;

        // Gap spacing between modular links
        const margin = Math.max(1, Math.min(cellW, cellH) * 0.08);
        const w = cellW - margin * 2;
        const h = cellH - margin * 2;
        const radius = isHead ? Math.min(w, h) * 0.35 : Math.min(w, h) * 0.18;

        if (isHead) {
          // Distinct Head Piece
          ctx.fillStyle = snakeSkin.headColor;
          drawRoundedRect(ctx, sx + margin, sy + margin, w, h, radius);
          ctx.fill();

          ctx.strokeStyle = snakeSkin.borderColor;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Recognizable Head Aperture / Sight Line
          drawHeadAperture(ctx, segment, engineState.direction, cellW, cellH, snakeSkin);
        } else {
          // Distinct modular body link (tonal degradation along spine)
          const t = i / Math.max(1, snakeLen);
          ctx.fillStyle = interpolateColor(snakeSkin.bodyColor, snakeSkin.tailColor, t);

          drawRoundedRect(ctx, sx + margin, sy + margin, w, h, radius);
          ctx.fill();

          ctx.strokeStyle = snakeSkin.borderColor;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // 7. Eat Ripple Feedback (subtle, quick single ink circle)
      if (ripplesRef.current.length > 0) {
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const r = ripplesRef.current[i];
          r.radius += 1.2;
          r.alpha -= 0.06;

          if (r.alpha <= 0) {
            ripplesRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = r.alpha;
          ctx.strokeStyle = r.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(r.x * cellW, r.y * cellH, r.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [engineState, reducedMotion, snakeSkin, foodSkin, isLight]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};

// Render food as a crisp, tangible mark (not a glowing blur)
function renderFoodMark(
  ctx: CanvasRenderingContext2D,
  food: Point,
  cellW: number,
  cellH: number,
  skin: (typeof FOOD_SKINS)[FoodSkinId]
) {
  const fx = (food.x + 0.5) * cellW;
  const fy = (food.y + 0.5) * cellH;
  const size = Math.min(cellW, cellH) * 0.36;

  ctx.save();

  if (skin.shape === 'diamond') {
    // 45-degree Hanko Diamond Seal with hairline registration
    ctx.translate(fx, fy);
    ctx.rotate(Math.PI / 4);

    ctx.fillStyle = skin.fillColor;
    ctx.fillRect(-size, -size, size * 2, size * 2);

    ctx.strokeStyle = skin.strokeColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-size, -size, size * 2, size * 2);

    // Inner registration square
    if (skin.innerMarkColor) {
      ctx.fillStyle = skin.innerMarkColor;
      ctx.fillRect(-size * 0.32, -size * 0.32, size * 0.64, size * 0.64);
    }
  } else if (skin.shape === 'ring') {
    // Machined Brass Eyelet
    ctx.beginPath();
    ctx.arc(fx, fy, size * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = skin.fillColor;
    ctx.fill();

    ctx.strokeStyle = skin.strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center hole
    ctx.beginPath();
    ctx.arc(fx, fy, size * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = skin.innerMarkColor || '#1c1b18';
    ctx.fill();
  } else if (skin.shape === 'square') {
    // Precision square token with border
    ctx.fillStyle = skin.fillColor;
    ctx.fillRect(fx - size, fy - size, size * 2, size * 2);

    ctx.strokeStyle = skin.strokeColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(fx - size, fy - size, size * 2, size * 2);

    // Inner cross mark
    if (skin.innerMarkColor) {
      ctx.strokeStyle = skin.innerMarkColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(fx - size * 0.5, fy); ctx.lineTo(fx + size * 0.5, fy);
      ctx.moveTo(fx, fy - size * 0.5); ctx.lineTo(fx, fy + size * 0.5);
      ctx.stroke();
    }
  } else if (skin.shape === 'pip') {
    // Architectural Drafting Needle Pip
    ctx.beginPath();
    ctx.arc(fx, fy, size, 0, Math.PI * 2);
    ctx.fillStyle = skin.fillColor;
    ctx.fill();

    ctx.strokeStyle = skin.strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(fx, fy, size * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = skin.innerMarkColor || '#1a1d20';
    ctx.fill();
  } else {
    // Geometric knot token
    ctx.beginPath();
    ctx.arc(fx, fy, size, 0, Math.PI * 2);
    ctx.fillStyle = skin.fillColor;
    ctx.fill();
    ctx.strokeStyle = skin.strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}

// Directional eye/aperture on the snake head
function drawHeadAperture(
  ctx: CanvasRenderingContext2D,
  head: Point,
  dir: Direction,
  cellW: number,
  cellH: number,
  skin: (typeof SNAKE_SKINS)[SnakeSkinId]
) {
  const hx = head.x * cellW;
  const hy = head.y * cellH;

  const eyeRadius = Math.max(1.5, Math.min(cellW, cellH) * 0.12);
  const pupilRadius = eyeRadius * 0.55;

  let e1x = 0;
  let e1y = 0;
  let e2x = 0;
  let e2y = 0;

  switch (dir) {
    case 'RIGHT':
      e1x = hx + cellW * 0.72; e1y = hy + cellH * 0.3;
      e2x = hx + cellW * 0.72; e2y = hy + cellH * 0.7;
      break;
    case 'LEFT':
      e1x = hx + cellW * 0.28; e1y = hy + cellH * 0.3;
      e2x = hx + cellW * 0.28; e2y = hy + cellH * 0.7;
      break;
    case 'UP':
      e1x = hx + cellW * 0.3; e1y = hy + cellH * 0.28;
      e2x = hx + cellW * 0.7; e2y = hy + cellH * 0.28;
      break;
    case 'DOWN':
      e1x = hx + cellW * 0.3; e1y = hy + cellH * 0.72;
      e2x = hx + cellW * 0.7; e2y = hy + cellH * 0.72;
      break;
  }

  // Dual architectural eye apertures
  ctx.fillStyle = skin.eyeWhite;
  ctx.beginPath();
  ctx.arc(e1x, e1y, eyeRadius, 0, Math.PI * 2);
  ctx.arc(e2x, e2y, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = skin.pupilColor;
  ctx.beginPath();
  ctx.arc(e1x, e1y, pupilRadius, 0, Math.PI * 2);
  ctx.arc(e2x, e2y, pupilRadius, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Linear color interpolation
function interpolateColor(color1: string, color2: string, factor: number): string {
  if (factor <= 0) return color1;
  if (factor >= 1) return color2;

  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  if (!c1 || !c2) return color1;

  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));

  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  }
  return null;
}
