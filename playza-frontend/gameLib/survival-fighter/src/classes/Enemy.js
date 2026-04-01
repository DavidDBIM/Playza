class Enemy extends Phaser.Physics.Arcade.Sprite {
    static TYPES = {
        basic: { speed: 80, health: 30, damage: 10, color: 0xff6b6b, score: 10 },
        fast: { speed: 150, health: 20, damage: 8, color: 0x4ecdc4, score: 15 },
        tank: { speed: 40, health: 60, damage: 20, color: 0xffbe76, score: 25 },
        boss: { speed: 60, health: 150, damage: 30, color: 0xa55eea, score: 100 }
    };

    constructor(scene, x, y, type = 'basic') {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setGravityY(800);
        this.body.setSize(50, 100);
        this.body.setOffset(25, 10);

        const config = Enemy.TYPES[type];
        this.enemyType = type;
        this.speed = config.speed;
        this.health = config.health;
        this.maxHealth = config.health;
        this.damage = config.damage;
        this.scoreValue = config.score;

        this.setTint(config.color);
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.aggroRange = 400;
        this.attackRange = 70;

        this.createAnimations();
    }

    createAnimations() {
        const anims = this.scene.anims;
        anims.create({
            key: `enemy-${this.enemyType}-idle`,
            frames: [{ key: 'enemy', frame: 0 }],
            frameRate: 10
        });
        anims.create({
            key: `enemy-${this.enemyType}-walk`,
            frames: [{ key: 'enemy', frame: 1 }, { key: 'enemy', frame: 2 }],
            frameRate: 8,
            repeat: -1
        });
        anims.create({
            key: `enemy-${this.enemyType}-attack`,
            frames: [{ key: 'enemy', frame: 3 }],
            frameRate: 20
        });
        anims.create({
            key: `enemy-${this.enemyType}-hurt`,
            frames: [{ key: 'enemy', frame: 4 }],
            frameRate: 20
        });
        anims.create({
            key: `enemy-${this.enemyType}-death`,
            frames: [{ key: 'enemy', frame: 5 }],
            frameRate: 10
        });
    }

    update(player) {
        if (this.isAttacking || !this.body) return;

        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (distance > this.aggroRange) {
            this.setVelocityX(0);
            this.play(`enemy-${this.enemyType}-idle`, true);
            return;
        }

        if (distance < this.attackRange) {
            this.setVelocityX(0);
            this.attack(player);
            return;
        }

        const direction = player.x < this.x ? -1 : 1;
        this.setVelocityX(direction * this.speed);
        this.flipX = direction === -1;
        this.play(`enemy-${this.enemyType}-walk`, true);

        if (this.attackCooldown > 0) {
            this.attackCooldown -= 16;
        }
    }

    attack(player) {
        if (this.isAttacking || this.attackCooldown > 0) return;

        this.isAttacking = true;
        this.play(`enemy-${this.enemyType}-attack`);

        const attackDelay = 300;
        this.scene.time.delayedCall(attackDelay, () => {
            if (this.active && player.active) {
                const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
                if (dist < this.attackRange + 30) {
                    player.takeDamage(this.damage);
                }
            }
        });

        const duration = this.enemyType === 'tank' ? 600 : 400;
        this.scene.time.delayedCall(duration, () => {
            this.isAttacking = false;
            this.attackCooldown = 1500;
        });
    }

    takeDamage(amount) {
        this.health -= amount;
        this.play(`enemy-${this.enemyType}-hurt`);

        this.scene.cameras.main.shake(50, 0.005);

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.play(`enemy-${this.enemyType}-death`);
        this.scene.events.emit('enemyKilled', this.scoreValue);
        this.scene.time.delayedCall(500, () => {
            this.destroy();
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Enemy;
}