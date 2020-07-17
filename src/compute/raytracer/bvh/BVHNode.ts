export class BVHNode {
	extentsMin: XYZ;
	extentsMax: XYZ;
	startIndex: number;
	endIndex: number;
	level: number;
	node0: BVHNode | null;
	node1: BVHNode | null;
	constructor(extentsMin: XYZ, extentsMax: XYZ, startIndex: number, endIndex: number, level: number) {
		this.extentsMin = extentsMin;
		this.extentsMax = extentsMax;
		this.startIndex = startIndex;
		this.endIndex = endIndex;
		this.level = level;
		this.node0 = null;
		this.node1 = null;
	}
	static fromObj({extentsMin, extentsMax, startIndex, endIndex, level, node0, node1}:any) {
		const tempNode = new BVHNode(extentsMin, extentsMax, startIndex, endIndex, level);
		if(node0) tempNode.node0 = BVHNode.fromObj(node0);
		if(node1) tempNode.node1 = BVHNode.fromObj(node1);
		return tempNode;
	}
	elementCount() {
		return this.endIndex - this.startIndex;
	}

	centerX() {
		return (this.extentsMin[0] + this.extentsMax[0]) * 0.5;
	}

	centerY() {
		return (this.extentsMin[1] + this.extentsMax[1]) * 0.5;
	}

	centerZ() {
		return (this.extentsMin[2] + this.extentsMax[2]) * 0.5;
	}

	clearShapes() {
		this.startIndex = -1;
		this.endIndex = -1;
	}
	get children() {
		return [this.node0, this.node1];
	}
	
}
