import { Tile } from './tile.js';
import { getArray, randInt } from './utils.js';
export class Grid {
	elem = document.createElement('div');
	tiles: Tile[];
	tileNeighbors: Tile[][];
	hasInitialized = false;
	hasLost = false;
	constructor(
		width: number,
		height: number,
		mineCount: number,
		parent: HTMLElement,
		clickCB?: (isMine: boolean, wasFlagged: boolean) => void,
	) {
		this.tiles = getArray(width, height, () => new Tile());
		this.tileNeighbors = Grid.createNeighborData(width, this.tiles);
		this.elem.classList.add('grid');
		this.elem.style.cssText = `--w: ${width}; --h: ${height};`;
		this.elem.append(...this.tiles.map((tile) => tile.elem));
		parent.appendChild(this.elem);
		this.tiles.forEach((clickedTile, i) => {
			clickedTile.setListener(() => {
				if (clickedTile.state === 'FLAGGED' || this.hasLost) return;
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
					if (clickCB) clickCB(clickedTile.isMine, false);
					if (clickedTile.isMine) {
						this.hasLost = true;
						prom.then(() => this.doLoseAnim());
						return;
					}
				}
				if (
					!clickedTile.mineCount ||
					clickedTile.mineCount ===
						Grid.countFlaggedTiles(clickedTileNeighbors)
				)
					setTimeout(() => {
						const hasMineNeighbor = clickedTileNeighbors.some(
							(tile) => tile.isMine && tile.state === 'HIDDEN',
						);
						clickedTileNeighbors
							.filter(
								(tile) =>
									tile.state === 'HIDDEN' &&
									(!hasMineNeighbor || tile.isMine),
							)
							.forEach((tile) => tile.elem.click());
					}, 100);
			});
			clickedTile.setListener(
				() => {
					clickedTile.toggleFlag();
					if (clickCB) clickCB(clickedTile.isMine, true);
				},
				{
					isRightClick: true,
				},
			);
		});
	}
	doLoseAnim() {
		let count = 0;
		this.tiles.forEach((tile) => {
			if (!tile.isMine || tile.state !== 'HIDDEN') return;
			setTimeout(() => {
				tile.flip().then(() => tile.jumpOut());
			}, count++ * 100);
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
