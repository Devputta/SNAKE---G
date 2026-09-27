import { PlayerStats, PlayerRecord, SnakeSkinId, FoodSkinId, ColorTheme } from '../types/game';

const STORAGE_KEY = 'ouro_snake_authored_v5';

export const DEFAULT_STATS: PlayerStats = {
  highScore: 0,
  longestSnake: 3,
  totalFoodEaten: 0,
  gamesPlayed: 0,
  totalTimePlayed: 0,
  recentGames: [],
  soundEnabled: true,
  reducedMotion: false,
  theme: 'light',
  mobileControlStyle: 'invisible',
  showTapGuides: false,
  initialSpeed: 95,
  initialSnakeLength: 3,
  snakeSkin: 'sumi-ink',
  foodSkin: 'vermilion-pip',
};

const VALID_SNAKE_SKINS: SnakeSkinId[] = [
  'sumi-ink',
  'moss-paper',
  'prussian-blueprint',
  'vermilion-terracotta',
  'lead-monochrome',
];

const VALID_FOOD_SKINS: FoodSkinId[] = [
  'vermilion-pip',
  'brass-ring',
  'moss-square',
  'bone-diamond',
  'persimmon-knot',
];

function sanitizeStats(raw: unknown): PlayerStats {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_STATS };
  }

  const obj = raw as Record<string, unknown>;

  const highScore = typeof obj.highScore === 'number' && Number.isFinite(obj.highScore)
    ? Math.max(0, Math.floor(obj.highScore))
    : 0;

  const longestSnake = typeof obj.longestSnake === 'number' && Number.isFinite(obj.longestSnake)
    ? Math.max(3, Math.floor(obj.longestSnake))
    : 3;

  const totalFoodEaten = typeof obj.totalFoodEaten === 'number' && Number.isFinite(obj.totalFoodEaten)
    ? Math.max(0, Math.floor(obj.totalFoodEaten))
    : 0;

  const gamesPlayed = typeof obj.gamesPlayed === 'number' && Number.isFinite(obj.gamesPlayed)
    ? Math.max(0, Math.floor(obj.gamesPlayed))
    : 0;

  const totalTimePlayed = typeof obj.totalTimePlayed === 'number' && Number.isFinite(obj.totalTimePlayed)
    ? Math.max(0, Math.round(obj.totalTimePlayed))
    : 0;

  const recentGames: PlayerRecord[] = [];
  if (Array.isArray(obj.recentGames)) {
    for (const item of obj.recentGames) {
      if (item && typeof item === 'object') {
        const r = item as Record<string, unknown>;
        if (typeof r.score === 'number' && typeof r.length === 'number') {
          recentGames.push({
            id: typeof r.id === 'string' ? r.id.slice(0, 50) : String(Math.random()),
            date: typeof r.date === 'string' ? r.date.slice(0, 30) : new Date().toLocaleDateString(),
            score: Math.max(0, Math.floor(r.score)),
            length: Math.max(1, Math.floor(r.length)),
            foodEaten: typeof r.foodEaten === 'number' ? Math.max(0, Math.floor(r.foodEaten)) : 0,
            survivalTime: typeof r.survivalTime === 'number' ? Math.max(0, Math.round(r.survivalTime * 10) / 10) : 0,
          });
        }
      }
    }
  }

  const soundEnabled = typeof obj.soundEnabled === 'boolean' ? obj.soundEnabled : true;
  const reducedMotion = typeof obj.reducedMotion === 'boolean' ? obj.reducedMotion : false;

  let theme: ColorTheme = 'light';
  if (obj.theme === 'dark' || obj.theme === 'light') {
    theme = obj.theme as ColorTheme;
  }

  let mobileControlStyle: 'invisible' | 'dpad' = 'invisible';
  if (obj.mobileControlStyle === 'dpad' || obj.mobileControlStyle === 'invisible') {
    mobileControlStyle = obj.mobileControlStyle;
  }

  const showTapGuides = typeof obj.showTapGuides === 'boolean' ? obj.showTapGuides : false;

  let initialSpeed = 95;
  if (typeof obj.initialSpeed === 'number' && Number.isFinite(obj.initialSpeed)) {
    initialSpeed = Math.max(40, Math.min(180, Math.floor(obj.initialSpeed)));
  }

  let initialSnakeLength = 3;
  if (typeof obj.initialSnakeLength === 'number' && Number.isFinite(obj.initialSnakeLength)) {
    initialSnakeLength = Math.max(3, Math.min(30, Math.floor(obj.initialSnakeLength)));
  }

  let snakeSkin: SnakeSkinId = 'sumi-ink';
  if (typeof obj.snakeSkin === 'string' && VALID_SNAKE_SKINS.includes(obj.snakeSkin as SnakeSkinId)) {
    snakeSkin = obj.snakeSkin as SnakeSkinId;
  }

  let foodSkin: FoodSkinId = 'vermilion-pip';
  if (typeof obj.foodSkin === 'string' && VALID_FOOD_SKINS.includes(obj.foodSkin as FoodSkinId)) {
    foodSkin = obj.foodSkin as FoodSkinId;
  }

  return {
    highScore,
    longestSnake,
    totalFoodEaten,
    gamesPlayed,
    totalTimePlayed,
    recentGames: recentGames.slice(0, 20),
    soundEnabled,
    reducedMotion,
    theme,
    mobileControlStyle,
    showTapGuides,
    initialSpeed,
    initialSnakeLength,
    snakeSkin,
    foodSkin,
  };
}

export function loadStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    return sanitizeStats(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: PlayerStats): void {
  try {
    const clean = sanitizeStats(stats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch (err) {
    console.warn('Failed to save stats', err);
  }
}

export function recordGameSession(
  score: number,
  finalLength: number,
  foodEaten: number,
  survivalTime: number
): { stats: PlayerStats; isNewRecord: boolean } {
  const current = loadStats();
  const isNewRecord = score > current.highScore;

  const newRecord: PlayerRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    score,
    length: finalLength,
    foodEaten,
    survivalTime: Math.round(survivalTime * 10) / 10,
  };

  const updatedRecent = [newRecord, ...current.recentGames]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  const updated: PlayerStats = {
    ...current,
    highScore: Math.max(current.highScore, score),
    longestSnake: Math.max(current.longestSnake, finalLength),
    totalFoodEaten: current.totalFoodEaten + foodEaten,
    gamesPlayed: current.gamesPlayed + 1,
    totalTimePlayed: current.totalTimePlayed + Math.round(survivalTime),
    recentGames: updatedRecent,
  };

  saveStats(updated);
  return { stats: updated, isNewRecord };
}

export function clearStats(): PlayerStats {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return { ...DEFAULT_STATS };
}
