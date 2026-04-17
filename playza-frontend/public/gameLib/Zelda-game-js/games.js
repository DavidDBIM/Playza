/**
 * TACTICAL MAZE — Breach & Clear
 * Canvas-based top-down shooter with 3 large maze levels.
 * Player starts at BOTTOM, exits at TOP.
 * Enemies patrol, detect, chase, and shoot.
 */

// ─── CONSTANTS ────────────────────────────────────────
const TS = 46; // Tile Size increased for wider corridors
const COLS = 25; // maze columns
const ROWS = 33; // maze rows (tall maze)

const PLAYER_SPEED = 130; // px/sec
const PLAYER_HP = 100;
const BULLET_SPEED_P = 500;
const BULLET_SPEED_E = 380;
const PLAYER_SHOOT_INTERVAL = 210;
const ENEMY_DETECT_RANGE = 520; // Tactical awareness boost
const ENEMY_SHOOT_RANGE = 340;

// Target total enemies per level (after redistribution) - reduced for playability
const LEVEL_ENEMY_TARGETS = [25, 60, 90];

// ─── MAP DEFINITIONS ─────────────────────────────────
// Characters: W=wall, ' '=floor, E=enemy, P=player start, X=exit door
// Maps are 33 rows x 25 cols. Exit 'X' is near top row, Player 'P' near bottom.

// E = regular patrol enemy
// A = aggressor (always chases player from spawn)
// F = flanker (fast, lite health, rushes through corridors)
// G = giant (high health, slow, heavy damage)
const LEVEL_MAPS = [
  // ── LEVEL 1 — 12 enemies ─────────────────────────────
  [
    "WWWWWWWWWWWWWWWWWWWWWWWWW",
    "W    X      W   W   W AXW",
    "W WW   WW W W W W W W WWW",
    "W W  WW   W W   W W   W W",
    "W W  W  WWW WWWWW W WWW W",
    "W  A W      W  E    W   W",
    "WWWW WWW WW W WWWWW W W W",
    "W  E     W    W   W W W W",
    "W WWWWWW WWWW W W W W W W",
    "W W   A  W    W W   W W W",
    "W W WWWW W  W W WWWWW W W",
    "W W W  W W  W W       W W",
    "W W W  W W  WWW WWWWWWW W",
    "W   W  W    W      AE   W",
    "W W WWWWWWWWW W WWWWWW WW",
    "W W          W W        W",
    "W WWWWWWW WW W W WWWWWW W",
    "W W     W  W   W W  E   W",
    "W W WWW W  WWWWW W WWWWWW",
    "W   W E W      W W      W",
    "WWWWW W WWWWWW W W WWWW W",
    "W   A W        W W  W   W",
    "W WWW WWWWWWWWWW WWWW W W",
    "W   W    E     W      W W",
    "WWW W WWWWWWWW WWWWWWWW W",
    "W   W E   A  W          W",
    "W WWWWWWWWWW W WWWWWWWW W",
    "W W          W W    E   W",
    "W W WWWWWWWW W W WWWWWW W",
    "W W E  A     W W        W",
    "W WWWWWWWWWWWW WWWWWWWW W",
    "W         A             W",
    "WWWWWWWWWWW P WWWWWWWWWWW",
  ],
  // ── LEVEL 2 — 26 enemies ─────────────────────────────
  [
    "WWWWWWWWWWWWWWWWWWWWWWWWW",
    "W E X  W  E W   E  W  E W",
    "W W  W W WW W WWWW W WW W",
    "W WW W E W  A W  W   W  W",
    "W  W WWWWWWWWWW  WWWWWW W",
    "W  W  A E E    E W  A   W",
    "WWWWWWW WWWWWWW W WWWWWWW",
    "W    E  E     E W E  A  W",
    "W WWWWWWWWWW WW W WWWWW W",
    "W W   E    W  W W W   W W",
    "W W WWWWWW W  W   W W W W",
    "W W W  A W W  WWWWW W W W",
    "W   W WW W W  E     W W W",
    "WWWWW W  W WWWWWWWW W W W",
    "W     W  W  A E  E  W   W",
    "W WWWWWWWWWWWWWWWWWWWWW W",
    "W W    E  A    E  E     W",
    "W W WWWWWWWWWWWWWWWWWWWWW",
    "W W W   E  A    E  E    W",
    "W   W WWWWWWWWWWWWWWWW WW",
    "WWWWW W  E  A  E      WWW",
    "W     W WWWWWWWWWWWWWW  W",
    "W WWWWW W   E  W    W   W",
    "WWWWWWWWWWW P WWWWWWWWWWW",
  ],
  // ── LEVEL 3 — 34 enemies ─────────────────────────────
  [
    "WWWWWWWWWWWWWWWWWWWWWWWWW",
    "W E X  E   W   A  E  W  W",
    "W W  WWWWW W WWWWWWW W  W",
    "W WW E   W W W  E  W WW W",
    "W  WWWWW W  AW WWW W  W W",
    "W  A   W WWWWW W W WWWW W",
    "WWWWWW W W  AE W W  E   W",
    "W      W W WWW W WWWWWWWW",
    "W WWWWWW W W E W  E   E W",
    "W W   AE   W WWWWWWWWWW W",
    "W W WWWWWWWW W  E    A  W",
    "W W W  E     W WWWWWWWW W",
    "W W W WWWWWWWW W  E  A  W",
    "W   W   A    E W WWWWWWWW",
    "WWWWWWWWWWWWWWWWW E      W",
    "W   E  A   E     W WWWWW W",
    "W WWWWWWWWWWWWWWWW W   W W",
    "W W   A  E  A      W W W W",
    "W W WWWWWWWWWWWWWWWW W W W",
    "W W W  E  A  E    E  W W W",
    "W   W WWWWWWWWWWWWWWWW W W",
    "WWWWW W   A  E   A      W",
    "W     WWWWWWWWWWWWWWWWWWW",
    "W  E  A  E  A   E W      W",
    "WWWWWWWWWWWWWWWWW W WWWW W",
    "W   E  A   E      W W  E W",
    "W WWWWWWWWWWWWWWWWW W WWWW",
    "W W  E  A    E      W    W",
    "W W WWWWWWWWWWWWWWWWWWWW W",
    "W   W  A  E   A  E       W",
    "WWWWWWWWWWWWWWWWWWWWWWWW W",
    "W   E  A   E  A  E       W",
    "WWWWWWWWWWW P WWWWWWWWWWW",
  ],
];

// ─── STATE ──────────────────────────────────────────
let canvas, ctx;
let gameState = "start"; // start | playing | levelComplete | win | over
let currentLevel = 0;
let score = 0;
let totalKills = 0;

let player = {};
let enemies = [];
let bullets = [];
let particles = [];
let pickups = [];
let walls = [];
let exitDoor = null;
let exitOpen = false;

let camX = 0,
  camY = 0; // camera offset
let mapPixelW = 0,
  mapPixelH = 0;

let keys = {};
let mousePos = { x: 0, y: 0 };
let mouseDown = false;
let mouseMoved = false;

// Player stats & powerups
let gunLevel = 1;

// Joystick state
let joystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };
let mobileShoot = false;
let lastTime = null;

// Sound system
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      try {
        audioCtx = new AudioCtx();
      } catch (e) {
        console.warn("AudioContext creation failed:", e);
      }
    }
  }
}
function playSound(type) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  switch (type) {
    case "shoot":
      osc.type = "square";
      osc.frequency.setValueAtTime(gunLevel > 1 ? 800 : 600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case "hit":
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    case "death":
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
      break;
    case "pickup-hp":
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    case "pickup-gun":
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
      break;
    case "levelup":
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    case "gameover":
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 1.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      osc.start(now);
      osc.stop(now + 1.2);
      break;
  }
}

// New game mechanics
let lives = 3; // Lives system

// ─── INIT ─────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("game-canvas");
  ctx = canvas.getContext("2d");

  setupCanvasSize();
  setupInputs();
  setupUI();
  setupOrientationGuard();

  requestAnimationFrame(mainLoop);
});

// ─── LANDSCAPE ORIENTATION GUARD ────────────────────────────
function setupOrientationGuard() {
  // Only matters on narrow/touch screens
  const overlay = document.createElement("div");
  overlay.id = "rotate-overlay";
  overlay.innerHTML = `
    <div class="rotate-inner">
      <div class="rotate-icon">&#8635;</div>
      <div class="rotate-title">ROTATE DEVICE</div>
      <div class="rotate-sub">Tactical Maze requires landscape mode</div>
    </div>
  `;
  document.body.appendChild(overlay);

  function checkOrientation() {
    const isNarrow =
      window.innerWidth < 600 || window.innerHeight > window.innerWidth;
    overlay.style.display = isNarrow ? "flex" : "none";

    // Attempt to force orientation if API is available
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("landscape").catch(() => {
        // Fallback or silent fail if not supported/allowed
      });
    }

    if (isNarrow && gameState === "playing") {
      overlay.dataset.paused = "true";
    }
  }

  window.addEventListener("resize", checkOrientation);
  window.addEventListener("orientationchange", checkOrientation);
  checkOrientation();
}

function setupCanvasSize() {
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
}

function resizeCanvas() {
  const hud = document.getElementById("hud");
  const hudH = hud ? hud.offsetHeight : 56;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - hudH; // Canvas uses full height below HUD; mobile controls overlay
}

// ─── UI ───────────────────────────────────────────────
function setupUI() {
  document
    .getElementById("btn-start")
    .addEventListener("click", () => startGame(0));
  document
    .getElementById("btn-retry")
    .addEventListener("click", () => startGame(0));
  document
    .getElementById("btn-next-level")
    .addEventListener("click", () => startGame(currentLevel + 1));
  document
    .getElementById("btn-play-again")
    .addEventListener("click", () => startGame(0));
}

function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  if (id) document.getElementById(id).classList.add("active");
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement
      .requestFullscreen({ navigationUI: "hide" })
      .catch((e) => console.log(e));
  }
}
// Force fullscreen on interaction
window.addEventListener(
  "click",
  () => {
    if (gameState === "playing" && !document.fullscreenElement) {
      toggleFullscreen();
    }
  },
  { once: false },
);

document.addEventListener("fullscreenchange", () => {
  setTimeout(resizeCanvas, 100);
});

function updateHUD() {
  document.getElementById("hud-level").textContent = currentLevel + 1;
  document.getElementById("hud-score").textContent = score;
  document.getElementById("hud-enemies").textContent = enemies.length;
  document.getElementById("hud-kills").textContent = totalKills;
  document.getElementById("hud-ammo").textContent =
    gunLevel > 1 ? "ELITE" : "STD";
  document.getElementById("hud-gun").textContent = gunLevel > 1 ? "★ ★" : "▸";

  const livesEl = document.getElementById("hud-lives");
  if (livesEl) {
    let hearts = "";
    for (let i = 0; i < lives; i++) hearts += "❤";
    livesEl.textContent = hearts || "RIP";
  }

  const hpPct = Math.max(0, (player.hp / PLAYER_HP) * 100);
  const bar = document.getElementById("hp-bar");
  const hpVal = document.getElementById("hud-hp");
  if (bar) {
    bar.style.width = hpPct + "%";
    bar.classList.toggle("low", hpPct < 30);
  }
  if (hpVal) hpVal.textContent = Math.max(0, Math.ceil(player.hp));
}

function flashScreen(cls) {
  const el = document.getElementById("screen-flash");
  el.className = cls;
  setTimeout(() => {
    el.className = "";
  }, 200);
}

function showFloatingMsg(text, color = "#00e5ff") {
  const el = document.createElement("div");
  el.className = "float-msg";
  el.style.color = color;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

// ─── GAME START / LOAD LEVEL ──────────────────────────
function startGame(lvl) {
  initAudio();
  currentLevel = lvl;
  if (lvl === 0) {
    score = 0;
    totalKills = 0;
    lives = 3;
    gunLevel = 1;
  }
  gameState = "playing";
  showScreen(null);

  // Try to go fullscreen on start
  toggleFullscreen();

  loadLevel(lvl);
}

function loadLevel(lvl) {
  walls = [];
  enemies = [];
  bullets = [];
  particles = [];
  pickups = [];
  exitDoor = null;
  exitOpen = false;

  const mapData = LEVEL_MAPS[lvl];
  mapPixelW = COLS * TS;
  mapPixelH = ROWS * TS;

  for (let r = 0; r < ROWS; r++) {
    const row = mapData[r] || "";
    for (let c = 0; c < COLS; c++) {
      const ch = row[c] || "W";
      const wx = c * TS,
        wy = r * TS;
      if (ch === "W") {
        walls.push({ x: wx, y: wy, w: TS, h: TS });
      } else if (ch === "X") {
        exitDoor = { x: wx, y: wy, w: TS, h: TS };
      } else if (ch === "P") {
        player = {
          x: wx + TS / 2,
          y: wy + TS / 2,
          hp: PLAYER_HP,
          dirX: 0,
          dirY: -1,
          lastShot: 0,
          dead: false,
          damageFlash: 0,
          w: 20,
          h: 24, // Slimmer collision box for easier corridor movement
        };
      }
    }
  }

  // Spawn scattered enemies uniformly
  spawnEnemiesScattered(lvl);

  // Spawn Pickups: 2 Health, 1 Gun upgrade per level
  spawnPickups(lvl);

  snapCamera();
  updateHUD();
}

function spawnPickups(lvl) {
  // 2 Health patches
  for (let i = 0; i < 2; i++) {
    placePickup("health");
  }
  // 2 Gun upgrades
  for (let i = 0; i < 2; i++) {
    placePickup("gun");
  }
}

function placePickup(type) {
  let attempts = 0;
  while (attempts < 150) {
    const c = Math.floor(Math.random() * COLS);
    const r = Math.floor(Math.random() * ROWS);
    const wx = c * TS,
      wy = r * TS;
    if (
      !isWall(wx + TS / 2, wy + TS / 2) &&
      !enemiesSomeAt(wx, wy) &&
      !playerStartAt(wx, wy) &&
      !exitDoorAt(wx, wy) &&
      !pickupAt(wx, wy)
    ) {
      pickups.push({
        x: wx + TS / 2,
        y: wy + TS / 2,
        type: type,
        w: 20,
        h: 20,
        bob: Math.random() * Math.PI * 2,
      });
      return;
    }
    attempts++;
  }
}

function pickupAt(wx, wy) {
  for (let p of pickups) {
    if (Math.hypot(p.x - (wx + TS / 2), p.y - (wy + TS / 2)) < TS) return true;
  }
  return false;
}

// ─── HELPER FUNCTIONS ─────────────────────────────────
// Check if world coordinate is a wall
function isWall(x, y) {
  const c = Math.floor(x / TS),
    r = Math.floor(y / TS);
  if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return true;
  const row = LEVEL_MAPS[currentLevel][r] || "";
  return row[c] === "W";
}

// Check if any enemy is near a tile (for pickup placement)
function enemiesSomeAt(wx, wy) {
  const cx = wx + TS / 2,
    cy = wy + TS / 2;
  for (let e of enemies) {
    if (Math.hypot(e.x - cx, e.y - cy) < TS) return true;
  }
  return false;
}

// Check if position matches exit door
function exitDoorAt(wx, wy) {
  if (!exitDoor) return false;
  return exitDoor.x === wx && exitDoor.y === wy;
}

// Check if position is player start
function playerStartAt(wx, wy) {
  return Math.hypot(player.x - (wx + TS / 2), player.y - (wy + TS / 2)) < TS;
}

// Spawn enemies in corners instead of map positions
function spawnEnemiesScattered(lvl) {
  const mapData = LEVEL_MAPS[lvl];
  const targetCount = LEVEL_ENEMY_TARGETS[lvl];

  // Safety radius from player spawn (approx 5-6 tiles)
  const minPlayerDist = TS * 6;

  // Prefer types from map but scale to target count
  let mapTypes = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ch = mapData[r][c];
      if ("EAFG".includes(ch)) {
        if (ch === "E") mapTypes.push("normal");
        if (ch === "A") mapTypes.push("aggressor");
        if (ch === "F") mapTypes.push("flanker");
        if (ch === "G") mapTypes.push("giant");
      }
    }
  }

  for (let i = 0; i < targetCount; i++) {
    const override = mapTypes[i % mapTypes.length] || null;
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 200) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      const wx = c * TS + TS / 2;
      const wy = r * TS + TS / 2;

      const distToPlayer = Math.hypot(wx - player.x, wy - player.y);

      if (
        !isWall(wx, wy) &&
        distToPlayer > minPlayerDist &&
        !enemiesSomeAt(c * TS, r * TS)
      ) {
        spawnEnemy(wx, wy, lvl, override);
        placed = true;
      }
      attempts++;
    }
  }
}

function spawnEnemy(cx, cy, lvl, typeOverride) {
  // type: 'normal' | 'elite' | 'aggressor' | 'flanker'
  let type;
  if (typeOverride === "aggressor") {
    type = "aggressor";
  } else if (typeOverride === "flanker") {
    type = "flanker";
  } else if (typeOverride === "giant") {
    type = "giant";
  } else {
    const roll = Math.random();
    if (lvl >= 2 && roll < 0.35) type = "elite";
    else if (lvl === 1 && roll < 0.15) type = "elite";
    else if (roll < 0.12) type = "flanker";
    else if (lvl >= 1 && roll < 0.35)
      type = "giant"; // Increased giant spawn
    else type = "normal";
  }

  const cfg = {
    normal: {
      hp: 35,
      speed: 60,
      fireRate: 1400,
      isElite: false,
      isAggressor: false,
      isFlanker: false,
      isGiant: false,
    },
    elite: {
      hp: 72,
      speed: 70,
      fireRate: 800,
      isElite: true,
      isAggressor: false,
      isFlanker: false,
      isGiant: false,
    },
    aggressor: {
      hp: 45,
      speed: 105,
      fireRate: 1100,
      isElite: false,
      isAggressor: true,
      isFlanker: false,
      isGiant: false,
    },
    flanker: {
      hp: 25,
      speed: 125,
      fireRate: 1800,
      isElite: false,
      isAggressor: false,
      isFlanker: true,
      isGiant: false,
    },
    giant: {
      hp: 160,
      speed: 45,
      fireRate: 1300,
      isElite: false,
      isAggressor: false,
      isFlanker: false,
      isGiant: true,
    },
  }[type];

  enemies.push({
    x: cx,
    y: cy,
    hp: cfg.hp,
    maxHp: cfg.hp,
    speed: cfg.speed,
    fireRate: cfg.fireRate,
    lastShot: Math.random() * 1500,
    dirX: 1,
    dirY: 0,
    state: cfg.isAggressor || cfg.isFlanker ? "chase" : "patrol",
    patrolTimer: Math.random() * 2 + 1,
    patrolDirX: Math.random() < 0.5 ? 1 : -1,
    patrolDirY: 0,
    damageFlash: 0,
    isElite: cfg.isElite,
    isAggressor: cfg.isAggressor,
    isFlanker: cfg.isFlanker,
    isGiant: cfg.isGiant,
    w: cfg.isGiant ? 36 : cfg.isElite || cfg.isAggressor ? 28 : 22,
    h: cfg.isGiant ? 36 : cfg.isElite || cfg.isAggressor ? 28 : 22,
    dead: false,
    detectRange: cfg.isAggressor || cfg.isFlanker ? 99999 : ENEMY_DETECT_RANGE,
  });
}

// ─── CAMERA ───────────────────────────────────────────
function snapCamera() {
  camX = player.x - canvas.width / 2;
  camY = player.y - canvas.height / 2;
  clampCamera();
}

function clampCamera() {
  camX = Math.max(0, Math.min(camX, mapPixelW - canvas.width));
  camY = Math.max(0, Math.min(camY, mapPixelH - canvas.height));
  if (mapPixelW <= canvas.width) camX = (mapPixelW - canvas.width) / 2;
  if (mapPixelH <= canvas.height) camY = (mapPixelH - canvas.height) / 2;
}

// ─── INPUTS ───────────────────────────────────────────
function setupInputs() {
  // Keyboard
  window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code === "Space") {
      e.preventDefault();
    }
  });
  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });

  // Mouse aim & shoot
  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - r.left;
    mousePos.y = e.clientY - r.top;
    mouseMoved = true;
  });
  canvas.addEventListener("mousedown", () => {
    mouseDown = true;
  });
  canvas.addEventListener("mouseup", () => {
    mouseDown = false;
  });

  // Touch shoot button
  const btnShoot = document.getElementById("btn-shoot");
  btnShoot.addEventListener("touchstart", (e) => {
    e.preventDefault();
    mobileShoot = true;
  });
  btnShoot.addEventListener("touchend", (e) => {
    e.preventDefault();
    mobileShoot = false;
  });
  btnShoot.addEventListener("mousedown", () => (mobileShoot = true));
  btnShoot.addEventListener("mouseup", () => (mobileShoot = false));

  // Joystick
  const base = document.getElementById("joystick-base");
  base.addEventListener("touchstart", onJoyStart, { passive: false });
  base.addEventListener("touchmove", onJoyMove, { passive: false });
  base.addEventListener("touchend", onJoyEnd, { passive: false });
}

function onJoyStart(e) {
  e.preventDefault();
  const t = e.touches[0];
  const r = e.currentTarget.getBoundingClientRect();
  joystick.active = true;
  joystick.startX = r.left + r.width / 2;
  joystick.startY = r.top + r.height / 2;
  joystick.dx = 0;
  joystick.dy = 0;
}

function onJoyMove(e) {
  e.preventDefault();
  if (!joystick.active) return;
  const t = e.touches[0];
  const maxR = 40;
  let dx = t.clientX - joystick.startX;
  let dy = t.clientY - joystick.startY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > maxR) {
    dx = (dx / dist) * maxR;
    dy = (dy / dist) * maxR;
  }
  joystick.dx = dx / maxR;
  joystick.dy = dy / maxR;

  const knob = document.getElementById("joystick-knob");
  knob.style.left = 55 + dx + "px";
  knob.style.top = 55 + dy + "px";
}

function onJoyEnd(e) {
  e.preventDefault();
  joystick.active = false;
  joystick.dx = 0;
  joystick.dy = 0;
  const knob = document.getElementById("joystick-knob");
  knob.style.left = "50%";
  knob.style.top = "50%";
}

// ─── COLLISION ────────────────────────────────────────
function wallHit(x, y, w, h) {
  const pad = 3;
  const lx = x - w / 2 + pad,
    rx = x + w / 2 - pad;
  const ty = y - h / 2 + pad,
    by = y + h / 2 - pad;
  if (lx < 0 || ty < 0 || rx > mapPixelW || by > mapPixelH) return true;
  for (let wl of walls) {
    if (lx < wl.x + wl.w && rx > wl.x && ty < wl.y + wl.h && by > wl.y)
      return true;
  }
  return false;
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return (
    ax - aw / 2 < bx + bw / 2 &&
    ax + aw / 2 > bx - bw / 2 &&
    ay - ah / 2 < by + bh / 2 &&
    ay + ah / 2 > by - bh / 2
  );
}

// ─── MAIN LOOP ────────────────────────────────────────
function mainLoop(ts) {
  const dt = lastTime !== null ? Math.min((ts - lastTime) / 1000, 0.05) : 0.016;
  lastTime = ts;

  if (gameState === "playing") {
    update(dt, ts);
    draw();
  } else {
    drawBackground();
  }

  requestAnimationFrame(mainLoop);
}

// ─── UPDATE ───────────────────────────────────────────
function update(dt, ts) {
  updatePlayer(dt, ts);
  updateEnemies(dt, ts);
  updateBullets(dt);
  updateParticles(dt);
  updatePickups(dt);
  checkDoor();

  // Smooth camera follow
  const targetCamX = player.x - canvas.width / 2;
  const targetCamY = player.y - canvas.height / 2;
  camX += (targetCamX - camX) * 8 * dt;
  camY += (targetCamY - camY) * 8 * dt;
  clampCamera();

  updateHUD();
}

function updatePlayer(dt, ts) {
  if (player.dead) return;

  // Movement vector
  let vx = 0,
    vy = 0;
  if (keys["ArrowUp"] || keys["KeyW"]) vy -= 1;
  if (keys["ArrowDown"] || keys["KeyS"]) vy += 1;
  if (keys["ArrowLeft"] || keys["KeyA"]) vx -= 1;
  if (keys["ArrowRight"] || keys["KeyD"]) vx += 1;

  // Joystick override
  if (joystick.active) {
    vx = joystick.dx;
    vy = joystick.dy;
  }

  // Normalize
  const spd = Math.sqrt(vx * vx + vy * vy);
  if (spd > 0) {
    vx /= spd;
    vy /= spd;
  }

  // Move X
  const nx = player.x + vx * PLAYER_SPEED * dt;
  if (!wallHit(nx, player.y, player.w, player.h)) player.x = nx;

  // Move Y
  const ny = player.y + vy * PLAYER_SPEED * dt;
  if (!wallHit(player.x, ny, player.w, player.h)) player.y = ny;

  // Aim direction
  if (joystick.active) {
    // Priority 1: Mobile Joystick
    player.dirX = joystick.dx;
    player.dirY = joystick.dy;
  } else if (mouseMoved && !mobileShoot) {
    // Priority 2: Mouse Aim (Anytime mouse is active/moved)
    const worldMx = mousePos.x + camX;
    const worldMy = mousePos.y + camY;
    const aimDx = worldMx - player.x;
    const aimDy = worldMy - player.y;
    const aimLen = Math.sqrt(aimDx * aimDx + aimDy * aimDy);
    if (aimLen > 5) {
      player.dirX = aimDx / aimLen;
      player.dirY = aimDy / aimLen;
    }
  } else if (spd > 0) {
    // Priority 3: Movement (Fallback)
    player.dirX = vx;
    player.dirY = vy;
  }

  // Shoot with gun level modifications
  const wantShoot = keys["Space"] || mouseDown || mobileShoot;
  const shootInterval =
    gunLevel > 1 ? PLAYER_SHOOT_INTERVAL * 0.7 : PLAYER_SHOOT_INTERVAL;

  if (wantShoot && ts - player.lastShot > shootInterval) {
    const angle = Math.atan2(player.dirY, player.dirX);

    if (gunLevel > 1) {
      // Rapid fire/Spread if elite gun
      spawnBullet(
        player.x,
        player.y,
        Math.cos(angle - 0.1),
        Math.sin(angle - 0.1),
        false,
      );
      spawnBullet(
        player.x,
        player.y,
        Math.cos(angle + 0.1),
        Math.sin(angle + 0.1),
        false,
      );
    } else {
      spawnBullet(player.x, player.y, Math.cos(angle), Math.sin(angle), false);
    }

    player.lastShot = ts;
    spawnMuzzleFlash(
      player.x + player.dirX * 14,
      player.y + player.dirY * 14,
      "#ffe080",
    );
    playSound("shoot");
  }

  // Damage flash decay
  if (player.damageFlash > 0) player.damageFlash -= dt * 4;
}

function updateEnemies(dt, ts) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.dead) {
      enemies.splice(i, 1);
      continue;
    }

    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // ── State machine ─────────────────────────────────
    // Aggressors/flankers always chase regardless of LOS or range
    if (e.isAggressor || e.isFlanker) {
      // always bee-line toward player
      e.state =
        dist < ENEMY_SHOOT_RANGE && hasLOS(e.x, e.y, player.x, player.y)
          ? "chase-shoot"
          : "chase";
    } else if (!player.dead && dist < e.detectRange) {
      if (hasLOS(e.x, e.y, player.x, player.y)) {
        e.state = dist < ENEMY_SHOOT_RANGE ? "shoot" : "chase";
      } else {
        e.state = "patrol";
      }
    } else {
      e.state = "patrol";
    }

    let vx = 0,
      vy = 0;

    if (
      e.state === "chase" ||
      e.state === "chase-shoot" ||
      e.state === "shoot"
    ) {
      if (dist > 0) {
        e.dirX = dx / dist;
        e.dirY = dy / dist;
      }

      // Aggressors and chase-shoot always move toward player
      if (e.state === "chase" || e.state === "chase-shoot") {
        vx = e.dirX;
        vy = e.dirY;
      }

      // Shoot (stand-still for normal; while moving for aggressor)
      const canShoot =
        e.state === "shoot" ||
        (e.state === "chase-shoot" && dist < ENEMY_SHOOT_RANGE);
      if (canShoot && ts - e.lastShot > e.fireRate) {
        spawnBullet(e.x, e.y, e.dirX, e.dirY, true);
        e.lastShot = ts;
        spawnMuzzleFlash(
          e.x + e.dirX * 13,
          e.y + e.dirY * 13,
          e.isAggressor ? "#ff9900" : "#ff6060",
        );
      }
    } else {
      // Patrol: random wander
      e.patrolTimer -= dt;
      if (e.patrolTimer <= 0) {
        const dirs = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
          [1, 1],
          [-1, 1],
          [1, -1],
          [-1, -1],
        ];
        const d = dirs[Math.floor(Math.random() * dirs.length)];
        e.patrolDirX = d[0];
        e.patrolDirY = d[1];
        e.patrolTimer = Math.random() * 2 + 0.8;
      }
      vx = e.patrolDirX;
      vy = e.patrolDirY;
      e.dirX = vx || e.dirX;
      e.dirY = vy || e.dirY;
    }

    // Move enemy
    const spd = Math.sqrt(vx * vx + vy * vy);
    if (spd > 0) {
      const nx = e.x + (vx / spd) * e.speed * dt;
      const ny = e.y + (vy / spd) * e.speed * dt;
      if (!wallHit(nx, e.y, e.w, e.h)) e.x = nx;
      else {
        e.patrolDirX *= -1;
        // Aggressors slide along walls
        if (e.isAggressor || e.isFlanker) {
          e.patrolDirY = Math.random() < 0.5 ? 1 : -1;
        }
      }
      if (!wallHit(e.x, ny, e.w, e.h)) e.y = ny;
      else {
        e.patrolDirY *= -1;
        if (e.isAggressor || e.isFlanker) {
          e.patrolDirX = Math.random() < 0.5 ? 1 : -1;
        }
      }
    }

    // Melee damage
    if (
      rectsOverlap(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)
    ) {
      applyPlayerDamage((e.isAggressor ? 30 : 18) * dt);
    }

    if (e.damageFlash > 0) e.damageFlash -= dt * 5;
  }
}

function hasLOS(x1, y1, x2, y2) {
  const steps = 12;
  for (let i = 1; i < steps; i++) {
    const tx = x1 + ((x2 - x1) * i) / steps;
    const ty = y1 + ((y2 - y1) * i) / steps;
    if (wallHit(tx, ty, 4, 4)) return false;
  }
  return true;
}

function spawnBullet(x, y, dx, dy, isEnemy) {
  bullets.push({
    x,
    y,
    vx: dx * (isEnemy ? BULLET_SPEED_E : BULLET_SPEED_P),
    vy: dy * (isEnemy ? BULLET_SPEED_E : BULLET_SPEED_P),
    isEnemy,
    life: 2.2,
    r: isEnemy ? 4 : 5,
  });
}

function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;

    let hit = false;
    if (b.life <= 0 || wallHit(b.x, b.y, b.r * 2, b.r * 2)) {
      hit = true;
      spawnParticles(b.x, b.y, b.isEnemy ? "#ff4444" : "#80e0ff", 4);
    } else if (b.isEnemy) {
      if (
        !player.dead &&
        rectsOverlap(
          player.x,
          player.y,
          player.w,
          player.h,
          b.x,
          b.y,
          b.r * 2,
          b.r * 2,
        )
      ) {
        applyPlayerDamage(10);
        hit = true;
        spawnParticles(b.x, b.y, "#ff4444", 6);
      }
    } else {
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (rectsOverlap(e.x, e.y, e.w, e.h, b.x, b.y, b.r * 2, b.r * 2)) {
          e.hp -= 15;
          e.damageFlash = 1;
          hit = true;
          spawnParticles(b.x, b.y, "#ff4444", 8);
          if (e.hp <= 0) {
            e.dead = true;
            score += e.isElite ? 150 : 100;
            totalKills++;
            spawnDeathParticles(e.x, e.y);
            showFloatingMsg(
              e.isElite ? "+150 ELITE DOWN" : "+100 KILL",
              e.isElite ? "#ffd60a" : "#ff4444",
            );
            playSound("death");
          }
          break;
        }
      }
    }

    if (hit) bullets.splice(i, 1);
  }
}

function updatePickups(dt) {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    p.bob += dt * 5;

    if (
      rectsOverlap(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)
    ) {
      if (p.type === "health") {
        player.hp = Math.min(PLAYER_HP, player.hp + 35);
        showFloatingMsg("+35 HP", "#30d158");
        playSound("pickup-hp");
        flashScreen("heal");
      } else if (p.type === "gun") {
        gunLevel = 2;
        showFloatingMsg("GUN UPGRADED!", "#ffd60a");
        playSound("pickup-gun");
        flashScreen("gun-up");
      }
      pickups.splice(i, 1);
    }
  }
}

// Respawn player at start after death (lives > 0)
function respawnPlayer() {
  player.dead = false;
  player.hp = PLAYER_HP;

  // Find player start position from current level map
  const mapData = LEVEL_MAPS[currentLevel];
  for (let r = 0; r < ROWS; r++) {
    const row = mapData[r] || "";
    for (let c = 0; c < COLS; c++) {
      if (row[c] === "P") {
        player.x = c * TS + TS / 2;
        player.y = r * TS + TS / 2;
        break;
      }
    }
  }

  // Clear bullets, flash screen green
  bullets = [];
  flashScreen("heal");
  showFloatingMsg("CONTINUE - LIVES LEFT: " + lives, "#ffd60a");
}

function applyPlayerDamage(amount) {
  if (player.dead) return;
  player.hp -= amount;
  player.damageFlash = 1;
  flashScreen("damage");
  playSound("hit");
  if (player.hp <= 0) {
    player.hp = 0;
    player.dead = true;
    playSound("gameover");
    if (lives > 1) {
      lives--;
      setTimeout(respawnPlayer, 1000);
    } else {
      lives = 0;
      setTimeout(showGameOver, 900);
    }
  }
}

function checkDoor() {
  if (!exitDoor) return;
  if (!exitOpen && enemies.length === 0) {
    exitOpen = true;
    showFloatingMsg("EXIT UNLOCKED — REACH THE TOP!", "#00e5ff");
  }
  if (
    exitOpen &&
    rectsOverlap(
      player.x,
      player.y,
      player.w,
      player.h,
      exitDoor.x + TS / 2,
      exitDoor.y + TS / 2,
      TS,
      TS,
    )
  ) {
    gameState = "levelComplete";
    flashScreen("next");
    setTimeout(showLevelComplete, 400);
  }
}

function showLevelComplete() {
  document.getElementById("lc-kills").textContent = totalKills;
  document.getElementById("lc-score").textContent = score;
  document.getElementById("lc-hp").textContent = Math.ceil(player.hp);

  if (currentLevel + 1 >= LEVEL_MAPS.length) {
    showWin();
    return;
  }
  document.getElementById("level-complete-msg").textContent =
    `Proceeding to Sector ${currentLevel + 2}…`;
  playSound("levelup");
  showScreen("screen-level");
}

function showWin() {
  document.getElementById("win-score").textContent = score;
  document.getElementById("win-kills").textContent = totalKills;
  showScreen("screen-win");
  gameState = "win";
}

function showGameOver() {
  document.getElementById("over-score").textContent = score;
  document.getElementById("over-kills").textContent = totalKills;
  showScreen("screen-over");
  gameState = "over";
}

// ─── PARTICLES ────────────────────────────────────────
function spawnMuzzleFlash(x, y, color) {
  for (let i = 0; i < 5; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 80 + 30;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      r: Math.random() * 3 + 1,
      color,
      type: "spark",
    });
  }
}

function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 60 + 20;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      r: Math.random() * 2.5 + 1,
      color,
      type: "dust",
    });
  }
}

function spawnDeathParticles(x, y) {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 90 + 40;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      r: Math.random() * 4 + 2,
      color: i < 10 ? "#cc2222" : "#ff6060",
      type: "blood",
    });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.88;
    p.vy *= 0.88;
    p.life -= dt * 1.8;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// ─── DRAW ─────────────────────────────────────────────
function drawBackground() {
  ctx.fillStyle = "#050a12";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  ctx.save();
  ctx.translate(-camX, -camY);

  // Floor
  ctx.fillStyle = "#0a1422";
  ctx.fillRect(0, 0, mapPixelW, mapPixelH);

  // Floor grid
  ctx.strokeStyle = "rgba(0,229,255,0.04)";
  ctx.lineWidth = 0.5;
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * TS);
    ctx.lineTo(mapPixelW, r * TS);
    ctx.stroke();
  }
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * TS, 0);
    ctx.lineTo(c * TS, mapPixelH);
    ctx.stroke();
  }

  // Walls
  drawWalls();

  // Exit door
  drawExitDoor();

  // Particles (behind characters)
  drawParticles();

  // Pickups
  drawPickups();

  // Enemies
  for (const e of enemies) drawEnemy(e);

  // Player
  drawPlayer();

  // Bullets (on top)
  drawBullets();

  ctx.restore();

  // Minimap (always screen-space)
  drawMinimap();
}

function drawWalls() {
  const camLeft = camX - TS;
  const camTop = camY - TS;
  const camRight = camX + canvas.width + TS;
  const camBottom = camY + canvas.height + TS;

  for (const w of walls) {
    if (
      w.x + w.w < camLeft ||
      w.x > camRight ||
      w.y + w.h < camTop ||
      w.y > camBottom
    )
      continue;

    // Base wall
    ctx.fillStyle = "#1a2640";
    ctx.fillRect(w.x, w.y, w.w, w.h);

    // Top highlight
    ctx.fillStyle = "rgba(0,229,255,0.08)";
    ctx.fillRect(w.x, w.y, w.w, 3);

    // Side shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(w.x + w.w - 3, w.y, 3, w.h);
    ctx.fillRect(w.x, w.y + w.h - 3, w.w, 3);

    // Border
    ctx.strokeStyle = "rgba(0,229,255,0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1);
  }
}

function drawExitDoor() {
  if (!exitDoor) return;
  const ex = exitDoor.x,
    ey = exitDoor.y;
  const t = performance.now() / 1000;

  if (exitOpen) {
    // Animated open portal
    const pulse = 0.7 + 0.3 * Math.sin(t * 4);

    // Glow
    const grad = ctx.createRadialGradient(
      ex + TS / 2,
      ey + TS / 2,
      0,
      ex + TS / 2,
      ey + TS / 2,
      TS * 1.2,
    );
    grad.addColorStop(0, `rgba(0,229,255,${0.5 * pulse})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(ex - TS, ey - TS, TS * 3, TS * 3);

    // Door frame
    ctx.fillStyle = `rgba(0,229,255,${0.85 * pulse})`;
    ctx.fillRect(ex, ey, TS, TS);

    // Inner ring
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const cx = ex + TS / 2,
      cy = ey + TS / 2;
    ctx.arc(cx, cy, (TS / 3) * pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Arrow
    ctx.fillStyle = "#000";
    ctx.font = `bold ${TS * 0.6}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("↑", cx, cy);
  } else {
    // Locked door
    ctx.fillStyle = "#1a2640";
    ctx.fillRect(ex, ey, TS, TS);
    ctx.strokeStyle = "rgba(255,45,85,0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(ex + 1, ey + 1, TS - 2, TS - 2);
    ctx.fillStyle = "rgba(255,45,85,0.3)";
    ctx.font = `${TS * 0.55}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🔒", ex + TS / 2, ey + TS / 2);
  }
}

// ─── DRAW HUMAN SOLDIER (player) ─────────────────────
function drawPlayer() {
  if (player.dead) return;
  const { x, y, dirX, dirY, damageFlash, w, h } = player;

  ctx.save();
  ctx.translate(x, y);

  // Rotation
  const angle = Math.atan2(dirY, dirX) + Math.PI / 2;
  ctx.rotate(angle);

  const flash = damageFlash > 0;
  const colBase = flash ? "#ff6060" : "#2a5c8a"; // slightly brighter blue
  const colDark = flash ? "#a00000" : "#132b45"; // deeper shadow
  const colHigh = flash ? "#ffaaaa" : "#5eb8ff"; // more vibrant highlight

  // 1. Oval Shadow Overlay
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.ellipse(0, 10, 18, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Tactical Shoulders/Vest (Improved proportions)
  ctx.fillStyle = colDark;
  roundRect(ctx, -14, -10, 28, 20, 6);
  ctx.fill();

  // Vest Highlight
  ctx.fillStyle = colBase;
  roundRect(ctx, -11, -8, 22, 16, 4);
  ctx.fill();

  // 3. Detailed Backpack/Radio
  ctx.fillStyle = "#111";
  roundRect(ctx, -7, -2, 14, 13, 3);
  ctx.fill();
  ctx.fillStyle = "#444"; // Radio antenna
  ctx.fillRect(-7, 0, 2, 5);

  // 4. Arms (Forward focused)
  ctx.fillStyle = colBase;
  // Left arm stabilizing
  roundRect(ctx, -15, -7, 7, 16, 3);
  // Right arm triggering
  roundRect(ctx, 8, -7, 7, 16, 3);
  ctx.fill();

  // 5. Head (Dome with visor, better gradient)
  const headGrad = ctx.createRadialGradient(-3, -13, 2, 0, -12, 10);
  headGrad.addColorStop(0, colHigh);
  headGrad.addColorStop(0.6, colBase);
  headGrad.addColorStop(1, colDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -12, 11, 0, Math.PI * 2);
  ctx.fill();

  // Visor Detail
  ctx.fillStyle = "#00ffff";
  ctx.beginPath();
  ctx.ellipse(0, -14, 7, 3, 0, 0, Math.PI, true);
  ctx.fill();
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#00e5ff";
  ctx.fill();
  ctx.shadowBlur = 0;

  // 6. Upgraded Weapon visual
  ctx.save();
  ctx.translate(11, -5);
  ctx.fillStyle = "#1a1a1a";
  if (gunLevel > 1) {
    // Twin barrel elite gun
    ctx.fillRect(-1, -22, 5, 24);
    ctx.fillRect(4, -20, 5, 20);
    ctx.fillStyle = "#ffd60a";
    ctx.fillRect(2, 0, 6, 3);
    // Muzzle glow hint
    ctx.fillStyle = "rgba(255, 214, 10, 0.4)";
    ctx.fillRect(0, -24, 3, 2);
    ctx.fillRect(5, -22, 3, 2);
  } else {
    // Standard tactical rifle
    ctx.fillRect(0, -18, 5, 22);
    ctx.fillStyle = "#000";
    ctx.fillRect(1.5, -20, 2, 10); // Barrel extension
    ctx.fillStyle = "#444";
    ctx.fillRect(1, 0, 3, 4); // Magazine
  }
  ctx.restore();

  ctx.restore();
}

// ─── DRAW ENEMY SOLDIER ──────────────────────────────
function drawEnemy(e) {
  const {
    x,
    y,
    dirX,
    dirY,
    damageFlash,
    hp,
    maxHp,
    isElite,
    isAggressor,
    isFlanker,
    isGiant,
  } = e;

  ctx.save();
  ctx.translate(x, y);

  const angle = Math.atan2(dirY, dirX) + Math.PI / 2;
  ctx.rotate(angle);

  const flash = damageFlash > 0;
  const colMain = isGiant
    ? "#4e342e"
    : isAggressor
      ? "#d35400"
      : isFlanker
        ? "#8e44ad"
        : isElite
          ? "#f1c40f"
          : "#c0392b";
  const colDark = flash ? "#ff0000" : "#212121";
  const vizorCol = isGiant
    ? "#ff0000"
    : isAggressor
      ? "#ffdd00"
      : isFlanker
        ? "#ff00ff"
        : "#ff0000";

  // 1. Shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(0, 12, isGiant ? 24 : 15, isGiant ? 12 : 6, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isGiant) {
    // ── GIANT JUGGERNAUT FORM ───────────────────────────
    // Bulk Torso
    ctx.fillStyle = colMain;
    roundRect(ctx, -18, -16, 36, 30, 8);
    ctx.fill();
    // Heavy Shoulder Pads
    ctx.fillStyle = "#222";
    roundRect(ctx, -22, -14, 12, 14, 4);
    roundRect(ctx, 10, -14, 12, 14, 4);
    ctx.fill();
    // Heavy Backpack unit
    ctx.fillStyle = "#111";
    roundRect(ctx, -12, 0, 24, 18, 5);
    ctx.fill();
    // Giant Head/Helmet
    const headG = ctx.createRadialGradient(-4, -18, 2, 0, -16, 10);
    headG.addColorStop(0, "#888");
    headG.addColorStop(1, "#111");
    ctx.fillStyle = headG;
    ctx.beginPath();
    ctx.arc(0, -16, 12, 0, Math.PI * 2);
    ctx.fill();
    // Glowing Eye Strip
    ctx.fillStyle = vizorCol;
    ctx.shadowBlur = 10;
    ctx.shadowColor = vizorCol;
    ctx.fillRect(-6, -18, 12, 3);
    ctx.shadowBlur = 0;
    // Heavy Cannon
    ctx.fillStyle = "#000";
    ctx.fillRect(12, -25, 8, 30);
  } else {
    // ── STANDARD/ELITE HUMAN FORM ────────────────────────
    // Torso/Shoulders
    ctx.fillStyle = colMain;
    roundRect(ctx, -12, -10, 24, 18, 5);
    ctx.fill();
    // Head with shading
    const headG = ctx.createRadialGradient(-3, -12, 1, 0, -11, 7);
    headG.addColorStop(0, "#fff");
    headG.addColorStop(0.3, colMain);
    headG.addColorStop(1, colDark);
    ctx.fillStyle = headG;
    ctx.beginPath();
    ctx.arc(0, -11, 9, 0, Math.PI * 2);
    ctx.fill();
    // Vizor
    ctx.fillStyle = vizorCol;
    ctx.beginPath();
    ctx.ellipse(0, -12, 6, 2.5, 0, 0, Math.PI, true);
    ctx.fill();
    // Arms/Hands
    ctx.fillStyle = colDark;
    roundRect(ctx, -14, -6, 6, 12, 2);
    roundRect(ctx, 8, -6, 6, 12, 2);
    ctx.fill();
    // Weapon
    ctx.fillStyle = "#000";
    ctx.fillRect(8, -20, 4, 15);
  }

  ctx.restore();

  // HP Bar Positioning
  const barW = isGiant ? 44 : 30;
  const barH = 6;
  const hpR = hp / maxHp;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(x - barW / 2, y - (isGiant ? 40 : 32), barW, barH);
  ctx.fillStyle = hpR > 0.4 ? "#30d158" : "#ff3b30";
  ctx.fillRect(x - barW / 2, y - (isGiant ? 40 : 32), barW * hpR, barH);
}

function drawBullets() {
  for (const b of bullets) {
    const life = b.life / 2.2;
    ctx.save();

    // Trail
    ctx.beginPath();
    const trailLen = b.isEnemy ? 10 : 18;
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - b.vx * 0.025, b.y - b.vy * 0.025);
    ctx.strokeStyle = b.isEnemy
      ? `rgba(255,80,80,${0.5 * life})`
      : `rgba(0,229,255,${0.5 * life})`;
    ctx.lineWidth = b.r * 1.2;
    ctx.lineCap = "round";
    ctx.stroke();

    // Bullet
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.isEnemy
      ? `rgba(255,45,85,${life})`
      : `rgba(0,229,255,${life})`;
    ctx.fill();

    // Glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = b.isEnemy ? "#ff2d55" : "#00e5ff";
    ctx.fill();

    ctx.restore();
  }
}

function drawParticles() {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = p.type === "spark" ? 6 : 3;
    ctx.shadowColor = p.color;
    ctx.fill();
    ctx.restore();
  }
}

// ─── MINIMAP ─────────────────────────────────────────
function drawMinimap() {
  const mmW = 90,
    mmH = 90 * (ROWS / COLS);
  const mx = canvas.width - mmW - 10;
  const my = 10;
  const scaleX = mmW / mapPixelW;
  const scaleY = mmH / mapPixelH;

  ctx.save();
  ctx.globalAlpha = 0.75;

  // Background
  ctx.fillStyle = "rgba(4,10,22,0.9)";
  ctx.strokeStyle = "rgba(0,229,255,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(mx, my, mmW, mmH, 6);
  ctx.fill();
  ctx.stroke();

  // walls
  ctx.fillStyle = "#1a2840";
  for (const w of walls) {
    ctx.fillRect(
      mx + w.x * scaleX,
      my + w.y * scaleY,
      w.w * scaleX,
      w.h * scaleY,
    );
  }

  // Exit
  if (exitDoor) {
    ctx.fillStyle = exitOpen ? "#00e5ff" : "#ff2d55";
    ctx.fillRect(
      mx + exitDoor.x * scaleX - 2,
      my + exitDoor.y * scaleY - 2,
      5,
      5,
    );
  }

  // Enemies
  for (const e of enemies) {
    ctx.fillStyle = e.isElite ? "#ffd60a" : "#ff2d55";
    ctx.beginPath();
    ctx.arc(mx + e.x * scaleX, my + e.y * scaleY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player
  ctx.fillStyle = "#00e5ff";
  ctx.beginPath();
  ctx.arc(mx + player.x * scaleX, my + player.y * scaleY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Camera viewport rect
  ctx.strokeStyle = "rgba(0,229,255,0.4)";
  ctx.lineWidth = 0.8;
  ctx.strokeRect(
    mx + camX * scaleX,
    my + camY * scaleY,
    canvas.width * scaleX,
    canvas.height * scaleY,
  );

  ctx.restore();
}

function drawPickups() {
  const t = performance.now() / 1000;
  for (const p of pickups) {
    const bobOff = Math.sin(p.bob) * 4;
    ctx.save();
    ctx.translate(p.x, p.y + bobOff);

    // Glow
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
    const color =
      p.type === "health" ? "rgba(48,209,88,0.4)" : "rgba(255,214,10,0.4)";
    grad.addColorStop(0, color);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(-15, -15, 30, 30);

    // Icon
    if (p.type === "health") {
      ctx.fillStyle = "#30d158";
      ctx.fillRect(-8, -3, 16, 6);
      ctx.fillRect(-3, -8, 6, 16);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.strokeRect(-8, -3, 16, 6);
      ctx.strokeRect(-3, -8, 6, 16);
    } else {
      ctx.fillStyle = "#ffd60a";
      ctx.beginPath();
      ctx.moveTo(-2, -10);
      ctx.lineTo(6, -2);
      ctx.lineTo(0, 0);
      ctx.lineTo(4, 10);
      ctx.lineTo(-6, 2);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ─── HELPERS ─────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
