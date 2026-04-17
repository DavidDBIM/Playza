import * as THREE from 'three';

export class EffectSystem {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.particles = [];
        this.maxParticles = 720;
        this.initParticlePool();
    }

    initParticlePool() {
        for (let i = 0; i < this.maxParticles; i += 1) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));

            const material = new THREE.PointsMaterial({
                size: 0.15,
                color: 0xffffff,
                transparent: true,
                opacity: 0.8,
                sizeAttenuation: true
            });

            const points = new THREE.Points(geometry, material);
            points.visible = false;
            this.scene.add(points);

            this.particles.push({
                points,
                velocity: new THREE.Vector3(),
                life: 0,
                maxLife: 1,
                active: false
            });
        }
    }

    spawnParticle(position, config) {
        const particle = this.particles.find((item) => !item.active);
        if (!particle) {
            return;
        }

        const positions = particle.points.geometry.attributes.position.array;
        positions[0] = position.x;
        positions[1] = position.y;
        positions[2] = position.z;
        particle.points.geometry.attributes.position.needsUpdate = true;

        particle.points.material.color.setHex(config.color || 0xffffff);
        particle.points.material.opacity = config.opacity || 0.8;
        particle.points.material.size = config.size || 0.15;

        particle.velocity.copy(
            config.velocity ||
            new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 2, (Math.random() - 0.5) * 2)
        );

        particle.life = config.life || 1;
        particle.maxLife = particle.life;
        particle.active = true;
        particle.points.visible = true;
    }

    burst(position, count, baseConfig, velocityFactory) {
        for (let i = 0; i < count; i += 1) {
            this.spawnParticle(position.clone(), {
                ...baseConfig,
                velocity: velocityFactory(i)
            });
        }
    }

    addDust(position) {
        this.burst(
            position,
            8,
            { color: 0xa1a1aa, life: 0.5, opacity: 0.55, size: 0.12 },
            () => new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 2, -Math.random() * 2)
        );
    }

    addJump(position) {
        this.burst(
            position,
            12,
            { color: 0xf97316, life: 0.58, opacity: 0.82, size: 0.16 },
            () => new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 3 + 1, -Math.random() * 3)
        );
    }

    addSlide(position) {
        this.burst(
            position.clone().add(new THREE.Vector3(0, 0.2, 0)),
            16,
            { color: 0x38bdf8, life: 0.42, opacity: 0.76, size: 0.14 },
            () => new THREE.Vector3((Math.random() - 0.5) * 5, Math.random(), -Math.random() * 4)
        );
    }

    addLand(position) {
        this.burst(
            position,
            20,
            { color: 0x71717a, life: 0.52, opacity: 0.8, size: 0.13 },
            () => new THREE.Vector3((Math.random() - 0.5) * 6, Math.random() * 2, -Math.random() * 2)
        );
        this.engine.cameraSystem.addShake(0.1);
    }

    addCoinCollect(position) {
        this.burst(
            position,
            12,
            { color: 0xfacc15, life: 0.8, opacity: 1, size: 0.16 },
            () => new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 4 + 2, (Math.random() - 0.5) * 4)
        );
    }

    addPowerUpSpawn(position) {
        this.burst(
            position,
            22,
            { color: 0x22d3ee, life: 1, opacity: 0.9, size: 0.18 },
            () => new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 3 + 1, (Math.random() - 0.5) * 3)
        );
    }

    addPowerUpCollect(position) {
        this.burst(
            position,
            28,
            { color: 0xf8fafc, life: 0.62, opacity: 1, size: 0.18 },
            (i) => {
                const angle = (i / 28) * Math.PI * 2;
                return new THREE.Vector3(Math.cos(angle) * 5.6, Math.random() * 3.2, Math.sin(angle) * 5.6);
            }
        );
        this.engine.cameraSystem.addShake(0.2);
    }

    addShieldBreak(position) {
        this.burst(
            position,
            34,
            { color: 0xfacc15, life: 0.82, opacity: 1, size: 0.16 },
            (i) => {
                const angle = (i / 34) * Math.PI * 2;
                return new THREE.Vector3(Math.cos(angle) * 8, Math.random() * 5, Math.sin(angle) * 8);
            }
        );
        this.engine.cameraSystem.addShake(0.42);
    }

    addNearMiss(position = this.engine.player.player.position.clone()) {
        this.burst(
            position.clone().add(new THREE.Vector3(0, 0.9, -0.4)),
            10,
            { color: 0xf97316, life: 0.25, opacity: 0.7, size: 0.12 },
            () => new THREE.Vector3((Math.random() - 0.5) * 1.6, Math.random() * 1.4, -Math.random() * 5)
        );
        this.engine.cameraSystem.addShake(0.16);
    }

    addTurboTrail(position) {
        for (let i = 0; i < 3; i += 1) {
            this.spawnParticle(position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.6 + Math.random() * 0.4, 0.3)), {
                color: 0x22d3ee,
                life: 0.24,
                opacity: 0.4,
                size: 0.18,
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.12, 4 + Math.random() * 4)
            });
        }
    }

    update(dt) {
        if (this.engine.powerups.activeEffects.speed) {
            this.addTurboTrail(this.engine.player.player.position);
        }

        this.particles.forEach((particle) => {
            if (!particle.active) {
                return;
            }

            particle.life -= dt;
            if (particle.life <= 0) {
                particle.active = false;
                particle.points.visible = false;
                return;
            }

            const positions = particle.points.geometry.attributes.position.array;
            positions[0] += particle.velocity.x * dt;
            positions[1] += particle.velocity.y * dt;
            positions[2] += particle.velocity.z * dt;

            particle.velocity.y -= 9.8 * dt * 0.5;
            particle.points.geometry.attributes.position.needsUpdate = true;
            particle.points.material.opacity = (particle.life / particle.maxLife) * 0.8;
        });
    }

    reset() {
        this.particles.forEach((particle) => {
            particle.active = false;
            particle.points.visible = false;
        });
    }
}
