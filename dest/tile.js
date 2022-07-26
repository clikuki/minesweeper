export class Tile {
    constructor(tileSize) {
        // Elements
        this.elem = document.createElement('div');
        this.frontEl = document.createElement('div');
        this.backEl = document.createElement('div');
        // data
        this.state = 'HIDDEN';
        this.isMine = false;
        this.isFlipped = false;
        this.mineCount = 0;
        this.disableFlagToggle = false;
        if (tileSize !== undefined)
            this.elem.style.cssText = `--tile-size:${tileSize}px;`;
        this.elem.classList.add('tile');
        const contentEl = document.createElement('div');
        contentEl.classList.add('content');
        this.frontEl.classList.add('front');
        this.backEl.classList.add('back');
        this.backEl.textContent = '';
        contentEl.append(this.frontEl, this.backEl);
        this.elem.append(contentEl);
    }
    setMine(bool) {
        this.isMine = bool;
        const isRevealed = this.state === 'REVEALED';
        if (this.isMine && isRevealed)
            this.backEl.textContent = "\uD83D\uDCA3" /* Symbols.bomb */;
        else if (this.mineCount && isRevealed)
            this.backEl.textContent = this.mineCount.toString();
        else
            this.backEl.textContent = '';
    }
    toggleFlag() {
        if (this.state === 'REVEALED' || this.disableFlagToggle)
            return 1;
        if (this.state === 'HIDDEN') {
            this.state = 'FLAGGED';
            this.frontEl.textContent = "\uD83D\uDEA9" /* Symbols.flag */;
        }
        else {
            this.state = 'HIDDEN';
            this.frontEl.textContent = '';
        }
        this.disableFlagToggle = true;
        setTimeout(() => (this.disableFlagToggle = false), 100);
    }
    flip() {
        return new Promise((res) => {
            if (this.state === 'HIDDEN') {
                this.state = 'REVEALED';
                if (this.isMine)
                    this.backEl.textContent = "\uD83D\uDCA3" /* Symbols.bomb */;
                else if (this.mineCount)
                    this.backEl.textContent = this.mineCount.toString();
            }
            else {
                this.state = 'HIDDEN';
                this.backEl.textContent = '';
            }
            this.elem.classList.toggle('flipped');
            this.elem.addEventListener('transitionend', () => {
                this.isFlipped = !this.isFlipped;
                res();
            }, {
                once: true,
            });
        });
    }
    jumpOut() {
        return new Promise((res) => {
            this.elem.classList.add('jumpOut');
            this.elem.addEventListener('animationend', () => {
                this.elem.classList.remove('jumpOut');
                res();
            }, { once: true });
        });
    }
    jumpUp() {
        return new Promise((res) => {
            this.elem.classList.add('jumpUp');
            this.elem.addEventListener('animationend', () => {
                this.elem.classList.remove('jumpUp');
                res();
            }, { once: true });
        });
    }
    incrementCount() {
        ++this.mineCount;
    }
    setListener(listener, { isRightClick = false, once = false } = {}) {
        const event = isRightClick ? 'oncontextmenu' : 'onclick';
        this.elem[event] = (e) => {
            if (isRightClick)
                e.preventDefault();
            if (once)
                this.elem[event] = null;
            listener();
        };
    }
}
//# sourceMappingURL=tile.js.map