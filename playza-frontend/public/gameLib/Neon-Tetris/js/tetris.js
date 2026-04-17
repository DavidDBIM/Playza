var COLS = 10, ROWS = 20;
var board = [];
var lose = false;
var interval;
var intervalRender;
var timerInterval;

var current;
var currentX, currentY;
var currentId = 0;
var currentRotation = 0;

var freezed;
var lockStartMs = null;

var score = 0;
var level = 1;
var lines = 0;
var gameTime = 0;

var soundEnabled = true; // legacy global used by inline handlers
var pieceQueue = [];
var holdPiece = null;
var canHold = true;
var combo = 0;
var lastCleared = 0;
var backToBack = false;

var gameActive = false;
var gamePaused = false;
var gameMode = 'classic'; // 'classic' | 'sprint40'
var sprintTargetLines = 40;
var SPRINT_BEST_KEY = 'neon-tetris-sprint40-best';

var SETTINGS_KEY = 'neon-tetris-settings';
var settings = {
    soundEnabled: true,
    ghostEnabled: true,
    matrixEnabled: true,
    lockDelayMs: 500
};

var shapes = [
    [ 1, 1, 1, 1 ], // I
    [ 1, 1, 1, 0,
      1 ], // J
    [ 1, 1, 1, 0,
      0, 0, 1 ], // L
    [ 1, 1, 0, 0,
      1, 1 ], // O
    [ 1, 1, 0, 0,
      0, 1, 1 ], // Z
    [ 0, 1, 1, 0,
      1, 1 ], // S
    [ 0, 1, 0, 0,
      1, 1, 1 ] // T
];

var colors = [
    '#00f0ff', '#ff00aa', '#3366ff', '#ffee00', '#ff3366', '#00ff88', '#aa44ff'
];

var colorGlows = [
    'rgba(0, 240, 255, 0.6)', 'rgba(255, 0, 170, 0.6)', 'rgba(51, 102, 255, 0.6)',
    'rgba(255, 238, 0, 0.6)', 'rgba(255, 51, 102, 0.6)', 'rgba(0, 255, 136, 0.6)', 'rgba(170, 68, 255, 0.6)'
];

function loadSettings() {
    try {
        var raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
            var parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                settings = Object.assign({}, settings, parsed);
            }
        }
    } catch (e) {}
    soundEnabled = !!settings.soundEnabled;
}

function saveSettings() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
}

function applySettingsToDOM() {
    var soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
        var icon = soundBtn.querySelector('.sound-icon');
        if (icon) icon.innerHTML = settings.soundEnabled ? '&#128266;' : '&#128263;';
    }

    var matrixCanvas = document.getElementById('matrix-bg');
    if (matrixCanvas) {
        matrixCanvas.style.opacity = settings.matrixEnabled ? '0.15' : '0';
    }
}

function getSettings() {
    return Object.assign({}, settings);
}

function setSettings(partial) {
    settings = Object.assign({}, settings, partial || {});
    settings.soundEnabled = !!settings.soundEnabled;
    settings.ghostEnabled = !!settings.ghostEnabled;
    settings.matrixEnabled = !!settings.matrixEnabled;
    settings.lockDelayMs = Math.max(0, parseInt(settings.lockDelayMs, 10) || 0);
    soundEnabled = settings.soundEnabled;
    saveSettings();
    applySettingsToDOM();
}

function publishState() {
    window.NeonTetrisState = {
        score: score,
        level: level,
        lines: lines,
        combo: combo,
        backToBack: backToBack,
        mode: gameMode,
        paused: gamePaused,
        active: gameActive,
        lose: lose
    };
}

function shuffleInPlace(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}

function refillBag() {
    var bag = [0, 1, 2, 3, 4, 5, 6];
    shuffleInPlace(bag);
    for (var i = 0; i < bag.length; i++) pieceQueue.push(bag[i]);
}

function ensureQueue(minLen) {
    while (pieceQueue.length < minLen) refillBag();
}

function takeNextPiece() {
    ensureQueue(7);
    return pieceQueue.shift();
}

function shapeToMatrix(id) {
    var shape = shapes[id];
    var matrix = [];
    for (var y = 0; y < 4; ++y) {
        matrix[y] = [];
        for (var x = 0; x < 4; ++x) {
            var i = 4 * y + x;
            matrix[y][x] = (typeof shape[i] != 'undefined' && shape[i]) ? (id + 1) : 0;
        }
    }
    return matrix;
}

function spawnPiece(id, allowHold) {
    currentId = id;
    currentRotation = 0;
    current = shapeToMatrix(id);
    freezed = false;
    lockStartMs = null;
    currentX = Math.floor(COLS / 2) - 2;
    currentY = 0;
    if (typeof allowHold === 'boolean') canHold = allowHold;
    publishState();
    if (!valid(0, 0, current)) {
        lose = true;
        gameActive = false;
        clearAllIntervals();
        showGameOver();
        return false;
    }
    return true;
}

function newShape(allowHold) {
    var id = takeNextPiece();
    var nextCanHold = (allowHold !== false);
    canHold = nextCanHold;
    spawnPiece(id, nextCanHold);
    renderNextQueue();
    renderHoldPiece();
}

function init() {
    for (var y = 0; y < ROWS; ++y) {
        board[y] = [];
        for (var x = 0; x < COLS; ++x) {
            board[y][x] = 0;
        }
    }
}

function getSpeed() {
    return Math.max(70, 420 - (level - 1) * 30);
}

function startIntervals() {
    clearInterval(interval);
    clearInterval(timerInterval);
    interval = setInterval(tick, getSpeed());
    timerInterval = setInterval(updateTimer, 1000);
}

function tick() {
    if (!gameActive || gamePaused || lose) return;

    if (valid(0, 1, current)) {
        ++currentY;
        lockStartMs = null;
        return;
    }

    if (lockStartMs === null) lockStartMs = Date.now();
    if (Date.now() - lockStartMs < settings.lockDelayMs) return;
    lockPiece();
}

function lockPiece() {
    freeze();
    playSfx('lock');
    clearLines();
    if (lose) {
        gameActive = false;
        clearAllIntervals();
        showGameOver();
        return;
    }
    newShape(true);
}

function freeze() {
    for (var y = 0; y < 4; ++y) {
        for (var x = 0; x < 4; ++x) {
            if (current[y][x]) {
                board[y + currentY][x + currentX] = current[y][x];
            }
        }
    }
    freezed = true;
}

function rotateMatrix(matrix) {
    var newCurrent = [];
    for (var y = 0; y < 4; ++y) {
        newCurrent[y] = [];
        for (var x = 0; x < 4; ++x) {
            newCurrent[y][x] = matrix[3 - x][y];
        }
    }
    return newCurrent;
}

function rotateMatrixCCW(matrix) {
    // 3 CW rotations
    return rotateMatrix(rotateMatrix(rotateMatrix(matrix)));
}

function getKickTable(pieceId, fromRot, toRot) {
    // Coordinates are in our grid space (x right positive, y down positive).
    // SRS uses y up positive, so values below already have y inverted.
    var jltszt = {
        '0>1': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
        '1>0': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
        '1>2': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
        '2>1': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
        '2>3': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
        '3>2': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
        '3>0': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
        '0>3': [[0,0], [1,0], [1,-1], [0,2], [1,2]]
    };

    var iTable = {
        '0>1': [[0,0], [-2,0], [1,0], [-2,1], [1,-2]],
        '1>0': [[0,0], [2,0], [-1,0], [2,-1], [-1,2]],
        '1>2': [[0,0], [-1,0], [2,0], [-1,-2], [2,1]],
        '2>1': [[0,0], [1,0], [-2,0], [1,2], [-2,-1]],
        '2>3': [[0,0], [2,0], [-1,0], [2,-1], [-1,2]],
        '3>2': [[0,0], [-2,0], [1,0], [-2,1], [1,-2]],
        '3>0': [[0,0], [1,0], [-2,0], [1,2], [-2,-1]],
        '0>3': [[0,0], [-1,0], [2,0], [-1,-2], [2,1]]
    };

    var key = fromRot + '>' + toRot;
    if (pieceId === 0) return iTable[key] || [[0,0]];
    if (pieceId === 3) return [[0,0]]; // O
    return jltszt[key] || [[0,0]];
}

function tryRotate(dir) {
    if (!gameActive || gamePaused || lose) return;
    var fromRot = currentRotation;
    var toRot = (currentRotation + (dir > 0 ? 1 : 3)) % 4;
    var rotated = dir > 0 ? rotateMatrix(current) : rotateMatrixCCW(current);
    var kicks = getKickTable(currentId, fromRot, toRot);

    for (var i = 0; i < kicks.length; i++) {
        var dx = kicks[i][0];
        var dy = kicks[i][1];
        if (valid(dx, dy, rotated)) {
            current = rotated;
            currentRotation = toRot;
            currentX += dx;
            currentY += dy;
            onPieceMoved(true);
            playSfx('rotate');
            return;
        }
    }
}

function onPieceMoved(allowLockReset) {
    if (!allowLockReset) return;
    if (valid(0, 1, current)) {
        lockStartMs = null;
    } else {
        lockStartMs = Date.now();
    }
    publishState();
}

function boardIsEmpty() {
    for (var y = 0; y < ROWS; y++) {
        for (var x = 0; x < COLS; x++) {
            if (board[y][x]) return false;
        }
    }
    return true;
}

function clearLines() {
    var cleared = 0;
    for (var y = ROWS - 1; y >= 0; --y) {
        var rowFilled = true;
        for (var x = 0; x < COLS; ++x) {
            if (board[y][x] == 0) {
                rowFilled = false;
                break;
            }
        }
        if (rowFilled) {
            cleared++;
            playClearSound();
            for (var yy = y; yy > 0; --yy) {
                for (var xx = 0; xx < COLS; ++xx) {
                    board[yy][xx] = board[yy - 1][xx];
                }
            }
            for (var xxx = 0; xxx < COLS; xxx++) board[0][xxx] = 0;
            ++y;
        }
    }

    if (cleared > 0) {
        combo = (lastCleared > 0) ? (combo + 1) : 0;
        lastCleared = cleared;
        updateScoreForClear(cleared, combo);
    } else {
        lastCleared = 0;
        combo = 0;
    }
    publishState();

    if (gameMode === 'sprint40' && lines >= sprintTargetLines && gameActive && !lose) {
        completeSprint();
    }
}

function updateScoreForClear(linesCleared, comboCount) {
    var points = 0;
    var type = '';
    switch (linesCleared) {
        case 1: points = 100; type = 'SINGLE'; break;
        case 2: points = 300; type = 'DOUBLE'; break;
        case 3: points = 500; type = 'TRIPLE'; break;
        case 4: points = 800; type = 'TETRIS'; break;
    }

    var b2bEligible = (linesCleared === 4);
    var b2bBonus = (b2bEligible && backToBack) ? Math.floor(points * 0.5) : 0;

    points = (points + b2bBonus) * level;

    var perfectClear = boardIsEmpty();
    if (perfectClear) points += 1000 * level;

    if (comboCount > 0) points += comboCount * 50 * level;

    score += points;
    lines += linesCleared;
    level = Math.floor(lines / 10) + 1;

    if (b2bEligible) backToBack = true;
    else backToBack = false;

    updateHUD();

    var label = type;
    if (b2bEligible && b2bBonus > 0) label = 'B2B ' + label;
    if (perfectClear) label = 'PERFECT CLEAR';

    if (comboCount > 0) showCombo(comboCount, points);
    else showFloatingScore(points, label);

    startIntervals();
}

function addDropScore(points) {
    if (points <= 0) return;
    score += points;
    updateHUD();
}

function updateHUD() {
    var scoreEl = document.getElementById('score');
    var scoreMobileEl = document.getElementById('score-mobile');
    if (scoreEl) scoreEl.textContent = score;
    if (scoreMobileEl) scoreMobileEl.textContent = score;

    var levelEl = document.getElementById('level');
    var levelMobileEl = document.getElementById('level-mobile');
    if (levelEl) levelEl.textContent = level;
    if (levelMobileEl) levelMobileEl.textContent = level;

    var linesEl = document.getElementById('lines');
    var linesMobileEl = document.getElementById('lines-mobile');
    if (linesEl) linesEl.textContent = lines;
    if (linesMobileEl) linesMobileEl.textContent = lines;

    if (scoreEl) {
        scoreEl.classList.add('updated');
        setTimeout(function() { scoreEl.classList.remove('updated'); }, 300);
    }

    publishState();
}

var audioCtx = null;
function ensureAudio() {
    if (!settings.soundEnabled) return null;
    if (audioCtx) return audioCtx;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx;
    } catch (e) {
        return null;
    }
}

function beep(freq, durationMs, gainValue, type) {
    if (!settings.soundEnabled) return;
    var ctx = ensureAudio();
    if (!ctx) return;

    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue || 0.06, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (durationMs / 1000));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (durationMs / 1000) + 0.02);
}

function playSfx(name) {
    if (!settings.soundEnabled) return;
    if (name === 'move') beep(240, 35, 0.03, 'square');
    if (name === 'rotate') beep(320, 45, 0.04, 'triangle');
    if (name === 'hold') beep(180, 70, 0.04, 'sine');
    if (name === 'drop') beep(120, 90, 0.05, 'sawtooth');
    if (name === 'lock') beep(90, 80, 0.05, 'square');
}

function playClearSound() {
    if (settings.soundEnabled) {
        var sound = document.getElementById('clearsound');
        if (sound) {
            sound.volume = 0.3;
            sound.currentTime = 0;
            sound.play().catch(function() {});
        }
    }
}

function keyPress(key) {
    if (!gameActive && (key === 'left' || key === 'right' || key === 'down' || key === 'rotate' || key === 'rotateCCW' || key === 'drop' || key === 'hold')) return;
    if (lose && key !== 'restart') return;

    switch (key) {
        case 'left':
            if (!gamePaused && valid(-1, 0, current)) {
                --currentX;
                onPieceMoved(true);
                playSfx('move');
            }
            break;
        case 'right':
            if (!gamePaused && valid(1, 0, current)) {
                ++currentX;
                onPieceMoved(true);
                playSfx('move');
            }
            break;
        case 'down':
            if (!gamePaused && valid(0, 1, current)) {
                ++currentY;
                addDropScore(1);
                lockStartMs = null;
            }
            break;
        case 'rotate':
            if (!gamePaused) tryRotate(1);
            break;
        case 'rotateCCW':
            if (!gamePaused) tryRotate(-1);
            break;
        case 'drop':
            if (gamePaused) break;
            hardDrop();
            break;
        case 'hold':
            if (!gamePaused) holdCurrentPiece();
            break;
        case 'pause':
            togglePause();
            break;
        case 'restart':
            newGame();
            break;
    }
}

function hardDrop() {
    var distance = 0;
    while (valid(0, 1, current)) {
        ++currentY;
        distance++;
    }
    if (distance > 0) addDropScore(distance * 2);
    playSfx('drop');
    lockPiece();
}

function valid(offsetX, offsetY, newCurrent) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    offsetX = currentX + offsetX;
    offsetY = currentY + offsetY;
    newCurrent = newCurrent || current;

    for (var y = 0; y < 4; ++y) {
        for (var x = 0; x < 4; ++x) {
            if (newCurrent[y][x]) {
                if (x + offsetX < 0
                    || x + offsetX >= COLS
                    || y + offsetY >= ROWS
                    || y + offsetY < 0
                    || typeof board[y + offsetY] === 'undefined'
                    || board[y + offsetY][x + offsetX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function playButtonClicked() {
    if (gamePaused && gameActive && !lose) {
        setPaused(false);
        return;
    }
    newGame(gameMode);
}

function holdCurrentPiece() {
    if (!canHold || lose) return;
    playSfx('hold');

    if (holdPiece === null) {
        holdPiece = currentId;
        canHold = false;
        newShape(false);
    } else {
        var temp = holdPiece;
        holdPiece = currentId;
        canHold = false;
        spawnPiece(temp, false);
        renderNextQueue();
        renderHoldPiece();
    }
    renderHoldPiece();
}

function clearAllIntervals() {
    clearInterval(interval);
    clearInterval(intervalRender);
    clearInterval(timerInterval);
}

function showOverlay(title, subtitle, buttonText, showStats) {
    var overlay = document.getElementById('overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');

    var titleEl = document.getElementById('overlay-title');
    var subtitleEl = document.getElementById('overlay-subtitle');
    var statsEl = document.getElementById('game-stats');
    var buttonEl = document.getElementById('start-btn');

    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle || '';
    if (statsEl) statsEl.style.display = showStats ? 'block' : 'none';
    if (buttonEl) buttonEl.textContent = buttonText || 'START';

    var modeSelect = document.getElementById('mode-select');
    var modeHint = document.getElementById('mode-hint');
    var showModes = (!gameActive);
    if (modeSelect) modeSelect.style.display = showModes ? 'flex' : 'none';
    if (modeHint) modeHint.style.display = showModes ? 'block' : 'none';
}

function setPaused(paused) {
    if (!gameActive || lose) return;
    gamePaused = !!paused;
    publishState();

    if (gamePaused) {
        clearInterval(interval);
        clearInterval(timerInterval);
        showOverlay('PAUSED', 'Press P / Esc to resume', 'RESUME', false);
        document.getElementById('overlay')?.classList.remove('game-over');
        return;
    }

    document.getElementById('overlay')?.classList.add('hidden');
    startIntervals();
}

function togglePause() {
    if (!gameActive || lose) return;
    setPaused(!gamePaused);
}

function newGame(mode) {
    clearAllIntervals();
    init();
    loadSettings();
    applySettingsToDOM();

    if (mode) gameMode = mode;
    score = 0;
    level = 1;
    lines = 0;
    gameTime = 0;
    lose = false;
    holdPiece = null;
    canHold = true;
    combo = 0;
    lastCleared = 0;
    backToBack = false;
    pieceQueue = [];
    gameActive = true;
    gamePaused = false;

    updateHUD();

    var timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = '00:00';

    var overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('game-over');
    }

    intervalRender = setInterval(render, 30);
    ensureQueue(14);
    newShape(true);
    startIntervals();
    renderNextQueue();
    renderHoldPiece();
    publishState();
}

function updateTimer() {
    if (!gameActive || gamePaused || lose) return;
    gameTime++;
    var minutes = Math.floor(gameTime / 60);
    var seconds = gameTime % 60;
    var timerEl = document.getElementById('timer');
    if (timerEl) {
        timerEl.textContent =
            (minutes < 10 ? '0' : '') + minutes + ':' +
            (seconds < 10 ? '0' : '') + seconds;
    }
}

function showGameOver() {
    var overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('game-over');
    }

    showOverlay('GAME OVER', 'Mission Complete', 'RESTART MODULE', true);

    document.getElementById('final-score').textContent = score;
    document.getElementById('final-time').textContent = formatTime(gameTime);
    document.getElementById('final-lines').textContent = lines;
    document.getElementById('final-level').textContent = level;
    var bestRow = document.getElementById('best-time-row');
    if (bestRow) bestRow.style.display = 'none';

    if (gameMode === 'sprint40') {
        var best = null;
        try { best = parseInt(localStorage.getItem(SPRINT_BEST_KEY), 10); } catch (e) { best = null; }
        var bestTimeEl = document.getElementById('best-time');
        if (bestRow) bestRow.style.display = 'flex';
        if (bestTimeEl) bestTimeEl.textContent = best ? formatTime(best) : '--:--';
    }

    if (window.PlayzaSDK) {
        window.PlayzaSDK.submitScore({
            score: score,
            metadata: {
                lines: lines,
                level: level,
                game_id: 'canvas-tetris'
            }
        });
    }
}

function completeSprint() {
    gameActive = false;
    clearAllIntervals();

    var best = null;
    try { best = parseInt(localStorage.getItem(SPRINT_BEST_KEY), 10); } catch (e) { best = null; }
    if (!best || gameTime < best) {
        best = gameTime;
        try { localStorage.setItem(SPRINT_BEST_KEY, String(best)); } catch (e) {}
    }

    showOverlay('SPRINT COMPLETE', '40 lines cleared', 'PLAY AGAIN', true);
    var overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.remove('game-over');

    document.getElementById('final-score').textContent = score;
    document.getElementById('final-time').textContent = formatTime(gameTime);
    document.getElementById('final-lines').textContent = lines;
    document.getElementById('final-level').textContent = level;

    var bestRow = document.getElementById('best-time-row');
    var bestTimeEl = document.getElementById('best-time');
    if (bestRow) bestRow.style.display = 'flex';
    if (bestTimeEl && best) bestTimeEl.textContent = formatTime(best);

    // Submit score + sprint time
    if (window.PlayzaSDK) {
        window.PlayzaSDK.submitScore({
            score: score,
            metadata: {
                lines: lines,
                level: level,
                time_seconds: gameTime,
                mode: 'sprint40',
                game_id: 'canvas-tetris'
            }
        });
    }
}

function formatTime(totalSeconds) {
    totalSeconds = Math.max(0, totalSeconds | 0);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

function toggleSound() {
    setSettings({ soundEnabled: !settings.soundEnabled });
}

function renderNextQueue() {
    var count = 5;
    ensureQueue(count);

    // Main (mobile) single preview uses the immediate next piece
    var mainCanvas = document.getElementById('next-canvas-main');
    if (mainCanvas) {
        var mainCtx = mainCanvas.getContext('2d');
        mainCtx.fillStyle = '#12121a';
        mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        var mainId = pieceQueue[0];
        if (typeof mainId !== 'undefined') {
            drawPieceOnCanvas(mainCtx, mainCanvas, mainId);
        }
    }

    for (var i = 0; i < count; i++) {
        var canvas = document.getElementById('next-canvas-' + i);
        if (!canvas) continue;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#12121a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var id = pieceQueue[i];
        if (typeof id === 'undefined') continue;

        drawPieceOnCanvas(ctx, canvas, id);
    }
}

function drawPieceOnCanvas(ctx, canvas, id, dimmed) {
    var shape = shapes[id];
    var blockSize = 16;
    var offsetX = (canvas.width - 4 * blockSize) / 2;
    var offsetY = (canvas.height - 4 * blockSize) / 2;

    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 4; x++) {
            var idx = 4 * y + x;
            if (shape[idx]) {
                ctx.fillStyle = dimmed ? '#666666' : colors[id];
                ctx.fillRect(offsetX + x * blockSize + 1, offsetY + y * blockSize + 1, blockSize - 2, blockSize - 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(offsetX + x * blockSize + 1, offsetY + y * blockSize + 1, blockSize - 2, 3);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(offsetX + x * blockSize + 1, offsetY + y * blockSize + blockSize - 4, blockSize - 2, 3);
            }
        }
    }
}

function renderHoldPiece() {
    var canvases = [document.getElementById('hold-canvas'), document.getElementById('hold-canvas-main')].filter(Boolean);
    if (canvases.length === 0) return;

    canvases.forEach(function(canvas) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#12121a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (holdPiece === null) return;
        drawPieceOnCanvas(ctx, canvas, holdPiece, !canHold);
    });
}

function showCombo(comboCount, points) {
    var comboEl = document.getElementById('combo-display');
    if (!comboEl) return;
    comboEl.textContent = comboCount + 'x COMBO! +' + points;
    comboEl.classList.remove('show');
    void comboEl.offsetWidth;
    comboEl.classList.add('show');
}

function showFloatingScore(points, type) {
    var comboEl = document.getElementById('combo-display');
    if (!comboEl) return;
    comboEl.textContent = (type ? (type + ' ') : '') + '+' + points;
    comboEl.classList.remove('show');
    void comboEl.offsetWidth;
    comboEl.classList.add('show');
}

function handleTouch(action) {
    keyPress(action);
    render();
}

// Expose a minimal API for UI scripts (ui.js / matrix.js / render.js)
window.NeonTetris = {
    togglePause: togglePause,
    setPaused: setPaused,
    keyPress: keyPress,
    getSettings: getSettings,
    setSettings: setSettings,
    setMode: function(mode) {
        if (mode === 'classic' || mode === 'sprint40') {
            gameMode = mode;
            publishState();
        }
    },
    getMode: function() {
        return gameMode;
    }
};

// Preload settings so UI reflects immediately
loadSettings();
applySettingsToDOM();
publishState();
