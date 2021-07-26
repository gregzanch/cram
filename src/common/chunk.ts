export function chunk<T>(array: Array<T>, size: number) {
	var R = [] as T[][];
	for (var i = 0; i < array.length; i += size)
		R.push(array.slice(i, i + size));
	return R;
}

export function chunkf32(array: Float32Array, size: number) {
	var R = [] as Float32Array[];
	for (var i = 0; i < array.length; i += size)
		R.push(array.slice(i, i + size));
	return R;
}

