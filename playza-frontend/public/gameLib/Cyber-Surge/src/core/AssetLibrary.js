import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/utils/SkeletonUtils.js';

const RUNNER_PATHS = [
    './src/assets/runners/female-runner.glb',
    './src/assets/runners/male-runner.glb'
];

const ROAD_PATH = './src/assets/roads/roads-collection.glb';

const OBSTACLE_PATHS = {
    blocker: [
        './src/assets/obstacles/road-bloackage/blockade.glb',
        './src/assets/obstacles/road-bloackage/blockage.glb',
        './src/assets/obstacles/road-bloackage/roadblock.glb',
        './src/assets/obstacles/road-bloackage/road_block.glb',
        './src/assets/obstacles/road-bloackage/redblockade.glb',
        './src/assets/obstacles/road-bloackage/obstacles.glb'
    ],
    slideGate: [
        './src/assets/obstacles/road-bloackage/road-closed.glb',
        './src/assets/obstacles/road-bloackage/brickblock.glb',
        './src/assets/obstacles/road-bloackage/obstacles.glb'
    ],
    drone: [
        './src/assets/obstacles/car/car-pack-1.glb',
        './src/assets/obstacles/car/car-pack.glb',
        './src/assets/obstacles/car/car-Pack-2.glb',
        './src/assets/obstacles/car/car-wreck.glb',
        './src/assets/obstacles/car/abandoneCar.glb',
        './src/assets/obstacles/car/wreck-car-pack.glb'
    ]
};

export class AssetLibrary {
    constructor(engine) {
        this.engine = engine;
        this.loader = new GLTFLoader();
        this.assets = {
            runner: null,
            roads: new Map(),
            obstacles: new Map()
        };
    }

    async loadAll() {
        const [runner, roadResult, obstacleResult] = await Promise.allSettled([
            this.loadRunner(),
            this.loadRoads(),
            this.loadObstacles()
        ]);

        if (runner.status === 'fulfilled') {
            this.assets.runner = runner.value;
        }
        if (roadResult.status === 'fulfilled') {
            this.assets.roads = roadResult.value;
        }
        if (obstacleResult.status === 'fulfilled') {
            this.assets.obstacles = obstacleResult.value;
        }
    }

    async loadRunner() {
        for (const path of RUNNER_PATHS) {
            try {
                const gltf = await this.loadGLTF(path);
                const renderable = this.extractPrimaryRenderable(gltf.scene);
                if (renderable) {
                    gltf.scene = renderable;
                }
                return gltf;
            } catch (error) {
                console.warn(`Cyber-Surge runner asset failed: ${path}`, error);
            }
        }
        return null;
    }

    async loadRoads() {
        const result = new Map();
        try {
            const gltf = await this.loadGLTF(ROAD_PATH);
            const variants = this.extractRenderableVariants(gltf.scene);

            const keywordGroups = {
                straight: ['straight', 'road', 'segment'],
                curveLeft: ['curveleft', 'curve_left', 'left'],
                curveRight: ['curveright', 'curve_right', 'right'],
                bridge: ['bridge'],
                damaged: ['damage', 'damaged', 'broken']
            };

            Object.entries(keywordGroups).forEach(([type, keywords]) => {
                const matched = variants.find((variant) =>
                    keywords.some((keyword) => variant.name.includes(keyword))
                );
                if (matched) {
                    result.set(type, matched.object);
                }
            });

            if (!result.size && gltf.scene) {
                result.set('straight', gltf.scene);
            }

            if (!result.has('bridge') && result.has('straight')) result.set('bridge', result.get('straight'));
            if (!result.has('damaged') && result.has('straight')) result.set('damaged', result.get('straight'));
            if (!result.has('curveLeft') && result.has('straight')) result.set('curveLeft', result.get('straight'));
            if (!result.has('curveRight') && result.has('straight')) result.set('curveRight', result.get('straight'));
        } catch (error) {
            console.warn('Cyber-Surge road assets failed to load.', error);
        }

        return result;
    }

    async loadObstacles() {
        const result = new Map();

        for (const [type, paths] of Object.entries(OBSTACLE_PATHS)) {
            const variants = [];

            for (const path of paths) {
                try {
                    const gltf = await this.loadGLTF(path);
                    const extracted = this.extractRenderableVariants(gltf.scene, { includeSceneFallback: true });
                    extracted.forEach((entry) => {
                        if (entry.object) {
                            variants.push(entry.object);
                        }
                    });
                } catch (error) {
                    console.warn(`Cyber-Surge obstacle asset failed: ${path}`, error);
                }
            }

            if (variants.length) {
                result.set(type, variants);
            }
        }

        return result;
    }

    createRunner() {
        if (!this.assets.runner?.scene) {
            return null;
        }

        const model = cloneSkinned(this.assets.runner.scene);
        this.prepareClone(model);

        const clips = this.assets.runner.animations || [];
        const mixer = clips.length ? new THREE.AnimationMixer(model) : null;
        const actions = {};
        const clipNames = {
            idle: ['idle', 'stand', 'standing'],
            run: ['run', 'running'],
            jump: ['jump'],
            slide: ['slide', 'sliding']
        };

        Object.entries(clipNames).forEach(([key, names]) => {
            const clip = clips.find((entry) => names.some((name) => entry.name.toLowerCase().includes(name)));
            if (clip && mixer) {
                actions[key] = mixer.clipAction(clip);
                actions[key].enabled = true;
                actions[key].clampWhenFinished = key === 'jump' || key === 'slide';
            }
        });

        const normalized = this.normalizeToSize(model, {
            width: 1.1,
            height: 2.2,
            depth: 1.1
        }, { alignY: 0, centerX: true, centerZ: true });
        normalized.rotation.y = Math.PI;
        normalized.visible = true;

        return { model: normalized, mixer, actions };
    }

    createRoadVariant(type = 'straight') {
        const source = this.assets.roads.get(type) || this.assets.roads.get('straight');
        if (!source) {
            return null;
        }

        const clone = cloneSkinned(source);
        this.prepareClone(clone);
        return this.normalizeToSize(clone, {
            width: 10,
            height: 2.2,
            depth: 10
        }, { alignY: -1.1, centerX: true, centerZ: true });
    }

    createObstacle(type, config) {
        const sourceList = this.assets.obstacles.get(type) || this.assets.obstacles.get('blocker');
        if (!sourceList?.length) {
            return null;
        }

        const source = sourceList[Math.floor(Math.random() * sourceList.length)];
        const clone = cloneSkinned(source);
        this.prepareClone(clone);
        return this.normalizeToSize(clone, {
            width: config.width,
            height: Math.max(config.height, 1.2),
            depth: config.depth
        }, { alignY: 0, centerX: true, centerZ: true });
    }

    extractPrimaryRenderable(scene) {
        const variants = this.extractRenderableVariants(scene, { includeSceneFallback: true });
        return variants[0]?.object || scene;
    }

    extractRenderableVariants(scene, options = {}) {
        const variants = [];
        const seen = new Set();

        scene.traverse((child) => {
            if (!child.isObject3D || child === scene) {
                return;
            }

            const hasRenderableChild =
                child.isMesh ||
                child.isSkinnedMesh ||
                child.children.some((entry) => entry.isMesh || entry.isSkinnedMesh);

            if (!hasRenderableChild) {
                return;
            }

            const name = (child.name || '').toLowerCase();
            const key = `${name}:${child.uuid}`;
            if (seen.has(key)) {
                return;
            }
            seen.add(key);

            variants.push({
                name,
                object: child
            });
        });

        if (!variants.length && options.includeSceneFallback && scene) {
            variants.push({
                name: (scene.name || 'scene').toLowerCase(),
                object: scene
            });
        }

        return variants;
    }

    prepareClone(object) {
        object.visible = true;
        object.traverse((child) => {
            child.visible = true;
            if (!child.isMesh && !child.isSkinnedMesh) {
                return;
            }
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((material) => {
                    if ('metalness' in material && material.metalness === undefined) material.metalness = 0.3;
                    if ('roughness' in material && material.roughness === undefined) material.roughness = 0.7;
                });
            }
        });
    }

    normalizeToSize(object, target, options = {}) {
        const wrapper = new THREE.Group();
        wrapper.visible = true;
        wrapper.add(object);
        object.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(object);
        const size = new THREE.Vector3();
        box.getSize(size);

        const scale = Math.min(
            target.width / Math.max(size.x, 0.001),
            target.height / Math.max(size.y, 0.001),
            target.depth / Math.max(size.z, 0.001)
        );
        object.scale.multiplyScalar(scale);
        object.updateMatrixWorld(true);

        const scaledBox = new THREE.Box3().setFromObject(object);
        const scaledCenter = new THREE.Vector3();
        scaledBox.getCenter(scaledCenter);

        object.position.x += options.centerX ? -scaledCenter.x : 0;
        object.position.z += options.centerZ ? -scaledCenter.z : 0;

        if (options.alignY !== undefined) {
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
