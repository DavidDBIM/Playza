// ─── AUDIO ───
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, type, duration, vol = 0.1) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + duration);
}
function playPlaceSound(p) { playTone(300 + p * 10, 'sine', 0.1, 0.15); setTimeout(() => playTone(400 + p * 10, 'triangle', 0.15, 0.1), 50); }
function playChopSound() { playTone(150, 'sawtooth', 0.2, 0.2); }
function playPerfectSound() { playTone(880, 'sine', 0.1, 0.25); setTimeout(() => playTone(1100, 'sine', 0.3, 0.2), 100); setTimeout(() => playTone(1320, 'sine', 0.4, 0.15), 220); }
function playFallSound() { playTone(200, 'square', 0.15, 0.2); setTimeout(() => playTone(80, 'sawtooth', 0.5, 0.4), 120); }
function playDangerSound() { playTone(330, 'sawtooth', 0.12, 0.15); }
function playComboSound(n) { playTone(400 + n * 60, 'sine', 0.2, 0.18); }

// ─── CANVAS ───
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let w, h;
function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

// ─── DOM ───
const shell       = document.getElementById('shell');
const btnStart    = document.getElementById('btnStartGame');
const btnAgain    = document.getElementById('btnPlayAgain');
const btnExit     = document.getElementById('btnExit');
const overlayStart  = document.getElementById('overlayStart');
const overlayResult = document.getElementById('overlayResult');
const gameHud       = document.getElementById('gameHud');
const hudScore      = document.getElementById('hudScore');
const hudMult       = document.getElementById('hudMult');
const hudFill       = document.getElementById('hudProgressFill');
const toastEl       = document.getElementById('toast');

// ─── CONSTANTS ───
const MAX_SCORE        = 28;    // blocks to reach 2.0x
const MAX_MULTIPLIER   = 2.0;
const BLOCK_HEIGHT     = 40;
const PERFECT_TOL      = 5;     // pixels

// ─── STATE ───
let gameState = 'start';
let blocks = [], activeBlock = null, debris = [], particles = [], ambientEmbers = [];
let score = 0, perfects = 0, perfectStreak = 0, multiplier = 0.0;
let cameraY = 0, targetCameraY = 0, lastTime = 0, baseWidth = 200;
let toastTimer = null, stamp = null;
let highScore = parseInt(localStorage.getItem('neon-stacker-hs') || '0', 10);

const COLORS = ['#a855f7','#ec4899','#ef4444','#f59e0b','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#f97316','#10b981'];
const blockColor = i => COLORS[i % COLORS.length];
const isSoloMode = new URLSearchParams(window.location.search).get('mode') === 'solo';


// ─── TOAST ───
function toast(msg, type = 'info') {
  if (toastTimer) clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = `toast show ${type}`;
  toastTimer = setTimeout(() => { toastEl.className = 'toast'; }, 2200);
}

// ─── EVENTS ───
btnStart.addEventListener('click', e => { e.stopPropagation(); startGame(); });
// In solo mode: Play Again exits to lobby (player must re-stake). In practice mode: restart directly.
btnAgain.addEventListener('click', e => {
  e.stopPropagation();
  if (isSoloMode) { if (window.parent) window.parent.postMessage({ type: 'EXIT_GAME' }, '*'); }
  else startGame();
});
btnExit.addEventListener('click', e => { e.stopPropagation(); if (window.parent) window.parent.postMessage({ type: 'EXIT_GAME' }, '*'); });
shell.addEventListener('mousedown', handleTap);
shell.addEventListener('touchstart', handleTap, { passive: false });

// ─── START ───
function startGame() {
  resize();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  gameState = 'playing';
  score = perfects = perfectStreak = 0;
  multiplier = 0.0;
  baseWidth = Math.min(250, w * 0.6);
  cameraY = targetCameraY = h - 150;
  blocks = []; debris = []; particles = []; ambientEmbers = []; stamp = null;

  blocks.push({ x: w / 2 - baseWidth / 2, y: 0, w: baseWidth, h: BLOCK_HEIGHT, color: '#334155' });
  spawnBlock();

  overlayStart.classList.add('hidden');
  overlayResult.classList.add('hidden');
  gameHud.classList.remove('hidden');
  document.body.classList.remove('shake');
  updateHUD();
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

// ─── SPAWN ───
function spawnBlock() {
  const last = blocks[blocks.length - 1];
  const newY = last.y + BLOCK_HEIGHT;
  targetCameraY = h - 200 - newY;

  // Speed: gentle first half, steeply accelerating second half
  const half = MAX_SCORE / 2;
  let speed;
  if (score < half) {
    speed = 200 + score * 12;
  } else {
    const halfSpeed = 200 + half * 12;
    speed = halfSpeed + (score - half) * 28;
  }

  const dir = Math.random() > 0.5 ? 1 : -1;
  activeBlock = {
    x: dir === 1 ? -last.w : w,
    y: newY, w: last.w, h: BLOCK_HEIGHT,
    color: blockColor(score), vx: speed * dir
  };
}

// ─── TAP ───
function handleTap(e) {
  if (e) e.preventDefault();
  if (gameState !== 'playing' || !activeBlock) return;

  const last = blocks[blocks.length - 1];
  const diff = activeBlock.x - last.x;
  const abs  = Math.abs(diff);

  if (abs >= activeBlock.w) { loseGame(); return; }

  if (abs <= PERFECT_TOL) {
    activeBlock.x = last.x;
    perfects++; perfectStreak++;
    playPerfectSound();
    createParticles(activeBlock.x + activeBlock.w / 2, activeBlock.y, activeBlock.color, 20);
    // PERFECT stamp
    stamp = { text: perfectStreak >= 3 ? `🔥 ×${perfectStreak} STREAK!` : '🎯 PERFECT!', life: 1.0, scale: 0.4, color: perfectStreak >= 3 ? '#f59e0b' : '#a855f7' };
    if (perfectStreak >= 2) { toast(`🎯 PERFECT ×${perfectStreak}!`, 'perfect'); playComboSound(perfectStreak); }
    else toast('🎯 PERFECT!', 'perfect');
    // Fire particles on streak
    if (perfectStreak >= 3) { for (let i=0;i<12;i++) ambientEmbers.push({ x: activeBlock.x + Math.random()*activeBlock.w, y: -activeBlock.y + cameraY, vx:(Math.random()-0.5)*60, vy:-(50+Math.random()*120), life:1.0, size:Math.random()*3+1, color:['#f59e0b','#ef4444','#ec4899'][Math.floor(Math.random()*3)] }); }
    // Every 3 perfects, recover a little width
    if (perfects % 3 === 0) { activeBlock.w = Math.min(baseWidth, activeBlock.w + 8); activeBlock.x -= 4; }
  } else {
    perfectStreak = 0;
    playChopSound();
    let dropX, dropW;
    if (diff > 0) { activeBlock.w -= diff; dropX = activeBlock.x + activeBlock.w; dropW = diff; }
    else { activeBlock.w -= abs; activeBlock.x = last.x; dropX = last.x - abs; dropW = abs; }
    debris.push({ x: dropX, y: activeBlock.y, w: dropW, h: BLOCK_HEIGHT, color: activeBlock.color, vy: 0, vx: (Math.random() - 0.5) * 150, rot: 0, vrot: (Math.random() - 0.5) * 6 });
    if (activeBlock.w < 55) { toast('⚠️ CRITICAL WIDTH!', 'danger'); playDangerSound(); }
  }

  blocks.push({ ...activeBlock });
  activeBlock = null;
  score++;

  // Power curve: slower build early, accelerates to 2.0x at MAX_SCORE
  multiplier = Math.min(MAX_MULTIPLIER, Math.pow(score / MAX_SCORE, 0.85) * MAX_MULTIPLIER);
  updateHUD();

  if (score >= MAX_SCORE) winGame();
  else { if (abs > PERFECT_TOL) playPlaceSound(score); spawnBlock(); }
}

// ─── LOOP ───
function gameLoop(now) {
  if (gameState === 'start') return;
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  update(dt); draw();
  requestAnimationFrame(gameLoop);
}

function update(dt) {
  cameraY += (targetCameraY - cameraY) * 5 * dt;

  // Ambient embers
  if (gameState === 'playing' && Math.random() < 0.06) {
    ambientEmbers.push({ x: Math.random()*w, y: h+5, vx:(Math.random()-0.5)*25, vy:-(30+Math.random()*70), life:1.0, size:Math.random()*2+0.5, color:['#a855f7','#ec4899','#f59e0b','#3b82f6'][Math.floor(Math.random()*4)] });
  }
  for (let i=ambientEmbers.length-1;i>=0;i--) {
    const e=ambientEmbers[i]; e.x+=e.vx*dt; e.y+=e.vy*dt; e.life-=dt*0.55;
    if(e.life<=0||e.y<-60) ambientEmbers.splice(i,1);
  }
  // Stamp animation
  if (stamp) { stamp.life-=dt*2.2; stamp.scale=Math.min(1,stamp.scale+dt*7); if(stamp.life<=0) stamp=null; }

  if (gameState === 'playing' && activeBlock) {
    activeBlock.x += activeBlock.vx * dt;
    if (activeBlock.x <= 0 && activeBlock.vx < 0) { activeBlock.x = 0; activeBlock.vx *= -1; }
    else if (activeBlock.x + activeBlock.w >= w && activeBlock.vx > 0) { activeBlock.x = w - activeBlock.w; activeBlock.vx *= -1; }
  }
  for (let i = debris.length - 1; i >= 0; i--) {
    const d = debris[i]; d.vy += 800 * dt; d.x += d.vx * dt; d.y -= d.vy * dt; d.rot += d.vrot * dt;
    if (cameraY - d.y > h + 200) debris.splice(i, 1);
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.x += p.vx * dt; p.y -= p.vy * dt; p.vy -= 180 * dt; p.life -= dt * 1.8;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// ─── DRAW ───
function draw() {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#020617'); bg.addColorStop(1, '#0f172a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  // No grid — clean dark background only

  // Ambient embers (behind everything)
  for (const e of ambientEmbers) {
    ctx.globalAlpha = Math.max(0, e.life * 0.7);
    ctx.fillStyle = e.color; ctx.shadowColor = e.color; ctx.shadowBlur = 5;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.size, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;

  ctx.save(); ctx.translate(0, cameraY);
  for (const b of blocks) drawBlock(b.x, -b.y, b.w, b.h, b.color, false);
  // Landing guide — center line of last block while block is moving
  if (activeBlock && blocks.length > 0) {
    const last = blocks[blocks.length-1];
    const cx = last.x + last.w / 2;
    ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1; ctx.setLineDash([4,8]);
    ctx.beginPath(); ctx.moveTo(cx,-activeBlock.y-activeBlock.h); ctx.lineTo(cx,-activeBlock.y-activeBlock.h-300); ctx.stroke();
    ctx.restore();
  }
  if (activeBlock) drawBlock(activeBlock.x, -activeBlock.y, activeBlock.w, activeBlock.h, activeBlock.color, true);
  for (const d of debris) {
    ctx.save(); ctx.translate(d.x + d.w / 2, -d.y + d.h / 2); ctx.rotate(d.rot); ctx.globalAlpha = 0.55;
    drawBlock(-d.w / 2, -d.h / 2, d.w, d.h, d.color, false); ctx.globalAlpha = 1; ctx.restore();
  }
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(p.x, -p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.restore();

  // PERFECT stamp overlay
  if (stamp) {
    ctx.save(); ctx.globalAlpha = Math.max(0, stamp.life);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${Math.round(stamp.scale * 48)}px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = stamp.color; ctx.shadowColor = stamp.color; ctx.shadowBlur = 24;
    ctx.fillText(stamp.text, w/2, h/2 - 60);
    ctx.restore();
  }
}

function drawBlock(x, y, bw, bh, color, isActive) {
  ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = isActive ? 28 : 14;
  ctx.fillRect(x, y, bw, bh);
  const grad = ctx.createLinearGradient(x, y, x, y + bh);
  grad.addColorStop(0, 'rgba(255,255,255,0.28)'); grad.addColorStop(0.5, 'rgba(255,255,255,0.04)'); grad.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = grad; ctx.shadowBlur = 0; ctx.fillRect(x, y, bw, bh);
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(x, y, bw, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x, y, 3, bh);
}

function createParticles(x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    particles.push({ x, y, vx: (Math.random() - 0.5) * 500, vy: (Math.random() - 0.5) * 500, life: 1.0, size: Math.random() * 5 + 2, color });
  }
}

// ─── HUD ───
function updateHUD() {
  hudScore.innerText = `${score} / ${MAX_SCORE}`;
  hudMult.innerText = `${multiplier.toFixed(2)}x`;
  const hsEl = document.getElementById('hudHS'); if(hsEl) hsEl.innerText = highScore;
  const pct = (score / MAX_SCORE) * 100;
  hudFill.style.width = `${pct}%`;
  if (pct < 50)       hudFill.style.background = 'linear-gradient(90deg, #3b82f6, #a855f7)';
  else if (pct < 75)  hudFill.style.background = 'linear-gradient(90deg, #a855f7, #f59e0b)';
  else                hudFill.style.background = 'linear-gradient(90deg, #f59e0b, #22c55e)';
  if (window.parent) window.parent.postMessage({ type: 'SCORE_UPDATE', payload: { multiplier } }, '*');
}

// ─── END STATES ───
function loseGame() {
  gameState = 'ended'; activeBlock = null;
  document.body.classList.add('shake'); playFallSound();
  if (blocks.length > 1) {
    const t = blocks.pop();
    debris.push({ x: t.x, y: t.y, w: t.w, h: t.h, color: t.color, vy: 200, vx: (Math.random() - 0.5) * 200, rot: 0, vrot: (Math.random() - 0.5) * 6 });
  }
  setTimeout(() => showResult('COLLAPSE', false), 1500);
}

function winGame() {
  gameState = 'ended'; activeBlock = null;
  playTone(880, 'sine', 0.2, 0.25); setTimeout(() => playTone(1100, 'sine', 0.4, 0.25), 200); setTimeout(() => playTone(1320, 'sine', 0.5, 0.2), 400);
  const top = blocks[blocks.length - 1];
  createParticles(w / 2, top.y, '#22c55e', 40);
  setTimeout(() => showResult('ESCAPE VELOCITY', true), 1600);
}

function showResult(title, isWin) {
  gameHud.classList.add('hidden');
  if (score > highScore) { highScore = score; localStorage.setItem('neon-stacker-hs', highScore); }
  document.getElementById('resTitle').innerText = title;
  document.getElementById('resTitle').className = isWin ? 'res-title success' : 'res-title';
  document.getElementById('resBlocks').innerText = score;
  document.getElementById('resPerfects').innerText = perfects;
  document.getElementById('resHighScore').innerText = highScore;
  document.getElementById('resMult').innerText = `${multiplier.toFixed(2)}x`;
  document.getElementById('resKicker').innerText = isWin ? 'Maximum altitude reached. You earned the payout.' : 'The structure became too unstable.';
  overlayResult.classList.remove('hidden');
  if (window.parent) window.parent.postMessage({ type: 'GAME_OVER', payload: { multiplier } }, '*');
}
