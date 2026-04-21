import * as THREE from 'three';

export class EnvironmentManager {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.currentBiome = 'road';
        this.floorMeshes = [];
        this.ambientTraffic = [];
        this.billboards = [];
        this.glowPanels = [];

        this.biomes = {
            railway: { road: 0x18253e, glow: 0x38bdf8, fog: 0x09111f, accent: 0x60a5fa, label: 'Rail Sector' },
            road: { road: 0x131c31, glow: 0x22d3ee, fog: 0x07111f, accent: 0x22d3ee, label: 'Core Grid' },
            bridge: { road: 0x23151f, glow: 0xf97316, fog: 0x1a0d17, accent: 0xfb7185, label: 'Sky Bridge' },
            air: { road: 0x0d1a2b, glow: 0xa78bfa, fog: 0x0b1220, accent: 0xc084fc, label: 'Cloud Route' },
            snow: { road: 0x142235, glow: 0xe0f2fe, fog: 0x0e1728, accent: 0xe0f2fe, label: 'Frost Ring' }
        };
        this.roadVariantByBiome = {
            road: ['straight', 'damaged', 'straight', 'curveLeft', 'curveRight'],
            railway: ['straight', 'curveLeft', 'straight', 'curveRight'],
            bridge: ['bridge', 'straight', 'bridge'],
            snow: ['straight', 'damaged', 'straight'],
            air: ['bridge', 'curveLeft', 'curveRight']
        };

        this.createFloor();
        this.createAmbientTraffic();
        this.createBillboards();
        this.setBiome(this.currentBiome);
    }

    createFloor() {
        for (let i = 0; i < 42; i += 1) {
            const segment = this.createFloorSegment(-i * 10);
            this.scene.add(segment);
            this.floorMeshes.push(segment);
        }
    }

    createFloorSegment(z) {
        const assetSegment = this.createAssetRoadSegment(z);
        if (assetSegment) {
            return assetSegment;
        }

        return this.createFallbackFloorSegment(z);
    }

    createAssetRoadSegment(z) {
        const roadType = this.pickRoadVariant(this.currentBiome);
        const roadAsset = this.engine.assets?.createRoadVariant?.(roadType);
        if (!roadAsset) {
            return null;
        }

        const group = new THREE.Group();
        const roadWrapper = new THREE.Group();
        roadWrapper.add(roadAsset);
        group.add(roadWrapper);

        const roadLightMaterial = new THREE.MeshStandardMaterial({
            color: 0x1f2937,
            roughness: 0.18,
            metalness: 0.82,
            emissive: 0x0ea5e9,
            emissiveIntensity: 0.55
        });

        const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 10), roadLightMaterial);
        leftRail.position.set(-4.05, 0.18, 0);
        const rightRail = leftRail.clone();
        rightRail.position.x = 4.05;
        group.add(leftRail);
        group.add(rightRail);

        [-1.5, 1.5].forEach((x) => {
            const line = new THREE.Mesh(
                new THREE.PlaneGeometry(0.1, 10),
                new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
            );
            line.rotation.x = -Math.PI / 2;
            line.position.set(x, 0.04, 0);
            group.add(line);
        });

        group.position.z = z;
        group.userData.z = z;
        group.userData.road = roadWrapper;
        group.userData.leftRail = leftRail;
        group.userData.rightRail = rightRail;
        group.userData.roadType = roadType;
        return group;
    }

    createFallbackFloorSegment(z) {
        const group = new THREE.Group();

        const base = new THREE.Mesh(
            new THREE.BoxGeometry(10, 1.6, 10),
            new THREE.MeshStandardMaterial({ color: 0x060b14, roughness: 0.95, metalness: 0.18 })
        );
        base.position.set(0, -0.8, 0);
        base.receiveShadow = true;
        group.add(base);

        const road = new THREE.Mesh(
            new THREE.PlaneGeometry(9.2, 10),
            new THREE.MeshStandardMaterial({ color: 0x131c31, roughness: 0.75, metalness: 0.3 })
        );
        road.rotation.x = -Math.PI / 2;
        road.position.y = 0.03;
        road.receiveShadow = true;
        group.add(road);

        const edgeMaterial = new THREE.MeshStandardMaterial({
            color: 0x1f2937,
            roughness: 0.34,
            metalness: 0.82,
            emissive: 0x0ea5e9,
            emissiveIntensity: 0.65
        });

        const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 10), edgeMaterial);
        leftRail.position.set(-4.1, 0.2, 0);
        group.add(leftRail);

        const rightRail = leftRail.clone();
        rightRail.position.x = 4.1;
        group.add(rightRail);

        const laneLineMaterial = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
        [-1.5, 1.5].forEach((x) => {
            const line = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 10), laneLineMaterial);
            line.rotation.x = -Math.PI / 2;
            line.position.set(x, 0.04, 0);
            group.add(line);
        });

        const panelMaterial = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.24,
            metalness: 0.85,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.4
        });

        for (let i = -4; i <= 4; i += 2) {
            const panel = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.6), panelMaterial);
            panel.position.set(i * 0.45, 0.06, (Math.random() - 0.5) * 7);
            group.add(panel);
            this.glowPanels.push(panel);
        }

        const towerMaterial = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.45,
            metalness: 0.65,
            emissive: 0x1d4ed8,
            emissiveIntensity: 0.22
        });

        if (Math.random() > 0.18) {
            const leftTower = new THREE.Mesh(new THREE.BoxGeometry(2.4, 8 + Math.random() * 8, 2.4), towerMaterial);
            leftTower.name = 'leftTower';
            leftTower.position.set(-8.5, leftTower.geometry.parameters.height / 2 - 0.6, 0);
            leftTower.castShadow = true;
            leftTower.receiveShadow = true;
            group.add(leftTower);
        }

        if (Math.random() > 0.18) {
            const rightTower = new THREE.Mesh(new THREE.BoxGeometry(2.4, 8 + Math.random() * 8, 2.4), towerMaterial);
            rightTower.name = 'rightTower';
            rightTower.position.set(8.5, rightTower.geometry.parameters.height / 2 - 0.6, 0);
            rightTower.castShadow = true;
            rightTower.receiveShadow = true;
            group.add(rightTower);
        }

        group.position.z = z;
        group.userData.z = z;
        group.userData.road = road;
        group.userData.leftRail = leftRail;
        group.userData.rightRail = rightRail;
        return group;
    }

    createAmbientTraffic() {
        for (let i = 0; i < 16; i += 1) {
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.1, 0.34, 2.2),
                new THREE.MeshStandardMaterial({
                    color: 0x111827,
                    roughness: 0.24,
                    metalness: 0.86,
                    emissive: i % 2 === 0 ? 0x22d3ee : 0xf97316,
                    emissiveIntensity: 0.55
                })
            );

            body.position.set((i % 2 === 0 ? -11.5 : 11.5), 1 + Math.random() * 3, -20 - i * 24);
            body.rotation.y = i % 2 === 0 ? Math.PI : 0;
            body.userData.side = i % 2 === 0 ? -1 : 1;
            body.userData.speed = 12 + Math.random() * 12;
            this.scene.add(body);
            this.ambientTraffic.push(body);
        }
    }

    createBillboards() {
        for (let i = 0; i < 10; i += 1) {
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 6, 8),
                new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.45, metalness: 0.75 })
            );

            const screen = new THREE.Mesh(
                new THREE.BoxGeometry(2.8, 1.6, 0.14),
                new THREE.MeshStandardMaterial({
                    color: 0x0f172a,
                    roughness: 0.2,
                    metalness: 0.78,
                    emissive: i % 2 === 0 ? 0x22d3ee : 0xf97316,
                    emissiveIntensity: 0.55
                })
            );

            const group = new THREE.Group();
            pole.position.y = 3;
            screen.position.set(0, 5, 0);
            group.add(pole);
            group.add(screen);
            group.position.set(i % 2 === 0 ? -10.5 : 10.5, 0, -30 - i * 38);
            group.userData.screen = screen;
            this.scene.add(group);
            this.billboards.push(group);
        }
    }

    update() {
        const playerZ = this.engine.player.player.position.z;
        const totalLength = this.floorMeshes.length * 10;

        this.floorMeshes.forEach((segment) => {
            const relativeZ = segment.userData.z - playerZ;
            if (relativeZ > 15) {
                const newZ = segment.userData.z - totalLength;
                segment.position.z = newZ;
                segment.userData.z = newZ;

                segment.children.forEach((child) => {
                    if (child.name === 'leftTower' || child.name === 'rightTower') {
                        child.scale.y = 0.75 + Math.random() * 1.5;
                    }
                });
            }
        });

        this.ambientTraffic.forEach((car, index) => {
            car.position.z += car.userData.speed * this.engine.deltaTime * car.userData.side * 0.35;
            car.position.y = 1 + Math.sin(this.engine.elapsedTime * 2 + index) * 0.08 + (index % 3) * 0.4;

            if (car.position.z > playerZ + 30) {
                car.position.z = playerZ - 300 - Math.random() * 120;
            }
            if (car.position.z < playerZ - 340) {
                car.position.z = playerZ + 20 + Math.random() * 80;
            }
        });

        this.billboards.forEach((board, index) => {
            board.userData.screen.material.emissiveIntensity = 0.45 + Math.sin(this.engine.elapsedTime * 2.5 + index) * 0.12;
            if (board.position.z > playerZ + 25) {
                board.position.z = playerZ - 340 - Math.random() * 60;
            }
        });
    }

    setBiome(biome) {
        if (!this.biomes[biome]) {
            return;
        }

        this.currentBiome = biome;
        const colors = this.biomes[biome];
        this.scene.background = new THREE.Color(colors.fog);
        this.scene.fog.color = new THREE.Color(colors.fog);

        this.floorMeshes.forEach((segment) => {
            if (segment.userData.road?.material?.color) {
                segment.userData.road.material.color.setHex(colors.road);
            }
            segment.traverse((child) => {
                if (!child.isMesh || !child.material) {
                    return;
                }
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((material) => {
                    if ('emissive' in material && material.emissive) {
                        material.emissive.lerp(new THREE.Color(colors.glow), 0.18);
                    }
                });
            });
            segment.userData.leftRail.material.emissive.setHex(colors.glow);
            segment.userData.rightRail.material.emissive.setHex(colors.glow);
        });

        this.glowPanels.forEach((panel) => {
            panel.material.emissive.setHex(colors.glow);
        });

        this.billboards.forEach((board) => {
            board.userData.screen.material.emissive.setHex(colors.accent);
        });
    }

    getCurrentDistrictLabel() {
        return this.biomes[this.currentBiome]?.label || 'Core Grid';
    }

    reset() {
        this.floorMeshes.forEach((segment, index) => {
            const z = -index * 10;
            segment.position.z = z;
            segment.userData.z = z;
        });

        this.ambientTraffic.forEach((car, index) => {
            car.position.z = -20 - index * 24;
        });

        this.billboards.forEach((board, index) => {
            board.position.z = -30 - index * 38;
        });

        this.setBiome('road');
    }

    pickRoadVariant(biome) {
        const variants = this.roadVariantByBiome[biome] || this.roadVariantByBiome.road;
        return variants[Math.floor(Math.random() * variants.length)];
    }
}
