import FileSaver from 'file-saver';
import { useContainer, useSolver, useAppStore } from '.';
import { KeyValuePair } from '../common/key-value-pair';
import Solver from '../compute/solver';
import Container from '../objects/container';

import {on, emit} from '../messenger';

export type SaveState = {
  meta: {
      version: `${number}.${number}.${number}`;
      name: string;
      timestamp: string;
  };
  containers: KeyValuePair<Container>;
  solvers: KeyValuePair<Solver>;
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


messenger.addMessageHandler("SAVE_CONTAINERS", () => {
  const keys = Object.keys(cram.state.containers);
  const saveObjects = keys.map((key) => cram.state.containers[key].save());
  return saveObjects;
});

messenger.addMessageHandler("SAVE_SOLVERS", () => {
  const keys = Object.keys(cram.state.solvers);
  const saveObjects = keys.map((key) => cram.state.solvers[key].save());
  return saveObjects;
});

messenger.addMessageHandler("SET_PROJECT_NAME", (acc, ...args) => {
  cram.state.projectName = (args && args[0]) || cram.state.projectName;
  document.title = cram.state.projectName + " | cram.ui";
});

messenger.addMessageHandler("GET_PROJECT_NAME", () => {
  return cram.state.projectName;
});

messenger.addMessageHandler("RESTORE_CONTAINERS", (acc, ...args) => {
  const keys = Object.keys(cram.state.containers);
  keys.forEach((key) => {
    messenger.postMessage("SHOULD_REMOVE_CONTAINER", key);
  });
  if (args && args[0] && args[0] instanceof Array) {
    // console.log(args[0]);
    console.log(args[0]);
    args[0].forEach((saveObj) => {
      switch (saveObj["kind"]) {
        case "source":
          {
            const src = new Source("new source", { ...saveObj }).restore(saveObj);
            messenger.postMessage("SHOULD_ADD_SOURCE", src, false);
            // cram.state.containers[src.uuid] = src;
            // cram.state.sources.push(src.uuid);
            // cram.state.renderer.add(src);
          }
          break;
        case "receiver":
          {
            const rec = new Receiver("new receiver", { ...saveObj }).restore(saveObj);
            messenger.postMessage("SHOULD_ADD_RECEIVER", rec, false);
            // cram.state.containers[rec.uuid] = rec;
            // cram.state.sources.push(rec.uuid);
            // cram.state.renderer.add(rec);
          }
          break;
        case "room":
          {
            const surfaces = saveObj.surfaces.map((surfaceState: SurfaceSaveObject) => {
              const geometry = new THREE.BufferGeometry();
              if (!(surfaceState.geometry instanceof THREE.BufferGeometry)) {
                const geom = surfaceState.geometry as BufferGeometrySaveObject;
                geometry.setAttribute(
                  "position",
                  new THREE.BufferAttribute(
                    new Float32Array(geom.data.attributes.position.array),
                    geom.data.attributes.position.itemSize,
                    geom.data.attributes.position.normalized
                  )
                );
                geometry.setAttribute(
                  "normals",
                  new THREE.BufferAttribute(
                    new Float32Array(geom.data.attributes.normals.array),
                    geom.data.attributes.normals.itemSize,
                    geom.data.attributes.normals.normalized
                  )
                );
                geometry.setAttribute(
                  "texCoords",
                  new THREE.BufferAttribute(
                    new Float32Array(geom.data.attributes.texCoords.array),
                    geom.data.attributes.texCoords.itemSize,
                    geom.data.attributes.texCoords.normalized
                  )
                );
              }
              geometry.name = surfaceState.geometry.name;
              geometry.uuid = surfaceState.geometry.uuid;
              const surf = new Surface(surfaceState.name, {
                acousticMaterial: surfaceState.acousticMaterial,
                geometry
              });
              surf.visible = surfaceState.visible;
              surf.wireframeVisible = surfaceState.wireframeVisible;
              surf.displayVertexNormals = surfaceState.displayVertexNormals;
              surf.edgesVisible = surfaceState.edgesVisible;
              surf.uuid = surfaceState.uuid;
              surf.position.set(surfaceState.position[0], surfaceState.position[1], surfaceState.position[2]);
              surf.rotation.set(surfaceState.rotation[0], surfaceState.rotation[1], surfaceState.rotation[2], "XYZ");
              surf.scale.set(surfaceState.scale[0], surfaceState.scale[1], surfaceState.scale[2]);
              return surf;
            });
            // console.log(surfaces);
            // console.log(saveObj.surfaces);
            const room = new Room(saveObj.name || "room", {
              surfaces
            });
            cram.state.containers[room.uuid] = room;
            cram.state.renderer.addRoom(room);

            messenger.postMessage("ADDED_ROOM", room);
          }
          break;
        default:
          break;
      }
    });
  }
});



on("RESTORE", (acc, ...args) => {
  const props = args && args[0];
  const file = props.file;
  const json = props.json;
  const version = (json.meta && json.meta.version) || "0.0.0";
  console.log(version);
  if (gte(version, "0.2.1")) {
    messenger.postMessage("RESTORE_CONTAINERS", json.containers);
    messenger.postMessage("RESTORE_SOLVERS", json.solvers);
    messenger.postMessage("SET_PROJECT_NAME", json.meta.name);
  } else {
    messenger.postMessage("RESTORE_CONTAINERS", json);
    messenger.postMessage("SET_PROJECT_NAME", file.name.replace(".json", ""));
  }
});




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

