// user interface
import React, { createContext, useReducer } from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { IToastProps } from "@blueprintjs/core";

// command handling
import hotkeys, { HotkeysEvent, KeyHandler } from "hotkeys-js";
import Messenger, { on, emit, messenger } from "./messenger";
import { history, History, Directions, addMoment } from "./history";

// objects
import Container from "./objects/container";
import Model from "./objects/model";
import Source from "./objects/source";
import Receiver from "./objects/receiver";
import Polygon from "./objects/polygon";
import Room from "./objects/room";
import Surface, { SurfaceSaveObject, BufferGeometrySaveObject } from "./objects/surface";
import AudioFile from "./objects/audio-file";
import Sketch from "./objects/sketch";

// compute/solvers
import Solver from "./compute/solver";
import RayTracer from "./compute/raytracer";
import {ImageSourceSolver} from "./compute/raytracer/image-source/index"
import RT60 from "./compute/rt";
import { FDTD_2D, FDTD_2D_Defaults } from "./compute/2d-fdtd";
import * as ac from "./compute/acoustics";

// rendering
import Renderer, { renderer } from "./render/renderer";

// file i/o
import * as importHandlers from "./import-handlers";
import { fileType, allowed } from "./common/file-type";

// data structures / storage
import { uuid } from "uuidv4";
import { KeyValuePair } from "./common/key-value-pair";
import { Setting } from "./setting";
import { defaultSettings, ApplicationSettings, SettingsCategories } from "./default-settings";
import { SettingsManager, StoredSetting } from "./settings-manager";
import { layout as defaultLayout } from "./default-storage";

// constants
import { EditorModes } from "./constants/editor-modes";
import { Processes } from "./constants/processes";

// databases
import materials from "./db/material.json";
import { AcousticMaterial } from "./db/acoustic-material";

// utility
import { Searcher } from "fast-fuzzy";
import browserReport, { Report } from "./common/browser-report";
import { chunk } from "./common/chunk";
import { sizeof } from "./common/sizeof";
import { addToGlobalVars } from "./common/global-vars";
import { gte } from "semver";

import expose from "./common/expose";
import { CSG, CAG } from "@jscad/csg";
import csg from "./compute/csg";
import * as THREE from "three";
import FileSaver from "file-saver";
import { createFileFromData } from "./common/file";
import produce from "immer";

import { useContainer, useSolver } from "./store";

expose({ useSolver, useContainer, produce, on, emit });


import {CLFViewer} from "./objects/CLFViewer";



const materialsIndex = {} as KeyValuePair<AcousticMaterial>;

materials.forEach((x) => {
  materialsIndex[x.uuid] = x;
});

const layout = JSON.parse(localStorage.getItem("layout") || defaultLayout);

export interface State {
  leftPanelInitialSize: number;
  bottomPanelInitialSize: number;
  rightPanelInitialSize: number;
  rightPanelTopInitialSize: number;
  audiofiles: KeyValuePair<AudioFile>;
  time: number;
  selectedObjects: Container[];
  materialsIndex: KeyValuePair<AcousticMaterial>;
  materials: {
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
    uuid: string;
  }[];
  materialSearcher: any;
  sources: string[];
  receivers: string[];
  room: string;
  containers: KeyValuePair<Container>;
  constructions: KeyValuePair<Container>;
  sketches: KeyValuePair<Sketch>;
  solvers: KeyValuePair<Solver>;
  simulation: string;
  renderer: Renderer;
  settings: {
    general: {
      fog_color: Setting<string>;
      default_save_name: Setting<string>;
    };
    editor: {
      transform_snap_fine: Setting<number>;
      transform_snap_normal: Setting<number>;
      transform_snap_coarse: Setting<number>;
    };
    keybindings: {
      SHOW_IMPORT_DIALOG: Setting<string>;
    };
  };
  settingsManagers: KeyValuePair<SettingsManager>;
  editorMode: EditorModes;
  currentProcess: Processes;
  browser: Report;
  projectName: string;
  //clfviewer: CLFViewer;
}


type Version = `${number}.${number}.${number}`;

export interface Cram {
  state: State;
  messenger: Messenger;
  meta: {
    version: Version;
  };
}

export class Cram implements Cram {
  constructor() {
    this.meta = {
      version: "0.2.1"
    }
    this.state = {
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
      settings: defaultSettings as ApplicationSettings,
      settingsManagers: {} as KeyValuePair<SettingsManager>,
      editorMode: EditorModes.OBJECT as EditorModes,
      currentProcess: Processes.NONE as Processes,
      browser: browserReport(navigator.userAgent),
      projectName: defaultSettings.general.default_save_name.value,
      //clfviewer: new CLFViewer(),
    };
    this.messenger = messenger;
  }
}

const cram = new Cram();

expose({
  vars: {},
  cram
});

Object.keys(defaultSettings).map(async (category) => {
  cram.state.settingsManagers[category] = new SettingsManager(
    category,
    defaultSettings[category],
    async () => {
      const settings = (await cram.state.settingsManagers[category].read()) as StoredSetting[];
      settings.forEach((setting) => {
        cram.state.settings[category][setting.id].value = setting.value;
        cram.state.settings[category][setting.id].default_value = setting.default_value;
        cram.state.settings[category][setting.id].setStagedValue(setting.value);
      });
      cram.state.projectName = cram.state.settings.general.default_save_name.value;
    },
    (event) => {
      console.log(event);
    }
  );
});

cram.state.renderer = renderer;

cram.messenger.addMessageHandler("ADD_CONSTRUCTION", (acc, ...args) => {
  if (args && args[0]) {
    const construction = args[0] as Container;
    cram.state.constructions[construction.uuid] = construction;
  }
});

cram.messenger.addMessageHandler("REMOVE_CONSTRUCTION", (acc, id) => {
  if (id) {
    if (cram.state.constructions[id]) {
      delete cram.state.constructions[id];
    }
  }
});

cram.messenger.addMessageHandler("GET_CONSTRUCTIONS", () => {
  return cram.state.constructions;
});

cram.messenger.addMessageHandler("SET_SELECTION", (acc, objects) => {
  cram.messenger.postMessage("DESELECT_ALL_OBJECTS");
  cram.messenger.postMessage("APPEND_SELECTION", objects);
});

cram.messenger.addMessageHandler("DESELECT_ALL_OBJECTS", () => {
  Object.keys(cram.state.containers).forEach((x) => {
    cram.state.containers[x].deselect();
  });
  cram.state.selectedObjects = [] as Container[];
});

cram.messenger.addMessageHandler("APPEND_SELECTION", (acc, objects) => {
  hotkeys.setScope("editor");
  if (objects instanceof Array) {
    for (let i = 0; i < objects.length; i++) {
      if (objects[i] instanceof Container) {
        objects[i].select();
        cram.state.selectedObjects.push(objects[i]);
      }
    }
  }
});


//cram.state.messenger.addMessageHandler("OPEN_CLF_VIEWER", () => {
//  console.log("will open CLF viewer");
//});

//cram.state.messenger.addMessageHandler("CLOSE_CLF_VIEWER", () => {
//  console.log("will close CLF viewer");
//})

cram.messenger.addMessageHandler("GET_SELECTED_OBJECTS", () => {
  return cram.state.selectedObjects;
});

cram.messenger.addMessageHandler("GET_SELECTED_OBJECT_TYPES", () => {
  return cram.state.selectedObjects.map((obj) => obj.kind);
});

cram.messenger.addMessageHandler("FETCH_ROOMS", () => {
  const roomkeys = Object.keys(cram.state.containers).filter((x) => {
    return cram.state.containers[x].kind === "room";
  });
  if (roomkeys && roomkeys.length > 0) {
    return roomkeys.map((x) => cram.state.containers[x] as Room);
  }
});

cram.messenger.addMessageHandler("FETCH_CONTAINER", (acc, ...args) => {
  return args && args[0] && cram.state.containers[args[0]];
});

cram.messenger.addMessageHandler("FETCH_ALL_SETTINGS", () => {
  return cram.state.settings;
});

cram.messenger.addMessageHandler("FETCH_SETTINGS__GENERAL", () => {
  return cram.state.settings.general;
});

cram.messenger.addMessageHandler("FETCH_SETTINGS__EDITOR", () => {
  return cram.state.settings.editor;
});

cram.messenger.addMessageHandler("FETCH_SETTINGS__KEYBINDINGS", () => {
  return cram.state.settings.keybindings;
});

cram.messenger.addMessageHandler("SUBMIT_ALL_SETTINGS", () => {
  for (const key in cram.state.settings) {
    let changedSettings = [] as Setting<number | string | boolean>[];
    for (const subkey in cram.state.settings[key]) {
      if (cram.state.settings[key][subkey].edited) {
        cram.state.settings[key][subkey].submit();
        changedSettings.push(cram.state.settings[key][subkey]);
      }
    }
    if (changedSettings.length > 0) {
      cram.state.settingsManagers[key].update(changedSettings);
    }
  }
  return cram.state.settings;
});

cram.messenger.addMessageHandler("SUBMIT_SETTINGS__GENERAL", () => {
  for (const key in cram.state.settings.general) {
    cram.state.settings.general[key].submit();
  }
  return cram.state.settings;
});

cram.messenger.addMessageHandler("SUBMIT_SETTINGS__EDITOR", () => {
  for (const key in cram.state.settings.editor) {
    cram.state.settings.editor[key].submit();
  }
  return cram.state.settings;
});

cram.messenger.addMessageHandler("FETCH_ALL_MATERIALS", () => {
  return cram.state.materials;
});

cram.messenger.addMessageHandler("SEARCH_ALL_MATERIALS", (acc, ...args) => {
  const res = cram.state.materialSearcher.search(args[0]);
  return res;
});

cram.messenger.addMessageHandler("SHOULD_ADD_RAYTRACER", (acc, ...args) => {
  const props = (args && args[0]) || {};
  const raytracer = new RayTracer({
    ...props[0],
    renderer: cram.state.renderer,
    containers: cram.state.containers
  });
  cram.state.solvers[raytracer.uuid] = raytracer;
  emit("ADD_RAYTRACER", raytracer);

  return raytracer;
});


cram.messenger.addMessageHandler("SHOULD_ADD_IMAGE_SOURCE", () => {
  const imagesource = new ImageSourceSolver({
    renderer: cram.state.renderer, 
    messenger: cram.messenger,
    containers: cram.state.containers
  }); 

  const numsolvers:number = Object.keys(cram.state.solvers).length;

  Object.keys(cram.state.solvers).forEach(function(key) {
    if((cram.state.solvers[key]).kind==="image-source"){
      delete cram.state.solvers[key]; 
    }
  })

  cram.state.solvers[imagesource.uuid] = imagesource; 

  imagesource.test(); 

  return imagesource; 
})

cram.messenger.addMessageHandler("SHOULD_REMOVE_SOLVER", (acc, id) => {
  if (cram.state.solvers && cram.state.solvers[id]) {
    cram.state.solvers[id].dispose();
    delete cram.state.solvers[id];
    emit("REMOVE_RAYTRACER", id);
  }
});

cram.messenger.addMessageHandler("SHOULD_ADD_RT60", (acc, ...args) => {
  const props = (args && args[0]) || {};
  const rt60 = new RT60({
    ...props
  });
  cram.state.solvers[rt60.uuid] = rt60;
  emit("ADD_RT60", rt60);
  return cram.state.solvers[rt60.uuid];
});

cram.messenger.addMessageHandler("SHOULD_ADD_FDTD_2D", (acc, args) => {
  const defaults = FDTD_2D_Defaults;
  const selection = cram.messenger.postMessage("GET_SELECTED_OBJECTS")[0];
  let width = (args && args.width) || defaults.width;
  let height = (args && args.height) || defaults.height;
  let offsetX = 0;
  let offsetY = 0;
  let cellSize = (args && args.cellSize) || Math.max(width, height) / 128;
  const sources = [] as Source[];
  const receivers = [] as Receiver[];
  const surfaces = [] as Surface[];
  let surface = undefined as Surface | undefined;
  if (selection.length > 0) {
    selection.forEach((obj) => {
      switch (obj.kind) {
        case "source":
          {
            sources.push(obj);
          }
          break;
        case "receiver":
          {
            receivers.push(obj);
          }
          break;
        case "surface":
          {
            surfaces.push(obj);
          }
          break;
        default:
          break;
      }
    });
    if (surfaces.length > 0) {
      surface = surfaces.length > 1 ? surfaces[0].mergeSurfaces(surfaces) : surfaces[0];
      const { max, min } = surface.mesh.geometry.boundingBox;
      width = max.x - min.x;
      height = max.y - min.y;
      offsetX = min.x;
      offsetY = min.y;
    }
  }
  const fdtd2d = new FDTD_2D({
    messenger: cram.messenger,
    renderer: cram.state.renderer,
    width,
    height,
    offsetX,
    offsetY,
    cellSize
  });
  fdtd2d.name = "FDTD-2D";
  if (surface) {
    fdtd2d.addWallsFromSurfaceEdges(surface);
  }
  if (sources.length > 0) {
    sources.forEach((src) => fdtd2d.addSource(src));
  }
  if (receivers.length > 0) {
    receivers.forEach((rec) => fdtd2d.addReceiver(rec));
  }
  cram.state.solvers[fdtd2d.uuid] = fdtd2d;

  return cram.state.solvers[fdtd2d.uuid];
});

cram.messenger.addMessageHandler("RAYTRACER_CALCULATE_RESPONSE", (acc, id, frequencies) => {
  cram.state.solvers[id] instanceof RayTracer &&
    (cram.state.solvers[id] as RayTracer).calculateReflectionLoss(frequencies);
});

cram.messenger.addMessageHandler("RAYTRACER_QUICK_ESTIMATE", (acc, id) => {
  cram.state.solvers[id] instanceof RayTracer && (cram.state.solvers[id] as RayTracer).startQuickEstimate();
});

cram.messenger.addMessageHandler("FETCH_ALL_SOURCES", (acc, ...args) => {
  return cram.state.sources.map((x) => {
    if (args && args[0] && args[0] instanceof Array) {
      return args[0].map((y) => cram.state.containers[x][y]);
    } else return cram.state.containers[x];
  });
});

cram.messenger.addMessageHandler("FETCH_ALL_SOURCES_AS_MAP", () => {
  const sourcemap = new Map<string, Source>();
  for (let i = 0; i < cram.state.sources.length; i++) {
    sourcemap.set(cram.state.sources[i], cram.state.containers[cram.state.sources[i]] as Source);
  }
  return sourcemap;
});

cram.messenger.addMessageHandler("FETCH_ALL_RECEIVERS", (acc, ...args) => {
  return cram.state.receivers.map((x) => {
    if (args && args[0] && args[0] instanceof Array) {
      return args[0].map((y) => cram.state.containers[x][y]);
    } else return cram.state.containers[x];
  });
});

cram.messenger.addMessageHandler("FETCH_SOURCE", (acc, ...args) => {
  return cram.state.containers[args[0]];
});

cram.messenger.addMessageHandler("SHOULD_ADD_SOURCE", (acc, ...args) => {
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
    } else {
      source.name = args[0].name + "-copy";
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
  };
  cram.state.containers[source.uuid] = source;
  cram.state.sources.push(source.uuid);
  cram.state.renderer.add(source);
  emit("ADD_SOURCE", source);
  Object.keys(cram.state.solvers).forEach((x) => {
    cram.state.solvers[x] instanceof RayTracer && (cram.state.solvers[x] as RayTracer).addSource(source);
  });

  if (shouldAddMoment) {
    addMoment({
      category: "SHOULD_ADD_SOURCE",
      objectId: source.uuid,
      recallFunction: (direction: keyof Directions) => {
        if (direction === "UNDO") {
          cram.messenger.postMessage("SHOULD_REMOVE_CONTAINER", staticSource.uuid);
        } else if (direction === "REDO") {
          cram.messenger.postMessage("SHOULD_ADD_SOURCE", staticSource, false);
        }
      }
    });
  }

  return source;
});

cram.messenger.addMessageHandler("SHOULD_REMOVE_CONTAINER", (acc, id) => {
  if (cram.state.containers[id]) {
    switch (cram.state.containers[id].kind) {
      case "source":
        {
          cram.state.sources = cram.state.sources.reduce((a, b) => {
            if (b !== id) {
              a.push(b);
            }
            return a;
          }, [] as string[]);
        }
        break;
      case "receiver":
        {
          cram.state.receivers = cram.state.receivers.reduce((a, b) => {
            if (b !== id) {
              a.push(b);
            }
            return a;
          }, [] as string[]);
        }
        break;
    }
    cram.state.selectedObjects = cram.state.selectedObjects.filter((x) => x.uuid !== id);
    cram.state.renderer.remove(cram.state.containers[id]);
    delete cram.state.containers[id];
  }
});

cram.messenger.addMessageHandler("SHOULD_ADD_RECEIVER", (acc, ...args) => {
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
  cram.state.containers[rec.uuid] = rec;
  cram.state.receivers.push(rec.uuid);
  cram.state.renderer.add(rec);
  emit("ADD_RECEIVER", rec);
  Object.keys(cram.state.solvers).forEach((x) => {
    cram.state.solvers[x] instanceof RayTracer && (cram.state.solvers[x] as RayTracer).addReceiver(rec);
  });

  if (shouldAddMoment) {
    addMoment({
      category: "SHOULD_ADD_RECEIVER",
      objectId: rec.uuid,
      recallFunction: (direction: keyof Directions) => {
        if (direction === "UNDO") {
          cram.messenger.postMessage("SHOULD_REMOVE_CONTAINER", staticRec.uuid);
        } else if (direction === "REDO") {
          cram.messenger.postMessage("SHOULD_ADD_RECEIVER", staticRec, false);
        }
      }
    });
  }

  return rec;
});

cram.messenger.addMessageHandler("SHOULD_DUPLICATE_SELECTED_OBJECTS", () => {
  const objs = [] as Container[];
  const selection = cram.messenger.postMessage("GET_SELECTED_OBJECTS")[0];
  if (selection && selection.length > 0) {
    for (let i = 0; i < selection.length; i++) {
      switch (selection[i].kind) {
        case "source":
          {
            objs.push(cram.messenger.postMessage("SHOULD_ADD_SOURCE", selection[i], true)[0]);
          }
          break;
        case "receiver":
          {
            objs.push(cram.messenger.postMessage("SHOULD_ADD_RECEIVER", selection[i], true)[0]);
          }
          break;
        default:
          break;
      }
    }
  }

  cram.messenger.postMessage("SET_SELECTION", objs);
});

cram.messenger.addMessageHandler("GET_CONTAINERS", () => {
  return cram.state.containers;
});

cram.messenger.addMessageHandler("ADDED_ROOM", (acc, ...args) => {
  args[0];
});
cram.messenger.addMessageHandler("ADDED_MODEL", (acc, ...args) => {
  args[0];
});

cram.messenger.addMessageHandler("ADDED_AUDIO_FILE", (acc, args) => {
  const audiofile = args[0] as AudioFile;
  cram.state.audiofiles[audiofile.uuid] = audiofile;
});

cram.messenger.addMessageHandler("IMPORT_FILE", (acc, ...args) => {
  const files = Array.from(args[0]);
  files.forEach(async (file: File) => {
    if (allowed[fileType(file.name)]) {
      const objectURL = URL.createObjectURL(file);
      switch (fileType(file.name)) {
        case "obj":
          {
            const result = await (await fetch(objectURL)).text();
            const models = importHandlers.obj(result);
            const surfaces = models.map(
              (model) =>
                new Surface(model.name, {
                  geometry: model.geometry,
                  acousticMaterial: cram.state.materials[0]
                })
            );
            const room = new Room("new room", {
              surfaces,
              originalFileName: file.name,
              originalFileData: result
            });
            cram.state.containers[room.uuid] = room;
            cram.state.room = room.uuid;
            cram.state.renderer.addRoom(room);
            cram.messenger.postMessage("ADDED_ROOM", room);
          }
          break;
        case "stl":
          {
            // const result = await (await fetch(objectURL)).text();
            const binary = await(await fetch(objectURL)).arrayBuffer();
            // console.log(result);
            const geom = importHandlers.stl2(binary);
            const model = new Model("new model", { bufferGeometry: geom });
            cram.state.containers[model.uuid] = model;
            cram.state.renderer.addModel(model);
            cram.messenger.postMessage("ADDED_MODEL", model);

            // const surfaces = importHandlers.stl(binary).map(
            //   (model) =>
            //     new Surface(model.name, {
            //       geometry: model.geometry,
            //       acousticMaterial: cram.state.materials[0]
            //     })
            // );
            // const room = new Room("new room", {
            //   surfaces,
            //   originalFileName: file.name,
            //   originalFileData: result
            // });
            // cram.state.containers[room.uuid] = room;
            // cram.state.room = room.uuid;
            // cram.state.renderer.addRoom(room);
            // cram.messenger.postMessage("ADDED_ROOM", room);
          }
          break;
        case "dae":
          {
            const result = await (await fetch(objectURL)).text();
            const models = importHandlers.dae(result);
            console.log(models);
          }
          break;

        case "wav":
          {
            try {
              const result = await (await fetch(objectURL)).arrayBuffer();
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
                cram.messenger.postMessage("ADDED_AUDIO_FILE", audioFile);
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

cram.messenger.addMessageHandler("APP_MOUNTED", (acc, ...args) => {
  cram.state.renderer.init(args[0], (cateogry: SettingsCategories) => cram.state.settings[cateogry]);
});

cram.messenger.addMessageHandler("RENDERER_UPDATED", () => {
  cram.state.time += 0.01666666667;
  if (cram.state.simulation.length > 0) {
    cram.state.solvers[cram.state.simulation].update();
  }
  if (cram.state.selectedObjects.length > 0) {
    cram.state.selectedObjects.forEach((x) => {
      x.renderCallback(cram.state.time);
    });
  }
});

cram.messenger.addMessageHandler("RAYTRACER_SHOULD_PLAY", (acc, ...args) => {
  if (cram.state.solvers[args[0]] instanceof RayTracer) {
    (cram.state.solvers[args[0]] as RayTracer).isRunning = true;
  }
  return cram.state.solvers[args[0]] && cram.state.solvers[args[0]].running;
});

cram.messenger.addMessageHandler("RAYTRACER_SHOULD_PAUSE", (acc, ...args) => {
  if (cram.state.solvers[args[0]] instanceof RayTracer) {
    (cram.state.solvers[args[0]] as RayTracer).isRunning = false;
  }
  return cram.state.solvers[args[0]].running;
});

cram.messenger.addMessageHandler("RAYTRACER_SHOULD_CLEAR", (acc, ...args) => {
  if (cram.state.solvers[args[0]] instanceof RayTracer) {
    (cram.state.solvers[args[0]] as RayTracer).clearRays();
  }
});

cram.messenger.addMessageHandler("FETCH_SURFACES", (acc, ...args) => {
  let ids = args[0];
  if (typeof ids === "string") {
    ids = [ids];
  }
  if (ids) {
    const surfaces = ids
      .map((id) => {
        const rooms = cram.messenger.postMessage("FETCH_ROOMS")[0];
        if (rooms && rooms.length > 0) {
          for (let i = 0; i < rooms.length; i++) {
            const room = rooms[i] as Room;
            const surface = room.surfaces.getObjectByProperty("uuid", id);
            if (surface && surface instanceof Surface) {
              return surface;
            }
          }
        }
        return null;
      })
      .filter((x) => x);
    return surfaces;
  }
});

cram.messenger.addMessageHandler("ASSIGN_MATERIAL", (acc, material) => {
  let surfaceCount = 0;
  const previousAcousticMaterials = [] as Array<{ uuid: string; acousticMaterial: AcousticMaterial }>;
  for (let i = 0; i < cram.state.selectedObjects.length; i++) {
    if (cram.state.selectedObjects[i] instanceof Surface) {
      previousAcousticMaterials.push({
        uuid: cram.state.selectedObjects[i].uuid,
        acousticMaterial: (cram.state.selectedObjects[i] as Surface).acousticMaterial
      });
      (cram.state.selectedObjects[i] as Surface).acousticMaterial = material;
      surfaceCount++;
    }
  }
  addMoment({
    category: "ASSIGN_MATERIAL",
    objectId: uuid(),
    recallFunction: () => {
      const surfaces = cram.messenger.postMessage(
        "FETCH_SURFACES",
        previousAcousticMaterials.map((x) => x.uuid)
      )[0];
      for (let i = 0; i < previousAcousticMaterials.length; i++) {
        if (surfaces[i].uuid === previousAcousticMaterials[i].uuid) {
          (surfaces[i] as Surface).acousticMaterial = previousAcousticMaterials[i].acousticMaterial;
        }
      }
    }
  });
  if (surfaceCount > 0) {
    cram.messenger.postMessage("SHOW_TOAST", {
      message: `Assigned material to ${surfaceCount} surface${surfaceCount > 1 ? "s" : ""}.`,
      intent: "success",
      timeout: 1750,
      icon: "tick"
    } as IToastProps);
  } else {
    cram.messenger.postMessage("SHOW_TOAST", {
      message: `No surfaces are selected.`,
      intent: "warning",
      timeout: 1750,
      icon: "issue"
    } as IToastProps);
  }
});

// for the settings drawer
cram.messenger.addMessageHandler("SETTING_CHANGE", (acc, ...args) => {
  const { setting, value } = args[0];
  console.log(setting, value);
  cram.state.renderer.settingChanged(setting, value);
});

// new project
cram.messenger.addMessageHandler("NEW", () => {
  Object.keys(cram.state.solvers).forEach((x) => {
    cram.messenger.postMessage("SHOULD_REMOVE_SOLVER", x);
  });
  Object.keys(cram.state.containers).forEach((x) => {
    cram.messenger.postMessage("SHOULD_REMOVE_CONTAINER", x);
  });
  cram.messenger.postMessage("DESELECT_ALL_OBJECTS");
});

cram.messenger.addMessageHandler("CAN_UNDO", () => {
  return history.canUndo;
});

cram.messenger.addMessageHandler("CAN_REDO", () => {
  return history.canRedo;
});

cram.messenger.addMessageHandler("UNDO", () => {
  history.undo();
  return [history.canUndo, history.canRedo];
});

cram.messenger.addMessageHandler("REDO", () => {
  history.redo();
  return [history.canUndo, history.canRedo];
});

cram.messenger.addMessageHandler("GET_RENDERER", () => {
  return cram.state.renderer;
});

cram.messenger.addMessageHandler("SET_EDITOR_MODE", (acc, ...args) => {
  if (EditorModes[args[0]]) {
    cram.state.editorMode = EditorModes[args[0]];
    for (const key in cram.state.containers) {
      cram.state.containers[key].onModeChange(cram.state.editorMode);
    }
    for (const key in cram.state.solvers) {
      cram.state.solvers[key].onModeChange(cram.state.editorMode);
    }
  }
  cram.state.renderer.needsToRender = true;
});

cram.messenger.addMessageHandler("GET_EDITOR_MODE", () => {
  return cram.state.editorMode;
});

cram.messenger.addMessageHandler("SET_PROCESS", (acc, ...args) => {
  if (Processes[args[0]]) {
    cram.state.currentProcess = Processes[args[0]];
    cram.state.renderer.currentProcess = cram.state.currentProcess;
    cram.state.renderer.needsToRender = true;
  }
});

cram.messenger.addMessageHandler("GET_PROCESS", () => {
  return cram.state.currentProcess;
});

cram.messenger.addMessageHandler("SHOULD_ADD_SKETCH", () => {
  // cram.messenger.postMessage("PHASE_OUT");
  // cram.messenger.postMessage("SET_PROCESS", Processes.PICKING_SURFACE)
  const selectedObjects = cram.messenger.postMessage("GET_SELECTED_OBJECTS")[0];
  if (selectedObjects && selectedObjects[selectedObjects.length - 1]) {
    const surface = selectedObjects[selectedObjects.length - 1];
    if (surface instanceof Surface) {
      const sketch = new Sketch({
        normal: surface._triangles[0].getNormal(new THREE.Vector3()),
        point: surface.center
      });
      cram.state.sketches[sketch.uuid] = sketch;
      cram.state.renderer.sketches.add(cram.state.sketches[sketch.uuid]);
    }
  }
});

cram.messenger.addMessageHandler("SHOULD_REMOVE_SKETCH", (acc, id) => {
  if (cram.state.sketches[id]) {
    cram.state.renderer.sketches.remove(cram.state.sketches[id]);
    delete cram.state.sketches[id];
  }
});

cram.messenger.addMessageHandler("SAVE_CONTAINERS", () => {
  const keys = Object.keys(cram.state.containers);
  const saveObjects = keys.map((key) => cram.state.containers[key].save());
  return saveObjects;
});

cram.messenger.addMessageHandler("SAVE_SOLVERS", () => {
  const keys = Object.keys(cram.state.solvers);
  const saveObjects = keys.map((key) => cram.state.solvers[key].save());
  return saveObjects;
});

cram.messenger.addMessageHandler("SET_PROJECT_NAME", (acc, ...args) => {
  cram.state.projectName = (args && args[0]) || cram.state.projectName;
  document.title = cram.state.projectName + " | cram.ui";
});

cram.messenger.addMessageHandler("GET_PROJECT_NAME", () => {
  return cram.state.projectName;
});

cram.messenger.addMessageHandler("RESTORE_CONTAINERS", (acc, ...args) => {
  const keys = Object.keys(cram.state.containers);
  keys.forEach((key) => {
    cram.messenger.postMessage("SHOULD_REMOVE_CONTAINER", key);
  });
  if (args && args[0] && args[0] instanceof Array) {
    // console.log(args[0]);
    console.log(args[0]);
    args[0].forEach((saveObj) => {
      switch (saveObj["kind"]) {
        case "source":
          {
            const src = new Source("new source", { ...saveObj }).restore(saveObj);
            cram.messenger.postMessage("SHOULD_ADD_SOURCE", src, false);
            // cram.state.containers[src.uuid] = src;
            // cram.state.sources.push(src.uuid);
            // cram.state.renderer.add(src);
          }
          break;
        case "receiver":
          {
            const rec = new Receiver("new receiver", { ...saveObj }).restore(saveObj);
            cram.messenger.postMessage("SHOULD_ADD_RECEIVER", rec, false);
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

            cram.messenger.postMessage("ADDED_ROOM", room);
          }
          break;
        default:
          break;
      }
    });
  }
});

cram.messenger.addMessageHandler("RESTORE_SOLVERS", (acc, ...args) => {
  const keys = Object.keys(cram.state.solvers);
  keys.forEach((key) => {
    cram.messenger.postMessage("SHOULD_REMOVE_SOLVER", key);
  });
  if (args && args[0] && args[0] instanceof Array) {
    // console.log(args[0]);
    console.log(args[0]);
    args[0].forEach((saveObj) => {
      switch (saveObj["kind"]) {
        case "ray-tracer":
          {
            const props = args && args[0];
            cram.messenger.postMessage("SHOULD_ADD_RAYTRACER", props);
          }
          break;
        case "rt60":
          {
            const props = args && args[0];
            cram.messenger.postMessage("SHOULD_ADD_RT60", props);
          }
          break;
        default:
          break;
      }
    });
  }
});

cram.messenger.addMessageHandler("SAVE", (acc, ...args) => {
  const savedState = {
    meta: {
      version: cram.meta.version,
      name: cram.state.projectName,
      timestamp: new Date().toISOString()
    },
    containers: cram.messenger.postMessage("SAVE_CONTAINERS")[0],
    solvers: cram.messenger.postMessage("SAVE_SOLVERS")[0]
  };
  // console.log(savedState);
  // return;
  const blob = new Blob([JSON.stringify(savedState)], {
    type: "text/plain;charset=utf-8"
  });
  cram.state.projectName = (args && args[0] && args[0].filename) || cram.state.projectName;
  FileSaver.saveAs(blob, `${cram.state.projectName}.json`);
  if (args && args[0] && args[0].callback) {
    args[0].callback();
  }
});

cram.messenger.addMessageHandler("OPEN", () => {
  const tempinput = document.createElement("input");
  tempinput.type = "file";
  tempinput.accept = "application/json";
  tempinput.setAttribute("style", "display: none");
  document.body.appendChild(tempinput);
  tempinput.addEventListener("change", async (e) => {
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
      cram.messenger.postMessage("RESTORE", { file, json });

      tempinput.remove();
    } catch (e) {
      console.warn(e);
    }
  });
  tempinput.click();
});

cram.messenger.addMessageHandler("RESTORE", (acc, ...args) => {
  const props = args && args[0];
  const file = props.file;
  const json = props.json;
  const version = (json.meta && json.meta.version) || "0.0.0";
  console.log(version);
  if (gte(version, "0.2.1")) {
    cram.messenger.postMessage("RESTORE_CONTAINERS", json.containers);
    cram.messenger.postMessage("RESTORE_SOLVERS", json.solvers);
    cram.messenger.postMessage("SET_PROJECT_NAME", json.meta.name);
  } else {
    cram.messenger.postMessage("RESTORE_CONTAINERS", json);
    cram.messenger.postMessage("SET_PROJECT_NAME", file.name.replace(".json", ""));
  }
});

cram.messenger.addMessageHandler("ADD_SELECTED_OBJECTS_TO_GLOBAL_VARIABLES", () => {
  const selectedObjects = cram.messenger.postMessage("GET_SELECTED_OBJECTS")[0];
  if (selectedObjects && selectedObjects.length) {
    selectedObjects.forEach((x, i, a) => {
      addToGlobalVars(a[i], a[i].name);
    });
  }
});

function addHotKey(keybinding, scopes, message, ...args) {
  scopes.forEach((scope) => {
    hotkeys(keybinding, scope, () => void cram.messenger.postMessage(message, args));
  });
}

function registerHotKeys() {
  addHotKey("ctrl+i, command+i", ["normal", "editor"], "SHOW_IMPORT_DIALOG");
  addHotKey("shift+m", ["normal", "editor"], "TOGGLE_MATERIAL_SEARCH");
  addHotKey("shift+n", ["normal", "editor"], "SHOW_NEW_WARNING");
  addHotKey("shift+o", ["normal", "editor"], "TOGGLE_CAMERA_ORTHO");
  addHotKey("ctrl+shift+f, command+shift+f", ["normal", "editor", "editor-moving"], "TOGGLE_FULLSCREEN");
  addHotKey("ctrl+z, command+z", ["normal", "editor"], "UNDO");
  addHotKey("ctrl+shift+z, command+shift+z", ["normal", "editor"], "REDO");

  addHotKey("m", ["editor"], "MOVE_SELECTED_OBJECTS");
  addHotKey("f", ["editor"], "FOCUS_ON_SELECTED_OBJECTS");
  addHotKey("shift+f", ["editor"], "FOCUS_ON_CURSOR");
  addHotKey("shift+g", ["editor"], "ADD_SELECTED_OBJECTS_TO_GLOBAL_VARIABLES");
  addHotKey("escape", ["editor", "editor-moving"], "PHASE_OUT");
}

registerHotKeys();

hotkeys.setScope("normal");

window.addEventListener("resize", () => {
  cram.state.renderer.needsToRender = true;
});

async function finishedLoading() {
  const filepath = "/res/saves/concord.json";
  const filename = filepath.slice(filepath.lastIndexOf("/") + 1);
  const filedata = await(await fetch(filepath)).text();
  const json = JSON.parse(filedata);
  const file = createFileFromData(filename, [filedata]);

  cram.messenger.postMessage("RESTORE", { file, json });

  expose({
    sizeof,
    Container,
    r: cram.state.renderer,
    Polygon,
    Sketch,
    CSG,
    CAG,
    csg,
    ac,
    THREE,
    chunk
  });
}

// the main app
ReactDOM.render(
  <App {...cram.state} />,
  document.getElementById("root"),
  finishedLoading
);

history.clear();
