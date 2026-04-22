import * as THREE from 'three';
import { ObjectPoolManager } from './ObjectPoolManager.js';

export class ObstacleSystem {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;

        this.obstacleConfigs = {
            blocker: { type: 'blocker', width: 2.2, height: 1.8, depth: 1.8 },
            drone: { type: 'drone', width: 1.9, height: 1.7, depth: 3.8 }
        };

        this.pool = new ObjectPoolManager(() => this.createPooledObstacle(), 220);
        this.obstacles = [];
    }

    createPooledObstacle() {
        const mesh = new THREE.Group();
        mesh.visible = false;
        this.scene.add(mesh);
        return {
            mesh,
            active: false,
            config: null,
            movement: null,
            lane: 0
        };
    }

    spawn(spec = {}) {
        const type = spec.type || 'blocker';
        const config = this.obstacleConfigs[type];

        if (!config) {
            return null;
        }

        const obstacle = this.pool.acquire();
        this.clearMesh(obstacle.mesh);

        const asset = this.engine.assets?.createObstacle?.(config.type, config);
        if (!asset) {
            this.pool.release(obstacle, (entry) => this.deactivate(entry));
            return null;
        }

        obstacle.mesh.add(asset);
        obstacle.mesh.position.set(this.getLaneX(spec.lane ?? 0), 0, spec.z ?? 0);
        obstacle.mesh.rotation.set(0, 0, 0);
        obstacle.mesh.visible = true;
        obstacle.mesh.userData.type = config.type;

        obstacle.config = config;
        obstacle.lane = spec.lane ?? 0;
        obstacle.movement = spec.movement ? { ...spec.movement } : null;

        this.syncActiveList();
        return obstacle;
    }

    getLaneX(lane) {
        const centerIndex = (this.engine.config.laneCount - 1) / 2;
        return (lane - centerIndex) * this.engine.config.laneWidth;
    }

    clearMesh(group) {
        while (group.children.length) {
            group.remove(group.children[0]);
        }
    }

    update(dt) {
        const playerZ = this.engine.player.player.position.z;
        const renderDistance = this.engine.generator.renderDistance;

        this.pool.getActiveItems().forEach((obstacle) => {
            if (obstacle.movement?.mode === 'cruise' && obstacle.config.type === 'drone') {
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
        obstacle.config = null;
        obstacle.movement = null;
        obstacle.lane = 0;
    }

    releaseObstacle(obstacle) {
        this.pool.release(obstacle, (entry) => this.deactivate(entry));
    }

    despawn(obstacle) {
        this.releaseObstacle(obstacle);
        this.syncActiveList();
    }

    removeObstacle(obstacle) {
        this.releaseObstacle(obstacle);
        this.syncActiveList();
    }

    reset() {
        this.pool.reset((obstacle) => this.deactivate(obstacle));
        this.syncActiveList();
    }

    syncActiveList() {
        this.obstacles = this.pool.getActiveItems();
    }
}
