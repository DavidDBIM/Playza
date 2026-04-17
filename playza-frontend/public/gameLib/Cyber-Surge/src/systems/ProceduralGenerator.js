export class ProceduralGenerator {
    constructor(engine) {
        this.engine = engine;
        this.chunkSize = 72;
        this.renderDistance = 340;
        this.lastChunkZ = 0;
        this.difficulty = 1;
        this.currentBiome = 'road';
        this.biomes = ['road', 'railway', 'bridge', 'snow'];
        this.biomeTimer = 28;
        this.patternCounter = 0;
    }

    seedInitialTrack() {
        while (this.lastChunkZ > this.engine.player.player.position.z - this.renderDistance) {
            this.generateChunk();
        }
        this.ensureContentCoverage();
    }

    update(dt) {
        const playerZ = this.engine.player.player.position.z;

        while (this.lastChunkZ > playerZ - this.renderDistance) {
            this.generateChunk();
        }

        this.ensureContentCoverage();
        this.updateDifficulty(dt);
    }

    generateChunk() {
        const chunkZ = this.lastChunkZ;
        const patternCount = 6;
        const spacing = 12;

        this.engine.environment.setBiome(this.currentBiome);

        for (let i = 0; i < patternCount; i += 1) {
            const z = chunkZ - i * spacing;
            this.spawnPattern(z, i);
        }

        this.lastChunkZ -= this.chunkSize;
    }

    spawnPattern(z, indexInChunk) {
        const laneX = (lane) => (lane - 1) * this.engine.config.laneWidth;
        const difficultyBias = Math.min(0.22, (this.difficulty - 1) * 0.05);
        const forceActionPattern = this.patternCounter % 4 === 0;
        const roll = Math.random();
        this.patternCounter += 1;

        if (indexInChunk === 0) {
            const middleLane = 1;
            this.engine.obstacles.spawn(laneX(middleLane), 0, z, this.currentBiome, 'blocker');
            [0, 2].forEach((lane) => this.spawnCoinsInLane(lane, z, 9, 1.28));
            return;
        }

        if (forceActionPattern || roll < 0.24 - difficultyBias * 0.2) {
            const blocked = this.getRandomLane();
            this.engine.obstacles.spawn(laneX(blocked), 0, z, this.currentBiome, 'blocker');
            [0, 1, 2].filter((lane) => lane !== blocked).forEach((lane) => this.spawnCoinsInLane(lane, z, 9, 1.28));
        } else if (roll < 0.44) {
            const slideLane = this.getRandomLane();
            this.engine.obstacles.spawn(laneX(slideLane), 0, z, this.currentBiome, 'slideGate');
            [0, 1, 2].filter((lane) => lane !== slideLane).forEach((lane) => this.spawnCoinsInLane(lane, z, 8, 1.22));
            this.spawnCoinsInLane(slideLane, z - 1.2, 6, 1.02, 0.55);
        } else if (roll < 0.68 + difficultyBias) {
            const freeLane = this.getRandomLane();
            [0, 1, 2].forEach((lane) => {
                if (lane === freeLane) {
                    this.spawnCoinsInLane(lane, z, 11, 1.15);
                } else {
                    this.engine.obstacles.spawn(laneX(lane), 0, z, this.currentBiome, 'blocker');
                }
            });
        } else if (roll < 0.88 + difficultyBias) {
            const first = this.getRandomLane();
            const second = this.getOtherLane(first);
            this.engine.obstacles.spawn(laneX(first), 0, z, this.currentBiome, 'blocker');
            this.engine.obstacles.spawn(
                laneX(second),
                0,
                z - 4.8,
                this.currentBiome,
                Math.random() < 0.45 ? 'slideGate' : 'blocker'
            );
            const freeLane = [0, 1, 2].find((lane) => lane !== first && lane !== second) ?? 1;
            this.spawnCoinsInLane(freeLane, z, 10, 1.14);
            this.spawnCoinsInLane(freeLane, z - 4.8, 6, 1.02);
        } else {
            const firstBlocked = this.getRandomLane();
            const secondBlocked = this.getOtherLane(firstBlocked);
            this.engine.obstacles.spawn(laneX(firstBlocked), 0, z, this.currentBiome, 'blocker');
            this.engine.obstacles.spawn(laneX(secondBlocked), 0, z, this.currentBiome, 'slideGate');
            const freeLane = [0, 1, 2].find((lane) => lane !== firstBlocked && lane !== secondBlocked) ?? 1;
            this.spawnCoinsInLane(freeLane, z, 12, 1.08);
        }

        this.spawnBonusCoins(z - 6);

        if (Math.random() < 0.2) {
            const lane = this.getRandomLane();
            this.engine.powerups.spawn(laneX(lane), 0, z - 2);
        }
    }

    ensureContentCoverage() {
        const playerZ = this.engine.player.player.position.z;
        const step = 18;
        const startZ = playerZ - 30;
        const endZ = playerZ - this.renderDistance + 24;

        for (let z = startZ; z >= endZ; z -= step) {
            if (!this.hasObstacleNear(z, 8)) {
                const lane = this.getRandomLane();
                const type = (z / step) % 3 === 0 ? 'slideGate' : 'blocker';
                this.engine.obstacles.spawn((lane - 1) * this.engine.config.laneWidth, 0, z, this.currentBiome, type);
            }

            if (!this.hasCoinsNear(z, 7)) {
                const lane = this.getRandomLane();
                this.spawnCoinsInLane(lane, z, 7, 1.08, 1);
            }
        }
    }

    hasObstacleNear(z, tolerance = 8) {
        return this.engine.obstacles.obstacles.some(
            (obstacle) => obstacle.active && Math.abs(obstacle.mesh.position.z - z) <= tolerance
        );
    }

    hasCoinsNear(z, tolerance = 7) {
        let count = 0;
        for (const coin of this.engine.powerups.coins) {
            if (!coin.active) {
                continue;
            }
            if (Math.abs(coin.mesh.position.z - z) <= tolerance) {
                count += 1;
                if (count >= 4) {
                    return true;
                }
            }
        }
        return false;
    }

    spawnBonusCoins(z) {
        const lane = this.getRandomLane();
        this.spawnCoinsInLane(lane, z, 5, 0.92, 1.15);
    }

    spawnCoinsInLane(lane, z, count = 8, spacing = 1.2, height = 1) {
        const x = (lane - 1) * this.engine.config.laneWidth;
        for (let i = 0; i < count; i += 1) {
            this.engine.powerups.spawnCoin(x, height, z - i * spacing);
        }
    }

    getOtherLane(lane) {
        const lanes = [0, 1, 2].filter((value) => value !== lane);
        return lanes[Math.floor(Math.random() * lanes.length)];
    }

    getRandomLane() {
        return Math.floor(Math.random() * 3);
    }

    updateDifficulty(dt) {
        const gameTime = this.engine.gameTime;
        this.difficulty = 1 + gameTime / 80;

        this.biomeTimer -= dt;
        if (this.biomeTimer <= 0) {
            this.currentBiome = this.biomes[Math.floor(Math.random() * this.biomes.length)];
            this.biomeTimer = 26 + Math.random() * 8;
        }
    }

    reset() {
        this.lastChunkZ = -12;
        this.difficulty = 1;
        this.currentBiome = 'road';
        this.biomeTimer = 28;
        this.patternCounter = 0;
    }
}
