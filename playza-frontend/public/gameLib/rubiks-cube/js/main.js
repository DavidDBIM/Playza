// ==================== MAIN ====================
(function () {
    const canvas = document.getElementById('game-canvas');
    const particlesCanvas = document.getElementById('particles-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.035);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    const initDist = 11;
    camera.position.copy(new THREE.Vector3(1, 0.6, 0.8).normalize().multiplyScalar(initDist));
    camera.lookAt(0, 0, 0);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 20;

    function isMobile() {
        return window.innerWidth <= 768 || 'ontouchstart' in window;
    }

    function updateControlsForDevice() {
        const mobile = isMobile();
        controls.mouseButtons = mobile ? {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
        } : {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: null
        };
        controls.touches = mobile ? {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_ROTATE
        } : {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_ROTATE
        };
    }
    updateControlsForDevice();

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dl1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dl1.position.set(5, 8, 5); scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(0x6366f1, 0.2);
    dl2.position.set(-5, -3, -5); scene.add(dl2);
    const pl1 = new THREE.PointLight(0x8b5cf6, 0.5, 20); scene.add(pl1);
    const pl2 = new THREE.PointLight(0x6366f1, 0.3, 20); scene.add(pl2);
    const fill = new THREE.PointLight(0x2255aa, 0.2, 15);
    fill.position.set(0, -5, 0); scene.add(fill);

    const envGeo = new THREE.SphereGeometry(30, 32, 32);
    const envMat = new THREE.MeshBasicMaterial({ color: 0x111122, side: THREE.BackSide });
    scene.add(new THREE.Mesh(envGeo, envMat));

    const grid = new THREE.GridHelper(25, 25, 0x222244, 0x1a1a33);
    grid.position.y = -2.5;
    grid.material.opacity = 0.2; grid.material.transparent = true;
    scene.add(grid);

    const particleSystem = new ParticleSystem(particlesCanvas);
    particleSystem.resize();

    let cubeSize = 3;
    let rubiksCube = new RubiksCube(scene, cubeSize);
    let gameStarted = false, gameStartTime = null, timerInterval = null;
    let moveCount = 0, bestTime = null, scrambled = false, loaded = false;

    function formatTime(ms) {
        if (!ms && ms !== 0) return '--:--.--';
        const totalCs = Math.floor(ms / 10);
        const cs = totalCs % 10;
        const s = Math.floor(totalCs / 10) % 60;
        const m = Math.floor(totalCs / 600);
        return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${cs}`;
    }

    function startTimer() {
        if (timerInterval) return;
        gameStarted = true; gameStartTime = performance.now();
        timerInterval = setInterval(() => {
            document.getElementById('timer').textContent =
                formatTime(performance.now() - gameStartTime);
        }, 50);
    }

    function stopTimer() {
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    }

    function resetTimer() {
        stopTimer(); gameStarted = false; gameStartTime = null; moveCount = 0;
        document.getElementById('timer').textContent = formatTime(0);
        document.getElementById('move-counter').textContent = '0';
    }

    function getElapsed() { return gameStarted ? performance.now() - gameStartTime : 0; }

    function addMove(notation) {
        moveCount++;
        document.getElementById('move-counter').textContent = moveCount;
        const el = document.getElementById('move-history');
        const entry = document.createElement('div');
        entry.className = 'move-entry';
        entry.innerHTML = `<span class="move-num">${moveCount}</span>${notation}`;
        el.appendChild(entry); el.scrollTop = el.scrollHeight;
    }

    function clearHistory() {
        document.getElementById('move-history').innerHTML = '';
        moveCount = 0;
        document.getElementById('move-counter').textContent = '0';
    }

    // ==================== SIMPLE DRAG SYSTEM ====================
    const raycaster = new THREE.Raycaster();
    let dragState = null;
    let isDragging = false;
    let isOrbitDragging = false;

    const helperPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: 0 })
    );
    scene.add(helperPlane);

    function getPointerPos(e) {
        const touch = e.touches ? (e.touches[0] || e.changedTouches[0]) : e;
        return { x: touch.clientX, y: touch.clientY };
    }

    function screenToNDC(x, y) {
        const rect = renderer.domElement.getBoundingClientRect();
        return new THREE.Vector2(
            ((x - rect.left) / rect.width) * 2 - 1,
            -((y - rect.top) / rect.height) * 2 + 1
        );
    }

    function getCubieMeshes() {
        const meshes = [];
        for (const c of rubiksCube.cubies) {
            c.traverse(ch => { if (ch.isMesh) { ch.userData.cubie = c; meshes.push(ch); } });
        }
        return meshes;
    }

    function getIntersect(position, object, multiple) {
        raycaster.setFromCamera(screenToNDC(position.x, position.y), camera);
        const intersect = multiple
            ? raycaster.intersectObjects(object)
            : raycaster.intersectObject(object);
        return (intersect.length > 0) ? intersect[0] : false;
    }

    function onPointerDown(e) {
        if (!loaded) return;
        if (e.button !== undefined && e.button > 1) return;

        const pos = getPointerPos(e);
        const cubeIntersect = getIntersect(pos, getCubieMeshes(), true);

        if (cubeIntersect !== false) {
            e.preventDefault();
            e.stopPropagation();

            const faceNormal = cubeIntersect.face.normal.clone().transformDirection(cubeIntersect.object.matrixWorld).round();
            
            let clickedFace = null;
            const absX = Math.abs(faceNormal.x);
            const absY = Math.abs(faceNormal.y);
            const absZ = Math.abs(faceNormal.z);
            
            if (absX > absY && absX > absZ) {
                clickedFace = faceNormal.x > 0 ? 'R' : 'L';
            } else if (absY > absX && absY > absZ) {
                clickedFace = faceNormal.y > 0 ? 'U' : 'D';
            } else {
                clickedFace = faceNormal.z > 0 ? 'F' : 'B';
            }

            const worldPos = new THREE.Vector3();
            cubeIntersect.object.userData.cubie.getWorldPosition(worldPos);

            helperPlane.position.copy(cubeIntersect.point);
            helperPlane.lookAt(helperPlane.position.clone().add(faceNormal));
            helperPlane.updateMatrixWorld();

            dragState = {
                cubie: cubeIntersect.object.userData.cubie,
                clickedFace: clickedFace,
                startPoint: cubeIntersect.point.clone(),
                startPos: pos,
                faceNormal: faceNormal.clone()
            };
            
            isDragging = true;
            isOrbitDragging = false;
            controls.enabled = false;
            controls.stop();
        }
    }

    function onPointerMove(e) {
        if (!dragState || !isDragging) return;
        e.preventDefault();
        e.stopPropagation();

        const pos = getPointerPos(e);
        const ndc = screenToNDC(pos.x, pos.y);
        raycaster.setFromCamera(ndc, camera);

        const planeHits = raycaster.intersectObject(helperPlane, false);
        if (planeHits.length === 0) return;

        const currentPoint = planeHits[0].point;
        const delta = currentPoint.clone().sub(dragState.startPoint);
        
        if (delta.length() < 0.3) return;

        const worldPos = new THREE.Vector3();
        dragState.cubie.getWorldPosition(worldPos);

        const absX = Math.abs(delta.x);
        const absY = Math.abs(delta.y);
        const absZ = Math.abs(delta.z);
        
        const face = dragState.clickedFace;
        
        let moveFace = null;
        let moveCCW = false;

        const getLayer = (val) => {
            const threshold = 0.4;
            if (val > threshold) return 1;
            if (val < -threshold) return -1;
            return 0;
        };
        
        if (face === 'F' || face === 'B') {
            const frontFace = (face === 'F');
            if (absX > absY) {
                const layerY = getLayer(worldPos.y);
                if (layerY === 1) { moveFace = 'U'; moveCCW = frontFace ? (delta.x < 0) : (delta.x > 0); }
                else if (layerY === -1) { moveFace = 'D'; moveCCW = frontFace ? (delta.x > 0) : (delta.x < 0); }
                else { moveFace = 'E'; moveCCW = frontFace ? (delta.x < 0) : (delta.x > 0); }
            } else {
                const layerX = getLayer(worldPos.x);
                if (layerX === 1) { moveFace = 'R'; moveCCW = frontFace ? (delta.y > 0) : (delta.y < 0); }
                else if (layerX === -1) { moveFace = 'L'; moveCCW = frontFace ? (delta.y < 0) : (delta.y > 0); }
                else { moveFace = 'M'; moveCCW = frontFace ? (delta.y > 0) : (delta.y < 0); }
            }
        }
        else if (face === 'R' || face === 'L') {
            const rightFace = (face === 'R');
            if (absY > absZ) {
                const layerZ = getLayer(worldPos.z);
                if (layerZ === 1) { moveFace = 'F'; moveCCW = rightFace ? (delta.y > 0) : (delta.y < 0); }
                else if (layerZ === -1) { moveFace = 'B'; moveCCW = rightFace ? (delta.y < 0) : (delta.y > 0); }
                else { moveFace = 'S'; moveCCW = rightFace ? (delta.y > 0) : (delta.y < 0); }
            } else {
                const layerY = getLayer(worldPos.y);
                if (layerY === 1) { moveFace = 'U'; moveCCW = rightFace ? (delta.z < 0) : (delta.z > 0); }
                else if (layerY === -1) { moveFace = 'D'; moveCCW = rightFace ? (delta.z > 0) : (delta.z < 0); }
                else { moveFace = 'E'; moveCCW = rightFace ? (delta.z < 0) : (delta.z > 0); }
            }
        }
        else if (face === 'U' || face === 'D') {
            const upFace = (face === 'U');
            if (absX > absZ) {
                const layerZ = getLayer(worldPos.z);
                if (layerZ === 1) { moveFace = 'F'; moveCCW = upFace ? (delta.x > 0) : (delta.x < 0); }
                else if (layerZ === -1) { moveFace = 'B'; moveCCW = upFace ? (delta.x < 0) : (delta.x > 0); }
                else { moveFace = 'S'; moveCCW = upFace ? (delta.x > 0) : (delta.x < 0); }
            } else {
                const layerX = getLayer(worldPos.x);
                if (layerX === 1) { moveFace = 'R'; moveCCW = upFace ? (delta.z < 0) : (delta.z > 0); }
                else if (layerX === -1) { moveFace = 'L'; moveCCW = upFace ? (delta.z > 0) : (delta.z < 0); }
                else { moveFace = 'M'; moveCCW = upFace ? (delta.z < 0) : (delta.z > 0); }
            }
        }

        if (moveFace) {
            executeMove({ face: moveFace, ccw: moveCCW });
        }

        isDragging = false;
        dragState = null;
        controls.enabled = true;
    }

    function onPointerUp(e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        isDragging = false;
        dragState = null;
        controls.enabled = true;
    }

    // Event listeners
    renderer.domElement.addEventListener('pointerdown', onPointerDown, false);
    renderer.domElement.addEventListener('pointermove', onPointerMove, false);
    renderer.domElement.addEventListener('pointerup', onPointerUp, false);
    renderer.domElement.addEventListener('pointercancel', onPointerUp, false);
    renderer.domElement.addEventListener('pointerleave', onPointerUp, false);

    // ==================== EXECUTE MOVE ====================
    function executeMove({ face, ccw }) {
        if (!gameStarted) startTimer();
        const notation = face + (ccw ? "'" : "");
        rubiksCube.rotateFace(face, ccw).then(() => {
            addMove(notation);
            if (scrambled && rubiksCube.isSolved()) onSolved();
        });
    }

    // ==================== WIN ====================
    function onSolved() {
        stopTimer();
        const elapsed = getElapsed();
        const ts = formatTime(elapsed);
        let nb = false;
        if (bestTime === null || elapsed < bestTime) {
            bestTime = elapsed;
            document.getElementById('best-time').textContent = ts;
            nb = true;
        }
        document.getElementById('win-time').textContent = ts;
        document.getElementById('win-moves').textContent = moveCount;
        const be = document.getElementById('win-best');
        nb ? be.classList.remove('hidden') : be.classList.add('hidden');
        document.getElementById('win-screen').classList.remove('hidden');
        particleSystem.explode(120);
    }

    // ==================== KEYBOARD ====================
    document.addEventListener('keydown', (e) => {
        if (!loaded) return;
        const k = e.key.toUpperCase();
        if (['CONTROL','SHIFT','ALT','META','TAB'].includes(k)) return;
        if (k === 'ESCAPE') {
            document.getElementById('win-screen').classList.add('hidden');
            document.getElementById('keyboard-guide').classList.add('hidden');
            return;
        }
        const map = { R: 'R', L: 'L', U: 'U', D: 'D', F: 'F', B: 'B' };
        if (map[k]) { executeMove({ face: map[k], ccw: e.shiftKey }); return; }
        if (k === 'M') { executeMove({ face: 'M', ccw: e.shiftKey }); return; }
        if (k === 'E') { executeMove({ face: 'E', ccw: e.shiftKey }); return; }
        if (k === 'S' && !e.shiftKey) { handleScramble(); return; }
        if (k === 'P') { handleScramble(); return; }
        if (k === 'H') document.getElementById('keyboard-guide').classList.toggle('hidden');
    });

    // ==================== ACTIONS ====================
    async function handleScramble() {
        if (rubiksCube.isAnimating) return;
        resetTimer(); clearHistory(); scrambled = false;
        rubiksCube.reset();
        const overlay = document.getElementById('scramble-overlay');
        overlay.classList.remove('hidden');
        const moves = await rubiksCube.scramble(25);
        scrambled = true;
        overlay.classList.add('hidden');
        clearHistory();
        for (const m of moves) addMove(m);
        document.getElementById('status-text').textContent = 'Cube scrambled! Solve it by dragging faces or using keyboard.';
    }

    function handleReset() {
        resetTimer(); clearHistory(); scrambled = false;
        rubiksCube.reset(); updateCamera();
        document.getElementById('status-text').textContent = 'Cube reset. Click Scramble to begin.';
    }

    async function handleAutoSolve() {
        if (rubiksCube.isAnimating || !scrambled) return;
        stopTimer();
        const hist = await rubiksCube.autoSolve();
        for (const n of hist) addMove(n);
        scrambled = false;
        onSolved();
    }

    // ==================== UI ====================
    document.getElementById('btn-scramble').addEventListener('click', handleScramble);
    document.getElementById('btn-reset').addEventListener('click', handleReset);
    document.getElementById('btn-solve').addEventListener('click', () => {
        if (!scrambled || rubiksCube.solvedMoves.length === 0) {
            handleScramble().then(() => handleAutoSolve());
        } else handleAutoSolve();
    });
    document.getElementById('btn-play-again').addEventListener('click', () => {
        document.getElementById('win-screen').classList.add('hidden');
        handleScramble();
    });

    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            cubeSize = parseInt(btn.dataset.size);
            scrambled = false; resetTimer(); clearHistory();
            rubiksCube.destroy();
            rubiksCube = new RubiksCube(scene, cubeSize);
            updateCamera();
            document.getElementById('difficulty-badge').textContent = `${cubeSize}x${cubeSize}`;
            document.getElementById('status-text').textContent = 'Click Scramble to begin.';
        });
    });

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            scrambled = false; resetTimer(); clearHistory();
            const theme = btn.dataset.theme;
            rubiksCube.destroy();
            rubiksCube = new RubiksCube(scene, cubeSize);
            rubiksCube.theme = theme;
            rubiksCube.reset();
            updateCamera();
            document.getElementById('status-text').textContent = 'Click Scramble to begin.';
        });
    });

    document.getElementById('anim-speed').addEventListener('input', (e) => {
        const v = parseInt(e.target.value);
        document.getElementById('speed-value').textContent = v;
        rubiksCube.animationSpeed = 850 - v * 80;
    });
    document.getElementById('anim-speed').dispatchEvent(new Event('input'));

    document.getElementById('btn-keyboard').addEventListener('click', () => {
        document.getElementById('keyboard-guide').classList.toggle('hidden');
    });

    function updateCamera() {
        const dist = (cubeSize - 3) * 3 + initDist;
        const d = new THREE.Vector3(1, 0.6, 0.8).normalize().multiplyScalar(dist);
        camera.position.copy(d);
        controls.update();
    }

    function animate() {
        requestAnimationFrame(animate);
        if (controls.enabled) controls.update();
        const t = performance.now() * 0.001;
        pl1.position.set(Math.sin(t * 0.3) * 5, 3, Math.cos(t * 0.3) * 5);
        pl2.position.set(Math.cos(t * 0.2) * 4, -2, Math.sin(t * 0.2) * 4);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        particleSystem.resize();
        updateControlsForDevice();
    });

    document.getElementById('best-time').textContent = formatTime(bestTime);
    loaded = true;
    handleScramble();
})();
