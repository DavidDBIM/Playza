import Phaser from 'phaser'
import { TABLE_CONFIG, PHYSICS_CONFIG } from './config'

export class ShotPredictor {
  private scene: Phaser.Scene
  private graphics: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.graphics = scene.add.graphics()
  }

  predict(
    startX: number,
    startY: number,
    angle: number,
    power: number
  ): void {
    this.graphics.clear()

    if (power < 10) return

    this.graphics.lineStyle(2, 0x00ff00, 0.6)

    let x = startX
    let y = startY
    let vx = Math.cos(angle) * power * 0.15
    let vy = Math.sin(angle) * power * 0.15

    const { width, height } = TABLE_CONFIG
    const offsetX = (this.scene.cameras.main.width - width) / 2
    const offsetY = (this.scene.cameras.main.height - height) / 2

    const cushion = TABLE_CONFIG.cushionWidth + TABLE_CONFIG.ballRadius

    this.graphics.beginPath()
    this.graphics.moveTo(x, y)

    for (let i = 0; i < 150; i++) {
      x += vx
      y += vy

      vx *= PHYSICS_CONFIG.friction
      vy *= PHYSICS_CONFIG.friction

      if (x < offsetX + cushion) {
        x = offsetX + cushion
        vx = -vx * PHYSICS_CONFIG.restitution
      }
      if (x > offsetX + width - cushion) {
        x = offsetX + width - cushion
        vx = -vx * PHYSICS_CONFIG.restitution
      }
      if (y < offsetY + cushion) {
        y = offsetY + cushion
        vy = -vy * PHYSICS_CONFIG.restitution
      }
      if (y > offsetY + height - cushion) {
        y = offsetY + height - cushion
        vy = -vy * PHYSICS_CONFIG.restitution
      }

      this.graphics.lineTo(x, y)

      const speed = Math.sqrt(vx * vx + vy * vy)
      if (speed < 0.5) break
    }

    this.graphics.strokePath()
  }

  clear() {
    this.graphics.clear()
  }
}