import { Symbols } from './symbols';
import { Grid } from './grid.js';

const mineCount = 10;
let flagsLeft = mineCount;
let hasClicked = false;
let timeStart = 0;
let gameIsStopped = false;

const flagsLeftCounter = document.querySelector(
	'.flagsLeft',
) as HTMLParagraphElement;
function updateFlagCounter() {
	flagsLeftCounter.textContent = `${Symbols.flag} ${Math.max(flagsLeft, 0)}`;
}
updateFlagCounter();

const timer = document.querySelector('.timer') as HTMLParagraphElement;
requestAnimationFrame(function loop(t: number) {
	requestAnimationFrame(loop);
	if (!hasClicked || gameIsStopped) {
		timeStart = t;
		return;
	}
	const seconds = Math.floor((t - timeStart) / 1000);
	const milliseconds = `${Math.floor(
		((t - timeStart) % 1000) / 10,
	)}`.padStart(2, '0');
	timer.textContent = `${seconds}:${milliseconds}`;
});

const restartBtn = document.querySelector('.restart') as HTMLButtonElement;
function newGrid() {
	gameIsStopped = false;
	let grid = new Grid(
		10,
		10,
		mineCount,
		document.querySelector('.container')!,
		({ isFlagged, isUnflagged }) => {
			hasClicked = true;
			if (isFlagged) {
				flagsLeft--;
				updateFlagCounter();
			} else if (isUnflagged) {
				flagsLeft++;
				updateFlagCounter();
			}
			if (grid.hasWon || grid.hasLost) {
				gameIsStopped = true;
				return;
			}
		},
	);
}
restartBtn.addEventListener('click', () => {
	newGrid();
	hasClicked = false;
	timer.textContent = '0:00';
	flagsLeft = mineCount;
	updateFlagCounter();
});
newGrid();
