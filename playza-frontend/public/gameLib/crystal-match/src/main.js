import { CrystalMatch } from './game.js'

document.querySelector('#app').innerHTML = `
  <div class="game-container">
    <div class="hud animate-in slide-in-from-top-4 duration-700">
      <h1 class="gradient-text">Crystal Match</h1>
      <p class="subtitle tracking-[0.3em]">Pure Arcade Action</p>
    </div>

    <div class="stats-board" id="stats-bar" style="display:none">
      <div class="stats-row top-row">
        <div class="stat-box premium">
           <span class="stat-label">Total Score</span>
           <span class="stat-value" id="ui-total">0</span>
        </div>
        <div class="stat-box primary">
           <span class="stat-label">Level</span>
           <span class="stat-value" id="ui-level">1</span>
        </div>
        <div class="stat-box timer-box" id="timer-card">
           <span class="stat-label">Time</span>
           <span class="stat-value" id="ui-timer">7:00</span>
        </div>
      </div>
      <div class="stats-row bottom-row">
        <div class="stat-box wide">
           <div class="level-progress-info">
             <span class="stat-label">Level Progress</span>
             <div class="level-score-text">
               <span class="stat-value" id="ui-score">0</span>
               <span class="stat-target" id="ui-target">/ 2000</span>
             </div>
           </div>
           <div class="progress-bar-bg">
             <div class="progress-bar-fill" id="ui-progress"></div>
           </div>
        </div>
        <div class="stat-box combo-box" id="combo-badge">
           <span class="stat-label glow">Combo</span>
           <span class="stat-value" id="ui-combo">x1</span>
        </div>
      </div>
    </div>

    <div class="canvas-wrapper relative" id="canvas-wrapper">
      <canvas id="gameCanvas" width="480" height="480"></canvas>
      
      <div id="start-overlay" class="overlay">
        <div class="overlay-content">
          <h2 class="text-3xl font-black mb-4 italic">READY?</h2>
          <p class="text-xs opacity-60 mb-8 font-bold leading-relaxed uppercase tracking-widest">Match 3+ crystals<br>Complete levels!</p>
          <button id="startBtn" class="btn-primary glow-pulse">START GAME</button>
        </div>
      </div>
    </div>

    <p class="swipe-hint">👆 Tap or swipe gems to match</p>
  </div>
`

const canvas = document.querySelector('#gameCanvas');
const uiScore = document.querySelector('#ui-score');
const uiTotal = document.querySelector('#ui-total');
const uiTarget = document.querySelector('#ui-target');
const uiCombo = document.querySelector('#ui-combo');
const uiTimer = document.querySelector('#ui-timer');
const uiLevel = document.querySelector('#ui-level');
const uiProgress = document.querySelector('#ui-progress');
const timerCard = document.querySelector('#timer-card');
const statsBar = document.querySelector('#stats-bar');
const comboBadge = document.querySelector('#combo-badge');

let game;

// Extend CrystalMatch to push stats to the DOM
function createGame(canvas) {
  game = new CrystalMatch(canvas);

  const _origAnimate = game.animate.bind(game);
  const _patchedAnimate = (time) => {
    _origAnimate(time);
    
    // Calculate values for current level
    const levelStart = game.levelStartScore || 0;
    const currentLevelScore = game.score - levelStart;
    const targetForLevel = game.targetScore - levelStart;
    const progressPercent = Math.min(100, (currentLevelScore / targetForLevel) * 100);

    // Push live stats
    if (uiTotal) uiTotal.textContent = game.score.toLocaleString();
    if (uiScore) uiScore.textContent = currentLevelScore.toLocaleString();
    if (uiTarget) uiTarget.textContent = `/ ${targetForLevel.toLocaleString()}`;
    if (uiProgress) uiProgress.style.width = `${progressPercent}%`;
    
    if (uiCombo) {
      uiCombo.textContent = `x${game.combo}`;
      comboBadge.style.opacity = game.combo > 1 ? '1' : '0.4';
    }
    
    if (uiTimer) {
      const mins = Math.floor(game.timeLeft / 60);
      const secs = game.timeLeft % 60;
      uiTimer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      if (game.timeLeft <= 30) timerCard.classList.add('warning');
      else timerCard.classList.remove('warning');
    }
    
    if (uiLevel) uiLevel.textContent = game.level;
  };
  game.animate = _patchedAnimate;
  game._animFrameId = requestAnimationFrame(game.animate);
}

// Touch swipe support
let touchStartX = 0, touchStartY = 0;
let touchStartCol = -1, touchStartRow = -1;

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  touchStartCol = Math.floor((touch.clientX - rect.left) * scaleX / (game?.cellSize || 60));
  touchStartRow = Math.floor((touch.clientY - rect.top)  * scaleY / (game?.cellSize || 60));
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  if (!game || game.isAnimating || game.gameOver) return;
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const endCol = Math.floor((touch.clientX - rect.left) * scaleX / game.cellSize);
  const endRow = Math.floor((touch.clientY - rect.top)  * scaleY / game.cellSize);

  if (dist < 10) {
    // Treat as tap — use handlePointer
    game.handlePointer(
      (touch.clientX - rect.left) * scaleX,
      (touch.clientY - rect.top)  * scaleY
    );
    return;
  }

  // Swipe gesture: determine direction and target neighbour
  if (touchStartCol < 0 || touchStartRow < 0) return;
  const GRID = 8;
  let targetRow = touchStartRow, targetCol = touchStartCol;

  if (Math.abs(dx) > Math.abs(dy)) {
    targetCol = dx > 0 ? touchStartCol + 1 : touchStartCol - 1;
  } else {
    targetRow = dy > 0 ? touchStartRow + 1 : touchStartRow - 1;
  }

  if (targetRow >= 0 && targetRow < GRID && targetCol >= 0 && targetCol < GRID) {
    game.selectedGem = null;
    game.swapGems({ r: touchStartRow, c: touchStartCol }, { r: targetRow, c: targetCol });
  }
}, { passive: false });

document.querySelector('#startBtn').addEventListener('click', () => {
  document.querySelector('#start-overlay').classList.add('hidden');
  statsBar.style.display = 'flex';
  createGame(canvas);
});
