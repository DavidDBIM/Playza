/**
 * ============================================================
 *  SLIDING PUZZLE — game.js (Endless Arcade Edition)
 * ============================================================
 */
(function injectSlideStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideFromLeft  { from { transform: translateX(-100%); } to { transform: none; } }
    @keyframes slideFromRight { from { transform: translateX(100%);  } to { transform: none; } }
    @keyframes slideFromTop   { from { transform: translateY(-100%); } to { transform: none; } }
    @keyframes slideFromBottom{ from { transform: translateY(100%);  } to { transform: none; } }
    .slide-from-left   { animation: slideFromLeft   0.18s cubic-bezier(0.4,0,0.2,1) both; }
    .slide-from-right  { animation: slideFromRight  0.18s cubic-bezier(0.4,0,0.2,1) both; }
    .slide-from-top    { animation: slideFromTop    0.18s cubic-bezier(0.4,0,0.2,1) both; }
    .slide-from-bottom { animation: slideFromBottom 0.18s cubic-bezier(0.4,0,0.2,1) both; }
  `;
  document.head.appendChild(style);
}());

'use strict';

/* ============================================================
   IMAGE PACKS (Dynamic Loader)
   ============================================================ */
const EndlessImages = (() => {
  let manifest = [];
  return {
    async load() {
      try {
        const res = await fetch('image_manifest.json');
        if (res.ok) {
          manifest = await res.json();
        } else {
          // Fallback if fetch fails
          manifest = ['images/nature and landscape/nature.webp'];
        }
      } catch (e) {
        manifest = ['images/nature and landscape/nature.webp'];
      }
    },
    getRandomImage() {
      if (manifest.length === 0) return 'images/nature and landscape/nature.webp';
      return manifest[Math.floor(Math.random() * manifest.length)];
    }
  };
})();

/* ============================================================
   TIME BANK MODULE (Countdown)
   ============================================================ */
const TimeBankModule = (() => {
  let timeLeftMs = 0;
  let lastTick = 0;
  let rafId = null;
  let onTick = null;
  let onExpire = null;

  function pad(n) { return String(n).padStart(2, '0'); }
  function format(ms) {
    if (ms <= 0) return "00:00";
    const secs = Math.floor(ms / 1000);
    return `${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`;
  }

  function tick(timestamp) {
    if (!lastTick) lastTick = timestamp;
    const dt = timestamp - lastTick;
    lastTick = timestamp;

    timeLeftMs -= dt;
    if (timeLeftMs <= 0) {
      timeLeftMs = 0;
      if (onTick) onTick(format(0));
      if (onExpire) onExpire();
      return;
    }
    
    if (onTick) onTick(format(timeLeftMs));
    rafId = requestAnimationFrame(tick);
  }

  return {
    start(initialMs, tickCb, expireCb) {
      timeLeftMs = initialMs;
      onTick = tickCb;
      onExpire = expireCb;
      lastTick = 0;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    },
    addTime(ms) {
      timeLeftMs += ms;
    },
    stop() {
      cancelAnimationFrame(rafId);
      rafId = null;
    },
    getTimeLeft() { return Math.max(0, timeLeftMs); },
  };
})();

/* ============================================================
   SOUND MODULE
   ============================================================ */
const SoundModule = (() => {
  let ctx = null;
  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }
  function playTone(freq, type, duration, gain = 0.18) {
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gainNode = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, c.currentTime + duration);
      gainNode.gain.setValueAtTime(gain, c.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.connect(gainNode);
      gainNode.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + duration);
    } catch (_) {}
  }

  return {
    slide() { playTone(440, 'sine', 0.08, 0.12); },
    comboUp() { playTone(880, 'sine', 0.1, 0.1); },
    comboBreak() { playTone(200, 'sawtooth', 0.15, 0.15); },
    win() {
      setTimeout(() => playTone(523, 'triangle', 0.15, 0.2), 0);
      setTimeout(() => playTone(659, 'triangle', 0.15, 0.2), 150);
      setTimeout(() => playTone(784, 'triangle', 0.25, 0.2), 300);
      setTimeout(() => playTone(1047, 'triangle', 0.4, 0.25), 450);
    },
    lose() {
      setTimeout(() => playTone(300, 'sawtooth', 0.4, 0.3), 0);
      setTimeout(() => playTone(250, 'sawtooth', 0.6, 0.3), 300);
    }
  };
})();

/* ============================================================
   CONFETTI ENGINE
   ============================================================ */
const ConfettiEngine = (() => {
  const COLORS = ['#7c3aed','#a78bfa','#f59e0b','#10b981','#ef4444','#3b82f6','#ec4899','#f472b6'];
  let particles = [];
  let rafId = null;
  let canvas, ctx;

  function init(c) {
    canvas = c;
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  function spawn(n = 160) {
    particles = [];
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        w: 6 + Math.random() * 8,
        h: 3 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        drot: (Math.random() - 0.5) * 0.15,
        vy: 2 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: 1,
      });
    }
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy *= 1.01;
      p.rot += p.drot;
      if (p.y > canvas.height) p.opacity -= 0.05;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    particles = particles.filter(p => p.opacity > 0);
    if (particles.length > 0) rafId = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return {
    init,
    burst() {
      spawn(180);
      cancelAnimationFrame(rafId);
      frame();
    },
    stop() {
      cancelAnimationFrame(rafId);
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
})();

/* ============================================================
   GRID MANAGER
   ============================================================ */
const GridManager = (() => {
  function countInversions(tiles) {
    const flat = tiles.filter(t => t !== 0);
    let inv = 0;
    for (let i = 0; i < flat.length; i++)
      for (let j = i + 1; j < flat.length; j++)
        if (flat[i] > flat[j]) inv++;
    return inv;
  }

  function isSolvable(tiles, size) {
    const inv = countInversions(tiles);
    if (size % 2 === 1) return inv % 2 === 0;
    const blankIdx = tiles.indexOf(0);
    const blankRow = Math.floor(blankIdx / size);
    const blankFromBottom = size - blankRow;
    return (blankFromBottom % 2 === 1) === (inv % 2 === 0);
  }

  function shuffleViaMoves(size) {
    const total = size * size;
    const tiles = Array.from({ length: total }, (_, i) => i);
    let emptyIdx = 0;
    const moves = size === 3 ? 300 : size === 4 ? 600 : 1000;

    for (let m = 0; m < moves; m++) {
      const neighbors = getValidNeighbors(emptyIdx, size);
      const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
      tiles[emptyIdx] = tiles[chosen];
      tiles[chosen] = 0;
      emptyIdx = chosen;
    }
    return tiles;
  }

  function getValidNeighbors(idx, size) {
    const neighbors = [];
    const row = Math.floor(idx / size);
    const col = idx % size;
    if (row > 0)        neighbors.push(idx - size);
    if (row < size - 1) neighbors.push(idx + size);
    if (col > 0)        neighbors.push(idx - 1);
    if (col < size - 1) neighbors.push(idx + 1);
    return neighbors;
  }

  return {
    create(size) {
      const tiles = shuffleViaMoves(size);
      if (!isSolvable(tiles, size)) {
        const a = tiles.findIndex((_, i) => tiles[i] !== 0);
        const b = tiles.findIndex((_, i) => i > a && tiles[i] !== 0);
        [tiles[a], tiles[b]] = [tiles[b], tiles[a]];
      }
      return tiles;
    },
    getValidNeighbors,
    isSolved(tiles) {
      return tiles.every((val, idx) => val === idx);
    },
  };
})();

/* ============================================================
   TILE RENDERER
   ============================================================ */
const TileRenderer = (() => {
  let boardEl = null;
  let _tileSize = 0;
  let lastMovedIdx = -1;
  let lastMoveDir  = '';
  let frozenTiles = new Set();
  let hardcoreMode = false;

  function calcTileSize(gridSize) {
    const gap = (gridSize - 1) * 3;
    const padding = 10;
    const maxBoardSize = window.innerWidth >= 768 ? 500 : 350;
    // Reduce max available space so board is smaller and square
    const available = Math.min(
      window.innerWidth - 40,
      window.innerHeight - 250,
      maxBoardSize
    );
    return Math.floor((available - padding - gap) / gridSize);
  }

  function applyImage(el, val, gridSize, ts, imgSrc) {
    const correctIdx = val;
    const correctRow = Math.floor(correctIdx / gridSize);
    const correctCol = correctIdx % gridSize;
    const bgW = ts * gridSize;
    const bgX = -(correctCol * ts);
    const bgY = -(correctRow * ts);

    el.style.backgroundImage    = `url('${imgSrc}')`;
    el.style.backgroundSize     = `${bgW}px ${bgW}px`;
    el.style.backgroundPosition = `${bgX}px ${bgY}px`;
    el.style.backgroundRepeat   = 'no-repeat';
  }

  return {
    init(el) { boardEl = el; },
    setLastMove(idx, dir) { lastMovedIdx = idx; lastMoveDir = dir; },
    setFrozen(set) { frozenTiles = set; },
    setHardcore(enabled) { hardcoreMode = enabled; },

    render(tiles, gridSize, imgSrc, onTileClick) {
      _tileSize = calcTileSize(gridSize);
      const ts  = _tileSize;

      boardEl.style.gridTemplateColumns = `repeat(${gridSize}, ${ts}px)`;
      boardEl.style.gridTemplateRows    = `repeat(${gridSize}, ${ts}px)`;
      boardEl.innerHTML = '';

      const emptyIdx = tiles.indexOf(0);
      const neighbors = GridManager.getValidNeighbors(emptyIdx, gridSize);

      tiles.forEach((val, idx) => {
        const el = document.createElement('div');
        el.className = 'tile';
        if (hardcoreMode) el.classList.add('no-numbers');
        el.style.width  = ts + 'px';
        el.style.height = ts + 'px';
        el.dataset.idx  = idx;

        if (val === 0) {
          el.classList.add('empty');
        } else {
          applyImage(el, val, gridSize, ts, imgSrc);
          
          if (frozenTiles.has(idx)) el.classList.add('frozen');
          if (neighbors.includes(idx) && !frozenTiles.has(idx)) el.classList.add('can-move');

          if (idx === lastMovedIdx && lastMoveDir) {
            el.classList.add(`slide-from-${lastMoveDir}`);
          } else if (lastMovedIdx === -1) {
            const r = Math.floor(idx / gridSize);
            const c = idx % gridSize;
            el.style.animationDelay = `${(r + c) * 0.02}s`;
            el.classList.add('tile-appear');
          }

          const num = document.createElement('span');
          num.className = 'tile-num';
          num.textContent = val;
          el.appendChild(num);
        }

        el.addEventListener('click', () => onTileClick(idx));
        boardEl.appendChild(el);
      });

      lastMovedIdx = -1;
      lastMoveDir  = '';
    },
    getTileSize() { return _tileSize; },
  };
})();

/* ============================================================
   GAME CONTROLLER (Endless Arcade Logic)
   ============================================================ */
const GameController = (() => {
  let state = {
    level: 1,
    size: 3,
    score: 0,
    combo: 1,
    lastMoveTime: 0,
    tiles: [],
    imgSrc: '',
    isPlaying: false,
    isAnimating: false,
    frozen: new Set(),
    hardcore: false,
  };

  let hazardInterval = null;
  let studyInterval = null;
  let isFirstLevel = true;

  const screens = {
    menu: document.getElementById('screen-menu'),
    game: document.getElementById('screen-game'),
    win:  document.getElementById('screen-win'),
  };
  const boardEl = document.getElementById('puzzle-board');
  const statLevel = document.getElementById('stat-level');
  const statTime = document.getElementById('stat-time');
  const statScore = document.getElementById('stat-score');
  const statCombo = document.getElementById('stat-combo');
  const previewOverlay = document.getElementById('preview-overlay');
  const previewImg = document.getElementById('preview-img');
  const targetThumbnail = document.getElementById('target-thumbnail');

  function showScreen(name) {
    Object.entries(screens).forEach(([k, el]) => {
      el.classList.toggle('active', k === name);
    });
  }

  function initMenu() {
    EndlessImages.load();
    document.getElementById('btn-start').addEventListener('click', () => startEndlessRun());
  }

  function startEndlessRun() {
    state.level = 1;
    state.score = 0;
    state.combo = 1;
    state.hardcore = false;
    isFirstLevel = true;
    
    updateHUD();
    showScreen('game');
    
    // Set initial Time Bank (30 minutes = 1,800,000 ms), but don't start the ticking yet
    TimeBankModule.start(1800000, 
      (fmt) => { statTime.textContent = fmt; },
      () => handleGameOver()
    );
    TimeBankModule.stop(); // Pause immediately until study phase ends
    
    loadLevel();
  }

  function loadLevel() {
    // Progressive Scaling
    if (state.level < 4) state.size = 3;
    else if (state.level < 8) state.size = 4;
    else state.size = 5;

    // Hardcore toggle on higher levels
    if (state.level >= 10) state.hardcore = true;

    state.imgSrc = EndlessImages.getRandomImage();
    state.tiles = GridManager.create(state.size);
    state.frozen.clear();
    state.isPlaying = true;
    state.isAnimating = false;

    previewImg.src = state.imgSrc;
    if (targetThumbnail) targetThumbnail.src = state.imgSrc;
    
    TileRenderer.init(boardEl);
    TileRenderer.setFrozen(state.frozen);
    TileRenderer.setHardcore(state.hardcore);
    TileRenderer.render(state.tiles, state.size, state.imgSrc, handleTileClick);
    updateHUD();

    startStudyPhase();
  }

  function startStudyPhase() {
    state.isPlaying = false;
    clearInterval(hazardInterval);
    clearInterval(studyInterval);
    
    TimeBankModule.stop(); // Pause main timer

    let studyTimeLeft = 10;
    const timerSpan = document.getElementById('study-timer');
    timerSpan.textContent = studyTimeLeft;
    
    previewOverlay.classList.add('visible');

    studyInterval = setInterval(() => {
      studyTimeLeft--;
      timerSpan.textContent = studyTimeLeft;
      if (studyTimeLeft <= 0) {
        endStudyPhase();
      }
    }, 1000);
  }

  function endStudyPhase() {
    clearInterval(studyInterval);
    previewOverlay.classList.remove('visible');
    
    state.isPlaying = true;
    
    // Resume TimeBank
    // If it's the first level, we start it; else we just resume by calling start with current remaining time
    TimeBankModule.start(TimeBankModule.getTimeLeft(), 
      (fmt) => { statTime.textContent = fmt; },
      () => handleGameOver()
    );

    // Hazards setup
    if (state.level >= 5) {
      hazardInterval = setInterval(spawnIceHazard, 5000 - Math.min(2000, state.level * 100));
    }
  }

  function spawnIceHazard() {
    if (!state.isPlaying || state.isAnimating) return;
    const emptyIdx = state.tiles.indexOf(0);
    const available = [];
    state.tiles.forEach((val, idx) => {
      if (val !== 0 && idx !== emptyIdx && !state.frozen.has(idx)) available.push(idx);
    });
    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      state.frozen.add(pick);
      TileRenderer.setFrozen(state.frozen);
      TileRenderer.render(state.tiles, state.size, state.imgSrc, handleTileClick);
    }
  }

  function handleTileClick(idx) {
    if (state.isAnimating || !state.isPlaying) return;

    // Handle frozen tiles
    if (state.frozen.has(idx)) {
      state.frozen.delete(idx);
      TileRenderer.setFrozen(state.frozen);
      TileRenderer.render(state.tiles, state.size, state.imgSrc, handleTileClick);
      return; // Uses a "move" just to unfreeze
    }

    const emptyIdx = state.tiles.indexOf(0);
    const validNeighbors = GridManager.getValidNeighbors(emptyIdx, state.size);
    if (!validNeighbors.includes(idx)) return;

    state.isAnimating = true;

    // Combo logic
    const now = Date.now();
    if (state.lastMoveTime > 0 && (now - state.lastMoveTime) < 1500) {
      state.combo = Math.min(state.combo + 0.1, 4.0); // Max 4x combo
      SoundModule.comboUp();
      statCombo.classList.add('combo-active');
      setTimeout(() => statCombo.classList.remove('combo-active'), 300);
    } else if (state.lastMoveTime > 0 && (now - state.lastMoveTime) > 3000) {
      state.combo = 1;
      SoundModule.comboBreak();
    }
    state.lastMoveTime = now;
    
    // Add small score per move based on combo
    state.score += Math.floor(10 * state.combo);

    // Swap
    const clickRow = Math.floor(idx / state.size);
    const clickCol = idx % state.size;
    const emptyRow = Math.floor(emptyIdx / state.size);
    const emptyCol = emptyIdx % state.size;

    let slideDir = '';
    if (clickRow < emptyRow) slideDir = 'bottom';
    if (clickRow > emptyRow) slideDir = 'top';
    if (clickCol < emptyCol) slideDir = 'right';
    if (clickCol > emptyCol) slideDir = 'left';

    state.tiles[emptyIdx] = state.tiles[idx];
    state.tiles[idx] = 0;

    TileRenderer.setLastMove(emptyIdx, slideDir);
    TileRenderer.render(state.tiles, state.size, state.imgSrc, handleTileClick);
    updateHUD();

    SoundModule.slide();

    setTimeout(() => {
      state.isAnimating = false;
      if (GridManager.isSolved(state.tiles)) handleLevelClear();
    }, 180);
  }

  function handleLevelClear() {
    state.isPlaying = false;
    clearInterval(hazardInterval);
    SoundModule.win();

    // Fill last tile
    const emptyEl = boardEl.querySelector('.tile.empty');
    if (emptyEl) {
      const ts = TileRenderer.getTileSize();
      const bgW = ts * state.size;
      emptyEl.classList.remove('empty');
      emptyEl.style.backgroundImage = `url('${state.imgSrc}')`;
      emptyEl.style.backgroundSize = `${bgW}px ${bgW}px`;
      emptyEl.style.backgroundPosition = `0px 0px`;
      emptyEl.style.backgroundRepeat = 'no-repeat';
      emptyEl.style.animation = 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both';
    }

    ConfettiEngine.burst();

    // Calculate level clear rewards
    const timeBonus = 120000; // 2 minutes bonus
    TimeBankModule.addTime(timeBonus);
    
    const scoreBonus = state.size * 1000 * Math.floor(state.combo);
    state.score += scoreBonus;
    updateHUD();

    setTimeout(() => {
      state.level++;
      loadLevel();
    }, 1500); // 1.5s visual pause before next board
  }

  function handleGameOver() {
    state.isPlaying = false;
    clearInterval(hazardInterval);
    SoundModule.lose();

    document.getElementById('win-moves').textContent = state.level;
    document.getElementById('win-time').textContent = 'EXPIRED';
    document.getElementById('win-score').textContent = state.score.toLocaleString();
    document.getElementById('win-rating').textContent = 'GAME OVER';

    document.querySelector('.win-title').innerHTML = `TIME'S<br/><span class="accent">UP!</span>`;

    showScreen('win');
  }

  function updateHUD() {
    statLevel.textContent = state.level;
    statScore.textContent = state.score.toLocaleString();
    statCombo.textContent = `x${state.combo.toFixed(1)}`;
  }

  function initGameButtons() {
    document.getElementById('btn-back').addEventListener('click', () => {
      TimeBankModule.stop();
      clearInterval(hazardInterval);
      clearInterval(studyInterval);
      state.isPlaying = false;
      previewOverlay.classList.remove('visible');
      showScreen('menu');
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      // Re-rolls board but penalizes time
      TimeBankModule.addTime(-10000); // -10s for reroll
      loadLevel();
    });

    document.getElementById('btn-skip-study').addEventListener('click', () => {
      endStudyPhase();
    });
  }

  function initWinButtons() {
    document.getElementById('btn-play-again').addEventListener('click', () => {
      ConfettiEngine.stop();
      startEndlessRun();
    });
    document.getElementById('btn-menu').addEventListener('click', () => {
      ConfettiEngine.stop();
      showScreen('menu');
    });
  }

  function initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (!state.isPlaying) return;
      const emptyIdx = state.tiles.indexOf(0);
      const size = state.size;
      const emptyRow = Math.floor(emptyIdx / size);
      const emptyCol = emptyIdx % size;

      let targetIdx = -1;
      if (e.key === 'ArrowLeft'  && emptyCol < size - 1) targetIdx = emptyIdx + 1;
      if (e.key === 'ArrowRight' && emptyCol > 0)        targetIdx = emptyIdx - 1;
      if (e.key === 'ArrowUp'    && emptyRow < size - 1) targetIdx = emptyIdx + size;
      if (e.key === 'ArrowDown'  && emptyRow > 0)        targetIdx = emptyIdx - size;

      if (targetIdx >= 0) {
        e.preventDefault();
        handleTileClick(targetIdx);
      }
    });
  }

  return {
    init() {
      ConfettiEngine.init(document.getElementById('confetti-canvas'));
      initMenu();
      initGameButtons();
      initWinButtons();
      initKeyboard();
    },
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  GameController.init();
});
