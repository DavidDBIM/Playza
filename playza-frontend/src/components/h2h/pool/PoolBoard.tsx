import React, { useRef, useEffect, useCallback, useState } from 'react'
import type { Ball, Vector2, GameState, ShotInput } from './game/pool/types'
import { PoolPhysics, TABLE_CONFIG, predictTrajectory, POCKET_POSITIONS } from './game/pool/physics'
import { loadPoolAssets, type PoolAssets } from './game/pool/assets'
import { drawBall, drawTable, drawCueStick, loadRefSprites, type RefSprites } from './game/pool/draw'

interface PoolBoardProps {
  gameState: GameState
  isMyTurn: boolean
  onShot: (shot: ShotInput) => void
  onBallPlace?: (pos: Vector2) => void
}

const POCKET_SAFE_RADIUS       = TABLE_CONFIG.pocketRadius + TABLE_CONFIG.ballRadius * 0.45
const BALL_PLACEMENT_CLEARANCE = TABLE_CONFIG.ballRadius * 2.05

function isInsidePocketMouth(position: Vector2, buffer = 0) {
  return POCKET_POSITIONS.some((p) =>
    Math.hypot(position.x - p.x, position.y - p.y) < POCKET_SAFE_RADIUS + buffer,
  )
}

function isCueBallPlacementValid(position: Vector2, balls: Ball[]) {
  if (isInsidePocketMouth(position, TABLE_CONFIG.ballRadius * 0.2)) return false
  return balls.every((b) => {
    if (b.id === 'cue' || b.pocketed) return true
    return Math.hypot(position.x - b.position.x, position.y - b.position.y) >= BALL_PLACEMENT_CLEARANCE
  })
}

function findLegalCueBallPosition(position: Vector2, balls: Ball[]) {
  const c = TABLE_CONFIG.cushionHeight + TABLE_CONFIG.ballRadius
  const clamped = {
    x: Math.max(c, Math.min(TABLE_CONFIG.width  - c, position.x)),
    y: Math.max(c, Math.min(TABLE_CONFIG.height - c, position.y)),
  }
  if (isCueBallPlacementValid(clamped, balls)) return clamped
  const maxR = TABLE_CONFIG.ballRadius * 12
  for (let r = TABLE_CONFIG.ballRadius * 0.5; r <= maxR; r += TABLE_CONFIG.ballRadius * 0.5) {
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      const cand = {
        x: Math.max(c, Math.min(TABLE_CONFIG.width  - c, clamped.x + Math.cos(a) * r)),
        y: Math.max(c, Math.min(TABLE_CONFIG.height - c, clamped.y + Math.sin(a) * r)),
      }
      if (isCueBallPlacementValid(cand, balls)) return cand
    }
  }
  return clamped
}

function playSound(audio: HTMLAudioElement | undefined, volume?: number) {
  if (!audio) return
  try {
    const clone = audio.cloneNode(true) as HTMLAudioElement
    if (volume !== undefined) clone.volume = Math.min(1, Math.max(0, volume))
    void clone.play()
  } catch { /* autoplay blocked */ }
}

interface PocketingBall {
  id: string; number: number
  startPos: Vector2; pocketPos: Vector2
  progress: number
}

const PoolBoard: React.FC<PoolBoardProps> = ({ gameState, isMyTurn, onShot, onBallPlace }) => {
  const canvasRef        = useRef<HTMLCanvasElement>(null)
  const scaleRef         = useRef(1)
  const dprRef           = useRef(1)
  const assetsRef        = useRef<PoolAssets | null>(null)
  const refSpritesRef    = useRef<RefSprites | null>(null)

  const [uiPower,    setUiPower]    = useState(0)
  const [isCharging, setIsCharging] = useState(false)

  const aimAngleRef        = useRef(0)
  const powerRef           = useRef(0)
  const isChargingRef      = useRef(false)
  const isSimulatingRef    = useRef(false)
  const isStrikingRef      = useRef(false)
  const strikeFrameRef     = useRef(0)
  const strikeInitOffRef   = useRef(0)
  const strikeOffsetRef    = useRef(0)
  const localBallsRef      = useRef<Ball[]>(
    gameState.balls.map((b) => ({ ...b, rotation: b.rotation || { x: 0, y: 0 } })),
  )
  const physicsRef         = useRef<PoolPhysics | null>(null)
  const dragStartRef       = useRef<Vector2 | null>(null)
  const isDraggingBallRef  = useRef(false)
  const isMyTurnRef        = useRef(isMyTurn)
  const onShotRef          = useRef(onShot)
  const onBallPlaceRef     = useRef(onBallPlace)
  const gameStateRef       = useRef(gameState)
  const frameIdRef         = useRef(0)
  const prevPocketedRef    = useRef<Set<string>>(new Set())
  const pocketingBallsRef  = useRef<PocketingBall[]>([])
  const pendingBallsRef    = useRef<Ball[] | null>(null)
  const shotSentRef        = useRef(false)
  const lastBallHitRef     = useRef(0)
  const lastCushionHitRef  = useRef(0)
  // Camera shake
  const shakeRef           = useRef(0)

  const STRIKE_FRAMES = 8
  const MAX_POWER     = 5200

  useEffect(() => { isMyTurnRef.current   = isMyTurn   }, [isMyTurn])
  useEffect(() => { onShotRef.current     = onShot     }, [onShot])
  useEffect(() => { onBallPlaceRef.current = onBallPlace }, [onBallPlace])
  useEffect(() => { gameStateRef.current  = gameState  }, [gameState])

  useEffect(() => {
    const prevRot = new Map(localBallsRef.current.map((b) => [b.id, b.rotation]))
    const mapped  = gameState.balls.map((b) => ({
      ...b,
      rotation: b.rotation || prevRot.get(b.id) || { x: 0, y: 0 },
      velocity: b.velocity || { x: 0, y: 0 },
    }))
    if (isSimulatingRef.current) {
      pendingBallsRef.current = mapped
    } else {
      localBallsRef.current = mapped
    }
  }, [gameState.balls])

  useEffect(() => {
    if (isSimulatingRef.current) return
    const cue = localBallsRef.current.find((b) => b.id === 'cue' && !b.pocketed)
    if (!cue) return
    const rack = { x: TABLE_CONFIG.width * 0.73, y: TABLE_CONFIG.height / 2 }
    aimAngleRef.current = Math.atan2(rack.y - cue.position.y, rack.x - cue.position.x)
  }, [gameState.currentPlayer, gameState.shotCount, gameState.ballInHand])

  const updateScale = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    if (!container) return
    const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1))
    dprRef.current   = dpr
    const newScale   = container.clientWidth / TABLE_CONFIG.width
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
    Promise.allSettled([loadPoolAssets(), loadRefSprites()]).then(([pool, ref]) => {
      if (cancelled) return
      if (pool.status === 'fulfilled') assetsRef.current     = pool.value
      if (ref.status  === 'fulfilled') refSpritesRef.current = ref.value
    })
    return () => { cancelled = true }
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx   = canvas.getContext('2d')
    if (!ctx)   return
    const scale = scaleRef.current
    const dpr   = dprRef.current

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()

    // Camera shake
    const shake = shakeRef.current
    const sx = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0
    const sy = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, sx * scale * dpr, sy * scale * dpr)

    drawTable(ctx, assetsRef.current, refSpritesRef.current)

    const balls      = localBallsRef.current
    const myTurn     = isMyTurnRef.current
    const simulating = isSimulatingRef.current
    const striking   = isStrikingRef.current
    const angle      = aimAngleRef.current
    const power      = powerRef.current
    const charging   = isChargingRef.current

    // Motion glow + live balls
    balls.forEach((ball) => {
      if (ball.pocketed) return
      const spd = Math.hypot(ball.velocity.x, ball.velocity.y)
      if (spd > 5 && ball.id !== 'cue') {
        ctx.save()
        const glowAlpha = Math.min(0.80, (spd - 5) / 16)
        ctx.beginPath()
        ctx.arc(ball.position.x, ball.position.y, TABLE_CONFIG.ballRadius + 9, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255,220,60,${glowAlpha})`
        ctx.lineWidth = 6
        ctx.stroke()
        ctx.restore()
      }
      drawBall(
        ctx, ball.position.x, ball.position.y,
        TABLE_CONFIG.ballRadius, ball.number,
        scale, assetsRef.current, refSpritesRef.current,
        1, undefined, ball.rotation,
      )
    })

    // Pocket-entry drop animations
    pocketingBallsRef.current.forEach((pb) => {
      const t   = Math.min(pb.progress, 1)
      const eT  = t * t
      const pos = {
        x: pb.startPos.x + (pb.pocketPos.x - pb.startPos.x) * eT,
        y: pb.startPos.y + (pb.pocketPos.y - pb.startPos.y) * eT,
      }
      const rr    = TABLE_CONFIG.ballRadius * (1 - eT * 0.88)
      const alpha = 1 - eT * 0.92
      if (rr > 1.5) {
        drawBall(ctx, pos.x, pos.y, TABLE_CONFIG.ballRadius, pb.number, scale,
          assetsRef.current, refSpritesRef.current, alpha, rr)
      }
    })

    const cueBall = balls.find((b) => b.id === 'cue')

    if (!simulating && cueBall && !cueBall.pocketed) {
      if (myTurn) {
        // Trajectory line
        const traj = predictTrajectory(cueBall, balls, angle, Math.max(power, 100))
        ctx.save()
        const dotted = assetsRef.current?.images.dottedLine
        if (dotted) {
          const pat = ctx.createPattern(dotted, 'repeat')
          if (pat && 'setTransform' in pat) {
            ;(pat as CanvasPattern).setTransform(new DOMMatrix([0.55, 0, 0, 0.55, 0, 0]))
          }
          ctx.strokeStyle = pat || 'rgba(255,255,255,0.35)'
          ctx.lineWidth   = 4
          ctx.globalAlpha = 0.72
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.35)'
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
          drawBall(ctx, traj.hitPoint.x, traj.hitPoint.y,
            TABLE_CONFIG.ballRadius, 0, scale, assetsRef.current, refSpritesRef.current)
          ctx.restore()

          if (traj.targetPath) {
            ctx.strokeStyle = '#facc15'
            ctx.lineWidth   = 2.5
            ctx.globalAlpha = 0.72
            ctx.setLineDash([4, 7])
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
          ctx.lineWidth   = 5
          ctx.globalAlpha = 0.88
          ctx.beginPath()
          ctx.arc(cueBall.position.x, cueBall.position.y,
            TABLE_CONFIG.ballRadius + 13, -Math.PI / 2, -Math.PI / 2 + sweep)
          ctx.stroke()
          ctx.restore()
        }
      }

      if (!striking) {
        const pullback = TABLE_CONFIG.ballRadius + 10 +
          (myTurn && charging ? Math.min(power / 22, 92) : 14)
        drawCueStick(ctx, cueBall.position.x, cueBall.position.y, angle,
          pullback, assetsRef.current, refSpritesRef.current)
      }
    }

    if (striking && cueBall) {
      drawCueStick(ctx, cueBall.position.x, cueBall.position.y, angle,
        TABLE_CONFIG.ballRadius + 6 + strikeOffsetRef.current,
        assetsRef.current, refSpritesRef.current)
    }

    ctx.restore()
  }, [])

  // Game loop
  useEffect(() => {
    const loop = () => {
      // Decay camera shake
      if (shakeRef.current > 0) shakeRef.current = Math.max(0, shakeRef.current - 0.6)

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
          physicsRef.current      = physics
          isSimulatingRef.current = true
          prevPocketedRef.current = new Set(localBallsRef.current.filter((b) => b.pocketed).map((b) => b.id))
          pocketingBallsRef.current = []

          if (!shotSentRef.current) {
            shotSentRef.current = true
            onShotRef.current({ angle: aimAngleRef.current, power: powerRef.current, spin: { x: 0, y: 0 } })
            const vol = Math.min(1, powerRef.current / MAX_POWER)
            playSound(assetsRef.current?.audio.cueHit, vol)
            // Trigger camera shake proportional to power
            shakeRef.current = Math.min(18, (powerRef.current / MAX_POWER) * 22)
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

        const preVels = new Map(ballsNow.map((b) => [b.id, { ...b.velocity }]))

        let moving = false
        for (let i = 0; i < substeps; i++) {
          if (physicsRef.current.step(dt)) moving = true
        }

        const nextBalls = physicsRef.current.getBalls()
        const now       = performance.now()

        // Ball–ball collision sounds
        nextBalls.forEach((b1) => {
          if (b1.pocketed) return
          nextBalls.forEach((b2) => {
            if (b1 === b2 || b2.pocketed) return
            const dist = Math.hypot(b1.position.x - b2.position.x, b1.position.y - b2.position.y)
            if (dist < TABLE_CONFIG.ballRadius * 2.1) {
              const pre1  = preVels.get(b1.id)
              const pre2  = preVels.get(b2.id)
              if (!pre1 || !pre2) return
              const p = (Math.abs(pre1.x) + Math.abs(pre1.y) + Math.abs(pre2.x) + Math.abs(pre2.y)) * 0.00482
              if (p > 0.05 && now - lastBallHitRef.current > 80) {
                lastBallHitRef.current = now
                playSound(assetsRef.current?.audio.ballHit, Math.min(1, p / 20))
              }
            }
          })
        })

        // Cushion sounds
        nextBalls.forEach((b) => {
          if (b.pocketed) return
          const pre = preVels.get(b.id)
          if (!pre) return
          const hitX = Math.sign(pre.x) !== Math.sign(b.velocity.x) && Math.abs(pre.x) > 0.5
          const hitY = Math.sign(pre.y) !== Math.sign(b.velocity.y) && Math.abs(pre.y) > 0.5
          if ((hitX || hitY) && now - lastCushionHitRef.current > 60) {
            lastCushionHitRef.current = now
            const vol = Math.min(1, (Math.abs(pre.x) + Math.abs(pre.y)) * 0.003)
            playSound(assetsRef.current?.audio.cushionHit, vol)
          }
        })

        // Pocket animations + sounds
        nextBalls.forEach((ball) => {
          if (ball.pocketed && !prevPocketedRef.current.has(ball.id)) {
            prevPocketedRef.current.add(ball.id)
            playSound(assetsRef.current?.audio.pocketHit, 0.5)
            const pocket = POCKET_POSITIONS.reduce((best, p) => {
              const d  = Math.hypot(ball.position.x - p.x, ball.position.y - p.y)
              const bd = Math.hypot(ball.position.x - best.x, ball.position.y - best.y)
              return d < bd ? p : best
            }, POCKET_POSITIONS[0])
            pocketingBallsRef.current.push({
              id: ball.id, number: ball.number,
              startPos: { ...ball.position }, pocketPos: { ...pocket },
              progress: 0,
            })
          }
        })

        localBallsRef.current = [...nextBalls]
        pocketingBallsRef.current = pocketingBallsRef.current
          .map((pb) => ({ ...pb, progress: pb.progress + 0.062 }))
          .filter((pb) => pb.progress < 1)

        if (!moving) {
          isSimulatingRef.current = false
          if (pendingBallsRef.current) {
            localBallsRef.current = pendingBallsRef.current
            pendingBallsRef.current = null
          }
        }
      }

      draw()
      frameIdRef.current = requestAnimationFrame(loop)
    }

    frameIdRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameIdRef.current)
  }, [draw])

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
      const cue = localBallsRef.current.find((b) => b.id === 'cue')
      if (cue && Math.hypot(pos.x - cue.position.x, pos.y - cue.position.y) < TABLE_CONFIG.ballRadius * 3.5) {
        isDraggingBallRef.current = true
        return
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
      const legal = findLegalCueBallPosition(pos, localBallsRef.current)
      localBallsRef.current = localBallsRef.current.map((b) =>
        b.id === 'cue' ? { ...b, position: legal, pocketed: false } : b,
      )
      return
    }

    const cue = localBallsRef.current.find((b) => b.id === 'cue')
    if (cue) aimAngleRef.current = Math.atan2(pos.y - cue.position.y, pos.x - cue.position.x)

    if (isChargingRef.current && dragStartRef.current) {
      const dist    = Math.hypot(pos.x - dragStartRef.current.x, pos.y - dragStartRef.current.y)
      const t       = Math.min(dist / 220, 1)
      const curved  = Math.pow(t, 1.12)
      powerRef.current = curved * MAX_POWER
      setUiPower(powerRef.current)
    }
  }

  const handlePointerUp = () => {
    if (isDraggingBallRef.current) {
      isDraggingBallRef.current = false
      const cue = localBallsRef.current.find((b) => b.id === 'cue')
      if (cue && onBallPlaceRef.current) {
        const legal = findLegalCueBallPosition(cue.position, localBallsRef.current)
        localBallsRef.current = localBallsRef.current.map((b) =>
          b.id === 'cue' ? { ...b, position: legal, pocketed: false } : b,
        )
        onBallPlaceRef.current(legal)
      }
      return
    }

    if (isChargingRef.current && powerRef.current > 60) {
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

      {!isMyTurn && (
        <div className="absolute top-4 right-4 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white/50 text-xs font-semibold tracking-wider">
          Opponent's Turn
        </div>
      )}

      {isMyTurn && gameState.ballInHand && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-amber-500/80 backdrop-blur-md text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg border border-amber-300/30 animate-pulse">
          🎱 Ball in Hand — Drag the cue ball to place it
        </div>
      )}
    </div>
  )
}

export default PoolBoard
