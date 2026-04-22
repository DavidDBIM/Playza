import { DifficultyController } from './DifficultyController.js';
import { PatternManager } from './PatternManager.js';

export class ObstacleSpawner {
    constructor(engine) {
        this.engine = engine;
        this.renderDistance = 340;
        this.spawnLead = 26;
        this.currentBiome = 'road';
        this.biomes = ['road', 'railway', 'bridge', 'snow'];
        this.biomeTimer = 26;

        this.difficulty = new DifficultyController(engine);
        this.patternManager = new PatternManager(engine);

        this.reset();
    }

    seedInitialTrack() {
        this.difficulty.update();

        while (this.nextPatternZ > this.engine.player.player.position.z - this.renderDistance) {
            this.spawnNextPattern();
        }
    }

    update(dt) {
        this.difficulty.update(dt);
        this.updateBiome(dt);

        const playerZ = this.engine.player.player.position.z;
        while (this.nextPatternZ > playerZ - this.renderDistance) {
            this.spawnNextPattern();
        }
    }

    spawnNextPattern() {
        this.engine.environment.setBiome(this.currentBiome);

        const difficultyState = this.difficulty.getState();
        const pattern = this.patternManager.createPattern(this.nextPatternZ, this.currentBiome, difficultyState);

        pattern.obstacles.forEach((entry) => {
            this.engine.obstacles.spawn({
                lane: entry.lane,
                z: entry.z,
                biome: this.currentBiome,
                type: entry.type,
                movement: entry.movement
            });
        });

        pattern.coins.forEach((coin) => {
            this.engine.powerups.spawnCoin(this.getLaneX(coin.lane), coin.height, coin.z);
        });

        if (pattern.powerup) {
            this.engine.powerups.spawn(this.getLaneX(pattern.powerup.lane), 0, pattern.powerup.z);
        }

        this.nextPatternZ -= pattern.length;
    }

    updateBiome(dt) {
        this.biomeTimer -= dt;
        if (this.biomeTimer > 0) {
            return;
        }

        const currentIndex = this.biomes.indexOf(this.currentBiome);
        const nextChoices = this.biomes.filter((_, index) => index !== currentIndex);
        this.currentBiome = nextChoices[Math.floor(Math.random() * nextChoices.length)] || 'road';
        this.biomeTimer = 24 + Math.random() * 8;
    }

    getLaneX(lane) {
        const centerIndex = (this.engine.config.laneCount - 1) / 2;
        return (lane - centerIndex) * this.engine.config.laneWidth;
    }

    reset() {
        this.nextPatternZ = -this.spawnLead;
        this.currentBiome = 'road';
        this.biomeTimer = 26;
        this.difficulty.reset();
        this.patternManager.lastPatternId = null;
    }
}
