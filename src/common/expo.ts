
export default function expo(value: string, places: number = 3) {
	const float = Number.parseFloat(value);
	if (!float) {
        return value;
	}
    return float.toExponential(places);
}

export function expoif(value, condition_function, places=3) {
	const float = Number(value);
	if (!float) {
		return;
	}
	if (!condition_function(float)) {
		return;
	}
	return float.toExponential(places);
}
