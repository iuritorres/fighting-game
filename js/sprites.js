const gravity = 0.6;
const floorHeight = 96;

const spritePaths = {
	background: 'assets/img/background/placeholder.png',
	shop: 'assets/img/background/shop.png',
	player: 'assets/img/player/samuraiMack/Idle.png',
	player2: 'assets/img/player/kenji/Idle.png',
};

class Sprite {
	constructor({
		position,
		velocity,
		dimensions,
		source,
		scale = 1,
		framesMax = 1,
		offset = { x: 0, y: 0 },
	}) {
		this.position = position;
		this.velocity = velocity;
		this.width = dimensions?.width;
		this.height = dimensions?.height;
		this.scale = scale;
		this.framesMax = framesMax;
		this.framesCurrent = 0;
		this.framesElapsed = 0;
		this.framesHold = 5;
		this.offset = offset;

		if (source) {
			this.image = new Image();
			this.image.src = source;

			this.width = this.image.width;
			this.height = this.image.height;
		}
	}

	draw() {
		if (this.image) {
			ctx.drawImage(
				this.image,
				this.framesCurrent * (this.image.width / this.framesMax),
				0,
				this.image.width / this.framesMax,
				this.image.height,
				this.position.x - this.offset.x,
				this.position.y - this.offset.y,
				(this.image.width / this.framesMax) * this.scale,
				this.image.height * this.scale
			);
		} else {
			ctx.fillStyle = 'white';
			ctx.fillRect(
				this.position.x,
				this.position.y,
				this.width,
				this.height
			);
		}
	}

	animateFrames() {
		this.framesElapsed++;

		if (this.framesElapsed % this.framesHold === 0) {
			if (this.framesCurrent < this.framesMax - 1) {
				this.framesCurrent++;
			} else {
				this.framesCurrent = 0;
			}
		}
	}

	update() {
		this.draw();
		this.animateFrames();
	}
}

class Fighter extends Sprite {
	constructor({
		position,
		velocity,
		dimensions,
		source,
		scale = 1,
		framesMax = 1,
		offset = { x: 0, y: 0 },
		attackBoxOffset,
		hitbox,
		sprites,
	}) {
		super({
			position,
			source,
			scale,
			framesMax,
			offset,
		});

		this.velocity = velocity;
		this.width = dimensions?.width;
		this.height = dimensions?.height;
		this.health = 100;
		this.dead = false;
		this.scale = scale;
		this.attackBoxOffset = attackBoxOffset;
		this.hitbox = hitbox;

		if (source) {
			this.image = new Image();
			this.image.src = source;

			this.width = this.image.width * this.scale;
			this.height = this.image.height * this.scale;
		}

		this.attackBox = {
			position: {
				x: this.position.x,
				y: this.position.y,
			},
			attackBoxOffset,
			width: 125,
			height: 50,
		};

		this.isAttacking;
		this.attackCooldown = 500;
		this.isOnAttackCooldown;

		this.lastKeyPressed;
		this.onGround;

		this.framesCurrent = 0;
		this.framesElapsed = 0;
		this.framesHold = 5;
		this.sprites = sprites;

		for (const sprite in this.sprites) {
			sprites[sprite].image = new Image();
			sprites[sprite].image.src = sprites[sprite].source;
		}
	}

	gravity() {
		this.onGround =
			Math.ceil(this.position.y + this.height) >=
			canvas.height - floorHeight;

		if (this.velocity.y < 0) {
			this.switchSprite('jump');
		} else if (this.velocity.y > 0) {
			this.switchSprite('fall');
		}

		if (this.position.y + this.height > canvas.height - floorHeight) {
			this.position.y = canvas.height - this.height - floorHeight;
			this.velocity.y = 0;
		} else if (!this.onGround) {
			this.velocity.y += gravity;
		}

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		this.attackBox.position.x =
			this.position.x + this.attackBox.attackBoxOffset.x;

		this.attackBox.position.y =
			this.position.y + this.attackBox.attackBoxOffset.y;
	}

	detectCollision() {
		// Player 1
		if (
			// isAttacking
			player.isAttacking &&
			player.framesCurrent === 4 &&
			// before enemy
			player.attackBox.position.x + player.attackBox.width >=
				player2.position.x &&
			// after enemy
			player.attackBox.position.x <=
				player2.position.x + player2.hitbox.width
		) {
			player2.takeHit();
			player.isAttacking = false;

			gsap.to('#player2Health', {
				width: player2.health + '%',
			});
		}

		// Player 1 miss
		if (player.isAttacking && player.framesCurrent === 4) {
			player.isAttacking = false;
		}

		// Player 2
		if (
			// isAttacking
			player2.isAttacking &&
			player2.framesCurrent === 2 &&
			// before enemy
			player2.attackBox.position.x + player2.attackBox.width >=
				player.position.x &&
			// after enemy
			player2.attackBox.position.x <= player.position.x + player.hitbox.width
		) {
			player.takeHit();
			player2.isAttacking = false;

			gsap.to('#playerHealth', {
				width: player.health + '%',
			});
		}

		// Player 2 miss
		if (player2.isAttacking && player2.framesCurrent === 2) {
			player2.isAttacking = false;
		}
	}

	update() {
		if (!this.dead === true) this.animateFrames();

		this.gravity();
		this.detectCollision();
		this.draw();
	}

	switchSprite(sprite) {
		// Death
		if (this.image === this.sprites.death.image) {
			if (this.framesCurrent === this.sprites.death.framesMax - 1) {
				this.dead = true;
			}

			return;
		}

		// Overriding all other animations with the attack animation
		if (
			this.image === this.sprites.attack1.image &&
			this.framesCurrent < this.sprites.attack1.framesMax - 1
		)
			return;

		// Override when fighter gets hit
		if (
			this.image === this.sprites.takeHit.image &&
			this.framesCurrent < this.sprites.takeHit.framesMax - 1
		)
			return;

		switch (sprite) {
			case 'idle':
				if (this.image !== this.sprites.idle.image) {
					this.image = this.sprites.idle.image;
					this.framesMax = this.sprites.idle.framesMax;
					this.framesCurrent = 0;
				}
				break;

			case 'run':
				if (this.image !== this.sprites.run.image) {
					this.image = this.sprites.run.image;
					this.framesMax = this.sprites.run.framesMax;
					this.framesCurrent = 0;
				}
				break;

			case 'jump':
				if (this.image !== this.sprites.jump.image) {
					this.image = this.sprites.jump.image;
					this.framesMax = this.sprites.jump.framesMax;
					this.framesCurrent = 0;
				}
				break;

			case 'fall':
				if (this.image !== this.sprites.fall.image) {
					this.image = this.sprites.fall.image;
					this.framesMax = this.sprites.fall.framesMax;
					this.framesCurrent = 0;
				}
				break;

			case 'attack1':
				if (this.image !== this.sprites.attack1.image) {
					this.image = this.sprites.attack1.image;
					this.framesMax = this.sprites.attack1.framesMax;
					this.framesCurrent = 0;
				}
				break;

			case 'takeHit':
				if (this.image !== this.sprites.takeHit.image) {
					this.image = this.sprites.takeHit.image;
					this.framesMax = this.sprites.takeHit.framesMax;
					this.framesCurrent = 0;
				}
				break;

			case 'death':
				if (this.image !== this.sprites.death.image) {
					this.image = this.sprites.death.image;
					this.framesMax = this.sprites.death.framesMax;
					this.framesCurrent = 0;
				}
				break;
		}
	}

	attack() {
		if (this.isOnAttackCooldown) return;

		this.switchSprite('attack1');
		this.isAttacking = true;
		this.isOnAttackCooldown = true;

		setTimeout(() => {
			this.isOnAttackCooldown = false;
		}, this.attackCooldown);
	}

	takeHit() {
		this.health -= 10;

		this.health <= 0
			? this.switchSprite('death')
			: this.switchSprite('takeHit');
	}

	jump() {
		if (!this.onGround) return;
		this.velocity.y -= 16;
	}
}

const background = new Sprite({
	position: {
		x: 0,
		y: 0,
	},
	source: spritePaths.background,
});

const shop = new Sprite({
	position: {
		x: 630,
		y: 128,
	},
	source: spritePaths.shop,
	scale: 2.75,
	framesMax: 6,
});

const player = new Fighter({
	position: {
		x: 200,
		y: 0,
	},
	velocity: {
		x: 0,
		y: 0,
	},
	source: spritePaths.player,
	framesMax: 8,
	scale: 2.5,
	offset: {
		x: 215,
		y: -196,
	},
	attackBoxOffset: {
		x: 124,
		y: 388,
	},
	hitbox: {
		width: 70,
		height: 140,
	},
	sprites: {
		idle: {
			source: 'assets/img/player/samuraiMack/Idle.png',
			framesMax: 8,
		},
		run: {
			source: 'assets/img/player/samuraiMack/Run.png',
			framesMax: 8,
		},
		jump: {
			source: 'assets/img/player/samuraiMack/Jump.png',
			framesMax: 2,
		},
		fall: {
			source: 'assets/img/player/samuraiMack/Fall.png',
			framesMax: 2,
		},
		attack1: {
			source: 'assets/img/player/samuraiMack/Attack1.png',
			framesMax: 6,
		},
		takeHit: {
			source:
				'assets/img/player/samuraiMack/Take Hit - white silhouette.png',
			framesMax: 4,
		},
		death: {
			source: 'assets/img/player/samuraiMack/Death.png',
			framesMax: 6,
		},
	},
});

const player2 = new Fighter({
	position: {
		x: 750,
		y: 0,
	},
	velocity: {
		x: 0,
		y: 0,
	},
	source: spritePaths.player2,
	framesMax: 4,
	scale: 2.5,
	offset: {
		x: 215,
		y: -181,
	},
	attackBoxOffset: {
		x: -164,
		y: 388,
	},
	hitbox: {
		width: 60,
		height: 140,
	},
	sprites: {
		idle: {
			source: 'assets/img/player/kenji/Idle.png',
			framesMax: 4,
		},
		run: {
			source: 'assets/img/player/kenji/Run.png',
			framesMax: 8,
		},
		jump: {
			source: 'assets/img/player/kenji/Jump.png',
			framesMax: 2,
		},
		fall: {
			source: 'assets/img/player/kenji/Fall.png',
			framesMax: 2,
		},
		attack1: {
			source: 'assets/img/player/kenji/Attack1.png',
			framesMax: 4,
		},
		takeHit: {
			source: 'assets/img/player/kenji/Take hit.png',
			framesMax: 3,
		},
		death: {
			source: 'assets/img/player/kenji/Death.png',
			framesMax: 7,
		},
	},
});
