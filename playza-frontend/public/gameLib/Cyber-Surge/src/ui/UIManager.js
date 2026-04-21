export class UIManager {
    constructor(engine) {
        this.engine = engine;
        this.container = engine.container;
        this.elements = {};
        this.flashTimeout = null;
        this.createUI();
    }

    createUI() {
        this.createStartScreen();
        this.createHUD();
        this.createGameOverScreen();
        this.createPauseScreen();
        this.createFlashBanner();
    }

    createStartScreen() {
        const startScreen = document.createElement('div');
        startScreen.id = 'start-screen';
        startScreen.className = 'game-screen';
        startScreen.innerHTML = `
            <div class="screen-inner">
                <p class="eyebrow">Playza Arcade</p>
                <h1 class="game-logo">CYBER <span>SURGE</span></h1>
                <p class="subtitle">Sprint the neon highway, read the city, and stay alive long enough to own the grid.</p>
                <div class="controls-info">
                    <div class="ctrl-row"><span class="kbd">Swipe / A D</span><span>Shift lanes fast</span></div>
                    <div class="ctrl-row"><span class="kbd">Up / Space</span><span>Jump blockers and wrecks</span></div>
                    <div class="ctrl-row"><span class="kbd">Down / S</span><span>Slide under low barriers</span></div>
                </div>
                <div class="powerup-legend">
                    <div class="pu-item"><span class="pu-icon magnet">M</span><span>Magnet vacuums nearby coins</span></div>
                    <div class="pu-item"><span class="pu-icon speed">T</span><span>Turbo turns the run cinematic</span></div>
                    <div class="pu-item"><span class="pu-icon shield">S</span><span>Shield eats one crash</span></div>
                    <div class="pu-item"><span class="pu-icon lives">3</span><span>Three lives to survive the city</span></div>
                </div>
                <button class="start-btn" id="start-btn">Start Run</button>
            </div>
        `;

        this.container.appendChild(startScreen);
        this.elements.startScreen = startScreen;
        document.getElementById('start-btn').addEventListener('click', () => this.engine.start());
    }

    createHUD() {
        const hud = document.createElement('div');
        hud.id = 'game-hud';
        hud.className = 'hud hidden';
        hud.innerHTML = `
            <div class="hud-top">
                <div class="hud-card score-card">
                    <span class="hud-label">Score</span>
                    <span class="hud-value" id="score-value">0</span>
                </div>
                <div class="hud-card combo-card">
                    <span class="hud-label">Combo</span>
                    <span class="combo-badge" id="combo-display">x1</span>
                </div>
                <div class="hud-card coins-card">
                    <span class="hud-label">Coins</span>
                    <span class="hud-value coin-val" id="coins-value">0</span>
                </div>
                <div class="hud-card lives-card">
                    <span class="hud-label">Lives</span>
                    <div class="lives-track" id="lives-display"></div>
                </div>
            </div>
            <div class="hud-bottom">
                <div class="mini-panel">
                    <span class="mini-label">Dist</span>
                    <span class="mini-value" id="distance-value">0m</span>
                </div>
                <div class="mini-panel district-panel">
                    <span class="mini-label">Zone</span>
                    <span class="mini-value" id="district-value">Core Grid</span>
                </div>
                <div class="mini-panel">
                    <span class="mini-label">Speed</span>
                    <span class="mini-value" id="speed-value">15</span>
                </div>
            </div>
            <div class="powerups-row" id="powerups-display"></div>
        `;

        this.container.appendChild(hud);
        this.elements.hud = hud;
    }

    createGameOverScreen() {
        const gameOver = document.createElement('div');
        gameOver.id = 'game-over';
        gameOver.className = 'game-screen hidden';
        gameOver.innerHTML = `
            <div class="screen-inner game-over-card">
                <p class="eyebrow">Run Summary</p>
                <h1 class="over-title">Signal Lost</h1>
                <p class="subtitle" id="game-over-message">The city finally caught up. Charge back in and beat your last surge.</p>
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-label">Final Score</span>
                        <span class="stat-val" id="final-score">0</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Distance</span>
                        <span class="stat-val" id="final-distance">0m</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Coins</span>
                        <span class="stat-val" id="final-coins">0</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Best Combo</span>
                        <span class="stat-val" id="final-combo">x1</span>
                    </div>
                </div>
                <div class="game-over-actions">
                    <button class="restart-btn" id="restart-btn">Run Again</button>
                </div>
            </div>
        `;

        this.container.appendChild(gameOver);
        this.elements.gameOver = gameOver;
        document.getElementById('restart-btn').addEventListener('click', () => this.engine.start());
    }

    createPauseScreen() {
        const pause = document.createElement('div');
        pause.id = 'pause-screen';
        pause.className = 'pause-screen hidden';
        pause.innerHTML = `
            <div class="pause-content">
                <h1>Paused</h1>
                <p>Catch your breath. The highway is still glowing.</p>
                <button class="resume-btn" id="resume-btn">Resume</button>
            </div>
        `;

        this.container.appendChild(pause);
        this.elements.pause = pause;
        document.getElementById('resume-btn').addEventListener('click', () => this.engine.pause());
    }

    createFlashBanner() {
        const flash = document.createElement('div');
        flash.id = 'flash-banner';
        flash.className = 'flash-banner hidden';
        this.container.appendChild(flash);
        this.elements.flash = flash;
    }

    showGame() {
        this.elements.startScreen.classList.add('hidden');
        this.elements.gameOver.classList.add('hidden');
        this.elements.pause.classList.add('hidden');
        this.elements.hud.classList.remove('hidden');
    }

    showGameOver(data) {
        this.elements.hud.classList.add('hidden');
        this.elements.pause.classList.add('hidden');
        this.elements.gameOver.classList.remove('hidden');

        document.getElementById('final-score').textContent = data.score.toLocaleString();
        document.getElementById('final-distance').textContent = `${data.distance}m`;
        document.getElementById('final-coins').textContent = String(data.coins);
        document.getElementById('final-combo').textContent = `x${data.comboMultiplier}`;

        const message = document.getElementById('game-over-message');
        if (message) {
            if (data.score > 12000) {
                message.textContent = 'That was elite. The city almost looked slow from where you were.';
            } else if (data.distance > 900) {
                message.textContent = 'You stayed alive deep into the grid. One sharper read and that becomes a legendary run.';
            } else if (data.coins > 140) {
                message.textContent = 'You were flowing. The coin lines were yours before the final mistake.';
            } else {
                message.textContent = 'The city finally caught up. Charge back in and beat your last surge.';
            }
        }
    }

    showPause(isPaused) {
        this.elements.pause.classList.toggle('hidden', !isPaused);
    }

    updateScore(score, coins, combo, distance = 0, speed = 0, district = 'Core Grid') {
        const scoreEl = document.getElementById('score-value');
        const coinsEl = document.getElementById('coins-value');
        const comboEl = document.getElementById('combo-display');
        const distanceEl = document.getElementById('distance-value');
        const speedEl = document.getElementById('speed-value');
        const districtEl = document.getElementById('district-value');

        if (scoreEl) scoreEl.textContent = score.toLocaleString();
        if (coinsEl) coinsEl.textContent = String(coins);
        if (distanceEl) distanceEl.textContent = `${distance}m`;
        if (speedEl) speedEl.textContent = String(speed);
        if (districtEl) districtEl.textContent = district;

        if (comboEl) {
            comboEl.textContent = `x${combo}`;
            comboEl.classList.toggle('active', combo > 1);
            comboEl.classList.toggle('mega', combo >= 4);
        }
    }

    updateLives(lives, maxLives) {
        const container = document.getElementById('lives-display');
        if (!container) {
            return;
        }

        container.innerHTML = '';
        for (let i = 0; i < maxLives; i += 1) {
            const node = document.createElement('span');
            node.className = `life-chip${i < lives ? ' active' : ''}`;
            container.appendChild(node);
        }
    }

    updatePowerUps(active, timers, durations) {
        const container = document.getElementById('powerups-display');
        if (!container) {
            return;
        }

        container.innerHTML = '';
        const meta = {
            magnet: { label: 'Magnet', color: '#a855f7' },
            speed: { label: 'Turbo', color: '#f97316' },
            shield: { label: 'Shield', color: '#22c55e' }
        };

        Object.keys(active).forEach((type) => {
            if (!active[type] || timers[type] <= 0) {
                return;
            }

            const total = durations[type] || 10;
            const percentage = Math.max(0, Math.min(100, (timers[type] / total) * 100));
            const item = document.createElement('div');
            item.className = 'pu-hud-item';
            item.innerHTML = `
                <div class="pu-hud-info">
                    <span class="pu-hud-label">${meta[type]?.label || type}</span>
                    <div class="pu-hud-bar-bg">
                        <div class="pu-hud-bar-fill" style="width:${percentage}%; background:${meta[type]?.color || '#fff'};"></div>
                    </div>
                </div>
                <span class="pu-hud-secs">${Math.ceil(timers[type])}s</span>
            `;
            container.appendChild(item);
        });
    }

    flashMessage(message) {
        if (!this.elements.flash) {
            return;
        }

        clearTimeout(this.flashTimeout);
        this.elements.flash.textContent = message;
        this.elements.flash.classList.remove('hidden');
        this.elements.flash.classList.add('show');

        this.flashTimeout = window.setTimeout(() => {
            this.elements.flash.classList.remove('show');
            this.elements.flash.classList.add('hidden');
        }, 1100);
    }
}
