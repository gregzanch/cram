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

export interface Undoable {
  /** Undoes the command */
  undo(): void;
  /** Redoes the undone command */
  redo(): void;
}

export class UndoHistory {
  /** The undoable objects. */
  private readonly undos: Array<Undoable>;

  /** The redoable objects. */
  private readonly redos: Array<Undoable>;

  /** The maximal number of undo. */
  private sizeMax: number;

  public constructor() {
      this.sizeMax = 0;
      this.undos = [];
      this.redos = [];
      this.sizeMax = 30;
  }

  /** Adds an undoable object to the collector. */
  public add(undoable: Undoable): void {
      if (this.sizeMax > 0) {
          // Cleaning the oldest undoable object
          if (this.undos.length === this.sizeMax) {
              this.undos.shift();
          }

          this.undos.push(undoable);
          // You must clear the redo stack!
          this.clearRedo();
      }
  }

  private clearRedo(): void {
      if (this.redos.length > 0) {
          this.redos.length = 0;
      }
  }

  /** Undoes the last undoable object. */
  public undo(): void {
      const undoable = this.undos.pop();
      if (undoable !== undefined) {
          undoable.undo();
          this.redos.push(undoable);
      }
  }

  /** Redoes the last undoable object. */
  public redo(): void {
      const undoable = this.redos.pop();
      if (undoable !== undefined) {
          undoable.redo();
          this.undos.push(undoable);
      }
  }
}


type TextData = {
  text: string;
}

export class ClearTextCmd implements Undoable {
  // The memento that saves the previous state of the text data
  private memento!: string;

  public constructor(private text: TextData) {
    this.text = text;
  }
  
  // Executes the command
  public execute(): void {
    // Creating the memento
    this.memento = this.text.text;
    // Applying the changes (in many 
    // cases do and redo are similar, but the memento creation)
    this.redo();
  }

  public undo(): void {
    this.text.text = this.memento;
  }

  public redo(): void {
    this.text.text = '';
  }
}
