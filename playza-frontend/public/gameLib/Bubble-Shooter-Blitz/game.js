const TWO_PI = Math.PI * 2;

const COLORS = [
  { id: "pink", hex: "#ff5b86" },
  { id: "blue", hex: "#4fb3ff" },
  { id: "yellow", hex: "#ffd33d" },
  { id: "green", hex: "#53d98d" },
  { id: "purple", hex: "#8f6fff" },
  { id: "orange", hex: "#ff9c3d" },
];

const MODES = {
  DAILY: "daily",
  ENDLESS: "endless",
};

const STRUCTURES = ["full", "diamond", "hourglass", "split", "chevron", "rings", "funnel"];
const SHOT_SPEED = 920; // shared between fireShot and buildAimPreview — must stay in sync

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(input) {
  let seed = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    seed ^= input.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

function getDailyKey() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

class ToneBus {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  ensure() {
    if (!this.enabled) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
    }
    if (this.ctx?.state === "suspended") {
      this.ctx.resume();
    }
  }

  tone(freq, duration, type = "sine", volume = 0.03) {
    if (!this.enabled) return;
    this.ensure();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }
}

class BubbleShooterBlitz {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.scoreValue = document.getElementById("scoreValue");
    this.shotsValue = document.getElementById("shotsValue");
    this.timeValue = document.getElementById("timeValue");
    this.comboValue = document.getElementById("comboValue");
    this.bestValue = document.getElementById("bestValue");
    this.levelValue = document.getElementById("levelValue");
    this.modePill = document.getElementById("modePill");
    this.seedPill = document.getElementById("seedPill");
    this.messageLine = document.getElementById("messageLine");
    this.hintLine = document.getElementById("hintLine");
    this.nowPreview = document.getElementById("nowPreview");
    this.nextPreview = document.getElementById("nextPreview");
    this.swapButton = document.getElementById("swapButton");
    this.swapCount = document.getElementById("swapCount");
    this.bombButton = document.getElementById("bombButton");
    this.bombCount = document.getElementById("bombCount");
    this.aimButton = document.getElementById("aimButton");
    this.aimState = document.getElementById("aimState");
    this.soundButton = document.getElementById("soundButton");
    this.helpButton = document.getElementById("helpButton");

    this.overlay = document.getElementById("overlay");
    this.overlayKicker = document.getElementById("overlayKicker");
    this.overlayTitle = document.getElementById("overlayTitle");
    this.overlayText = document.getElementById("overlayText");
    this.startDaily = document.getElementById("startDaily");
    this.startEndless = document.getElementById("startEndless");
    this.closeOverlay = document.getElementById("closeOverlay");

    this.tone = new ToneBus();

    this.dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    this.bounds = { left: 0, top: 0, width: 900, height: 1200 };
    this.world = {
      width: 900,
      height: 1200,
      paddingTop: 38,
      paddingSide: 22,
      paddingBottom: 54,
    };

    this.grid = [];
    this.maxRows = 13;
    this.cols = 10;
    this.radius = 28;
    this.xStep = this.radius * 2;
    this.yStep = Math.round(this.radius * Math.sqrt(3));

    this.mode = MODES.DAILY;
    this.seedKey = getDailyKey();
    this.gameRng = mulberry32(hashStringToSeed(`bubble-blitz:${this.seedKey}`));
    this.fxRng = Math.random;

    this.playing = false;
    this.gameOver = false;
    this.realScore = 0;      // FIX #3: authoritative score used for logic & submission
    this.score = 0;          // animated display score only
    this.bestKey = "bubbleShooterBlitz.best.daily";
    this.bestScore = 0;
    this.combo = 1;
    this.comboDecay = 0;
    this.timer = 60;
    this.elapsed = 0;
    this.ceiling = 0;
    this.ceilingSpeed = 6;
    this.shotsTaken = 0;
    this.misses = 0;
    this.level = 1;
    this.structureName = STRUCTURES[0];

    this.swapsLeft = 2;
    this.bombs = 0;
    this.bombCharge = 0;
    this.aimAssist = true;

    this.queue = { now: null, next: null };
    this.activeShot = null;
    this.isAiming = false;
    this.aimPoint = { x: 0, y: 0 };
    this.launcher = { x: 0, y: 0 };
    this.previewPath = [];

    this.particles = [];
    this.popTexts = [];
    this.shake = 0;
    this.flash = 0;

    this.lastT = 0;
    this.trails = [];
    this.frenzyMode = 0;
    this.frenzyActive = false;
    this.beatTimer = 0;
    this.beatCount = 0;
    // FIX #4: Session lock — set true by PLAYZA_SESSION_CONFIG so R/restart is disabled
    this.sessionLocked = false;
    this.sessionId = null;
    // Rival banner state (PLAYZA_RIVAL_UPDATE)
    this.rivalUsername = null;
    this.rivalScore = 0;
    // Stats for end-screen
    this.maxCombo = 1;
    this.biggestDrop = 0;
    this.bubblesPopped = 0;
    // Held bubble slot (separate from swap)
    this.heldBubble = null;
    // ── New enhancement refs ──────────────────────────────────────────
    this.holdPreview       = document.getElementById('holdPreview');
    this.shotWarningBar    = document.getElementById('shot-warning-bar');
    this.shotWarningFill   = document.getElementById('shot-warning-fill');
    this.shotWarningLabel  = document.getElementById('shot-warning-label');
    this.milestoneBanner   = document.getElementById('milestone-banner');
    this.shareButton       = document.getElementById('shareButton');
    this._lastShareScore   = 0;
    // Score milestones: track which have been celebrated
    this.milestoneThresholds = [10000, 25000, 50000, 100000];
    this.reachedMilestones   = new Set();
    // Level theme hues (cycled per level)
    this.levelThemes = [
      { hue: 190, name: 'Oceanic' },
      { hue: 260, name: 'Cosmic' },
      { hue: 120, name: 'Forest' },
      { hue: 30,  name: 'Volcanic' },
      { hue: 320, name: 'Neon' },
      { hue: 45,  name: 'Golden' },
    ];
    this.resize();
    this.buildGrid();
    window.addEventListener("resize", () => {
      this.resize();
      this.buildGrid();
    });

    this.bindEvents();
    this.loadBest();
    
    if (window.self === window.top) {
      this.start(MODES.ENDLESS);
    } else {
      this.buildGrid();
      this.queue.now = this.rollBubble();
      this.queue.next = this.rollBubble();
      this.syncHud();
      this.openOverlay();
      this.overlayKicker.textContent = "Arena Setup";
      this.overlayTitle.textContent = "Waiting...";
      this.overlayText.textContent = "Connecting to session config.";
    }
    
    requestAnimationFrame((t) => this.tick(t));
  }

  bindEvents() {
    const toWorld = (evt) => {
      // Canvas is position:absolute inside #game-container — use its rect for correct mapping
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: (evt.clientX - rect.left) * (this.bounds.width  / rect.width),
        y: (evt.clientY - rect.top)  * (this.bounds.height / rect.height),
      };
    };

    const onDown = (evt) => {
      if (!this.playing || this.gameOver) return;
      if (evt.pointerType === "mouse" && evt.button !== 0) return;
      this.canvas.setPointerCapture?.(evt.pointerId);
      const p = toWorld(evt);
      this.isAiming = true;
      this.aimPoint = p;
      this.tone.tone(240, 0.05, "sine", 0.02);
    };

    const onMove = (evt) => {
      if (!this.isAiming) return;
      this.aimPoint = toWorld(evt);
    };

    const onUp = () => {
      if (!this.isAiming) return;
      const releasePoint = { ...this.aimPoint };
      this.isAiming = false;
      if (!this.activeShot) {
        this.fireShot(releasePoint);
      }
    };

    this.canvas.addEventListener("pointerdown", onDown);
    this.canvas.addEventListener("pointermove", onMove);
    this.canvas.addEventListener("pointerup", onUp);
    this.canvas.addEventListener("pointercancel", onUp);
    this.canvas.addEventListener("pointerleave", onUp);

    window.addEventListener("keydown", (evt) => {
      if (evt.key === "r" || evt.key === "R") {
        // FIX #5: Block restart in a locked paid session
        if (this.sessionLocked) return;
        if (this.playing) this.endRun(true);
        this.openOverlay();
      }
      if (!this.playing || this.gameOver) return;
      if (evt.key === "s" || evt.key === "S") this.swapQueue();
      if (evt.key === "a" || evt.key === "A") this.toggleAim();
      if (evt.key === "b" || evt.key === "B") this.useBomb();
      if (evt.key === "h" || evt.key === "H") this.holdBubble();
    });

    // Button wiring (all buttons are now real visible elements)
    this.swapButton?.addEventListener("click", () => this.swapQueue());
    this.bombButton?.addEventListener("click", () => this.useBomb());
    this.aimButton?.addEventListener("click",  () => this.toggleAim());
    this.soundButton?.addEventListener("click",() => this.toggleSound());
    this.helpButton?.addEventListener("click", () => this.openOverlay(true));
    // Hold slot — tap the hold area or press H
    document.getElementById('hold-area')?.addEventListener('click', () => this.holdBubble());
    // Share button on game-over overlay
    this.shareButton?.addEventListener('click', () => this.shareScore());

    // Mode buttons
    this.startDaily?.addEventListener("click",   () => this.start(MODES.DAILY));
    this.startEndless?.addEventListener("click", () => this.start(MODES.ENDLESS));
    this.closeOverlay?.addEventListener("click", () => this.hideOverlay());
  }

  resize() {
    // Measure the centred #game-container (max-width: 480px) not the full window.
    const container = document.getElementById("game-container") || document.body;
    const W = container.clientWidth;
    const H = container.clientHeight;

    this.dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    this.canvas.width  = Math.floor(W * this.dpr);
    this.canvas.height = Math.floor(H * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.bounds.width  = W;
    this.bounds.height = H;
    this.world.width   = W;
    this.world.height  = H;

    // Adjusted for the lowered HUD (10px top + 52px height + buffer)
    const hudTop = 68;
    const barH   = 76;

    // ── Reduced bubble count for better mobile fit ────────────────────────
    const cols = 8; 
    // In a staggered hex grid: r(2cols+1) <= W. 
    // Adding 0.5 to divisor for extra side margin padding.
    this.radius = clamp(Math.floor(W / (2 * cols + 1.5)), 14, 24);
    this.xStep  = this.radius * 2;
    this.yStep  = Math.round(this.radius * Math.sqrt(3));
    this.cols   = cols;

    const playableH = H - hudTop - barH;
    this.maxRows = clamp(Math.floor(playableH / this.yStep), 10, 14);

    // Centre the grid: left margin = (leftover / 2) + radius
    const leftover = W - cols * this.xStep - this.radius;
    this.world.paddingSide   = Math.round(leftover / 2) + this.radius;
    this.world.paddingTop    = hudTop;
    this.world.paddingBottom = barH;

    this.launcher.x = W / 2;
    this.launcher.y = H - barH + this.radius * 0.4;
  }

  openOverlay(isHelp = false) {
    this.overlay.classList.remove("hidden");
    const dailyKey = getDailyKey();
    if (isHelp) {
      this.overlayKicker.textContent = "How to play";
      this.overlayTitle.textContent = "Pop, Drop, Climb";
      this.overlayText.textContent =
        "Match 3+ to pop. Dropped clusters score huge. Endless mode climbs through fresh layouts with a new structure each level.";
    } else {
      this.overlayKicker.textContent = "Bubble Shooter Blitz";
      this.overlayTitle.textContent = "Ready?";
      this.overlayText.textContent =
        "Daily mode is a short sprint. Endless mode keeps going with larger, changing formations and more pressure.";
    }
    this.seedPill.textContent = `Seed ${dailyKey}`;
  }

  hideOverlay() {
    this.overlay.classList.add("hidden");
  }

  start(mode) {
    this.hideOverlay();
    this.mode = mode;
    this.seedKey = mode === MODES.DAILY ? getDailyKey() : `${Date.now()}`;
    this.bestKey = mode === MODES.DAILY ? "bubbleShooterBlitz.best.daily" : "bubbleShooterBlitz.best.endless";
    this.gameRng = mulberry32(hashStringToSeed(`bubble-blitz:${this.seedKey}`));
    this.modePill.textContent = mode === MODES.DAILY ? "Daily Seed" : "Endless";
    this.seedPill.textContent = mode === MODES.DAILY ? `Seed ${this.seedKey}` : "Procedural";

    this.sessionLocked = false;
    this.sessionId = null;
    this.playing = true;
    this.gameOver = false;
    this.realScore = 0;
    this.score = 0;
    this.targetScore = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.comboDecay = 0;
    this.elapsed = 0;
    this.timer = mode === MODES.DAILY ? 60 : 0;
    this.shotsLimit = mode === MODES.ENDLESS ? 150 : Infinity;
    this.ceiling = 0;
    this.ceilingSpeed = mode === MODES.DAILY ? 8 : 10;
    this.shotsTaken = 0;
    this.misses = 0;
    this.bubblesPopped = 0;
    this.biggestDrop = 0;
    this.level = 1;
    this.structureName = STRUCTURES[0];
    this.flash = 0;
    this.shake = 0;
    this.particles = [];
    this.popTexts = [];
    this.trails = [];
    this.frenzyActive = false;
    this.frenzyMode = 0;
    this.beatTimer = 0;
    this.beatCount = 0;
    document.body.classList.remove("frenzy-active");
    // Reset milestone & theme tracking
    this.reachedMilestones = new Set();
    this.updateLevelTheme(false);

    this.swapsLeft = mode === MODES.DAILY ? 2 : 3;
    this.bombs = 0;
    this.bombCharge = 0;
    this.heldBubble = null;  // FIX #24: held slot
    this.aimAssist = true;
    this.activeShot = null;
    this.isAiming = false;
    this.previewPath = [];
    this._bestReached = false;
    this._rowAddedForShot = null;

    this.buildGrid();
    this.queue.now = this.rollBubble();
    this.queue.next = this.rollBubble();
    this.loadBest();
    this.syncHud();
    this._bestReached = false;
    this.message("Blitz started. Keep the combo alive.");
  }

  loadBest() {
    const raw = window.localStorage.getItem(this.bestKey);
    const best = raw ? Number(raw) : 0;
    this.bestScore = Number.isFinite(best) ? best : 0;
    this.bestValue.textContent = `${this.bestScore}`;
  }

  saveBestIfNeeded() {
    if (this.realScore <= this.bestScore) return; // FIX #3: use realScore
    this.bestScore = this.realScore;
    window.localStorage.setItem(this.bestKey, `${this.bestScore}`);
    this.bestValue.textContent = `${this.bestScore}`;
  }

  message(text) {
    // Works with both the old #messageLine (inside .panel) and the new launcher-bar #messageLine
    const el = document.getElementById("messageLine");
    if (el) el.textContent = text;
  }

  rollBubble() {
    // Always consume EXACTLY 2 gameRng calls for deterministic seeding.
    const chance = this.gameRng();      // call 1: type determination
    const colorRoll = this.gameRng();   // call 2: color selection
    // Special bubble probabilities
    if (chance < 0.015) return { type: "colorbomb", color: null };  // Color Bomb: clears dominant color
    if (chance < 0.045) return { type: "rainbow", color: null };
    if (chance < 0.07 && this.mode === MODES.DAILY) return { type: "clock", color: null };
    if (chance < 0.095) return { type: "lightning", color: null };
    const palette = this.availableColors();
    const list = palette.length ? palette : COLORS.map((c) => c.id);
    const color = list[Math.floor(colorRoll * list.length)];
    return { type: "color", color };
  }

  availableColors() {
    const set = new Set();
    for (let row = 0; row < this.maxRows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const bubble = this.grid[row]?.[col];
        if (bubble?.color) set.add(bubble.color);
      }
    }
    return Array.from(set);
  }

  buildGrid() {
    this.grid = Array.from({ length: this.maxRows }, () => Array(this.cols).fill(null));
    const startRows = clamp(6 + Math.floor(this.gameRng() * 2) + Math.floor((this.level - 1) / 3), 6, 9);
    const palette = COLORS.slice(0, clamp(4 + Math.floor(this.gameRng() * 2) + Math.floor((this.level - 1) / 4), 4, 6)).map((c) => c.id);
    this.structureName = STRUCTURES[(this.level - 1) % STRUCTURES.length];

    for (let row = 0; row < startRows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        if (!this.isStructureCell(row, col, startRows, this.cols, this.structureName)) continue;
        if (this.gameRng() < 0.06 && row > 1 && this.structureName === "full") continue;
        const color = palette[Math.floor(this.gameRng() * palette.length)];
        this.grid[row][col] = { color, row, col };
      }
    }
  }

  isStructureCell(row, col, rows, cols, structure) {
    const center = (cols - 1) / 2;
    const dx = Math.abs(col - center);
    const rowProgress = rows <= 1 ? 0 : row / (rows - 1);

    switch (structure) {
      case "diamond":
        return dx <= Math.max(1, Math.round((cols * 0.42) - Math.abs(rowProgress - 0.5) * cols * 0.75));
      case "hourglass":
        return dx <= Math.max(1, Math.round((cols * 0.22) + Math.abs(rowProgress - 0.5) * cols * 0.42));
      case "split":
        return dx >= 1 || row >= Math.floor(rows * 0.55);
      case "chevron":
        return dx <= Math.max(1, Math.round(rowProgress * cols * 0.52)) || row < 2;
      case "rings":
        return row === 0 || row === rows - 1 || col === 0 || col === cols - 1 || (row > 1 && row < rows - 2 && col > 1 && col < cols - 2 && (row < 3 || row > rows - 4 || col < 3 || col > cols - 4));
      case "funnel":
        return dx <= Math.max(1, Math.round((1 - rowProgress * 0.78) * cols * 0.46));
      case "full":
      default:
        return true;
    }
  }

  pushDownRow() {
    for (let row = this.maxRows - 1; row >= 1; row -= 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const bubble = this.grid[row - 1][col];
        this.grid[row][col] = bubble ? { ...bubble, row, col } : null;
      }
    }
    for (let col = 0; col < this.cols; col += 1) {
      this.grid[0][col] = null;
    }
  }

  addNewTopRow() {
    this.pushDownRow();
    const palette = this.availableColors();
    const colors = palette.length ? palette : COLORS.slice(0, 5).map((c) => c.id);
    const density = this.mode === MODES.DAILY ? 0.92 : 0.94;
    for (let col = 0; col < this.cols; col += 1) {
      if (this.gameRng() > density) continue;
      const color = colors[Math.floor(this.gameRng() * colors.length)];
      let special = null;
      if (this.gameRng() < 0.05) special = "ice";
      this.grid[0][col] = { color, row: 0, col, special };
    }
    // Set ceiling to negative offset so bubbles start at old position and animate down
    this.ceiling = -this.yStep; 
    this.flash = Math.max(this.flash, 0.06);
    this.shake = Math.min(16, this.shake + 6);
    this.tone.tone(220, 0.08, "sawtooth", 0.02);
    this.message(this.mode === MODES.ENDLESS ? `Level ${this.level} pressure rising.` : "Ceiling pressure rising.");
  }

  worldPosForCell(row, col) {
    const offset = (row % 2) * this.radius;
    const x = this.world.paddingSide + col * this.xStep + offset;
    const y = this.world.paddingTop + row * this.yStep + this.ceiling;
    return { x, y };
  }

  cellForWorldPos(x, y) {
    const localY = y - this.world.paddingTop - this.ceiling;
    const row = clamp(Math.round(localY / this.yStep), 0, this.maxRows - 1);
    const offset = (row % 2) * this.radius;
    const localX = x - this.world.paddingSide - offset;
    const col = clamp(Math.round(localX / this.xStep), 0, this.cols - 1);
    return { row, col };
  }

  insideWalls(x) {
    const left = this.world.paddingSide - this.radius;
    const right = this.world.width - (this.world.paddingSide - this.radius);
    return { left, right };
  }

  neighbors(row, col) {
    const even = row % 2 === 0;
    const deltas = even
      ? [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]]
      : [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]];
    const result = [];
    for (const [dr, dc] of deltas) {
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= this.maxRows || c < 0 || c >= this.cols) continue;
      result.push({ row: r, col: c });
    }
    return result;
  }

  fireShot(targetPoint = null) {
    if (!this.playing || this.gameOver) return;
    if (this.activeShot) return;
    const shot = this.queue.now;
    if (!shot) return;

    const aim = this.getAimVector(targetPoint);
    this.activeShot = {
      x: this.launcher.x,
      y: this.launcher.y,
      vx: aim.x * SHOT_SPEED,   // FIX #15: use shared constant
      vy: aim.y * SHOT_SPEED,
      radius: this.radius * 0.92,
      bubble: shot,
      life: 6,
      bounces: 0,
      stretch: 1.4,
      stretchAngle: Math.atan2(aim.y, aim.x),
    };
    this.queue.now = this.queue.next;
    this.queue.next = this.rollBubble();
    this.shotsTaken += 1;
    this.tone.tone(520, 0.05, "triangle", 0.035);
    this.syncHud();
  }

  getAimVector(targetPoint = null) {
    const p = targetPoint || (this.isAiming ? this.aimPoint : { x: this.launcher.x, y: this.launcher.y - 240 });
    let dx = p.x - this.launcher.x;
    let dy = p.y - this.launcher.y;
    if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) dy = -1;
    if (dy > -40) dy = -40;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const minAngle = -Math.PI + 0.28;
    const maxAngle = -0.28;
    const angle = clamp(Math.atan2(dy, dx), minAngle, maxAngle);
    return { x: Math.cos(angle), y: Math.sin(angle) };
  }

  swapQueue() {
    if (!this.playing || this.gameOver) return;
    if (this.activeShot) return;
    if (this.swapsLeft <= 0) return;
    const tmp = this.queue.now;
    this.queue.now = this.queue.next;
    this.queue.next = tmp;
    this.swapsLeft -= 1;
    this.tone.tone(720, 0.06, "square", 0.03);
    this.message("Swap!");
    this.syncHud();
  }

  toggleAim() {
    this.aimAssist = !this.aimAssist;
    this.aimState.textContent = this.aimAssist ? "On" : "Off";
    this.tone.tone(this.aimAssist ? 620 : 260, 0.08, "triangle", 0.03);
  }

  toggleSound() {
    this.tone.enabled = !this.tone.enabled;
    this.soundButton.textContent = this.tone.enabled ? "🔊" : "🔈";
    if (this.tone.enabled) this.tone.tone(440, 0.08, "sine", 0.03);
  }

  useBomb() {
    if (!this.playing || this.gameOver) return;
    if (this.activeShot) return;
    if (this.bombs <= 0) return;
    this.bombs -= 1;
    // FIX #17: Save current bubble to held slot instead of discarding it
    if (this.queue.now && this.queue.now.type !== 'bomb') {
      this.heldBubble = this.queue.now;
    }
    this.queue.now = { type: "bomb", color: null };
    this.tone.tone(160, 0.12, "sawtooth", 0.04);
    this.message("Bomb loaded.");
    this.syncHud();
  }

  holdBubble() {
    if (!this.playing || this.gameOver || this.activeShot) return;
    if (!this.heldBubble && !this.queue.now) return;
    const current = this.queue.now;
    this.queue.now = this.heldBubble || this.rollBubble();
    this.heldBubble = current;
    this.tone.tone(660, 0.06, "triangle", 0.025);
    this.message("Bubble held. Tap HOLD to restore.");
    this.syncHud();
  }

  syncHud() {
    if (this.scoreValue) this.scoreValue.textContent = `${Math.max(0, Math.floor(this.score))}`;
    if (this.shotsValue) {
      this.shotsValue.textContent = this.mode === MODES.ENDLESS
        ? `${Math.max(0, this.shotsLimit - this.shotsTaken)}`
        : "\u221e";
    }
    if (this.comboValue) this.comboValue.textContent = `x${this.combo}`;
    if (this.levelValue) this.levelValue.textContent = `${this.level}`;
    if (this.timeValue) {
      this.timeValue.textContent = this.mode === MODES.DAILY
        ? `${Math.max(0, this.timer).toFixed(1)}`
        : "\u221e";
    }
    if (this.swapCount) this.swapCount.textContent = `${this.swapsLeft}`;
    if (this.bombCount) this.bombCount.textContent = `${this.bombs}`;
    if (this.bombButton) this.bombButton.disabled = this.bombs <= 0;
    if (this.aimState)  this.aimState.textContent = this.aimAssist ? "On" : "Off";
    if (this.playing) this.flashCombo();
    // Update hold-slot preview
    if (this.holdPreview) {
      if (this.heldBubble) {
        const heldHex = this.getHexForBubble(this.heldBubble);
        this.holdPreview.style.background = this.previewGradient(heldHex);
        this.holdPreview.classList.add('has-bubble');
      } else {
        this.holdPreview.style.background = '';
        this.holdPreview.classList.remove('has-bubble');
      }
    }
    // Update shot-warning bar (fills every 8 shots)
    if (this.shotWarningFill && this.shotWarningBar) {
      const shotProgress = this.shotsTaken % 8;
      const pct = (shotProgress / 8) * 100;
      this.shotWarningFill.style.width = `${pct}%`;
      if (shotProgress >= 6 && this.playing) {
        this.shotWarningBar.classList.add('warning-active');
        if (this.shotWarningLabel) this.shotWarningLabel.textContent = `NEW ROW IN ${8 - shotProgress}`;
      } else {
        this.shotWarningBar.classList.remove('warning-active');
      }
    }

    const getHex = (b) => this.getHexForBubble(b);

    const nowHex = getHex(this.queue.now);
    const nextHex = getHex(this.queue.next);
    this.nowPreview.style.background = this.previewGradient(nowHex);
    this.nextPreview.style.background = this.previewGradient(nextHex);
  }

  previewGradient(hex) {
    if (hex === "rainbow")   return `conic-gradient(from 0deg, red, orange, yellow, green, blue, purple, red)`;
    if (hex === "colorbomb") return `conic-gradient(from 0deg, #ff5b86, #ffd33d, #53d98d, #4fb3ff, #8f6fff, #ff9c3d, #ff5b86)`;
    return `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.7), rgba(255,255,255,0.08) 40%, rgba(0,0,0,0)), linear-gradient(135deg, ${hex}, ${hex})`;
  }

  tick(timestamp) {
    const dt = Math.min(0.033, (timestamp - this.lastT) / 1000 || 0.016);
    this.lastT = timestamp;
    this.update(dt);
    this.draw();
    requestAnimationFrame((t) => this.tick(t));
  }

  update(dt) {
    if (!this.playing || this.gameOver) {
      this.updateParticles(dt);
      return;
    }

    this.elapsed += dt;
    if (this.mode === MODES.DAILY) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.endRun(false);
        return;
      }
    }

    // FIX #16: endless shot limit check
    if (this.mode === MODES.ENDLESS && this.shotsTaken >= this.shotsLimit) {
      this.endRun(false, `${this.shotsLimit} shots complete.`);
      return;
    }

    // ── Ceiling / pressure ──────────────────────────────────────────────────
    // Standard bubble shooter: the grid does NOT drift down on its own.
    // Pressure is applied by pushing a new row of bubbles in from the top
    // every MISS_PER_ROW consecutive misses (penalty for inaccuracy).
    // this.ceiling is used only for the brief push animation (see addNewTopRow).
    if (this.ceiling < 0) {
      // Smoothly animate ceiling back to 0 (push down effect)
      this.ceiling = Math.min(0, this.ceiling + dt * 140); 
    }

    // Shot-count-based row push (every 8 shots a new row, regardless of miss/hit)
    // This ensures the board keeps filling and the game stays challenging.
    if (this.shotsTaken > 0 && this.shotsTaken % 8 === 0 && !this.activeShot) {
      if (!this._rowAddedForShot || this._rowAddedForShot !== this.shotsTaken) {
        this._rowAddedForShot = this.shotsTaken;
        this.addNewTopRow();
        this.message("New row! Stay sharp.");
      }
    }

    if (this.comboDecay > 0) {
      this.comboDecay -= dt;
    } else if (this.combo > 1) {
      this.combo = Math.max(1, this.combo - 1);
      this.comboDecay = 0.35;
      this.syncHud();
    }

    if (this.score < this.targetScore) {
      const diff = this.targetScore - this.score;
      this.score += Math.max(1, Math.ceil(diff * 10 * dt));
      this.scoreValue.textContent = `${Math.floor(this.score)}`;
      // FIX #3: compare realScore for best detection
      if (this.realScore > this.bestScore && !this._bestReached) {
        this._bestReached = true;
        this.popText("NEW BEST!", { x: this.world.width / 2, y: 150 }, "#ffdd7a");
        this.tone.tone(880, 0.1, "triangle", 0.04);
      }
    } else {
      // Keep display in sync exactly
      this.score = this.realScore;
    }

    if (this.shake > 0.05) {
      this.shake *= Math.max(0, 1 - dt * 7.5);
    } else {
      this.shake = 0;
    }

    if (this.flash > 0) {
      this.flash = Math.max(0, this.flash - dt * 2.6);
    }

    if (this.combo >= 8 && !this.frenzyActive) {
      this.frenzyActive = true;
      this.message("FRENZY MODE!");
      this.tone.tone(880, 0.15, "sawtooth", 0.04);
    } else if (this.combo < 5 && this.frenzyActive) {
      this.frenzyActive = false;
    }

    if (this.frenzyActive) {
      this.frenzyMode = Math.min(1, this.frenzyMode + dt * 2);
      document.body.classList.add("frenzy-active");
    } else {
      this.frenzyMode = Math.max(0, this.frenzyMode - dt * 1);
      document.body.classList.remove("frenzy-active");
    }

    this.updateShot(dt);
    this.updateTrails(dt);
    this.updateParticles(dt);
    this.tickMusic(dt);

    if (this.isGridEmpty()) {
      if (this.mode === MODES.ENDLESS) {
        this.level += 1;
        this.updateLevelTheme(true); // shift background colour + announce new level
      }
      if (this.mode === MODES.DAILY) {
        this.timer = Math.min(90, this.timer + 3.5);
      }
      this.buildGrid();
      this.message(this.mode === MODES.ENDLESS ? `Level ${this.level}! ${this.structureName} structure.` : "Clean sweep! Fresh wave incoming.");
      this.queue.now = this.rollBubble();
      this.queue.next = this.rollBubble();
      this.flash = Math.max(this.flash, 0.14);
      this.tone.tone(960, 0.08, "triangle", 0.03);
      this.syncHud();
    }

    if (this.isAnyBubblePastDangerLine()) {
      this.endRun(false, "The ceiling caught you.");
    }

    // ── Score milestone celebrations ────────────────────────────────────
    for (const m of this.milestoneThresholds) {
      if (this.realScore >= m && !this.reachedMilestones.has(m)) {
        this.reachedMilestones.add(m);
        const labels = { 10000: '\ud83d\udd25 10K PTS', 25000: '\u26a1 25K — ON FIRE!', 50000: '\ud83d\udca5 50K — UNSTOPPABLE!', 100000: '\ud83c\udfc6 100K — LEGENDARY!' };
        this.showMilestone(labels[m] || `${m.toLocaleString()} PTS`);
        this.tone.tone(1100, 0.1, 'triangle', 0.04);
        setTimeout(() => this.tone.tone(1320, 0.08, 'triangle', 0.03), 100);
      }
    }

    // ── Danger HUD ring ────────────────────────────────────────────
    const gc = document.getElementById('game-container');
    if (gc) {
      if (this.isAnyBubblePastDangerLine ? this.isDangerZone() : false) {
        gc.classList.add('danger-active');
      } else {
        gc.classList.remove('danger-active');
      }
    }

    // ── Internal Integrity Check: Anti-cheat ──
    // Detect illegal score jumps via console manipulation.
    // authorizes increment only through authorized popCells/dropFloating calls.
    if (!this._verifiedScore) this._verifiedScore = 0;
    if (this.realScore > this._verifiedScore + 10000) { 
      // A jump of >10k in a single frame is impossible in normal play
      this.endRun(true, "Security: Invalid score jump detected.");
      return;
    }
    this._verifiedScore = this.realScore;

    // ── Internal Integrity Check: Shot Count ──
    // Detect illegal shot manipulation via console.
    if (!this._verifiedShots) this._verifiedShots = 0;
    if (this.shotsTaken < this._verifiedShots) {
      // Shots should only increase. If they decreased, someone reset them to bypass the limit.
      this.endRun(true, "Security: Invalid shot count detected.");
      return;
    }
    this._verifiedShots = this.shotsTaken;

    if (this.timeValue) {
      this.timeValue.textContent = this.mode === MODES.DAILY
        ? `${Math.max(0, this.timer).toFixed(1)}`
        : "∞";
    }
  }

  isGridEmpty() {
    for (let row = 0; row < this.maxRows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        if (this.grid[row][col]) return false;
      }
    }
    return true;
  }

  isAnyBubblePastDangerLine() {
    const dangerY = this.launcher.y - this.radius * 2.25;
    for (let row = 0; row < this.maxRows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const bubble = this.grid[row][col];
        if (!bubble) continue;
        const p = this.worldPosForCell(row, col);
        if (p.y + this.radius >= dangerY) return true;
      }
    }
    return false;
  }

  updateShot(dt) {
    const shot = this.activeShot;
    if (!shot) return;

    let remaining = dt;
    while (remaining > 0 && this.activeShot) {
      const step = Math.min(1 / 120, remaining);
      remaining -= step;
      shot.x += shot.vx * step;
      shot.y += shot.vy * step;
      shot.life -= step;

      const walls = this.insideWalls(shot.x);
      if (shot.x <= walls.left + shot.radius) {
        shot.x = walls.left + shot.radius;
        shot.vx *= -1;
        shot.bounces += 1;
        shot.stretch = 1.35;
        shot.stretchAngle = Math.atan2(shot.vy, shot.vx);
        this.tone.tone(280, 0.04, "sine", 0.018);
      } else if (shot.x >= walls.right - shot.radius) {
        shot.x = walls.right - shot.radius;
        shot.vx *= -1;
        shot.bounces += 1;
        shot.stretch = 1.35;
        shot.stretchAngle = Math.atan2(shot.vy, shot.vx);
        this.tone.tone(280, 0.04, "sine", 0.018);
      }

      const topY = this.world.paddingTop + this.ceiling + this.radius * 0.75;
      if (shot.y <= topY) {
        const cell = this.cellForWorldPos(shot.x, topY);
        this.snapShotToCell(cell);
        return;
      }

      const candidates = this.collisionCandidates(shot.x, shot.y);
      for (const cell of candidates) {
        const other = this.grid[cell.row]?.[cell.col];
        if (!other) continue;
        const p = this.worldPosForCell(cell.row, cell.col);
        if (distance({ x: shot.x, y: shot.y }, p) <= this.radius * 2.0) { // FIX #7: was 1.85
          const snap = this.findBestSnapCell(shot.x, shot.y, cell.row, cell.col);
          this.snapShotToCell(snap);
          return;
        }
      }

      if (shot.life <= 0) {
        const cell = this.cellForWorldPos(shot.x, shot.y);
        this.snapShotToCell(cell);
      }

      // Trail spawning
      if (this.fxRng() < 0.4) {
        const hex = COLORS.find(c => c.id === shot.bubble.color)?.hex || "#fff";
        this.trails.push({
          x: shot.x,
          y: shot.y,
          life: 0.4,
          size: this.radius * 0.7,
          hex
        });
      }
    }
  }

  updateTrails(dt) {
    this.trails.forEach(t => t.life -= dt);
    this.trails = this.trails.filter(t => t.life > 0);
  }

  collisionCandidates(x, y) {
    const base = this.cellForWorldPos(x, y);
    const cells = [];
    for (let dr = -2; dr <= 2; dr += 1) {
      for (let dc = -2; dc <= 2; dc += 1) {
        const r = base.row + dr;
        const c = base.col + dc;
        if (r < 0 || r >= this.maxRows || c < 0 || c >= this.cols) continue;
        cells.push({ row: r, col: c });
      }
    }
    return cells;
  }

  findBestSnapCell(x, y, nearRow, nearCol) {
    const options = [{ row: nearRow, col: nearCol }, ...this.neighbors(nearRow, nearCol)];
    let best = options[0];
    let bestDist = Infinity;
    for (const cell of options) {
      if (this.grid[cell.row][cell.col]) continue;
      const p = this.worldPosForCell(cell.row, cell.col);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = cell;
      }
    }
    return best;
  }

  snapShotToCell(cell) {
    const shot = this.activeShot;
    if (!shot) return;
    this.activeShot = null;

    const target = this.findNearestEmptyCell(cell.row, cell.col);
    const bubble = { color: shot.bubble.color, row: target.row, col: target.col, special: shot.bubble.type === "color" ? null : shot.bubble.type };
    this.grid[target.row][target.col] = bubble;

    if (shot.bounces >= 2) {
      this.popText("LONG SHOT!", this.worldPosForCell(target.row, target.col), "#ffd33d");
      this.targetScore += 500;
    }

    this.vibrate(20);
    this.tone.tone(380, 0.05, "triangle", 0.025);
    this.resolveAfterPlacement(target.row, target.col);
    this.syncHud();
  }

  vibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  findNearestEmptyCell(row, col) {
    if (!this.grid[row][col]) return { row, col };
    const queue = [{ row, col }];
    const visited = new Set([`${row},${col}`]);
    while (queue.length) {
      const cur = queue.shift();
      for (const n of this.neighbors(cur.row, cur.col)) {
        const key = `${n.row},${n.col}`;
        if (visited.has(key)) continue;
        visited.add(key);
        if (!this.grid[n.row][n.col]) return n;
        queue.push(n);
      }
    }
    return { row, col };
  }

  resolveAfterPlacement(row, col) {
    const placed = this.grid[row][col];
    if (!placed) return;

    if (placed.special === "bomb") {
      this.explodeBomb(row, col, 1);
      this.afterClearSuccess(6, { x: this.worldPosForCell(row, col).x, y: this.worldPosForCell(row, col).y });
      return;
    }

    if (placed.special === "lightning") {
      this.clearRow(row);
      this.afterClearSuccess(this.cols, this.worldPosForCell(row, col));
      return;
    }

    if (placed.special === "clock") {
      this.timer = Math.min(90, this.timer + 10);
      this.popCells([{ row, col }], "match");
      this.popText("+10s", this.worldPosForCell(row, col), "#53d98d");
      this.tone.tone(880, 0.1, "sine", 0.05);
      return;
    }

    // Color Bomb: finds dominant color on grid and clears all of them
    if (placed.special === "colorbomb") {
      const colorCounts = {};
      for (let r = 0; r < this.maxRows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const b = this.grid[r][c];
          if (b?.color) colorCounts[b.color] = (colorCounts[b.color] || 0) + 1;
        }
      }
      const dominantColor = Object.keys(colorCounts).reduce(
        (a, b) => (colorCounts[a] >= colorCounts[b] ? a : b), null
      );
      if (dominantColor) {
        const toRemove = [];
        for (let r = 0; r < this.maxRows; r++)
          for (let c = 0; c < this.cols; c++)
            if (this.grid[r][c]?.color === dominantColor) toRemove.push({ row: r, col: c });
        this.popCells(toRemove, 'bomb');
        this.dropFloating();
        this.popText(`\ud83d\udca5 ${toRemove.length}x COLOR BOMB`, { x: this.world.width / 2, y: this.world.height / 2 - 60 }, '#ff5b86');
        this.flash = 0.28; this.shake = 20;
        this.tone.tone(880, 0.15, 'sawtooth', 0.05);
        this.afterClearSuccess(toRemove.length + 4, this.worldPosForCell(row, col));
      }
      return;
    }

    // FIX #11: checkIceBreak runs first so ice pops are included in combo total
    this.checkIceBreak(row, col);

    let colorToMatch = placed.color;
    if (placed.special === "rainbow") {
      // FIX #10: match the largest adjacent color group, not just first neighbor
      const nbs = this.neighbors(row, col).map(n => this.grid[n.row]?.[n.col]).filter(b => b && b.color);
      if (nbs.length) {
        const freq = {};
        nbs.forEach(b => { freq[b.color] = (freq[b.color] || 0) + 1; });
        colorToMatch = Object.keys(freq).reduce((a, b) => freq[a] >= freq[b] ? a : b);
      } else {
        colorToMatch = COLORS[0].id;
      }
    }

    const match = this.collectCluster(row, col, colorToMatch);
    if (match.length >= 3 || placed.special === "rainbow") {
      this.popCells(match, "match");
      const dropped = this.dropFloating();
      const total = match.length + dropped;
      this.afterClearSuccess(total, this.worldPosForCell(row, col));
    } else {
      this.afterMiss();
    }
  }

  clearRow(row) {
    const affected = [];
    for (let c = 0; c < this.cols; c++) {
      if (this.grid[row][c]) affected.push({ row, col: c });
    }
    this.popCells(affected, "lightning");
    this.dropFloating();
    this.flash = 0.15;
    this.shake = 15;
    this.tone.tone(1100, 0.1, "sawtooth", 0.04);
  }

  checkIceBreak(row, col) {
    const ns = this.neighbors(row, col);
    ns.forEach(n => {
      const b = this.grid[n.row]?.[n.col];
      if (b && b.special === "ice") {
        this.popCells([{ row: n.row, col: n.col }], "match");
      }
    });
  }

  explodeBomb(row, col, radius) {
    const affected = [];
    for (let r = row - radius; r <= row + radius; r += 1) {
      for (let c = col - radius; c <= col + radius; c += 1) {
        if (r < 0 || r >= this.maxRows || c < 0 || c >= this.cols) continue;
        if (!this.grid[r][c]) continue;
        affected.push({ row: r, col: c });
      }
    }
    this.popCells(affected, "bomb");
    this.dropFloating();
    this.flash = Math.max(this.flash, 0.18);
    this.shake = Math.min(18, this.shake + 12);
    this.tone.tone(150, 0.12, "sawtooth", 0.05);
  }

  collectCluster(row, col, color) {
    const start = this.grid[row][col];
    if (!start || start.color !== color) return [];
    const visited = new Set();
    const stack = [{ row, col }];
    const result = [];
    while (stack.length) {
      const cell = stack.pop();
      const key = `${cell.row},${cell.col}`;
      if (visited.has(key)) continue;
      visited.add(key);
      const b = this.grid[cell.row][cell.col];
      // FIX #9: Ice bubbles are opaque obstacles — block cluster traversal
      if (!b || b.color !== color || b.special === "bomb" || b.special === "ice") continue;
      result.push(cell);
      this.neighbors(cell.row, cell.col).forEach((n) => stack.push(n));
    }
    return result;
  }

  popCells(cells, reason) {
    const base = reason === "bomb" || reason === "lightning" ? 95 : 70;
    const chainBoost = 1 + (this.combo - 1) * 0.32;
    const pointsPer = Math.round(base * chainBoost);
    cells.forEach((cell) => {
      const bubble = this.grid[cell.row][cell.col];
      if (!bubble) return;
      const p = this.worldPosForCell(cell.row, cell.col);
      this.spawnPop(p.x, p.y, bubble.color || "rainbow");
      this.grid[cell.row][cell.col] = null;
      this.realScore += pointsPer;  // FIX #3: always add to realScore
      this.targetScore = this.realScore;
      this.bubblesPopped += 1;
      this.bombCharge += 1;
    });

    if (cells.length >= 7) {
      this.popText(`${cells.length} POP!`, { x: this.worldPosForCell(cells[Math.floor(cells.length / 2)].row, cells[Math.floor(cells.length / 2)].col).x, y: this.worldPosForCell(cells[Math.floor(cells.length / 2)].row, cells[Math.floor(cells.length / 2)].col).y }, "#fff0a8");
    }

    if (cells.length) {
      this.flash = Math.max(this.flash, 0.08);
      this.shake = Math.min(20, this.shake + Math.min(12, 3 + cells.length));
      this.tone.tone(420 + cells.length * 14, 0.08, "triangle", 0.03);
      this.tone.tone(140, 0.09, "sawtooth", 0.015);
    }
  }

  dropFloating() {
    const connected = new Set();
    const queue = [];
    for (let col = 0; col < this.cols; col += 1) {
      if (this.grid[0][col]) {
        queue.push({ row: 0, col });
      }
    }

    while (queue.length) {
      const cell = queue.shift();
      const key = `${cell.row},${cell.col}`;
      if (connected.has(key)) continue;
      connected.add(key);
      this.neighbors(cell.row, cell.col).forEach((n) => {
        if (this.grid[n.row][n.col]) queue.push(n);
      });
    }

    let dropped = 0;
    for (let row = 0; row < this.maxRows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        if (!this.grid[row][col]) continue;
        if (connected.has(`${row},${col}`)) continue;
        const p = this.worldPosForCell(row, col);
        this.spawnDrop(p.x, p.y, this.grid[row][col].color || "rainbow");
        this.grid[row][col] = null;
        const dropPts = Math.round(120 * (1 + (this.combo - 1) * 0.35));
        this.realScore += dropPts;  // FIX #3
        this.targetScore = this.realScore;
        dropped += 1;
        this.bombCharge += 2;
      }
    }

    if (dropped > 0) this.biggestDrop = Math.max(this.biggestDrop, dropped);

    if (dropped >= 4) {
      const isMassive = dropped >= 6;
      this.popText(isMassive ? "MASSIVE DROP!" : `DROP x${dropped}`, { x: this.world.width / 2, y: this.world.paddingTop + 60 + this.ceiling }, isMassive ? "#ff5b86" : "#79f5ff");
      if (isMassive) {
        this.shake = 15;
        this.flash = 0.1;
        this.targetScore += 1000;
      }
      this.tone.tone(740, 0.07, "square", 0.03);
    }

    return dropped;
  }

  afterClearSuccess(totalCleared, anchor) {
    this.combo = clamp(this.combo + 1, 1, 12);
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.comboDecay = 1.1;
    if (this.mode === MODES.DAILY) {
      const bonus = totalCleared >= 8 ? 1.2 : totalCleared >= 5 ? 0.6 : 0.2;
      this.timer = Math.min(90, this.timer + bonus);
    }
    // Hot-streak audio escalation at key combo milestones
    const streakStings = { 3: [660,880], 5: [660,880,1100], 8: [440,660,880,1100], 12: [440,660,880,1100,1320] };
    if (streakStings[this.combo]) {
      streakStings[this.combo].forEach((freq, i) =>
        setTimeout(() => this.tone.tone(freq, 0.055, 'triangle', 0.022), i * 55)
      );
    }

    if (this.bombCharge >= 26) {
      this.bombCharge = 0;
      this.bombs = clamp(this.bombs + 1, 0, 3);
      this.message("Bomb charged!");
      this.popText("BOMB +1", { x: anchor.x, y: anchor.y }, "#ffd33d");
      this.tone.tone(980, 0.06, "triangle", 0.03);
    } else if (totalCleared >= 7) {
      this.message("Storm chain! Keep going.");
    } else {
      this.message("Nice. Chain it.");
    }
    this.syncHud();
  }

  afterMiss() {
    // FIX #19: Reduce combo by 2 on miss, not full reset — less punishing
    this.combo = Math.max(1, this.combo - 2);
    this.comboDecay = 0;
    this.misses += 1;
    this.message("No pop. Re-aim and recover.");
    this.tone.tone(180, 0.08, "sine", 0.02);
    if (this.mode === MODES.DAILY) {
      this.timer = Math.max(0, this.timer - 0.35);
    }
  }

  endRun(force, reason = null) {
    if (!this.playing) return;
    this.playing = false;
    this.gameOver = true;
    this.activeShot = null;
    document.body.classList.remove('frenzy-active');
    document.getElementById('game-container')?.classList.remove('danger-active');
    if (this.shotWarningBar) this.shotWarningBar.classList.remove('warning-active');
    this.saveBestIfNeeded();

    const finalScore = this.realScore;
    const accuracy = this.shotsTaken > 0
      ? Math.round(((this.shotsTaken - this.misses) / this.shotsTaken) * 100)
      : 100;
    const title = force ? 'Run Ended' : (reason ? 'Game Over' : 'Time!');
    const isNewBest = finalScore >= this.bestScore && finalScore > 0;

    // Build animated stat card
    this._lastShareScore = finalScore;
    const card = document.getElementById('stat-card');
    if (card) {
      const rows = [
        { label: 'Final Score', value: finalScore.toLocaleString(), cls: 'highlight-row' },
        { label: 'Best Score',  value: this.bestScore.toLocaleString() + (isNewBest ? ' \ud83c\udfc6 NEW!' : ''), cls: isNewBest ? 'milestone-row' : '' },
        { label: 'Shots Taken', value: this.shotsTaken },
        { label: 'Accuracy',    value: `${accuracy}%` },
        { label: 'Max Combo',   value: `x${this.maxCombo}` },
        { label: 'Biggest Drop',value: `${this.biggestDrop} bubbles` },
        { label: 'Bubbles Popped', value: this.bubblesPopped },
        { label: 'Level Reached',  value: this.level },
      ];
      card.innerHTML = rows.map((r, i) =>
        `<div class="stat-row ${r.cls || ''}" style="animation-delay:${i * 60}ms">
          <span class="stat-label">${r.label}</span>
          <span class="stat-value">${r.value}</span>
        </div>`
      ).join('');
    }

    this.overlayKicker.textContent = 'Bubble Shooter Blitz';
    this.overlayTitle.textContent  = title;
    this.overlay.classList.remove('hidden');
    this.startDaily.textContent    = 'Play Again';
    this.tone.tone(140, 0.18, 'sawtooth', 0.035);
    this.tone.tone(680, 0.1,  'triangle', 0.02);

    // FIX #6: Use PLAYZA_SCORE_SUBMISSION (matching 2048 pattern)
    // Target same origin, not '*'. Include full metadata for server-side plausibility check.
    if (window.parent && window.parent !== window) {
      const targetOrigin = window.location.origin;
      setTimeout(() => {
        window.parent.postMessage({
          type: 'PLAYZA_SCORE_SUBMISSION',
          payload: {
            score: finalScore,
            metadata: {
              category: 'Bubble Shooter',
              mode: this.mode,
              shotsUsed: this.shotsTaken,
              shotsLimit: this.shotsLimit,
              misses: this.misses,
              accuracy,
              maxCombo: this.maxCombo,
              biggestDrop: this.biggestDrop,
              bubblesPopped: this.bubblesPopped,
              levelReached: this.level
            }
          }
        }, targetOrigin);
      }, 2500);
    }
  }

  spawnPop(x, y, colorId) {
    const hex = COLORS.find((c) => c.id === colorId)?.hex || "#ffffff";
    const count = this.frenzyActive ? 22 : 14;
    for (let i = 0; i < count; i += 1) {
      const a = this.fxRng() * TWO_PI;
      const speed = (120 + this.fxRng() * 260) * (this.frenzyActive ? 1.4 : 1);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 80,
        life: 0.55 + this.fxRng() * 0.25,
        size: 2 + this.fxRng() * 6,
        hex,
        type: this.fxRng() < 0.2 ? "star" : "circle"
      });
    }
  }

  spawnDrop(x, y, colorId) {
    const hex = COLORS.find((c) => c.id === colorId)?.hex || "#ffffff";
    for (let i = 0; i < 18; i += 1) {
      const a = this.fxRng() * TWO_PI;
      const speed = 180 + this.fxRng() * 330;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed + 120,
        life: 0.7 + this.fxRng() * 0.3,
        size: 2 + this.fxRng() * 7,
        hex,
      });
    }
  }

  popText(text, pos, hex) {
    this.popTexts.push({
      text,
      x: pos.x,
      y: pos.y,
      life: 1.05,
      hex,
    });
  }

  updateParticles(dt) {
    this.particles = this.particles.filter((p) => p.life > 0);
    this.particles.forEach((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 520 * dt;
      p.vx *= Math.max(0, 1 - dt * 2.2);
    });

    this.popTexts = this.popTexts.filter((p) => p.life > 0);
    this.popTexts.forEach((p) => {
      p.life -= dt;
      p.y -= 46 * dt;
    });
  }

  buildAimPreview() {
    if (!this.aimAssist || !this.playing || this.gameOver || this.activeShot) {
      this.previewPath = [];
      return;
    }

    const dir = this.getAimVector();
    const walls = this.insideWalls(this.launcher.x);
    const pos = { x: this.launcher.x, y: this.launcher.y };
    const vel = { x: dir.x * SHOT_SPEED, y: dir.y * SHOT_SPEED }; // FIX #15: match actual shot speed
    const points = [];

    for (let step = 0; step < 260; step += 1) {
      pos.x += vel.x * 0.012;
      pos.y += vel.y * 0.012;
      if (pos.x <= walls.left + this.radius) {
        pos.x = walls.left + this.radius;
        vel.x *= -1;
      }
      if (pos.x >= walls.right - this.radius) {
        pos.x = walls.right - this.radius;
        vel.x *= -1;
      }
      points.push({ x: pos.x, y: pos.y });
      if (pos.y <= this.world.paddingTop + this.ceiling + this.radius) break;
      const candidates = this.collisionCandidates(pos.x, pos.y);
      if (candidates.some((cell) => this.grid[cell.row]?.[cell.col] && distance(pos, this.worldPosForCell(cell.row, cell.col)) <= this.radius * 1.75)) {
        break;
      }
    }

    this.previewPath = points;
  }

  draw() {
    const ctx = this.ctx;
    const w = this.world.width;
    const h = this.world.height;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }

    this.drawBackground(ctx);
    this.drawDangerGlow(ctx); // FIX #20: escalating red glow near danger line
    this.drawTrails(ctx);
    this.drawGrid(ctx);
    this.drawLauncher(ctx);
    this.drawShot(ctx);
    this.drawParticles(ctx);
    ctx.restore();

    this.drawFlash(ctx);
    this.drawTexts(ctx);

    this.buildAimPreview();
  }

  drawBackground(ctx) {
    const w = this.world.width;
    const h = this.world.height;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    const topCol = this.lerpColor("#0b1630", "#2b0b30", this.frenzyMode);
    const midCol = this.lerpColor("#070f22", "#1a0722", this.frenzyMode);
    gradient.addColorStop(0, topCol);
    gradient.addColorStop(0.6, midCol);
    gradient.addColorStop(1, "#060a18");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const glow = ctx.createRadialGradient(w * 0.5, h * 0.22, 10, w * 0.5, h * 0.22, h * 0.62);
    const glowCol = this.lerpColor("rgba(121,245,255,0.12)", "rgba(255,91,134,0.25)", this.frenzyMode);
    glow.addColorStop(0, glowCol);
    glow.addColorStop(0.45, "rgba(255,221,122,0.06)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    const lineY = this.launcher.y - this.radius * 2.25;
    ctx.save();
    ctx.strokeStyle = "rgba(255,91,134,0.22)";
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(18, lineY);
    ctx.lineTo(w - 18, lineY);
    ctx.stroke();
    ctx.restore();
  }

  drawGrid(ctx) {
    for (let row = 0; row < this.maxRows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const bubble = this.grid[row][col];
        if (!bubble) continue;
        const p = this.worldPosForCell(row, col);
        this.drawBubble(ctx, p.x, p.y, bubble.color, bubble.special);
      }
    }
  }

  drawBubble(ctx, x, y, colorId, special = null, scale = 1) {
    const hex = COLORS.find((c) => c.id === colorId)?.hex || "#ffffff";
    const r = this.radius * 0.95 * scale;
    ctx.save();
    ctx.translate(x, y);

    const base = ctx.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.1, 0, 0, r * 1.25);
    if (special === "bomb") {
      base.addColorStop(0, "rgba(255,255,255,0.8)");
      base.addColorStop(0.12, "rgba(255,255,255,0.22)");
      base.addColorStop(0.45, "rgba(40,41,66,1)");
      base.addColorStop(1, "rgba(10,10,20,1)");
    } else {
      base.addColorStop(0, "rgba(255,255,255,0.85)");
      base.addColorStop(0.18, hex);
      base.addColorStop(1, "rgba(0,0,0,0.55)");
    }
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TWO_PI);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(-r * 0.28, -r * 0.35, r * 0.22, 0, TWO_PI);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (special === "bomb") {
      ctx.save();
      ctx.globalAlpha = 0.88;
      ctx.strokeStyle = "rgba(255,221,122,0.95)";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, 0);
      ctx.lineTo(r * 0.6, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.6);
      ctx.lineTo(0, r * 0.6);
      ctx.stroke();
      ctx.restore();
    }

    if (special === "rainbow") {
      ctx.save();
      const grad = ctx.createConicGradient(0, 0, 0);
      grad.addColorStop(0, "red");
      grad.addColorStop(0.2, "orange");
      grad.addColorStop(0.4, "yellow");
      grad.addColorStop(0.6, "green");
      grad.addColorStop(0.8, "blue");
      grad.addColorStop(1, "purple");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, TWO_PI);
      ctx.fill();
      ctx.restore();
    }

    if (special === "clock") {
      ctx.save();
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${r}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🕒", 0, 0);
      ctx.restore();
    }

    if (special === "lightning") {
      ctx.save();
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${r * 1.2}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚡", 0, 0);
      ctx.restore();
    }

    if (special === "ice") {
      ctx.save();
      ctx.fillStyle = "rgba(180, 240, 255, 0.4)";
      ctx.beginPath();
      ctx.rect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  drawLauncher(ctx) {
    const x = this.launcher.x;
    const y = this.launcher.y;

    if (this.aimAssist && this.playing && !this.gameOver && !this.activeShot) {
      const pts = this.previewPath;
      if (pts.length) {
        ctx.save();
        // More vibrant and thicker dots for better visibility on mobile
        ctx.strokeStyle = "rgba(121,245,255,0.6)";
        ctx.lineWidth = 4;
        ctx.setLineDash([4, 12]);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, y);
        pts.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.save();
    ctx.translate(x, y);
    const ring = ctx.createRadialGradient(0, 0, 6, 0, 0, this.radius * 2.2);
    ring.addColorStop(0, "rgba(121,245,255,0.22)");
    ring.addColorStop(0.4, "rgba(255,221,122,0.12)");
    ring.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 2.2, 0, TWO_PI);
    ctx.fill();
    ctx.restore();

    if (this.queue.now) {
      // FIX #18: pass the full special type so rainbow/clock/lightning render in launcher
      const nowSpecial = this.queue.now.type !== "color" ? this.queue.now.type : null;
      this.drawBubble(ctx, x, y, this.queue.now.color || "yellow", nowSpecial, 1.05);
    }
  }

  drawShot(ctx) {
    if (!this.activeShot) return;
    const s = this.activeShot;
    const bubble = s.bubble;
    const special = bubble.type === "bomb" ? "bomb" : null;
    
    // Squash & Stretch logic
    if (s.stretch > 1.0) s.stretch -= 0.05;
    else s.stretch = 1.0;

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.stretchAngle);
    ctx.scale(s.stretch, 1 / s.stretch);
    this.drawBubble(ctx, 0, 0, bubble.color || "yellow", special, 1.02);
    ctx.restore();
  }

  drawTrails(ctx) {
    this.trails.forEach(t => {
      ctx.save();
      ctx.globalAlpha = t.life * 0.4;
      ctx.fillStyle = t.hex;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size * (t.life / 0.4), 0, TWO_PI);
      ctx.fill();
      ctx.restore();
    });
  }

  drawParticles(ctx) {
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.hex;
      if (p.type === "star") {
        this.drawStar(ctx, p.x, p.y, 5, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TWO_PI);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  drawStar(ctx, x, y, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let cx = x;
    let cy = y;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(x, y - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  lerpColor(a, b, t) {
    // FIX #23: handle both hex and rgba() strings
    const parseRgba = (s) => {
      const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (m) return [+m[1], +m[2], +m[3], m[4] !== undefined ? +m[4] : 1];
      if (s.startsWith('#')) {
        return [
          parseInt(s.slice(1,3),16), parseInt(s.slice(3,5),16), parseInt(s.slice(5,7),16), 1
        ];
      }
      return null;
    };
    const ca = parseRgba(a);
    const cb = parseRgba(b);
    if (ca && cb) {
      const r = Math.round(lerp(ca[0], cb[0], t));
      const g = Math.round(lerp(ca[1], cb[1], t));
      const bl = Math.round(lerp(ca[2], cb[2], t));
      const al = +(lerp(ca[3], cb[3], t).toFixed(3));
      return `rgba(${r},${g},${bl},${al})`;
    }
    return a;
  }

  drawTexts(ctx) {
    this.popTexts.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.font = '700 22px "Baloo 2", sans-serif';
      ctx.textAlign = "center";
      ctx.strokeStyle = "rgba(4, 6, 14, 0.55)";
      ctx.lineWidth = 6;
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillStyle = p.hex;
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    });
  }

  drawFlash(ctx) {
    if (this.flash <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(0.55, this.flash * 2.8);
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0, 0, this.world.width, this.world.height);
    ctx.restore();
  }

  tickMusic(dt) {
    if (!this.playing || this.gameOver) return;
    
    let tempo = this.frenzyActive ? 0.3 : 0.6;
    if (this.mode === MODES.DAILY && this.timer < 10) tempo *= 0.7;

    this.beatTimer += dt;
    if (this.beatTimer >= tempo) {
      this.beatTimer = 0;
      this.beatCount++;
      
      const isDownbeat = this.beatCount % 4 === 0;
      const freq = isDownbeat ? 60 : 80;
      const vol = isDownbeat ? 0.02 : 0.01;
      
      // Kick/Bass tone
      this.tone.tone(freq, 0.15, "sine", vol);
      
      if (this.frenzyActive && this.beatCount % 2 === 0) {
        // Extra frenzy hi-hat style tone
        this.tone.tone(1200, 0.03, "square", 0.005);
      }
    }
  }

  // ── FIX #21: Combo pop CSS animation ──────────────────────────────────────
  flashCombo() {
    if (!this.comboValue) return;
    this.comboValue.classList.remove("combo-pop");
    // Force reflow so animation restarts
    void this.comboValue.offsetWidth;
    this.comboValue.classList.add("combo-pop");
  }

  // ── FIX #20: Danger proximity glow ─────────────────────────────────────────
  drawDangerGlow(ctx) {
    const dangerY = this.launcher.y - this.radius * 2.25;
    let closestGap = Infinity;
    for (let row = 0; row < this.maxRows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (!this.grid[row][col]) continue;
        const p = this.worldPosForCell(row, col);
        closestGap = Math.min(closestGap, dangerY - (p.y + this.radius));
      }
    }
    const threshold = this.radius * 6;
    if (closestGap < threshold) {
      const intensity = Math.max(0, 1 - closestGap / threshold);
      ctx.save();
      const grd = ctx.createLinearGradient(0, dangerY - 60, 0, dangerY + 20);
      grd.addColorStop(0, `rgba(255,91,134,0)`);
      grd.addColorStop(1, `rgba(255,91,134,${(intensity * 0.45).toFixed(3)})`);
      ctx.fillStyle = grd;
      ctx.fillRect(0, dangerY - 60, this.world.width, 80);
      ctx.restore();
    }
  }

  // ── Rival Banner ────────────────────────────────────────────────────────────
  updateRivalBanner() {
    let banner = document.getElementById("rival-banner");
    if (!this.rivalUsername) {
      if (banner) banner.classList.add("hidden");
      return;
    }
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "rival-banner";
      document.body.appendChild(banner);
    }
    const beating = this.realScore > this.rivalScore;
    const state = beating ? "winning" : "losing";
    
    banner.innerHTML = `
      <span class="rival-dot ${state}"></span>
      <span>${beating ? "🟢 WINNING" : "🔴 LEADER"}: <b>${this.rivalUsername}</b></span>
      <span class="rival-status ${state}">${this.rivalScore.toLocaleString()} pts</span>
    `;
    banner.classList.remove("hidden");
  }

  // ── Helper: centralised hex colour for any bubble type ───────────────────
  getHexForBubble(b) {
    if (!b) return "#fff";
    if (b.type === "rainbow")   return "rainbow";
    if (b.type === "colorbomb") return "colorbomb";
    if (b.type === "clock")     return "#53d98d";
    if (b.type === "lightning") return "#ffd33d";
    if (b.type === "bomb")      return "#1f2030";
    return COLORS.find((c) => c.id === b.color)?.hex || "#fff";
  }

  // ── Helper: show a mid-game milestone banner for 2.8 seconds ─────────────
  showMilestone(text) {
    const el = this.milestoneBanner || document.getElementById('milestone-banner');
    if (!el) return;
    el.textContent = text;
    el.classList.remove('hidden', 'show');
    void el.offsetWidth; // force reflow so animation restarts
    el.classList.remove('hidden');
    el.classList.add('show');
    clearTimeout(this._milestoneTimer);
    this._milestoneTimer = setTimeout(() => {
      el.classList.remove('show');
      el.classList.add('hidden');
    }, 2900);
  }

  // ── Helper: apply level colour theme to the CSS root variable ────────────
  updateLevelTheme(announce = true) {
    const theme = this.levelThemes[(this.level - 1) % this.levelThemes.length];
    document.documentElement.style.setProperty('--level-hue', theme.hue);
    if (announce && this.level > 1) {
      this.showMilestone(`LEVEL ${this.level} — ${theme.name} Arena`);
    }
  }

  // ── Helper: danger zone check (bubbles within 3 rows of launcher) ────────
  isDangerZone() {
    const dangerY = this.launcher.y - this.radius * 4;
    for (let row = 0; row < this.maxRows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (!this.grid[row][col]) continue;
        const p = this.worldPosForCell(row, col);
        if (p.y + this.radius >= dangerY) return true;
      }
    }
    return false;
  }

  // ── Helper: share score via Web Share API (falls back to clipboard) ───────
  shareScore() {
    const score = this._lastShareScore || this.realScore;
    const text = `🎯 Bubble Shooter Blitz — I scored ${score.toLocaleString()} pts on Playza! Can you beat me? 🫧`;
    if (navigator.share) {
      navigator.share({ title: 'Bubble Shooter Blitz', text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('shareButton');
        if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '📤 Share'; }, 2000); }
      }).catch(() => {});
    }
  }
}

// ── Platform Bridge: React → iframe messages ─────────────────────────────────
window.addEventListener("message", (event) => {
  const instance = window.__bubbleBlitz;
  if (!instance) return;
  const { type, payload } = event.data || {};

  // FIX #4 / #6: Session config locks the game and provides session context
  if (type === "PLAYZA_SESSION_CONFIG") {
    instance.sessionLocked = payload?.locked ?? false;
    instance.sessionId = payload?.sessionId ?? null;
    // Honour aimAssist policy from session config
    if (payload?.aimAssistPolicy === "always") instance.aimAssist = true;
    if (payload?.aimAssistPolicy === "never") instance.aimAssist = false;
    
    // Auto-start endless mode when session config arrives
    instance.start(MODES.ENDLESS);
  }

  // Rival banner update (GamePlay.tsx polls every 10s)
  if (type === "PLAYZA_RIVAL_UPDATE") {
    instance.rivalUsername = payload?.username || null;
    instance.rivalScore = payload?.score || 0;
    instance.updateRivalBanner();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  window.__bubbleBlitz = new BubbleShooterBlitz();
});
