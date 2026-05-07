// Stack Ball 3D - Unity clone mechanics rebuilt for the web.
const THREE = window.THREE;

const shell = document.getElementById("shell");
const firstUI = document.getElementById("firstUI");
const inGameUI = document.getElementById("inGameUI");
const finishUI = document.getElementById("finishUI");
const gameOverUI = document.getElementById("gameOverUI");
const scoreText = document.getElementById("scoreText");
const bestScoreText = document.getElementById("bestScoreText");
const currentLevelText = document.querySelectorAll(".current-level-text");
const nextLevelText = document.querySelectorAll(".next-level-text");
const finishLevelText = document.getElementById("finishLevelText");
const gameOverScoreText = document.getElementById("gameOverScoreText");
const gameOverBestText = document.getElementById("gameOverBestText");
const progressFill = document.getElementById("progressFill");
const overpowerWrap = document.getElementById("overpowerWrap");
const overpowerFill = document.getElementById("overpowerFill");
const tapStart = document.getElementById("tapStart");
const settingsButton = document.getElementById("settingsButton");
const settingsPanel = document.getElementById("settingsPanel");
const soundButton = document.getElementById("soundButton");

const STORAGE_LEVEL = "stack_ball_clone_level";
const STORAGE_BEST = "stack_ball_clone_best";
const STORAGE_SOUND = "stack_ball_clone_sound";

const STATE = {
  PREPARE: "Prepare",
  PLAY: "Play",
  DEAD: "Dead",
  FINISH: "Finish",
};

const PLATFORM_FAMILIES = [
  {
    name: "circle",
    sectors: 4,
    shape: "circle",
    layouts: [
      ["good", "good", "good", "good"],
      ["bad", "good", "good", "good"],
      ["bad", "bad", "good", "good"],
      ["bad", "bad", "bad", "good"],
    ],
  },
  {
    name: "flower",
    sectors: 4,
    shape: "flower",
    layouts: [
      ["good", "good", "good", "good"],
      ["bad", "good", "good", "good"],
      ["bad", "bad", "good", "good"],
      ["bad", "bad", "bad", "good"],
    ],
  },
  {
    name: "hex",
    sectors: 6,
    shape: "hex",
    layouts: [
      ["good", "good", "good", "good", "good", "good"],
      ["bad", "good", "good", "good", "good", "good"],
      ["bad", "bad", "good", "good", "good", "good"],
      ["bad", "bad", "bad", "good", "good", "good"],
    ],
  },
  {
    name: "spikes",
    sectors: 4,
    shape: "spikes",
    layouts: [
      ["good", "good", "good", "good"],
      ["bad", "good", "good", "good"],
      ["bad", "bad", "good", "good"],
      ["bad", "bad", "bad", "good"],
    ],
  },
  {
    name: "square",
    sectors: 4,
    shape: "square",
    layouts: [
      ["good", "good", "good", "good"],
      ["bad", "good", "good", "good"],
      ["bad", "bad", "good", "good"],
      ["bad", "bad", "bad", "good"],
    ],
  },
];

const COLORS = [
  0xff4d7d,
  0x21c7ff,
  0x47d16a,
  0xffb82e,
  0x9b5cff,
  0xff6847,
  0x2dd4bf,
];

const BAD_COLOR = 0x15151c;
const POLE_COLOR = 0xd8d8dc;
const PLANE_COLOR = 0xf4f6fb;
const FIRE_COLOR = 0xff4a18;
const BALL_RADIUS = 0.28;
const PLATFORM_HEIGHT = 0.16;
const PLATFORM_SPACING = 0.5;
const OUTER_RADIUS = 1.95;
const INNER_RADIUS = 0.45; // Increased to fit larger pole
const BALL_X = 1.15; // Fixed in front of pole (positive X)
const START_Y = 1.2;
const MOVE_SPEED = 500;
const BOUNCE_SPEED = 250;
const SPEED_LIMIT = 5;
const TOWER_SPEED_DEG = 100;
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
let level = readInt(STORAGE_LEVEL, 1);
let score = 0;
let bestScore = readInt(STORAGE_BEST, 0);
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
let soundEnabled = localStorage.getItem(STORAGE_SOUND) !== "off";

function readInt(key, fallback) {
  const value = Number.parseInt(localStorage.getItem(key) || "", 10);
  return Number.isFinite(value) ? value : fallback;
}

function saveInt(key, value) {
  localStorage.setItem(key, String(value));
}

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xf4f6fb, 1);
  shell.prepend(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4f6fb);
  scene.fog = new THREE.Fog(0xf4f6fb, 8, 22);

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);
  camera.position.set(0, 3.2, -5.2);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xd6dae2, 1.9);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-3, 7, -4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  towerGroup = new THREE.Group();
  debrisGroup = new THREE.Group();
  splashGroup = new THREE.Group();
  scene.add(towerGroup, debrisGroup, splashGroup);

// Increased pole diameter from 0.32 to 0.50 (radius 0.25)
pole = new THREE.Mesh(
  new THREE.CylinderGeometry(0.28, 0.28, 80, 32),
  new THREE.MeshStandardMaterial({ color: POLE_COLOR, roughness: 0.48, metalness: 0.08 })
);
  pole.position.y = -22;
  pole.receiveShadow = true;
  scene.add(pole);

  ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_RADIUS, 40, 32),
    new THREE.MeshStandardMaterial({
      color: activeColor,
      roughness: 0.18,
      metalness: 0.12,
      emissive: activeColor,
      emissiveIntensity: 0.12,
    })
  );
  ball.castShadow = true;
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
  level = readInt(STORAGE_LEVEL, 1);
  if (level > 9) platformAddition = 0;
  else platformAddition = 7;

  activeColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  selectedFamily = PLATFORM_FAMILIES[Math.floor(Math.random() * PLATFORM_FAMILIES.length)];
  updateBallColor(activeColor);

  const platformCount = (level + platformAddition) * 2;
  totalPlatforms = platformCount;
  currentBrokenPlatforms = 0;
  const startPlatformY = 0;

  for (let index = 0; index < platformCount; index++) {
    const y = startPlatformY - index * PLATFORM_SPACING;
    const difficulty = pickDifficultyIndex();
    const platform = createPlatform(index, y, difficulty);
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
  cameraBaseY = 3.2;
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
    if (Array.isArray(child.material)) child.material.forEach((mat) => mat.dispose());
    else child.material?.dispose();
  });
  object.parent?.remove(object);
}

function pickDifficultyIndex() {
  if (level <= 40) return Math.floor(Math.random() * 2);
  if (level <= 80) return 1 + Math.floor(Math.random() * 2);
  if (level <= 140) return 2 + Math.floor(Math.random() * 2);
  return 3;
}

function createPlatform(index, y, difficulty) {
  const group = new THREE.Group();
  group.position.y = y;
  group.userData.index = index;
  const layout = selectedFamily.layouts[difficulty];
  const sectors = [];
  const materialGood = new THREE.MeshStandardMaterial({
    color: activeColor,
    roughness: 0.34,
    metalness: 0.04,
  });
  const materialBad = new THREE.MeshStandardMaterial({
    color: BAD_COLOR,
    roughness: 0.55,
    metalness: 0.02,
  });
  const count = selectedFamily.sectors;

  for (let i = 0; i < count; i++) {
    const type = layout[i] || "good";
    const mesh = createPlatformPart(selectedFamily.shape, count, i, type === "bad" ? materialBad : materialGood);
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

function createPlatformPart(shape, count, index, material) {
  const angle = (Math.PI * 2) / count;
  if (shape === "square") return createBoxPart(count, index, material);
  return createRingPart(shape, angle, index * angle, material);
}

function createRingPart(shape, angle, startAngle, material) {
  const steps = shape === "spikes" ? 8 : 18;
  const outerWave = shape === "flower" ? 0.18 : 0;
  const shape2D = new THREE.Shape();
  shape2D.moveTo(Math.cos(startAngle) * INNER_RADIUS, Math.sin(startAngle) * INNER_RADIUS);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = startAngle + angle * t;
    let radius = OUTER_RADIUS;
    if (shape === "spikes") radius += i % 2 === 0 ? 0.28 : -0.08;
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
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.018,
    bevelSegments: 1,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -PLATFORM_HEIGHT * 0.5, 0);
  return new THREE.Mesh(geometry, material.clone());
}

function createBoxPart(count, index, material) {
  const width = 1.16;
  const length = 2.35;
  const geometry = new THREE.BoxGeometry(width, PLATFORM_HEIGHT, length);
  const mesh = new THREE.Mesh(geometry, material.clone());
  const angle = (Math.PI * 2 * index) / count + Math.PI / count;
  const radius = 1.02;
  mesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  mesh.rotation.y = -angle;
  return mesh;
}

function createFinishPlatform(y) {
  const group = new THREE.Group();
  group.position.y = y;
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.26,
    metalness: 0.1,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.22, 56), mat);
  base.castShadow = true;
  base.receiveShadow = true;
  const stripe = new THREE.Mesh(
    new THREE.TorusGeometry(1.45, 0.045, 10, 72),
    new THREE.MeshStandardMaterial({ color: activeColor, roughness: 0.3 })
  );
  stripe.position.y = 0.14;
  stripe.rotation.x = Math.PI / 2;
  group.add(base, stripe);
  return { y, group, type: "finish" };
}

function createFireEffect() {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: FIRE_COLOR, transparent: true, opacity: 0.55 });
  for (let i = 0; i < 10; i++) {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.05 + Math.random() * 0.05, 0.45, 8), mat.clone());
    const angle = (i / 10) * Math.PI * 2;
    flame.position.set(Math.cos(angle) * 0.22, -0.22, Math.sin(angle) * 0.22);
    flame.rotation.z = (Math.random() - 0.5) * 0.7;
    group.add(flame);
  }
  return group;
}

function updateBallColor(color) {
  ball?.material.color.setHex(color);
  ball?.material.emissive.setHex(color);
  ballGlow?.color.setHex(color);
  document.documentElement.style.setProperty("--active", `#${color.toString(16).padStart(6, "0")}`);
}

function onPointerDown(event) {
  initAudio();
  if (event.target.closest("button")) return;

  if (playerState === STATE.PREPARE) {
    playerState = STATE.PLAY;
    playButtonSound();
    updateUI();
  }

  if (playerState === STATE.PLAY) {
    isClicked = true;
  } else if (playerState === STATE.DEAD) {
    score = 0;
    levelManagement();
    updateUI();
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

// Unity: _moveSpeed = 500, Time.fixedDeltaTime = 0.02 → velocity = -10 u/s
const CLICK_VELOCITY = -10;
// Unity gravity approximation
const GRAVITY = 20;

function ballMovement(dt) {
  if (isClicked) {
    // Unity: _rb.velocity = new Vector3(0, -_moveSpeed * Time.fixedDeltaTime, 0)
    ballVelocityY = CLICK_VELOCITY;
  } else {
    ballVelocityY -= GRAVITY * dt;
  }
  // Unity caps only upward velocity: if (_rb.velocity.y > _speedLimit)
  if (ballVelocityY > SPEED_LIMIT) ballVelocityY = SPEED_LIMIT;
  ballY += ballVelocityY * dt;
}

function idleBounce(dt) {
  ballVelocityY -= GRAVITY * dt;
  ballY += ballVelocityY * dt;
  const topPlatform = platforms[0];
  // Top surface of first platform
  const floorY = topPlatform ? topPlatform.y + PLATFORM_HEIGHT * 0.5 + BALL_RADIUS : START_Y - 0.5;
  if (ballY <= floorY) {
    ballY = floorY;
    // Unity OnCollisionStay: velocity = bounceSpeed * Time.deltaTime = 250*0.02 = 5
    ballVelocityY = BOUNCE_SPEED * 0.02;
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

    // Frame-accurate crossing: ball bottom crossed platTop this frame going downward
    const crossedDown =
      prevBallY - BALL_RADIUS >= platTop &&
      ballY - BALL_RADIUS <= platTop &&
      ballVelocityY <= 0;
    // Resting contact (slow fall, ball sits on platform)
    const resting =
      ballY - BALL_RADIUS <= platTop + 0.05 &&
      ballY - BALL_RADIUS >= platTop - 0.22 &&
      ballVelocityY <= 0;

    if (!crossedDown && !resting) continue;

    onPlatform = true;
    const part = partUnderBall(platform);
    if (!part) continue; // ball is over a gap sector

    if (!isClicked) {
      bounceOnPlatform(platTop, platform);
      return;
    }

    if (isOverPowered) {
      breakAllPlatforms(platform);
      return;
    }

    if (part.type === "good") {
      breakAllPlatforms(platform);
      return;
    }

    if (part.type === "bad") {
      dieOnBadPlatform();
      return;
    }
  }

  // Unity OnCollisionStay: continuously bounce when on platform without click
  if (onPlatform && !isClicked && playerState === STATE.PLAY) {
    const platTop = getPlatformTopUnderBall();
    if (platTop !== null) {
      ballY = platTop + BALL_RADIUS + 0.02;
      ballVelocityY = BOUNCE_SPEED * 0.02;
    }
  }
}

function getPlatformTopUnderBall() {
  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i];
    if (platform.broken) continue;
    const platTop = platform.y + PLATFORM_HEIGHT * 0.5;
    if (ballY - BALL_RADIUS <= platTop + 0.05 && ballY - BALL_RADIUS >= platTop - 0.22) {
      return platTop;
    }
  }
  return null;
}

function partUnderBall(platform) {
  const count = platform.sectors.length;
  const angleSize = (Math.PI * 2) / count;
  // Ball is at world angle π/2 (positive Z axis — centered in camera view at z=BALL_X).
  // Relative angle of ball in tower's local space:
  const totalRotation = towerGroup.rotation.y + platform.group.rotation.y;
  const relative = normalizeAngle(Math.PI / 2 - totalRotation);
  // Map continuous angle to discrete sector index
  const index = Math.floor(relative / angleSize) % count;
  return platform.sectors.find((sector) => sector.index === index) || null;
}

function normalizeAngle(angle) {
  const full = Math.PI * 2;
  return ((angle % full) + full) % full;
}

function bounceOnPlatform(top, platform) {
  ballY = top + BALL_RADIUS + 0.02;
  ballVelocityY = BOUNCE_SPEED * 0.02;  // 5 u/s upward, matches Unity
  spawnSplash(platform.y + PLATFORM_HEIGHT * 0.5 + 0.01);
  playTone(280, "sine", 0.08, 0.08);
}

function breakAllPlatforms(platform) {
  if (platform.broken) return;
  platform.broken = true;
  currentBrokenPlatforms++;
  increaseScore(isOverPowered ? 2 : 1);
  playTone(isOverPowered ? 190 : 150, "sawtooth", 0.12, isOverPowered ? 0.16 : 0.11);
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
  const direction = new THREE.Vector3(subDirection, 1.5, (Math.random()-0.5)*0.5).normalize();
  const force = 20 + Math.random() * 15;   // Random.Range(20, 35)
  const velocity = direction.multiplyScalar(force * 0.1);
  velocity.y -= 1.0;                        // _rb.velocity = Vector3.down

  const torqueMag = (110 + Math.random() * 70) * 0.05; // Random.Range(110,180)

  shards.push({
    mesh: clone,
    velocity,
    torque: new THREE.Vector3(-torqueMag, (Math.random()-0.5)*torqueMag*0.3, 0),
    life: 1.2,
  });

  mesh.visible = false;
}

function increaseScore(amount) {
  score += amount;
  if (score > bestScore) {
    bestScore = score;
    saveInt(STORAGE_BEST, bestScore);
  }
  postGameEvent("STACK_BALL_SCORE", { score, amount, level });
}

function dieOnBadPlatform() {
  playerState = STATE.DEAD;
  isClicked = false;
  ball.visible = false;
  fireEffect.visible = false;
  playTone(92, "square", 0.22, 0.18);
  playTone(55, "sawtooth", 0.32, 0.12, 0.12);
  postGameEvent("GAME_OVER", { score, level, reason: "bad_platform" });
  updateUI();
}

function finishGame() {
  playerState = STATE.FINISH;
  isClicked = false;
  ballVelocityY = 0;
  ballY = finishPlatform.y + BALL_RADIUS + 0.2;
  spawnWinParticles();
  playWinSound();
  postGameEvent("GAME_FINISH", { score, level, brokenPlatforms: currentBrokenPlatforms });
  updateUI();
}

function increaseTheLevel() {
  saveInt(STORAGE_LEVEL, level + 1);
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

  overpowerWrap.classList.toggle("hidden", !(overpowerBuildUp >= 0.3 || isOverPowered));
  overpowerFill.style.transform = `scaleX(${overpowerBuildUp})`;
  overpowerFill.classList.toggle("hot", isOverPowered);
}

function spawnSplash(y) {
  const geometry = new THREE.CircleGeometry(0.18 + Math.random() * 0.07, 24);
  const material = new THREE.MeshBasicMaterial({
    color: activeColor,
    transparent: true,
    opacity: 0.68,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const splash = new THREE.Mesh(geometry, material);
  // Ball is at (0, ballY, BALL_X) — splash appears at ball's contact point
  splash.position.set(0, y + 0.085, BALL_X);
  splash.rotation.x = -Math.PI / 2;
  splash.rotation.z = Math.random() * Math.PI * 2;
  splashGroup.add(splash);
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
  // Ball sits on Z-axis side so it appears centered in camera view
  ball.position.set(0, ballY, BALL_X);
  // Ball only bounces — no visual rotation (tower rotates, not ball)
  ball.rotation.set(0, 0, 0);
  ball.visible = playerState !== STATE.DEAD;
  ballGlow.position.copy(ball.position);
  fireEffect.position.copy(ball.position);
  fireEffect.rotation.y += dt * 5;
  const pulse = isOverPowered ? 1 + Math.sin(performance.now() * 0.018) * 0.08 : 1;
  ball.scale.setScalar(pulse);
}

function renderCamera(dt) {
  if (playerState === STATE.PLAY || playerState === STATE.FINISH) {
    // Camera only moves DOWN with ball (like Unity CameraFollow)
    // Never follows upward bounces — tower scrolls past camera
    const lastY = finishPlatform ? finishPlatform.y + 4 : -999;
    if (cameraBaseY > ballY && cameraBaseY > lastY) {
      cameraBaseY = ballY;
    }
  } else {
    // PREPARE / DEAD: camera fixed at tower top — tower doesn't bounce
    cameraBaseY = platforms[0] ? platforms[0].y + 1.2 : START_Y - 0.3;
  }

  const cameraZ = camera.aspect < 0.7 ? -7.5 : -6.0;
  camera.position.set(0, cameraBaseY + 2.0, cameraZ);
  camera.lookAt(0, cameraBaseY - 0.5, 0);
  pole.position.y = cameraBaseY - 22;
}

function updateProgress() {
  const fill = totalPlatforms > 0 ? currentBrokenPlatforms / totalPlatforms : 0;
  progressFill.style.transform = `scaleX(${THREE.MathUtils.clamp(fill, 0, 1)})`;
}

function updateUI() {
  firstUI.classList.toggle("hidden", playerState !== STATE.PREPARE);
  inGameUI.classList.toggle("hidden", playerState !== STATE.PLAY);
  finishUI.classList.toggle("hidden", playerState !== STATE.FINISH);
  gameOverUI.classList.toggle("hidden", playerState !== STATE.DEAD);

  scoreText.textContent = score;
  bestScoreText.textContent = bestScore;
  currentLevelText.forEach((node) => {
    node.textContent = level;
  });
  nextLevelText.forEach((node) => {
    node.textContent = level + 1;
  });
  finishLevelText.textContent = `Level ${level}`;
  gameOverScoreText.textContent = score;
  gameOverBestText.textContent = bestScore;
  tapStart.textContent = playerState === STATE.PREPARE ? "Tap to play" : "";
  updateProgress();
  updateSoundButton();
}

function updateSoundButton() {
  soundButton.textContent = soundEnabled ? "Sound On" : "Sound Off";
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
  window.parent.postMessage({ type, payload }, "*");
}

init();
