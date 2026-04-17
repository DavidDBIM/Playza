document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.querySelector('.grid');
    const scoreDisplay = document.querySelector('#score');
    const bestScoreDisplay = document.querySelector('#best-score');


    let squares = [];
    let score = 0;
    let bestScore = localStorage.getItem('2048-best') || 0;
    const width = 4;
    let isGameOver = false;

    bestScoreDisplay.textContent = bestScore;

    // Create the background tiles
    function createBoard() {
        gridContainer.innerHTML = '';
        squares = [];
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div');
            square.className = 'tile';
            square.dataset.value = 0;
            gridContainer.appendChild(square);
            squares.push(square);
        }
        score = 0;
        updateScore();
        generate();
        generate();
    }

    // Update display of all tiles
    function updateDisplay(mergedIndices = [], newIndex = -1) {
        squares.forEach((square, index) => {
            const value = parseInt(square.dataset.value);
            square.textContent = value === 0 ? '' : value;
            
            // Rebuild class list
            square.className = 'tile';
            if (value > 0) {
                square.classList.add(`tile-${value}`);
            }
            if (mergedIndices.includes(index)) {
                square.classList.add('tile-merge');
            }
            if (index === newIndex) {
                square.classList.add('tile-new');
            }
        });
    }

    // Generate a new number (2 or 4)
    function generate() {
        const emptyIndices = squares
            .map((s, i) => parseInt(s.dataset.value) === 0 ? i : -1)
            .filter(i => i !== -1);
            
        if (emptyIndices.length > 0) {
            const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            squares[randomIndex].dataset.value = Math.random() < 0.9 ? 2 : 4;
            updateDisplay([], randomIndex);
        }
        checkForGameOver();
    }

    function updateScore() {
        scoreDisplay.textContent = score;
        if (score > bestScore) {
            bestScore = score;
            bestScoreDisplay.textContent = bestScore;
            localStorage.setItem('2048-best', bestScore);
        }
    }

    // Sliders
    function tiltGrid(direction) {
        if (isGameOver) return;
        let hasMoved = false;
        let mergedIndices = [];
        
        switch(direction) {
            case 'right':
                for (let i = 0; i < 16; i += 4) {
                    let row = [i, i+1, i+2, i+3];
                    let vals = row.map(idx => parseInt(squares[idx].dataset.value));
                    let { newVals, moved, mergedScore, merges } = processLine(vals.reverse());
                    newVals.reverse();
                    merges.reverse();
                    if (moved) hasMoved = true;
                    score += mergedScore;
                    for (let j = 0; j < 4; j++) {
                        squares[row[j]].dataset.value = newVals[j];
                        if (merges[j]) mergedIndices.push(row[j]);
                    }
                }
                break;
            case 'left':
                for (let i = 0; i < 16; i += 4) {
                    let row = [i, i+1, i+2, i+3];
                    let vals = row.map(idx => parseInt(squares[idx].dataset.value));
                    let { newVals, moved, mergedScore, merges } = processLine(vals);
                    if (moved) hasMoved = true;
                    score += mergedScore;
                    for (let j = 0; j < 4; j++) {
                        squares[row[j]].dataset.value = newVals[j];
                        if (merges[j]) mergedIndices.push(row[j]);
                    }
                }
                break;
            case 'up':
                for (let i = 0; i < 4; i++) {
                    let col = [i, i+width, i+width*2, i+width*3];
                    let vals = col.map(idx => parseInt(squares[idx].dataset.value));
                    let { newVals, moved, mergedScore, merges } = processLine(vals);
                    if (moved) hasMoved = true;
                    score += mergedScore;
                    for (let j = 0; j < 4; j++) {
                        squares[col[j]].dataset.value = newVals[j];
                        if (merges[j]) mergedIndices.push(col[j]);
                    }
                }
                break;
            case 'down':
                for (let i = 0; i < 4; i++) {
                    let col = [i, i+width, i+width*2, i+width*3];
                    let vals = col.map(idx => parseInt(squares[idx].dataset.value));
                    let { newVals, moved, mergedScore, merges } = processLine(vals.reverse());
                    newVals.reverse();
                    merges.reverse();
                    if (moved) hasMoved = true;
                    score += mergedScore;
                    for (let j = 0; j < 4; j++) {
                        squares[col[j]].dataset.value = newVals[j];
                        if (merges[j]) mergedIndices.push(col[j]);
                    }
                }
                break;
        }

        if (hasMoved) {
            updateScore();
            updateDisplay(mergedIndices);
            setTimeout(generate, 100);
        }
    }
    window.tiltGrid = tiltGrid;

    function processLine(arr) {
        let filtered = arr.filter(n => n !== 0);
        let newVals = [];
        let merges = [false, false, false, false];
        let mergedScore = 0;
        let moved = false;
        
        for (let i = 0; i < filtered.length; i++) {
            if (filtered[i] === filtered[i+1]) {
                const combined = filtered[i] * 2;
                newVals.push(combined);
                mergedScore += combined;
                merges[newVals.length - 1] = true;
                i++;
            } else {
                newVals.push(filtered[i]);
            }
        }
        
        while (newVals.length < 4) newVals.push(0);
        for (let i = 0; i < 4; i++) if (arr[i] !== newVals[i]) moved = true;
        
        return { newVals, moved, mergedScore, merges };
    }

    // Keyboard controls
    function control(e) {
        if (e.key === 'ArrowLeft') tiltGrid('left');
        else if (e.key === 'ArrowRight') tiltGrid('right');
        else if (e.key === 'ArrowUp') tiltGrid('up');
        else if (e.key === 'ArrowDown') tiltGrid('down');
    }

    document.addEventListener('keydown', control);

    // Touch controls
    let touchStartX = 0;
    let touchStartY = 0;

    gridContainer.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    gridContainer.addEventListener('touchend', e => {
        if (!touchStartX || !touchStartY) return;
        
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > 30) tiltGrid(dx > 0 ? 'right' : 'left');
        } else {
            if (Math.abs(dy) > 30) tiltGrid(dy > 0 ? 'down' : 'up');
        }
        
        touchStartX = 0;
        touchStartY = 0;
    });

    function checkForGameOver() {
        const canMoveAnywhere = () => {
            // Check for empty space
            if (squares.some(s => parseInt(s.dataset.value) === 0)) return true;
            
            // Check for horizontal merges
            for (let i = 0; i < 16; i += 4) {
                for (let j = 0; j < 3; j++) {
                    if (squares[i+j].dataset.value === squares[i+j+1].dataset.value) return true;
                }
            }
            
            // Check for vertical merges
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 3; j++) {
                    if (squares[i+j*width].dataset.value === squares[i+(j+1)*width].dataset.value) return true;
                }
            }
            return false;
        };

        if (!canMoveAnywhere()) {
            isGameOver = true;
            document.removeEventListener('keydown', control);
            
            const overlay = document.getElementById('game-over-overlay');
            const overlayScore = document.getElementById('overlay-score');
            if (overlay && overlayScore) {
                overlayScore.textContent = score;
                overlay.style.display = 'flex';
            }

            if (window.parent !== window) {
                setTimeout(() => {
                    window.parent.postMessage({
                        type: 'PLAYZA_SCORE_SUBMISSION',
                        payload: {
                            game_id: '2048game',
                            session_id: new URLSearchParams(window.location.search).get('session_id'),
                            score: score,
                            metadata: { category: 'Puzzle' }
                        }
                    }, '*');
                }, 2500); // Wait 2.5 seconds before showing the platform leaderboard
            }
        }
    }

    // Initialize
    createBoard();
});
