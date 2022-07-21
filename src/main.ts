type TileStates = 'HIDDEN' | 'REVEALED' | 'FLAGGED';
const enum Symbols {
	flag = '🚩',
	bomb = '💣',
}

class Tile {
	// Elements
	elem = document.createElement('div');
	frontEl = document.createElement('div');
	backEl = document.createElement('div');
	// Info
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

function getArray<T>(w: number, h: number, cb: () => T): T[] {
	return new Array(w).fill(0).flatMap(() => new Array(h).fill(1).map(cb));
}

class Grid {
	static width = 10;
	static height = 10;
	static elem = document.querySelector('.grid') as HTMLDivElement;
	static tiles: Tile[] = getArray(this.width, this.height, () => new Tile());
	static getNeighbors(index: number) {
		const x = index % this.width;
		const y = Math.floor(index / this.width);
		const neighbors = [];
		if (x >= 1) {
			neighbors.push(index - 1);
			if (y > 0) neighbors.push(index - this.width - 1);
			if (y < this.width - 1) neighbors.push(index + this.width - 1);
		}
		if (x <= this.width - 2) {
			neighbors.push(index + 1);
			if (y > 0) neighbors.push(index - this.width + 1);
			if (y < this.width - 1) neighbors.push(index + this.width + 1);
		}
		if (y > 0) neighbors.push(index - this.width);
		if (y < this.width - 1) neighbors.push(index + this.width);
		return neighbors;
	}
	static {
		this.elem.style.setProperty('--w', this.width.toString());
		this.elem.style.setProperty('--h', this.height.toString());
		this.elem.append(...this.tiles.map((tile) => tile.elem));
		let hasInitialized = false;
		this.tiles.forEach((tile, i) => {
			tile.setListener(() => {
				if (tile.state === 'FLAGGED') return;
				const neighborIndices = Grid.getNeighbors(i);
				if (!hasInitialized) {
					hasInitialized = true;
					Grid.tiles.forEach((tile, j) => {
						if ([...neighborIndices, i].includes(j)) return;
						if (Math.random() < 0.1) {
							tile.setMine(true);
							Grid.getNeighbors(j).forEach((k) =>
								Grid.tiles[k].incrementCount(),
							);
						}
					});
				}
				if (tile.state === 'HIDDEN') tile.flip();
				const flagCount = neighborIndices.reduce((acc, cur) => {
					if (Grid.tiles[cur].state === 'FLAGGED') acc++;
					return acc;
				}, 0);
				if (!tile.mineCount || flagCount === tile.mineCount)
					setTimeout(
						() =>
							neighborIndices.forEach((i) => {
								const tile = Grid.tiles[i];
								if (tile && tile.state === 'HIDDEN')
									tile.elem.click();
							}),
						100,
					);
			});
			tile.setListener(
				() => {
					tile.toggleFlag();
				},
				{ isRightClick: true },
			);
		});
	}
}
