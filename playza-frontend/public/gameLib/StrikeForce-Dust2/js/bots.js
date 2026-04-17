// ── Bot System ────────────────────────────────────────────────────────────────
const bots = [];

// Spawn configs: [x, z, team]
const BOT_SPAWNS = {
  terrorist: [
    [-50,-130],[-40,-120],[-60,-125],[-30,-135],[-70,-120],[0,-130],[25,-130],
  ],
  ct: [
    [0,145],[15,135],[-15,135],[25,145],[-25,145],[5,150],[-5,140],
  ],
};

function createBot(x, z, team) {
  const m = getMaterials();
  const bot = {
    position: new THREE.Vector3(x, 2, z),
    velocity: new THREE.Vector3(),
    health: 100,
    alive: true,
    team,
    state: "patrol",  // patrol | chase | attack | cover
    lastShot: 0,
    fireRate: 450 + Math.random() * 600,
    damage: 14 + Math.random() * 12,
    speed: 0.04 + Math.random() * 0.03,
    sightRange: 65,
    patrolPoints: [],
    patrolIdx: 0,
    targetPos: new THREE.Vector3(),
    coverCooldown: 0,
    flashedUntil: 0,
  };

  // Build patrol loop around spawn
  for (let i = 0; i < 5; i++) {
    bot.patrolPoints.push(new THREE.Vector3(
      x + (Math.random()-.5)*50,
      2,
      z + (Math.random()-.5)*50,
    ));
  }
  bot.targetPos.copy(bot.patrolPoints[0]);

  // Mesh
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.75,0.75,2.8,8), team==="terrorist"?m.tBrown:m.ctBlue);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.48,8,8), m.skin);
  head.position.y = 1.9;
  // Gun prop
  const gun = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.08,0.55), m.barrel);
  gun.position.set(0.5, 1.2, -0.4);

  const group = new THREE.Group();
  group.add(body, head, gun);
  group.position.copy(bot.position);
  group.castShadow = true;
  scene.add(group);
  bot.mesh = group;

  // Health bar above head
  const barCanvas = document.createElement("canvas");
  barCanvas.width = 64; barCanvas.height = 8;
  bot._barCanvas = barCanvas;
  bot._barCtx = barCanvas.getContext("2d");
  const barTex = new THREE.CanvasTexture(barCanvas);
  const barMat = new THREE.SpriteMaterial({ map: barTex });
  const barSprite = new THREE.Sprite(barMat);
  barSprite.scale.set(2, 0.25, 1);
  barSprite.position.set(0, 3.6, 0);
  group.add(barSprite);
  bot._barSprite = barSprite;
  bot._barTex = barTex;

  bots.push(bot); return bot;
}

function updateBotHealthBar(bot) {
  const ctx = bot._barCtx;
  ctx.clearRect(0,0,64,8);
  ctx.fillStyle = "#300"; ctx.fillRect(0,0,64,8);
  const w = Math.max(0, (bot.health/100)*64);
  ctx.fillStyle = bot.health > 60 ? "#0f0" : bot.health > 30 ? "#ff0" : "#f00";
  ctx.fillRect(0,0,w,8);
  bot._barTex.needsUpdate = true;
}

function spawnBots() {
  bots.forEach(b => { if(b.mesh) scene.remove(b.mesh); });
  bots.length = 0;

  const tArr = BOT_SPAWNS.terrorist;
  const ctArr= BOT_SPAWNS.ct;
  const pick = (arr, n) => arr.sort(()=>Math.random()-.5).slice(0,n);

  const diff = gameState.roundNumber || 1;
  const numBots = Math.min(5 + diff, 10);

  pick(tArr, Math.ceil(numBots/2)).forEach(([x,z]) => createBot(x,z,"terrorist"));
  pick(ctArr, Math.floor(numBots/2)).forEach(([x,z]) => createBot(x,z,"ct"));
}

function respawnBot(bot) {
  const arr = BOT_SPAWNS[bot.team];
  const [x,z] = arr[Math.floor(Math.random()*arr.length)];
  bot.position.set(x, 2, z);
  bot.health = 100;
  bot.alive  = true;
  bot.mesh.visible = true;
  bot.mesh.position.copy(bot.position);
  updateBotHealthBar(bot);
}

function hitBot(bot, dmg, isHead) {
  bot.health -= dmg;
  showHitMarker(isHead);
  updateBotHealthBar(bot);

  if (bot.health <= 0) {
    bot.alive = false;
    bot.mesh.visible = false;
    gameState.kills++;
    if (isHead) gameState.headshots++;
    bot.team==="terrorist" ? gameState.ctScore++ : gameState.tScore++;
    addKillFeed("You", bot.team==="terrorist"?"T":"CT", true, WEAPONS[currentWeapon].icon);
    updateHUD();
    spawnScorePopup(bot.position, isHead ? "+200 HS!" : `+100`, isHead ? "#ffaa00" : "#00ff66");

    // Score via Playza SDK
    window.parent.postMessage({ type:"PLAYZA_SCORE_SUBMISSION", payload:{ score: gameState.kills * 100 + gameState.headshots * 50 } }, "*");

    setTimeout(() => respawnBot(bot), 6000);
  }
}

function updateBots(dt) {
  const playerPos = camera.position.clone(); playerPos.y = 2;
  const now = Date.now();

  bots.forEach(bot => {
    if (!bot.alive) return;

    // Flashed — can't attack
    const flashed = now < bot.flashedUntil;
    const dist = bot.position.distanceTo(playerPos);
    const canSee = !flashed && dist < bot.sightRange && !isWallBetween(bot.position, playerPos, dist);

    if (canSee) {
      bot.state = dist < 8 ? "attack" : "chase";
    } else if (bot.state !== "patrol") {
      bot.coverCooldown -= dt * 1000;
      if (bot.coverCooldown <= 0) bot.state = "patrol";
    }

    // Movement
    let moveDir = null;
    if (bot.state === "chase") {
      moveDir = playerPos.clone().sub(bot.position).normalize();
    } else if (bot.state === "patrol") {
      const toTarget = bot.targetPos.clone().sub(bot.position);
      if (toTarget.length() < 2) {
        bot.patrolIdx = (bot.patrolIdx + 1) % bot.patrolPoints.length;
        bot.targetPos.copy(bot.patrolPoints[bot.patrolIdx]);
      }
      moveDir = toTarget.normalize();
    }

    if (moveDir) {
      const spd = bot.state==="chase" ? bot.speed : bot.speed * 0.5;
      const newPos = bot.position.clone().add(moveDir.clone().multiplyScalar(spd));
      newPos.y = 2;
      if (!checkCollision(newPos, 0.9)) {
        bot.position.copy(newPos);
      } else {
        // Strafe around obstacle
        const strafe = new THREE.Vector3(-moveDir.z, 0, moveDir.x).normalize().multiplyScalar(spd);
        const sPos = bot.position.clone().add(strafe); sPos.y = 2;
        if (!checkCollision(sPos, 0.9)) bot.position.copy(sPos);
        else {
          // Pick new patrol point
          bot.patrolIdx = (bot.patrolIdx+1) % bot.patrolPoints.length;
          bot.targetPos.copy(bot.patrolPoints[bot.patrolIdx]);
        }
      }
    }

    bot.mesh.position.copy(bot.position);

    if (canSee) {
      bot.mesh.lookAt(playerPos.x, bot.position.y, playerPos.z);
    } else if (moveDir) {
      const lookTarget = bot.position.clone().add(moveDir);
      bot.mesh.lookAt(lookTarget.x, bot.position.y, lookTarget.z);
    }

    // Shoot at player
    if (canSee && bot.state === "attack" || (canSee && bot.state==="chase" && dist < 25)) {
      if (now - bot.lastShot > bot.fireRate) {
        bot.lastShot = now;
        const hitChance = Math.max(0.1, 1 - dist/90) * (flashed?0:1);
        if (Math.random() < hitChance) takeDamage(Math.floor(bot.damage));
        createBotMuzzleFlash(bot.position);
      }
    }

    updateBotHealthBar(bot);
  });
}

function createBotMuzzleFlash(pos) {
  const fl = new THREE.PointLight(0xffcc44, 2, 8);
  fl.position.set(pos.x, pos.y + 1.2, pos.z);
  scene.add(fl); setTimeout(()=>scene.remove(fl), 40);
}
