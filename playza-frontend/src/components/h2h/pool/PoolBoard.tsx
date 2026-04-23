import React, { useRef, useEffect, useCallback, useState } from 'react'
import type { Ball, Vector2, GameState, ShotInput } from './game/pool/types'
import { PoolPhysics, TABLE_CONFIG, predictTrajectory, POCKET_POSITIONS } from './game/pool/physics'
import { loadPoolAssets, type PoolAssets } from './game/pool/assets'

interface PoolBoardProps {
  gameState: GameState
  isMyTurn: boolean
  onShot: (shot: ShotInput) => void
  onBallPlace?: (pos: Vector2) => void
}

// Authentic 8-ball pool colour palette
const BALL_COLORS: Record<number, { hex: string; r: number; g: number; b: number }> = {
  0:  { hex: '#F9F9F9', r: 252, g: 252, b: 252 },
  1:  { hex: '#F5C800', r: 245, g: 200, b:   0 },
  2:  { hex: '#0040CC', r:   0, g:  64, b: 204 },
  3:  { hex: '#CC1A00', r: 204, g:  26, b:   0 },
  4:  { hex: '#6600AA', r: 102, g:   0, b: 170 },
  5:  { hex: '#FF6600', r: 255, g: 102, b:   0 },
  6:  { hex: '#008800', r:   0, g: 136, b:   0 },
  7:  { hex: '#881100', r: 136, g:  17, b:   0 },
  8:  { hex: '#111111', r:  17, g:  17, b:  17 },
  9:  { hex: '#F5C800', r: 245, g: 200, b:   0 },
  10: { hex: '#0040CC', r:   0, g:  64, b: 204 },
  11: { hex: '#CC1A00', r: 204, g:  26, b:   0 },
  12: { hex: '#6600AA', r: 102, g:   0, b: 170 },
  13: { hex: '#FF6600', r: 255, g: 102, b:   0 },
  14: { hex: '#008800', r:   0, g: 136, b:   0 },
  15: { hex: '#881100', r: 136, g:  17, b:   0 },
}

// ── Premium Phong-shaded ball ─────────────────────────────────────────────────
// Light vector: upper-left at ~(-0.55, -0.75, 0.36) normalized
// Layers: diffuse base → stripe overlay → number dot → soft highlight → sharp specular → AO rim → drop shadow
function drawBall(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  r: number,
  ballNumber: number,
  scale: number,
  alpha = 1,
  overrideR?: number,         // for pocket shrink animation
  rotation?: Vector2,
) {
  const rr    = overrideR ?? r
  const entry = BALL_COLORS[ballNumber] ?? BALL_COLORS[1]
  const isStripe = ballNumber >= 9
  const isCue    = ballNumber === 0
  const { r: cr, g: cg, b: cb } = entry
  const rot = rotation ? (rotation.x * 0.45 + rotation.y * 0.25) : 0

  ctx.save()
  if (alpha < 1) ctx.globalAlpha = alpha
  ctx.translate(x, y)

  // ── Drop shadow (drawn before clip so it shows outside ball) ─────────────
  {
    const sg = ctx.createRadialGradient(rr * 0.14, rr * 0.92, 0, rr * 0.10, rr * 0.90, rr * 1.05)
    sg.addColorStop(0,   'rgba(0,0,0,0.55)')
    sg.addColorStop(0.4, 'rgba(0,0,0,0.30)')
    sg.addColorStop(1,   'rgba(0,0,0,0)')
    ctx.save()
    ctx.globalAlpha = (alpha < 1 ? alpha : 1) * 0.7
    ctx.beginPath()
    ctx.ellipse(rr * 0.14, rr * 0.90, rr * 0.92, rr * 0.26, 0, 0, Math.PI * 2)
    ctx.fillStyle = sg
    ctx.fill()
    ctx.restore()
  }

  // Clip to ball circle
  ctx.beginPath()
  ctx.arc(0, 0, rr, 0, Math.PI * 2)
  ctx.clip()

  // Keep lighting fixed; only rotate surface markings later (stripe + number).

  // ── 1. Diffuse base ───────────────────────────────────────────────────────
  const diffG = ctx.createRadialGradient(
    -rr * 0.42, -rr * 0.52, rr * 0.01,
     rr * 0.55,  rr * 0.65, rr * 1.55
  )
  if (isCue) {
    diffG.addColorStop(0,    '#FFFFFF')
    diffG.addColorStop(0.18, '#F5F5F5')
    diffG.addColorStop(0.60, '#C4C4C4')
    diffG.addColorStop(1,    '#505050')
  } else if (isStripe) {
    // White base for stripe balls
    diffG.addColorStop(0,    '#FFFFFF')
    diffG.addColorStop(0.22, '#F2F2F2')
    diffG.addColorStop(0.65, '#D4D4D4')
    diffG.addColorStop(1,    '#686868')
  } else {
    // Solid colour
    diffG.addColorStop(0,    `rgb(${Math.min(255,cr+130)},${Math.min(255,cg+130)},${Math.min(255,cb+130)})`)
    diffG.addColorStop(0.18, `rgb(${Math.min(255,cr+65)}, ${Math.min(255,cg+65)}, ${Math.min(255,cb+65)})`)
    diffG.addColorStop(0.55, `rgb(${cr},${cg},${cb})`)
    diffG.addColorStop(1,    `rgb(${Math.max(0,cr-130)},${Math.max(0,cg-130)},${Math.max(0,cb-130)})`)
  }
  ctx.fillStyle = diffG
  ctx.fillRect(-rr, -rr, rr * 2, rr * 2)

  // ── 2. Stripe band (balls 9-15) ───────────────────────────────────────────
  ctx.save()
  if (rot) ctx.rotate(rot)

  if (isStripe) {
    // Lit-side stripe (upper half)
    const stripeTop = ctx.createLinearGradient(0, -rr, 0, 0)
    stripeTop.addColorStop(0,    'rgba(0,0,0,0)')
    stripeTop.addColorStop(0.10, 'rgba(0,0,0,0)')
    stripeTop.addColorStop(0.25, `rgba(${Math.min(255,cr+80)},${Math.min(255,cg+80)},${Math.min(255,cb+80)},1)`)
    stripeTop.addColorStop(0.50, `rgba(${cr},${cg},${cb},1)`)
    stripeTop.addColorStop(1,    `rgba(${cr},${cg},${cb},1)`)
    ctx.fillStyle = stripeTop
    ctx.fillRect(-rr, -rr, rr * 2, rr * 2)

    // Shadow-side stripe (lower half)  
    const stripeBot = ctx.createLinearGradient(0, 0, 0, rr)
    stripeBot.addColorStop(0,    `rgba(${cr},${cg},${cb},1)`)
    stripeBot.addColorStop(0.50, `rgba(${Math.max(0,cr-70)},${Math.max(0,cg-70)},${Math.max(0,cb-70)},1)`)
    stripeBot.addColorStop(0.75, 'rgba(0,0,0,0)')
    stripeBot.addColorStop(1,    'rgba(0,0,0,0)')
    ctx.fillStyle = stripeBot
    ctx.fillRect(-rr, 0, rr * 2, rr)
  }

  // ── 3. Number dot ─────────────────────────────────────────────────────────
  if (!isCue) {
    const dotR = rr * 0.30
    // White circle with subtle shadow ring
    const dotG = ctx.createRadialGradient(-dotR * 0.12, -dotR * 0.18, 0, 0, 0, dotR * 1.08)
    dotG.addColorStop(0,   'rgba(255,255,255,1)')
    dotG.addColorStop(0.8, 'rgba(255,255,255,0.97)')
    dotG.addColorStop(1,   'rgba(220,220,220,0.90)')
    ctx.beginPath()
    ctx.arc(0, 0, dotR, 0, Math.PI * 2)
    ctx.fillStyle = dotG
    ctx.fill()

    // Number text
    const fontSize = Math.max(8, Math.round(dotR * 1.45 * scale))
    ctx.save()
    ctx.scale(1 / scale, 1 / scale)
    ctx.fillStyle = ballNumber === 8 ? '#EAEAEA' : '#111111'
    ctx.font = `900 ${fontSize}px 'Arial Narrow', Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(ballNumber), 0, fontSize * 0.05)
    ctx.restore()
  }

  ctx.restore()

  // ── 4. Soft diffuse highlight (wide glow) ────────────────────────────────
  const softHi = ctx.createRadialGradient(
    -rr * 0.26, -rr * 0.32, 0,
    -rr * 0.14, -rr * 0.18, rr * 0.82
  )
  softHi.addColorStop(0,   'rgba(255,255,255,0.70)')
  softHi.addColorStop(0.30,'rgba(255,255,255,0.28)')
  softHi.addColorStop(0.70,'rgba(255,255,255,0.06)')
  softHi.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = softHi
  ctx.fillRect(-rr, -rr, rr * 2, rr * 2)

  // ── 5. Sharp specular hotspot (mirror reflection of point light) ──────────
  const sharp = ctx.createRadialGradient(
    -rr * 0.38, -rr * 0.50, 0,
    -rr * 0.38, -rr * 0.50, rr * 0.18
  )
  sharp.addColorStop(0,   'rgba(255,255,255,1.0)')
  sharp.addColorStop(0.18,'rgba(255,255,255,0.95)')
  sharp.addColorStop(0.55,'rgba(255,255,255,0.45)')
  sharp.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = sharp
  ctx.fillRect(-rr, -rr, rr * 2, rr * 2)

  // ── 6. Ambient occlusion rim (darkens edges for depth/roundness) ──────────
  const ao = ctx.createRadialGradient(0, 0, rr * 0.58, 0, 0, rr)
  ao.addColorStop(0,    'rgba(0,0,0,0)')
  ao.addColorStop(0.52, 'rgba(0,0,0,0.04)')
  ao.addColorStop(0.78, 'rgba(0,0,0,0.38)')
  ao.addColorStop(1,    'rgba(0,0,0,0.90)')
  ctx.fillStyle = ao
  ctx.fillRect(-rr, -rr, rr * 2, rr * 2)

  ctx.restore()   // end clip + translate

  // ── 7. Crisp outer edge ───────────────────────────────────────────────────
  ctx.save()
  if (alpha < 1) ctx.globalAlpha = alpha
  ctx.beginPath()
  ctx.arc(x, y, rr, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(0,0,0,0.55)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()
}

// ── Table ────────────────────────────────────────────────────────────────────
function drawTable(ctx: CanvasRenderingContext2D, assets?: PoolAssets | null) {
  const W  = TABLE_CONFIG.width
  const H  = TABLE_CONFIG.height
  const C  = TABLE_CONFIG.cushionHeight
  const PR = TABLE_CONFIG.pocketRadius

  // Outer rail (mahogany wood)
  const railG = ctx.createLinearGradient(0, 0, 0, H)
  railG.addColorStop(0,   '#6B3D1E')
  railG.addColorStop(0.5, '#9B6035')
  railG.addColorStop(1,   '#4A2508')
  ctx.fillStyle = railG
  ctx.beginPath()
  ctx.roundRect(-C * 2.8, -C * 2.8, W + C * 5.6, H + C * 5.6, 28)
  ctx.fill()

  // Wood grain streaks
  ctx.save()
  ctx.strokeStyle = 'rgba(255,215,140,0.12)'
  ctx.lineWidth = 2.5
  for (let i = 0; i < 8; i++) {
    ctx.beginPath()
    ctx.moveTo(i * 95, -C * 2.8)
    ctx.lineTo(i * 95 + 70, H + C * 5.6)
    ctx.stroke()
  }
  ctx.restore()

  // Cushion felt strips
  const cushionColor = '#1A6B3A'
  ctx.fillStyle = cushionColor
  // Top halves
  ctx.fillRect(C + PR, 0, W / 2 - PR * 2 - C, C)
  ctx.fillRect(W / 2 + PR, 0, W / 2 - PR * 2 - C, C)
  // Bottom halves
  ctx.fillRect(C + PR, H - C, W / 2 - PR * 2 - C, C)
  ctx.fillRect(W / 2 + PR, H - C, W / 2 - PR * 2 - C, C)
  // Sides
  ctx.fillRect(0, C + PR, C, H - 2 * (C + PR))
  ctx.fillRect(W - C, C + PR, C, H - 2 * (C + PR))

  // Playing surface (felt)
  const feltG = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.72)
  feltG.addColorStop(0,   '#22B35D')
  feltG.addColorStop(0.5, '#1A8A48')
  feltG.addColorStop(1,   '#115830')
  ctx.fillStyle = feltG
  ctx.fillRect(C, C, W - C * 2, H - C * 2)

  // Texture overlays (from reference HTML5 version)
  const cloth = assets?.images.cloth
  if (cloth) {
    ctx.save()
    ctx.globalAlpha = 0.28
    ctx.drawImage(cloth, 0, 0, W, H)
    ctx.restore()
  }

  // Subtle felt texture lines
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'
  ctx.lineWidth = 1
  for (let y = C; y < H - C; y += 18) {
    ctx.beginPath()
    ctx.moveTo(C, y)
    ctx.lineTo(W - C, y)
    ctx.stroke()
  }
  ctx.restore()

  // Break line + centre spot
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 2
  ctx.setLineDash([10, 7])
  ctx.beginPath()
  ctx.moveTo(W / 4, C + 8)
  ctx.lineTo(W / 4, H - C - 8)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.beginPath()
  ctx.arc(W / 2, H / 2, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Cushion highlight strips
  ctx.save()
  ctx.strokeStyle = 'rgba(80,220,110,0.22)'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(C + PR, C); ctx.lineTo(W / 2 - PR, C); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W / 2 + PR, C); ctx.lineTo(W - C - PR, C); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(C + PR, H - C); ctx.lineTo(W / 2 - PR, H - C); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W / 2 + PR, H - C); ctx.lineTo(W - C - PR, H - C); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(C, C + PR); ctx.lineTo(C, H - C - PR); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W - C, C + PR); ctx.lineTo(W - C, H - C - PR); ctx.stroke()
  ctx.restore()

  // Procedural pocket fallback (when assets are missing)
  if (!assets?.images.tableTop) {
    POCKET_POSITIONS.forEach(({ x, y }) => {
      // Visual pocket centres slightly inset so the whole rim is visible on-canvas.
      const px = Math.min(Math.max(x, PR * 0.78), W - PR * 0.78)
      const py = Math.min(Math.max(y, PR * 0.78), H - PR * 0.78)
      // Leather outer lip
      ctx.save()
      ctx.beginPath()
      ctx.arc(px, py, PR + 10, 0, Math.PI * 2)
      ctx.fillStyle = '#5A2E10'
      ctx.fill()

      // Deep pocket gradient
      const pG = ctx.createRadialGradient(px, py, 0, px, py, PR + 6)
      pG.addColorStop(0, '#000000')
      pG.addColorStop(0.55, '#0B0B0B')
      pG.addColorStop(0.85, '#1A0E04')
      pG.addColorStop(1, '#2E1806')
      ctx.beginPath()
      ctx.arc(px, py, PR, 0, Math.PI * 2)
      ctx.fillStyle = pG
      ctx.fill()

      // Brass ring
      ctx.strokeStyle = 'rgba(200,145,50,0.80)'
      ctx.lineWidth = 4.5
      ctx.beginPath()
      ctx.arc(px, py, PR, 0, Math.PI * 2)
      ctx.stroke()

      // Inner glint
      ctx.strokeStyle = 'rgba(255,215,110,0.35)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(px - PR * 0.22, py - PR * 0.22, PR * 0.48, Math.PI * 1.0, Math.PI * 1.65)
      ctx.stroke()
      ctx.restore()
    })
  }

  // Pocket shadow overlay + table top skin (transparent cloth cut-out)
  const pockets = assets?.images.pockets
  if (pockets) {
    ctx.save()
    // Needs to be fully opaque so holes don't look "green" through transparency.
    ctx.globalAlpha = 1
    ctx.drawImage(pockets, 0, 0, W, H)
    ctx.restore()
  }

  const tableTop = assets?.images.tableTop
  if (tableTop) {
    ctx.save()
    ctx.globalAlpha = 1
    ctx.drawImage(tableTop, 0, 0, W, H)
    ctx.restore()
  }
}

// ── Cue Stick ─────────────────────────────────────────────────────────────────
function drawCueStick(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  angle: number,
  distFromBall: number,
  assets?: PoolAssets | null,
) {
  const dist = distFromBall

  const cue = assets?.images.cue
  const cueShadow = assets?.images.cueShadow
  if (cue) {
    const desiredLen = 1120
    const scale = desiredLen / cue.width
    const h = cue.height * scale
    const w = cue.width * scale

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle + Math.PI)

    if (cueShadow) {
      const sw = cueShadow.width * scale
      const sh = cueShadow.height * scale
      ctx.save()
      ctx.globalAlpha = 0.55
      ctx.drawImage(cueShadow, dist + 14, -sh / 2 + 8, sw, sh)
      ctx.restore()
    } else {
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.45)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 6
      ctx.shadowOffsetY = 6
      ctx.restore()
    }

    ctx.drawImage(cue, dist, -h / 2, w, h)
    ctx.restore()
    return
  }

  const stickLen = 900
  const tipW = 5
  const buttW = 20

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle + Math.PI)

  ctx.save()
  ctx.shadowColor   = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur    = 8
  ctx.shadowOffsetX = 4
  ctx.shadowOffsetY = 4

  // Ferrule / tip (white)
  ctx.beginPath()
  ctx.moveTo(dist,       -tipW / 2)
  ctx.lineTo(dist + 30,  -tipW * 0.75)
  ctx.lineTo(dist + 30,   tipW * 0.75)
  ctx.lineTo(dist,         tipW / 2)
  ctx.fillStyle = '#E8F0F8'
  ctx.fill()

  // Shaft (light maple)
  const shaftG = ctx.createLinearGradient(0, -tipW, 0, tipW)
  shaftG.addColorStop(0,   '#F8EDCF')
  shaftG.addColorStop(0.25,'#EDD89A')
  shaftG.addColorStop(0.70,'#C8A860')
  shaftG.addColorStop(1,   '#8B6918')
  ctx.beginPath()
  ctx.moveTo(dist + 30,   -tipW * 0.75)
  ctx.lineTo(dist + stickLen * 0.58, -tipW * 1.05)
  ctx.lineTo(dist + stickLen * 0.58,  tipW * 1.05)
  ctx.lineTo(dist + 30,    tipW * 0.75)
  ctx.fillStyle = shaftG
  ctx.fill()

  // Decorative wrap rings
  ctx.strokeStyle = 'rgba(100,50,10,0.75)'
  ctx.lineWidth = 2.5
  for (let i = 0; i < 4; i++) {
    const rx = dist + stickLen * 0.54 + i * 9
    const hw = tipW * (1.05 + i * 0.10)
    ctx.beginPath()
    ctx.moveTo(rx, -hw)
    ctx.lineTo(rx,  hw)
    ctx.stroke()
  }

  // Butt (dark rosewood)
  const buttG = ctx.createLinearGradient(0, -buttW / 2, 0, buttW / 2)
  buttG.addColorStop(0,   '#8B4010')
  buttG.addColorStop(0.4, '#A85228')
  buttG.addColorStop(1,   '#4A1E06')
  ctx.beginPath()
  ctx.moveTo(dist + stickLen * 0.58, -tipW * 1.05)
  ctx.lineTo(dist + stickLen,         -buttW / 2)
  ctx.lineTo(dist + stickLen,          buttW / 2)
  ctx.lineTo(dist + stickLen * 0.58,  tipW * 1.05)
  ctx.fillStyle = buttG
  ctx.fill()

  // Butt cap
  ctx.beginPath()
  ctx.arc(dist + stickLen, 0, buttW / 2, 0, Math.PI * 2)
  ctx.fillStyle = '#1A0800'
  ctx.fill()

  // Shaft highlight
  ctx.beginPath()
  ctx.moveTo(dist + 30,   -tipW * 0.45)
  ctx.lineTo(dist + stickLen * 0.55, -tipW * 0.65)
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.restore()
  ctx.restore()
}

// ── Pocket animation state ────────────────────────────────────────────────────
interface PocketingBall {
  id: string
  number: number
  startPos: Vector2
  pocketPos: Vector2
  progress: number   // 0 → 1
}

// ── Main Component ────────────────────────────────────────────────────────────
const PoolBoard: React.FC<PoolBoardProps> = ({ gameState, isMyTurn, onShot, onBallPlace }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scaleRef  = useRef(1)
  const dprRef    = useRef(1)
  const assetsRef = useRef<PoolAssets | null>(null)

  const [uiPower,    setUiPower]    = useState(0)
  const [isCharging, setIsCharging] = useState(false)

  const aimAngleRef       = useRef(0)
  const powerRef          = useRef(0)
  const isChargingRef     = useRef(false)
  const isSimulatingRef   = useRef(false)
  const isStrikingRef     = useRef(false)
  const strikeFrameRef    = useRef(0)
  const strikeInitOffRef  = useRef(0)
  const strikeOffsetRef   = useRef(0)
  const localBallsRef     = useRef<Ball[]>(
    gameState.balls.map(b => ({ ...b, rotation: b.rotation || { x: 0, y: 0 } }))
  )
  const physicsRef        = useRef<PoolPhysics | null>(null)
  const dragStartRef      = useRef<Vector2 | null>(null)
  const isDraggingBallRef = useRef(false)
  const isMyTurnRef       = useRef(isMyTurn)
  const onShotRef         = useRef(onShot)
  const onBallPlaceRef    = useRef(onBallPlace)
  const gameStateRef      = useRef(gameState)
  const frameIdRef        = useRef(0)
  const prevPocketedRef   = useRef<Set<string>>(new Set())
  const pocketingBallsRef = useRef<PocketingBall[]>([])
  const pendingAuthoritativeBallsRef = useRef<Ball[] | null>(null)
  const shotSentRef       = useRef(false)

  const STRIKE_FRAMES = 8
  const MAX_POWER = 5200

  useEffect(() => { isMyTurnRef.current   = isMyTurn   }, [isMyTurn])
  useEffect(() => { onShotRef.current     = onShot     }, [onShot])
  useEffect(() => { onBallPlaceRef.current = onBallPlace }, [onBallPlace])
  useEffect(() => { gameStateRef.current  = gameState  }, [gameState])

  useEffect(() => {
    const prevRot = new Map(localBallsRef.current.map((b) => [b.id, b.rotation]))
    const mapped = gameState.balls.map((b) => ({
      ...b,
      rotation: b.rotation || prevRot.get(b.id) || { x: 0, y: 0 },
      velocity: b.velocity || { x: 0, y: 0 },
    }))

    if (isSimulatingRef.current) {
      pendingAuthoritativeBallsRef.current = mapped
    } else {
      localBallsRef.current = mapped
    }
  }, [gameState.balls])

  const updateScale = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    if (!container) return
    const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1))
    dprRef.current = dpr
    const newScale = container.clientWidth / TABLE_CONFIG.width
    scaleRef.current = newScale
    canvas.width  = Math.round(TABLE_CONFIG.width  * newScale * dpr)
    canvas.height = Math.round(TABLE_CONFIG.height * newScale * dpr)
  }, [])

  useEffect(() => {
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [updateScale])

  useEffect(() => {
    let cancelled = false
    loadPoolAssets()
      .then((assets) => {
        if (cancelled) return
        assetsRef.current = assets
      })
      .catch(() => {
        // Assets are cosmetic; fallback rendering covers failures.
      })

    return () => {
      cancelled = true
    }
  }, [])

  // ── Draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const scale = scaleRef.current
    const dpr = dprRef.current

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0)

    drawTable(ctx, assetsRef.current)

    const balls      = localBallsRef.current
    const myTurn     = isMyTurnRef.current
    const simulating = isSimulatingRef.current
    const striking   = isStrikingRef.current
    const angle      = aimAngleRef.current
    const power      = powerRef.current
    const charging   = isChargingRef.current

    // Live balls
    balls.forEach(ball => {
      if (ball.pocketed) return
      // Motion glow on fast-moving balls
      const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2)
      if (speed > 4 && ball.id !== 'cue') {
        ctx.save()
        const glowAlpha = Math.min(0.75, (speed - 4) / 18)
        ctx.beginPath()
        ctx.arc(ball.position.x, ball.position.y, TABLE_CONFIG.ballRadius + 8, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 220, 60, ${glowAlpha})`
        ctx.lineWidth = 5
        ctx.stroke()
        ctx.restore()
      }
      drawBall(
        ctx,
        ball.position.x,
        ball.position.y,
        TABLE_CONFIG.ballRadius,
        ball.number,
        scale,
        1,
        undefined,
        ball.rotation,
      )
    })

    // Pocket-entry animations (balls shrinking into pocket)
    pocketingBallsRef.current.forEach(pb => {
      const t   = Math.min(pb.progress, 1)
      const eT  = t * t                          // ease-in: accelerate into pocket
      const pos = {
        x: pb.startPos.x + (pb.pocketPos.x - pb.startPos.x) * eT,
        y: pb.startPos.y + (pb.pocketPos.y - pb.startPos.y) * eT,
      }
      const rr    = TABLE_CONFIG.ballRadius * (1 - eT * 0.85)
      const alpha = 1 - eT * 0.9
      if (rr > 1) {
        drawBall(ctx, pos.x, pos.y, TABLE_CONFIG.ballRadius, pb.number, scale, alpha, rr, undefined)
      }
    })

    // Aiming visuals
    if (myTurn && !simulating) {
      const cueBall = balls.find(b => b.id === 'cue')
      if (cueBall && !cueBall.pocketed) {
        // Trajectory
        const traj = predictTrajectory(cueBall, balls, angle, Math.max(power, 100))
        ctx.save()
        const dotted = assetsRef.current?.images.dottedLine
        if (dotted) {
          const pat = ctx.createPattern(dotted, 'repeat')
          if (pat && 'setTransform' in pat) {
            ;(pat as CanvasPattern).setTransform(new DOMMatrix([0.55, 0, 0, 0.55, 0, 0]))
          }
          ctx.strokeStyle = pat || 'rgba(255,255,255,0.32)'
          ctx.lineWidth = 4
          ctx.globalAlpha = 0.7
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.32)'
          ctx.lineWidth = 1.5
          ctx.setLineDash([7, 6])
        }
        ctx.beginPath()
        ctx.moveTo(cueBall.position.x, cueBall.position.y)
        traj.points.forEach((p: Vector2) => ctx.lineTo(p.x, p.y))
        ctx.stroke()
        ctx.setLineDash([])

        if (traj.hitPoint) {
          // Ghost ball at collision point
          ctx.save()
          ctx.globalAlpha = 0.35
          drawBall(ctx, traj.hitPoint.x, traj.hitPoint.y, TABLE_CONFIG.ballRadius, 0, scale, 1, undefined, undefined)
          ctx.restore()

          if (traj.targetPath) {
            ctx.strokeStyle = '#facc15'
            ctx.lineWidth = 2
            ctx.setLineDash([4, 6])
            ctx.beginPath()
            ctx.moveTo(traj.targetPath[0].x, traj.targetPath[0].y)
            ctx.lineTo(traj.targetPath[1].x, traj.targetPath[1].y)
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
        ctx.restore()

        // Power arc
        if (charging && power > 0) {
          const sweep = Math.PI * 2 * Math.min(1, power / MAX_POWER)
          ctx.save()
          const danger = MAX_POWER * 0.72
          const warn = MAX_POWER * 0.42
          ctx.strokeStyle = power > danger ? '#ef4444' : power > warn ? '#f59e0b' : '#22c55e'
          ctx.lineWidth = 4
          ctx.globalAlpha = 0.85
          ctx.beginPath()
          ctx.arc(
            cueBall.position.x, cueBall.position.y,
            TABLE_CONFIG.ballRadius + 12,
            -Math.PI / 2, -Math.PI / 2 + sweep
          )
          ctx.stroke()
          ctx.restore()
        }

        // Cue during aiming (stick pulled back by power)
        if (!striking) {
          const pullback = TABLE_CONFIG.ballRadius + 8 + (charging ? Math.min(power / 22, 90) : 0)
          drawCueStick(ctx, cueBall.position.x, cueBall.position.y, angle, pullback, assetsRef.current)
        }
      }
    }

    // Cue during strike animation
    if (striking) {
      const cueBall = balls.find(b => b.id === 'cue')
      if (cueBall) {
        drawCueStick(
          ctx,
          cueBall.position.x,
          cueBall.position.y,
          angle,
          TABLE_CONFIG.ballRadius + 6 + strikeOffsetRef.current,
          assetsRef.current,
        )
      }
    }

    ctx.restore()
  }, [])

  // ── Game loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      // ─ Strike animation (fixed-frame, ease-in toward ball) ─
      if (isStrikingRef.current) {
        strikeFrameRef.current++
        const progress = strikeFrameRef.current / STRIKE_FRAMES
        const eased    = progress * progress   // quadratic ease-in: accelerates into hit
        strikeOffsetRef.current = strikeInitOffRef.current * (1 - eased)

        if (strikeFrameRef.current >= STRIKE_FRAMES) {
          strikeOffsetRef.current  = 0
          isStrikingRef.current    = false
          strikeFrameRef.current   = 0
          // Launch physics
          const physics = new PoolPhysics(localBallsRef.current)
          physics.applyShot(aimAngleRef.current, powerRef.current)
          physicsRef.current    = physics
          isSimulatingRef.current = true

          // Reset per-shot animation state
          prevPocketedRef.current = new Set(localBallsRef.current.filter((b) => b.pocketed).map((b) => b.id))
          pocketingBallsRef.current = []

          // Fire server shot immediately (authoritative update may arrive while we animate locally).
          if (!shotSentRef.current) {
            shotSentRef.current = true
            onShotRef.current({ angle: aimAngleRef.current, power: powerRef.current, spin: { x: 0, y: 0 } })

            const cueHit = assetsRef.current?.audio.cueHit
            if (cueHit) {
              try {
                cueHit.currentTime = 0
                void cueHit.play()
              } catch {
                // ignore autoplay restrictions
              }
            }
          }
        }
      }

      // ─ Physics (adaptive substeps for stability) ─
      if (isSimulatingRef.current && physicsRef.current) {
        const ballsNow = physicsRef.current.getBalls()
        const maxSpeed = ballsNow.reduce((m, b) => {
          const s = Math.hypot(b.velocity.x, b.velocity.y)
          return s > m ? s : m
        }, 0)
        const substeps = Math.min(10, Math.max(4, Math.ceil(maxSpeed / 6)))
        const dt = 1 / substeps

        let moving = false
        for (let i = 0; i < substeps; i++) {
          if (physicsRef.current.step(dt)) moving = true
        }
        const nextBalls = physicsRef.current.getBalls()

        // Detect freshly-pocketed balls → start pocket animation
        nextBalls.forEach(ball => {
          if (ball.pocketed && !prevPocketedRef.current.has(ball.id)) {
            prevPocketedRef.current.add(ball.id)

            const pocketHit = assetsRef.current?.audio.pocketHit
            if (pocketHit) {
              try {
                pocketHit.currentTime = 0
                void pocketHit.play()
              } catch {
                // ignore autoplay restrictions
              }
            }

            // Find nearest pocket
            const pocket = POCKET_POSITIONS.reduce((best, p) => {
              const d  = Math.hypot(ball.position.x - p.x,   ball.position.y - p.y)
              const bd = Math.hypot(ball.position.x - best.x, ball.position.y - best.y)
              return d < bd ? p : best
            }, POCKET_POSITIONS[0])
            pocketingBallsRef.current.push({
              id: ball.id, number: ball.number,
              startPos:  { ...ball.position },
              pocketPos: { ...pocket },
              progress: 0,
            })
          }
        })

        localBallsRef.current = [...nextBalls]

        // Advance pocket animations
        pocketingBallsRef.current = pocketingBallsRef.current
          .map(pb => ({ ...pb, progress: pb.progress + 0.065 }))
          .filter(pb => pb.progress < 1)

        if (!moving) {
          isSimulatingRef.current = false

          // Snap to authoritative state if it arrived during animation.
          if (pendingAuthoritativeBallsRef.current) {
            localBallsRef.current = pendingAuthoritativeBallsRef.current
            pendingAuthoritativeBallsRef.current = null
          }
        }
      }

      draw()
      frameIdRef.current = requestAnimationFrame(loop)
    }

    frameIdRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameIdRef.current)
  }, [draw])

  // ── Pointer helpers ───────────────────────────────────────────────────────
  const getTablePos = (e: React.PointerEvent): Vector2 => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left)  / scaleRef.current,
      y: (e.clientY - rect.top)   / scaleRef.current,
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isMyTurnRef.current || isSimulatingRef.current || isStrikingRef.current) return
    const pos = getTablePos(e)

    if (gameStateRef.current.ballInHand) {
      const cue = localBallsRef.current.find(b => b.id === 'cue')
      if (cue) {
        const d = Math.hypot(pos.x - cue.position.x, pos.y - cue.position.y)
        if (d < TABLE_CONFIG.ballRadius * 3.5) {
          isDraggingBallRef.current = true
          return
        }
      }
    }

    dragStartRef.current = pos
    isChargingRef.current = true
    shotSentRef.current = false
    setIsCharging(true)
    powerRef.current = 0
    setUiPower(0)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isMyTurnRef.current || isSimulatingRef.current || isStrikingRef.current) return
    const pos = getTablePos(e)

    if (isDraggingBallRef.current) {
      const C     = TABLE_CONFIG.cushionHeight + TABLE_CONFIG.ballRadius
      const clampX = Math.max(C, Math.min(TABLE_CONFIG.width  - C, pos.x))
      const clampY = Math.max(C, Math.min(TABLE_CONFIG.height - C, pos.y))
      localBallsRef.current = localBallsRef.current.map(b =>
        b.id === 'cue' ? { ...b, position: { x: clampX, y: clampY }, pocketed: false } : b
      )
      return
    }

    const cue = localBallsRef.current.find(b => b.id === 'cue')
    if (cue) {
      aimAngleRef.current = Math.atan2(pos.y - cue.position.y, pos.x - cue.position.x)
    }

    if (isChargingRef.current && dragStartRef.current) {
      const dist    = Math.hypot(pos.x - dragStartRef.current.x, pos.y - dragStartRef.current.y)
      // Non-linear power curve: more realistic control on small drags,
      // and stronger full-power shots (less "sluggish" feel).
      const t = Math.min(dist / 220, 1)
      const curved = Math.pow(t, 1.12)
      const newPower = curved * MAX_POWER
      powerRef.current = newPower
      setUiPower(newPower)
    }
  }

  const handlePointerUp = () => {
    if (isDraggingBallRef.current) {
      isDraggingBallRef.current = false
      const cue = localBallsRef.current.find(b => b.id === 'cue')
      if (cue && onBallPlaceRef.current) onBallPlaceRef.current(cue.position)
      return
    }

    if (isChargingRef.current && powerRef.current > 60) {
      // Begin fixed-frame strike animation
      const initOffset = TABLE_CONFIG.ballRadius + Math.min(powerRef.current / 20, 90)
      strikeInitOffRef.current = initOffset
      strikeOffsetRef.current  = initOffset
      strikeFrameRef.current   = 0
      isStrikingRef.current    = true
    }

    isChargingRef.current = false
    setIsCharging(false)
    setUiPower(0)
    dragStartRef.current = null
  }

  return (
    <div
      className="w-full rounded-2xl overflow-hidden select-none touch-none relative"
      style={{
        background: 'linear-gradient(135deg, #3D1E08 0%, #6B3A18 40%, #3D1E08 100%)',
        padding: '20px',
        borderRadius: '24px',
        boxShadow: '0 0 0 4px rgba(140,80,20,0.4), 0 0 60px rgba(0,0,0,0.8), 0 20px 60px rgba(0,0,0,0.6)',
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-auto block cursor-crosshair rounded-xl"
        style={{ touchAction: 'none', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }}
      />

      {/* Power bar */}
      <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-5 h-48 bg-black/65 rounded-full overflow-hidden border border-white/15 backdrop-blur-sm transition-opacity duration-100 ${isCharging ? 'opacity-100' : 'opacity-0'}`}>
        <div
          className="absolute bottom-0 w-full"
          style={{
            height: `${Math.min(1, uiPower / MAX_POWER) * 100}%`,
            background: uiPower > MAX_POWER * 0.72
              ? 'linear-gradient(to top, #dc2626, #f97316)'
              : uiPower > MAX_POWER * 0.42
              ? 'linear-gradient(to top, #f59e0b, #22c55e)'
              : 'linear-gradient(to top, #22c55e, #86efac)',
            transition: 'height 60ms linear, background 120ms',
          }}
        />
      </div>

      {!isMyTurn && (
        <div className="absolute top-4 right-4 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white/50 text-xs font-semibold tracking-wider">
          Opponent's Turn
        </div>
      )}
    </div>
  )
}

export default PoolBoard
