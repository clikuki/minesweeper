var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Grid_instances, _Grid_initialize;
import { Tile } from './tile.js';
import { getArray, randInt } from './utils.js';
const root = document.querySelector(':root');
const rootComputedStyles = getComputedStyle(root);
const fontSize = parseFloat(rootComputedStyles.fontSize);
const gridGap = parseFloat(rootComputedStyles.getPropertyValue('--grid-gap')) * fontSize;
const defaultTileSize = parseFloat(rootComputedStyles.getPropertyValue('--tile-size')) * fontSize;
const windowPadding = 10;
function getTileSize(height) {
    return (innerHeight - windowPadding) / height - gridGap;
}
function defaultTileSizeIsTooBig(height) {
    return defaultTileSize * height + gridGap * --height > innerHeight;
}
export class Grid {
    constructor(width, height, mineCount, parent, clickCB) {
        _Grid_instances.add(this);
        this.elem = document.createElement('div');
        this.hasInitialized = false;
        this.hasLost = false;
        this.hasWon = false;
        const useCustomTileSize = defaultTileSizeIsTooBig(height);
        const fitTileSize = getTileSize(height);
        this.tiles = getArray(width, height, () => new Tile(useCustomTileSize ? fitTileSize : undefined));
        this.tileNeighbors = Grid.createNeighborData(width, this.tiles);
        this.elem.classList.add('grid');
        this.elem.style.cssText = `--w: ${width}; --h: ${height};`;
        this.elem.append(...this.tiles.map((tile) => tile.elem));
        parent.replaceChildren(this.elem);
        this.tiles.forEach((clickedTile, i) => {
            clickedTile.setListener(() => {
                if (clickedTile.state === 'FLAGGED' ||
                    this.hasLost ||
                    this.hasWon)
                    return;
                const clickedTileNeighbors = this.tileNeighbors[i];
                if (!this.hasInitialized)
                    __classPrivateFieldGet(this, _Grid_instances, "m", _Grid_initialize).call(this, mineCount, new Set([...clickedTileNeighbors, clickedTile]));
                if (clickedTile.state === 'HIDDEN') {
                    const prom = clickedTile.flip();
                    if (clickedTile.isMine) {
                        this.hasLost = true;
                        prom.then(() => this.doLoseAnim());
                    }
                    else if (this.checkForWin()) {
                        this.hasWon = true;
                        setTimeout(() => this.doWinAnim(width), 500);
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
                    if (this.hasLost || this.hasWon)
                        return;
                }
                if (!clickedTile.mineCount ||
                    clickedTile.mineCount ===
                        Grid.countFlaggedTiles(clickedTileNeighbors))
                    setTimeout(() => {
                        const hasMineNeighbor = clickedTileNeighbors.some((tile) => tile.isMine && tile.state === 'HIDDEN');
                        clickedTileNeighbors
                            .filter((tile) => tile.state === 'HIDDEN' &&
                            (!hasMineNeighbor || tile.isMine))
                            .forEach((tile) => tile.elem.click());
                    }, clickedTile.mineCount ? 0 : 100);
            });
            clickedTile.setListener(() => {
                if (!this.hasInitialized)
                    return;
                clickedTile.toggleFlag();
                if (this.checkForWin()) {
                    this.hasWon = true;
                    setTimeout(() => this.doWinAnim(width), 500);
                }
                if (clickCB)
                    clickCB({
                        isMine: clickedTile.isMine,
                        isFlagged: clickedTile.state === 'FLAGGED',
                        isUnflagged: clickedTile.state !== 'FLAGGED',
                        gameState: this.hasWon ? 'WIN' : 'NORMAL',
                    });
            }, {
                isRightClick: true,
            });
        });
    }
    checkForWin() {
        return this.tiles.every((tile) => (!tile.isMine && tile.state === 'REVEALED') ||
            (tile.isMine && tile.state === 'FLAGGED'));
    }
    doLoseAnim() {
        let count = 0;
        const mines = this.tiles.filter((tile) => tile.isMine && tile.state !== 'FLAGGED');
        const hiddenMines = mines.filter((mine) => mine.state === 'HIDDEN');
        const falseFlags = this.tiles.filter((tile) => tile.state === 'FLAGGED' && !tile.isMine);
        Promise.all(hiddenMines
            .concat(falseFlags)
            .map((tile) => delayPromise(count++ * 100, () => tile.flip()))).then(() => mines.forEach((mine) => mine.jumpOut()));
    }
    doWinAnim(width) {
        this.tiles.forEach((tile, i) => {
            const x = i % width;
            const y = Math.floor(i / width);
            setTimeout(() => tile.jumpUp(), (x + y) * 100);
        });
    }
    static countFlaggedTiles(tiles) {
        return tiles.reduce((acc, cur) => {
            if (cur.state === 'FLAGGED')
                acc++;
            return acc;
        }, 0);
    }
    static createNeighborData(width, tiles) {
        return tiles.map((_, i) => {
            const y = Math.floor(i / width);
            const neighbors = [];
            if (tiles[i - width])
                neighbors.push(tiles[i - width]);
            if (tiles[i + width])
                neighbors.push(tiles[i + width]);
            if (y === Math.floor((i - 1) / width))
                neighbors.push(tiles[i - 1]);
            if (y === Math.floor((i + 1) / width))
                neighbors.push(tiles[i + 1]);
            if (y - 1 === Math.floor((i - width - 1) / width) &&
                tiles[i - width - 1])
                neighbors.push(tiles[i - width - 1]);
            if (y - 1 === Math.floor((i - width + 1) / width) &&
                tiles[i - width + 1])
                neighbors.push(tiles[i - width + 1]);
            if (y + 1 === Math.floor((i + width - 1) / width) &&
                tiles[i + width - 1])
                neighbors.push(tiles[i + width - 1]);
            if (y + 1 === Math.floor((i + width + 1) / width) &&
                tiles[i + width + 1])
                neighbors.push(tiles[i + width + 1]);
            return neighbors;
        });
    }
}
_Grid_instances = new WeakSet(), _Grid_initialize = function _Grid_initialize(mineCount, avoid) {
    this.hasInitialized = true;
    while (mineCount) {
        const index = randInt(this.tiles.length - 1);
        const tile = this.tiles[index];
        if (!avoid.has(tile) && !tile.isMine) {
            mineCount--;
            tile.setMine(true);
            this.tileNeighbors[index].forEach((tile) => tile.incrementCount());
        }
    }
};
function delayPromise(delay, getPromise) {
    return new Promise((res) => {
        setTimeout(() => {
            getPromise().then((val) => res(val));
        }, delay);
    });
}
//# sourceMappingURL=grid.js.map