import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/DRACOLoader.js';
import { clone as cloneSkinned } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/utils/SkeletonUtils.js';

// ---------------------------------------------------------------------------
// Asset paths
// car-pack-1.glb and car-Pack-2.glb are multi-model collections;
// they are loaded and each top-level car extracted as separate variants.
// ---------------------------------------------------------------------------

const RUNNER_PATHS = [
    './src/assets/runners/runner.glb'
];

const ROAD_PATH = './src/assets/roads/roads-collection.glb';
const ROAD_VARIANT_KEYS = ['straight', 'curveLeft', 'curveRight', 'bridge', 'damaged'];

const OBSTACLE_PATHS = {
    blocker: [
        './src/assets/obstacles/road-bloackage/blockade.glb',
        './src/assets/obstacles/road-bloackage/blockage.glb',
        './src/assets/obstacles/road-bloackage/roadblock.glb',
        './src/assets/obstacles/road-bloackage/road_block.glb',
        './src/assets/obstacles/road-bloackage/redblockade.glb'
    ],
    slideGate: [
        './src/assets/obstacles/road-bloackage/road-closed.glb',
        './src/assets/obstacles/road-bloackage/brickblock.glb',
        './src/assets/obstacles/road-bloackage/obstacles.glb'
    ],
    drone: [
        './src/assets/obstacles/car/car-pack-1.glb',
        './src/assets/obstacles/car/car-Pack-2.glb',
        './src/assets/obstacles/car/car-pack.glb',
        './src/assets/obstacles/car/car-wreck.glb',
        './src/assets/obstacles/car/2003_chevrolet_express_gmc_savana_2500_cargo_van.glb',
        './src/assets/obstacles/car/freesmart_van.glb',
        './src/assets/obstacles/car/free_zuk_3d_model.glb',
        './src/assets/obstacles/car/graffiti_van_challenge.glb',
        './src/assets/obstacles/car/graffiti_van_template.glb',
        './src/assets/obstacles/car/retro_anime_vintage_volkswagen_van.glb',
        './src/assets/obstacles/car/sci-fi_van.glb',
        './src/assets/obstacles/car/van_shell.glb'
    ]
};

// Rotating cyberpunk accent palettes per obstacle type
const ACCENT_PALETTES = {
    blocker:   [0x1d4ed8, 0xdc2626, 0x7c3aed, 0x0891b2, 0xb91c1c, 0x4338ca],
    slideGate: [0xf97316, 0xca8a04, 0x15803d, 0xdb2777, 0xea580c],
    drone:     [0xef4444, 0x22d3ee, 0xf97316, 0xa855f7, 0x10b981, 0xeab308, 0xec4899, 0x06b6d4]
};

// ---------------------------------------------------------------------------

export class AssetLibrary {
    constructor(engine) {
        this.engine = engine;

        // DRACOLoader mandatory — most Sketchfab/Blender GLBs use Draco compression.
        // Without it, compressed meshes fail silently.
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(
            'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/'
        );
        dracoLoader.preload();
        this.loader = new GLTFLoader();
        this.loader.setDRACOLoader(dracoLoader);

        this.assets = {
            runner:    null,
            roads:     new Map(),
            obstacles: new Map()
        };

        // Track per-type color index so consecutive obstacles have different colours
        this._colorIdx = { blocker: 0, slideGate: 0, drone: 0 };
    }

    // -----------------------------------------------------------------------
    // Public: load everything before game systems initialise
    // -----------------------------------------------------------------------

    async loadAll() {
        const [runner, roadResult, obstacleResult] = await Promise.allSettled([
            this.loadRunner(),
            this.loadRoads(),
            this.loadObstacles()
        ]);

        if (runner.status === 'fulfilled' && runner.value) {
            this.assets.runner = runner.value;
        }
        if (roadResult.status === 'fulfilled') {
            this.assets.roads = roadResult.value;
        }
        if (obstacleResult.status === 'fulfilled') {
            this.assets.obstacles = obstacleResult.value;
        }

        console.log(
            '[AssetLibrary] ready — runner:', !!this.assets.runner,
            '| road variants:', this.assets.roads.size,
            '| obstacle types:', [...this.assets.obstacles.entries()]
                .map(([k, v]) => `${k}:${v.length}`).join(', ')
        );
    }

    // -----------------------------------------------------------------------
    // Loaders
    // -----------------------------------------------------------------------

    async loadRunner() {
        for (const path of RUNNER_PATHS) {
            try {
                const gltf = await this.loadGLTF(path);
                if (!this.hasMesh(gltf.scene)) {
                    console.warn(`[AssetLibrary] runner has no mesh: ${path}`);
                    continue;
                }
                console.log(`[AssetLibrary] runner OK: ${path} | anims: ${gltf.animations?.length ?? 0}`);
                return gltf;
            } catch (err) {
                console.warn(`[AssetLibrary] runner failed: ${path}`, err.message ?? err);
            }
        }
        console.warn('[AssetLibrary] no runner GLB loaded — using fallback character.');
        return null;
    }

    async loadRoads() {
        const result = new Map();
        try {
            const gltf = await this.loadGLTF(ROAD_PATH);
            const variants = this.extractRenderableVariants(gltf.scene, { includeSceneFallback: true });

            const keywordGroups = {
                straight:   ['straight', 'road', 'segment', 'flat', 'main'],
                curveLeft:  ['curveleft', 'curve_left', 'left'],
                curveRight: ['curveright', 'curve_right', 'right'],
                bridge:     ['bridge'],
                damaged:    ['damage', 'damaged', 'broken']
            };

            Object.entries(keywordGroups).forEach(([type, keywords]) => {
                const matched = variants.find((v) =>
                    keywords.some((kw) => v.name.includes(kw))
                );
                if (matched) result.set(type, matched.object);
            });

            const unusedVariants = variants.filter((variant) => ![...result.values()].includes(variant.object));
            ROAD_VARIANT_KEYS.forEach((type, index) => {
                if (!result.has(type)) {
                    result.set(type, unusedVariants[index]?.object || unusedVariants[0]?.object || gltf.scene);
                }
            });

            console.log('[AssetLibrary] road variants:', [...result.keys()].join(', '));
        } catch (err) {
            console.warn('[AssetLibrary] road asset failed — fallback geometry will be used.', err.message ?? err);
        }
        return result;
    }

    async loadObstacles() {
        const result = new Map();

        for (const [type, paths] of Object.entries(OBSTACLE_PATHS)) {
            const settled = await Promise.allSettled(paths.map((p) => this.loadGLTF(p)));
            const scenes = [];

            settled.forEach((outcome, index) => {
                if (outcome.status === 'rejected') {
                    console.warn(`[AssetLibrary] obstacle failed: ${paths[index]}`, outcome.reason?.message ?? outcome.reason);
                    return;
                }
                const gltf = outcome.value;
                if (!gltf?.scene || !this.hasMesh(gltf.scene)) {
                    console.warn(`[AssetLibrary] obstacle stub (no mesh) skipped: ${paths[index]}`);
                    return;
                }

                // ── Multi-model GLB pack: extract each top-level car separately ──
                const topChildren = gltf.scene.children.filter((child) => this.hasMesh(child));
                if (topChildren.length > 1) {
                    console.log(`[AssetLibrary] pack extracted from ${paths[index]}: ${topChildren.length} models`);
                    topChildren.forEach((child) => scenes.push({ scene: child, isExtracted: true }));
                } else {
                    // Single model: use the full scene root
                    scenes.push({ scene: gltf.scene, isExtracted: false });
                }
            });

            if (scenes.length) {
                result.set(type, scenes);
                console.log(`[AssetLibrary] obstacle '${type}': ${scenes.length} variant(s) ready.`);
            } else {
                console.warn(`[AssetLibrary] obstacle '${type}': no models loaded — fallback geometry will be used.`);
            }
        }
        return result;
    }

    // -----------------------------------------------------------------------
    // Factory methods — called per spawn
    // -----------------------------------------------------------------------

    createRunner() {
        if (!this.assets.runner?.scene) return null;

        let cloned;
        try {
            cloned = cloneSkinned(this.assets.runner.scene);
        } catch (err) {
            console.warn('[AssetLibrary] SkeletonUtils.clone failed, using plain clone:', err.message);
            cloned = this.assets.runner.scene.clone(true);
        }
        cloned.position.set(0, 0, 0);
        this.prepareClone(cloned);

        const clips   = this.assets.runner.animations || [];
        const mixer   = clips.length ? new THREE.AnimationMixer(cloned) : null;
        const actions = {};
        const clipMap  = {
            idle:  ['idle', 'stand', 'standing', 't-pose'],
            run:   ['run', 'running', 'jog', 'walk'],
            jump:  ['jump', 'leap', 'fly'],
            slide: ['slide', 'sliding', 'roll', 'crouch', 'duck']
        };

        Object.entries(clipMap).forEach(([key, names]) => {
            const clip = clips.find((c) =>
                names.some((n) => c.name.toLowerCase().includes(n))
            );
            if (clip && mixer) {
                actions[key] = mixer.clipAction(clip);
                actions[key].enabled          = true;
                actions[key].clampWhenFinished = key === 'jump' || key === 'slide';
            }
        });

        // If no named clips match but there are clips, map them by index
        if (!Object.keys(actions).length && clips.length && mixer) {
            const order = ['idle', 'run', 'jump', 'slide'];
            clips.slice(0, 4).forEach((clip, i) => {
                const key = order[i];
                actions[key] = mixer.clipAction(clip);
                actions[key].enabled = true;
            });
            console.log('[AssetLibrary] runner: fallback clip mapping by index:', clips.map(c => c.name));
        }

        console.log('[AssetLibrary] runner ready. Clips:', clips.map(c => c.name).join(', ') || 'none');

        // Bottom of model at y=0 (ground level). normalizeToSize alignY:0.
        const normalized = this.normalizeToSize(
            cloned,
            { width: 1.1, height: 2.2, depth: 1.1 },
            { alignY: 0, centerX: true, centerZ: true }
        );
        normalized.rotation.y = 0;
        normalized.visible    = true;

        return { model: normalized, mixer, actions };
    }

    /**
     * Road variant — top face of road model placed at y=0 (running surface).
     * Scale driven only by X/Z (width/depth); height target is large so it
     * doesn't constrain the uniform scale and squish the model.
     */
    createRoadVariant(type = 'straight') {
        const source = this.assets.roads.get(type) || this.assets.roads.get('straight');
        if (!source) return null;

        let clone;
        try { clone = cloneSkinned(source); } catch { clone = source.clone(true); }
        clone.position.set(0, 0, 0);
        this.prepareClone(clone);

        // Apply dark cyberpunk road material — tarmac near-black with blue tinge
        this.applyRoadMaterials(clone);

        return this.normalizeToSize(
            clone,
            { width: 10, height: 100, depth: 10 },
            { alignYTop: 0, centerX: true, centerZ: true }
        );
    }

    /**
     * Obstacle — bottom of model at y=0. Auto-corrects sideways orientation.
     * Applies cyberpunk emissive colour tint for visual variety.
     */
    createObstacle(type, config) {
        const sourceList = this.assets.obstacles.get(type) || this.assets.obstacles.get('blocker');
        if (!sourceList?.length) return null;

        const entry  = sourceList[Math.floor(Math.random() * sourceList.length)];
        const source = entry.scene ?? entry; // handle both wrapped and plain objects

        let clone;
        try { clone = cloneSkinned(source); } catch { clone = source.clone(true); }
        clone.position.set(0, 0, 0);
        this.prepareClone(clone);

        // ── Auto-correct sideways orientation ────────────────────────────────
        this.autoOrientObstacle(clone, type);

        // ── Apply cyberpunk colour tint ───────────────────────────────────────
        const palette = ACCENT_PALETTES[type] || ACCENT_PALETTES.blocker;
        const idx = this._colorIdx[type] ?? 0;
        this._colorIdx[type] = (idx + 1) % palette.length;
        this.applyAccentColor(clone, palette[idx], type);

        // ── Visual size targets ───────────────────────────────────────────────
        // Cars get extra depth room so they aren't squished to a cube.
        // We use a larger target than the collision config to keep proportions.
        const targets = type === 'drone'
            ? { width: 2.2, height: 1.6, depth: 4.5 }
            : { width: config.width, height: Math.max(config.height, 1.2), depth: config.depth };

        return this.normalizeToSize(clone, targets, { alignY: 0, centerX: true, centerZ: true });
    }

    // -----------------------------------------------------------------------
    // Material helpers
    // -----------------------------------------------------------------------

    /** Darken road surface to a cyberpunk tarmac colour */
    applyRoadMaterials(object) {
        object.traverse((child) => {
            if (!child.isMesh || !child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
                m.color.set(m.map ? 0xffffff : 0x0d1520);
                if ('emissive' in m) {
                    m.emissive.set(m.emissiveMap ? 0xffffff : 0x060c14);
                    m.emissiveIntensity = m.emissiveMap ? 0.12 : 0.06;
                }
                m.roughness    = 0.92;
                m.metalness    = 0.12;
                m.needsUpdate  = true;
            });
        });
    }

    /** Apply a vivid cyberpunk accent emissive to an obstacle clone */
    applyAccentColor(object, accentHex, type) {
        const accentCol = new THREE.Color(accentHex);
        object.traverse((child) => {
            if (!child.isMesh || !child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
                if ('emissive' in m) {
                    m.emissive.set(accentCol);
                    // Cars get a stronger glow; blockers subtler
                    m.emissiveIntensity = type === 'drone' ? 0.55 : 0.35;
                }
                m.needsUpdate = true;
            });
        });
    }

    /**
     * Auto-orient an obstacle so it faces the correct direction.
     * Blockers/slideGates should span the X axis (wide across the road).
     * Cars (drone) should be long along Z (facing the player).
     */
    autoOrientObstacle(clone, type) {
        const box  = new THREE.Box3().setFromObject(clone);
        const size = new THREE.Vector3();
        box.getSize(size);

        if ((type === 'blocker' || type === 'slideGate') && size.z > size.x * 1.4) {
            // Model is oriented along Z but should span X → rotate 90° around Y
            clone.rotation.y = Math.PI / 2;
            clone.updateMatrixWorld(true);
        }
        if (type === 'drone' && size.x > size.z * 1.4) {
            // Car oriented along X but should be long along Z → rotate 90° around Y
            clone.rotation.y = Math.PI / 2;
            clone.updateMatrixWorld(true);
        }
    }

    // -----------------------------------------------------------------------
    // Scene / variant helpers
    // -----------------------------------------------------------------------

    hasMesh(scene) {
        if (!scene) return false;
        let found = false;
        scene.traverse((c) => { if (c.isMesh || c.isSkinnedMesh) found = true; });
        return found;
    }

    extractRenderableVariants(scene, options = {}) {
        const variants = [];
        const seen     = new Set();

        scene.traverse((child) => {
            if (!child.isObject3D || child === scene) return;
            const hasRenderable =
                child.isMesh ||
                child.isSkinnedMesh ||
                child.children.some((c) => c.isMesh || c.isSkinnedMesh);
            if (!hasRenderable) return;
            const key = `${child.name}:${child.uuid}`;
            if (seen.has(key)) return;
            seen.add(key);
            variants.push({ name: (child.name || '').toLowerCase(), object: child });
        });

        if (!variants.length && options.includeSceneFallback && scene) {
            variants.push({ name: (scene.name || 'scene').toLowerCase(), object: scene });
        }
        return variants;
    }

    prepareClone(object) {
        object.visible = true;
        object.traverse((child) => {
            child.visible = true;
            if (!child.isMesh && !child.isSkinnedMesh) return;
            child.castShadow    = true;
            child.receiveShadow = true;
            if (child.material) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach((m) => {
                    if ('metalness' in m && m.metalness == null) m.metalness = 0.3;
                    if ('roughness' in m && m.roughness == null) m.roughness = 0.7;
                });
            }
        });
    }

    /**
     * Wraps `object` in a Group, applies uniform scale to fit within target
     * bounding box, then aligns it vertically:
     *   alignY    → bottom of bounding box at Y (obstacles/runner standing on ground)
     *   alignYTop → top   of bounding box at Y (roads surface flush with ground)
     */
    normalizeToSize(object, target, options = {}) {
        const wrapper = new THREE.Group();
        wrapper.visible = true;
        wrapper.add(object);
        object.updateMatrixWorld(true);

        const box  = new THREE.Box3().setFromObject(object);
        const size = new THREE.Vector3();
        box.getSize(size);

        if (size.lengthSq() === 0) {
            console.warn('[AssetLibrary] normalizeToSize: zero-size object, skipping scale.');
            return wrapper;
        }

        const scale = Math.min(
            target.width  / Math.max(size.x, 0.001),
            target.height / Math.max(size.y, 0.001),
            target.depth  / Math.max(size.z, 0.001)
        );
        object.scale.multiplyScalar(scale);
        object.updateMatrixWorld(true);

        const scaledBox    = new THREE.Box3().setFromObject(object);
        const scaledCenter = new THREE.Vector3();
        scaledBox.getCenter(scaledCenter);

        if (options.centerX) object.position.x += -scaledCenter.x;
        if (options.centerZ) object.position.z += -scaledCenter.z;

        if (options.alignYTop !== undefined) {
            // Top face of model → alignYTop
            object.position.y += options.alignYTop - scaledBox.max.y;
        } else if (options.alignY !== undefined) {
            // Bottom face of model → alignY
            object.position.y += options.alignY - scaledBox.min.y;
        }

        object.updateMatrixWorld(true);
        return wrapper;
    }

    loadGLTF(path) {
        return new Promise((resolve, reject) => {
            this.loader.load(path, resolve, undefined, reject);
        });
    }
}
