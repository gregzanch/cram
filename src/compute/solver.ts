import { uuid } from "uuidv4";
import { omit } from "../common/helpers";
import { EditorModes } from "../constants/editor-modes";
import { emit, on } from "../messenger";
import { getSolverKeys, useSolver } from "../store";
import { SaveState } from "../store/io";
import RayTracer, { RayTracerParams, RayTracerSaveObject } from "./raytracer";
import RT60, { RT60SaveObject } from "./rt";


export interface SolverParams {
  [key: string]: any;
  name?: string;
}

export default abstract class Solver {
  params: SolverParams;
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
    this.update = () => {};
  }
  save() {
    const { name, kind, uuid } = this;
    return {
      name,
      kind,
      uuid
    };
  }
  restore(state) {
    this.name = state.name;
    this.uuid = state.uuid;
    return this;
  }
  dispose() {
    console.log("disposed from abstract...");
  }
  onModeChange(mode: EditorModes) {}
  onParameterConfigFocus() {}
  onParameterConfigBlur() {}
}


// on("RESTORE_SOLVERS", (solvers: SaveState["solvers"]) => {
//   const { solvers: current_solvers } = useSolver.getState()
//   const keys = Object.keys(current_solvers);
//   keys.forEach((key) => {
//     emit("REMOVE")
//   });
//   if (args && args[0] && args[0] instanceof Array) {
//     // console.log(args[0]);
//     console.log(args[0]);
//     args[0].forEach((saveObj) => {

//         default:
//           break;
//       }
//     });
//   }
// });


