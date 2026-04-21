// ==================== COLOR THEMES ====================
const THEMES = {
    classic: {
        U: 0xFFFFFF,
        D: 0xFFD500,
        F: 0x009B48,
        B: 0x0046AD,
        R: 0xB71230,
        L: 0xFF5800,
        core: 0x111111
    },
    neon: {
        U: 0x00FFFF,
        D: 0xFF00FF,
        F: 0x00FF41,
        B: 0x7B68EE,
        R: 0xFF073A,
        L: 0xFF6B00,
        core: 0x050510
    },
    pastel: {
        U: 0xF0F0F0,
        D: 0xFFD6E0,
        F: 0xB8E6C8,
        B: 0xB0D4F1,
        R: 0xF4A0A0,
        L: 0xFFD59E,
        core: 0x2d2d2d
    }
};

const FACES = {
    R: { axis: 'x', value:  1, angle: -Math.PI / 2 },
    L: { axis: 'x', value: -1, angle:  Math.PI / 2 },
    U: { axis: 'y', value:  1, angle: -Math.PI / 2 },
    D: { axis: 'y', value: -1, angle:  Math.PI / 2 },
    F: { axis: 'z', value:  1, angle: -Math.PI / 2 },
    B: { axis: 'z', value: -1, angle:  Math.PI / 2 },
    M: { axis: 'x', value:  0, angle:  Math.PI / 2 },
    E: { axis: 'y', value:  0, angle:  Math.PI / 2 },
    S: { axis: 'z', value:  0, angle: -Math.PI / 2 }
};

function roundedRectShape(w, h, r) {
    const shape = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    return shape;
}

class RubiksCube {
    constructor(scene, size = 3) {
        this.scene = scene;
        this.size = size;
        this.cubies = [];
        this.isAnimating = false;
        this._isInMiddleOfMove = false;
        this.moveHistory = [];
        this.solvedMoves = [];
        this.theme = 'classic';
        this.animationSpeed = 300;
        this.gap = 0.02;
        this.stickerSize = 0.82;

        this.pivot = new THREE.Object3D();
        this.scene.add(this.pivot);

        this._buildCube();
    }

    _makeCoreMesh() {
        const s = 1 - this.gap;
        const geo = new THREE.BoxGeometry(s, s, s, 2, 2, 2);
        const mat = new THREE.MeshStandardMaterial({
            color: THEMES[this.theme].core,
            metalness: 0.15,
            roughness: 0.8
        });
        return new THREE.Mesh(geo, mat);
    }

    _makeSticker(color, size) {
        const shape = roundedRectShape(size, size, size * 0.06);
        const geo = new THREE.ShapeGeometry(shape, 4);
        const mat = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.05,
            roughness: 0.35,
            emissive: color,
            emissiveIntensity: 0.03,
            side: THREE.DoubleSide
        });
        return new THREE.Mesh(geo, mat);
    }

    _addSticker(group, color, position, rotY, rotX, faceName) {
        const sticker = this._makeSticker(color, this.stickerSize);
        sticker.position.copy(position);
        sticker.userData.stickerFace = faceName;
        if (rotY) sticker.rotation.y = rotY;
        if (rotX) sticker.rotation.x = rotX;
        group.add(sticker);

        const gloss = this._makeSticker(color, this.stickerSize);
        gloss.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.5,
            roughness: 0.1,
            transparent: true,
            opacity: 0.05,
            side: THREE.DoubleSide
        });
        const offset = position.clone();
        const normal = position.clone().normalize();
        offset.add(normal.multiplyScalar(0.002));
        gloss.position.copy(offset);
        gloss.userData.stickerFace = faceName;
        if (rotY) gloss.rotation.y = rotY;
        if (rotX) gloss.rotation.x = rotX;
        group.add(gloss);
    }

    _buildCube() {
        const colors = THEMES[this.theme];
        const h = (this.size - 1) / 2;
        const halfSize = (1 - this.gap) / 2;
        const stickerOffset = halfSize + 0.008;

        for (let xi = 0; xi < this.size; xi++) {
            for (let yi = 0; yi < this.size; yi++) {
                for (let zi = 0; zi < this.size; zi++) {
                    const group = new THREE.Group();
                    const basePos = new THREE.Vector3(xi - h, yi - h, zi - h);
                    group.userData.basePos = basePos.clone();
                    group.add(this._makeCoreMesh());

                    if (xi === this.size - 1) {
                        this._addSticker(group, colors.R,
                            new THREE.Vector3(stickerOffset, 0, 0), Math.PI / 2, 0, 'R');
                    }
                    if (xi === 0) {
                        this._addSticker(group, colors.L,
                            new THREE.Vector3(-stickerOffset, 0, 0), -Math.PI / 2, 0, 'L');
                    }
                    if (yi === this.size - 1) {
                        this._addSticker(group, colors.U,
                            new THREE.Vector3(0, stickerOffset, 0), 0, -Math.PI / 2, 'U');
                    }
                    if (yi === 0) {
                        this._addSticker(group, colors.D,
                            new THREE.Vector3(0, -stickerOffset, 0), 0, Math.PI / 2, 'D');
                    }
                    if (zi === this.size - 1) {
                        this._addSticker(group, colors.F,
                            new THREE.Vector3(0, 0, stickerOffset), 0, 0, 'F');
                    }
                    if (zi === 0) {
                        this._addSticker(group, colors.B,
                            new THREE.Vector3(0, 0, -stickerOffset), 0, Math.PI, 'B');
                    }

                    group.position.copy(basePos);
                    this.scene.add(group);
                    this.cubies.push(group);
                }
            }
        }
    }

    rotateFace(face, ccw = false, duration = null) {
        if (this.isAnimating) return Promise.resolve();
        this.isAnimating = true;
        this._isInMiddleOfMove = true;

        const def = FACES[face];
        let angle = def.angle;
        if (ccw) angle = -angle;
        const dur = duration || this.animationSpeed;

        return new Promise((resolve) => {
            const affected = this._getAffected(def.axis, def.value);
            this._attachToPivot(affected);

            const start = Date.now();
            const tick = () => {
                const p = Math.min((Date.now() - start) / dur, 1);
                const e = 1 - Math.pow(1 - p, 3);
                this.pivot.rotation[def.axis] = angle * e;
                if (p < 1) {
                    requestAnimationFrame(tick);
                } else {
                    this._finishRotation(affected, def.axis, resolve);
                }
            };
            requestAnimationFrame(tick);
        });
    }

    _getAffected(axis, value) {
        const tol = 0.1;
        return this.cubies.filter(c => {
            const pos = new THREE.Vector3();
            c.getWorldPosition(pos);
            return Math.abs(pos[axis] - value) < tol;
        });
    }

    _attachToPivot(arr) { for (const c of arr) this.pivot.attach(c); }
    _detachFromPivot(arr) { for (const c of arr) this.scene.attach(c); }

    _finishRotation(arr, axis, resolve) {
        this._detachFromPivot(arr);
        this.pivot.rotation[axis] = 0;
        // Snap positions and rotations to quarter turns to avoid floating point drift.
        for (const c of arr) {
            c.position.x = Math.round(c.position.x * 2) / 2;
            c.position.y = Math.round(c.position.y * 2) / 2;
            c.position.z = Math.round(c.position.z * 2) / 2;
            c.rotation.x = Math.round(c.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
            c.rotation.y = Math.round(c.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
            c.rotation.z = Math.round(c.rotation.z / (Math.PI / 2)) * (Math.PI / 2);
            c.updateMatrixWorld(true);
        }
        this.isAnimating = false;
        this._isInMiddleOfMove = false;
        resolve();
    }

    async scramble(moves = 22) {
        const names = Object.keys(FACES);
        let last = '';
        for (let i = 0; i < moves; i++) {
            let f;
            do { f = names[Math.floor(Math.random() * names.length)]; } while (f === last);
            last = f;
            const ccw = Math.random() > 0.5;
            await this.rotateFace(f, ccw, Math.max(35, this.animationSpeed * 0.25));
            const n = f + (ccw ? "'" : "");
            this.moveHistory.push(n);
            this.solvedMoves.push({ face: f, isCCW: ccw });
        }
        return this.moveHistory.slice();
    }

    async autoSolve() {
        if (this.solvedMoves.length === 0 || this.isAnimating) return [];
        const rev = [...this.solvedMoves].reverse();
        const dur = Math.max(50, this.animationSpeed * 0.4);
        const hist = [];
        for (const m of rev) {
            await this.rotateFace(m.face, !m.isCCW, dur);
            hist.push(m.face + (!m.isCCW ? "'" : ""));
        }
        return hist;
    }

    reset() {
        for (const c of this.cubies) this.scene.remove(c);
        this.cubies = [];
        this.moveHistory = [];
        this.solvedMoves = [];
        this.isAnimating = false;
        this.pivot.rotation.set(0, 0, 0);
        this._buildCube();
    }

    destroy() {
        for (const c of this.cubies) this.scene.remove(c);
        this.cubies = [];
        this.scene.remove(this.pivot);
        this.pivot = new THREE.Object3D();
        this.scene.add(this.pivot);
    }

    isSolved() {
        if (this.solvedMoves.length === 0) return false;
        const tol = 0.1;
        for (const c of this.cubies) {
            const bp = c.userData.basePos;
            if (!bp) return false;
            // Position must match original home position
            const p = c.position;
            if (Math.abs(p.x - bp.x) > tol ||
                Math.abs(p.y - bp.y) > tol ||
                Math.abs(p.z - bp.z) > tol) return false;
            // Rotation must be identity
            const e = new THREE.Euler().setFromQuaternion(c.quaternion, 'YXZ');
            if (Math.abs(e.x) > tol || Math.abs(e.y) > tol || Math.abs(e.z) > tol) return false;
        }
        return true;
    }
}
