import FileSaver from 'file-saver';
import { useContainer, useSolver, useAppStore } from '.';
import { KeyValuePair } from '../common/key-value-pair';
import Solver from '../compute/solver';


import { on, emit } from '../messenger';
import { gte } from 'semver';
import { SourceSaveObject } from '../objects/source';
import { ReceiverSaveObject } from '../objects/receiver';
import { RoomSaveObject } from '../objects/room';
import { SurfaceGroupSaveObject } from '../objects/surface-group';
import { RayTracerSaveObject } from '../compute/raytracer';
import { RT60SaveObject } from '../compute/rt';
import { ImageSourceSaveObject } from '../compute/raytracer/image-source';
import { getSolverKeys } from './solver-store';

export type ContainerSaveObject = (SourceSaveObject | ReceiverSaveObject | RoomSaveObject);
export type SolverSaveObject = (RayTracerSaveObject | RT60SaveObject | ImageSourceSaveObject);

export type SaveState = {
  meta: {
    version: `${number}.${number}.${number}`;
    name: string;
    timestamp: string;
  };
  containers: ContainerSaveObject[];
  solvers: SolverSaveObject[];
};

const getSaveState = () => {
  const solvers = useSolver.getState().solvers;
  const containers = useContainer.getState().containers;
  const { projectName, version } = useAppStore.getState();
  const savedContainers = [] as SaveState["containers"];
  const savedSolvers = [] as SaveState["solvers"];

  Object.keys(containers).forEach(uuid => {
    savedContainers.push(containers[uuid].save() as ContainerSaveObject);
  });

  Object.keys(solvers).forEach(uuid => {
    savedSolvers.push(solvers[uuid].save() as SolverSaveObject);
  });

  return {
    meta: {
      version,
      name: projectName,
      timestamp: new Date().toISOString()
    },
    containers: savedContainers,
    solvers: savedSolvers
  };
}


declare global {
  interface EventTypes {
    SAVE: () => void | undefined;
    OPEN: () => void | undefined;
    NEW: (success?: boolean) => void | undefined;

    RESTORE: {
      file?: File;
      json: SaveState;
    };
  }
}


on("SAVE", (callback) => {
  const state = getSaveState();
  const options = { type: "application/json" };
  const blob = new Blob([JSON.stringify(state)], options);

  const projectName = state.meta.name;
  FileSaver.saveAs(blob, `${projectName}.json`);
  if (callback) callback();
});

const createFileInput = () => {
  let tempinput = document.createElement("input");
  tempinput.type = "file";
  tempinput.accept = "application/json";
  tempinput.setAttribute("style", "display: none");
  return tempinput
}

const open = (callback: (files: FileList | undefined) => Promise<any>) => {
  const tempinput = createFileInput();
  document.body.appendChild(tempinput);
  tempinput.addEventListener("change", async (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files) {
      tempinput.remove();
      callback(undefined);
      return;
    }
    callback(files);
  });
  tempinput.click();
}


on("OPEN", async (callback) => {
  open(async (files: FileList | undefined) => {
    if (!files) return;
    const objectURL = URL.createObjectURL(files![0]);
    try {
      const result = await (await fetch(objectURL)).text();
      const json = JSON.parse(result);
      emit("RESTORE", { file: files[0], json });
    } catch (e) {
      console.warn(e);
    }
    emit("RENDERER_SHOULD_ANIMATE",true);
    if (callback) callback();
  })
})


on("NEW", (callback) => {
  const confirmed = confirm("Create a new project? Unsaved data will be lost.");
  if(confirmed){
    const version = useAppStore.getState().version;
    const newSaveState = { 
      json: { 
        containers: [], 
        solvers: [], 
        meta: { 
          name: "untitled", 
          version, 
          timestamp: new Date().toJSON() 
        }
      } 
    };
    emit("RESTORE", newSaveState);
  }
  if(callback) callback(confirmed);
});



on("RESTORE", ({ file, json }) => {
  emit("DESELECT_ALL_OBJECTS");
  emit("RESTORE_CONTAINERS", json.containers);
  emit("RESTORE_SOLVERS", json.solvers);
  useAppStore.getState().set((state) => { state.projectName = json.meta.name });
});





