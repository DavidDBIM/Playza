import Phaser from 'phaser'
import { PoolScene } from './PoolScene'

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1200,
  height: 700,
  backgroundColor: '#1a1a2e',
  scene: [PoolScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}

export const TABLE_CONFIG = {
  width: 1000,
  height: 500,
  cushionWidth: 30,
  pocketRadius: 25,
  ballRadius: 12,
}

export const PHYSICS_CONFIG = {
  friction: 0.985,
  restitution: 0.9,
  minVelocity: 0.3,
}

export const COLORS = {
  table: 0x1a472a,
  cushion: 0x2d5a3d,
  pocket: 0x0a0a0a,
  cueBall: 0xffffff,
  solid: [
    0xf4d03f, 0x1e3799, 0xe74c3c, 0x6c3483,
    0xe67e22, 0x27ae60, 0x782d31, 0x1a1a1a,
  ],
  stripe: [
    0xf4d03f, 0x4a69bd, 0xeb4d4b, 0xa569bd,
    0xe67e22, 0x2ecc71, 0x9b2335, 0x1a1a1a,
  ],
}