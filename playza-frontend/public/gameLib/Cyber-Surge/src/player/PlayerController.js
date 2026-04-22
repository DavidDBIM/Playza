import * as THREE from 'three';

export class PlayerController {
    constructor(engine) {
        this.engine = engine;
        this.scene  = engine.scene;

        this.config = {
            laneWidth:       engine.config.laneWidth,
            jumpForce:       engine.config.jumpForce,
            gravity:         engine.config.gravity,
            slideDuration:   engine.config.slideDuration,
            groundY:         0,
            playerHeight:    1.8,
            slideHeight:     0.95,
            collisionWidth:  0.76,
            collisionDepth:  0.78,
            collisionPadding: 0.1
        };

        // Timers
        this.nearMissCooldown = 0;
        this.trailPositions   = [];
        this.damageFlashTimer = 0;
        this.stumbleTimer     = 0;
        this.hitFallTimer     = 0;   // forward-pitch on hit

        // Animation state
        this.animationMixer   = null;
        this.animationActions = {};
        this.currentAction    = null;

        // Body-part refs — ONLY set by createFallbackPlayer().
        // Must be null-checked before use because createAssetPlayer() does NOT set them.
        this.torso          = null;
        this.head           = null;
        this.backpack       = null;
        this.leftArmPivot   = null;
        this.rightArmPivot  = null;
        this.leftLegPivot   = null;
        this.rightLegPivot  = null;

        // Asset-runner refs — only set by createAssetPlayer()
        this.visualRoot              = null;
        this.damageReactiveMaterials = [];

        this.createPlayer();
        this.createTrail();
        this.reset();
    }

    // -----------------------------------------------------------------------
    // Player creation
    // -----------------------------------------------------------------------

    createPlayer() {
        const assetRunner = this.engine.assets?.createRunner?.();
        if (assetRunner?.model) {
            this.createAssetPlayer(assetRunner);
            return;
        }
        this.createFallbackPlayer();
    }

    createAssetPlayer(assetRunner) {
        const group = new THREE.Group();
        group.add(assetRunner.model);
        group.position.set(this.getLaneX(this.getCenterLane()), this.config.groundY, 0);
        this.scene.add(group);

        this.player      = group;
        this.visualRoot  = assetRunner.model;
        this.animationMixer   = assetRunner.mixer;
        this.animationActions = assetRunner.actions || {};

        this.visualRoot.traverse((child) => {
            if (!child.isMesh || !child.material) return;
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((m) => {
                if ('emissiveIntensity' in m) this.damageReactiveMaterials.push(m);
            });
        });

        // Enforce loop types (AssetLibrary may have set them, but enforce here as source of truth)
        Object.values(this.animationActions).forEach((action) => {
            action.setLoop(THREE.LoopRepeat);
            action.clampWhenFinished = false;
        });
        if (this.animationActions.jump) {
            this.animationActions.jump.setLoop(THREE.LoopOnce);
            this.animationActions.jump.clampWhenFinished = true;
        }
        if (this.animationActions.slide) {
            this.animationActions.slide.setLoop(THREE.LoopOnce);
            this.animationActions.slide.clampWhenFinished = true;
        }

        this.playAction(this.animationActions.run ? 'run' : 'idle', true);
    }

    createFallbackPlayer() {
        const group = new THREE.Group();

        const suitMaterial = new THREE.MeshStandardMaterial({
            color: 0x0f172a, roughness: 0.45, metalness: 0.55,
            emissive: 0x000000, emissiveIntensity: 0
        });
        const accentMaterial = new THREE.MeshStandardMaterial({
            color: 0x22d3ee, roughness: 0.18, metalness: 0.92,
            emissive: 0x0ea5e9, emissiveIntensity: 0.28
        });
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0xd6a77a, roughness: 0.82, metalness: 0.04
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

        const leftArmPivot  = new THREE.Group();
        leftArmPivot.position.set(-0.36, 1.48, 0);
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.36, 1.48, 0);

        const armGeo  = new THREE.CapsuleGeometry(0.09, 0.55, 4, 10);
        const handGeo = new THREE.SphereGeometry(0.1, 10, 10);

        const leftArm = new THREE.Mesh(armGeo, suitMaterial);
        leftArm.position.y = -0.36;
        leftArm.castShadow = true;
        leftArmPivot.add(leftArm);
        const leftHand = new THREE.Mesh(handGeo, skinMaterial);
        leftHand.position.y = -0.72;
        leftArmPivot.add(leftHand);

        const rightArm = new THREE.Mesh(armGeo, suitMaterial);
        rightArm.position.y = -0.36;
        rightArm.castShadow = true;
        rightArmPivot.add(rightArm);
        const rightHand = new THREE.Mesh(handGeo, skinMaterial);
        rightHand.position.y = -0.72;
        rightArmPivot.add(rightHand);

        group.add(leftArmPivot);
        group.add(rightArmPivot);

        const leftLegPivot  = new THREE.Group();
        leftLegPivot.position.set(-0.16, 0.88, 0);
        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.16, 0.88, 0);

        const legGeo  = new THREE.CapsuleGeometry(0.12, 0.7, 4, 10);
        const footGeo = new THREE.BoxGeometry(0.18, 0.08, 0.34);

        const leftLeg = new THREE.Mesh(legGeo, suitMaterial);
        leftLeg.position.y = -0.48;
        leftLeg.castShadow = true;
        leftLegPivot.add(leftLeg);
        const leftFoot = new THREE.Mesh(footGeo, accentMaterial);
        leftFoot.position.set(0, -0.92, 0.08);
        leftLegPivot.add(leftFoot);

        const rightLeg = new THREE.Mesh(legGeo, suitMaterial);
        rightLeg.position.y = -0.48;
        rightLeg.castShadow = true;
        rightLegPivot.add(rightLeg);
        const rightFoot = new THREE.Mesh(footGeo, accentMaterial);
        rightFoot.position.set(0, -0.92, 0.08);
        rightLegPivot.add(rightFoot);

        group.add(leftLegPivot);
        group.add(rightLegPivot);

        group.position.set(this.getLaneX(this.getCenterLane()), this.config.groundY, 0);
        this.scene.add(group);

        this.player        = group;
        this.torso         = torso;
        this.head          = head;
        this.backpack      = backpack;
        this.leftArmPivot  = leftArmPivot;
        this.rightArmPivot = rightArmPivot;
        this.leftLegPivot  = leftLegPivot;
        this.rightLegPivot = rightLegPivot;
    }

    createTrail() {
        const trailGeometry = new THREE.BufferGeometry();
        trailGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(72), 3));
        const trailMaterial = new THREE.PointsMaterial({
            size: 0.16, color: 0x22d3ee,
            transparent: true, opacity: 0.38, sizeAttenuation: true
        });
        this.trail = new THREE.Points(trailGeometry, trailMaterial);
        this.scene.add(this.trail);
    }

    // -----------------------------------------------------------------------
    // Controls
    // -----------------------------------------------------------------------

    setDamageFlash() {
        this.damageFlashTimer = 0.6;
        this.stumbleTimer     = 0.45;
        this.hitFallTimer     = 0.55; // triggers forward-pitch fall animation
    }

    getLaneX(lane) {
        const centerIndex = (this.engine.config.laneCount - 1) / 2;
        return (lane - centerIndex) * this.config.laneWidth;
    }

    getCenterLane() {
        return Math.floor(this.engine.config.laneCount / 2);
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
            this.state.velocityY  = this.config.jumpForce;
            this.state.isJumping  = true;
            this.state.isGrounded = false;
            this.engine.audio.playJump();
            this.engine.effects.addJump(this.player.position.clone());
        }
    }

    slide() {
        if (!this.state.isJumping) {
            this.state.isSliding  = true;
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

    // -----------------------------------------------------------------------
    // Update
    // -----------------------------------------------------------------------

    update(dt) {
        this.player.position.z -= this.engine.currentSpeed * dt;
        this.nearMissCooldown = Math.max(0, this.nearMissCooldown - dt);
        this.damageFlashTimer = Math.max(0, this.damageFlashTimer - dt);
        this.stumbleTimer     = Math.max(0, this.stumbleTimer     - dt);
        this.hitFallTimer     = Math.max(0, this.hitFallTimer     - dt);

        if (this.animationMixer) this.animationMixer.update(dt);

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
        const diff    = targetX - this.player.position.x;

        if (Math.abs(diff) > 0.01) {
            this.player.position.x  = THREE.MathUtils.lerp(this.player.position.x, targetX, dt * 12.5);
            const bankAngle          = THREE.MathUtils.clamp(-diff * 0.17, -0.34, 0.34);
            this.player.rotation.y  = THREE.MathUtils.lerp(this.player.rotation.y, bankAngle * 0.65, dt * 10);
            this.player.rotation.z  = THREE.MathUtils.lerp(this.player.rotation.z, -bankAngle, dt * 12);
        } else {
            this.player.position.x  = targetX;
            this.player.rotation.y  = THREE.MathUtils.lerp(this.player.rotation.y, 0, dt * 8);
            this.player.rotation.z  = THREE.MathUtils.lerp(this.player.rotation.z, 0, dt * 8);
            this.state.lane         = this.state.targetLane;
        }
    }

    updateJump(dt) {
        if (!this.state.isGrounded) {
            this.state.velocityY      -= this.config.gravity * dt;
            this.player.position.y    += this.state.velocityY * dt;

            if (this.player.position.y <= this.config.groundY) {
                this.player.position.y   = this.config.groundY;
                this.state.velocityY     = 0;
                this.state.isJumping     = false;
                this.state.isGrounded    = true;
                this.engine.effects.addLand(this.player.position.clone());
            }
        }
    }

    updateSlide(dt) {
        if (this.state.isSliding) {
            this.state.slideTimer -= dt;
            if (this.state.slideTimer <= 0) {
                this.state.isSliding  = false;
                this.state.slideTimer = 0;
            }
        }
        const targetScaleY = this.state.isSliding
            ? this.config.slideHeight / this.config.playerHeight : 1;
        this.player.scale.y = THREE.MathUtils.lerp(this.player.scale.y, targetScaleY, dt * 16);
    }

    updateAnimation() {
        // ── Hit-fall pitch (both asset and fallback player) ──────────────────
        if (this.hitFallTimer > 0) {
            const fallDuration = 0.55;
            const progress     = 1 - this.hitFallTimer / fallDuration;
            // Sin arc: pitches forward, peaks at midpoint, then recovers
            const pitchAngle = Math.sin(progress * Math.PI) * 0.55;
            if (this.visualRoot) {
                this.visualRoot.rotation.x = pitchAngle;
            } else if (this.torso) {
                this.torso.rotation.x = pitchAngle;
            }
        }

        // ── Asset player with animations ─────────────────────────────────────
        if (this.animationMixer) {
            const nextAction = this.state.isSliding ? 'slide'
                             : this.state.isJumping ? 'jump'
                             : 'run';
            this.playAction(nextAction);

            if (this.visualRoot) {
                if (this.hitFallTimer <= 0) {
                    // Only lerp tilt when NOT in hit-fall (hit-fall controls rotation.x)
                    this.visualRoot.rotation.x = THREE.MathUtils.lerp(
                        this.visualRoot.rotation.x,
                        this.state.isSliding ? 0.08 : 0,
                        0.12
                    );
                }
                this.visualRoot.position.y = THREE.MathUtils.lerp(
                    this.visualRoot.position.y,
                    this.state.isSliding ? -0.08 : 0,
                    0.18
                );
            }
            return;
        }

        // ── Fallback procedural animation ─────────────────────────────────────
        // Guard: body parts only exist when createFallbackPlayer() was called.
        if (!this.torso) return;

        const speed          = this.engine.currentSpeed || this.engine.config.baseSpeed;
        const stride         = this.engine.elapsedTime * (4.8 + speed * 0.24);
        const runSwing       = Math.sin(stride);
        const oppositeSwing  = Math.sin(stride + Math.PI);
        const bounce         = Math.max(0, Math.sin(stride * 2)) * 0.08;
        const breath         = Math.sin(this.engine.elapsedTime * 1.8) * 0.02;
        const stumble        = this.stumbleTimer > 0
            ? Math.sin(this.engine.elapsedTime * 22) * 0.24 * (this.stumbleTimer / 0.45) : 0;

        if (this.hitFallTimer <= 0) {
            // Only apply regular torso tilt when not mid hit-fall
            this.torso.rotation.x = this.state.isSliding ? 0.58
                                  : this.state.isJumping ? -0.18
                                  : 0.08 + bounce * 0.25 + breath;
        }
        this.torso.rotation.y      = stumble * 0.3;
        this.head.position.y       = 1.92 + (this.state.isJumping ? 0.06 : bounce) + breath * 0.4;
        this.head.rotation.z       = stumble * 0.15;
        this.backpack.rotation.x   = this.torso.rotation.x * 0.4;

        this.leftArmPivot.rotation.x  = this.state.isSliding ? -1.2
                                       : this.state.isJumping ? -0.45
                                       : oppositeSwing * 0.98 + stumble;
        this.rightArmPivot.rotation.x = this.state.isSliding ? -1.2
                                       : this.state.isJumping ? -0.45
                                       : runSwing * 0.98 - stumble;
        this.leftArmPivot.rotation.z  = this.state.isSliding ? -0.15 : 0.08;
        this.rightArmPivot.rotation.z = this.state.isSliding ?  0.15 : -0.08;

        this.leftLegPivot.rotation.x  = this.state.isSliding ? 1.18
                                       : this.state.isJumping ? -0.3
                                       : runSwing * 0.95;
        this.rightLegPivot.rotation.x = this.state.isSliding ? 1.18
                                       : this.state.isJumping ? -0.3
                                       : oppositeSwing * 0.95;

        if (!this.state.isJumping) {
            this.player.position.y = this.state.isSliding && this.state.isGrounded
                ? -0.22 : bounce * 0.04;
        }
    }

    updateDamageFlash() {
        const blink     = this.damageFlashTimer > 0
            ? 0.2 + Math.sin(this.engine.elapsedTime * 35) * 0.35 : 0;
        const turboGlow = this.engine.powerups.activeEffects.speed ? 0.2 : 0;
        this.damageReactiveMaterials.forEach((material, index) => {
            material.emissiveIntensity = Math.max(
                (material.emissiveIntensity || 0) * 0.4,
                index === 0 ? blink * 0.5 : 0.18 + blink + turboGlow
            );
        });
    }

    playAction(name, force = false) {
        const action = this.animationActions[name];
        if (!action) return;
        if (this.currentAction === name && !force) return;

        const previous = this.currentAction ? this.animationActions[this.currentAction] : null;
        if (previous && previous !== action) previous.fadeOut(0.18);

        // For continuous looping actions (run/idle): avoid resetting time to 0 if the
        // action is already mid-play — just ensure it's enabled and fading in.
        // For one-shot actions (jump/slide): always reset so they play from the start.
        const isLooping = action.loop === THREE.LoopRepeat;
        if (force || !isLooping || !action.isRunning()) {
            action.reset();
        }
        action.enabled = true;
        action.fadeIn(0.18);
        action.play();
        this.currentAction = name;
    }

    updateTrail() {
        this.trailPositions.unshift(this.player.position.clone());
        if (this.trailPositions.length > 24) this.trailPositions.pop();

        const positions = this.trail.geometry.attributes.position.array;
        for (let i = 0; i < 24; i += 1) {
            const pos = this.trailPositions[i] || this.player.position;
            positions[i * 3]     = pos.x;
            positions[i * 3 + 1] = pos.y + 0.65;
            positions[i * 3 + 2] = pos.z + i * 0.02;
        }
        this.trail.geometry.attributes.position.needsUpdate = true;
    }

    // -----------------------------------------------------------------------
    // Collision detection
    // -----------------------------------------------------------------------

    getCollisionBounds() {
        const height  = this.state.isSliding ? 0.88 : 1.74;
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
                minY: 0.96, maxY: 1.24,
                minZ: obstacle.mesh.position.z - config.depth / 2,
                maxZ: obstacle.mesh.position.z + config.depth / 2
            };
        }

        const width = (config.width || 1) - this.config.collisionPadding;
        const depth = config.depth || 1.4;
        const minY  = 0;
        const maxY  = minY + config.height;

        return {
            minX: obstacle.mesh.position.x - width / 2,
            maxX: obstacle.mesh.position.x + width / 2,
            minY, maxY,
            minZ: obstacle.mesh.position.z - depth / 2,
            maxZ: obstacle.mesh.position.z + depth / 2
        };
    }

    intersects(a, b) {
        return a.minX <= b.maxX && a.maxX >= b.minX
            && a.minY <= b.maxY && a.maxY >= b.minY
            && a.minZ <= b.maxZ && a.maxZ >= b.minZ;
    }

    checkCollisions() {
        const playerBounds = this.getCollisionBounds();
        const playerBox    = new THREE.Box3(
            new THREE.Vector3(playerBounds.minX, playerBounds.minY, playerBounds.minZ),
            new THREE.Vector3(playerBounds.maxX, playerBounds.maxY, playerBounds.maxZ)
        );

        for (const obstacle of this.engine.obstacles.obstacles) {
            if (!obstacle.mesh || !obstacle.active) continue;

            const obstacleBounds = this.getObstacleBounds(obstacle);
            const closeOnTrack   = Math.abs(obstacle.mesh.position.z - this.player.position.z) < 1.4;
            const lateralGap     = Math.min(
                Math.abs(playerBounds.maxX - obstacleBounds.minX),
                Math.abs(obstacleBounds.maxX - playerBounds.minX)
            );

            if (closeOnTrack && lateralGap < 0.35
                && !this.intersects(playerBounds, obstacleBounds)
                && this.nearMissCooldown === 0) {
                this.nearMissCooldown = 0.6;
                this.engine.scoring.addScore(25, 'nearmiss');
                this.engine.effects.addNearMiss(this.player.position.clone());
                this.engine.audio.playNearMiss();
            }

            if (this.intersects(playerBounds, obstacleBounds)) {
                if (this.engine.powerups.activeShield) {
                    // Shield DESTROYS the obstacle
                    this.engine.powerups.consumeShield();
                    this.engine.effects.addShieldBreak(obstacle.mesh.position.clone());
                    this.engine.obstacles.removeObstacle(obstacle);
                    this.engine.audio.playShield();
                } else if (this.engine.canTakeHit()) {
                    // Obstacle STAYS — player is bounced to the nearest empty lane
                    this.bounceToSafeLane(obstacle);
                    const isGameOver = this.engine.registerHit(obstacle.mesh.position);
                    if (isGameOver) return;
                }
                // If canTakeHit() is false (still in recovery) we pass through —
                // obstacle stays, no repeated damage during invincibility window.
            }
        }

        for (const powerup of this.engine.powerups.powerups) {
            if (!powerup.mesh || !powerup.active) continue;
            const powerupBox = new THREE.Box3().setFromObject(powerup.mesh);
            if (playerBox.intersectsBox(powerupBox)) this.engine.powerups.collectPowerUp(powerup);
        }

        for (const coin of this.engine.powerups.coins) {
            if (!coin.mesh || !coin.active) continue;
            const coinBox = new THREE.Box3().setFromObject(coin.mesh);
            if (playerBox.intersectsBox(coinBox)) this.engine.powerups.collectCoin(coin);
        }
    }

    /**
     * Bounce the player away from the colliding obstacle lane.
     * Finds the closest obstacle-free lane and snaps the player there.
     */
    bounceToSafeLane(obstacle) {
        const laneCount    = this.engine.config.laneCount;
        const obstacleLane = obstacle.lane;

        // Collect all lanes currently blocked by active obstacles near this Z
        const nearZ    = obstacle.mesh.position.z;
        const blocked  = new Set();
        for (const obs of this.engine.obstacles.obstacles) {
            if (!obs.active || !obs.mesh) continue;
            if (Math.abs(obs.mesh.position.z - nearZ) < 2.5) {
                blocked.add(obs.lane);
            }
        }

        // Find the open lane nearest to the current lane
        const currentLane = this.state.lane;
        let bestLane = -1;
        let bestDist = Infinity;
        for (let l = 0; l < laneCount; l++) {
            if (blocked.has(l)) continue;
            const dist = Math.abs(l - currentLane);
            if (dist < bestDist) { bestDist = dist; bestLane = l; }
        }

        // If no completely open lane, just go to the lane opposite the obstacle
        if (bestLane === -1) {
            bestLane = obstacleLane === 0 ? laneCount - 1 : 0;
        }

        this.state.targetLane = bestLane;
        this.state.lane       = bestLane;
    }

    // -----------------------------------------------------------------------
    // Reset
    // -----------------------------------------------------------------------

    reset() {
        const centerLane = this.getCenterLane();
        this.state = {
            lane: centerLane, targetLane: centerLane,
            velocityY: 0,
            isJumping: false, isSliding: false,
            slideTimer: 0, isGrounded: true
        };

        this.player.position.set(this.getLaneX(centerLane), this.config.groundY, 0);
        this.player.rotation.set(0, 0, 0);
        this.player.scale.set(1, 1, 1);

        if (this.head) this.head.rotation.set(0, 0, 0);
        if (this.visualRoot) {
            this.visualRoot.position.set(0, 0, 0);
            this.visualRoot.rotation.set(0, 0, 0);
        }

        this.trailPositions   = [];
        this.nearMissCooldown = 0;
        this.damageFlashTimer = 0;
        this.stumbleTimer     = 0;
        this.hitFallTimer     = 0;

        this.damageReactiveMaterials.forEach((m, i) => {
            m.emissiveIntensity = i === 0 ? 0 : 0.18;
        });

        if (this.animationMixer) {
            this.playAction(this.animationActions.run ? 'run' : 'idle', true);
        }
    }
}
