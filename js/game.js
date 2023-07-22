const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

gameSettings = {
	dimensions: {
		width: 1024,
		height: 576,
	},
	roundTime: 60,
};

canvas.width = gameSettings.dimensions.width;
canvas.height = gameSettings.dimensions.height;

// FPS Counter
let prevTime = 0;
function countFPS() {
	let delta = (performance.now() - prevTime) / 1000;
	let fps = 1 / delta;

	prevTime = performance.now();
	// console.log(`FPS: ${fps}`);
}

let timerId;
decreaseTimer();
gameLoop();

function gameLoop() {
	window.requestAnimationFrame(gameLoop);

	handleControls();

	background.update();
	shop.update();
	ctx.fillStyle = 'rgba(255, 255 ,255, 0.10)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	player.update();
	player2.update();

	// End game based on Health
	if (player.health <= 0 || player2.health <= 0) {
		determineWinner({ player, player2, timerId });
	}
}

function determineWinner({ player, player2, timerId }) {
	clearTimeout(timerId);

	document.querySelector('#displayText').style.display = 'flex';

	if (player.health === player2.health) {
		document.querySelector('#displayText').innerHTML = 'Tie';
	} else if (player.health > player2.health) {
		document.querySelector('#displayText').innerHTML = 'Player 1 Wins';
	} else if (player.health < player2.health) {
		document.querySelector('#displayText').innerHTML = 'Player 2 Wins';
	}
}

function decreaseTimer() {
	if (gameSettings.roundTime > 0) {
		timerId = setTimeout(decreaseTimer, 1000);
		gameSettings.roundTime--;

		document.querySelector('#timer').innerHTML = gameSettings.roundTime;
	}

	if (gameSettings.roundTime === 0) {
		determineWinner({ player, player2, timerId });
	}
}
