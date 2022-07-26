var _a, _b;
import { Grid } from './grid.js';
class FlagsLeft {
    static updateDisplay() {
        this.elem.textContent = `${"\uD83D\uDEA9" /* Symbols.flag */} ${Math.max(this.counter, 0)}`;
    }
    static set(val) {
        this.counter = val;
        this.updateDisplay();
    }
    static crement(change) {
        this.counter += change;
        this.updateDisplay();
    }
}
FlagsLeft.elem = document.querySelector('.flagsLeft');
FlagsLeft.counter = 0;
class Timer {
    static updateDisplay(t) {
        const timeSince = t - this.timeStart;
        const minutes = Math.floor(timeSince / 1000 / 60);
        const seconds = `${Math.floor(timeSince / 1000) % 60}`.padStart(2, '0');
        const milliseconds = `${Math.floor((timeSince % 1000) / 10)}`.padStart(2, '0');
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
}
_a = Timer;
Timer.elem = document.querySelector('.timer');
Timer.timeStart = 0;
Timer.doTicks = false;
(() => {
    const That = _a;
    requestAnimationFrame(function loop(t) {
        requestAnimationFrame(loop);
        if (That.doTicks) {
            That.updateDisplay(t);
        }
        else
            That.timeStart = t;
    });
})();
class Difficulty {
    static updateDisplay() {
        this.slot.textContent = this.current.name;
    }
}
_b = Difficulty;
Difficulty.button = document.querySelector('.difficulty');
Difficulty.slot = _b.button.querySelector('.slot');
Difficulty.difficulties = [
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
Difficulty.customDifficulty = _b.difficulties[3];
Difficulty.curDifficulty = 1;
Difficulty.current = _b.difficulties[_b.curDifficulty];
Difficulty.widthInput = document.querySelector('.customInputs .width');
Difficulty.heightInput = document.querySelector('.customInputs .height');
Difficulty.mineInput = document.querySelector('.customInputs .mineCount');
Difficulty.labels = [
    ...document.querySelectorAll('.customInputs label'),
];
Difficulty.inputs = [
    _b.widthInput,
    _b.heightInput,
    _b.mineInput,
];
(() => {
    _b.updateDisplay();
    _b.button.addEventListener('click', () => {
        _b.curDifficulty =
            ++_b.curDifficulty % _b.difficulties.length;
        _b.current = _b.difficulties[_b.curDifficulty];
        const isNotCustomDifficulty = _b.current.name !== 'Custom';
        _b.labels.forEach((label) => label.setAttribute('aria-disabled', isNotCustomDifficulty.toString()));
        _b.inputs.forEach((input) => (input.disabled = isNotCustomDifficulty));
        _b.updateDisplay();
        restart();
    });
    const getSizeCB = (input, startValue, fieldKey) => {
        let value = startValue.toString();
        input.value = value;
        return () => {
            const newVal = input.value;
            if (newVal === '' || +newVal < 5) {
                input.value = value;
                return;
            }
            value = newVal;
            _b.customDifficulty[fieldKey] = +newVal;
            const customDiff = _b.customDifficulty;
            if (customDiff.mineCount >
                customDiff.width * customDiff.height - 9) {
                const maxMineCount = customDiff.width * customDiff.height - 9;
                customDiff.mineCount = maxMineCount;
                mineValue = maxMineCount.toString();
                _b.mineInput.value = mineValue;
            }
            restart();
        };
    };
    let mineValue = '20';
    _b.mineInput.value = mineValue;
    const mineCB = () => {
        const newVal = _b.mineInput.value;
        const { width, height } = _b.customDifficulty;
        if (newVal === '' || +newVal < 0 || +newVal > width * height - 9) {
            _b.mineInput.value = mineValue;
            return;
        }
        mineValue = newVal;
        _b.customDifficulty.mineCount = +newVal;
        restart();
    };
    [
        [_b.widthInput, getSizeCB(_b.widthInput, 10, 'width')],
        [_b.heightInput, getSizeCB(_b.heightInput, 10, 'height')],
        [_b.mineInput, mineCB],
    ].forEach(([input, cb]) => input.addEventListener('input', cb));
})();
const container = document.querySelector('.container');
function newGrid() {
    FlagsLeft.set(Difficulty.current.mineCount);
    let grid = new Grid(Difficulty.current.width, Difficulty.current.height, Difficulty.current.mineCount, container, ({ isFlagged, isUnflagged }) => {
        Timer.startUpdates();
        if (isUnflagged)
            FlagsLeft.crement(1);
        else if (isFlagged)
            FlagsLeft.crement(-1);
        if (grid.hasWon || grid.hasLost)
            Timer.stopUpdates();
    });
}
function restart() {
    Timer.reset();
    newGrid();
}
const restartBtn = document.querySelector('.restart');
restartBtn.addEventListener('click', restart);
newGrid();
//# sourceMappingURL=main.js.map