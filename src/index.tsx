import React from "react";
import ReactDOM from "react-dom";

import App from "./containers/App";
import browserReport from "./common/browser-report";
import Messenger from "./messenger";
import Source from "./objects/source";
import Receiver from "./objects/receiver";
import Renderer from "./render/renderer";

import { fileType, allowed } from "./common/file-type";

import * as importHandlers from './import-handlers';
import EasingFunctions from "./common/easing";
import * as THREE from "three";
import { KeyValuePair } from "./common/key-value-pair";
import expose from "./common/expose";
import Container from "./objects/container";
import { Setting } from "./setting";


import { chunk } from "./common/chunk";

//@ts-ignore
import basement from "!raw-loader!./res/models/basement_even_ceiling.obj";

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
import { Searcher } from "fast-fuzzy";
import { IToastProps } from "@blueprintjs/core";

import { CSG, CAG } from '@jscad/csg';
import cubicBezier from "./common/cubic-bezier";

import Timer from './common/timer';

import { History, Moment, Directions } from './history';
import { FDTD_2D } from "./compute/2d-fdtd";

import { defaultSettings, ApplicationSettings, SettingsCategories } from './default-settings';
import { SettingsManager, StoredSetting } from "./settings-manager";
import hotkeys from "hotkeys-js";

import fullscreen from "./common/fullscreen";

import { QuatAngle } from './common/QuatAngle';
import { rad2deg, deg2rad } from './common/convert-rad-deg';

//@ts-ignore
// window.CSG = CSG;
//@ts-ignore
// window.CAG = CAG;

expose({ CSG, CAG, cubicBezier, Timer, ac, chunk, THREE, EasingFunctions, QuatAngle, rad2deg, deg2rad });

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




const materialsIndex = {} as KeyValuePair<AcousticMaterial>;

materials.forEach(x => {
    materialsIndex[x._id] = x;
});



const state = {
  time: 0,
  selectedObjects: [] as Container[],
  materialsIndex,
  materials,
  materialSearcher: new Searcher(materials, {
    keySelector: (obj) => obj.material
  }),
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
  history: new History(),
  settings: defaultSettings as ApplicationSettings,
  settingsManagers: {} as KeyValuePair<SettingsManager>
};

Object.keys(defaultSettings).map(async (category) => {
  state.settingsManagers[category] = new SettingsManager(
    state.messenger,
    category,
    defaultSettings[category],
    async (manager, event) => {
      const settings = (await state.settingsManagers[category].read()) as StoredSetting[];
      settings.forEach(setting => {
        state.settings[category][setting.id].value = setting.value;
        state.settings[category][setting.id].default_value = setting.default_value;
        state.settings[category][setting.id].setStagedValue(setting.value);
      });
    },
    (event) => console.log(event)
  );


});

state.renderer = new Renderer({
  messenger: state.messenger,
  history: state.history
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
  hotkeys.setScope("editor")
  if (objects instanceof Array) {
    for (let i = 0; i < objects.length; i++){
      if (objects[i] instanceof Container) {
        objects[i].select();
        state.selectedObjects.push(objects[i]);
      }
    }
  }
})

state.messenger.addMessageHandler("GET_SELECTED_OBJECTS", (acc, ...args) => {
  return state.selectedObjects;
})

state.messenger.addMessageHandler("FETCH_ROOMS", () => {
  const roomkeys = Object.keys(state.containers).filter(x => {
    return state.containers[x].kind === "room";
  });
  if (roomkeys && roomkeys.length > 0) {
    return roomkeys.map(x => state.containers[x] as Room);
  }
});

state.messenger.addMessageHandler("FETCH_ALL_SETTINGS", () => {
  return state.settings;
})

state.messenger.addMessageHandler("FETCH_SETTINGS__GENERAL", () => {
  return state.settings.general;
})

state.messenger.addMessageHandler("FETCH_SETTINGS__EDITOR", () => {
  return state.settings.editor;
})

state.messenger.addMessageHandler("FETCH_SETTINGS__KEYBINDINGS", () => {
  return state.settings.keybindings;
})

state.messenger.addMessageHandler("SUBMIT_ALL_SETTINGS", () => {
  for (const key in state.settings) {
    let changedSettings = [] as Setting<number | string | boolean>[];
    for (const subkey in state.settings[key]) {
      if (state.settings[key][subkey].edited) {
        state.settings[key][subkey].submit();
        changedSettings.push(state.settings[key][subkey]);
      }
    }
    if (changedSettings.length > 0) {
      state.settingsManagers[key].update(changedSettings);
    }
  }
  return state.settings;
});

state.messenger.addMessageHandler("SUBMIT_SETTINGS__GENERAL", () => {
  for (const key in state.settings.general) {
    state.settings.general[key].submit();
  }
  return state.settings;
});

state.messenger.addMessageHandler("SUBMIT_SETTINGS__EDITOR", () => {
  for (const key in state.settings.editor) {
    state.settings.editor[key].submit();
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
    name: "Ray Tracer",
    containers: state.containers,
    reflectionOrder: 6,
    updateInterval: 5,
    passes: 500,
    pointSize: 2,
    renderer: state.renderer
  });
  state.solvers[raytracer.uuid] = raytracer;
  raytracer.runningWithoutReceivers = false;
  return raytracer;
});

state.messenger.addMessageHandler("SHOULD_REMOVE_SOLVER", (acc, id) => {
  if (state.solvers && state.solvers[id]) {
    if (state.solvers[id].kind === "ray-tracer") {
      (state.solvers[id] as RayTracer).removeMessageHandlers();
    }
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

state.messenger.addMessageHandler("SHOULD_ADD_FDTD_2D", (acc, ...args) => {
  // const sources = [] as Source[];
  // const rooms = [] as Room[];
  // const receivers = [] as Receiver[];
  // for (const key in state.containers) {
    // switch (state.containers[key].kind) {
      // case "source":
        // sources.push(state.containers[key] as Source);
        // break;
      // case "receiver":
        // receivers.push(state.containers[key] as Receiver);
        // break;
      // case "room":
        // rooms.push(state.containers[key] as Room);
        // break;
      // default:
        // break;
    // }
  // }

  // state.simulation = uuid();
  const fdtd2d = new FDTD_2D({
    messenger: state.messenger,
    renderer: state.renderer
  });
  fdtd2d.name = "FDTD-2D"
  state.solvers[fdtd2d.uuid] = fdtd2d;

  return state.solvers[fdtd2d.uuid];
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
  let shouldAddMoment = true;
  if (args && args[0]) {
    source.uuid = args[0].uuid;
    source.position.set(args[0].position.x, args[0].position.y, args[0].position.z);
    source.scale.set(args[0].scale.x, args[0].scale.y, args[0].scale.z);
    // source.rotation.set(args[0].rotation);
    source.name = args[0].name;
    source.color = args[0].color;
    source.visible = args[0].visible;
    shouldAddMoment = false;
  }
  const staticSource = {
    uuid: source.uuid,
    position: source.position.clone(),
    scale: source.scale.clone(),
    // rotation: source.rotation.clone(),
    name: source.name,
    color: source.color,
    visible: source.visible
  }
  state.containers[source.uuid] = source;
  state.sources.push(source.uuid);
  state.renderer.add(source);
  Object.keys(state.solvers).forEach(x => {
    state.solvers[x] instanceof RayTracer &&
      (state.solvers[x] as RayTracer).addSource(source);
  });
  
  if (shouldAddMoment) {
    state.history.addMoment({
      category: "SHOULD_ADD_SOURCE",
      objectId: source.uuid,
      recallFunction: (direction: keyof Directions) => {
        if (direction === state.history.DIRECTIONS.UNDO) {
          state.messenger.postMessage("SHOULD_REMOVE_CONTAINER", staticSource.uuid);
        } else if (direction === state.history.DIRECTIONS.REDO) {
          state.messenger.postMessage("SHOULD_ADD_SOURCE", staticSource);
        }
      }
    });
  }
  
  
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
    state.selectedObjects = state.selectedObjects.filter((x) => x.uuid !== id);
    state.renderer.remove(state.containers[id]);
    delete state.containers[id];
  }
});

state.messenger.addMessageHandler("SHOULD_ADD_RECEIVER", (acc, ...args) => {
  const rec = new Receiver("new receiver");
  let shouldAddMoment = true;
  if (args && args[0]) {
    rec.uuid = args[0].uuid;
    rec.position.set(args[0].position.x, args[0].position.y, args[0].position.z);
    rec.scale.set(args[0].scale.x, args[0].scale.y, args[0].scale.z);
    // rec.rotation.copy(args[0].rotation);
    rec.name = args[0].name;
    rec.color = args[0].color;
    rec.visible = args[0].visible;
    shouldAddMoment = false;
  }
  const staticRec = {
    uuid: rec.uuid,
    position: rec.position.clone(),
    scale: rec.scale.clone(),
    // rotation: rec.rotation.clone(),
    name: rec.name,
    color: rec.color,
    visible: rec.visible
  };
  state.containers[rec.uuid] = rec;
  state.receivers.push(rec.uuid);
  state.renderer.add(rec);
  Object.keys(state.solvers).forEach(x => {
    state.solvers[x] instanceof RayTracer &&
      (state.solvers[x] as RayTracer).addReceiver(rec);
  });
  
  if (shouldAddMoment) {
    state.history.addMoment({
      category: "SHOULD_ADD_RECEIVER",
      objectId: rec.uuid,
      recallFunction: (direction: keyof Directions) => {
        if (direction === state.history.DIRECTIONS.UNDO) {
          state.messenger.postMessage("SHOULD_REMOVE_CONTAINER", staticRec.uuid);
        }
        else if (direction === state.history.DIRECTIONS.REDO) {
          state.messenger.postMessage("SHOULD_ADD_RECEIVER", staticRec);
        }
      }
    });
  }
  
  
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
      switch (fileType(file.name)) {
        case 'obj': {
          const result = await(await fetch(objectURL)).text();
          const models = importHandlers.obj(result);
          const surfaces = models.map(
            (model) =>
              new Surface(model.name, {
                geometry: model.geometry,
                acousticMaterial: state.materials[0]
              })
          );
          const room = new Room("new room", {
            surfaces,
            originalFileName: file.name,
            originalFileData: result
          });
          state.containers[room.uuid] = room;
          state.room = room.uuid;
          state.renderer.addRoom(room);
          state.messenger.postMessage("ADDED_ROOM", room);
        } break
        default: break
      }
    }
  });
});

state.messenger.addMessageHandler("APP_MOUNTED", (acc, ...args) => {
  state.renderer.init(args[0], (cateogry: SettingsCategories) => state.settings[cateogry]);
});

state.messenger.addMessageHandler("RENDERER_UPDATED", (acc, ...args) => {
  state.time += 0.01666666667;
  if (state.simulation.length > 0) {
    state.solvers[state.simulation].update();
  }
  if (state.selectedObjects.length > 0) {
    state.selectedObjects.forEach(x => {
      x.renderCallback(state.time);
    })
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

state.messenger.addMessageHandler("FETCH_SURFACES", (acc, ...args) => {
  let ids = args[0];
  if (typeof ids === "string") {
    ids = [ids];
  }
  if (ids) {
    const surfaces = ids.map(id => {
      const rooms = state.messenger.postMessage("FETCH_ROOMS")[0];
      if (rooms && rooms.length > 0) {
        for (let i = 0; i < rooms.length; i++) {
          const room = (rooms[i] as Room);
          const surface = room.surfaces.getObjectByProperty("uuid", id);
          if (surface && surface instanceof Surface) {
            return surface;
          }
        }
      }
      return null;
    }).filter(x => x);
    return surfaces;
  }
})

state.messenger.addMessageHandler("ASSIGN_MATERIAL", (acc, material) => {
  let surfaceCount = 0;
  const previousAcousticMaterials = [] as Array<{ uuid: string; acousticMaterial: AcousticMaterial}>;
  for (let i = 0; i < state.selectedObjects.length; i++){
    if (state.selectedObjects[i] instanceof Surface) {
      previousAcousticMaterials.push({
        uuid: state.selectedObjects[i].uuid,
        acousticMaterial: (state.selectedObjects[i] as Surface).acousticMaterial
      });
      (state.selectedObjects[i] as Surface).acousticMaterial = material;
      surfaceCount++;
    }
  }
  state.history.addMoment({
    category: "ASSIGN_MATERIAL",
    objectId: uuid(),
    recallFunction: () => {
      const surfaces = state.messenger.postMessage("FETCH_SURFACES", previousAcousticMaterials.map(x => x.uuid))[0];
      for (let i = 0; i < previousAcousticMaterials.length; i++){
        if (surfaces[i].uuid === previousAcousticMaterials[i].uuid) {
          (surfaces[i] as Surface).acousticMaterial = previousAcousticMaterials[i].acousticMaterial;
        }
      }
    }
  })
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
  Object.keys(state.solvers).forEach(x => {
    state.messenger.postMessage("SHOULD_REMOVE_SOLVER", x);
  })
  Object.keys(state.containers).forEach(x => {
    state.messenger.postMessage('SHOULD_REMOVE_CONTAINER', x);
  });
  state.messenger.postMessage("DESELECT_ALL_OBJECTS");
  
});

state.messenger.addMessageHandler("UNDO", (acc, ...args) => {
  state.history.undo();
  return [state.history.canUndo, state.history.canRedo];
})

state.messenger.addMessageHandler("REDO", (acc, ...args) => {
  state.history.redo();
 return [state.history.canUndo, state.history.canRedo];
})




function addHotKey(keybinding, scopes, message) {
  scopes.forEach(scope => {
    hotkeys(keybinding, scope, () => state.messenger.postMessage(message));  
  })
}

function registerHotKeys() {
  addHotKey("ctrl+i, command+i", ["normal", "editor"],"SHOW_IMPORT_DIALOG");
  addHotKey("shift+m", ["normal", "editor"], "TOGGLE_MATERIAL_SEARCH");
  addHotKey("shift+n", ["normal", "editor"], "SHOW_NEW_WARNING");
  addHotKey("shift+o", ["normal", "editor"], "TOGGLE_CAMERA_ORTHO");
  addHotKey("ctrl+shift+f, command+shift+f",["normal" , "editor", "editor-moving"], "TOGGLE_FULLSCREEN");
  addHotKey("ctrl+z, command+z",["normal", "editor"],"UNDO");
  addHotKey("ctrl+shift+z, command+shift+z",["normal", "editor"], "REDO");
  
  addHotKey("m", ["editor"], "MOVE_SELECTED_OBJECTS");
  addHotKey("escape", ["editor", "editor-moving"], "PHASE_OUT");
  
}

registerHotKeys();

hotkeys.setScope("normal");


// remove this for prod
expose({ r: state.renderer }, window);

state.messenger.addMessageHandler("GET_RENDERER", (acc, ...args) => {
  return state.renderer;
})

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
  const models = importHandlers.obj(basement);

  const surfaces = models.map(
    (model) =>
      new Surface(model.name, {
        geometry: model.geometry,
        acousticMaterial: state.materialsIndex["rhFUnadRAxTJgCU7"]
      })
  );
  const room = new Room("room", {
    surfaces,
    originalFileData: basement,
    originalFileName: "basement_even_ceiling.obj"
  });
  state.containers[room.uuid] = room;
  state.renderer.addRoom(room);

  state.messenger.postMessage("ADDED_ROOM", room);

  (state.containers[sourceidL] as Source).position.set(1.15, 9.8, 1.2);
  (state.containers[sourceidL] as Source).scale.set(1.2, 1.2, 1.2);
  (state.containers[sourceidL] as Source).name = "L";

  (state.containers[sourceidR] as Source).position.set(3.3, 9.8, 1.2);
  (state.containers[sourceidR] as Source).scale.set(1.2, 1.2, 1.2);
  (state.containers[sourceidR] as Source).name = "R";

  (state.containers[receiverId] as Receiver).position.set(6.8, 8.1,  1.2);
  (state.containers[receiverId] as Receiver).scale.set(1.5, 1.5, 1.5);

  state.renderer.gridVisible = false;
  
  
  
  state.history.clear();

  expose(
    {
      fdtd: state.messenger.postMessage("SHOULD_ADD_FDTD_2D")[0],
      raytracer: state.messenger.postMessage("SHOULD_ADD_RAYTRACER")[0],
      state,
      THREE
    },
    window
  );
}, 200);
