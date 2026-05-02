import * as THREE from 'three';

export class PowerUpSystem {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.powerups = [];
        this.coins = [];

        this.powerUpConfigs = {
            magnet: { color: 0xa855f7, duration: 10, label: 'Magnet Online' },
            speed: { color: 0xf97316, duration: 6, label: 'Turbo Surge' },
            shield: { color: 0x22c55e, duration: 8, label: 'Guard Shield' }
        };

        this.activeEffects = { magnet: false, speed: false, shield: false };
        this.effectTimers = {};
        this.effectDurations = {};
        this.activeShield = false;

        // O(1) active-coin tracking — avoids scanning 1600-slot array every frame
        this.activeCoins = new Set();
        // Guaranteed backup spawner timer
        this._guaranteedCoinTimer = 3;

        this.coinDebug = typeof window !== 'undefined'
            && window.localStorage?.getItem('cyberSurgeCoinDebug') === '1';
        this.coinPoolStats = {
            created: 0,
            expanded: 0,
            spawned: 0,
            collected: 0,
            despawned: 0
        };

        this.createPool();
    }

    createPool() {
        // Powerup pool
        for (let i = 0; i < 120; i += 1) {
            const mesh = new THREE.Mesh();
            mesh.visible = false;
            this.scene.add(mesh);
            this.powerups.push({ mesh, active: false, type: null });
        }

        // Coin pool — 1600 slots
        for (let i = 0; i < 1600; i += 1) {
            this.coins.push(this.createCoinItem());
        }
    }

    createCoinItem() {
        const geometry = new THREE.CylinderGeometry(0.36, 0.36, 0.14, 18);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.15,
            metalness: 0.95,
            emissive: 0xffaa00,
            emissiveIntensity: 0.78
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.visible = false;
        this.scene.add(mesh);
        this.coinPoolStats.created += 1;
        return { mesh, active: false };
    }

    spawn(x, y, z) {
        if (!this.engine.layout.isGameplayPositionValid(x)) {
            this.logCoinDebug('powerup-rejected', { reason: 'outside-road', x, y, z });
            return false;
        }

        const types = Object.keys(this.powerUpConfigs);
        const type = types[Math.floor(Math.random() * types.length)];
        const config = this.powerUpConfigs[type];
        const powerup = this.powerups.find((item) => !item.active);

        if (!powerup) {
            return;
        }

        const geometry = new THREE.IcosahedronGeometry(0.46, 0);
        const material = new THREE.MeshStandardMaterial({
            color: config.color,
            roughness: 0.16,
            metalness: 0.75,
            emissive: config.color,
            emissiveIntensity: 0.32
        });

        powerup.mesh.geometry = geometry;
        powerup.mesh.material = material;
        powerup.mesh.position.set(x, y + 1.15, z);
        powerup.mesh.visible = true;
        powerup.mesh.userData.type = type;
        powerup.active = true;
        powerup.type = type;

        this.engine.effects.addPowerUpSpawn(powerup.mesh.position.clone());
        return true;
    }

    spawnCoin(x, y, z) {
        // Guard: NaN positions make coins invisible without error
        if (!isFinite(x) || !isFinite(y) || !isFinite(z)) {
            this.logCoinDebug('spawn-rejected', { reason: 'non-finite', x, y, z });
            return false;
        }
        if (!this.engine.layout.isGameplayPositionValid(x)) {
            this.logCoinDebug('spawn-rejected', { reason: 'outside-road', x, y, z });
            return false;
        }

        const coin = this.acquireCoin();
        coin.mesh.position.set(x, y, z);
        coin.mesh.visible = true;
        coin.active = true;
        this.activeCoins.add(coin);
        this.coinPoolStats.spawned += 1;
        this.logCoinDebug('spawn', { x, y, z });
        return true;
    }

    acquireCoin() {
        const inactive = this.coins.find((item) => !item.active);
        if (inactive) {
            return inactive;
        }

        const coin = this.createCoinItem();
        this.coins.push(coin);
        this.coinPoolStats.expanded += 1;
        this.logCoinDebug('pool-expanded', {
            poolSize: this.coins.length,
            active: this.activeCoins.size
        });
        return coin;
    }

    collectPowerUp(powerup) {
        const type = powerup.type;
        const config = this.powerUpConfigs[type];

        this.activeEffects[type] = true;
        this.effectTimers[type] = config.duration;
        this.effectDurations[type] = config.duration;

        if (type === 'shield') {
            this.activeShield = true;
        }

        this.engine.audio.playPowerUp();
        this.engine.effects.addPowerUpCollect(powerup.mesh.position.clone());
        this.engine.scoring.addScore(60, 'powerup');
        this.engine.ui.flashMessage(config.label);
        this.despawnPowerUp(powerup);
    }

    collectCoin(coin) {
        this.engine.scoring.addCoins(1);
        this.engine.audio.playCoin();
        this.engine.effects.addCoinCollect(coin.mesh.position.clone());
        this.coinPoolStats.collected += 1;
        this.despawnCoin(coin, 'collect');
    }

    consumeShield() {
        this.activeShield = false;
        this.activeEffects.shield = false;
        this.effectTimers.shield = 0;
    }

    despawnPowerUp(powerup) {
        powerup.mesh.visible = false;
        powerup.active = false;
    }

    despawnCoin(coin, reason = 'despawn') {
        coin.mesh.visible = false;
        coin.active = false;
        this.activeCoins.delete(coin);
        if (reason !== 'collect') {
            this.coinPoolStats.despawned += 1;
        }
        this.logCoinDebug('release', {
            reason,
            z: coin.mesh.position.z,
            active: this.activeCoins.size
        });
    }

    update(dt) {
        const playerPosition = this.engine.player.player.position;
        const playerZ = playerPosition.z;
        const renderDistance = this.engine.generator.renderDistance;

        // ── Active-effect timers ──────────────────────────────────────────────
        Object.keys(this.effectTimers).forEach((type) => {
            if (this.effectTimers[type] > 0) {
                this.effectTimers[type] -= dt;
                if (this.effectTimers[type] <= 0) {
                    this.deactivateEffect(type);
                }
            }
        });

        // ── Guaranteed powerup timer ──────────────────────────────────────
        this._powerupTimer = (this._powerupTimer || 0) - dt;
        if (this._powerupTimer <= 0) {
            this._powerupTimer = 8 + Math.random() * 6;
            const lane       = Math.floor(Math.random() * this.engine.config.laneCount);
            const laneX      = this.engine.layout.getLaneX(lane);
            this.spawn(laneX, 0, playerZ - 22);
        }

        // ── Powerup mesh update ─────────────────────────────────────────
        this.powerups.forEach((powerup) => {
            if (!powerup.active) {
                return;
            }

            const distanceAhead = playerZ - powerup.mesh.position.z;
            if (distanceAhead > renderDistance || distanceAhead < -20) {
                this.despawnPowerUp(powerup);
                return;
            }

            powerup.mesh.rotation.y += dt * 2.5;
            powerup.mesh.rotation.x += dt * 1.2;
            powerup.mesh.position.y += Math.sin(this.engine.elapsedTime * 3 + powerup.mesh.position.z * 0.03) * 0.002;
        });

        // ── Coin update ──────────────────────────────────────────────────
        // FIX 1: Use activeCoins Set (O(1)) instead of scanning 1600-slot array (O(n))
        // FIX 2: ahead-prune uses renderDistance + 30 buffer so coins at the far end
        //        of a pattern (anchorZ - N*spacing) aren't pruned the same frame they spawn
        const aheadPruneDistance = renderDistance + 30;

        for (const coin of this.activeCoins) {
            const distanceAhead = playerZ - coin.mesh.position.z;

            if (distanceAhead > aheadPruneDistance || distanceAhead < -24) {
                this.despawnCoin(coin, distanceAhead > aheadPruneDistance ? 'ahead-prune' : 'behind-prune');
                continue;
            }

            coin.mesh.rotation.z += dt * 4.2;

            if (this.activeEffects.magnet) {
                const distance = playerPosition.distanceTo(coin.mesh.position);
                if (distance < 14) {
                    const direction = playerPosition.clone().sub(coin.mesh.position).normalize();
                    coin.mesh.position.add(direction.multiplyScalar((26 + (14 - distance) * 2) * dt));
                    if (distance < 1.1) {
                        this.collectCoin(coin);
                    }
                }
            }
        }

        // ── Guaranteed coin backup spawner ────────────────────────────────
        // If active coins hit 0 for 4+ seconds, bypass the pattern system and
        // directly spawn a coin line in front of the player. This cannot fail.
        this._guaranteedCoinTimer -= dt;
        if (this._guaranteedCoinTimer <= 0) {
            if (!this.hasVisibleCoinsAhead(playerZ)) {
                const aheadZ = playerZ - 18;
                const laneX = this.engine.layout.getLaneX(this.engine.layout.getCenterLane());
                for (let i = 0; i < 8; i++) {
                    this.spawnCoin(laneX, 1.2, aheadZ - i * 1.3);
                }
                if (this.coinDebug) {
                    console.warn('[CyberSurge:coins] ⚠️ Backup spawner fired — drought detected!');
                }
            }
            this._guaranteedCoinTimer = 4;
        }

        this.engine.ui.updatePowerUps(this.activeEffects, this.effectTimers, this.effectDurations);
        this.engine.container.classList.toggle('turbo-active', !!this.activeEffects.speed);
    }

    getActiveCoinCount() {
        return this.activeCoins.size;
    }

    hasVisibleCoinsAhead(playerZ) {
        for (const coin of this.activeCoins) {
            const distanceAhead = playerZ - coin.mesh.position.z;
            if (distanceAhead >= 8 && distanceAhead <= 105) {
                return true;
            }
        }
        return false;
    }

    logCoinDebug(event, payload = {}) {
        if (!this.coinDebug) {
            return;
        }
        console.debug('[CyberSurge:coins]', event, payload, {
            pool: this.coins.length,
            active: this.activeCoins.size,
            stats: this.coinPoolStats
        });
    }

    deactivateEffect(type) {
        this.activeEffects[type] = false;
        this.effectTimers[type] = 0;

        if (type === 'shield') {
            this.activeShield = false;
        }
    }

    reset() {
        // Despawn all active coins via Set (fast, correct)
        for (const coin of [...this.activeCoins]) {
            this.despawnCoin(coin, 'reset');
        }
        this.activeCoins.clear();

        this.powerups.forEach((powerup) => this.despawnPowerUp(powerup));
        this.coinPoolStats.spawned = 0;
        this.coinPoolStats.collected = 0;
        this.coinPoolStats.despawned = 0;
        this._guaranteedCoinTimer = 3;

        Object.keys(this.activeEffects).forEach((key) => {
            this.activeEffects[key] = false;
            this.effectTimers[key] = 0;
            this.effectDurations[key] = this.powerUpConfigs[key].duration;
        });

        this.activeShield = false;
        this._powerupTimer = 10;
        this.engine.container.classList.remove('turbo-active');
    }
}
