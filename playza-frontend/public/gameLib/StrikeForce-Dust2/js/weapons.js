// ── Active weapon state ───────────────────────────────────────────────────────
let currentWeapon  = "ak47";
let currentAmmo    = WEAPONS.ak47.magSize;
let reserveAmmo    = WEAPONS.ak47.reserveAmmo;
let isReloading    = false;
let canShoot       = true;
let isShooting     = false;
let reloadAnimId   = null;

// Grenades
let activeGrenade  = "frag";
const grenadeInv   = { frag: 2, smoke: 1, flash: 2 };

// Recoil accumulation
let recoilAccX     = 0;
let recoilAccY     = 0;

// ── Weapon Model Builder ──────────────────────────────────────────────────────
function buildWeaponModel(type) {
  while (weaponGroup.children.length) weaponGroup.remove(weaponGroup.children[0]);

  const m = getMaterials();
  const add = (...meshes) => meshes.forEach(me => weaponGroup.add(me));

  function part(gx,gy,gz, px,py,pz, mat, rx=0,ry=0,rz=0, name="") {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(gx,gy,gz), mat);
    mesh.position.set(px,py,pz);
    mesh.rotation.set(rx,ry,rz);
    if(name) mesh.name = name;
    return mesh;
  }
  function cyl(rt,rb,h,segs,px,py,pz,mat,rx=0,ry=0,rz=0,name="") {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segs), mat);
    mesh.position.set(px,py,pz); mesh.rotation.set(rx,ry,rz);
    if(name) mesh.name = name; return mesh;
  }

  if (type === "ak47") {
    add(
      part(0.05,0.05,0.85, 0.28,-0.22,-0.52, m.barrel),
      part(0.09,0.13,0.42, 0.28,-0.22,-0.08, m.gun),
      part(0.07,0.11,0.30, 0.28,-0.22, 0.22, m.gunWood,"stock"),
      part(0.05,0.16,0.09, 0.28,-0.37, 0.00, m.gun,0.2,0,0,"magazine"),
      part(0.03,0.03,0.14, 0.28,-0.14,-0.10, m.barrel,"","","","slide"),
      part(0.025,0.025,0.40, 0.28,-0.265,0.00, m.gun),  // trigger guard
    );
  } else if (type === "m4a4") {
    add(
      part(0.04,0.04,0.92, 0.28,-0.21,-0.56, m.barrel),
      part(0.08,0.11,0.38, 0.28,-0.21,-0.09, m.gun),
      part(0.06,0.09,0.26, 0.28,-0.21, 0.20, m.gun),
      part(0.035,0.12,0.07,0.28,-0.33, 0.00, m.gun,0,0,0,"magazine"),
      part(0.03,0.03,0.13, 0.28,-0.14,-0.05,  m.barrel,0,0,0,"slide"),
      part(0.025,0.025,0.16,0.28,-0.135,-0.22, m.gun),  // rail
    );
  } else if (type === "awp") {
    add(
      part(0.065,0.065,1.12, 0.28,-0.21,-0.66, m.barrel),
      part(0.11,0.16,0.52,  0.28,-0.22,-0.08, m.gunGreen),
      part(0.09,0.13,0.38,  0.28,-0.22, 0.27, m.gunGreen),
      cyl(0.03,0.03,0.20, 8, 0.28,-0.10,-0.16, m.gun, Math.PI/2,0,0, "scope"),
      part(0.055,0.13,0.09, 0.28,-0.37,-0.04, m.gun,0,0,0,"magazine"),
      cyl(0.015,0.015,0.09, 6, 0.35,-0.16, 0.00, m.gun, 0,0,Math.PI/2,"slide"),
    );
  } else if (type === "glock") {
    add(
      part(0.042,0.065,0.24, 0.24,-0.22,-0.14, m.gun,0,0,0,"slide"),
      cyl(0.012,0.012,0.09, 8, 0.24,-0.21,-0.29, m.barrel, Math.PI/2),
      part(0.040,0.12,0.075, 0.24,-0.31,-0.02, m.gun,0.25,0,0),
      part(0.029,0.085,0.048,0.24,-0.40,-0.02, m.gun,0,0,0,"magazine"),
      part(0.008,0.026,0.02, 0.24,-0.265,-0.08, m.gun),
    );
  } else if (type === "knife") {
    add(
      part(0.12,0.015,0.35, 0.25,-0.22,-0.22, m.metal),  // blade
      part(0.09,0.04,0.16,  0.25,-0.22,-0.02, m.gunWood), // handle
    );
  }
}

// ── Active-Weapon UI Helpers ──────────────────────────────────────────────────
function getEffectiveSpread() {
  const w = WEAPONS[currentWeapon];
  if (gameState.isADS)     return w.adsSpread;
  if (gameState.isCrouched)return w.crouchSpread;
  return w.spread;
}

// ── Shooting ──────────────────────────────────────────────────────────────────
function shoot() {
  if (!canShoot || isReloading || !gameState.started) return;
  const w = WEAPONS[currentWeapon];

  if (w.isKnife) {
    doKnifeSwing();
    canShoot = false;
    setTimeout(() => { canShoot = true; }, w.fireRate);
    return;
  }

  if (currentAmmo <= 0) { reload(); return; }

  canShoot   = false;
  currentAmmo--;
  updateHUD();

  // Recoil
  const rcy = w.recoilY + recoilAccY * 0.5;
  recoilAccY = Math.min(recoilAccY + w.recoilY, 0.06);

  camera.rotation.x -= rcy;
  weaponGroup.rotation.x = -0.12;
  setTimeout(() => { weaponGroup.rotation.x = 0; }, 50);

  // Spread
  const spread = getEffectiveSpread() * (gameState.stamina < 30 ? 1.8 : 1);
  const dir = new THREE.Vector3(0,0,-1);
  dir.x += (Math.random()-.5)*spread;
  dir.y += (Math.random()-.5)*spread;
  dir.applyQuaternion(camera.quaternion);

  const ray = new THREE.Raycaster(camera.position, dir);

  // Hit detection on bots
  bots.forEach(bot => {
    if (!bot.alive) return;
    const head = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(bot.position.x, bot.position.y + 2.5, bot.position.z),
      new THREE.Vector3(1.2, 1.2, 1.2)
    );
    const body = new THREE.Box3().setFromObject(bot.mesh);
    let isHead = false, dist = Infinity;
    const hitH = ray.ray.intersectBox(head, new THREE.Vector3());
    const hitB = ray.ray.intersectBox(body, new THREE.Vector3());
    if (hitH) { isHead = true; dist = camera.position.distanceTo(hitH); }
    else if(hitB) { dist = camera.position.distanceTo(hitB); }

    if ((hitH||hitB) && !isWallBetween(camera.position, bot.position, dist)) {
      const dmg = Math.floor(w.damage * (isHead ? w.headshotMult : 1));
      hitBot(bot, dmg, isHead);
    }
  });

  createTracer(camera.position.clone(), dir);
  createMuzzleFlash();

  // AWP unscopes after shot
  if (currentWeapon === "awp" && gameState.isADS) setADS(false);

  setTimeout(() => {
    canShoot = true;
    recoilAccY = Math.max(0, recoilAccY - w.recoilY);
    if (isShooting && w.automatic) shoot();
  }, w.fireRate);
}

function doKnifeSwing() {
  weaponGroup.rotation.y = -0.4;
  setTimeout(()=>{ weaponGroup.rotation.y = 0; }, 200);
  const dir = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
  const ray = new THREE.Raycaster(camera.position, dir, 0, WEAPONS.knife.range);
  bots.forEach(bot => {
    if (!bot.alive) return;
    const box = new THREE.Box3().setFromObject(bot.mesh);
    const hit = ray.ray.intersectBox(box, new THREE.Vector3());
    if (hit) hitBot(bot, WEAPONS.knife.damage, false);
  });
}

function isWallBetween(from, to, maxDist) {
  const dir = to.clone().sub(from).normalize();
  const ray = new THREE.Ray(from, dir);
  for (const box of collisionBoxes) {
    const b3 = new THREE.Box3(box.min, box.max);
    const pt = new THREE.Vector3();
    if (ray.intersectBox(b3, pt) && from.distanceTo(pt) < maxDist - 0.5) return true;
  }
  return false;
}

function createTracer(origin, dir) {
  const end = origin.clone().add(dir.clone().multiplyScalar(150));
  const pts = [origin, end];
  const geom = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color:0xffff88, transparent:true, opacity:0.6 });
  const line = new THREE.Line(geom, mat);
  scene.add(line);
  setTimeout(()=>scene.remove(line), 60);
}

function createMuzzleFlash() {
  const flash = new THREE.PointLight(0xffcc44, 3, 6);
  flash.position.copy(camera.position).add(new THREE.Vector3(0,-0.2,-1).applyQuaternion(camera.quaternion));
  scene.add(flash);
  setTimeout(()=>scene.remove(flash), 45);
}

// ── Reload ────────────────────────────────────────────────────────────────────
function reload() {
  const w = WEAPONS[currentWeapon];
  if (isReloading || w.isKnife || currentAmmo===w.magSize || reserveAmmo<=0) return;
  isReloading = true;
  document.getElementById("weapon-name").textContent = "RELOADING...";

  // Animation: dip + rise
  let t = 0;
  const totalMs = w.reloadTime;
  const step = 16;
  function frame() {
    t += step;
    const p = t / totalMs;
    if (p < 0.35) {
      weaponGroup.position.y  = -0.25 * ease(p/0.35);
      weaponGroup.rotation.x  = -0.4  * ease(p/0.35);
    } else if (p < 0.65) {
      weaponGroup.position.y  = -0.25;
      weaponGroup.rotation.x  = -0.4;
    } else {
      const r = ease((p-0.65)/0.35);
      weaponGroup.position.y  = -0.25 * (1-r);
      weaponGroup.rotation.x  = -0.4  * (1-r);
    }
    if (t < totalMs) { reloadAnimId = setTimeout(frame, step); }
    else {
      weaponGroup.position.set(0,0,0); weaponGroup.rotation.set(0,0,0);
      reloadAnimId = null;
    }
  }
  if(reloadAnimId) clearTimeout(reloadAnimId);
  frame();

  setTimeout(()=>{
    const needed = w.magSize - currentAmmo;
    const avail  = Math.min(needed, reserveAmmo);
    currentAmmo  += avail;
    reserveAmmo  -= avail;
    isReloading   = false;
    updateHUD();
  }, w.reloadTime);
}

function ease(t) { return t*(2-t); }

// ── Weapon Switch ─────────────────────────────────────────────────────────────
function switchWeapon(type) {
  if (type === currentWeapon || isReloading) return;
  if (gameState.isADS) setADS(false);
  currentWeapon = type;
  currentAmmo   = WEAPONS[type].magSize;
  reserveAmmo   = WEAPONS[type].reserveAmmo;
  recoilAccY    = 0;
  buildWeaponModel(type);
  updateHUD();
  document.querySelectorAll(".weapon-slot").forEach(s => {
    s.classList.toggle("active", parseInt(s.dataset.slot) === WEAPONS[type].slot);
  });
}

// ── ADS ───────────────────────────────────────────────────────────────────────
function setADS(on) {
  gameState.isADS = on;
  const w = WEAPONS[currentWeapon];
  if (on) {
    camera.fov = w.scopeFOV || 40;
    if (w.scopeFOV) document.getElementById("scope-overlay").classList.add("visible");
    camera.updateProjectionMatrix();
    crosshairEl.classList.add("ads");
  } else {
    camera.fov = 75;
    document.getElementById("scope-overlay").classList.remove("visible");
    camera.updateProjectionMatrix();
    crosshairEl.classList.remove("ads");
  }
}

// ── Grenade Throw ─────────────────────────────────────────────────────────────
const activeGrenades = [];

function throwGrenade() {
  if (grenadeInv[activeGrenade] <= 0) return;
  grenadeInv[activeGrenade]--;
  updateHUD();

  const g = GRENADES[activeGrenade];
  const origin = camera.position.clone();
  const dir    = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
  dir.y += 0.3; dir.normalize();

  // Grenade mesh
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.25,8,8),
    new THREE.MeshStandardMaterial({ color: activeGrenade==="flash"?0xffffcc:0x444444 })
  );
  mesh.position.copy(origin);
  scene.add(mesh);

  const vel = dir.clone().multiplyScalar(25);
  let fuseLeft = g.fuseTime;

  activeGrenades.push({ mesh, vel, fuseLeft, type: activeGrenade, data: g });
}

function updateGrenades(dt) {
  const toRemove = [];
  for (let i = activeGrenades.length-1; i >= 0; i--) {
    const gr = activeGrenades[i];
    gr.fuseLeft -= dt * 1000;

    // Physics
    gr.vel.y -= 20 * dt;
    gr.mesh.position.add(gr.vel.clone().multiplyScalar(dt));

    // Ground bounce
    if (gr.mesh.position.y < 0.4) {
      gr.mesh.position.y = 0.4;
      gr.vel.y   = Math.abs(gr.vel.y) * 0.4;
      gr.vel.x  *= 0.7; gr.vel.z *= 0.7;
    }

    if (gr.fuseLeft <= 0) {
      explodeGrenade(gr);
      scene.remove(gr.mesh);
      toRemove.push(i);
    }
  }
  toRemove.forEach(i => activeGrenades.splice(i, 1));
}

function explodeGrenade(gr) {
  const pos = gr.mesh.position;
  if (gr.type === "frag") {
    // Damage nearby bots
    bots.forEach(bot => {
      if (!bot.alive) return;
      const d = pos.distanceTo(bot.position);
      if (d < gr.data.radius) {
        const dmg = Math.floor(gr.data.damage * (1 - d / gr.data.radius));
        hitBot(bot, dmg, false);
      }
    });
    // Damage player
    const pd = pos.distanceTo(camera.position);
    if (pd < gr.data.radius) {
      takeDamage(Math.floor(gr.data.damage * (1 - pd / gr.data.radius)));
    }
    // Flash effect
    createExplosionEffect(pos);

  } else if (gr.type === "smoke") {
    createSmokeEffect(pos, gr.data.duration);

  } else if (gr.type === "flash") {
    const pd = pos.distanceTo(camera.position);
    if (pd < gr.data.radius) {
      const intensity = Math.max(0, 1 - pd / gr.data.radius);
      showFlashEffect(intensity, gr.data.duration);
    }
    bots.forEach(bot => {
      if (!bot.alive) return;
      const d = pos.distanceTo(bot.position);
      if (d < gr.data.radius) bot.flashedUntil = Date.now() + gr.data.duration * (1 - d/gr.data.radius);
    });
  }
}

function createExplosionEffect(pos) {
  const light = new THREE.PointLight(0xff8800, 5, 30);
  light.position.copy(pos); scene.add(light);
  setTimeout(()=>scene.remove(light), 200);
  // Sparks
  for (let i = 0; i < 12; i++) {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.15+Math.random()*0.2, 4,4),
      new THREE.MeshBasicMaterial({ color: 0xff8800, transparent:true, opacity:0.9 })
    );
    s.position.copy(pos);
    scene.add(s);
    const v = new THREE.Vector3((Math.random()-.5)*10,(Math.random()+0.5)*10,(Math.random()-.5)*10);
    let lt = 0;
    const sp = setInterval(()=>{
      lt += 40; s.position.add(v.clone().multiplyScalar(0.04));
      s.material.opacity -= 0.05;
      if(lt > 800 || s.material.opacity <= 0) { clearInterval(sp); scene.remove(s); }
    },40);
  }
}

function createSmokeEffect(pos, duration) {
  const spheres = [];
  for (let k=0;k<6;k++) {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(2.5+k*0.5,8,8),
      new THREE.MeshBasicMaterial({ color:0xcccccc, transparent:true, opacity:0.4 })
    );
    s.position.set(pos.x+(Math.random()-.5)*2, pos.y+k*0.4, pos.z+(Math.random()-.5)*2);
    scene.add(s); spheres.push(s);
  }
  setTimeout(()=>spheres.forEach(s=>scene.remove(s)), duration);
}

function showFlashEffect(intensity, duration) {
  const fl = document.createElement("div");
  fl.style.cssText = `position:fixed;inset:0;background:rgba(255,255,255,${intensity});z-index:999;pointer-events:none;transition:opacity ${duration}ms;`;
  document.body.appendChild(fl);
  requestAnimationFrame(()=>{ fl.style.opacity="0"; });
  setTimeout(()=>fl.remove(), duration+100);
}
