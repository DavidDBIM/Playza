import Phaser from 'phaser'

export class CueStick extends Phaser.GameObjects.Container {
  private stick!: Phaser.GameObjects.Graphics

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

    const height = 300
    const baseWidth = 8
    const tipWidth = 4

    for (let i = 0; i < height; i++) {
        const t = i / height
        const width = baseWidth - (baseWidth - tipWidth) * t
        const colorIndex = Math.floor(t * (gradient.length - 1))
        const color = gradient[colorIndex]

        this.stick.fillStyle(color, 1)
        this.stick.fillRect(-width / 2, i, width, 1)
    }

    // Add a tip
    this.stick.fillStyle(0xffffff, 0.9)
    this.stick.fillRect(-tipWidth / 2, 0, tipWidth, 2)
    this.stick.fillStyle(0x333333, 1)
    this.stick.fillRect(-tipWidth / 2, 2, tipWidth, 5)

    this.add(this.stick)
  }

  setOffset(offset: number) {
    this.stick.y = offset
  }

  setStickRotation(rotation: number) {
    this.rotation = rotation - Math.PI / 2 // Rotate stick so it points correctly
    return this
  }
}