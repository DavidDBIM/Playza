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
        const bob = Math.sin(stride) * 0.08 + Math.sin(stride * 0.5) * 0.03;
        const laneLead = player.position.x * 0.35;
        const turboBoost = this.engine.powerups.activeEffects.speed ? 0.8 : 0;

        const camX = laneLead;
        const camY = player.position.y + 5.45 + bob;
        const camZ = player.position.z + 11.2 - turboBoost;

        this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, camX, dt * 7.5);
        this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, camY, dt * 5.5);
        this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, camZ, dt * 8.5);

        this.lookTarget.set(
            player.position.x * 0.48,
            player.position.y + 1.28 + bob * 0.4,
            player.position.z - 13.5 - turboBoost * 2.2
        );
        this.camera.lookAt(this.lookTarget);

        const targetFov = 72 + 16 * speedRatio + (this.engine.powerups.activeEffects.speed ? 5 : 0);
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, dt * 2.2);

        this.impactRoll = THREE.MathUtils.lerp(this.impactRoll, player.rotation.z * 0.4, dt * 7);
        this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, this.impactRoll, dt * 4);

        if (this.shakeIntensity > 0) {
            this.shakeIntensity -= this.shakeDecay * dt;
            this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity * 0.34;
            this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity * 0.16;
        }

        this.camera.updateProjectionMatrix();
    }

    addShake(intensity) {
        this.shakeIntensity = Math.min(this.shakeIntensity + intensity, 1.15);
    }

    reset() {
        this.camera.position.set(0, 5.5, 11);
        this.camera.rotation.set(0, 0, 0);
        this.camera.fov = 72;
        this.shakeIntensity = 0;
        this.impactRoll = 0;
    }
}
