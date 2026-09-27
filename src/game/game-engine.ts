import { Direction, Point } from '../types/game';

export interface GameEngineState {
  gridWidth: number;
  gridHeight: number;
  snake: Point[];
  direction: Direction;
  nextDirectionQueue: Direction[];
  food: Point | null;
  score: number;
  foodEaten: number;
  isGameOver: boolean;
  speed: number; // current ms per tick
  baseSpeed: number; // starting ms per tick
  speedLevel: number; // increments every 5 food eaten
  speedUpTrigger: boolean; // flag when speed increased on this tick
  elapsedSeconds: number;
  deathReason?: 'self'; // ONLY self-collision ends the game!
  growthPerFood: number;
  pendingGrowth: number;
}

export class GameEngine {
  public state: GameEngineState;
  private initialSnakeLength: number;
  private baseSpeed: number;

  constructor(
    gridWidth: number = 40,
    gridHeight: number = 25,
    initialLength: number = 3,
    baseSpeed: number = 95
  ) {
    this.initialSnakeLength = initialLength;
    this.baseSpeed = baseSpeed;
    this.state = this.initState(gridWidth, gridHeight);
  }

  public updateDimensions(newWidth: number, newHeight: number): void {
    if (newWidth === this.state.gridWidth && newHeight === this.state.gridHeight) return;
    this.state.gridWidth = newWidth;
    this.state.gridHeight = newHeight;
    // ensure food is inside new bounds
    if (this.state.food) {
      if (this.state.food.x >= newWidth || this.state.food.y >= newHeight) {
        this.state.food = this.spawnFood(this.state.snake, newWidth, newHeight);
      }
    }
  }

  public reset(
    gridWidth?: number,
    gridHeight?: number,
    initialLength?: number,
    baseSpeed?: number
  ): void {
    const w = gridWidth ?? this.state.gridWidth;
    const h = gridHeight ?? this.state.gridHeight;
    if (initialLength !== undefined) this.initialSnakeLength = initialLength;
    if (baseSpeed !== undefined) this.baseSpeed = baseSpeed;

    this.state = this.initState(w, h);
  }

  private initState(width: number, height: number): GameEngineState {
    // Start small: 3 segments default
    const len = Math.max(3, this.initialSnakeLength);
    const startX = Math.max(len + 2, Math.floor(width / 2));
    const startY = Math.floor(height / 2);
    const direction: Direction = 'RIGHT';

    const snake: Point[] = [];
    for (let i = 0; i < len; i++) {
      snake.push({ x: startX - i, y: startY });
    }

    const food = this.spawnFood(snake, width, height);

    return {
      gridWidth: width,
      gridHeight: height,
      snake,
      direction,
      nextDirectionQueue: [],
      food,
      score: 0,
      foodEaten: 0,
      isGameOver: false,
      speed: this.baseSpeed,
      baseSpeed: this.baseSpeed,
      speedLevel: 1,
      speedUpTrigger: false,
      elapsedSeconds: 0,
      growthPerFood: 1,
      pendingGrowth: 0,
    };
  }

  public queueDirection(newDir: Direction): void {
    if (this.state.isGameOver) return;

    const queue = this.state.nextDirectionQueue;
    const baseDir = queue.length > 0 ? queue[queue.length - 1] : this.state.direction;

    if (this.isOpposite(baseDir, newDir) || baseDir === newDir) {
      return;
    }

    if (queue.length < 2) {
      queue.push(newDir);
    }
  }

  private isOpposite(d1: Direction, d2: Direction): boolean {
    return (
      (d1 === 'UP' && d2 === 'DOWN') ||
      (d1 === 'DOWN' && d2 === 'UP') ||
      (d1 === 'LEFT' && d2 === 'RIGHT') ||
      (d1 === 'RIGHT' && d2 === 'LEFT')
    );
  }

  public tick(deltaSeconds: number): { ateFood: boolean; speedIncreased: boolean; died: boolean } {
    if (this.state.isGameOver) {
      return { ateFood: false, speedIncreased: false, died: false };
    }

    this.state.elapsedSeconds += deltaSeconds;

    if (this.state.nextDirectionQueue.length > 0) {
      const next = this.state.nextDirectionQueue.shift()!;
      if (!this.isOpposite(this.state.direction, next)) {
        this.state.direction = next;
      }
    }

    const head = this.state.snake[0];
    let nextX = head.x;
    let nextY = head.y;

    switch (this.state.direction) {
      case 'UP':
        nextY -= 1;
        break;
      case 'DOWN':
        nextY += 1;
        break;
      case 'LEFT':
        nextX -= 1;
        break;
      case 'RIGHT':
        nextX += 1;
        break;
    }

    const { gridWidth, gridHeight } = this.state;

    // SIDE WALLS ALWAYS PASS THROUGH / WRAP AROUND (Never die on walls!)
    nextX = (nextX + gridWidth) % gridWidth;
    nextY = (nextY + gridHeight) % gridHeight;

    // Check food hit
    const isEating = this.state.food && nextX === this.state.food.x && nextY === this.state.food.y;

    // ONLY BITE ITSELF ENDS THE GAME (Self-collision check)
    const bodyToCheck = (isEating || this.state.pendingGrowth > 0)
      ? this.state.snake
      : this.state.snake.slice(0, this.state.snake.length - 1);

    for (let i = 0; i < bodyToCheck.length; i++) {
      if (bodyToCheck[i].x === nextX && bodyToCheck[i].y === nextY) {
        this.state.isGameOver = true;
        this.state.deathReason = 'self';
        return { ateFood: false, speedIncreased: false, died: true };
      }
    }

    // Advance snake head
    const newHead: Point = { x: nextX, y: nextY };
    const newSnake = [newHead, ...this.state.snake];

    let ateFood = false;
    let speedIncreased = false;

    if (isEating) {
      ateFood = true;
      this.state.foodEaten += 1;
      this.state.pendingGrowth += this.state.growthPerFood;

      // Dynamic score with bonus based on current length
      const lengthBonus = Math.floor(this.state.snake.length * 2.5);
      this.state.score += 100 + lengthBonus;

      // SPEED DIFFICULTY CURVE:
      // Every 5 pieces of food eaten, speed slightly increases (ms interval decreases by 4ms)
      // Caps safely at 42ms for playable responsiveness
      const currentTier = Math.floor(this.state.foodEaten / 5);
      const newSpeed = Math.max(42, this.baseSpeed - currentTier * 4.5);
      const newSpeedLevel = 1 + currentTier;

      if (this.state.foodEaten % 5 === 0) {
        speedIncreased = true;
      }

      this.state.speed = newSpeed;
      this.state.speedLevel = newSpeedLevel;

      // Spawn next food
      this.state.food = this.spawnFood(newSnake, gridWidth, gridHeight);
    }

    // Growth check: If there is pending growth, do not pop tail -> snake grows!
    if (this.state.pendingGrowth > 0) {
      this.state.pendingGrowth -= 1;
    } else {
      newSnake.pop();
    }

    this.state.snake = newSnake;

    return { ateFood, speedIncreased, died: false };
  }

  private spawnFood(snake: Point[], width: number, height: number): Point | null {
    const occupied = new Set<string>();
    for (const seg of snake) {
      occupied.add(`${seg.x},${seg.y}`);
    }

    const freeCells: Point[] = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (!occupied.has(`${x},${y}`)) {
          freeCells.push({ x, y });
        }
      }
    }

    if (freeCells.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * freeCells.length);
    return freeCells[randomIndex];
  }
}
