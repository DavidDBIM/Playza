import * as THREE from 'three';

import { PlayerController } from '../player/PlayerController.js';
import { ObstacleSpawner } from '../systems/ObstacleSpawner.js';
import { EnvironmentManager } from '../systems/EnvironmentManager.js';
import { ObstacleSystem } from '../systems/ObstacleSystem.js';
import { PowerUpSystem } from '../systems/PowerUpSystem.js';
import { ScoringSystem } from '../systems/ScoringSystem.js';
import { CameraSystem } from '../systems/CameraSystem.js';
import { AudioManager } from '../systems/AudioManager.js';
import { EffectSystem } from '../systems/EffectSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { AssetLibrary } from './AssetLibrary.js';

export class GameEngine {
    constructor(container) {
        this.container = container;
        this.isRunning = false;
        this.isPaused = false;
        this.gameState = 'idle';
        this.deltaTime = 0;
        this.elapsedTime = 0;
        this.gameTime = 0;
        this.currentSpeed = 15;
        this.speedMultiplier = 1;
        this.maxLives = 3;
        this.lives = this.maxLives;
        this.hitRecoveryTimer = 0;

        this.config = {
            baseSpeed: 15,
            maxSpeed: 58,
            laneWidth: 2.5,
            laneCount: 3,
            gravity: 33,
            jumpForce: 15.5,
            slideDuration: 0.7,
            hitRecoveryDuration: 1.45
        };

        this.ready = this.init();
    }

    async init() {
        this.setupRenderer();
        this.setupScene();
        this.setupLighting();
        this.assets = new AssetLibrary(this);
        await this.assets.loadAll();
        this.setupSystems();
        this.setupEventListeners();
        this.resize();
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.08;
        this.container.appendChild(this.renderer.domElement);
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x07111f, 42, 250);
        this.scene.background = new THREE.Color(0x07111f);

        this.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 500);
        this.camera.position.set(0, 3.8, 7.0);
        this.camera.lookAt(0, 1.0, -10);
    }

    setupLighting() {
        const ambient = new THREE.AmbientLight(0xb4dbff, 0.84);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xe6f3ff, 1.18);
        sun.position.set(16, 22, 8);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 120;
        sun.shadow.camera.left = -30;
        sun.shadow.camera.right = 30;
        sun.shadow.camera.top = 30;
        sun.shadow.camera.bottom = -30;
        this.scene.add(sun);

        const cyanFill = new THREE.PointLight(0x22d3ee, 13, 90, 2);
        cyanFill.position.set(0, 8, -25);
        this.scene.add(cyanFill);

        const orangeFill = new THREE.PointLight(0xf97316, 9, 60, 2);
        orangeFill.position.set(-10, 4, 10);
        this.scene.add(orangeFill);

        this.scene.add(new THREE.HemisphereLight(0x4cc9f0, 0x030712, 0.44));
    }

    setupSystems() {
        this.player = new PlayerController(this);
        this.environment = new EnvironmentManager(this);
        this.obstacles = new ObstacleSystem(this);
        this.generator = new ObstacleSpawner(this);
        this.powerups = new PowerUpSystem(this);
        this.scoring = new ScoringSystem(this);
        this.cameraSystem = new CameraSystem(this);
        this.audio = new AudioManager(this);
        this.effects = new EffectSystem(this);
        this.ui = new UIManager(this);
    }

    setupEventListeners() {
        this.resizeHandler = () => this.resize();
        this.keyDownHandler = (event) => this.handleKeyDown(event);
        this.keyUpHandler = (event) => this.handleKeyUp(event);
        this.touchStartHandler = (event) => this.handleTouchStart(event);
        this.touchMoveHandler = (event) => this.handleTouchMove(event);
        this.touchEndHandler = (event) => this.handleTouchEnd(event);

        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);
        window.addEventListener('touchstart', this.touchStartHandler, { passive: false });
        window.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        window.addEventListener('touchend', this.touchEndHandler);
    }

    handleKeyDown(event) {
        if (event.code === 'Escape' && this.gameState === 'playing') {
            this.pause();
            return;
        }

        if (this.gameState === 'idle' && (event.code === 'Space' || event.code === 'Enter')) {
            this.start();
            return;
        }

        if (!this.isRunning || this.isPaused || this.gameState !== 'playing') {
            return;
        }

        switch (event.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.player.moveLeft();
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.player.moveRight();
                break;
            case 'ArrowUp':
            case 'KeyW':
            case 'Space':
                this.player.jump();
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.player.slide();
                break;
            default:
                break;
        }
    }

    handleKeyUp(event) {
        if (event.code === 'ArrowDown' || event.code === 'KeyS') {
            this.player.stopSlide();
        }
    }

    handleTouchStart(event) {
        if (!this.isRunning || this.isPaused || this.gameState !== 'playing') {
            return;
        }

        // preventDefault() on touchstart is sometimes needed, but can break quick taps.
        // The main scroll blocking is done in touchmove.
        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchStarted = true;
    }

    handleTouchMove(event) {
        if (!this.isRunning || this.isPaused || this.gameState !== 'playing') {
            return;
        }
        // Prevent default scrolling and pull-to-refresh while playing
        event.preventDefault();
    }

    handleTouchEnd(event) {
        if (!this.touchStarted || !this.isRunning || this.isPaused || this.gameState !== 'playing') {
            return;
        }

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;

        // Require a minimum swipe distance to activate to avoid accidental taps
        const minSwipeDistance = 30;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX < 0) {
                this.player.moveLeft();
            } else {
                this.player.moveRight();
            }
        } else if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY < 0) {
                // Swipe up (negative Y)
                this.player.jump();
            } else {
                // Swipe down (positive Y)
                this.player.slide();
            }
        }

        this.touchStarted = false;
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    getSpeedMultiplier() {
        let multiplier = 1;
        if (this.powerups?.activeEffects.speed) {
            multiplier *= 1.45;
        }
        return multiplier;
    }

    async start() {
        await this.ready;

        if (this.isRunning && this.gameState === 'playing') {
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.gameState = 'playing';
        this.touchStarted = false;
        this.elapsedTime = 0;
        this.gameTime = 0;
        this.currentSpeed = this.config.baseSpeed;
        this.speedMultiplier = 1;
        this.lives = this.maxLives;
        this.hitRecoveryTimer = 0;

        this.player.reset();
        this.environment.reset();
        this.obstacles.reset();
        this.powerups.reset();
        this.scoring.reset();
        this.effects.reset();
        this.cameraSystem.reset();
        this.generator.reset();
        this.generator.seedInitialTrack();

        this.ui.showGame();
        this.ui.updateLives(this.lives, this.maxLives);
        this.audio.reset();
        this.audio.playMusic();

        this.clock = new THREE.Clock();
        this.render();
        this.animate();
    }

    animate() {
        if (!this.isRunning) {
            return;
        }

        requestAnimationFrame(() => this.animate());

        this.deltaTime = Math.min(this.clock.getDelta(), 0.05);
        this.elapsedTime += this.deltaTime;

        if (!this.isPaused && this.gameState === 'playing') {
            this.gameTime += this.deltaTime;
            this.update();
        }

        this.render();
    }

    update() {
        const baseProgression = 1 + (this.gameTime / 70) * 0.34;
        this.speedMultiplier = this.getSpeedMultiplier();
        let targetSpeed = Math.min(this.config.baseSpeed * baseProgression * this.speedMultiplier, this.config.maxSpeed);

        this.hitRecoveryTimer = Math.max(0, this.hitRecoveryTimer - this.deltaTime);

        // Mimic falling logic by dropping speed
        if (this.hitRecoveryTimer > this.config.hitRecoveryDuration - 0.55) {
            targetSpeed = 0;
        } else if (this.hitRecoveryTimer > 0) {
            const recoveryProgress = 1 - (this.hitRecoveryTimer / (this.config.hitRecoveryDuration - 0.55));
            targetSpeed *= Math.max(0.1, recoveryProgress);
        }

        this.currentSpeed = targetSpeed;

        this.player.update(this.deltaTime);
        this.environment.update(this.deltaTime);
        this.obstacles.update(this.deltaTime);
        this.powerups.update(this.deltaTime);
        this.scoring.update(this.deltaTime);
        this.cameraSystem.update(this.deltaTime);
        this.effects.update(this.deltaTime);
        this.audio.update(this.deltaTime);
        this.generator.update(this.deltaTime);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    canTakeHit() {
        return this.hitRecoveryTimer <= 0;
    }

    registerHit(position) {
        if (!this.canTakeHit()) {
            return false;
        }

        this.lives -= 1;
        this.hitRecoveryTimer = this.config.hitRecoveryDuration;
        this.cameraSystem.addShake(0.55);
        this.effects.addShieldBreak(position.clone());
        this.player.setDamageFlash();
        this.audio.playCrashPulse();
        this.ui.updateLives(this.lives, this.maxLives);
        this.ui.flashMessage(this.lives > 0 ? `Impact detected. ${this.lives} life${this.lives === 1 ? '' : 's'} left.` : 'System failure');

        if (this.lives <= 0) {
            this.triggerGameOver();
            return true;
        }

        return false;
    }

    triggerGameOver() {
        this.gameState = 'over';
        this.isRunning = false;
        this.isPaused = false;
        this.audio.playCrash();
        this.ui.showGameOver(this.scoring.getScoreData());
    }

    pause() {
        if (this.gameState !== 'playing') {
            return;
        }

        this.isPaused = !this.isPaused;
        this.ui.showPause(this.isPaused);
    }

    destroy() {
        this.isRunning = false;
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
        window.removeEventListener('touchstart', this.touchStartHandler);
        window.removeEventListener('touchend', this.touchEndHandler);
        this.renderer.dispose();
        this.scene.clear();
    }
}
