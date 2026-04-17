var COLS = 10, ROWS = 20;
var board = [];
var lose;
var interval;
var intervalRender;
var timerInterval;
var current;
var currentX, currentY;
var freezed;
var score = 0;
var level = 1;
var lines = 0;
var highscore = 0;
var gameTime = 0;
var soundEnabled = true;
var nextPiece = null;
var holdPiece = null;
var canHold = true;
var combo = 0;
var lastCleared = 0;

var shapes = [
    [ 1, 1, 1, 1 ],
    [ 1, 1, 1, 0,
      1 ],
    [ 1, 1, 1, 0,
      0, 0, 1 ],
    [ 1, 1, 0, 0,
      1, 1 ],
    [ 1, 1, 0, 0,
      0, 1, 1 ],
    [ 0, 1, 1, 0,
      1, 1 ],
    [ 0, 1, 0, 0,
      1, 1, 1 ]
];

var colors = [
    '#00f0ff', '#ff00aa', '#3366ff', '#ffee00', '#ff3366', '#00ff88', '#aa44ff'
];

var colorGlows = [
    'rgba(0, 240, 255, 0.6)', 'rgba(255, 0, 170, 0.6)', 'rgba(51, 102, 255, 0.6)',
    'rgba(255, 238, 0, 0.6)', 'rgba(255, 51, 102, 0.6)', 'rgba(0, 255, 136, 0.6)', 'rgba(170, 68, 255, 0.6)'
];

function newShape() {
    var id = Math.floor( Math.random() * shapes.length );
    var shape = shapes[ id ];
    
    if (nextPiece !== null) {
        id = nextPiece;
        shape = shapes[id];
    } else {
        nextPiece = Math.floor(Math.random() * shapes.length);
    }
    
    current = [];
    for ( var y = 0; y < 4; ++y ) {
        current[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            var i = 4 * y + x;
            if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
                current[ y ][ x ] = id + 1;
            }
            else {
                current[ y ][ x ] = 0;
            }
        }
    }
    
    freezed = false;
    currentX = 5;
    currentY = 0;
    canHold = true;
    
    nextPiece = Math.floor(Math.random() * shapes.length);
    renderNextPiece();
    renderHoldPiece();
}

function init() {
    for ( var y = 0; y < ROWS; ++y ) {
        board[ y ] = [];
        for ( var x = 0; x < COLS; ++x ) {
            board[ y ][ x ] = 0;
        }
    }
}

function getSpeed() {
    return Math.max(100, 400 - (level - 1) * 30);
}

function tick() {
    if ( valid( 0, 1 ) ) {
        ++currentY;
    }
    else {
        freeze();
        valid(0, 1);
        clearLines();
        if (lose) {
            clearAllIntervals();
            showGameOver();
            return false;
        }
        newShape();
    }
}

function freeze() {
    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( current[ y ][ x ] ) {
                board[ y + currentY ][ x + currentX ] = current[ y ][ x ];
            }
        }
    }
    freezed = true;
}

function rotate( current ) {
    var newCurrent = [];
    for ( var y = 0; y < 4; ++y ) {
        newCurrent[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            newCurrent[ y ][ x ] = current[ 3 - x ][ y ];
        }
    }
    return newCurrent;
}

function clearLines() {
    var cleared = 0;
    for ( var y = ROWS - 1; y >= 0; --y ) {
        var rowFilled = true;
        for ( var x = 0; x < COLS; ++x ) {
            if ( board[ y ][ x ] == 0 ) {
                rowFilled = false;
                break;
            }
        }
        if ( rowFilled ) {
            cleared++;
            playClearSound();
            for ( var yy = y; yy > 0; --yy ) {
                for ( var x = 0; x < COLS; ++x ) {
                    board[ yy ][ x ] = board[ yy - 1 ][ x ];
                }
            }
            ++y;
        }
    }
    
    if (cleared > 0) {
        if (lastCleared > 0 && cleared > 0) {
            combo++;
        } else {
            combo = 0;
        }
        lastCleared = cleared;
        updateScore(cleared, combo);
    } else {
        lastCleared = 0;
        combo = 0;
    }
}

function updateScore(linesCleared, comboCount) {
    var points = 0;
    var type = '';
    switch(linesCleared) {
        case 1: points = 100; type = 'SINGLE'; break;
        case 2: points = 300; type = 'DOUBLE'; break;
        case 3: points = 500; type = 'TRIPLE'; break;
        case 4: points = 800; type = 'TETRIS'; break;
    }
    points *= level;
    
    if (comboCount > 0) {
        points += comboCount * 50 * level;
        showCombo(comboCount, points);
    } else {
        showFloatingScore(points, type);
    }
    
    score += points;
    lines += linesCleared;
    
    level = Math.floor(lines / 10) + 1;
    
    const scoreEl = document.getElementById('score');
    const scoreMobileEl = document.getElementById('score-mobile');
    if (scoreEl) scoreEl.textContent = score;
    if (scoreMobileEl) scoreMobileEl.textContent = score;

    const levelEl = document.getElementById('level');
    const levelMobileEl = document.getElementById('level-mobile');
    if (levelEl) levelEl.textContent = level;
    if (levelMobileEl) levelMobileEl.textContent = level;

    const linesEl = document.getElementById('lines');
    const linesMobileEl = document.getElementById('lines-mobile');
    if (linesEl) linesEl.textContent = lines;
    if (linesMobileEl) linesMobileEl.textContent = lines;
    
    if (scoreEl) {
        scoreEl.classList.add('updated');
        setTimeout(() => scoreEl.classList.remove('updated'), 300);
    }
    
    if (score > highscore) {
        highscore = score;
        const highscoreEl = document.getElementById('highscore');
        if (highscoreEl) highscoreEl.textContent = highscore;
        localStorage.setItem('tetris-highscore', highscore);
    }
    
    clearInterval(interval);
    interval = setInterval(tick, getSpeed());
}

function playClearSound() {
    if (soundEnabled) {
        var sound = document.getElementById('clearsound');
        if (sound) {
            sound.volume = 0.3;
            sound.play().catch(() => {});
        }
    }
}

function keyPress( key ) {
    if (lose) return;
    
    switch ( key ) {
        case 'left':
            if ( valid( -1 ) ) {
                --currentX;
            }
            break;
        case 'right':
            if ( valid( 1 ) ) {
                ++currentX;
            }
            break;
        case 'down':
            if ( valid( 0, 1 ) ) {
                ++currentY;
            }
            break;
        case 'rotate':
            var rotated = rotate( current );
            if ( valid( 0, 0, rotated ) ) {
                current = rotated;
            }
            break;
        case 'drop':
            while( valid(0, 1) ) {
                ++currentY;
            }
            tick();
            break;
        case 'hold':
            holdCurrentPiece();
            break;
    }
}

function valid( offsetX, offsetY, newCurrent ) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    offsetX = currentX + offsetX;
    offsetY = currentY + offsetY;
    newCurrent = newCurrent || current;

    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( newCurrent[ y ][ x ] ) {
                if ( typeof board[ y + offsetY ] == 'undefined'
                  || typeof board[ y + offsetY ][ x + offsetX ] == 'undefined'
                  || board[ y + offsetY ][ x + offsetX ]
                  || x + offsetX < 0
                  || y + offsetY >= ROWS
                  || x + offsetX >= COLS ) {
                    if (offsetY == 1 && freezed) {
                        lose = true;
                    } 
                    return false;
                }
            }
        }
    }
    return true;
}

function playButtonClicked() {
    newGame();
}

function holdCurrentPiece() {
    if (!canHold || lose) return;
    
    var currentId = current[0].find(x => x > 0) - 1;
    
    if (holdPiece === null) {
        holdPiece = currentId;
        newShape();
    } else {
        var temp = holdPiece;
        holdPiece = currentId;
        
        var shape = shapes[temp];
        current = [];
        for (var y = 0; y < 4; ++y) {
            current[y] = [];
            for (var x = 0; x < 4; ++x) {
                var i = 4 * y + x;
                if (typeof shape[i] != 'undefined' && shape[i]) {
                    current[y][x] = temp + 1;
                } else {
                    current[y][x] = 0;
                }
            }
        }
        
        currentX = 5;
        currentY = 0;
        freezed = false;
    }
    
    canHold = false;
    renderHoldPiece();
}

function newGame() {
    clearAllIntervals();
    init();
    score = 0;
    level = 1;
    lines = 0;
    gameTime = 0;
    lose = false;
    holdPiece = null;
    nextPiece = null;
    canHold = true;
    combo = 0;
    lastCleared = 0;
    
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.textContent = '0';
    const scoreMobileEl = document.getElementById('score-mobile');
    if (scoreMobileEl) scoreMobileEl.textContent = '0';
    
    const levelEl = document.getElementById('level');
    if (levelEl) levelEl.textContent = '1';
    const levelMobileEl = document.getElementById('level-mobile');
    if (levelMobileEl) levelMobileEl.textContent = '1';

    const linesEl = document.getElementById('lines');
    if (linesEl) linesEl.textContent = '0';
    const linesMobileEl = document.getElementById('lines-mobile');
    if (linesMobileEl) linesMobileEl.textContent = '0';

    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = '00:00';
    
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById('overlay').classList.remove('game-over');
    
    highscore = parseInt(localStorage.getItem('tetris-highscore')) || 0;
    const highscoreEl = document.getElementById('highscore');
    if (highscoreEl) highscoreEl.textContent = highscore;
    
    intervalRender = setInterval( render, 30 );
    newShape();
    interval = setInterval( tick, getSpeed() );
    timerInterval = setInterval(updateTimer, 1000);
    
    renderNextPiece();
    renderHoldPiece();
}

function renderNextPiece() {
    var canvas = document.getElementById('next-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#12121a';
    ctx.fillRect(0, 0, 80, 80);
    
    if (nextPiece === null) return;
    
    var shape = shapes[nextPiece];
    var blockSize = 16;
    var offsetX = (80 - 4 * blockSize) / 2;
    var offsetY = (80 - 4 * blockSize) / 2;
    
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 4; x++) {
            var i = 4 * y + x;
            if (shape[i]) {
                ctx.fillStyle = colors[nextPiece];
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
    var canvas = document.getElementById('hold-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#12121a';
    ctx.fillRect(0, 0, 80, 80);
    
    if (holdPiece === null) return;
    
    var shape = shapes[holdPiece];
    var blockSize = 16;
    var offsetX = (80 - 4 * blockSize) / 2;
    var offsetY = (80 - 4 * blockSize) / 2;
    
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 4; x++) {
            var i = 4 * y + x;
            if (shape[i]) {
                ctx.fillStyle = canHold ? colors[holdPiece] : '#666666';
                ctx.fillRect(offsetX + x * blockSize + 1, offsetY + y * blockSize + 1, blockSize - 2, blockSize - 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(offsetX + x * blockSize + 1, offsetY + y * blockSize + 1, blockSize - 2, 3);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(offsetX + x * blockSize + 1, offsetY + y * blockSize + blockSize - 4, blockSize - 2, 3);
            }
        }
    }
}

function updateTimer() {
    gameTime++;
    var minutes = Math.floor(gameTime / 60);
    var seconds = gameTime % 60;
    document.getElementById('timer').textContent = 
        (minutes < 10 ? '0' : '') + minutes + ':' + 
        (seconds < 10 ? '0' : '') + seconds;
}

function showGameOver() {
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById('overlay').classList.add('game-over');
    document.getElementById('overlay-title').textContent = 'GAME OVER';
    document.getElementById('overlay-subtitle').textContent = 'Mission Complete';
    document.getElementById('game-stats').style.display = 'block';
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-lines').textContent = lines;
    document.getElementById('final-level').textContent = level;
    document.getElementById('start-btn').textContent = 'RESTART MODULE';
    
    // Submit score to Playza Platform via SDK
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

function clearAllIntervals(){
    clearInterval( interval );
    clearInterval( intervalRender );
    clearInterval( timerInterval );
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    var btn = document.getElementById('sound-btn');
    btn.querySelector('.sound-icon').textContent = soundEnabled ? '🔊' : '🔇';
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
    comboEl.textContent = (type === 'TETRIS' ? 'TETRIS! ' : '') + '+' + points;
    comboEl.classList.remove('show');
    void comboEl.offsetWidth;
    comboEl.classList.add('show');
}

function handleTouch(action) {
    keyPress(action);
    render();
}
