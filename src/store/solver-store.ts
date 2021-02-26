
import create from "zustand";
import produce from "immer";
import { KeyValuePair } from "../common/key-value-pair";
import { SetFunction } from ".";
import Solver from "../compute/solver";
import { omit } from "../common/helpers";



/* Solver */
export type SolverStore = {
  solvers: KeyValuePair<Solver>;
  set: SetFunction<SolverStore>;
};

// solver hook
export const useSolver = create<SolverStore>((set) => ({
  solvers: {},
  set: (fn) => set(produce(fn))
}));


export const addSolver = <T extends Solver>(SolverClass: new() => T) => (solver: T|undefined) => {
const s = solver || new SolverClass() as T;
  useSolver.setState((state) => ({ 
    ...state, 
    solvers: {
      ...state.solvers, 
      [s!.uuid]: s
    } 
  }), true);
};


export const removeSolver = (uuid: keyof SolverStore['solvers']) => {
  useSolver.setState(state => ({
    ...state, 
    solvers: omit([uuid], state.solvers)
  }), true);
}


export const setSolverProperty = ({uuid, property, value}) => {
  useSolver.getState().set(store => {
    store.solvers[uuid][property]=value;
  });
}

