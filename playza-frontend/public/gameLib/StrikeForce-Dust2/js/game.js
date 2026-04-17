// ── Main Game Orchestrator ────────────────────────────────────────────────────

// --- Three.js init ---
scene    = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.FogExp2(0x87ceeb, 0.006);

camera   = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById("game-container").appendChild(renderer.domElement);

// Weapon group attached to camera
weaponGroup = new THREE.Group();
camera.add(weaponGroup);
scene.add(camera);

// --- Lighting ---
const ambient = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff4e5, 1.1);
sun.position.set(80, 160, 50);
sun.castShadow = true;
sun.shadow.mapSize.width = sun.shadow.mapSize.height = 2048;
sun.shadow.camera.near =  0.5; sun.shadow.camera.far = 600;
sun.shadow.camera.left = -220; sun.shadow.camera.right = 220;
sun.shadow.camera.top   = 220; sun.shadow.camera.bottom= -220;
scene.add(sun);

// Fill light (opposite side)
const fill = new THREE.DirectionalLight(0xc8d8ff, 0.35);
fill.position.set(-50, 80, -50);
scene.add(fill);

// Sky hemisphere light
const sky = new THREE.HemisphereLight(0x87ceeb, 0xd4a84b, 0.4);
scene.add(sky);

// ── Build the world ────────────────────────────────────────────────────────────
buildMap();

// ── Round timer ───────────────────────────────────────────────────────────────
let roundTimerInterval = null;

function startRoundTimer() {
  clearInterval(roundTimerInterval);
  gameState.roundTime = 180;
  roundTimerInterval = setInterval(() => {
    if (!gameState.started) return;
    gameState.roundTime = Math.max(0, gameState.roundTime - 1);
    updateHUD();
    if (gameState.roundTime <= 0) endRound("time");
  }, 1000);
}

function endRound(reason) {
  gameState.roundNumber++;
  clearInterval(roundTimerInterval);
  showAnnouncement(reason==="time" ? "⏱ ROUND OVER" : "ROUND COMPLETE", 3000);
  setTimeout(() => {
    spawnBots();
    startRoundTimer();
    showAnnouncement(`ROUND ${gameState.roundNumber}`, 2000);
    // Restore armor each round
    gameState.armor = gameState.maxArmor;
    updateHUD();
  }, 3500);
}

// ── Minimap zoom toggle ────────────────────────────────────────────────────────
function setupMinimapZoom() {
  const zoomEl = document.getElementById("minimap-zoom");
  if (!zoomEl) return;
  zoomEl.style.pointerEvents = "auto";
  zoomEl.addEventListener("click", () => {
    _mapZoomLevel = (_mapZoomLevel + 1) % _mapZoomScales.length;
    zoomEl.textContent = _mapZoomLabels[_mapZoomLevel];
  });
}

// ── Start / Restart ────────────────────────────────────────────────────────────
function startGame() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-over").style.display    = "none";

  gameState.started  = true;
  gameState.health   = 100;
  gameState.armor    = 100;
  gameState.kills    = 0;
  gameState.deaths   = 0;
  gameState.headshots= 0;
  gameState.ctScore  = 0;
  gameState.tScore   = 0;
  gameState.roundNumber = 1;
  gameState.isCrouched  = false;
  gameState.isADS       = false;

  camera.position.set(0, PLAYER_HEIGHT, -120);
  yaw = 0; pitch = 0;
  verticalVelocity = 0;
  isJumping = false; canJump = true;

  switchWeapon("ak47");
  spawnBots();
  updateHUD();
  startRoundTimer();
  showAnnouncement("ROUND 1 — FIGHT!", 2500);

  renderer.domElement.requestPointerLock();
}

function doGameOver() {
  gameState.started = false;
  clearInterval(roundTimerInterval);
  document.exitPointerLock();

  document.getElementById("go-kills").textContent     = gameState.kills;
  document.getElementById("go-headshots").textContent = gameState.headshots;
  document.getElementById("go-deaths").textContent    = gameState.deaths;
  document.getElementById("go-round").textContent     = gameState.roundNumber;
  document.getElementById("game-over").style.display  = "flex";

  window.parent.postMessage({
    type:"PLAYZA_SCORE_SUBMISSION",
    payload:{ score: gameState.kills*100 + gameState.headshots*50 - gameState.deaths*30 }
  }, "*");
}

// ── Event listeners ────────────────────────────────────────────────────────────
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("restart-btn").addEventListener("click", startGame);
setupKeyboard();
setupMouse();
setupMobileControls();
setupMinimapZoom();

// ── Game Loop ──────────────────────────────────────────────────────────────────
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt  = Math.min((now - lastTime) / 1000, 0.05); // cap delta
  lastTime  = now;

  if (gameState.started) {
    updatePlayer(dt);
    updateBots(dt);
    updateGrenades(dt);
    updateMinimap();
  }

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
