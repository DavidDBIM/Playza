// Audio Context
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

// Continuous Riser for tension
let riserOsc = null;
let riserGain = null;
function startRiser() {
  if (riserOsc) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  riserOsc = audioCtx.createOscillator();
  riserGain = audioCtx.createGain();
  riserOsc.type = 'triangle';
  riserOsc.frequency.setValueAtTime(200, audioCtx.currentTime);
  riserGain.gain.setValueAtTime(0, audioCtx.currentTime);
  riserGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.1);
  riserOsc.connect(riserGain);
  riserGain.connect(audioCtx.destination);
  riserOsc.start();
}
function stopRiser() {
  if (!riserOsc) return;
  riserGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
  setTimeout(() => { if (riserOsc) { riserOsc.stop(); riserOsc.disconnect(); riserOsc = null; } }, 100);
}
function updateRiser(mult) {
  if (riserOsc) {
    const freq = 200 + ((mult - 1.0) * 800); // Rises from 200Hz to 1000Hz
    riserOsc.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.1);
  }
}

// Variables
let gameState = 'start'; // start, playing, ended
let isCharging = false;
let multiplier = 1.0;
let coreTemp = 0; // decorative
let meltdownProgress = 0; // 0 to 100
let needlePos = 50; // 0 to 100
let time = 0; // elapsed for noise
let noiseOffset = Math.random() * 1000;
let lastFrameTime = 0;
let dangerZones = []; // array of {start, end, dom, shiftSpeed}
let sweetSpots = []; // array of {start, end, dom}

const MAX_MULTIPLIER = 2.0;
const MELTDOWN_SPEED = 250; // percent per second while charging in danger
const COOLING_SPEED = 100; // percent per second while not charging

// DOM
const btnStart = document.getElementById('btnStartGame');
const btnPlayAgain = document.getElementById('btnPlayAgain');
const btnCharge = document.getElementById('btnCharge');
const overlayStart = document.getElementById('overlayStart');
const overlayResult = document.getElementById('overlayResult');
const gameHud = document.getElementById('gameHud');
const arena = document.getElementById('arena');

const hudMult = document.getElementById('hudMult');
const hudTemp = document.getElementById('hudTemp');
const gaugeTrack = document.getElementById('gaugeTrack');
const gaugeNeedle = document.getElementById('gaugeNeedle');
const meltdownContainer = document.querySelector('.meltdown-bar-container');
const meltdownFill = document.getElementById('meltdownFill');
const coreOrb = document.getElementById('coreOrb');

// Events
btnStart.addEventListener('click', startGame);
btnPlayAgain.addEventListener('click', () => {
  if (window.parent) window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
});

// Interaction (Mouse/Touch)
function startCharge(e) {
  if (e) e.preventDefault();
  if (gameState !== 'playing') return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  isCharging = true;
  btnCharge.classList.add('active');
  playTone(200, 'sine', 0.1, 0.05);
  startRiser();
}

function stopCharge(e) {
  if (e) e.preventDefault();
  isCharging = false;
  btnCharge.classList.remove('active');
  btnCharge.classList.remove('danger-active');
  coreOrb.classList.remove('charging');
  coreOrb.classList.remove('danger');
  stopRiser();
}

btnCharge.addEventListener('mousedown', startCharge);
btnCharge.addEventListener('touchstart', startCharge, {passive: false});
window.addEventListener('mouseup', stopCharge);
window.addEventListener('touchend', stopCharge);

// Simple 1D Perlin-like noise using sine waves
function noise(t) {
  return (Math.sin(t) + Math.sin(t * 2.2 + 1.4) + Math.sin(t * 3.7 + 2.1)) / 3; 
}

function startGame() {
  gameState = 'playing';
  isCharging = false;
  multiplier = 1.0;
  meltdownProgress = 0;
  time = 0;
  noiseOffset = Math.random() * 1000;
  
  overlayStart.classList.add('hidden');
  overlayResult.classList.add('hidden');
  gameHud.classList.remove('hidden');
  arena.classList.remove('hidden');
  document.body.classList.remove('shake');
  
  generateDangerZones();
  lastFrameTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function generateDangerZones() {
  // Clear old DOM
  const existing = gaugeTrack.querySelectorAll('.gauge-zone');
  existing.forEach(e => e.remove());
  dangerZones = [];
  sweetSpots = [];

  // Create 2 or 3 danger zones
  const numZones = Math.floor(Math.random() * 2) + 2;
  for (let i = 0; i < numZones; i++) {
    let width = Math.random() * 15 + 10; // 10% to 25% wide
    let start = Math.random() * (100 - width);
    
    const div = document.createElement('div');
    div.className = 'gauge-zone danger';
    div.style.left = `${start}%`;
    div.style.width = `${width}%`;
    gaugeTrack.appendChild(div);

    dangerZones.push({start, end: start + width, dom: div, shiftSpeed: (Math.random() - 0.5) * 15, baseStart: start});
  }

  // Create 1 Sweet Spot (Golden Zone) for 2x charge speed
  let sweetWidth = 8;
  let sweetStart = Math.random() * (100 - sweetWidth);
  const sweetDiv = document.createElement('div');
  sweetDiv.className = 'gauge-zone sweet';
  sweetDiv.style.left = `${sweetStart}%`;
  sweetDiv.style.width = `${sweetWidth}%`;
  gaugeTrack.appendChild(sweetDiv);
  sweetSpots.push({start: sweetStart, end: sweetStart + sweetWidth, dom: sweetDiv});
}

function checkZone(zones) {
  for (let z of zones) {
    if (needlePos >= z.start && needlePos <= z.end) return true;
  }
  return false;
}

function gameLoop(now) {
  if (gameState !== 'playing') return;
  const dt = (now - lastFrameTime) / 1000;
  lastFrameTime = now;
  time += dt;

  // Visual Intensity Jitter as you get closer to 2.0x
  if (multiplier > 1.6) arena.classList.add('intensity-high');
  else arena.classList.remove('intensity-high');

  // Dynamic Danger Zones (They slowly shift left and right over time)
  if (multiplier > 1.2) {
    for (let z of dangerZones) {
       z.start = z.baseStart + Math.sin(time * (z.shiftSpeed/5)) * 10;
       z.end = z.start + parseFloat(z.dom.style.width);
       z.dom.style.left = `${z.start}%`;
    }
  }

  // Move Needle
  // Noise returns -1 to 1. Map to 0 to 100.
  // Speed increases exponentially as multiplier increases
  const speed = 1.5 + Math.pow(multiplier, 2);
  let n = noise((time + noiseOffset) * speed);
  needlePos = ((n + 1) / 2) * 100;
  // Keep in bounds 5 to 95
  needlePos = Math.max(5, Math.min(95, needlePos));
  gaugeNeedle.style.left = `${needlePos}%`;

  const inDanger = checkZone(dangerZones);
  const inSweetSpot = checkZone(sweetSpots);

  if (isCharging) {
    updateRiser(multiplier);

    // Increase multiplier. Base takes ~20s. Sweet spot takes ~10s.
    let multSpeed = 0.05;
    if (inSweetSpot && !inDanger) multSpeed = 0.15; // 3x speed in gold zone!

    multiplier += multSpeed * dt;
    if (multiplier >= MAX_MULTIPLIER) {
      multiplier = MAX_MULTIPLIER;
      winGame();
      return;
    }

    if (inDanger) {
      meltdownProgress += MELTDOWN_SPEED * dt;
      btnCharge.classList.add('danger-active');
      coreOrb.classList.add('danger');
      coreOrb.classList.remove('charging');
      meltdownContainer.classList.add('visible');
      if (Math.random() < 0.2) playTone(150, 'sawtooth', 0.1, 0.2); // crackle
    } else {
      meltdownProgress -= COOLING_SPEED * dt * 0.5;
      btnCharge.classList.remove('danger-active');
      coreOrb.classList.add('charging');
      coreOrb.classList.remove('danger');
      meltdownContainer.classList.remove('visible');
    }
  } else {
    // Cooling down
    meltdownProgress -= COOLING_SPEED * dt;
    meltdownContainer.classList.remove('visible');
  }

  meltdownProgress = Math.max(0, Math.min(100, meltdownProgress));
  meltdownFill.style.width = `${meltdownProgress}%`;

  if (meltdownProgress >= 100) {
    loseGame();
    return;
  }

  updateHUD();
  requestAnimationFrame(gameLoop);
}

function updateHUD() {
  hudMult.innerText = `x${multiplier.toFixed(2)}`;
  coreTemp = 500 + (multiplier * 2000) + (meltdownProgress * 50);
  hudTemp.innerText = `${Math.floor(coreTemp)}°C`;

  if (window.parent) {
    window.parent.postMessage({ type: 'SCORE_UPDATE', payload: { multiplier: multiplier } }, '*');
  }
}

function loseGame() {
  gameState = 'ended';
  isCharging = false;
  stopRiser();
  arena.classList.remove('intensity-high');
  document.body.classList.add('shake');
  playTone(100, 'sawtooth', 1.0, 0.5); // Explosion
  
  setTimeout(() => {
    document.getElementById('resTitle').innerText = "MELTDOWN";
    document.getElementById('resTitle').className = "res-title";
    document.getElementById('resKicker').innerText = "The core exploded. Stake lost.";
    document.getElementById('resMult').innerText = "x0.00";
    
    overlayResult.classList.remove('hidden');
    gameHud.classList.add('hidden');
    arena.classList.add('hidden');

    if (window.parent) {
      window.parent.postMessage({ type: 'GAME_OVER', payload: { multiplier: 0 } }, '*');
    }
  }, 1000);
}

function winGame() {
  gameState = 'ended';
  isCharging = false;
  stopRiser();
  arena.classList.remove('intensity-high');
  playTone(880, 'sine', 0.2, 0.2);
  setTimeout(() => playTone(1100, 'sine', 0.4, 0.2), 200);
  
  document.getElementById('resTitle').innerText = "MAXIMUM CHARGE";
  document.getElementById('resTitle').className = "res-title success";
  document.getElementById('resKicker').innerText = "Escape velocity achieved!";
  document.getElementById('resMult').innerText = `x${MAX_MULTIPLIER.toFixed(2)}`;
  
  overlayResult.classList.remove('hidden');
  gameHud.classList.add('hidden');
  arena.classList.add('hidden');

  if (window.parent) {
    window.parent.postMessage({ type: 'GAME_OVER', payload: { multiplier: MAX_MULTIPLIER } }, '*');
  }
}
