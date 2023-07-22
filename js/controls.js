const keys = {
	// Player 1
	a: {
		pressed: false,
	},
	d: {
		pressed: false,
	},
	w: {
		pressed: false,
		hold: false,
	},
	space: {
		pressed: false,
		hold: false,
	},

	// Player 2
	f: {
		pressed: false,
	},
	h: {
		pressed: false,
	},
	t: {
		pressed: false,
		hold: false,
	},
	m: {
		pressed: false,
		hold: false,
	},
};

window.addEventListener('keydown', (event) => {
	// Player 1
	if (!player.dead) {
		switch (event.key) {
			case 'a':
				keys.a.pressed = true;
				player.lastKeyPressed = 'a';
				break;

			case 'd':
				keys.d.pressed = true;
				player.lastKeyPressed = 'd';
				break;

			case 'w':
				keys.w.pressed = true;
				break;

			case ' ':
				keys.space.pressed = true;
				break;
		}
	}

	// Player 2
	if (!player2.dead) {
		switch (event.key) {
			case 'ArrowLeft':
			case 'f':
				keys.f.pressed = true;
				player2.lastKeyPressed = 'a';
				break;

			case 'ArrowRight':
			case 'h':
				keys.h.pressed = true;
				player2.lastKeyPressed = 'd';
				break;

			case 'ArrowUp':
			case 't':
				keys.t.pressed = true;
				break;

			case 'm':
				keys.m.pressed = true;
				break;
		}
	}
});

window.addEventListener('keyup', (event) => {
	// Player 1
	switch (event.key) {
		case 'a':
			keys.a.pressed = false;
			break;

		case 'd':
			keys.d.pressed = false;
			break;

		case 'w':
			keys.w.pressed = false;
			keys.w.hold = false;
			break;

		case ' ':
			keys.space.pressed = false;
			keys.space.hold = false;
			break;
	}

	// Player 2
	switch (event.key) {
		case 'ArrowLeft':
		case 'f':
			keys.f.pressed = false;
			break;

		case 'ArrowRight':
		case 'h':
			keys.h.pressed = false;
			break;

		case 'ArrowUp':
		case 't':
			keys.t.pressed = false;
			keys.t.hold = false;
			break;

		case 'm':
			keys.m.pressed = false;
			keys.m.hold = false;
			break;
	}
});

function handleControls() {
	movement();
	attacks();

	function movement() {
		player.velocity.x = 0;
		player2.velocity.x = 0;

		// Player 1
		if (
			keys.a.pressed &&
			['a', 'ArrowLeft'].includes(player.lastKeyPressed)
		) {
			player.velocity.x = -5;
			player.switchSprite('run');
		} else if (
			keys.d.pressed &&
			['d', 'ArrowRight'].includes(player.lastKeyPressed)
		) {
			player.velocity.x = 5;
			player.switchSprite('run');
		} else {
			player.switchSprite('idle');
		}

		if (keys.w.pressed && !keys.w.hold) {
			player.jump();
			keys.w.hold = true;
		}

		// Player 2
		if (
			keys.f.pressed &&
			['a', 'ArrowLeft'].includes(player2.lastKeyPressed)
		) {
			player2.velocity.x = -5;
			player2.switchSprite('run');
		} else if (
			keys.h.pressed &&
			['d', 'ArrowRight'].includes(player2.lastKeyPressed)
		) {
			player2.velocity.x = 5;
			player2.switchSprite('run');
		} else {
			player2.switchSprite('idle');
		}

		if (keys.t.pressed && !keys.t.hold) {
			player2.jump();
			keys.t.hold = true;
		}
	}

	function attacks() {
		// Player 1
		if (keys.space.pressed && !keys.space.hold) {
			player.attack();
			keys.space.hold = true;
		}

		// Player 2
		if (keys.m.pressed && !keys.m.hold) {
			player2.attack();
			keys.m.hold = true;
		}
	}
}
