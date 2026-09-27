export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export type GameState =
  | 'PLAYING'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'RECORDS'
  | 'SETTINGS';

export interface PlayerRecord {
  id: string;
  date: string;
  score: number;
  length: number;
  foodEaten: number;
  survivalTime: number; // in seconds
}

export type ColorTheme = 'light' | 'dark';

export type MobileControlStyle = 'invisible' | 'dpad';

export type SnakeSkinId =
  | 'sumi-ink'
  | 'moss-paper'
  | 'prussian-blueprint'
  | 'vermilion-terracotta'
  | 'lead-monochrome';

export type FoodSkinId =
  | 'vermilion-pip'
  | 'brass-ring'
  | 'moss-square'
  | 'bone-diamond'
  | 'persimmon-knot';

export interface SnakeSkinDef {
  id: SnakeSkinId;
  name: string;
  tagline: string;
  headColor: string;
  bodyColor: string;
  tailColor: string;
  borderColor: string;
  notchColor: string;
  eyeWhite: string;
  pupilColor: string;
}

export interface FoodSkinDef {
  id: FoodSkinId;
  name: string;
  tagline: string;
  fillColor: string;
  strokeColor: string;
  innerMarkColor?: string;
  shape: 'diamond' | 'pip' | 'ring' | 'square' | 'knot';
}

export interface PlayerStats {
  highScore: number;
  longestSnake: number;
  totalFoodEaten: number;
  gamesPlayed: number;
  totalTimePlayed: number;
  recentGames: PlayerRecord[];
  soundEnabled: boolean;
  reducedMotion: boolean;
  theme: ColorTheme;
  mobileControlStyle: MobileControlStyle;
  showTapGuides: boolean;
  initialSpeed: number; // ms
  initialSnakeLength: number;
  snakeSkin: SnakeSkinId;
  foodSkin: FoodSkinId;
}
