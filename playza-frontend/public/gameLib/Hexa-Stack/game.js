import * as THREE from './three.module.js';

const CONFIG = {
  radius: 3,
  cellSize: 0.68,
  layerHeight: 0.082,
  clearRun: 10,
  maxStackHeight: 22,
  traySize: 3,
  levelTarget: 150,
  colors: [
    { id: 0, name: 'blue', main: 0x2f76ff, side: 0x1c46b3, emissive: 0x08285f },
    { id: 1, name: 'green', main: 0x37f04e, side: 0x159b2b, emissive: 0x0b4a17 },
    { id: 2, name: 'yellow', main: 0xfff238, side: 0xc89a16, emissive: 0x5f4508 },
    { id: 3, name: 'pink', main: 0xe12cff, side: 0x8d1fb5, emissive: 0x42115b },
    { id: 4, name: 'cyan', main: 0x26d9ef, side: 0x1595aa, emissive: 0x0a4653 },
    { id: 5, name: 'orange', main: 0xff8f24, side: 0xb95712, emissive: 0x5a2707 },
    { id: 6, name: 'red', main: 0xff3d48, side: 0xb51f2b, emissive: 0x5a1016 }
  ],
  neighborDirs: [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]
};

const dom = {
  root: document.body,
  container: document.getElementById('game-container'),
  target: document.getElementById('render-target'),
  dragLayer: document.getElementById('drag-layer'),
  score: document.getElementById('stat-score'),
  comboBadge: document.getElementById('combo-badge'),
  combo: document.getElementById('stat-combo'),
  moves: document.getElementById('stat-moves'),
  level: document.getElementById('stat-level'),
  pressureFill: document.getElementById('pressure-fill'),
  pressureLabel: document.getElementById('pressure-label'),
  missionText: document.getElementById('mission-text'),
  missionCount: document.getElementById('mission-count'),
  toast: document.getElementById('toast'),
  startModal: document.getElementById('modal-start'),
  pauseModal: document.getElementById('modal-pause'),
  overModal: document.getElementById('modal-over'),
  finalScore: document.getElementById('final-score'),
  peakCombo: document.getElementById('peak-combo'),
  start: document.getElementById('btn-start'),
  pause: document.getElementById('btn-pause'),
  resume: document.getElementById('btn-resume'),
  restart: document.getElementById('btn-restart'),
  restartPause: document.getElementById('btn-restart-pause'),
  spawnSlots: [...document.querySelectorAll('.spawn-slot')],
  powerups: [...document.querySelectorAll('.powerup')]
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rand = (min, max) => min + Math.random() * (max - min);
const keyOf = (q, r) => `${q},${r}`;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const easeOutBack = (t) => 1 + 2.55 * Math.pow(t - 1, 3) + 1.55 * Math.pow(t - 1, 2);

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = false;
  }

  unlock() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.1;
    this.master.connect(this.ctx.destination);
    this.enabled = true;
  }

  tone(freq, duration = 0.08, type = 'sine', gain = 1) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.frequency.setValueAtTime(freq, now);
    osc.type = type;
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(0.28 * gain, now + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp);
    amp.connect(this.master);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  place() {
    this.tone(360, 0.06, 'triangle', 0.75);
    setTimeout(() => this.tone(480, 0.05, 'triangle', 0.55), 34);
  }

  sort(combo) {
    this.tone(520 + combo * 44, 0.08, 'sine', 0.82);
    setTimeout(() => this.tone(720 + combo * 52, 0.07, 'triangle', 0.58), 36);
  }

  clear(combo) {
    this.tone(140, 0.16, 'sawtooth', 0.7);
    setTimeout(() => this.tone(900 + combo * 40, 0.14, 'sine', 0.85), 64);
  }

  bad() {
    this.tone(170, 0.08, 'sawtooth', 0.56);
  }
}

class StateStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.score = 0;
    this.progress = 0;
    this.combo = 0;
    this.maxCombo = 1;
    this.moves = 0;
    this.level = 2;
    this.powerups = { hammer: 2, swap: 1, shuffle: 1, color: 1, undo: 1 };
    this.history = [];
    this.paused = true;
    this.over = false;
    this.selectedPower = null;
    this.swapSource = null;
  }

  snapshot(cells, tray) {
    const board = cells.map((cell) => ({
      key: cell.key,
      layers: cell.stack ? [...cell.stack.layers] : null
    }));
    this.history.push({
      board,
      tray: tray.map((item) => item ? { layers: [...item.layers] } : null),
      score: this.score,
      progress: this.progress,
      moves: this.moves
    });
    if (this.history.length > 8) this.history.shift();
  }
}

class HexaSortGame {
  constructor() {
    this.store = new StateStore();
    this.audio = new AudioSystem();
    this.clock = new THREE.Clock();
    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.pointerWorld = new THREE.Vector3();
    this.cells = [];
    this.cellMap = new Map();
    this.tray = [];
    this.animations = [];
    this.particles = [];
    this.drag = null;
    this.hoverCell = null;
    this.resolving = false;

    this.createRenderer();
    this.createScene();
    this.createMaterials();
    this.createGeometry();
    this.createBoard();
    this.bindEvents();
    this.reset();

    if (new URLSearchParams(window.location.search).has('smoke')) {
      this.store.paused = false;
      dom.startModal.classList.add('hidden');
    }

    this.loop();
    window.parent?.postMessage({ type: 'PLAYZA_READY', game: 'hexa-3d-sort' }, '*');
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    this.renderer.setSize(dom.target.clientWidth, dom.target.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    dom.target.appendChild(this.renderer.domElement);
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x2a0705, 9, 24);

    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
    this.camera.position.set(0, 8.8, 7.8);
    this.camera.lookAt(0, 0, 0);
    this.cameraBase = this.camera.position.clone();

    this.scene.add(new THREE.HemisphereLight(0xfff2dd, 0x3d0907, 2.45));

    const key = new THREE.DirectionalLight(0xffffff, 2.85);
    key.position.set(-3.8, 8, 4.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1536, 1536);
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    this.scene.add(key);

    const rim = new THREE.PointLight(0xffffff, 22, 16);
    rim.position.set(4.2, 4.4, -4.4);
    this.scene.add(rim);

    this.boardGroup = new THREE.Group();
    this.boardGroup.rotation.x = -0.1;
    this.boardGroup.position.z = -0.2;
    this.scene.add(this.boardGroup);

    this.stackGroup = new THREE.Group();
    this.boardGroup.add(this.stackGroup);

    this.fxGroup = new THREE.Group();
    this.scene.add(this.fxGroup);

    const floorGeo = new THREE.CircleGeometry(7.6, 96);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x64100b,
      emissive: 0x250302,
      emissiveIntensity: 0.18,
      roughness: 0.74,
      metalness: 0.08,
      transparent: true,
      opacity: 0.92
    });
    this.floor = new THREE.Mesh(floorGeo, floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -0.15;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
  }

  createMaterials() {
    this.materials = CONFIG.colors.map((color) => new THREE.MeshStandardMaterial({
      color: color.main,
      emissive: color.emissive,
      emissiveIntensity: 0.08,
      roughness: 0.31,
      metalness: 0.14
    }));

    this.sideMaterials = CONFIG.colors.map((color) => new THREE.MeshStandardMaterial({
      color: color.side,
      emissive: color.emissive,
      emissiveIntensity: 0.04,
      roughness: 0.44,
      metalness: 0.12
    }));

    this.cellMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a0d09,
      emissive: 0x170100,
      emissiveIntensity: 0.2,
      roughness: 0.68,
      metalness: 0.04
    });
    this.hoverMaterial = new THREE.MeshStandardMaterial({
      color: 0x7e1b12,
      emissive: 0xff8f24,
      emissiveIntensity: 0.28,
      roughness: 0.42,
      metalness: 0.08
    });
    this.invalidMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9a2ac,
      emissive: 0xff3d48,
      emissiveIntensity: 0.18,
      roughness: 0.52,
      metalness: 0.06
    });
  }

  createGeometry() {
    this.baseGeometry = new THREE.CylinderGeometry(0.46, 0.47, 0.07, 6, 1, false);
    this.baseGeometry.rotateY(Math.PI / 6);
    this.layerGeometry = new THREE.CylinderGeometry(0.4, 0.43, CONFIG.layerHeight, 6, 1, false);
    this.layerGeometry.rotateY(Math.PI / 6);
    this.ringGeometry = new THREE.RingGeometry(0.28, 0.48, 64);
    this.particleGeometry = new THREE.SphereGeometry(0.045, 8, 8);
  }

  createBoard() {
    this.cells = [];
    this.cellMap.clear();
    this.boardGroup.clear();
    this.boardGroup.add(this.stackGroup);

    this.boardCoordsForLevel(this.store.level).forEach(({ q, r }) => {
      const pos = this.axialToWorld(q, r);
      const base = new THREE.Mesh(this.baseGeometry, this.cellMaterial);
      base.position.set(pos.x, 0, pos.z);
      base.receiveShadow = true;
      base.castShadow = true;
      const cell = { q, r, key: keyOf(q, r), position: pos, base, stack: null, pulse: Math.random() * Math.PI * 2 };
      base.userData.cell = cell;
      this.cells.push(cell);
      this.cellMap.set(cell.key, cell);
      this.boardGroup.add(base);
    });
  }

  boardCoordsForLevel(level) {
    const targetCount = this.boardCellCountForLevel(level);
    const coords = [];
    for (let q = -CONFIG.radius; q <= CONFIG.radius; q += 1) {
      const rMin = Math.max(-CONFIG.radius, -q - CONFIG.radius);
      const rMax = Math.min(CONFIG.radius, -q + CONFIG.radius);
      for (let r = rMin; r <= rMax; r += 1) {
        coords.push({ q, r, distance: Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r)) });
      }
    }
    coords.sort((a, b) => a.distance - b.distance || Math.abs(a.q + a.r) - Math.abs(b.q + b.r) || a.r - b.r || a.q - b.q);
    return coords.slice(0, targetCount).map(({ q, r }) => ({ q, r }));
  }

  boardCellCountForLevel(level) {
    if (level <= 2) return 8;
    if (level === 3) return 10;
    if (level === 4) return 12;
    if (level === 5) return 15;
    if (level === 6) return 19;
    if (level <= 8) return 24;
    if (level <= 10) return 30;
    return 37;
  }

  axialToWorld(q, r) {
    return new THREE.Vector3(
      CONFIG.cellSize * Math.sqrt(3) * (q + r / 2),
      0,
      CONFIG.cellSize * 1.5 * r
    );
  }

  reset() {
    this.store.reset();
    this.clearStacks();
    this.createBoard();
    this.seedLevel();
    this.tray = Array.from({ length: CONFIG.traySize }, () => this.generateTrayStack());
    this.syncUI();
    this.renderTray();
    this.showToast('Sort matching colors');
    this.resize();
  }

  seedLevel() {
    const seededCount = clamp(Math.floor(this.cells.length * 0.42), 2, Math.max(2, this.cells.length - 3));
    const sortedCells = [...this.cells].sort((a, b) => {
      const da = Math.max(Math.abs(a.q), Math.abs(a.r), Math.abs(-a.q - a.r));
      const db = Math.max(Math.abs(b.q), Math.abs(b.r), Math.abs(-b.q - b.r));
      return db - da || a.q - b.q || a.r - b.r;
    });
    sortedCells.slice(0, seededCount).forEach((cell, index) => {
      const color = index % Math.min(CONFIG.colors.length, 5);
      const lower = (color + 1 + (index % 3)) % CONFIG.colors.length;
      const height = 2 + (index % 4);
      const layers = Array.from({ length: height }, () => color);
      if (index % 4 === 0) layers.unshift(lower);
      this.spawnAt(cell, { layers }, false);
    });
  }

  clearStacks() {
    this.cells.forEach((cell) => {
      cell.stack = null;
      cell.base.material = this.cellMaterial;
    });
    while (this.stackGroup.children.length) {
      this.stackGroup.remove(this.stackGroup.children[0]);
    }
    this.particles.length = 0;
    this.fxGroup.clear();
  }

  generateTrayStack() {
    const unlocked = clamp(4 + Math.floor((this.store.level - 1) / 4), 4, CONFIG.colors.length);
    const groups = clamp(1 + Math.floor(Math.random() * 3) + (this.store.moves > 7 && Math.random() < 0.35 ? 1 : 0), 1, 4);
    const layers = [];
    let last = -1;
    for (let i = 0; i < groups; i += 1) {
      let color = Math.floor(Math.random() * unlocked);
      if (color === last) color = (color + 1 + Math.floor(Math.random() * (unlocked - 1))) % unlocked;
      last = color;
      const count = clamp(1 + Math.floor(Math.random() * 3), 1, 3);
      for (let j = 0; j < count; j += 1) layers.push(color);
    }
    return { layers: layers.slice(0, 8) };
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    dom.start.addEventListener('click', () => {
      this.audio.unlock();
      this.store.paused = false;
      dom.startModal.classList.add('hidden');
    });

    dom.pause.addEventListener('click', () => this.pause());
    dom.resume.addEventListener('click', () => this.resume());
    dom.restart.addEventListener('click', () => this.restart());
    dom.restartPause.addEventListener('click', () => this.restart());

    dom.spawnSlots.forEach((slot) => {
      slot.addEventListener('pointerdown', (event) => this.beginDrag(event, Number(slot.dataset.slot)));
    });

    window.addEventListener('pointermove', (event) => this.movePointer(event));
    window.addEventListener('pointerup', (event) => this.endPointer(event));
    this.renderer.domElement.addEventListener('pointerdown', (event) => this.onBoardPointer(event));

    dom.powerups.forEach((button) => {
      button.addEventListener('click', () => this.selectPowerup(button.dataset.powerup));
    });
  }

  pause() {
    if (this.store.over || !dom.startModal.classList.contains('hidden')) return;
    this.store.paused = true;
    dom.pauseModal.classList.remove('hidden');
  }

  resume() {
    this.audio.unlock();
    this.store.paused = false;
    dom.pauseModal.classList.add('hidden');
  }

  restart() {
    dom.pauseModal.classList.add('hidden');
    dom.overModal.classList.add('hidden');
    dom.startModal.classList.add('hidden');
    this.audio.unlock();
    this.reset();
    this.store.paused = false;
  }

  beginDrag(event, index) {
    if (this.store.paused || this.store.over || this.resolving || !this.tray[index]) return;
    event.preventDefault();
    this.audio.unlock();
    this.store.selectedPower = null;
    this.updatePowerButtons();
    this.drag = {
      index,
      stack: { layers: [...this.tray[index].layers] },
      element: this.createDragPreview(this.tray[index])
    };
    dom.spawnSlots[index].classList.add('selected');
    dom.dragLayer.appendChild(this.drag.element);
    this.moveDragElement(event.clientX, event.clientY);
    this.updateBoardHover(event);
  }

  movePointer(event) {
    if (this.store.paused || this.store.over) return;
    if (this.drag) {
      event.preventDefault();
      this.moveDragElement(event.clientX, event.clientY);
      this.updateBoardHover(event);
    } else if (this.store.selectedPower) {
      this.updateBoardHover(event, true);
    }
  }

  endPointer(event) {
    if (!this.drag) return;
    event.preventDefault();
    const cell = this.updateBoardHover(event);
    const canPlace = cell && !cell.stack;
    const stack = this.drag.stack;
    const index = this.drag.index;
    this.cleanupDrag();

    if (!canPlace) {
      this.audio.bad();
      this.showToast('Choose an empty hex');
      this.invalidPlacementFeedback();
      return;
    }
    this.placeStack(cell, stack, index);
  }

  onBoardPointer(event) {
    if (this.store.paused || this.store.over || this.resolving || this.drag) return;
    const cell = this.pickCell(event);
    if (!cell || !this.store.selectedPower) return;
    this.applyPowerup(cell);
  }

  moveDragElement(clientX, clientY) {
    if (!this.drag?.element) return;
    const rect = dom.container.getBoundingClientRect();
    this.drag.element.style.left = `${clientX - rect.left}px`;
    this.drag.element.style.top = `${clientY - rect.top}px`;
  }

  cleanupDrag() {
    if (this.drag?.element?.parentNode) this.drag.element.parentNode.removeChild(this.drag.element);
    dom.spawnSlots.forEach((slot) => slot.classList.remove('selected'));
    this.drag = null;
    this.setHoverCell(null);
  }

  updateBoardHover(event, allowOccupied = false) {
    const cell = this.pickCell(event);
    this.setHoverCell(cell, allowOccupied);
    return cell;
  }

  pickCell(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const baseHits = this.raycaster.intersectObjects(this.cells.map((cell) => cell.base), false);
    if (baseHits.length) return baseHits[0].object.userData.cell;

    this.raycaster.ray.intersectPlane(this.groundPlane, this.pointerWorld);
    let best = null;
    let bestDistance = 0.5;
    this.cells.forEach((cell) => {
      const distance = Math.hypot(this.pointerWorld.x - cell.position.x, this.pointerWorld.z - cell.position.z);
      if (distance < bestDistance) {
        best = cell;
        bestDistance = distance;
      }
    });
    return best;
  }

  setHoverCell(cell, allowOccupied = false) {
    this.cells.forEach((item) => {
      item.base.material = this.cellMaterial;
    });
    this.hoverCell = cell;
    if (!cell) return;
    cell.base.material = allowOccupied || !cell.stack ? this.hoverMaterial : this.invalidMaterial;
  }

  async placeStack(cell, stack, trayIndex) {
    this.store.snapshot(this.cells, this.tray);
    this.tray[trayIndex] = null;
    this.spawnAt(cell, stack, true);
    this.audio.place();
    this.store.moves += 1;
    this.store.score += 8 * stack.layers.length;
    this.syncUI();
    this.renderTray();
    await wait(180);
    await this.resolveBoard(cell);
    this.refillTrayIfEmpty();
    this.checkLoss();
  }

  spawnAt(cell, stack, animate = false) {
    if (cell.stack?.group) this.stackGroup.remove(cell.stack.group);
    const layers = [...stack.layers];
    const group = this.createStackMesh(layers);
    group.position.set(cell.position.x, animate ? 0.75 : 0, cell.position.z);
    group.scale.setScalar(animate ? 0.62 : 1);
    group.userData.cell = cell;
    this.stackGroup.add(group);
    cell.stack = { layers, group };
    if (animate) {
      this.animate({
        duration: 330,
        update: (t) => {
          const e = easeOutBack(t);
          group.position.y = (1 - e) * 0.75;
          group.scale.setScalar(0.62 + 0.38 * e);
        }
      });
    }
  }

  createStackMesh(layers) {
    const group = new THREE.Group();
    layers.forEach((color, index) => {
      const layer = new THREE.Mesh(this.layerGeometry, [this.sideMaterials[color], this.materials[color], this.sideMaterials[color]]);
      layer.position.y = 0.075 + index * CONFIG.layerHeight;
      layer.castShadow = true;
      layer.receiveShadow = true;
      layer.userData.baseY = layer.position.y;
      group.add(layer);
    });
    const top = this.topColor({ layers });
    const glow = new THREE.PointLight(CONFIG.colors[top]?.main || 0xffffff, clamp(layers.length * 0.08, 0.18, 1), 2.2);
    glow.position.y = 0.24 + layers.length * CONFIG.layerHeight;
    group.add(glow);
    return group;
  }

  rebuildStack(cell, pulse = true) {
    if (!cell.stack || !cell.stack.layers.length) {
      this.clearCell(cell, false);
      return;
    }
    const layers = [...cell.stack.layers];
    if (cell.stack.group) this.stackGroup.remove(cell.stack.group);
    this.spawnAt(cell, { layers }, false);
    if (pulse) {
      const group = cell.stack.group;
      this.animate({
        duration: 230,
        update: (t) => {
          const s = 1 + Math.sin(t * Math.PI) * 0.13;
          group.scale.set(s, 1 + Math.sin(t * Math.PI) * 0.08, s);
        },
        complete: () => group.scale.set(1, 1, 1)
      });
    }
  }

  async resolveBoard(origin) {
    this.resolving = true;
    let combo = 0;
    let changed = true;
    let guard = 0;

    while (changed && guard < 80) {
      guard += 1;
      changed = false;
      const match = this.findSortMove(origin) || this.findSortMove();
      if (match) {
        combo += 1;
        await this.transferTopRun(match.from, match.to, combo);
        origin = match.to;
        changed = true;
      }

      const cleared = await this.clearCompleteRuns(combo || 1);
      if (cleared) {
        combo += cleared;
        changed = true;
      }
    }

    this.store.combo = 0;
    this.resolving = false;
    this.syncUI();
    if (this.store.progress >= CONFIG.levelTarget) this.completeLevel();
  }

  findSortMove(preferred) {
    if (preferred?.stack) {
      const preferredColor = this.topColor(preferred.stack);
      const source = this.neighbors(preferred)
        .filter((neighbor) => neighbor.stack && this.topColor(neighbor.stack) === preferredColor)
        .sort((a, b) => this.topRunCount(b.stack) - this.topRunCount(a.stack) || b.stack.layers.length - a.stack.layers.length)[0];
      if (source && preferred.stack.layers.length + this.topRunCount(source.stack) <= CONFIG.maxStackHeight) {
        return { from: source, to: preferred };
      }
    }

    const candidates = preferred?.stack ? [preferred, ...this.cells.filter((cell) => cell !== preferred && cell.stack)] : this.cells.filter((cell) => cell.stack);
    for (const cell of candidates) {
      const color = this.topColor(cell.stack);
      if (color === null) continue;
      const same = this.neighbors(cell).filter((neighbor) => neighbor.stack && this.topColor(neighbor.stack) === color);
      if (!same.length) continue;
      const target = [cell, ...same].sort((a, b) => a.stack.layers.length - b.stack.layers.length || this.topRunCount(a.stack) - this.topRunCount(b.stack))[0];
      const from = [cell, ...same].filter((item) => item !== target).sort((a, b) => this.topRunCount(b.stack) - this.topRunCount(a.stack))[0];
      if (from && target.stack.layers.length + this.topRunCount(from.stack) <= CONFIG.maxStackHeight) {
        return { from, to: target };
      }
    }
    return null;
  }

  async transferTopRun(from, to, combo) {
    const color = this.topColor(from.stack);
    const count = this.topRunCount(from.stack);
    const moved = from.stack.layers.splice(from.stack.layers.length - count, count);
    const fromGroup = from.stack.group;
    this.flyStack(fromGroup, from, to);
    to.stack.layers.push(...moved);
    this.store.combo = Math.max(2, combo + 1);
    this.store.maxCombo = Math.max(this.store.maxCombo, this.store.combo);
    this.store.score += (30 * count + 40) * this.store.combo;
    this.audio.sort(this.store.combo);
    this.emitParticles(to.position, color, 14 + count * 4, 0.9);
    this.shake(0.025 + combo * 0.006, 150);
    await wait(250);
    if (!from.stack.layers.length) this.clearCell(from, false);
    else this.rebuildStack(from, false);
    this.rebuildStack(to, true);
    this.syncUI();
  }

  async clearCompleteRuns(combo) {
    let cleared = 0;
    for (const cell of this.cells) {
      if (!cell.stack) continue;
      const color = this.topColor(cell.stack);
      const count = this.topRunCount(cell.stack);
      if (count < CONFIG.clearRun) continue;
      cleared += 1;
      cell.stack.layers.splice(cell.stack.layers.length - count, count);
      this.store.progress = clamp(this.store.progress + count * 10, 0, CONFIG.levelTarget);
      this.store.score += count * 95 * Math.max(1, combo);
      this.audio.clear(combo);
      this.emitShockwave(cell.position, color);
      this.emitParticles(cell.position, color, 58, 1.6);
      this.shake(0.12, 320);
      await wait(165);
      if (!cell.stack.layers.length) this.clearCell(cell, true);
      else this.rebuildStack(cell, true);
    }
    return cleared;
  }

  flyStack(group, from, to) {
    if (!group) return;
    const start = new THREE.Vector3(from.position.x, 0, from.position.z);
    const end = new THREE.Vector3(to.position.x, 0.05, to.position.z);
    this.animate({
      duration: 240,
      update: (t) => {
        const e = 1 - Math.pow(1 - t, 3);
        group.position.lerpVectors(start, end, e);
        group.position.y += Math.sin(t * Math.PI) * 0.72;
        group.scale.setScalar(1 - t * 0.36);
      }
    });
  }

  clearCell(cell, animated = true) {
    if (!cell.stack) return;
    const group = cell.stack.group;
    if (animated && group) {
      this.animate({
        duration: 250,
        update: (t) => {
          group.scale.setScalar(1 - t);
          group.rotation.y = t * Math.PI;
        },
        complete: () => this.stackGroup.remove(group)
      });
    } else if (group) {
      this.stackGroup.remove(group);
    }
    cell.stack = null;
  }

  topColor(stack) {
    return stack?.layers?.length ? stack.layers[stack.layers.length - 1] : null;
  }

  topRunCount(stack) {
    const color = this.topColor(stack);
    if (color === null) return 0;
    let count = 0;
    for (let i = stack.layers.length - 1; i >= 0; i -= 1) {
      if (stack.layers[i] !== color) break;
      count += 1;
    }
    return count;
  }

  neighbors(cell) {
    return CONFIG.neighborDirs
      .map(([dq, dr]) => this.cellMap.get(keyOf(cell.q + dq, cell.r + dr)))
      .filter(Boolean);
  }

  refillTrayIfEmpty() {
    if (this.tray.some(Boolean)) {
      this.renderTray();
      this.syncUI();
      return;
    }
    this.tray = Array.from({ length: CONFIG.traySize }, () => this.generateTrayStack());
    this.renderTray(true);
    this.audio.place();
    this.showToast('New tiles');
    this.syncUI();
  }

  boardPressure() {
    return this.cells.filter((cell) => cell.stack).length / this.cells.length;
  }

  checkLoss() {
    if (this.boardPressure() < 1 || this.cells.some((cell) => !cell.stack)) return;
    this.store.over = true;
    this.store.paused = true;
    dom.finalScore.textContent = Math.floor(this.store.score).toLocaleString();
    dom.peakCombo.textContent = `${this.store.progress}/${CONFIG.levelTarget}`;
    dom.overModal.classList.remove('hidden');
  }

  completeLevel() {
    this.showToast('Level complete');
    this.store.level += 1;
    this.store.progress = 0;
    this.store.powerups.hammer += 1;
    setTimeout(() => {
      this.clearStacks();
      this.createBoard();
      this.seedLevel();
      this.tray = Array.from({ length: CONFIG.traySize }, () => this.generateTrayStack());
      this.renderTray();
      this.syncUI();
    }, 900);
  }

  selectPowerup(type) {
    if (this.store.paused || this.store.over || this.resolving) return;
    if (!this.store.powerups[type]) {
      this.audio.bad();
      this.showToast('Powerup empty');
      return;
    }
    if (type === 'undo') {
      if (!this.store.history.length) {
        this.audio.bad();
        this.showToast('Nothing to undo');
        return;
      }
      this.undo();
      this.consumePowerup(type);
      this.audio.place();
      this.syncUI();
      return;
    }
    if (type === 'shuffle') {
      if (!this.cells.some((cell) => cell.stack)) {
        this.audio.bad();
        this.showToast('No stacks yet');
        return;
      }
      this.store.snapshot(this.cells, this.tray);
      this.shuffleBoard();
      this.consumePowerup(type);
      this.audio.sort(3);
      this.syncUI();
      return;
    }
    this.store.selectedPower = this.store.selectedPower === type ? null : type;
    this.store.swapSource = null;
    this.updatePowerButtons();
    this.showToast(this.store.selectedPower ? `${type} ready` : 'Powerup cancelled');
  }

  applyPowerup(cell) {
    const type = this.store.selectedPower;
    if (!type) return;
    this.store.snapshot(this.cells, this.tray);

    if (type === 'hammer') {
      if (!cell.stack) return this.rejectPower();
      const color = this.topColor(cell.stack);
      const count = this.topRunCount(cell.stack);
      cell.stack.layers.splice(cell.stack.layers.length - count, count);
      this.emitParticles(cell.position, color, 34, 1.2);
      if (!cell.stack.layers.length) this.clearCell(cell, true);
      else this.rebuildStack(cell, true);
      this.consumePowerup(type);
      this.store.score += 120;
      this.audio.clear(1);
    }

    if (type === 'swap') {
      if (!cell.stack) return this.rejectPower();
      if (!this.store.swapSource) {
        this.store.swapSource = cell;
        cell.base.material = this.hoverMaterial;
        this.showToast('Pick swap target');
        return;
      }
      if (this.store.swapSource === cell) return this.rejectPower();
      this.swapCells(this.store.swapSource, cell);
      this.store.swapSource = null;
      this.consumePowerup(type);
      this.audio.sort(2);
    }

    if (type === 'color') {
      if (!cell.stack) return this.rejectPower();
      const count = this.topRunCount(cell.stack);
      const old = this.topColor(cell.stack);
      let next = Math.floor(Math.random() * CONFIG.colors.length);
      if (next === old) next = (next + 1) % CONFIG.colors.length;
      for (let i = cell.stack.layers.length - count; i < cell.stack.layers.length; i += 1) cell.stack.layers[i] = next;
      this.emitParticles(cell.position, next, 28, 1);
      this.rebuildStack(cell, true);
      this.consumePowerup(type);
      this.audio.sort(2);
      setTimeout(() => this.resolveBoard(cell), 80);
    }

    this.store.selectedPower = null;
    this.syncUI();
    this.updatePowerButtons();
  }

  rejectPower() {
    this.audio.bad();
    this.showToast('No stack there');
    return undefined;
  }

  consumePowerup(type) {
    this.store.powerups[type] = Math.max(0, this.store.powerups[type] - 1);
  }

  swapCells(a, b) {
    const stackA = { layers: [...a.stack.layers] };
    const stackB = { layers: [...b.stack.layers] };
    this.spawnAt(a, stackB, false);
    this.spawnAt(b, stackA, false);
    this.animate({
      duration: 260,
      update: (t) => {
        const pulse = 1 + Math.sin(t * Math.PI) * 0.12;
        a.stack.group.scale.setScalar(pulse);
        b.stack.group.scale.setScalar(pulse);
      },
      complete: () => {
        a.stack.group.scale.set(1, 1, 1);
        b.stack.group.scale.set(1, 1, 1);
        this.resolveBoard(a);
      }
    });
  }

  shuffleBoard() {
    const stacks = this.cells.filter((cell) => cell.stack).map((cell) => ({ layers: [...cell.stack.layers] }));
    stacks.sort(() => Math.random() - 0.5);
    this.cells.filter((cell) => cell.stack).forEach((cell, index) => {
      this.spawnAt(cell, stacks[index], false);
      this.emitParticles(cell.position, this.topColor(cell.stack), 10, 0.7);
    });
  }

  undo() {
    const previous = this.store.history.pop();
    if (!previous) {
      this.showToast('Nothing to undo');
      return;
    }
    this.clearStacks();
    previous.board.forEach((entry) => {
      const cell = this.cellMap.get(entry.key);
      if (cell && entry.layers) this.spawnAt(cell, { layers: entry.layers }, false);
    });
    this.tray = previous.tray.map((item) => item ? { layers: [...item.layers] } : this.generateTrayStack());
    this.store.score = previous.score;
    this.store.progress = previous.progress;
    this.store.moves = previous.moves;
    this.renderTray();
    this.showToast('Move restored');
  }

  renderTray(refilled = false) {
    dom.spawnSlots.forEach((slot, index) => {
      slot.innerHTML = '';
      slot.classList.toggle('empty', !this.tray[index]);
      slot.classList.toggle('refilled', Boolean(refilled && this.tray[index]));
      const stack = this.tray[index];
      if (!stack) return;
      slot.appendChild(this.createMiniPreview(stack));
      if (refilled) {
        setTimeout(() => slot.classList.remove('refilled'), 420);
      }
    });
  }

  createMiniPreview(stack, drag = false) {
    const wrap = document.createElement('div');
    wrap.className = drag ? 'drag-preview' : 'slot-preview';
    const layers = stack.layers.slice(0, 9);
    layers.forEach((colorId, index) => {
      const color = CONFIG.colors[colorId];
      const hex = document.createElement('span');
      hex.className = 'mini-hex';
      hex.style.bottom = `${index * (drag ? 8 : 6)}px`;
      hex.style.background = `linear-gradient(145deg, #${color.main.toString(16).padStart(6, '0')}, #${color.side.toString(16).padStart(6, '0')})`;
      wrap.appendChild(hex);
    });
    return wrap;
  }

  createDragPreview(stack) {
    return this.createMiniPreview(stack, true);
  }

  invalidPlacementFeedback() {
    dom.container.classList.remove('invalid-drop');
    void dom.container.offsetWidth;
    dom.container.classList.add('invalid-drop');
    setTimeout(() => dom.container.classList.remove('invalid-drop'), 260);
  }

  syncUI() {
    dom.score.textContent = Math.floor(this.store.score).toLocaleString();
    dom.moves.textContent = this.store.moves;
    dom.level.textContent = this.store.level;
    dom.missionText.textContent = 'Clear target colors';
    dom.missionCount.textContent = `${this.store.progress}/${CONFIG.levelTarget}`;
    dom.pressureFill.style.width = `${clamp((this.store.progress / CONFIG.levelTarget) * 100, 3, 100)}%`;
    dom.pressureLabel.textContent = `${this.store.progress} / ${CONFIG.levelTarget}`;
    dom.root.classList.toggle('danger', this.boardPressure() > 0.82 && !this.store.paused);

    if (this.store.combo > 1) {
      dom.comboBadge.classList.remove('hidden');
      dom.combo.textContent = this.store.combo;
    } else {
      dom.comboBadge.classList.add('hidden');
    }

    Object.entries(this.store.powerups).forEach(([type, value]) => {
      const counter = document.getElementById(`power-${type}`);
      if (counter) counter.textContent = value;
      const button = document.querySelector(`[data-powerup="${type}"]`);
      if (button) button.disabled = value <= 0;
    });
    this.updatePowerButtons();
  }

  updatePowerButtons() {
    dom.powerups.forEach((button) => {
      button.classList.toggle('active', button.dataset.powerup === this.store.selectedPower);
    });
  }

  showToast(text) {
    dom.toast.textContent = text;
    dom.toast.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => dom.toast.classList.add('hidden'), 1200);
  }

  emitParticles(position, colorIndex, count, strength = 1) {
    const baseColor = CONFIG.colors[colorIndex]?.main || 0xffffff;
    for (let i = 0; i < count; i += 1) {
      const material = new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 1 });
      const particle = new THREE.Mesh(this.particleGeometry, material);
      particle.position.set(position.x, rand(0.22, 1.35), position.z);
      const angle = rand(0, Math.PI * 2);
      const speed = rand(0.7, 2.6) * strength;
      particle.userData.velocity = new THREE.Vector3(Math.cos(angle) * speed, rand(1.3, 3.1) * strength, Math.sin(angle) * speed);
      particle.userData.life = rand(0.45, 0.95);
      particle.userData.age = 0;
      this.particles.push(particle);
      this.fxGroup.add(particle);
    }
  }

  emitShockwave(position, colorIndex) {
    const mat = new THREE.MeshBasicMaterial({
      color: CONFIG.colors[colorIndex]?.main || 0xffffff,
      transparent: true,
      opacity: 0.68,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ring = new THREE.Mesh(this.ringGeometry, mat);
    ring.position.set(position.x, 0.08, position.z);
    ring.rotation.x = -Math.PI / 2;
    this.fxGroup.add(ring);
    this.animate({
      duration: 520,
      update: (t) => {
        const s = 0.5 + t * 4.7;
        ring.scale.set(s, s, s);
        ring.material.opacity = 0.68 * (1 - t);
      },
      complete: () => this.fxGroup.remove(ring)
    });
  }

  shake(strength, duration) {
    this.shakeData = { strength, duration, elapsed: 0 };
  }

  animate(config) {
    this.animations.push({ elapsed: 0, delay: 0, ...config });
  }

  resize() {
    const width = dom.target.clientWidth || window.innerWidth;
    const height = dom.target.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    const compact = height < 720;
    this.camera.fov = compact ? 42 : 35;
    this.camera.position.copy(this.cameraBase);
    this.camera.position.y = compact ? 8.2 : 8.8;
    this.camera.position.z = compact ? 8.8 : 7.8;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  updateAnimations(delta) {
    this.animations = this.animations.filter((animation) => {
      animation.elapsed += delta * 1000;
      if (animation.elapsed < animation.delay) return true;
      const t = clamp((animation.elapsed - animation.delay) / animation.duration, 0, 1);
      animation.update?.(t);
      if (t >= 1) {
        animation.complete?.();
        return false;
      }
      return true;
    });
  }

  updateParticles(delta) {
    this.particles = this.particles.filter((particle) => {
      particle.userData.age += delta;
      const life = particle.userData.life;
      particle.userData.velocity.y -= 5.2 * delta;
      particle.position.addScaledVector(particle.userData.velocity, delta);
      particle.scale.setScalar(clamp(1 - particle.userData.age / life, 0, 1));
      particle.material.opacity = clamp(1 - particle.userData.age / life, 0, 1);
      if (particle.userData.age >= life) {
        this.fxGroup.remove(particle);
        return false;
      }
      return true;
    });
  }

  updateWorld(delta, elapsed) {
    this.boardGroup.rotation.y = Math.sin(elapsed * 0.24) * 0.026;
    this.cells.forEach((cell) => {
      cell.base.position.y = Math.sin(elapsed * 1.5 + cell.pulse) * 0.008;
      if (!cell.stack) return;
      const height = cell.stack.layers.length;
      cell.stack.group.rotation.y = Math.sin(elapsed * 1.2 + cell.pulse) * 0.01 * clamp(height / 12, 0.2, 1.2);
      cell.stack.group.children.forEach((layer) => {
        if (layer.isMesh) {
          layer.position.y = layer.userData.baseY + Math.sin(elapsed * 4 + layer.userData.baseY * 10) * 0.006;
        }
      });
    });

    const targetCamera = this.cameraBase.clone();
    targetCamera.z = this.camera.position.z;
    if (this.shakeData) {
      this.shakeData.elapsed += delta * 1000;
      const amount = this.shakeData.strength * (1 - this.shakeData.elapsed / this.shakeData.duration);
      targetCamera.x += rand(-amount, amount);
      targetCamera.y += rand(-amount, amount);
      if (this.shakeData.elapsed >= this.shakeData.duration) this.shakeData = null;
    }
    this.camera.position.lerp(targetCamera, 0.22);
    this.camera.lookAt(0, 0.08, 0);
  }

  loop() {
    const delta = Math.min(this.clock.getDelta(), 0.033);
    const elapsed = this.clock.elapsedTime;
    if (!this.store.paused || !dom.startModal.classList.contains('hidden')) {
      this.updateAnimations(delta);
      this.updateParticles(delta);
      this.updateWorld(delta, elapsed);
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.loop());
  }
}

new HexaSortGame();
