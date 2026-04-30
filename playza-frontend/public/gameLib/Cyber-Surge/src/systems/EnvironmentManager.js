import * as THREE from 'three';
import { EnvironmentAssetLoader } from './EnvironmentAssetLoader.js';

// ─── World Zone Definitions ───────────────────────────────────────────────────
//
//   ←── SKYLINE ──→  ←── OUTER ──→  ←── INNER ──→  [[ ROAD ]]  ←── INNER ──→  ←── OUTER ──→  ←── SKYLINE ──→
//       x < -32       -28 to -14     -14 to -7      -3.9 to 3.9   7 to 14        14 to 28       x > 32
//
const BUILD_W        = 4;     // normalised building width (max)
const BUILD_H        = 18;    // normalised building height (max)
const BUILD_D        = 6;     // normalised building depth

const TILE_LEN       = 10;
const TILE_COUNT     = 42;

const SKYLINE_COUNT  = 24;    // number of skyline pieces (12 per side)
const SKYLINE_SPAN   = 480;   // total Z span of skyline loop
const SKYLINE_SPEED  = 0.12;  // fraction of road speed (parallax)

// ─── Biomes ───────────────────────────────────────────────────────────────────
const BIOMES = {
    road:    { road: 0x131c31, glow: 0x22d3ee, fog: 0x07111f, accent: 0x22d3ee, label: 'Core Grid' },
    railway: { road: 0x18253e, glow: 0x38bdf8, fog: 0x09111f, accent: 0x60a5fa, label: 'Rail Sector' },
    bridge:  { road: 0x23151f, glow: 0xf97316, fog: 0x1a0d17, accent: 0xfb7185, label: 'Sky Bridge' },
    air:     { road: 0x0d1a2b, glow: 0xa78bfa, fog: 0x0b1220, accent: 0xc084fc, label: 'Cloud Route' },
    snow:    { road: 0x142235, glow: 0xe0f2fe, fog: 0x0e1728, accent: 0xe0f2fe, label: 'Frost Ring' },
};

const ROAD_VARIANTS = {
    road:    ['straight','straight2','damaged','curveLeft','curveRight','curveLeft2','curveRight2'],
    railway: ['straight','straight2','curveLeft','curveRight','curveLeft2'],
    bridge:  ['bridge','straight','bridge','straight2'],
    snow:    ['straight','damaged','straight2'],
    air:     ['bridge','curveLeft','curveRight'],
};

const WINDOW_COLORS = [0xffd580, 0x22d3ee, 0xffa040, 0xa78bfa, 0x94a3b8];
const STRUCT_COLORS = [0x0a1520, 0x0d1b2a, 0x111c2e, 0x0e1929, 0x091422];
const BRICK_COLORS = ['#6d3f32', '#8a5542', '#4f5f6e', '#75695e', '#2f4050'];

function rand(a, b) { return a + Math.random() * (b - a); }

function makeFacadeTexture(seed = 0, options = {}) {
    const width = 256;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const wall = options.wall || BRICK_COLORS[seed % BRICK_COLORS.length];
    const mortar = options.mortar || 'rgba(255,255,255,0.08)';
    const windowLit = options.windowLit || '#ffd580';
    const windowDark = options.windowDark || '#101826';

    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    for (let y = 0; y < height; y += 18) {
        ctx.fillRect(0, y, width, 2);
    }
    ctx.fillStyle = mortar;
    for (let x = (seed % 3) * 8; x < width; x += 34) {
        ctx.fillRect(x, 0, 2, height);
    }

    const cols = 5;
    const rows = 13;
    const padX = 22;
    const padY = 26;
    const cellW = (width - padX * 2) / cols;
    const cellH = (height - padY * 2) / rows;
    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
            const lit = ((row * 7 + col * 11 + seed) % 5) !== 0;
            const x = padX + col * cellW + 6;
            const y = padY + row * cellH + 5;
            ctx.fillStyle = lit ? windowLit : windowDark;
            ctx.fillRect(x, y, cellW - 13, cellH - 12);
            if (lit) {
                ctx.fillStyle = 'rgba(255,255,255,0.30)';
                ctx.fillRect(x + 3, y + 2, cellW - 19, 2);
            }
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

function makeWindowEmissiveTexture(seed = 0, color = '#ffd580') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 16; y < canvas.height; y += 28) {
        for (let x = 14; x < canvas.width; x += 24) {
            if (((x + y + seed * 13) % 4) === 0) continue;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 12, 14);
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

function makeRoadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#202936';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 170; i += 1) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = 8 + Math.random() * 34;
        ctx.strokeStyle = `rgba(180,190,205,${0.05 + Math.random() * 0.09})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 64) {
        ctx.strokeStyle = 'rgba(255,255,255,0.035)';
        ctx.beginPath();
        ctx.moveTo(0, y + Math.random() * 8);
        ctx.lineTo(canvas.width, y + Math.random() * 8);
        ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 8);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

// ─── EnvironmentManager ───────────────────────────────────────────────────────
export class EnvironmentManager {
    constructor(engine) {
        this.engine       = engine;
        this.scene        = engine.scene;
        this.layout       = engine.layout;
        this.currentBiome = 'road';
        this.phase        = 1;
        this.targetAtmosphere = null;
        this.worldDebug = typeof window !== 'undefined'
            && window.localStorage?.getItem('cyberSurgeWorldDebug') === '1';

        this.floorMeshes   = [];
        this.glowPanels    = [];
        this.billboards    = [];
        this.streetProps    = [];
        this.skylineMeshes = [];
        this._skylineReady = false;
        this.facadeSeed = 0;

        this.envLoader = new EnvironmentAssetLoader();
        this.envLoader.loadAll().then(() => {
            this._populateAllTiles();
            this._replaceSkylineWithAssets();
        });

        this._createSkyBackground();
        this._createFloor();
        this._createBillboards();
        this._createSkyline();
        this._createDebugZones();
        this.setBiome(this.currentBiome);
    }

    // ─── Sky Background ───────────────────────────────────────────────────────
    _createSkyBackground() {
        const W = 1024, H = 512;
        const cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        const ctx = cv.getContext('2d');

        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0.00, '#010610');
        g.addColorStop(0.30, '#030e22');
        g.addColorStop(0.65, '#071428');
        g.addColorStop(1.00, '#0d2240');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

        // Stars
        for (let i = 0; i < 380; i++) {
            ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.6})`;
            ctx.beginPath();
            ctx.arc(Math.random()*W, Math.random()*H*0.75, Math.random()<0.07?1.4:0.55, 0, Math.PI*2);
            ctx.fill();
        }

        // Aurora glows
        [
            { x: W*0.20, c: 'rgba(34,211,238,0.11)',  r: W*0.30 },
            { x: W*0.55, c: 'rgba(167,139,250,0.09)', r: W*0.25 },
            { x: W*0.80, c: 'rgba(249,115,22,0.07)',  r: W*0.18 },
        ].forEach(({ x, c, r }) => {
            const ag = ctx.createRadialGradient(x, H*0.35, 0, x, H*0.35, r);
            ag.addColorStop(0, c); ag.addColorStop(1, 'transparent');
            ctx.fillStyle = ag; ctx.fillRect(0, 0, W, H);
        });

        // Horizon city glow
        const hg = ctx.createLinearGradient(0, H*0.70, 0, H);
        hg.addColorStop(0, 'rgba(34,211,238,0.22)');
        hg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = hg; ctx.fillRect(0, H*0.70, W, H*0.30);

        this.scene.background = new THREE.CanvasTexture(cv);
    }

    // ─── Road tiles ───────────────────────────────────────────────────────────
    _createFloor() {
        for (let i = 0; i < TILE_COUNT; i++) {
            const seg = this._buildTile(-i * TILE_LEN);
            this.scene.add(seg);
            this.floorMeshes.push(seg);
        }
    }

    _buildTile(z) {
        const g = new THREE.Group();
        g.position.z = z;
        g.userData.z = z;

        // Road surface
        const roadType  = this._pickVariant(this.currentBiome);
        const roadAsset = this.engine.assets?.createRoadVariant?.(roadType);
        if (roadAsset) {
            g.add(roadAsset);
            g.userData.road = roadAsset;
            const rm = new THREE.MeshStandardMaterial({ color:0x1f2937, roughness:0.18, metalness:0.82, emissive:0x0ea5e9, emissiveIntensity:0.55 });
            const lr = new THREE.Mesh(new THREE.BoxGeometry(0.18,0.12,TILE_LEN), rm);
            lr.position.set(-3.9, 0.18, 0);
            const rr = lr.clone(); rr.position.x = 3.9;
            g.add(lr, rr);
            g.userData.leftRail  = lr;
            g.userData.rightRail = rr;
        } else {
            this._addFallbackRoad(g);
        }

        // Lane dividers
        const lm = new THREE.MeshBasicMaterial({ color:0x38bdf8, transparent:true, opacity:0.45 });
        [-1.25, 1.25].forEach(x => {
            const l = new THREE.Mesh(new THREE.PlaneGeometry(0.1, TILE_LEN), lm);
            l.rotation.x = -Math.PI/2; l.position.set(x, 0.04, 0); g.add(l);
        });

        // Building slots — populated immediately if assets ready, else later
        const bg = new THREE.Group();
        g.userData.buildingGroup = bg;
        g.add(bg);
        if (this.envLoader.isLoaded) this._fillTile(g);

        this._addSidewalksAndProps(g);

        return g;
    }

    _addFallbackRoad(g) {
        const bm = new THREE.MeshStandardMaterial({ color:0x060b14, roughness:0.95, metalness:0.18 });
        const rm = new THREE.MeshStandardMaterial({ map: makeRoadTexture(), color:0xffffff, roughness:0.75, metalness:0.3 });
        const em = new THREE.MeshStandardMaterial({ color:0x1f2937, roughness:0.34, metalness:0.82, emissive:0x0ea5e9, emissiveIntensity:0.65 });
        const pm = new THREE.MeshStandardMaterial({ color:0x1e293b, roughness:0.24, metalness:0.85, emissive:0x38bdf8, emissiveIntensity:0.4 });

        const base = new THREE.Mesh(new THREE.BoxGeometry(8,1.6,TILE_LEN), bm);
        base.position.set(0,-0.8,0); base.receiveShadow=true; g.add(base);

        const road = new THREE.Mesh(new THREE.PlaneGeometry(7.8,TILE_LEN), rm);
        road.rotation.x=-Math.PI/2; road.position.y=0.03; road.receiveShadow=true;
        g.userData.road = road; g.add(road);

        const lr = new THREE.Mesh(new THREE.BoxGeometry(0.35,0.2,TILE_LEN), em);
        lr.position.set(-3.9,0.2,0);
        const rr = lr.clone(); rr.position.x=3.9;
        g.userData.leftRail=lr; g.userData.rightRail=rr; g.add(lr,rr);

        for (let i=-4; i<=4; i+=2) {
            const p = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.06,0.6), pm);
            p.position.set(i*0.45, 0.06, rand(-3.5,3.5));
            g.add(p); this.glowPanels.push(p);
        }
    }

    // ─── Zone-enforced building fill ──────────────────────────────────────────
    _addSidewalksAndProps(tile) {
        const sidewalkMat = new THREE.MeshStandardMaterial({
            color: 0x263241,
            roughness: 0.82,
            metalness: 0.12
        });
        const curbMat = new THREE.MeshStandardMaterial({
            color: 0x22d3ee,
            emissive: 0x0891b2,
            emissiveIntensity: 0.45,
            roughness: 0.35,
            metalness: 0.55
        });

        [-1, 1].forEach((side) => {
            const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.12, TILE_LEN), sidewalkMat);
            sidewalk.position.set(side * (this.layout.roadHalfWidth + 1.25), 0.03, 0);
            sidewalk.receiveShadow = true;
            tile.add(sidewalk);

            const curb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, TILE_LEN), curbMat);
            curb.position.set(side * (this.layout.roadHalfWidth + 0.08), 0.14, 0);
            tile.add(curb);

            const lamp = this._createStreetLamp(side);
            lamp.position.set(side * (this.layout.roadHalfWidth + 2.45), 0, -2.6);
            tile.add(lamp);
            this.streetProps.push(lamp);

            if ((Math.abs(tile.userData.z) / TILE_LEN) % 3 === 0) {
                const sign = this._createNeonSign(side);
                sign.position.set(side * (this.layout.environmentMinAbsX + 0.35), 3.0, 2.5);
                tile.add(sign);
                this.streetProps.push(sign);
            }

            if ((Math.abs(tile.userData.z) / TILE_LEN) % 4 === 1) {
                const tree = this._createStreetTree();
                tree.position.set(side * (this.layout.roadHalfWidth + 2.9), 0, 2.4);
                tile.add(tree);
                this.streetProps.push(tree);
            }
        });
    }

    _createStreetLamp(side) {
        const group = new THREE.Group();
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.42, metalness: 0.8 });
        const lightMat = new THREE.MeshStandardMaterial({
            color: 0xfff1bf,
            emissive: 0xffd580,
            emissiveIntensity: 1.7,
            roughness: 0.22,
            metalness: 0.2
        });
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 3.8, 10), poleMat);
        pole.position.y = 1.9;
        group.add(pole);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.055, 0.055), poleMat);
        arm.position.set(side * -0.33, 3.65, 0);
        group.add(arm);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), lightMat);
        bulb.position.set(side * -0.76, 3.58, 0);
        group.add(bulb);
        const glow = new THREE.PointLight(0xffd580, 1.6, 9, 2);
        glow.position.copy(bulb.position);
        group.add(glow);
        return group;
    }

    _createNeonSign(side) {
        const group = new THREE.Group();
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(1.55, 0.72, 0.08),
            new THREE.MeshStandardMaterial({
                color: 0x07111f,
                emissive: side < 0 ? 0xec4899 : 0x22d3ee,
                emissiveIntensity: 0.9,
                roughness: 0.18,
                metalness: 0.75
            })
        );
        frame.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
        group.add(frame);
        return group;
    }

    _createStreetTree() {
        const group = new THREE.Group();
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.11, 1.2, 8),
            new THREE.MeshStandardMaterial({ color: 0x4b2f22, roughness: 0.85 })
        );
        trunk.position.y = 0.6;
        group.add(trunk);
        const crown = new THREE.Mesh(
            new THREE.ConeGeometry(0.58, 1.65, 9),
            new THREE.MeshStandardMaterial({ color: 0x0f5132, roughness: 0.72, emissive: 0x062516, emissiveIntensity: 0.05 })
        );
        crown.position.y = 1.75;
        group.add(crown);
        return group;
    }

    _fillTile(tile) {
        const bg = tile.userData.buildingGroup;
        while (bg.children.length) bg.remove(bg.children[0]);

        const streetSlots = [
            { column: 'inner', z: -2.6, scale: 0.98 },
            { column: 'inner', z: 2.6, scale: 0.94 },
            { column: 'outer', z: 0, scale: 1.08 }
        ];

        [-1, 1].forEach(side => {
            streetSlots.forEach((slot, slotIndex) => {
                const xCenter = this.layout.getSideZoneX(side, slot.column);

                // Get asset or fallback
                const b = this.envLoader.isLoaded
                    ? this.envLoader.cloneRandomBuilding()
                    : null;
                const mesh = b ?? this._fallbackBuilding(xCenter, slotIndex);

                if (b) {
                    const s = slot.scale * rand(0.96, 1.04);
                    b.scale.multiplyScalar(s);
                    b.rotation.y = 0;
                    b.position.set(xCenter, 0, slot.z);

                    // ── Safety: enforce hard boundary ─────────────────────────
                    this._clampToZone(b, side, 'building');
                    this._applyBuildingMaterial(b);
                } else {
                    this._clampToZone(mesh, side, 'fallback-building');
                    mesh.position.z = slot.z;
                }

                bg.add(mesh);
            });
        });
    }

    /**
     * Hard boundary enforcement — if the building's bounding box intersects
     * the road zone, push it outward until it's clear.
     */
    _clampToZone(obj, side, label = 'environment') {
        this.layout.validateEnvironmentObject(obj, side, label);
    }

    _fallbackBuilding(xCenter, slotIndex = 0) {
        const h   = 8 + Math.random() * 16;
        const winCol = WINDOW_COLORS[Math.floor(Math.random() * WINDOW_COLORS.length)];
        const seed = this.facadeSeed + slotIndex;
        this.facadeSeed += 1;
        const g   = new THREE.Group();
        const facadeMap = makeFacadeTexture(seed, {
            wall: BRICK_COLORS[seed % BRICK_COLORS.length],
            windowLit: `#${winCol.toString(16).padStart(6, '0')}`
        });
        const emissiveMap = makeWindowEmissiveTexture(seed, `#${winCol.toString(16).padStart(6, '0')}`);

        // Main body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(BUILD_W, h, BUILD_D),
            new THREE.MeshStandardMaterial({
                map: facadeMap,
                roughness: 0.66,
                metalness: 0.2,
                emissive: winCol,
                emissiveMap,
                emissiveIntensity: 0.34
            })
        );
        body.position.set(xCenter, h/2, 0);
        body.castShadow = body.receiveShadow = true;
        g.add(body);

        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(BUILD_W * 1.04, 0.22, BUILD_D * 1.04),
            new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5, metalness: 0.42 })
        );
        roof.position.set(xCenter, h + 0.11, 0);
        g.add(roof);
        return g;
    }

    _applyBuildingMaterial(obj) {
        let idx = 0;
        obj.traverse(child => {
            if (!child.isMesh || !child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(m => {
                const hasMap = m.map?.image;
                if (!hasMap) {
                    m.map = makeFacadeTexture(this.facadeSeed + idx, {
                        wall: BRICK_COLORS[(this.facadeSeed + idx) % BRICK_COLORS.length]
                    });
                    m.color?.setHex?.(0xffffff);
                }
                if ('emissive' in m) {
                    const name = `${m.name || ''} ${child.name || ''}`.toLowerCase();
                    const windowLike = /window|glass|light|lamp|neon|sign/.test(name) || idx % 5 === 0;
                    if (windowLike) {
                        m.emissive.setHex(WINDOW_COLORS[idx % WINDOW_COLORS.length]);
                        m.emissiveIntensity = Math.max(m.emissiveIntensity || 0, 0.42);
                    } else {
                        m.emissiveIntensity = Math.min(m.emissiveIntensity || 0, 0.07);
                    }
                }
                m.roughness = Math.min(0.82, Math.max(0.38, m.roughness ?? 0.7));
                m.metalness = Math.min(0.55, Math.max(0.08, m.metalness ?? 0.2));
                m.needsUpdate = true;
                idx++;
            });
        });
        this.facadeSeed += idx + 1;
    }

    _populateAllTiles() {
        this.floorMeshes.forEach(t => this._fillTile(t));
    }

    // ─── Skyline ──────────────────────────────────────────────────────────────
    // Continuous strip: SKYLINE_COUNT pieces split evenly left/right,
    // spaced evenly along Z, forming an unbroken city-wall backdrop.
    _createSkyline() {
        const perSide = SKYLINE_COUNT / 2;
        const spacing = SKYLINE_SPAN / perSide;

        [-1, 1].forEach(side => {
            for (let i = 0; i < perSide; i++) {
                const z   = -(i / perSide) * SKYLINE_SPAN;
                const grp = this._buildSkylinePiece(side, z, i);
                this.scene.add(grp);
                this.skylineMeshes.push(grp);
            }
        });
    }

    _buildSkylinePiece(side, z, idx) {
        const g = new THREE.Group();
        g.userData.side  = side;
        g.userData.baseZ = z;

        // 2-3 tower cluster per piece for continuous wall feel
        const count = 2 + (idx % 2);
        for (let j = 0; j < count; j++) {
            const h = 25 + Math.random() * 40;
            const w = 6  + Math.random() * 10;
            const m = new THREE.MeshStandardMaterial({
                color: STRUCT_COLORS[j % STRUCT_COLORS.length],
                roughness: 0.55, metalness: 0.65,
                emissive: WINDOW_COLORS[(idx+j) % WINDOW_COLORS.length],
                emissiveIntensity: 0.10 + Math.random() * 0.10,
            });
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, 8), m);
            // Spread towers side by side along X to form a continuous wall
            mesh.position.set(
                this.layout.getSkylineX(side) + side * j * (w * 0.85),
                h/2,
                j * 10,
            );
            g.add(mesh);
        }

        g.position.z = z;
        this._clampToZone(g, side, 'procedural-skyline');
        return g;
    }

    _replaceSkylineWithAssets() {
        this.skylineMeshes.forEach((grp) => {
            const asset = this.envLoader.cloneRandomSkyline?.();
            if (!asset) return;
            while (grp.children.length) grp.remove(grp.children[0]);
            const side = grp.userData.side;
            const s = rand(0.85, 1.10);
            asset.scale.multiplyScalar(s);
            asset.position.set(this.layout.getSkylineX(side) + side * rand(0, 8), 0, rand(-4,4));
            asset.rotation.y = side < 0 ? rand(-0.1,0.08) : rand(-0.08,0.1);
            this._applyBuildingMaterial(asset);
            this._clampToZone(asset, side, 'skyline');
            grp.add(asset);
        });
        this._skylineReady = true;
    }

    // ─── Billboards ───────────────────────────────────────────────────────────
    _createBillboards() {
        for (let i = 0; i < 10; i++) {
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08,0.08,6,8),
                new THREE.MeshStandardMaterial({ color:0x475569, roughness:0.45, metalness:0.75 })
            );
            const screen = new THREE.Mesh(
                new THREE.BoxGeometry(2.8,1.6,0.14),
                new THREE.MeshStandardMaterial({ color:0x0f172a, roughness:0.2, metalness:0.78, emissive: i%2===0?0x22d3ee:0xf97316, emissiveIntensity:0.55 })
            );
            const g = new THREE.Group();
            pole.position.y = 3; screen.position.set(0,5,0);
            g.add(pole, screen);
            // Billboards sit just outside road, inside inner column
            g.position.set(i%2===0 ? -(this.layout.roadHalfWidth + 1.8) : (this.layout.roadHalfWidth + 1.8), 0, -30 - i*38);
            g.userData.screen = screen;
            this.scene.add(g);
            this.billboards.push(g);
        }
    }

    // ─── Update ───────────────────────────────────────────────────────────────
    update(dt = 0) {
        const pz = this.engine.player.player.position.z;
        const totalLen = this.floorMeshes.length * TILE_LEN;

        // Recycle road tiles
        this.floorMeshes.forEach(seg => {
            const rel = seg.userData.z - pz;
            if (rel > TILE_LEN + 5) {
                const nz = seg.userData.z - totalLen;
                seg.position.z = nz;
                seg.userData.z = nz;
                if (this.envLoader.isLoaded) this._fillTile(seg);
            }
        });

        // Parallax skyline (layer 3 — background)
        this.skylineMeshes.forEach(grp => {
            const shifted = pz * SKYLINE_SPEED;
            grp.position.z = grp.userData.baseZ + shifted;
            const rel = grp.position.z - pz;
            if (rel > 60) {
                grp.userData.baseZ -= SKYLINE_SPAN;
            } else if (rel < -(SKYLINE_SPAN + 60)) {
                grp.userData.baseZ += SKYLINE_SPAN;
            }
        });

        // Billboards
        this.billboards.forEach((b, i) => {
            b.userData.screen.material.emissiveIntensity = 0.45 + Math.sin(this.engine.elapsedTime*2.5+i)*0.12;
            if (b.position.z > pz + 25) b.position.z = pz - 340 - Math.random()*60;
        });

        // Glow panels pulse
        this.glowPanels.forEach((p, i) => {
            if (p.material?.emissiveIntensity !== undefined)
                p.material.emissiveIntensity = 0.28 + Math.sin(this.engine.elapsedTime*3.2+i*0.8)*0.14;
        });

        this.updateAtmosphere(dt);
    }

    _createDebugZones() {
        if (!this.worldDebug) {
            return;
        }

        const materialRoad = new THREE.LineBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.85 });
        const materialEnv = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.65 });
        const zNear = 20;
        const zFar = -430;

        [
            { x: this.layout.roadMinX, material: materialRoad },
            { x: this.layout.roadMaxX, material: materialRoad },
            { x: -this.layout.environmentMinAbsX, material: materialEnv },
            { x: this.layout.environmentMinAbsX, material: materialEnv }
        ].forEach(({ x, material }) => {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x, 0.09, zNear),
                new THREE.Vector3(x, 0.09, zFar)
            ]);
            const line = new THREE.Line(geometry, material);
            line.renderOrder = 20;
            this.scene.add(line);
        });

        console.info('[CyberSurge:world] Debug zones enabled', {
            road: [this.layout.roadMinX, this.layout.roadMaxX],
            environmentMinAbsX: this.layout.environmentMinAbsX
        });
    }

    // ─── Biome / atmosphere ───────────────────────────────────────────────────
    setBiome(biome) {
        if (!BIOMES[biome]) return;
        this.currentBiome = biome;
        const col = BIOMES[biome];
        this.targetAtmosphere = {
            fog:  new THREE.Color(col.fog),
            near: this.phase===3 ? 24 : this.phase===2 ? 34 : 42,
            far:  this.phase===3 ? 165 : this.phase===2 ? 215 : 250,
        };
        this.floorMeshes.forEach(seg => {
            if (seg.userData.road?.material?.color) seg.userData.road.material.color.setHex(col.road);
            const l=seg.userData.leftRail, r=seg.userData.rightRail;
            if (l?.material?.emissive) l.material.emissive.setHex(col.glow);
            if (r?.material?.emissive) r.material.emissive.setHex(col.glow);
        });
        this.glowPanels.forEach(p => { if(p.material?.emissive) p.material.emissive.setHex(col.glow); });
        this.billboards.forEach(b => { if(b.userData.screen?.material?.emissive) b.userData.screen.material.emissive.setHex(col.accent); });
    }

    setPhase(phase) { this.phase = phase; this.setBiome(this.currentBiome); }

    updateAtmosphere(dt) {
        if (!this.targetAtmosphere) return;
        const blend = 1 - Math.pow(0.025, Math.max(0,dt));
        // sky texture is untouched — only fog changes
        this.scene.fog.color.lerp(this.targetAtmosphere.fog, blend);
        this.scene.fog.near = THREE.MathUtils.lerp(this.scene.fog.near, this.targetAtmosphere.near, blend);
        this.scene.fog.far  = THREE.MathUtils.lerp(this.scene.fog.far,  this.targetAtmosphere.far,  blend);
    }

    getCurrentDistrictLabel() { return BIOMES[this.currentBiome]?.label || 'Core Grid'; }

    reset() {
        this.floorMeshes.forEach((seg, i) => {
            const z = -i * TILE_LEN;
            seg.position.z = z; seg.userData.z = z;
        });
        this.billboards.forEach((b, i) => { b.position.z = -30 - i*38; });
        this.skylineMeshes.forEach((g, i) => {
            const perSide = SKYLINE_COUNT / 2;
            const idx = i % perSide;
            g.userData.baseZ = -(idx / perSide) * SKYLINE_SPAN;
            g.position.z = g.userData.baseZ;
        });
        this.phase = 1;
        this.setBiome('road');
    }

    _pickVariant(biome) {
        const v = ROAD_VARIANTS[biome] || ROAD_VARIANTS.road;
        return v[Math.floor(Math.random() * v.length)];
    }

    // Legacy alias
    createFloor()      { this._createFloor(); }
    createBillboards() { this._createBillboards(); }
}
