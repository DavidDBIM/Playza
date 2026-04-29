import * as THREE from 'three';

export class DifficultyController {
    constructor(engine) {
        this.engine = engine;
        this.reset();
    }

    update() {
        const distance = Math.abs(this.engine.player?.player?.position.z || 0);
        const time = this.engine.gameTime || 0;
        const timePressure = time < 30 ? time / 90 : time < 60 ? 0.33 + (time - 30) / 70 : 0.76 + (time - 60) / 55;
        const distancePressure = distance / 520;

        this.distance = distance;
        this.time = time;
        this.phase = time < 30 ? 1 : time < 60 ? 2 : 3;
        this.progress = Math.max(distancePressure, timePressure);
        this.level = 1 + this.progress;
    }

    getState() {
        const laneCount  = this.engine.config.laneCount;
        const normalized = THREE.MathUtils.clamp(this.progress / 2.35, 0, 1);
        const event = this.engine.generator?.activeEvent || null;
        const eventBoost = event?.type === 'challenge' ? 0.12 : 0;
        const coinBoost = event?.type === 'coinRush' ? 1.8 : event?.type === 'recovery' ? 1.25 : event?.type === 'challenge' ? 0.72 : 1;
        const phasePressure = this.phase === 1 ? 0 : this.phase === 2 ? 0.12 : 0.25;
        const pressure = THREE.MathUtils.clamp(normalized + eventBoost + phasePressure, 0, 1);
        const spacingBias = event?.type === 'challenge' ? -1.6 : event?.type === 'coinRush' ? 1.8 : 0;

        return {
            level: this.level,
            laneCount,
            phase: this.phase,
            time: this.time,
            distance: this.distance,
            event,
            spawnSpacing:        THREE.MathUtils.clamp(THREE.MathUtils.lerp(18, 9.2, pressure) + spacingBias, 8.2, 20),
            rowSpacing:          THREE.MathUtils.lerp(13, 7.4, pressure),
            movingVehicleChance: THREE.MathUtils.lerp(0.06, 0.68, pressure),
            slideGateChance:     THREE.MathUtils.lerp(0.00, 0.34, pressure),
            powerupChance:       THREE.MathUtils.clamp(THREE.MathUtils.lerp(0.22, 0.46, normalized) * (event?.type === 'challenge' ? 1.25 : 1), 0, 0.58),
            coinMultiplier:      THREE.MathUtils.clamp(THREE.MathUtils.lerp(1.45, 0.82, pressure) * coinBoost, 0.65, 2.35),
            riskCoinChance:      THREE.MathUtils.lerp(0.08, 0.42, pressure),
            maxRowsPerPattern:   pressure < 0.22 ? 1 : pressure < 0.50 ? 2 : pressure < 0.78 ? 3 : 4,
            maxBlockedLanes:     Math.min(laneCount - 1, pressure < 0.38 ? 1 : pressure < 0.70 ? 2 : laneCount - 1),
            complexity:          pressure,
            weights: {
                singleBlock:  event?.type === 'coinRush' ? 8 : THREE.MathUtils.lerp(11, 1.5, pressure),
                alternating:  THREE.MathUtils.lerp(3,  8,   pressure),
                safeCorridor: THREE.MathUtils.lerp(2,  7,   pressure),
                mixedCombo:   THREE.MathUtils.lerp(1,  8,   pressure),
                staggered:    THREE.MathUtils.lerp(1,  8,   pressure),
                movingCombo:  THREE.MathUtils.lerp(0,  7,   pressure),
                gateThread:   THREE.MathUtils.lerp(0,  5.5, pressure),
                squeeze:      THREE.MathUtils.lerp(0,  5.0, pressure)
            }
        };
    }

    reset() {
        this.progress = 0;
        this.level = 1;
        this.phase = 1;
        this.distance = 0;
        this.time = 0;
    }
}
