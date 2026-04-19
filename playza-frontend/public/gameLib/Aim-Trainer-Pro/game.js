const AudioManager = {
    ctx: null,
    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    playHit() {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    },
    playCombo() {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    },
    playMiss() {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    },
    playLevelUp() {
        if (!this.ctx) this.init();
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.1 + 0.2);
            osc.start(this.ctx.currentTime + i * 0.1);
            osc.stop(this.ctx.currentTime + i * 0.1 + 0.2);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('game-area');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const xpDisplay = document.getElementById('xp');
    const bestScoreDisplay = document.getElementById('best-score');
    const comboDisplay = document.getElementById('combo');
    const accuracyDisplay = document.getElementById('accuracy');
    const hitsDisplay = document.getElementById('hits');
    const streakDisplay = document.getElementById('streak');
    const startScreen = document.getElementById('start-screen');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const comboFire = document.getElementById('combo-fire');
    const heatmap = document.getElementById('heatmap');

    let gameState = {
        score: 0,
        timeLeft: 60,
        xp: 0,
        totalXp: parseInt(localStorage.getItem('aim-trainer-total-xp')) || 0,
        level: 1,
        bestScore: parseInt(localStorage.getItem('aim-trainer-best')) || 0,
        combo: 0,
        maxCombo: 0,
        hits: 0,
        clicks: 0,
        misses: 0,
        isPlaying: false,
        currentMode: 'classic',
        currentDifficulty: 'easy',
        currentSkin: 'classic',
        targetSize: 50,
        spawnInterval: 1500,
        basePoints: 100,
        currentStreak: 0,
        bestStreak: parseInt(localStorage.getItem('aim-trainer-best-streak')) || 0,
        reactionTimes: [],
        totalGames: parseInt(localStorage.getItem('aim-trainer-total-games')) || 0,
        sessionHits: 0,
        sessionClicks: 0
    };

    let gameTimer = null;
    let targetInterval = null;
    let currentTarget = null;
    let targetSpawnTime = 0;
    let dailyChallenge = null;

    const modeConfigs = {
        classic: { time: 60, spawnInterval: 1500, desc: 'Standard 60-second round. Build combos for bonus points!' },
        speed: { time: 30, spawnInterval: 800, desc: 'Fast-paced 30-second blitz. Quick reflexes needed!' },
        precision: { time: 60, spawnInterval: 2000, desc: 'Smaller targets, more points. Focus on accuracy!' },
        endless: { time: Infinity, spawnInterval: 1500, desc: 'No time limit. How long can you survive?' },
        streak: { time: Infinity, spawnInterval: 1200, desc: 'One miss = game over! Can you handle the pressure?' }
    };

    const difficultySettings = {
        easy: { sizeMultiplier: 1.3, pointsMultiplier: 0.8 },
        medium: { sizeMultiplier: 1, pointsMultiplier: 1 },
        hard: { sizeMultiplier: 0.75, pointsMultiplier: 1.5 },
        insane: { sizeMultiplier: 0.5, pointsMultiplier: 2.5 }
    };

    bestScoreDisplay.textContent = gameState.bestScore;
    updatePlayerStats();

    window.selectMode = function(mode) {
        if (gameState.isPlaying) return;
        gameState.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        updateModeInfo();
    };

    window.selectDifficulty = function(diff) {
        if (gameState.isPlaying) return;
        gameState.currentDifficulty = diff;
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.diff === diff);
        });
    };

    window.selectSkin = function(skin) {
        if (gameState.isPlaying) return;
        gameState.currentSkin = skin;
        document.querySelectorAll('.skin-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.skin === skin);
        });
    };

    function updateModeInfo() {
        const config = modeConfigs[gameState.currentMode];
        const titleEl = document.querySelector('#mode-info h2');
        const descEl = document.querySelector('.mode-desc');
        titleEl.textContent = config.time === Infinity ? 
            (gameState.currentMode === 'streak' ? 'STREAK MODE' : 'ENDLESS MODE') : 
            `${config.time} SECONDS`;
        descEl.textContent = config.desc;
    }

    function updatePlayerStats() {
        const xpForLevel = gameState.level * 500;
        const currentLevelXp = gameState.totalXp - ((gameState.level - 1) * 500);
        xpDisplay.textContent = `${currentLevelXp}/${xpForLevel}`;
        document.getElementById('total-games').textContent = gameState.totalGames;
        document.getElementById('total-xp').textContent = gameState.totalXp;
        document.getElementById('player-level').textContent = gameState.level;
    }

    function checkLevelUp() {
        const xpForLevel = gameState.level * 500;
        if (gameState.totalXp >= xpForLevel) {
            gameState.level++;
            localStorage.setItem('aim-trainer-level', gameState.level);
            AudioManager.playLevelUp();
            showLevelUp();
        }
    }

    function showLevelUp() {
        const levelUp = document.createElement('div');
        levelUp.className = 'level-up';
        levelUp.textContent = `LEVEL ${gameState.level}!`;
        document.body.appendChild(levelUp);
        setTimeout(() => levelUp.remove(), 2000);
    }

    window.startGame = function() {
        startScreen.style.display = 'none';
        
        const config = modeConfigs[gameState.currentMode];
        const diff = difficultySettings[gameState.currentDifficulty];
        
        gameState.score = 0;
        gameState.timeLeft = config.time;
        gameState.combo = 0;
        gameState.maxCombo = 0;
        gameState.hits = 0;
        gameState.clicks = 0;
        gameState.misses = 0;
        gameState.currentStreak = 0;
        gameState.reactionTimes = [];
        gameState.targetSize = 50 * diff.sizeMultiplier;
        gameState.spawnInterval = config.spawnInterval;
        gameState.basePoints = 100 * diff.pointsMultiplier;
        gameState.sessionHits = 0;
        gameState.sessionClicks = 0;
        
        scoreDisplay.textContent = '0';
        timeDisplay.textContent = config.time === Infinity ? '∞' : config.time;
        timeDisplay.style.color = '';
        comboDisplay.textContent = 'x1';
        comboDisplay.style.color = '#ff3366';
        accuracyDisplay.textContent = '100%';
        hitsDisplay.textContent = '0';
        streakDisplay.textContent = '0';
        
        comboFire.classList.remove('active');
        heatmap.innerHTML = '';
        
        gameState.isPlaying = true;
        
        if (config.time !== Infinity) {
            gameTimer = setInterval(() => {
                gameState.timeLeft--;
                timeDisplay.textContent = gameState.timeLeft;
                
                if (gameState.timeLeft <= 10) {
                    timeDisplay.style.color = '#ff3366';
                }
                
                if (gameState.timeLeft <= 0) {
                    endGame(false);
                }
            }, 1000);
        }

        spawnTarget();
        
        targetInterval = setInterval(() => {
            if (currentTarget && !currentTarget.classList.contains('hit')) {
                const isMiss = gameState.currentMode === 'streak';
                missTarget();
                if (isMiss && gameState.currentMode === 'streak') {
                    endGame(true);
                }
            }
            spawnTarget();
        }, gameState.spawnInterval);
    };

    function spawnTarget() {
        if (currentTarget) {
            currentTarget.remove();
        }

        const gameAreaRect = gameArea.getBoundingClientRect();
        const padding = 25;
        
        const maxX = gameAreaRect.width - gameState.targetSize - padding * 2;
        const maxY = gameAreaRect.height - gameState.targetSize - padding * 2;
        
        const x = padding + Math.random() * maxX;
        const y = padding + Math.random() * maxY;

        const target = document.createElement('div');
        target.className = `target ${gameState.currentSkin}`;
        target.style.width = gameState.targetSize + 'px';
        target.style.height = gameState.targetSize + 'px';
        target.style.left = x + 'px';
        target.style.top = y + 'px';
        
        target.addEventListener('click', (e) => {
            e.stopPropagation();
            hitTarget(target, e);
        });

        gameArea.appendChild(target);
        currentTarget = target;
        targetSpawnTime = Date.now();
    }

    function hitTarget(target, event) {
        if (!gameState.isPlaying) return;
        
        gameState.sessionClicks++;
        gameState.clicks++;
        gameState.hits++;
        
        const reactionTime = Date.now() - targetSpawnTime;
        gameState.reactionTimes.push(reactionTime);
        
        target.classList.add('hit');
        
        gameState.combo++;
        gameState.currentStreak++;
        if (gameState.combo > gameState.maxCombo) gameState.maxCombo = gameState.combo;
        
        const comboMultiplier = Math.min(gameState.combo, 15);
        const points = Math.floor(gameState.basePoints * comboMultiplier);
        
        gameState.score += points;
        scoreDisplay.textContent = gameState.score;
        
        comboDisplay.textContent = 'x' + comboMultiplier;
        
        if (gameState.combo >= 5) {
            comboDisplay.style.color = '#ffd700';
            AudioManager.playCombo();
        } else {
            AudioManager.playHit();
        }
        
        if (gameState.combo >= 8) {
            comboFire.classList.add('active');
        }
        
        updateAccuracy();
        streakDisplay.textContent = gameState.currentStreak;
        
        showComboPopup(event.clientX, event.clientY, comboMultiplier);
        createParticles(event.clientX, event.clientY);
        addHeatmapDot(event.clientX, event.clientY);
        
        setTimeout(() => {
            target.remove();
            currentTarget = null;
            spawnTarget();
        }, 120);
    }

    function missTarget() {
        if (!gameState.isPlaying) return;
        
        gameState.sessionClicks++;
        gameState.clicks++;
        gameState.misses++;
        gameState.combo = 0;
        
        comboDisplay.textContent = 'x1';
        comboDisplay.style.color = '#ff3366';
        comboFire.classList.remove('active');
        
        if (gameState.currentMode === 'streak') {
            AudioManager.playMiss();
            showStreakWarning();
        }
        
        updateAccuracy();
    }

    function updateAccuracy() {
        if (gameState.clicks === 0) {
            accuracyDisplay.textContent = '100%';
        } else {
            const acc = Math.round((gameState.hits / gameState.clicks) * 100);
            accuracyDisplay.textContent = acc + '%';
        }
        
        hitsDisplay.textContent = gameState.hits;
    }

    function showComboPopup(x, y, multiplier) {
        if (multiplier < 3) return;
        
        const popup = document.createElement('div');
        popup.className = 'combo-popup';
        popup.textContent = multiplier + 'x!';
        popup.style.left = (x - gameArea.getBoundingClientRect().left) + 'px';
        popup.style.top = (y - gameArea.getBoundingClientRect().top) + 'px';
        
        gameArea.appendChild(popup);
        
        setTimeout(() => popup.remove(), 700);
    }

    function createParticles(x, y) {
        const colors = ['#ff3366', '#00ffaa', '#ffd700', '#00aaff'];
        const count = 8;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = (x - gameArea.getBoundingClientRect().left) + 'px';
            particle.style.top = (y - gameArea.getBoundingClientRect().top) + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            const angle = (i / count) * Math.PI * 2;
            const distance = 40 + Math.random() * 30;
            particle.style.setProperty('--px', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--py', Math.sin(angle) * distance + 'px');
            
            gameArea.appendChild(particle);
            setTimeout(() => particle.remove(), 600);
        }
    }

    function addHeatmapDot(x, y) {
        const rect = gameArea.getBoundingClientRect();
        const dot = document.createElement('div');
        dot.className = 'heatmap-dot';
        dot.style.left = (x - rect.left) + 'px';
        dot.style.top = (y - rect.top) + 'px';
        dot.style.opacity = 0.3 + Math.random() * 0.3;
        heatmap.appendChild(dot);
    }

    function showStreakWarning() {
        const warning = document.createElement('div');
        warning.className = 'streak-warning';
        warning.textContent = 'MISS!';
        gameArea.appendChild(warning);
        setTimeout(() => warning.remove(), 500);
    }

    function endGame(streakOver = false) {
        gameState.isPlaying = false;
        
        clearInterval(gameTimer);
        clearInterval(targetInterval);
        
        if (currentTarget) {
            currentTarget.remove();
            currentTarget = null;
        }

        comboFire.classList.remove('active');
        
        const xpEarned = calculateXp();
        gameState.xp = xpEarned;
        gameState.totalXp += xpEarned;
        gameState.totalGames++;
        
        localStorage.setItem('aim-trainer-total-xp', gameState.totalXp);
        localStorage.setItem('aim-trainer-total-games', gameState.totalGames);
        
        checkLevelUp();

        if (gameState.score > gameState.bestScore) {
            gameState.bestScore = gameState.score;
            bestScoreDisplay.textContent = gameState.bestScore;
            localStorage.setItem('aim-trainer-best', gameState.bestScore);
        }

        if (gameState.currentStreak > gameState.bestStreak) {
            gameState.bestStreak = gameState.currentStreak;
            localStorage.setItem('aim-trainer-best-streak', gameState.bestStreak);
        }

        document.getElementById('final-score').textContent = gameState.score;
        document.getElementById('final-hits').textContent = gameState.hits;
        document.getElementById('final-accuracy').textContent = 
            gameState.clicks > 0 ? Math.round((gameState.hits / gameState.clicks) * 100) + '%' : '0%';
        document.getElementById('final-combo').textContent = 'x' + gameState.maxCombo;
        document.getElementById('xp-gained').textContent = '+' + xpEarned;

        const avgReaction = gameState.reactionTimes.length > 0
            ? Math.round(gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length)
            : 0;
        document.getElementById('session-accuracy').textContent = 
            gameState.sessionClicks > 0 ? Math.round((gameState.sessionHits / gameState.sessionClicks) * 100) + '%' : '0%';
        document.getElementById('session-reaction').textContent = avgReaction + 'ms';

        const titleEl = document.getElementById('game-over-title');
        if (streakOver) {
            titleEl.textContent = 'STREAK OVER!';
            titleEl.classList.add('streak-over');
        } else if (gameState.currentMode === 'endless') {
            titleEl.textContent = 'GAME OVER';
            titleEl.classList.remove('streak-over');
        } else {
            titleEl.textContent = "TIME'S UP!";
            titleEl.classList.remove('streak-over');
        }

        const isNewBest = gameState.score >= gameState.bestScore && gameState.score > 0;
        document.getElementById('new-records').classList.toggle('show', isNewBest);

        gameOverOverlay.style.display = 'flex';
        updatePlayerStats();

        if (window.parent !== window) {
            setTimeout(() => {
                window.parent.postMessage({
                    type: 'PLAYZA_SCORE_SUBMISSION',
                    payload: {
                        game_id: 'Aim-Trainer-Pro',
                        session_id: new URLSearchParams(window.location.search).get('session_id'),
                        score: gameState.score,
                        metadata: { 
                            category: 'Reflex',
                            mode: gameState.currentMode,
                            difficulty: gameState.currentDifficulty,
                            hits: gameState.hits,
                            accuracy: gameState.clicks > 0 ? Math.round((gameState.hits / gameState.clicks) * 100) : 0,
                            maxCombo: gameState.maxCombo,
                            xpEarned: xpEarned,
                            avgReaction: avgReaction
                        }
                    }
                }, 2500);
            });
        }
    }

    function calculateXp() {
        const baseXp = gameState.hits * 10;
        const accuracyBonus = gameState.clicks > 0 
            ? Math.round((gameState.hits / gameState.clicks) * baseXp * 0.5) 
            : 0;
        const comboBonus = gameState.maxCombo * 25;
        const difficultyBonus = {
            easy: 1,
            medium: 1.5,
            hard: 2,
            insane: 3
        }[gameState.currentDifficulty];
        
        return Math.floor((baseXp + accuracyBonus + comboBonus) * difficultyBonus);
    }

    gameArea.addEventListener('click', (e) => {
        if (!gameState.isPlaying) return;
        if (e.target === gameArea) {
            gameState.sessionClicks++;
            gameState.clicks++;
            gameState.combo = 0;
            gameState.currentStreak = 0;
            comboDisplay.textContent = 'x1';
            comboDisplay.style.color = '#ff3366';
            comboFire.classList.remove('active');
            updateAccuracy();
            streakDisplay.textContent = '0';
            
            AudioManager.playMiss();
            
            if (gameState.currentMode === 'streak') {
                endGame(true);
                return;
            }
            
            const rect = gameArea.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const missIndicator = document.createElement('div');
            missIndicator.className = 'miss-indicator';
            missIndicator.style.left = x + 'px';
            missIndicator.style.top = y + 'px';
            gameArea.appendChild(missIndicator);
            
            setTimeout(() => missIndicator.remove(), 400);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && startScreen.style.display !== 'none') {
            e.preventDefault();
            startGame();
        }
    });

    updateModeInfo();
});