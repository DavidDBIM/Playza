import type { GameState, Player, Projectile, Vector2 } from './types';

export interface PlayerInput {
  move: Vector2;
  lookAt: Vector2;
  attack: boolean;
  ability1: boolean;
  ability2?: boolean;
}

export class CoreEngine {
  public state: GameState;
  private onGameOver: (winner: string) => void;

  constructor(onGameOver: (winner: string) => void) {
    this.onGameOver = onGameOver;
    this.state = this.getInitialState();
  }

  private getInitialState(): GameState {
    return {
      players: {
        'player1': {
          id: 'player1',
          type: 'PLAYER',
          team: 1,
          position: { x: -10, y: 0 },
          velocity: { x: 0, y: 0 },
          radius: 0.8,
          health: 100,
          maxHealth: 100,
          energy: 100,
          maxEnergy: 100,
          direction: 0,
          speed: 8,
          score: 0,
          cooldowns: { 'ability1': 0, 'ability2': 0, 'attack': 0 }
        },
        'player2': {
          id: 'player2',
          type: 'PLAYER',
          team: 2,
          position: { x: 10, y: 0 },
          velocity: { x: 0, y: 0 },
          radius: 0.8,
          health: 100,
          maxHealth: 100,
          energy: 100,
          maxEnergy: 100,
          direction: Math.PI,
          speed: 8,
          score: 0,
          cooldowns: { 'ability1': 0, 'ability2': 0, 'attack': 0 }
        }
      },
      projectiles: [],
      timeRemaining: 60,
      isGameOver: false,
      winner: null,
      arena: {
        width: 30,
        height: 30,
        type: 'square'
      }
    };
  }

  public update(dt: number, inputs: Record<string, PlayerInput>) {
    if (this.state.isGameOver) return;

    this.state.timeRemaining -= dt;
    if (this.state.timeRemaining <= 0) {
      this.resolveGameOver('time');
      return;
    }

    // Update Players
    Object.keys(this.state.players).forEach(id => {
      const player = this.state.players[id];
      const input = inputs[id] || {};
      
      this.updatePlayer(player, input, dt);
      this.handlePlayerCombat(player, input);
    });

    // Update Projectiles
    this.updateProjectiles(dt);

    // Collision Resolution
    this.resolvePhysicCollisions();
  }

  private updatePlayer(player: Player, input: PlayerInput, dt: number) {
    const { move } = input;
    const accel = 50;
    const friction = 0.85;

    if (move) {
      player.velocity.x += move.x * accel * dt;
      player.velocity.y += move.y * accel * dt;
    }

    player.velocity.x *= friction;
    player.velocity.y *= friction;

    player.position.x += player.velocity.x * dt;
    player.position.y += player.velocity.y * dt;

    // Arena Boundaries
    const halfWidth = this.state.arena.width / 2;
    const halfHeight = this.state.arena.height / 2;

    if (Math.abs(player.position.x) > halfWidth - player.radius) {
      player.position.x = Math.sign(player.position.x) * (halfWidth - player.radius);
      player.velocity.x *= -0.5;
    }
    if (Math.abs(player.position.y) > halfHeight - player.radius) {
      player.position.y = Math.sign(player.position.y) * (halfHeight - player.radius);
      player.velocity.y *= -0.5;
    }

    // Update Cooldowns
    if (player.cooldowns) {
      Object.keys(player.cooldowns).forEach(key => {
        if (player.cooldowns![key] > 0) {
          player.cooldowns![key] = Math.max(0, player.cooldowns![key] - dt);
        }
      });
    }

    // Regain Energy
    player.energy = Math.min(player.maxEnergy!, player.energy! + 5 * dt);
  }

  private handlePlayerCombat(player: Player, input: PlayerInput) {
    if (input.attack && player.cooldowns?.attack === 0) {
      this.spawnProjectile(player, input.lookAt || { x: 1, y: 0 });
      player.cooldowns.attack = 0.4;
    }

    if (input.ability1 && player.cooldowns?.ability1 === 0 && player.energy! >= 30) {
      this.performDash(player, input.move);
      player.energy! -= 30;
      player.cooldowns!.ability1 = 2.0;
    }
  }

  private spawnProjectile(owner: Player, direction: Vector2) {
    const proj: Projectile = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'PROJECTILE',
      ownerId: owner.id,
      position: { ...owner.position },
      velocity: {
        x: direction.x * 20,
        y: direction.y * 20
      },
      radius: 0.3,
      damage: 10,
      lifeTime: 2.0
    };
    this.state.projectiles.push(proj);
  }

  private performDash(player: Player, moveDir: Vector2) {
    const dashPower = 20;
    const dir = moveDir || { x: Math.cos(player.direction), y: Math.sin(player.direction) };
    player.velocity.x = dir.x * dashPower;
    player.velocity.y = dir.y * dashPower;
  }

  private updateProjectiles(dt: number) {
    this.state.projectiles = this.state.projectiles.filter(p => {
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.lifeTime -= dt;

      // Check hit on players
      let hit = false;
      Object.values(this.state.players).forEach(player => {
        if (player.id !== p.ownerId && !player.isDead) {
          const dist = Math.hypot(p.position.x - player.position.x, p.position.y - player.position.y);
          if (dist < p.radius + player.radius) {
            player.health! -= p.damage;
            hit = true;
            if (player.health! <= 0) {
              player.isDead = true;
              this.resolveGameOver('ko', p.ownerId);
            }
          }
        }
      });

      return p.lifeTime > 0 && !hit;
    });
  }

  private resolvePhysicCollisions() {
    const p1 = this.state.players['player1'];
    const p2 = this.state.players['player2'];

    const dist = Math.hypot(p1.position.x - p2.position.x, p1.position.y - p2.position.y);
    const minDist = p1.radius + p2.radius;

    if (dist < minDist) {
      const angle = Math.atan2(p2.position.y - p1.position.y, p2.position.x - p1.position.x);
      const overlap = minDist - dist;
      
      p1.position.x -= Math.cos(angle) * overlap / 2;
      p1.position.y -= Math.sin(angle) * overlap / 2;
      p2.position.x += Math.cos(angle) * overlap / 2;
      p2.position.y += Math.sin(angle) * overlap / 2;
    }
  }

  private resolveGameOver(reason: string, winnerId?: string) {
    this.state.isGameOver = true;
    if (reason === 'ko') {
      this.state.winner = winnerId || null;
    } else {
      const p1 = this.state.players['player1'];
      const p2 = this.state.players['player2'];
      this.state.winner = p1.health! > p2.health! ? 'player1' : 'player2';
    }
    this.onGameOver(this.state.winner!);
  }

  public reset() {
    this.state = this.getInitialState();
  }
}
