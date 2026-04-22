// Game State
let gameState = "start"; // start, playing, ended
let timeLeft = 45;
let ammo = 30;
let score = 0;
let combo = 0;
let multiplier = 1.0;
let shotsFired = 0;
let hits = 0;

let timerInterval = null;
let spawnInterval = null;
let gameLoopInterval = null;

// Constants
const GAME_DURATION = 45;
const INITIAL_AMMO = 30;

const SIZE_MAP = {
  small: { px: 32, points: 3 },
  medium: { px: 48, points: 2 },
  large: { px: 64, points: 1 }
};

// DOM Elements
const hudBox = document.getElementById("gameHud");
const arena = document.getElementById("arena");
const targetContainer = document.getElementById("targetContainer");

const elScore = document.getElementById("hudScore");
const elCombo = document.getElementById("hudCombo");
const elComboCount = document.getElementById("hudComboCount");
const elTimer = document.getElementById("hudTimer");
const elAmmo = document.getElementById("hudAmmo");
const elTimerBox = document.getElementById("hudTimerBox");
const elAmmoBox = document.getElementById("hudAmmoBox");

const overStart = document.getElementById("overlayStart");
const overResult = document.getElementById("overlayResult");
const btnStart = document.getElementById("btnStartGame");
const btnPlayAgain = document.getElementById("btnPlayAgain");

// Events
btnStart.addEventListener("click", startGame);
btnPlayAgain.addEventListener("click", startGame);

// Prevent context menu (right click) on arena
arena.addEventListener("contextmenu", e => e.preventDefault());

// Arena shooting
arena.addEventListener("pointerdown", handleArenaClick);


function startGame() {
  gameState = "playing";
  timeLeft = GAME_DURATION;
  ammo = INITIAL_AMMO;
  score = 0;
  combo = 0;
  multiplier = 1.0;
  shotsFired = 0;
  hits = 0;

  // UI Reset
  overStart.classList.add("hidden");
  overResult.classList.add("hidden");
  hudBox.classList.remove("hidden");
  targetContainer.innerHTML = "";
  
  updateHUD();

  // Loops
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(tickTime, 1000);
  
  if(gameLoopInterval) clearInterval(gameLoopInterval);
  gameLoopInterval = setInterval(gameLoop, 100);

  scheduleSpawn();
}

function endGame() {
  gameState = "ended";
  if(timerInterval) clearInterval(timerInterval);
  if(spawnInterval) clearTimeout(spawnInterval);
  if(gameLoopInterval) clearInterval(gameLoopInterval);

  targetContainer.innerHTML = "";
  hudBox.classList.add("hidden");
  
  const acc = shotsFired > 0 ? Math.round((hits / shotsFired) * 100) : 0;
  const tier = acc >= 90 ? "S" : acc >= 75 ? "A" : acc >= 50 ? "B" : "C";

  document.getElementById("resScore").innerText = score.toLocaleString();
  document.getElementById("resAccuracy").innerText = `${acc}%`;
  document.getElementById("resTier").innerText = tier;

  overResult.classList.remove("hidden");
}

function tickTime() {
  timeLeft--;
  updateHUD();
  if (timeLeft <= 0) {
    endGame();
  }
}

function gameLoop() {
  const now = Date.now();
  const targets = document.querySelectorAll('.target-wrap');
  
  targets.forEach(t => {
    // If lifespan expired and not already hit/missed
    if(!t.classList.contains('target-hit') && !t.classList.contains('target-miss')) {
      const createdAt = parseInt(t.dataset.created);
      const lifespan = parseInt(t.dataset.lifespan);
      if (now - createdAt > lifespan) {
        // Miss!
        t.classList.add('target-miss');
        setTimeout(() => t.remove(), 200);
      }
    }
  });
}

function scheduleSpawn() {
  if (gameState !== "playing") return;
  
  spawnTarget();

  const diffFactor = (GAME_DURATION - timeLeft) / GAME_DURATION; // 0 to 1
  const spawnRate = Math.max(400, 1200 - (diffFactor * 800));
  
  spawnInterval = setTimeout(scheduleSpawn, spawnRate);
}

function spawnTarget() {
  // Cap targets so they don't over clutter
  const currentCount = document.querySelectorAll('.target-wrap:not(.target-hit):not(.target-miss)').length;
  const diffFactor = (GAME_DURATION - timeLeft) / GAME_DURATION;
  if(currentCount > 5 + Math.floor(diffFactor * 5)) return;

  const sizeRoll = Math.random();
  let size = "large";
  if (diffFactor > 0.6) {
    size = sizeRoll > 0.6 ? "small" : sizeRoll > 0.2 ? "medium" : "large";
  } else if (diffFactor > 0.3) {
    size = sizeRoll > 0.4 ? "medium" : "large";
  }

  const speedRoll = Math.random();
  const speed = speedRoll > 0.7 ? "fast" : speedRoll > 0.3 ? "medium" : "slow";

  const patRoll = Math.random();
  const pattern = patRoll > 0.8 ? "diagonal" : patRoll > 0.5 ? "horizontal" : patRoll > 0.2 ? "vertical" : "static";

  const baseLifespan = speed === "fast" ? 1500 : speed === "medium" ? 2200 : 3000;
  const lifespan = Math.max(800, baseLifespan - (diffFactor * 1000));

  const x = 10 + Math.random() * 80;
  const y = 10 + Math.random() * 80;

  createTargetDOM(x, y, size, speed, pattern, lifespan);
}

function createTargetDOM(x, y, size, speed, pattern, lifespan) {
  const el = document.createElement("div");
  el.className = "target-wrap";
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  el.dataset.size = size;
  el.dataset.speed = speed;
  el.dataset.created = Date.now();
  el.dataset.lifespan = lifespan;

  const sizeData = SIZE_MAP[size];
  
  el.innerHTML = `
    <div class="target-circle" style="width: ${sizeData.px}px; height: ${sizeData.px}px;">
      <div class="target-inner-1">
        <div class="target-inner-2"></div>
      </div>
    </div>
  `;

  // Pattern logic via CSS vars for transitions or simple CSS
  // To keep it clean without libraries, we apply simple drift translations
  const drift = speed === "fast" ? 30 : speed === "medium" ? 20 : 10;
  if (pattern !== "static") {
    let animName = "drift" + Math.random().toString(36).substring(7);
    let keyframes = "";
    if (pattern === "horizontal") {
      keyframes = `@keyframes ${animName} { 
        0%, 100% { transform: translate(-50%, -50%); } 
        25% { transform: translate(calc(-50% - ${drift}px), -50%); } 
        75% { transform: translate(calc(-50% + ${drift}px), -50%); } 
      }`;
    } else if (pattern === "vertical") {
      keyframes = `@keyframes ${animName} { 
        0%, 100% { transform: translate(-50%, -50%); } 
        25% { transform: translate(-50%, calc(-50% - ${drift}px)); } 
        75% { transform: translate(-50%, calc(-50% + ${drift}px)); } 
      }`;
    } else if (pattern === "diagonal") {
      keyframes = `@keyframes ${animName} { 
        0%, 100% { transform: translate(-50%, -50%); } 
        25% { transform: translate(calc(-50% - ${drift}px), calc(-50% - ${drift}px)); } 
        75% { transform: translate(calc(-50% + ${drift}px), calc(-50% + ${drift}px)); } 
      }`;
    }
    
    const style = document.createElement('style');
    style.innerHTML = keyframes;
    document.head.appendChild(style);

    // After adding style, apply animation
    // Timeout needed occasionally for DOM styling reflow
    setTimeout(() => {
      el.style.animation = `${animName} 1.5s ease-in-out infinite`;
    }, 10);
  }

  targetContainer.appendChild(el);

  // Trigger spawn animation
  requestAnimationFrame(() => {
    el.classList.add("spawned");
  });
}

function handleArenaClick(e) {
  if (gameState !== "playing" || ammo <= 0) return;

  // Determine hit
  const target = e.target.closest('.target-wrap');
  
  if (target && !target.classList.contains('target-hit') && !target.classList.contains('target-miss')) {
     fireShot(true, target, e.clientX, e.clientY);
  } else {
     fireShot(false, null, e.clientX, e.clientY);
  }
}

function fireShot(isHit, targetEl, mouseX, mouseY) {
  ammo--;
  shotsFired++;

  if (isHit) {
    hits++;
    const size = targetEl.dataset.size;
    const speed = targetEl.dataset.speed;
    const sizeConfig = SIZE_MAP[size];
    
    let basePts = sizeConfig.points;
    if (speed === "fast") basePts *= 1.5;

    combo++;
    multiplier = Math.min(2.0, 1 + (combo * 0.1));
    const gained = Math.floor(basePts * multiplier * 100);
    score += gained;

    targetEl.classList.add("target-hit");
    setTimeout(() => targetEl.remove(), 200);

    // Show popup
    showHitPopup(mouseX, mouseY, `+${gained}`);

  } else {
    combo = 0;
    multiplier = 1.0;
  }

  updateHUD();

  if (ammo <= 0) {
    endGame();
  }
}

function showHitPopup(x, y, text) {
  const el = document.createElement("div");
  el.className = "hit-popup";
  el.innerText = text;
  
  // Calculate relative to arena
  const rect = arena.getBoundingClientRect();
  el.style.left = `${x - rect.left}px`;
  el.style.top = `${y - rect.top}px`;
  
  targetContainer.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

function updateHUD() {
  elScore.innerText = score.toLocaleString();
  elCombo.innerHTML = `x${multiplier.toFixed(1)} <small id="hudComboCount">(${combo})</small>`;
  elTimer.innerText = `${timeLeft}s`;
  elAmmo.innerText = ammo;

  if (timeLeft < 10) elTimerBox.classList.add("danger");
  else elTimerBox.classList.remove("danger");

  if (ammo < 5) elAmmoBox.classList.add("danger");
  else elAmmoBox.classList.remove("danger");
}
