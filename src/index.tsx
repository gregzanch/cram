// user interface
import React, { createContext, useReducer } from "react";
import ReactDOM from "react-dom";
import Themes from './themes';
import App from "./components/App";
import { IToastProps } from "@blueprintjs/core";


// command handling
import hotkeys from "hotkeys-js";
import Messenger from "./state/messenger";
import { History, Moment, Directions } from './history';

// objects
import Container from "./objects/container";
import Source, { SourceSaveObject, SourceProps } from "./objects/source";
import Receiver, { ReceiverProps } from "./objects/receiver";
import Polygon from "./objects/polygon";
import Room, { RoomSaveObject } from "./objects/room";
import Surface, { SurfaceSaveObject, BufferGeometrySaveObject } from "./objects/surface";
import AudioFile from './objects/audio-file';
import Sketch from './objects/sketch';

// compute/solvers
import Solver from "./compute/solver";
import RayTracer, { RayTracerParams } from "./compute/raytracer";
import RT60, { RT60Props } from './compute/rt';
import { FDTD_2D, FDTD_2D_Defaults } from "./compute/2d-fdtd";
import FDTD_3D from "./compute/3d-fdtd";
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
import { addToGlobalVars } from './common/global-vars';
import { gt, lt, gte, lte } from 'semver';

// TODO remove these imports for prod
//@ts-ignore
import baps from "!raw-loader!./res/models/baps-better.obj";
//@ts-ignore
import rect from "!raw-loader!./res/models/rect10x13.obj";
//@ts-ignore
import plane from "!raw-loader!./res/models/plane.stl";
import expose from "./common/expose";
import { CSG, CAG } from '@jscad/csg';
import csg from './compute/csg';
import * as THREE from "three";
import FileSaver from "file-saver";
import { BufferGeometry } from "three";
import { Theme } from "@material-ui/core";

import { Actions } from './state/actions';

expose({
  vars: {}
});





const layout = JSON.parse(localStorage.getItem("layout") || defaultLayout);


const state = {
  time: 0,
  projectName: defaultSettings.general.default_save_name.value,
  leftPanelInitialSize: layout.leftPanelInitialSize,
  bottomPanelInitialSize: layout.bottomPanelInitialSize,
  rightPanelInitialSize: layout.rightPanelInitialSize,
  rightPanelTopInitialSize: layout.rightPanelTopInitialSize,
  selectedObjects: [] as Container[],
  materials,
  materialSearcher: new Searcher(materials, {
    keySelector: (obj) => obj.material
  }),
  sources: [] as string[],
  receivers: [] as string[],
  containers: {} as KeyValuePair<Container>,
  constructions: {} as KeyValuePair<Container>,
  sketches: {} as KeyValuePair<Sketch>,
  solvers: {} as KeyValuePair<Solver>,
  renderer: {} as Renderer,
  messenger: new Messenger(),
  history: new History(),
  audiofiles: {} as KeyValuePair<AudioFile>,
  settings: defaultSettings as ApplicationSettings,
  editorMode: EditorModes.OBJECT as EditorModes,
  currentProcess: Processes.NONE as Processes,
  browser: browserReport(navigator.userAgent),
  settingsManagers: {} as KeyValuePair<SettingsManager>,
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

state.messenger.addMessageHandler(Actions.ADD_CONSTRUCTION, ({ construction }) => {
  state.constructions[construction.uuid] = construction;
});

state.messenger.addMessageHandler(Actions.REMOVE_CONSTRUCTION, ({ id }) => {
  if (id) {
    if (state.constructions[id]) {
      delete state.constructions[id];
    } 
  }
});

state.messenger.addMessageHandler(Actions.GET_CONSTRUCTIONS, (acc, ...args) => {
  return state.constructions;
});

state.messenger.addMessageHandler(Actions.SET_SELECTION, ({ objects }) => {
  state.messenger.postMessage(Actions.DESELECT_ALL_OBJECTS);
  state.messenger.postMessage(Actions.APPEND_SELECTION, {objects});
});

state.messenger.addMessageHandler(Actions.DESELECT_ALL_OBJECTS, () => {
  Object.keys(state.containers).forEach((x) => {
    state.containers[x].deselect();
  });
  state.selectedObjects = [] as Container[];
});

state.messenger.addMessageHandler(Actions.APPEND_SELECTION, ({ objects }) => {
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

state.messenger.addMessageHandler(Actions.GET_SELECTED_OBJECTS, () => {
  return state.selectedObjects;
})

state.messenger.addMessageHandler(Actions.GET_SELECTED_OBJECT_TYPES, () => {
  return state.selectedObjects.map(obj=>obj.kind);
})

state.messenger.addMessageHandler(Actions.FETCH_ROOMS, () => {
  const roomkeys = Object.keys(state.containers).filter(x => {
    return state.containers[x].kind === "room";
  });
  if (roomkeys && roomkeys.length > 0) {
    return roomkeys.map(x => state.containers[x] as Room);
  }
});

state.messenger.addMessageHandler(Actions.FETCH_CONTAINER, ({ id }) => {
  return state.containers[id];
});

state.messenger.addMessageHandler(Actions.FETCH_ALL_SETTINGS, () => {
  return state.settings;
})

state.messenger.addMessageHandler(Actions.FETCH_SETTINGS__GENERAL, () => {
  return state.settings.general;
})

state.messenger.addMessageHandler(Actions.FETCH_SETTINGS__EDITOR, () => {
  return state.settings.editor;
})

state.messenger.addMessageHandler(Actions.FETCH_SETTINGS__KEYBINDINGS, () => {
  return state.settings.keybindings;
})

state.messenger.addMessageHandler(Actions.SUBMIT_ALL_SETTINGS, () => {
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

state.messenger.addMessageHandler(Actions.SUBMIT_SETTINGS__GENERAL, () => {
  for (const key in state.settings.general) {
    state.settings.general[key].submit();
  }
  return state.settings;
});

state.messenger.addMessageHandler(Actions.SUBMIT_SETTINGS__EDITOR, () => {
  for (const key in state.settings.editor) {
    state.settings.editor[key].submit();
  }
  return state.settings;
});

state.messenger.addMessageHandler(Actions.FETCH_ALL_MATERIALS, () => {
  return state.materials;
});

state.messenger.addMessageHandler(Actions.SEARCH_ALL_MATERIALS, ({ query }) => {
  const res = state.materialSearcher.search(query);
  return res;
});

state.messenger.addMessageHandler(Actions.SHOULD_ADD_RAYTRACER, (args) => {
  const props = args && args.props || {};
  const raytracer = new RayTracer({
    ...props,
    renderer: state.renderer,
    messenger: state.messenger,
    containers: state.containers
  });
  state.solvers[raytracer.uuid] = raytracer;
  
  state.messenger.postMessage(Actions.ADDED_RAYTRACER, { solver: state.solvers[raytracer.uuid] });
  
  return raytracer;
});

state.messenger.addMessageHandler(Actions.SHOULD_REMOVE_SOLVER, ({ id }) => {
  if (state.solvers && state.solvers[id]) {
    state.solvers[id].dispose();
    delete state.solvers[id];
 }
});

state.messenger.addMessageHandler(Actions.SHOULD_ADD_RT60, (args) => {
  const props = (args && args.props) || {};
  const rt60 = new RT60({
    ...props,
    messenger: state.messenger,
  });
  state.solvers[rt60.uuid] = rt60;
  state.messenger.postMessage(Actions.ADDED_RT60, { solver: state.solvers[rt60.uuid] });
  return state.solvers[rt60.uuid];
});

state.messenger.addMessageHandler(Actions.SHOULD_ADD_FDTD_2D, (args) => {
  const props = (args && args.props) || FDTD_2D_Defaults;
  const selection = state.messenger.postMessage(Actions.GET_SELECTED_OBJECTS);
  let width = (props && props.width) || FDTD_2D_Defaults.width;
  let height = (props && props.height) || FDTD_2D_Defaults.height;
  let offsetX = 0;
  let offsetY = 0;
  let cellSize = (props && props.cellSize) || Math.max(width, height) / 128;
  const sources = [] as Source[];
  const receivers = [] as Receiver[];
  const surfaces = [] as Surface[];
  let surface = undefined as Surface|undefined;
  if (selection && selection.length > 0) {
    selection.forEach(obj => {
      switch (obj.kind) {
        case 'source': {
          sources.push(obj as Source);
        } break;
        case 'receiver': {
          receivers.push(obj as Receiver);
        } break;
        case 'surface': {
          surfaces.push(obj as Surface);
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
  state.messenger.postMessage(Actions.ADDED_FDTD_2D, { solver: state.solvers[fdtd2d.uuid] });
  return state.solvers[fdtd2d.uuid];
});

state.messenger.addMessageHandler(Actions.RAYTRACER_CALCULATE_RESPONSE, ({ id, frequencies }) => {
  (state.solvers[id] instanceof RayTracer) && (state.solvers[id] as RayTracer).calculateReflectionLoss(frequencies);
});

state.messenger.addMessageHandler(Actions.RAYTRACER_QUICK_ESTIMATE, ({ id }) => {
  (state.solvers[id] instanceof RayTracer) && (state.solvers[id] as RayTracer).startQuickEstimate();
});

state.messenger.addMessageHandler(Actions.FETCH_ALL_SOURCES, () => {
  return Object.keys(state.containers).map((x) => {
    return state.containers[x];
  }).filter(x=> x instanceof Source);
});

state.messenger.addMessageHandler(Actions.FETCH_ALL_SOURCES_AS_MAP, () => {
  const sourcemap = new Map<string, Source>();
  for (let i = 0; i < state.sources.length; i++){
    sourcemap.set(state.sources[i], state.containers[state.sources[i]] as Source);
  }
  return sourcemap;
});

state.messenger.addMessageHandler(Actions.FETCH_ALL_RECEIVERS, () => {
  return Object.keys(state.containers)
    .map((x) => {
      return state.containers[x];
    })
    .filter((x) => x instanceof Receiver);
});

state.messenger.addMessageHandler(Actions.FETCH_SOURCE, ({ id }) => {
  return state.containers[id];
});

state.messenger.addMessageHandler(Actions.SHOULD_ADD_SOURCE, () => {

  const src = new Source("new source");
  
  state.containers[src.uuid] = src;
  state.sources.push(src.uuid);
  state.renderer.add(src);
  Object.keys(state.solvers).forEach(x => {
    state.solvers[x] instanceof RayTracer &&
      (state.solvers[x] as RayTracer).addSource(src);
  });
  
  state.messenger.postMessage(Actions.ADDED_SOURCE, {container: src})
  
  return src;
  
});

state.messenger.addMessageHandler(Actions.SHOULD_REMOVE_CONTAINER, ({ id }) => {
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

state.messenger.addMessageHandler(Actions.SHOULD_ADD_RECEIVER, () => {
  const rec = new Receiver("new receiver");


  state.containers[rec.uuid] = rec;
  state.sources.push(rec.uuid);
  state.renderer.add(rec);
  Object.keys(state.solvers).forEach(x => {
    state.solvers[x] instanceof RayTracer &&
      (state.solvers[x] as RayTracer).addReceiver(rec);
  });

  state.messenger.postMessage(Actions.ADDED_RECEIVER, { container: rec })
  
  return rec;
  
  
});

state.messenger.addMessageHandler(Actions.SHOULD_DUPLICATE_SELECTED_OBJECTS, () => {
  const objs = [] as Array<Source|Receiver|Surface>;
  const selection = state.messenger.postMessage(Actions.GET_SELECTED_OBJECTS);
  if (selection && selection.length > 0) {
    for (let i = 0; i < selection.length; i++) {
        switch (selection[i].kind) {
          case "source":
            {
              const src = state.messenger.postMessage(Actions.SHOULD_ADD_SOURCE);
              src?.copy(selection[i] as Source);
              if (src) {
                objs.push(src);
              }
            }
            break;
          case "receiver":
            {
              const rec = state.messenger.postMessage(Actions.SHOULD_ADD_RECEIVER);
              rec?.copy(selection[i] as Receiver);
               if (rec) {
                 objs.push(rec);
               }
            }
            break;
          default:
            break;
        }
    }
  }

  state.messenger.postMessage(Actions.SET_SELECTION, {objects: objs});
});

state.messenger.addMessageHandler(Actions.GET_CONTAINERS, () => {
  return state.containers;
});

state.messenger.addMessageHandler(Actions.ADDED_ROOM, ({ room }) => {
  room;
});

state.messenger.addMessageHandler(Actions.ADDED_AUDIO_FILE, ({ file }) => {
  const audiofile = file as AudioFile;
  state.audiofiles[audiofile.uuid] = audiofile;
})

state.messenger.addMessageHandler("IMPORT_FILE", (acc, ...args) => {
  const files = Array.from(args[0]);
  files.forEach(async (file: File) => {
    if (allowed[fileType(file.name)]) {
      const objectURL = URL.createObjectURL(file);
      switch (fileType(file.name)) {
        case "obj":
          {
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
          }
          break;
        case "stl":
          {
            const result = await(await fetch(objectURL)).text();
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
          }
          break;
        case "dae":
          {
            const result = await(await fetch(objectURL)).text();
            const models = importHandlers.dae(result);
            console.log(models);
          }
          break;

        case "wav":
          {
            try {
              const result = await(await fetch(objectURL)).arrayBuffer();
              const audioContext = new AudioContext();
              audioContext.decodeAudioData(result, (buffer: AudioBuffer) => {
                const channelData = [] as Float32Array[];
                for (let i = 0; i < buffer.numberOfChannels; i++) {
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
          }
          break;
        default:
          break;
      }
    }
  });
});

state.messenger.addMessageHandler(Actions.APP_MOUNTED, ({canvas}) => {
  state.renderer.init(canvas, (cateogry: SettingsCategories) => state.settings[cateogry]);
});


state.messenger.addMessageHandler(Actions.RAYTRACER_SHOULD_PLAY, ({ id }) => {
  if (state.solvers[id] instanceof RayTracer) {
    (state.solvers[id] as RayTracer).isRunning = true;
  }
  return state.solvers[id] && state.solvers[id].running;
});

state.messenger.addMessageHandler(Actions.RAYTRACER_SHOULD_PAUSE, ({ id }) => {
  if (state.solvers[id] instanceof RayTracer) {
    (state.solvers[id] as RayTracer).isRunning = false;
  }
  return state.solvers[id].running;
});

state.messenger.addMessageHandler(Actions.RAYTRACER_SHOULD_CLEAR, ({ id }) => {
  if (state.solvers[id] instanceof RayTracer) {
    (state.solvers[id] as RayTracer).clearRays();
  }
});

state.messenger.addMessageHandler(Actions.FETCH_SURFACES, ({ ids }) => {
  if (ids) {
    const surfaces = ids.map(id => {
      const rooms = state.messenger.postMessage(Actions.FETCH_ROOMS);
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

state.messenger.addMessageHandler(Actions.ASSIGN_MATERIAL, ({ material }) => {
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
      const surfaces = state.messenger.postMessage(Actions.FETCH_SURFACES, { ids: previousAcousticMaterials.map(x => x.uuid) });
      for (let i = 0; i < previousAcousticMaterials.length; i++){
        if (surfaces && surfaces[i].uuid === previousAcousticMaterials[i].uuid) {
          (surfaces[i] as Surface).acousticMaterial = previousAcousticMaterials[i].acousticMaterial;
        }
      }
    }
  })
  if (surfaceCount > 0) {
    state.messenger.postMessage(Actions.SHOW_TOAST, {
      message: `Assigned material to ${surfaceCount} surface${surfaceCount > 1 ? "s" : ""}.`,
      intent: "success",
      timeout: 1750,
      icon: "tick"
    } as IToastProps);
  }
  else {
     state.messenger.postMessage(Actions.SHOW_TOAST, {
       message: `No surfaces are selected.`,
       intent: "warning",
       timeout: 1750,
       icon: "issue"
     } as IToastProps);
  }
});

// for the settings drawer
state.messenger.addMessageHandler(Actions.SETTING_CHANGE, ({ setting, value}) => {
  console.log(setting, value);
  state.renderer.settingChanged(setting, value);
});

// new project
state.messenger.addMessageHandler(Actions.NEW, (acc, ...args) => {
  Object.keys(state.solvers).forEach(x => {
    state.messenger.postMessage(Actions.SHOULD_REMOVE_SOLVER, { id: x });
  })
  Object.keys(state.containers).forEach(x => {
    state.messenger.postMessage(Actions.SHOULD_REMOVE_CONTAINER, { id: x });
  });
  state.messenger.postMessage(Actions.DESELECT_ALL_OBJECTS);
  
});

state.messenger.addMessageHandler(Actions.CAN_UNDO, () => {
  return state.history.canUndo;
})

state.messenger.addMessageHandler(Actions.CAN_REDO, () => {
  return state.history.canRedo;
})

state.messenger.addMessageHandler(Actions.UNDO, (acc, ...args) => {
  state.history.undo();
  return [state.history.canUndo, state.history.canRedo];
})

state.messenger.addMessageHandler(Actions.REDO, (acc, ...args) => {
  state.history.redo();
 return [state.history.canUndo, state.history.canRedo];
})

state.messenger.addMessageHandler(Actions.GET_RENDERER, (acc, ...args) => {
  return state.renderer;
})

state.messenger.addMessageHandler(Actions.SET_EDITOR_MODE, ({mode}) => {
  if (EditorModes[mode]) {
    state.editorMode = EditorModes[mode];
    for (const key in state.containers) {
      state.containers[key].onModeChange(state.editorMode);
    }
    for (const key in state.solvers) {
      state.solvers[key].onModeChange(state.editorMode);
    }
  }
  state.renderer.needsToRender = true;
});

state.messenger.addMessageHandler(Actions.GET_EDITOR_MODE, (acc, ...args) => {
  return state.editorMode;
});

state.messenger.addMessageHandler(Actions.SET_PROCESS, ({ process }) => {
  if (Processes[process]) {
    state.currentProcess = Processes[process];
    state.renderer.currentProcess = state.currentProcess;
    state.renderer.needsToRender = true;
  }
});

state.messenger.addMessageHandler(Actions.GET_PROCESS, () => {
  return state.currentProcess;
});

state.messenger.addMessageHandler(Actions.SHOULD_ADD_SKETCH, () => {
  // state.messenger.postMessage(Actions.PHASE_OUT);
  // state.messenger.postMessage(Actions.SET_PROCESS, Processes.PICKING_SURFACE)
  const selectedObjects = state.messenger.postMessage(Actions.GET_SELECTED_OBJECTS);
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

state.messenger.addMessageHandler(Actions.SHOULD_REMOVE_SKETCH, ({ id }) => {
  if (state.sketches[id]) {
    state.renderer.sketches.remove(state.sketches[id]);
    delete state.sketches[id];
  }
});

state.messenger.addMessageHandler(Actions.SAVE_CONTAINERS, () => {
  const keys = Object.keys(state.containers);
  const saveObjects = keys.map(key => state.containers[key].save());
  return saveObjects;
});

state.messenger.addMessageHandler(Actions.SAVE_SOLVERS, () => {
  const keys = Object.keys(state.solvers);
  const saveObjects = keys.map((key) => state.solvers[key].save());
  return saveObjects;
});

state.messenger.addMessageHandler(Actions.SET_PROJECT_NAME, ({ name }) => {
  state.projectName = name || state.projectName;
  document.title = state.projectName + " | cram.ui";
})

state.messenger.addMessageHandler(Actions.GET_PROJECT_NAME, (acc, ...args) => {
  return state.projectName;
})

state.messenger.addMessageHandler(Actions.RESTORE_CONTAINERS, ({containers}) => {
  const keys = Object.keys(state.containers);
  keys.forEach(key => {
    state.messenger.postMessage(Actions.SHOULD_REMOVE_CONTAINER, {id: key});
  });
  if (containers && containers instanceof Array) {
    // console.log(args[0]);
    
    console.log(containers);
    containers.forEach((saveObj) => {
      switch (saveObj["kind"]) {
        case "source":
          {
            const source = saveObj as SourceProps;
            // const src = new Source("new source", source).restore(saveObj);
            const src = state.messenger.postMessage(Actions.SHOULD_ADD_SOURCE);
            src!.restore(saveObj);
            
            // state.containers[src.uuid] = src;
            // state.sources.push(src.uuid);
            // state.renderer.add(src);
          }
          break;
        case "receiver":
          {
            const receiver = saveObj as ReceiverProps;
            const rec = state.messenger.postMessage(Actions.SHOULD_ADD_RECEIVER);
            rec!.restore(saveObj);
            // state.containers[rec.uuid] = rec;
            // state.sources.push(rec.uuid);
            // state.renderer.add(rec);
          }
          break;
        case "room":
          {
            const surfaces = (saveObj as RoomSaveObject).surfaces.map((surfaceState: SurfaceSaveObject) => {
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
            state.containers[room.uuid] = room;
            state.renderer.addRoom(room);

            state.messenger.postMessage(Actions.ADDED_ROOM, {room});
          }
          break;
        default:
          break;
      }
    });
  }
});

state.messenger.addMessageHandler(Actions.RESTORE_SOLVERS, ({ solvers }) => {
  const keys = Object.keys(state.solvers);
  keys.forEach(key => {
    state.messenger.postMessage(Actions.SHOULD_REMOVE_SOLVER, {id: key});
  });
  if (solvers && solvers instanceof Array) {
    // console.log(args[0]);
    console.log(solvers);
    solvers.forEach((saveObj) => {
      switch (saveObj["kind"]) {
        case "ray-tracer":
          {
            const props = saveObj as RayTracerParams;
            state.messenger.postMessage(Actions.SHOULD_ADD_RAYTRACER, {props});
          }
          break;
        case "rt60":
          {
            const props = saveObj as RT60Props;
            state.messenger.postMessage(Actions.SHOULD_ADD_RT60, {props});
          }
          break;
        default:
          break;
      }
    });
  }
});

state.messenger.addMessageHandler(Actions.SAVE, ({filename, callback}) => {
  const savedState = {
    meta: {
      version: process.env.VERSION,
      name: state.projectName,
      timestamp: new Date().toISOString()
    },
    containers: state.messenger.postMessage(Actions.SAVE_CONTAINERS),
    solvers: state.messenger.postMessage(Actions.SAVE_SOLVERS)
  };
  // console.log(savedState);
  // return;
  const blob = new Blob([JSON.stringify(savedState)], {
    type: "text/plain;charset=utf-8"
  });
  state.projectName = filename || state.projectName;
  FileSaver.saveAs(blob, `${state.projectName}.json`);
  if (callback) {
    callback();
  }
})

state.messenger.addMessageHandler(Actions.OPEN, (acc, ...args) => {
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
      const json = JSON.parse(result);
      state.messenger.postMessage(Actions.RESTORE, { file, json });
     
      tempinput.remove();
    }
    catch (e) {
      console.warn(e);
    }
    
  })
  tempinput.click();
})

state.messenger.addMessageHandler(Actions.RESTORE, ({file, json}) => {
  

  const version = (json.meta && json.meta.version) || "0.0.0";
  if (gte(version, "0.2.1")) {
    console.log(json);
    state.messenger.postMessage(Actions.RESTORE_CONTAINERS, { containers: json.containers });
    state.messenger.postMessage(Actions.RESTORE_SOLVERS, { solvers: json.solvers });
    state.messenger.postMessage(Actions.SET_PROJECT_NAME, { name: json.meta.name });
  } else {
    state.messenger.postMessage(Actions.RESTORE_CONTAINERS, { containers: json });
    state.messenger.postMessage(Actions.SET_PROJECT_NAME, { name: file.name.replace(".json", "") });
  }
})

state.messenger.addMessageHandler(Actions.ADD_SELECTED_OBJECTS_TO_GLOBAL_VARIABLES, (acc, ...args) => {
  const selectedObjects = state.messenger.postMessage(Actions.GET_SELECTED_OBJECTS);
  if (selectedObjects && selectedObjects.length) {
    selectedObjects.forEach((x, i, a) => {
      addToGlobalVars(a[i], a[i].name);
    });
  }
});


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
  addHotKey("shift+g", ["editor"], "ADD_SELECTED_OBJECTS_TO_GLOBAL_VARIABLES")
  addHotKey("escape", ["editor", "editor-moving"], "PHASE_OUT");
  
}

registerHotKeys();

hotkeys.setScope("normal");

window.addEventListener('resize', e => {
  state.renderer.needsToRender = true;
})

export default function GlobalReducer(state, action){
  switch (action.type) {
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((transaction) => transaction.id !== action.payload)
      };
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    default:
      return state;
  }
};



const initialState = {
  messenger: state.messenger
}

// Create context
export const GlobalContext = createContext(initialState);

// Provider component
export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(GlobalReducer, initialState);

  
  
  return (
    <GlobalContext.Provider value={state}>
      {children}
    </GlobalContext.Provider>
  );
};


// the main app
ReactDOM.render(
  <GlobalProvider>
    <App {...state} />
  </GlobalProvider>,
  document.getElementById("root")
);



setTimeout(async () => {
  const filepath = "/res/saves/concord3.json";
  const filename = filepath.split("/").slice(-1)[0];
  const savedStateFetchResult = await fetch(filepath);
  const json = await savedStateFetchResult.json();
  
  state.messenger.postMessage(Actions.RESTORE, { json, file: { name: filename } });

}, 200);




  expose({
    state,
    ac,
    THREE,
    chunk
  });

  state.history.clear();
  
  
