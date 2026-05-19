// Core game variables
let canvas, ctx;
let paddleWidth = 100;
let defaultPaddleWidth = 100;
let paddleHeight = 16;
let paddleX = 0;
let paddleY = 0;
let paddleSpeed = 0.9; // Accumulative acceleration factor for keyboard
let paddleVelocity = 0; // Speed inertia vector
let paddleFriction = 0.84; // Slide inertia dampener
let keys = {};

// Array-based Multi-Ball state
let balls = [];
let ballRadius = 22;
let baseSpeed = 4.5;
let speedIncrement = 0.3;
let maxSpeed = 11;
let score = 0;
let bestScore = parseInt(localStorage.getItem('emojipop-best') || '0');
let bounces = 0;

// Game State
let isPlaying = false;
let isPaused = false;
let isGameOverState = false;
let gameMode = 'arena'; // 'arena', 'solo', 'h2h'
let soloMultiplier = 0.0; // Solo Earn Mode live stake multiplier progression
let breakEvenTriggered = false; // Solo Earn Break-Even arpeggio chime lock
let isLocked = false;
let sessionId = null;
let gameWidth = 0;
let gameHeight = 0;

// Emojis list depending on speed/progress
const EMOJIS = ['😂', '😎', '⚡', '🔥', '👑', '💥'];

// Visual Effects
let particles = [];
let shockwaves = [];
let screenShakeDuration = 0;
let screenShakeIntensity = 0;

// Dynamic Obstacle: Drifting Cloud
let cloudX = 0;
let cloudY = 150;
let cloudWidth = 70;
let cloudHeight = 40;
let cloudVx = 1.6;

// Falling Power-ups State
let powerups = [];
let powerupSpawnTimer = 0;
const POWERUP_TYPES = ['shield', 'wide', 'slow', 'speed'];
const POWERUP_EMOJIS = { shield: '🛡️', wide: '🍄', slow: '🐢', speed: '⚡' };

// Active Power-up States
let shieldActive = false;
let storedShields = 0;
let widePaddleTimer = 0;
let slowMoTimer = 0;
let speedPaddleTimer = 0;

// Combo/Streak system
let comboStreak = 0;
let maxComboStreak = 0;

// Procedural Dynamic Soundtrack Engine
let beatTimer = 0;
let beatStep = 0;
const BEAT_NOTES = [55, 65.4]; // A1 (55Hz) and C2 (65.4Hz) 2-step rhythm

// Rival Banner
let rivalUsername = null;
let rivalScore = 0;

// Native Web Audio Synthesizer
let audioCtx = null;
let isMuted = localStorage.getItem('emojipop-muted') === 'true';

function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playTone(freq, type, duration, vol = 0.15, delay = 0) {
    if (isMuted) return;
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration + 0.05);
    } catch (e) {
        // silent audio fail
    }
}

function playBounceSound() {
    const pitch = 240 + Math.min(comboStreak * 20, 360);
    playTone(pitch, 'triangle', 0.1, 0.18);
    playTone(pitch * 1.5, 'sine', 0.14, 0.08, 0.03);
}

function playWallSound() {
    playTone(180, 'sine', 0.05, 0.1);
}

function playObstacleSound() {
    playTone(380, 'sine', 0.06, 0.15);
    playTone(520, 'sine', 0.08, 0.12, 0.03);
}

function playPowerupSpawnSound() {
    if (isMuted) return;
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
    } catch(e) {}
}

function playPowerupCollectSound() {
    const notes = [330, 392, 523, 659];
    notes.forEach((freq, idx) => {
        playTone(freq, 'triangle', 0.15, 0.15, idx * 0.05);
    });
}

function playShieldDeflectSound() {
    playTone(150, 'sawtooth', 0.25, 0.25);
    playTone(300, 'sine', 0.3, 0.15, 0.05);
}

function playSpawnBallSound() {
    playTone(660, 'sine', 0.08, 0.12);
    playTone(880, 'sine', 0.12, 0.1, 0.06);
}

function playBossSpawnSound() {
    // Epic ascending and heavy double pitch
    playTone(110, 'sawtooth', 0.4, 0.3);
    playTone(220, 'sawtooth', 0.4, 0.2, 0.1);
    playTone(440, 'triangle', 0.5, 0.15, 0.2);
}

function playBossHitSound() {
    // Explosive synth impact
    playTone(80, 'sawtooth', 0.5, 0.4);
    playTone(150, 'square', 0.4, 0.3, 0.05);
}

function playGameOverSound() {
    if (isMuted) return;
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.65);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        osc.start();
        osc.stop(ctx.currentTime + 0.75);
    } catch(e) {}
}

function playProceduralSoundtrackBeat() {
    if (isMuted || isPaused || !isPlaying || isGameOverState) return;
    // Rhythmic low-synth baseline
    const note = BEAT_NOTES[beatStep];
    playTone(note, 'triangle', 0.15, 0.07);
    beatStep = (beatStep + 1) % BEAT_NOTES.length;
}

function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('emojipop-muted', isMuted);
    const btn = document.getElementById('mute-btn');
    if (btn) {
        btn.textContent = isMuted ? '🔇' : '🔊';
    }
    if (!isMuted) {
        playTone(440, 'sine', 0.08, 0.1);
    }
}
window.toggleMute = toggleMute;

// Setup Event Listeners on Load
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    const searchParams = new URLSearchParams(window.location.search);
    const modeParam = searchParams.get('mode');
    if (modeParam) {
        gameMode = modeParam;
        const modeBadge = document.getElementById('mode-badge');
        if (modeBadge) {
            if (gameMode === 'solo') {
                modeBadge.textContent = 'Solo Cashout';
                
                // Rename HUD labels for Solo Earn Mode dynamically
                const scoreLabel = document.querySelector('.score-box.highlight .score-label');
                if (scoreLabel) scoreLabel.textContent = 'Multiplier';
                const scoreDisplay = document.getElementById('score-display');
                if (scoreDisplay) scoreDisplay.textContent = '0.00x';
                
                // Hide Best score box completely (not relevant in Solo staking sessions)
                const bestBox = document.getElementById('best-display')?.parentElement;
                if (bestBox) bestBox.style.display = 'none';
            }
            else if (gameMode === 'h2h') modeBadge.textContent = 'H2H Duel';
            else modeBadge.textContent = 'Arena Tournament';
        }
    }

    document.getElementById('best-display').textContent = bestScore.toLocaleString();
    
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn && isMuted) {
        muteBtn.textContent = '🔇';
    }

    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('mousemove', handleMouseMove);
    
    window.addEventListener('keydown', e => keys[e.key] = true);
    window.addEventListener('keyup', e => keys[e.key] = false);

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    requestAnimationFrame(gameLoop);
});

// Platform Handshake / Message Listeners
window.addEventListener('message', (event) => {
    if (event.data?.type === 'PLAYZA_SESSION_CONFIG') {
        const payload = event.data.payload || {};
        isLocked = !!payload.locked;
        sessionId = payload.sessionId;
        console.log(`[EmojiPop] Session Initialized. Locked: ${isLocked}, Session ID: ${sessionId}`);
    }

    if (event.data?.type === 'PLAYZA_PAUSE') {
        isPaused = true;
    }
    if (event.data?.type === 'PLAYZA_RESUME') {
        isPaused = false;
    }

    if (event.data?.type === 'PLAYZA_RIVAL_UPDATE') {
        const payload = event.data.payload || {};
        rivalUsername = payload.username;
        rivalScore = payload.score || 0;
        updateRivalBanner();
    }
});

function resizeCanvas() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    gameWidth = container.clientWidth;
    gameHeight = container.clientHeight;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = gameWidth * dpr;
    canvas.height = gameHeight * dpr;
    ctx.scale(dpr, dpr);

    canvas.style.width = gameWidth + 'px';
    canvas.style.height = gameHeight + 'px';

    paddleY = gameHeight - 50;
    cloudY = gameHeight * 0.32;
    
    if (paddleX + paddleWidth > gameWidth) {
        paddleX = gameWidth - paddleWidth;
    }
}

// Input Handlers
function handleMouseMove(e) {
    if (!isPlaying || isPaused || isGameOverState) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    paddleX = clientX - paddleWidth / 2;
    paddleVelocity = 0; // Lock velocity shifts to cursor
    clampPaddle();
}

function handleTouchStart(e) {
    if (getAudioCtx().state === 'suspended') {
        getAudioCtx().resume();
    }
}

function handleTouchMove(e) {
    if (!isPlaying || isPaused || isGameOverState) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches[0].clientX - rect.left;
    paddleX = clientX - paddleWidth / 2;
    paddleVelocity = 0; // Lock velocity shifts to touch
    clampPaddle();
}

function clampPaddle() {
    if (paddleX < 0) {
        paddleX = 0;
        paddleVelocity = 0;
    }
    if (paddleX + paddleWidth > gameWidth) {
        paddleX = gameWidth - paddleWidth;
        paddleVelocity = 0;
    }
}

// Visual Effects: Sparks, Particle Bursts, Shockwaves
function spawnParticleBurst(x, y, colorCode) {
    const colors = colorCode === 'gold' ? ['#f5a623', '#fffbeb', '#ffedd5'] : 
                  colorCode === 'shield' ? ['#00e5ff', '#e0f7fa', '#00bcd4'] :
                  ['#ec4899', '#fdf2f8', '#ff3b30'];
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3.5;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 2 + Math.random() * 4,
            alpha: 1,
            decay: 0.03 + Math.random() * 0.04,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

function spawnPaddleSparks(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8.5, // fast horizontal dispersion
            vy: -Math.random() * 2.5,
            radius: 1.5 + Math.random() * 2,
            alpha: 1.0,
            decay: 0.04 + Math.random() * 0.02,
            color: '#f5a623'
        });
    }
}

function spawnShockwave(x, y, colorCode) {
    const color = colorCode === 'shield' ? '#00e5ff' : colorCode === 'boss' ? '#ec4899' : '#f5a623';
    shockwaves.push({
        x: x,
        y: y,
        radius: 10,
        maxRadius: colorCode === 'boss' ? 120 : 75,
        alpha: 1.0,
        decay: colorCode === 'boss' ? 0.03 : 0.04,
        color: color
    });
}

function shakeScreen(intensity, duration) {
    screenShakeIntensity = intensity;
    screenShakeDuration = duration;
}

// Onboarding Play CTA
function startGame() {
    if (isPlaying) return;
    
    getAudioCtx().resume();

    // Reset variables
    score = 0;
    bounces = 0;
    soloMultiplier = 0.0;
    breakEvenTriggered = false;
    comboStreak = 0;
    maxComboStreak = 0;
    powerups = [];
    powerupSpawnTimer = 0;
    shockwaves = [];
    shieldActive = false;
    storedShields = 0;
    widePaddleTimer = 0;
    slowMoTimer = 0;
    speedPaddleTimer = 0;
    paddleWidth = defaultPaddleWidth;
    paddleVelocity = 0;
    beatTimer = 0;
    beatStep = 0;

    document.getElementById('score-display').textContent = gameMode === 'solo' ? '0.00x' : '0';
    document.getElementById('bounces-display').textContent = '0';
    document.getElementById('start-overlay').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('visible');

    // Spawn first primary ball
    balls = [];
    spawnBall(gameWidth / 2, gameHeight / 3, true, false);

    paddleX = gameWidth / 2 - paddleWidth / 2;
    cloudX = gameWidth / 2 - cloudWidth / 2;

    isPlaying = true;
    isGameOverState = false;
    isPaused = false;
}
window.startGame = startGame;

function spawnBall(x, y, isFirst = false, isBoss = false) {
    const angle = (0.2 + Math.random() * 0.3) * Math.PI;
    const speed = isBoss ? baseSpeed - 0.5 : (isFirst ? baseSpeed : baseSpeed + 1.0);
    
    balls.push({
        x: x,
        y: y,
        vx: Math.random() > 0.5 ? Math.cos(angle) * speed : -Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: isBoss ? ballRadius * 1.7 : ballRadius,
        emoji: isBoss ? '👑' : (isFirst ? '😂' : '😎'),
        speed: speed,
        bouncesCount: 0,
        isBoss: isBoss,
        history: [] // stores previous frame coordinates for path trails
    });

    if (isBoss) {
        playBossSpawnSound();
        shakeScreen(10, 20);
        triggerBonusToast('👑 MEGA-BOSS EMOJI DROPPED!');
    } else if (!isFirst) {
        playSpawnBallSound();
        shakeScreen(6, 12);
        triggerBonusToast('🔥 EXTRA BALL SPAWNED!');
    }
}

let lastH2HSyncTime = 0;

// Game Loop Architecture
function gameLoop(timestamp) {
    updatePhysics();
    renderGraphics();

    // Broadcast live gameplay coordinates in H2H mode at throttled 80ms intervals
    if (gameMode === 'h2h' && isPlaying && !isPaused && !isGameOverState) {
        const now = performance.now();
        if (now - lastH2HSyncTime > 80) {
            lastH2HSyncTime = now;
            if (window.parent !== window) {
                window.parent.postMessage({
                    type: 'H2H_STATE_SYNC',
                    payload: {
                        paddleXRatio: paddleX / gameWidth,
                        paddleWidthRatio: paddleWidth / gameWidth,
                        balls: balls.map(b => ({
                            xRatio: b.x / gameWidth,
                            yRatio: b.y / gameHeight,
                            radiusRatio: (b.radius || 15) / gameWidth,
                            emoji: b.emoji,
                            isBoss: b.isBoss || false
                        })),
                        score: score,
                        comboStreak: comboStreak,
                        shieldActive: shieldActive,
                        storedShields: storedShields,
                        slowMoActive: slowMoTimer > 0,
                        widePaddleActive: widePaddleTimer > 0
                    }
                }, '*');
            }
        }
    }

    requestAnimationFrame(gameLoop);
}

function updatePhysics() {
    // Tick screen shake timer even if the game is paused, locked, or over
    if (screenShakeDuration > 0) {
        screenShakeDuration--;
    }

    if (!isPlaying || isPaused || isGameOverState) return;

    // ── Timer-Based Powerup Buff Reductions ──
    if (widePaddleTimer > 0) {
        widePaddleTimer--;
        if (widePaddleTimer <= 0) {
            paddleWidth = defaultPaddleWidth;
            triggerBonusToast('Paddle Shrunk!');
        }
    }
    if (slowMoTimer > 0) {
        slowMoTimer--;
        if (slowMoTimer <= 0) {
            balls.forEach(ball => {
                const angle = Math.atan2(ball.vy, ball.vx);
                ball.speed = ball.speed / 0.6;
                ball.vx = Math.cos(angle) * ball.speed;
                ball.vy = Math.sin(angle) * ball.speed;
            });
            triggerBonusToast('Normal Speed!');
        }
    }
    if (speedPaddleTimer > 0) {
        speedPaddleTimer--;
        if (speedPaddleTimer <= 0) {
            triggerBonusToast('Turbo Speed Ended!');
        }
    }

    // ── Procedural Dynamic Soundtrack Rhythms ──
    // Average speed of active balls determines beat interval
    let avgSpeed = baseSpeed;
    if (balls.length > 0) {
        const sum = balls.reduce((acc, b) => acc + b.speed, 0);
        avgSpeed = sum / balls.length;
    }
    // Tempo scales up as speed increases: interval shrinks from 60 frames (1s) to 30 frames (0.5s)
    let beatInterval = Math.max(30, Math.min(60, Math.floor(270 / avgSpeed)));
    
    // Solo Earn Mode Adrenaline Tempo Boost
    if (gameMode === 'solo' && soloMultiplier >= 1.0) {
        // Accelerate music speed as player climbs towards 2.0x limit
        const soloTempoScale = 1.0 - ((soloMultiplier - 1.0) * 0.45); // shrinks interval down to 55% at 2.0x
        beatInterval = Math.max(16, Math.floor(beatInterval * soloTempoScale));
    }

    beatTimer++;
    if (beatTimer >= beatInterval) {
        beatTimer = 0;
        playProceduralSoundtrackBeat();
    }

    // ── Keyboard Inertia Physics (Dynamic control slide) ──
    let activePaddleSpeed = paddleSpeed;
    if (speedPaddleTimer > 0) {
        activePaddleSpeed = paddleSpeed * 2.2; // Turbo paddle acceleration!
    }
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        paddleVelocity -= activePaddleSpeed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        paddleVelocity += activePaddleSpeed;
    }
    paddleVelocity *= paddleFriction;
    paddleX += paddleVelocity;
    clampPaddle();

    // ── Cloud Obstacle Drift ──
    cloudX += cloudVx;
    if (cloudX <= 0) {
        cloudX = 0;
        cloudVx = -cloudVx;
    } else if (cloudX + cloudWidth >= gameWidth) {
        cloudX = gameWidth - cloudWidth;
        cloudVx = -cloudVx;
    }

    // ── Periodic Power-up Spawner ──
    powerupSpawnTimer++;
    if (powerupSpawnTimer >= 840) {
        powerupSpawnTimer = 0;
        const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
        powerups.push({
            x: Math.random() * (gameWidth - 40) + 20,
            y: -20,
            vy: 2.2,
            type: type,
            emoji: POWERUP_EMOJIS[type],
            radius: 16
        });
        playPowerupSpawnSound();
    }

    // ── Move and Process Power-up capsules ──
    powerups.forEach((pu, idx) => {
        pu.y += pu.vy;

        const capsuleBottom = pu.y + pu.radius;
        const prevCapsuleBottom = pu.y - pu.vy + pu.radius;
        
        // Bulletproof vertical collision checking (tunnelling protection)
        const hitPaddleY = capsuleBottom >= paddleY && prevCapsuleBottom <= paddleY + paddleHeight;
        
        // Generous horizontal tip overlap buffer (eliminates edge slippage)
        const overlapBuffer = pu.radius * 0.55;
        const hitPaddleX = pu.x >= paddleX - overlapBuffer && pu.x <= paddleX + paddleWidth + overlapBuffer;

        if (hitPaddleX && hitPaddleY) {
            activatePowerup(pu.type);
            powerups.splice(idx, 1);
        } else if (pu.y - pu.radius > gameHeight) {
            powerups.splice(idx, 1);
        }
    });

    // ── Process Active Shockwaves ──
    shockwaves.forEach((sw, idx) => {
        sw.radius += (sw.maxRadius - sw.radius) * 0.12;
        sw.alpha -= sw.decay;
        if (sw.alpha <= 0) {
            shockwaves.splice(idx, 1);
        }
    });

    // ── Process Balls Physics Loop ──
    let deadBallsIndices = [];

    balls.forEach((ball, bIdx) => {
        // Record path trail history
        ball.history.push({ x: ball.x, y: ball.y });
        if (ball.history.length > 6) {
            ball.history.shift();
        }

        ball.x += ball.vx;
        ball.y += ball.vy;

        // ── Left/Right Wall Bounces ──
        if (ball.x - ball.radius <= 0) {
            ball.x = ball.radius;
            ball.vx = -ball.vx;
            playWallSound();
            spawnParticleBurst(0, ball.y, 'normal');
        } else if (ball.x + ball.radius >= gameWidth) {
            ball.x = gameWidth - ball.radius;
            ball.vx = -ball.vx;
            playWallSound();
            spawnParticleBurst(gameWidth, ball.y, 'normal');
        }

        // ── Ceiling Bounce ──
        if (ball.y - ball.radius <= 0) {
            ball.y = ball.radius;
            ball.vy = -ball.vy;
            playWallSound();
            spawnParticleBurst(ball.x, 0, 'normal');
        }

        // ── Cloud Obstacle Collision ──
        const cloudCenterX = cloudX + cloudWidth / 2;
        const cloudCenterY = cloudY + cloudHeight / 2;
        const distToCloud = Math.hypot(ball.x - cloudCenterX, ball.y - cloudCenterY);
        const collisionThreshold = ball.isBoss ? ball.radius + 15 : ball.radius + 24;

        if (distToCloud < collisionThreshold) {
            const angle = Math.atan2(ball.y - cloudCenterY, ball.x - cloudCenterX);
            
            ball.vx = Math.cos(angle) * ball.speed;
            ball.vy = Math.sin(angle) * ball.speed;
            
            ball.x = cloudCenterX + Math.cos(angle) * (collisionThreshold + 1);
            ball.y = cloudCenterY + Math.sin(angle) * (collisionThreshold + 1);

            playObstacleSound();
            shakeScreen(4, 10);
            spawnParticleBurst(ball.x, ball.y, 'normal');
            spawnShockwave(ball.x, ball.y, 'gold');
            triggerBonusToast('☁️ Cloud Deflection!');
        }

        // ── Paddle Bounce Collision ──
        const ballBottom = ball.y + ball.radius;
        const prevBallBottom = ball.y - ball.vy + ball.radius;
        
        // Bulletproof vertical collision checking (tunnelling protection)
        if (ball.vy > 0 && ballBottom >= paddleY && prevBallBottom <= paddleY + paddleHeight) {
            // Horizontal checking with generous tip overlap buffer (eliminates edge slippage)
            const overlapBuffer = ball.radius * 0.55; // 55% radius extra horizontal reach on both edges
            if (ball.x >= paddleX - overlapBuffer && ball.x <= paddleX + paddleWidth + overlapBuffer) {
                ball.y = paddleY - ball.radius; // snap to top of paddle surface
                
                // Calculate impact point, clamped to paddle bounds for smooth deflect angles
                const relativeX = Math.max(paddleX, Math.min(ball.x, paddleX + paddleWidth));
                const relativeImpact = (relativeX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2); // scales -1.0 to 1.0
                
                if (slowMoTimer <= 0 && !ball.isBoss) {
                    ball.speed = Math.min(ball.speed + speedIncrement, maxSpeed);
                }

                const maxDeflectionAngle = 55 * Math.PI / 180;
                const targetAngle = relativeImpact * maxDeflectionAngle;

                ball.vx = Math.sin(targetAngle) * ball.speed;
                ball.vy = -Math.cos(targetAngle) * ball.speed;

                // Score computation
                comboStreak += 1;
                bounces += 1;
                ball.bouncesCount += 1;
                if (comboStreak > maxComboStreak) maxComboStreak = comboStreak;

                // Award Skill Shield for high streaks in Solo Earn Mode!
                if (gameMode === 'solo' && comboStreak === 15) {
                    storedShields += 1;
                    if (!shieldActive) {
                        shieldActive = true;
                    }
                    playTone(600, 'sine', 0.15, 0.15);
                    playTone(900, 'sine', 0.25, 0.15, 0.08);
                    spawnParticleBurst(ball.x, paddleY, 'shield');
                    triggerBonusToast('🛡️ SKILL SHIELD AWARDED! (Combo 15+)');
                }

                let multiplier = 1;
                if (comboStreak >= 10) multiplier = 3;
                else if (comboStreak >= 5) multiplier = 2;

                let chaosMultiplier = 1;
                if (balls.length > 1) {
                    chaosMultiplier = 2;
                }

                // Mega-Boss impact gives giant points boost
                const baseBouncePoints = ball.isBoss ? 1000 : 100;
                const scoreGain = baseBouncePoints * multiplier * chaosMultiplier;
                score += scoreGain;
                
                if (gameMode === 'solo') {
                    // --- SOLO EARN MODE: Payout Multiplier Ascent ---
                    // The player climbs towards a 2.0x stake multiplier cap.
                    // Each standard bounce awards +0.04x progression.
                    // Hits with active multipliers and Multi-Ball combos accelerate this gain!
                    let multGain = ball.isBoss ? 0.25 : 0.04;
                    
                    // Combo streaks scale up progression speed!
                    if (comboStreak >= 10) multGain *= 2.5;
                    else if (comboStreak >= 5) multGain *= 1.8;
                    
                    // Multi-Ball chaos doubles the multiplier rate!
                    if (balls.length > 1) {
                        multGain *= 2.0;
                    }
                    
                    soloMultiplier = Math.min(2.0, soloMultiplier + multGain);
                    document.getElementById('score-display').textContent = soloMultiplier.toFixed(2) + 'x';

                    // Break-even milestone arpeggio chord chime and visual burst
                    if (soloMultiplier >= 1.0 && !breakEvenTriggered) {
                        breakEvenTriggered = true;
                        playTone(523.25, 'sine', 0.12, 0.2); // C5 major arpeggio
                        playTone(659.25, 'sine', 0.12, 0.2, 0.06); // E5
                        playTone(783.99, 'sine', 0.12, 0.2, 0.12); // G5
                        playTone(1046.50, 'sine', 0.2, 0.25, 0.18); // C6
                        shakeScreen(10, 20);
                        spawnParticleBurst(gameWidth / 2, gameHeight * 0.65, 'gold');
                        triggerBonusToast('🔓 BREAK-EVEN SECURED! PROFIT ACTIVE!');
                    }
                    
                    // Sync multiplier or score progress in the React parent layout
                    if (window.parent !== window) {
                        if (gameMode === 'solo') {
                            window.parent.postMessage({
                                type: 'SCORE_UPDATE',
                                payload: { multiplier: soloMultiplier }
                            }, '*');
                        } else if (gameMode === 'h2h') {
                            window.parent.postMessage({
                                type: 'SCORE_UPDATE',
                                score: score
                            }, '*');
                        }
                    }
                } else {
                    document.getElementById('score-display').textContent = score.toLocaleString();
                }
                document.getElementById('bounces-display').textContent = bounces.toLocaleString();

                if (!ball.isBoss) {
                    const emojiIdx = Math.min(Math.floor(ball.bouncesCount / 4), EMOJIS.length - 1);
                    ball.emoji = EMOJIS[emojiIdx];
                }

                // Render dynamic effects based on impact intensity
                if (ball.isBoss) {
                    playBossHitSound();
                    spawnParticleBurst(ball.x, paddleY, 'gold');
                    spawnPaddleSparks(ball.x, paddleY);
                    spawnShockwave(ball.x, paddleY, 'boss');
                    shakeScreen(15, 25);
                    triggerBonusToast(`👑 MEGA-BOSS DEFLECTED! +${scoreGain.toLocaleString()}`);
                } else {
                    playBounceSound();
                    spawnParticleBurst(ball.x, paddleY, 'gold');
                    spawnPaddleSparks(ball.x, paddleY);
                    spawnShockwave(ball.x, paddleY, balls.length > 1 ? 'shield' : 'gold');
                    shakeScreen(5, 10);

                    if (chaosMultiplier > 1) {
                        triggerBonusToast(`🔥 CHAOS MULTIPLIER! +${scoreGain} (Combo x${multiplier} * Chaos x2)`);
                    } else if (multiplier > 1) {
                        triggerBonusToast(`+${scoreGain} Combo x${multiplier}!`);
                    } else {
                        triggerBonusToast(`+100 BOUNCE!`);
                    }
                }

                // Spawners:
                // 1. Extra Ball at 15 Bounces
                if (bounces === 15 && balls.length === 1) {
                    spawnBall(gameWidth / 2, gameHeight / 4, false, false);
                }
                
                // 2. Mega-Boss at every 50 Bounces (50, 100, 150...)
                if (bounces % 50 === 0 && bounces > 0) {
                    spawnBall(gameWidth / 2, gameHeight / 5, false, true);
                }

                if (score > bestScore) {
                    bestScore = score;
                    document.getElementById('best-display').textContent = bestScore.toLocaleString();
                    localStorage.setItem('emojipop-best', bestScore);
                }

                updateRivalBanner();
            }
        }

        // ── Fall Condition Check ──
        if (ball.y - ball.radius > gameHeight) {
            if (shieldActive) {
                if (storedShields > 0) {
                    storedShields -= 1;
                    triggerBonusToast(`🛡️ BACKUP SHIELD DEPLOYED! (${storedShields} Stored)`);
                } else {
                    shieldActive = false;
                    triggerBonusToast('🛡️ SHIELD BROKEN!');
                }
                ball.y = paddleY - ball.radius;
                ball.vy = -Math.abs(ball.vy);
                playShieldDeflectSound();
                shakeScreen(9, 18);
                spawnParticleBurst(ball.x, paddleY + 10, 'shield');
                spawnShockwave(ball.x, paddleY, 'shield');
            } else {
                deadBallsIndices.push(bIdx);
            }
        }
    });

    // Remove dead balls
    deadBallsIndices.reverse().forEach(idx => {
        balls.splice(idx, 1);
    });

    if (balls.length === 0) {
        triggerGameOver();
    }

    // Process particle timers
    particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
            particles.splice(idx, 1);
        }
    });
}

function activatePowerup(type) {
    playPowerupCollectSound();
    shakeScreen(5, 12);
    spawnShockwave(paddleX + paddleWidth / 2, paddleY, type === 'shield' ? 'shield' : 'gold');

    if (type === 'shield') {
        if (shieldActive) {
            storedShields += 1;
            triggerBonusToast(`🛡️ SHIELD STACKED! (Stored: ${storedShields})`);
        } else {
            shieldActive = true;
            triggerBonusToast('🛡️ SHIELD ACTIVE!');
        }
    } else if (type === 'wide') {
        paddleWidth = defaultPaddleWidth * 1.5;
        if (widePaddleTimer > 0) {
            widePaddleTimer += 480; // Stack duration (8 seconds)
            triggerBonusToast('🍄 PADDLE TURBO EXTENDED!');
        } else {
            widePaddleTimer = 480;
            triggerBonusToast('🍄 PADDLE EXPANDED!');
        }
    } else if (type === 'slow') {
        if (slowMoTimer > 0) {
            slowMoTimer += 360; // Stack duration (6 seconds)
            triggerBonusToast('🐢 SLOW MOTION EXTENDED!');
        } else {
            slowMoTimer = 360;
            balls.forEach(ball => {
                const angle = Math.atan2(ball.vy, ball.vx);
                ball.speed = ball.speed * 0.6;
                ball.vx = Math.cos(angle) * ball.speed;
                ball.vy = Math.sin(angle) * ball.speed;
            });
            triggerBonusToast('🐢 SLOW MOTION!');
        }
    } else if (type === 'speed') {
        if (speedPaddleTimer > 0) {
            speedPaddleTimer += 480; // Stack duration (8 seconds)
            triggerBonusToast('⚡ PADDLE TURBO EXTENDED!');
        } else {
            speedPaddleTimer = 480;
            triggerBonusToast('⚡ PADDLE TURBO!');
        }
    }
}

function renderGraphics() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    // Apply viewport camera shake
    ctx.save();
    if (screenShakeDuration > 0) {
        const shakeX = (Math.random() - 0.5) * screenShakeIntensity;
        const shakeY = (Math.random() - 0.5) * screenShakeIntensity;
        ctx.translate(shakeX, shakeY);
    }

    // ── Determine Dynamic Background based on Score ──
    let innerColor = '#1e1b4b'; // Level 0 (Slate/Indigo)
    let outerColor = '#0f172a';
    let levelName = 'Arena Edition';

    if (gameMode === 'solo') {
        if (soloMultiplier >= 1.0) {
            innerColor = '#064e3b'; // Level Cashout (Green Emerald Surge)
            outerColor = '#022c22';
            levelName = '💸 Cashout Surge';
        } else {
            innerColor = '#24072f'; // Danger Zone (Deep Purple/Crimson Suspense)
            outerColor = '#0b0010';
            levelName = '🚨 Stake Danger';
        }
    } else if (score >= 4000) {
        innerColor = '#7c2d12'; // Level 3 (Golden/Amber)
        outerColor = '#1c0a00';
        levelName = '🏆 High Roller Gold';
    } else if (score >= 2000) {
        innerColor = '#064e3b'; // Level 2 (Emerald/Teal)
        outerColor = '#022c22';
        levelName = '⚡ Emerald Rush';
    } else if (score >= 1000) {
        innerColor = '#4c1d95'; // Level 1 (Crimson/Violet)
        outerColor = '#180828';
        levelName = '🔥 Neon Fire';
    }

    const modeBadge = document.getElementById('mode-badge');
    if (modeBadge && gameMode === 'arena') {
        modeBadge.textContent = levelName;
    }

    // Draw dynamic radial background
    const bgGrad = ctx.createRadialGradient(
        gameWidth / 2, gameHeight / 2, 20,
        gameWidth / 2, gameHeight / 2, Math.max(gameWidth, gameHeight) * 0.8
    );
    bgGrad.addColorStop(0, innerColor);
    bgGrad.addColorStop(1, outerColor);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    // Spatial depth styling is handled purely by the dynamic radial gradients

    // ── Draw Interactive Rival Score Line ──
    if (rivalScore > 0 && gameMode !== 'solo') {
        const isSurpassed = score > rivalScore;
        ctx.save();
        ctx.strokeStyle = isSurpassed ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(0, 80);
        ctx.lineTo(gameWidth, 80);
        ctx.stroke();
        
        ctx.font = '10px "Outfit", sans-serif';
        ctx.fillStyle = isSurpassed ? '#10b981' : '#f43f5e';
        ctx.textAlign = 'right';
        ctx.fillText(
            isSurpassed ? `🏆 SURPASSED RIVAL: ${rivalScore}` : `🎯 RIVAL TARGET: ${rivalScore}`,
            gameWidth - 16,
            72
        );
        ctx.restore();
    }

    // ── Draw Solo Earn break-even Neon Milestone line ──
    if (gameMode === 'solo') {
        const lineY = gameHeight * 0.65;
        const isSafe = soloMultiplier >= 1.0;
        
        ctx.save();
        ctx.strokeStyle = isSafe ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.3)';
        ctx.lineWidth = isSafe ? 2.5 : 1.5;
        ctx.setLineDash([8, 6]);
        
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(gameWidth, lineY);
        ctx.stroke();
        
        ctx.font = 'bold 10px "Outfit", sans-serif';
        ctx.fillStyle = isSafe ? '#10b981' : '#f87171';
        ctx.textAlign = 'left';
        
        // Add neon glow to safe indicator
        if (isSafe) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#10b981';
        }
        ctx.fillText(
            isSafe ? '🔓 BREAK-EVEN SECURED (PROFIT ACTIVE!)' : '🚨 BREAK-EVEN TARGET (STAKE AT RISK)',
            16,
            lineY - 8
        );
        ctx.restore();
    }

    // ── Draw Stored Shields Row (Glassmorphic Badges) ──
    if (storedShields > 0) {
        ctx.save();
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#00e5ff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0, 229, 255, 0.4)';
        
        let shieldString = '';
        for (let i = 0; i < storedShields; i++) {
            shieldString += '🛡️';
        }
        ctx.fillText(`${shieldString} (+${storedShields} Stored)`, gameWidth - 16, 36);
        ctx.restore();
    }

    // ── Draw background accent glow circles ──
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.arc(gameWidth / 2, gameHeight / 2, 160, 0, Math.PI * 2);
    ctx.fill();

    // ── Draw Active Expansion Shockwaves ──
    shockwaves.forEach(sw => {
        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    });

    // ── Draw Drifting Cloud Obstacle ──
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.05)';

    const cxRadius = 15;
    ctx.beginPath();
    ctx.moveTo(cloudX + cxRadius, cloudY);
    ctx.lineTo(cloudX + cloudWidth - cxRadius, cloudY);
    ctx.quadraticCurveTo(cloudX + cloudWidth, cloudY, cloudX + cloudWidth, cloudY + cxRadius);
    ctx.lineTo(cloudX + cloudWidth, cloudY + cloudHeight - cxRadius);
    ctx.quadraticCurveTo(cloudX + cloudWidth, cloudY + cloudHeight, cloudX + cloudWidth - cxRadius, cloudY + cloudHeight);
    ctx.lineTo(cloudX + cxRadius, cloudY + cloudHeight);
    ctx.quadraticCurveTo(cloudX, cloudY + cloudHeight, cloudX, cloudY + cloudHeight - cxRadius);
    ctx.lineTo(cloudX, cloudY + cxRadius);
    ctx.quadraticCurveTo(cloudX, cloudY, cloudX + cxRadius, cloudY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☁️', cloudX + cloudWidth / 2, cloudY + cloudHeight / 2);
    ctx.restore();

    // ── Draw active Safety Shield ──
    if (shieldActive) {
        ctx.save();
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(0, 229, 255, 0.5)';
        
        ctx.beginPath();
        ctx.moveTo(0, gameHeight - 12);
        ctx.lineTo(gameWidth, gameHeight - 12);
        ctx.stroke();
        ctx.restore();
    }

    // ── Draw particles (sparks + stars) ──
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // ── Draw Power-up capsules ──
    powerups.forEach(pu => {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = pu.type === 'shield' ? 'rgba(0, 229, 255, 0.4)' : 
                         pu.type === 'wide' ? 'rgba(245, 166, 35, 0.4)' : 
                         pu.type === 'slow' ? 'rgba(236, 72, 153, 0.4)' : 'rgba(255, 235, 59, 0.4)';
        
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, pu.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = `${pu.radius * 1.3}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pu.emoji, pu.x, pu.y);
        ctx.restore();
    });

    // ── Draw Paddle (Horizontal Glassmorphism styling) ──
    const grad = ctx.createLinearGradient(paddleX, paddleY, paddleX + paddleWidth, paddleY);
    grad.addColorStop(0, '#f5a623');
    grad.addColorStop(1, '#ec4899');
    
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(245, 166, 35, 0.4)';
    ctx.fillStyle = grad;
    
    const radius = 8;
    ctx.beginPath();
    ctx.moveTo(paddleX + radius, paddleY);
    ctx.lineTo(paddleX + paddleWidth - radius, paddleY);
    ctx.quadraticCurveTo(paddleX + paddleWidth, paddleY, paddleX + paddleWidth, paddleY + radius);
    ctx.lineTo(paddleX + paddleWidth, paddleY + paddleHeight - radius);
    ctx.quadraticCurveTo(paddleX + paddleWidth, paddleY + paddleHeight, paddleX + paddleWidth - radius, paddleY + paddleHeight);
    ctx.lineTo(paddleX + radius, paddleY + paddleHeight);
    ctx.quadraticCurveTo(paddleX, paddleY + paddleHeight, paddleX, paddleY + paddleHeight - radius);
    ctx.lineTo(paddleX, paddleY + radius);
    ctx.quadraticCurveTo(paddleX, paddleY, paddleX + radius, paddleY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // ── Draw Combo Streak floating chip inside canvas ──
    if (comboStreak >= 3) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.strokeStyle = comboStreak >= 10 ? '#ec4899' : '#f5a623';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.arc(45, 45, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 9px "Outfit", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('COMBO', 45, 42);

        ctx.font = 'black 13px "Outfit", sans-serif';
        ctx.fillStyle = comboStreak >= 10 ? '#ec4899' : '#f5a623';
        ctx.textBaseline = 'top';
        ctx.fillText(`${comboStreak}x`, 45, 42);
        ctx.restore();
    }

    // ── Draw Balls (Path Trails + Badges) ──
    balls.forEach(ball => {
        // Draw trailing ghost paths
        ball.history.forEach((pos, index) => {
            const opacity = ((index + 1) / ball.history.length) * 0.15;
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = ball.isBoss ? '#ec4899' : (balls.length > 1 ? '#00e5ff' : '#f5a623');
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, ball.radius * 0.82, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Main Ball badge with shadow
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = ball.isBoss ? 'rgba(236, 72, 153, 0.7)' : 'rgba(255, 255, 255, 0.6)';
        ctx.fillStyle = ball.isBoss ? '#ffe4e6' : '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = `${ball.radius * (ball.isBoss ? 1.3 : 1.4)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ball.emoji, ball.x, ball.y);
        ctx.restore();
    });

    ctx.restore();
}

function triggerGameOver() {
    isPlaying = false;
    isGameOverState = true;
    playGameOverSound();
    shakeScreen(16, 32);

    if (gameMode === 'solo' || gameMode === 'h2h') {
        // --- SOLO EARN / H2H MODE: Finalize Session ---
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'GAME_OVER',
                score: score,
                payload: { multiplier: soloMultiplier, score: score }
            }, '*');
        }
        return; // Skip displaying internal game-over HTML because React overlay processes results!
    }

    document.getElementById('over-score').textContent = score.toLocaleString();
    document.getElementById('over-best').textContent = bestScore.toLocaleString();
    document.getElementById('over-bounces').textContent = bounces.toString();
    
    const overScreen = document.getElementById('game-over-screen');
    overScreen.classList.add('visible');

    if (window.parent !== window) {
        window.parent.postMessage({
            type: 'PLAYZA_SCORE_SUBMISSION',
            payload: {
                game_id: 'emoji-pop-arena',
                session_id: new URLSearchParams(window.location.search).get('session_id') || sessionId,
                score: score,
                metadata: {
                    category: 'Arcade',
                    bounces: bounces,
                    maxComboStreak: maxComboStreak,
                }
            }
        }, '*');
    }

    overScreen.onclick = () => {
        overScreen.onclick = null;
        startGame();
    };
}

function updateRivalBanner() {
    const banner = document.getElementById('rival-banner');
    const rivalText = document.getElementById('rival-text');
    if (!banner || !rivalText) return;

    if (!rivalUsername) {
        banner.classList.remove('visible');
        return;
    }

    banner.classList.add('visible');

    if (score > rivalScore) {
        banner.classList.add('surpassed');
        rivalText.innerHTML = `👑 SURPASSED <b>${rivalUsername}</b> (${rivalScore})`;
    } else {
        banner.classList.remove('surpassed');
        rivalText.innerHTML = `🎯 BEAT <b>${rivalUsername}</b>: <b>${rivalScore}</b> (Need +${rivalScore - score})`;
    }
}

function triggerBonusToast(label) {
    const wrapper = document.querySelector('.game-wrapper');
    if (!wrapper) return;

    const popup = document.createElement('div');
    popup.className = 'bonus-popup';
    popup.textContent = label;
    
    if (comboStreak >= 10) {
        popup.style.color = '#ff007f';
        popup.style.fontWeight = '950';
    } else if (comboStreak >= 5) {
        popup.style.color = '#ec4899';
    } else {
        popup.style.color = '#f5a623';
    }

    wrapper.appendChild(popup);
    popup.addEventListener('animationend', () => popup.remove(), { once: true });
}
