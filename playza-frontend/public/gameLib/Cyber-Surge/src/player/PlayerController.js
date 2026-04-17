import * as THREE from 'three';

export class PlayerController {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;

        this.config = {
            laneWidth: engine.config.laneWidth,
            jumpForce: engine.config.jumpForce,
            gravity: engine.config.gravity,
            slideDuration: engine.config.slideDuration,
            groundY: 0,
            playerHeight: 1.8,
            slideHeight: 0.95,
            collisionWidth: 0.76,
            collisionDepth: 0.78,
            collisionPadding: 0.1
        };

        this.nearMissCooldown = 0;
        this.trailPositions = [];
        this.damageFlashTimer = 0;
        this.stumbleTimer = 0;

        this.createPlayer();
        this.createTrail();
        this.reset();
    }

    createPlayer() {
        const group = new THREE.Group();

        const suitMaterial = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.45,
            metalness: 0.55,
            emissive: 0x000000,
            emissiveIntensity: 0
        });
        const accentMaterial = new THREE.MeshStandardMaterial({
            color: 0x22d3ee,
            roughness: 0.18,
            metalness: 0.92,
            emissive: 0x0ea5e9,
            emissiveIntensity: 0.28
        });
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0xd6a77a,
            roughness: 0.82,
            metalness: 0.04
        });

        this.damageReactiveMaterials = [suitMaterial, accentMaterial];

        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.9, 6, 16), suitMaterial);
        torso.position.y = 1.18;
        torso.castShadow = true;
        group.add(torso);

        const chestCore = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.4, 0.14), accentMaterial);
        chestCore.position.set(0, 1.18, 0.33);
        group.add(chestCore);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20), skinMaterial);
        head.position.y = 1.92;
        head.castShadow = true;
        group.add(head);

        const hair = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.95 })
        );
        hair.position.set(0, 2.03, -0.01);
        hair.rotation.x = -0.2;
        group.add(hair);

        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 0.08), accentMaterial);
        visor.position.set(0, 1.92, 0.2);
        group.add(visor);

        const backpack = new THREE.Mesh(
            new THREE.BoxGeometry(0.36, 0.55, 0.18),
            new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.35, metalness: 0.65 })
        );
        backpack.position.set(0, 1.18, -0.28);
        group.add(backpack);

        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.36, 1.48, 0);
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.36, 1.48, 0);

        const armGeometry = new THREE.CapsuleGeometry(0.09, 0.55, 4, 10);
        const handGeometry = new THREE.SphereGeometry(0.1, 10, 10);

        const leftArm = new THREE.Mesh(armGeometry, suitMaterial);
        leftArm.position.y = -0.36;
        leftArm.castShadow = true;
        leftArmPivot.add(leftArm);
        const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
        leftHand.position.y = -0.72;
        leftArmPivot.add(leftHand);

        const rightArm = new THREE.Mesh(armGeometry, suitMaterial);
        rightArm.position.y = -0.36;
        rightArm.castShadow = true;
        rightArmPivot.add(rightArm);
        const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
        rightHand.position.y = -0.72;
        rightArmPivot.add(rightHand);

        group.add(leftArmPivot);
        group.add(rightArmPivot);

        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.16, 0.88, 0);
        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.16, 0.88, 0);

        const legGeometry = new THREE.CapsuleGeometry(0.12, 0.7, 4, 10);
        const footGeometry = new THREE.BoxGeometry(0.18, 0.08, 0.34);

        const leftLeg = new THREE.Mesh(legGeometry, suitMaterial);
        leftLeg.position.y = -0.48;
        leftLeg.castShadow = true;
        leftLegPivot.add(leftLeg);
        const leftFoot = new THREE.Mesh(footGeometry, accentMaterial);
        leftFoot.position.set(0, -0.92, 0.08);
        leftLegPivot.add(leftFoot);

        const rightLeg = new THREE.Mesh(legGeometry, suitMaterial);
        rightLeg.position.y = -0.48;
        rightLeg.castShadow = true;
        rightLegPivot.add(rightLeg);
        const rightFoot = new THREE.Mesh(footGeometry, accentMaterial);
        rightFoot.position.set(0, -0.92, 0.08);
        rightLegPivot.add(rightFoot);

        group.add(leftLegPivot);
        group.add(rightLegPivot);

        group.position.set(this.getLaneX(1), this.config.groundY, 0);
        this.scene.add(group);

        this.player = group;
        this.torso = torso;
        this.head = head;
        this.backpack = backpack;
        this.leftArmPivot = leftArmPivot;
        this.rightArmPivot = rightArmPivot;
        this.leftLegPivot = leftLegPivot;
        this.rightLegPivot = rightLegPivot;
    }

    createTrail() {
        const trailGeometry = new THREE.BufferGeometry();
        trailGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(72), 3));
        const trailMaterial = new THREE.PointsMaterial({
            size: 0.16,
            color: 0x22d3ee,
            transparent: true,
            opacity: 0.38,
            sizeAttenuation: true
        });

        this.trail = new THREE.Points(trailGeometry, trailMaterial);
        this.scene.add(this.trail);
    }

    setDamageFlash() {
        this.damageFlashTimer = 0.6;
        this.stumbleTimer = 0.45;
    }

    getLaneX(lane) {
        return (lane - 1) * this.config.laneWidth;
    }

    moveLeft() {
        if (this.state.targetLane > 0) {
            this.state.targetLane -= 1;
            this.engine.audio.playWhoosh();
            this.engine.effects.addDust(this.player.position.clone());
        }
    }

    moveRight() {
        if (this.state.targetLane < this.engine.config.laneCount - 1) {
            this.state.targetLane += 1;
            this.engine.audio.playWhoosh();
            this.engine.effects.addDust(this.player.position.clone());
        }
    }

    jump() {
        if (!this.state.isJumping && this.state.isGrounded && !this.state.isSliding) {
            this.state.velocityY = this.config.jumpForce;
            this.state.isJumping = true;
            this.state.isGrounded = false;
            this.engine.audio.playJump();
            this.engine.effects.addJump(this.player.position.clone());
        }
    }

    slide() {
        if (!this.state.isJumping) {
            this.state.isSliding = true;
            this.state.slideTimer = this.config.slideDuration;
            this.engine.audio.playSlide();
            this.engine.effects.addSlide(this.player.position.clone());
        }
    }

    stopSlide() {
        if (!this.state.isJumping && this.state.slideTimer < 0.16) {
            this.state.isSliding = false;
        }
    }

    update(dt) {
        this.player.position.z -= this.engine.currentSpeed * dt;
        this.nearMissCooldown = Math.max(0, this.nearMissCooldown - dt);
        this.damageFlashTimer = Math.max(0, this.damageFlashTimer - dt);
        this.stumbleTimer = Math.max(0, this.stumbleTimer - dt);

        this.updateLaneSwitch(dt);
        this.updateJump(dt);
        this.updateSlide(dt);
        this.updateAnimation();
        this.updateDamageFlash();
        this.updateTrail();
        this.checkCollisions();
    }

    updateLaneSwitch(dt) {
        const targetX = this.getLaneX(this.state.targetLane);
        const diff = targetX - this.player.position.x;

        if (Math.abs(diff) > 0.01) {
            this.player.position.x = THREE.MathUtils.lerp(this.player.position.x, targetX, dt * 12.5);
            const bankAngle = THREE.MathUtils.clamp(-diff * 0.17, -0.34, 0.34);
            this.player.rotation.y = THREE.MathUtils.lerp(this.player.rotation.y, bankAngle * 0.65, dt * 10);
            this.player.rotation.z = THREE.MathUtils.lerp(this.player.rotation.z, -bankAngle, dt * 12);
        } else {
            this.player.position.x = targetX;
            this.player.rotation.y = THREE.MathUtils.lerp(this.player.rotation.y, 0, dt * 8);
            this.player.rotation.z = THREE.MathUtils.lerp(this.player.rotation.z, 0, dt * 8);
            this.state.lane = this.state.targetLane;
        }
    }

    updateJump(dt) {
        if (!this.state.isGrounded) {
            this.state.velocityY -= this.config.gravity * dt;
            this.player.position.y += this.state.velocityY * dt;

            if (this.player.position.y <= this.config.groundY) {
                this.player.position.y = this.config.groundY;
                this.state.velocityY = 0;
                this.state.isJumping = false;
                this.state.isGrounded = true;
                this.engine.effects.addLand(this.player.position.clone());
            }
        }
    }

    updateSlide(dt) {
        if (this.state.isSliding) {
            this.state.slideTimer -= dt;
            if (this.state.slideTimer <= 0) {
                this.state.isSliding = false;
                this.state.slideTimer = 0;
            }
        }

        const targetScaleY = this.state.isSliding ? this.config.slideHeight / this.config.playerHeight : 1;
        this.player.scale.y = THREE.MathUtils.lerp(this.player.scale.y, targetScaleY, dt * 16);
    }

    updateAnimation() {
        const speed = this.engine.currentSpeed || this.engine.config.baseSpeed;
        const stride = this.engine.elapsedTime * (4.8 + speed * 0.24);
        const runSwing = Math.sin(stride);
        const oppositeSwing = Math.sin(stride + Math.PI);
        const bounce = Math.max(0, Math.sin(stride * 2)) * 0.08;
        const breath = Math.sin(this.engine.elapsedTime * 1.8) * 0.02;
        const stumble = this.stumbleTimer > 0 ? Math.sin(this.engine.elapsedTime * 22) * 0.24 * (this.stumbleTimer / 0.45) : 0;

        this.torso.rotation.x = this.state.isSliding ? 0.58 : this.state.isJumping ? -0.18 : 0.08 + bounce * 0.25 + breath;
        this.torso.rotation.y = stumble * 0.3;
        this.head.position.y = 1.92 + (this.state.isJumping ? 0.06 : bounce) + breath * 0.4;
        this.head.rotation.z = stumble * 0.15;
        this.backpack.rotation.x = this.torso.rotation.x * 0.4;

        this.leftArmPivot.rotation.x = this.state.isSliding ? -1.2 : this.state.isJumping ? -0.45 : oppositeSwing * 0.98 + stumble;
        this.rightArmPivot.rotation.x = this.state.isSliding ? -1.2 : this.state.isJumping ? -0.45 : runSwing * 0.98 - stumble;
        this.leftArmPivot.rotation.z = this.state.isSliding ? -0.15 : 0.08;
        this.rightArmPivot.rotation.z = this.state.isSliding ? 0.15 : -0.08;

        this.leftLegPivot.rotation.x = this.state.isSliding ? 1.18 : this.state.isJumping ? -0.3 : runSwing * 0.95;
        this.rightLegPivot.rotation.x = this.state.isSliding ? 1.18 : this.state.isJumping ? -0.3 : oppositeSwing * 0.95;

        if (!this.state.isJumping) {
            this.player.position.y = this.state.isSliding && this.state.isGrounded ? -0.22 : bounce * 0.04;
        }
    }

    updateDamageFlash() {
        const blink = this.damageFlashTimer > 0 ? 0.2 + Math.sin(this.engine.elapsedTime * 35) * 0.35 : 0;
        const turboGlow = this.engine.powerups.activeEffects.speed ? 0.2 : 0;
        this.damageReactiveMaterials.forEach((material, index) => {
            material.emissiveIntensity = Math.max(index === 0 ? blink * 0.5 : 0.28 + blink + turboGlow, 0);
        });
    }

    updateTrail() {
        this.trailPositions.unshift(this.player.position.clone());
        if (this.trailPositions.length > 24) {
            this.trailPositions.pop();
        }

        const positions = this.trail.geometry.attributes.position.array;
        for (let i = 0; i < 24; i += 1) {
            const pos = this.trailPositions[i] || this.player.position;
            positions[i * 3] = pos.x;
            positions[i * 3 + 1] = pos.y + 0.65;
            positions[i * 3 + 2] = pos.z + i * 0.02;
        }

        this.trail.geometry.attributes.position.needsUpdate = true;
    }

    getCollisionBounds() {
        const height = this.state.isSliding ? 0.88 : 1.74;
        const centerY = this.player.position.y + height / 2;

        return {
            minX: this.player.position.x - this.config.collisionWidth / 2,
            maxX: this.player.position.x + this.config.collisionWidth / 2,
            minY: centerY - height / 2,
            maxY: centerY + height / 2,
            minZ: this.player.position.z - this.config.collisionDepth / 2,
            maxZ: this.player.position.z + this.config.collisionDepth / 2
        };
    }

    getObstacleBounds(obstacle) {
        const config = obstacle.config || {};

        if (config.type === 'slideGate') {
            return {
                minX: obstacle.mesh.position.x - config.width / 2 + 0.12,
                maxX: obstacle.mesh.position.x + config.width / 2 - 0.12,
                minY: 0.96,
                maxY: 1.24,
                minZ: obstacle.mesh.position.z - config.depth / 2,
                maxZ: obstacle.mesh.position.z + config.depth / 2
            };
        }

        const width = (config.width || 1) - this.config.collisionPadding;
        const depth = config.depth || 1.4;
        const minY = config.type === 'drone' ? 0.75 : 0;
        const maxY = minY + config.height;

        return {
            minX: obstacle.mesh.position.x - width / 2,
            maxX: obstacle.mesh.position.x + width / 2,
            minY,
            maxY,
            minZ: obstacle.mesh.position.z - depth / 2,
            maxZ: obstacle.mesh.position.z + depth / 2
        };
    }

    intersects(a, b) {
        return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY && a.minZ <= b.maxZ && a.maxZ >= b.minZ;
    }

    checkCollisions() {
        const playerBounds = this.getCollisionBounds();
        const playerBox = new THREE.Box3(
            new THREE.Vector3(playerBounds.minX, playerBounds.minY, playerBounds.minZ),
            new THREE.Vector3(playerBounds.maxX, playerBounds.maxY, playerBounds.maxZ)
        );

        for (const obstacle of this.engine.obstacles.obstacles) {
            if (!obstacle.mesh || !obstacle.active) {
                continue;
            }

            const obstacleBounds = this.getObstacleBounds(obstacle);
            const closeOnTrack = Math.abs(obstacle.mesh.position.z - this.player.position.z) < 1.4;
            const lateralGap = Math.min(
                Math.abs(playerBounds.maxX - obstacleBounds.minX),
                Math.abs(obstacleBounds.maxX - playerBounds.minX)
            );

            if (closeOnTrack && lateralGap < 0.35 && !this.intersects(playerBounds, obstacleBounds) && this.nearMissCooldown === 0) {
                this.nearMissCooldown = 0.6;
                this.engine.scoring.addScore(25, 'nearmiss');
                this.engine.effects.addNearMiss(this.player.position.clone());
                this.engine.audio.playNearMiss();
            }

            if (this.intersects(playerBounds, obstacleBounds)) {
                if (this.engine.powerups.activeShield) {
                    this.engine.powerups.consumeShield();
                    this.engine.effects.addShieldBreak(obstacle.mesh.position.clone());
                    this.engine.obstacles.removeObstacle(obstacle);
                    this.engine.audio.playShield();
                } else {
                    const isGameOver = this.engine.registerHit(obstacle.mesh.position);
                    this.engine.obstacles.removeObstacle(obstacle);
                    if (isGameOver) {
                        return;
                    }
                }
            }
        }

        for (const powerup of this.engine.powerups.powerups) {
            if (!powerup.mesh || !powerup.active) {
                continue;
            }

            const powerupBox = new THREE.Box3().setFromObject(powerup.mesh);
            if (playerBox.intersectsBox(powerupBox)) {
                this.engine.powerups.collectPowerUp(powerup);
            }
        }

        for (const coin of this.engine.powerups.coins) {
            if (!coin.mesh || !coin.active) {
                continue;
            }

            const coinBox = new THREE.Box3().setFromObject(coin.mesh);
            if (playerBox.intersectsBox(coinBox)) {
                this.engine.powerups.collectCoin(coin);
            }
        }
    }

    reset() {
        this.state = {
            lane: 1,
            targetLane: 1,
            velocityY: 0,
            isJumping: false,
            isSliding: false,
            slideTimer: 0,
            isGrounded: true
        };

        this.player.position.set(this.getLaneX(1), this.config.groundY, 0);
        this.player.rotation.set(0, 0, 0);
        this.head.rotation.set(0, 0, 0);
        this.player.scale.set(1, 1, 1);
        this.trailPositions = [];
        this.nearMissCooldown = 0;
        this.damageFlashTimer = 0;
        this.stumbleTimer = 0;
        this.damageReactiveMaterials.forEach((material, index) => {
            material.emissiveIntensity = index === 0 ? 0 : 0.28;
        });
    }
}
