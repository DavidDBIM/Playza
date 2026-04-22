/**
 * Memory Rush – game.js
 * Full frontend game. No backend, no wallet, no AI.
 * Backend-ready hooks: session_id, pattern_seed, user_input_log, timing, accuracy.
 */

// ─── Tile Definitions ────────────────────────────────────────────────────────

const COLORS = [
    { id: 'red',    emoji: '🔴', bg: '#7f1d1d', border: '#ef4444', glow: 'rgba(239,68,68,0.45)'   },
    { id: 'blue',   emoji: '🔵', bg: '#1e3a8a', border: '#3b82f6', glow: 'rgba(59,130,246,0.45)'  },
    { id: 'green',  emoji: '🟢', bg: '#14532d', border: '#22c55e', glow: 'rgba(34,197,94,0.45)'   },
    { id: 'yellow', emoji: '🟡', bg: '#78350f', border: '#fbbf24', glow: 'rgba(251,191,36,0.45)'  },
    { id: 'purple', emoji: '🟣', bg: '#4c1d95', border: '#a855f7', glow: 'rgba(168,85,247,0.45)'  },
    { id: 'orange', emoji: '🟠', bg: '#7c2d12', border: '#f97316', glow: 'rgba(249,115,22,0.45)'  },
];

const SHAPES = [
    { id: 'circle',   emoji: '⭕', bg: '#164e63', border: '#06b6d4', glow: 'rgba(6,182,212,0.45)'   },
    { id: 'triangle', emoji: '🔺', bg: '#431407', border: '#fb923c', glow: 'rgba(251,146,60,0.45)'  },
    { id: 'square',   emoji: '🟦', bg: '#1e3a8a', border: '#60a5fa', glow: 'rgba(96,165,250,0.45)'  },
    { id: 'diamond',  emoji: '🔷', bg: '#0c4a6e', border: '#38bdf8', glow: 'rgba(56,189,248,0.45)'  },
    { id: 'star',     emoji: '⭐', bg: '#713f12', border: '#facc15', glow: 'rgba(250,204,21,0.45)'  },
    { id: 'heart',    emoji: '❤️', bg: '#881337', border: '#fb7185', glow: 'rgba(251,113,133,0.45)' },
];

// ─── Difficulty Config ────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG = {
    easy: {
        label: 'Easy',
        startLength: 3,
        maxLength: 7,
        displayTime: (len) => 3000 + len * 300,    // ms the pattern is shown
        recallTime:  (len) => 20000,                // ms to recall
        maxMistakes: 3,
        patternType: 'color',
        distractors: 0,
    },
    medium: {
        label: 'Medium',
        startLength: 4,
        maxLength: 9,
        displayTime: (len) => 2000 + len * 200,
        recallTime:  (len) => 15000,
        maxMistakes: 2,
        patternType: 'mixed',
        distractors: 2,
    },
    hard: {
        label: 'Hard',
        startLength: 5,
        maxLength: 12,
        displayTime: (len) => 1200 + len * 120,
        recallTime:  (len) => 10000,
        maxMistakes: 1,
        patternType: 'shape',
        distractors: 3,
    },
};

// ─── Game State ───────────────────────────────────────────────────────────────

const G = {
    phase: 'idle',       // idle | memorize | recall | result | gameover
    difficulty: 'easy',
    round: 1,
    score: 0,
    streak: 0,
    bestStreak: 0,
    lives: 3,
    maxLives: 3,
    multiplier: 1.0,
    pattern: [],          // array of tile defs for current round
    playerSequence: [],   // player's taps so far
    mistakes: 0,
    recallStartTime: 0,
    recallElapsed: 0,
    timerInterval: null,
    progressInterval: null,
    soundEnabled: true,
    // Backend-ready session data
    session: {
        id: crypto.randomUUID(),
        seed: null,
        inputLog: [],
        timingData: [],
        accuracy: 0,
    },
};

// ─── DOM References ───────────────────────────────────────────────────────────

const $ = (id) => document.getElementById(id);

const DOM = {
    statRound:    $('statRound'),
    statScore:    $('statScore'),
    statStreak:   $('statStreak'),
    streakFire:   $('streakFire'),
    streakChip:   document.querySelector('.streak-chip'),
    statTimer:    $('statTimer'),
    statMulti:    $('statMultiplier'),
    phaseLabel:   $('phaseLabel'),
    phaseFill:    $('phaseProgressFill'),
    patternGrid:  $('patternGrid'),
    patternArena: $('patternArena'),
    recallPrompt: $('recallPrompt'),
    inputSeq:     $('inputSequence'),
    tileGrid:     $('tileGrid'),
    btnUndo:      $('btnUndo'),
    btnClear:     $('btnClear'),
    btnSubmit:    $('btnSubmit'),
    diffRow:      $('difficultyRow'),
    overlayStart: $('overlayStart'),
    overlayResult:  $('overlayResult'),
    overlayGameOver:$('overlayGameOver'),
    overlayHelp:  $('overlayHelp'),
    toast:        $('toast'),
    btnSound:     $('btnSound'),
    btnHelp:      $('btnHelp'),
};

// ─── Pattern Generator ────────────────────────────────────────────────────────

function buildTilePool(type) {
    if (type === 'color')  return [...COLORS];
    if (type === 'shape')  return [...SHAPES];
    // mixed
    return [...COLORS.slice(0, 4), ...SHAPES.slice(0, 4)];
}

function generatePattern(length, type) {
    const pool = buildTilePool(type);
    // Allow repeats but avoid 3+ in a row of same id
    const pattern = [];
    for (let i = 0; i < length; i++) {
        let tile;
        let attempts = 0;
        do {
            tile = pool[Math.floor(Math.random() * pool.length)];
            attempts++;
        } while (
            attempts < 10 &&
            pattern.length >= 2 &&
            pattern.at(-1).id === tile.id &&
            pattern.at(-2).id === tile.id
        );
        pattern.push(tile);
    }
    return pattern;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function showToast(msg, type = '', duration = 1800) {
    const t = DOM.toast;
    t.textContent = msg;
    t.className = `toast ${type}`;
    clearTimeout(t._hide);
    t._hide = setTimeout(() => { t.className = 'toast hidden'; }, duration);
}

function playTone(freq, dur = 120, type = 'sine') {
    if (!G.soundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur / 1000);
        osc.start();
        osc.stop(ctx.currentTime + dur / 1000);
    } catch (_) {}
}

function playCorrect() { playTone(660, 90); }
function playWrong()   { playTone(180, 200, 'square'); }
function playSuccess() { playTone(880, 80); setTimeout(() => playTone(1100, 100), 100); }
function playFail()    { playTone(200, 300, 'sawtooth'); }
function playReveal()  { playTone(440, 60, 'triangle'); }

// ─── HUD Updater ──────────────────────────────────────────────────────────────

function updateHUD() {
    DOM.statRound.textContent  = G.round;
    DOM.statScore.textContent  = G.score.toLocaleString();
    DOM.statStreak.textContent = G.streak;
    DOM.statMulti.textContent  = `×${G.multiplier.toFixed(1)}`;
    DOM.streakChip.classList.toggle('active', G.streak >= 3);
}

function setPhaseLabel(text, color = '') {
    DOM.phaseLabel.textContent = text;
    DOM.phaseLabel.style.color  = color || '';
    DOM.phaseLabel.style.borderColor = color ? color + '55' : '';
    DOM.phaseLabel.style.backgroundColor = color ? color + '12' : '';
}

// ─── Lives renderer ──────────────────────────────────────────────────────────

function renderLives() {
    let bar = document.getElementById('livesBar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'livesBar';
        bar.className = 'lives-bar';
        DOM.phaseFill.parentElement.parentElement.appendChild(bar);
    }
    bar.innerHTML = Array.from({ length: G.maxLives }, (_, i) =>
        `<div class="life-dot ${i >= G.lives ? 'lost' : ''}"></div>`
    ).join('');
}

// ─── Pattern Display ──────────────────────────────────────────────────────────

function renderPattern(tiles, visible) {
    DOM.patternGrid.innerHTML = '';
    DOM.recallPrompt.classList.add('hidden');

    tiles.forEach((tile, i) => {
        const el = document.createElement('div');
        el.className = 'ptile hidden-tile';
        el.textContent = tile.emoji;
        el.style.background   = tile.bg;
        el.style.borderColor  = tile.border;
        el.style.setProperty('--tile-glow', tile.glow);
        el.setAttribute('aria-label', tile.id);
        DOM.patternGrid.appendChild(el);

        if (visible) {
            // Sequential flash reveal
            setTimeout(() => {
                el.classList.remove('hidden-tile');
                el.classList.add('reveal-tile', 'flash-tile');
                playReveal();
                setTimeout(() => el.classList.remove('flash-tile'), 320);
            }, i * 180);
        }
    });
}

function hidePattern() {
    DOM.patternGrid.querySelectorAll('.ptile').forEach((el) => {
        el.classList.add('hidden-tile');
        el.classList.remove('reveal-tile');
    });
    setTimeout(() => {
        DOM.patternGrid.innerHTML = '';
        DOM.recallPrompt.classList.remove('hidden');
    }, 280);
}

// ─── Tile Grid (input) ────────────────────────────────────────────────────────

function buildTileGrid(pool, distractorCount = 0) {
    const cfg = DIFFICULTY_CONFIG[G.difficulty];

    // The grid must always include all unique tiles from the pattern
    const patternIds = new Set(G.pattern.map((t) => t.id));
    const inPattern  = pool.filter((t) => patternIds.has(t.id));
    const extras     = shuffle(pool.filter((t) => !patternIds.has(t.id)));
    const distractors = extras.slice(0, distractorCount);

    const gridTiles = shuffle([...inPattern, ...distractors]);

    DOM.tileGrid.innerHTML = '';
    gridTiles.forEach((tile) => {
        const btn = document.createElement('button');
        btn.className = 'itile';
        btn.type = 'button';
        btn.textContent = tile.emoji;
        btn.style.background  = tile.bg;
        btn.style.borderColor = tile.border;
        btn.style.setProperty('--tile-glow', tile.glow);
        btn.setAttribute('aria-label', `Select ${tile.id}`);
        btn.dataset.tileId = tile.id;

        if (distractors.includes(tile)) {
            const badge = document.createElement('span');
            badge.className = 'distractor-badge';
            btn.appendChild(badge);
        }

        btn.addEventListener('click', () => onTileTap(tile, btn));
        DOM.tileGrid.appendChild(btn);
    });
}

function setGridEnabled(enabled) {
    DOM.tileGrid.querySelectorAll('.itile').forEach((btn) => {
        btn.classList.toggle('disabled', !enabled);
        btn.disabled = !enabled;
    });
}

// ─── Player Sequence Rendering ────────────────────────────────────────────────

function renderSequence() {
    DOM.inputSeq.innerHTML = '';
    G.playerSequence.forEach((tile) => {
        const slot = document.createElement('div');
        slot.className = 'seq-slot';
        slot.textContent = tile.emoji;
        slot.style.background   = tile.bg;
        slot.style.borderColor  = tile.border;
        DOM.inputSeq.appendChild(slot);
    });

    const remaining = G.pattern.length - G.playerSequence.length;
    // Placeholder dots
    for (let i = 0; i < remaining; i++) {
        const dot = document.createElement('div');
        dot.className = 'seq-slot';
        dot.style.background  = 'rgba(99,179,237,0.05)';
        dot.style.borderColor = 'rgba(99,179,237,0.15)';
        dot.style.borderStyle = 'dashed';
        DOM.inputSeq.appendChild(dot);
    }
}

// ─── Tap Handler ──────────────────────────────────────────────────────────────

function onTileTap(tile, btn) {
    if (G.phase !== 'recall') return;

    const idx      = G.playerSequence.length;
    const expected = G.pattern[idx];
    const correct  = expected && expected.id === tile.id;

    // Animate press
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 250);

    // Log for backend hook
    G.session.inputLog.push({ idx, tileId: tile.id, correct, t: Date.now() });

    if (correct) {
        G.playerSequence.push(tile);
        playCorrect();
        renderSequence();
        // Mark last seq slot green
        const slots = DOM.inputSeq.querySelectorAll('.seq-slot');
        if (slots[idx]) slots[idx].classList.add('correct');

        if (G.playerSequence.length === G.pattern.length) {
            // Complete!
            onRoundSuccess();
        }
    } else {
        G.mistakes++;
        playWrong();

        // Flash red on tile button
        btn.style.boxShadow = `0 0 18px var(--red-glow, rgba(239,68,68,0.5))`;
        btn.style.borderColor = '#ef4444';
        setTimeout(() => {
            btn.style.boxShadow = '';
            btn.style.borderColor = tile.border;
        }, 380);

        // Shake last seq slot
        const slots = DOM.inputSeq.querySelectorAll('.seq-slot');
        if (slots[idx]) slots[idx].classList.add('wrong');

        const cfg = DIFFICULTY_CONFIG[G.difficulty];
        if (G.mistakes >= cfg.maxMistakes) {
            onRoundFail('Too many mistakes');
        } else {
            // Reset player sequence but keep going
            setTimeout(() => {
                G.playerSequence = [];
                renderSequence();
                showToast(`Mistake! ${cfg.maxMistakes - G.mistakes} left`, 'error', 1200);
            }, 400);
        }
    }

    // Enable/disable controls
    const hasInput = G.playerSequence.length > 0;
    DOM.btnUndo.disabled  = !hasInput;
    DOM.btnClear.disabled = !hasInput;
    DOM.btnSubmit.disabled = G.playerSequence.length < G.pattern.length;
}

// ─── Timer ────────────────────────────────────────────────────────────────────

function startRecallTimer(totalMs) {
    clearInterval(G.timerInterval);
    clearInterval(G.progressInterval);

    const end = Date.now() + totalMs;
    G.recallStartTime = Date.now();

    G.timerInterval = setInterval(() => {
        const remaining = Math.max(0, end - Date.now());
        const secs = (remaining / 1000).toFixed(1);
        DOM.statTimer.textContent = secs + 's';

        if (remaining <= 3000) {
            DOM.statTimer.style.color = '#ef4444';
        }

        if (remaining <= 0) {
            clearInterval(G.timerInterval);
            if (G.phase === 'recall') onRoundFail('Time expired');
        }
    }, 100);

    // Shrink progress bar from 100% to 0%
    G.progressInterval = setInterval(() => {
        const pct = Math.max(0, ((end - Date.now()) / totalMs) * 100);
        DOM.phaseFill.style.width = pct + '%';
    }, 50);
}

function stopTimer() {
    clearInterval(G.timerInterval);
    clearInterval(G.progressInterval);
    DOM.statTimer.textContent  = '—';
    DOM.statTimer.style.color  = '';
    DOM.phaseFill.style.width  = '100%';
}

// ─── Round Lifecycle ──────────────────────────────────────────────────────────

function beginRound() {
    const cfg = DIFFICULTY_CONFIG[G.difficulty];
    const patternLen = Math.min(
        cfg.startLength + G.round - 1,
        cfg.maxLength
    );

    G.phase          = 'memorize';
    G.playerSequence = [];
    G.mistakes       = 0;
    G.session.seed   = `${G.session.id}-r${G.round}`;
    G.session.inputLog   = [];
    G.session.timingData = [];
    G.pattern = generatePattern(patternLen, resolvePatternType());

    updateHUD();
    renderLives();
    setPhaseLabel('MEMORIZE', '#38bdf8');
    DOM.phaseFill.style.width = '100%';
    DOM.btnUndo.disabled   = true;
    DOM.btnClear.disabled  = true;
    DOM.btnSubmit.disabled = true;
    setGridEnabled(false);

    // Show pattern
    renderPattern(G.pattern, true);
    DOM.recallPrompt.classList.add('hidden');
    DOM.inputSeq.innerHTML = '';

    // Build tile grid while pattern is showing (player can't tap)
    const pool = buildTilePool(resolvePatternType());
    buildTileGrid(pool, cfg.distractors);

    const displayMs = cfg.displayTime(patternLen);

    // Countdown in phase bar
    let elapsed = 0;
    G.progressInterval = setInterval(() => {
        elapsed += 50;
        DOM.phaseFill.style.width = (100 - (elapsed / displayMs) * 100) + '%';
    }, 50);

    setTimeout(() => {
        clearInterval(G.progressInterval);
        transitionToRecall();
    }, displayMs);
}

function resolvePatternType() {
    const cfg = DIFFICULTY_CONFIG[G.difficulty];
    if (cfg.patternType !== 'mixed') return cfg.patternType;
    // Randomly alternate as rounds progress
    return G.round % 2 === 0 ? 'shape' : 'color';
}

function transitionToRecall() {
    G.phase = 'recall';
    hidePattern();
    setPhaseLabel('RECALL', '#a855f7');
    setGridEnabled(true);
    renderSequence();

    const cfg = DIFFICULTY_CONFIG[G.difficulty];
    const recallMs = cfg.recallTime(G.pattern.length);
    startRecallTimer(recallMs);
}

function onRoundSuccess() {
    G.phase = 'result';
    stopTimer();
    setGridEnabled(false);
    playSuccess();

    G.streak++;
    if (G.streak > G.bestStreak) G.bestStreak = G.streak;

    const elapsed    = (Date.now() - G.recallStartTime) / 1000;
    const accuracy   = ((G.pattern.length - G.mistakes) / G.pattern.length * 100).toFixed(0);
    const multiplier = calcMultiplier();
    const roundPts   = Math.round((G.pattern.length * 100 + (G.streak * 50)) * multiplier);

    G.score      += roundPts;
    G.multiplier  = multiplier;
    G.session.accuracy = accuracy;
    G.session.timingData.push({ round: G.round, elapsed, accuracy, multiplier });

    // Tier
    const tier = accuracy == 100 && G.mistakes === 0 && elapsed < 5 ? 'S'
               : accuracy == 100 ? 'A'
               : accuracy >= 70  ? 'B'
               : 'C';

    updateHUD();
    showResultPanel(tier, accuracy, elapsed, roundPts, multiplier);
}

function onRoundFail(reason) {
    G.phase = 'result';
    stopTimer();
    setGridEnabled(false);
    playFail();

    G.lives--;
    G.streak = 0;
    G.multiplier = Math.max(1.0, G.multiplier - 0.2);

    updateHUD();
    renderLives();
    setPhaseLabel('FAILED', '#ef4444');

    if (G.lives <= 0) {
        setTimeout(showGameOver, 900);
    } else {
        showToast(`${reason}! ${G.lives} ${G.lives === 1 ? 'life' : 'lives'} left`, 'error', 2000);
        setTimeout(beginRound, 2200);
    }
}

function calcMultiplier() {
    const base  = 1.2;
    const bonus = Math.min(G.streak * 0.1, 0.8);
    return Math.min(parseFloat((base + bonus).toFixed(1)), 2.0);
}

// ─── Result Panel ─────────────────────────────────────────────────────────────

function showResultPanel(tier, accuracy, elapsed, roundPts, multiplier) {
    setPhaseLabel('ROUND COMPLETE', '#22c55e');

    const badge = $('tierBadge');
    badge.textContent = tier;
    badge.className = `tier-badge grade-${tier.toLowerCase()}`;

    $('resultTitle').textContent  = tier === 'S' ? 'Perfect Recall! 🏆'
                                  : tier === 'A' ? 'Excellent! 🎉'
                                  : tier === 'B' ? 'Good job!'
                                  : 'Pattern Recalled';

    $('resAccuracy').textContent  = accuracy + '%';
    $('resTime').textContent      = elapsed.toFixed(1) + 's';
    $('resLength').textContent    = G.pattern.length;
    $('resRoundScore').textContent = '+' + roundPts.toLocaleString();
    $('mpValue').textContent      = `×${multiplier.toFixed(1)}`;

    // Multiplier bar: map 1.2–2.0 to 0–100%
    const pct = ((multiplier - 1.2) / 0.8) * 100;
    setTimeout(() => { $('mpFill').style.width = pct + '%'; }, 100);

    DOM.overlayResult.classList.remove('hidden');
}

function showGameOver() {
    G.phase = 'gameover';
    playFail();

    $('goScore').textContent  = G.score.toLocaleString();
    $('goRounds').textContent = G.round;
    $('goStreak').textContent = G.bestStreak;
    $('goTitle').textContent  = 'Game Over';
    $('goBody').textContent   = `You reached Round ${G.round} with a score of ${G.score.toLocaleString()}.`;

    DOM.overlayGameOver.classList.remove('hidden');
}

// ─── Start / Reset ────────────────────────────────────────────────────────────

function startGame() {
    G.round       = 1;
    G.score       = 0;
    G.streak      = 0;
    G.bestStreak  = 0;
    G.lives       = DIFFICULTY_CONFIG[G.difficulty].maxMistakes + 1;
    G.maxLives    = G.lives;
    G.multiplier  = 1.0;
    G.phase       = 'idle';
    G.session.id  = crypto.randomUUID();

    DOM.overlayStart.classList.add('hidden');
    DOM.overlayResult.classList.add('hidden');
    DOM.overlayGameOver.classList.add('hidden');
    DOM.overlayHelp.classList.add('hidden');

    beginRound();
}

function nextRound() {
    G.round++;
    DOM.overlayResult.classList.add('hidden');
    $('mpFill').style.width = '0%';
    beginRound();
}

function restartGame() {
    DOM.overlayResult.classList.add('hidden');
    DOM.overlayGameOver.classList.add('hidden');

    // Reset pattern view
    DOM.patternGrid.innerHTML = '';
    DOM.recallPrompt.classList.add('hidden');
    DOM.inputSeq.innerHTML = '';
    DOM.tileGrid.innerHTML = '';

    stopTimer();
    DOM.overlayStart.classList.remove('hidden');
}

// ─── Difficulty Selector ──────────────────────────────────────────────────────

function selectDifficulty(diff) {
    G.difficulty = diff;

    // Sync top HUD buttons
    document.querySelectorAll('.diff-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.diff === diff);
    });
    // Sync start overlay pills
    document.querySelectorAll('.diff-pill').forEach((b) => {
        b.classList.toggle('active', b.dataset.diff === diff);
    });
}

// ─── Undo / Clear / Submit ───────────────────────────────────────────────────

DOM.btnUndo.addEventListener('click', () => {
    if (G.phase !== 'recall' || !G.playerSequence.length) return;
    G.playerSequence.pop();
    renderSequence();
    DOM.btnUndo.disabled  = G.playerSequence.length === 0;
    DOM.btnClear.disabled = G.playerSequence.length === 0;
    DOM.btnSubmit.disabled = true;
});

DOM.btnClear.addEventListener('click', () => {
    if (G.phase !== 'recall') return;
    G.playerSequence = [];
    renderSequence();
    DOM.btnUndo.disabled   = true;
    DOM.btnClear.disabled  = true;
    DOM.btnSubmit.disabled = true;
});

DOM.btnSubmit.addEventListener('click', () => {
    if (G.phase !== 'recall') return;
    if (G.playerSequence.length < G.pattern.length) return;

    // Submit full sequence — already validated tap-by-tap
    onRoundSuccess();
});

// ─── Event wiring ─────────────────────────────────────────────────────────────

$('btnStart').addEventListener('click', startGame);

$('btnNextRound').addEventListener('click', nextRound);

$('btnRestart').addEventListener('click', restartGame);

$('btnPlayAgain').addEventListener('click', restartGame);

$('btnQuit').addEventListener('click', () => {
    DOM.overlayGameOver.classList.add('hidden');
    DOM.overlayStart.classList.remove('hidden');
});

$('btnHelp').addEventListener('click', () => {
    DOM.overlayHelp.classList.remove('hidden');
});

$('btnCloseHelp').addEventListener('click', () => {
    DOM.overlayHelp.classList.add('hidden');
});

$('btnSound').addEventListener('click', () => {
    G.soundEnabled = !G.soundEnabled;
    $('btnSound').textContent = G.soundEnabled ? '🔊' : '🔇';
});

// Top HUD difficulty buttons
document.querySelectorAll('.diff-btn').forEach((btn) => {
    btn.addEventListener('click', () => selectDifficulty(btn.dataset.diff));
});

// Start overlay difficulty pills
document.querySelectorAll('.diff-pill').forEach((btn) => {
    btn.addEventListener('click', () => selectDifficulty(btn.dataset.diff));
});

// ─── Init ─────────────────────────────────────────────────────────────────────

updateHUD();
renderLives();
setPhaseLabel('READY', '');
