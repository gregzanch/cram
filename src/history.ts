import { uuid } from 'uuidv4';


export interface Directions {
  UNDO: "UNDO";
  REDO: "REDO";
}

export interface MomentProps{
  recallFunction: (direction?: keyof Directions, ...args) => void;
  objectId: string;
  category: string;
}

export class Moment {
  uuid: string;
  objectId: string;
  category: string;
  timestamp: number;
  recallFunction: (...args) => void;
  constructor(props: MomentProps) {
    this.uuid = uuid();
    this.objectId = props.objectId;
    this.category = props.category;
    this.recallFunction = props.recallFunction;
    this.timestamp = Date.now();
  }
}


export class History {
  timeline: Moment[];
  currentIndex: number;
  constructor() {
    this.timeline = [] as Moment[];
    this.currentIndex = 0;
  }
  addMoment(params: MomentProps) {
    const { objectId, category, recallFunction } = params;
    if (this.timeline.length > 0 && this.currentIndex < this.timeline.length - 1) {
      this.timeline = this.timeline.slice(0, this.currentIndex);
      this.timeline.push(new Moment({ objectId, category, recallFunction }));
      this.currentIndex = this.timeline.length - 1;
    } else {
      this.timeline.push(new Moment({ objectId, category, recallFunction }));
      this.currentIndex = this.timeline.length - 1;
    }
  }
  undo() {
    if (this.currentIndex >= 0) {
      this.recall("UNDO");
      this.currentIndex -= 1;
    }
  }

  redo() {
    if (this.currentIndex < this.timeline.length - 1) {
      this.currentIndex += 1;
      this.recall("REDO");
    }
  }
  recall(direction: keyof Directions) {
    if (this.timeline[this.currentIndex]) {
      this.timeline[this.currentIndex].recallFunction(direction);
    }
  }
  clear() {
    this.timeline = [];
    this.currentIndex = 0;
  }
  get canUndo() {
    return this.currentIndex >= 0;
  }
  get canRedo() {
    return this.currentIndex < this.timeline.length - 1;
  }
}

export const history = new History();

export const addMoment = history.addMoment.bind(history);
