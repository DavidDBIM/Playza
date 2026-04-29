import { DifficultyController } from './DifficultyController.js';
import { PatternManager } from './PatternManager.js';

export class ObstacleSpawner {
    constructor(engine) {
        this.engine = engine;
        this.renderDistance = 400;   // how far ahead patterns are pre-spawned
        this.spawnLead      = 12;    // first obstacle at ~12 units (< 1s at base speed)
        this.currentBiome   = 'road';
        this.biomes         = ['road', 'railway', 'bridge', 'snow'];
        this.biomeTimer     = 32;    // stay in 'road' for a full 32s before switching
        this.activeEvent    = null;
        this.nextEventAt    = 22;
        this.lastPhase      = 1;
        this.distanceSinceLastCoin = 0;
        this.maxCoinDryDistance = 36;  // tightened: was 48, force-coins fires sooner
        this.lastCoinPlayerZ = 0;      // track player Z at last successful coin spawn
        this.coinDebug = typeof window !== 'undefined'
            && window.localStorage?.getItem('cyberSurgeCoinDebug') === '1';

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
        this.updateEvents(dt);
        this.updateBiome(dt);

        const playerZ = this.engine.player.player.position.z;
        while (this.nextPatternZ > playerZ - this.renderDistance) {
            this.spawnNextPattern();
        }
    }

    spawnNextPattern() {
        this.engine.environment.setBiome(this.currentBiome);

        const playerZ = Math.abs(this.engine.player.player.position.z);
        // Measure dry distance by actual player travel, not pattern spacing
        this.distanceSinceLastCoin = playerZ - Math.abs(this.lastCoinPlayerZ);

        const shouldForceCoins = this.distanceSinceLastCoin >= this.maxCoinDryDistance;
        const difficultyState = {
            ...this.difficulty.getState(),
            forceCoins: shouldForceCoins
        };
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

        let spawnedCoinCount = 0;
        pattern.coins.forEach((coin) => {
            if (this.engine.powerups.spawnCoin(this.getLaneX(coin.lane), coin.height, coin.z)) {
                spawnedCoinCount += 1;
            }
        });

        if (spawnedCoinCount > 0) {
            this.lastCoinPlayerZ = Math.abs(this.engine.player.player.position.z);
            this.distanceSinceLastCoin = 0;
            if (shouldForceCoins) {
                this.logCoinDebug('anti-dry-resolved', { spawnedCoinCount, prevDryDistance: this.distanceSinceLastCoin });
            }
        }

        this.logCoinDebug('segment', {
            pattern: pattern.id,
            coinPattern: pattern.coinPattern,
            forced: shouldForceCoins,
            planned: pattern.coins.length,
            spawned: spawnedCoinCount,
            dryDistance: this.distanceSinceLastCoin,
            event: difficultyState.event?.type || 'none'
        });

        if (pattern.powerup) {
            this.engine.powerups.spawn(
                this.getLaneX(pattern.powerup.lane),
                pattern.powerup.height ?? 0,
                pattern.powerup.z
            );
        }

        this.nextPatternZ -= pattern.length;
    }

    logCoinDebug(event, payload = {}) {
        if (!this.coinDebug) {
            return;
        }
        console.debug('[CyberSurge:spawn]', event, payload);
    }

    updateEvents(dt) {
        const state = this.difficulty.getState();

        if (state.phase !== this.lastPhase) {
            this.lastPhase = state.phase;
            this.engine.ui?.flashMessage(state.phase === 2 ? 'Traffic density rising' : 'Night grid online');
            this.engine.cameraSystem?.addShake?.(0.18);
            this.engine.environment?.setPhase?.(state.phase);
            this.biomeTimer = 0;
        }

        if (this.activeEvent) {
            this.activeEvent.remaining -= dt;
            if (this.activeEvent.remaining <= 0) {
                const type = this.activeEvent.type;
                this.activeEvent = null;
                this.nextEventAt = state.time + 16 + Math.random() * 16;
                if (type === 'challenge') {
                    this.engine.ui?.flashMessage('Clear lane restored');
                }
            }
            return;
        }

        if (state.time >= this.nextEventAt) {
            this.startEvent(state);
        }
    }

    startEvent(state) {
        const roll = Math.random();
        const type = state.phase === 1 || roll < 0.42
            ? 'coinRush'
            : roll < 0.78
                ? 'challenge'
                : 'recovery';

        const labels = {
            coinRush: 'Coin rush detected',
            challenge: 'Firewall traffic ahead',
            recovery: 'Open signal window'
        };

        this.activeEvent = {
            type,
            remaining: type === 'challenge' ? 9 + Math.random() * 4 : 7 + Math.random() * 5
        };
        this.engine.ui?.flashMessage(labels[type]);
    }

    updateBiome(dt) {
        const state = this.difficulty.getState();
        this.biomeTimer -= dt;

        if (state.phase === 1) {
            this.currentBiome = 'road';
            return;
        }

        if (this.biomeTimer > 0) {
            return;
        }

        const phaseBiomes = state.phase === 2
            ? ['road', 'railway', 'bridge']
            : ['railway', 'bridge', 'snow', 'air'];
        const nextChoices = phaseBiomes.filter((biome) => biome !== this.currentBiome);
        this.currentBiome = nextChoices[Math.floor(Math.random() * nextChoices.length)] || 'road';
        this.engine.environment?.setPhase?.(state.phase);
        this.engine.ui?.flashMessage(this.engine.environment?.getCurrentDistrictLabel?.() || 'Sector shift');
        this.biomeTimer = state.phase === 2 ? 24 + Math.random() * 8 : 16 + Math.random() * 10;
    }

    getLaneX(lane) {
        const centerIndex = (this.engine.config.laneCount - 1) / 2;
        return (lane - centerIndex) * this.engine.config.laneWidth;
    }

    reset() {
        this.nextPatternZ   = -this.spawnLead;
        this.currentBiome   = 'road';
        this.biomeTimer     = 32;
        this.activeEvent    = null;
        this.nextEventAt    = 22;
        this.lastPhase      = 1;
        this.distanceSinceLastCoin = 0;
        this.lastCoinPlayerZ = 0;
        this.difficulty.reset();
        this.patternManager.lastPatternId = null;
    }
}
