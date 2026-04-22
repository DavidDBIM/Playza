import * as THREE from 'three';

export class DifficultyController {
    constructor(engine) {
        this.engine = engine;
        this.reset();
    }

    update() {
        const distance = Math.abs(this.engine.player?.player?.position.z || 0);
        const time = this.engine.gameTime || 0;
        // Progress reaches 1.0 at ~400 m or ~90 s, giving a good ramp-up curve
        this.progress = Math.max(distance / 400, time / 90);
        this.level = 1 + this.progress;
    }

    getState() {
        const laneCount  = this.engine.config.laneCount;
        const normalized = THREE.MathUtils.clamp(this.progress / 2.5, 0, 1);

        return {
            level: this.level,
            laneCount,
            // Obstacle density increases sharply: from one every 16 units to every 10
            spawnSpacing:        THREE.MathUtils.lerp(16, 10, normalized),
            rowSpacing:          THREE.MathUtils.lerp(12, 8,  normalized),
            movingVehicleChance: THREE.MathUtils.lerp(0.10, 0.60, normalized),
            powerupChance:       THREE.MathUtils.lerp(0.30, 0.55, normalized),
            maxRowsPerPattern:   normalized < 0.25 ? 1 : normalized < 0.55 ? 2 : normalized < 0.80 ? 3 : 4,
            maxBlockedLanes:     Math.min(laneCount - 1, normalized < 0.45 ? 1 : normalized < 0.75 ? 2 : laneCount - 1),
            complexity:          normalized,
            weights: {
                singleBlock:  THREE.MathUtils.lerp(10, 2,  normalized),
                alternating:  THREE.MathUtils.lerp(3,  7,  normalized),
                safeCorridor: THREE.MathUtils.lerp(2,  8,  normalized),
                mixedCombo:   THREE.MathUtils.lerp(1,  7,  normalized),
                staggered:    THREE.MathUtils.lerp(1,  7,  normalized),
                movingCombo:  THREE.MathUtils.lerp(0,  6,  normalized)
            }
        };
    }

    reset() {
        this.progress = 0;
        this.level = 1;
    }
}
