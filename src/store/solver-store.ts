
import create from "zustand";
import produce from "immer";
import { KeyValuePair } from "../common/key-value-pair";
import Solver from "../compute/solver";
import { omit } from "../common/helpers";



/* Solver */
export type SolverStore = {
  solvers: KeyValuePair<Solver>;
  set: SetFunction<SolverStore>;
  keys: () => string[];
  withProperties: (propertiesGetter: (solver: Solver) => Partial<Solver>) => Map<string, Partial<Solver>>
  withProperty: <T>(propertyGetter: (solver: Solver) => T) => Map<string, T>
};

// solver hook
export const useSolver = create<SolverStore>((set, get) => ({
  solvers: {},
  keys: () => Object.keys(get().solvers),
  withProperties: (propertiesGetter: (solver: Solver) => Partial<Solver> ) => {
    const solvers = get().solvers;
    const solverMap = new Map<string, Partial<Solver>>();
    Object.keys(solvers).forEach(key=>{
      solverMap.set(key, propertiesGetter(solvers[key]))
    });
    return solverMap;
  },
  withProperty:  <T>(propertyGetter: (solver: Solver) => T) => {
    const solvers = get().solvers;
    const solverMap = new Map<string, T>();
    Object.keys(solvers).forEach(key=>{
      solverMap.set(key, propertyGetter(solvers[key]))
    });
    return solverMap;
  },
  set: (fn) => set(produce(fn))
}));




export const addSolver = <T extends Solver>(SolverClass: new() => T) => (solver: T|undefined) => {
  const s = solver || new SolverClass() as T;
  useSolver.getState().set(draft=>{
    draft.solvers[s!.uuid] = s;
  });
};


export const removeSolver = (uuid: keyof SolverStore['solvers']) => {
  useSolver.getState().set(draft=>{
    draft.solvers = omit([uuid], draft.solvers);
  });
}


export const setSolverProperty = ({uuid, property, value}) => {
  useSolver.getState().set(store => {
    store.solvers[uuid][property]=value;
  });
}

export const callSolverMethod = ({uuid, method, args, isAsync }) => {
  try{
    const handle = useSolver.getState().solvers[uuid][method];
    if(isAsync) {
      
      handle(args).catch(console.error);
    }
    else{
      handle(args);
    }
  }
  catch(err){
    console.error(err);
  }
}

export const getSolverKeys = () => Object.keys(useSolver.getState().solvers);