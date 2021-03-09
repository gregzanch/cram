import FileSaver from 'file-saver';
import { useContainer, useSolver, useAppStore } from '.';
import { KeyValuePair } from '../common/key-value-pair';
import Solver from '../compute/solver';
import Container, { ContainerSaveObject } from '../objects/container';

import {on, emit} from '../messenger';
import { gte } from 'semver';
import { SourceSaveObject } from '../objects/source';
import { ReceiverSaveObject } from '../objects/receiver';
import { RoomSaveObject } from '../objects/room';
import { SurfaceGroupSaveObject } from '../objects/surface-group';
import { RayTracerSaveObject } from '../compute/raytracer';
import { RT60SaveObject } from '../compute/rt';


export type SaveState = {
  meta: {
      version: `${number}.${number}.${number}`;
      name: string;
      timestamp: string;
  };
  containers: (SourceSaveObject|ReceiverSaveObject|RoomSaveObject)[];
  solvers: (RayTracerSaveObject|RT60SaveObject)[];
};

const getSaveState = () => {
  const solvers = useSolver.getState().solvers;
  const containers = useContainer.getState().containers;
  const { projectName, version } = useAppStore.getState();

  return {
    meta: {
      version,
      name: projectName,
      timestamp: new Date().toISOString()
    },
    containers,
    solvers
  };
}

on("SAVE", (callback) => {
  const state = getSaveState();
  const options = { type: "text/plain;charset=utf-8" };
  const blob = new Blob([JSON.stringify(state)], options);
  
  const projectName = state.meta.name;
  FileSaver.saveAs(blob, `${projectName}.json`);
  callback && callback();
});

const createFileInput = () => {
  let tempinput = document.createElement("input");
  tempinput.type = "file";
  tempinput.accept = "application/json";
  tempinput.setAttribute("style", "display: none");
  return tempinput
}

const open = (callback: (files: FileList|undefined) => Promise<any>) => {
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
  open(async (files: FileList|undefined)=>{
    if(!files) return;
    const objectURL = URL.createObjectURL(files![0]);
    try {
      const result = await (await fetch(objectURL)).text();
      const json = JSON.parse(result);
      emit("RESTORE", { file: files[0], json });
    } catch (e) {
      console.warn(e);
    }
    callback()
  })
  
})

declare global {
  interface EventTypes {
    SAVE: () => void | undefined;
    OPEN: () => void | undefined;
    
 
    RESTORE: {
      file: File;
      json: SaveState;
    };
  }
}


on("RESTORE", ({ file, json }) => {
  useAppStore.getState().set((state) => void (state.projectName = json.meta.name));
  emit("RESTORE_CONTAINERS", json.containers);
  emit("RESTORE_SOLVERS", json.solvers);
});





