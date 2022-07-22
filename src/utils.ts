export function getArray<T>(w: number, h: number, cb: () => T): T[] {
	return new Array(w).fill(0).flatMap(() => new Array(h).fill(1).map(cb));
}
export function randInt(max: number, min = 0) {
	return Math.floor(Math.random() * (max + 1 - min) + min);
}
