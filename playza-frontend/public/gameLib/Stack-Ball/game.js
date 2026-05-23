// Stack Ball 3D - Playza Arena Edition
const THREE = window.THREE;

// ── DOM ──
const shell          = document.getElementById('shell');
const firstUI        = document.getElementById('firstUI');
const inGameUI       = document.getElementById('inGameUI');
const finishUI       = document.getElementById('finishUI');
const gameOverUI     = document.getElementById('gameOverUI');
const scoreText      = document.getElementById('scoreText');
const currentLevelText = document.querySelectorAll('.current-level-text');
const nextLevelText    = document.querySelectorAll('.next-level-text');
const finishLevelText  = document.getElementById('finishLevelText');
const gameOverScoreText = document.getElementById('gameOverScoreText');
const gameOverLevelBonusText = document.getElementById('gameOverLevelBonusText');
const gameOverTimeBonusText = document.getElementById('gameOverTimeBonusText');
const gameOverArenaScoreText = document.getElementById('gameOverArenaScoreText');
const gameOverMsg       = document.getElementById('gameOverMsg');
const progressFill      = document.getElementById('progressFill');
const overpowerWrap     = document.getElementById('overpowerWrap');
const overpowerFill     = document.getElementById('overpowerFill');
const tapStart          = document.getElementById('tapStart');
const settingsButton    = document.getElementById('settingsButton');
const settingsPanel     = document.getElementById('settingsPanel');
const soundButton       = document.getElementById('soundButton');
const timerDisplay      = document.getElementById('timerDisplay');
const rivalBanner       = document.getElementById('rivalBanner');
const rivalName         = document.getElementById('rivalName');
const rivalScoreEl      = document.getElementById('rivalScore');

// ── ARENA STATE ──
let arenaLocked   = false;  // true = live arena session
let sessionId     = null;
let rivalData     = null;   // { username, score }

const STORAGE_SOUND  = 'stack_ball_clone_sound';

const STATE = {
  PREPARE: "Prepare",
  PLAY: "Play",
  DEAD: "Dead",
  FINISH: "Finish",
};

const PLATFORM_FAMILIES = [
  {
    name: "circle",
    sectors: 12,
    shape: "circle",
    layouts: [
      // Easy: 2 bad out of 12
      Array(12).fill("good").fill("bad", 4, 6),
      // Medium: 3 bad, spread
      Array(12).fill("good").fill("bad", 3, 5).fill("bad", 9, 10),
      // Hard: 4 bad, spread
      Array(12).fill("good").fill("bad", 2, 4).fill("bad", 8, 10),
      // Very Hard: 5 bad
      Array(12).fill("good").fill("bad", 1, 4).fill("bad", 7, 9),
    ],
  },
  {
    name: "flower",
    sectors: 12,
    shape: "flower",
    layouts: [
      Array(12).fill("good").fill("bad", 5, 7),
      Array(12).fill("good").fill("bad", 2, 4).fill("bad", 8, 9),
      Array(12).fill("good").fill("bad", 2, 5).fill("bad", 8, 10),
      Array(12).fill("good").fill("bad", 1, 4).fill("bad", 7, 10),
    ],
  }
];

const COLORS = [
  0xff4d7d, 0x21c7ff, 0x47d16a, 0xffb82e, 0x9b5cff, 0xff6847, 0x2dd4bf,
];

const BAD_COLOR = 0x15151c;
const POLE_COLOR = 0xffffff;
const PLANE_COLOR = 0x1a2130;
const FIRE_COLOR = 0xffaa00;
const BALL_COLOR = 0xffffff; // Distinct ball color
const BALL_RADIUS = 0.22;
const PLATFORM_HEIGHT = 0.30;
const PLATFORM_SPACING = 0.48; // Height + visible gap between stacks
const OUTER_RADIUS = 1.4;
const INNER_RADIUS = 1.0; // Thick inner hole = thin ring width (0.4 units wide)
const BALL_Z = -1.2; // Ball fixed at front
const START_Y = 2.0;
const GRAVITY = 25;
const CLICK_VELOCITY = -9.0; // Slower drop so a quick tap doesn't break 2+ stacks
const BOUNCE_VELOCITY = 5.5;
const SPEED_LIMIT = 6;
const TOWER_SPEED_DEG = 120; // Slightly faster rotation so it's visibly rotating while breaking
const ROTATION_SPEED = 10;
const OVERPOWER_GAIN = 0.8;
const OVERPOWER_DRAIN = 0.5;
const OVERPOWER_ACTIVE_DRAIN = 0.3;

let renderer;
let scene;
let camera;
let towerGroup;
let debrisGroup;
let splashGroup;
let pole;
let ball;
let ballGlow;
let fireEffect;
let winParticles;
let clock;
let audioCtx;

let playerState = STATE.PREPARE;
let isClicked = false;
let isOverPowered = false;
let overpowerBuildUp = 0;
let level = 1;              // Always start at level 1 in arena
let score = 0;
let currentBrokenPlatforms = 0;
let totalPlatforms = 0;
let platformAddition = 7;
let selectedFamily = PLATFORM_FAMILIES[0];
let activeColor = COLORS[0];
let ballY = START_Y;
let ballVelocityY = 0;
let platforms = [];
let finishPlatform = null;
let shards = [];
let splashes = [];
let particles = [];
let cameraBaseY = 3.2;
let settingsOpen = false;
let soundEnabled = localStorage.getItem(STORAGE_SOUND) !== 'off';

// ── No readInt/saveInt for level or best — arena always resets ──
function saveSound(val) { localStorage.setItem(STORAGE_SOUND, val ? 'on' : 'off'); }

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x0f172a, 1);
  shell.prepend(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);
  scene.fog = new THREE.Fog(0x0f172a, 8, 30);

  camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);
  camera.position.set(0, 3.2, -7.0);

  // Minimal ambient light — no directional light so platform colors are pure
  const ambient = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambient);

  // One very soft, low-angle fill light so the pole has subtle depth
  const fill = new THREE.DirectionalLight(0xffffff, 0.15);
  fill.position.set(0, 5, -10);
  scene.add(fill);

  towerGroup = new THREE.Group();
  debrisGroup = new THREE.Group();
  splashGroup = new THREE.Group();
  scene.add(towerGroup, debrisGroup, splashGroup);

  // Pole: wider, stays static in scene (does NOT rotate with tower)
  pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 600, 32),
    new THREE.MeshStandardMaterial({
      color: POLE_COLOR,
      roughness: 0.05,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveIntensity: 0.08,
    }),
  );
  pole.position.set(0, -250, 0);
  scene.add(pole);

  ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_RADIUS, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xff6a00,    // Vivid orange — pops against dark bg and colored stacks
      roughness: 0.15,
      metalness: 0.05,
      emissive: 0xff3300,
      emissiveIntensity: 0.35,
    }),
  );
  ball.castShadow = false;
  scene.add(ball);

  ballGlow = new THREE.PointLight(activeColor, 1.6, 5);
  scene.add(ballGlow);

  fireEffect = createFireEffect();
  fireEffect.visible = false;
  scene.add(fireEffect);

  winParticles = new THREE.Group();
  winParticles.visible = false;
  scene.add(winParticles);

  clock = new THREE.Clock();
  bindEvents();
  levelManagement();
  updateUI();
  resize();
  requestAnimationFrame(loop);
}

function bindEvents() {
  window.addEventListener("resize", resize);
  shell.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  window.addEventListener("blur", onPointerUp);
  settingsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    playButtonSound();
    settingsOpen = !settingsOpen;
    settingsPanel.classList.toggle("hidden", !settingsOpen);
  });
  soundButton.addEventListener("click", (event) => {
    event.stopPropagation();
    soundEnabled = !soundEnabled;
    localStorage.setItem(STORAGE_SOUND, soundEnabled ? "on" : "off");
    updateSoundButton();
    playButtonSound();
  });
}

function resize() {
  const width = shell.clientWidth || window.innerWidth;
  const height = shell.clientHeight || window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function levelManagement() {
  clearLevel();
  // Arena: level advances in-session but always starts at 1 on new entry
  if (level > 9) platformAddition = 0;
  else platformAddition = 7;

  // Each level gets a distinct color so stacks look fresh each round
  activeColor = COLORS[(level - 1) % COLORS.length];
  selectedFamily = PLATFORM_FAMILIES[Math.floor(Math.random() * PLATFORM_FAMILIES.length)];

  const platformCount = 50 + (level - 1) * 8; // Level 1 = 50, grows by 8 per level
  totalPlatforms = platformCount;
  currentBrokenPlatforms = 0;
  const startPlatformY = 0;
  
  let currentRot = 0;

  for (let index = 0; index < platformCount; index++) {
    const y = startPlatformY - index * PLATFORM_SPACING;
    const difficulty = pickDifficultyIndex();
    // All stacks same color — only black bad sectors break it up
    const platform = createPlatform(index, y, difficulty, activeColor);
    
    platform.group.rotation.y = y * THREE.MathUtils.degToRad(ROTATION_SPEED);
    if (Math.abs(y) >= level * 0.3 && Math.abs(y) <= level * 0.6) {
      platform.group.rotation.y += Math.PI;
    }

    towerGroup.add(platform.group);
    platforms.push(platform);
  }

  const finishY = startPlatformY - platformCount * PLATFORM_SPACING;
  finishPlatform = createFinishPlatform(finishY);
  towerGroup.add(finishPlatform.group);

  ballY = START_Y;
  ballVelocityY = 0;
  playerState = STATE.PREPARE;
  isClicked = false;
  isOverPowered = false;
  overpowerBuildUp = 0;
  if (fireEffect) fireEffect.visible = false;
  cameraBaseY = 3.2;

  // Update glow to match level color
  if (ballGlow) ballGlow.color.setHex(activeColor);
  document.documentElement.style.setProperty('--active', `#${activeColor.toString(16).padStart(6,'0')}`);
}

function clearLevel() {
  platforms.forEach((platform) => disposeObject(platform.group));
  if (finishPlatform) disposeObject(finishPlatform.group);
  shards.forEach((item) => disposeObject(item.mesh));
  splashes.forEach((item) => disposeObject(item.mesh));
  particles.forEach((item) => disposeObject(item.mesh));
  platforms = [];
  finishPlatform = null;
  shards = [];
  splashes = [];
  particles = [];
  towerGroup?.clear();
  debrisGroup?.clear();
  splashGroup?.clear();
  winParticles?.clear();
}

function disposeObject(object) {
  object.traverse((child) => {
    if (!child.isMesh) return;
    child.geometry?.dispose();
    if (Array.isArray(child.material))
      child.material.forEach((mat) => mat.dispose());
    else child.material?.dispose();
  });
  object.parent?.remove(object);
}

// Helper: darken a hex color by multiplying RGB components
function darkenColor(hex, factor) {
  const r = Math.floor(((hex >> 16) & 0xff) * factor);
  const g = Math.floor(((hex >> 8)  & 0xff) * factor);
  const b = Math.floor(( hex        & 0xff) * factor);
  return (r << 16) | (g << 8) | b;
}

function pickDifficultyIndex() {
  if (level <= 3)  return 0;
  if (level <= 6)  return 1;
  if (level <= 12) return 2;
  return 3;
}

function createPlatform(index, y, difficulty, overrideColor) {
  const group = new THREE.Group();
  group.position.y = y;
  group.userData.index = index;
  const layout = selectedFamily.layouts[Math.min(difficulty, selectedFamily.layouts.length - 1)];
  const sectors = [];
  const platColor = overrideColor !== undefined ? overrideColor : activeColor;

  // MeshBasicMaterial = pure flat color, ZERO lighting influence
  const materialGood = new THREE.MeshBasicMaterial({ color: platColor });
  const materialBad  = new THREE.MeshBasicMaterial({ color: BAD_COLOR });

  const count = selectedFamily.sectors;

  for (let i = 0; i < count; i++) {
    const type = layout[i] || "good";
    const angle = (Math.PI * 2) / count;
    // 1% gap between sectors for sharp, neat blocks
    const sectorAngle = angle * 0.99;
    const startAngle = i * angle + angle * 0.005;

    const mesh = createPlatformPart(
      selectedFamily.shape,
      count,
      i,
      type === "bad" ? materialBad : materialGood,
      sectorAngle,
      startAngle,
    );
    mesh.userData.type = type;
    mesh.userData.platformIndex = index;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    sectors.push({ index: i, type, mesh });
  }

  return {
    id: index,
    y,
    group,
    sectors,
    broken: false,
  };
}

function createPlatformPart(
  shape,
  count,
  index,
  material,
  sectorAngle,
  startAngle,
) {
  return createRingPart(shape, sectorAngle, startAngle, material);
}

function createRingPart(shape, angle, startAngle, material) {
  const isPolygon = shape === "hex" || shape === "square";
  const steps = isPolygon ? 1 : shape === "spikes" ? 8 : 18;
  const outerWave = shape === "flower" ? 0.25 : 0;
  const baseRadius =
    shape === "square" ? 1.45 : shape === "hex" ? 1.25 : OUTER_RADIUS;

  const shape2D = new THREE.Shape();
  shape2D.moveTo(
    Math.cos(startAngle) * INNER_RADIUS,
    Math.sin(startAngle) * INNER_RADIUS,
  );

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = startAngle + angle * t;
    let radius = baseRadius;
    if (shape === "spikes") radius += i % 2 === 0 ? 0.35 : -0.1;
    if (shape === "flower") radius += Math.sin(t * Math.PI) * outerWave;
    shape2D.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
  }

  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const a = startAngle + angle * t;
    shape2D.lineTo(Math.cos(a) * INNER_RADIUS, Math.sin(a) * INNER_RADIUS);
  }

  shape2D.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape2D, {
    depth: PLATFORM_HEIGHT,
    bevelEnabled: false,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -PLATFORM_HEIGHT * 0.5, 0);
  return new THREE.Mesh(geometry, material.clone());
}

// createBoxPart removed as it is now handled perfectly by createRingPart

function createFinishPlatform(y) {
  const group = new THREE.Group();
  group.position.y = y;

  // Tier 1: Outer dark metallic collar
  const outerMat = new THREE.MeshPhysicalMaterial({
    color: 0x0c1322,
    roughness: 0.15,
    metalness: 0.9,
    clearcoat: 1.0,
  });
  const outerCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.55, 0.15, 64),
    outerMat,
  );
  outerCollar.receiveShadow = true;
  outerCollar.castShadow = true;
  group.add(outerCollar);

  // Tier 2: Glowing Inner Victory Checkered Pad
  const padMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.08,
    metalness: 0.1,
    clearcoat: 1.0,
  });
  const innerPad = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 0.25, 64),
    padMat,
  );
  innerPad.position.y = 0.05;
  innerPad.receiveShadow = true;
  innerPad.castShadow = true;
  group.add(innerPad);

  // Concentric target rings (neon color)
  const neonMat = new THREE.MeshBasicMaterial({
    color: activeColor,
    transparent: true,
    opacity: 0.9,
  });

  // Ring 1
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(1.0, 0.035, 8, 64),
    neonMat,
  );
  ring1.position.y = 0.18;
  ring1.rotation.x = Math.PI / 2;
  group.add(ring1);

  // Ring 2
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.035, 8, 48),
    neonMat,
  );
  ring2.position.y = 0.18;
  ring2.rotation.x = Math.PI / 2;
  group.add(ring2);

  // Ring 3
  const ring3 = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.035, 8, 36),
    neonMat,
  );
  ring3.position.y = 0.18;
  ring3.rotation.x = Math.PI / 2;
  group.add(ring3);

  // Add glowing futuristic beacons around the victory pad
  const pillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.35, 16);
  const crystalGeo = new THREE.ConeGeometry(0.05, 0.1, 4);
  const beaconMat = new THREE.MeshBasicMaterial({ color: activeColor });

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const px = Math.cos(angle) * 1.35;
    const pz = Math.sin(angle) * 1.35;

    const pillar = new THREE.Mesh(
      pillarGeo,
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }),
    );
    pillar.position.set(px, 0.175, pz);
    pillar.castShadow = true;

    const crystal = new THREE.Mesh(crystalGeo, beaconMat);
    crystal.position.y = 0.22;
    pillar.add(crystal);

    group.add(pillar);
  }

  return { y, group, type: "finish" };
}

function createFireEffect() {
  const group = new THREE.Group();

  // Inner glowing hot core for the fireball
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
  });
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_RADIUS * 1.3, 16, 16),
    coreMat,
  );
  group.add(core);

  // Dynamic trailing flames
  const mat = new THREE.MeshBasicMaterial({
    color: FIRE_COLOR,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  });
  for (let i = 0; i < 12; i++) {
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.06 + Math.random() * 0.06, 0.6, 8),
      mat.clone(),
    );
    const angle = (i / 12) * Math.PI * 2;
    flame.position.set(
      Math.cos(angle) * (BALL_RADIUS * 0.8),
      0.15,
      Math.sin(angle) * (BALL_RADIUS * 0.8),
    );
    flame.rotation.x = Math.PI; // point up towards the top
    flame.rotation.z = (Math.random() - 0.5) * 0.5;
    group.add(flame);
  }
  return group;
}

function updateBallColor(color) {
  // Ball stays white — only glow color changes to match level
  ballGlow?.color.setHex(color);
  document.documentElement.style.setProperty(
    "--active",
    `#${color.toString(16).padStart(6, "0")}`,
  );
}

function onPointerDown(event) {
  initAudio();
  if (event.target.closest('button')) return;

  if (playerState === STATE.PREPARE) {
    playerState = STATE.PLAY;
    playButtonSound();
    updateUI();
  }

  if (playerState === STATE.PLAY) {
    isClicked = true;
  } else if (playerState === STATE.DEAD) {
    // In arena mode: game over = score submitted, no local restart
    // Do nothing — arena parent handles re-entry
  } else if (playerState === STATE.FINISH) {
    increaseTheLevel();
  }
}

function onPointerUp() {
  isClicked = false;
}

let prevBallY = ballY;

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.033);

  towerGroup.rotation.y += THREE.MathUtils.degToRad(TOWER_SPEED_DEG) * dt;
  updateDebris(dt);
  updateSplashes(dt);
  updateWinParticles(dt);

  if (playerState === STATE.PLAY) {
    overpowerCheck(dt);
    prevBallY = ballY;
    ballMovement(dt);
    processCollision();
  } else if (playerState === STATE.FINISH) {
    animateFinish(dt);
  } else {
    idleBounce(dt);
  }

  renderBall(dt);
  renderCamera(dt);
  renderer.render(scene, camera);
}

function ballMovement(dt) {
  if (isClicked) {
    // Pressing down accelerates ball downward
    ballVelocityY = CLICK_VELOCITY;
  } else {
    // Gravity when not pressing
    ballVelocityY -= GRAVITY * dt;
  }
  if (ballVelocityY > SPEED_LIMIT) ballVelocityY = SPEED_LIMIT;
  ballY += ballVelocityY * dt;
}

function idleBounce(dt) {
  ballVelocityY -= GRAVITY * dt;
  ballY += ballVelocityY * dt;
  const topPlatform = platforms[0];
  const floorY = topPlatform
    ? topPlatform.y + PLATFORM_HEIGHT * 0.5 + BALL_RADIUS
    : START_Y - 0.5;
  if (ballY <= floorY) {
    ballY = floorY;
    ballVelocityY = BOUNCE_VELOCITY;
  }
}

function processCollision() {
  // Finish check
  if (finishPlatform && !finishPlatform.triggered) {
    const finTop = finishPlatform.y + 0.11;
    if (ballY - BALL_RADIUS <= finTop && prevBallY - BALL_RADIUS > finTop) {
      finishPlatform.triggered = true;
      finishGame();
      return;
    }
  }

  let onPlatform = false;

  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i];
    if (platform.broken) continue;
    const platTop = platform.y + PLATFORM_HEIGHT * 0.5;

    const ballBottom = ballY - BALL_RADIUS;
    const crossedDown = prevBallY - BALL_RADIUS >= platTop && ballBottom <= platTop && ballVelocityY <= 0;
    const resting     = ballBottom <= platTop + 0.04 && ballBottom >= platTop - 0.10 && ballVelocityY <= 0;

    if (!crossedDown && !resting) continue;

    onPlatform = true;
    const part = partUnderBall(platform);
    if (!part) continue;

    if (!isClicked) {
      // Bounce cleanly on top — ONE interaction, stop loop
      ballY = platTop + BALL_RADIUS;
      ballVelocityY = BOUNCE_VELOCITY;
      spawnSplash(platTop + 0.01, platform);
      playTone(340, 'sine', 0.08, 0.1);
      return; // stop — only one platform interaction per frame
    }

    if (isOverPowered || part.type === 'good') {
      // Snap ball above, break EXACTLY ONE platform, then exit loop
      ballY = platTop + BALL_RADIUS;
      breakAllPlatforms(platform);
      return; // ← critical: return immediately so next platform is NOT touched this frame
    } else if (part.type === 'bad') {
      dieOnBadPlatform();
      return;
    }
  }

  // Resting bounce (holding without pressing)
  if (onPlatform && !isClicked && playerState === STATE.PLAY) {
    const platTop = getPlatformTopUnderBall();
    if (platTop !== null && ballVelocityY < 0) {
      ballY = platTop + BALL_RADIUS;
      ballVelocityY = BOUNCE_VELOCITY;
    }
  }
}

function getPlatformTopUnderBall() {
  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i];
    if (platform.broken) continue;
    const platTop = platform.y + PLATFORM_HEIGHT * 0.5;
    if (
      ballY - BALL_RADIUS <= platTop + 0.05 &&
      ballY - BALL_RADIUS >= platTop - 0.22
    ) {
      return platTop;
    }
  }
  return null;
}

function partUnderBall(platform) {
  const count = platform.sectors.length;
  const angleSize = (Math.PI * 2) / count;
  // Ball is at world (0, y, -BALL_Z) — negative Z = toward camera.
  // In the 2D ring geometry (after rotateX), sector directions are:
  // sector at angle 'a' points in direction (cos(a), 0, -sin(a)).
  // For -Z direction: -sin(a)=-1 => sin(a)=1 => a=PI/2.
  // So ball's effective angle is PI/2.
  const totalRotation = towerGroup.rotation.y + platform.group.rotation.y;
  const relative = normalizeAngle(Math.PI / 2 - totalRotation);
  const index = Math.floor(relative / angleSize) % count;
  return platform.sectors.find((sector) => sector.index === index) || null;
}

function normalizeAngle(angle) {
  const full = Math.PI * 2;
  return ((angle % full) + full) % full;
}

function bounceOnPlatform(top, platform) {
  ballY = top + BALL_RADIUS + 0.01;
  ballVelocityY = BOUNCE_VELOCITY;
  spawnSplash(platform.y + PLATFORM_HEIGHT * 0.5 + 0.01, platform);
  playTone(340, "sine", 0.08, 0.1);
}

function breakAllPlatforms(platform) {
  if (platform.broken) return;
  platform.broken = true;
  currentBrokenPlatforms++;
  increaseScore(isOverPowered ? 2 : 1);
  playTone(
    isOverPowered ? 190 : 150,
    "sawtooth",
    0.12,
    isOverPowered ? 0.16 : 0.11,
  );
  playTone(isOverPowered ? 420 : 300, "square", 0.05, 0.08, 0.04);

  platform.sectors.forEach((sector) => {
    if (sector.mesh) throwPlatformPart(sector.mesh, platform.group);
  });

  window.setTimeout(() => {
    disposeObject(platform.group);
  }, 1000);

  ballVelocityY = Math.min(ballVelocityY, -9);
  updateProgress();
  updateUI();
}

function throwPlatformPart(mesh, parent) {
  // Must update full matrix chain: towerGroup > platform.group > mesh
  towerGroup.updateMatrixWorld(true);

  const worldPosition = new THREE.Vector3();
  const worldQuaternion = new THREE.Quaternion();
  const worldScale = new THREE.Vector3();
  mesh.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);

  const clone = mesh.clone();
  clone.material = mesh.material.clone();
  clone.material.transparent = true;
  clone.position.copy(worldPosition);
  clone.quaternion.copy(worldQuaternion);
  clone.scale.copy(worldScale);
  debrisGroup.add(clone);

  // Unity PlatformPartController.BreakingPlatforms():
  // parentXPosition = parent.position.x (world x of platform center)
  // xPos = mesh bounds center x
  // subDirection = (parentXPosition - xPos < 0) ? right : left
  const parentWorldPos = new THREE.Vector3();
  parent.getWorldPosition(parentWorldPos);
  const subDirection = worldPosition.x > parentWorldPos.x ? 1 : -1;

  // direction = (Vector3.up * 1.5 + subDirection).normalized
  const direction = new THREE.Vector3(
    subDirection,
    1.5,
    (Math.random() - 0.5) * 0.5,
  ).normalize();
  const force = 20 + Math.random() * 15; // Random.Range(20, 35)
  const velocity = direction.multiplyScalar(force * 0.1);
  velocity.y -= 1.0; // _rb.velocity = Vector3.down

  const torqueMag = (110 + Math.random() * 70) * 0.05; // Random.Range(110,180)

  shards.push({
    mesh: clone,
    velocity,
    torque: new THREE.Vector3(
      -torqueMag,
      (Math.random() - 0.5) * torqueMag * 0.3,
      0,
    ),
    life: 1.2,
  });

  mesh.visible = false;
}

function increaseScore(amount) {
  score += amount;
  postGameEvent('STACK_BALL_SCORE', { score, amount, level });
}

function dieOnBadPlatform() {
  playerState = STATE.DEAD;
  isClicked = false;
  ball.visible = false;
  fireEffect.visible = false;

  // Composite arena score: ring score multiplied by level multiplier
  const arenaScore = score * level;

  // Populate UI
  if (gameOverScoreText) gameOverScoreText.textContent = score;
  if (gameOverLevelBonusText) gameOverLevelBonusText.textContent = `x${level}`;
  if (gameOverArenaScoreText) gameOverArenaScoreText.textContent = arenaScore;

  playTone(92, 'square', 0.22, 0.18);
  playTone(55, 'sawtooth', 0.32, 0.12, 0.12);

  updateUI();

  // Submit to arena after brief delay so Game Over screen is visible
  setTimeout(() => {
    postGameEvent('GAME_OVER', { score: arenaScore, level, reason: 'bad_platform' });
    // Send arena score submission
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'PLAYZA_SCORE_SUBMISSION', payload: { score: arenaScore } }, '*');
    }
    if (gameOverMsg) gameOverMsg.textContent = `Arena Score: ${arenaScore}`;
  }, 800);
}

function finishGame() {
  playerState = STATE.FINISH;
  isClicked = false;
  ballVelocityY = 0;
  ballY = finishPlatform.y + BALL_RADIUS + 0.2;
  spawnWinParticles();
  playWinSound();
  postGameEvent("GAME_FINISH", {
    score,
    level,
    brokenPlatforms: currentBrokenPlatforms,
  });
  updateUI();
}

function increaseTheLevel() {
  level = level + 1;
  ball.visible = true;
  levelManagement();
  updateUI();
}

function overpowerCheck(dt) {
  if (isOverPowered) {
    overpowerBuildUp -= dt * OVERPOWER_ACTIVE_DRAIN;
    fireEffect.visible = true;
  } else {
    fireEffect.visible = false;
    if (isClicked) overpowerBuildUp += dt * OVERPOWER_GAIN;
    else overpowerBuildUp -= dt * OVERPOWER_DRAIN;
  }

  if (overpowerBuildUp >= 1) {
    overpowerBuildUp = 1;
    isOverPowered = true;
  } else if (overpowerBuildUp <= 0) {
    overpowerBuildUp = 0;
    isOverPowered = false;
    fireEffect.visible = false;
  }

  overpowerWrap.classList.toggle(
    "hidden",
    !(overpowerBuildUp >= 0.3 || isOverPowered),
  );
  overpowerFill.style.transform = `scaleX(${overpowerBuildUp})`;
  overpowerFill.classList.toggle("hot", isOverPowered);
}

function spawnSplash(y, platform) {
  const geometry = new THREE.CircleGeometry(0.18 + Math.random() * 0.07, 24);
  const material = new THREE.MeshBasicMaterial({
    color: activeColor,
    transparent: true,
    opacity: 0.68,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const splash = new THREE.Mesh(geometry, material);

  // Attach splash to the platform group so it rotates with it
  if (platform && platform.group) {
    towerGroup.updateMatrixWorld(true);
    platform.group.updateMatrixWorld(true);
    const worldPos = new THREE.Vector3(0, y + 0.01, BALL_Z);
    platform.group.worldToLocal(worldPos);
    splash.position.copy(worldPos);
    splash.rotation.x = -Math.PI / 2;
    splash.rotation.z = Math.random() * Math.PI * 2;
    platform.group.add(splash);
  } else {
    splash.position.set(0, y + 0.01, BALL_Z);
    splash.rotation.x = -Math.PI / 2;
    splash.rotation.z = Math.random() * Math.PI * 2;
    splashGroup.add(splash);
  }

  splashes.push({ mesh: splash, life: 0.9 });
}

function updateSplashes(dt) {
  for (let i = splashes.length - 1; i >= 0; i--) {
    const splash = splashes[i];
    splash.life -= dt;
    splash.mesh.material.opacity = Math.max(0, splash.life * 0.72);
    splash.mesh.scale.addScalar(dt * 0.45);
    if (splash.life <= 0) {
      disposeObject(splash.mesh);
      splashes.splice(i, 1);
    }
  }
}

function updateDebris(dt) {
  for (let i = shards.length - 1; i >= 0; i--) {
    const shard = shards[i];
    shard.life -= dt;
    shard.velocity.y -= 12 * dt;
    shard.mesh.position.addScaledVector(shard.velocity, dt);
    shard.mesh.rotation.x += shard.torque.x * dt;
    shard.mesh.rotation.y += shard.torque.y * dt;
    shard.mesh.rotation.z += shard.torque.z * dt;
    if (shard.mesh.material.opacity !== undefined) {
      shard.mesh.material.transparent = true;
      shard.mesh.material.opacity = Math.max(0, shard.life);
    }
    if (shard.life <= 0) {
      disposeObject(shard.mesh);
      shards.splice(i, 1);
    }
  }
}

function spawnWinParticles() {
  winParticles.visible = true;
  winParticles.position.set(0, ballY + 1.6, -1.5);
  for (let i = 0; i < 40; i++) {
    const color = COLORS[i % COLORS.length];
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.02),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 })
    );
    mesh.position.set(0, 0, 0);
    winParticles.add(mesh);
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      mesh,
      velocity: new THREE.Vector3(Math.cos(angle) * (1 + Math.random() * 2), 1 + Math.random() * 3, Math.sin(angle) * 0.8),
      life: 1.4 + Math.random() * 0.6,
    });
  }
}

function updateWinParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.life -= dt;
    particle.velocity.y -= 2.4 * dt;
    particle.mesh.position.addScaledVector(particle.velocity, dt);
    particle.mesh.rotation.x += dt * 8;
    particle.mesh.rotation.z += dt * 5;
    particle.mesh.material.opacity = Math.max(0, particle.life / 1.6);
    if (particle.life <= 0) {
      disposeObject(particle.mesh);
      particles.splice(i, 1);
    }
  }
  if (particles.length === 0) winParticles.visible = false;
}

function animateFinish(dt) {
  ball.rotation.y += dt * 5;
  ball.position.y += Math.sin(performance.now() * 0.006) * 0.002;
}

function renderBall(dt) {
  // Ball fixed at front of pole (between camera and pole center)
  ball.position.set(0, ballY, BALL_Z);
  ball.visible = playerState !== STATE.DEAD;
  ballGlow.position.copy(ball.position);
  fireEffect.position.copy(ball.position);
  fireEffect.rotation.y += dt * 5;
  const pulse = isOverPowered ? 1 + Math.sin(performance.now() * 0.018) * 0.08 : 1;
  ball.scale.setScalar(pulse);
}

function renderCamera(dt) {
  if (playerState === STATE.PLAY || playerState === STATE.FINISH) {
    const lastY = finishPlatform ? finishPlatform.y + 4 : -999;
    if (cameraBaseY > ballY && cameraBaseY > lastY) {
      cameraBaseY += (ballY - cameraBaseY) * 0.15;
    }
  } else {
    cameraBaseY = platforms[0] ? platforms[0].y + 1.5 : START_Y;
  }

  // Camera sits behind-left, angled down to see ball in front of pole
  const cameraZ = camera.aspect < 0.7 ? -9.5 : -8.0;
  camera.position.set(0, cameraBaseY + 4.5, cameraZ);
  camera.lookAt(0, cameraBaseY - 0.5, 0);
}

function updateProgress() {
  const fill = totalPlatforms > 0 ? currentBrokenPlatforms / totalPlatforms : 0;
  progressFill.style.transform = `scaleX(${THREE.MathUtils.clamp(fill, 0, 1)})`;
}

function updateUI() {
  firstUI.classList.toggle('hidden',   playerState !== STATE.PREPARE);
  inGameUI.classList.toggle('hidden',  playerState !== STATE.PLAY);
  finishUI.classList.toggle('hidden',  playerState !== STATE.FINISH);
  gameOverUI.classList.toggle('hidden',playerState !== STATE.DEAD);

  if (scoreText)         scoreText.textContent       = score;
  currentLevelText.forEach(n => n.textContent = level);
  nextLevelText.forEach(n   => n.textContent = level + 1);
  if (finishLevelText) finishLevelText.textContent   = `Level ${level}`;
  if (tapStart) tapStart.textContent = playerState === STATE.PREPARE ? 'Tap to play' : '';
  updateProgress();
  updateSoundButton();
}

function updateSoundButton() {
  if (soundButton) soundButton.textContent = soundEnabled ? 'Sound On' : 'Sound Off';
}

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function playTone(freq, type, duration, volume, delay = 0) {
  if (!audioCtx || !soundEnabled) return;
  const start = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

function playButtonSound() {
  playTone(520, "sine", 0.06, 0.08);
}

function playWinSound() {
  [420, 560, 720, 920].forEach((freq, index) => playTone(freq, "sine", 0.13, 0.12, index * 0.08));
}

function postGameEvent(type, payload) {
  if (!window.parent || window.parent === window) return;
  window.parent.postMessage({ type, payload }, '*');
}

// ── ARENA MESSAGE LISTENER ──
window.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  // Receive session config from GamePlay.tsx
  if (type === 'PLAYZA_SESSION_CONFIG') {
    arenaLocked = payload?.locked ?? false;
    sessionId   = payload?.sessionId ?? null;
  }

  // Rival leaderboard update — show rival banner
  if (type === 'PLAYZA_RIVAL_UPDATE') {
    rivalData = payload;
    rivalName.textContent  = payload.username || 'Rival';
    rivalScoreEl.textContent = payload.score || 0;
    rivalBanner.classList.add('visible');

    // Color coding: trailing vs leading
    const myScore = score;
    if (myScore >= (payload.score || 0)) {
      rivalBanner.classList.remove('trailing');
      rivalBanner.classList.add('leading');
    } else {
      rivalBanner.classList.remove('leading');
      rivalBanner.classList.add('trailing');
    }
  }

  // Pause / Resume from parent
  if (type === 'PLAYZA_PAUSE') {
    if (playerState === STATE.PLAY) {
      isClicked = false;
      playerState = STATE.PREPARE; // freeze
    }
  }
  if (type === 'PLAYZA_RESUME') {
    if (playerState === STATE.PREPARE && platforms.length > 0) {
      playerState = STATE.PLAY;
    }
  }
});

init();
