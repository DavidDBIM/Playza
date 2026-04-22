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

        // Coin pool — 2 000 slots to survive long high-difficulty runs
        for (let i = 0; i < 2000; i += 1) {
            const geometry = new THREE.CylinderGeometry(0.36, 0.36, 0.14, 18);
            const material = new THREE.MeshStandardMaterial({
                color: 0xffd700,
                roughness: 0.15,
                metalness: 0.95,
                emissive: 0xffaa00,
                emissiveIntensity: 0.55   // bright enough to see in dark biomes
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -Math.PI / 2;
            mesh.visible = false;
            this.scene.add(mesh);
            this.coins.push({ mesh, active: false });
        }
    }

    spawn(x, y, z) {
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
    }

    spawnCoin(x, y, z) {
        const coin = this.coins.find((item) => !item.active);
        if (!coin) {
            return;
        }

        coin.mesh.position.set(x, y, z);
        coin.mesh.visible = true;
        coin.active = true;
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
        this.despawnCoin(coin);
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

    despawnCoin(coin) {
        coin.mesh.visible = false;
        coin.active = false;
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
        // Spawn a powerup directly in front of the player every ~10 s so the
        // player is GUARANTEED to see power-ups, regardless of pattern probability.
        this._powerupTimer = (this._powerupTimer || 0) - dt;
        if (this._powerupTimer <= 0) {
            this._powerupTimer = 8 + Math.random() * 6; // 8–14 s interval
            // Pick a random lane X and place 24 units ahead of player
            const laneCount  = this.engine.config.laneCount;
            const centerIdx  = (laneCount - 1) / 2;
            const lane       = Math.floor(Math.random() * laneCount);
            const laneX      = (lane - centerIdx) * this.engine.config.laneWidth;
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
        this.coins.forEach((coin) => {
            if (!coin.active) {
                return;
            }

            const distanceAhead = playerZ - coin.mesh.position.z;
            if (distanceAhead > renderDistance || distanceAhead < -20) {
                this.despawnCoin(coin);
                return;
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
        });

        this.engine.ui.updatePowerUps(this.activeEffects, this.effectTimers, this.effectDurations);
        this.engine.container.classList.toggle('turbo-active', !!this.activeEffects.speed);
    }

    deactivateEffect(type) {
        this.activeEffects[type] = false;
        this.effectTimers[type] = 0;

        if (type === 'shield') {
            this.activeShield = false;
        }
    }

    reset() {
        this.powerups.forEach((powerup) => this.despawnPowerUp(powerup));
        this.coins.forEach((coin) => this.despawnCoin(coin));

        Object.keys(this.activeEffects).forEach((key) => {
            this.activeEffects[key] = false;
            this.effectTimers[key] = 0;
            this.effectDurations[key] = this.powerUpConfigs[key].duration;
        });

        this.activeShield = false;
        this._powerupTimer = 10; // give player 10 s before first guaranteed powerup
        this.engine.container.classList.remove('turbo-active');
    }
}
