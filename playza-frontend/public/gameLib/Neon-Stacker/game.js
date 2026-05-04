// Audio Context for juicy sound effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, type, duration, vol=0.1) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playPlaceSound(pitchMod = 0) {
  playTone(300 + pitchMod * 10, 'sine', 0.1, 0.15);
  setTimeout(() => playTone(400 + pitchMod * 10, 'triangle', 0.15, 0.1), 50);
}
function playChopSound() { playTone(150, 'sawtooth', 0.2, 0.2); }
function playPerfectSound() { 
  playTone(880, 'sine', 0.1, 0.2); 
  setTimeout(() => playTone(1100, 'sine', 0.3, 0.2), 100); 
}
function playFallSound() { playTone(100, 'square', 0.5, 0.3); }

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let w, h;
function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// DOM
const shell = document.getElementById('shell');
const btnStart = document.getElementById('btnStartGame');
const btnPlayAgain = document.getElementById('btnPlayAgain');
const overlayStart = document.getElementById('overlayStart');
const overlayResult = document.getElementById('overlayResult');
const gameHud = document.getElementById('gameHud');
const hudScore = document.getElementById('hudScore');
const hudMult = document.getElementById('hudMult');

// Game State
let gameState = 'start'; // start, playing, ended
let blocks = []; // Stacked blocks
let activeBlock = null; // Block currently moving
let debris = []; // Chopped off pieces falling
let particles = []; // Visual flair

let score = 0;
let perfects = 0;
let multiplier = 0.0;
let cameraY = 0;
let targetCameraY = 0;
let lastTime = 0;

const MAX_SCORE = 20;
const MAX_MULTIPLIER = 2.0;
const BLOCK_HEIGHT = 40;
const PERFECT_TOLERANCE = 5; // pixels
let baseWidth = 200;

// Colors
const colors = [
  '#a855f7', '#ec4899', '#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6'
];

function getBlockColor(index) {
  return colors[index % colors.length];
}

// Events
btnStart.addEventListener('click', startGame);
btnPlayAgain.addEventListener('click', () => {
  if (window.parent) window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
});
shell.addEventListener('mousedown', handleTap);
shell.addEventListener('touchstart', handleTap, {passive: false});

function startGame(e) {
  if (e) e.stopPropagation();
  resize();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  gameState = 'playing';
  score = 0;
  perfects = 0;
  multiplier = 0.0;
  cameraY = h - 150;
  targetCameraY = cameraY;
  baseWidth = Math.min(250, w * 0.6); // Scale to mobile
  
  blocks = [];
  debris = [];
  particles = [];
  
  // Base block
  blocks.push({
    x: w / 2 - baseWidth / 2,
    y: 0, // Y is relative to 0 at the bottom of the stack
    w: baseWidth,
    h: BLOCK_HEIGHT,
    color: '#475569' // Base color
  });

  spawnBlock();

  overlayStart.classList.add('hidden');
  overlayResult.classList.add('hidden');
  gameHud.classList.remove('hidden');
  document.body.classList.remove('shake');

  updateHUD();
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function spawnBlock() {
  const lastBlock = blocks[blocks.length - 1];
  const newWidth = lastBlock.w;
  const newY = lastBlock.y + BLOCK_HEIGHT;
  
  // Target camera slightly below center screen
  targetCameraY = h - 200 - newY;
  
  // Determine speed based on score
  const speed = 200 + (score * 15);
  const dir = Math.random() > 0.5 ? 1 : -1;
  const startX = dir === 1 ? -newWidth : w;

  activeBlock = {
    x: startX,
    y: newY,
    w: newWidth,
    h: BLOCK_HEIGHT,
    color: getBlockColor(score),
    vx: speed * dir
  };
}

function handleTap(e) {
  if (e) e.preventDefault(); // Prevent double fire on touch
  if (gameState !== 'playing' || !activeBlock) return;

  const lastBlock = blocks[blocks.length - 1];
  
  // Calculate difference
  const diff = activeBlock.x - lastBlock.x;
  const absDiff = Math.abs(diff);

  if (absDiff > activeBlock.w) {
    // Completely missed
    loseGame();
    return;
  }

  // Check Perfect
  if (absDiff <= PERFECT_TOLERANCE) {
    // Perfect alignment
    activeBlock.x = lastBlock.x; // Snap
    perfects++;
    playPerfectSound();
    createParticles(activeBlock.x + activeBlock.w/2, activeBlock.y, activeBlock.color);
    
    // Optional: expand width slightly on multiple perfects (for juice)
    if (perfects % 3 === 0) {
      activeBlock.w = Math.min(baseWidth, activeBlock.w + 10);
      activeBlock.x -= 5;
    }
  } else {
    // Chopped
    playChopSound();
    
    let dropX, dropW;
    
    if (diff > 0) {
      // Overhanging right
      activeBlock.w -= diff;
      dropX = activeBlock.x + activeBlock.w;
      dropW = diff;
    } else {
      // Overhanging left
      activeBlock.w -= absDiff;
      activeBlock.x = lastBlock.x;
      dropX = lastBlock.x - absDiff;
      dropW = absDiff;
    }

    // Create debris
    debris.push({
      x: dropX,
      y: activeBlock.y,
      w: dropW,
      h: BLOCK_HEIGHT,
      color: activeBlock.color,
      vy: 0,
      vx: (Math.random() - 0.5) * 100,
      rot: 0,
      vrot: (Math.random() - 0.5) * 5
    });
  }

  // Solidify block
  blocks.push({...activeBlock});
  activeBlock = null;
  score++;
  
  // Update Multiplier
  multiplier = Math.min(MAX_MULTIPLIER, (score / MAX_SCORE) * MAX_MULTIPLIER);
  updateHUD();

  if (score >= MAX_SCORE) {
    winGame();
  } else {
    if (absDiff > PERFECT_TOLERANCE) playPlaceSound(score); // Only play place if not perfect
    spawnBlock();
  }
}

function gameLoop(now) {
  if (gameState === 'start') return;
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  update(dt);
  draw();

  requestAnimationFrame(gameLoop);
}

function update(dt) {
  // Smooth Camera
  cameraY += (targetCameraY - cameraY) * 5 * dt;

  if (gameState === 'playing' && activeBlock) {
    activeBlock.x += activeBlock.vx * dt;
    
    // Bounce off walls
    if (activeBlock.x <= 0 && activeBlock.vx < 0) {
      activeBlock.x = 0;
      activeBlock.vx *= -1;
    } else if (activeBlock.x + activeBlock.w >= w && activeBlock.vx > 0) {
      activeBlock.x = w - activeBlock.w;
      activeBlock.vx *= -1;
    }
  }

  // Debris Physics
  for (let i = debris.length - 1; i >= 0; i--) {
    let d = debris[i];
    d.vy += 800 * dt; // gravity
    d.x += d.vx * dt;
    d.y -= d.vy * dt; // Y is visually upwards, so subtract to fall down on screen
    d.rot += d.vrot * dt;

    // Remove if off screen
    if (cameraY - d.y > h + 100) debris.splice(i, 1);
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx * dt;
    p.y -= p.vy * dt;
    p.life -= dt * 2;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function draw() {
  ctx.clearRect(0, 0, w, h);

  // Draw Grid Lines Background (scrolling)
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  const gridOffset = cameraY % 50;
  for (let y = gridOffset; y < h; y += 50) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  for (let x = 0; x < w; x += 50) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }

  ctx.save();
  // Transform canvas so 0,0 is bottom left visually, but affected by camera
  ctx.translate(0, cameraY);

  // Draw Blocks
  for (let b of blocks) {
    drawGlowingRect(b.x, -b.y, b.w, b.h, b.color, false);
  }

  // Draw Active Block
  if (activeBlock) {
    drawGlowingRect(activeBlock.x, -activeBlock.y, activeBlock.w, activeBlock.h, activeBlock.color, true);
  }

  // Draw Debris
  for (let d of debris) {
    ctx.save();
    ctx.translate(d.x + d.w/2, -d.y + d.h/2);
    ctx.rotate(d.rot);
    drawGlowingRect(-d.w/2, -d.h/2, d.w, d.h, d.color, false, true);
    ctx.restore();
  }

  // Draw Particles
  for (let p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, -p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  ctx.restore();
}

function drawGlowingRect(x, y, width, height, color, isActive=false, isDebris=false) {
  ctx.fillStyle = isDebris ? 'rgba(255,255,255,0.5)' : color;
  ctx.shadowColor = color;
  ctx.shadowBlur = isActive ? 20 : (isDebris ? 0 : 10);
  
  // Block body
  ctx.fillRect(x, y, width, height);
  
  // Top highlight
  if (!isDebris) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.shadowBlur = 0;
    ctx.fillRect(x, y, width, 4);
  }
}

function createParticles(x, y, color) {
  for (let i=0; i<15; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 400,
      vy: (Math.random() - 0.5) * 400,
      life: 1.0,
      size: Math.random() * 4 + 2,
      color: color
    });
  }
}

function updateHUD() {
  hudScore.innerText = score;
  hudMult.innerText = `x${multiplier.toFixed(2)}`;

  if (window.parent) {
    window.parent.postMessage({ type: 'SCORE_UPDATE', payload: { multiplier: multiplier } }, '*');
  }
}

function loseGame() {
  gameState = 'ended';
  activeBlock = null;
  document.body.classList.add('shake');
  playFallSound();
  
  // Make the top block fall as debris
  if (blocks.length > 1) {
    const topBlock = blocks.pop();
    debris.push({
      x: topBlock.x, y: topBlock.y, w: topBlock.w, h: topBlock.h,
      color: topBlock.color, vy: 200, vx: (Math.random()-0.5)*200, rot: 0, vrot: (Math.random()-0.5)*5
    });
  }
  
  setTimeout(() => showResult("COLLAPSE", false), 1500);
}

function winGame() {
  gameState = 'ended';
  activeBlock = null;
  
  playTone(880, 'sine', 0.2, 0.2);
  setTimeout(() => playTone(1100, 'sine', 0.4, 0.2), 200);
  
  // Firework particles at the top
  const topY = blocks[blocks.length-1].y;
  createParticles(w/2, topY, '#22c55e');
  
  setTimeout(() => showResult("ESCAPE VELOCITY", true), 1500);
}

function showResult(title, isWin) {
  gameHud.classList.add('hidden');
  
  document.getElementById('resTitle').innerText = title;
  document.getElementById('resTitle').className = isWin ? "res-title success" : "res-title";
  
  document.getElementById('resBlocks').innerText = score;
  document.getElementById('resPerfects').innerText = perfects;
  
  document.getElementById('resMult').innerText = `x${multiplier.toFixed(2)}`;
  document.getElementById('resKicker').innerText = isWin ? "Maximum altitude reached." : "The structure became too unstable.";

  overlayResult.classList.remove('hidden');

  if (window.parent) {
    window.parent.postMessage({ type: 'GAME_OVER', payload: { multiplier: multiplier } }, '*');
  }
}
