export function chunk(array: Array<any>, size: number) {
	var R = [] as any[];
	for (var i = 0; i < array.length; i += size)
		R.push(array.slice(i, i + size));
	return R;
}

