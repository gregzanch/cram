import { BVHVector3 } from './BVHVector3';
import { BVHNode } from './BVHNode';

export class BVH {
	rootNode: BVHNode;
	bboxArray: Float32Array;
	trianglesArray: Float32Array;
	constructor(rootNode:BVHNode, boundingBoxArray:Float32Array, triangleArray:Float32Array) {
		this.rootNode = rootNode;
		this.bboxArray = boundingBoxArray;
		this.trianglesArray = triangleArray;
	}
	intersectRay(rayOrigin:any, rayDirection:any, backfaceCulling:boolean = true):any[] {
		try {
			rayOrigin = BVHVector3.fromAny(rayOrigin);
			rayDirection = BVHVector3.fromAny(rayDirection);
		} catch(error) {
			throw new TypeError("Origin or Direction couldn't be converted to a BVHVector3.");
		}
		const nodesToIntersect:BVHNode[] = [this.rootNode];
		const trianglesInIntersectingNodes:number[] = []; // a list of nodes that intersect the ray (according to their bounding box)
		const intersectingTriangles:object[] = [];

		const invRayDirection = new BVHVector3(
			1.0 / rayDirection.x,
			1.0 / rayDirection.y,
			1.0 / rayDirection.z
		);

		// go over the BVH tree, and extract the list of triangles that lie in nodes that intersect the ray.
		// note: these triangles may not intersect the ray themselves
		while(nodesToIntersect.length > 0) {
			const node:BVHNode | undefined = nodesToIntersect.pop();
			if(!node) continue;
			if(BVH.intersectNodeBox(rayOrigin, invRayDirection, node)) {
				if(node.node0) {
					nodesToIntersect.push(node.node0);
				}
				if(node.node1) {
					nodesToIntersect.push(node.node1);
				}
				for(let i = node.startIndex; i < node.endIndex; i++) {
					trianglesInIntersectingNodes.push(this.bboxArray[i*7]);
				}
			}
		}

		// go over the list of candidate triangles, and check each of them using ray triangle intersection
		let a:BVHVector3 = new BVHVector3();
		let b:BVHVector3 = new BVHVector3();
		let c:BVHVector3 = new BVHVector3();

		for(let i = 0; i < trianglesInIntersectingNodes.length; i++) {
			const triIndex = trianglesInIntersectingNodes[i];

			a.setFromArray(this.trianglesArray, triIndex*9);
			b.setFromArray(this.trianglesArray, triIndex*9+3);
			c.setFromArray(this.trianglesArray, triIndex*9+6);

			const intersectionPoint = BVH.intersectRayTriangle(a, b, c, rayOrigin, rayDirection, backfaceCulling);

			if(!intersectionPoint) continue;
			intersectingTriangles.push({
				//triangle: [a.clone(), b.clone(), c.clone()],
				triangleIndex: triIndex,
				intersectionPoint: intersectionPoint
			});
		}

		return intersectingTriangles;
	}
	static calcTValues(minVal:number, maxVal:number, rayOriginCoord:number, invdir: number):number[] {
		if(invdir >= 0) {
			return [(minVal - rayOriginCoord) * invdir, (maxVal - rayOriginCoord) * invdir];
		} else {
			return [(maxVal - rayOriginCoord) * invdir, (minVal - rayOriginCoord) * invdir];
		}
	}

	static intersectNodeBox(rayOrigin: BVHVector3, invRayDirection: BVHVector3, node: BVHNode):boolean {
		let [tmin, tmax]:number[] = BVH.calcTValues(node.extentsMin[0], node.extentsMax[0], rayOrigin.x, invRayDirection.x);
		let [tymin, tymax]:number[] = BVH.calcTValues(node.extentsMin[1], node.extentsMax[1], rayOrigin.y, invRayDirection.y);

		if(tmin > tymax || tymin > tmax) return false;

		// These lines also handle the case where tmin or tmax is NaN
		// (result of 0 * Infinity). x !== x returns true if x is NaN
		if(tymin > tmin || tmin !== tmin) {
			tmin = tymin;
		}

		if(tymax < tmax || tmax !== tmax) {
			tmax = tymax;
		}

		let [tzmin, tzmax]:number[] = BVH.calcTValues(node.extentsMin[2], node.extentsMax[2], rayOrigin.z, invRayDirection.z);

		if(tmin > tzmax || tzmin > tmax) return false;

		if(tzmax < tmax || tmax !== tmax) {
			tmax = tzmax;
		}

		//return point closest to the ray (positive side)
		if(tmax < 0) return false;

		return true;
	}

	static intersectRayTriangle(a:BVHVector3, b:BVHVector3, c:BVHVector3, rayOrigin:BVHVector3, rayDirection:BVHVector3, backfaceCulling:boolean):BVHVector3 | null {
		var diff:BVHVector3 = new BVHVector3();
		var edge1:BVHVector3 = new BVHVector3();
		var edge2:BVHVector3 = new BVHVector3();
		var normal:BVHVector3 = new BVHVector3();

		// from http://www.geometrictools.com/LibMathematics/Intersection/Wm5IntrRay3Triangle3.cpp
		edge1.subVectors(b, a);
		edge2.subVectors(c, a);
		normal.crossVectors(edge1, edge2);

		// Solve Q + t*D = b1*E1 + bL*E2 (Q = kDiff, D = ray direction,
		// E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
		//   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
		//   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
		//   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
		let DdN:number = rayDirection.dot(normal);
		if(DdN === 0) return null;
		if(DdN > 0 && backfaceCulling) return null;
		let sign:number = Math.sign(DdN);
		DdN *= sign;

		diff.subVectors(rayOrigin, a);
		var DdQxE2 = sign * rayDirection.dot(edge2.crossVectors(diff, edge2));

		// b1 < 0, no intersection
		if(DdQxE2 < 0) return null;

		var DdE1xQ = sign * rayDirection.dot(edge1.cross(diff));

		// b2 < 0, no intersection
		if(DdE1xQ < 0) return null;

		// b1+b2 > 1, no intersection
		if(DdQxE2 + DdE1xQ > DdN) return null;

		// Line intersects triangle, check if ray does.
		const QdN:number = -sign * diff.dot(normal);

		// t < 0, no intersection
		if(QdN < 0) return null;

		// Ray intersects triangle.
		return rayDirection.clone().multiplyScalar(QdN / DdN).add(rayOrigin);
	}
}
