import {uuid} from 'uuidv4';




export interface SolverParams{
    [key: string]: any;
    name?: string;
}

export default class Solver{
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
}