const CELL_SIZE = 78;
const BOARD_SIZE = 8;
const CANDY_TYPES = ["strawberry", "blueberry", "lemon", "mint", "grape", "orange"];
const BOARD_PIXELS = CELL_SIZE * BOARD_SIZE;
const CANDY_COLORS = {
  strawberry: "#ff5d8f",
  blueberry: "#4fb3ff",
  lemon: "#ffd33d",
  mint: "#53d98d",
  grape: "#8f6fff",
  orange: "#ff9c3d",
};

const SPECIALS = {
  STRIPED_H: "stripedH",
  STRIPED_V: "stripedV",
  WRAPPED: "wrapped",
  COLOR_BOMB: "colorBomb",
  INGREDIENT: "ingredient",
};

const SWAP_ANIMATION_MS = 85;
const INVALID_SWAP_MS = 95;
const MATCH_CLEAR_MS = 95;
const REFILL_SETTLE_MS = 110;
const STORM_THRESHOLD = 200;
const MAX_CARRY_SPECIALS = Number.POSITIVE_INFINITY;
const TOUCH_SWIPE_THRESHOLD_RATIO = 0.35;
const TOUCH_SWIPE_MIN_PX = 18;
const TOUCH_CLICK_SUPPRESS_MS = 450;

const PIECE_IMAGE_PATHS = {
  strawberry: "./assets/images/strawberry.webp",
  blueberry: "./assets/images/blueberry.webp",
  lemon: "./assets/images/lemon-removebg.webp",
  mint: "./assets/images/mint.webp",
  grape: "./assets/images/grape.webp",
  orange: "./assets/images/orange.webp",
  jelly: "./assets/images/jelly.webp",
  crate: "./assets/images/crate.webp",
  // stripedH: "./assets/images/overlat-striped-h.webp",
  // stripedV: "./assets/images/overlay-striped-v.webp",
  wrapped: "./assets/images/overlay-wrapped.webp",
  colorBomb: "./assets/images/special-color-bomb.webp",
  ingredient: "./assets/images/special-ingredients.webp",
  sparkle: "./assets/images/overlay-sparkle.webp",
};

const SPECIAL_IMAGE_PATHS = {
  strawberry: {
    [SPECIALS.STRIPED_H]: "./assets/images/strawberry-striped-h.webp",
    [SPECIALS.STRIPED_V]: "./assets/images/strawberry-striped-v.webp",
    [SPECIALS.WRAPPED]: "./assets/images/strawberry_wrapped.webp",
  },
  blueberry: {
    [SPECIALS.STRIPED_H]: "./assets/images/blueberry-striped-h.webp",
    [SPECIALS.STRIPED_V]: "./assets/images/blueberry-striped-v.webp",
    [SPECIALS.WRAPPED]: "./assets/images/blueberry_wrapped.webp",
  },
  lemon: {
    [SPECIALS.STRIPED_H]: "./assets/images/lemon-striped-h.webp",
    [SPECIALS.STRIPED_V]: "./assets/images/lemon-striped-v.webp",
    [SPECIALS.WRAPPED]: "./assets/images/lemon_wrapped.webp",
  },
  mint: {
    [SPECIALS.STRIPED_H]: "./assets/images/mint-striped-h.webp",
    [SPECIALS.STRIPED_V]: "./assets/images/mint-striped-v.webp",
    [SPECIALS.WRAPPED]: "./assets/images/mint_wrapped.webp",
  },
  grape: {
    [SPECIALS.STRIPED_H]: "./assets/images/grape-striped-h.webp",
    [SPECIALS.STRIPED_V]: "./assets/images/grape-striped-v.webp",
    [SPECIALS.WRAPPED]: "./assets/images/grape_wrapped.webp",
  },
  orange: {
    [SPECIALS.STRIPED_H]: "./assets/images/orange-striped-h.webp",
    [SPECIALS.STRIPED_V]: "./assets/images/orange-striped-v.webp",
    [SPECIALS.WRAPPED]: "./assets/images/orange_wrapped.webp",
  },
};

const LEVELS = [
  {
    moves: 24,
    target: 4200,
    goals: { strawberry: 14, lemon: 12 },
    jellyTargets: 0,
  },
  {
    moves: 22,
    target: 6500,
    goals: { blueberry: 15, mint: 14 },
    jellyTargets: 0,
  },
  {
    moves: 20,
    target: 8800,
    goals: { grape: 16, orange: 16 },
    jellyTargets: 0,
  },
  {
    moves: 19,
    target: 10200,
    goals: { strawberry: 15, blueberry: 15 },
    jellyTargets: 0,
  },
  {
    moves: 18,
    target: 11800,
    goals: { lemon: 16, grape: 16 },
    jellyTargets: 8,
  },
];

const BOARD_SHAPES = [
  {
    name: "Classic",
    mask: [
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
    ],
  },
  {
    name: "Diamond",
    mask: [
      "00011000",
      "00111100",
      "01111110",
      "11111111",
      "11111111",
      "01111110",
      "00111100",
      "00011000",
    ],
  },
  {
    name: "Twin Towers",
    mask: [
      "11011011",
      "11011011",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "11011011",
      "11011011",
    ],
  },
  {
    name: "Hourglass",
    mask: [
      "11111111",
      "01111110",
      "00111100",
      "00011000",
      "00011000",
      "00111100",
      "01111110",
      "11111111",
    ],
  },
  {
    name: "Clover",
    mask: [
      "00111100",
      "01111110",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "01111110",
      "00111100",
    ],
  },
  {
    name: "Split River",
    mask: [
      "11100111",
      "11100111",
      "11110111",
      "11111111",
      "11111111",
      "11110111",
      "11100111",
      "11100111",
    ],
  },
  {
    name: "Crown",
    mask: [
      "10111011",
      "11111111",
      "01111110",
      "11111111",
      "11111111",
      "01111110",
      "01111110",
      "00111100",
    ],
  },
  {
    name: "Crosswind",
    mask: [
      "00111100",
      "00111100",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "00111100",
      "00111100",
    ],
  },
  {
    name: "Lantern",
    mask: [
      "00111100",
      "01111110",
      "01111110",
      "11111111",
      "11111111",
      "01111110",
      "01111110",
      "00111100",
    ],
  },
  {
    name: "Bridge",
    mask: [
      "11111111",
      "11111111",
      "00111100",
      "00111100",
      "00111100",
      "00111100",
      "11111111",
      "11111111",
    ],
  },
  {
    name: "Canyon",
    mask: [
      "11111111",
      "11011011",
      "11111111",
      "01111110",
      "01111110",
      "11111111",
      "11011011",
      "11111111",
    ],
  },
  {
    name: "Prism",
    mask: [
      "00011000",
      "00111100",
      "01111110",
      "11111111",
      "01111110",
      "00111100",
      "01111110",
      "11111111",
    ],
  },
  {
    name: "Anchor",
    mask: [
      "00111100",
      "00111100",
      "00111100",
      "11111111",
      "11111111",
      "00111100",
      "01111110",
      "00111100",
    ],
  },
  {
    name: "Orbit",
    mask: [
      "01111110",
      "11000011",
      "10111101",
      "10111101",
      "10111101",
      "10111101",
      "11000011",
      "01111110",
    ],
  },
  {
    name: "Fjord",
    mask: [
      "11100111",
      "11100111",
      "11111111",
      "01111110",
      "01111110",
      "11111111",
      "11100111",
      "11100111",
    ],
  },
  {
    name: "Petal",
    mask: [
      "00111100",
      "11111111",
      "11111111",
      "01111110",
      "01111110",
      "11111111",
      "11111111",
      "00111100",
    ],
  },
  {
    name: "Forge",
    mask: [
      "11111111",
      "11111111",
      "11100111",
      "11100111",
      "11100111",
      "11100111",
      "11111111",
      "11111111",
    ],
  },
  {
    name: "Ripple",
    mask: [
      "01111110",
      "00111100",
      "11111111",
      "01111110",
      "01111110",
      "11111111",
      "00111100",
      "01111110",
    ],
  },
  {
    name: "Spire",
    mask: [
      "00011000",
      "00111100",
      "01111110",
      "11111111",
      "00111100",
      "00111100",
      "01111110",
      "11111111",
    ],
  },
  {
    name: "Festival",
    mask: [
      "10111101",
      "11111111",
      "01111110",
      "11111111",
      "11111111",
      "01111110",
      "11111111",
      "10111101",
    ],
  },
  {
    name: "Triangle Up",
    mask: [
      "00010000",
      "00111000",
      "01111100",
      "11111110",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
    ],
  },
  {
    name: "Triangle Down",
    mask: [
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "11111110",
      "01111100",
      "00111000",
      "00010000",
    ],
  },
  {
    name: "Pentagon Point",
    mask: [
      "00111100",
      "01111110",
      "11111111",
      "11111111",
      "11111111",
      "01111110",
      "00111100",
      "00011000",
    ],
  },
  {
    name: "Hexagon Plate",
    mask: [
      "01111110",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "01111110",
    ],
  },
  {
    name: "Heptagon Tilt",
    mask: [
      "00111110",
      "01111110",
      "11111111",
      "11111111",
      "11111111",
      "11111111",
      "01111110",
      "00111100",
    ],
  },
  {
    name: "Hexagon Frame",
    mask: [
      "01111110",
      "11000011",
      "10000001",
      "10000001",
      "10000001",
      "10000001",
      "11000011",
      "01111110",
    ],
  },
  {
    name: "Octagon Frame",
    mask: [
      "00111100",
      "01000010",
      "10000001",
      "10000001",
      "10000001",
      "10000001",
      "01000010",
      "00111100",
    ],
  },
];

const SHAPE_POOL = [...BOARD_SHAPES];
const FIXED_LEVEL_SHAPES = [
  BOARD_SHAPES[1],
  BOARD_SHAPES[1],
  BOARD_SHAPES[2],
  BOARD_SHAPES[3],
  BOARD_SHAPES[4],
  BOARD_SHAPES[0],
  BOARD_SHAPES[5],
  BOARD_SHAPES[6],
  BOARD_SHAPES[7],
  BOARD_SHAPES[8],
  BOARD_SHAPES[9],
  BOARD_SHAPES[10],
  BOARD_SHAPES[11],
  BOARD_SHAPES[0],
  BOARD_SHAPES[12],
  BOARD_SHAPES[13],
  BOARD_SHAPES[14],
  BOARD_SHAPES[15],
  BOARD_SHAPES[16],
  BOARD_SHAPES[17],
  BOARD_SHAPES[18],
  BOARD_SHAPES[19],
];

class SugarStormGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.scoreValue = document.getElementById("scoreValue");
    this.movesValue = document.getElementById("movesValue");
    this.levelValue = document.getElementById("levelValue");
    this.targetValue = document.getElementById("targetValue");
    this.chainValue = document.getElementById("chainValue");
    this.boardTypeValue = document.getElementById("boardTypeValue");
    this.stormValue = document.getElementById("stormValue");
    this.goalList = document.getElementById("goalList");
    this.messageLine = document.getElementById("messageLine");
    this.infoButton = document.getElementById("infoButton");
    this.shuffleCount = document.getElementById("shuffleCount");
    this.mobileInfoPanel = document.getElementById("mobileInfoPanel");

    this.overlay = document.getElementById("overlay");
    this.overlayKicker = document.getElementById("overlayKicker");
    this.overlayTitle = document.getElementById("overlayTitle");
    this.overlayText = document.getElementById("overlayText");
    this.overlayButton = document.getElementById("overlayButton");

    this.boardTypeValue?.closest(".board-stat")?.remove();
    this.boardTypeValue = null;

    this.shuffleButton = document.getElementById("shuffleButton");
    this.screenOverlay = document.getElementById("screenOverlay");
    this.screenKicker = document.getElementById("screenKicker");
    this.screenTitle = document.getElementById("screenTitle");
    this.screenText = document.getElementById("screenText");
    this.screenButton = document.getElementById("screenButton");
    this.mapStrip = document.getElementById("mapStrip");

    this.board = [];
    this.selected = null;
    this.hintCells = [];
    this.hintTimer = 0;
    this.messageTimer = 0;
    this.particles = [];
    this.effectLines = [];
    this.effectBursts = [];
    this.screenFlash = 0;
    this.screenFlashColor = "rgba(255,255,255,1)";
    this.isBusy = false;
    this.isGameOver = false;
    this.levelComplete = false;
    this.levelIndex = 0;
    this.totalScore = 0;
    this.movesLeft = 0;
    this.levelTarget = 0;
    this.goalState = {};
    this.lastTimestamp = 0;
    this.shape = BOARD_SHAPES[0];
    this.chainMultiplier = 1;
    this.activeTouch = null;
    this.lastTouchAt = 0;
    this.jellyGrid = [];
    this.jellyRemaining = 0;
    this.blockerGrid = [];
    this.blockerRemaining = 0;
    this.glassGrid = [];
    this.glassRemaining = 0;
    this.ingredientRemaining = 0;
    this.started = false;
    this.audioContext = null;
    this.popupTexts = [];
    this.stageMode = "Standard";
    this.carryMoves = 0;
    this.carrySpecials = [];
    this.shufflesLeft = 2;
    this.stormCharge = 0;
    this.screenShake = 0;
    this.lastShapeName = BOARD_SHAPES[0].name;
    this.shapeByLevel = new Map();
    this.levelRandom = null;
    this.pieceImages = {};

    this.setupEvents();
    this.loadPieceImages();
    this.buildBoardPreview();
    this.renderMapStrip();
    this.showScreen(
      "Sugar Storm Smash",
      "Endless Sweet Run",
      "Beat the opening stages, then continue forever through generated levels with storm charge, random board shapes, sugar glass, crates, jelly tides, and deeper candy chaos.",
      "Start Run",
    );
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    requestAnimationFrame((timestamp) => this.tick(timestamp));
  }

  loadPieceImages() {
    const imageSources = {
      ...PIECE_IMAGE_PATHS,
      ...Object.fromEntries(
        Object.entries(SPECIAL_IMAGE_PATHS).flatMap(([type, variants]) =>
          Object.entries(variants).map(([special, src]) => [
            `${type}-${special}`,
            src,
          ]),
        ),
      ),
    };

    Object.entries(imageSources).forEach(([key, src]) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
      image.addEventListener("load", () => {
        this.pieceImages[key] = image;
      });
      image.addEventListener("error", () => {
        this.pieceImages[key] = null;
      });
    });
  }

  setupEvents() {
    this.canvas.addEventListener("click", (event) => {
      if (Date.now() - this.lastTouchAt < TOUCH_CLICK_SUPPRESS_MS) {
        return;
      }
      this.handlePointer(event.clientX, event.clientY);
    });
    this.canvas.addEventListener(
      "touchstart",
      (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        this.handleTouchStart(touch.clientX, touch.clientY);
      },
      { passive: false },
    );
    this.canvas.addEventListener(
      "touchmove",
      (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        this.handleTouchMove(touch.clientX, touch.clientY);
      },
      { passive: false },
    );
    this.canvas.addEventListener(
      "touchend",
      (event) => {
        event.preventDefault();
        const touch = event.changedTouches[0];
        this.handleTouchEnd(touch?.clientX, touch?.clientY);
      },
      { passive: false },
    );
    this.canvas.addEventListener(
      "touchcancel",
      () => {
        this.activeTouch = null;
      },
      { passive: false },
    );

    this.shuffleButton.addEventListener("click", () => {
      if (!this.isBusy && !this.isGameOver && this.shufflesLeft > 0) {
        this.shufflesLeft -= 1;
        this.shuffleBoard(true);
        this.syncHud();
      }
    });
    this.infoButton.addEventListener("click", () => {
      this.mobileInfoPanel.classList.toggle("hidden");
    });
    this.screenButton.addEventListener("click", () => {
      this.unlockAudio();
      this.started = true;
      this.hideScreen();
      this.startLevel(0, true);
    });

    this.overlayButton.addEventListener("click", () => {
      if (this.levelComplete) {
        this.startLevel(this.levelIndex + 1, false);
      } else {
        this.restartGame();
      }
    });
  }

  buildBoardPreview() {
    this.shape = BOARD_SHAPES[0];
    this.board = Array.from({ length: BOARD_SIZE }, () =>
      Array(BOARD_SIZE).fill(null),
    );
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        this.board[row][col] = this.createPiece(
          this.randomCandyType(),
          row,
          col,
        );
      }
    }
    this.jellyGrid = Array.from({ length: BOARD_SIZE }, () =>
      Array(BOARD_SIZE).fill(0),
    );
    this.blockerGrid = Array.from({ length: BOARD_SIZE }, () =>
      Array(BOARD_SIZE).fill(0),
    );
    this.glassGrid = Array.from({ length: BOARD_SIZE }, () =>
      Array(BOARD_SIZE).fill(0),
    );
  }

  renderMapStrip() {
    if (!this.mapStrip) {
      return;
    }
    this.mapStrip.innerHTML = "";
    const level = this.levelIndex + 1 || 1;
    const nodes = [
      `Lv ${Math.max(1, level - 1)}`,
      `Lv ${level}`,
      this.stageMode === "Standard" ? this.shape.name : this.stageMode,
      level >= 4 ? "Endless" : "Opening",
      `Target ${Math.round(this.levelTarget / 100) * 100 || 4200}`,
    ];
    nodes.forEach((label, index) => {
      const item = document.createElement("div");
      item.className = `map-node${index % 2 ? " alt" : ""}${index === 1 ? " current" : ""}`;
      item.textContent = label;
      this.mapStrip.appendChild(item);
    });
  }

  showScreen(kicker, title, text, buttonLabel) {
    this.screenKicker.textContent = kicker;
    this.screenTitle.textContent = title;
    this.screenText.textContent = text;
    this.screenButton.textContent = buttonLabel;
    this.screenOverlay.classList.remove("hidden");
  }

  hideScreen() {
    this.screenOverlay.classList.add("hidden");
  }

  unlockAudio() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume();
    }
  }

  playTone(freq, duration, type = "sine", volume = 0.03) {
    if (!this.audioContext) {
      return;
    }
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2.5));
    const scaleX = rect.width / BOARD_PIXELS;
    const scaleY = rect.height / BOARD_PIXELS;
    this.canvas.width = Math.floor(rect.width * ratio);
    this.canvas.height = Math.floor(rect.height * ratio);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";
    this.ctx.setTransform(ratio * scaleX, 0, 0, ratio * scaleY, 0, 0);
  }

  restartGame() {
    this.totalScore = 0;
    this.carryMoves = 0;
    this.carrySpecials = [];
    this.startLevel(0, true);
  }

  startLevel(index, resetScore) {
    if (resetScore) {
      this.totalScore = 0;
    }

    const config = LEVELS[index] || this.makeGeneratedLevel(index);
    this.shape = this.pickShape(index);
    this.stageMode = config.stageMode || "Standard";
    this.levelIndex = index;
    this.levelRandom = this.usesFixedCompetitiveLayout()
      ? this.makeSeededRandom(`level-${index + 1}-run`)
      : null;
    this.movesLeft = config.moves + this.carryMoves;
    this.levelTarget = config.target;
    this.goalState = { ...config.goals };
    this.jellyRemaining = 0;
    this.blockerRemaining = 0;
    this.glassRemaining = 0;
    this.ingredientRemaining = config.ingredientGoal || 0;
    this.selected = null;
    this.hintCells = [];
    this.hintTimer = 0;
    this.messageTimer = 0;
    this.particles = [];
    this.isBusy = false;
    this.isGameOver = false;
    this.levelComplete = false;
    this.chainMultiplier = 1;
    this.shufflesLeft = 2;
    this.stormCharge = 0;
    this.mobileInfoPanel.classList.add("hidden");
    this.hideOverlay();
    this.buildBoard();
    this.seedJelly(config.jellyTargets || 0);
    this.seedBlockers(config.blockerCount || 0);
    this.seedGlass(config.glassCount || 0);
    this.applyCarrySpecials();
    this.ensureIngredientOnBoard();
    if (!this.findPossibleMove()) {
      this.shuffleBoard(false);
    }
    this.renderMapStrip();
    this.carryMoves = 0;
    this.setMessage(
      `Level ${index + 1}: ${this.stageMode} over ${this.shape.name}. Reach ${config.target.toLocaleString()} and clear the storm goals.`,
    );
    this.syncHud();
  }

  makeGeneratedLevel(index) {
    const goalCount = index >= 16 ? 4 : index >= 8 ? 3 : 2;
    const goalTypes = Array.from(
      { length: goalCount },
      (_, offset) => CANDY_TYPES[(index + offset * 2) % CANDY_TYPES.length],
    );
    let stageMode = "Storm Calm";
    let moves = Math.max(16, 24 - Math.min(index, 8));
    let target = 4200 + index * 2200;
    let jellyTargets = index >= 4 ? Math.min(18, 4 + index) : 0;
    let blockerCount = index >= 6 ? Math.min(16, 4 + index) : 0;
    let glassCount = index >= 5 ? Math.min(16, 2 + Math.floor(index * 0.8)) : 0;
    let ingredientGoal =
      index >= 7 && (index + 1) % 6 === 0
        ? Math.min(3, 1 + Math.floor(index / 10))
        : 0;
    const goals = {};
    goalTypes.forEach((type, offset) => {
      goals[type] = Math.max(10, 14 + Math.min(index, 8) - offset * 2);
    });

    if ((index + 1) % 5 === 0) {
      stageMode = "Thunder Rush";
      moves = Math.max(12, moves - 3);
      target += 1800;
      jellyTargets += 2;
    } else if ((index + 1) % 7 === 0) {
      stageMode = "Jelly Tempest";
      jellyTargets = Math.min(24, jellyTargets + 6);
    } else if ((index + 1) % 9 === 0) {
      stageMode = "Glass Gale";
      glassCount = Math.min(22, glassCount + 8);
    } else if ((index + 1) % 10 === 0) {
      stageMode = "Boss Storm";
      target += 2600;
      blockerCount = Math.min(22, blockerCount + 8);
      glassCount = Math.min(18, glassCount + 4);
      ingredientGoal = Math.max(ingredientGoal, 2);
      moves = Math.max(12, moves - 2);
    }

    return {
      moves,
      target,
      goals,
      jellyTargets,
      blockerCount,
      glassCount,
      ingredientGoal,
      stageMode,
    };
  }

  pickShape(index) {
    if (this.shapeByLevel.has(index)) {
      return this.shapeByLevel.get(index);
    }

    for (let level = 0; level <= index; level += 1) {
      if (this.shapeByLevel.has(level)) {
        continue;
      }

      let choice = null;

      if (level < 3) {
        choice = BOARD_SHAPES[0];
      } else {
        const fixedShape = FIXED_LEVEL_SHAPES[level - 3];
        if (fixedShape) {
          choice = fixedShape;
        }
      }

      if (!choice) {
        const options =
          level < 6
            ? BOARD_SHAPES.slice(0, 4)
            : level < 10
              ? BOARD_SHAPES.slice(0, 10)
              : SHAPE_POOL;
        const previousName = this.shapeByLevel.get(level - 1)?.name || null;
        const filtered = previousName
          ? options.filter((shape) => shape.name !== previousName)
          : options;
        const pool = filtered.length ? filtered : options;
        const random = this.makeSeededRandom(`level-${level + 1}-shape`);
        choice = pool[Math.floor(random() * pool.length)];
      }

      this.shapeByLevel.set(level, choice);
    }

    return this.shapeByLevel.get(index);
  }

  usesFixedCompetitiveLayout() {
    return this.levelIndex >= 0;
  }

  makeSeededRandom(seedKey) {
    let seed = 2166136261;
    const input = `${seedKey}`;
    for (let i = 0; i < input.length; i += 1) {
      seed ^= input.charCodeAt(i);
      seed = Math.imul(seed, 16777619);
    }

    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  shuffleCells(cells, seedKey = null) {
    const random = seedKey ? this.makeSeededRandom(seedKey) : Math.random;
    for (let i = cells.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    return cells;
  }

  randomFloat() {
    return this.levelRandom ? this.levelRandom() : Math.random();
  }

  isPlayableCell(row, col) {
    return this.shape.mask[row][col] === "1";
  }

  seedJelly(count) {
    this.jellyGrid = Array.from({ length: BOARD_SIZE }, () =>
      Array(BOARD_SIZE).fill(0),
    );
    const active = this.allCells();
    this.shuffleCells(
      active,
      this.usesFixedCompetitiveLayout()
        ? `level-${this.levelIndex + 1}-jelly`
        : null,
    );
    const selected = active.slice(0, Math.min(count, active.length));
    selected.forEach(({ row, col }) => {
      this.jellyGrid[row][col] = 1;
    });
    this.jellyRemaining = selected.length;
  }

  seedBlockers(count) {
    this.blockerGrid = Array.from({ length: BOARD_SIZE }, () =>
      Array(BOARD_SIZE).fill(0),
    );
    const active = this.allCells().filter(
      ({ row, col }) => !this.board[row][col]?.special,
    );
    this.shuffleCells(
      active,
      this.usesFixedCompetitiveLayout()
        ? `level-${this.levelIndex + 1}-blockers`
        : null,
    );
    const selected = active.slice(0, Math.min(count, active.length));
    selected.forEach(({ row, col }, index) => {
      this.blockerGrid[row][col] = index % 3 === 0 ? 2 : 1;
    });
    this.blockerRemaining = selected.length;
  }

  seedGlass(count) {
    this.glassGrid = Array.from({ length: BOARD_SIZE }, () =>
      Array(BOARD_SIZE).fill(0),
    );
    const active = this.allCells().filter(
      ({ row, col }) =>
        !this.blockerGrid[row]?.[col] && !this.jellyGrid[row]?.[col],
    );
    this.shuffleCells(
      active,
      this.usesFixedCompetitiveLayout()
        ? `level-${this.levelIndex + 1}-glass`
        : null,
    );
    const selected = active.slice(0, Math.min(count, active.length));
    selected.forEach(({ row, col }) => {
      this.glassGrid[row][col] = 1;
    });
    this.glassRemaining = selected.length;
  }

  ensureIngredientOnBoard() {
    if (
      this.ingredientRemaining <= 0 ||
      this.board.flat().some((piece) => piece?.special === SPECIALS.INGREDIENT)
    ) {
      return;
    }

    const topCells = [];
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        if (this.isPlayableCell(row, col) && !this.blockerGrid[row]?.[col]) {
          topCells.push({ row, col });
          break;
        }
      }
    }

    if (!topCells.length) {
      return;
    }

    const spawn = topCells[Math.floor(this.randomFloat() * topCells.length)];
    const piece = this.createPiece(
      "ingredient",
      spawn.row,
      spawn.col,
      SPECIALS.INGREDIENT,
    );
    piece.drawRow = -1.2;
    this.board[spawn.row][spawn.col] = piece;
  }

  collectIngredientsAtBottom() {
    let collected = 0;
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      let bottomRow = -1;
      for (let row = BOARD_SIZE - 1; row >= 0; row -= 1) {
        if (this.isPlayableCell(row, col)) {
          bottomRow = row;
          break;
        }
      }
      if (bottomRow < 0) {
        continue;
      }

      const piece = this.board[bottomRow][col];
      if (piece?.special === SPECIALS.INGREDIENT) {
        this.spawnPopup("Drop!", { row: bottomRow, col }, "#fff7b0");
        this.spawnParticles([{ row: bottomRow, col }]);
        this.board[bottomRow][col] = null;
        this.ingredientRemaining = Math.max(0, this.ingredientRemaining - 1);
        collected += 1;
      }
    }

    if (collected > 0) {
      this.playTone(310, 0.18, "square", 0.04);
      this.dropPieces();
      this.fillNewPieces();
      this.ensureIngredientOnBoard();
      this.syncHud();
    }
  }

  applyCarrySpecials() {
    if (!this.carrySpecials.length) {
      return;
    }

    const cells = this.allCells().filter(
      ({ row, col }) => !this.isLockedCell(row, col),
    );
    for (let i = cells.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.randomFloat() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    this.carrySpecials.forEach((carry, index) => {
      const cell = cells[index];
      if (!cell) {
        return;
      }
      const piece = this.board[cell.row][cell.col];
      piece.special = carry.special;
      piece.type =
        carry.special === SPECIALS.COLOR_BOMB ? "colorBomb" : carry.type;
      piece.scale = 1.2;
    });

    this.carrySpecials = [];
  }

  captureCarryover() {
    this.carryMoves = Math.max(0, this.movesLeft);
    this.carrySpecials = this.board
      .flat()
      .filter((piece) => this.isPowerSpecial(piece))
      .map((piece) => ({ special: piece.special, type: piece.type }))
      .slice(0, MAX_CARRY_SPECIALS);
  }

  buildBoard() {
    this.board = Array.from({ length: BOARD_SIZE }, () =>
      Array(BOARD_SIZE).fill(null),
    );

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        if (!this.isPlayableCell(row, col)) {
          continue;
        }
        let piece = this.createPiece(this.randomCandyType(), row, col);
        while (this.wouldMatchOnSpawn(row, col, piece.type)) {
          piece = this.createPiece(this.randomCandyType(), row, col);
        }
        this.board[row][col] = piece;
      }
    }

    if (!this.findPossibleMove()) {
      this.shuffleBoard(false);
    }
  }

  createPiece(type, row, col, special = null) {
    return {
      type,
      row,
      col,
      drawRow: row,
      drawCol: col,
      scale: 1,
      pulse: this.randomFloat() * Math.PI * 2,
      special,
    };
  }

  randomCandyType() {
    return CANDY_TYPES[Math.floor(this.randomFloat() * CANDY_TYPES.length)];
  }

  wouldMatchOnSpawn(row, col, type) {
    const left1 = this.board[row][col - 1];
    const left2 = this.board[row][col - 2];
    if (left1 && left2 && left1.type === type && left2.type === type) {
      return true;
    }

    const up1 = this.board[row - 1]?.[col];
    const up2 = this.board[row - 2]?.[col];
    return Boolean(up1 && up2 && up1.type === type && up2.type === type);
  }

  syncHud() {
    this.scoreValue.textContent = this.totalScore.toLocaleString();
    this.movesValue.textContent = this.movesLeft;
    this.levelValue.textContent = this.levelIndex + 1;
    this.targetValue.textContent = this.levelTarget.toLocaleString();
    this.chainValue.textContent = `x${this.chainMultiplier}`;
    if (this.boardTypeValue) {
      this.boardTypeValue.textContent = this.shape.name;
    }
    if (this.stormValue) {
      this.stormValue.textContent = `${Math.min(100, Math.round((this.stormCharge / STORM_THRESHOLD) * 100))}%`;
    }
    this.shuffleCount.textContent = this.shufflesLeft;
    this.shuffleButton.disabled = this.shufflesLeft <= 0;
    this.renderGoals();
  }

  renderGoals() {
    this.goalList.innerHTML = "";

    if (this.ingredientRemaining > 0) {
      const item = document.createElement("div");
      item.className = "goal-item";
      item.innerHTML = `<div class="goal-left"><span class="goal-badge" style="background: linear-gradient(135deg, #fff7d1, #ff9c3d)"></span><strong>Drop</strong></div><span>${this.ingredientRemaining} left</span>`;
      this.goalList.appendChild(item);
    }

    if (this.blockerRemaining > 0) {
      const item = document.createElement("div");
      item.className = "goal-item";
      item.innerHTML = `<div class="goal-left"><span class="goal-badge" style="background: linear-gradient(135deg, #b9b4cf, #6e628f)"></span><strong>Crates</strong></div><span>${this.blockerRemaining} left</span>`;
      this.goalList.appendChild(item);
    }

    if (this.glassRemaining > 0) {
      const item = document.createElement("div");
      item.className = "goal-item";
      item.innerHTML = `<div class="goal-left"><span class="goal-badge" style="background: linear-gradient(135deg, #dff8ff, #76d7ff)"></span><strong>Glass</strong></div><span>${this.glassRemaining} left</span>`;
      this.goalList.appendChild(item);
    }

    if (this.jellyRemaining > 0) {
      const item = document.createElement("div");
      item.className = "goal-item";
      item.innerHTML = `<div class="goal-left"><span class="goal-badge" style="background: linear-gradient(135deg, #8fd3ff, #ffffff)"></span><strong>Jelly</strong></div><span>${this.jellyRemaining} left</span>`;
      this.goalList.appendChild(item);
    }

    Object.entries(this.goalState).forEach(([type, count]) => {
      const item = document.createElement("div");
      item.className = "goal-item";

      const left = document.createElement("div");
      left.className = "goal-left";

      const badge = document.createElement("span");
      badge.className = "goal-badge";
      badge.style.background = CANDY_COLORS[type];

      const label = document.createElement("strong");
      label.textContent = this.capitalize(type);

      const remaining = document.createElement("span");
      remaining.textContent = count <= 0 ? "Done" : `${count} left`;

      left.appendChild(badge);
      left.appendChild(label);
      item.appendChild(left);
      item.appendChild(remaining);
      this.goalList.appendChild(item);
    });
  }

  setMessage(message) {
    this.messageLine.textContent = message;
    this.messageTimer = 4.5;
  }

  handlePointer(clientX, clientY) {
    const cell = this.getCellFromClientPoint(clientX, clientY);
    if (!cell) {
      return;
    }

    this.handleCellInput(cell.row, cell.col);
  }

  handleTouchStart(clientX, clientY) {
    this.lastTouchAt = Date.now();
    const cell = this.getCellFromClientPoint(clientX, clientY);
    this.activeTouch = cell
      ? {
          startRow: cell.row,
          startCol: cell.col,
          startX: clientX,
          startY: clientY,
          swipeTriggered: false,
        }
      : null;
  }

  handleTouchMove(clientX, clientY) {
    if (this.isBusy || this.isGameOver) {
      return;
    }

    if (!this.activeTouch || this.activeTouch.swipeTriggered) {
      return;
    }

    const { startRow, startCol, startX, startY } = this.activeTouch;
    if (
      !this.isInside(startRow, startCol) ||
      !this.board[startRow][startCol] ||
      this.isLockedCell(startRow, startCol)
    ) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const cellWidth = rect.width / BOARD_SIZE;
    const cellHeight = rect.height / BOARD_SIZE;
    const threshold = Math.max(
      TOUCH_SWIPE_MIN_PX,
      Math.min(cellWidth, cellHeight) * TOUCH_SWIPE_THRESHOLD_RATIO,
    );
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < threshold) {
      return;
    }

    let targetRow = startRow;
    let targetCol = startCol;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      targetCol += deltaX > 0 ? 1 : -1;
    } else {
      targetRow += deltaY > 0 ? 1 : -1;
    }

    if (
      !this.isInside(targetRow, targetCol) ||
      !this.board[targetRow][targetCol]
    ) {
      this.activeTouch.swipeTriggered = true;
      this.selected = null;
      return;
    }

    this.activeTouch.swipeTriggered = true;
    this.selected = null;
    this.hintTimer = 0;
    this.hintCells = [];
    this.attemptSwap(startRow, startCol, targetRow, targetCol);
  }

  handleTouchEnd(clientX, clientY) {
    this.lastTouchAt = Date.now();

    if (!this.activeTouch) {
      return;
    }

    const touch = this.activeTouch;
    this.activeTouch = null;

    if (touch.swipeTriggered) {
      return;
    }

    const cell =
      typeof clientX === "number" && typeof clientY === "number"
        ? this.getCellFromClientPoint(clientX, clientY)
        : null;

    if (cell && cell.row === touch.startRow && cell.col === touch.startCol) {
      this.handleCellInput(cell.row, cell.col);
    }
  }

  getCellFromClientPoint(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cellWidth = rect.width / BOARD_SIZE;
    const cellHeight = rect.height / BOARD_SIZE;
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (!this.isInside(row, col)) {
      return null;
    }

    return { row, col };
  }

  handleCellInput(row, col) {
    if (this.isBusy || this.isGameOver) {
      return;
    }

    if (!this.board[row][col]) {
      this.selected = null;
      return;
    }

    if (this.isLockedCell(row, col)) {
      this.selected = null;
      this.setMessage("That candy is locked under sugar glass or crates.");
      return;
    }

    this.hintTimer = 0;
    this.hintCells = [];

    if (!this.selected) {
      this.selected = { row, col };
      return;
    }

    if (this.selected.row === row && this.selected.col === col) {
      this.selected = null;
      return;
    }

    if (this.isAdjacent(this.selected.row, this.selected.col, row, col)) {
      this.attemptSwap(this.selected.row, this.selected.col, row, col);
      this.selected = null;
      return;
    }

    this.selected = { row, col };
  }

  isInside(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  }

  isAdjacent(r1, c1, r2, c2) {
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
  }

  isLockedCell(row, col) {
    return Boolean(
      this.blockerGrid[row]?.[col] > 0 || this.glassGrid[row]?.[col] > 0,
    );
  }

  async attemptSwap(r1, c1, r2, c2) {
    this.isBusy = true;
    this.chainMultiplier = 1;
    const a = this.board[r1][c1];
    const b = this.board[r2][c2];

    if (this.isLockedCell(r1, c1) || this.isLockedCell(r2, c2)) {
      this.setMessage(
        "Break the sugar glass or crate first before moving that candy.",
      );
      this.isBusy = false;
      return;
    }

    this.swapPieces(a, b);
    await this.wait(SWAP_ANIMATION_MS);

    const combo = this.resolveDirectCombo(a, b);
    const matches = this.findMatches();

    if (!combo && matches.length === 0) {
      this.swapPieces(a, b);
      await this.wait(INVALID_SWAP_MS);
      this.setMessage("That move needs a better combo.");
      this.syncHud();
      this.isBusy = false;
      return;
    }

    this.movesLeft -= 1;
    this.syncHud();

    if (combo) {
      await this.executeDirectCombo(combo);
      await this.runCascadeLoop();
    } else {
      await this.resolveMatches(matches, [a, b]);
      await this.runCascadeLoop();
    }

    this.checkGameState();
    this.isBusy = false;
  }

  resolveDirectCombo(a, b) {
    const bothSpecial = this.isPowerSpecial(a) && this.isPowerSpecial(b);

    if (
      bothSpecial &&
      a.special === SPECIALS.COLOR_BOMB &&
      b.special === SPECIALS.COLOR_BOMB
    ) {
      return {
        cells: this.allCells(),
        popup: "Storm Nova!",
        color: "#fff1a8",
        shake: 18,
        charge: 32,
      };
    }

    const colorBomb =
      a.special === SPECIALS.COLOR_BOMB
        ? a
        : b.special === SPECIALS.COLOR_BOMB
          ? b
          : null;
    const partner = colorBomb === a ? b : a;

    if (
      colorBomb &&
      (partner.special === SPECIALS.STRIPED_H ||
        partner.special === SPECIALS.STRIPED_V)
    ) {
      const targets = this.collectTypeCells(partner.type, false);
      return {
        cells: targets,
        popup: "Lightning Lines!",
        color: "#fff1a8",
        shake: 16,
        charge: 18,
        prepare: () => {
          targets.forEach((cell, index) => {
            const piece = this.board[cell.row][cell.col];
            if (piece) {
              piece.special =
                index % 2 === 0 ? SPECIALS.STRIPED_H : SPECIALS.STRIPED_V;
              piece.scale = 1.18;
            }
          });
        },
      };
    }

    if (colorBomb && partner.special === SPECIALS.WRAPPED) {
      const targets = this.collectTypeCells(partner.type, false);
      return {
        cells: targets,
        popup: "Sugar Cyclone!",
        color: "#ffe29f",
        shake: 17,
        charge: 20,
        prepare: () => {
          targets.forEach((cell) => {
            const piece = this.board[cell.row][cell.col];
            if (piece) {
              piece.special = SPECIALS.WRAPPED;
              piece.scale = 1.2;
            }
          });
        },
      };
    }

    if (colorBomb) {
      return {
        cells: this.collectTypeCells(partner.type, true),
        popup: "Color Storm!",
        color: "#ffffff",
        shake: 12,
        charge: 14,
      };
    }

    if (
      bothSpecial &&
      (a.special === SPECIALS.STRIPED_H || a.special === SPECIALS.STRIPED_V) &&
      (b.special === SPECIALS.STRIPED_H || b.special === SPECIALS.STRIPED_V)
    ) {
      return {
        cells: this.collectLinesAndRows([a.row, b.row], [a.col, b.col]),
        popup: "Crosscurrent!",
        color: "#d7f7ff",
        shake: 12,
        charge: 12,
      };
    }

    if (
      bothSpecial &&
      (((a.special === SPECIALS.STRIPED_H ||
        a.special === SPECIALS.STRIPED_V) &&
        b.special === SPECIALS.WRAPPED) ||
        ((b.special === SPECIALS.STRIPED_H ||
          b.special === SPECIALS.STRIPED_V) &&
          a.special === SPECIALS.WRAPPED))
    ) {
      return {
        cells: this.collectStormBandCells([a, b]),
        popup: "Storm Band!",
        color: "#ffe7a8",
        shake: 16,
        charge: 16,
      };
    }

    if (
      bothSpecial &&
      a.special === SPECIALS.WRAPPED &&
      b.special === SPECIALS.WRAPPED
    ) {
      return {
        cells: this.collectBlastCells([a, b], 2),
        popup: "Sugar Quake!",
        color: "#ffd2a3",
        shake: 20,
        charge: 18,
      };
    }

    return null;
  }

  async executeDirectCombo(combo) {
    combo.prepare?.();
    if (combo.popup) {
      const anchor =
        combo.cells[Math.floor(combo.cells.length / 2)] || combo.cells[0];
      this.spawnPopup(combo.popup, anchor, combo.color || "#ffffff");
      this.setMessage(combo.popup);
    }
    this.addStormCharge(combo.charge || 8);
    this.addScreenShake(combo.shake || 8);
    await this.resolveEffects(combo.cells);
  }

  collectLinesAndRows(rows, cols) {
    const cells = [];
    rows.forEach((row) => {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        cells.push({ row, col });
      }
    });
    cols.forEach((col) => {
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        cells.push({ row, col });
      }
    });
    return this.uniqueCells(cells);
  }

  collectStormBandCells(pieces) {
    const cells = [];
    pieces.forEach((piece) => {
      for (let band = -1; band <= 1; band += 1) {
        const row = piece.row + band;
        const col = piece.col + band;
        for (let c = 0; c < BOARD_SIZE; c += 1) {
          cells.push({ row, col: c });
        }
        for (let r = 0; r < BOARD_SIZE; r += 1) {
          cells.push({ row: r, col });
        }
      }
    });
    return this.uniqueCells(cells);
  }

  collectBlastCells(pieces, radius) {
    const cells = [];
    pieces.forEach((piece) => {
      for (let row = piece.row - radius; row <= piece.row + radius; row += 1) {
        for (
          let col = piece.col - radius;
          col <= piece.col + radius;
          col += 1
        ) {
          cells.push({ row, col });
        }
      }
    });
    return this.uniqueCells(cells);
  }

  uniqueCells(cells) {
    const unique = new Map();
    cells.forEach((cell) => {
      if (
        this.isInside(cell.row, cell.col) &&
        this.isPlayableCell(cell.row, cell.col)
      ) {
        unique.set(`${cell.row},${cell.col}`, cell);
      }
    });
    return Array.from(unique.values());
  }

  collectTypeCells(type, includeBombs) {
    const result = [];
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const piece = this.board[row][col];
        if (!piece) {
          continue;
        }
        if (
          piece.type === type ||
          (includeBombs && piece.special === SPECIALS.COLOR_BOMB)
        ) {
          result.push({ row, col });
        }
      }
    }
    return result;
  }

  isPowerSpecial(piece) {
    return (
      piece &&
      [
        SPECIALS.STRIPED_H,
        SPECIALS.STRIPED_V,
        SPECIALS.WRAPPED,
        SPECIALS.COLOR_BOMB,
      ].includes(piece.special)
    );
  }

  async runCascadeLoop() {
    while (true) {
      const matches = this.findMatches();
      if (!matches.length) {
        break;
      }
      this.chainMultiplier += 1;
      this.syncHud();
      await this.resolveMatches(matches, null);
    }
  }

  isColorMatchable(piece) {
    return Boolean(
      piece &&
      piece.special !== SPECIALS.COLOR_BOMB &&
      piece.special !== SPECIALS.INGREDIENT,
    );
  }

  findMatches() {
    const groups = [];

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      let streak = [{ row, col: 0 }];
      for (let col = 1; col <= BOARD_SIZE; col += 1) {
        const current = col < BOARD_SIZE ? this.board[row][col] : null;
        const prev = this.board[row][col - 1];
        const same =
          this.isColorMatchable(current) &&
          this.isColorMatchable(prev) &&
          current.type === prev.type;
        if (same) {
          streak.push({ row, col });
        } else {
          if (streak.length >= 3) {
            groups.push(streak);
          }
          streak = col < BOARD_SIZE ? [{ row, col }] : [];
        }
      }
    }

    for (let col = 0; col < BOARD_SIZE; col += 1) {
      let streak = [{ row: 0, col }];
      for (let row = 1; row <= BOARD_SIZE; row += 1) {
        const current = row < BOARD_SIZE ? this.board[row][col] : null;
        const prev = this.board[row - 1][col];
        const same =
          this.isColorMatchable(current) &&
          this.isColorMatchable(prev) &&
          current.type === prev.type;
        if (same) {
          streak.push({ row, col });
        } else {
          if (streak.length >= 3) {
            groups.push(streak);
          }
          streak = row < BOARD_SIZE ? [{ row, col }] : [];
        }
      }
    }

    return groups;
  }

  async resolveMatches(matchGroups, preferredPieces) {
    const clusters = this.mergeMatchGroups(matchGroups);
    const removals = new Map();
    const upgrades = [];

    for (const cluster of clusters) {
      cluster.cells.forEach((cell) =>
        removals.set(`${cell.row},${cell.col}`, cell),
      );
      const upgrade = this.chooseSpecial(cluster, preferredPieces);
      if (upgrade) {
        removals.delete(`${upgrade.row},${upgrade.col}`);
        upgrades.push(upgrade);
      }
    }

    upgrades.forEach((upgrade) => {
      const piece = this.board[upgrade.row][upgrade.col];
      piece.special = upgrade.special;
      if (upgrade.special === SPECIALS.COLOR_BOMB) {
        piece.type = "colorBomb";
      }
      piece.scale = 1.25;
    });

    await this.resolveEffects(Array.from(removals.values()));
  }

  mergeMatchGroups(groups) {
    const merged = [];
    const used = new Set();

    for (let i = 0; i < groups.length; i += 1) {
      if (used.has(i)) {
        continue;
      }

      const cells = new Map();
      const rows = new Map();
      const cols = new Map();
      const stack = [i];

      while (stack.length) {
        const idx = stack.pop();
        if (used.has(idx)) {
          continue;
        }
        used.add(idx);

        groups[idx].forEach((cell) => {
          const key = `${cell.row},${cell.col}`;
          cells.set(key, cell);
          rows.set(cell.row, (rows.get(cell.row) || 0) + 1);
          cols.set(cell.col, (cols.get(cell.col) || 0) + 1);
        });

        for (let j = i + 1; j < groups.length; j += 1) {
          if (used.has(j)) {
            continue;
          }
          const intersects = groups[j].some((cell) =>
            cells.has(`${cell.row},${cell.col}`),
          );
          if (intersects) {
            stack.push(j);
          }
        }
      }

      merged.push({ cells: Array.from(cells.values()), rows, cols });
    }

    return merged;
  }

  chooseSpecial(cluster, preferredPieces) {
    const clusterHasSpecial = cluster.cells.some((cell) =>
      Boolean(this.board[cell.row]?.[cell.col]?.special),
    );
    if (clusterHasSpecial) {
      return null;
    }

    const rowMax = Math.max(...cluster.rows.values());
    const colMax = Math.max(...cluster.cols.values());
    let special = null;

    if (rowMax >= 5 || colMax >= 5) {
      special = SPECIALS.COLOR_BOMB;
    } else if (
      cluster.cells.length >= 5 &&
      rowMax >= 3 &&
      colMax >= 3
    ) {
      special = SPECIALS.WRAPPED;
    } else if (rowMax === 4) {
      special = SPECIALS.STRIPED_H;
    } else if (colMax === 4) {
      special = SPECIALS.STRIPED_V;
    }

    if (!special) {
      return null;
    }

    let anchor = null;
    if (preferredPieces) {
      anchor = preferredPieces.find((piece) =>
        cluster.cells.some(
          (cell) => cell.row === piece.row && cell.col === piece.col,
        ),
      );
    }

    if (!anchor) {
      anchor = cluster.cells[Math.floor(cluster.cells.length / 2)];
    }

    return { row: anchor.row, col: anchor.col, special };
  }

  async resolveEffects(initialCells) {
    const pending = [...initialCells];
    const visited = new Set();
    const removals = new Map();

    while (pending.length) {
      const cell = pending.pop();
      const key = `${cell.row},${cell.col}`;
      if (visited.has(key) || !this.isInside(cell.row, cell.col)) {
        continue;
      }
      visited.add(key);

      const piece = this.board[cell.row][cell.col];
      if (!piece) {
        continue;
      }

      if (
        piece.special !== SPECIALS.INGREDIENT &&
        this.blockerGrid[cell.row]?.[cell.col] > 0
      ) {
        this.blockerGrid[cell.row][cell.col] -= 1;
        if (this.blockerGrid[cell.row][cell.col] === 0) {
          this.blockerRemaining = Math.max(0, this.blockerRemaining - 1);
        }
        this.spawnPopup("Crack!", cell, "#efe7ff");
        this.addScreenShake(4);
        this.syncHud();
        continue;
      }

      if (
        piece.special !== SPECIALS.INGREDIENT &&
        this.glassGrid[cell.row]?.[cell.col] > 0
      ) {
        this.glassGrid[cell.row][cell.col] = 0;
        this.glassRemaining = Math.max(0, this.glassRemaining - 1);
        this.spawnPopup("Shatter!", cell, "#dff8ff");
        this.addScreenShake(3);
        this.syncHud();
        continue;
      }

      if (piece.special === SPECIALS.INGREDIENT) {
        continue;
      }

      if (piece.special === SPECIALS.STRIPED_H) {
        this.spawnEffectLine("h", cell.row, "#d7f7ff");
        this.triggerScreenFlash(0.07, "rgba(215,247,255,1)");
        this.playTone(680, 0.06, "square", 0.04);
        this.playTone(170, 0.1, "sawtooth", 0.018);
      } else if (piece.special === SPECIALS.STRIPED_V) {
        this.spawnEffectLine("v", cell.col, "#d7f7ff");
        this.triggerScreenFlash(0.07, "rgba(215,247,255,1)");
        this.playTone(640, 0.06, "square", 0.04);
        this.playTone(170, 0.1, "sawtooth", 0.018);
      } else if (piece.special === SPECIALS.WRAPPED) {
        this.spawnEffectBurst(cell, "#ffd2a3");
        this.triggerScreenFlash(0.09, "rgba(255,210,163,1)");
        this.playTone(250, 0.12, "triangle", 0.045);
        this.playTone(95, 0.15, "sawtooth", 0.02);
      } else if (piece.special === SPECIALS.COLOR_BOMB) {
        this.spawnEffectBurst(cell, "#fff3a5");
        this.triggerScreenFlash(0.16, "rgba(255,243,165,1)");
        this.playTone(140, 0.18, "sawtooth", 0.04);
        this.playTone(840, 0.09, "triangle", 0.03);
      }

      removals.set(key, cell);

      if (piece.special === SPECIALS.STRIPED_H) {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
          pending.push({ row: cell.row, col });
        }
      } else if (piece.special === SPECIALS.STRIPED_V) {
        for (let row = 0; row < BOARD_SIZE; row += 1) {
          pending.push({ row, col: cell.col });
        }
      } else if (piece.special === SPECIALS.WRAPPED) {
        for (let row = cell.row - 1; row <= cell.row + 1; row += 1) {
          for (let col = cell.col - 1; col <= cell.col + 1; col += 1) {
            pending.push({ row, col });
          }
        }
      } else if (piece.special === SPECIALS.COLOR_BOMB) {
        this.collectTypeCells(this.pickDominantType(), false).forEach(
          (target) => pending.push(target),
        );
      }
    }

    const removedCells = Array.from(removals.values());
    this.breakAdjacentGlass(removedCells);
    this.collectRewards(removedCells);
    this.spawnParticles(removedCells);

    removedCells.forEach((cell) => {
      this.board[cell.row][cell.col] = null;
    });

    await this.wait(MATCH_CLEAR_MS);
    this.dropPieces();
    this.fillNewPieces();
    this.collectIngredientsAtBottom();
    this.ensureIngredientOnBoard();
    await this.wait(REFILL_SETTLE_MS);
  }

  breakAdjacentGlass(cells) {
    const cracked = new Map();
    cells.forEach((cell) => {
      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const row = cell.row + dr;
        const col = cell.col + dc;
        if (!this.isInside(row, col) || !this.glassGrid[row]?.[col]) {
          continue;
        }
        const key = `${row},${col}`;
        if (cracked.has(key)) {
          continue;
        }
        this.glassGrid[row][col] = 0;
        this.glassRemaining = Math.max(0, this.glassRemaining - 1);
        cracked.set(key, { row, col });
        this.spawnPopup("Crack!", { row, col }, "#dff8ff");
      }
    });
    if (cracked.size) {
      this.addScreenShake(4);
      this.syncHud();
    }
  }

  pickDominantType() {
    const counts = Object.fromEntries(CANDY_TYPES.map((type) => [type, 0]));
    this.allCells().forEach(({ row, col }) => {
      const piece = this.board[row][col];
      if (piece && CANDY_TYPES.includes(piece.type)) {
        counts[piece.type] += 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  collectRewards(cells) {
    const comboBonus = Math.max(0, cells.length - 3) * 45;
    const chainBonus = 1 + (this.chainMultiplier - 1) * 0.35;
    cells.forEach(({ row, col }) => {
      const piece = this.board[row][col];
      if (!piece) {
        return;
      }
      this.totalScore += Math.round((120 + comboBonus) * chainBonus);
      if (
        this.goalState[piece.type] !== undefined &&
        this.goalState[piece.type] > 0
      ) {
        this.goalState[piece.type] -= 1;
      }
      if (this.jellyGrid[row]?.[col] > 0) {
        this.jellyGrid[row][col] = 0;
        this.jellyRemaining = Math.max(0, this.jellyRemaining - 1);
      }
    });

    if (cells.length) {
      this.playTone(
        420 + cells.length * 16,
        0.12 + Math.min(0.18, cells.length * 0.01),
        "triangle",
        0.03,
      );
      const baseCharge =
        cells.length >= 6
          ? 18
          : cells.length === 5
            ? 12
            : cells.length === 4
              ? 8
              : 3;
      const chainCharge =
        this.chainMultiplier >= 2 ? (this.chainMultiplier - 1) * 5 : 0;
      this.addStormCharge(baseCharge + chainCharge);
    }
    if (cells.length >= 4) {
      this.spawnPopup(
        `Combo x${this.chainMultiplier}`,
        cells[Math.floor(cells.length / 2)],
        cells.length >= 7 ? "#fff29b" : "#ffffff",
      );
      this.addScreenShake(Math.min(14, 4 + cells.length));
    }
    if (cells.length >= 6) {
      this.setMessage(
        `Sweet storm. You crushed ${cells.length} candies at x${this.chainMultiplier}.`,
      );
    }

    this.syncHud();
  }

  spawnParticles(cells) {
    cells.forEach(({ row, col }) => {
      const piece = this.board[row][col];
      if (!piece) {
        return;
      }
      for (let i = 0; i < 12; i += 1) {
        this.particles.push({
          x: col * CELL_SIZE + CELL_SIZE / 2,
          y: row * CELL_SIZE + CELL_SIZE / 2,
          vx: (Math.random() - 0.5) * 220,
          vy: (Math.random() - 0.5) * 220,
          size: 3 + Math.random() * 7,
          life: 0.55 + Math.random() * 0.28,
          color: CANDY_COLORS[piece.type] || "#ffffff",
        });
      }
    });
  }

  spawnEffectLine(orientation, index, color) {
    const key = `${orientation}:${index}`;
    const existing = this.effectLines.find(
      (effect) => effect.key === key && effect.life > 0.08,
    );
    if (existing) {
      existing.life = Math.max(existing.life, 0.24);
      existing.color = color || existing.color;
      return;
    }
    this.effectLines.push({
      key,
      orientation,
      index,
      life: 0.24,
      maxLife: 0.24,
      color: color || "#d7f7ff",
    });
  }

  spawnEffectBurst(cell, color) {
    if (!cell) {
      return;
    }
    const key = `burst:${cell.row},${cell.col}`;
    const existing = this.effectBursts.find(
      (effect) => effect.key === key && effect.life > 0.1,
    );
    if (existing) {
      existing.life = Math.max(existing.life, 0.32);
      existing.color = color || existing.color;
      return;
    }
    this.effectBursts.push({
      key,
      x: cell.col * CELL_SIZE + CELL_SIZE / 2,
      y: cell.row * CELL_SIZE + CELL_SIZE / 2,
      life: 0.32,
      maxLife: 0.32,
      maxRadius: CELL_SIZE * 2.2,
      color: color || "#ffffff",
    });
  }

  triggerScreenFlash(strength, color) {
    this.screenFlash = Math.max(this.screenFlash, strength || 0.18);
    if (color) {
      this.screenFlashColor = color;
    }
  }

  addStormCharge(amount) {
    if (this.isGameOver) {
      return;
    }
    this.stormCharge = Math.min(STORM_THRESHOLD * 2, this.stormCharge + amount);
    while (this.stormCharge >= STORM_THRESHOLD) {
      this.stormCharge -= STORM_THRESHOLD;
      this.triggerSugarRush();
    }
    this.syncHud();
  }

  triggerSugarRush() {
    const center = this.allCells()[Math.floor(this.allCells().length / 2)] || {
      row: 3,
      col: 3,
    };
    this.spawnPopup("Sugar Rush!", center, "#fff3a5");
    this.setMessage(
      "Sugar Rush! The storm powers up a few candies for a harder-earned payoff.",
    );
    this.addScreenShake(14);
    const dominantType = this.pickDominantType();
    const targets = this.collectTypeCells(dominantType, false);
    if (!targets.length) {
      this.syncHud();
      return;
    }
    targets.slice(0, 4).forEach((cell, index) => {
      const piece = this.board[cell.row][cell.col];
      if (piece && !this.isPowerSpecial(piece)) {
        piece.special =
          index === 3
            ? SPECIALS.WRAPPED
            : index % 2 === 0
              ? SPECIALS.STRIPED_H
              : SPECIALS.STRIPED_V;
        piece.scale = 1.2;
      }
    });
    this.syncHud();
  }

  addScreenShake(amount) {
    this.screenShake = Math.min(20, this.screenShake + amount);
  }

  spawnPopup(text, cell, color = "#ffffff") {
    if (!cell) {
      return;
    }
    this.popupTexts.push({
      text,
      x: cell.col * CELL_SIZE + CELL_SIZE / 2,
      y: cell.row * CELL_SIZE + CELL_SIZE / 2,
      life: 1.05,
      color,
    });
  }

  dropPieces() {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const activeRows = [];
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        if (this.isPlayableCell(row, col)) {
          activeRows.push(row);
        }
      }

      const pieces = [];
      activeRows.forEach((row) => {
        const piece = this.board[row][col];
        if (piece) {
          pieces.push(piece);
        }
        this.board[row][col] = null;
      });

      let index = pieces.length - 1;
      for (let i = activeRows.length - 1; i >= 0; i -= 1) {
        const targetRow = activeRows[i];
        if (index < 0) {
          break;
        }
        const piece = pieces[index];
        this.board[targetRow][col] = piece;
        piece.row = targetRow;
        piece.col = col;
        index -= 1;
      }
    }
  }

  fillNewPieces() {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        if (!this.isPlayableCell(row, col) || this.board[row][col]) {
          continue;
        }
        const piece = this.createPiece(this.randomCandyType(), row, col);
        piece.drawRow = -1 - this.randomFloat() * 2 - (col % 2) * 0.3;
        this.board[row][col] = piece;
      }
    }
  }

  checkGameState() {
    if (
      this.totalScore >= this.levelTarget &&
      Object.values(this.goalState).every((value) => value <= 0) &&
      this.jellyRemaining <= 0 &&
      this.blockerRemaining <= 0 &&
      this.glassRemaining <= 0 &&
      this.ingredientRemaining <= 0
    ) {
      this.levelComplete = true;
      this.isGameOver = true;
      this.captureCarryover();
      this.showOverlay(
        "Eye Of The Storm",
        this.levelIndex + 1 >= 4 ? "Level Complete" : "Stage Clear",
        this.levelIndex + 1 >= 4
          ? "You cleared the board. The storm run keeps rolling with a fresh board and new pressure."
          : "You cleared the objectives and smashed through the opening squall.",
        "Next Level",
      );
      return;
    }

    if (this.movesLeft <= 0) {
      this.levelComplete = false;
      this.isGameOver = true;
      this.showOverlay(
        "Storm Faded",
        "Out of Moves",
        "Restart and build a stronger storm chain.",
        "Play Again",
      );
      return;
    }

    if (!this.findPossibleMove()) {
      this.shuffleBoard(true);
    }
  }

  showOverlay(kicker, title, text, buttonLabel) {
    this.overlayKicker.textContent = kicker;
    this.overlayTitle.textContent = title;
    this.overlayText.textContent = text;
    this.overlayButton.textContent = buttonLabel;
    this.overlay.classList.remove("hidden");
  }

  hideOverlay() {
    this.overlay.classList.add("hidden");
  }

  findPossibleMove() {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const piece = this.board[row][col];
        if (!piece || this.isLockedCell(row, col)) {
          continue;
        }

        for (const [dr, dc] of [
          [0, 1],
          [1, 0],
        ]) {
          const nextRow = row + dr;
          const nextCol = col + dc;
          if (!this.isInside(nextRow, nextCol)) {
            continue;
          }

          const target = this.board[nextRow][nextCol];
          if (!target || this.isLockedCell(nextRow, nextCol)) {
            continue;
          }
          if (this.isPowerSpecial(piece) || this.isPowerSpecial(target)) {
            this.hintCells = [
              { row, col },
              { row: nextRow, col: nextCol },
            ];
            return true;
          }

          this.swapPieces(piece, target);
          const works = this.findMatches().length > 0;
          this.swapPieces(piece, target);

          if (works) {
            this.hintCells = [
              { row, col },
              { row: nextRow, col: nextCol },
            ];
            return true;
          }
        }
      }
    }

    this.hintCells = [];
    return false;
  }

  shuffleBoard(showMessage) {
    const movableCells = this.allCells().filter(
      ({ row, col }) => !this.isLockedCell(row, col),
    );
    const basePieces = movableCells
      .map(({ row, col }) => this.board[row][col])
      .filter(Boolean);
    if (!movableCells.length || !basePieces.length) {
      return;
    }
    do {
      const pieces = [...basePieces];
      for (let i = pieces.length - 1; i > 0; i -= 1) {
        const j = Math.floor(this.randomFloat() * (i + 1));
        [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
      }

      for (let row = 0; row < BOARD_SIZE; row += 1) {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
          if (!this.isPlayableCell(row, col)) {
            this.board[row][col] = null;
            continue;
          }
          if (this.isLockedCell(row, col)) {
            continue;
          }
          const piece = pieces.shift();
          if (!piece) {
            continue;
          }
          piece.row = row;
          piece.col = col;
          this.board[row][col] = piece;
        }
      }
    } while (this.findMatches().length > 0 || !this.findPossibleMove());

    if (showMessage) {
      this.setMessage("Board shuffled. Fresh candy combos are ready.");
    }
  }

  swapPieces(a, b) {
    const row = a.row;
    const col = a.col;
    this.board[a.row][a.col] = b;
    this.board[b.row][b.col] = a;
    a.row = b.row;
    a.col = b.col;
    b.row = row;
    b.col = col;
  }

  allCells() {
    const cells = [];
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        if (this.isPlayableCell(row, col)) {
          cells.push({ row, col });
        }
      }
    }
    return cells;
  }

  tick(timestamp) {
    const delta = Math.min(
      0.033,
      (timestamp - this.lastTimestamp) / 1000 || 0.016,
    );
    this.lastTimestamp = timestamp;
    this.update(delta);
    this.draw();
    requestAnimationFrame((next) => this.tick(next));
  }

  update(delta) {
    this.hintTimer += delta;
    if (this.messageTimer > 0) {
      this.messageTimer -= delta;
    } else if (!this.isGameOver) {
      this.messageLine.textContent =
        this.hintTimer > 8 && this.hintCells.length
          ? "Hint: the glowing candies can kick off a storm combo."
          : "Match 4 or 5 to create special candy powers.";
    }

    this.board
      .flat()
      .filter(Boolean)
      .forEach((piece) => {
        piece.drawRow += (piece.row - piece.drawRow) * Math.min(1, delta * 22);
        piece.drawCol += (piece.col - piece.drawCol) * Math.min(1, delta * 22);
        piece.scale += (1 - piece.scale) * Math.min(1, delta * 16);
        piece.pulse += delta * 2;
        if (Math.abs(piece.row - piece.drawRow) < 0.002) {
          piece.drawRow = piece.row;
        }
        if (Math.abs(piece.col - piece.drawCol) < 0.002) {
          piece.drawCol = piece.col;
        }
        if (Math.abs(1 - piece.scale) < 0.003) {
          piece.scale = 1;
        }
      });

    this.particles = this.particles.filter((particle) => particle.life > 0);
    this.particles.forEach((particle) => {
      particle.life -= delta;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += 170 * delta;
    });

    this.effectLines = this.effectLines.filter((effect) => effect.life > 0);
    this.effectLines.forEach((effect) => {
      effect.life -= delta;
    });

    this.effectBursts = this.effectBursts.filter((effect) => effect.life > 0);
    this.effectBursts.forEach((effect) => {
      effect.life -= delta;
    });

    if (this.screenFlash > 0) {
      this.screenFlash = Math.max(0, this.screenFlash - delta * 2.6);
    }

    this.popupTexts = this.popupTexts.filter((popup) => popup.life > 0);
    this.popupTexts.forEach((popup) => {
      popup.life -= delta;
      popup.y -= 34 * delta;
    });

    if (this.screenShake > 0.05) {
      this.screenShake *= Math.max(0, 1 - delta * 7.5);
    } else {
      this.screenShake = 0;
    }

    if (this.hintTimer > 8 && !this.hintCells.length) {
      this.findPossibleMove();
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, BOARD_PIXELS, BOARD_PIXELS);
    ctx.save();
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }
    this.drawBoardBackground(ctx);
    this.drawGrid(ctx);
    this.board
      .flat()
      .filter(Boolean)
      .forEach((piece) => this.drawPiece(ctx, piece));
    this.drawCellOverlays(ctx);
    this.drawInteractionOverlays(ctx);
    this.drawSpecialEffects(ctx);
    this.drawParticles(ctx);
    ctx.restore();
    this.drawScreenFlash(ctx);
    this.drawPopups(ctx);
  }

  drawBoardBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, BOARD_PIXELS);
    gradient.addColorStop(0, "#071225");
    gradient.addColorStop(0.55, "#0b1d39");
    gradient.addColorStop(1, "#040c18");
    ctx.fillStyle = gradient;
    this.roundRect(ctx, 0, 0, BOARD_PIXELS, BOARD_PIXELS, 24);
    ctx.fill();

    const highlight = ctx.createRadialGradient(
      BOARD_PIXELS * 0.24,
      BOARD_PIXELS * 0.18,
      BOARD_PIXELS * 0.04,
      BOARD_PIXELS * 0.24,
      BOARD_PIXELS * 0.18,
      BOARD_PIXELS * 0.62,
    );
    highlight.addColorStop(0, "rgba(118, 208, 255, 0.12)");
    highlight.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = highlight;
    this.roundRect(ctx, 0, 0, BOARD_PIXELS, BOARD_PIXELS, 24);
    ctx.fill();
  }

  drawGrid(ctx) {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const x = col * CELL_SIZE + 5;
        const y = row * CELL_SIZE + 5;
        if (!this.isPlayableCell(row, col)) {
          ctx.fillStyle = "rgba(1, 6, 15, 0.7)";
          this.roundRect(ctx, x + 4, y + 4, CELL_SIZE - 18, CELL_SIZE - 18, 16);
          ctx.fill();
          continue;
        }
        ctx.fillStyle =
          (row + col) % 2 === 0
            ? "rgba(255,255,255,0.08)"
            : "rgba(110,160,255,0.05)";
        this.roundRect(ctx, x, y, CELL_SIZE - 10, CELL_SIZE - 10, 18);
        ctx.fill();
        ctx.strokeStyle = "rgba(148, 207, 255, 0.1)";
        ctx.lineWidth = 1.2;
        this.roundRect(ctx, x, y, CELL_SIZE - 10, CELL_SIZE - 10, 18);
        ctx.stroke();
      }
    }
  }

  drawCellOverlays(ctx) {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        if (!this.isPlayableCell(row, col)) {
          continue;
        }

        if (this.jellyGrid[row]?.[col] > 0) {
          const jellyImage = this.pieceImages.jelly;
          if (jellyImage?.complete && jellyImage.naturalWidth) {
            ctx.save();
            ctx.globalAlpha = 0.62;
            this.drawCellImage(ctx, jellyImage, row, col, 0.96);
            ctx.restore();
          } else {
            const x = col * CELL_SIZE + 7;
            const y = row * CELL_SIZE + 7;
            const jellyGradient = ctx.createLinearGradient(
              x,
              y,
              x + CELL_SIZE,
              y + CELL_SIZE,
            );
            jellyGradient.addColorStop(0, "rgba(214, 248, 255, 0.6)");
            jellyGradient.addColorStop(1, "rgba(110, 201, 255, 0.28)");
            ctx.fillStyle = jellyGradient;
            this.roundRect(ctx, x, y, CELL_SIZE - 14, CELL_SIZE - 14, 18);
            ctx.fill();
          }
        }

        if (this.blockerGrid[row]?.[col] > 0) {
          const crateImage = this.pieceImages.crate;
          if (crateImage?.complete && crateImage.naturalWidth) {
            ctx.save();
            ctx.globalAlpha = this.blockerGrid[row][col] > 1 ? 0.98 : 0.82;
            this.drawCellImage(ctx, crateImage, row, col, 0.98);
            ctx.restore();
          }
          ctx.save();
          ctx.strokeStyle =
            this.blockerGrid[row][col] > 1
              ? "rgba(84, 47, 23, 0.58)"
              : "rgba(255,255,255,0.52)";
          ctx.lineWidth = this.blockerGrid[row][col] > 1 ? 4 : 2.5;
          const startX = col * CELL_SIZE + 18;
          const startY = row * CELL_SIZE + 18;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + 28, startY + 22);
          if (this.blockerGrid[row][col] === 1) {
            ctx.moveTo(startX + 32, startY + 4);
            ctx.lineTo(startX + 10, startY + 34);
          }
          ctx.stroke();
          ctx.restore();
        }

        if (this.glassGrid[row]?.[col] > 0) {
          this.drawGlassOverlay(ctx, row, col);
        }
      }
    }
  }

  drawInteractionOverlays(ctx) {
    if (this.selected && this.board[this.selected.row]?.[this.selected.col]) {
      ctx.strokeStyle = "#fff7d8";
      ctx.lineWidth = 4;
      this.roundRect(
        ctx,
        this.selected.col * CELL_SIZE + 6,
        this.selected.row * CELL_SIZE + 6,
        CELL_SIZE - 12,
        CELL_SIZE - 12,
        18,
      );
      ctx.stroke();
    }

    if (this.hintTimer > 8) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,245,157,0.85)";
      ctx.lineWidth = 4;
      this.hintCells.forEach((cell, index) => {
        ctx.globalAlpha =
          0.55 + Math.sin(performance.now() / 180 + index) * 0.25;
        this.roundRect(
          ctx,
          cell.col * CELL_SIZE + 8,
          cell.row * CELL_SIZE + 8,
          CELL_SIZE - 16,
          CELL_SIZE - 16,
          16,
        );
        ctx.stroke();
      });
      ctx.restore();
    }
  }

  drawCellImage(ctx, image, row, col, scale = 1) {
    const size = (CELL_SIZE - 10) * scale;
    const x = col * CELL_SIZE + CELL_SIZE / 2 - size / 2;
    const y = row * CELL_SIZE + CELL_SIZE / 2 - size / 2;
    ctx.drawImage(image, x, y, size, size);
  }

  drawGlassOverlay(ctx, row, col) {
    const x = col * CELL_SIZE + 7;
    const y = row * CELL_SIZE + 7;
    const w = CELL_SIZE - 14;
    const h = CELL_SIZE - 14;
    const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
    gradient.addColorStop(0, "rgba(233, 248, 255, 0.34)");
    gradient.addColorStop(1, "rgba(155, 220, 255, 0.16)");
    ctx.fillStyle = gradient;
    this.roundRect(ctx, x, y, w, h, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(220, 245, 255, 0.6)";
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, x, y, w, h, 18);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.25, y + h * 0.12);
    ctx.lineTo(x + w * 0.53, y + h * 0.42);
    ctx.lineTo(x + w * 0.78, y + h * 0.24);
    ctx.moveTo(x + w * 0.46, y + h * 0.44);
    ctx.lineTo(x + w * 0.36, y + h * 0.76);
    ctx.moveTo(x + w * 0.52, y + h * 0.42);
    ctx.lineTo(x + w * 0.72, y + h * 0.74);
    ctx.stroke();
  }

  drawPiece(ctx, piece) {
    const x = piece.drawCol * CELL_SIZE + CELL_SIZE / 2;
    const y = piece.drawRow * CELL_SIZE + CELL_SIZE / 2;
    const radiusMultiplier =
      piece.special === SPECIALS.COLOR_BOMB ||
      piece.special === SPECIALS.INGREDIENT
        ? 1.18
        : 1;
    const radius = 25 * piece.scale * radiusMultiplier;
    const color =
      piece.special === SPECIALS.COLOR_BOMB
        ? "#2b2b36"
        : CANDY_COLORS[piece.type];

    ctx.save();
    ctx.translate(x, y);

    if (piece.special) {
      const glowColor =
        piece.special === SPECIALS.COLOR_BOMB
          ? "#fff0a8"
          : piece.special === SPECIALS.INGREDIENT
            ? "#ffd27a"
            : CANDY_COLORS[piece.type] || "#ffffff";
      ctx.save();
      ctx.shadowBlur =
        piece.special === SPECIALS.COLOR_BOMB ||
        piece.special === SPECIALS.INGREDIENT
          ? 34
          : 20;
      ctx.shadowColor = this.toRgba(glowColor, 0.8);
      ctx.globalAlpha =
        piece.special === SPECIALS.COLOR_BOMB ||
        piece.special === SPECIALS.INGREDIENT
          ? 0.85
          : 0.45;
      ctx.fillStyle = this.toRgba(glowColor, 0.55);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const baseImage = this.getBasePieceImage(piece);
    const overlayImage = this.getOverlayPieceImage(piece);
    const sparkleImage = this.pieceImages.sparkle;

    if (baseImage) {
      this.drawPieceImage(ctx, baseImage, radius);
    } else if (piece.special === SPECIALS.INGREDIENT) {
      this.drawIngredient(ctx, radius);
    } else if (piece.special === SPECIALS.COLOR_BOMB) {
      this.drawColorBomb(ctx, radius);
    } else {
      this.drawCandyShape(ctx, piece.type, color, radius);
    }

    const usesDedicatedSpecialArt = Boolean(
      piece.special && SPECIAL_IMAGE_PATHS[piece.type]?.[piece.special],
    );

    if (overlayImage) {
      this.drawPieceImage(ctx, overlayImage, radius);
    } else if (
      !usesDedicatedSpecialArt &&
      (piece.special === SPECIALS.STRIPED_H ||
        piece.special === SPECIALS.STRIPED_V)
    ) {
      this.drawStripedOverlay(
        ctx,
        radius,
        piece.special === SPECIALS.STRIPED_H,
      );
    } else if (!usesDedicatedSpecialArt && piece.special === SPECIALS.WRAPPED) {
      this.drawWrappedOverlay(ctx, radius);
    }

    if (
      sparkleImage &&
      piece.special &&
      piece.special !== SPECIALS.COLOR_BOMB &&
      piece.special !== SPECIALS.INGREDIENT
    ) {
      ctx.save();
      ctx.globalAlpha = 0.38;
      this.drawPieceImage(ctx, sparkleImage, radius * 1.02);
      ctx.restore();
    }

    ctx.restore();
  }

  getBasePieceImage(piece) {
    if (piece.special === SPECIALS.COLOR_BOMB) {
      return this.pieceImages.colorBomb || null;
    }

    if (piece.special === SPECIALS.INGREDIENT) {
      return this.pieceImages.ingredient || null;
    }

    if (piece.special && SPECIAL_IMAGE_PATHS[piece.type]?.[piece.special]) {
      return (
        this.pieceImages[`${piece.type}-${piece.special}`] ||
        this.pieceImages[piece.type] ||
        null
      );
    }

    return this.pieceImages[piece.type] || null;
  }

  getOverlayPieceImage(piece) {
    if (SPECIAL_IMAGE_PATHS[piece.type]?.[piece.special]) {
      return null;
    }

    // if (piece.special === SPECIALS.STRIPED_H) {
    //   return this.pieceImages.stripedH || null;
    // }

    // if (piece.special === SPECIALS.STRIPED_V) {
    //   return this.pieceImages.stripedV || null;
    // }

    if (piece.special === SPECIALS.WRAPPED) {
      return this.pieceImages.wrapped || null;
    }

    return null;
  }

  drawPieceImage(ctx, image, radius) {
    if (!image?.complete || !image.naturalWidth || !image.naturalHeight) {
      return;
    }

    const aspectRatio = image.naturalWidth / image.naturalHeight;
    const maxSize = radius * 2.45;
    let drawWidth = maxSize;
    let drawHeight = maxSize;

    if (aspectRatio > 1) {
      drawHeight = drawWidth / aspectRatio;
    } else {
      drawWidth = drawHeight * aspectRatio;
    }

    ctx.drawImage(
      image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
    );
  }

  drawCandyShape(ctx, type, color, radius) {
    const gradient = ctx.createRadialGradient(
      -radius * 0.35,
      -radius * 0.45,
      radius * 0.2,
      0,
      0,
      radius * 1.1,
    );
    gradient.addColorStop(0, "#fff7ef");
    gradient.addColorStop(0.2, color);
    gradient.addColorStop(1, this.shade(color, -20));
    ctx.fillStyle = gradient;
    ctx.strokeStyle = this.shade(color, -34);
    ctx.lineWidth = 1.6;
    ctx.lineJoin = "round";

    if (type === "strawberry") {
      ctx.beginPath();
      ctx.moveTo(0, -radius);
      ctx.bezierCurveTo(
        radius,
        -radius * 0.8,
        radius * 0.95,
        radius * 0.5,
        0,
        radius * 1.05,
      );
      ctx.bezierCurveTo(
        -radius * 0.95,
        radius * 0.5,
        -radius,
        -radius * 0.8,
        0,
        -radius,
      );
      ctx.fill();
      ctx.stroke();
    } else if (type === "blueberry") {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === "lemon") {
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.08, radius * 0.82, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === "mint") {
      ctx.beginPath();
      ctx.moveTo(0, -radius);
      ctx.lineTo(radius * 0.95, 0);
      ctx.lineTo(0, radius);
      ctx.lineTo(-radius * 0.95, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (type === "grape") {
      for (const [dx, dy, r] of [
        [-10, -8, 11],
        [10, -8, 11],
        [0, 6, 12],
        [-12, 12, 10],
        [12, 12, 10],
      ]) {
        ctx.beginPath();
        ctx.arc(dx, dy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.roundRect(-radius, -radius * 0.8, radius * 2, radius * 1.6, 16);
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.beginPath();
    ctx.ellipse(
      -radius * 0.24,
      -radius * 0.4,
      radius * 0.26,
      radius * 0.12,
      -0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.ellipse(
      radius * 0.1,
      radius * 0.18,
      radius * 0.36,
      radius * 0.18,
      0.25,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  drawStripedOverlay(ctx, radius, horizontal) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 5;
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      if (horizontal) {
        ctx.moveTo(-radius * 0.9, i * 7);
        ctx.lineTo(radius * 0.9, i * 7);
      } else {
        ctx.moveTo(i * 7, -radius * 0.9);
        ctx.lineTo(i * 7, radius * 0.9);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawWrappedOverlay(ctx, radius) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,244,186,0.95)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-radius * 0.75, -radius * 0.25);
    ctx.lineTo(radius * 0.75, radius * 0.25);
    ctx.moveTo(radius * 0.75, -radius * 0.25);
    ctx.lineTo(-radius * 0.75, radius * 0.25);
    ctx.stroke();
    ctx.restore();
  }

  drawColorBomb(ctx, radius) {
    ctx.fillStyle = "#252535";
    ctx.strokeStyle = "rgba(255,255,255,0.24)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const dots = [
      "#ff5d8f",
      "#ffd33d",
      "#4fb3ff",
      "#53d98d",
      "#ff9c3d",
      "#8f6fff",
    ];
    dots.forEach((dot, index) => {
      const angle = (Math.PI * 2 * index) / dots.length;
      ctx.fillStyle = dot;
      ctx.beginPath();
      ctx.arc(
        Math.cos(angle) * radius * 0.55,
        Math.sin(angle) * radius * 0.55,
        radius * 0.2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-radius * 0.28, -radius * 0.35, radius * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }

  drawIngredient(ctx, radius) {
    ctx.fillStyle = "#ffb347";
    ctx.strokeStyle = "#e38c38";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff1b3";
    ctx.beginPath();
    ctx.arc(-radius * 0.18, -radius * 0.22, radius * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6ba34e";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.78);
    ctx.quadraticCurveTo(
      radius * 0.18,
      -radius * 1.08,
      radius * 0.38,
      -radius * 0.92,
    );
    ctx.stroke();
  }

  drawSpecialEffects(ctx) {
    this.effectLines.forEach((effect) => {
      const alpha = Math.max(0, effect.life / effect.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 10 + (1 - alpha) * 10;
      ctx.lineCap = "round";
      ctx.shadowBlur = 26;
      ctx.shadowColor = effect.color;
      ctx.strokeStyle = effect.color;
      ctx.beginPath();
      if (effect.orientation === "h") {
        const y = effect.index * CELL_SIZE + CELL_SIZE / 2;
        ctx.moveTo(14, y);
        ctx.lineTo(BOARD_PIXELS - 14, y);
      } else {
        const x = effect.index * CELL_SIZE + CELL_SIZE / 2;
        ctx.moveTo(x, 14);
        ctx.lineTo(x, BOARD_PIXELS - 14);
      }
      ctx.stroke();
      ctx.restore();
    });

    this.effectBursts.forEach((effect) => {
      const alpha = Math.max(0, effect.life / effect.maxLife);
      const t = 1 - alpha;
      const radius = effect.maxRadius * t;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 30;
      ctx.shadowColor = effect.color;
      const gradient = ctx.createRadialGradient(
        effect.x,
        effect.y,
        0,
        effect.x,
        effect.y,
        radius,
      );
      gradient.addColorStop(0, "rgba(255,255,255,0.0)");
      gradient.addColorStop(0.25, this.toRgba(effect.color, 0.55 * alpha));
      gradient.addColorStop(1, "rgba(255,255,255,0.0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawScreenFlash(ctx) {
    if (this.screenFlash <= 0) {
      return;
    }
    ctx.save();
    ctx.globalAlpha = Math.min(0.65, this.screenFlash * 3.2);
    ctx.fillStyle = this.screenFlashColor;
    ctx.fillRect(0, 0, BOARD_PIXELS, BOARD_PIXELS);
    ctx.restore();
  }

  toRgba(color, alpha) {
    if (!color || typeof color !== "string") {
      return `rgba(255,255,255,${alpha})`;
    }
    if (color.startsWith("rgba(") || color.startsWith("rgb(")) {
      return color;
    }
    if (color.startsWith("#") && color.length === 7) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    return `rgba(255,255,255,${alpha})`;
  }

  drawParticles(ctx) {
    this.particles.forEach((particle) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, particle.life);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawPopups(ctx) {
    this.popupTexts.forEach((popup) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, popup.life);
      ctx.fillStyle = popup.color;
      ctx.strokeStyle = "rgba(72, 39, 84, 0.55)";
      ctx.lineWidth = 6;
      ctx.font = '700 22px "Baloo 2", sans-serif';
      ctx.textAlign = "center";
      ctx.strokeText(popup.text, popup.x, popup.y);
      ctx.fillText(popup.text, popup.x, popup.y);
      ctx.restore();
    });
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  shade(color, amount) {
    const value = color.replace("#", "");
    const num = parseInt(value, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (num & 255) + amount));
    return `rgb(${r}, ${g}, ${b})`;
  }

  capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new SugarStormGame();
});
