import { Symbols } from './symbols';
import { Grid } from './grid.js';

class FlagsLeft {
	static elem = document.querySelector('.flagsLeft') as HTMLParagraphElement;
	static counter = 0;
	static updateDisplay() {
		this.elem.textContent = `${Symbols.flag} ${Math.max(this.counter, 0)}`;
	}
	static set(val: number) {
		this.counter = val;
		this.updateDisplay();
	}
	static crement(change: 1 | -1) {
		this.counter += change;
		this.updateDisplay();
	}
}

class Timer {
	static elem = document.querySelector('.timer') as HTMLParagraphElement;
	static timeStart = 0;
	static doTicks = false;
	static updateDisplay(t: number) {
		const timeSince = t - this.timeStart;
		const minutes = Math.floor(timeSince / 1000 / 60);
		const seconds = `${Math.floor(timeSince / 1000) % 60}`.padStart(2, '0');
		const milliseconds = `${Math.floor((timeSince % 1000) / 10)}`.padStart(
			2,
			'0',
		);
		this.elem.textContent = `${minutes}:${seconds}:${milliseconds}`;
	}
	static reset() {
		this.doTicks = false;
		this.timeStart = 0;
		this.updateDisplay(0);
	}
	static startUpdates() {
		this.doTicks = true;
	}
	static stopUpdates() {
		this.doTicks = false;
	}
	static {
		const That = this;
		requestAnimationFrame(function loop(t: number) {
			requestAnimationFrame(loop);
			if (That.doTicks) {
				That.updateDisplay(t);
			} else That.timeStart = t;
		});
	}
}

interface difficultyInfo {
	name: string;
	mineCount: number;
	width: number;
	height: number;
}
class Difficulty {
	static elem = document.querySelector('.difficulty') as HTMLButtonElement;
	static difficulties: difficultyInfo[] = [
		{
			name: 'Easy',
			mineCount: 10,
			width: 8,
			height: 8,
		},
		{
			name: 'Normal',
			mineCount: 20,
			width: 10,
			height: 10,
		},
		{
			name: 'Hard',
			mineCount: 30,
			width: 12,
			height: 12,
		},
	];
	static curDifficulty = 1;
	static current = this.difficulties[this.curDifficulty];
	static updateDisplay() {
		this.elem.textContent = `Difficulty: ${this.current.name}`;
	}
	static {
		this.updateDisplay();
		this.elem.addEventListener('click', () => {
			this.curDifficulty =
				++this.curDifficulty % this.difficulties.length;
			this.current = this.difficulties[this.curDifficulty];
			this.updateDisplay();
			restart();
		});
	}
}

const container = document.querySelector('.container') as HTMLElement;
function newGrid() {
	FlagsLeft.set(Difficulty.current.mineCount);
	let grid = new Grid(
		Difficulty.current.width,
		Difficulty.current.height,
		Difficulty.current.mineCount,
		container,
		({ isFlagged, isUnflagged }) => {
			Timer.startUpdates();
			if (isUnflagged) FlagsLeft.crement(1);
			else if (isFlagged) FlagsLeft.crement(-1);
			if (grid.hasWon || grid.hasLost) Timer.stopUpdates();
		},
	);
}

function restart() {
	Timer.reset();
	newGrid();
}

const restartBtn = document.querySelector('.restart') as HTMLButtonElement;
restartBtn.addEventListener('click', restart);

newGrid();
