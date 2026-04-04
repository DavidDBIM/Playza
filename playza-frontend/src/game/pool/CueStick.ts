import Phaser from 'phaser'

export class CueStick extends Phaser.GameObjects.Container {
  private stick!: Phaser.GameObjects.Graphics
  private offset: number = 60

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)
    this.createStick()
    scene.add.existing(this)
  }

  private createStick() {
    this.stick = this.scene.add.graphics()

    const gradient = [
      0xd4a574,
      0xc9956c,
      0xbc8f5f,
      0xa67c52,
      0x8b6343,
      0x6b4f32,
      0x5a3f28,
      0x4d3522,
    ]

    const height = 200
    const baseWidth = 8
    const tipWidth = 3

    for (let i = 0; i < height; i++) {
      const t = i / height
      const width = baseWidth - (baseWidth - tipWidth) * t
      const colorIndex = Math.floor(t * (gradient.length - 1))
      const color = gradient[colorIndex]

      this.stick.fillStyle(color, 1)
      this.stick.fillRect(-width / 2, -height + i, width, 1)
    }

    this.stick.fillStyle(0xffffff, 0.9)
    this.stick.fillCircle(0, -height + 5, 2)

    this.add(this.stick)
  }

  setOffset(offset: number) {
    this.offset = offset
    this.x += offset * 0.1
  }

  setStickRotation(rotation: number) {
    this.rotation = rotation
    const dist = this.offset + 30
    this.x = this.scene.cameras.main.width / 2 + Math.cos(rotation) * dist
    this.y = this.scene.cameras.main.height / 2 + Math.sin(rotation) * dist
    return this
  }
}