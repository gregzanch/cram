import { uuid } from "uuidv4";
import { EditorModes } from "../constants/editor-modes";
import { emit, on } from "../messenger";
import { useSolver } from "../store";
import { SaveState } from "../store/io";

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
  dispose() {
    console.log("disposed from abstract...");
  }
  onModeChange(mode: EditorModes) {}
  onParameterConfigFocus() {}
  onParameterConfigBlur() {}
}

declare global {
  interface EventTypes {
    RESTORE_SOLVERS: SaveState["solvers"]
  }
}


on("RESTORE_SOLVERS", (solvers: SaveState["solvers"]) => {
  const { solvers: current_solvers } = useSolver.getState()
  const keys = Object.keys(current_solvers);
  keys.forEach((key) => {
    emit("REMOVE")
  });
  if (args && args[0] && args[0] instanceof Array) {
    // console.log(args[0]);
    console.log(args[0]);
    args[0].forEach((saveObj) => {
      switch (saveObj["kind"]) {
        case "ray-tracer":
          {
            const props = args && args[0];
            messenger.postMessage("SHOULD_ADD_RAYTRACER", props);
          }
          break;
        case "rt60":
          {
            const props = args && args[0];
            messenger.postMessage("SHOULD_ADD_RT60", props);
          }
          break;
        default:
          break;
      }
    });
  }
});


