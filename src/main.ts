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

interface DifficultyInfo {
	name: string;
	mineCount: number;
	width: number;
	height: number;
}
class Difficulty {
	static button = document.querySelector('.difficulty') as HTMLButtonElement;
	static slot = this.button.querySelector('.slot') as HTMLSpanElement;
	static difficulties: DifficultyInfo[] = [
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
		{
			name: 'Custom',
			mineCount: 20,
			width: 10,
			height: 10,
		},
	];
	static customDifficulty = this.difficulties[3];
	static curDifficulty = 1;
	static current = this.difficulties[this.curDifficulty];
	static widthInput = document.querySelector(
		'.customInputs .width',
	) as HTMLInputElement;
	static heightInput = document.querySelector(
		'.customInputs .height',
	) as HTMLInputElement;
	static mineInput = document.querySelector(
		'.customInputs .mineCount',
	) as HTMLInputElement;
	static labels = [
		...document.querySelectorAll('.customInputs label'),
	] as HTMLLabelElement[];
	static inputs = [
		this.widthInput,
		this.heightInput,
		this.mineInput,
	] as HTMLInputElement[];
	static updateDisplay() {
		this.slot.textContent = this.current.name;
	}
	static {
		this.updateDisplay();
		this.button.addEventListener('click', () => {
			this.curDifficulty =
				++this.curDifficulty % this.difficulties.length;
			this.current = this.difficulties[this.curDifficulty];
			const isNotCustomDifficulty = this.current.name !== 'Custom';
			this.labels.forEach((label) =>
				label.setAttribute(
					'aria-disabled',
					isNotCustomDifficulty.toString(),
				),
			);
			this.inputs.forEach(
				(input) => (input.disabled = isNotCustomDifficulty),
			);
			this.updateDisplay();
			restart();
		});

		const getSizeCB = (
			input: HTMLInputElement,
			startValue: number,
			fieldKey: 'height' | 'width',
		) => {
			let value = startValue.toString();
			input.value = value;
			return () => {
				const newVal = input.value;
				if (newVal === '' || +newVal < 5) {
					input.value = value;
					return;
				}
				value = newVal;
				this.customDifficulty[fieldKey] = +newVal;

				const customDiff = this.customDifficulty;
				if (
					customDiff.mineCount >
					customDiff.width * customDiff.height - 9
				) {
					const maxMineCount =
						customDiff.width * customDiff.height - 9;
					customDiff.mineCount = maxMineCount;
					mineValue = maxMineCount.toString();
					this.mineInput.value = mineValue;
				}

				restart();
			};
		};

		let mineValue = '20';
		this.mineInput.value = mineValue;
		const mineCB = () => {
			const newVal = this.mineInput.value;
			const { width, height } = this.customDifficulty;
			if (newVal === '' || +newVal < 0 || +newVal > width * height - 9) {
				this.mineInput.value = mineValue;
				return;
			}
			mineValue = newVal;
			this.customDifficulty.mineCount = +newVal;
			restart();
		};

		(
			[
				[this.widthInput, getSizeCB(this.widthInput, 10, 'width')],
				[this.heightInput, getSizeCB(this.heightInput, 10, 'height')],
				[this.mineInput, mineCB],
			] as const
		).forEach(([input, cb]) => input.addEventListener('input', cb));
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
