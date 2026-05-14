document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.querySelector('.grid');
    const scoreDisplay = document.querySelector('#score');
    const bestScoreDisplay = document.querySelector('#best-score');

    let squares = [];
    let score = 0;
    let bestScore = localStorage.getItem('2048-best') || 0;
    const width = 4;
    let isGameOver = false;
    let isHyperMode = false;
    let has2048BeenReached = false;

    // Power-up state
    let pendingPowerUp = null;
    let savedBoardState = null;

    bestScoreDisplay.textContent = bestScore;

    // ====== MILESTONE BONUS CONFIG ======
    const MILESTONE_BONUSES = {
        64:   { points: 200,   label: '+200 COMBO!',   shake: false },
        128:  { points: 500,   label: '+500 COMBO!',   shake: false },
        256:  { points: 1200,  label: '+1,200 COMBO!', shake: false },
        512:  { points: 3000,  label: '+3,000 BONUS!', shake: true  },
        1024: { points: 7000,  label: '+7,000 BONUS!', shake: true  },
        2048: { points: 20000, label: '+20,000 JACKPOT!', shake: true },
    };

    // ====== POWER-UP STATE ======
    const powerUpDefs = {
        undo:    { label: '↩ Undo',    cost: 5,  description: 'Revert last move (5 ZA)' },
        smash:   { label: '💥 Smash',  cost: 10, description: 'Destroy a tile (10 ZA)' },
        gravity: { label: '🔄 Gravity', cost: 15, description: 'Flip board 90° (15 ZA)' },
    };
    let activePowerUp = null;

    // ====== BOMB STATE ======
    let moveCount = 0;
    let bombIndex = -1;
    const BOMB_SPAWN_EVERY = 40;
    const BOMB_FUSE = 5;
    let bombMovesLeft = 0;

    // ====== FREE POWER-UPS (from pre-purchased bundle) ======
    // Populated via PLAYZA_POWERUP_BUNDLE postMessage from React.
    // When free uses remain, usePowerUp executes immediately without
    // a wallet deduction request. Falls back to paid flow when exhausted.
    let freePowerUps = { undo: 0, smash: 0, gravity: 0 };

    // ====== WILD TILE STATE ======
    // Wild tiles are stored as value=1 (never appears naturally)
    const WILD_VALUE = 1;
    const WILD_SPAWN_EVERY = 25; // every N moves, a wild tile may appear
    let wildCount = 0;           // how many wild tiles currently on board
    const MAX_WILDS = 1;

    // ====== RIVAL BANNER STATE ======
    let rivalUsername = null;
    let rivalScore = 0;

    // ====== STREAK & EFFICIENCY STATE ======
    let personalStreak = parseInt(localStorage.getItem('2048-streak') || '0');
    let bestAtGameStart = parseInt(localStorage.getItem('2048-best') || '0');

    // ====== THEME STATE ======
    const THEMES = ['', 'theme-neon', 'theme-gold'];
    const THEME_LABELS = ['🎨 Default', '⚡ Neon', '🥇 Gold'];
    let themeIndex = parseInt(localStorage.getItem('2048-theme') || '0');
    function applyTheme() {
        document.body.classList.remove(...THEMES.filter(t => t));
        if (THEMES[themeIndex]) document.body.classList.add(THEMES[themeIndex]);
        const btn = document.getElementById('theme-btn');
        if (btn) btn.title = `Theme: ${THEME_LABELS[themeIndex]}`;
    }
    function cycleTheme() {
        themeIndex = (themeIndex + 1) % THEMES.length;
        localStorage.setItem('2048-theme', themeIndex);
        applyTheme();
        showBonusText(`${THEME_LABELS[themeIndex]}`, '#a78bfa');
    }
    window.cycleTheme = cycleTheme;
    applyTheme();

    // ====== AUDIO ENGINE (Web Audio API — no external files) ======
    let audioCtx = null;
    let isMuted = localStorage.getItem('2048-muted') === 'true';

    function getAudioCtx() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx;
    }

    function playTone(freq, type, duration, vol = 0.25, delay = 0) {
        if (isMuted) return;
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + duration + 0.05);
        } catch { /* silent fail */ }
    }

    function playMergeSound(tileValue) {
        // Pitch scales with tile: 2=C4, 4=E4, 8=G4, 16=C5, 32=E5... up to 2048
        const semitone = Math.log2(tileValue) * 3;
        const freq = 261.63 * Math.pow(2, semitone / 12); // C4 root
        const clamped = Math.min(Math.max(freq, 200), 2400);
        playTone(clamped, 'sine', 0.18, 0.2);
    }

    function playWildSound() {
        [600, 900, 1200, 800].forEach((f, i) => playTone(f, 'sine', 0.1, 0.15, i * 0.06));
    }

    function playBombSpawnSound() {
        playTone(80,  'sawtooth', 0.3, 0.3);
        playTone(60,  'sawtooth', 0.3, 0.2, 0.1);
    }

    function playBombDefuseSound() {
        [400, 600, 800, 1000].forEach((f, i) => playTone(f, 'sine', 0.1, 0.2, i * 0.05));
    }

    function playBombExplodeSound() {
        playTone(120, 'sawtooth', 0.4, 0.5);
        playTone(80,  'square',   0.5, 0.4, 0.05);
        playTone(60,  'sawtooth', 0.6, 0.3, 0.12);
    }

    function playGravitySound() {
        [500, 400, 300, 200, 150].forEach((f, i) => playTone(f, 'sine', 0.12, 0.15, i * 0.04));
    }

    function playJackpotSound() {
        const notes = [261, 329, 392, 523, 659, 784, 1046];
        notes.forEach((f, i) => playTone(f, 'sine', 0.25, 0.3, i * 0.12));
    }

    function playGameOverSound() {
        [600, 480, 360, 240].forEach((f, i) => playTone(f, 'sine', 0.3, 0.25, i * 0.15));
    }

    function toggleMute() {
        isMuted = !isMuted;
        localStorage.setItem('2048-muted', isMuted);
        const btn = document.getElementById('mute-btn');
        if (btn) btn.textContent = isMuted ? '🔇' : '🔊';
        if (!isMuted) playTone(440, 'sine', 0.1, 0.15); // confirmation beep
    }
    window.toggleMute = toggleMute;
    // Apply saved mute state to button on load
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('mute-btn');
        if (btn && isMuted) btn.textContent = '🔇';
    }, { once: true });

    // ====== BOARD CREATION ======
    function createBoard() {
        gridContainer.innerHTML = '';
        // Re-add overlay
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.id = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="popup">
                <h2 id="overlay-title">GAME OVER</h2>
                <div class="final-score-box">
                    <p>Final Score</p>
                    <span id="overlay-score">0</span>
                </div>
                <p style="color:var(--text-muted); font-size:11px; font-weight:bold; letter-spacing:1px; margin-top:5px; animation: pulse 1.5s infinite;">SYNCING LEADERBOARD...</p>
            </div>`;
        gridContainer.appendChild(overlay);

        squares = [];
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div');
            square.className = 'tile';
            square.dataset.value = 0;
            square.addEventListener('click', onTileClick);
            gridContainer.appendChild(square);
            squares.push(square);
        }
        score = 0;
        isGameOver = false;
        isHyperMode = false;
        has2048BeenReached = false;
        moveCount = 0;
        bombIndex = -1;
        bombMovesLeft = 0;
        wildCount = 0;
        // Snapshot best score at game start so streak can compare at the end
        bestAtGameStart = parseInt(localStorage.getItem('2048-best') || '0');
        exitHyperMode();
        updateScore();
        generate();
        generate();
        updatePowerUpButtons();
        updateRivalBanner();
        renderStreakBadge();
        updateMovesDisplay();
    }

    // ====== TILE CLICK (smash or bomb defuse) ======
    function onTileClick(e) {
        const idx = squares.indexOf(e.currentTarget);
        if (idx === -1) return;

        if (activePowerUp === 'smash') {
            const val = parseInt(squares[idx].dataset.value);
            if (val === 0 || squares[idx].dataset.bomb === 'true') return;
            squares[idx].dataset.value = 0;
            activePowerUp = null;
            gridContainer.classList.remove('smash-mode');
            squares.forEach(s => s.classList.remove('smash-target'));
            updateDisplay([]);
            updatePowerUpButtons();
            showBonusText('💥 TILE SMASHED!', '#e94560');
            return;
        }
    }

    // ====== DISPLAY ======
    function updateDisplay(mergedIndices = [], newIndex = -1) {
        squares.forEach((square, index) => {
            const isBomb = square.dataset.bomb === 'true';
            const isWild = square.dataset.wild === 'true';
            const value = parseInt(square.dataset.value);

            if (isBomb) {
                square.textContent = `💣${bombMovesLeft}`;
                square.className = 'tile tile-bomb';
                return;
            }

            if (isWild) {
                square.textContent = '✨';
                square.className = 'tile tile-wild';
                if (mergedIndices.includes(index)) square.classList.add('tile-merge');
                if (index === newIndex) square.classList.add('tile-new');
                return;
            }

            square.textContent = value === 0 ? '' : value.toLocaleString();
            square.className = 'tile';
            if (value > 0) square.classList.add(`tile-${Math.min(value, 2048)}`);
            if (mergedIndices.includes(index)) {
                square.classList.add('tile-merge');
                // Merge trail particle burst
                spawnMergeTrail(square, value);
                // Merge sound
                playMergeSound(value);
            }
            if (index === newIndex) square.classList.add('tile-new');
            if (activePowerUp === 'smash' && value > 0 && !isWild) square.classList.add('smash-target');
        });
    }

    // ====== MERGE TRAIL ======
    function spawnMergeTrail(el, value) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        // Color based on tile value
        const colors = value >= 1024 ? ['#f5a623','#e94560','#fff']
                     : value >= 128  ? ['#f5a623','#ff9500','#fff']
                     : value >= 32   ? ['#e94560','#ff6b8a','#fff']
                     :                 ['#60a5fa','#7ec8e3','#fff'];
        for (let i = 0; i < 8; i++) {
            const p = document.createElement('div');
            p.className = 'merge-particle';
            const angle = (i / 8) * Math.PI * 2;
            const dist = 18 + Math.random() * 14;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;
            p.style.cssText = `
                left: ${cx - 3}px; top: ${cy - 3}px;
                background: ${colors[i % colors.length]};
                --tx: ${tx}px; --ty: ${ty}px;
                animation-duration: ${0.3 + Math.random() * 0.2}s;
                animation-delay: ${Math.random() * 0.04}s;
            `;
            document.body.appendChild(p);
            p.addEventListener('animationend', () => p.remove(), { once: true });
        }
    }

    // ====== GENERATE (with bomb awareness) ======
    function generate() {
        const emptyIndices = squares
            .map((s, i) => (parseInt(s.dataset.value) === 0 && s.dataset.bomb !== 'true' && s.dataset.wild !== 'true') ? i : -1)
            .filter(i => i !== -1);
        if (emptyIndices.length > 0) {
            const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            squares[randomIndex].dataset.value = Math.random() < 0.9 ? 2 : 4;
            updateDisplay([], randomIndex);
        }
        checkForGameOver();
    }

    // ====== WILD TILE MANAGEMENT ======
    function spawnWild() {
        if (wildCount >= MAX_WILDS) return;
        const emptyIndices = squares
            .map((s, i) => (parseInt(s.dataset.value) === 0 && s.dataset.bomb !== 'true' && s.dataset.wild !== 'true') ? i : -1)
            .filter(i => i !== -1);
        if (emptyIndices.length === 0) return;
        const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        squares[idx].dataset.value = WILD_VALUE;
        squares[idx].dataset.wild = 'true';
        wildCount++;
        playWildSound();
        showBonusText('✨ WILD TILE! Matches anything!', '#fbbf24');
        updateDisplay([], idx);
    }

    // ====== BOMB MANAGEMENT ======
    function spawnBomb() {
        const emptyIndices = squares
            .map((s, i) => (parseInt(s.dataset.value) === 0 && s.dataset.bomb !== 'true') ? i : -1)
            .filter(i => i !== -1);
        if (emptyIndices.length === 0) return;
        bombIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        squares[bombIndex].dataset.bomb = 'true';
        squares[bombIndex].dataset.value = 0;
        bombMovesLeft = BOMB_FUSE;
        playBombSpawnSound();
        showBonusText('💣 BOMB DROPPED! Merge nearby to defuse!', '#e94560');
        shakeBoard();
        updateDisplay([]);
    }

    function tickBomb() {
        if (bombIndex === -1) return;
        bombMovesLeft--;
        if (bombMovesLeft <= 0) {
            explodeBomb();
        } else {
            updateDisplay([]);
        }
    }

    function explodeBomb() {
        if (bombIndex === -1) return;
        // Zero out 3x3 area around bomb
        const row = Math.floor(bombIndex / 4);
        const col = bombIndex % 4;
        const affected = [];
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < 4 && c >= 0 && c < 4) {
                    const i = r * 4 + c;
                    affected.push(i);
                    squares[i].dataset.value = 0;
                    squares[i].dataset.bomb = 'false';
                }
            }
        }
        bombIndex = -1;
        bombMovesLeft = 0;
        playBombExplodeSound();
        shakeBoard();
        showBonusText('💥 BOMB EXPLODED! Tiles cleared!', '#ff4040');
        updateDisplay(affected);
    }

    function defuseBombIfNearby(mergedIndices) {
        if (bombIndex === -1) return;
        const bRow = Math.floor(bombIndex / 4);
        const bCol = bombIndex % 4;
        for (const mi of mergedIndices) {
            const mRow = Math.floor(mi / 4);
            const mCol = mi % 4;
            if (Math.abs(mRow - bRow) <= 1 && Math.abs(mCol - bCol) <= 1) {
                // Defused!
                squares[bombIndex].dataset.bomb = 'false';
                bombIndex = -1;
                bombMovesLeft = 0;
                playBombDefuseSound();
                showBonusText('✅ BOMB DEFUSED! +500 PTS', '#00e5ff');
                score += 500;
                updateScore();
                return;
            }
        }
    }

    // ====== SCORE ======
    function updateScore() {
        scoreDisplay.textContent = score.toLocaleString();
        if (score > bestScore) {
            bestScore = score;
            bestScoreDisplay.textContent = bestScore.toLocaleString();
            localStorage.setItem('2048-best', bestScore);
        }
        updateMovesDisplay();
    }

    // ====== LIVE MOVES DISPLAY ======
    function updateMovesDisplay() {
        const el = document.getElementById('moves-display');
        if (!el) return;
        el.textContent = moveCount.toLocaleString();
    }

    // ====== STREAK BADGE ======
    function renderStreakBadge() {
        let badge = document.getElementById('streak-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'streak-badge';
            badge.className = 'streak-badge';
            const controls = document.querySelector('.controls');
            if (controls) controls.insertAdjacentElement('afterend', badge);
        }
        if (personalStreak <= 0) {
            badge.style.display = 'none';
            return;
        }
        const flames = '🔥'.repeat(Math.min(personalStreak, 5));
        badge.style.display = 'flex';
        badge.innerHTML = `
            <span class="streak-fire">${flames}</span>
            <span class="streak-text"><b>${personalStreak}</b> game streak — Keep beating your best!</span>
        `;
    }

    // ====== PROCESS LINE (Wild-aware) ======
    function processLine(arr, wildFlags) {
        // Pre-pass: replace wild value with the neighbor it would merge with
        let filtered = arr.filter(n => n !== 0);
        let filteredWild = wildFlags ? wildFlags.filter((_, i) => arr[i] !== 0) : filtered.map(() => false);

        // If a wild tile is in the filtered array, make it match its neighbor
        for (let i = 0; i < filtered.length; i++) {
            if (filteredWild[i] && filtered[i + 1] && !filteredWild[i + 1]) {
                filtered[i] = filtered[i + 1];
            } else if (filteredWild[i] && i > 0 && filtered[i - 1] && !filteredWild[i - 1]) {
                filtered[i] = filtered[i - 1];
            }
        }

        let newVals = [];
        let merges = [false, false, false, false];
        let mergedScore = 0;
        let moved = false;
        let milestonesHit = [];

        for (let i = 0; i < filtered.length; i++) {
            if (filtered[i] === filtered[i + 1] && filtered[i] !== 0) {
                const combined = filtered[i] * 2;
                newVals.push(combined);
                mergedScore += combined;
                merges[newVals.length - 1] = true;
                if (MILESTONE_BONUSES[combined]) milestonesHit.push(combined);
                // Wild was consumed, reduce count
                if (filteredWild[i] || filteredWild[i + 1]) wildCount = Math.max(0, wildCount - 1);
                i++;
            } else {
                newVals.push(filtered[i]);
            }
        }

        while (newVals.length < 4) newVals.push(0);
        for (let i = 0; i < 4; i++) if (arr[i] !== newVals[i]) moved = true;

        return { newVals, moved, mergedScore, merges, milestonesHit };
    }

    // ====== TILT GRID ======
    function tiltGrid(direction) {
        if (isGameOver) return;
        if (activePowerUp === 'smash') return; // don't move while smashing
        let hasMoved = false;
        let mergedIndices = [];
        let allMilestones = [];

        // Save board state for undo
        savedBoardState = squares.map(s => s.dataset.value);

        const processDirection = (indices, reverse = false) => {
            let vals = indices.map(idx => parseInt(squares[idx].dataset.value));
            let wilds = indices.map(idx => squares[idx].dataset.wild === 'true');
            if (reverse) { vals.reverse(); wilds.reverse(); }
            const { newVals, moved, mergedScore, merges, milestonesHit } = processLine(vals, wilds);
            const finalVals = reverse ? [...newVals].reverse() : newVals;
            const finalMerges = reverse ? [...merges].reverse() : merges;
            if (moved) hasMoved = true;
            score += mergedScore;
            allMilestones.push(...milestonesHit);
            indices.forEach((idx, j) => {
                squares[idx].dataset.value = finalVals[j];
                // Wild flag follows the value: if the final value at this position
                // is still WILD_VALUE (1), it means the wild tile slid here without
                // merging — so preserve the wild flag. If it merged or is any other
                // value, the wild is consumed and the flag is cleared.
                squares[idx].dataset.wild = String(finalVals[j] === WILD_VALUE);
                if (finalMerges[j]) mergedIndices.push(idx);
            });
        };

        if (direction === 'right' || direction === 'left') {
            for (let i = 0; i < 16; i += 4) {
                processDirection([i, i+1, i+2, i+3], direction === 'right');
            }
        } else {
            for (let i = 0; i < 4; i++) {
                processDirection([i, i+width, i+width*2, i+width*3], direction === 'down');
            }
        }

        if (hasMoved) {
            // Resync wildCount from actual board state (guards against drift)
            wildCount = squares.filter(s => s.dataset.wild === 'true').length;
            moveCount++;

            // Check bomb tick
            if (bombIndex !== -1) {
                defuseBombIfNearby(mergedIndices);
                if (bombIndex !== -1) tickBomb();
            }

            // Spawn bomb every N moves
            if (moveCount % BOMB_SPAWN_EVERY === 0 && bombIndex === -1) {
                setTimeout(spawnBomb, 200);
            }

            // Spawn wild tile every N moves
            if (moveCount % WILD_SPAWN_EVERY === 0 && wildCount < MAX_WILDS) {
                setTimeout(spawnWild, 350);
            }

            // Apply milestone bonuses
            if (allMilestones.length > 0) {
                const highest = Math.max(...allMilestones);
                const bonus = MILESTONE_BONUSES[highest];
                score += bonus.points;
                if (bonus.shake) shakeBoard();
                showBonusText(bonus.label, highest >= 512 ? '#f5a623' : '#e94560');
                if (highest === 2048 && !has2048BeenReached) {
                    has2048BeenReached = true;
                    setTimeout(trigger2048Jackpot, 400);
                }
            }
            updateScore();
            updateRivalBanner();
            updateDisplay(mergedIndices);
            setTimeout(generate, 100);
        }
    }
    window.tiltGrid = tiltGrid;

    // ====== KEYBOARD ======
    function control(e) {
        if (e.key === 'ArrowLeft')  tiltGrid('left');
        else if (e.key === 'ArrowRight') tiltGrid('right');
        else if (e.key === 'ArrowUp')   tiltGrid('up');
        else if (e.key === 'ArrowDown') tiltGrid('down');
        else if (e.key === 'Escape' && activePowerUp) cancelPowerUp();
    }
    document.addEventListener('keydown', control);

    // ====== TOUCH ======
    let touchStartX = 0, touchStartY = 0;
    gridContainer.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    gridContainer.addEventListener('touchend', e => {
        if (!touchStartX || !touchStartY) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > 30) tiltGrid(dx > 0 ? 'right' : 'left');
        } else {
            if (Math.abs(dy) > 30) tiltGrid(dy > 0 ? 'down' : 'up');
        }
        touchStartX = 0; touchStartY = 0;
    }, { passive: true });

    // ====== GAME OVER CHECK ======
    function checkForGameOver() {
        const canMove = () => {
            if (squares.some(s => parseInt(s.dataset.value) === 0)) return true;
            for (let i = 0; i < 16; i += 4)
                for (let j = 0; j < 3; j++)
                    if (squares[i+j].dataset.value === squares[i+j+1].dataset.value) return true;
            for (let i = 0; i < 4; i++)
                for (let j = 0; j < 3; j++)
                    if (squares[i+j*width].dataset.value === squares[i+(j+1)*width].dataset.value) return true;
            return false;
        };

        if (!canMove()) {
            isGameOver = true;
            document.removeEventListener('keydown', control);

            // --- Efficiency Rating ---
            const efficiency = moveCount > 0 ? Math.round(score / moveCount) : 0;

            // --- Streak Update ---
            const beatPersonalBest = score > bestAtGameStart;
            if (beatPersonalBest) {
                personalStreak++;
            } else {
                personalStreak = 0;
            }
            localStorage.setItem('2048-streak', personalStreak);

            // ====================================================
            // EFFICIENCY BONUS — boosts the submitted score
            // The bonus is applied BEFORE submission so the ranked
            // leaderboard score already reflects play quality.
            // A player who scores 50,000 with Grade S submits 55,000.
            // A player who scores 50,000 with Grade D submits 50,000.
            // This rewards smart, efficient play over lucky button mashing.
            // ====================================================
            let grade, gradeColor, bonusPct, bonusLabel;
            if (efficiency >= 150)      { grade = 'S — Legendary';  gradeColor = '#f5a623'; bonusPct = 0.10; bonusLabel = '+10% Efficiency Bonus'; }
            else if (efficiency >= 100) { grade = 'A — Excellent';  gradeColor = '#22c55e'; bonusPct = 0.07; bonusLabel = '+7% Efficiency Bonus'; }
            else if (efficiency >= 60)  { grade = 'B — Good';       gradeColor = '#38bdf8'; bonusPct = 0.05; bonusLabel = '+5% Efficiency Bonus'; }
            else if (efficiency >= 30)  { grade = 'C — Average';    gradeColor = '#94a3b8'; bonusPct = 0.02; bonusLabel = '+2% Efficiency Bonus'; }
            else                        { grade = 'D — Keep Going!'; gradeColor = '#e94560'; bonusPct = 0.00; bonusLabel = 'No Bonus (improve efficiency!)'; }

            const efficiencyBonus = Math.round(score * bonusPct);
            const finalScore = score + efficiencyBonus;

            // --- Update Overlay ---
            const overlay = document.getElementById('game-over-overlay');
            if (overlay) {
                const streakLine = beatPersonalBest
                    ? `<p class="overlay-streak overlay-streak-win">🔥 NEW STREAK: ${personalStreak} game${personalStreak !== 1 ? 's' : ''} in a row!</p>`
                    : (personalStreak === 0 && bestAtGameStart > 0 ? `<p class="overlay-streak overlay-streak-break">💔 Streak reset — come back stronger!</p>` : '');

                const bonusRow = efficiencyBonus > 0
                    ? `<div class="overlay-bonus-row">
                           <span>Base Score</span><span>${score.toLocaleString()}</span>
                       </div>
                       <div class="overlay-bonus-row overlay-bonus-highlight">
                           <span>⚡ ${bonusLabel}</span><span style="color:${gradeColor}">+${efficiencyBonus.toLocaleString()}</span>
                       </div>
                       <div class="overlay-bonus-row overlay-bonus-total">
                           <span>🏆 Ranked Score</span><span>${finalScore.toLocaleString()}</span>
                       </div>`
                    : `<div class="overlay-bonus-row overlay-bonus-nudge">
                           <span style="color:${gradeColor}">Tip: More merges per move = bonus score!</span>
                       </div>`;

                overlay.innerHTML = `
                    <div class="modal">
                        <p class="kicker">2048</p>
                        <h3 id="overlay-title">${isHyperMode ? '⚡ HYPER END' : 'Game Over'}</h3>
                        <div class="stat-card">
                            <div class="stat-row highlight-row" style="animation-delay:0ms">
                                <span class="stat-label">Ranked Score</span>
                                <span class="stat-value">${finalScore.toLocaleString()}</span>
                            </div>
                            <div class="stat-row" style="animation-delay:60ms">
                                <span class="stat-label">Raw Score</span>
                                <span class="stat-value">${score.toLocaleString()}</span>
                            </div>
                            <div class="stat-row" style="animation-delay:120ms">
                                <span class="stat-label">Total Moves</span>
                                <span class="stat-value">${moveCount.toLocaleString()}</span>
                            </div>
                            <div class="stat-row" style="animation-delay:180ms">
                                <span class="stat-label">Efficiency</span>
                                <span class="stat-value" style="color:${gradeColor}">${efficiency.toLocaleString()} pts/mv</span>
                            </div>
                            <div class="stat-row" style="animation-delay:240ms">
                                <span class="stat-label">Grade</span>
                                <span class="stat-value" style="color:${gradeColor}">${grade}</span>
                            </div>
                        </div>
                        <div class="overlay-bonus-breakdown" style="margin-top:14px">
                            ${bonusRow}
                        </div>
                        <div style="margin-top: 10px; text-align: center;">
                            ${streakLine}
                        </div>
                        <p style="color:var(--text-muted); font-size:11px; font-weight:bold; letter-spacing:1px; margin-top:16px; text-align:center; animation: pulse 1.5s infinite;">SYNCING LEADERBOARD...</p>
                    </div>`;
                overlay.style.display = 'flex';
            }

            // Re-render streak badge for next game preview
            renderStreakBadge();
            playGameOverSound();

            if (window.parent !== window) {
                setTimeout(() => {
                    window.parent.postMessage({
                        type: 'PLAYZA_SCORE_SUBMISSION',
                        payload: {
                            game_id: '2048game',
                            session_id: new URLSearchParams(window.location.search).get('session_id'),
                            // finalScore is the boosted score submitted to the leaderboard.
                            // It includes the raw game score + efficiency bonus earned by the player.
                            score: finalScore,
                            metadata: {
                                category: 'Puzzle',
                                hyperMode: isHyperMode,
                                rawScore: score,
                                efficiencyBonus: efficiencyBonus,
                                moveCount: moveCount,
                                efficiency: efficiency,
                                grade: grade,
                                beatPersonalBest: beatPersonalBest,
                            }
                        }
                    }, window.location.origin);
                }, 2500);
            }
        }
    }

    // ====== HYPER-MODE & 2048 JACKPOT ======
    function trigger2048Jackpot() {
        launchConfetti();
        playJackpotSound();
        showBonusText('🏆 2048 REACHED! JACKPOT!', '#f5a623');
        setTimeout(() => {
            enterHyperMode();
        }, 1800);
    }

    function enterHyperMode() {
        isHyperMode = true;
        document.body.classList.add('hyper-mode');
        gridContainer.classList.add('hyper-grid');
        const resultText = document.getElementById('result-text');
        if (resultText) resultText.innerHTML = '⚡ <b>HYPER MODE</b> — Keep pushing for a bigger score!';
    }

    function exitHyperMode() {
        isHyperMode = false;
        document.body.classList.remove('hyper-mode');
        gridContainer.classList.remove('hyper-grid');
    }

    // ====== CONFETTI ======
    function launchConfetti() {
        const colors = ['#f5a623', '#e94560', '#00e5ff', '#7fff00', '#ff69b4', '#fff'];
        for (let i = 0; i < 120; i++) {
            const el = document.createElement('div');
            el.className = 'confetti-piece';
            el.style.cssText = `
                left: ${Math.random() * 100}vw;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                animation-duration: ${1.2 + Math.random() * 2}s;
                animation-delay: ${Math.random() * 0.6}s;
                width: ${6 + Math.random() * 8}px;
                height: ${6 + Math.random() * 8}px;
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            `;
            document.body.appendChild(el);
            el.addEventListener('animationend', () => el.remove());
        }
    }

    // ====== BONUS TEXT POPUP ======
    function showBonusText(label, color = '#f5a623') {
        const el = document.createElement('div');
        el.className = 'bonus-popup';
        el.textContent = label;
        el.style.color = color;
        document.querySelector('.game-wrapper').appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }

    // ====== BOARD SHAKE ======
    function shakeBoard() {
        gridContainer.classList.add('shake');
        gridContainer.addEventListener('animationend', () => gridContainer.classList.remove('shake'), { once: true });
    }

    // ====== POWER-UPS ======
    function usePowerUp(type) {
        if (isGameOver) return;

        // ── FREE USE (from pre-purchased bundle) ──
        if (freePowerUps[type] > 0) {
            freePowerUps[type]--;
            updatePowerUpButtons();
            showBonusText(`✅ FREE ${powerUpDefs[type].label}!`, '#22c55e');
            executePowerUp(type);
            return;
        }

        // ── PAID USE — Ask React/parent to deduct wallet ──
        if (window.parent !== window) {
            pendingPowerUp = type;
            window.parent.postMessage({
                type: 'PLAYZA_POWERUP_REQUEST',
                payload: {
                    powerUp: type,
                    cost: powerUpDefs[type].cost,
                    label: powerUpDefs[type].label
                }
            }, window.location.origin);
            document.querySelectorAll('.powerup-btn').forEach(b => {
                b.disabled = true;
                b.style.opacity = '0.5';
            });
            showBonusText('⏳ Confirming...', '#aaa');
        } else {
            executePowerUp(type);
        }
    }
    window.usePowerUp = usePowerUp;


    // React sends a response back via postMessage
    window.addEventListener('message', (event) => {
        const { type, payload } = event.data || {};

        if (type === 'PLAYZA_POWERUP_APPROVED') {
            executePowerUp(pendingPowerUp);
            pendingPowerUp = null;
            updatePowerUpButtons();
        }
        if (type === 'PLAYZA_POWERUP_DENIED') {
            showBonusText('❌ Insufficient Balance', '#e94560');
            pendingPowerUp = null;
            updatePowerUpButtons();
        }
        // Receive pre-purchased bundle from React (after LiveEntryModal pack selection)
        if (type === 'PLAYZA_POWERUP_BUNDLE') {
            const grants = payload || {};
            freePowerUps.undo    = (grants.undo    || 0);
            freePowerUps.smash   = (grants.smash   || 0);
            freePowerUps.gravity = (grants.gravity || 0);
            updatePowerUpButtons();
            const total = freePowerUps.undo + freePowerUps.smash + freePowerUps.gravity;
            showBonusText(`🏆 Power Pack loaded! ${total} free uses`, '#f5a623');
        }
    });

    function executePowerUp(type) {
        if (type === 'undo') {
            if (!savedBoardState) {
                showBonusText('Nothing to undo!', '#e94560');
                return;
            }
            savedBoardState.forEach((val, i) => {
                squares[i].dataset.value = val;
                squares[i].dataset.bomb = 'false';
            });
            savedBoardState = null;
            updateDisplay([]);
            showBonusText('↩ Move Undone!', '#00e5ff');
        } else if (type === 'smash') {
            activePowerUp = 'smash';
            gridContainer.classList.add('smash-mode');
            updateDisplay([]);
            showBonusText('👆 Tap a tile to smash it!', '#e94560');
        } else if (type === 'gravity') {
            playGravitySound();
            executeGravityShift();
        }
    }

    // Rotate board 90° clockwise: row r, col c → row c, col (3-r)
    function executeGravityShift() {
        const vals = squares.map(s => s.dataset.value);
        const bombs = squares.map(s => s.dataset.bomb);
        const wilds = squares.map(s => s.dataset.wild || 'false');
        const rotated = Array(16).fill(0);
        const rotatedBombs = Array(16).fill('false');
        const rotatedWilds = Array(16).fill('false');

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const from = r * 4 + c;
                const to = c * 4 + (3 - r);
                rotated[to] = vals[from];
                rotatedBombs[to] = bombs[from];
                rotatedWilds[to] = wilds[from];
            }
        }

        rotated.forEach((v, i) => {
            squares[i].dataset.value = v;
            squares[i].dataset.bomb = rotatedBombs[i];
            squares[i].dataset.wild = rotatedWilds[i];
        });

        // Recalculate bomb index after rotation
        bombIndex = rotatedBombs.indexOf('true');

        // Visual gravity effect — briefly tilt the grid
        gridContainer.classList.add('gravity-spin');
        gridContainer.addEventListener('animationend', () => {
            gridContainer.classList.remove('gravity-spin');
        }, { once: true });

        showBonusText('🔄 GRAVITY SHIFTED!', '#c084fc');
        updateDisplay([]);
    }

    function cancelPowerUp() {
        activePowerUp = null;
        gridContainer.classList.remove('smash-mode');
        squares.forEach(s => s.classList.remove('smash-target'));
        updateDisplay([]);
        updatePowerUpButtons();
    }

    function updatePowerUpButtons() {
        document.querySelectorAll('.powerup-btn').forEach(b => {
            b.disabled = false;
            b.style.opacity = '1';
        });
        // Show FREE badge on buttons that have bundle uses remaining
        ['undo', 'smash', 'gravity'].forEach(type => {
            const btn = document.querySelector(`[onclick="usePowerUp('${type}')"]`);
            if (!btn) return;
            const costEl = btn.querySelector('.powerup-cost');
            if (!costEl) return;
            const free = freePowerUps[type] || 0;
            if (free > 0) {
                costEl.innerHTML = `<span style="color:#22c55e;font-weight:900">\u00d7${free} FREE</span>`;
            } else {
                costEl.textContent = `Buy`;
            }
        });
    }

    // ====== RIVAL BANNER ======
    function updateRivalBanner() {
        let banner = document.getElementById('rival-banner');
        if (!rivalUsername) {
            if (banner) banner.style.display = 'none';
            return;
        }
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'rival-banner';
            banner.className = 'rival-banner';
            document.querySelector('.game-wrapper').insertBefore(banner, gridContainer.parentElement || gridContainer);
        }
        const isBeating = score > rivalScore;
        banner.innerHTML = `
            <span class="rival-dot"></span>
            <span class="rival-label">${isBeating ? '🟢 YOU\'RE WINNING' : '🔴 LEADER'}: <b>${rivalUsername}</b></span>
            <span class="rival-score">${rivalScore.toLocaleString()} pts</span>
        `;
        banner.className = `rival-banner ${isBeating ? 'rival-winning' : ''}`;
        banner.style.display = 'flex';
    }

    // Add rival update to existing message listener
    window.addEventListener('message', (event) => {
        const { type, payload } = event.data || {};
        if (type === 'PLAYZA_RIVAL_UPDATE') {
            rivalUsername = payload?.username || null;
            rivalScore = payload?.score || 0;
            updateRivalBanner();
        }
    });

    // ====== INIT ======
    createBoard();
});
