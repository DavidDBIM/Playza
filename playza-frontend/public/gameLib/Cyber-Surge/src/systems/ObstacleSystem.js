import * as THREE from 'three';

export class ObstacleSystem {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.obstacles = [];
        this.pool = [];

        this.obstacleConfigs = {
            blocker: { type: 'blocker', width: 2.2, height: 1.8, depth: 1.6, color: 0x1d4ed8 },
            slideGate: { type: 'slideGate', width: 2.5, height: 1.1, depth: 1.2, color: 0xf97316 },
            drone: { type: 'drone', width: 1.5, height: 1.3, depth: 1.2, color: 0x334155 }
        };

        this.initPool();
    }

    initPool() {
        for (let i = 0; i < 240; i += 1) {
            const mesh = new THREE.Group();
            mesh.visible = false;
            this.scene.add(mesh);
            this.pool.push({ mesh, active: false, config: null });
        }
    }

    spawn(x, y, z, biome, forcedType = 'blocker') {
        let obstacle = this.pool.find((item) => !item.active);

        if (!obstacle) {
            const mesh = new THREE.Group();
            mesh.visible = false;
            this.scene.add(mesh);
            obstacle = { mesh, active: false, config: null };
            this.pool.push(obstacle);
        }

        const config = this.obstacleConfigs[forcedType] || this.obstacleConfigs.blocker;
        this.createObstacleMesh(obstacle.mesh, config, biome);
        obstacle.mesh.position.set(x, y, z);
        obstacle.mesh.visible = true;
        obstacle.active = true;
        obstacle.config = config;
        obstacle.mesh.userData.type = config.type;

        if (!this.obstacles.includes(obstacle)) {
            this.obstacles.push(obstacle);
        }
    }

    clearMesh(group) {
        while (group.children.length) {
            const child = group.children.pop();
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((material) => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
    }

    createObstacleMesh(group, config, biome) {
        this.clearMesh(group);
        group.rotation.set(0, 0, 0);
        group.position.set(0, 0, 0);

        const accent = biome === 'bridge' ? 0xf97316 : biome === 'snow' ? 0xe0f2fe : 0x22d3ee;
        const shellMaterial = new THREE.MeshStandardMaterial({
            color: config.color,
            roughness: 0.35,
            metalness: 0.7,
            emissive: accent,
            emissiveIntensity: 0.12
        });
        const trimMaterial = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            roughness: 0.18,
            metalness: 0.9,
            emissive: accent,
            emissiveIntensity: 0.5
        });

        if (config.type === 'slideGate') {
            const asset = this.engine.assets?.createObstacle?.(config.type, config);
            if (asset) {
                asset.position.y = 0;
                group.add(asset);
            } else {
                const beam = new THREE.Mesh(new THREE.BoxGeometry(config.width, 0.28, config.depth), shellMaterial);
                beam.position.y = 1.1;
                beam.castShadow = true;
                group.add(beam);

                const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.8, 0.28), trimMaterial);
                leftPillar.position.set(-1.02, 0.9, 0);
                leftPillar.castShadow = true;
                group.add(leftPillar);

                const rightPillar = leftPillar.clone();
                rightPillar.position.x = 1.02;
                group.add(rightPillar);

                const glowStrip = new THREE.Mesh(new THREE.BoxGeometry(config.width - 0.2, 0.06, 0.05), trimMaterial);
                glowStrip.position.set(0, 1.08, config.depth / 2 + 0.03);
                group.add(glowStrip);
            }
        } else if (config.type === 'drone') {
            const asset = this.engine.assets?.createObstacle?.(config.type, config);
            if (asset) {
                asset.position.y = 0;
                group.add(asset);
            } else {
                const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.65), shellMaterial);
                body.position.y = 1.3;
                body.castShadow = true;
                group.add(body);

                const core = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), trimMaterial);
                core.position.y = 1.3;
                group.add(core);
            }
        } else {
            const asset = this.engine.assets?.createObstacle?.(config.type, config);
            if (asset) {
                asset.position.y = 0;
                group.add(asset);
            } else {
                const base = new THREE.Mesh(new THREE.BoxGeometry(config.width, config.height, config.depth), shellMaterial);
                base.position.y = config.height / 2;
                base.castShadow = true;
                base.receiveShadow = true;
                group.add(base);

                const topLight = new THREE.Mesh(new THREE.BoxGeometry(config.width - 0.25, 0.08, config.depth + 0.06), trimMaterial);
                topLight.position.set(0, config.height + 0.08, 0);
                group.add(topLight);
            }
        }
    }

    update(dt) {
        const playerZ = this.engine.player.player.position.z;
        const renderDistance = this.engine.generator.renderDistance;

        this.obstacles = this.obstacles.filter((obstacle) => {
            const distanceAhead = playerZ - obstacle.mesh.position.z;
            if (distanceAhead > renderDistance || distanceAhead < -20) {
                this.despawn(obstacle);
                return false;
            }
            return true;
        });

        this.obstacles.forEach((obstacle) => {
            if (obstacle.config.type === 'drone') {
                obstacle.mesh.position.y = 0.25 + Math.sin(this.engine.elapsedTime * 3) * 0.18;
                obstacle.mesh.rotation.y += dt;
            }
        });
    }

    despawn(obstacle) {
        obstacle.mesh.visible = false;
        obstacle.active = false;
    }

    removeObstacle(obstacle) {
        this.despawn(obstacle);
        this.obstacles = this.obstacles.filter((item) => item !== obstacle);
    }

    reset() {
        this.obstacles.forEach((obstacle) => this.despawn(obstacle));
        this.obstacles = [];
    }
}
