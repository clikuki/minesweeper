type TileStates = 'HIDDEN' | 'REVEALED' | 'FLAGGED';
const enum Symbols {
	flag = '🚩',
	bomb = '💣',
}

export class Tile {
	// Elements
	elem = document.createElement('div');
	frontEl = document.createElement('div');
	backEl = document.createElement('div');
	// data
	state: TileStates = 'HIDDEN';
	isMine = false;
	mineCount = 0;
	constructor() {
		this.elem.classList.add('tile');
		const contentEl = document.createElement('div');
		contentEl.classList.add('content');
		this.frontEl.classList.add('front');
		this.backEl.classList.add('back');
		this.backEl.textContent = '';
		contentEl.append(this.frontEl, this.backEl);
		this.elem.append(contentEl);
	}
	setMine(bool: boolean) {
		this.isMine = bool;
		if (this.isMine) this.backEl.textContent = Symbols.bomb;
		else if (this.mineCount)
			this.backEl.textContent = this.mineCount.toString();
		else this.backEl.textContent = '';
	}
	disableFlagToggle = false;
	toggleFlag() {
		if (this.state === 'REVEALED' || this.disableFlagToggle) return 1;
		if (this.state === 'HIDDEN') {
			this.state = 'FLAGGED';
			this.frontEl.textContent = Symbols.flag;
		} else {
			this.state = 'HIDDEN';
			this.frontEl.textContent = '';
		}
		this.disableFlagToggle = true;
		setTimeout(() => (this.disableFlagToggle = false), 100);
	}
	flip() {
		return new Promise<void>((res, rej) => {
			if (this.state === 'FLAGGED') return rej();
			if (this.state === 'HIDDEN') this.state = 'REVEALED';
			else this.state = 'HIDDEN';
			this.elem.classList.toggle('flipped');
			this.elem.addEventListener('animationend', () => res(), {
				once: true,
			});
		});
	}
	incrementCount() {
		++this.mineCount;
		if (!this.isMine) this.backEl.textContent = this.mineCount.toString();
	}
	setListener(
		listener: () => void,
		{ isRightClick = false, once = false } = {},
	) {
		const event = isRightClick ? 'oncontextmenu' : 'onclick';
		this.elem[event] = (e) => {
			if (isRightClick) e.preventDefault();
			if (once) this.elem[event] = null;
			listener();
		};
	}
}
