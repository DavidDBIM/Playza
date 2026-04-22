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

// Timers
let timerInterval = null;

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

function initGridDOM() {
  nodesGrid.innerHTML = '';
  for (let i = 0; i < grid.length; i++) {
    const node = document.createElement('div');
    node.className = 'node';
    node.dataset.index = i;
    node.dataset.state = grid[i];
    
    // Tap handler
    node.addEventListener('pointerdown', (e) => handleTap(i, e.currentTarget));
    nodesGrid.appendChild(node);
  }
}

function renderGrid() {
  const nodes = nodesGrid.children;
  for (let i = 0; i < grid.length; i++) {
    nodes[i].dataset.state = grid[i];
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
  
  // Randomly simulate taps to guarantee solvability
  const taps = 5 + Math.floor(currentRound * 1.5); // Harder rounds = more scramble depth
  for (let i = 0; i < taps; i++) {
    const randIdx = Math.floor(Math.random() * grid.length);
    applyTransformation(randIdx, ruleId, true);
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

function handleTap(idx, el) {
  if (gameState !== 'playing') return;
  totalClicks++;
  
  applyTransformation(idx, currentRule);
  renderGrid();

  checkWin();
}

function checkWin() {
  const isSolved = grid.every(val => val === 0);
  if (isSolved) {
    // Advance Round
    gameState = 'pause';
    showStageClear();
    
    setTimeout(() => {
      currentRound++;
      timeLeft += Math.max(5, 15 - Math.floor(currentRound / 2)); // Add time back
      setupRound();
      gameState = 'playing';
    }, 1500);
  }
}

function showStageClear() {
  const el = document.createElement("div");
  el.className = "stage-clear";
  el.innerText = `LINK ${currentRound} FORMED`;
  arena.appendChild(el);
  setTimeout(() => el.remove(), 1500);
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
  
  overStart.classList.add('hidden');
  overResult.classList.add('hidden');
  elHud.classList.remove('hidden');
  gameBoard.classList.remove('hidden');

  initGridDOM();
  setupRound();

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(tick, 1000);
}

function tick() {
  if (gameState !== 'playing') return;
  timeLeft--;
  updateHUD();

  if (timeLeft <= 0) {
    endGame();
  }
}

function updateHUD() {
  elRound.innerText = currentRound;
  elTimer.innerText = `${timeLeft}s`;

  if (timeLeft <= 10) elTimerBox.classList.add('danger');
  else elTimerBox.classList.remove('danger');
}

function endGame() {
  gameState = 'ended';
  if (timerInterval) clearInterval(timerInterval);

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
}
