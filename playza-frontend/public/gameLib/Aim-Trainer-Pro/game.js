const WEAPONS = {
    pistol: { name: "Pistol", mag: 10, reserve: 40, fireDelay: 220, reloadMs: 900, power: 1, spread: 0 },
    rifle: { name: "Rifle", mag: 18, reserve: 72, fireDelay: 110, reloadMs: 1200, power: 1, spread: 0 },
    scatter: { name: "Scatter", mag: 6, reserve: 30, fireDelay: 480, reloadMs: 1400, power: 2, spread: 24 }
};

const TARGET_TEMPLATES = [
    { icon: "🦆", label: "DUCK", points: 100, hp: 1, className: "hostile" },
    { icon: "🦊", label: "FOX", points: 120, hp: 1, className: "hostile" },
    { icon: "🎯", label: "TARGET", points: 90, hp: 1, className: "hostile" },
    { icon: "📦", label: "CRATE", points: 140, hp: 2, className: "bonus" },
    { icon: "🚁", label: "DRONE", points: 170, hp: 1, className: "fast" }
];

document.addEventListener("DOMContentLoaded", () => {
    const gameArea = document.getElementById("game-area");
    const overlay = document.getElementById("overlay");
    const overlayTitle = document.getElementById("overlay-title");
    const overlayText = document.getElementById("overlay-text");
    const overlayAction = document.getElementById("overlay-action");
    const startBtn = document.getElementById("start-btn");
    const pauseBtn = document.getElementById("pause-btn");
    const reloadBtn = document.getElementById("reload-btn");
    const crosshair = document.getElementById("crosshair");
    const muzzleFlash = document.getElementById("muzzle-flash");
    const impactLayer = document.getElementById("impact-layer");

    const scoreEl = document.getElementById("score");
    const levelEl = document.getElementById("level");
    const waveEl = document.getElementById("wave");
    const accuracyEl = document.getElementById("accuracy");
    const bestScoreEl = document.getElementById("best-score");
    const ammoEl = document.getElementById("ammo");
    const livesEl = document.getElementById("lives");
    const objectiveEl = document.getElementById("objective");
    const weaponNameEl = document.getElementById("weapon-name");
    const missionTitleEl = document.getElementById("mission-title");
    const missionTextEl = document.getElementById("mission-text");
    const arenaStatusEl = document.getElementById("arena-status");
    const levelProgressEl = document.getElementById("level-progress");
    const comboReadoutEl = document.getElementById("combo-readout");

    const weaponButtons = [...document.querySelectorAll(".weapon-btn")];

    const bestScore = parseInt(localStorage.getItem("target-hunt-best") || "0", 10);
    bestScoreEl.textContent = bestScore;

    const state = {
        running: false,
        paused: false,
        weaponKey: "pistol",
        score: 0,
        bestScore,
        level: 1,
        wave: 1,
        lives: 3,
        shots: 0,
        hits: 0,
        combo: 0,
        objectiveHits: 0,
        objectiveGoal: 12,
        levelMessage: "",
        isReloading: false,
        currentAmmo: WEAPONS.pistol.mag,
        reserveAmmo: WEAPONS.pistol.reserve,
        lastShotAt: 0,
        targets: [],
        lastTick: 0,
        spawnTimer: 0,
        spawnInterval: 1100,
        maxTargets: 3,
        levelAdvanceQueued: false,
        rafId: 0
    };

    function selectWeapon(key) {
        if (!WEAPONS[key]) return;
        state.weaponKey = key;
        weaponButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.weapon === key));
        if (!state.running) {
            const weapon = WEAPONS[key];
            state.currentAmmo = weapon.mag;
            state.reserveAmmo = weapon.reserve;
        }
        updateHUD();
    }

    function resetState() {
        const weapon = WEAPONS[state.weaponKey];
        clearTargets();
        state.running = true;
        state.paused = false;
        state.score = 0;
        state.level = 1;
        state.wave = 1;
        state.lives = 3;
        state.shots = 0;
        state.hits = 0;
        state.combo = 0;
        state.objectiveHits = 0;
        state.objectiveGoal = 12;
        state.currentAmmo = weapon.mag;
        state.reserveAmmo = weapon.reserve;
        state.spawnInterval = 1100;
        state.maxTargets = 3;
        state.isReloading = false;
        state.levelAdvanceQueued = false;
        state.lastShotAt = 0;
        missionTitleEl.textContent = "Level 1: Warm Up";
        missionTextEl.textContent = "Hit 12 targets to clear the opening range. Moving prey will get faster after every level.";
        arenaStatusEl.textContent = "Hunt in Progress";
        closeOverlay();
        updateHUD();
    }

    function openOverlay(title, text, actionText) {
        overlayTitle.textContent = title;
        overlayText.textContent = text;
        overlayAction.textContent = actionText || "Continue";
        overlay.classList.add("active");
    }

    function closeOverlay() {
        overlay.classList.remove("active");
    }

    function updateHUD() {
        scoreEl.textContent = state.score;
        levelEl.textContent = state.level;
        waveEl.textContent = state.wave;
        livesEl.textContent = state.lives;
        accuracyEl.textContent =
            state.shots === 0 ? "100%" : `${Math.round((state.hits / state.shots) * 100)}%`;
        ammoEl.textContent = `${state.currentAmmo} / ${state.reserveAmmo}`;
        objectiveEl.textContent = `${state.objectiveHits} / ${state.objectiveGoal}`;
        weaponNameEl.textContent = WEAPONS[state.weaponKey].name + (state.isReloading ? " (Reloading)" : "");
        levelProgressEl.style.width = `${Math.min(100, (state.objectiveHits / state.objectiveGoal) * 100)}%`;
        comboReadoutEl.textContent = `Combo x${Math.max(1, state.combo)}`;
        bestScoreEl.textContent = state.bestScore;
    }

    function clearTargets() {
        state.targets.forEach((target) => target.el.remove());
        state.targets = [];
    }

    function buildLevelSettings() {
        return {
            spawnInterval: Math.max(360, 1100 - (state.level - 1) * 80),
            maxTargets: Math.min(7, 3 + Math.floor((state.level - 1) / 2)),
            baseSpeed: 36 + state.level * 8,
            targetSize: Math.max(58, 108 - state.level * 4)
        };
    }

    function spawnTarget() {
        if (!state.running || state.paused) return;
        if (state.targets.length >= state.maxTargets) return;

        const settings = buildLevelSettings();
        const rect = gameArea.getBoundingClientRect();
        const template = TARGET_TEMPLATES[Math.floor(Math.random() * TARGET_TEMPLATES.length)];
        const size = settings.targetSize + Math.random() * 24;
        const x = 70 + Math.random() * Math.max(80, rect.width - 140);
        const y = 70 + Math.random() * Math.max(80, rect.height - 140);
        const angle = Math.random() * Math.PI * 2;
        const speed = settings.baseSpeed + Math.random() * (16 + state.level * 2);

        const el = document.createElement("button");
        el.className = `gallery-target ${template.className}`;
        el.style.width = `${size}px`;
        el.style.height = `${Math.max(64, size * 0.72)}px`;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.innerHTML = `<span class="icon">${template.icon}</span><span class="tag">${template.label}</span>`;
        gameArea.appendChild(el);

        const target = {
            id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            el,
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed * 0.55,
            size,
            hp: template.hp,
            points: template.points,
            bornAt: performance.now()
        };

        el.addEventListener("click", (event) => {
            event.stopPropagation();
            fireShot(event, target);
        });

        state.targets.push(target);
    }

    function removeTarget(target) {
        state.targets = state.targets.filter((item) => item.id !== target.id);
        target.el.remove();
    }

    function fireShot(event, forcedTarget = null) {
        if (!state.running || state.paused || state.isReloading) return;
        const weapon = WEAPONS[state.weaponKey];
        const now = performance.now();
        if (now - state.lastShotAt < weapon.fireDelay) return;

        if (state.currentAmmo <= 0) {
            beginReload();
            return;
        }

        state.lastShotAt = now;
        state.currentAmmo--;
        state.shots++;

        const rect = gameArea.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        showShotFeedback(x, y);

        if (forcedTarget) {
            hitTarget(forcedTarget);
        } else {
            state.combo = 0;
            loseLife("Missed shot. Stay steady.");
        }

        if (state.currentAmmo === 0 && state.reserveAmmo > 0) {
            beginReload();
        }

        updateHUD();
    }

    function hitTarget(target) {
        state.hits++;
        state.combo++;
        const comboBonus = Math.max(0, state.combo - 1) * 20;
        target.hp -= WEAPONS[state.weaponKey].power;

        if (target.hp > 0) {
            target.el.style.transform = "translate(-50%, -50%) scale(0.92)";
            setTimeout(() => {
                target.el.style.transform = "translate(-50%, -50%) scale(1)";
            }, 90);
            updateHUD();
            return;
        }

        state.score += target.points + comboBonus;
        state.objectiveHits++;
        target.el.classList.add("target-hit");
        setTimeout(() => removeTarget(target), 140);

        if (state.score > state.bestScore) {
            state.bestScore = state.score;
            localStorage.setItem("target-hunt-best", String(state.bestScore));
        }

        if (!state.levelAdvanceQueued && state.objectiveHits >= state.objectiveGoal) {
            advanceLevel();
        }

        updateHUD();
    }

    function advanceLevel() {
        state.levelAdvanceQueued = true;
        state.running = false;
        clearTargets();
        state.level++;
        state.wave++;
        state.objectiveHits = 0;
        state.objectiveGoal = 10 + state.level * 4;
        state.spawnInterval = Math.max(360, 1100 - (state.level - 1) * 80);
        state.maxTargets = Math.min(7, 3 + Math.floor((state.level - 1) / 2));
        missionTitleEl.textContent = `Level ${state.level}: Pressure Up`;
        missionTextEl.textContent = `Clear ${state.objectiveGoal} targets. Faster movement, shorter reaction windows, and denser waves are now active.`;
        arenaStatusEl.textContent = "Level Cleared";
        updateHUD();
        openOverlay(`Level ${state.level - 1} Cleared`, `Next wave unlocked. Level ${state.level} now demands ${state.objectiveGoal} hits with faster targets and less room for mistakes.`, "Start Next Level");
    }

    function loseLife(reason) {
        state.lives--;
        arenaStatusEl.textContent = reason;
        if (state.lives <= 0) {
            endRun();
        }
    }

    function endRun() {
        state.running = false;
        state.paused = false;
        clearTargets();
        arenaStatusEl.textContent = "Run Over";
        openOverlay(
            "Run Over",
            `Final score ${state.score}. Accuracy ${state.shots === 0 ? 100 : Math.round((state.hits / state.shots) * 100)}%. Best streak reached level ${state.level}.`,
            "Play Again"
        );
        updateHUD();
    }

    function beginReload() {
        if (state.isReloading || state.reserveAmmo <= 0) return;
        state.isReloading = true;
        arenaStatusEl.textContent = "Reloading";
        updateHUD();
        setTimeout(() => {
            const weapon = WEAPONS[state.weaponKey];
            const need = weapon.mag - state.currentAmmo;
            const load = Math.min(need, state.reserveAmmo);
            state.currentAmmo += load;
            state.reserveAmmo -= load;
            state.isReloading = false;
            arenaStatusEl.textContent = state.running ? "Hunt in Progress" : "Ready to Hunt";
            updateHUD();
        }, weapon.reloadMs);
    }

    function updateTargets(dt) {
        const rect = gameArea.getBoundingClientRect();
        state.targets.forEach((target) => {
            target.x += target.vx * dt;
            target.y += target.vy * dt;

            const halfW = target.el.offsetWidth / 2;
            const halfH = target.el.offsetHeight / 2;

            if (target.x <= halfW || target.x >= rect.width - halfW) {
                target.vx *= -1;
                target.x = Math.max(halfW, Math.min(rect.width - halfW, target.x));
            }

            if (target.y <= halfH || target.y >= rect.height - halfH) {
                target.vy *= -1;
                target.y = Math.max(halfH, Math.min(rect.height - halfH, target.y));
            }

            target.el.style.left = `${target.x}px`;
            target.el.style.top = `${target.y}px`;

            if (performance.now() - target.bornAt > Math.max(3400, 5200 - state.level * 110)) {
                removeTarget(target);
                state.combo = 0;
                loseLife("A target escaped.");
                updateHUD();
            }
        });
    }

    function tick(ts) {
        if (!state.lastTick) state.lastTick = ts;
        const dt = (ts - state.lastTick) / 1000;
        state.lastTick = ts;

        if (state.running && !state.paused) {
            state.spawnTimer += dt * 1000;
            while (state.spawnTimer >= state.spawnInterval) {
                state.spawnTimer -= state.spawnInterval;
                spawnTarget();
            }
            updateTargets(dt);
        }

        state.rafId = requestAnimationFrame(tick);
    }

    function showShotFeedback(x, y) {
        muzzleFlash.style.opacity = "1";
        muzzleFlash.style.left = `${x - 60}px`;
        muzzleFlash.style.top = `${y - 60}px`;
        setTimeout(() => {
            muzzleFlash.style.opacity = "0";
        }, 80);

        const impact = document.createElement("div");
        impact.className = "impact";
        impact.style.left = `${x}px`;
        impact.style.top = `${y}px`;
        impactLayer.appendChild(impact);
        setTimeout(() => impact.remove(), 350);
    }

    function moveCrosshair(event) {
        const rect = gameArea.getBoundingClientRect();
        crosshair.style.opacity = "1";
        crosshair.style.left = `${event.clientX - rect.left}px`;
        crosshair.style.top = `${event.clientY - rect.top}px`;
    }

    function startOrResumeRun() {
        if (!state.running && !state.levelAdvanceQueued) {
            resetState();
            return;
        }

        if (state.levelAdvanceQueued) {
            state.levelAdvanceQueued = false;
            state.running = true;
            state.paused = false;
            arenaStatusEl.textContent = "Hunt in Progress";
            closeOverlay();
            updateHUD();
            return;
        }

        state.paused = false;
        closeOverlay();
        arenaStatusEl.textContent = "Hunt in Progress";
    }

    weaponButtons.forEach((button) => {
        button.addEventListener("click", () => {
            if (state.running && !state.levelAdvanceQueued) return;
            selectWeapon(button.dataset.weapon);
        });
    });

    reloadBtn.addEventListener("click", beginReload);

    pauseBtn.addEventListener("click", () => {
        if (!state.running) return;
        state.paused = !state.paused;
        if (state.paused) {
            openOverlay("Paused", "Catch your breath, then resume the hunt.", "Resume");
            arenaStatusEl.textContent = "Paused";
        } else {
            closeOverlay();
            arenaStatusEl.textContent = "Hunt in Progress";
        }
    });

    startBtn.addEventListener("click", startOrResumeRun);
    overlayAction.addEventListener("click", startOrResumeRun);

    gameArea.addEventListener("mousemove", moveCrosshair);
    gameArea.addEventListener("mouseenter", () => {
        crosshair.style.opacity = "1";
    });
    gameArea.addEventListener("mouseleave", () => {
        crosshair.style.opacity = "0";
    });

    gameArea.addEventListener("click", (event) => {
        if (event.target.closest(".gallery-target")) return;
        fireShot(event);
    });

    selectWeapon("pistol");
    updateHUD();
    state.rafId = requestAnimationFrame(tick);
});
