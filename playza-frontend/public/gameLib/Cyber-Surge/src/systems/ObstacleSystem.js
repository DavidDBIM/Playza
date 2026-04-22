import * as THREE from 'three';
import { ObjectPoolManager } from './ObjectPoolManager.js';

export class ObstacleSystem {
    constructor(engine) {
        this.engine = engine;
        this.scene  = engine.scene;

        // Collision dimensions referenced by PlayerController.getObstacleBounds()
        this.obstacleConfigs = {
            blocker: { type: 'blocker', width: 2.5, height: 1.8, depth: 1.0 },
            drone:   { type: 'drone',   width: 2.0, height: 1.4, depth: 4.0 }
        };

        // Rotating palettes so consecutive obstacles look distinct
        this._blockerColors = [0xef4444, 0xf97316, 0xeab308, 0xa855f7, 0x06b6d4, 0xdc2626];
        this._droneColors   = [0x3b82f6, 0x22d3ee, 0x10b981, 0x8b5cf6, 0xf97316, 0xec4899];
        this._blockerIdx    = 0;
        this._droneIdx      = 0;

        this.pool      = new ObjectPoolManager(() => this.createPooledObstacle(), 240);
        this.obstacles = [];
    }

    createPooledObstacle() {
        const mesh = new THREE.Group();
        mesh.visible = false;
        this.scene.add(mesh);
        return { mesh, active: false, config: null, movement: null, lane: 0 };
    }

    // -------------------------------------------------------------------------
    // Spawn
    // -------------------------------------------------------------------------

    spawn(spec = {}) {
        const type   = spec.type || 'blocker';
        const config = this.obstacleConfigs[type];
        if (!config) return null;

        const obstacle = this.pool.acquire();
        this.clearMesh(obstacle.mesh);

        // Try GLB asset first; use procedural mesh as guaranteed fallback
        let asset = this.engine.assets?.createObstacle?.(config.type, config);
        if (!asset) {
            asset = type === 'drone' ? this.buildFallbackCar() : this.buildFallbackBlocker();
        }

        obstacle.mesh.add(asset);
        obstacle.mesh.position.set(this.getLaneX(spec.lane ?? 0), 0, spec.z ?? 0);
        obstacle.mesh.rotation.set(0, 0, 0);
        obstacle.mesh.visible = true;
        obstacle.mesh.userData.type = config.type;

        obstacle.config   = config;
        obstacle.lane     = spec.lane ?? 0;
        obstacle.movement = spec.movement ? { ...spec.movement } : null;

        this.syncActiveList();
        return obstacle;
    }

    // -------------------------------------------------------------------------
    // Procedural fallback meshes  (cyberpunk aesthetic)
    // -------------------------------------------------------------------------

    buildFallbackBlocker() {
        const col = this._blockerColors[this._blockerIdx % this._blockerColors.length];
        this._blockerIdx += 1;

        const group = new THREE.Group();

        // Main barrier body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, 1.2, 0.45),
            new THREE.MeshStandardMaterial({
                color: 0x111827, roughness: 0.35, metalness: 0.75,
                emissive: col, emissiveIntensity: 0.55
            })
        );
        body.position.y = 0.85;
        body.castShadow = true;
        group.add(body);

        // Hazard stripe
        const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(2.45, 0.22, 0.47),
            new THREE.MeshStandardMaterial({
                color: 0xfafafa, roughness: 0.5, metalness: 0.2,
                emissive: 0xffffff, emissiveIntensity: 0.3
            })
        );
        stripe.position.y = 0.85;
        group.add(stripe);

        // Left & right support legs
        [-0.9, 0.9].forEach((x) => {
            const leg = new THREE.Mesh(
                new THREE.BoxGeometry(0.22, 0.7, 0.44),
                new THREE.MeshStandardMaterial({
                    color: 0x1f2937, roughness: 0.4, metalness: 0.7,
                    emissive: col, emissiveIntensity: 0.3
                })
            );
            leg.position.set(x, 0.35, 0);
            group.add(leg);
        });

        // Glowing top rail
        const glow = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.1, 0.47),
            new THREE.MeshStandardMaterial({
                color: col, roughness: 0.1, metalness: 0.9,
                emissive: col, emissiveIntensity: 1.5
            })
        );
        glow.position.y = 1.52;
        group.add(glow);

        return group;
    }

    buildFallbackCar() {
        const col = this._droneColors[this._droneIdx % this._droneColors.length];
        this._droneIdx += 1;

        const group = new THREE.Group();

        // Car body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(1.9, 0.82, 3.8),
            new THREE.MeshStandardMaterial({
                color: 0x0f172a, roughness: 0.3, metalness: 0.85,
                emissive: col, emissiveIntensity: 0.22
            })
        );
        body.position.y = 0.6;
        body.castShadow = true;
        group.add(body);

        // Cabin
        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.6, 2.1),
            new THREE.MeshStandardMaterial({
                color: 0x1e293b, roughness: 0.25, metalness: 0.7,
                emissive: 0x38bdf8, emissiveIntensity: 0.18
            })
        );
        cabin.position.set(0, 1.25, -0.2);
        group.add(cabin);

        // Front headlights
        [-0.65, 0.65].forEach((x) => {
            const light = new THREE.Mesh(
                new THREE.BoxGeometry(0.28, 0.18, 0.1),
                new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 2.2 })
            );
            light.position.set(x, 0.68, -1.95);
            group.add(light);
        });

        // Rear lights
        [-0.65, 0.65].forEach((x) => {
            const light = new THREE.Mesh(
                new THREE.BoxGeometry(0.28, 0.18, 0.1),
                new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.0 })
            );
            light.position.set(x, 0.68, 1.95);
            group.add(light);
        });

        // Wheels
        [[-0.92, -1.2], [0.92, -1.2], [-0.92, 1.2], [0.92, 1.2]].forEach(([x, z]) => {
            const wheel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.32, 0.32, 0.22, 14),
                new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9, metalness: 0.3 })
            );
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(x, 0.32, z);
            group.add(wheel);
        });

        return group;
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    getLaneX(lane) {
        const centerIndex = (this.engine.config.laneCount - 1) / 2;
        return (lane - centerIndex) * this.engine.config.laneWidth;
    }

    clearMesh(group) {
        while (group.children.length) {
            group.remove(group.children[0]);
        }
    }

    // -------------------------------------------------------------------------
    // Update / lifecycle
    // -------------------------------------------------------------------------

    update(dt) {
        const playerZ        = this.engine.player.player.position.z;
        const renderDistance = this.engine.generator.renderDistance;

        this.pool.getActiveItems().forEach((obstacle) => {
            if (obstacle.movement?.mode === 'cruise' && obstacle.config?.type === 'drone') {
                obstacle.mesh.position.z += obstacle.movement.speed * dt;
            }

            const distanceAhead = playerZ - obstacle.mesh.position.z;
            if (distanceAhead > renderDistance || distanceAhead < -24) {
                this.releaseObstacle(obstacle);
            }
        });

        this.syncActiveList();
    }

    deactivate(obstacle) {
        this.clearMesh(obstacle.mesh);
        obstacle.mesh.visible = false;
        obstacle.config   = null;
        obstacle.movement = null;
        obstacle.lane     = 0;
    }

    releaseObstacle(obstacle) {
        this.pool.release(obstacle, (entry) => this.deactivate(entry));
    }

    despawn(obstacle)        { this.releaseObstacle(obstacle); this.syncActiveList(); }
    removeObstacle(obstacle) { this.releaseObstacle(obstacle); this.syncActiveList(); }

    reset() {
        this.pool.reset((obstacle) => this.deactivate(obstacle));
        this._blockerIdx = 0;
        this._droneIdx   = 0;
        this.syncActiveList();
    }

    syncActiveList() {
        this.obstacles = this.pool.getActiveItems();
    }
}
