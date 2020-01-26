export const at = (obj, path) => {
	let keys = typeof path === "string" ? path.split(".") : path;
	if (keys.length > 1) {
		return at(obj[keys[0]], keys.slice(1).join("."));
	}
	return obj[keys[0]];
};


export const set = (obj, path, val) => {
	const splitpath = typeof path === "string" ? path.split(".") : path;
	const prepath = splitpath.slice(0, -1);
	const prop = splitpath[splitpath.length - 1];
	const ob = splitpath.length > 1 ? at(obj, prepath) : obj;
	ob[prop] && (ob[prop] = val);
	return obj;
};


export default {
	at,
	set
};