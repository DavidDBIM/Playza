// ── Game State ────────────────────────────────────────────────────────────────
const gameState = {
  started: false,
  paused: false,
  health: 100,
  maxHealth: 100,
  armor: 100,
  maxArmor: 100,
  kills: 0,
  deaths: 0,
  headshots: 0,
  ctScore: 0,
  tScore: 0,
  roundTime: 180,        // seconds per round
  roundNumber: 1,
  lastDamageTime: 0,
  regenDelay: 5000,      // ms after damage before regen starts
  regenRate: 2,
  regenInterval: 300,
  stamina: 100,
  maxStamina: 100,
  staminaDrain: 2,
  staminaRegen: 1,
  isCrouched: false,
  isADS: false,
};

// ── Weapon Data ───────────────────────────────────────────────────────────────
const WEAPONS = {
  ak47: {
    name: "AK-47", slot: 1, icon: "🔫",
    damage: 27, headshotMult: 4,
    fireRate: 100, magSize: 30, reserveAmmo: 90,
    reloadTime: 2500, spread: 0.022, automatic: true,
    adsSpread: 0.008, crouchSpread: 0.010,
    recoilX: 0.0002, recoilY: 0.006,
  },
  m4a4: {
    name: "M4A4", slot: 2, icon: "🔫",
    damage: 23, headshotMult: 4,
    fireRate: 90, magSize: 30, reserveAmmo: 90,
    reloadTime: 3000, spread: 0.018, automatic: true,
    adsSpread: 0.006, crouchSpread: 0.008,
    recoilX: 0.0001, recoilY: 0.004,
  },
  awp: {
    name: "AWP", slot: 3, icon: "🎯",
    damage: 115, headshotMult: 2,
    fireRate: 1500, magSize: 5, reserveAmmo: 30,
    reloadTime: 3700, spread: 0.001, automatic: false,
    adsSpread: 0.0001, crouchSpread: 0.0005,
    recoilX: 0, recoilY: 0.012, scopeFOV: 20,
  },
  glock: {
    name: "Glock-18", slot: 4, icon: "🔫",
    damage: 18, headshotMult: 3.5,
    fireRate: 150, magSize: 20, reserveAmmo: 120,
    reloadTime: 2200, spread: 0.028, automatic: false,
    adsSpread: 0.014, crouchSpread: 0.018,
    recoilX: 0.0001, recoilY: 0.003,
  },
  knife: {
    name: "Knife", slot: 5, icon: "🔪",
    damage: 55, headshotMult: 1.5,
    fireRate: 600, magSize: 1, reserveAmmo: 0,
    reloadTime: 0, spread: 0, automatic: false,
    adsSpread: 0, crouchSpread: 0,
    isKnife: true, range: 4,
  },
};

// ── Grenade Data ──────────────────────────────────────────────────────────────
const GRENADES = {
  frag:  { name: "Frag",      icon: "💣", count: 2, fuseTime: 3000, radius: 8,  damage: 80 },
  smoke: { name: "Smoke",     icon: "💨", count: 1, fuseTime: 2000, radius: 5, duration: 10000 },
  flash: { name: "Flashbang", icon: "💥", count: 2, fuseTime: 1500, radius: 12, duration: 2000 },
};

// ── Physics Constants ─────────────────────────────────────────────────────────
const PLAYER_HEIGHT  = 3.6;
const PLAYER_CROUCH  = 2.2;
const PLAYER_RADIUS  = 1.0;
const WALK_SPEED     = 0.14;
const RUN_SPEED      = 0.24;
const CROUCH_SPEED   = 0.08;
const JUMP_FORCE     = 0.38;
const GRAVITY        = 0.016;
const MOUSE_SENS     = 0.002;

// ── Map Dimensions ────────────────────────────────────────────────────────────
const MAP_SIZE = 400;   // expanded from 300
