import {uuid} from 'uuidv4';
import { EditorModes } from '../constants/editor-modes';




export interface SolverParams{
    [key: string]: any;
    name?: string;
}

export default abstract class Solver{
    params: SolverParams
    name: string;
    uuid: string;
    kind: string;
    running: boolean;
    update!: () => void;
    clearpass: boolean;
    constructor(params?: SolverParams) {
        this.params = params || {};
        this.name = (params && params.name) || "untitled solver";
        this.kind = "solver";
        this.uuid = uuid();
        this.running = false;
        this.clearpass = false;
        this.update = () => { };
    }
    dispose() {
        console.log("disposed from abstract...")
    }
    onModeChange(mode: EditorModes) {
        
    }
}

