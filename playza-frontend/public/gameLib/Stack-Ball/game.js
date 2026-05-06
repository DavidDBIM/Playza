import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

await RAPIER.init();

const THREE = window.THREE;
const shell = document.getElementById('shell');
const overlayStart = document.getElementById('overlayStart');
const overlayResult = document.getElementById('overlayResult');
const gameHud = document.getElementById('gameHud');
const hudLevel = document.getElementById('hudLevel');
const hudMult = document.getElementById('hudMult');
const comboBadge = document.getElementById('comboBadge');
const comboCount = document.getElementById('comboCount');
const firePowerBanner = document.getElementById('firePowerBanner');
const btnStart = document.getElementById('btnStartGame');
const btnPlayAgain = document.getElementById('btnPlayAgain');
const resTitle = document.getElementById('resTitle');
const resSubtitle = document.getElementById('resSubtitle');
const resLevels = document.getElementById('resLevels');
const resPlatforms = document.getElementById('resPlatforms');
const resCombos = document.getElementById('resCombos');
const resFireModes = document.getElementById('resFireModes');
const resMult = document.getElementById('resMult');

const flashEl = document.createElement('div');
flashEl.id = 'flashOverlay';
shell.appendChild(flashEl);

let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq, type, duration, volume = 0.08) {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

const sfx = {
  bounce: () => playTone(285, 'sine', 0.075, 0.045),
  smash: () => {
    playTone(155, 'sawtooth', 0.12, 0.12);
    setTimeout(() => playTone(340, 'square', 0.07, 0.07), 42);
  },
  fire: () => {
    playTone(620, 'triangle', 0.12, 0.15);
    setTimeout(() => playTone(960, 'sine', 0.18, 0.14), 75);
  },
  death: () => {
    playTone(135, 'square', 0.22, 0.18);
    setTimeout(() => playTone(72, 'sawtooth', 0.44, 0.22), 115);
  }
};

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
if ('outputEncoding' in renderer) renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setClearColor(0x6ec8d5, 1);
shell.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x6ec8d5, 30, 70);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
const cameraLook = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const rayOrigin = new THREE.Vector3();
const rayDirection = new THREE.Vector3(0, -1, 0);

function resize() {
  const width = shell.clientWidth || window.innerWidth;
  const height = shell.clientHeight || window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

scene.add(new THREE.HemisphereLight(0xffffff, 0x4e8fa0, 0.62));

const sun = new THREE.DirectionalLight(0xffffff, 1.05);
sun.position.set(3.5, 8, 5);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

const glowLight = new THREE.PointLight(0xff3b73, 1.15, 12);
scene.add(glowLight);

const tower = new THREE.Group();
scene.add(tower);

const LANE_RADIUS = 1.42;
const INNER_RADIUS = 0.44;
const OUTER_RADIUS = 1.92;
const RING_HEIGHT = 0.34;
const SECTORS = 12;
const SECTOR_ANGLE = Math.PI * 2 / SECTORS;
const BALL_RADIUS = 0.32;
const BALL_COLLIDER_RADIUS = 0.27;
const BOUNCE_SPEED = 4.75;
const BOUNCE_IMPULSE = 5;
const MAX_FALL_SPEED = 20;
const MAX_FIRE_SPEED = 29;
const FIRE_CHAIN_TARGET = 7;
const FIRE_DURATION = 3.1;
const LEVEL_STACKS = 50;
const CLEANUP_DISTANCE = 7;
const RING_STEP = 0.5;
const POOL_LIMIT = 18;
const PHYSICS_HZ = 60;
const PHYSICS_DT = 1 / PHYSICS_HZ;
const RAPIER_NORMAL_GRAVITY = -24;
const RAPIER_FAST_GRAVITY = -62;

const levelThemes = [
  { name: 'blue', baseColor: 0x1597ff, dangerColor: 0x050509, bg: 0x6ec8d5, glow: 0x1597ff },
  { name: 'green', baseColor: 0x62e434, dangerColor: 0x050509, bg: 0x6ec8d5, glow: 0x62e434 },
  { name: 'pink', baseColor: 0xff2f92, dangerColor: 0x050509, bg: 0x76c8d6, glow: 0xff2f92 },
  { name: 'yellow', baseColor: 0xffc400, dangerColor: 0x050509, bg: 0x6fc8d5, glow: 0xffc400 }
];
const ballColor = 0xff286f;
const fireColor = 0xff4b10;

let gameState = 'start';
let rings = [];
let ringPool = [];
let particles = [];
let debris = [];
let sectorGeometries = [];
let activeTheme = levelThemes[0];
let safeMaterial = null;
let dangerMaterial = null;
let generatedRingId = 0;
let currentRingId = 0;
let level = 1;
let score = 0;
let multiplier = 0;
let combo = 0;
let maxCombo = 0;
let smashed = 0;
let fireModes = 0;
let holding = false;
let ball = null;
let ballY = 0;
let ballVY = 0;
let previousBallY = 0;
let physicsWorld = null;
let ballBody = null;
let ballCollider = null;
let physicsAccumulator = 0;
let timeScale = 1;
let headlessMode = false;
let lastAction = 0;
let lastReward = 0;
let episodeDone = false;
let episodeInfo = {};
let rotation = 0;
let rotationSpeed = 0.9;
let fireActive = false;
let fireTimer = 0;
let fallChain = 0;
let cameraShake = 0;
let squashTimer = 0;
let squashPower = 0;
let lastTime = 0;
let pole = null;
let ground = null;

function makeWedgeGeometry(startAngle, endAngle) {
  const shape = new THREE.Shape();
  const steps = 12;
  shape.moveTo(Math.cos(startAngle) * INNER_RADIUS, Math.sin(startAngle) * INNER_RADIUS);
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / steps);
    shape.lineTo(Math.cos(angle) * OUTER_RADIUS, Math.sin(angle) * OUTER_RADIUS);
  }
  for (let i = steps; i >= 0; i--) {
    const angle = startAngle + (endAngle - startAngle) * (i / steps);
    shape.lineTo(Math.cos(angle) * INNER_RADIUS, Math.sin(angle) * INNER_RADIUS);
  }
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: RING_HEIGHT,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 1
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -RING_HEIGHT / 2, 0);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function buildStaticScene() {
  sectorGeometries = Array.from({ length: SECTORS }, (_, index) => (
    makeWedgeGeometry(index * SECTOR_ANGLE, (index + 1) * SECTOR_ANGLE)
  ));

  pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 92, 32),
    new THREE.MeshPhongMaterial({
      color: 0xf7fff6,
      emissive: 0xbaff9d,
      emissiveIntensity: 0.015,
      shininess: 70
    })
  );
  pole.castShadow = true;
  pole.receiveShadow = true;
  tower.add(pole);

  ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0x6ec8d5, shininess: 8 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
}

function buildLevelMaterials(theme) {
  if (safeMaterial) safeMaterial.dispose();
  if (dangerMaterial) dangerMaterial.dispose();

  safeMaterial = new THREE.MeshStandardMaterial({
    color: theme.baseColor,
    emissive: theme.baseColor,
    emissiveIntensity: 0.035,
    roughness: 0.42,
    metalness: 0.02
  });
  dangerMaterial = new THREE.MeshStandardMaterial({
    color: theme.dangerColor,
    emissive: 0x000000,
    roughness: 0.5,
    metalness: 0.02
  });
}

function resetPhysicsWorld() {
  physicsWorld = new RAPIER.World({ x: 0, y: RAPIER_NORMAL_GRAVITY, z: 0 });
  physicsWorld.timestep = PHYSICS_DT;
  physicsAccumulator = 0;
  ballBody = null;
  ballCollider = null;
}

function createBallPhysics(y) {
  if (!physicsWorld) resetPhysicsWorld();
  const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(LANE_RADIUS, y, 0)
    .setLinvel(0, 0, 0)
    .setCcdEnabled(true)
    .setCanSleep(false)
    .setAdditionalMass(0.65);
  ballBody = physicsWorld.createRigidBody(bodyDesc);
  ballCollider = physicsWorld.createCollider(
    RAPIER.ColliderDesc.ball(BALL_COLLIDER_RADIUS).setRestitution(0.82).setFriction(0.05),
    ballBody
  );
}

function sensorPoseForSector(ring, sector, rot = rotation) {
  const angle = sector.index * SECTOR_ANGLE + SECTOR_ANGLE / 2 + ring.rotationOffset + rot;
  const radius = (INNER_RADIUS + OUTER_RADIUS) / 2;
  return {
    x: Math.cos(angle) * radius,
    y: ring.y,
    z: Math.sin(angle) * radius,
    angle
  };
}

function createSegmentSensor(ring, sector) {
  if (!physicsWorld) return;
  const pose = sensorPoseForSector(ring, sector, 0);
  const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
    .setTranslation(pose.x, pose.y, pose.z)
    .setRotation({ x: 0, y: Math.sin(-pose.angle / 2), z: 0, w: Math.cos(-pose.angle / 2) });
  const body = physicsWorld.createRigidBody(bodyDesc);
  const radialHalf = (OUTER_RADIUS - INNER_RADIUS) * 0.48;
  const tangentHalf = OUTER_RADIUS * Math.sin(SECTOR_ANGLE / 2) * 0.86;
  const collider = physicsWorld.createCollider(
    RAPIER.ColliderDesc.cuboid(radialHalf, RING_HEIGHT * 0.52, tangentHalf)
      .setRestitution(0.82)
      .setFriction(0.08)
      .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
    body
  );
  sector.sensorBody = body;
  sector.sensorCollider = collider;
  sector.sensorHandle = collider.handle;
  collider.userData = { ringId: ring.id, sectorIndex: sector.index, type: sector.type };
}

function removeSegmentSensor(sector) {
  if (!physicsWorld || !sector.sensorCollider) return;
  physicsWorld.removeCollider(sector.sensorCollider, false);
  if (sector.sensorBody) physicsWorld.removeRigidBody(sector.sensorBody);
  sector.sensorCollider = null;
  sector.sensorBody = null;
}

function syncSegmentSensors() {
  if (!physicsWorld) return;
  rings.forEach((ring) => {
    ring.sectors.forEach((sector) => {
      if (!sector.sensorBody || sector.broken) return;
      const pose = sensorPoseForSector(ring, sector);
      sector.sensorBody.setNextKinematicTranslation({ x: pose.x, y: pose.y, z: pose.z });
      sector.sensorBody.setNextKinematicRotation({
        x: 0,
        y: Math.sin(-pose.angle / 2),
        z: 0,
        w: Math.cos(-pose.angle / 2)
      });
    });
  });
}

function setBallVelocity(yVelocity) {
  if (!ballBody) return;
  ballBody.setLinvel({ x: 0, y: yVelocity, z: 0 }, true);
}

function syncBallFromPhysics() {
  if (!ballBody) return;
  const pos = ballBody.translation();
  const vel = ballBody.linvel();
  ballY = pos.y;
  ballVY = vel.y;
}

function setBallPhysicsY(y, yVelocity = ballVY) {
  if (!ballBody) return;
  ballBody.setTranslation({ x: LANE_RADIUS, y, z: 0 }, true);
  setBallVelocity(yVelocity);
  syncBallFromPhysics();
}

function applyLevelTheme(nextLevel) {
  level = nextLevel;
  activeTheme = levelThemes[(level - 1) % levelThemes.length];
  buildLevelMaterials(activeTheme);
  renderer.setClearColor(activeTheme.bg, 1);
  scene.fog.color.setHex(activeTheme.bg);
  if (ground) ground.material.color.setHex(activeTheme.bg);
  glowLight.color.setHex(activeTheme.glow);
}

function dangerIndicesForRing(ringId) {
  const targetCount = 2 + ((ringId + level) % 2);
  const danger = new Set();
  let cursor = (level * 5 + ringId * 3) % SECTORS;
  let guard = 0;

  while (danger.size < targetCount && guard < 36) {
    const nearDanger = danger.has((cursor + 1) % SECTORS) || danger.has((cursor + SECTORS - 1) % SECTORS);
    if (!nearDanger) danger.add(cursor);
    cursor = (cursor + 4 + level) % SECTORS;
    guard += 1;
  }

  return danger;
}

function acquireRingGroup() {
  const group = ringPool.pop() || new THREE.Group();
  while (group.children.length) group.remove(group.children[0]);
  group.visible = true;
  return group;
}

function releaseRing(ring) {
  ring.sectors.forEach(removeSegmentSensor);
  tower.remove(ring.group);
  while (ring.group.children.length) {
    const child = ring.group.children[0];
    ring.group.remove(child);
  }
  if (ringPool.length < POOL_LIMIT) ringPool.push(ring.group);
}

function createRing(ringId, y) {
  const group = acquireRingGroup();
  group.position.y = y;
  group.rotation.y = (ringId * 1.733 + Math.sin(ringId * 12.9898) * 2.1) % (Math.PI * 2);

  const danger = dangerIndicesForRing(ringId);
  const sectors = [];

  for (let index = 0; index < SECTORS; index++) {
    const start = index * SECTOR_ANGLE;
    const end = (index + 1) * SECTOR_ANGLE;
    const isDanger = danger.has(index);
    const mesh = new THREE.Mesh(
      sectorGeometries[index],
      isDanger ? dangerMaterial : safeMaterial
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.sectorIndex = index;
    group.add(mesh);
    sectors.push({
      type: isDanger ? 'danger' : 'safe',
      broken: false,
      mesh,
      start,
      end,
      index,
      color: isDanger ? activeTheme.dangerColor : activeTheme.baseColor
    });
  }

  const ring = {
    id: ringId,
    y,
    spacing: RING_STEP,
    rotationOffset: group.rotation.y,
    group,
    sectors,
    color: activeTheme.baseColor
  };
  sectors.forEach((sector) => createSegmentSensor(ring, sector));
  tower.add(group);
  return ring;
}

function clearDynamicObjects() {
  rings.forEach(releaseRing);
  rings = [];
  debris.forEach((item) => scene.remove(item.mesh));
  particles.forEach((item) => scene.remove(item.mesh));
  debris = [];
  particles = [];
  if (ball) scene.remove(ball);
  ball = null;
}

function buildLevelStacks() {
  for (let ringId = 0; ringId < LEVEL_STACKS; ringId++) {
    const ring = createRing(ringId, -ringId * RING_STEP);
    rings.push(ring);
    generatedRingId += 1;
  }
}

function cleanupPassedRings() {
  for (let i = rings.length - 1; i >= 0; i--) {
    if (rings[i].y > ballY + CLEANUP_DISTANCE && rings[i].id < currentRingId) {
      releaseRing(rings[i]);
      rings.splice(i, 1);
    }
  }

  if (pole) pole.position.y = ballY - 34;
  if (ground) ground.position.y = ballY - 18;
}

function resetEndlessWorld() {
  clearDynamicObjects();
  resetPhysicsWorld();
  applyLevelTheme(level || 1);
  generatedRingId = 0;
  currentRingId = 0;
  rotation = 0;
  tower.rotation.y = 0;

  const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 34, 34);
  const ballMaterial = new THREE.MeshPhongMaterial({
    color: ballColor,
    emissive: 0xff0f4f,
    emissiveIntensity: 0.16,
    shininess: 160,
    specular: 0xffffff
  });
  ball = new THREE.Mesh(ballGeometry, ballMaterial);
  ball.castShadow = true;
  scene.add(ball);

  ballY = RING_HEIGHT / 2 + BALL_RADIUS + 0.05;
  previousBallY = ballY;
  ballVY = 0;
  ball.position.set(LANE_RADIUS, ballY, 0);
  createBallPhysics(ballY);
  buildLevelStacks();
}

function normalizeAngle(angle) {
  return ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
}

function sectorAtLane(ring) {
  const localAngle = normalizeAngle(-(rotation + ring.rotationOffset));
  const index = Math.floor(localAngle / SECTOR_ANGLE) % SECTORS;
  const sector = ring.sectors[index];
  return sector && !sector.broken ? sector : null;
}

function raycastSector(ring) {
  const sector = sectorAtLane(ring);
  if (!sector || !sector.mesh) return sector;
  rayOrigin.set(LANE_RADIUS, previousBallY + BALL_RADIUS * 0.35, 0);
  raycaster.set(rayOrigin, rayDirection);
  raycaster.far = Math.abs(previousBallY - ring.y) + BALL_RADIUS + RING_HEIGHT + 0.45;
  const hits = raycaster.intersectObject(sector.mesh, false);
  return hits.length ? sector : null;
}

function detachBrokenSector(ring, sector, force) {
  sector.broken = true;
  removeSegmentSensor(sector);
  const worldPosition = new THREE.Vector3();
  const worldQuaternion = new THREE.Quaternion();
  const worldScale = new THREE.Vector3();
  ring.group.updateMatrixWorld(true);
  sector.mesh.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);
  ring.group.remove(sector.mesh);
  scene.add(sector.mesh);
  sector.mesh.position.copy(worldPosition);
  sector.mesh.quaternion.copy(worldQuaternion);
  sector.mesh.scale.copy(worldScale);
  sector.mesh.material = sector.mesh.material.clone();
  sector.mesh.material.transparent = true;
  sector.mesh.material.emissive.setHex(fireActive ? fireColor : sector.color);
  sector.mesh.material.emissiveIntensity = fireActive ? 0.9 : 0.35;

  const angle = sector.index * SECTOR_ANGLE + SECTOR_ANGLE / 2 + rotation;
  const outward = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
  debris.push({
    mesh: sector.mesh,
    velocity: new THREE.Vector3(outward.x * (2.2 + force), -3.2 - force, outward.z * (2.2 + force)),
    spin: new THREE.Vector3(Math.random() * 6, Math.random() * 5, Math.random() * 6),
    life: 1.05
  });
}

function flash(color, ms) {
  flashEl.style.background = color;
  flashEl.style.opacity = '1';
  window.clearTimeout(flashEl._timer);
  flashEl._timer = window.setTimeout(() => {
    flashEl.style.opacity = '0';
  }, ms);
}

function addShake(amount) {
  cameraShake = Math.min(0.45, cameraShake + amount);
}

function impactSquash(power) {
  squashTimer = 0.18;
  squashPower = Math.min(0.28, power);
}

function activateFire() {
  fireActive = true;
  fireTimer = FIRE_DURATION;
  fallChain = 0;
  fireModes += 1;
  firePowerBanner.classList.remove('hidden');
  if (ball) {
    ball.material.color.setHex(fireColor);
    ball.material.emissive.setHex(0xff2500);
    ball.material.emissiveIntensity = 0.95;
  }
  glowLight.color.setHex(0xff4b10);
  glowLight.intensity = 3.6;
  flash('rgba(255, 95, 30, 0.32)', 240);
  addShake(0.18);
  sfx.fire();
}

function deactivateFire() {
  fireActive = false;
  fireTimer = 0;
  firePowerBanner.classList.add('hidden');
  if (ball) {
    ball.material.color.setHex(ballColor);
    ball.material.emissive.setHex(0xff0f4f);
    ball.material.emissiveIntensity = 0.16;
  }
  glowLight.color.setHex(activeTheme.glow);
  glowLight.intensity = 1.55;
}

function addScore(points) {
  const comboBoost = 1 + Math.min(combo, 12) * 0.12;
  score += Math.round(points * comboBoost * (fireActive ? 1.65 : 1));
  multiplier = score / 100;
  if (window.parent) {
    window.parent.postMessage({ type: 'SCORE_UPDATE', payload: { multiplier, score } }, '*');
  }
}

function updateHUD() {
  hudLevel.textContent = level;
  hudMult.textContent = `${score}`;
  comboCount.textContent = combo;
  comboBadge.classList.toggle('hidden', combo < 2 && !fireActive);
}

function breakLayer(ring, sector) {
  detachBrokenSector(ring, sector, fireActive ? 2.5 : 1);
  currentRingId = Math.max(currentRingId, ring.id + 1);
  combo += 1;
  maxCombo = Math.max(maxCombo, combo);
  smashed += 1;
  fallChain += 1;
  lastReward += 1;
  ballVY = Math.min(ballVY, fireActive ? -16 : -11);
  setBallVelocity(ballVY);
  sfx.smash();
  flash(fireActive ? 'rgba(255, 80, 20, 0.2)' : 'rgba(255, 255, 255, 0.2)', 80);
  spawnBurst(ring.y, fireActive ? fireColor : sector.color, fireActive ? 15 : 8);
  addScore(10 + level * 2);
  addShake(holding ? 0.04 : 0.02);
  if (!fireActive && fallChain >= FIRE_CHAIN_TARGET) activateFire();
  updateHUD();
}

function bounceOnLayer(ring) {
  currentRingId = Math.max(currentRingId, ring.id);
  combo = 0;
  fallChain = 0;
  ballY = ring.y + RING_HEIGHT / 2 + BALL_RADIUS + 0.025;
  previousBallY = ballY;
  ballVY = BOUNCE_SPEED;
  setBallPhysicsY(ballY, 0);
  if (ballBody) {
    ballBody.applyImpulse({ x: 0, y: BOUNCE_IMPULSE, z: 0 }, true);
    syncBallFromPhysics();
  }
  impactSquash(0.18);
  sfx.bounce();
  updateHUD();
}

function handleCollision(ring) {
  const sector = raycastSector(ring);
  if (!sector) {
    currentRingId = Math.max(currentRingId, ring.id + 1);
    if (currentRingId >= LEVEL_STACKS) completeLevel();
    return 'passed';
  }

  if (sector.type === 'danger') {
    endGame('You touched a dark danger segment outside fire mode.');
    return 'ended';
  }

  if (holding || fireActive) {
    breakLayer(ring, sector);
    if (currentRingId >= LEVEL_STACKS) completeLevel();
    return 'smashed';
  }

  bounceOnLayer(ring);
  return 'bounced';
}

function processCollisions() {
  let checks = 0;
  while (checks < 8) {
    const ring = rings.find((item) => item.id >= currentRingId);
    if (!ring) return;
    const contactY = ring.y + RING_HEIGHT / 2 + BALL_RADIUS;
    const crossed = previousBallY >= contactY && ballY <= contactY;
    const solidContact = ballVY <= 0 && ballY <= contactY + 0.055;
    if (!crossed && !solidContact) return;

    const result = handleCollision(ring);
    if (result === 'ended' || result === 'bounced') return;
    previousBallY = contactY;
    checks += 1;
  }
}

function spawnBurst(y, color, amount) {
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
  for (let i = 0; i < amount; i++) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 0.065), material.clone());
    const angle = Math.random() * Math.PI * 2;
    mesh.position.set(LANE_RADIUS + Math.cos(angle) * 0.18, y, Math.sin(angle) * 0.18);
    scene.add(mesh);
    particles.push({
      mesh,
      life: 0.46 + Math.random() * 0.24,
      velocity: new THREE.Vector3(
        Math.cos(angle) * (1.45 + Math.random() * 1.2),
        1.2 + Math.random() * 1.7,
        Math.sin(angle) * (1.45 + Math.random() * 1.2)
      )
    });
  }
}

function spawnTrail() {
  if (!ball || ballVY > -5) return;
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(fireActive ? 0.08 : 0.052, 8, 8),
    new THREE.MeshBasicMaterial({
      color: fireActive ? fireColor : activeTheme.glow,
      transparent: true,
      opacity: fireActive ? 0.58 : 0.34
    })
  );
  mesh.position.copy(ball.position);
  scene.add(mesh);
  particles.push({ mesh, life: 0.33, velocity: new THREE.Vector3(0, 1.05, 0), trail: true });
}

function updateDebris(dt) {
  for (let i = debris.length - 1; i >= 0; i--) {
    const item = debris[i];
    item.life -= dt;
    item.velocity.y -= 8.5 * dt;
    item.mesh.position.addScaledVector(item.velocity, dt);
    item.mesh.rotation.x += item.spin.x * dt;
    item.mesh.rotation.y += item.spin.y * dt;
    item.mesh.rotation.z += item.spin.z * dt;
    item.mesh.material.opacity = Math.max(0, item.life);
    if (item.life <= 0) {
      scene.remove(item.mesh);
      if (item.mesh.material) item.mesh.material.dispose();
      debris.splice(i, 1);
    }
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const item = particles[i];
    item.life -= dt;
    if (!item.trail) item.velocity.y -= 5.5 * dt;
    item.mesh.position.addScaledVector(item.velocity, dt);
    item.mesh.material.opacity = Math.max(0, item.life * 1.9);
    item.mesh.scale.multiplyScalar(item.trail ? 0.92 : 0.985);
    if (item.life <= 0) {
      scene.remove(item.mesh);
      if (item.mesh.geometry && item.mesh.geometry.type !== 'BoxGeometry') item.mesh.geometry.dispose();
      if (item.mesh.material) item.mesh.material.dispose();
      particles.splice(i, 1);
    }
  }
}

function updateCamera(dt) {
  const targetX = 0.35;
  const targetY = ballY + 3.85;
  const targetZ = 10.2;
  const lerp = Math.min(1, dt * 5.5);
  camera.position.x += (targetX - camera.position.x) * lerp;
  camera.position.y += (targetY - camera.position.y) * lerp;
  camera.position.z += (targetZ - camera.position.z) * lerp;

  if (cameraShake > 0) {
    const shake = cameraShake;
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake * 0.65;
    cameraShake = Math.max(0, cameraShake - dt * 1.8);
  }

  cameraLook.set(0, ballY - 1.25, 0);
  camera.lookAt(cameraLook);
}

function updateBallVisual(dt) {
  if (!ball) return;
  ball.position.set(LANE_RADIUS, ballY, 0);
  ball.rotation.z -= ballVY * dt * 1.85;
  ball.rotation.x += (holding ? 8 : 3) * dt;

  let sx = 1;
  let sy = 1;
  if (squashTimer > 0) {
    const t = squashTimer / 0.18;
    sx += squashPower * t;
    sy -= squashPower * 0.72 * t;
    squashTimer = Math.max(0, squashTimer - dt);
  }
  if (fireActive) {
    const pulse = Math.sin(performance.now() * 0.018) * 0.075;
    sx += pulse;
    sy += pulse;
  }
  ball.scale.set(sx, sy, sx);
}

function simulatePhysics(simDt) {
  if (!physicsWorld || !ballBody) return;
  physicsWorld.gravity = {
    x: 0,
    y: holding || lastAction === 1 ? RAPIER_FAST_GRAVITY : RAPIER_NORMAL_GRAVITY,
    z: 0
  };

  const vel = ballBody.linvel();
  const terminal = fireActive ? -MAX_FIRE_SPEED : -MAX_FALL_SPEED;
  if ((holding || lastAction === 1) && vel.y > -10) setBallVelocity(-10);
  if (vel.y < terminal) setBallVelocity(terminal);

  physicsAccumulator += simDt;
  let substeps = 0;
  while (physicsAccumulator >= PHYSICS_DT && substeps < 24) {
    syncSegmentSensors();
    physicsWorld.step();
    physicsAccumulator -= PHYSICS_DT;
    substeps += 1;
  }
  syncBallFromPhysics();
}

function update(dt) {
  const simDt = Math.min(dt * timeScale, 0.45);
  const difficulty = Math.min(1.4, level * 0.065);
  rotationSpeed = Math.min(2.4, 0.9 + difficulty + smashed * 0.0025);
  rotation += rotationSpeed * simDt;
  tower.rotation.y = rotation;

  if (fireActive) {
    fireTimer -= simDt;
    if (fireTimer <= 0) deactivateFire();
  }

  previousBallY = ballY;
  simulatePhysics(simDt);

  if ((holding || lastAction === 1) && ballVY < -8) addShake(0.008);
  processCollisions();
  if (gameState !== 'playing') return;

  cleanupPassedRings();
  updateBallVisual(dt);
  if (holding || fireActive || lastAction === 1) spawnTrail();
  updateDebris(simDt);
  updateParticles(simDt);
  glowLight.position.set(LANE_RADIUS, ballY, 0);
  if (!headlessMode) updateCamera(dt);
  updateHUD();
}

function render() {
  if (headlessMode) return;
  renderer.render(scene, camera);
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000 || 0.016, 0.045);
  lastTime = now;
  if (gameState === 'playing') {
    update(dt);
  } else if (gameState === 'start') {
    rotation += 0.006;
    tower.rotation.y = rotation;
    camera.position.set(0.35, ballY + 3.85, 10.2);
    camera.lookAt(0, ballY - 1.25, 0);
    updateDebris(dt);
    updateParticles(dt);
  }
  render();
  requestAnimationFrame(loop);
}

function startGame(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  getAudio();
  gameState = 'playing';
  level = 1;
  score = 0;
  multiplier = 0;
  combo = 0;
  maxCombo = 0;
  smashed = 0;
  fireModes = 0;
  holding = false;
  fallChain = 0;
  lastAction = 0;
  lastReward = 0;
  episodeDone = false;
  episodeInfo = {};
  cameraShake = 0;
  squashTimer = 0;
  deactivateFire();
  resetEndlessWorld();

  overlayStart.classList.add('hidden');
  overlayResult.classList.add('hidden');
  gameHud.classList.remove('hidden');
  camera.position.set(0.35, ballY + 3.85, 10.2);
  camera.lookAt(0, ballY - 1.25, 0);
  updateHUD();
}

function completeLevel() {
  if (gameState !== 'playing') return;
  gameState = 'ended';
  episodeDone = true;
  episodeInfo = { reason: 'complete', score, level, smashed };
  lastReward += 5;
  holding = false;
  gameHud.classList.add('hidden');
  firePowerBanner.classList.add('hidden');
  flash('rgba(34, 197, 94, 0.42)', 420);
  spawnBurst(ballY, activeTheme.baseColor, 40);
  setTimeout(() => showResult('Level cleared. All 50 stacks are below you.', true), 650);
}

function endGame(message) {
  if (gameState !== 'playing') return;
  gameState = 'ended';
  episodeDone = true;
  episodeInfo = { reason: 'killer', message, score, level, smashed };
  lastReward -= 10;
  holding = false;
  gameHud.classList.add('hidden');
  firePowerBanner.classList.add('hidden');
  sfx.death();
  flash('rgba(239, 68, 68, 0.52)', 430);
  addShake(0.42);
  if (ball) {
    ball.visible = false;
    spawnBurst(ballY, 0xff2d2d, 34);
  }
  setTimeout(() => showResult(message, false), 650);
}

function showResult(message, won = false) {
  resTitle.textContent = won ? 'LEVEL CLEARED' : 'SHATTERED';
  resTitle.className = won ? 'res-title success' : 'res-title';
  resSubtitle.textContent = message || (won ? 'Perfect stack descent.' : 'A danger segment stopped the run.');
  resLevels.textContent = level;
  resPlatforms.textContent = smashed;
  resCombos.textContent = maxCombo;
  resFireModes.textContent = fireModes;
  resMult.textContent = `${score}`;
  overlayResult.classList.remove('hidden');

  if (window.parent) {
    window.parent.postMessage({ type: 'GAME_OVER', payload: { multiplier, score, won } }, '*');
  }
}

function resetEpisodeForAgent() {
  gameState = 'playing';
  level = 1;
  score = 0;
  multiplier = 0;
  combo = 0;
  maxCombo = 0;
  smashed = 0;
  fireModes = 0;
  holding = false;
  fallChain = 0;
  lastAction = 0;
  lastReward = 0;
  episodeDone = false;
  episodeInfo = {};
  cameraShake = 0;
  squashTimer = 0;
  deactivateFire();
  resetEndlessWorld();
  overlayStart.classList.add('hidden');
  overlayResult.classList.add('hidden');
  gameHud.classList.toggle('hidden', headlessMode);
  if (ball) ball.visible = !headlessMode;
  updateHUD();
  return getObservation();
}

function getNextRing() {
  return rings.find((item) => item.id >= currentRingId) || rings[0] || null;
}

function getTargetSegmentType(ring = getNextRing()) {
  if (!ring) return 'None';
  const sector = sectorAtLane(ring);
  if (!sector) return 'Destroyed';
  return sector.type === 'danger' ? 'Killer' : 'Safe';
}

function getObservation() {
  const ring = getNextRing();
  const targetSegmentType = getTargetSegmentType(ring);
  const distanceToNext = ring ? Math.max(0, ballY - (ring.y + RING_HEIGHT / 2 + BALL_RADIUS)) : 0;
  return {
    ballY,
    ballVelocityY: ballVY,
    currentVelocity: ballVY,
    platformRotation: normalizeAngle(rotation),
    angularVelocity: rotationSpeed,
    targetSegmentType,
    isDangerBelow: targetSegmentType === 'Killer',
    distanceToNext,
    nextPlatformY: ring ? ring.y : null,
    nextPlatformId: ring ? ring.id : null,
    section: level,
    score,
    combo,
    fireActive
  };
}

function step(action = 0) {
  if (gameState !== 'playing' || episodeDone) resetEpisodeForAgent();
  lastReward = 0;
  lastAction = action === 1 ? 1 : 0;
  holding = lastAction === 1;
  update(PHYSICS_DT);
  return {
    state: getObservation(),
    reward: lastReward,
    done: episodeDone,
    info: {
      ...episodeInfo,
      action: lastAction,
      destroyed: lastReward > 0
    }
  };
}

window.StackBallEnv = {
  ACTION_IDLE: 0,
  ACTION_SMASH: 1,
  step,
  reset: resetEpisodeForAgent,
  observe: getObservation,
  setHeadless(value = true) {
    headlessMode = Boolean(value);
    if (ball) ball.visible = !headlessMode;
    gameHud.classList.toggle('hidden', headlessMode || gameState !== 'playing');
    return headlessMode;
  },
  setTimeScale(value = 1) {
    timeScale = THREE.MathUtils.clamp(Number(value) || 1, 0.1, 30);
    return timeScale;
  },
  get internals() {
    return { physicsWorld, ballBody, ballCollider, rings };
  }
};

function setHolding(value, event) {
  if (event) event.preventDefault();
  if (gameState !== 'playing') return;
  holding = value;
  lastAction = value ? 1 : 0;
  if (value) getAudio();
}

shell.addEventListener('pointerdown', (event) => setHolding(true, event));
window.addEventListener('pointerup', (event) => setHolding(false, event));
window.addEventListener('pointercancel', (event) => setHolding(false, event));
window.addEventListener('blur', () => { holding = false; });

btnStart.addEventListener('click', startGame);
btnPlayAgain.addEventListener('click', startGame);

buildStaticScene();
resetEndlessWorld();
gameState = 'start';
lastTime = performance.now();
requestAnimationFrame(loop);
