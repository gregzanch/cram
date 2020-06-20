// user interface
import React from "react";
import ReactDOM from "react-dom";
import Themes from './themes';
import App from "./components/App";
import { IToastProps } from "@blueprintjs/core";


// command handling
import hotkeys from "hotkeys-js";
import Messenger from "./messenger";
import { History, Moment, Directions } from './history';

// objects
import Container from "./objects/container";
import Source, { SourceSaveObject } from "./objects/source";
import Receiver from "./objects/receiver";
import Polygon from "./objects/polygon";
import Room from "./objects/room";
import Surface, { SurfaceSaveObject, BufferGeometrySaveObject } from "./objects/surface";
import AudioFile from './objects/audio-file';
import Sketch from './objects/sketch';

// compute/solvers
import Solver from "./compute/solver";
import RayTracer, { RayTracerParams } from "./compute/raytracer";
import RT60 from './compute/rt';
import { FDTD_2D, FDTD_2D_Defaults } from "./compute/2d-fdtd";
import * as ac from "./compute/acoustics";

// rendering
import Renderer from "./render/renderer";

// file i/o
import * as importHandlers from './import-handlers';
import { fileType, allowed } from "./common/file-type";

// data structures / storage
import { uuid } from "uuidv4";
import { KeyValuePair, KVP } from "./common/key-value-pair";
import { Setting } from "./setting";
import { defaultSettings, ApplicationSettings, SettingsCategories } from './default-settings';
import { SettingsManager, StoredSetting } from "./settings-manager";
import { layout as defaultLayout} from './default-storage';

// constants
import { EditorModes } from "./constants/editor-modes";
import { Processes } from "./constants/processes";

// databases
import materials from "./db/material.json";
import { AcousticMaterial } from './db/acoustic-material';

// utility
import { Searcher } from "fast-fuzzy";
import browserReport from "./common/browser-report";
import { chunk } from './common/chunk';
import { sizeof } from './common/sizeof';

// TODO remove these imports for prod
//@ts-ignore
import baps from "!raw-loader!./res/models/baps-better.obj";
//@ts-ignore
import rect from "!raw-loader!./res/models/rect10x13.obj";
//@ts-ignore
import plane from "!raw-loader!./res/models/plane.stl";
import expose from "./common/expose";
import { CSG, CAG } from '@jscad/csg';
import * as THREE from "three";
import FileSaver from "file-saver";
import { BufferGeometry } from "three";
import { Theme } from "@material-ui/core";






const materialsIndex = {} as KeyValuePair<AcousticMaterial>;

materials.forEach(x => {
    materialsIndex[x.uuid] = x;
});

const layout = JSON.parse(localStorage.getItem("layout") || defaultLayout);



const state = {
  leftPanelInitialSize: layout.leftPanelInitialSize,
  bottomPanelInitialSize: layout.bottomPanelInitialSize,
  rightPanelInitialSize: layout.rightPanelInitialSize,
  rightPanelTopInitialSize: layout.rightPanelTopInitialSize,
  audiofiles: {} as KeyValuePair<AudioFile>,
  time: 0,
  selectedObjects: [] as Container[],
  materialsIndex,
  materials,
  materialSearcher: new Searcher(materials, {
    keySelector: (obj) => obj.material
  }),
  sources: [] as string[],
  receivers: [] as string[],
  room: "" as string,
  containers: {} as KeyValuePair<Container>,
  constructions: {} as KeyValuePair<Container>,
  sketches: {} as KeyValuePair<Sketch>,
  solvers: {} as KeyValuePair<Solver>,
  simulation: "",
  renderer: {} as Renderer,
  messenger: new Messenger(),
  history: new History(),
  settings: defaultSettings as ApplicationSettings,
  settingsManagers: {} as KeyValuePair<SettingsManager>,
  editorMode: EditorModes.OBJECT as EditorModes,
  currentProcess: Processes.NONE as Processes,
  browser: browserReport(navigator.userAgent),
  projectName: defaultSettings.general.default_save_name.value
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
      state.projectName = state.settings.general.default_save_name.value;
    },
    (event) => {
      console.log(event);
    }
  );
});


state.renderer = new Renderer({
  messenger: state.messenger,
  history: state.history
});

state.messenger.addMessageHandler("ADD_CONSTRUCTION", (acc, ...args) => {
  if (args && args[0]) {
    const construction = args[0] as Container;
    state.constructions[construction.uuid] = construction;
  }
});

state.messenger.addMessageHandler("REMOVE_CONSTRUCTION", (acc, id) => {
  if (id) {
    if (state.constructions[id]) {
      delete state.constructions[id];
    } 
  }
});

state.messenger.addMessageHandler("GET_CONSTRUCTIONS", (acc, ...args) => {
  return state.constructions;
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

state.messenger.addMessageHandler("GET_SELECTED_OBJECT_TYPES", (acc, ...args) => {
  return state.selectedObjects.map(obj=>obj.kind);
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
  const props = args && args[0];
  const raytracer = new RayTracer({
    messenger: state.messenger,
    name: (props && props.name) || "Ray Tracer",
    containers: state.containers,
    reflectionOrder: (props && props.reflectionOrder) || 6,
    updateInterval: (props && props.updateInterval) || 5,
    passes: (props && props.passes) || 500,
    pointSize: (props && props.pointSize) || 2,
    renderer: state.renderer
  });
  state.solvers[raytracer.uuid] = raytracer;
  raytracer.runningWithoutReceivers = false;
  return raytracer;
});

state.messenger.addMessageHandler("SHOULD_REMOVE_SOLVER", (acc, id) => {
  if (state.solvers && state.solvers[id]) {
    state.solvers[id].dispose();
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

state.messenger.addMessageHandler("SHOULD_ADD_FDTD_2D", (acc, args) => {
  const defaults = FDTD_2D_Defaults;
  const selection = state.messenger.postMessage("GET_SELECTED_OBJECTS")[0];
  let width = args && args.width || defaults.width;
  let height = args && args.height || defaults.height;
  let offsetX = 0;
  let offsetY = 0;
  let cellSize = args && args.cellSize || Math.max(width, height) / 128;
  const sources = [] as Source[];
  const receivers = [] as Receiver[];
  const surfaces = [] as Surface[];
  let surface = undefined as Surface|undefined;
  if (selection.length > 0) {
    selection.forEach(obj => {
      switch (obj.kind) {
        case 'source': {
          sources.push(obj);
        } break;
        case 'receiver': {
          receivers.push(obj);
        } break;
        case 'surface': {
          surfaces.push(obj);
        } break;
        default: break;
      }
    });
    if (surfaces.length > 0) {
      surface = (surfaces.length > 1) ? surfaces[0].mergeSurfaces(surfaces) : surfaces[0];
      const { max, min } = surface.mesh.geometry.boundingBox;
      width = max.x - min.x;
      height = max.y - min.y;
      offsetX = min.x;
      offsetY = min.y;
    }
  }
  const fdtd2d = new FDTD_2D({
    messenger: state.messenger,
    renderer: state.renderer,
    width,
    height,
    offsetX,
    offsetY,
    cellSize
  });
  fdtd2d.name = "FDTD-2D"
  if (surface) {
    fdtd2d.addWallsFromSurfaceEdges(surface);
  }
  if (sources.length > 0) {
    sources.forEach(src => fdtd2d.addSource(src));
  }
  if (receivers.length > 0) {
    receivers.forEach((rec) => fdtd2d.addReceiver(rec));
  }
  state.solvers[fdtd2d.uuid] = fdtd2d;

  return state.solvers[fdtd2d.uuid];
});

state.messenger.addMessageHandler("RAYTRACER_CALCULATE_RESPONSE", (acc, id, frequencies) => {
  (state.solvers[id] instanceof RayTracer) && (state.solvers[id] as RayTracer).calculateReflectionLoss(frequencies);
});

state.messenger.addMessageHandler("RAYTRACER_QUICK_ESTIMATE", (acc, id) => {
  (state.solvers[id] instanceof RayTracer) && (state.solvers[id] as RayTracer).startQuickEstimate();
});

// state.messenger.addMessageHandler("RAYTRACER_TEST_WASM", (acc, id, value) => {
//   (state.solvers[id] instanceof RayTracer) && (state.solvers[id] as RayTracer).testWasm(value);
// });

state.messenger.addMessageHandler("FETCH_ALL_SOURCES", (acc, ...args) => {
  return state.sources.map(x => {
    if (args && args[0] && args[0] instanceof Array) {
      return args[0].map(y => state.containers[x][y]);
    } else return state.containers[x];
  });
});

state.messenger.addMessageHandler("FETCH_ALL_SOURCES_AS_MAP", (acc, ...args) => {
  const sourcemap = new Map<string, Source>();
  for (let i = 0; i < state.sources.length; i++){
    sourcemap.set(state.sources[i], state.containers[state.sources[i]] as Source);
  }
  return sourcemap;
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
    if (!args[1]) {
      source.uuid = args[0].uuid;
    }
    source.position.set(args[0].position.x, args[0].position.y, args[0].position.z);
    source.scale.set(args[0].scale.x, args[0].scale.y, args[0].scale.z);
    // source.rotation.set(args[0].rotation);
    if (!args[1]) {
      source.name = args[0].name;
    }
    else {
      source.name = args[0].name+"-copy"
    }
    // source.color = args[0].color;
    source.visible = args[0].visible;
    shouldAddMoment = args[1] || false;
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
          state.messenger.postMessage("SHOULD_ADD_SOURCE", staticSource, false);
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
    if (!args[1]) {
      rec.uuid = args[0].uuid;
    }
    rec.position.set(args[0].position.x, args[0].position.y, args[0].position.z);
    rec.scale.set(args[0].scale.x, args[0].scale.y, args[0].scale.z);
    // source.rotation.set(args[0].rotation);
    if (!args[1]) {
      rec.name = args[0].name;
    } else {
      rec.name = args[0].name + "-copy";
    }
    // rec.color = args[0].color;
    rec.visible = args[0].visible;
    shouldAddMoment = args[1] || false;
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
          state.messenger.postMessage("SHOULD_ADD_RECEIVER", staticRec, false);
        }
      }
    });
  }
  
  
  return rec;
});

state.messenger.addMessageHandler("SHOULD_DUPLICATE_SELECTED_OBJECTS", (acc, ...args) => {
  const objs = [] as Container[];
  const selection = state.messenger.postMessage("GET_SELECTED_OBJECTS")[0];
  if (selection && selection.length > 0) {
    for (let i = 0; i < selection.length; i++) {
        switch (selection[i].kind) {
          case "source":
            {
              objs.push(state.messenger.postMessage("SHOULD_ADD_SOURCE", selection[i], true)[0]);
            }
            break;
          case "receiver":
            {
              objs.push(state.messenger.postMessage("SHOULD_ADD_RECEIVER", selection[i], true)[0]);
            }
            break;
          default:
            break;
        }
    }
  }

  state.messenger.postMessage("SET_SELECTION", objs);
});


state.messenger.addMessageHandler("GET_CONTAINERS", (acc, ...args) => {
  return state.containers;
});
state.messenger.addMessageHandler("ADDED_ROOM", (acc, ...args) => {
  args[0];
});

state.messenger.addMessageHandler("ADDED_AUDIO_FILE", (acc, args) => {
  const audiofile = args[0] as AudioFile;
  state.audiofiles[audiofile.uuid] = audiofile;
})

state.messenger.addMessageHandler("IMPORT_FILE", (acc, ...args) => {
  const files = Array.from(args[0]);
  files.forEach(async (file: File) => {
    if (allowed[fileType(file.name)]) {
      const objectURL = URL.createObjectURL(file);
      switch (fileType(file.name)) {
        case 'obj': {
          const result = await (await fetch(objectURL)).text();
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
        } break;
        case 'stl': {
          const result = await (await fetch(objectURL)).text();
          const models = importHandlers.stl(result);
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
        } break;
        case 'dae': {
          const result = await (await fetch(objectURL)).arrayBuffer();
          const models = importHandlers.dae(result);
          console.log(models);
        } break;
        case 'wav': {
          try {
            const result = await (await fetch(objectURL)).arrayBuffer();
            const audioContext = new AudioContext();
            audioContext.decodeAudioData(result, (buffer: AudioBuffer) => {
              const channelData = [] as Float32Array[];
              for (let i = 0; i < buffer.numberOfChannels; i++){
                channelData.push(buffer.getChannelData(i));
              }
              const audioFile = new AudioFile({
                name: file.name,
                filename: file.name,
                sampleRate: buffer.sampleRate,
                length: buffer.length,
                duration: buffer.duration,
                numberOfChannels: buffer.numberOfChannels,
                channelData
              });
              state.messenger.postMessage("ADDED_AUDIO_FILE", audioFile);
            });
            console.log(result);
          } catch (e) {
            console.error(e);
          }
        } break;
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

state.messenger.addMessageHandler("GET_RENDERER", (acc, ...args) => {
  return state.renderer;
})

state.messenger.addMessageHandler("SET_EDITOR_MODE", (acc, ...args) => {
  if (EditorModes[args[0]]) {
    state.editorMode = EditorModes[args[0]];
    for (const key in state.containers) {
      state.containers[key].onModeChange(state.editorMode);
    }
    for (const key in state.solvers) {
      state.solvers[key].onModeChange(state.editorMode);
    }
  }
  state.renderer.needsToRender = true;
});

state.messenger.addMessageHandler("GET_EDITOR_MODE", (acc, ...args) => {
  return state.editorMode;
});

state.messenger.addMessageHandler("SET_PROCESS", (acc, ...args) => {
  if (Processes[args[0]]) {
    state.currentProcess = Processes[args[0]];
    state.renderer.currentProcess = state.currentProcess;
    state.renderer.needsToRender = true;
  }
});

state.messenger.addMessageHandler("GET_PROCESS", (acc, ...args) => {
  return state.currentProcess;
});

state.messenger.addMessageHandler("SHOULD_ADD_SKETCH", (acc, ...args) => {
  // state.messenger.postMessage("PHASE_OUT");
  // state.messenger.postMessage("SET_PROCESS", Processes.PICKING_SURFACE)
  const selectedObjects = state.messenger.postMessage("GET_SELECTED_OBJECTS")[0];
  if (selectedObjects && selectedObjects[selectedObjects.length - 1]) {
    const surface = selectedObjects[selectedObjects.length - 1];
    if (surface instanceof Surface) {
      const sketch = new Sketch({
        normal: surface._triangles[0].getNormal(new THREE.Vector3()),
        point: surface.center
      });
      state.sketches[sketch.uuid] = sketch;
      state.renderer.sketches.add(state.sketches[sketch.uuid]);
    }
  }
});

state.messenger.addMessageHandler("SHOULD_REMOVE_SKETCH", (acc, id) => {
  if (state.sketches[id]) {
    state.renderer.sketches.remove(state.sketches[id]);
    delete state.sketches[id];
  }
});

state.messenger.addMessageHandler("SAVE_CONTAINERS", (acc, ...args) => {
  const keys = Object.keys(state.containers);
  const saveObjects = keys.map(key => state.containers[key].save());
  return saveObjects;
});

state.messenger.addMessageHandler("SET_PROJECT_NAME", (acc, ...args) => {
  state.projectName = (args && args[0]) || state.projectName;
  document.title = state.projectName + " | cram.ui";
})

state.messenger.addMessageHandler("GET_PROJECT_NAME", (acc, ...args) => {
  return state.projectName;
})

state.messenger.addMessageHandler("RESTORE_CONTAINERS", (acc, ...args) => {
  const keys = Object.keys(state.containers);
  keys.forEach(key => {
    state.messenger.postMessage("SHOULD_REMOVE_CONTAINER", key);
  });
  if (args && args[0] && args[0] instanceof Array) {
    // console.log(args[0]);
    console.log(args[0]);
    args[0].forEach(saveObj => {
      switch (saveObj["kind"]) {
        case "source":
          {
            const src = new Source("new source", { ...saveObj }).restore(saveObj);
            state.messenger.postMessage("SHOULD_ADD_SOURCE", src, false);
            // state.containers[src.uuid] = src;
            // state.sources.push(src.uuid);
            // state.renderer.add(src);
          }
          break;
        case "receiver":
          {
            const rec = new Receiver("new receiver", { ...saveObj }).restore(saveObj);
            state.messenger.postMessage("SHOULD_ADD_RECEIVER", rec, false);
            // state.containers[rec.uuid] = rec;
            // state.sources.push(rec.uuid);
            // state.renderer.add(rec);
          }
          break;
        case "room":
          {
            const surfaces = saveObj.surfaces.map((surfaceState: SurfaceSaveObject) => {
              const geometry = new THREE.BufferGeometry();
              if (!(surfaceState.geometry instanceof THREE.BufferGeometry)) {
                const geom = surfaceState.geometry as BufferGeometrySaveObject;
                geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(geom.data.attributes.position.array), geom.data.attributes.position.itemSize, geom.data.attributes.position.normalized));
                geometry.setAttribute("normals", new THREE.BufferAttribute(new Float32Array(geom.data.attributes.normals.array), geom.data.attributes.normals.itemSize, geom.data.attributes.normals.normalized));
                geometry.setAttribute("texCoords", new THREE.BufferAttribute(new Float32Array(geom.data.attributes.texCoords.array), geom.data.attributes.texCoords.itemSize, geom.data.attributes.texCoords.normalized));
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
            state.containers[room.uuid] = room;
            state.renderer.addRoom(room);

            state.messenger.postMessage("ADDED_ROOM", room);
          }
          break;
        default: break;
      }
    });
  }
});

state.messenger.addMessageHandler("SAVE", (acc, ...args) => {
  const savedState = state.messenger.postMessage("SAVE_CONTAINERS")[0];
  const blob = new Blob([JSON.stringify(savedState)], {
    type: "text/plain;charset=utf-8"
  });
  state.projectName = (args && args[0] && args[0].filename) || state.projectName;
  FileSaver.saveAs(blob, `${state.projectName}.json`);
  if (args && args[0] && args[0].callback) {
    args[0].callback();
  }
})

state.messenger.addMessageHandler("OPEN", (acc, ...args) => {
  const tempinput = document.createElement("input");
  tempinput.type = "file";
  tempinput.accept = "application/json";
  tempinput.setAttribute('style', 'display: none');
  document.body.appendChild(tempinput);
  tempinput.addEventListener('change', async e => {
    const files = (e.target as HTMLInputElement).files;
    if (!files) {
      tempinput.remove();
      return;
    }
    const file = files[0];
    const objectURL = URL.createObjectURL(file);
    try {
      const result = await (await fetch(objectURL)).text();
      const savedState = JSON.parse(result);
      state.messenger.postMessage("RESTORE_CONTAINERS", savedState);
      state.messenger.postMessage("SET_PROJECT_NAME", file.name.replace('.json',''));
      tempinput.remove();
    }
    catch (e) {
      console.warn(e);
    }
    
  })
  tempinput.click();
})





function addHotKey(keybinding, scopes, message, ...args) {
  scopes.forEach(scope => {
    hotkeys(keybinding, scope, () => state.messenger.postMessage(message, args));  
  })
}

function registerHotKeys() {
  addHotKey("ctrl+i, command+i", ["normal", "editor"],"SHOW_IMPORT_DIALOG");
  addHotKey("shift+m", ["normal", "editor"], "TOGGLE_MATERIAL_SEARCH");
  addHotKey("shift+n", ["normal", "editor"], "SHOW_NEW_WARNING");
  addHotKey("shift+o", ["normal", "editor"], "TOGGLE_CAMERA_ORTHO");
  addHotKey("ctrl+shift+f, command+shift+f",["normal" , "editor", "editor-moving"], "TOGGLE_FULLSCREEN");
  addHotKey("ctrl+z, command+z", ["normal", "editor"],"UNDO");
  addHotKey("ctrl+shift+z, command+shift+z",["normal", "editor"], "REDO");
  
  addHotKey("m", ["editor"], "MOVE_SELECTED_OBJECTS");
  addHotKey("f", ["editor"], "FOCUS_ON_SELECTED_OBJECTS");
  addHotKey("shift+f", ["editor"], "FOCUS_ON_CURSOR");
  
  addHotKey("escape", ["editor", "editor-moving"], "PHASE_OUT");
  
}

registerHotKeys();

hotkeys.setScope("normal");

window.addEventListener('resize', e => {
  state.renderer.needsToRender = true;
})





// the main app
ReactDOM.render(
    <App {...state} />,
  document.getElementById("root")
);


// setTimeout(async () => {
//   const filepath = "/res/saves/concord.json";
//   const filename = filepath.split("/").slice(-1)[0];
//   const savedStateFetchResult = await fetch(filepath);
//   const savedState = await savedStateFetchResult.json();
//   console.log(filename, savedState)
//   state.messenger.postMessage("RESTORE_CONTAINERS", savedState);
//   state.messenger.postMessage("SET_PROJECT_NAME", filename.replace(".json", ""));
  
  // const rooms = state.messenger.postMessage("FETCH_ROOMS");
  // if (rooms && rooms[0] && rooms[0][0]) {
  //   const room = rooms[0][0] as Room;
  //   const blocks = new Container("blocks");
  //   console.log(room)
  //   room.surfaces.children
  //     .filter(x => x.name.match(/ceiling-block/gim))
  //     .forEach((x) => {
  //       blocks.add(x);
  //       room.surfaces.remove(x);
  //     });
  //   room.surfaces.add(blocks);
    
  // }
  
  
  
  // const raytracer = state.messenger.postMessage("SHOULD_ADD_RAYTRACER", {
  //   passes: 500,
  //   reflectionOrder: 6,
  //   pointSize: 2
  // } as RayTracerParams)[0] as RayTracer;
  // raytracer.raysVisible = false;
  // raytracer.pointsVisible = false;
  // const rt60 = state.messenger.postMessage("SHOULD_ADD_RT60")[0];
  // expose({ raytracer });
// }, 200);


  // const models = importHandlers.obj(rect); 

  
  // const models = importHandlers.stl(plane);
  
  // const surfaces = models.map(
  //   (model, i) =>
  //     new Surface(model.name, {
  //       geometry: model.geometry,
  //       // acousticMaterial: state.materialsIndex[savedSurfaces[i]]
  //       acousticMaterial: state.materialsIndex["ROU1k4g0cgMC5b1N"]
  //     })
  // );
  // const room = new Room("room", {
  //   surfaces,
  //   originalFileData: rect,
  //   originalFileName: "rect10x13.obj"
  // });
  // state.containers[room.uuid] = room;
  // state.renderer.addRoom(room);

  // state.messenger.postMessage("ADDED_ROOM", room);
  
  // const src = state.messenger.postMessage("SHOULD_ADD_SOURCE")[0] as Source;
  // src.name = "src";
  // src.position.set(0.5, 0.5, 1);
  
  // const recsrc = state.messenger.postMessage("SHOULD_ADD_RECEIVER")[0] as Receiver;
  // recsrc.name = "recsrc";
  // recsrc.position.set(0.5, 0.5, 0.5);

  // const srcL = state.messenger.postMessage("SHOULD_ADD_SOURCE")[0] as Source;
  // srcL.name = "L";
  // srcL.position.set(48, 6.4, 3.5);
  
  // const rec = state.messenger.postMessage("SHOULD_ADD_RECEIVER")[0] as Receiver;
  // rec.name = "rec";
  // rec.position.set(5, 6.5, 1);
  

  
  
  
  // const fdtd = state.messenger.postMessage("SHOULD_ADD_FDTD_2D")[0];
  

// }, 200);


  expose({
    // fdtd,
    // raytracer,
    sizeof,
    Container,
    r: state.renderer,
    Polygon,
    Sketch,
    state,
    CSG,
    CAG,
    ac,
    THREE,
    chunk
  });

  state.history.clear();
  