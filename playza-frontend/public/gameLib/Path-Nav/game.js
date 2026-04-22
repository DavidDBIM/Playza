// Global State
let gameState = 'start'; // start, running, ended
let distance = 0;
let junctionsCleared = 0;
let combo = 0;
let multiplier = 1.0;
let baseSpeed = 10;
let currentJunction = null; // { type: 'left'|'right'|'straight', active: boolean, id: number }

let loopInterval = null;
let distanceInterval = null;
let junctionTimeout = null;

// DOM Elements
const hudHud = document.getElementById("gameHud");
const uiDistance = document.getElementById("hudDistance");
const uiJunctions = document.getElementById("hudJunctions");
const uiCombo = document.getElementById("hudCombo");

const overlayStart = document.getElementById("overlayStart");
const overlayResult = document.getElementById("overlayResult");
const controls = document.getElementById("controlsOverlay");

const btnStart = document.getElementById("btnStartGame");
const btnPlayAgain = document.getElementById("btnPlayAgain");

const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");
const btnStraight = document.getElementById("btnStraight");

const arena = document.getElementById("arena");
const playerNode = document.getElementById("player");
const groundGrid = document.getElementById("groundGrid");
const pathContainer = document.getElementById("pathContainer");

// Events
btnStart.addEventListener("click", startGame);
btnPlayAgain.addEventListener("click", startGame);

// Inputs
btnLeft.addEventListener("pointerdown", () => handleInput('left'));
btnRight.addEventListener("pointerdown", () => handleInput('right'));
btnStraight.addEventListener("pointerdown", () => handleInput('straight'));

// Keyboard support
window.addEventListener('keydown', (e) => {
  if (gameState !== 'running') return;
  if (e.key === 'ArrowLeft' || e.key === 'a') handleInput('left');
  if (e.key === 'ArrowRight' || e.key === 'd') handleInput('right');
  if (e.key === 'ArrowUp' || e.key === 'w') handleInput('straight');
});

function startGame() {
  gameState = 'running';
  distance = 0;
  junctionsCleared = 0;
  combo = 0;
  multiplier = 1.0;
  baseSpeed = 10;
  currentJunction = null;

  // Reset UI
  overlayStart.classList.add("hidden");
  overlayResult.classList.add("hidden");
  hudHud.classList.remove("hidden");
  controls.classList.remove("hidden");
  pathContainer.innerHTML = '';
  
  updateHUD();

  // Arena animations
  playerNode.classList.add('run-anim');
  groundGrid.classList.add('moving');
  arena.classList.remove('screen-shake');
  
  // Loops
  if (distanceInterval) clearInterval(distanceInterval);
  distanceInterval = setInterval(() => {
    if (gameState !== 'running') return;
    // Speed increases slightly over time
    baseSpeed += 0.05;
    distance += Math.floor(baseSpeed / 2);
    updateHUD();
    
    // Adjust ground animation speed
    const animDuration = Math.max(0.2, 1.5 - (baseSpeed * 0.02));
    groundGrid.style.animationDuration = `${animDuration}s`;
    playerNode.style.animationDuration = `${animDuration / 2}s`;
  }, 100);

  scheduleNextJunction();
}

function endGame() {
  gameState = 'ended';
  playerNode.classList.remove('run-anim');
  groundGrid.classList.remove('moving');
  controls.classList.add('hidden');
  
  if (distanceInterval) clearInterval(distanceInterval);
  if (junctionTimeout) clearTimeout(junctionTimeout);

  // Crash Shake
  arena.classList.add('screen-shake');
  
  // Red Flash
  const flash = document.createElement('div');
  flash.className = 'crash-flash';
  arena.appendChild(flash);

  setTimeout(() => {
    hudHud.classList.add("hidden");
    
    const accuracy = junctionsCleared > 0 ? 100 : 0; // Simple since 1 miss = dead
    let tier = 'C';
    if(junctionsCleared > 20) tier = 'S';
    else if(junctionsCleared > 10) tier = 'A';
    else if(junctionsCleared > 5) tier = 'B';

    document.getElementById("resDistance").innerText = `${distance}m`;
    document.getElementById("resJunctions").innerText = junctionsCleared;
    document.getElementById("resTier").innerText = tier;
    document.getElementById("resMult").innerText = `x${multiplier.toFixed(1)}`;
    
    overlayResult.classList.remove("hidden");
  }, 800);
}

function scheduleNextJunction() {
  if (gameState !== 'running') return;

  // Time until next junction decreases as speed goes up
  const baseDelay = 3000;
  const actualDelay = Math.max(800, baseDelay - (baseSpeed * 50));

  junctionTimeout = setTimeout(spawnJunction, actualDelay);
}

function spawnJunction() {
  if (gameState !== 'running') return;

  const types = ['left', 'right', 'straight'];
  const answer = types[Math.floor(Math.random() * types.length)];
  
  const jctId = Date.now();
  currentJunction = { type: answer, active: true, id: jctId };

  // Visual Cue - Text floating down the track
  const marker = document.createElement('div');
  marker.className = 'junction-text';
  marker.innerText = answer === 'left' ? '↰' : answer === 'right' ? '↱' : '↑';
  
  // Fake inputs (traps) at higher speeds
  if (baseSpeed > 15 && Math.random() > 0.6) {
     marker.innerText = answer === 'left' ? 'RIGHT?' : 'LEFT?'; // Confuse player
     marker.style.color = '#ef4444'; 
  }

  // Animate down the path
  const duration = Math.max(800, 2500 - (baseSpeed * 40));
  
  marker.style.transition = `all ${duration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
  pathContainer.appendChild(marker);

  // Next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      marker.style.opacity = '1';
      marker.style.transform = 'translate(-50%, 0) scale(3) translateY(300px)';
    });
  });

  // Time window to answer
  setTimeout(() => {
     if (gameState === 'running' && currentJunction && currentJunction.id === jctId && currentJunction.active) {
        // Missed the window!
        showFeedback(false);
        endGame();
     }
     if(marker.parentNode) marker.remove();
  }, duration);
}

function handleInput(direction) {
  if (gameState !== 'running') return;

  // Visual button press feedback (simulate swipe/tap movement)
  playerNode.style.transform = `translate(calc(-50% ${direction === 'left' ? '- 40px' : direction === 'right' ? '+ 40px' : ''}), 0)`;
  setTimeout(() => {
    if(gameState === 'running') playerNode.style.transform = 'translate(-50%, 0)';
  }, 150);

  if (!currentJunction || !currentJunction.active) {
    // Punish random clicking
    showFeedback(false);
    endGame();
    return;
  }

  // Check answer
  if (direction === currentJunction.type) {
    // Correct!
    currentJunction.active = false;
    junctionsCleared++;
    combo++;
    multiplier = Math.min(2.0, 1.0 + (combo * 0.05));
    distance += 50; // Bonus shift
    
    showFeedback(true);
    updateHUD();
    
    scheduleNextJunction();
  } else {
    // Wrong!
    showFeedback(false);
    endGame();
  }
}

function showFeedback(isGood) {
  const fb = document.createElement('div');
  fb.className = `choice-feedback ${isGood ? '' : 'bad'}`;
  fb.innerText = isGood ? 'PERFECT' : 'CRASHED';
  arena.appendChild(fb);
  setTimeout(() => { if(fb.parentNode) fb.remove(); }, 800);
}

function updateHUD() {
  uiDistance.innerText = `${distance}m`;
  uiJunctions.innerText = junctionsCleared;
  uiCombo.innerText = `x${multiplier.toFixed(1)}`;
}
