import Phaser from 'phaser'
import { TABLE_CONFIG, PHYSICS_CONFIG, COLORS } from './config'
import { CueStick } from './CueStick'
import type { GameState, PlayerType } from './types'
import { SocketManager } from './SocketManager'

interface PoolSceneCallbacks {
  onShot: (angle: number, power: number, spin: { x: number; y: number }) => void
  onBallInHand: (position: { x: number; y: number }) => void
}


export class PoolScene extends Phaser.Scene {
  private balls: Phaser.Physics.Arcade.Sprite[] = []
  private cueBall!: Phaser.Physics.Arcade.Sprite
  private cueStick!: CueStick
  private isAiming = false
  private aimAngle = 0
  private power = 0
  private spin = { x: 0, y: 0 }
  private isMyTurn = false
  private socketManager: SocketManager | null = null
  private callbacks: PoolSceneCallbacks | null = null

  private tableGraphics!: Phaser.GameObjects.Graphics
  private pockets: Phaser.GameObjects.Arc[] = []
  private predictionLine!: Phaser.GameObjects.Graphics


  constructor() {
    super({ key: 'PoolScene' })
  }

  preload() {
    // Create a procedural ball texture (white circle)
    const graphics = this.make.graphics({ x: 0, y: 0 }, false)
    graphics.fillStyle(0xffffff)
    graphics.fillCircle(16, 16, 16)
    graphics.generateTexture('ball', 32, 32)
  }

  init() {
    this.input.on('pointerdown', this.startAim, this)
    this.input.on('pointerup', this.endAim, this)
    this.input.on('pointermove', this.updateAim, this)
  }

  create() {
    this.createTable()
    this.createPockets()
    this.createBalls()
    this.createCueStick()
    this.createPredictionLine()
    this.setupSocketListeners()
  }

  private createTable() {
    const { width, height } = TABLE_CONFIG
    const offsetX = (this.cameras.main.width - width) / 2
    const offsetY = (this.cameras.main.height - height) / 2

    this.tableGraphics = this.add.graphics()

    this.tableGraphics.fillStyle(0x1a1a2e)
    this.tableGraphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height)

    this.tableGraphics.fillStyle(COLORS.table)
    this.tableGraphics.fillRoundedRect(offsetX, offsetY, width, height, 8)

    this.tableGraphics.lineStyle(4, COLORS.cushion)
    this.tableGraphics.strokeRoundedRect(
      offsetX + TABLE_CONFIG.cushionWidth,
      offsetY + TABLE_CONFIG.cushionWidth,
      width - TABLE_CONFIG.cushionWidth * 2,
      height - TABLE_CONFIG.cushionWidth * 2,
      4
    )
  }

  private createPockets() {
    const { width, height } = TABLE_CONFIG
    const offsetX = (this.cameras.main.width - width) / 2
    const offsetY = (this.cameras.main.height - height) / 2

    const pocketPositions = [
      { x: offsetX, y: offsetY },
      { x: offsetX + width / 2, y: offsetY },
      { x: offsetX + width, y: offsetY },
      { x: offsetX, y: offsetY + height },
      { x: offsetX + width / 2, y: offsetY + height },
      { x: offsetX + width, y: offsetY + height },
    ]

    for (const pos of pocketPositions) {
      const pocket = this.add.arc(
        pos.x,
        pos.y,
        TABLE_CONFIG.pocketRadius,
        0,
        Math.PI * 2,
        true,
        COLORS.pocket
      ) as Phaser.GameObjects.Arc
      pocket.setFillStyle(Phaser.Display.Color.GetColor(10, 10, 10))
      this.pockets.push(pocket)
    }
  }

  private createBalls() {
    const { width, height } = TABLE_CONFIG
    const offsetX = (this.cameras.main.width - width) / 2
    const offsetY = (this.cameras.main.height - height) / 2
    const ballRadius = TABLE_CONFIG.ballRadius

    const ballColors = [
      0xffffff,
      0xf4d03f, 0x1e3799, 0xe74c3c, 0x6c3483, 0xe67e22, 0x27ae60, 0x782d31, 0x1a1a1a,
      0xf4d03f, 0x4a69bd, 0xeb4d4b, 0xa569bd, 0xe67e22, 0x2ecc71, 0x9b2335,
    ]

    for (let i = 0; i < 16; i++) {
      const x = offsetX + width * 0.25 + i * 0.1
      const y = offsetY + height / 2

      const ball = this.physics.add.sprite(x, y, 'ball')
      ball.setCircle(ballRadius)
      ball.setBounce(PHYSICS_CONFIG.restitution)
      ball.setCollideWorldBounds(false)
      ball.setFriction(0.01)
      ball.setDrag(0.02)

      if (i === 0) {
        this.cueBall = ball
        ball.setTint(ballColors[i])
      } else {
        ball.setTint(ballColors[i])
        ball.setData('ballNumber', i)
      }

      this.balls.push(ball)
    }

    this.physics.add.collider(this.balls, this.balls, () => {
      // Ball collision logic can be added here (e.g. sound effects)
    }, undefined, this)
  }

  private createCueStick() {
    this.cueStick = new CueStick(this, this.cameras.main.width / 2, this.cameras.main.height - 80)
    this.cueStick.setVisible(false)
  }

  private createPredictionLine() {
    this.predictionLine = this.add.graphics()
  }

  private setupSocketListeners() {
    if (!this.socketManager) return

    this.socketManager.on('game_update', (data: { gameState: GameState }) => {
      this.updateGameState(data.gameState)
    })

    this.socketManager.on('turn_change', (data: { player: PlayerType }) => {
      this.isMyTurn = data.player === 'host'
    })


    this.socketManager.on('ball_pocketed', (data: { balls: string[] }) => {
      this.handlePocketedBalls(data.balls)
    })

    this.socketManager.on('foul', () => {
      this.handleFoul()
    })
  }

  private startAim() {
    if (!this.isMyTurn || this.isBallsMoving()) return

    this.isAiming = true
    this.cueStick.setVisible(true)
    this.updateCueStickPosition()
  }

  private updateAim(pointer: Phaser.Input.Pointer) {
    if (!this.isAiming || !this.cueBall) return

    const dx = pointer.x - this.cueBall.x
    const dy = pointer.y - this.cueBall.y
    this.aimAngle = Math.atan2(dy, dx)

    this.power = Math.min(Math.sqrt(dx * dx + dy * dy) / 3, 100)

    this.updateCueStick()
    this.updatePredictionLine()
  }

  private endAim() {
    if (!this.isAiming) return

    this.isAiming = false
    this.cueStick.setVisible(false)
    this.predictionLine.clear()

    if (this.power > 10 && this.callbacks) {
      const adjustedAngle = this.aimAngle + Math.PI
      this.callbacks.onShot(adjustedAngle, this.power * 40, this.spin)
      this.isMyTurn = false
    }
  }

  private updateCueStickPosition() {
    if (!this.cueBall) return
    this.cueStick.setPosition(this.cueBall.x, this.cueBall.y)
  }

  private updateCueStick() {
    if (!this.cueBall) return

    this.cueStick.setStickRotation(this.aimAngle + Math.PI)
    const offset = 40 + this.power * 2
    this.cueStick.setOffset(offset)
  }

  private updatePredictionLine() {
    if (!this.cueBall) return

    this.predictionLine.clear()
    this.predictionLine.lineStyle(2, 0x00ff00, 0.5)

    const startX = this.cueBall.x
    const startY = this.cueBall.y
    const angle = this.aimAngle + Math.PI
    const length = 200 + this.power * 5

    this.predictionLine.beginPath()
    this.predictionLine.moveTo(startX, startY)
    this.predictionLine.lineTo(
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length
    )
    this.predictionLine.strokePath()
  }

  private isBallsMoving(): boolean {
    for (const ball of this.balls) {
      if (ball.body) {
        const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2)
        if (speed > PHYSICS_CONFIG.minVelocity) return true
      }
    }
    return false
  }

  private handlePocketedBalls(ballIds: string[]) {
    for (const id of ballIds) {
      const ballIndex = id === 'cue' ? 0 : parseInt(id.replace('ball_', ''))
      if (ballIndex >= 0 && ballIndex < this.balls.length) {
        this.balls[ballIndex].setVisible(false)
        this.balls[ballIndex].disableBody(true, true)
      }
    }
  }

  private handleFoul() {
    // Foul notification can also be in React layer
  }

  updateGameState(state: GameState) {
    if (state.balls) {
      for (let i = 0; i < state.balls.length; i++) {
        const serverBall = state.balls[i]
        const clientBall = this.balls[i]

        if (clientBall && serverBall.pocketed) {
          clientBall.setVisible(false)
          clientBall.disableBody(true, true)
        } else if (clientBall && serverBall.position) {
          clientBall.setPosition(serverBall.position.x, serverBall.position.y)
          if (serverBall.velocity) {
            clientBall.setVelocity(serverBall.velocity.x, serverBall.velocity.y)
          }
        }
      }
    }
  }

  setSocketManager(socket: SocketManager) {
    this.socketManager = socket
  }

  setCallbacks(callbacks: PoolSceneCallbacks) {
    this.callbacks = callbacks
  }

  setMyPlayer(player: 'host' | 'guest') {
    this.isMyTurn = player === 'host'
  }

  enableBallInHand(enabled: boolean) {
    if (enabled) {
      this.input.on('pointerdown', this.handleBallInHandClick, this)
    }
  }

  private handleBallInHandClick(pointer: Phaser.Input.Pointer) {
    if (!this.cueBall || !this.callbacks) return

    const { width, height } = TABLE_CONFIG
    const offsetX = (this.cameras.main.width - width) / 2
    const offsetY = (this.cameras.main.height - height) / 2

    const minX = offsetX + TABLE_CONFIG.cushionWidth + TABLE_CONFIG.ballRadius
    const maxX = offsetX + width - TABLE_CONFIG.cushionWidth - TABLE_CONFIG.ballRadius
    const minY = offsetY + TABLE_CONFIG.cushionWidth + TABLE_CONFIG.ballRadius
    const maxY = offsetY + height - TABLE_CONFIG.cushionWidth - TABLE_CONFIG.ballRadius

    if (pointer.x >= minX && pointer.x <= maxX && pointer.y >= minY && pointer.y <= maxY) {
      this.callbacks.onBallInHand({ x: pointer.x, y: pointer.y })
      this.input.off('pointerdown', this.handleBallInHandClick)
    }
  }

  update() {
    if (this.isAiming) {
      this.updateCueStick()
    }
  }
}

export { TABLE_CONFIG, PHYSICS_CONFIG }