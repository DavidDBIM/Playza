// ── HUD Update ────────────────────────────────────────────────────────────────
function updateHUD() {
  // Health
  const hp  = gameState.health;
  const maxHp= gameState.maxHealth;
  const hpPct= (hp/maxHp)*100;
  document.getElementById("health-bar").style.width = hpPct + "%";
  document.getElementById("health-text").textContent = Math.ceil(hp);
  const hbar = document.getElementById("health-bar");
  hbar.style.background = hpPct <= 25 ? "linear-gradient(90deg,#ff2222,#aa0000)"
    : hpPct <= 50 ? "linear-gradient(90deg,#ffaa00,#ff6600)"
    : "linear-gradient(90deg,#00ff66,#00cc55)";

  // Armor
  document.getElementById("armor-bar").style.width = (gameState.armor/gameState.maxArmor)*100 + "%";

  // Ammo
  const w = WEAPONS[currentWeapon];
  document.getElementById("weapon-name").textContent = isReloading ? "RELOADING..." : w.name;
  document.getElementById("ammo-display").innerHTML = w.isKnife
    ? `<span>MELEE</span>`
    : `${currentAmmo} <span>/ ${reserveAmmo}</span>`;
  const ammoBar = document.getElementById("ammo-bar");
  if (!w.isKnife) ammoBar.style.width = (currentAmmo / w.magSize)*100 + "%";

  // Score
  document.getElementById("ct-score").textContent = gameState.ctScore;
  document.getElementById("t-score").textContent  = gameState.tScore;

  // Round timer display
  const rts = Math.max(0, Math.floor(gameState.roundTime));
  const mm = String(Math.floor(rts/60)).padStart(2,"0");
  const ss = String(rts%60).padStart(2,"0");
  const rtEl = document.getElementById("round-timer");
  rtEl.textContent = `${mm}:${ss}`;
  rtEl.classList.toggle("danger", rts <= 30);

  // Weapon slots
  document.querySelectorAll(".weapon-slot").forEach(el => {
    el.classList.toggle("active", parseInt(el.dataset.slot) === WEAPONS[currentWeapon]?.slot);
  });

  // Grenade slots
  document.querySelectorAll(".nade-slot").forEach(el => {
    const type = el.dataset.type;
    el.querySelector(".nade-count").textContent = `×${grenadeInv[type]}`;
    el.classList.toggle("active", type === activeGrenade);
    el.style.opacity = grenadeInv[type] > 0 ? "1" : "0.35";
  });

  // Crosshair spread visual
  crosshairEl = crosshairEl || document.getElementById("crosshair");
  crosshairEl.classList.toggle("spread", isRunning && (moveForward||moveBackward||moveLeft||moveRight));
  crosshairEl.classList.toggle("ads",    gameState.isADS);
}

// ── Minimap ───────────────────────────────────────────────────────────────────
let _mapZoomLevel = 0; // 0=normal, 1=zoomed out
const _mapZoomScales = [0.55, 0.30];
const _mapZoomLabels = ["1×", "0.5×"];

function updateMinimap() {
  const canvas = document.getElementById("minimap-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const scale  = _mapZoomScales[_mapZoomLevel];
  const ox = W/2, oy = H/2;

  // Background
  ctx.fillStyle = "#0d1117"; ctx.fillRect(0,0,W,H);

  // Grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth=1;
  for(let gx=-200;gx<=200;gx+=40){
    const sx=gx*scale+ox;
    ctx.beginPath(); ctx.moveTo(sx,0); ctx.lineTo(sx,H); ctx.stroke();
  }
  for(let gz=-200;gz<=200;gz+=40){
    const sz=gz*scale+oy;
    ctx.beginPath(); ctx.moveTo(0,sz); ctx.lineTo(W,sz); ctx.stroke();
  }

  // Walls (collision boxes)
  ctx.fillStyle = "rgba(180,160,120,0.6)";
  for (const box of collisionBoxes) {
    const cx = ((box.min.x + box.max.x)/2) * scale + ox;
    const cz = ((box.min.z + box.max.z)/2) * scale + oy;
    const bw = (box.max.x - box.min.x) * scale;
    const bh = (box.max.z - box.min.z) * scale;
    if(bw < 0.5 || bh < 0.5) continue;
    ctx.fillRect(cx-bw/2, cz-bh/2, bw, bh);
  }

  // Bomb sites
  ctx.fillStyle = "rgba(255,80,0,0.35)";
  ctx.fillRect(65*scale+ox-10*scale, 75*scale+oy-10*scale, 20*scale, 20*scale);
  ctx.fillStyle = "rgba(60,80,255,0.35)";
  ctx.fillRect(-80*scale+ox-10*scale, 75*scale+oy-10*scale, 20*scale, 20*scale);

  // Site labels
  ctx.fillStyle = "rgba(255,120,0,0.9)"; ctx.font="bold 7px monospace"; ctx.textAlign="center";
  ctx.fillText("A", 65*scale+ox, 75*scale+oy+3);
  ctx.fillStyle = "rgba(100,120,255,0.9)";
  ctx.fillText("B",-80*scale+ox, 75*scale+oy+3);

  // Bots
  bots.forEach(bot => {
    if (!bot.alive) return;
    const bx = bot.position.x * scale + ox;
    const bz = bot.position.z * scale + oy;
    if (bx < 0||bx>W||bz<0||bz>H) return;
    ctx.fillStyle = bot.team==="terrorist" ? "#ffcc00" : "#5c9eff";
    ctx.beginPath(); ctx.arc(bx, bz, 3, 0, Math.PI*2); ctx.fill();
    // Direction tick
    const ang = Math.atan2(bot.targetPos.x-bot.position.x, bot.targetPos.z-bot.position.z);
    ctx.strokeStyle = bot.team==="terrorist"?"#ffcc00":"#5c9eff"; ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(bx, bz);
    ctx.lineTo(bx+Math.sin(ang)*5, bz+Math.cos(ang)*5);
    ctx.stroke();
  });

  // Player (always at calculated position)
  const px = camera.position.x * scale + ox;
  const pz = camera.position.z * scale + oy;

  // Player triangle (facing direction)
  ctx.save();
  ctx.translate(px, pz);
  ctx.rotate(yaw + Math.PI);
  ctx.fillStyle = "#00ff66";
  ctx.shadowColor = "#00ff66"; ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(0, -6); ctx.lineTo(-4, 4); ctx.lineTo(4, 4);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  // FOV cone
  ctx.save();
  ctx.translate(px, pz); ctx.rotate(yaw);
  ctx.strokeStyle = "rgba(0,255,100,0.25)"; ctx.lineWidth=1;
  const fovA = gameState.isADS ? 0.15 : 0.5;
  const fovR = 30;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.arc(0,0, fovR*scale*1.8, -Math.PI/2-fovA, -Math.PI/2+fovA);
  ctx.closePath(); ctx.stroke();
  ctx.restore();

  // Zoom label
  ctx.fillStyle="rgba(255,255,255,0.3)"; ctx.font="8px monospace"; ctx.textAlign="left";
  ctx.fillText(_mapZoomLabels[_mapZoomLevel], 5, H-5);
}

// ── Kill Feed ─────────────────────────────────────────────────────────────────
function addKillFeed(killer, victim, isPlayer, icon) {
  const feed = document.getElementById("kill-feed");
  const el = document.createElement("div");
  el.className = "kill-entry" + (isPlayer?" player-kill":"");
  el.innerHTML = `<span>${killer}</span><span class="kill-weapon-icon">${icon||"🔫"}</span><span>${victim}</span>`;
  feed.prepend(el);
  if(feed.children.length > 6) feed.lastChild.remove();
  setTimeout(() => el.remove(), 5500);
}

// ── Hit Marker ────────────────────────────────────────────────────────────────
function showHitMarker(isHead) {
  const m = document.getElementById("hit-marker");
  m.className = ""; void m.offsetWidth;
  m.className = "active" + (isHead?" headshot":"");
}

// ── Score Popup ───────────────────────────────────────────────────────────────
function spawnScorePopup(pos3d, text, color) {
  const div = document.createElement("div");
  div.style.cssText = `
    position:fixed; font-family:Orbitron,monospace; font-size:16px; font-weight:900;
    color:${color||"#fff"}; pointer-events:none; z-index:500;
    text-shadow:0 0 8px ${color||"#fff"};
    transition: opacity 1.2s ease, transform 1.2s ease;
  `;
  // Project 3D to 2D
  const projected = pos3d.clone().project(camera);
  const sx = (projected.x * 0.5 + 0.5) * window.innerWidth;
  const sy = (-projected.y* 0.5 + 0.5) * window.innerHeight;
  div.style.left = sx + "px"; div.style.top = sy + "px";
  div.textContent = text;
  document.body.appendChild(div);
  requestAnimationFrame(() => {
    div.style.opacity = "0";
    div.style.transform = "translateY(-40px)";
  });
  setTimeout(() => div.remove(), 1300);
}

// ── Announcement ──────────────────────────────────────────────────────────────
function showAnnouncement(text, duration) {
  const el = document.getElementById("announcement");
  el.textContent = text;
  el.classList.add("visible");
  setTimeout(() => el.classList.remove("visible"), duration || 2500);
}
