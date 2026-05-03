// Rules and State Configurations
const MAX_COLORS = 3; // 0: blue, 1: yellow, 2: purple
const GRID_SIZE = 3;

let gameState = 'start'; // start, playing, ended
let currentRound = 1;
let timeLeft = 30; // seconds
let totalClicks = 0;
let baseTimeWin = 30;
let currentRule = 0; // 0: Plus, 1: X, 2: Row/Col

// Grid map: 1D array of 9 elements
let grid = Array(GRID_SIZE * GRID_SIZE).fill(0);

// Timers & Advanced Mechanics
let timerInterval = null;
let lastTapTime = 0;
let fastSolves = 0;
let roundStartTime = 0;
let overclockTimer = 0; // ms
let corruptedNodeIdx = -1;
let lastTickTime = 0;

// UI Elements
const elHud = document.getElementById('gameHud');
const elRound = document.getElementById('hudRound');
const elTimer = document.getElementById('hudTimer');
const elTimerBox = document.getElementById('hudTimerBox');
const elRuleDesc = document.getElementById('hudRuleDesc');
const nodesGrid = document.getElementById('nodesGrid');
const gameBoard = document.getElementById('gameBoard');
const arena = document.getElementById('arena');

const overStart = document.getElementById('overlayStart');
const overResult = document.getElementById('overlayResult');

document.getElementById('btnStartGame').addEventListener('click', startGame);
document.getElementById('btnPlayAgain').addEventListener('click', startGame);

// Anti-Cheat: Math-based Hit Detection on Container
nodesGrid.addEventListener('click', (e) => {
  if (!e.isTrusted) {
    console.warn("Synthetic click blocked.");
    return;
  }
  
  if (gameState !== 'playing') return;
  
  // Rate Limiter (150ms)
  const now = performance.now();
  if (now - lastTapTime < 150) return;
  lastTapTime = now;

  // Mathematical AABB Check
  const children = nodesGrid.children;
  for (let i = 0; i < children.length; i++) {
    const rect = children[i].getBoundingClientRect();
    if (e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom) {
        handleTap(i, e.clientX, e.clientY);
        break;
    }
  }
});

function initGridDOM() {
  nodesGrid.innerHTML = '';
  for (let i = 0; i < grid.length; i++) {
    const node = document.createElement('div');
    node.className = 'node';
    node.dataset.index = i;
    node.dataset.state = grid[i];
    
    // Tap handler is removed for anti-cheat. Managed by nodesGrid click listener.
    nodesGrid.appendChild(node);
  }
}

function showFloatingText(text, x, y, extraClass = "") {
  const el = document.createElement('div');
  el.className = `floating-text ${extraClass}`;
  el.innerText = text;
  el.style.left = `${x || window.innerWidth/2}px`;
  el.style.top = `${y || window.innerHeight/2}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function renderGrid() {
  const nodes = nodesGrid.children;
  for (let i = 0; i < grid.length; i++) {
    nodes[i].dataset.state = grid[i];
    if (i === corruptedNodeIdx) nodes[i].classList.add('corrupted');
    else nodes[i].classList.remove('corrupted');
  }
}

function getRandomRule() {
  const rules = [
    { id: 0, desc: "PLUS: Taps affect North, South, East, West!" },
    { id: 1, desc: "CROSS: Taps affect Diagonal nodes!" },
    { id: 2, desc: "SHOCKWAVE: Taps affect entire Row and Column!" }
  ];
  return rules[Math.floor(Math.random() * rules.length)];
}

function scrambleGrid(ruleId) {
  // Reset grid
  grid.fill(0);
  
  // Overclock mode: 1 tap solve. Normal: scale by round.
  const taps = overclockTimer > 0 ? 1 : (5 + Math.floor(currentRound * 1.5));
  for (let i = 0; i < taps; i++) {
    const randIdx = Math.floor(Math.random() * grid.length);
    applyTransformation(randIdx, ruleId, true);
  }

  // Spawn corrupted node?
  corruptedNodeIdx = -1;
  if (overclockTimer <= 0 && currentRound >= 3 && Math.random() < 0.3) {
    corruptedNodeIdx = Math.floor(Math.random() * grid.length);
  }
}

function applyTransformation(idx, ruleId, isScramble = false) {
  const row = Math.floor(idx / GRID_SIZE);
  const col = idx % GRID_SIZE;
  
  let toToggle = [idx];

  if (ruleId === 0) { // Plus
    if (row > 0) toToggle.push(idx - GRID_SIZE); // N
    if (row < GRID_SIZE - 1) toToggle.push(idx + GRID_SIZE); // S
    if (col > 0) toToggle.push(idx - 1); // W
    if (col < GRID_SIZE - 1) toToggle.push(idx + 1); // E
  } 
  else if (ruleId === 1) { // Cross (X)
    if (row > 0 && col > 0) toToggle.push(idx - GRID_SIZE - 1); // NW
    if (row > 0 && col < GRID_SIZE - 1) toToggle.push(idx - GRID_SIZE + 1); // NE
    if (row < GRID_SIZE - 1 && col > 0) toToggle.push(idx + GRID_SIZE - 1); // SW
    if (row < GRID_SIZE - 1 && col < GRID_SIZE - 1) toToggle.push(idx + GRID_SIZE + 1); // SE
  }
  else if (ruleId === 2) { // Row/Col
    for (let i = 0; i < GRID_SIZE; i++) {
      if (i !== col) toToggle.push(row * GRID_SIZE + i); // Same row
      if (i !== row) toToggle.push(i * GRID_SIZE + col); // Same col
    }
  }

  // Apply state change (cycle colors)
  toToggle.forEach(i => {
    grid[i] = (grid[i] + 1) % MAX_COLORS;
  });

  if (!isScramble) {
    // Add visual ping
    const nodes = nodesGrid.children;
    toToggle.forEach(i => {
      nodes[i].classList.remove('ping');
      void nodes[i].offsetWidth; // force reflow
      nodes[i].classList.add('ping');
    });
  }
}

function handleTap(idx, clientX, clientY) {
  totalClicks++;
  
  if (idx === corruptedNodeIdx) {
    timeLeft = Math.max(0, timeLeft - 3);
    showFloatingText("-3s", clientX, clientY, "fail");
    corruptedNodeIdx = -1;
    arena.classList.add("shake-screen");
    setTimeout(() => arena.classList.remove("shake-screen"), 300);
  }

  applyTransformation(idx, currentRule);
  renderGrid();

  checkWin();
}

function checkWin() {
  const isSolved = grid.every(val => val === 0);
  if (isSolved) {
    gameState = 'pause';
    const solveTime = (performance.now() - roundStartTime) / 1000;
    
    // Overclock Logic
    if (overclockTimer <= 0) {
      if (solveTime < 4) fastSolves++;
      else fastSolves = 0;

      if (fastSolves >= 3) {
        overclockTimer = 10000;
        fastSolves = 0;
        arena.classList.add("overclock-mode");
        showFloatingText("OVERCLOCK!", window.innerWidth/2, window.innerHeight/3, "huge");
      }
    }

    showStageClear();
    
    setTimeout(() => {
      currentRound++;
      let timeGained = Math.max(2, 10 - Math.floor(currentRound / 3));
      if (overclockTimer > 0) timeGained = 1; // Less time gained in frenzy
      timeLeft += timeGained; 
      
      const bRect = gameBoard.getBoundingClientRect();
      showFloatingText(`+${timeGained}s`, bRect.left + bRect.width/2, bRect.top, "");

      setupRound();
      gameState = 'playing';
      roundStartTime = performance.now();
    }, 800); // Faster transitions
  }
}

function showStageClear() {
  const el = document.createElement("div");
  el.className = "stage-clear";
  el.innerText = `LINK ${currentRound} FORMED`;
  arena.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

function setupRound() {
  const rule = getRandomRule();
  currentRule = rule.id;
  elRuleDesc.innerText = rule.desc;
  
  scrambleGrid(currentRule);
  renderGrid();
  updateHUD();
}

function startGame() {
  gameState = 'playing';
  currentRound = 1;
  timeLeft = 30;
  totalClicks = 0;
  fastSolves = 0;
  overclockTimer = 0;
  arena.classList.remove("overclock-mode");
  
  overStart.classList.add('hidden');
  overResult.classList.add('hidden');
  elHud.classList.remove('hidden');
  gameBoard.classList.remove('hidden');

  initGridDOM();
  setupRound();

  roundStartTime = performance.now();
  lastTickTime = performance.now();
  if (timerInterval) cancelAnimationFrame(timerInterval);
  timerInterval = requestAnimationFrame(tick);
}

function tick() {
  if (gameState !== 'ended') {
    timerInterval = requestAnimationFrame(tick);
  }
  
  const now = performance.now();
  const dt = now - lastTickTime;
  lastTickTime = now;

  if (gameState === 'playing') {
    if (overclockTimer > 0) {
      overclockTimer -= dt;
      if (overclockTimer <= 0) arena.classList.remove("overclock-mode");
    }

    timeLeft -= dt / 1000;
    updateHUD();

    if (timeLeft <= 0) {
      endGame();
    }
  }
}

function updateHUD() {
  elRound.innerText = currentRound;
  elTimer.innerText = `${Math.ceil(timeLeft)}s`;

  if (timeLeft <= 10) elTimerBox.classList.add('danger');
  else elTimerBox.classList.remove('danger');
}

function endGame() {
  gameState = 'ended';

  elHud.classList.add('hidden');
  gameBoard.classList.add('hidden');

  document.getElementById('resRounds').innerText = `Rounds: ${currentRound - 1}`;
  document.getElementById('resClicks').innerText = totalClicks;

  // Calculate tier roughly on rounds solved
  const r = currentRound - 1;
  let tier = 'C';
  let mult = 1.0;
  
  if (r >= 10) { tier = 'S'; mult = 2.0; }
  else if (r >= 6) { tier = 'A'; mult = 1.6; }
  else if (r >= 3) { tier = 'B'; mult = 1.2; }

  document.getElementById('resTier').innerText = tier;
  document.getElementById('resMult').innerText = `x${mult.toFixed(1)}`;
  
  const kicker = document.getElementById('resKicker');
  if (r === 0) {
    kicker.innerText = "Connection Failed";
    kicker.classList.add('fail');
  } else {
    kicker.innerText = "Simulation Ended";
    kicker.classList.remove('fail');
  }

  overResult.classList.remove('hidden');

  // --- PARENT COMMUNICATION LOGIC ---
  // Sends the calculated multiplier and game stats to the parent React app (SoloEarn.tsx)
  // so the platform can process the user's final payout based on their performance.
  if (window.parent) {
    window.parent.postMessage({ type: 'GAME_OVER', payload: { multiplier: mult } }, '*');
  }
}
