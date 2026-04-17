import * as THREE from 'three';

/* ═══════════════════════════════════════════════════
   LEGION RUSH — Game Engine v2
   Fix: canvas-based renderer (no container div needed)
   Fix: buttons wired via addEventListener (no window.game timing issue)
   Fix: enemies march as tight formations, not scattered
═══════════════════════════════════════════════════ */

const gsap = window.gsap;

// ── Constants ─────────────────────────────────────────
const LANE_X      = [-11, 0, 11];  // left / mid / right centres
const LANE_W_SIDE = 6;             // left & right lane width
const LANE_W_MID  = 11;            // centre (combat) lane width — wider
const LANE_W      = LANE_W_SIDE;   // default lane width (used by gate helpers)
const BRIDGE_W    = 28;
const SPAWN_Z     = -230;
const BASE_SPD    = 0.18;
const ENEMY_SPD   = 0.20;
const FIRE_RATE   = 9;            // frames per volley
const GATE_Z_GAP  = 260;         // frames between gate spawns
const CLUSTER_GAP = 180;         // frames between enemy clusters
const BOSS_EVERY  = 5;            // boss after every N clusters

// ── Helpers ──────────────────────────────────────────
const rnd    = (a, b) => a + Math.random() * (b - a);
const rndInt = (a, b) => Math.floor(rnd(a, b + 1));

function spawnPopup(x, y, text, color = '#fff') {
    const el = document.createElement('div');
    el.className = 'float-popup';
    el.textContent = text;
    el.style.cssText = `left:${x}px;top:${y}px;color:${color};`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1300);
}

// ── Particle pool ─────────────────────────────────────
class Particles {
    constructor(scene, max = 600) {
        const geo = new THREE.SphereGeometry(.11, 4, 4);
        this.pool = Array.from({ length: max }, () => {
            const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true }));
            m.visible = false;
            scene.add(m);
            return { m, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1 };
        });
        this.i = 0;
    }
    emit(pos, color, count = 6, spd = .32, life = 20) {
        for (let k = 0; k < count; k++) {
            const p = this.pool[this.i++ % this.pool.length];
            p.m.material.color.set(color);
            p.m.position.copy(pos);
            p.vx = rnd(-spd, spd); p.vy = rnd(.05, spd * 2); p.vz = rnd(-spd, spd);
            p.life = life; p.maxLife = life;
            p.m.scale.setScalar(1);
            p.m.visible = true;
            p.m.material.opacity = 1;
        }
    }
    tick() {
        this.pool.forEach(p => {
            if (!p.m.visible) return;
            p.life--;
            p.m.position.x += p.vx; p.m.position.y += p.vy; p.m.position.z += p.vz;
            p.vy -= .02;
            const f = p.life / p.maxLife;
            p.m.material.opacity = f;
            p.m.scale.setScalar(f * .8 + .2);
            if (p.life <= 0) p.m.visible = false;
        });
    }
}

// ── Mesh builders ──────────────────────────────────────
function makeSoldier(color) {
    const g = new THREE.Group();
    // body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(.22, .27, .75, 8),
        new THREE.MeshStandardMaterial({ color, roughness: .6 })
    );
    body.position.set(0, .37, 0);
    g.add(body);
    // head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(.21, 8, 8),
        new THREE.MeshStandardMaterial({ color, roughness: .5 })
    );
    head.position.set(0, .95, 0);
    g.add(head);
    // helmet
    const helm = new THREE.Mesh(
        new THREE.SphereGeometry(.24, 8, 6, 0, Math.PI * 2, 0, Math.PI * .55),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(.55), roughness: .4, metalness: .5 })
    );
    helm.position.set(0, 1.03, 0);
    g.add(helm);
    // legs
    [-0.11, 0.11].forEach(sx => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(.09, .09, .42, 6),
            new THREE.MeshStandardMaterial({ color: 0x222244 })
        );
        leg.position.set(sx, -.05, 0);
        g.add(leg);
    });
    g.castShadow = true;
    return g;
}

function makeEnemy(scale = 1) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(.23 * scale, .29 * scale, .8 * scale, 8),
        new THREE.MeshStandardMaterial({ color: 0xcc1111, roughness: .65 })
    );
    body.position.set(0, .4 * scale, 0);
    g.add(body);
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(.22 * scale, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xdd2222, roughness: .5 })
    );
    head.position.set(0, 1.05 * scale, 0);
    g.add(head);
    [-0.12 * scale, 0.12 * scale].forEach(sx => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(.1 * scale, .1 * scale, .44 * scale, 6),
            new THREE.MeshStandardMaterial({ color: 0x661100 })
        );
        leg.position.set(sx, -.04 * scale, 0);
        g.add(leg);
    });
    g.castShadow = true;
    return g;
}

function makeBoss(tier) {
    const s = 2.8 + tier * .7;
    const g = new THREE.Group();
    // torso
    const torso = new THREE.Mesh(
        new THREE.CylinderGeometry(s * .55, s * .75, s * 1.1, 12),
        new THREE.MeshStandardMaterial({ color: 0x880000, roughness: .4, metalness: .5 })
    );
    torso.position.set(0, s * .55, 0);
    g.add(torso);
    // head
    const bhead = new THREE.Mesh(
        new THREE.SphereGeometry(s * .52, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x660000, roughness: .5, metalness: .3 })
    );
    bhead.position.set(0, s * 1.35, 0);
    g.add(bhead);
    // shoulders
    [-s * .88, s * .88].forEach(sx => {
        const sh = new THREE.Mesh(
            new THREE.SphereGeometry(s * .38, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x990000, metalness: .4 })
        );
        sh.position.set(sx, s * .88, 0);
        g.add(sh);
    });
    // horns
    [-s * .35, s * .35].forEach(sx => {
        const horn = new THREE.Mesh(
            new THREE.ConeGeometry(s * .12, s * .5, 6),
            new THREE.MeshStandardMaterial({ color: 0x440000, metalness: .7 })
        );
        horn.position.set(sx, s * 1.75, 0);
        g.add(horn);
    });
    g.castShadow = true;
    return g;
}

// ── Stacked gate (like the video blue/yellow column stacks) ──
function makeGateStack(scene, laneX, spawnZ, buffType) {
    const group = new THREE.Group();
    const isLeft  = buffType.lane === 'left';
    const panelCol = isLeft ? 0x1155ff : 0xeecc00;
    const STACK   = 7;    // how many panels stacked back-to-back
    const PANEL_D = 1.85; // depth per panel

    for (let i = 0; i < STACK; i++) {
        const zOff = -i * PANEL_D;
        // Panel — sized to the side lane width
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(LANE_W_SIDE - .6, 7.5, .35),
            new THREE.MeshStandardMaterial({
                color: panelCol,
                roughness: .45, metalness: .35,
                emissive: panelCol,
                emissiveIntensity: i === 0 ? .35 : .08
            })
        );
        panel.position.set(0, 3.75, zOff);
        panel.castShadow = true;
        group.add(panel);

        // Label canvas — only front panel gets full text, rest get small
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = isLeft ? '#ffffff' : '#111100';
        ctx.font = 'bold 68px Orbitron, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(buffType.label, 128, 68);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(canvas), transparent: true,
            opacity: i === 0 ? 1 : .55
        }));
        sprite.scale.set(LANE_W_SIDE - .4, 2.6, 1);
        sprite.position.set(0, 3.75, zOff + .22);
        group.add(sprite);
    }

    // Vertical rails on sides
    const railMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: .5, roughness: .5 });
    [-(LANE_W_SIDE / 2 - .2), (LANE_W_SIDE / 2 - .2)].forEach(rx => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(.28, 7.5, STACK * PANEL_D + .5), railMat);
        rail.position.set(rx, 3.75, -(STACK * PANEL_D) / 2);
        group.add(rail);
    });

    group.position.set(laneX, 0, spawnZ);
    scene.add(group);

    return { group, buffType };
}

/* ═══════════════════════════════════════════════════
   GAME CLASS
═══════════════════════════════════════════════════ */
class LegionRush {
    constructor() {
        // Fix #1: use <canvas> directly — no container.appendChild needed
        this.canvas = document.getElementById('game-canvas');

        this.scene    = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this._resize();

        this.camera = new THREE.PerspectiveCamera(58, this.canvas.width / this.canvas.height, .1, 600);
        this.camera.position.set(0, 22, 44);
        this.camera.lookAt(0, 0, -12);

        this.scene.fog = new THREE.Fog(0x091525, 150, 450);
        this.scene.background = new THREE.Color(0x091525);

        this.parts = new Particles(this.scene, 700);

        // ── State ─────────────────────────────────────
        this.state     = 'START';
        this.score     = 0;
        this.kills     = 0;
        this.wave      = 1;
        this.frame     = 0;
        this.laneIdx   = 1;

        // ── Collections ───────────────────────────────
        this.playerUnits = [];
        this.unitCount   = 10;
        this.unitPeak    = 10;

        // Enemy formations: each formation is { meshes:[], hp:[], spd, cols, rows, pivot }
        // where pivot is a THREE.Group that moves as a unit
        this.formations = [];   // [{group: THREE.Group, hps:[], spd, totalHp}]
        this.bosses     = [];
        this.gates      = [];
        this.bullets    = [];
        this.eBullets   = [];

        this.spawnCount = 0;    // how many clusters spawned
        this.frameCluster = 0;
        this.frameGate    = 0;
        this.fireF        = 0;
        this.bossRef      = null;

        this._buildScene();
        this._buildLights();
        this._bindInput();
        this._bindButtons();   // Fix #2: wire buttons via JS, not onclick=""

        this._loop();
    }

    // ─────────────────────────────────────────────────
    _resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
    }

    // Fix #2 — wire buttons in JS after module loads (no window.game timing race)
    _bindButtons() {
        document.getElementById('btn-start').addEventListener('click',   () => this.start());
        document.getElementById('btn-restart').addEventListener('click', () => this.start());
    }

    _bindInput() {
        window.addEventListener('keydown', e => {
            if (this.state !== 'PLAYING') return;
            if (e.key === 'a' || e.key === 'ArrowLeft')  this._shiftLane(-1);
            if (e.key === 'd' || e.key === 'ArrowRight') this._shiftLane(1);
        });
        document.getElementById('touch-left').addEventListener('touchstart', e => {
            e.preventDefault(); if (this.state === 'PLAYING') this._shiftLane(-1);
        }, { passive: false });
        document.getElementById('touch-right').addEventListener('touchstart', e => {
            e.preventDefault(); if (this.state === 'PLAYING') this._shiftLane(1);
        }, { passive: false });
        window.addEventListener('resize', () => this._resize());
    }

    // ── Scene ─────────────────────────────────────────
    _buildScene() {
        // Bridge
        const bMat = new THREE.MeshStandardMaterial({ color: 0xb4bcc8, roughness: .85 });
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(BRIDGE_W, .9, 1400), bMat);
        bridge.position.set(0, -.45, -580); bridge.receiveShadow = true;
        this.scene.add(bridge);

        // Lane dividers — at boundaries between side and middle lanes
        // Left boundary: LANE_X[0] + LANE_W_SIDE/2
        // Right boundary: LANE_X[2] - LANE_W_SIDE/2
        const divX = LANE_X[0] + LANE_W_SIDE / 2; // = -11 + 3 = -8
        [-divX, divX].forEach(x => {
            const d = new THREE.Mesh(new THREE.BoxGeometry(.22, .14, 1400),
                new THREE.MeshStandardMaterial({ color: 0x55667a }));
            d.position.set(x, .07, -580);
            this.scene.add(d);
        });

        // Side walls
        [-(BRIDGE_W / 2), (BRIDGE_W / 2)].forEach(x => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(.6, 4, 1400),
                new THREE.MeshStandardMaterial({ color: 0x445566, metalness: .5, roughness: .4 }));
            wall.position.set(x, 1.8, -580);
            this.scene.add(wall);
            const top = new THREE.Mesh(new THREE.BoxGeometry(.9, .3, 1400),
                new THREE.MeshStandardMaterial({ color: 0x778899, metalness: .8, roughness: .2 }));
            top.position.set(x, 3.8, -580);
            this.scene.add(top);
        });

        // Ocean
        const sea = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400),
            new THREE.MeshStandardMaterial({ color: 0x0c3158, roughness: .1, metalness: .5, transparent: true, opacity: .9 }));
        sea.rotation.x = -Math.PI / 2; sea.position.set(0, -7, -400);
        this.scene.add(sea);

        // Bridge pillars
        for (let z = -60; z > -1100; z -= 90) {
            [-(BRIDGE_W / 2 - .5), (BRIDGE_W / 2 - .5)].forEach(x => {
                const pil = new THREE.Mesh(new THREE.BoxGeometry(1.2, 16, 1.2),
                    new THREE.MeshStandardMaterial({ color: 0x556677, metalness: .35 }));
                pil.position.set(x, -8, z);
                this.scene.add(pil);
            });
        }

        // Running lane floor stripes
        for (let z = -30; z > -1400; z -= 28) {
            const line = new THREE.Mesh(new THREE.PlaneGeometry(BRIDGE_W - .6, .16),
                new THREE.MeshBasicMaterial({ color: 0x7788aa, transparent: true, opacity: .22 }));
            line.rotation.x = -Math.PI / 2; line.position.set(0, .01, z);
            this.scene.add(line);
        }

        // Lane glow strips — different widths per lane
        const glowDefs = [
            { x: LANE_X[0], w: LANE_W_SIDE, col: 0x0044ff },
            { x: LANE_X[1], w: LANE_W_MID,  col: 0xff3300 },
            { x: LANE_X[2], w: LANE_W_SIDE, col: 0xffcc00 },
        ];
        glowDefs.forEach(g => {
            const m = new THREE.Mesh(
                new THREE.PlaneGeometry(g.w - .4, 1400),
                new THREE.MeshBasicMaterial({ color: g.col, transparent: true, opacity: .038 })
            );
            m.rotation.x = -Math.PI / 2; m.position.set(g.x, .015, -580);
            this.scene.add(m);
        });

        // Player light
        this._pLight = new THREE.PointLight(0x44aaff, 1.5, 40);
        this._pLight.position.set(0, 12, 14);
        this.scene.add(this._pLight);

        // Combat zone pulsing light
        this._cLight = new THREE.PointLight(0xff3300, .55, 35);
        this._cLight.position.set(0, 8, -25);
        this.scene.add(this._cLight);
    }

    _buildLights() {
        this.scene.add(new THREE.AmbientLight(0x334466, 1.5));
        this.scene.add(new THREE.HemisphereLight(0x22334f, 0x0a0a18, .8));

        const sun = new THREE.DirectionalLight(0xfff0dd, 2.4);
        sun.position.set(18, 40, 20);
        sun.castShadow = true;
        sun.shadow.mapSize.setScalar(1024);
        sun.shadow.camera.far   = 400;
        sun.shadow.camera.left  = -90; sun.shadow.camera.right = 90;
        sun.shadow.camera.top   =  90; sun.shadow.camera.bottom= -90;
        this.scene.add(sun);

        const fill = new THREE.DirectionalLight(0x2244aa, .9);
        fill.position.set(-15, 10, -20);
        this.scene.add(fill);
    }

    // ── Lane switch ───────────────────────────────────
    _shiftLane(dir) {
        const prev = this.laneIdx;
        this.laneIdx = Math.max(0, Math.min(2, this.laneIdx + dir));
        if (this.laneIdx === prev) return;

        const tx = LANE_X[this.laneIdx];
        this.playerUnits.forEach((u, i) => {
            const { cx, rz } = this._formPos(i, this.unitCount);
            gsap.to(u.position, { x: tx + cx, duration: .22, ease: 'power2.out' });
        });
        // Camera lean
        gsap.to(this.camera.position, { x: tx * .22, duration: .3, ease: 'sine.out' });

        // Update dots
        document.querySelectorAll('.lane-dot').forEach((d, i) => d.classList.toggle('active', i === this.laneIdx));
    }

    _formPos(i, total) {
        const cols = Math.min(7, Math.ceil(Math.sqrt(Math.min(total, 200))));
        const cx   = (i % cols - (cols - 1) / 2) * 1.28;
        const rz   = Math.floor(i / cols) * 1.32;
        return { cx, rz };
    }

    // ── Player squad rebuild ──────────────────────────
    _rebuildSquad() {
        this.playerUnits.forEach(u => this.scene.remove(u));
        this.playerUnits = [];

        const count = Math.min(this.unitCount, 250);
        const tx   = LANE_X[this.laneIdx];
        for (let i = 0; i < count; i++) {
            const mesh = makeSoldier(0x0088ff);
            const { cx, rz } = this._formPos(i, count);
            mesh.position.set(tx + cx, .8, 14 + rz);
            this.scene.add(mesh);
            this.playerUnits.push(mesh);
        }
        this._hud();
    }

    _hud() {
        document.getElementById('squad-count').textContent = this.unitCount;
        document.getElementById('score-value').textContent = this.score;
        document.getElementById('wave-value').textContent  = this.wave;
        const pct = Math.max(0, Math.min(1, this.unitCount / Math.max(this.unitPeak, 1)));
        document.getElementById('troop-bar-fill').style.width = `${pct * 100}%`;
    }

    // ── Start / Restart ───────────────────────────────
    start() {
        this.state     = 'PLAYING';
        this.score     = 0; this.kills = 0;
        this.wave      = 1; this.frame = 0;
        this.laneIdx   = 1;
        this.unitCount = 10; this.unitPeak = 10;
        this.spawnCount= 0;
        this.frameCluster = 0; this.frameGate = 0; this.fireF = 0;
        this.bossRef   = null;

        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('game-over-screen').classList.remove('active');
        document.getElementById('boss-hp-wrap').style.display = 'none';

        this.camera.position.set(0, 22, 44);
        this.camera.lookAt(0, 0, -12);

        this._clearAll();
        this._rebuildSquad();

        // Pre-seed some gates ahead
        this._spawnGatePair(SPAWN_Z * .5);
        this._spawnGatePair(SPAWN_Z * .82);
    }

    _clearAll() {
        this.playerUnits.forEach(u => this.scene.remove(u));
        this.formations.forEach(f => this.scene.remove(f.group));
        this.bosses.forEach(b => this.scene.remove(b.mesh));
        this.gates.forEach(g => this.scene.remove(g.group));
        this.bullets.forEach(b => this.scene.remove(b.mesh));
        this.eBullets.forEach(b => this.scene.remove(b.mesh));
        this.playerUnits = []; this.formations = []; this.bosses = [];
        this.gates = []; this.bullets = []; this.eBullets = [];
    }

    // ── Spawning ──────────────────────────────────────
    _spawnGatePair(z) {
        const leftOpts = [
            { label: '+5',  lane: 'left', op: 'add',  val: 5 },
            { label: '+10', lane: 'left', op: 'add',  val: 10 },
            { label: '+20', lane: 'left', op: 'add',  val: 20 },
            { label: 'x2',  lane: 'left', op: 'mult', val: 2 },
            { label: 'x3',  lane: 'left', op: 'mult', val: 3 },
        ];
        const rightOpts = [
            { label: '+15', lane: 'right', op: 'add',  val: 15 },
            { label: '+25', lane: 'right', op: 'add',  val: 25 },
            { label: 'x2',  lane: 'right', op: 'mult', val: 2 },
            { label: 'BOOST', lane: 'right', op: 'fire',  val: 1 },
        ];

        let lb = { ...leftOpts[rndInt(0, leftOpts.length - 1)] };
        let rb = { ...rightOpts[rndInt(0, rightOpts.length - 1)] };

        // Scale with wave
        if (this.wave > 1 && lb.op === 'add')  { lb.val = Math.round(lb.val * (1 + (this.wave - 1) * .4)); lb.label = `+${lb.val}`; }
        if (this.wave > 1 && rb.op === 'add')  { rb.val = Math.round(rb.val * (1 + (this.wave - 1) * .4)); rb.label = `+${rb.val}`; }

        this.gates.push(makeGateStack(this.scene, LANE_X[0], z, lb));
        this.gates.push(makeGateStack(this.scene, LANE_X[2], z, rb));
    }

    // Fix #3: enemies spawn as TIGHT FORMATION — one group with shared Z movement
    _spawnFormation() {
        const base  = 14 + this.wave * 8;
        const count = rndInt(base, base + 10);
        const spd   = ENEMY_SPD + this.wave * .012;

        // Formation grid dimensions
        const cols = Math.min(10, Math.ceil(Math.sqrt(count)));
        const rows = Math.ceil(count / cols);
        const spacX = 1.3;  // tight horizontal spacing
        const spacZ = 1.25; // tight depth spacing

        const pivot = new THREE.Group();
        // Position pivot at centre of middle lane, far ahead
        pivot.position.set(0, 0, SPAWN_Z);
        this.scene.add(pivot);

        const hps = [];
        for (let i = 0; i < count; i++) {
            const mesh = makeEnemy(1);
            const col  = (i % cols) - (cols - 1) / 2;
            const row  = Math.floor(i / cols);
            mesh.position.set(col * spacX, .8, row * spacZ);
            pivot.add(mesh);
            hps.push(1);
        }

        this.formations.push({ group: pivot, hps, spd, cols, rows, alive: count });
    }

    _spawnBoss() {
        const tier = this.wave;
        const mesh = makeBoss(tier);
        const maxHp = 50 + tier * 30;
        mesh.position.set(0, 0, SPAWN_Z - 25);
        this.scene.add(mesh);
        const bossObj = { mesh, hp: maxHp, maxHp, size: 2.8 + tier * .7, isBoss: true, fireTimer: 0 };
        this.bosses.push(bossObj);
        this.bossRef = bossObj;

        document.getElementById('boss-hp-wrap').style.display = 'block';
        document.getElementById('boss-hp-fill').style.width = '100%';

        const banner = document.getElementById('wave-banner');
        banner.textContent = `WAVE ${this.wave} BOSS!`;
        gsap.fromTo(banner,
            { opacity: 0, scale: .5 },
            { opacity: 1, scale: 1, duration: .4, ease: 'back.out(1.6)',
              onComplete: () => gsap.to(banner, { opacity: 0, delay: 1.2, duration: .6 }) });
    }

    _spawnEnemyBullet(pos) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(.28, 6, 6),
            new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff1100, emissiveIntensity: 1.8 })
        );
        mesh.position.copy(pos);
        mesh.position.y = 1.5;
        this.scene.add(mesh);
        this.eBullets.push({ mesh, vz: 1.35 + this.wave * .04 });
    }

    // ── Fire players ─────────────────────────────────
    _fireSquad() {
        this.fireF++;
        const rate = Math.max(4, FIRE_RATE - Math.floor(this.wave * .7));
        if (this.fireF % rate !== 0) return;

        const lim = Math.min(this.playerUnits.length, 18 + this.wave * 3);
        for (let i = 0; i < lim; i++) {
            const u = this.playerUnits[i];
            if (!u) continue;
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(.13, 5, 5),
                new THREE.MeshBasicMaterial({ color: 0x00ffff })
            );
            mesh.position.copy(u.position);
            this.scene.add(mesh);
            this.bullets.push({ mesh, vz: -(3.8 + this.wave * .1) });
        }
    }

    // ── Collisions ────────────────────────────────────
    _collide() {
        const tx = LANE_X[this.laneIdx];

        // ── Player bullets vs formations & bosses ─────
        for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
            const b = this.bullets[bi];
            const bp = b.mesh.position;
            let consumed = false;

            // vs formations
            for (let fi = this.formations.length - 1; fi >= 0 && !consumed; fi--) {
                const f = this.formations[fi];
                const gp = f.group.position;
                // Quick bounding check first
                if (Math.abs(bp.z - gp.z) > f.rows * 1.5 + 4) continue;
                if (Math.abs(bp.x - gp.x) > f.cols * 1.4 + 4) continue;

                // Check each alive child
                const children = f.group.children;
                for (let ci = children.length - 1; ci >= 0 && !consumed; ci--) {
                    const child = children[ci];
                    if (!child.visible) continue;
                    const wp = new THREE.Vector3();
                    child.getWorldPosition(wp);
                    if (bp.distanceTo(wp) < 1.2) {
                        f.hps[ci]--;
                        if (f.hps[ci] <= 0) {
                            this.parts.emit(wp, 0xff4400, 7, .3, 20);
                            child.visible = false;
                            f.alive--;
                            this.score += 10;
                            this.kills++;
                        }
                        consumed = true;
                        if (f.alive <= 0) {
                            this.scene.remove(f.group);
                            this.formations.splice(fi, 1);
                        }
                    }
                }
            }

            // vs bosses
            if (!consumed) {
                for (let bi2 = this.bosses.length - 1; bi2 >= 0 && !consumed; bi2--) {
                    const boss = this.bosses[bi2];
                    if (bp.distanceTo(boss.mesh.position) < boss.size + 1.2) {
                        boss.hp--;
                        consumed = true;
                        const pct = boss.hp / boss.maxHp;
                        document.getElementById('boss-hp-fill').style.width = `${Math.max(0, pct * 100)}%`;
                        if (boss.hp <= 0) {
                            for (let k = 0; k < 6; k++) {
                                const dp = boss.mesh.position.clone().add(new THREE.Vector3(rnd(-3,3), rnd(0,4), rnd(-3,3)));
                                this.parts.emit(dp, 0xff6600, 18, .5, 28);
                            }
                            this.scene.remove(boss.mesh);
                            this.bosses.splice(bi2, 1);
                            this.bossRef = null;
                            document.getElementById('boss-hp-wrap').style.display = 'none';
                            this.score += 800 + this.wave * 200;
                            this.kills += 15;
                            spawnPopup(window.innerWidth/2 - 60, window.innerHeight * .38, `+${800 + this.wave * 200}`, '#ffd700');
                            this._nextWave();
                        }
                    }
                }
            }

            if (consumed || bp.z < SPAWN_Z - 30) {
                this.scene.remove(b.mesh);
                this.bullets.splice(bi, 1);
            }
        }

        // ── Enemy bullets vs player squad ─────────────
        for (let bi = this.eBullets.length - 1; bi >= 0; bi--) {
            const eb = this.eBullets[bi];
            const ep = eb.mesh.position;
            let hit = false;
            for (let ui = this.playerUnits.length - 1; ui >= 0; ui--) {
                if (ep.distanceTo(this.playerUnits[ui].position) < 1.6) {
                    this.parts.emit(this.playerUnits[ui].position, 0x0055ff, 5, .22, 14);
                    this.scene.remove(this.playerUnits[ui]);
                    this.playerUnits.splice(ui, 1);
                    this.unitCount--;
                    hit = true;
                    if (this.unitCount <= 0) { this._gameOver(); return; }
                    this._hud();
                    break;
                }
            }
            if (hit || ep.z > 60) { this.scene.remove(eb.mesh); this.eBullets.splice(bi, 1); }
        }

        // ── Formation melee vs squad ───────────────────
        for (let fi = this.formations.length - 1; fi >= 0; fi--) {
            const f = this.formations[fi];
            const gp = f.group.position;
            if (gp.z < 6) continue; // not close enough yet

            const children = f.group.children;
            for (let ci = children.length - 1; ci >= 0; ci--) {
                const child = children[ci];
                if (!child.visible) continue;
                const wp = new THREE.Vector3();
                child.getWorldPosition(wp);

                for (let ui = this.playerUnits.length - 1; ui >= 0; ui--) {
                    if (wp.distanceTo(this.playerUnits[ui].position) < 2.2) {
                        // Enemy dies too (1-for-1)
                        this.parts.emit(wp, 0xff3300, 6, .28, 18);
                        child.visible = false;
                        f.alive--;
                        f.hps[ci] = 0;

                        this.parts.emit(this.playerUnits[ui].position, 0x0044ff, 4, .2, 14);
                        this.scene.remove(this.playerUnits[ui]);
                        this.playerUnits.splice(ui, 1);
                        this.unitCount--;
                        this.kills++;
                        this.score += 5;

                        if (this.unitCount <= 0) { this._gameOver(); return; }
                        this._hud();
                        break;
                    }
                }
                if (f.alive <= 0) {
                    this.scene.remove(f.group);
                    this.formations.splice(fi, 1);
                    break;
                }
            }
        }

        // ── Gate collection ────────────────────────────
        for (let gi = this.gates.length - 1; gi >= 0; gi--) {
            const g = this.gates[gi];
            const gz = g.group.position.z;
            if (gz < -6 || gz > 32) continue;
            if (Math.abs(g.group.position.x - tx) < LANE_W / 2 + 1) {
                const bt = g.buffType;
                let label = bt.label;
                if (bt.op === 'add')  { this.unitCount += bt.val; label = `+${bt.val}`; }
                if (bt.op === 'mult') {
                    const gain = Math.round(this.unitCount * (bt.val - 1));
                    this.unitCount = Math.floor(this.unitCount * bt.val);
                    label = `x${bt.val}!`;
                }
                if (bt.op === 'fire') { this.fireF = 0; label = 'RAPID!'; }
                if (this.unitCount > this.unitPeak) this.unitPeak = this.unitCount;

                this.scene.remove(g.group);
                this.gates.splice(gi, 1);
                this._rebuildSquad();

                const color = bt.lane === 'left' ? '#00ff88' : '#ffd700';
                spawnPopup(window.innerWidth / 2 - 40, window.innerHeight * .34, label, color);
                this.parts.emit(new THREE.Vector3(tx, 2.5, 14), bt.lane === 'left' ? 0x00ff88 : 0xffcc00, 16, .4, 25);
            }
        }
    }

    // ── Next wave ─────────────────────────────────────
    _nextWave() {
        this.wave++;
        this._hud();
        const banner = document.getElementById('wave-banner');
        banner.textContent = `WAVE ${this.wave}!`;
        gsap.fromTo(banner,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: .45, ease: 'back.out',
              onComplete: () => gsap.to(banner, { opacity: 0, delay: 1, duration: .55 }) });
        // Immediately spawn next wave cluster
        this._spawnFormation();
    }

    // ── Game Over ─────────────────────────────────────
    _gameOver() {
        this.state = 'GAMEOVER';
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-kills').textContent = this.kills;
        document.getElementById('final-wave').textContent  = this.wave;
        document.getElementById('boss-hp-wrap').style.display = 'none';
        document.getElementById('game-over-screen').classList.add('active');
        this.playerUnits.forEach(u => this.scene.remove(u));
        this.playerUnits = [];
    }

    // ── Main loop ─────────────────────────────────────
    _loop() {
        requestAnimationFrame(() => this._loop());

        if (this.state !== 'PLAYING') {
            this.renderer.render(this.scene, this.camera);
            return;
        }

        this.frame++;
        const spd   = BASE_SPD;

        // ── Spawn triggers ────────────────────────────
        this.frameCluster++;
        this.frameGate++;

        const clusterRate = Math.max(90, CLUSTER_GAP - this.wave * 14);
        if (this.frameCluster % clusterRate === 0) {
            this._spawnFormation();
            this.spawnCount++;
            if (this.spawnCount % BOSS_EVERY === 0) this._spawnBoss();
        }
        if (this.frameGate % GATE_Z_GAP === 0) this._spawnGatePair(SPAWN_Z * 1.05);

        // ── Move formations (entire group = one block) ─
        this.formations.forEach(f => {
            f.group.position.z += f.spd;
            // Slight side-to-side sway of the whole formation
            f.group.position.x = Math.sin(this.frame * .025 + f.group.id * 1.3) * 1.8;
        });

        // ── Move bosses ───────────────────────────────
        this.bosses.forEach(boss => {
            boss.mesh.position.z += BASE_SPD * .7;
            boss.mesh.rotation.y += .02;
            boss.fireTimer++;
            const fRate = Math.max(28, 70 - this.wave * 6);
            if (boss.fireTimer % fRate === 0) {
                for (let a = -1; a <= 1; a++) {
                    const p = boss.mesh.position.clone();
                    p.x += a * boss.size * .45;
                    this._spawnEnemyBullet(p);
                }
            }
        });

        // ── Move gates ────────────────────────────────
        this.gates.forEach(g => g.group.position.z += spd * 1.15);

        // ── Move bullets ──────────────────────────────
        this.bullets.forEach(b => b.mesh.position.z += b.vz);
        this.eBullets.forEach(b => b.mesh.position.z += b.vz);

        // ── Player unit bob ───────────────────────────
        const t = this.frame * .075;
        this.playerUnits.forEach((u, i) => {
            u.position.y = .8 + Math.sin(t + i * .38) * .07;
        });

        // ── Culling ───────────────────────────────────
        this.formations = this.formations.filter(f => {
            if (f.group.position.z > 54) { this.scene.remove(f.group); return false; }
            return true;
        });
        this.bosses = this.bosses.filter(b => {
            if (b.mesh.position.z > 60) { this.scene.remove(b.mesh); return false; }
            return true;
        });
        this.gates = this.gates.filter(g => {
            if (g.group.position.z > 38) { this.scene.remove(g.group); return false; }
            return true;
        });
        this.bullets = this.bullets.filter(b => {
            if (b.mesh.position.z < SPAWN_Z - 30) { this.scene.remove(b.mesh); return false; }
            return true;
        });
        this.eBullets = this.eBullets.filter(b => {
            if (b.mesh.position.z > 64) { this.scene.remove(b.mesh); return false; }
            return true;
        });

        // ── Combat ────────────────────────────────────
        this._fireSquad();
        this._collide();

        // ── Particles ─────────────────────────────────
        this.parts.tick();

        // ── Dynamic light pulse ───────────────────────
        this._cLight.intensity = .45 + Math.sin(this.frame * .1) * .18;
        this._pLight.position.x = LANE_X[this.laneIdx] * .4;

        // ── Gentle camera breathe ─────────────────────
        this.camera.position.y = 22 + Math.sin(this.frame * .02) * .25;

        this.renderer.render(this.scene, this.camera);
    }
}

// Boot — runs after module is parsed, DOM is ready
new LegionRush();
