// ── Player Movement & Input ───────────────────────────────────────────────────
let moveForward = false, moveBackward = false;
let moveLeft    = false, moveRight    = false;
let isRunning   = false;
let isJumping   = false, canJump = true;

let yaw   = 0;
let pitch = 0;
let verticalVelocity = 0;

// DOM refs used elsewhere
let crosshairEl;

// ── Collision ─────────────────────────────────────────────────────────────────
function checkCollision(pos, radius) {
  radius = radius || PLAYER_RADIUS;
  for (const box of collisionBoxes) {
    const cx = Math.max(box.min.x, Math.min(pos.x, box.max.x));
    const cz = Math.max(box.min.z, Math.min(pos.z, box.max.z));
    const dx = pos.x - cx, dz = pos.z - cz;
    if (Math.sqrt(dx*dx+dz*dz) < radius && pos.y < box.max.y) return true;
  }
  return false;
}

// ── Keyboard ──────────────────────────────────────────────────────────────────
function setupKeyboard() {
  document.addEventListener("keydown", e => {
    if (!gameState.started) return;
    switch(e.code) {
      case "KeyW":      moveForward   = true; break;
      case "KeyS":      moveBackward  = true; break;
      case "KeyA":      moveLeft      = true; break;
      case "KeyD":      moveRight     = true; break;
      case "ShiftLeft": isRunning     = true; break;
      case "Space":
        if (canJump && !isJumping) {
          isJumping = true; canJump = false;
          verticalVelocity = JUMP_FORCE;
        }
        break;
      case "KeyC":
        gameState.isCrouched = !gameState.isCrouched;
        document.getElementById("crouch-indicator").classList.toggle("visible", gameState.isCrouched);
        break;
      case "KeyR":      reload(); break;
      case "KeyG":
        // Cycle grenade type
        const gkeys = Object.keys(GRENADES);
        activeGrenade = gkeys[(gkeys.indexOf(activeGrenade)+1) % gkeys.length];
        updateHUD(); break;
      case "KeyQ":      throwGrenade(); break;
      case "Digit1":    switchWeapon("ak47");  break;
      case "Digit2":    switchWeapon("m4a4");  break;
      case "Digit3":    switchWeapon("awp");   break;
      case "Digit4":    switchWeapon("glock"); break;
      case "Digit5":    switchWeapon("knife"); break;
      case "Escape":
        if (gameState.isADS) setADS(false);
        break;
    }
  });

  document.addEventListener("keyup", e => {
    switch(e.code) {
      case "KeyW":      moveForward   = false; break;
      case "KeyS":      moveBackward  = false; break;
      case "KeyA":      moveLeft      = false; break;
      case "KeyD":      moveRight     = false; break;
      case "ShiftLeft": isRunning     = false; break;
    }
  });
}

// ── Mouse ─────────────────────────────────────────────────────────────────────
function setupMouse() {
  document.addEventListener("mousemove", e => {
    if (!gameState.started || document.pointerLockElement !== renderer.domElement) return;
    yaw   -= e.movementX * MOUSE_SENS;
    pitch -= e.movementY * MOUSE_SENS;
    pitch  = Math.max(-Math.PI/2+0.01, Math.min(Math.PI/2-0.01, pitch));
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
  });

  document.addEventListener("mousedown", e => {
    if (!gameState.started) return;
    if (e.button === 0) { isShooting = true; shoot(); }
    if (e.button === 2) {
      e.preventDefault();
      setADS(!gameState.isADS);
    }
  });

  document.addEventListener("mouseup", e => {
    if (e.button === 0) { isShooting = false; }
  });

  document.addEventListener("contextmenu", e => e.preventDefault());

  renderer.domElement.addEventListener("click", () => {
    if (gameState.started && document.pointerLockElement !== renderer.domElement)
      renderer.domElement.requestPointerLock();
  });
}

// ── Mobile Controls Logic ─────────────────────────────────────────────────────
function setupMobileControls() {
  const joyContainer = document.getElementById('joystick-container');
  const joyKnob      = document.getElementById('joystick-knob');
  if(!joyContainer) return;

  const baseRect = joyContainer.getBoundingClientRect();
  const centerX = baseRect.width / 2;
  const centerY = baseRect.height / 2;
  const maxRadius = baseRect.width / 2 - 10;

  function moveJoystick(e) {
    const touch = e.touches[0];
    const dx = touch.clientX - (baseRect.left + centerX);
    const dy = touch.clientY - (baseRect.top + centerY);
    const dist = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx);
    
    const cappedDist = Math.min(dist, maxRadius);
    const knobX = Math.cos(angle) * cappedDist;
    const knobY = Math.sin(angle) * cappedDist;
    
    joyKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
    
    // Convert to move inputs
    const threshold = 15;
    if(dist > threshold) {
      moveForward  = -Math.sin(angle - Math.PI/2) > 0.4;
      moveBackward = -Math.sin(angle - Math.PI/2) < -0.4;
      moveRight    = Math.cos(angle - Math.PI/2) > 0.4;
      moveLeft     = Math.cos(angle - Math.PI/2) < -0.4;
    } else {
      moveForward = moveBackward = moveLeft = moveRight = false;
    }
  }

  joyContainer.addEventListener('touchstart', (e) => { e.preventDefault(); moveJoystick(e); }, {passive:false});
  joyContainer.addEventListener('touchmove',  (e) => { e.preventDefault(); moveJoystick(e); }, {passive:false});
  joyContainer.addEventListener('touchend',   () => {
    joyKnob.style.transform = `translate(0, 0)`;
    moveForward = moveBackward = moveLeft = moveRight = false;
  });

  // Mobile Buttons
  const btnShoot = document.getElementById('btn-shoot');
  const btnJump  = document.getElementById('btn-jump');
  const btnReload= document.getElementById('btn-reload');
  const btnNext  = document.getElementById('btn-next-weapon');

  btnShoot.addEventListener('touchstart', (e) => { e.preventDefault(); isShooting = true; shoot(); });
  btnShoot.addEventListener('touchend',   () => { isShooting = false; });
  btnJump.addEventListener('touchstart',  () => { if(canJump && !isJumping) { isJumping = true; canJump = false; verticalVelocity = JUMP_FORCE; } });
  btnReload.addEventListener('touchstart',reload);
  btnNext.addEventListener('touchstart',  () => {
    const types = Object.keys(WEAPONS).filter(k => k !== "knife");
    const nextIdx = (types.indexOf(currentWeapon) + 1) % types.length;
    switchWeapon(types[nextIdx]);
  });
  
  // Touch Camera Look (right side of screen)
  let lastTouchX = 0, lastTouchY = 0;
  document.addEventListener('touchstart', (e) => {
    if(e.touches[0].clientX > window.innerWidth / 2) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  }, {passive:true});
  
  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if(touch.clientX > window.innerWidth / 2) {
      const dx = touch.clientX - lastTouchX;
      const dy = touch.clientY - lastTouchY;
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
      
      yaw   -= dx * (MOUSE_SENS * 1.5);
      pitch -= dy * (MOUSE_SENS * 1.5);
      pitch  = Math.max(-Math.PI/2+0.01, Math.min(Math.PI/2-0.01, pitch));
      camera.rotation.y = yaw; camera.rotation.x = pitch;
    }
  }, {passive:true});
}

// ── Player Update (called each frame) ─────────────────────────────────────────
function updatePlayer(dt) {
  const crouch = gameState.isCrouched;
  const targetH = crouch ? PLAYER_CROUCH : PLAYER_HEIGHT;

  // Smooth height transition
  const curH = camera.position.y;
  camera.position.y += (targetH - curH) * 0.2;

  // Stamina
  if (isRunning && (moveForward||moveBackward||moveLeft||moveRight) && !crouch) {
    gameState.stamina = Math.max(0, gameState.stamina - gameState.staminaDrain);
  } else {
    gameState.stamina = Math.min(gameState.maxStamina, gameState.stamina + gameState.staminaRegen);
  }
  document.getElementById("stamina-bar").style.width = gameState.stamina + "%";

  // Speed selection
  let speed = WALK_SPEED;
  if (crouch)                speed = CROUCH_SPEED;
  else if (isRunning && gameState.stamina > 0) speed  = RUN_SPEED;

  const dir = new THREE.Vector3();
  if (moveForward)  dir.z -= 1;
  if (moveBackward) dir.z += 1;
  if (moveLeft)     dir.x -= 1;
  if (moveRight)    dir.x += 1;
  dir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0), yaw);

  // Gravity
  verticalVelocity -= GRAVITY;

  const newPos = camera.position.clone();
  newPos.x += dir.x * speed;
  newPos.z += dir.z * speed;
  newPos.y += verticalVelocity;

  // Ground check
  if (newPos.y <= targetH) {
    newPos.y = targetH;
    verticalVelocity = 0;
    isJumping = false; canJump = true;
  }

  // Collision resolution with sliding
  if (!checkCollision(newPos)) {
    camera.position.copy(newPos);
  } else {
    const sx = camera.position.clone();
    sx.x = newPos.x; sx.y = newPos.y;
    if (!checkCollision(sx)) { camera.position.x = sx.x; camera.position.y = newPos.y; }

    const sz = camera.position.clone();
    sz.z = newPos.z; sz.y = newPos.y;
    if (!checkCollision(sz)) { camera.position.z = sz.z; camera.position.y = newPos.y; }

    const sy = camera.position.clone(); sy.y = newPos.y;
    if (!checkCollision(sy)) { camera.position.y = newPos.y; }
    else if (verticalVelocity < 0) { verticalVelocity = 0; isJumping=false; canJump=true; }
  }

  // Map boundaries (soft clamp)
  const B = MAP_SIZE/2 - 2;
  camera.position.x = Math.max(-B, Math.min(B, camera.position.x));
  camera.position.z = Math.max(-B, Math.min(B, camera.position.z));

  // Weapon bob/sway
  const moving = moveForward||moveBackward||moveLeft||moveRight;
  const bobAmt = isRunning? 0.004 : moving? 0.002 : 0.0005;
  const t = performance.now() * (isRunning?0.006:0.003);
  weaponGroup.position.x = Math.sin(t) * bobAmt;
  weaponGroup.position.y = Math.cos(t*2) * bobAmt * 0.5;

  // Recoil recovery
  if (recoilAccY > 0) { recoilAccY = Math.max(0, recoilAccY - 0.002); }

  // Health regen
  const now = Date.now();
  if (now - gameState.lastDamageTime > gameState.regenDelay &&
      gameState.health < gameState.maxHealth && gameState.health > 0 &&
      now % gameState.regenInterval < 20) {
    gameState.health = Math.min(gameState.maxHealth, gameState.health + gameState.regenRate);
    updateHUD();
  }
}

// ── Damage ────────────────────────────────────────────────────────────────────
function takeDamage(amount) {
  if (!gameState.started) return;

  // Armor absorbs 60%
  if (gameState.armor > 0) {
    const absorbed = Math.min(gameState.armor, Math.floor(amount * 0.6));
    gameState.armor  -= absorbed;
    amount            = amount - absorbed;
  }

  gameState.health -= amount;
  gameState.lastDamageTime = Date.now();

  if (gameState.health <= 0) {
    gameState.health = 0;
    doGameOver();
  }

  updateHUD();
  const overlay = document.getElementById("damage-overlay");
  overlay.classList.add("active");
  setTimeout(() => overlay.classList.remove("active"), 160);
}
