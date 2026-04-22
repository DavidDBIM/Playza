import * as THREE from 'three';

export class DifficultyController {
    constructor(engine) {
        this.engine = engine;
        this.reset();
    }

    update() {
        const distance = Math.abs(this.engine.player?.player?.position.z || 0);
        const time = this.engine.gameTime || 0;
        this.progress = Math.max(distance / 180, time / 22);
        this.level = 1 + this.progress;
    }

    getState() {
        const laneCount = this.engine.config.laneCount;
        const normalized = THREE.MathUtils.clamp(this.progress / 8, 0, 1);

        return {
            level: this.level,
            laneCount,
            spawnSpacing: THREE.MathUtils.lerp(22, laneCount === 5 ? 14 : 16, normalized),
            rowSpacing: THREE.MathUtils.lerp(15, laneCount === 5 ? 11 : 12, normalized),
            movingVehicleChance: THREE.MathUtils.lerp(0.08, 0.5, normalized),
            powerupChance: THREE.MathUtils.lerp(0.12, 0.2, normalized),
            maxRowsPerPattern: normalized < 0.3 ? 2 : normalized < 0.65 ? 3 : 4,
            maxBlockedLanes: Math.min(laneCount - 1, normalized < 0.45 ? 2 : laneCount - 1),
            complexity: normalized,
            weights: {
                singleBlock: THREE.MathUtils.lerp(8, 3, normalized),
                alternating: THREE.MathUtils.lerp(3, 6, normalized),
                safeCorridor: THREE.MathUtils.lerp(2, 7, normalized),
                mixedCombo: THREE.MathUtils.lerp(1, 6, normalized),
                staggered: THREE.MathUtils.lerp(2, 6, normalized),
                movingCombo: THREE.MathUtils.lerp(0.5, 5, normalized)
            }
        };
    }

    reset() {
        this.progress = 0;
        this.level = 1;
    }
}
