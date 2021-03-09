import { on, emit } from "../messenger";
import { omit } from "../common/helpers";
import { useSolver, getSolverKeys } from "../store";
import RayTracer, { RayTracerSaveObject } from "./raytracer";
import RT60, { RT60SaveObject } from "./rt";
import Solver from "./solver";

declare global {
  interface EventTypes {
    RESTORE_SOLVERS: (RayTracerSaveObject | RT60SaveObject)[];
    REMOVE_SOLVERS: string|string[];
  }
}



on("REMOVE_SOLVERS", (uuids) => {
  const currentSolvers = useSolver.getState().solvers;
  const containers = omit(typeof uuids === "string" ? [uuids] : uuids, currentSolvers);
  useSolver.getState().set((state) => {
    state.solvers = containers;
  });
});

const restore = <SolverType extends Solver>(
  constructor: new (args: any) => SolverType,
  saveObject: any
) => {
  return new constructor(saveObject);
}

on("RESTORE_SOLVERS", solvers => {
  emit("REMOVE_SOLVERS", getSolverKeys());


  solvers.forEach((solver) => {
    switch (solver.kind) {
      case "ray-tracer":
          emit("ADD_RAYTRACER", restore(RayTracer, solver));
        break;
      case "rt60":
        emit("ADD_RT60", restore(RT60, solver));
        break;
    }
  });

})