// Shared photoreal-ish dartboard + dart renderer (Canvas 2D).
// Used by the H2H arena (React) and inlined into the Solo Earn Darts game.

export interface Ring { innerBull: number; outerBull: number; tripleIn: number; tripleOut: number; doubleIn: number; doubleOut: number }
export const SEGMENT_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
export type Tint = "me" | "opp";

const TAU = Math.PI * 2;
const rad = (deg: number) => (deg * Math.PI) / 180;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

// ── The board, pre-rendered once at device resolution ─────────────────────
export function buildBoardImage(R: number, ring: Ring, dpr: number): HTMLCanvasElement {
  const half = Math.ceil(R * 1.42);
  const size = half * 2;
  const cv = document.createElement("canvas");
  cv.width = Math.ceil(size * dpr); cv.height = Math.ceil(size * dpr);
  const b = cv.getContext("2d", { willReadFrequently: true })!;
  b.scale(dpr, dpr);
  const c = half;
  const u = R / 170;

  // soft contact shadow on the wall
  b.save();
  b.shadowColor = "rgba(0,0,0,.65)"; b.shadowBlur = 26 * u; b.shadowOffsetY = 12 * u; b.shadowOffsetX = 5 * u;
  b.beginPath(); b.arc(c, c, R * 1.2, 0, TAU); b.fillStyle = "#08080b"; b.fill();
  b.restore();

  // black catch-ring (rubberised surround)
  const surround = b.createRadialGradient(c - R * 0.5, c - R * 0.55, R * 0.2, c, c, R * 1.25);
  surround.addColorStop(0, "#2b2d36"); surround.addColorStop(0.55, "#14151a"); surround.addColorStop(1, "#050507");
  b.beginPath(); b.arc(c, c, R * 1.2, 0, TAU); b.fillStyle = surround; b.fill();
  // bevelled outer edge
  const edge = b.createLinearGradient(c - R, c - R, c + R, c + R);
  edge.addColorStop(0, "rgba(255,255,255,.55)"); edge.addColorStop(0.5, "rgba(255,255,255,.04)"); edge.addColorStop(1, "rgba(0,0,0,.7)");
  b.lineWidth = 2.2 * u; b.strokeStyle = edge; b.beginPath(); b.arc(c, c, R * 1.195, 0, TAU); b.stroke();

  // segments (sisal colours)
  const wedge = (r0: number, r1: number, a0: number, a1: number, fill: string) => {
    b.beginPath(); b.arc(c, c, R * r1, a0, a1); b.arc(c, c, R * r0, a1, a0, true); b.closePath(); b.fillStyle = fill; b.fill();
  };
  for (let i = 0; i < 20; i++) {
    const a0 = rad(-90 - 9 + i * 18), a1 = a0 + rad(18), dark = i % 2 === 0;
    const base = dark ? "#16161a" : "#e9d9ac";
    const ringCol = dark ? "#c41e2f" : "#12844a";
    wedge(ring.outerBull, ring.tripleIn, a0, a1, base);
    wedge(ring.tripleIn, ring.tripleOut, a0, a1, ringCol);
    wedge(ring.tripleOut, ring.doubleIn, a0, a1, base);
    wedge(ring.doubleIn, ring.doubleOut, a0, a1, ringCol);
  }
  b.beginPath(); b.arc(c, c, R * ring.outerBull, 0, TAU); b.fillStyle = "#12844a"; b.fill();
  b.beginPath(); b.arc(c, c, R * ring.innerBull, 0, TAU); b.fillStyle = "#c41e2f"; b.fill();

  // sisal grain — per-pixel noise inside the playing surface
  const w = cv.width, h = cv.height;
  const img = b.getImageData(0, 0, w, h);
  const d = img.data;
  const rnd = rng(1234567);
  const cc = c * dpr, rr = R * ring.doubleOut * dpr;
  const rr2 = rr * rr;
  for (let y = 0; y < h; y++) {
    const dy = y - cc;
    for (let x = 0; x < w; x++) {
      const dx = x - cc;
      if (dx * dx + dy * dy > rr2) continue;
      const i = (y * w + x) * 4;
      const lum = (d[i] + d[i + 1] + d[i + 2]) / 765;
      const n = (rnd() - 0.5) * (22 + lum * 26);
      d[i] = Math.max(0, Math.min(255, d[i] + n));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
    }
  }
  b.putImageData(img, 0, 0);

  // sisal fibres
  b.save();
  b.beginPath(); b.arc(c, c, R * ring.doubleOut, 0, TAU); b.clip();
  const fr = rng(98765);
  const fibres = Math.floor(R * R * 0.22);
  b.lineWidth = Math.max(0.5, 0.55 * u);
  for (let i = 0; i < fibres; i++) {
    const ang = fr() * TAU, rd = Math.sqrt(fr()) * R;
    const x = c + Math.cos(ang) * rd, y = c + Math.sin(ang) * rd;
    const dir = ang + (fr() - 0.5) * 1.2, len = (1.5 + fr() * 4) * u;
    b.strokeStyle = fr() > 0.5 ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.10)";
    b.beginPath(); b.moveTo(x, y); b.lineTo(x + Math.cos(dir) * len, y + Math.sin(dir) * len); b.stroke();
  }
  b.restore();

  // raised metal wires (shadow, body, highlight)
  const wireW = Math.max(0.9, R / 215);
  const wire = (path: () => void) => {
    b.save(); b.translate(0.9 * u, 1.3 * u); b.lineWidth = wireW * 1.9; b.strokeStyle = "rgba(0,0,0,.5)"; path(); b.stroke(); b.restore();
    b.lineWidth = wireW; b.strokeStyle = "#b9bfca"; path(); b.stroke();
    b.save(); b.translate(-0.35 * u, -0.45 * u); b.lineWidth = wireW * 0.45; b.strokeStyle = "rgba(255,255,255,.85)"; path(); b.stroke(); b.restore();
  };
  [ring.innerBull, ring.outerBull, ring.tripleIn, ring.tripleOut, ring.doubleIn, ring.doubleOut].forEach((r) =>
    wire(() => { b.beginPath(); b.arc(c, c, R * r, 0, TAU); })
  );
  for (let i = 0; i < 20; i++) {
    const a = rad(-90 - 9 + i * 18);
    wire(() => { b.beginPath(); b.moveTo(c + Math.cos(a) * R * ring.outerBull, c + Math.sin(a) * R * ring.outerBull); b.lineTo(c + Math.cos(a) * R * ring.doubleOut, c + Math.sin(a) * R * ring.doubleOut); });
  }

  // glossy bull
  const gloss = b.createRadialGradient(c - R * 0.012, c - R * 0.016, 0, c, c, R * ring.innerBull);
  gloss.addColorStop(0, "rgba(255,255,255,.55)"); gloss.addColorStop(0.5, "rgba(255,255,255,.08)"); gloss.addColorStop(1, "rgba(0,0,0,.25)");
  b.beginPath(); b.arc(c, c, R * ring.innerBull * 0.98, 0, TAU); b.fillStyle = gloss; b.fill();

  // numbers on the black ring
  b.textAlign = "center"; b.textBaseline = "middle";
  b.font = `800 ${Math.max(11, R * 0.105)}px "Arial Narrow", "Helvetica Neue", Arial, system-ui, sans-serif`;
  for (let i = 0; i < 20; i++) {
    const am = rad(-90 + i * 18);
    const x = c + Math.cos(am) * R * 1.1, y = c + Math.sin(am) * R * 1.1;
    b.fillStyle = "rgba(0,0,0,.8)"; b.fillText(String(SEGMENT_ORDER[i]), x + 0.8 * u, y + 1.1 * u);
    b.fillStyle = "#f4f5f8"; b.fillText(String(SEGMENT_ORDER[i]), x, y);
  }

  // room lighting: bright upper-left, falling off to the lower-right
  b.save();
  b.beginPath(); b.arc(c, c, R * 1.2, 0, TAU); b.clip();
  const light = b.createRadialGradient(c - R * 0.45, c - R * 0.55, R * 0.1, c - R * 0.2, c - R * 0.25, R * 1.5);
  light.addColorStop(0, "rgba(255,255,255,.20)"); light.addColorStop(0.5, "rgba(255,255,255,0)"); light.addColorStop(1, "rgba(0,0,0,.34)");
  b.fillStyle = light; b.fillRect(0, 0, size, size);
  b.restore();

  return cv;
}

export function boardHalf(img: HTMLCanvasElement, dpr: number) { return img.width / dpr / 2; }

// ── Wall / spotlight behind the board ─────────────────────────────────────
export function drawWall(ctx: CanvasRenderingContext2D, W: number, H: number, cx: number, cy: number, R: number) {
  const g = ctx.createRadialGradient(cx, cy - R * 0.1, R * 0.3, cx, cy, Math.max(W, H) * 0.95);
  g.addColorStop(0, "#2d3548"); g.addColorStop(0.45, "#171c2b"); g.addColorStop(1, "#070912");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,.025)"; ctx.lineWidth = 1;
  for (let x = W / 6; x < W; x += W / 6) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  const fl = ctx.createLinearGradient(0, H * 0.62, 0, H);
  fl.addColorStop(0, "rgba(0,0,0,0)"); fl.addColorStop(1, "rgba(0,0,0,.45)");
  ctx.fillStyle = fl; ctx.fillRect(0, H * 0.62, W, H * 0.38);
}

// ── A shaded, metallic dart seen from BEHIND, the way you hold it ──────────
// Anchor (x,y) is the TIP; the dart points up/away from the camera, so the
// body narrows toward the tip (perspective) and the four flights fan out
// around the rear of the shaft.
function cyl(ctx: CanvasRenderingContext2D, x0: number, x1: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}

export function drawDart3D(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, angle: number, R: number, tint: Tint = "me", shadow = true) {
  const u = (R / 170) * s;
  const dark = tint === "me" ? "#a30f33" : "#0f48b0";
  const mid = tint === "me" ? "#e11d48" : "#1d7be8";
  const light = tint === "me" ? "#ff6b92" : "#58c8ff";
  const persp = (d: number) => 0.52 + 0.48 * (d / 150); // things nearer the camera look bigger

  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle);
  ctx.lineCap = "round"; ctx.lineJoin = "round";

  if (shadow) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.30)";
    ctx.beginPath(); ctx.ellipse(10 * u, 150 * u, 30 * u, 9 * u, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }

  // far fins first (they sit behind the shaft)
  const FIN_L = 31 * u, RX = 0.82, RY = 0.5, FY = 126 * u;
  const fins = [225, 315, 135, 45].map((deg, k) => ({ deg, k }));
  const drawFin = (deg: number, k: number) => {
    const th = rad(deg), fx = Math.cos(th) * FIN_L * RX, fy = FY + Math.sin(th) * FIN_L * RY;
    const nx = -Math.sin(th), ny = Math.cos(th); // perpendicular
    const wmid = FIN_L * 0.30;
    const mx = Math.cos(th) * FIN_L * RX * 0.45, my = FY + Math.sin(th) * FIN_L * RY * 0.45;
    ctx.beginPath();
    ctx.moveTo(0, FY);
    ctx.lineTo(mx + nx * wmid * RX, my + ny * wmid * RY);
    ctx.lineTo(fx, fy);
    ctx.lineTo(mx - nx * wmid * RX, my - ny * wmid * RY);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, FY, fx, fy);
    const farSide = Math.sin(th) < 0;
    g.addColorStop(0, farSide ? dark : mid); g.addColorStop(1, k % 2 ? light : (farSide ? mid : light));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 0.8 * u; ctx.stroke();
    ctx.strokeStyle = "rgba(0,0,0,.22)"; ctx.lineWidth = 0.7 * u;
    ctx.beginPath(); ctx.moveTo(0, FY); ctx.lineTo(fx * 0.92, FY + (fy - FY) * 0.92); ctx.stroke();
  };
  fins.slice(0, 2).forEach((f) => drawFin(f.deg, f.k));

  // shaft
  const sw = (d: number) => 3.7 * u * persp(d);
  ctx.beginPath(); ctx.moveTo(-sw(100) / 2, 96 * u); ctx.lineTo(sw(126) / 2 * -1, FY); ctx.lineTo(sw(126) / 2, FY); ctx.lineTo(sw(100) / 2, 96 * u); ctx.closePath();
  ctx.fillStyle = cyl(ctx, -3 * u, 3 * u, [[0, dark], [0.45, light], [1, dark]]); ctx.fill();

  // barrel — widens toward the camera
  const bw = (d: number) => (4.4 + 5.4 * (d / 100)) * u * persp(d);
  const barrel = () => {
    ctx.beginPath();
    ctx.moveTo(-bw(26) / 2, 26 * u);
    ctx.quadraticCurveTo(-bw(60) / 2 - 0.6 * u, 62 * u, -bw(100) / 2, 100 * u);
    ctx.lineTo(bw(100) / 2, 100 * u);
    ctx.quadraticCurveTo(bw(60) / 2 + 0.6 * u, 62 * u, bw(26) / 2, 26 * u);
    ctx.closePath();
  };
  barrel();
  ctx.fillStyle = cyl(ctx, -7 * u, 7 * u, [[0, "#12151b"], [0.22, "#59627a"], [0.45, "#eef1f8"], [0.6, "#98a2b8"], [0.85, "#262c38"], [1, "#101319"]]); ctx.fill();
  ctx.save(); barrel(); ctx.clip();
  for (let yy = 30; yy < 100; yy += 3.6) {
    const half = bw(yy) / 2 + 2 * u, bow = 1.3 * u * persp(yy);
    ctx.strokeStyle = "rgba(0,0,0,.55)"; ctx.lineWidth = 0.7 * u;
    ctx.beginPath(); ctx.moveTo(-half, yy * u); ctx.quadraticCurveTo(0, yy * u + bow * 2, half, yy * u); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.lineWidth = 0.5 * u;
    ctx.beginPath(); ctx.moveTo(-half, (yy + 1.5) * u); ctx.quadraticCurveTo(0, (yy + 1.5) * u + bow * 2, half, (yy + 1.5) * u); ctx.stroke();
  }
  [46, 84].forEach((yy) => {
    const half = bw(yy) / 2 + 1 * u;
    ctx.fillStyle = cyl(ctx, -half, half, [[0, "#6b4a12"], [0.45, "#ffe6a0"], [1, "#6b4a12"]]);
    ctx.fillRect(-half, yy * u, half * 2, 2.8 * u);
  });
  ctx.restore();

  // steel point (small, far away)
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-1.2 * u, 27 * u); ctx.lineTo(1.2 * u, 27 * u); ctx.closePath();
  ctx.fillStyle = cyl(ctx, -1.4 * u, 1.4 * u, [[0, "#6c7488"], [0.45, "#ffffff"], [1, "#68708a"]]); ctx.fill();

  // near fins on top of the shaft
  fins.slice(2).forEach((f) => drawFin(f.deg, f.k));
  // rear cap
  ctx.fillStyle = cyl(ctx, -3 * u, 3 * u, [[0, "#555d72"], [0.5, "#f2f5fb"], [1, "#4a5266"]]);
  ctx.beginPath(); ctx.arc(0, FY, 3 * u, 0, TAU); ctx.fill();
  ctx.restore();
}

// A dart stuck in the board, seen from the thrower's side: tip in the hole, barrel angled toward you.
export function drawStuckDart(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, alpha: number, tint: Tint) {
  const u = R / 170;
  ctx.save(); ctx.globalAlpha = alpha;
  const hole = ctx.createRadialGradient(x, y, 0, x, y, 4.5 * u);
  hole.addColorStop(0, "rgba(0,0,0,.9)"); hole.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = hole; ctx.beginPath(); ctx.arc(x, y, 4.5 * u, 0, TAU); ctx.fill();
  // cast shadow of the barrel on the sisal
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5);
  ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.beginPath(); ctx.ellipse(3 * u, 20 * u, 3.2 * u, 22 * u, 0, 0, TAU); ctx.fill(); ctx.restore();
  drawDart3D(ctx, x, y, 0.42, 0, R, tint, false);
  ctx.restore();
}

// ── Which region a landing point is in, as a highlightable path ───────────
export function drawHitHighlight(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, ring: Ring, dx: number, dy: number, age: number) {
  const dist = Math.hypot(dx, dy);
  if (dist > ring.doubleOut || age >= 1) return;
  const a = (1 - age);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = `rgba(255,236,160,${0.42 * a * (0.6 + 0.4 * Math.sin(age * 22))})`;
  ctx.strokeStyle = `rgba(255,220,120,${0.9 * a})`; ctx.lineWidth = 2;
  ctx.beginPath();
  if (dist <= ring.innerBull) { ctx.arc(cx, cy, R * ring.innerBull, 0, TAU); }
  else if (dist <= ring.outerBull) { ctx.arc(cx, cy, R * ring.outerBull, 0, TAU); ctx.arc(cx, cy, R * ring.innerBull, 0, TAU, true); }
  else {
    let ang = (Math.atan2(dx, -dy) * 180) / Math.PI; if (ang < 0) ang += 360;
    const idx = Math.floor(((ang + 9) % 360) / 18);
    const a0 = rad(-90 - 9 + idx * 18), a1 = a0 + rad(18);
    const [r0, r1] = dist < ring.tripleIn ? [ring.outerBull, ring.tripleIn] : dist <= ring.tripleOut ? [ring.tripleIn, ring.tripleOut] : dist < ring.doubleIn ? [ring.tripleOut, ring.doubleIn] : [ring.doubleIn, ring.doubleOut];
    ctx.arc(cx, cy, R * r1, a0, a1); ctx.arc(cx, cy, R * r0, a1, a0, true); ctx.closePath();
  }
  ctx.fill("evenodd"); ctx.stroke();
  ctx.restore();
}

// Impact ripple + sparks
export function drawImpact(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, age: number, big: boolean) {
  if (age >= 1) return;
  const u = R / 170, a = 1 - age;
  ctx.save();
  ctx.strokeStyle = `rgba(255,255,255,${0.75 * a})`; ctx.lineWidth = 2 * u;
  ctx.beginPath(); ctx.arc(x, y, (5 + age * 26) * u, 0, TAU); ctx.stroke();
  if (big) {
    ctx.strokeStyle = `rgba(255,214,102,${a})`; ctx.lineWidth = 2 * u;
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * TAU + 0.3, r0 = (8 + age * 20) * u, r1 = (14 + age * 38) * u;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(ang) * r0, y + Math.sin(ang) * r0); ctx.lineTo(x + Math.cos(ang) * r1, y + Math.sin(ang) * r1); ctx.stroke();
    }
  }
  ctx.restore();
}