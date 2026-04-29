import type { Vector2 } from './types'
import type { PoolAssets } from './assets'
import { TABLE_CONFIG, POCKET_POSITIONS } from './physics'
import tableBgUrl       from '../../assets/img/table.png'
import stickUrl         from '../../assets/img/stick.png'
import cueBallImgUrl    from '../../assets/img/cueBall.png'
import redBallImgUrl    from '../../assets/img/redBall.png'
import yellowBallImgUrl from '../../assets/img/yellowBall.png'
import blackBallImgUrl  from '../../assets/img/blackBall.png'

// ─── Ball colour palette ──────────────────────────────────────────────────────
export const BALL_COLORS: Record<number, { hex: string; r: number; g: number; b: number }> = {
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

export interface RefSprites {
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



export async function loadRefSprites(): Promise<RefSprites> {
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

// ─── Draw Ball ────────────────────────────────────────────────────────────────
export function drawBall(
  ctx:        CanvasRenderingContext2D,
  x:          number,
  y:          number,
  r:          number,
  ballNumber: number,
  scale:      number,
  assets?:    PoolAssets | null,
  refSprites?: RefSprites | null,
  alpha      = 1,
  overrideR?: number,
  rotation?:  Vector2,
) {
  const rr       = overrideR ?? r
  const entry    = BALL_COLORS[ballNumber] ?? BALL_COLORS[1]
  const isStripe = ballNumber >= 9
  const isCue    = ballNumber === 0
  const is8      = ballNumber === 8
  const { r: cr, g: cg, b: cb } = entry
  // Spin angle from accumulated rotation
  const spinAngle = rotation ? (rotation.x * 0.5 + rotation.y * 0.3) : 0

  ctx.save()
  if (alpha < 1) ctx.globalAlpha = alpha
  ctx.translate(x, y)

  // Drop shadow
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

  // Clip sphere
  ctx.beginPath()
  ctx.arc(0, 0, rr, 0, Math.PI * 2)
  ctx.clip()

  // Sprite-based rendering
  let drawnSprite = false
  if (refSprites) {
    let sprite: HTMLImageElement | null = null
    if (isCue)            sprite = refSprites.cueBall
    else if (is8)         sprite = refSprites.blackBall
    else if (ballNumber <= 7) sprite = refSprites.redBall
    else                  sprite = refSprites.yellowBall

    if (sprite) {
      ctx.save()
      ctx.rotate(spinAngle)
      ctx.drawImage(sprite, -rr, -rr, rr * 2, rr * 2)
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

  // Procedural Phong fallback
  if (!drawnSprite) {
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
    ctx.rotate(spinAngle)

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
      ctx.font      = `900 ${fontSize}px 'Arial Narrow', Arial, sans-serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(ballNumber), 0, fontSize * 0.05)
      ctx.restore()
    }
    ctx.restore()
  }

  // Shade overlay
  const shade = assets?.images.shade
  if (shade) {
    ctx.save()
    ctx.globalAlpha = (alpha < 1 ? alpha : 1) * 0.34
    ctx.drawImage(shade, -rr, -rr, rr * 2, rr * 2)
    ctx.restore()
  }

  // Soft highlight
  const softHi = ctx.createRadialGradient(-rr*0.26,-rr*0.32,0,-rr*0.14,-rr*0.18,rr*0.82)
  softHi.addColorStop(0,   'rgba(255,255,255,0.72)')
  softHi.addColorStop(0.30,'rgba(255,255,255,0.28)')
  softHi.addColorStop(0.70,'rgba(255,255,255,0.06)')
  softHi.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = softHi
  ctx.fillRect(-rr, -rr, rr * 2, rr * 2)

  // Sharp specular
  const sharp = ctx.createRadialGradient(-rr*0.38,-rr*0.50,0,-rr*0.38,-rr*0.50,rr*0.18)
  sharp.addColorStop(0,   'rgba(255,255,255,1.0)')
  sharp.addColorStop(0.18,'rgba(255,255,255,0.95)')
  sharp.addColorStop(0.55,'rgba(255,255,255,0.45)')
  sharp.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = sharp
  ctx.fillRect(-rr, -rr, rr * 2, rr * 2)

  // AO rim
  const ao = ctx.createRadialGradient(0,0,rr*0.58,0,0,rr)
  ao.addColorStop(0,    'rgba(0,0,0,0)')
  ao.addColorStop(0.52, 'rgba(0,0,0,0.04)')
  ao.addColorStop(0.78, 'rgba(0,0,0,0.38)')
  ao.addColorStop(1,    'rgba(0,0,0,0.90)')
  ctx.fillStyle = ao
  ctx.fillRect(-rr, -rr, rr * 2, rr * 2)

  ctx.restore()

  // Crisp edge stroke
  ctx.save()
  if (alpha < 1) ctx.globalAlpha = alpha
  ctx.beginPath()
  ctx.arc(x, y, rr, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(0,0,0,0.55)'
  ctx.lineWidth   = 1.5
  ctx.stroke()
  ctx.restore()
}

// ─── Draw Table ───────────────────────────────────────────────────────────────
export function drawTable(
  ctx:        CanvasRenderingContext2D,
  assets?:    PoolAssets | null,
  refSprites?: RefSprites | null,
) {
  const W  = TABLE_CONFIG.width
  const H  = TABLE_CONFIG.height
  const C  = TABLE_CONFIG.cushionHeight
  const PR = TABLE_CONFIG.pocketRadius

  const drawPocketCavities = () => {
    POCKET_POSITIONS.forEach(({ x: px, y: py }) => {
      ctx.save()
      const cavity = ctx.createRadialGradient(px, py, 0, px, py, PR + 14)
      cavity.addColorStop(0,   '#000000')
      cavity.addColorStop(0.5, '#050505')
      cavity.addColorStop(0.8, 'rgba(20,10,4,0.97)')
      cavity.addColorStop(1,   'rgba(60,30,8,0.88)')
      ctx.beginPath()
      ctx.arc(px, py, PR + 14, 0, Math.PI * 2)
      ctx.fillStyle = cavity
      ctx.fill()
      ctx.beginPath()
      ctx.arc(px, py, PR * 0.75, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.97)'
      ctx.fill()
      ctx.restore()
    })
  }

  const bg = refSprites?.tableBg
  if (bg) {
    ctx.save()
    ctx.drawImage(bg, 0, 0, W, H)
    ctx.restore()
    drawPocketCavities()
    const pockets = assets?.images.pockets
    if (pockets) { ctx.save(); ctx.drawImage(pockets, 0, 0, W, H); ctx.restore() }
    const tableTop = assets?.images.tableTop
    if (tableTop) { ctx.save(); ctx.globalAlpha = 0.28; ctx.drawImage(tableTop, 0, 0, W, H); ctx.restore() }
    return
  }

  // Procedural fallback
  const railG = ctx.createLinearGradient(0, 0, 0, H)
  railG.addColorStop(0,   '#6B3D1E')
  railG.addColorStop(0.5, '#9B6035')
  railG.addColorStop(1,   '#4A2508')
  ctx.fillStyle = railG
  ctx.beginPath()
  ctx.roundRect(-C * 2.8, -C * 2.8, W + C * 5.6, H + C * 5.6, 28)
  ctx.fill()

  const feltG = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.72)
  feltG.addColorStop(0,   '#2fd06e')
  feltG.addColorStop(0.5, '#188145')
  feltG.addColorStop(1,   '#0b4d29')
  ctx.fillStyle = feltG
  ctx.fillRect(C, C, W - C * 2, H - C * 2)

  const cloth = assets?.images.cloth
  if (cloth) { ctx.save(); ctx.globalAlpha = 0.18; ctx.drawImage(cloth, 0, 0, W, H); ctx.restore() }

  // Head spot & baulk line
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth   = 2
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

  drawPocketCavities()

  const pockets = assets?.images.pockets
  if (pockets) {
    ctx.save(); ctx.drawImage(pockets, 0, 0, W, H); ctx.restore()
  } else {
    POCKET_POSITIONS.forEach(({ x: px, y: py }) => {
      ctx.save()
      ctx.beginPath()
      ctx.arc(px, py, PR + 10, 0, Math.PI * 2)
      ctx.fillStyle = '#5A2E10'
      ctx.fill()
      const pG = ctx.createRadialGradient(px, py, 0, px, py, PR + 6)
      pG.addColorStop(0, '#000000'); pG.addColorStop(0.55,'#0B0B0B')
      pG.addColorStop(0.85,'#1A0E04'); pG.addColorStop(1,'#2E1806')
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
  if (tableTop) { ctx.save(); ctx.globalAlpha = 0.34; ctx.drawImage(tableTop, 0, 0, W, H); ctx.restore() }
}

// ─── Draw Cue Stick ───────────────────────────────────────────────────────────
export function drawCueStick(
  ctx:          CanvasRenderingContext2D,
  cx:           number,
  cy:           number,
  angle:        number,
  distFromBall: number,
  assets?:      PoolAssets | null,
  refSprites?:  RefSprites | null,
) {
  const stickSprite  = refSprites?.stick ?? assets?.images.cue
  const shadowSprite = assets?.images.cueShadow

  if (stickSprite) {
    const scaleRatio = TABLE_CONFIG.width / 1500
    const stickW = stickSprite.width  * scaleRatio
    const stickH = stickSprite.height * scaleRatio

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle + Math.PI)

    if (shadowSprite) {
      const sw = shadowSprite.width  * scaleRatio
      const sh = shadowSprite.height * scaleRatio
      ctx.save()
      ctx.globalAlpha = 0.45
      ctx.drawImage(shadowSprite, distFromBall + 14, -sh / 2 + 6, sw, sh)
      ctx.restore()
    }

    ctx.drawImage(stickSprite, distFromBall, -stickH / 2, stickW, stickH)
    ctx.restore()
    return
  }

  // Procedural cue stick fallback
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

  // Tip
  ctx.beginPath()
  ctx.moveTo(distFromBall,      -tipW / 2)
  ctx.lineTo(distFromBall + 30, -tipW * 0.75)
  ctx.lineTo(distFromBall + 30,  tipW * 0.75)
  ctx.lineTo(distFromBall,        tipW / 2)
  ctx.fillStyle = '#E8F0F8'
  ctx.fill()

  // Shaft
  const shaftG = ctx.createLinearGradient(0, -tipW, 0, tipW)
  shaftG.addColorStop(0,   '#F8EDCF')
  shaftG.addColorStop(0.25,'#EDD89A')
  shaftG.addColorStop(0.70,'#C8A860')
  shaftG.addColorStop(1,   '#8B6918')
  ctx.beginPath()
  ctx.moveTo(distFromBall + 30,    -tipW * 0.75)
  ctx.lineTo(distFromBall + stickLen * 0.58, -tipW * 1.05)
  ctx.lineTo(distFromBall + stickLen * 0.58,  tipW * 1.05)
  ctx.lineTo(distFromBall + 30,     tipW * 0.75)
  ctx.fillStyle = shaftG
  ctx.fill()

  // Wrap rings
  ctx.strokeStyle = 'rgba(100,50,10,0.75)'
  ctx.lineWidth = 2.5
  for (let i = 0; i < 4; i++) {
    const rx = distFromBall + stickLen * 0.54 + i * 9
    const hw = tipW * (1.05 + i * 0.10)
    ctx.beginPath(); ctx.moveTo(rx, -hw); ctx.lineTo(rx, hw); ctx.stroke()
  }

  // Butt
  const buttG = ctx.createLinearGradient(0, -buttW/2, 0, buttW/2)
  buttG.addColorStop(0,   '#8B4010')
  buttG.addColorStop(0.4, '#A85228')
  buttG.addColorStop(1,   '#4A1E06')
  ctx.beginPath()
  ctx.moveTo(distFromBall + stickLen * 0.58, -tipW * 1.05)
  ctx.lineTo(distFromBall + stickLen,         -buttW / 2)
  ctx.lineTo(distFromBall + stickLen,          buttW / 2)
  ctx.lineTo(distFromBall + stickLen * 0.58,  tipW * 1.05)
  ctx.fillStyle = buttG
  ctx.fill()

  ctx.beginPath()
  ctx.arc(distFromBall + stickLen, 0, buttW / 2, 0, Math.PI * 2)
  ctx.fillStyle = '#1A0800'
  ctx.fill()

  // Highlight
  ctx.beginPath()
  ctx.moveTo(distFromBall + 30, -tipW * 0.45)
  ctx.lineTo(distFromBall + stickLen * 0.55, -tipW * 0.65)
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.restore()
  ctx.restore()
}
