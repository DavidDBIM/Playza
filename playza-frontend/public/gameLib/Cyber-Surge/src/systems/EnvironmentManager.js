import * as THREE from 'three';
import { EnvironmentAssetLoader } from './EnvironmentAssetLoader.js';

// ─── World Zone Definitions ───────────────────────────────────────────────────
//
//   ←── SKYLINE ──→  ←── OUTER ──→  ←── INNER ──→  [[ ROAD ]]  ←── INNER ──→  ←── OUTER ──→  ←── SKYLINE ──→
//       x < -32       -28 to -14     -14 to -7      -3.9 to 3.9   7 to 14        14 to 28       x > 32
//
const ROAD_HALF      = 3.9;    // road spans ±3.9
const SAFE_MARGIN    = 3.1;    // gap between road edge and nearest building edge
const INNER_X        = 10;    // centre of inner building column  (edge at 10-2=8 > 7 ✓)
const OUTER_X        = 17;    // centre of outer building column
const SKYLINE_X      = 36;    // centre of skyline strip
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

function rand(a, b) { return a + Math.random() * (b - a); }

// ─── EnvironmentManager ───────────────────────────────────────────────────────
export class EnvironmentManager {
    constructor(engine) {
        this.engine       = engine;
        this.scene        = engine.scene;
        this.currentBiome = 'road';
        this.phase        = 1;
        this.targetAtmosphere = null;

        this.floorMeshes   = [];
        this.glowPanels    = [];
        this.billboards    = [];
        this.skylineMeshes = [];
        this._skylineReady = false;

        this.envLoader = new EnvironmentAssetLoader();
        this.envLoader.loadAll().then(() => {
            this._populateAllTiles();
            this._replaceSkylineWithAssets();
        });

        this._createSkyBackground();
        this._createFloor();
        this._createBillboards();
        this._createSkyline();
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

        return g;
    }

    _addFallbackRoad(g) {
        const bm = new THREE.MeshStandardMaterial({ color:0x060b14, roughness:0.95, metalness:0.18 });
        const rm = new THREE.MeshStandardMaterial({ color:0x131c31, roughness:0.75, metalness:0.3 });
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
    _fillTile(tile) {
        const bg = tile.userData.buildingGroup;
        while (bg.children.length) bg.remove(bg.children[0]);

        // Place buildings in two rows per side (inner + outer column)
        // Each column: one building per tile at Z=0 (aligned with tile centre)
        [-1, 1].forEach(side => {
            [INNER_X, OUTER_X].forEach((col, ci) => {
                const xCenter = side * col;

                // Get asset or fallback
                const b = this.envLoader.isLoaded
                    ? this.envLoader.cloneRandomBuilding()
                    : null;
                const mesh = b ?? this._fallbackBuilding(xCenter);

                if (b) {
                    const s = rand(0.88, 1.08);
                    b.scale.multiplyScalar(s);
                    // Face buildings inward (toward road)
                    b.rotation.y = side < 0
                        ? rand(-0.06, 0.12)
                        : rand(-0.12, 0.06);
                    b.position.set(xCenter, 0, 0);

                    // ── Safety: enforce hard boundary ─────────────────────────
                    this._clampToZone(b, side);
                    this._applyBuildingMaterial(b);
                }

                // Offset outer column slightly in Z for depth stagger
                mesh.position.z = ci === 1 ? rand(-1.5, 1.5) : 0;
                bg.add(mesh);
            });
        });
    }

    /**
     * Hard boundary enforcement — if the building's bounding box intersects
     * the road zone, push it outward until it's clear.
     */
    _clampToZone(obj, side) {
        obj.updateMatrixWorld(true);
        const box  = new THREE.Box3().setFromObject(obj);
        const minSafeX = ROAD_HALF + SAFE_MARGIN; // 7.0

        if (side < 0) {
            // Left side: box.max.x must be < -minSafeX
            if (box.max.x > -minSafeX) {
                obj.position.x -= (box.max.x + minSafeX);
                obj.updateMatrixWorld(true);
            }
        } else {
            // Right side: box.min.x must be > minSafeX
            if (box.min.x < minSafeX) {
                obj.position.x += (minSafeX - box.min.x);
                obj.updateMatrixWorld(true);
            }
        }
    }

    _fallbackBuilding(xCenter) {
        const h   = 8 + Math.random() * 16;
        const col = STRUCT_COLORS[Math.floor(Math.random() * STRUCT_COLORS.length)];
        const winCol = WINDOW_COLORS[Math.floor(Math.random() * WINDOW_COLORS.length)];
        const g   = new THREE.Group();

        // Main body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(BUILD_W, h, BUILD_D),
            new THREE.MeshStandardMaterial({ color:col, roughness:0.72, metalness:0.38, emissive:0x050e1a, emissiveIntensity:0.04 })
        );
        body.position.set(xCenter, h/2, 0);
        body.castShadow = body.receiveShadow = true;
        g.add(body);

        // Window strip
        const winH = h * 0.55;
        const win = new THREE.Mesh(
            new THREE.BoxGeometry(BUILD_W * 0.7, winH, 0.12),
            new THREE.MeshStandardMaterial({ color:0x050e1a, emissive:winCol, emissiveIntensity:0.55, roughness:0.2, metalness:0.5 })
        );
        win.position.set(xCenter, h * 0.48, BUILD_D/2 + 0.06);
        g.add(win);
        return g;
    }

    _applyBuildingMaterial(obj) {
        let idx = 0;
        obj.traverse(child => {
            if (!child.isMesh || !child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(m => {
                const hasMap = m.map?.image;
                if (!hasMap) m.color.setHex(STRUCT_COLORS[idx % STRUCT_COLORS.length]);
                if ('emissive' in m) {
                    const small = idx % 4 === 0;
                    m.emissive.setHex(small ? WINDOW_COLORS[idx % WINDOW_COLORS.length] : 0x050e1a);
                    m.emissiveIntensity = small ? 0.52 : 0.04;
                }
                m.roughness = 0.72; m.metalness = 0.38; m.needsUpdate = true;
                idx++;
            });
        });
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
                side * (SKYLINE_X + j * (w * 0.85)),
                h/2,
                j * 10,
            );
            g.add(mesh);
        }

        g.position.z = z;
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
            asset.position.set(side * (SKYLINE_X + rand(0,8)), 0, rand(-4,4));
            asset.rotation.y = side < 0 ? rand(-0.1,0.08) : rand(-0.08,0.1);
            this._applyBuildingMaterial(asset);
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
            g.position.set(i%2===0 ? -(ROAD_HALF+1.8) : (ROAD_HALF+1.8), 0, -30 - i*38);
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
