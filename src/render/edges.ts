//@ts-nocheck
function hash(str) {
	var h = 0;
	if (str.length == 0) {
		return h;
	}
	for (var i = 0; i < str.length; i++) {
		var char = str.charCodeAt(i);
		h = (h << 5) - h + char;
		h = h & h; // Convert to 32bit integer
	}
	return h;
}

class vec3 {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.id = hash([this.x, this.y, this.z].toString());
	}
}
class line {
	constructor(a, b) {
		this.a = a;
		this.b = b;
		this.id = hash(String(this.a.id + this.b.id));
	}
}
class triangle {
	constructor(a, b, c) {
		this.a = a;
		this.b = b;
		this.c = c;
		this.ab = new line(this.a, this.b);
		this.ac = new line(this.a, this.c);
		this.bc = new line(this.b, this.c);
	}
}
class Surface {
	constructor(tris) {
		this.tris = tris;
		this.lines = tris.reduce((a, b) => {
			a.push(b.ab, b.ac, b.bc);
			return a;
		}, []);
	}
}

function triangulate(arr) {
	const tris = [];
	const N = 3;
	let pt = [];
	let tri = [];
	for (let i = 0; i < arr.length; i++) {
		pt.push(arr[i]);
		if (i % N == N - 1) {
			// point finished
			tri.push(new vec3(pt[0], pt[1], pt[2]));
			pt = [];
			if (i % (N * N) == N * N - 1) {
				// tri finished
				tris.push(new triangle(tri[0], tri[1], tri[2]));
				tri = [];
			}
		}
	}
	return new Surface(tris);
}

function edges(arr) {
	const surface = triangulate(arr);

	let dict = {};
	surface.lines.forEach(line => {
		if (!dict[String(line.id)]) {
			dict[String(line.id)] = line;
		} else {
			dict[String(line.id)] = "";
		}
	});
	let lines = [];
	Object.keys(dict).forEach(x => {
		if (typeof dict[x] !== "string") {
			lines.push(dict[x]);
		}
	});
	return { surface, lines };
}

module.exports = edges;
