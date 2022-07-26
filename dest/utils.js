export function getArray(w, h, cb) {
    return new Array(w).fill(0).flatMap(() => new Array(h).fill(1).map(cb));
}
export function randInt(max, min = 0) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
}
//# sourceMappingURL=utils.js.map