import { Task } from './task';
import { uuid } from 'uuidv4';

export interface ProcessParams {
  name: string;
  steps: Task[]
  id?: string;
}

/**
 * The Process class hold a collection of tasks to be performed in order
 * ex. 1
 * 
 */
export class Process {
  name: string;
  id: string;
  steps: Task[];
  stepIndex: 0;
	constructor(params: ProcessParams) {
		this.name = params.name;
    this.steps = params.steps;
    this.stepIndex = 0;
    this.id = params.id||uuid()
  }
  start() {
    this.steps[this.stepIndex];
  }
  end() {
    
  }
  
}
