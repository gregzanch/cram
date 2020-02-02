import Messenger from "../messenger";
import { uuid } from "uuidv4";

export interface TaskParams {
  name: string;
  id?: string;
  desc: string;
  complete: (...args) => any;
}

export class Task{
  name: string;
  desc: string;
  complete: (...args) => any;
  id: string;
  constructor(params: TaskParams) {
    this.name = params.name;
    this.desc = params.desc;
    this.id = params.id || uuid()
    this.complete = params.complete;
  }
}