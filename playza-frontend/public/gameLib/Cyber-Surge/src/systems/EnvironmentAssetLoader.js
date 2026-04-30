import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/DRACOLoader.js';

// ─── Asset manifests ──────────────────────────────────────────────────────────
const BUILDING_PATHS = [
    './src/assets/environments/building/low_poly_buildings.glb',
    './src/assets/environments/building/low-poly_city_buildings.glb',
    './src/assets/environments/building/6_low-poly_building_pack_1.glb',
    './src/assets/environments/building/asian_themed_low_poly_night_city_buildings.glb',
    './src/assets/environments/building/downtown_buildings_set_-_low_poly_model.glb',
    './src/assets/environments/building/3_buildings_-_ww2_carentan_inspired.glb',
];

const SKYLINE_PATHS = [
    './src/assets/environments/skyline/new_york_buildings.glb',
    './src/assets/environments/skyline/hi_rise_apartment_building.glb',
    './src/assets/environments/skyline/amelinco_office_building.glb',
    './src/assets/environments/skyline/mid_rise_wall_to_wall_office_building.glb',
    './src/assets/environments/skyline/low_rise_wall_to_wall_office_building.glb',
    './src/assets/environments/skyline/low_rise_wall_to_wall_office_building (1).glb',
    './src/assets/environments/skyline/monaco_building_3.glb',
];

// Target sizes for normalisation
const BUILDING_TARGET = { width: 5, height: 20, depth: 5 };
const SKYLINE_TARGET  = { width: 18, height: 45, depth: 12 };

// ─── WebP → PNG canvas converter ─────────────────────────────────────────────
function convertWebpTexture(texture) {
    if (!texture?.image) return texture;

    const img = texture.image;
    const isWebp =
        (img.src && /\.webp(\?.*)?$/i.test(img.src)) ||
        (img instanceof ImageBitmap);

    if (!isWebp) return texture;

    try {
        const canvas  = document.createElement('canvas');
        canvas.width  = img.width  || img.naturalWidth  || 256;
        canvas.height = img.height || img.naturalHeight || 256;
        if (canvas.width === 0 || canvas.height === 0) return texture;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const converted = new THREE.CanvasTexture(canvas);
        converted.flipY        = texture.flipY;
        converted.encoding     = texture.encoding;
        converted.wrapS        = texture.wrapS;
        converted.wrapT        = texture.wrapT;
        converted.minFilter    = texture.minFilter;
        converted.magFilter    = texture.magFilter;
        converted.needsUpdate  = true;
        return converted;
    } catch {
        return texture;
    }
}

function sanitiseMaterials(object) {
    object.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
            const props = ['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap','alphaMap'];
            props.forEach((p) => {
                if (m[p]) m[p] = convertWebpTexture(m[p]);
            });
            // Fallback: if a texture is entirely missing, ensure material won't error
            if (!m.map && !m.color) m.color = new THREE.Color(0x2a3a55);
            m.needsUpdate = true;
        });
        child.castShadow    = true;
        child.receiveShadow = true;
    });
}

// ─── Pack detector & extractor ────────────────────────────────────────────────
function hasMesh(obj) {
    let found = false;
    obj.traverse((c) => { if (c.isMesh || c.isSkinnedMesh) found = true; });
    return found;
}

function extractMeshPool(gltfScene) {
    // Detect if it's a pack (>1 renderable top-level children)
    const topLevel = gltfScene.children.filter((c) => hasMesh(c));
    if (topLevel.length > 1) {
        // PACK: treat each top-level child as a separate asset
        return topLevel.map((child) => {
            const wrapper = new THREE.Group();
            wrapper.add(child.clone(true));
            return wrapper;
        });
    }
    // SINGLE: return the whole scene as one asset
    const wrapper = new THREE.Group();
    wrapper.add(gltfScene.clone(true));
    return [wrapper];
}

// ─── Normalise to target size (bottom at y=0) ─────────────────────────────────
function normaliseAsset(obj, target) {
    obj.updateMatrixWorld(true);
    const box  = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);
    if (size.lengthSq() < 0.0001) return obj;

    const scale = Math.min(
        target.width  / Math.max(size.x, 0.001),
        target.height / Math.max(size.y, 0.001),
        target.depth  / Math.max(size.z, 0.001),
    );
    obj.scale.multiplyScalar(scale);
    obj.updateMatrixWorld(true);

    const nb  = new THREE.Box3().setFromObject(obj);
    const nc  = new THREE.Vector3();
    nb.getCenter(nc);
    obj.position.x -= nc.x;
    obj.position.z -= nc.z;
    obj.position.y -= nb.min.y; // sit on y=0
    obj.updateMatrixWorld(true);
    return obj;
}

// ─── Apply cyberpunk neon tint ────────────────────────────────────────────────
function enhanceCityMaterials(obj) {
    obj.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
            m.roughness = Math.min(0.86, Math.max(0.38, m.roughness ?? 0.68));
            m.metalness = Math.min(0.55, Math.max(0.05, m.metalness ?? 0.18));
            if ('emissive' in m) {
                const materialName = `${m.name || ''} ${child.name || ''}`.toLowerCase();
                const isWindow = /window|glass|light|lamp|neon|sign|emissive/.test(materialName);
                if (isWindow) {
                    const sourceColor = m.color?.getHex?.() || 0xffd580;
                    m.emissive.setHex(sourceColor);
                    m.emissiveIntensity = Math.max(m.emissiveIntensity || 0, 0.55);
                } else {
                    m.emissiveIntensity = Math.min(m.emissiveIntensity || 0, 0.08);
                }
            }
            m.needsUpdate = true;
        });
    });
}

// ─── Main loader class ────────────────────────────────────────────────────────
export class EnvironmentAssetLoader {
    constructor() {
        const draco = new DRACOLoader();
        draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/');
        draco.preload();

        this.loader = new GLTFLoader();
        this.loader.setDRACOLoader(draco);

        /** @type {THREE.Object3D[]} Normalised building pool */
        this.buildingPool = [];
        /** @type {THREE.Object3D[]} Normalised skyline pool */
        this.skylinePool  = [];

        this._loaded = false;
    }

    async loadAll() {
        const [buildings, skylines] = await Promise.all([
            this._loadGroup(BUILDING_PATHS, BUILDING_TARGET, 'building'),
            this._loadGroup(SKYLINE_PATHS,  SKYLINE_TARGET,  'skyline'),
        ]);
        this.buildingPool = buildings;
        this.skylinePool  = skylines;
        this._loaded = true;

        console.log(
            `[EnvironmentAssetLoader] ready — buildings: ${buildings.length}  skyline: ${skylines.length}`,
        );
    }

    async _loadGroup(paths, target, label) {
        const pool = [];

        await Promise.allSettled(
            paths.map((p) => this._loadGLTF(p).then((gltf) => {
                if (!gltf?.scene || !hasMesh(gltf.scene)) {
                    console.warn(`[EnvironmentAssetLoader] ${label} no mesh: ${p}`);
                    return;
                }
                sanitiseMaterials(gltf.scene);
                const meshes = extractMeshPool(gltf.scene);
                meshes.forEach((m, i) => {
                    sanitiseMaterials(m);
                    normaliseAsset(m, target);
                    enhanceCityMaterials(m);
                    pool.push(m);
                });
                console.log(`[EnvironmentAssetLoader] ${label} OK: ${p} → ${meshes.length} mesh(es)`);
            }).catch((err) => {
                console.warn(`[EnvironmentAssetLoader] ${label} failed: ${p}`, err?.message ?? err);
            })),
        );
        return pool;
    }

    _loadGLTF(path) {
        return new Promise((resolve, reject) => {
            this.loader.load(path, resolve, undefined, reject);
        });
    }

    /**
     * Clone a random building from the pool.
     * Returns null if pool empty (fallback geometry used by EnvironmentManager).
     */
    cloneRandomBuilding() {
        if (!this.buildingPool.length) return null;
        const src = this.buildingPool[Math.floor(Math.random() * this.buildingPool.length)];
        return src.clone(true);
    }

    /**
     * Clone a random skyline piece.
     */
    cloneRandomSkyline() {
        if (!this.skylinePool.length) return null;
        const src = this.skylinePool[Math.floor(Math.random() * this.skylinePool.length)];
        return src.clone(true);
    }

    get isLoaded() { return this._loaded; }
}
