export interface Vector2 {
  x: number;
  y: number;
}

export type EntityType = 'PLAYER' | 'PROJECTILE' | 'OBSTACLE';

export interface Entity {
  id: string;
  type: EntityType;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  health?: number;
  maxHealth?: number;
  energy?: number;
  maxEnergy?: number;
  cooldowns?: Record<string, number>;
  isDead?: boolean;
}

export interface Projectile extends Entity {
  ownerId: string;
  damage: number;
  lifeTime: number;
}

export interface Player extends Entity {
  team: 1 | 2;
  direction: number; // angle in radians
  speed: number;
  score: number;
}

export interface GameState {
  players: Record<string, Player>;
  projectiles: Projectile[];
  timeRemaining: number;
  isGameOver: boolean;
  winner: string | null;
  arena: {
    width: number;
    height: number;
    type: 'circle' | 'square';
  };
}
