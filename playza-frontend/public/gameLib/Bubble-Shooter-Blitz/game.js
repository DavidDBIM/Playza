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
    this.score = 0;
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
    this.resize();
    this.buildGrid();
    window.addEventListener("resize", () => this.resize());

    this.bindEvents();
    this.loadBest();
    this.openOverlay();
    requestAnimationFrame((t) => this.tick(t));
  }

  bindEvents() {
    const toWorld = (evt) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (evt.clientX - rect.left) * (this.bounds.width / rect.width);
      const y = (evt.clientY - rect.top) * (this.bounds.height / rect.height);
      return { x, y };
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
        if (this.playing) this.endRun(true);
        this.openOverlay();
      }
      if (!this.playing || this.gameOver) return;
      if (evt.key === "s" || evt.key === "S") this.swapQueue();
      if (evt.key === "a" || evt.key === "A") this.toggleAim();
      if (evt.key === "b" || evt.key === "B") this.useBomb();
    });

    this.swapButton.addEventListener("click", () => this.swapQueue());
    this.bombButton.addEventListener("click", () => this.useBomb());
    this.aimButton.addEventListener("click", () => this.toggleAim());
    this.soundButton.addEventListener("click", () => this.toggleSound());
    this.helpButton.addEventListener("click", () => this.openOverlay(true));

    this.startDaily.addEventListener("click", () => this.start(MODES.DAILY));
    this.startEndless.addEventListener("click", () => this.start(MODES.ENDLESS));
    this.closeOverlay.addEventListener("click", () => this.hideOverlay());
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    this.canvas.width = Math.floor(rect.width * this.dpr);
    this.canvas.height = Math.floor(rect.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.bounds.width = rect.width;
    this.bounds.height = rect.height;
    this.world.width = rect.width;
    this.world.height = rect.height;

    const playableWidth = Math.max(280, rect.width - 44);
    this.radius = clamp(Math.floor(playableWidth / 14), 18, 32);
    this.xStep = this.radius * 2;
    this.yStep = Math.round(this.radius * Math.sqrt(3));
    this.cols = clamp(Math.floor(playableWidth / this.xStep), 8, 12);
    this.maxRows = clamp(Math.floor((rect.height - 160) / this.yStep), 11, 15);

    this.world.paddingSide = Math.round((rect.width - this.cols * this.xStep) / 2) + this.radius;
    this.world.paddingTop = 34;
    this.world.paddingBottom = 56;
    this.launcher.x = rect.width / 2;
    this.launcher.y = rect.height - this.world.paddingBottom;
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

    this.playing = true;
    this.gameOver = false;
    this.score = 0;
    this.combo = 1;
    this.comboDecay = 0;
    this.elapsed = 0;
    this.timer = mode === MODES.DAILY ? 60 : 0;
    this.ceiling = 0;
    this.ceilingSpeed = mode === MODES.DAILY ? 8 : 10;
    this.shotsTaken = 0;
    this.misses = 0;
    this.level = 1;
    this.structureName = STRUCTURES[0];
    this.flash = 0;
    this.shake = 0;
    this.particles = [];
    this.popTexts = [];

    this.swapsLeft = mode === MODES.DAILY ? 2 : 3;
    this.bombs = 0;
    this.bombCharge = 0;
    this.aimAssist = true;
    this.activeShot = null;
    this.isAiming = false;
    this.previewPath = [];

    this.buildGrid();
    this.queue.now = this.rollBubble();
    this.queue.next = this.rollBubble();
    this.loadBest();
    this.syncHud();
    this.message("Blitz started. Keep the combo alive.");
  }

  loadBest() {
    const raw = window.localStorage.getItem(this.bestKey);
    const best = raw ? Number(raw) : 0;
    this.bestScore = Number.isFinite(best) ? best : 0;
    this.bestValue.textContent = `${this.bestScore}`;
  }

  saveBestIfNeeded() {
    if (this.score <= this.bestScore) return;
    this.bestScore = this.score;
    window.localStorage.setItem(this.bestKey, `${this.bestScore}`);
    this.bestValue.textContent = `${this.bestScore}`;
  }

  message(text) {
    if (this.messageLine) this.messageLine.textContent = text;
  }

  rollBubble() {
    const palette = this.availableColors();
    const list = palette.length ? palette : COLORS.map((c) => c.id);
    const color = list[Math.floor(this.gameRng() * list.length)];
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
      this.grid[0][col] = { color, row: 0, col, special: null };
    }
    this.flash = Math.max(this.flash, 0.06);
    this.shake = Math.min(16, this.shake + 4);
    this.tone.tone(220, 0.06, "sawtooth", 0.02);
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
    const speed = 920;
    this.activeShot = {
      x: this.launcher.x,
      y: this.launcher.y,
      vx: aim.x * speed,
      vy: aim.y * speed,
      radius: this.radius * 0.92,
      bubble: shot,
      life: 6,
      bounces: 0,
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
    this.queue.now = { type: "bomb", color: null };
    this.tone.tone(160, 0.12, "sawtooth", 0.04);
    this.message("Bomb loaded.");
    this.syncHud();
  }

  syncHud() {
    this.scoreValue.textContent = `${Math.max(0, Math.floor(this.score))}`;
    this.comboValue.textContent = `x${this.combo}`;
    if (this.levelValue) this.levelValue.textContent = `${this.level}`;
    if (this.mode === MODES.DAILY) {
      this.timeValue.textContent = `${Math.max(0, this.timer).toFixed(1)}`;
    } else {
      this.timeValue.textContent = "∞";
    }
    this.swapCount.textContent = `${this.swapsLeft}`;
    this.bombCount.textContent = `${this.bombs}`;
    this.bombButton.disabled = this.bombs <= 0;
    this.aimState.textContent = this.aimAssist ? "On" : "Off";

    const nowHex = this.queue.now?.type === "bomb" ? "#1f2030" : COLORS.find((c) => c.id === this.queue.now?.color)?.hex || "#ffffff";
    const nextHex = this.queue.next?.type === "bomb" ? "#1f2030" : COLORS.find((c) => c.id === this.queue.next?.color)?.hex || "#ffffff";
    this.nowPreview.style.background = this.previewGradient(nowHex);
    this.nextPreview.style.background = this.previewGradient(nextHex);
  }

  previewGradient(hex) {
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

    const pressure = this.mode === MODES.DAILY ? 1 : 1.2;
    this.ceiling += dt * this.ceilingSpeed * pressure;

    if (this.mode === MODES.DAILY) {
      if (this.shotsTaken > 0 && this.shotsTaken % 7 === 0 && !this.activeShot) {
        if (!this._rowAddedForShot || this._rowAddedForShot !== this.shotsTaken) {
          this._rowAddedForShot = this.shotsTaken;
          this.addNewTopRow();
        }
      }
    } else {
      if (this.shotsTaken > 0 && this.shotsTaken % 6 === 0 && !this.activeShot) {
        if (!this._rowAddedForShot || this._rowAddedForShot !== this.shotsTaken) {
          this._rowAddedForShot = this.shotsTaken;
          this.addNewTopRow();
        }
      }
    }

    if (this.comboDecay > 0) {
      this.comboDecay -= dt;
    } else if (this.combo > 1) {
      this.combo = Math.max(1, this.combo - 1);
      this.comboDecay = 0.35;
      this.syncHud();
    }

    if (this.shake > 0.05) {
      this.shake *= Math.max(0, 1 - dt * 7.5);
    } else {
      this.shake = 0;
    }

    if (this.flash > 0) {
      this.flash = Math.max(0, this.flash - dt * 2.6);
    }

    this.updateShot(dt);
    this.updateParticles(dt);

    if (this.isGridEmpty()) {
      if (this.mode === MODES.ENDLESS) {
        this.level += 1;
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

    this.timeValue.textContent = this.mode === MODES.DAILY ? `${Math.max(0, this.timer).toFixed(1)}` : "∞";
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
        this.tone.tone(280, 0.04, "sine", 0.018);
      } else if (shot.x >= walls.right - shot.radius) {
        shot.x = walls.right - shot.radius;
        shot.vx *= -1;
        shot.bounces += 1;
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
        if (distance({ x: shot.x, y: shot.y }, p) <= this.radius * 1.85) {
          const snap = this.findBestSnapCell(shot.x, shot.y, cell.row, cell.col);
          this.snapShotToCell(snap);
          return;
        }
      }

      if (shot.life <= 0) {
        const cell = this.cellForWorldPos(shot.x, shot.y);
        this.snapShotToCell(cell);
      }
    }
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
    const bubble = { color: shot.bubble.color, row: target.row, col: target.col, special: shot.bubble.type };
    this.grid[target.row][target.col] = bubble;

    this.tone.tone(380, 0.05, "triangle", 0.025);
    this.resolveAfterPlacement(target.row, target.col);
    this.syncHud();
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

    const match = this.collectCluster(row, col, placed.color);
    if (match.length >= 3) {
      this.popCells(match, "match");
      const dropped = this.dropFloating();
      const total = match.length + dropped;
      this.afterClearSuccess(total, this.worldPosForCell(row, col));
    } else {
      this.afterMiss();
    }
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
      if (!b || b.color !== color || b.special === "bomb") continue;
      result.push(cell);
      this.neighbors(cell.row, cell.col).forEach((n) => stack.push(n));
    }
    return result;
  }

  popCells(cells, reason) {
    const base = reason === "bomb" ? 95 : 70;
    const chainBoost = 1 + (this.combo - 1) * 0.32;
    const pointsPer = Math.round(base * chainBoost);
    cells.forEach((cell) => {
      const bubble = this.grid[cell.row][cell.col];
      if (!bubble) return;
      const p = this.worldPosForCell(cell.row, cell.col);
      this.spawnPop(p.x, p.y, bubble.color);
      this.grid[cell.row][cell.col] = null;
      this.score += pointsPer;
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
        this.spawnDrop(p.x, p.y, this.grid[row][col].color);
        this.grid[row][col] = null;
        this.score += Math.round(120 * (1 + (this.combo - 1) * 0.35));
        dropped += 1;
        this.bombCharge += 2;
      }
    }

    if (dropped >= 4) {
      this.popText(`DROP x${dropped}`, { x: this.world.width / 2, y: this.world.paddingTop + 60 + this.ceiling }, "#79f5ff");
      this.tone.tone(740, 0.07, "square", 0.03);
    }

    return dropped;
  }

  afterClearSuccess(totalCleared, anchor) {
    this.combo = clamp(this.combo + 1, 1, 12);
    this.comboDecay = 1.1;
    if (this.mode === MODES.DAILY) {
      const bonus = totalCleared >= 8 ? 1.2 : totalCleared >= 5 ? 0.6 : 0.2;
      this.timer = Math.min(90, this.timer + bonus);
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
    this.combo = 1;
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
    this.saveBestIfNeeded();

    const title = force ? "Run ended" : "Time!";
    const details = reason || (this.mode === MODES.DAILY ? "Blitz complete. Your score is locked." : "Warmup complete. Push for a new best.");

    this.overlayKicker.textContent = "Bubble Shooter Blitz";
    this.overlayTitle.textContent = `${title} — ${Math.floor(this.score)} pts`;
    this.overlayText.textContent = `${details} Best: ${this.bestScore}.`;
    this.overlay.classList.remove("hidden");
    this.startDaily.textContent = "Play Daily Blitz";
    this.startEndless.textContent = "Play Endless Warmup";
    this.tone.tone(140, 0.18, "sawtooth", 0.035);
    this.tone.tone(680, 0.1, "triangle", 0.02);
  }

  spawnPop(x, y, colorId) {
    const hex = COLORS.find((c) => c.id === colorId)?.hex || "#ffffff";
    for (let i = 0; i < 14; i += 1) {
      const a = this.fxRng() * TWO_PI;
      const speed = 120 + this.fxRng() * 260;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 80,
        life: 0.55 + this.fxRng() * 0.25,
        size: 2 + this.fxRng() * 6,
        hex,
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
    const vel = { x: dir.x * 840, y: dir.y * 840 };
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
    gradient.addColorStop(0, "#0b1630");
    gradient.addColorStop(0.6, "#070f22");
    gradient.addColorStop(1, "#060a18");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const glow = ctx.createRadialGradient(w * 0.5, h * 0.22, 10, w * 0.5, h * 0.22, h * 0.62);
    glow.addColorStop(0, "rgba(121,245,255,0.12)");
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

    ctx.restore();
  }

  drawLauncher(ctx) {
    const x = this.launcher.x;
    const y = this.launcher.y;

    if (this.aimAssist && this.playing && !this.gameOver && !this.activeShot) {
      const pts = this.previewPath;
      if (pts.length) {
        ctx.save();
        ctx.strokeStyle = "rgba(121,245,255,0.35)";
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 10]);
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
      this.drawBubble(ctx, x, y, this.queue.now.color || "yellow", this.queue.now.type === "bomb" ? "bomb" : null, 1.05);
    }
  }

  drawShot(ctx) {
    if (!this.activeShot) return;
    const bubble = this.activeShot.bubble;
    const special = bubble.type === "bomb" ? "bomb" : null;
    this.drawBubble(ctx, this.activeShot.x, this.activeShot.y, bubble.color || "yellow", special, 1.02);
  }

  drawParticles(ctx) {
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.hex;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, TWO_PI);
      ctx.fill();
      ctx.restore();
    });
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
}

window.addEventListener("DOMContentLoaded", () => {
  new BubbleShooterBlitz();
});
