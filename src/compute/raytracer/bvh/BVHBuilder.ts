declare global {
	interface XYZ {
		0: number,
		1: number,
		2: number
	}
	
	interface Vector {
		x: number;
		y: number;
		z: number;
	}

	type Evaluator = () => number;
	type Work = () => void;
	type WorkProgress = {nodesSplit: number};
	type WorkProgressCallback = (progressObj:WorkProgress) => void;
	type BVHProgress = {nodesSplit: number, trianglesLeafed: number};
	type AsyncifyParams = {ms?: number, steps?: number};
}

const EPSILON = 1e-6;

import { BVHVector3 } from "./BVHVector3";
import { BVHNode } from "./BVHNode";
import { BVH } from "./BVH";
import { asyncWork } from './utils'

export function BVHBuilder(triangles:unknown | Vector[][] | number[] | Float32Array, maxTrianglesPerNode:number = 10) {
	if(typeof maxTrianglesPerNode !== 'number') throw new Error(`maxTrianglesPerNode must be of type number, got: ${typeof maxTrianglesPerNode}`);
	if(maxTrianglesPerNode < 1) throw new Error(`maxTrianglesPerNode must be greater than or equal to 1, got: ${maxTrianglesPerNode}`);
	if(Number.isNaN(maxTrianglesPerNode)) throw new Error(`maxTrianglesPerNode is NaN`);
	if(!Number.isInteger(maxTrianglesPerNode)) console.warn(`maxTrianglesPerNode is expected to be an integer, got: ${maxTrianglesPerNode}`);
	let trianglesArray:Float32Array;
	//Vector[][] | number[] | Float32Array
	if(Array.isArray(triangles) && triangles.length === 0) {
		console.warn(`triangles appears to be an array with 0 elements.`);
	}
	if(isFaceArray(triangles)) {
		trianglesArray = buildTriangleArray(triangles);
	} else if (triangles instanceof Float32Array) {
		trianglesArray = triangles;
	} else if (isNumberArray(triangles)) {
		trianglesArray = new Float32Array(triangles)
	} else {
		throw new Error(`triangles must be of type Vector[][] | number[] | Float32Array, got: ${typeof triangles}`);
	}
	let bboxArray:Float32Array = calcBoundingBoxes(trianglesArray);
	// clone a helper array
	let bboxHelper:Float32Array = new Float32Array(bboxArray.length);
	bboxHelper.set(bboxArray);

	// create the root node, add all the triangles to it
	var triangleCount:number = trianglesArray.length / 9;
	var extents:XYZ[] = calcExtents(bboxArray, 0, triangleCount, EPSILON);
	let rootNode:BVHNode = new BVHNode(extents[0], extents[1], 0, triangleCount, 0);
	let nodesToSplit:BVHNode[] = [rootNode];
	let node:BVHNode | undefined;

	while(node = nodesToSplit.pop()) {
		let nodes = splitNode(node, maxTrianglesPerNode, bboxArray, bboxHelper);
		nodesToSplit.push(...nodes);
	}
	
	return new BVH(rootNode, bboxArray, trianglesArray);
}

export async function BVHBuilderAsync(triangles:unknown | Vector[][] | number[] | Float32Array, maxTrianglesPerNode:number = 10, asyncParams:AsyncifyParams = {}, progressCallback?:(obj:BVHProgress) => void):Promise<BVH> {
	if(typeof maxTrianglesPerNode !== 'number') throw new Error(`maxTrianglesPerNode must be of type number, got: ${typeof maxTrianglesPerNode}`);
	if(maxTrianglesPerNode < 1) throw new Error(`maxTrianglesPerNode must be greater than or equal to 1, got: ${maxTrianglesPerNode}`);
	if(Number.isNaN(maxTrianglesPerNode)) throw new Error(`maxTrianglesPerNode is NaN`);
	if(!Number.isInteger(maxTrianglesPerNode)) console.warn(`maxTrianglesPerNode is expected to be an integer, got: ${maxTrianglesPerNode}`);
	let trianglesArray:Float32Array;
	//Vector[][] | number[] | Float32Array
	if(Array.isArray(triangles) && triangles.length === 0) {
		console.warn(`triangles appears to be an array with 0 elements.`);
	}
	if(isFaceArray(triangles)) {
		trianglesArray = buildTriangleArray(triangles);
	} else if (triangles instanceof Float32Array) {
		trianglesArray = triangles;
	} else if (isNumberArray(triangles)) {
		trianglesArray = new Float32Array(triangles)
	} else {
		throw new Error(`triangles must be of type Vector[][] | number[] | Float32Array, got: ${typeof triangles}`);
	}
	let bboxArray:Float32Array = calcBoundingBoxes(trianglesArray);
	// clone a helper array
	let bboxHelper:Float32Array = new Float32Array(bboxArray.length);
	bboxHelper.set(bboxArray);

	// create the root node, add all the triangles to it
	var triangleCount:number = trianglesArray.length / 9;
	var extents:XYZ[] = calcExtents(bboxArray, 0, triangleCount, EPSILON);
	let rootNode:BVHNode = new BVHNode(extents[0], extents[1], 0, triangleCount, 0);
	let nodesToSplit:BVHNode[] = [rootNode];
	let node:BVHNode | undefined;

	let tally = 0;
	await asyncWork(() => {
		node = nodesToSplit.pop();
		return tally * 9 / trianglesArray.length;
	}, () => {
		if(!node) return;
		let nodes = splitNode(node, maxTrianglesPerNode, bboxArray, bboxHelper);
		if(!nodes.length) tally += node.elementCount();
		nodesToSplit.push(...nodes);
	}, asyncParams, progressCallback ?
		(nodesSplit:WorkProgress) => progressCallback(Object.assign({trianglesLeafed: tally}, nodesSplit))
		: undefined
	);
	return new BVH(rootNode, bboxArray, trianglesArray);
}

function splitNode(node: BVHNode, maxTriangles:number, bboxArray:Float32Array, bboxHelper:Float32Array):BVHNode[] {
	const nodeCount:number = node.elementCount()
	if (nodeCount <= maxTriangles || nodeCount === 0) return [];

	let startIndex:number = node.startIndex;
	let endIndex:number = node.endIndex;

	let leftNode:number[][] = [ [],[],[] ];
	let rightNode:number[][] = [ [],[],[] ];
	let extentCenters:number[] = [node.centerX(), node.centerY(), node.centerZ()];

	let objectCenter:number[] = [];
	objectCenter.length = 3;

	for (let i = startIndex; i < endIndex; i++) {
		let idx = i * 7 + 1;
		objectCenter[0] = (bboxArray[idx] + bboxArray[idx++ + 3]) * 0.5; // center = (min + max) / 2
		objectCenter[1] = (bboxArray[idx] + bboxArray[idx++ + 3]) * 0.5; // center = (min + max) / 2
		objectCenter[2] = (bboxArray[idx] + bboxArray[idx + 3]) * 0.5; // center = (min + max) / 2
		for (let j = 0; j < 3; j++) {
			if (objectCenter[j] < extentCenters[j]) {
				leftNode[j].push(i);
			} else {
				rightNode[j].push(i);
			}
		}
	}

	// check if we couldn't split the node by any of the axes (x, y or z). halt here, dont try to split any more (cause it will always fail, and we'll enter an infinite loop
	var splitFailed:boolean[] = [];
	splitFailed.length = 3;

	splitFailed[0] = (leftNode[0].length === 0) || (rightNode[0].length === 0);
	splitFailed[1] = (leftNode[1].length === 0) || (rightNode[1].length === 0);
	splitFailed[2] = (leftNode[2].length === 0) || (rightNode[2].length === 0);

	if (splitFailed[0] && splitFailed[1] && splitFailed[2]) return [];

	// choose the longest split axis. if we can't split by it, choose next best one.
	var splitOrder = [0, 1, 2];

	var extentsLength = [
		node.extentsMax[0] - node.extentsMin[0],
		node.extentsMax[1] - node.extentsMin[1],
		node.extentsMax[2] - node.extentsMin[2]
	];

	splitOrder.sort((axis0, axis1) => extentsLength[axis1] - extentsLength[axis0]);

	let leftElements:number[] | undefined = [];
	let rightElements:number[] | undefined = [];

	for (let j = 0; j < 3; j++) {
		var candidateIndex = splitOrder[j];
		if (!splitFailed[candidateIndex]) {
			leftElements = leftNode[candidateIndex];
			rightElements = rightNode[candidateIndex];
			break;
		}
	}


	// sort the elements in range (startIndex, endIndex) according to which node they should be at
	var node0Start = startIndex;
	var node0End = node0Start + leftElements.length;
	var node1Start = node0End;
	var node1End = endIndex;
	
	copyBoxes(leftElements, rightElements, node.startIndex, bboxArray, bboxHelper);

	// copy results back to main array
	var subArr = bboxHelper.subarray(node.startIndex * 7, node.endIndex * 7);
	bboxArray.set(subArr, node.startIndex * 7);

	// create 2 new nodes for the node we just split, and add links to them from the parent node
	var node0Extents = calcExtents(bboxArray, node0Start, node0End, EPSILON);
	var node1Extents = calcExtents(bboxArray, node1Start, node1End, EPSILON);

	var node0 = new BVHNode(node0Extents[0], node0Extents[1], node0Start, node0End, node.level + 1);
	var node1 = new BVHNode(node1Extents[0], node1Extents[1], node1Start, node1End, node.level + 1);

	node.node0 = node0;
	node.node1 = node1;
	node.clearShapes();

	// add new nodes to the split queue
	return [node0, node1];
}

function copyBoxes(leftElements:number[], rightElements:number[], startIndex:number, bboxArray:Float32Array, bboxHelper:Float32Array) {
	var concatenatedElements = leftElements.concat(rightElements);
	var helperPos = startIndex;
	for (let i = 0; i < concatenatedElements.length; i++) {
		let currElement = concatenatedElements[i];
		copyBox(bboxArray, currElement, bboxHelper, helperPos);
		helperPos++;
	}
}

function calcExtents(bboxArray:Float32Array, startIndex:number, endIndex:number, expandBy: number = 0.0):XYZ[] {
	if (startIndex >= endIndex) return [[0, 0, 0], [0, 0, 0]];
	let minX = Infinity;
	let minY = Infinity;
	let minZ = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	let maxZ = -Infinity;
	for (let i = startIndex; i < endIndex; i++) {
		let idx = i * 7 + 1;
		minX = Math.min(bboxArray[idx++], minX);
		minY = Math.min(bboxArray[idx++], minY);
		minZ = Math.min(bboxArray[idx++], minZ);
		maxX = Math.max(bboxArray[idx++], maxX);
		maxY = Math.max(bboxArray[idx++], maxY);
		maxZ = Math.max(bboxArray[idx], maxZ);
	}
	return [
		[minX - expandBy, minY - expandBy, minZ - expandBy],
		[maxX + expandBy, maxY + expandBy, maxZ + expandBy]
	];
}

function calcBoundingBoxes(trianglesArray: Float32Array):Float32Array {
	const triangleCount:number = trianglesArray.length / 9;
	const bboxArray:Float32Array = new Float32Array(triangleCount * 7);

	for (let i = 0; i < triangleCount; i++) {
		let idx = i * 9;
		const p0x = trianglesArray[idx++];
		const p0y = trianglesArray[idx++];
		const p0z = trianglesArray[idx++];
		const p1x = trianglesArray[idx++];
		const p1y = trianglesArray[idx++];
		const p1z = trianglesArray[idx++];
		const p2x = trianglesArray[idx++];
		const p2y = trianglesArray[idx++];
		const p2z = trianglesArray[idx];

		const minX = Math.min(p0x, p1x, p2x);
		const minY = Math.min(p0y, p1y, p2y);
		const minZ = Math.min(p0z, p1z, p2z);
		const maxX = Math.max(p0x, p1x, p2x);
		const maxY = Math.max(p0y, p1y, p2y);
		const maxZ = Math.max(p0z, p1z, p2z);
		setBox(bboxArray, i, i, minX, minY, minZ, maxX, maxY, maxZ);
	}

	return bboxArray;
}

function buildTriangleArray(triangles:Vector[][]):Float32Array {
	const trianglesArray = new Float32Array(triangles.length * 9);

	for (let i = 0; i < triangles.length; i++) {
		const p0 = triangles[i][0];
		const p1 = triangles[i][1];
		const p2 = triangles[i][2];
		let idx = i * 9;
		trianglesArray[idx++] = p0.x;
		trianglesArray[idx++] = p0.y;
		trianglesArray[idx++] = p0.z;

		trianglesArray[idx++] = p1.x;
		trianglesArray[idx++] = p1.y;
		trianglesArray[idx++] = p1.z;

		trianglesArray[idx++] = p2.x;
		trianglesArray[idx++] = p2.y;
		trianglesArray[idx] = p2.z;
	}

	return trianglesArray;
}

function setBox(bboxArray:Float32Array, pos:number, triangleId:number, minX:number, minY:number, minZ:number, maxX:number, maxY:number, maxZ:number):void {
	let idx = pos * 7;
	bboxArray[idx++] = triangleId;
	bboxArray[idx++] = minX;
	bboxArray[idx++] = minY;
	bboxArray[idx++] = minZ;
	bboxArray[idx++] = maxX;
	bboxArray[idx++] = maxY;
	bboxArray[idx] = maxZ;
}

function copyBox(sourceArray:Float32Array, sourcePos:number, destArray:Float32Array, destPos:number):void {
	let idx = destPos * 7;
	let jdx = sourcePos * 7;
	destArray[idx++] = sourceArray[jdx++];
	destArray[idx++] = sourceArray[jdx++];
	destArray[idx++] = sourceArray[jdx++];
	destArray[idx++] = sourceArray[jdx++];
	destArray[idx++] = sourceArray[jdx++];
	destArray[idx++] = sourceArray[jdx++];
	destArray[idx] = sourceArray[jdx];
}

function isFaceArray(testArray: unknown): testArray is Vector[][] {
	if(!Array.isArray(testArray)) return false;
	for(let i = 0; i < testArray.length; i++) {
		const face = testArray[i];
		if(!Array.isArray(face)) return false;
		if(face.length !== 3) return false;
		for(let j = 0; j < 3; j++) {
			const vertex:Vector = <Vector>face[j];
			if(typeof vertex.x !== "number" || typeof vertex.y !== "number" || typeof vertex.z !== "number") return false;
		}
	}
	return true;
}

function isNumberArray(testArray: unknown): testArray is number[] {
	if(!Array.isArray(testArray)) return false;
	for(let i = 0; i < testArray.length; i++) {
		if(typeof testArray[i] !== "number") return false;
	}
	return true;
}
