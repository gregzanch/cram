export interface SolverParams{
    [key: string]: any;
}

export class Solver{
    params: SolverParams
    constructor(params?: SolverParams) {
        this.params = params || {};
    }
}