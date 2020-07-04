export function randomInt(min, max) {
	return min + Math.floor((max - min) * Math.random());
}

export function randomFloat(min, max) {
    return min + (max - min) * Math.random();
}