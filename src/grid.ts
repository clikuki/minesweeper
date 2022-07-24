import { Tile } from './tile.js';
import { getArray, randInt } from './utils.js';
interface clickNotifyParams {
	isMine: boolean;
	isFlagged: boolean;
	isUnflagged: boolean;
	gameState: 'NORMAL' | 'WIN' | 'LOSE';
}
export class Grid {
	elem = document.createElement('div');
	tiles: Tile[];
	tileNeighbors: Tile[][];
	hasInitialized = false;
	hasLost = false;
	hasWon = false;
	constructor(
		width: number,
		height: number,
		mineCount: number,
		parent: HTMLElement,
		clickCB?: (params: clickNotifyParams) => void,
	) {
		this.tiles = getArray(width, height, () => new Tile());
		this.tileNeighbors = Grid.createNeighborData(width, this.tiles);
		this.elem.classList.add('grid');
		this.elem.style.cssText = `--w: ${width}; --h: ${height};`;
		this.elem.append(...this.tiles.map((tile) => tile.elem));
		parent.replaceChildren(this.elem);
		this.tiles.forEach((clickedTile, i) => {
			clickedTile.setListener(() => {
				if (
					clickedTile.state === 'FLAGGED' ||
					this.hasLost ||
					this.hasWon
				)
					return;
				const clickedTileNeighbors = this.tileNeighbors[i];
				if (!this.hasInitialized) {
					this.hasInitialized = true;
					while (mineCount) {
						const index = randInt(this.tiles.length - 1);
						const tile = this.tiles[index];
						if (
							tile !== clickedTile &&
							!clickedTileNeighbors.includes(tile) &&
							!tile.isMine
						) {
							mineCount--;
							tile.setMine(true);
							this.tileNeighbors[index].forEach((tile) =>
								tile.incrementCount(),
							);
						}
					}
				}
				if (clickedTile.state === 'HIDDEN') {
					const prom = clickedTile.flip();
					if (clickedTile.isMine) {
						this.hasLost = true;
						prom.then(() => this.doLoseAnim());
					} else if (this.checkForWin()) {
						this.hasWon = true;
						setTimeout(() => this.doWinAnim(width), 100);
					}
					if (clickCB)
						clickCB({
							isMine: clickedTile.isMine,
							isFlagged: false,
							isUnflagged: false,
							gameState: this.hasLost
								? 'LOSE'
								: this.hasWon
								? 'WIN'
								: 'NORMAL',
						});
					if (this.hasLost || this.hasWon) return;
				}
				if (
					!clickedTile.mineCount ||
					clickedTile.mineCount ===
						Grid.countFlaggedTiles(clickedTileNeighbors)
				)
					setTimeout(
						() => {
							const hasMineNeighbor = clickedTileNeighbors.some(
								(tile) =>
									tile.isMine && tile.state === 'HIDDEN',
							);
							clickedTileNeighbors
								.filter(
									(tile) =>
										tile.state === 'HIDDEN' &&
										(!hasMineNeighbor || tile.isMine),
								)
								.forEach((tile) => tile.elem.click());
						},
						clickedTile.mineCount ? 0 : 100,
					);
			});
			clickedTile.setListener(
				() => {
					clickedTile.toggleFlag();
					if (this.checkForWin()) {
						this.hasWon = true;
						setTimeout(() => this.doWinAnim(width), 100);
					}
					if (clickCB)
						clickCB({
							isMine: clickedTile.isMine,
							isFlagged: clickedTile.state === 'FLAGGED',
							isUnflagged: clickedTile.state !== 'FLAGGED',
							gameState: this.hasWon ? 'WIN' : 'NORMAL',
						});
				},
				{
					isRightClick: true,
				},
			);
		});
	}
	checkForWin() {
		return this.tiles.every(
			(tile) =>
				(!tile.isMine && tile.state === 'REVEALED') ||
				(tile.isMine && tile.state === 'FLAGGED'),
		);
	}
	doLoseAnim() {
		let count = 0;
		const mines = this.tiles.filter(
			(tile) => tile.isMine && tile.state !== 'FLAGGED',
		);
		const hiddenMines = mines.filter((mine) => mine.state === 'HIDDEN');
		Promise.all(
			hiddenMines.map((mine) =>
				delayPromise(count++ * 100, () => mine.flip()),
			),
		).then(() => mines.forEach((mine) => mine.jumpOut()));
	}
	doWinAnim(width: number) {
		this.tiles.forEach((tile, i) => {
			const x = i % width;
			const y = Math.floor(i / width);
			setTimeout(() => tile.jumpUp(), (x + y) * 100);
		});
	}
	static countFlaggedTiles(tiles: Tile[]) {
		return tiles.reduce((acc, cur) => {
			if (cur.state === 'FLAGGED') acc++;
			return acc;
		}, 0);
	}
	static createNeighborData(width: number, tiles: Tile[]) {
		return tiles.map((_, i) => {
			const y = Math.floor(i / width);
			const neighbors = [];
			if (tiles[i - width]) neighbors.push(tiles[i - width]);
			if (tiles[i + width]) neighbors.push(tiles[i + width]);
			if (y === Math.floor((i - 1) / width)) neighbors.push(tiles[i - 1]);
			if (y === Math.floor((i + 1) / width)) neighbors.push(tiles[i + 1]);
			if (
				y - 1 === Math.floor((i - width - 1) / width) &&
				tiles[i - width - 1]
			)
				neighbors.push(tiles[i - width - 1]);
			if (
				y - 1 === Math.floor((i - width + 1) / width) &&
				tiles[i - width + 1]
			)
				neighbors.push(tiles[i - width + 1]);
			if (
				y + 1 === Math.floor((i + width - 1) / width) &&
				tiles[i + width - 1]
			)
				neighbors.push(tiles[i + width - 1]);
			if (
				y + 1 === Math.floor((i + width + 1) / width) &&
				tiles[i + width + 1]
			)
				neighbors.push(tiles[i + width + 1]);
			return neighbors;
		});
	}
}

function delayPromise<T>(
	delay: number,
	getPromise: () => Promise<T>,
): Promise<T> {
	return new Promise<T>((res) => {
		setTimeout(() => {
			getPromise().then((val) => res(val));
		}, delay);
	});
}
