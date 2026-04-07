import React, { useRef, useEffect, useCallback, useState } from 'react'
import type { Ball, Vector2, GameState, ShotInput } from './game/pool/types'
import { PoolPhysics, TABLE_CONFIG, predictTrajectory } from './game/pool/physics'

interface PoolBoardProps {
  gameState: GameState
  isMyTurn: boolean
  onShot: (shot: ShotInput) => void
  onBallPlace?: (pos: Vector2) => void
}

// Ball colors — authentic pool ball palette
const BALL_COLORS: Record<number, { hex: string; r: number; g: number; b: number }> = {
  0:  { hex: '#F9F9F9', r: 249, g: 249, b: 249 }, // cue - pearl white
  1:  { hex: '#F5C800', r: 245, g: 200, b:   0 }, // 1 - yellow
  2:  { hex: '#0040CC', r:   0, g:  64, b: 204 }, // 2 - blue
  3:  { hex: '#CC1A00', r: 204, g:  26, b:   0 }, // 3 - red
  4:  { hex: '#6600AA', r: 102, g:   0, b: 170 }, // 4 - purple
  5:  { hex: '#FF6600', r: 255, g: 102, b:   0 }, // 5 - orange
  6:  { hex: '#116600', r:  17, g: 102, b:   0 }, // 6 - green
  7:  { hex: '#881100', r: 136, g:  17, b:   0 }, // 7 - maroon
  8:  { hex: '#101010', r:  16, g:  16, b:  16 }, // 8 - black
  9:  { hex: '#F5C800', r: 245, g: 200, b:   0 }, // 9 - yellow stripe
  10: { hex: '#0040CC', r:   0, g:  64, b: 204 }, // 10 - blue stripe
  11: { hex: '#CC1A00', r: 204, g:  26, b:   0 }, // 11 - red stripe
  12: { hex: '#6600AA', r: 102, g:   0, b: 170 }, // 12 - purple stripe
  13: { hex: '#FF6600', r: 255, g: 102, b:   0 }, // 13 - orange stripe
  14: { hex: '#116600', r:  17, g: 102, b:   0 }, // 14 - green stripe
  15: { hex: '#881100', r: 136, g:  17, b:   0 }, // 15 - maroon stripe
}

// ─── Premium 3D Ball Renderer (Phong sphere shading) ─────────────────────
//
// Light vector (upper-left, slight tilt): L = (-0.55, -0.75, 0.36) — normalized
// View vector: V = (0, 0, 1) — straight down (camera above table)
//
// For any point on the sphere, the normal N = (nx, ny, nz).
// We approximate on canvas with radial gradients that mimic:
//   Diffuse  = max(dot(N,L), 0) * albedo
//   Specular = pow(max(dot(R,V), 0), 80) * white
//   Ambient  = 0.1 * albedo
//
function drawBallOnCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  ballNumber: number,
  scale: number
) {
  const entry   = BALL_COLORS[ballNumber] ?? BALL_COLORS[1]
  const isStripe = ballNumber >= 9
  const isCue   = ballNumber === 0

  ctx.save()
  ctx.translate(x, y)

  // —— Clipping region: everything stays inside the ball circle ——
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.clip()

  // ─ 1. Ambient + diffuse base (dark at bottom-right, bright toward light)
  //    Light from upper-left: brightest point at (-0.55r, -0.75r)
  const diffuseGrad = ctx.createRadialGradient(
    -r * 0.55, -r * 0.65, r * 0.05,
     r * 0.45,  r * 0.55, r * 1.6
  )

  if (isCue) {
    diffuseGrad.addColorStop(0,   '#FFFFFF')
    diffuseGrad.addColorStop(0.3, '#F0F0F0')
    diffuseGrad.addColorStop(0.7, '#C8C8C8')
    diffuseGrad.addColorStop(1,   '#787878')
  } else {
    // Lighten the color toward the light, darken toward shadow
    const { r: cr, g: cg, b: cb } = entry
    diffuseGrad.addColorStop(0,   `rgb(${Math.min(255,cr+100)},${Math.min(255,cg+100)},${Math.min(255,cb+100)})`)
    diffuseGrad.addColorStop(0.35,`rgb(${Math.min(255,cr+40)},${Math.min(255,cg+40)},${Math.min(255,cb+40)})`)
    diffuseGrad.addColorStop(0.65,`rgb(${cr},${cg},${cb})`)
    diffuseGrad.addColorStop(1,   `rgb(${Math.max(0,cr-90)},${Math.max(0,cg-90)},${Math.max(0,cb-90)})`)
  }
  ctx.fillStyle = diffuseGrad
  ctx.fillRect(-r, -r, r * 2, r * 2)

  // ─ 2. Stripe band for balls 9–15 ─
  if (isStripe) {
    const { r: cr, g: cg, b: cb } = entry
    // White base underneath stripe is already drawn above; now paint strip
    const bandGrad = ctx.createLinearGradient(0, -r, 0, r)

    // Curve simulation: band is narrow in the center of the ball (equatorial)
    // and fades at outer latitudes to simulate the sphere curvature
    bandGrad.addColorStop(0,    'rgba(255,255,255,0)')
    bandGrad.addColorStop(0.15, 'rgba(255,255,255,0)')
    bandGrad.addColorStop(0.28, `rgba(${cr},${cg},${cb},0.95)`)
    bandGrad.addColorStop(0.5,  `rgba(${Math.max(0,cr-40)},${Math.max(0,cg-40)},${Math.max(0,cb-40)},1)`)
    bandGrad.addColorStop(0.72, `rgba(${cr},${cg},${cb},0.95)`)
    bandGrad.addColorStop(0.85, 'rgba(255,255,255,0)')
    bandGrad.addColorStop(1,    'rgba(255,255,255,0)')
    ctx.fillStyle = bandGrad
    ctx.fillRect(-r, -r, r * 2, r * 2)
  }

  // ─ 3. Number label (white circle with ball number) ─
  if (!isCue) {
    const dotR = r * 0.35
    // White circle
    ctx.beginPath()
    ctx.arc(0, 0, dotR, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.96)'
    ctx.fill()
    // Number — scale from table-space back to screen pixels
    const fontSize = Math.max(8, Math.round(dotR * 1.3 * scale))
    ctx.save()
    ctx.scale(1 / scale, 1 / scale)
    ctx.fillStyle = ballNumber === 8 ? '#EEEEEE' : '#111111'
    ctx.font = `900 ${fontSize}px 'Helvetica Neue', Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(ballNumber), 0, fontSize * 0.04)
    ctx.restore()
  }

  // ─ 4. Large soft specular glow (diffuse highlight zone) ─
  const softHi = ctx.createRadialGradient(
    -r * 0.30, -r * 0.38, 0,
    -r * 0.20, -r * 0.25, r * 0.9
  )
  softHi.addColorStop(0,   'rgba(255,255,255,0.55)')
  softHi.addColorStop(0.4, 'rgba(255,255,255,0.18)')
  softHi.addColorStop(0.8, 'rgba(255,255,255,0.03)')
  softHi.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = softHi
  ctx.fillRect(-r, -r, r * 2, r * 2)

  // ─ 5. Sharp specular hotspot (mirror reflection of light source) ─
  const sharpHi = ctx.createRadialGradient(
    -r * 0.42, -r * 0.52, 0,
    -r * 0.42, -r * 0.52, r * 0.26
  )
  sharpHi.addColorStop(0,   'rgba(255,255,255,1.0)')
  sharpHi.addColorStop(0.25,'rgba(255,255,255,0.80)')
  sharpHi.addColorStop(0.6, 'rgba(255,255,255,0.2)')
  sharpHi.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = sharpHi
  ctx.fillRect(-r, -r, r * 2, r * 2)

  // ─ 6. Ambient occlusion rim (darkens edges for depth) ─
  const aoGrad = ctx.createRadialGradient(0, 0, r * 0.55, 0, 0, r)
  aoGrad.addColorStop(0,    'rgba(0,0,0,0)')
  aoGrad.addColorStop(0.65, 'rgba(0,0,0,0.08)')
  aoGrad.addColorStop(1,    'rgba(0,0,0,0.72)')
  ctx.fillStyle = aoGrad
  ctx.fillRect(-r, -r, r * 2, r * 2)

  // Restore clip
  ctx.restore()

  // ─ 7. Thin sharp edge outline (drawn outside clip) ─
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()

  // ─ 8. Shadow ellipse beneath ball (separated from clip) ─
  ctx.save()
  ctx.globalAlpha = 0.32
  ctx.beginPath()
  ctx.ellipse(x + r * 0.12, y + r * 0.85, r * 0.88, r * 0.28, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.filter = 'blur(6px)'
  ctx.fill()
  ctx.filter = 'none'
  ctx.restore()
}


// ─── Draw the table (cloth + rails + pockets) ───────────────────────────────
function drawTable(ctx: CanvasRenderingContext2D) {
  const W = TABLE_CONFIG.width
  const H = TABLE_CONFIG.height
  const C = TABLE_CONFIG.cushionHeight
  const PR = TABLE_CONFIG.pocketRadius

  // Rail outer frame
  ctx.save()
  const railGrad = ctx.createLinearGradient(0, 0, 0, H)
  railGrad.addColorStop(0, '#5C3310')
  railGrad.addColorStop(0.5, '#8B5E3C')
  railGrad.addColorStop(1, '#4A2B0A')
  ctx.fillStyle = railGrad
  ctx.beginPath()
  ctx.roundRect(-C * 2.5, -C * 2.5, W + C * 5, H + C * 5, 24)
  ctx.fill()

  // Rail wood grain highlight
  ctx.strokeStyle = 'rgba(255,220,140,0.15)'
  ctx.lineWidth = 3
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    ctx.moveTo(i * 80, -C * 2.5)
    ctx.lineTo(i * 80 + 60, H + C * 5)
    ctx.stroke()
  }
  ctx.restore()

  // Cushion felt areas (darker green strips along edges)
  ctx.save()
  const cushionColor = '#1A6B3A'
  // Top
  ctx.fillStyle = cushionColor
  ctx.fillRect(C + PR, 0, W / 2 - PR * 2 - C, C)
  ctx.fillRect(W / 2 + PR, 0, W / 2 - PR * 2 - C, C)
  // Bottom
  ctx.fillRect(C + PR, H - C, W / 2 - PR * 2 - C, C)
  ctx.fillRect(W / 2 + PR, H - C, W / 2 - PR * 2 - C, C)
  // Left
  ctx.fillRect(0, C + PR, C, H - 2 * (C + PR))
  // Right
  ctx.fillRect(W - C, C + PR, C, H - 2 * (C + PR))
  ctx.restore()

  // Playing surface (felt)
  ctx.save()
  const feltGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7)
  feltGrad.addColorStop(0, '#1DA65A')
  feltGrad.addColorStop(0.6, '#187A42')
  feltGrad.addColorStop(1, '#105430')
  ctx.fillStyle = feltGrad
  ctx.fillRect(C, C, W - C * 2, H - C * 2)
  ctx.restore()

  // Center spot
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.beginPath()
  ctx.arc(W / 2, H / 2, 6, 0, Math.PI * 2)
  ctx.fill()
  // Break line
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 6])
  ctx.beginPath()
  ctx.moveTo(W / 4, C + 10)
  ctx.lineTo(W / 4, H - C - 10)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()

  // Cushion highlights (shiny edge strips)
  ctx.save()
  ctx.strokeStyle = 'rgba(100,220,120,0.25)'
  ctx.lineWidth = 2
  // Top
  ctx.beginPath(); ctx.moveTo(C + PR, C); ctx.lineTo(W / 2 - PR, C); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W / 2 + PR, C); ctx.lineTo(W - C - PR, C); ctx.stroke()
  // Bottom
  ctx.beginPath(); ctx.moveTo(C + PR, H - C); ctx.lineTo(W / 2 - PR, H - C); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W / 2 + PR, H - C); ctx.lineTo(W - C - PR, H - C); ctx.stroke()
  // Sides
  ctx.beginPath(); ctx.moveTo(C, C + PR); ctx.lineTo(C, H - C - PR); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W - C, C + PR); ctx.lineTo(W - C, H - C - PR); ctx.stroke()
  ctx.restore()

  // ─ Pockets (positioned at cushion boundary so balls can actually reach them) ─
  // Corner pockets are offset inward by their radius so they overlap the playfield
  const pocketPositions = [
    { x: PR * 0.7,      y: PR * 0.7 },      // top-left
    { x: W / 2,         y: -PR * 0.1 },     // top-middle
    { x: W - PR * 0.7,  y: PR * 0.7 },      // top-right
    { x: PR * 0.7,      y: H - PR * 0.7 },  // bottom-left
    { x: W / 2,         y: H + PR * 0.1 },  // bottom-middle
    { x: W - PR * 0.7,  y: H - PR * 0.7 },  // bottom-right
  ]
  pocketPositions.forEach(({ x, y }) => {
    ctx.save()
    // Outer leather lip
    ctx.beginPath()
    ctx.arc(x, y, PR + 8, 0, Math.PI * 2)
    ctx.fillStyle = '#6B3A1F'
    ctx.fill()

    // Pocket depth gradient
    const pGrad = ctx.createRadialGradient(x, y, 0, x, y, PR + 4)
    pGrad.addColorStop(0, '#000000')
    pGrad.addColorStop(0.5, '#0D0D0D')
    pGrad.addColorStop(0.8, '#1A1008')
    pGrad.addColorStop(1, '#2E1A06')
    ctx.beginPath()
    ctx.arc(x, y, PR, 0, Math.PI * 2)
    ctx.fillStyle = pGrad
    ctx.fill()

    // Brass rim ring
    ctx.strokeStyle = 'rgba(210,150,60,0.75)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(x, y, PR, 0, Math.PI * 2)
    ctx.stroke()

    // Inner gleam glint
    ctx.strokeStyle = 'rgba(255,220,120,0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x - PR * 0.2, y - PR * 0.2, PR * 0.5, Math.PI, Math.PI * 1.6)
    ctx.stroke()
    ctx.restore()
  })
}

// ─── Draw cue stick ──────────────────────────────────────────────────────────
function drawCueStick(
  ctx: CanvasRenderingContext2D,
  cueBallX: number,
  cueBallY: number,
  angle: number,
  distanceFromBall: number
) {
  const stickLength = 650
  const tipWidth = 5
  const buttWidth = 18

  ctx.save()
  ctx.translate(cueBallX, cueBallY)
  ctx.rotate(angle + Math.PI)

  const dist = distanceFromBall

  // Cue shadow
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.4)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetX = 3
  ctx.shadowOffsetY = 3

  // Tip (light, narrow end)
  const tipGrad = ctx.createLinearGradient(dist, -tipWidth / 2, dist + 80, tipWidth / 2)
  tipGrad.addColorStop(0, '#D4E8F5')
  tipGrad.addColorStop(1, '#8BAFC8')
  ctx.beginPath()
  ctx.moveTo(dist, -tipWidth / 2)
  ctx.lineTo(dist + 80, -tipWidth * 0.8)
  ctx.lineTo(dist + 80, tipWidth * 0.8)
  ctx.lineTo(dist, tipWidth / 2)
  ctx.fillStyle = tipGrad
  ctx.fill()

  // Shaft (light maple wood)
  const shaftGrad = ctx.createLinearGradient(0, -tipWidth * 0.8, 0, tipWidth * 0.8)
  shaftGrad.addColorStop(0, '#F5E8C8')
  shaftGrad.addColorStop(0.3, '#EDD89A')
  shaftGrad.addColorStop(0.7, '#C8A860')
  shaftGrad.addColorStop(1, '#8B6914')

  ctx.beginPath()
  ctx.moveTo(dist + 80, -tipWidth * 0.8)
  ctx.lineTo(dist + stickLength * 0.6, -tipWidth)
  ctx.lineTo(dist + stickLength * 0.6, tipWidth)
  ctx.lineTo(dist + 80, tipWidth * 0.8)
  ctx.fillStyle = shaftGrad
  ctx.fill()

  // Wrap rings (decorative)
  ctx.strokeStyle = 'rgba(120,60,10,0.7)'
  ctx.lineWidth = 2
  for (let i = 0; i < 3; i++) {
    const rx = dist + stickLength * 0.55 + i * 8
    ctx.beginPath()
    ctx.moveTo(rx, -tipWidth * (1 + i * 0.12))
    ctx.lineTo(rx, tipWidth * (1 + i * 0.12))
    ctx.stroke()
  }

  // Butt section (darker wood)
  const buttGrad = ctx.createLinearGradient(0, -buttWidth / 2, 0, buttWidth / 2)
  buttGrad.addColorStop(0, '#8B4513')
  buttGrad.addColorStop(0.4, '#A0522D')
  buttGrad.addColorStop(1, '#5C2D0A')
  ctx.beginPath()
  ctx.moveTo(dist + stickLength * 0.6, -tipWidth)
  ctx.lineTo(dist + stickLength, -buttWidth / 2)
  ctx.lineTo(dist + stickLength, buttWidth / 2)
  ctx.lineTo(dist + stickLength * 0.6, tipWidth)
  ctx.fillStyle = buttGrad
  ctx.fill()

  // Butt cap
  ctx.beginPath()
  ctx.arc(dist + stickLength, 0, buttWidth / 2, 0, Math.PI * 2)
  ctx.fillStyle = '#2A1200'
  ctx.fill()

  // Shaft highlight
  ctx.beginPath()
  ctx.moveTo(dist + 80, -tipWidth * 0.5)
  ctx.lineTo(dist + stickLength * 0.58, -tipWidth * 0.6)
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.restore() // shadow
  ctx.restore() // translate/rotate
}

// ─── Main Component ───────────────────────────────────────────────────────────
const PoolBoard: React.FC<PoolBoardProps> = ({ gameState, isMyTurn, onShot, onBallPlace }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scaleRef = useRef(1)

  // UI state (causes re-renders for visual updates)
  const [uiPower, setUiPower] = useState(0)
  const [isCharging, setIsCharging] = useState(false)

  // Use refs for everything that affects the game loop to avoid stale closures
  const aimAngleRef = useRef(0)
  const powerRef = useRef(0)
  const isChargingRef = useRef(false)
  const isSimulatingRef = useRef(false)
  const isStrikingRef = useRef(false)
  const strikeOffsetRef = useRef(0)
  const localBallsRef = useRef<Ball[]>(
    gameState.balls.map(b => ({ ...b, rotation: b.rotation || { x: 0, y: 0 } }))
  )
  const physicsRef = useRef<PoolPhysics | null>(null)
  const dragStartRef = useRef<Vector2 | null>(null)
  const isDraggingBallRef = useRef(false)
  const isMyTurnRef = useRef(isMyTurn)
  const onShotRef = useRef(onShot)
  const onBallPlaceRef = useRef(onBallPlace)
  const gameStateRef = useRef(gameState)
  const frameIdRef = useRef(0)

  // Keep refs in sync with props
  useEffect(() => { isMyTurnRef.current = isMyTurn }, [isMyTurn])
  useEffect(() => { onShotRef.current = onShot }, [onShot])
  useEffect(() => { onBallPlaceRef.current = onBallPlace }, [onBallPlace])
  useEffect(() => { gameStateRef.current = gameState }, [gameState])

  // Sync balls from server when not simulating
  useEffect(() => {
    if (!isSimulatingRef.current) {
      localBallsRef.current = gameState.balls.map(b => ({
        ...b,
        rotation: b.rotation || { x: 0, y: 0 },
        velocity: b.velocity || { x: 0, y: 0 },
      }))
    }
  }, [gameState.balls])

  // ── Scale canvas ─────────────────────────────────────────────────────────
  const updateScale = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    if (!container) return
    const containerWidth = container.clientWidth
    const newScale = containerWidth / TABLE_CONFIG.width
    scaleRef.current = newScale
    canvas.width  = TABLE_CONFIG.width  * newScale
    canvas.height = TABLE_CONFIG.height * newScale
  }, [])

  useEffect(() => {
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [updateScale])

  // ── Main render ───────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const scale = scaleRef.current

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(scale, scale)

    // Table
    drawTable(ctx)

    // Draw all balls, flashing recently-hit balls
    const balls = localBallsRef.current
    balls.forEach(ball => {
      if (ball.pocketed) return
      const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2)
      const isMovingFast = speed > 8

      // Flash effect: if a non-cue ball is moving fast (just got hit), draw a glow ring
      if (isMovingFast && ball.id !== 'cue') {
        ctx.save()
        ctx.beginPath()
        ctx.arc(ball.position.x, ball.position.y, TABLE_CONFIG.ballRadius + 6, 0, Math.PI * 2)
        const flashAlpha = Math.min(1, (speed - 8) / 60)
        ctx.strokeStyle = `rgba(255, 220, 80, ${flashAlpha * 0.85})`
        ctx.lineWidth = 4
        ctx.stroke()
        ctx.restore()
      }

      drawBallOnCanvas(ctx, ball.position.x, ball.position.y, TABLE_CONFIG.ballRadius, ball.number, scale)
    })

    // Aiming / cue visuals (only when it's my turn & not simulating)
    const myTurn = isMyTurnRef.current
    const simulating = isSimulatingRef.current
    const striking = isStrikingRef.current
    const angle = aimAngleRef.current
    const power = powerRef.current
    const charging = isChargingRef.current
    const offset = strikeOffsetRef.current

    if (myTurn && !simulating) {
      const cueBall = balls.find(b => b.id === 'cue')
      if (cueBall && !cueBall.pocketed) {
        // Trajectory line
        const traj = predictTrajectory(cueBall, balls, angle, Math.max(power, 100))
        ctx.save()
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([6, 6])
        ctx.beginPath()
        ctx.moveTo(cueBall.position.x, cueBall.position.y)
        traj.points.forEach((p: Vector2) => ctx.lineTo(p.x, p.y))
        ctx.stroke()
        ctx.setLineDash([])

        // Ghost ball at hit point
        if (traj.hitPoint) {
          ctx.save()
          ctx.globalAlpha = 0.38
          drawBallOnCanvas(ctx, traj.hitPoint.x, traj.hitPoint.y, TABLE_CONFIG.ballRadius, 0, scale)
          ctx.restore()

          // Target ball direction
          if (traj.targetPath) {
            ctx.strokeStyle = '#fbbf24'
            ctx.lineWidth = 2
            ctx.setLineDash([3, 5])
            ctx.beginPath()
            ctx.moveTo(traj.targetPath[0].x, traj.targetPath[0].y)
            ctx.lineTo(traj.targetPath[1].x, traj.targetPath[1].y)
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
        ctx.restore()

        // Power indicator arc (around cue ball)
        if (charging && power > 0) {
          const maxArc = Math.PI * 2 * (power / 3000)
          ctx.save()
          ctx.strokeStyle = power > 2000 ? '#ef4444' : power > 1000 ? '#f59e0b' : '#22c55e'
          ctx.lineWidth = 3
          ctx.globalAlpha = 0.8
          ctx.beginPath()
          ctx.arc(cueBall.position.x, cueBall.position.y, TABLE_CONFIG.ballRadius + 10, -Math.PI / 2, -Math.PI / 2 + maxArc)
          ctx.stroke()
          ctx.restore()
        }

        // Cue stick (during aiming)
        if (!striking) {
          const stickDist = TABLE_CONFIG.ballRadius + 8 + (charging ? power / 50 : 0)
          drawCueStick(ctx, cueBall.position.x, cueBall.position.y, angle, stickDist)
        }
      }
    }

    // Cue stick during strike
    if (striking) {
      const cueBall = balls.find(b => b.id === 'cue')
      if (cueBall) {
        const stickDist = TABLE_CONFIG.ballRadius + 8 + offset
        drawCueStick(ctx, cueBall.position.x, cueBall.position.y, angle, stickDist)
      }
    }

    ctx.restore()
  }, [])

  // ── Game loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      // Strike animation
      if (isStrikingRef.current) {
        const speed = Math.max(25, powerRef.current / 35)
        strikeOffsetRef.current -= speed
        if (strikeOffsetRef.current <= 0) {
          strikeOffsetRef.current = 0
          isStrikingRef.current = false
          // Start physics simulation
          const physics = new PoolPhysics(localBallsRef.current)
          physics.applyShot(aimAngleRef.current, powerRef.current)
          physicsRef.current = physics
          isSimulatingRef.current = true
        }
      }

      // Physics — 3 substeps per frame, matching friction constant 0.978^3
      if (isSimulatingRef.current && physicsRef.current) {
        let stillMoving = false
        for (let i = 0; i < 3; i++) {
          if (physicsRef.current.step()) stillMoving = true
        }
        localBallsRef.current = [...physicsRef.current.getBalls()]

        if (!stillMoving) {
          isSimulatingRef.current = false
          const savedAngle = aimAngleRef.current
          const savedPower = powerRef.current
          onShotRef.current({ angle: savedAngle, power: savedPower, spin: { x: 0, y: 0 } })
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
      x: (e.clientX - rect.left) / scaleRef.current,
      y: (e.clientY - rect.top)  / scaleRef.current,
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isMyTurnRef.current || isSimulatingRef.current || isStrikingRef.current) return
    const pos = getTablePos(e)

    // Ball-in-hand dragging
    if (gameStateRef.current.ballInHand) {
      const cueBall = localBallsRef.current.find(b => b.id === 'cue')
      if (cueBall) {
        const dist = Math.hypot(pos.x - cueBall.position.x, pos.y - cueBall.position.y)
        if (dist < TABLE_CONFIG.ballRadius * 3) {
          isDraggingBallRef.current = true
          return
        }
      }
    }

    dragStartRef.current = pos
    isChargingRef.current = true
    setIsCharging(true)
    powerRef.current = 0
    setUiPower(0)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isMyTurnRef.current || isSimulatingRef.current || isStrikingRef.current) return
    const pos = getTablePos(e)

    // Dragging cue ball
    if (isDraggingBallRef.current) {
      const C = TABLE_CONFIG.cushionHeight + TABLE_CONFIG.ballRadius
      const clampedX = Math.max(C, Math.min(TABLE_CONFIG.width  - C, pos.x))
      const clampedY = Math.max(C, Math.min(TABLE_CONFIG.height - C, pos.y))
      localBallsRef.current = localBallsRef.current.map(b =>
        b.id === 'cue' ? { ...b, position: { x: clampedX, y: clampedY }, pocketed: false } : b
      )
      return
    }

    // Update aim angle toward cue ball
    const cueBall = localBallsRef.current.find(b => b.id === 'cue')
    if (cueBall) {
      aimAngleRef.current = Math.atan2(pos.y - cueBall.position.y, pos.x - cueBall.position.x)
    }

    // Update power based on drag distance from drag start
    if (isChargingRef.current && dragStartRef.current) {
      const dist = Math.hypot(pos.x - dragStartRef.current.x, pos.y - dragStartRef.current.y)
      const newPower = Math.min(dist * 12, 3000)
      powerRef.current = newPower
      setUiPower(newPower)
    }
  }

  const handlePointerUp = () => {
    if (isDraggingBallRef.current) {
      isDraggingBallRef.current = false
      const cueBall = localBallsRef.current.find(b => b.id === 'cue')
      if (cueBall && onBallPlaceRef.current) {
        onBallPlaceRef.current(cueBall.position)
      }
      return
    }

    if (isChargingRef.current && powerRef.current > 50) {
      // Kick off strike animation
      isStrikingRef.current = true
      strikeOffsetRef.current = Math.min(powerRef.current / 40, 60)
    }

    isChargingRef.current = false
    setIsCharging(false)
    setUiPower(0)
    dragStartRef.current = null
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.7)] relative select-none touch-none"
      style={{ background: '#4A2B0A', padding: '18px', borderRadius: '20px' }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-auto block cursor-crosshair rounded-xl"
        style={{ touchAction: 'none' }}
      />

      {/* Power bar */}
      <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-5 h-44 bg-black/60 rounded-full overflow-hidden border border-white/20 backdrop-blur-sm transition-opacity duration-150 ${isCharging ? 'opacity-100' : 'opacity-0'}`}>
        <div
          className="absolute bottom-0 w-full transition-all duration-75"
          style={{
            height: `${(uiPower / 3000) * 100}%`,
            background: uiPower > 2000
              ? 'linear-gradient(to top, #ef4444, #f97316)'
              : uiPower > 1000
              ? 'linear-gradient(to top, #f59e0b, #22c55e)'
              : 'linear-gradient(to top, #22c55e, #86efac)',
          }}
        />
      </div>

      {!isMyTurn && (
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white/50 text-xs font-semibold tracking-wider">
          Opponent's Turn
        </div>
      )}
    </div>
  )
}

export default PoolBoard
