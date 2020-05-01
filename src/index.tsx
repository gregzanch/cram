import React from "react";
import ReactDOM, { render } from "react-dom";

import App from "./containers/App";
import browserReport from "./common/browser-report";
import Messenger from "./messenger";
import Source from "./objects/source";
import Receiver from "./objects/receiver";
import Renderer from "./render/renderer";
import { registerHotKeys } from "./hotkeys";
import { fileType, allowed } from "./common/file-type";

import * as importHandlers from './import-handlers';
import EasingFunctions from "./common/easing";
import * as THREE from "three";
import { KeyValuePair } from "./common/key-value-pair";
import expose from "./common/expose";
import Container from "./objects/container";
import { Setting } from "./common/setting";
import {randomInteger} from './common/random';

import { chunk } from "./common/chunk";
//@ts-ignore
import triangleroom from "!raw-loader!./res/triangle.stl";
//@ts-ignore
import testroom from "!raw-loader!./res/models/testthing.obj";

import Solver from "./compute/solver";
import { FDTD } from "./compute/fdtd";
import GLFDTD from "./compute/gl-fdtd";
import Room from "./objects/room";
import Surface from "./objects/surface";
import RayTracer from "./compute/raytracer";
import { uuid } from "uuidv4";
// import { RT60 } from './compute/rt60';
import RT60 from './compute/rt';
import * as ac from "./compute/acoustics";

import materials from "./db/material.json";
import {Searcher} from "fast-fuzzy";
import { IToastProps } from "@blueprintjs/core";



// import Fuse from "fuse.js";
export interface AcousticMaterial {
  tags: string[];
  manufacturer: string;
  name: string;
  material: string;
  absorption: {
    "63": number;
    "125": number;
    "250": number;
    "500": number;
    "1000": number;
    "2000": number;
    "4000": number;
    "8000": number;
  };
  nrc: number;
  source: string;
  description: string;
  _id: string;
}


expose({ ac, chunk, THREE, EasingFunctions }, window);

const materialsIndex = {} as KeyValuePair<AcousticMaterial>;

materials.forEach(x => {
    materialsIndex[x._id] = x;
});

const state = {
  selectedObjects: [] as Container[],
  materialsIndex,
  materials,
  materialSearcher: new Searcher(
  materials,
    {
      keySelector: obj => obj.material
    }
  ),
  browser: browserReport(navigator.userAgent),
  sources: [] as string[],
  receivers: [] as string[],
  room: "" as string,
  containers: {} as KeyValuePair<Container>,
  solvers: {} as KeyValuePair<Solver>,
  simulation: "",
  glfdtd: {} as GLFDTD,
  renderer: {} as Renderer,
  messenger: new Messenger(),

  settings: {
    fog_color: new Setting<string>({
      id: "fog_color",
      name: "Fog Color",
      description: "Changes the color of the scene's fog",
      kind: "color",
      value: "#ffffff"
    }),
    default_save_name: new Setting<string>({
      id: "default_save_name",
      name: "Default Save Name",
      description: "The default name when saving",
      kind: "text",
      value: "new-project.json"
    })
  } as KeyValuePair<Setting<string|number|boolean>>
};

state.renderer = new Renderer({
  messenger: state.messenger
});

state.messenger.addMessageHandler("SET_SELECTION", (acc, objects) => {
  state.messenger.postMessage("DESELECT_ALL_OBJECTS");
  state.messenger.postMessage("APPEND_SELECTION", objects);
});

state.messenger.addMessageHandler("DESELECT_ALL_OBJECTS", (acc, ...args) => {
  Object.keys(state.containers).forEach((x) => {
    state.containers[x].deselect();
  });
  state.selectedObjects = [] as Container[];
});

state.messenger.addMessageHandler("APPEND_SELECTION", (acc, objects) => {
  if (objects instanceof Array) {
    for (let i = 0; i < objects.length; i++){
      if (objects[i] instanceof Container) {
        objects[i].select();
        state.selectedObjects.push(objects[i]);
      }
    }
  }
})

state.messenger.addMessageHandler("FETCH_ROOMS", () => {
  const roomkeys = Object.keys(state.containers).filter(x => {
    return state.containers[x].kind === "room";
  });
  if (roomkeys && roomkeys.length > 0) {
    return roomkeys.map(x => state.containers[x] as Room);
  }
});

state.messenger.addMessageHandler("FETCH_SETTINGS", () => {
  return state.settings;
})

state.messenger.addMessageHandler("SUBMIT_ALL_SETTINGS", () => {
  for (const key in state.settings) {
    state.settings[key].submit();
  }
  return state.settings;
});

state.messenger.addMessageHandler("FETCH_ALL_MATERIALS", (acc, ...args) => {
  return state.materials;
});

state.messenger.addMessageHandler("SEARCH_ALL_MATERIALS", (acc, ...args) => {
  const res = state.materialSearcher.search(args[0]);
  return res;
});



state.messenger.addMessageHandler("SHOULD_ADD_RAYTRACER", (acc, ...args) => {
  const raytracer = new RayTracer({
    messenger: state.messenger,
    name: "ray-tracer",
    containers: state.containers,
    reflectionOrder: 500,
    updateInterval: 5,
    renderer: state.renderer
  });
  state.solvers[raytracer.uuid] = raytracer;
  raytracer.runWithoutReceiver = false;
  return raytracer;
});

state.messenger.addMessageHandler("SHOULD_REMOVE_SOLVER", (acc, id) => {
 if (state.solvers && state.solvers[id]) {
   delete state.solvers[id];
 }
});

state.messenger.addMessageHandler("SHOULD_ADD_RT60", (acc, ...args) => {
  const rooms = Object.keys(state.containers).filter(x => state.containers[x] instanceof Room);
  if (rooms.length>0) {
    const rt60 = new RT60({
      room: state.containers[rooms[0]] as Room,
      name: 'rt60'
    });
    state.solvers[rt60.uuid] = rt60;
    return rt60;
  }
});

state.messenger.addMessageHandler("SHOULD_ADD_FDTD", (acc, ...args) => {
  const sources = [] as Source[];
  const rooms = [] as Room[];
  const receivers = [] as Receiver[];
  for (const key in state.containers) {
    switch (state.containers[key].kind) {
      case "source":
        sources.push(state.containers[key] as Source);
        break;
      case "receiver":
        receivers.push(state.containers[key] as Receiver);
        break;
      case "room":
        rooms.push(state.containers[key] as Room);
        break;
      default:
        break;
    }
  }

  state.simulation = uuid();
  state.solvers[state.simulation] = new FDTD({
    room: rooms[0],
    dt: 0.0005,
    dx: 2,
    gain: 1,
    threshold: 0.0001,
    q: 0.43,
    r: 1.33,
    sources,
    receivers
  });
  state.solvers[state.simulation].uuid = state.simulation;

  return state.solvers[state.simulation];
});

state.messenger.addMessageHandler("RAYTRACER_CALCULATE_RESPONSE", (acc, id, frequencies) => {
  (state.solvers[id] instanceof RayTracer) && (state.solvers[id] as RayTracer).calculateReflectionLoss(frequencies);
});

state.messenger.addMessageHandler("RAYTRACER_TEST_WASM", (acc, id, value) => {
  (state.solvers[id] instanceof RayTracer) && (state.solvers[id] as RayTracer).testWasm(value);
});

state.messenger.addMessageHandler("FETCH_ALL_SOURCES", (acc, ...args) => {
  return state.sources.map(x => {
    if (args && args[0] && args[0] instanceof Array) {
      return args[0].map(y => state.containers[x][y]);
    } else return state.containers[x];
  });
});

state.messenger.addMessageHandler("FETCH_ALL_RECEIVERS", (acc, ...args) => {
  return state.receivers.map(x => {
    if (args && args[0] && args[0] instanceof Array) {
      return args[0].map(y => state.containers[x][y]);
    } else return state.containers[x];
  });
});

state.messenger.addMessageHandler("FETCH_SOURCE", (acc, ...args) => {
  return state.containers[args[0]];
});

state.messenger.addMessageHandler("SHOULD_ADD_SOURCE", (acc, ...args) => {
  const source = new Source("new source");
  state.containers[source.uuid] = source;
  state.sources.push(source.uuid);
  state.renderer.add(source);
  Object.keys(state.solvers).forEach(x => {
    state.solvers[x] instanceof RayTracer &&
      (state.solvers[x] as RayTracer).addSource(source);
  });
  return source;
});

state.messenger.addMessageHandler("SHOULD_REMOVE_CONTAINER", (acc, id) => {
  if (state.containers[id]) {
    switch (state.containers[id].kind) {
      case "source": {
        state.sources = state.sources.reduce((a, b) => {
          if (b !== id) {
            a.push(b);
          }
          return a;
        }, [] as string[]);
      } break;
      case "receiver": {
        state.receivers = state.receivers.reduce((a, b) => {
          if (b !== id) {
            a.push(b);
          }
          return a;
        }, [] as string[]);
      } break;
      
    }
    state.renderer.remove(state.containers[id]);
    delete state.containers[id];
  }
});

state.messenger.addMessageHandler("SHOULD_ADD_RECEIVER", (acc, ...args) => {
  const rec = new Receiver("new receiver");
  state.containers[rec.uuid] = rec;
  state.receivers.push(rec.uuid);
  state.renderer.add(rec);
  Object.keys(state.solvers).forEach(x => {
    state.solvers[x] instanceof RayTracer &&
      (state.solvers[x] as RayTracer).addReceiver(rec);
  });
  return rec;
});

state.messenger.addMessageHandler("ADDED_ROOM", (acc, ...args) => {
  args[0];
});

state.messenger.addMessageHandler("IMPORT_FILE", (acc, ...args) => {
  const files = Array.from(args[0]);
  files.forEach(async (file: File) => {
    if (allowed[fileType(file.name)]) {
      const objectURL = URL.createObjectURL(file);
      const result = await (await fetch(objectURL)).text();
      const models = importHandlers.obj(result);
      const surfaces = models.map(
        model => new Surface(model.name, {
          geometry: model.geometry,
          acousticMaterial: state.materials[0]
        })
      );
      const room = new Room("new room", {
        surfaces
      });
      state.containers[room.uuid] = room;
      state.room = room.uuid;
      state.renderer.addRoom(room);
      state.messenger.postMessage("ADDED_ROOM", room);
    }
  });
});

state.messenger.addMessageHandler("APP_MOUNTED", (acc, ...args) => {
  state.renderer.init(args[0]);
});

state.messenger.addMessageHandler("RENDERER_UPDATED", (acc, ...args) => {
  if (state.simulation.length > 0) {
    state.solvers[state.simulation].update();
  }
});

state.messenger.addMessageHandler("SIMULATION_SHOULD_PLAY", (acc, ...args) => {
  state.solvers[state.simulation].running = true;
  state.messenger.postMessage("SIMULATION_DID_PLAY");
});

state.messenger.addMessageHandler("SIMULATION_SHOULD_PAUSE", (acc, ...args) => {
  state.solvers[state.simulation].running = false;
  state.messenger.postMessage("SIMULATION_DID_PAUSE");
});

state.messenger.addMessageHandler("SIMULATION_SHOULD_CLEAR", (acc, ...args) => {
  (state.solvers[state.simulation] as FDTD).reset();
});

state.messenger.addMessageHandler("RAYTRACER_SHOULD_PLAY", (acc, ...args) => {
  if (state.solvers[args[0]] instanceof RayTracer) {
    (state.solvers[args[0]] as RayTracer).isRunning = true;
  }
  return state.solvers[args[0]] && state.solvers[args[0]].running;
});

state.messenger.addMessageHandler("RAYTRACER_SHOULD_PAUSE", (acc, ...args) => {
  if (state.solvers[args[0]] instanceof RayTracer) {
    (state.solvers[args[0]] as RayTracer).isRunning = false;
  }
  return state.solvers[args[0]].running;
});

state.messenger.addMessageHandler("RAYTRACER_SHOULD_CLEAR", (acc, ...args) => {
  if (state.solvers[args[0]] instanceof RayTracer) {
    (state.solvers[args[0]] as RayTracer).clearRays();
  }
});

state.messenger.addMessageHandler("FETCH_SURFACE", (acc, ...args) => {
  const id = args[0];
  if (id) {
    const rooms = state.messenger.postMessage("FETCH_ROOMS")[0];
    if (rooms && rooms.length > 0) {
      for (let i = 0; i < rooms.length; i++){
        const room = (rooms[i] as Room);
        const surface = room.surfaces.getObjectByProperty("uuid", id);
        if (surface && surface instanceof Surface) {
          return surface;
        }
      }
    }
  }
})

state.messenger.addMessageHandler("ASSIGN_MATERIAL", (acc, material) => {
  let surfaceCount = 0;
  for (let i = 0; i < state.selectedObjects.length; i++){
    if (state.selectedObjects[i] instanceof Surface) {
      (state.selectedObjects[i] as Surface).acousticMaterial = material;
      surfaceCount++;
    }
  }
  if (surfaceCount > 0) {
    state.messenger.postMessage("SHOW_TOAST", {
      message: `Assigned material to ${surfaceCount} surface${surfaceCount > 1 ? "s" : ""}.`,
      intent: "success",
      timeout: 1750,
      icon: "tick"
    } as IToastProps);
  }
  else {
     state.messenger.postMessage("SHOW_TOAST", {
       message: `No surfaces are selected.`,
       intent: "warning",
       timeout: 1750,
       icon: "issue"
     } as IToastProps);
  }
});

// for the settings drawer
state.messenger.addMessageHandler("SETTING_CHANGE", (acc, ...args) => {
  const { setting, value } = args[0];
  console.log(setting, value);
  state.renderer.settingChanged(setting, value);
});

// new project
state.messenger.addMessageHandler("NEW", (acc, ...args) => {
  const keys = Object.keys(state.containers);
  keys.forEach(x => {
    state.messenger.postMessage('SHOULD_REMOVE_CONTAINER', x);
  });
  console.log(state.containers);
});


registerHotKeys(state.messenger);

// the main app
ReactDOM.render(<App {...state} />, document.getElementById("root"));

// This is to simulate user uploading a mesh file and adding source + receiver
setTimeout(() => {

  const { uuid: sourceidL } = state.messenger.postMessage(
    "SHOULD_ADD_SOURCE"
  )[0];

  const { uuid: sourceidR } = state.messenger.postMessage(
    "SHOULD_ADD_SOURCE"
  )[0];


  const { uuid: receiverId } = state.messenger.postMessage(
    "SHOULD_ADD_RECEIVER"
  )[0];
  const models = importHandlers.obj(testroom);

  const surfaces = models.map(
    model =>
      new Surface(model.name, {
        geometry: model.geometry,
        acousticMaterial: state.materials[147]
      })
  );
  const room = new Room("room", {
    surfaces
  });
  state.containers[room.uuid] = room;
  state.renderer.addRoom(room);

  state.messenger.postMessage("ADDED_ROOM", room);

  (state.containers[sourceidL] as Source).position.set(10, 14, 2.5);
  (state.containers[sourceidL] as Source).scale.set(3, 3, 3);
  (state.containers[sourceidL] as Source).name = "L";

  (state.containers[sourceidR] as Source).position.set(11, 0, 3);
  (state.containers[sourceidR] as Source).scale.set(3, 3, 3);
  (state.containers[sourceidR] as Source).name = "R";

  (state.containers[receiverId] as Receiver).position.set(22, 8,  3);
  (state.containers[receiverId] as Receiver).scale.set(8, 8, 8);


  expose(
    {
      // fdtd: state.messenger.postMessage("SHOULD_ADD_FDTD")[0],
      raytracer: state.messenger.postMessage("SHOULD_ADD_RAYTRACER")[0],
      state,
      THREE
    },
    window
  );
}, 200);
