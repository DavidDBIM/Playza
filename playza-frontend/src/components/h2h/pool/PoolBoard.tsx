import React, { useRef, useEffect, useState, useCallback } from 'react'
import type { Ball, Vector2, GameState, ShotInput } from './game/pool/types'
import { PoolPhysics, TABLE_CONFIG, predictTrajectory } from './game/pool/physics'

interface PoolBoardProps {
  gameState: GameState
  isMyTurn: boolean
  onShot: (shot: ShotInput) => void
  onBallPlace?: (pos: Vector2) => void
}

const ASSETS = {
  tableTop: '/gameAssets/pool/tableTop.png',
  cloth: '/gameAssets/pool/cloth.png',
  cue: '/gameAssets/pool/cue.png',
  pockets: '/gameAssets/pool/pockets.png',
  shadow: '/gameAssets/pool/shadow.png',
  solids: '/gameAssets/pool/solidsSpriteSheet.png',
  stripeBase: '/gameAssets/pool/ballSpriteSheet', // ballSpriteSheet9.png etc
}

const PoolBoard: React.FC<PoolBoardProps> = ({ gameState, isMyTurn, onShot, onBallPlace }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({})
  const [aimAngle, setAimAngle] = useState(0)
  const [power, setPower] = useState(0)
  const [isCharging, setIsCharging] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [localBalls, setLocalBalls] = useState<Ball[]>(gameState.balls)
  const [dragStart, setDragStart] = useState<Vector2 | null>(null)
  const [isStriking, setIsStriking] = useState(false)
  const [strikeOffset, setStrikeOffset] = useState(0)
  const [isDraggingBall, setIsDraggingBall] = useState(false)
  const physicsRef = useRef<PoolPhysics | null>(null)

  // Load assets
  useEffect(() => {
    const toLoad: Record<string, string> = { ...ASSETS }
    for (let i = 9; i <= 15; i++) {
      toLoad[`stripe${i}`] = `${ASSETS.stripeBase}${i}.png`
    }

    const loaded: Record<string, HTMLImageElement> = {}
    let loadedCount = 0
    const keys = Object.keys(toLoad)

    keys.forEach((key) => {
      const img = new Image()
      img.src = toLoad[key]
      img.onload = () => {
        loaded[key] = img
        loadedCount++
        if (loadedCount === keys.length) {
          setImages({ ...loaded })
        }
      }
      img.onerror = () => {
        loadedCount++
        if (loadedCount === keys.length) {
          setImages({ ...loaded })
        }
      }
    })
  }, [])

  useEffect(() => {
    if (!isSimulating) {
      const initialized = gameState.balls.map(b => ({
          ...b,
          rotation: b.rotation || { x: 0, y: 0 }
      }))
      setLocalBalls(initialized)
    }
  }, [gameState.balls, isSimulating])

  const [scale, setScale] = useState(1)

  const updateScale = useCallback(() => {
    if (!canvasRef.current) return
    const container = canvasRef.current.parentElement
    if (!container) return
    const containerWidth = container.clientWidth
    const newScale = containerWidth / TABLE_CONFIG.width
    setScale(newScale)
    canvasRef.current.width = TABLE_CONFIG.width * newScale
    canvasRef.current.height = TABLE_CONFIG.height * newScale
  }, [])

  useEffect(() => {
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [updateScale])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Even if images aren't fully loaded, we should see SOMETHING if some are there
    // Or at least clear the screen
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (Object.keys(images).length === 0) {
        // Show status on canvas if loading
        ctx.fillStyle = '#fff'
        ctx.font = '20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Loading Assets...', canvas.width/2, canvas.height/2)
        return
    }

    ctx.save()
    ctx.scale(scale, scale)

    // 1. Draw Table Cloth
    if (images.cloth) {
        ctx.drawImage(images.cloth, 0, 0, TABLE_CONFIG.width, TABLE_CONFIG.height)
    } else {
        ctx.fillStyle = '#065f46'
        ctx.fillRect(0, 0, TABLE_CONFIG.width, TABLE_CONFIG.height)
    }

    // 2. Table Frame (Frame/Rails)
    if (images.tableTop) {
        ctx.drawImage(images.tableTop, 0, 0, TABLE_CONFIG.width, TABLE_CONFIG.height)
    }

    // 3. Draw Pockets (Inside the holes)
    const pockets = [
      { x: 0, y: 0 },
      { x: TABLE_CONFIG.width / 2, y: 0 },
      { x: TABLE_CONFIG.width, y: 0 },
      { x: 0, y: TABLE_CONFIG.height },
      { x: TABLE_CONFIG.width / 2, y: TABLE_CONFIG.height },
      { x: TABLE_CONFIG.width, y: TABLE_CONFIG.height },
    ]
    if (images.pockets) {
        pockets.forEach(p => {
            const size = TABLE_CONFIG.pocketRadius * 3 // Slightly larger for visual fit
            ctx.drawImage(images.pockets, p.x - size/2, p.y - size/2, size, size)
        })
    }

    // 4. Draw Balls
    localBalls.forEach((ball) => {
      if (ball.pocketed) return

      ctx.save()
      ctx.translate(ball.position.x, ball.position.y)

      // Shadow
      if (images.shadow) {
          ctx.drawImage(images.shadow, -TABLE_CONFIG.ballRadius, -TABLE_CONFIG.ballRadius, TABLE_CONFIG.ballRadius * 2.5, TABLE_CONFIG.ballRadius * 2.5)
      }

      // 3D Ball Rendering
      const r = TABLE_CONFIG.ballRadius
      const rotation = ball.rotation || { x: 0, y: 0 }
      
      let rendered = false;
      if (ball.number <= 8) {
          if (images.solids) {
              // 3x3 Grid Layout
              const sW = images.solids.width / 3
              const sH = images.solids.height / 3
              const col = ball.number % 3
              const row = Math.floor(ball.number / 3)
              // Add a 1px margin to source rect to avoid bleeding "white caps"
              ctx.drawImage(
                  images.solids,
                  col * sW + 1, row * sH + 1, sW - 2, sH - 2,
                  -r, -r, r * 2, r * 2
              )
              rendered = true;
          }
      } else {
          const stripeImg = images[`stripe${ball.number}`]
          if (stripeImg) {
              // 42 frames in a 5-column grid (5x9)
              const totalRot = (rotation.x + rotation.y) * 15
              const frameIndex = Math.floor(Math.abs(totalRot) % 42)
              const sW = stripeImg.width / 5
              const sH = stripeImg.height / 9
              const col = frameIndex % 5
              const row = Math.floor(frameIndex / 5)
              // Add 1px margin to source rect to avoid bleeding
              ctx.drawImage(
                  stripeImg,
                  col * sW + 1, row * sH + 1, sW - 2, sH - 2,
                  -r, -r, r * 2, r * 2
              )
              rendered = true;
          }
      }

      // Fallback if images didn't load
      if (!rendered) {
        ctx.fillStyle = ball.number === 0 ? '#fff' : (ball.number === 8 ? '#000' : '#f00')
        ctx.beginPath()
        ctx.arc(0, 0, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = ball.number === 0 ? '#000' : '#fff'
        ctx.font = '10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(ball.number.toString(), 0, 4)
      }

      ctx.restore()
    })

    // 5. Aiming Line & Cue Stick (Show even during foul as long as it's our turn)
    if (isMyTurn && !isSimulating && !isStriking) {
      const cueBall = localBalls.find((b) => b.id === 'cue')
      if (cueBall && !cueBall.pocketed) {
        const trajectory = predictTrajectory(cueBall, localBalls, aimAngle, power)
        
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(cueBall.position.x, cueBall.position.y)
        trajectory.points.forEach((p: Vector2) => ctx.lineTo(p.x, p.y))
        ctx.stroke()
        ctx.setLineDash([])

        // Hit point and ghost ball
        if (trajectory.hitPoint) {
            ctx.save()
            ctx.globalAlpha = 0.4
            
            // Render Ghost Cue Ball (Ball 0 at Col 0, Row 0 in 3x3 grid) - add 1px padding
            if (images.solids) {
                const sW = images.solids.width / 3
                const sH = images.solids.height / 3
                ctx.drawImage(
                    images.solids,
                    1, 1, sW - 2, sH - 2,
                    trajectory.hitPoint.x - TABLE_CONFIG.ballRadius, 
                    trajectory.hitPoint.y - TABLE_CONFIG.ballRadius, 
                    TABLE_CONFIG.ballRadius * 2, TABLE_CONFIG.ballRadius * 2
                )
            } else {
                ctx.strokeStyle = 'rgba(255,255,255,0.8)'
                ctx.beginPath()
                ctx.arc(trajectory.hitPoint.x, trajectory.hitPoint.y, TABLE_CONFIG.ballRadius, 0, Math.PI * 2)
                ctx.stroke()
            }
            ctx.restore()

            // Target ball destination marker
            if (trajectory.targetPath) {
                ctx.save()
                ctx.strokeStyle = '#fbbf24'
                ctx.setLineDash([2, 5])
                ctx.beginPath()
                ctx.moveTo(trajectory.targetPath[0].x, trajectory.targetPath[0].y)
                ctx.lineTo(trajectory.targetPath[1].x, trajectory.targetPath[1].y)
                ctx.stroke()
                
                // End circle
                ctx.beginPath()
                ctx.arc(trajectory.targetPath[1].x, trajectory.targetPath[1].y, TABLE_CONFIG.ballRadius * 0.5, 0, Math.PI * 2)
                ctx.stroke()
                ctx.restore()
            }
        }

        if (images.cue) {
            const stickLength = 600
            const stickDist = 40 + (isCharging ? power / 50 : 0)
            ctx.save()
            ctx.translate(cueBall.position.x, cueBall.position.y)
            ctx.rotate(aimAngle + Math.PI)
            ctx.drawImage(images.cue, stickDist, -10, stickLength, 20)
            ctx.restore()
        } else {
            // Fallback stick
            const stickLength = 400
            const stickDist = 40 + (isCharging ? power / 50 : 0)
            ctx.save()
            ctx.translate(cueBall.position.x, cueBall.position.y)
            ctx.rotate(aimAngle + Math.PI)
            ctx.fillStyle = '#d97706'
            ctx.fillRect(stickDist, -4, stickLength, 8)
            ctx.restore()
        }
      }
    }

    // Cue Stick during Strike
    if (isStriking && images.cue) {
        const cueBall = localBalls.find((b) => b.id === 'cue')
        if (cueBall) {
            ctx.save()
            ctx.translate(cueBall.position.x, cueBall.position.y)
            ctx.rotate(aimAngle + Math.PI)
            ctx.drawImage(images.cue, strikeOffset + 40, -10, 600, 20)
            ctx.restore()
        }
    }

    ctx.restore()
  }, [localBalls, images, scale, isMyTurn, isSimulating, isStriking, strikeOffset, aimAngle, power, isCharging])

  const startSimulation = useCallback(() => {
    setIsSimulating(true)
    const physics = new PoolPhysics(localBalls)
    physics.applyShot(aimAngle, power)
    physicsRef.current = physics
  }, [localBalls, aimAngle, power])

  useEffect(() => {
    let frameId: number
    const loop = () => {
      if (isStriking) {
          setStrikeOffset(prev => {
              // Speed proportional to power
              const speed = Math.max(20, power / 40)
              const next = prev - speed
              if (next <= 0) {
                  setIsStriking(false)
                  startSimulation()
                  return 0
              }
              return next
          })
      }

      if (isSimulating && physicsRef.current) {
          // Physics Sub-stepping for precision (4 steps per frame)
          let stillMoving = false
          for (let i = 0; i < 4; i++) {
              if (physicsRef.current.step()) {
                  stillMoving = true
              }
          }
          
          setLocalBalls([...physicsRef.current.getBalls()])
          
          if (!stillMoving) {
              setIsSimulating(false)
              onShot({ angle: aimAngle, power, spin: { x: 0, y: 0 } })
          }
      }

      draw()
      frameId = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(frameId)
  }, [draw, isStriking, isSimulating, aimAngle, power, onShot, startSimulation])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isMyTurn || isSimulating) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    if (gameState.ballInHand) {
        const cueBall = localBalls.find(b => b.id === 'cue')
        if (cueBall) {
            const dist = Math.sqrt((x - cueBall.position.x)**2 + (y - cueBall.position.y)**2)
            if (dist < TABLE_CONFIG.ballRadius * 2) {
                setIsDraggingBall(true)
                return
            }
        }
    }

    setDragStart({ x, y })
    setIsCharging(true)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isMyTurn || isSimulating) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    if (isDraggingBall) {
        const cushion = TABLE_CONFIG.cushionHeight + TABLE_CONFIG.ballRadius
        const clampedX = Math.max(cushion, Math.min(TABLE_CONFIG.width - cushion, x))
        const clampedY = Math.max(cushion, Math.min(TABLE_CONFIG.height - cushion, y))
        
        setLocalBalls(prev => prev.map(b => 
            b.id === 'cue' ? { ...b, position: { x: clampedX, y: clampedY }, pocketed: false } : b
        ))
        return
    }

    if (!dragStart) return

    const cueBall = localBalls.find((b) => b.id === 'cue')
    if (cueBall) {
        const dx = x - cueBall.position.x
        const dy = y - cueBall.position.y
        setAimAngle(Math.atan2(dy, dx))
    }

    if (isCharging) {
        const dist = Math.sqrt((x - dragStart.x) ** 2 + (y - dragStart.y) ** 2)
        setPower(Math.min(dist * 10, 3000))
    }
  }

  const handlePointerUp = () => {
    if (isDraggingBall) {
        setIsDraggingBall(false)
        const cueBall = localBalls.find(b => b.id === 'cue')
        if (cueBall && onBallPlace) {
            onBallPlace(cueBall.position)
        }
        return
    }

    if (isCharging && power > 200) {
      executeShotLocal()
    }
    setIsCharging(false)
    setDragStart(null)
    setPower(0)
  }

  const executeShotLocal = () => {
    const cueBall = localBalls.find((b) => b.id === 'cue')
    if (!cueBall) return

    setIsStriking(true)
    setStrikeOffset(power / 50)
  }

  return (
    <div className="w-full bg-slate-950 rounded-2xl overflow-hidden border-8 border-amber-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative select-none touch-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-auto cursor-crosshair bg-[#064e3b]"
      />
      {isCharging && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-64 bg-black/60 rounded-full overflow-hidden border-2 border-white/30 backdrop-blur-sm shadow-inner">
          <div 
            className="absolute bottom-0 w-full bg-linear-to-t from-red-600 via-yellow-500 to-emerald-500 transition-all duration-75"
            style={{ '--power-height': `${(power / 3000) * 100}%`, height: 'var(--power-height)' } as React.CSSProperties}
          />
        </div>
      )}
      {!isMyTurn && !isSimulating && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white/50 text-sm font-medium">
              Opponent's Turn
          </div>
      )}
    </div>
  )
}

export default PoolBoard
