import * as THREE from 'three';

export class CameraSystem {
    constructor(engine) {
        this.engine = engine;
        this.camera = engine.camera;
        this.lookTarget = new THREE.Vector3();
        this.shakeIntensity = 0;
        this.shakeDecay = 5;
        this.impactRoll = 0;
    }

    update(dt) {
        const player = this.engine.player.player;
        const speed = this.engine.currentSpeed || this.engine.config.baseSpeed;
        const speedRatio = speed / this.engine.config.maxSpeed;
        const stride = this.engine.elapsedTime * (2.5 + speedRatio * 4.5);
        const bob = Math.sin(stride) * 0.04 + Math.sin(stride * 0.5) * 0.015;
        const laneLead = player.position.x * 0.22;
        const turboBoost = this.engine.powerups.activeEffects.speed ? 0.8 : 0;

        // Zoomed-in: tight behind-the-shoulder view
        const camX = laneLead;
        const camY = player.position.y + 3.8 + bob;
        const camZ = player.position.z + 7.0 - turboBoost;

        this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, camX, dt * 8.5);
        this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, camY, dt * 6.0);
        this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, camZ, dt * 9.0);

        this.lookTarget.set(
            player.position.x * 0.3,
            player.position.y + 1.0 + bob * 0.4,
            player.position.z - 10.0 - turboBoost * 2.5
        );
        this.camera.lookAt(this.lookTarget);

        // Base FOV 62 (tight/zoomed). Increases to ~82 at max speed for stretch effect.
        const targetFov = 62 + 20 * speedRatio + (this.engine.powerups.activeEffects.speed ? 8 : 0);
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, dt * 2.5);

        this.impactRoll = THREE.MathUtils.lerp(this.impactRoll, player.rotation.z * 0.35, dt * 7);
        this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, this.impactRoll, dt * 4);

        if (this.shakeIntensity > 0) {
            this.shakeIntensity -= this.shakeDecay * dt;
            this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity * 0.28;
            this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity * 0.12;
        }

        this.camera.updateProjectionMatrix();
    }

    addShake(intensity) {
        this.shakeIntensity = Math.min(this.shakeIntensity + intensity, 1.15);
    }

    reset() {
        this.camera.position.set(0, 3.8, 7.0);
        this.camera.rotation.set(0, 0, 0);
        this.camera.fov = 62;
        this.shakeIntensity = 0;
        this.impactRoll = 0;
    }
}
