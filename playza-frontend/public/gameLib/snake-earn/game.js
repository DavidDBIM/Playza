// ─── AUDIO ───
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function tone(freq, type, dur, vol = 0.1) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + dur);
}
function sndEat()     { tone(440, 'sine', 0.08, 0.18); setTimeout(() => tone(660, 'sine', 0.12, 0.15), 60); }
function sndPoison()  { tone(220, 'sawtooth', 0.3, 0.25); }
function sndBoost()   { tone(880, 'triangle', 0.15, 0.2); setTimeout(() => tone(1100, 'sine', 0.25, 0.18), 100); }
function sndDie()     { tone(300, 'square', 0.08, 0.2); setTimeout(() => tone(150, 'sawtooth', 0.5, 0.3), 100); }

// ─── CANVAS ───
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let W = 0, H = 0;

// ─── DOM ───
const hudEl     = document.getElementById('gameHud');
const hudLength = document.getElementById('hudLength');
const hudMult   = document.getElementById('hudMult');
const hudFill   = document.getElementById('hudFill');
const toastEl   = document.getElementById('toast');
const dpadEl    = document.getElementById('dpad');
const overlayStart  = document.getElementById('overlayStart');
const overlayResult = document.getElementById('overlayResult');
document.getElementById('btnStart').addEventListener('click', e => { e.stopPropagation(); startGame(); });
// In solo mode: Play Again exits to lobby so player must re-stake. In practice: restart directly.
document.getElementById('btnAgain').addEventListener('click', e => {
  e.stopPropagation();
  if (isSoloMode) { if (window.parent) window.parent.postMessage({ type: 'EXIT_GAME' }, '*'); }
  else startGame();
});
document.getElementById('btnExit').addEventListener('click',  e => { e.stopPropagation(); if (window.parent) window.parent.postMessage({ type: 'EXIT_GAME' }, '*'); });

// D-pad — touchstart for zero latency on mobile
const _dpadAdd = (id, nx, ny) => {
  const el = document.getElementById(id);
  el.addEventListener('touchstart', e => { e.preventDefault(); changeDir(nx, ny); }, { passive: false });
  el.addEventListener('click', () => changeDir(nx, ny));
};
_dpadAdd('dUp',    0, -1);
_dpadAdd('dDown',  0,  1);
_dpadAdd('dLeft', -1,  0);
_dpadAdd('dRight',  1,  0);

// ─── GRID CONSTANTS ───
const COLS = 20;
const ROWS = 22;            // Compact arena — not too tall on mobile
const MAX_FOOD = 54;        // food to reach 2.0×
const BREAK_EVEN = 27;      // food to hit 1.0×
const START_INTERVAL = 140; // ms per tick
const MIN_INTERVAL   = 65;  // ms at max speed

// ─── STATE ───
let snake, dir, nextDir, food, particles, scoreFloaters, toastTimer;
let foodEaten, multiplier, gameState, tickTimer;
let isMobile = false;
let obstacles = []; // Wall cells: [{x,y}]
let snakeTheme = 'green';
let highScore = parseInt(localStorage.getItem('snake-earn-hs') || '0', 10);
let comboCount = 0, lastEatTime = 0;
let deathFlash = 0;
let countdown = 0;
let lastDrawTime = 0;
const isSoloMode = new URLSearchParams(window.location.search).get('mode') === 'solo';

// Special food
const FOOD_NORMAL  = 'normal';
const FOOD_POISON  = 'poison';
const FOOD_BOOST   = 'boost';

// ─── RESIZE ───
function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', () => { resize(); if (gameState === 'playing') drawFrame(); });
resize();

// ─── CELL SIZE ───
function cellSize() {
  const byWidth  = Math.floor(W / COLS);
  // Reserve 90px at the bottom for the D-pad strip on mobile
  const availH   = isMobile ? H - 90 : H;
  const byHeight = Math.floor((availH * 0.84) / ROWS);
  return Math.min(byWidth, byHeight, 22);
}
function gridOffsetX() { return Math.floor((W - COLS * cellSize()) / 2); }
function gridOffsetY() {
  const cs = cellSize();
  // On mobile push arena toward top so D-pad strip doesn't overlap
  return isMobile ? 62 : Math.floor((H - ROWS * cs) / 2);
}

// ─── TOAST ───
function toast(msg, type = 'info') {
  if (toastTimer) clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = `toast show ${type}`;
  toastTimer = setTimeout(() => { toastEl.className = 'toast'; }, 2000);
}

// ─── KEYBOARD ───
window.addEventListener('keydown', e => {
  if (gameState !== 'playing') return;
  const map = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right', w:'up', s:'down', a:'left', d:'right', W:'up', S:'down', A:'left', D:'right' };
  const action = map[e.key];
  if (!action) return;
  e.preventDefault();
  const vecs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
  const [nx, ny] = vecs[action];
  changeDir(nx, ny);
});

function changeDir(nx, ny) {
  // Prevent 180° reversal
  if (nx === -dir.x && ny === -dir.y) return;
  nextDir = { x: nx, y: ny };
}

// ─── SWIPE + TAP ZONES (mobile) ───
let touchStart = null;
window.addEventListener('touchstart', e => {
  if (e.target.classList.contains('dpad-btn')) return;
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });

window.addEventListener('touchend', e => {
  if (!touchStart || gameState !== 'playing') return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist >= 20) {
    // SWIPE: steer by swipe vector
    if (Math.abs(dx) > Math.abs(dy)) changeDir(dx > 0 ? 1 : -1, 0);
    else changeDir(0, dy > 0 ? 1 : -1);
  } else if (snake && snake.length > 0) {
    // SHORT TAP: steer toward the tapped side relative to the snake head
    const cs = cellSize(), ox = gridOffsetX(), oy = gridOffsetY();
    const headScreenX = ox + (snake[0].x + 0.5) * cs;
    const headScreenY = oy + (snake[0].y + 0.5) * cs;
    const tx = e.changedTouches[0].clientX - headScreenX;
    const ty = e.changedTouches[0].clientY - headScreenY;
    if (Math.abs(tx) > Math.abs(ty)) changeDir(tx > 0 ? 1 : -1, 0);
    else changeDir(0, ty > 0 ? 1 : -1);
  }
  touchStart = null;
});

// ─── START GAME ───
function startGame() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  resize();

  isMobile = 'ontouchstart' in window;
  if (isMobile) dpadEl.classList.remove('hidden');
  else dpadEl.classList.add('hidden');

  const cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);
  snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
  dir    = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  particles = []; scoreFloaters = [];
  foodEaten = 0; multiplier = 0.0;
  comboCount = 0; lastEatTime = 0; deathFlash = 0;
  obstacles = [];
  gameState = 'playing';

  initObstacles();
  food = spawnFood(FOOD_NORMAL);
  overlayStart.classList.add('hidden');
  overlayResult.classList.add('hidden');
  hudEl.classList.remove('hidden');
  updateHUD();

  // 3-2-1 countdown before ticking
  countdown = 3;
  requestAnimationFrame(drawLoop);
  const cdInterval = setInterval(() => {
    countdown--;
    if (countdown <= 0) { clearInterval(cdInterval); clearTimeout(tickTimer); scheduleTick(); }
  }, 1000);
}

// ─── OBSTACLES ───
function initObstacles() {
  // Start with 3 wall segments, safely away from snake start (center)
  for (let i = 0; i < 3; i++) placeObstacleSegment(3 + Math.floor(Math.random() * 2));
}

function placeObstacleSegment(len = 3) {
  const horiz = Math.random() > 0.5;
  const cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);
  for (let attempt = 0; attempt < 25; attempt++) {
    const sx = Math.floor(Math.random() * (horiz ? COLS - len - 2 : COLS - 2)) + 1;
    const sy = Math.floor(Math.random() * (horiz ? ROWS - 2 : ROWS - len - 2)) + 1;
    let ok = true;
    const cells = [];
    for (let i = 0; i < len; i++) {
      const ox = horiz ? sx + i : sx, oy = horiz ? sy : sy + i;
      // Avoid snake start zone (5-cell radius from center)
      if (Math.abs(ox - cx) < 5 && Math.abs(oy - cy) < 5) { ok = false; break; }
      if (obstacles.some(o => o.x === ox && o.y === oy)) { ok = false; break; }
      cells.push({ x: ox, y: oy });
    }
    if (ok) { obstacles.push(...cells); return; }
  }
}

// ─── TICK SPEED ───
function tickInterval() {
  const t = Math.min(foodEaten / MAX_FOOD, 1);
  // Platform edge: speed ramp is STEEPER after break-even (food 27+)
  if (foodEaten < BREAK_EVEN) {
    return Math.round(START_INTERVAL - (foodEaten / BREAK_EVEN) * 40);
  } else {
    const post = (foodEaten - BREAK_EVEN) / (MAX_FOOD - BREAK_EVEN);
    return Math.round(100 - post * (100 - MIN_INTERVAL));
  }
}

function scheduleTick() {
  if (gameState !== 'playing') return;
  tickTimer = setTimeout(() => { gameTick(); scheduleTick(); }, tickInterval());
}

// ─── GAME TICK (only runs when countdown === 0) ───
function gameTick() {
  if (countdown > 0) return;
  dir = { ...nextDir };
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // Wall collision
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    endGame('WALL CRASH', 'You hit the boundary wall!'); return;
  }
  // Obstacle collision
  if (obstacles.some(o => o.x === head.x && o.y === head.y)) {
    endGame('OBSTACLE HIT', 'Your snake crashed into a wall block!'); return;
  }
  // Self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    endGame('SELF COLLISION', 'You bit your own tail!'); return;
  }

  // Food collision
  if (head.x === food.x && head.y === food.y) {
    eatFood(head);
  } else {
    snake.unshift(head); snake.pop();
  }
}

// ─── EAT FOOD ───
function eatFood(head) {
  const type = food.type;
  const cs = cellSize(), ox = gridOffsetX(), oy = gridOffsetY();
  const px = ox + (head.x + 0.5) * cs;
  const py = oy + (head.y + 0.5) * cs;

  const now = performance.now();
  const timeSinceLast = (now - lastEatTime) / 1000;
  lastEatTime = now;

  if (type === FOOD_POISON) {
    sndPoison();
    snake.unshift(head);
    if (snake.length <= 5) { endGame('POISONED', 'The snake couldn\'t survive the poison!'); return; }
    for (let i = 0; i < 4; i++) snake.pop();
    spawnParticles(px, py, '#a855f7', 12);
    addFloater(px, py, '☠️ -4', '#a855f7');
    toast('☠️ POISONED! –4 length', 'bad');
  } else if (type === FOOD_BOOST) {
    snake.unshift(head);
    foodEaten++;
    sndBoost();
    spawnParticles(px, py, '#fbbf24', 18);
    addFloater(px, py, '⚡ +0.05×', '#fbbf24');
    toast('⚡ SPEED BOOST! +0.05×', 'warn');
    multiplier = Math.min(2.0, multiplier + 0.05);
  } else {
    snake.unshift(head);
    foodEaten++;
    sndEat();
    spawnParticles(px, py, '#00ff88', 10);
    addFloater(px, py, `+${foodEaten}`, '#00ff88');
    multiplier = Math.min(2.0, Math.pow(foodEaten / MAX_FOOD, 0.85) * 2.0);
    if (foodEaten === BREAK_EVEN) toast('💰 BREAK-EVEN! You\'re in profit!', 'good');
    // Combo detection: 3 food within 5 seconds
    if (timeSinceLast < 5) { comboCount++; } else { comboCount = 1; }
    if (comboCount >= 3) {
      multiplier = Math.min(2.0, multiplier + 0.04);
      addFloater(px, py - 30, `🔥 COMBO!`, '#fbbf24');
      toast('🔥 COMBO! +0.04×', 'good');
      comboCount = 0;
    }
    // Add a new obstacle segment every 10 food (max 8 segments = ~32 cells)
    if (foodEaten % 10 === 0 && obstacles.length < 36) {
      placeObstacleSegment(3);
      toast('🧱 New obstacle appeared!', 'warn');
    }
  }

  updateHUD();

  // Next food — every 8 food, 25% chance of special
  let nextType = FOOD_NORMAL;
  if (foodEaten > 0 && foodEaten % 8 === 0) {
    const r = Math.random();
    // Platform edge: poison MORE likely after break-even (0.15 → 0.28)
    const poisonChance = foodEaten >= BREAK_EVEN ? 0.28 : 0.15;
    const boostChance  = foodEaten >= BREAK_EVEN ? 0.38 : 0.28;
    if (r < poisonChance)      nextType = FOOD_POISON;
    else if (r < boostChance)  nextType = FOOD_BOOST;
  }
  food = spawnFood(nextType);
}

// ─── SPAWN FOOD ───
function spawnFood(type) {
  let pos;
  do { pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
  while (
    snake.some(s => s.x === pos.x && s.y === pos.y) ||
    obstacles.some(o => o.x === pos.x && o.y === pos.y)
  );
  return { ...pos, type, pulse: 0 };
}

function addFloater(x, y, text, color) {
  scoreFloaters.push({ x, y, text, color, life: 1.0, vy: -55 });
}

// ─── PARTICLES ───
function spawnParticles(px, py, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: px, y: py,
      vx: (Math.random() - 0.5) * 220,
      vy: (Math.random() - 0.5) * 220,
      life: 1.0, size: Math.random() * 5 + 2, color
    });
  }
}

// ─── HUD ───
function updateHUD() {
  hudLength.innerText = snake.length;
  hudMult.innerText = `${multiplier.toFixed(2)}×`;
  const pct = Math.min(100, (foodEaten / MAX_FOOD) * 100);
  hudFill.style.width = `${pct}%`;
  if (pct < 50)      hudFill.style.background = 'linear-gradient(90deg, #06b6d4, #3b82f6)';
  else if (pct < 80) hudFill.style.background = 'linear-gradient(90deg, #3b82f6, #00ff88)';
  else               hudFill.style.background = 'linear-gradient(90deg, #00ff88, #fbbf24)';
  const hsEl = document.getElementById('hudHS'); if (hsEl) hsEl.innerText = highScore;
  if (window.parent) window.parent.postMessage({ type: 'SCORE_UPDATE', payload: { multiplier } }, '*');
}

// ─── DRAW LOOP ───
function drawLoop(now) {
  if (gameState !== 'playing' && gameState !== 'ended') return;
  const dt = Math.min((now - (lastDrawTime || now)) / 1000, 0.05);
  lastDrawTime = now;
  // Decay death flash
  if (deathFlash > 0) { deathFlash = Math.max(0, deathFlash - dt * 3); }
  updateParticles(dt);
  if (food) food.pulse = (food.pulse + dt * 4) % (Math.PI * 2);
  drawFrame();
  requestAnimationFrame(drawLoop);
}

function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 80 * dt; p.life -= dt * 2.2;
    if (p.life <= 0) particles.splice(particles.indexOf(p), 1);
  }
  for (let i = scoreFloaters.length - 1; i >= 0; i--) {
    const f = scoreFloaters[i];
    f.y += f.vy * dt; f.life -= dt * 1.6;
    if (f.life <= 0) scoreFloaters.splice(i, 1);
  }
}

// ─── DRAW FRAME ───
function drawFrame() {
  const cs = cellSize(), ox = gridOffsetX(), oy = gridOffsetY();

  // Outer dim zone
  ctx.fillStyle = '#030712'; ctx.fillRect(0, 0, W, H);

  // Arena dark background
  ctx.fillStyle = 'rgba(0,12,6,0.75)';
  ctx.fillRect(ox, oy, COLS * cs, ROWS * cs);

  // Very faint inner grid (subtle texture only)
  ctx.strokeStyle = 'rgba(0,255,136,0.03)'; ctx.lineWidth = 1;
  for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(ox + c * cs, oy); ctx.lineTo(ox + c * cs, oy + ROWS * cs); ctx.stroke(); }
  for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(ox, oy + r * cs); ctx.lineTo(ox + COLS * cs, oy + r * cs); ctx.stroke(); }

  // Arena glowing border
  ctx.strokeStyle = `rgba(0,255,136,${0.15 + multiplier * 0.1})`; ctx.lineWidth = 2;
  ctx.strokeRect(ox - 1, oy - 1, COLS * cs + 2, ROWS * cs + 2);
  ctx.strokeStyle = `rgba(0,255,136,${0.05 + multiplier * 0.05})`; ctx.lineWidth = 10;
  ctx.strokeRect(ox - 5, oy - 5, COLS * cs + 10, ROWS * cs + 10);

  // Obstacles — orange/amber bricks
  for (const o of obstacles) {
    const ox2 = ox + o.x * cs, oy2 = oy + o.y * cs;
    ctx.fillStyle = '#92400e'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 6;
    ctx.fillRect(ox2 + 1, oy2 + 1, cs - 2, cs - 2);
    // Top highlight
    ctx.fillStyle = 'rgba(251,191,36,0.35)'; ctx.shadowBlur = 0;
    ctx.fillRect(ox2 + 1, oy2 + 1, cs - 2, 4);
    // Grid lines on brick
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
    ctx.strokeRect(ox2 + 1, oy2 + 1, cs - 2, cs - 2);
  }
  ctx.shadowBlur = 0;

  // Snake
  for (let i = snake.length - 1; i >= 0; i--) {
    const s = snake[i];
    const t = i / snake.length;
    const alpha = 1.0 - t * 0.55;
    const isHead = i === 0;

    if (isHead) {
      ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 18;
    } else {
      // Body gradient from bright to dim
      const r = Math.round(0 + t * 0);
      const g = Math.round(255 - t * 80);
      const b = Math.round(136 - t * 60);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.shadowColor = `rgba(0,200,100,${0.4 * (1 - t)})`;
      ctx.shadowBlur = isHead ? 18 : 8;
    }

    const pad = isHead ? 1 : 2;
    const radius = (cs / 2) - pad;
    roundRect(ctx, ox + s.x * cs + pad, oy + s.y * cs + pad, cs - pad * 2, cs - pad * 2, Math.max(3, radius * 0.35));
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Eyes on head
  if (snake.length > 0) {
    const h = snake[0];
    const cx = ox + h.x * cs + cs / 2, cy = oy + h.y * cs + cs / 2;
    const er = Math.max(2, cs * 0.1);
    const eyeOff = cs * 0.22;
    let ex1, ey1, ex2, ey2;
    if (dir.x !== 0) {
      ex1 = cx + dir.x * eyeOff * 0.8; ey1 = cy - eyeOff;
      ex2 = cx + dir.x * eyeOff * 0.8; ey2 = cy + eyeOff;
    } else {
      ex1 = cx - eyeOff; ey1 = cy + dir.y * eyeOff * 0.8;
      ex2 = cx + eyeOff; ey2 = cy + dir.y * eyeOff * 0.8;
    }
    ctx.fillStyle = '#030712';
    ctx.beginPath(); ctx.arc(ex1, ey1, er, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex2, ey2, er, 0, Math.PI * 2); ctx.fill();
  }

  // Food
  if (food) {
    const fx = ox + food.x * cs + cs / 2, fy = oy + food.y * cs + cs / 2;
    const pulse = Math.sin(food.pulse) * 0.18 + 1.0;
    const fr = (cs * 0.36) * pulse;
    let fc, fg;
    if (food.type === FOOD_POISON) { fc = '#a855f7'; fg = 'rgba(168,85,247,0.6)'; }
    else if (food.type === FOOD_BOOST) { fc = '#fbbf24'; fg = 'rgba(251,191,36,0.6)'; }
    else { fc = '#ff4757'; fg = 'rgba(255,71,87,0.55)'; }

    // Outer glow ring
    ctx.beginPath(); ctx.arc(fx, fy, fr + 4, 0, Math.PI * 2);
    ctx.fillStyle = fg; ctx.fill();

    // Core
    ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fillStyle = fc; ctx.shadowColor = fc; ctx.shadowBlur = 16;
    ctx.fill(); ctx.shadowBlur = 0;

    // Shine
    ctx.beginPath(); ctx.arc(fx - fr * 0.3, fy - fr * 0.3, fr * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();

    // Icon
    ctx.font = `${Math.max(10, cs * 0.4)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(food.type === FOOD_POISON ? '☠' : food.type === FOOD_BOOST ? '⚡' : '🍎', fx, fy + 1);
  }

  // Particles
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  // Speed label
  const speed = tickInterval();
  const speedLabel = speed > 110 ? 'SLOW' : speed > 80 ? 'MEDIUM' : speed > 65 ? 'FAST' : 'MAX SPEED';
  const speedColor = speed > 110 ? '#22c55e' : speed > 80 ? '#f59e0b' : '#ef4444';
  ctx.fillStyle = speedColor; ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'top';
  ctx.fillText(`⚡ ${speedLabel}`, ox + COLS * cs - 4, oy + 4);

  // Countdown overlay
  if (countdown > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${Math.round(120 * (1 - (countdown % 1)))}px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 40;
    ctx.fillText(countdown, W / 2, H / 2);
    ctx.shadowBlur = 0;
  }

  // Death flash
  if (deathFlash > 0) {
    ctx.fillStyle = `rgba(255,50,50,${deathFlash * 0.6})`;
    ctx.fillRect(0, 0, W, H);
  }
  for (const f of scoreFloaters) {
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.fillStyle = f.color;
    ctx.shadowColor = f.color; ctx.shadowBlur = 8;
    ctx.font = `bold ${Math.max(12, cs * 0.65)}px Inter, sans-serif`;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;

  // Score floaters
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const f of scoreFloaters) {
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.fillStyle = f.color; ctx.shadowColor = f.color; ctx.shadowBlur = 8;
    ctx.font = `bold ${Math.max(12, cs * 0.65)}px Inter, sans-serif`;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
}

function roundRect(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + w - r, y);
  context.quadraticCurveTo(x + w, y, x + w, y + r);
  context.lineTo(x + w, y + h - r);
  context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  context.lineTo(x + r, y + h);
  context.quadraticCurveTo(x, y + h, x, y + h - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

// ─── END GAME ───
function endGame(title, kicker) {
  gameState = 'ended';
  clearTimeout(tickTimer);
  sndDie();
  deathFlash = 1.0;
  // Capture state into closure before any reset (prevents race with Play Again)
  const finalMultiplier = multiplier;
  const finalFoodEaten = foodEaten;
  const finalLength = snake ? snake.length : 0;
  if (finalFoodEaten > highScore) { highScore = finalFoodEaten; localStorage.setItem('snake-earn-hs', highScore); }

  setTimeout(() => {
    hudEl.classList.add('hidden');
    document.getElementById('resTitle').innerText = title;
    document.getElementById('resTitle').className = finalMultiplier >= 1.0 ? 'res-title win' : 'res-title';
    document.getElementById('resFood').innerText = finalFoodEaten;
    document.getElementById('resLength').innerText = finalLength;
    document.getElementById('resMult').innerText = `${finalMultiplier.toFixed(2)}×`;
    document.getElementById('resKicker').innerText = kicker;
    const hsEl = document.getElementById('resHS'); if (hsEl) hsEl.innerText = `Best: ${highScore} food`;
    overlayResult.classList.remove('hidden');
    if (window.parent) window.parent.postMessage({ type: 'GAME_OVER', payload: { multiplier: finalMultiplier } }, '*');
  }, 900);
}
