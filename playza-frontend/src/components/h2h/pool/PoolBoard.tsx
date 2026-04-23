import React, { useRef, useEffect, useCallback, useState } from 'react'
import type { Ball, Vector2, GameState, ShotInput } from './game/pool/types'
import { PoolPhysics, TABLE_CONFIG, predictTrajectory, POCKET_POSITIONS } from './game/pool/physics'
import { loadPoolAssets, type PoolAssets } from './game/pool/assets'

// ─── Extra asset imports from reference game engine ──────────────────────────
import tableBgUrl      from './assets/img/table.png'
import stickUrl        from './assets/img/stick.png'
import cueBallImgUrl   from './assets/img/cueBall.png'
import redBallImgUrl   from './assets/img/redBall.png'
import yellowBallImgUrl from './assets/img/yellowBall.png'
import blackBallImgUrl from './assets/img/blackBall.png'

interface PoolBoardProps {
  gameState: GameState
  isMyTurn: boolean
  onShot: (shot: ShotInput) => void
  onBallPlace?: (pos: Vector2) => void
}

// ─── Reference-engine ball colour palette (authentic 8-ball pool) ─────────────
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

// ─── Extra image loader (used for reference sprites) ─────────────────────────
interface RefSprites {
  tableBg:    HTMLImageElement | null
  stick:      HTMLImageElement | null
  cueBall:    HTMLImageElement | null
  redBall:    HTMLImageElement | null
  yellowBall: HTMLImageElement | null
  blackBall:  HTMLImageElement | null
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload  = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

async function loadRefSprites(): Promise<RefSprites> {
  const results = await Promise.allSettled([
    loadImg(tableBgUrl),
    loadImg(stickUrl),
    loadImg(cueBallImgUrl),
    loadImg(redBallImgUrl),
    loadImg(yellowBallImgUrl),
    loadImg(blackBallImgUrl),
  ])
  const get = (r: PromiseSettledResult<HTMLImageElement>) =>
    r.status === 'fulfilled' ? r.value : null
  return {
    tableBg:    get(results[0]),
    stick:      get(results[1]),
    cueBall:    get(results[2]),
    redBall:    get(results[3]),
    yellowBall: get(results[4]),
    blackBall:  get(results[5]),
  }
}

// ─── Placement helpers ────────────────────────────────────────────────────────
const POCKET_SAFE_RADIUS      = TABLE_CONFIG.pocketRadius + TABLE_CONFIG.ballRadius * 0.45
const BALL_PLACEMENT_CLEARANCE = TABLE_CONFIG.ballRadius * 2.05

function isInsidePocketMouth(position: Vector2, buffer = 0) {
  return POCKET_POSITIONS.some((pocket) =>
    Math.hypot(position.x - pocket.x, position.y - pocket.y) < POCKET_SAFE_RADIUS + buffer,
  )
}

function isCueBallPlacementValid(position: Vector2, balls: Ball[]) {
  if (isInsidePocketMouth(position, TABLE_CONFIG.ballRadius * 0.2)) return false
  return balls.every((ball) => {
    if (ball.id === 'cue' || ball.pocketed) return true
    return Math.hypot(position.x - ball.position.x, position.y - ball.position.y) >= BALL_PLACEMENT_CLEARANCE
  })
}

function findLegalCueBallPosition(position: Vector2, balls: Ball[]) {
  const cushion = TABLE_CONFIG.cushionHeight + TABLE_CONFIG.ballRadius
  const clamped = {
    x: Math.max(cushion, Math.min(TABLE_CONFIG.width  - cushion, position.x)),
    y: Math.max(cushion, Math.min(TABLE_CONFIG.height - cushion, position.y)),
  }
  if (isCueBallPlacementValid(clamped, balls)) return clamped

  const maxRadius = TABLE_CONFIG.ballRadius * 12
  for (let r = TABLE_CONFIG.ballRadius * 0.5; r <= maxRadius; r += TABLE_CONFIG.ballRadius * 0.5) {
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      const candidate = {
        x: Math.max(cushion, Math.min(TABLE_CONFIG.width  - cushion, clamped.x + Math.cos(a) * r)),
        y: Math.max(cushion, Math.min(TABLE_CONFIG.height - cushion, clamped.y + Math.sin(a) * r)),
      }
      if (isCueBallPlacementValid(candidate, balls)) return candidate
    }
  }
  return clamped
}

// ─────────────────────────────────────────────────────────────────────────────
//  drawBall — Phong-shaded procedural ball with sprite-based fallback
//  Mirrors the reference engine's two-source approach:
//    1. Try to draw the corresponding sprite (cueBall/redBall/yellowBall/blackBall/solid/stripe)
//    2. Fall back to the fully-procedural Phong shader already in this file
// ─────────────────────────────────────────────────────────────────────────────
function drawBall(
  ctx:        CanvasRenderingContext2D,
  x:          number,
  y:          number,
  r:          number,
  ballNumber: number,
  scale:      number,
  assets?:    PoolAssets | null,
  refSprites?: RefSprites | null,
  alpha = 1,
  overrideR?: number,
  rotation?:  Vector2,
) {
  const rr      = overrideR ?? r
  const entry   = BALL_COLORS[ballNumber] ?? BALL_COLORS[1]
  const isStripe = ballNumber >= 9
  const isCue   = ballNumber === 0
  const is8     = ballNumber === 8
  const { r: cr, g: cg, b: cb } = entry
  const rot = rotation ? (rotation.x * 0.45 + rotation.y * 0.25) : 0

  ctx.save()
  if (alpha < 1) ctx.globalAlpha = alpha
  ctx.translate(x, y)

  // ── Drop shadow ────────────────────────────────────────────────────────────
  const shadowImg = assets?.images.shadow
  if (shadowImg) {
    ctx.save()
    ctx.globalAlpha = (alpha < 1 ? alpha : 1) * 0.55
    ctx.drawImage(shadowImg, -rr * 1.18, -rr * 1.04, rr * 2.36, rr * 2.22)
    ctx.restore()
  } else {
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

  // ── Try reference sprite first ─────────────────────────────────────────────
  let drawnSprite = false
  if (refSprites) {
    let sprite: HTMLImageElement | null = null
    if (isCue)      sprite = refSprites.cueBall
    else if (is8)   sprite = refSprites.blackBall
    else if (ballNumber <= 7) sprite = refSprites.redBall   // solids → red sprite tinted below
    else            sprite = refSprites.yellowBall           // stripes → yellow sprite

    if (sprite) {
      ctx.save()
      if (rot) ctx.rotate(rot)
      // For numbered balls other than cue/8: tint via destination-over composite
      ctx.drawImage(sprite, -rr, -rr, rr * 2, rr * 2)
      // Tint overlay for the correct ball colour (blends on top of white/generic sprite)
      if (!isCue && !is8) {
        ctx.globalCompositeOperation = 'multiply'
        ctx.fillStyle = entry.hex
        ctx.fillRect(-rr, -rr, rr * 2, rr * 2)
        ctx.globalCompositeOperation = 'source-over'
      }
      ctx.restore()
      drawnSprite = true
    }
  }

  // ── Procedural fallback (full Phong) ──────────────────────────────────────
  if (!drawnSprite) {
    // 1. Diffuse base
    const diffG = ctx.createRadialGradient(
      -rr * 0.42, -rr * 0.52, rr * 0.01,
       rr * 0.55,  rr * 0.65, rr * 1.55,
    )
    if (isCue) {
      diffG.addColorStop(0,    '#FFFFFF')
      diffG.addColorStop(0.18, '#F5F5F5')
      diffG.addColorStop(0.60, '#C4C4C4')
      diffG.addColorStop(1,    '#505050')
    } else if (isStripe) {
      diffG.addColorStop(0,    '#FFFFFF')
      diffG.addColorStop(0.22, '#F2F2F2')
      diffG.addColorStop(0.65, '#D4D4D4')
      diffG.addColorStop(1,    '#686868')
    } else {
      diffG.addColorStop(0,    `rgb(${Math.min(255,cr+130)},${Math.min(255,cg+130)},${Math.min(255,cb+130)})`)
      diffG.addColorStop(0.18, `rgb(${Math.min(255,cr+65)},${Math.min(255,cg+65)},${Math.min(255,cb+65)})`)
      diffG.addColorStop(0.55, `rgb(${cr},${cg},${cb})`)
      diffG.addColorStop(1,    `rgb(${Math.max(0,cr-130)},${Math.max(0,cg-130)},${Math.max(0,cb-130)})`)
    }
    ctx.fillStyle = diffG
    ctx.fillRect(-rr, -rr, rr * 2, rr * 2)

    ctx.save()
    if (rot) ctx.rotate(rot)

    // 2. Stripe band
    if (isStripe) {
      const stripeTop = ctx.createLinearGradient(0, -rr, 0, 0)
      stripeTop.addColorStop(0,    'rgba(0,0,0,0)')
      stripeTop.addColorStop(0.10, 'rgba(0,0,0,0)')
      stripeTop.addColorStop(0.25, `rgba(${Math.min(255,cr+80)},${Math.min(255,cg+80)},${Math.min(255,cb+80)},1)`)
      stripeTop.addColorStop(0.50, `rgba(${cr},${cg},${cb},1)`)
      stripeTop.addColorStop(1,    `rgba(${cr},${cg},${cb},1)`)
      ctx.fillStyle = stripeTop
      ctx.fillRect(-rr, -rr, rr * 2, rr * 2)

      const stripeBot = ctx.createLinearGradient(0, 0, 0, rr)
      stripeBot.addColorStop(0,    `rgba(${cr},${cg},${cb},1)`)
      stripeBot.addColorStop(0.50, `rgba(${Math.max(0,cr-70)},${Math.max(0,cg-70)},${Math.max(0,cb-70)},1)`)
      stripeBot.addColorStop(0.75, 'rgba(0,0,0,0)')
      stripeBot.addColorStop(1,    'rgba(0,0,0,0)')
      ctx.fillStyle = stripeBot
      ctx.fillRect(-rr, 0, rr * 2, rr)
    }

    // 3. Number dot
    if (!isCue) {
      const dotR = rr * 0.30
      const dotG = ctx.createRadialGradient(-dotR * 0.12, -dotR * 0.18, 0, 0, 0, dotR * 1.08)
      dotG.addColorStop(0,   'rgba(255,255,255,1)')
      dotG.addColorStop(0.8, 'rgba(255,255,255,0.97)')
      dotG.addColorStop(1,   'rgba(220,220,220,0.90)')
      ctx.beginPath()
      ctx.arc(0, 0, dotR, 0, Math.PI * 2)
      ctx.fillStyle = dotG
      ctx.fill()
      const fontSize = Math.max(8, Math.round(dotR * 1.45 * scale))
      ctx.save()
      ctx.scale(1 / scale, 1 / scale)
      ctx.fillStyle = ballNumber === 8 ? '#EAEAEA' : '#111111'
      ctx.font = `900 ${fontSize}px 'Arial Narrow', Arial, sans-serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(ballNumber), 0, fontSize * 0.05)
      ctx.restore()
    }

    ctx.restore()
  }

  // ── Shade overlay (reference: shade sprite sits on top of sprite) ──────────
  const shade = assets?.images.shade
  if (shade) {
    ctx.save()
    ctx.globalAlpha = (alpha < 1 ? alpha : 1) * 0.34
    ctx.drawImage(shade, x - rr, y - rr, rr * 2, rr * 2)
    ctx.restore()
  }

  // ── Soft highlight ─────────────────────────────────────────────────────────
  const softHi = ctx.createRadialGradient(-rr*0.26,-rr*0.32,0,-rr*0.14,-rr*0.18,rr*0.82)
  softHi.addColorStop(0,   'rgba(255,255,255,0.70)')
  softHi.addColorStop(0.30,'rgba(255,255,255,0.28)')
  softHi.addColorStop(0.70,'rgba(255,255,255,0.06)')
  softHi.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = softHi
  ctx.fillRect(-rr, -rr, rr * 2, rr * 2)

  // ── Sharp specular ────────────────────────────────────────────────────────
  const sharp = ctx.createRadialGradient(-rr*0.38,-rr*0.50,0,-rr*0.38,-rr*0.50,rr*0.18)
  sharp.addColorStop(0,   'rgba(255,255,255,1.0)')
  sharp.addColorStop(0.18,'rgba(255,255,255,0.95)')
  sharp.addColorStop(0.55,'rgba(255,255,255,0.45)')
  sharp.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = sharp
  ctx.fillRect(-rr, -rr, rr * 2, rr * 2)

  // ── AO rim ────────────────────────────────────────────────────────────────
  const ao = ctx.createRadialGradient(0,0,rr*0.58,0,0,rr)
  ao.addColorStop(0,    'rgba(0,0,0,0)')
  ao.addColorStop(0.52, 'rgba(0,0,0,0.04)')
  ao.addColorStop(0.78, 'rgba(0,0,0,0.38)')
  ao.addColorStop(1,    'rgba(0,0,0,0.90)')
  ctx.fillStyle = ao
  ctx.fillRect(-rr, -rr, rr * 2, rr * 2)

  ctx.restore()

  // ── Crisp outer edge ──────────────────────────────────────────────────────
  ctx.save()
  if (alpha < 1) ctx.globalAlpha = alpha
  ctx.beginPath()
  ctx.arc(x, y, rr, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(0,0,0,0.55)'
  ctx.lineWidth   = 1.5
  ctx.stroke()
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────────────
//  drawTable — uses the reference engine's spr_background4 texture as the
//              primary table surface, exactly like the original Classic Pool
// ─────────────────────────────────────────────────────────────────────────────
function drawTable(
  ctx: CanvasRenderingContext2D,
  assets?: PoolAssets | null,
  refSprites?: RefSprites | null,
) {
  const W  = TABLE_CONFIG.width
  const H  = TABLE_CONFIG.height
  const C  = TABLE_CONFIG.cushionHeight
  const PR = TABLE_CONFIG.pocketRadius

  // ── If reference background sprite is available, use it as the base layer ──
  const bg = refSprites?.tableBg
  if (bg) {
    // Draw the reference game's spr_background4.png at full table size
    ctx.save()
    ctx.drawImage(bg, 0, 0, W, H)
    ctx.restore()

    // Pocket cavities on top of reference background
    POCKET_POSITIONS.forEach((pocket) => {
      const { x: px, y: py } = pocket
      ctx.save()
      const cavity = ctx.createRadialGradient(px, py, 0, px, py, PR + 12)
      cavity.addColorStop(0,   '#000000')
      cavity.addColorStop(0.52,'#050505')
      cavity.addColorStop(0.8, 'rgba(28,14,5,0.96)')
      cavity.addColorStop(1,   'rgba(72,38,13,0.88)')
      ctx.beginPath()
      ctx.arc(px, py, PR + 12, 0, Math.PI * 2)
      ctx.fillStyle = cavity
      ctx.fill()
      ctx.beginPath()
      ctx.arc(px, py, PR * 0.78, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.95)'
      ctx.fill()
      ctx.restore()
    })

    // Pocket overlay image on top
    const pockets = assets?.images.pockets
    if (pockets) {
      ctx.save()
      ctx.globalAlpha = 1
      ctx.drawImage(pockets, 0, 0, W, H)
      ctx.restore()
    }

    // tableTop overlay (transparency cut-out)
    const tableTop = assets?.images.tableTop
    if (tableTop) {
      ctx.save()
      ctx.globalAlpha = 0.28
      ctx.drawImage(tableTop, 0, 0, W, H)
      ctx.restore()
    }
    return
  }

  // ── Procedural fallback table (no reference sprite) ────────────────────────
  const railG = ctx.createLinearGradient(0, 0, 0, H)
  railG.addColorStop(0,   '#6B3D1E')
  railG.addColorStop(0.5, '#9B6035')
  railG.addColorStop(1,   '#4A2508')
  ctx.fillStyle = railG
  ctx.beginPath()
  ctx.roundRect(-C * 2.8, -C * 2.8, W + C * 5.6, H + C * 5.6, 28)
  ctx.fill()

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

  const cushionColor = '#155a31'
  ctx.fillStyle = cushionColor
  ctx.fillRect(C + PR, 0, W / 2 - PR * 2 - C, C)
  ctx.fillRect(W / 2 + PR, 0, W / 2 - PR * 2 - C, C)
  ctx.fillRect(C + PR, H - C, W / 2 - PR * 2 - C, C)
  ctx.fillRect(W / 2 + PR, H - C, W / 2 - PR * 2 - C, C)
  ctx.fillRect(0, C + PR, C, H - 2 * (C + PR))
  ctx.fillRect(W - C, C + PR, C, H - 2 * (C + PR))

  const feltG = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.72)
  feltG.addColorStop(0,   '#2fd06e')
  feltG.addColorStop(0.5, '#188145')
  feltG.addColorStop(1,   '#0b4d29')
  ctx.fillStyle = feltG
  ctx.fillRect(C, C, W - C * 2, H - C * 2)

  const cloth = assets?.images.cloth
  if (cloth) {
    ctx.save()
    ctx.globalAlpha = 0.18
    ctx.drawImage(cloth, 0, 0, W, H)
    ctx.restore()
  }

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

  POCKET_POSITIONS.forEach((pocket) => {
    const { x: px, y: py } = pocket
    ctx.save()
    const cavity = ctx.createRadialGradient(px, py, 0, px, py, PR + 12)
    cavity.addColorStop(0,   '#000000')
    cavity.addColorStop(0.52,'#050505')
    cavity.addColorStop(0.8, 'rgba(28,14,5,0.96)')
    cavity.addColorStop(1,   'rgba(72,38,13,0.88)')
    ctx.beginPath()
    ctx.arc(px, py, PR + 12, 0, Math.PI * 2)
    ctx.fillStyle = cavity
    ctx.fill()
    ctx.beginPath()
    ctx.arc(px, py, PR * 0.78, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.95)'
    ctx.fill()
    ctx.restore()
  })

  const pockets = assets?.images.pockets
  if (pockets) {
    ctx.save()
    ctx.globalAlpha = 1
    ctx.drawImage(pockets, 0, 0, W, H)
    ctx.restore()
  } else {
    POCKET_POSITIONS.forEach((pocket) => {
      const { x: px, y: py } = pocket
      ctx.save()
      ctx.beginPath()
      ctx.arc(px, py, PR + 10, 0, Math.PI * 2)
      ctx.fillStyle = '#5A2E10'
      ctx.fill()
      const pG = ctx.createRadialGradient(px, py, 0, px, py, PR + 6)
      pG.addColorStop(0,   '#000000')
      pG.addColorStop(0.55,'#0B0B0B')
      pG.addColorStop(0.85,'#1A0E04')
      pG.addColorStop(1,   '#2E1806')
      ctx.beginPath()
      ctx.arc(px, py, PR, 0, Math.PI * 2)
      ctx.fillStyle = pG
      ctx.fill()
      ctx.strokeStyle = 'rgba(200,145,50,0.80)'
      ctx.lineWidth = 4.5
      ctx.beginPath()
      ctx.arc(px, py, PR, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    })
  }

  const tableTop = assets?.images.tableTop
  if (tableTop) {
    ctx.save()
    ctx.globalAlpha = 0.34
    ctx.drawImage(tableTop, 0, 0, W, H)
    ctx.restore()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  drawCueStick — mirrors reference Stick.js rendering:
//    Canvas2D.drawImage(sprites.stick, position, rotation, 1, origin)
//    origin = Vector2(970, 11)  → stick tip offset from cue ball
// ─────────────────────────────────────────────────────────────────────────────
function drawCueStick(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  angle: number,
  distFromBall: number,
  assets?: PoolAssets | null,
  refSprites?: RefSprites | null,
) {
  const dist = distFromBall

  // ── Reference stick sprite ────────────────────────────────────────────────
  const stickSprite = refSprites?.stick ?? assets?.images.cue
  const shadowSprite = assets?.images.cueShadow

  if (stickSprite) {
    // Reference: stick origin = (970, 11), drawn at rotation from cue ball
    // In our coordinate system: stick is placed so tip touches cue ball
    const nativeW = stickSprite.width   // 970px (reference origin.x)
    const nativeH = stickSprite.height  // 22px  (reference origin.y * 2)

    // Scale stick to match our table dimensions
    // Reference table: 1500×825 → ratio to our TABLE_CONFIG
    const scaleRatio = TABLE_CONFIG.width / 1500
    const stickW = nativeW * scaleRatio
    const stickH = nativeH * scaleRatio

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle + Math.PI)

    if (shadowSprite) {
      const sw = shadowSprite.width  * scaleRatio
      const sh = shadowSprite.height * scaleRatio
      ctx.save()
      ctx.globalAlpha = 0.5
      ctx.drawImage(shadowSprite, dist + 12, -sh / 2 + 6, sw, sh)
      ctx.restore()
    }

    // Draw stick with tip at `dist` from the cue ball center
    ctx.drawImage(stickSprite, dist, -stickH / 2, stickW, stickH)
    ctx.restore()
    return
  }

  // ── Procedural fallback cue stick ─────────────────────────────────────────
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

  ctx.beginPath()
  ctx.moveTo(dist,      -tipW / 2)
  ctx.lineTo(dist + 30, -tipW * 0.75)
  ctx.lineTo(dist + 30,  tipW * 0.75)
  ctx.lineTo(dist,        tipW / 2)
  ctx.fillStyle = '#E8F0F8'
  ctx.fill()

  const shaftG = ctx.createLinearGradient(0, -tipW, 0, tipW)
  shaftG.addColorStop(0,   '#F8EDCF')
  shaftG.addColorStop(0.25,'#EDD89A')
  shaftG.addColorStop(0.70,'#C8A860')
  shaftG.addColorStop(1,   '#8B6918')
  ctx.beginPath()
  ctx.moveTo(dist + 30,    -tipW * 0.75)
  ctx.lineTo(dist + stickLen * 0.58, -tipW * 1.05)
  ctx.lineTo(dist + stickLen * 0.58,  tipW * 1.05)
  ctx.lineTo(dist + 30,     tipW * 0.75)
  ctx.fillStyle = shaftG
  ctx.fill()

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

  const buttG = ctx.createLinearGradient(0, -buttW/2, 0, buttW/2)
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

  ctx.beginPath()
  ctx.arc(dist + stickLen, 0, buttW / 2, 0, Math.PI * 2)
  ctx.fillStyle = '#1A0800'
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(dist + 30, -tipW * 0.45)
  ctx.lineTo(dist + stickLen * 0.55, -tipW * 0.65)
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.restore()
  ctx.restore()
}

// ─── Pocket animation ─────────────────────────────────────────────────────────
interface PocketingBall {
  id: string
  number: number
  startPos: Vector2
  pocketPos: Vector2
  progress: number
}

// ─── Sound helper (mirrors reference engine's cloneNode approach) ─────────────
function playSound(audio: HTMLAudioElement | undefined, volume?: number) {
  if (!audio) return
  try {
    const clone = audio.cloneNode(true) as HTMLAudioElement
    if (volume !== undefined) clone.volume = Math.min(1, Math.max(0, volume))
    void clone.play()
  } catch {
    // autoplay restriction — silently ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PoolBoard
// ─────────────────────────────────────────────────────────────────────────────
const PoolBoard: React.FC<PoolBoardProps> = ({ gameState, isMyTurn, onShot, onBallPlace }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scaleRef  = useRef(1)
  const dprRef    = useRef(1)
  const assetsRef     = useRef<PoolAssets | null>(null)
  const refSpritesRef = useRef<RefSprites | null>(null)

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
  // Cushion/ball hit debounce (mirrors reference engine: cloneNode, volume-scaled)
  const lastBallHitTimeRef    = useRef(0)
  const lastCushionHitTimeRef = useRef(0)

  const STRIKE_FRAMES = 8
  const MAX_POWER     = 5200

  useEffect(() => { isMyTurnRef.current   = isMyTurn   }, [isMyTurn])
  useEffect(() => { onShotRef.current     = onShot     }, [onShot])
  useEffect(() => { onBallPlaceRef.current = onBallPlace }, [onBallPlace])
  useEffect(() => { gameStateRef.current  = gameState  }, [gameState])

  // Sync server game state to local balls
  useEffect(() => {
    const prevRot = new Map(localBallsRef.current.map(b => [b.id, b.rotation]))
    const mapped  = gameState.balls.map(b => ({
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

  // Reset aim angle on turn change
  useEffect(() => {
    if (isSimulatingRef.current) return
    const cueBall = localBallsRef.current.find(b => b.id === 'cue' && !b.pocketed)
    if (!cueBall) return
    const rackTarget = { x: TABLE_CONFIG.width * 0.73, y: TABLE_CONFIG.height / 2 }
    aimAngleRef.current = Math.atan2(rackTarget.y - cueBall.position.y, rackTarget.x - cueBall.position.x)
  }, [gameState.currentPlayer, gameState.shotCount, gameState.ballInHand])

  // Canvas scale
  const updateScale = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    if (!container) return
    const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1))
    dprRef.current  = dpr
    const newScale  = container.clientWidth / TABLE_CONFIG.width
    scaleRef.current = newScale
    canvas.width  = Math.round(TABLE_CONFIG.width  * newScale * dpr)
    canvas.height = Math.round(TABLE_CONFIG.height * newScale * dpr)
  }, [])

  useEffect(() => {
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [updateScale])

  // Load assets: both the pool-specific assets.ts AND the reference sprites
  useEffect(() => {
    let cancelled = false

    Promise.allSettled([
      loadPoolAssets(),
      loadRefSprites(),
    ]).then(([poolResult, refResult]) => {
      if (cancelled) return
      if (poolResult.status === 'fulfilled') assetsRef.current     = poolResult.value
      if (refResult.status  === 'fulfilled') refSpritesRef.current = refResult.value
    })

    return () => { cancelled = true }
  }, [])

  // ── Draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const scale = scaleRef.current
    const dpr   = dprRef.current

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0)

    // Draw table using reference background sprite (spr_background4)
    drawTable(ctx, assetsRef.current, refSpritesRef.current)

    const balls      = localBallsRef.current
    const myTurn     = isMyTurnRef.current
    const simulating = isSimulatingRef.current
    const striking   = isStrikingRef.current
    const angle      = aimAngleRef.current
    const power      = powerRef.current
    const charging   = isChargingRef.current

    // ── Live balls ─────────────────────────────────────────────────────────
    balls.forEach(ball => {
      if (ball.pocketed) return
      // Motion glow (reference: balls radiate when moving fast)
      const spd = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2)
      if (spd > 4 && ball.id !== 'cue') {
        ctx.save()
        const glowAlpha = Math.min(0.75, (spd - 4) / 18)
        ctx.beginPath()
        ctx.arc(ball.position.x, ball.position.y, TABLE_CONFIG.ballRadius + 8, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 220, 60, ${glowAlpha})`
        ctx.lineWidth = 5
        ctx.stroke()
        ctx.restore()
      }
      drawBall(
        ctx,
        ball.position.x, ball.position.y,
        TABLE_CONFIG.ballRadius,
        ball.number,
        scale,
        assetsRef.current,
        refSpritesRef.current,
        1, undefined, ball.rotation,
      )
    })

    // ── Pocket-entry animations ────────────────────────────────────────────
    pocketingBallsRef.current.forEach(pb => {
      const t   = Math.min(pb.progress, 1)
      const eT  = t * t
      const pos = {
        x: pb.startPos.x + (pb.pocketPos.x - pb.startPos.x) * eT,
        y: pb.startPos.y + (pb.pocketPos.y - pb.startPos.y) * eT,
      }
      const rr    = TABLE_CONFIG.ballRadius * (1 - eT * 0.85)
      const alpha = 1 - eT * 0.9
      if (rr > 1) {
        drawBall(ctx, pos.x, pos.y, TABLE_CONFIG.ballRadius, pb.number, scale,
          assetsRef.current, refSpritesRef.current, alpha, rr, undefined)
      }
    })

    const cueBall = balls.find(b => b.id === 'cue')

    // ── Aiming visuals ─────────────────────────────────────────────────────
    if (!simulating && cueBall && !cueBall.pocketed) {
      if (myTurn) {
        // Trajectory dotted line (reference uses dottedLine.png pattern)
        const traj = predictTrajectory(cueBall, balls, angle, Math.max(power, 100))
        ctx.save()
        const dotted = assetsRef.current?.images.dottedLine
        if (dotted) {
          const pat = ctx.createPattern(dotted, 'repeat')
          if (pat && 'setTransform' in pat) {
            ;(pat as CanvasPattern).setTransform(new DOMMatrix([0.55, 0, 0, 0.55, 0, 0]))
          }
          ctx.strokeStyle = pat || 'rgba(255,255,255,0.32)'
          ctx.lineWidth   = 4
          ctx.globalAlpha = 0.7
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.32)'
          ctx.lineWidth   = 1.5
          ctx.setLineDash([7, 6])
        }
        ctx.beginPath()
        ctx.moveTo(cueBall.position.x, cueBall.position.y)
        traj.points.forEach((p: Vector2) => ctx.lineTo(p.x, p.y))
        ctx.stroke()
        ctx.setLineDash([])

        if (traj.hitPoint) {
          ctx.save()
          ctx.globalAlpha = 0.35
          drawBall(ctx, traj.hitPoint.x, traj.hitPoint.y, TABLE_CONFIG.ballRadius, 0,
            scale, assetsRef.current, refSpritesRef.current, 1, undefined, undefined)
          ctx.restore()

          if (traj.targetPath) {
            ctx.strokeStyle = '#facc15'
            ctx.lineWidth   = 2
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
          const sweep  = Math.PI * 2 * Math.min(1, power / MAX_POWER)
          const danger = MAX_POWER * 0.72
          const warn   = MAX_POWER * 0.42
          ctx.save()
          ctx.strokeStyle = power > danger ? '#ef4444' : power > warn ? '#f59e0b' : '#22c55e'
          ctx.lineWidth   = 4
          ctx.globalAlpha = 0.85
          ctx.beginPath()
          ctx.arc(
            cueBall.position.x, cueBall.position.y,
            TABLE_CONFIG.ballRadius + 12,
            -Math.PI / 2, -Math.PI / 2 + sweep,
          )
          ctx.stroke()
          ctx.restore()
        }
      }

      // Cue stick — idle/aiming (mirrors reference: always drawn except while shooting)
      if (!striking) {
        const pullback = TABLE_CONFIG.ballRadius + 10 + (myTurn && charging ? Math.min(power / 22, 90) : 14)
        drawCueStick(ctx, cueBall.position.x, cueBall.position.y, angle, pullback,
          assetsRef.current, refSpritesRef.current)
      }
    }

    // Cue during strike animation
    if (striking && cueBall) {
      drawCueStick(
        ctx,
        cueBall.position.x, cueBall.position.y,
        angle,
        TABLE_CONFIG.ballRadius + 6 + strikeOffsetRef.current,
        assetsRef.current, refSpritesRef.current,
      )
    }

    ctx.restore()
  }, [])

  // ── Game loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      // Strike animation
      if (isStrikingRef.current) {
        strikeFrameRef.current++
        const progress = strikeFrameRef.current / STRIKE_FRAMES
        const eased    = progress * progress
        strikeOffsetRef.current = strikeInitOffRef.current * (1 - eased)

        if (strikeFrameRef.current >= STRIKE_FRAMES) {
          strikeOffsetRef.current  = 0
          isStrikingRef.current    = false
          strikeFrameRef.current   = 0

          const physics = new PoolPhysics(localBallsRef.current)
          physics.applyShot(aimAngleRef.current, powerRef.current)
          physicsRef.current     = physics
          isSimulatingRef.current = true

          prevPocketedRef.current   = new Set(localBallsRef.current.filter(b => b.pocketed).map(b => b.id))
          pocketingBallsRef.current = []

          if (!shotSentRef.current) {
            shotSentRef.current = true
            onShotRef.current({ angle: aimAngleRef.current, power: powerRef.current, spin: { x: 0, y: 0 } })

            // Strike sound (mirrors reference engine Strike.wav, volume proportional to power)
            const vol = Math.min(1, powerRef.current / MAX_POWER)
            playSound(assetsRef.current?.audio.cueHit, vol)
          }
        }
      }

      // Physics substeps
      if (isSimulatingRef.current && physicsRef.current) {
        const ballsNow = physicsRef.current.getBalls()
        const maxSpeed = ballsNow.reduce((m, b) => {
          const s = Math.hypot(b.velocity.x, b.velocity.y)
          return s > m ? s : m
        }, 0)
        const substeps = Math.min(10, Math.max(4, Math.ceil(maxSpeed / 6)))
        const dt       = 1 / substeps

        // Track velocities before step for cushion/collision sound detection
        const preVelocities = new Map(ballsNow.map(b => [b.id, { ...b.velocity }]))

        let moving = false
        for (let i = 0; i < substeps; i++) {
          if (physicsRef.current.step(dt)) moving = true
        }

        const nextBalls = physicsRef.current.getBalls()
        const now = performance.now()

        // ── Ball-collision sound (mirrors reference BallsCollide.wav approach) ──
        nextBalls.forEach(b1 => {
          if (b1.pocketed) return
          nextBalls.forEach(b2 => {
            if (b1 === b2 || b2.pocketed) return
            const dist = Math.hypot(b1.position.x - b2.position.x, b1.position.y - b2.position.y)
            if (dist < TABLE_CONFIG.ballRadius * 2.1) {
              const pre1 = preVelocities.get(b1.id)
              const pre2 = preVelocities.get(b2.id)
              if (!pre1 || !pre2) return
              const power = (Math.abs(pre1.x) + Math.abs(pre1.y) + Math.abs(pre2.x) + Math.abs(pre2.y)) * 0.00482
              if (power > 0.05 && now - lastBallHitTimeRef.current > 80) {
                lastBallHitTimeRef.current = now
                playSound(assetsRef.current?.audio.ballHit, Math.min(1, power / 20))
              }
            }
          })
        })

        // ── Cushion-hit sound (mirrors reference Side.wav) ──
        nextBalls.forEach(b => {
          if (b.pocketed) return
          const pre = preVelocities.get(b.id)
          if (!pre) return
          const hitX = Math.sign(pre.x) !== Math.sign(b.velocity.x) && Math.abs(pre.x) > 0.5
          const hitY = Math.sign(pre.y) !== Math.sign(b.velocity.y) && Math.abs(pre.y) > 0.5
          if ((hitX || hitY) && now - lastCushionHitTimeRef.current > 60) {
            lastCushionHitTimeRef.current = now
            const vol = Math.min(1, (Math.abs(pre.x) + Math.abs(pre.y)) * 0.003)
            playSound(assetsRef.current?.audio.cushionHit, vol)
          }
        })

        // ── Pocket animation + sound ──
        nextBalls.forEach(ball => {
          if (ball.pocketed && !prevPocketedRef.current.has(ball.id)) {
            prevPocketedRef.current.add(ball.id)
            playSound(assetsRef.current?.audio.pocketHit, 0.5)

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

        pocketingBallsRef.current = pocketingBallsRef.current
          .map(pb => ({ ...pb, progress: pb.progress + 0.065 }))
          .filter(pb => pb.progress < 1)

        if (!moving) {
          isSimulatingRef.current = false
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
      x: (e.clientX - rect.left) / scaleRef.current,
      y: (e.clientY - rect.top)  / scaleRef.current,
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

    dragStartRef.current  = pos
    isChargingRef.current = true
    shotSentRef.current   = false
    setIsCharging(true)
    powerRef.current = 0
    setUiPower(0)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isMyTurnRef.current || isSimulatingRef.current || isStrikingRef.current) return
    const pos = getTablePos(e)

    if (isDraggingBallRef.current) {
      const legalPosition = findLegalCueBallPosition(pos, localBallsRef.current)
      localBallsRef.current = localBallsRef.current.map(b =>
        b.id === 'cue' ? { ...b, position: legalPosition, pocketed: false } : b,
      )
      return
    }

    const cue = localBallsRef.current.find(b => b.id === 'cue')
    if (cue) {
      aimAngleRef.current = Math.atan2(pos.y - cue.position.y, pos.x - cue.position.x)
    }

    if (isChargingRef.current && dragStartRef.current) {
      const dist    = Math.hypot(pos.x - dragStartRef.current.x, pos.y - dragStartRef.current.y)
      // Non-linear power curve (mirrors reference: more realistic control)
      const t       = Math.min(dist / 220, 1)
      const curved  = Math.pow(t, 1.12)
      const newPower = curved * MAX_POWER
      powerRef.current = newPower
      setUiPower(newPower)
    }
  }

  const handlePointerUp = () => {
    if (isDraggingBallRef.current) {
      isDraggingBallRef.current = false
      const cue = localBallsRef.current.find(b => b.id === 'cue')
      if (cue && onBallPlaceRef.current) {
        const legalPosition = findLegalCueBallPosition(cue.position, localBallsRef.current)
        localBallsRef.current = localBallsRef.current.map(ball =>
          ball.id === 'cue' ? { ...ball, position: legalPosition, pocketed: false } : ball,
        )
        onBallPlaceRef.current(legalPosition)
      }
      return
    }

    if (isChargingRef.current && powerRef.current > 60) {
      // Strike animation (mirrors reference engine's shooting trigger)
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
        background: 'radial-gradient(circle at 50% 35%, rgba(38,129,72,0.55) 0%, rgba(22,70,38,0.28) 36%, rgba(61,30,8,1) 72%)',
        padding: '16px',
        borderRadius: '24px',
        boxShadow: '0 0 0 5px rgba(140,80,20,0.5), 0 0 0 8px rgba(100,55,10,0.25), 0 0 60px rgba(0,0,0,0.85), 0 24px 70px rgba(0,0,0,0.6)',
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-auto block cursor-crosshair rounded-xl"
        style={{ touchAction: 'none', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.6)' }}
      />

      {/* Power bar */}
      <div
        className={`absolute left-2 top-1/2 -translate-y-1/2 w-5 h-48 bg-black/65 rounded-full overflow-hidden border border-white/15 backdrop-blur-sm transition-opacity duration-100 ${isCharging ? 'opacity-100' : 'opacity-0'}`}
      >
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

      {/* Turn badge — opponent's turn */}
      {!isMyTurn && (
        <div className="absolute top-4 right-4 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white/50 text-xs font-semibold tracking-wider">
          Opponent's Turn
        </div>
      )}

      {/* Ball-in-hand hint */}
      {isMyTurn && gameState.ballInHand && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-amber-500/80 backdrop-blur-md text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg border border-amber-300/30 animate-pulse">
          🎱 Ball in Hand — Drag the cue ball to place it
        </div>
      )}
    </div>
  )
}

export default PoolBoard
