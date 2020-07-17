export class BVHVector3  {
	x: number = 0;
	y: number = 0;
	z: number = 0;
	constructor(x:number = 0, y:number = 0, z:number = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	copy(v:BVHVector3) {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		return this;
	}
	setFromArray(array:Float32Array, firstElementPos:number) {
		this.x = array[firstElementPos];
		this.y = array[firstElementPos+1];
		this.z = array[firstElementPos+2];
	}
	setFromArrayNoOffset(array:number[]) {
		this.x = array[0];
		this.y = array[1];
		this.z = array[2];
	}

	setFromArgs(a:number, b:number, c:number) {
		this.x = a;
		this.y = b;
		this.z = c;
	}
	add(v:BVHVector3) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		return this;
	}
	multiplyScalar(scalar:number) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}
	subVectors(a:BVHVector3, b:BVHVector3) {
		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;
		return this;
	}
	dot(v:BVHVector3) {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}
	cross(v:BVHVector3) {
		const x = this.x, y = this.y, z = this.z;
		this.x = y * v.z - z * v.y;
		this.y = z * v.x - x * v.z;
		this.z = x * v.y - y * v.x;
		return this;
	}
	crossVectors(a:BVHVector3, b:BVHVector3) {
		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;
		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;
		return this;
	}
	clone() {
		return new BVHVector3(this.x, this.y, this.z);
	}
	static fromAny(potentialVector:any):BVHVector3 {
		if(potentialVector instanceof BVHVector3) {
			return potentialVector;
		} else if (potentialVector.x !== undefined && potentialVector.x !== null) {
			return new BVHVector3(potentialVector.x, potentialVector.y, potentialVector.z);
		} else {
			throw new TypeError("Couldn't convert to BVHVector3.");
		}
	}
}
