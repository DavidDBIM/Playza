const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM
const overlayStart = document.getElementById('overlayStart');
const overlayResult = document.getElementById('overlayResult');
const gameHud = document.getElementById('gameHud');
const btnStartGame = document.getElementById('btnStartGame');
const btnPlayAgain = document.getElementById('btnPlayAgain');

const hudTimer = document.getElementById('hudTimer');
const hudSpeed = document.getElementById('hudSpeed');
const hudTimerBox = document.getElementById('hudTimerBox');

const resTitle = document.getElementById('resTitle');
const resTime = document.getElementById('resTime');
const resTier = document.getElementById('resTier');
const resMult = document.getElementById('resMult');
const resKicker = document.getElementById('resKicker');

// Game Settings
const MAX_TIME = 30; // Seconds to reach 2.0x
const TARGET_FPS = 60;
const FRAME_MS = 1000 / TARGET_FPS;

// State
let gameState = 'start'; // start, playing, ended
let survivalTime = 0; // seconds
let lastTime = 0;
let multiplier = 0;

// Player
const player = {
  x: 0,
  y: 0,
  width: 30,
  height: 40,
  speed: 400, // pixels per second
  color: '#38bdf8',
  vx: 0
};

// World
let baseScrollSpeed = 300;
let scrollSpeed = baseScrollSpeed;
let obstacles = [];
let particles = [];
let distance = 0;
let lastObstacleSpawn = 0;

// Resize handling
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (gameState === 'start') {
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
  }
}
window.addEventListener('resize', resize);

// Input
const keys = { ArrowLeft: false, ArrowRight: false, a: false, d: false };
window.addEventListener('keydown', e => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
  if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', e => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
  if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false;
});

// Touch controls for mobile
let touchX = null;
window.addEventListener('touchstart', e => {
  touchX = e.touches[0].clientX;
});
window.addEventListener('touchmove', e => {
  if (!touchX) return;
  const currX = e.touches[0].clientX;
  const diff = currX - touchX;
  if (diff > 20) { keys.ArrowRight = true; keys.ArrowLeft = false; }
  else if (diff < -20) { keys.ArrowLeft = true; keys.ArrowRight = false; }
  else { keys.ArrowLeft = false; keys.ArrowRight = false; }
});
window.addEventListener('touchend', e => {
  keys.ArrowLeft = false;
  keys.ArrowRight = false;
  touchX = null;
});

// Start Game
btnStartGame.addEventListener('click', startGame);
btnPlayAgain.addEventListener('click', () => {
  if (window.parent) window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
});

function startGame() {
  resize();
  gameState = 'playing';
  survivalTime = 0;
  multiplier = 0.0;
  distance = 0;
  scrollSpeed = baseScrollSpeed;
  obstacles = [];
  particles = [];
  
  player.x = canvas.width / 2;
  player.y = canvas.height - 100;
  player.vx = 0;

  overlayStart.classList.add('hidden');
  overlayResult.classList.add('hidden');
  gameHud.classList.remove('hidden');
  document.body.classList.remove('shake');

  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function gameLoop(time) {
  if (gameState !== 'playing') return;

  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  update(deltaTime);
  draw();

  requestAnimationFrame(gameLoop);
}

function update(dt) {
  // Survival Time & Multiplier
  survivalTime += dt;
  multiplier = Math.min(2.0, (survivalTime / MAX_TIME) * 2.0);

  // Speed scaling
  scrollSpeed = baseScrollSpeed + (survivalTime * 25);
  distance += scrollSpeed * dt;

  // Player Movement
  let dir = 0;
  if (keys.ArrowLeft || keys.a) dir -= 1;
  if (keys.ArrowRight || keys.d) dir += 1;
  
  player.vx += dir * player.speed * 10 * dt; // Acceleration
  player.vx *= 0.85; // Friction
  player.x += player.vx * dt;

  // Bounds
  const margin = 50;
  if (player.x < margin) { player.x = margin; player.vx = 0; }
  if (player.x > canvas.width - margin) { player.x = canvas.width - margin; player.vx = 0; }

  // Spawn Obstacles
  lastObstacleSpawn -= scrollSpeed * dt;
  if (lastObstacleSpawn <= 0) {
    spawnObstacle();
    // Spawn rate increases as game goes on
    const spawnDist = Math.max(250, 600 - (survivalTime * 15));
    lastObstacleSpawn = spawnDist;
  }

  // Update Obstacles & Collision
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.y += scrollSpeed * dt;

    // Collision (AABB)
    // A bit forgiving collision box
    const shrink = 10;
    if (
      player.x - player.width/2 + shrink < obs.x + obs.width &&
      player.x + player.width/2 - shrink > obs.x &&
      player.y - player.height/2 + shrink < obs.y + obs.height &&
      player.y + player.height/2 - shrink > obs.y
    ) {
      crash();
      return;
    }

    if (obs.y > canvas.height + 100) {
      obstacles.splice(i, 1);
    }
  }

  // Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt + (scrollSpeed * dt * 0.5); // move down with world
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Engine trail
  if (Math.random() < 0.5) {
    particles.push({
      x: player.x + (Math.random() * 10 - 5),
      y: player.y + player.height/2,
      vx: 0,
      vy: Math.random() * 50,
      life: 0.3,
      color: '#38bdf8',
      size: Math.random() * 4 + 2
    });
  }

  updateHUD();

  // Win condition
  if (multiplier >= 2.0) {
    win();
  }
}

function spawnObstacle() {
  const types = ['block', 'moving', 'wall_left', 'wall_right'];
  const type = types[Math.floor(Math.random() * types.length)];
  const width = canvas.width - 100; // playable area

  let obs = {
    y: -100,
    height: 30,
    type: type,
    vx: 0
  };

  if (type === 'block') {
    obs.width = Math.random() * 150 + 100;
    obs.x = 50 + Math.random() * (width - obs.width);
  } else if (type === 'moving') {
    obs.width = 120;
    obs.x = 50 + Math.random() * (width - obs.width);
    obs.vx = (Math.random() > 0.5 ? 1 : -1) * (150 + Math.random() * 100);
  } else if (type === 'wall_left') {
    obs.width = Math.random() * (width * 0.6) + 50;
    obs.x = 0;
  } else if (type === 'wall_right') {
    obs.width = Math.random() * (width * 0.6) + 50;
    obs.x = canvas.width - obs.width;
  }

  obstacles.push(obs);
}

function draw() {
  // Clear
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Grid Lines (Speed lines effect)
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
  ctx.lineWidth = 2;
  const offset = distance % 100;
  for (let y = -100 + offset; y < canvas.height; y += 100) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let x = 50; x < canvas.width; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Draw Obstacles
  ctx.shadowBlur = 15;
  for (let obs of obstacles) {
    if (obs.type === 'moving') obs.x += obs.vx * (FRAME_MS/1000); // Simple move for drawing
    if (obs.type === 'moving' && (obs.x < 50 || obs.x + obs.width > canvas.width - 50)) obs.vx *= -1;

    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }

  // Draw Particles
  ctx.shadowBlur = 5;
  for (let p of particles) {
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.globalAlpha = Math.max(0, p.life * 3);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // Draw Player
  if (gameState === 'playing') {
    ctx.fillStyle = player.color;
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.moveTo(player.x, player.y - player.height/2); // top
    ctx.lineTo(player.x + player.width/2, player.y + player.height/2); // right
    ctx.lineTo(player.x, player.y + player.height/4); // bottom center indent
    ctx.lineTo(player.x - player.width/2, player.y + player.height/2); // left
    ctx.closePath();
    ctx.fill();
  }
  
  ctx.shadowBlur = 0;
}

function updateHUD() {
  hudTimer.innerText = survivalTime.toFixed(1) + 's';
  hudSpeed.innerText = scrollSpeed.toFixed(0) + ' km/h';

  if (multiplier >= 1.5) hudTimerBox.classList.add('danger');
  else hudTimerBox.classList.remove('danger');

  // Stream live multiplier to React parent wrapper
  if (window.parent) {
    window.parent.postMessage({ type: 'SCORE_UPDATE', payload: { multiplier: multiplier } }, '*');
  }
}

function createExplosion(x, y, color) {
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 400 + 100;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: Math.random() * 0.5 + 0.5,
      color: color,
      size: Math.random() * 5 + 3
    });
  }
}

function crash() {
  gameState = 'ended';
  document.body.classList.add('shake');
  createExplosion(player.x, player.y, '#ef4444');
  
  // Draw one last frame with explosion
  draw();
  
  setTimeout(() => showResult(0.0), 1000);
}

function win() {
  gameState = 'ended';
  createExplosion(player.x, player.y, '#22c55e');
  
  // Draw one last frame
  draw();
  
  setTimeout(() => showResult(2.0), 1000);
}

function showResult(finalMult) {
  gameHud.classList.add('hidden');
  
  let tier = 'C';
  if (finalMult >= 2.0) tier = 'S';
  else if (finalMult >= 1.5) tier = 'A';
  else if (finalMult >= 1.0) tier = 'B';

  resTime.innerText = survivalTime.toFixed(1) + 's';
  resTier.innerText = tier;
  resMult.innerText = 'x' + finalMult.toFixed(2);

  if (finalMult >= 2.0) {
    resTitle.innerText = "ESCAPE VELOCITY";
    resTitle.className = "res-title success";
    resKicker.innerText = "Maximum payout secured.";
  } else {
    resTitle.innerText = "SYSTEM FAILURE";
    resTitle.className = "res-title";
    resKicker.innerText = "Connection terminated before escape.";
  }

  overlayResult.classList.remove('hidden');

  // Submit final multiplier
  if (window.parent) {
    window.parent.postMessage({ type: 'GAME_OVER', payload: { multiplier: finalMult } }, '*');
  }
}

resize();
