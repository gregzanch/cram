import { BVHNode } from './BVHNode';

export function countNodes(node:BVHNode, count:number = 0):number {
	count += 1;
	if(node.node0) {
		count += countNodes(node.node0);
	}
	if(node.node1) {
		count += countNodes(node.node1);
	}
	if((node as any)._node0) {
		count += countNodes((node as any)._node0);
	}
	if((node as any)._node1) {
		count += countNodes((node as any)._node1);
	}
	return count;
}

export async function asyncWork(workCheck:Evaluator, work:Work, options:AsyncifyParams, progressCallback?:WorkProgressCallback):Promise<void> {
	if(options.ms !== undefined && options.steps !== undefined) {
		console.warn("Asyncify got both steps and ms, defaulting to steps.");
	}
	const worker: Generator = (options.steps !== undefined ? percentageAsyncify : timeAsyncify)(workCheck, work, options);
	// let done: boolean = false;
	let nodesSplit: number;
	// !(, done)
	let { value, done } = worker.next()
	while (!done) {
		if(typeof progressCallback !== 'undefined') {
			progressCallback({nodesSplit: value});
		}
		await tickify();
		let next = worker.next();
		value = next.value;
		done = next.done;
	}
}

function* timeAsyncify(workCheck:Evaluator, work:Work, {ms=1000 / 30}:AsyncifyParams) {
	let sTime:number = Date.now();
	let n:number = 0;
	let thres:number = 0;
	let count:number = 0;
	while(workCheck() < 1) {
		work();
		count++;
		if(++n >= thres) {
			const cTime = Date.now();
			const tDiff = cTime - sTime;
			if(tDiff > ms) {
				yield count;
				thres = n * (ms / tDiff);
				sTime = cTime;
				n = 0;
			}
		}
	}
}

function* percentageAsyncify(workCheck:Evaluator, work:Work, {steps=10}:AsyncifyParams) {
	if(steps <= 0) {
		throw new Error("Asyncify steps was less than or equal to zero");
	}
	let count:number = 0;
	let totalNumber: number = 0;
	let lastInc:number = 0;
	let workPercentage:number;
	let percentage:number = 1 / steps;
	while((workPercentage = workCheck(), workPercentage < 1)) {
		work();
		count++;
		if(workPercentage > lastInc) {
			totalNumber += 1;
			yield count;
			lastInc = workPercentage + percentage;
		}
	}
	console.log("Total", totalNumber);
}



const tickify = ():Promise<void> => new Promise((res:Work) => setTimeout(res));
