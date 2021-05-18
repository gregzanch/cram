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
import {ImageSourceSolver, ImageSourceSolverParams} from "./compute/raytracer/image-source/index"
import RT60, { RT60Props } from "./compute/rt";
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
import produce, { enableMapSet } from "immer";
import {omit} from './common/helpers'
import { useContainer, useSolver, useResult, useAppStore, useMaterial, SaveState } from "./store";
import { audioEngine } from './audio-engine/audio-engine';
enableMapSet();



expose({ omit, Container, audioEngine, useSolver, useContainer, useResult, useAppStore, useMaterial, produce, on, emit });

import examples from './examples';
import chroma from 'chroma-js';
import EnergyDecay from "./compute/energy-decay";

import registerAllEvents from './events';

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
  containers: KeyValuePair<Container>;
  constructions: KeyValuePair<Container>;
  sketches: KeyValuePair<Sketch>;
  solvers: KeyValuePair<Solver>;
  renderer: Renderer;
  editorMode: EditorModes;
  currentProcess: Processes;
  browser: Report;
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

      containers: {} as KeyValuePair<Container>,
      constructions: {} as KeyValuePair<Container>,
      sketches: {} as KeyValuePair<Sketch>,
      solvers: {} as KeyValuePair<Solver>,
      renderer: {} as Renderer,
      editorMode: EditorModes.OBJECT as EditorModes,
      currentProcess: Processes.NONE as Processes,
      browser: browserReport(navigator.userAgent),
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

cram.state.renderer = renderer;

messenger.addMessageHandler("GET_SELECTED_OBJECTS", () => {
  return cram.state.selectedObjects;
});

messenger.addMessageHandler("GET_SELECTED_OBJECT_TYPES", () => {
  return cram.state.selectedObjects.map((obj) => obj.kind);
});

messenger.addMessageHandler("FETCH_ROOMS", () => {
  const roomkeys = Object.keys(cram.state.containers).filter((x) => {
    return cram.state.containers[x].kind === "room";
  });
  if (roomkeys && roomkeys.length > 0) {
    return roomkeys.map((x) => cram.state.containers[x] as Room);
  }
});

messenger.addMessageHandler("FETCH_CONTAINER", (acc, ...args) => {
  return args && args[0] && cram.state.containers[args[0]];
});


messenger.addMessageHandler("FETCH_ALL_MATERIALS", () => {
  return cram.state.materials;
});

messenger.addMessageHandler("SEARCH_ALL_MATERIALS", (acc, ...args) => {
  const res = cram.state.materialSearcher.search(args[0]);
  return res;
});

messenger.addMessageHandler("SHOULD_ADD_RAYTRACER", (acc, ...args) => {
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



messenger.addMessageHandler("SHOULD_ADD_IMAGE_SOURCE", (acc, ...args) => {
  const defaults: ImageSourceSolverParams = {
    name: "Image Source",
    roomID: "",
    sourceIDs: [] as string[],
    surfaceIDs: [] as string[],
    receiverIDs: [] as string[],
    maxReflectionOrder: 2,
    imageSourcesVisible: false,
    rayPathsVisible: true, 
    plotOrders: [0, 1, 2],
    frequencies: [125,250,500,1000,2000,4000,8000],
  };
  const imagesource = new ImageSourceSolver(defaults); 
  cram.state.solvers[imagesource.uuid] = imagesource; 
  emit("ADD_IMAGESOURCE",imagesource);
  return imagesource; 
});

messenger.addMessageHandler("SHOULD_REMOVE_SOLVER", (acc, id) => {
  if (cram.state.solvers && cram.state.solvers[id]) {
    cram.state.solvers[id].dispose();
    delete cram.state.solvers[id];
    emit("REMOVE_RAYTRACER", id);
  }
});

messenger.addMessageHandler("SHOULD_ADD_RT60", (acc, ...args) => {
  const rt60 = new RT60(); 
  cram.state.solvers[rt60.uuid] = rt60;
  emit("ADD_RT60", rt60);
  return rt60; 
});

messenger.addMessageHandler("SHOULD_ADD_ENERGYDECAY", (acc, ...args) => {
  const ed = new EnergyDecay(); 
  cram.state.solvers[ed.uuid] = ed;
  emit("ADD_ENERGYDECAY", ed);
  return ed; 
});

messenger.addMessageHandler("RAYTRACER_CALCULATE_RESPONSE", (acc, id, frequencies) => {
  cram.state.solvers[id] instanceof RayTracer &&
    (cram.state.solvers[id] as RayTracer).calculateReflectionLoss(frequencies);
});

messenger.addMessageHandler("RAYTRACER_QUICK_ESTIMATE", (acc, id) => {
  cram.state.solvers[id] instanceof RayTracer && (cram.state.solvers[id] as RayTracer).startQuickEstimate();
});

messenger.addMessageHandler("FETCH_ALL_SOURCES", (acc, ...args) => {
  return cram.state.sources.map((x) => {
    if (args && args[0] && args[0] instanceof Array) {
      return args[0].map((y) => cram.state.containers[x][y]);
    } else return cram.state.containers[x];
  });
});

messenger.addMessageHandler("FETCH_ALL_SOURCES_AS_MAP", () => {
  const sourcemap = new Map<string, Source>();
  for (let i = 0; i < cram.state.sources.length; i++) {
    sourcemap.set(cram.state.sources[i], cram.state.containers[cram.state.sources[i]] as Source);
  }
  return sourcemap;
});

messenger.addMessageHandler("FETCH_ALL_RECEIVERS", (acc, ...args) => {
  return cram.state.receivers.map((x) => {
    if (args && args[0] && args[0] instanceof Array) {
      return args[0].map((y) => cram.state.containers[x][y]);
    } else return cram.state.containers[x];
  });
});

messenger.addMessageHandler("FETCH_SOURCE", (acc, ...args) => {
  return cram.state.containers[args[0]];
});





messenger.addMessageHandler("SHOULD_ADD_SOURCE", (acc, ...args) => {
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
          messenger.postMessage("SHOULD_REMOVE_CONTAINER", staticSource.uuid);
        } else if (direction === "REDO") {
          messenger.postMessage("SHOULD_ADD_SOURCE", staticSource, false);
        }
      }
    });
  }

  return source;
});

messenger.addMessageHandler("SHOULD_REMOVE_CONTAINER", (acc, id) => {
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

messenger.addMessageHandler("SHOULD_ADD_RECEIVER", (acc, ...args) => {
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
          messenger.postMessage("SHOULD_REMOVE_CONTAINER", staticRec.uuid);
        } else if (direction === "REDO") {
          messenger.postMessage("SHOULD_ADD_RECEIVER", staticRec, false);
        }
      }
    });
  }

  return rec;
});

messenger.addMessageHandler("SHOULD_DUPLICATE_SELECTED_OBJECTS", () => {
  const objs = [] as Container[];
  const selection = messenger.postMessage("GET_SELECTED_OBJECTS")[0];
  if (selection && selection.length > 0) {
    for (let i = 0; i < selection.length; i++) {
      switch (selection[i].kind) {
        case "source":
          {
            objs.push(messenger.postMessage("SHOULD_ADD_SOURCE", selection[i], true)[0]);
          }
          break;
        case "receiver":
          {
            objs.push(messenger.postMessage("SHOULD_ADD_RECEIVER", selection[i], true)[0]);
          }
          break;
        default:
          break;
      }
    }
  }

  messenger.postMessage("SET_SELECTION", objs);
});

messenger.addMessageHandler("GET_CONTAINERS", () => {
  return cram.state.containers;
});

messenger.addMessageHandler("ADDED_ROOM", (acc, ...args) => {
  args[0];
});
messenger.addMessageHandler("ADDED_MODEL", (acc, ...args) => {
  args[0];
});

messenger.addMessageHandler("ADDED_AUDIO_FILE", (acc, args) => {
  const audiofile = args[0] as AudioFile;
  cram.state.audiofiles[audiofile.uuid] = audiofile;
});

messenger.addMessageHandler("IMPORT_FILE", (acc, ...args) => {
  const files = Array.from(args[0]);
  files.forEach(async (file: File) => {
    if (allowed[fileType(file.name)]) {
      const objectURL = URL.createObjectURL(file);
      switch (fileType(file.name)) {
        case "dxf": 
        {
          const result = await (await fetch(objectURL)).text();
          const room = importHandlers.dxf(result);
          emit("ADD_ROOM", room);
          console.log(room);
        } break;
        case "obj":
          {
            const result = await (await fetch(objectURL)).text();
            const models = importHandlers.obj(result);
            console.log(models);
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
            cram.state.renderer.addRoom(room);
            emit("ADD_ROOM", room);
            messenger.postMessage("ADDED_ROOM", room);
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
            messenger.postMessage("ADDED_MODEL", model);

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
            // messenger.postMessage("ADDED_ROOM", room);
          }
          break;
        case "dae":
          {
            const result = await (await fetch(objectURL)).text();
            const models = importHandlers.dae(result);
            console.log(models);
          }
          break;
        
        case "3ds":
          {
            console.log("load 3ds")
            const result = await (await fetch(objectURL)).arrayBuffer(); 
            const models = importHandlers.tds(result);
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
                messenger.postMessage("ADDED_AUDIO_FILE", audioFile);
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

messenger.addMessageHandler("APP_MOUNTED", (acc, ...args) => {
  cram.state.renderer.init(args[0]);
});

messenger.addMessageHandler("RENDERER_UPDATED", () => {
  cram.state.time += 0.01666666667;
  if (cram.state.selectedObjects.length > 0) {
    cram.state.selectedObjects.forEach((x) => {
      x.renderCallback(cram.state.time);
    });
  }
});

messenger.addMessageHandler("RAYTRACER_SHOULD_PLAY", (acc, ...args) => {
  if (cram.state.solvers[args[0]] instanceof RayTracer) {
    (cram.state.solvers[args[0]] as RayTracer).isRunning = true;
  }
  return cram.state.solvers[args[0]] && cram.state.solvers[args[0]].running;
});

messenger.addMessageHandler("RAYTRACER_SHOULD_PAUSE", (acc, ...args) => {
  if (cram.state.solvers[args[0]] instanceof RayTracer) {
    (cram.state.solvers[args[0]] as RayTracer).isRunning = false;
  }
  return cram.state.solvers[args[0]].running;
});

messenger.addMessageHandler("RAYTRACER_SHOULD_CLEAR", (acc, ...args) => {
  if (cram.state.solvers[args[0]] instanceof RayTracer) {
    (cram.state.solvers[args[0]] as RayTracer).clearRays();
  }
});

messenger.addMessageHandler("FETCH_SURFACES", (acc, ...args) => {
  let ids = args[0];
  if (typeof ids === "string") {
    ids = [ids];
  }
  if (ids) {
    const surfaces = ids
      .map((id) => {
        const rooms = messenger.postMessage("FETCH_ROOMS")[0];
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

messenger.addMessageHandler("ASSIGN_MATERIAL", (acc, material) => {
  let surfaceCount = 0;
  const previousAcousticMaterials = [] as Array<{ uuid: string; acousticMaterial: AcousticMaterial }>;
  for (let i = 0; i < cram.state.selectedObjects.length; i++) {
    if (cram.state.selectedObjects[i] instanceof Surface) {
      previousAcousticMaterials.push({
        uuid: cram.state.selectedObjects[i].uuid,
        acousticMaterial: (cram.state.selectedObjects[i] as Surface)._acousticMaterial
      });
      (cram.state.selectedObjects[i] as Surface)._acousticMaterial = material;
      surfaceCount++;
    }
  }
  addMoment({
    category: "ASSIGN_MATERIAL",
    objectId: uuid(),
    recallFunction: () => {
      const surfaces = messenger.postMessage(
        "FETCH_SURFACES",
        previousAcousticMaterials.map((x) => x.uuid)
      )[0];
      for (let i = 0; i < previousAcousticMaterials.length; i++) {
        if (surfaces[i].uuid === previousAcousticMaterials[i].uuid) {
          (surfaces[i] as Surface)._acousticMaterial = previousAcousticMaterials[i].acousticMaterial;
        }
      }
    }
  });
  if (surfaceCount > 0) {
    messenger.postMessage("SHOW_TOAST", {
      message: `Assigned material to ${surfaceCount} surface${surfaceCount > 1 ? "s" : ""}.`,
      intent: "success",
      timeout: 1750,
      icon: "tick"
    } as IToastProps);
  } else {
    messenger.postMessage("SHOW_TOAST", {
      message: `No surfaces are selected.`,
      intent: "warning",
      timeout: 1750,
      icon: "issue"
    } as IToastProps);
  }
});

// for the settings drawer
messenger.addMessageHandler("SETTING_CHANGE", (acc, ...args) => {
  const { setting, value } = args[0];
  console.log(setting, value);
  cram.state.renderer.settingChanged(setting, value);
});

// new project
messenger.addMessageHandler("NEW", () => {
  Object.keys(cram.state.solvers).forEach((x) => {
    messenger.postMessage("SHOULD_REMOVE_SOLVER", x);
  });
  Object.keys(cram.state.containers).forEach((x) => {
    messenger.postMessage("SHOULD_REMOVE_CONTAINER", x);
  });
  messenger.postMessage("DESELECT_ALL_OBJECTS");
});

messenger.addMessageHandler("CAN_UNDO", () => {
  return history.canUndo;
});

messenger.addMessageHandler("CAN_REDO", () => {
  return history.canRedo;
});

messenger.addMessageHandler("UNDO", () => {
  history.undo();
  return [history.canUndo, history.canRedo];
});

messenger.addMessageHandler("REDO", () => {
  history.redo();
  return [history.canUndo, history.canRedo];
});

messenger.addMessageHandler("GET_RENDERER", () => {
  return cram.state.renderer;
});

messenger.addMessageHandler("SET_EDITOR_MODE", (acc, ...args) => {
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

messenger.addMessageHandler("GET_EDITOR_MODE", () => {
  return cram.state.editorMode;
});

messenger.addMessageHandler("SET_PROCESS", (acc, ...args) => {
  if (Processes[args[0]]) {
    cram.state.currentProcess = Processes[args[0]];
    cram.state.renderer.currentProcess = cram.state.currentProcess;
    cram.state.renderer.needsToRender = true;
  }
});

messenger.addMessageHandler("GET_PROCESS", () => {
  return cram.state.currentProcess;
});

messenger.addMessageHandler("SHOULD_ADD_SKETCH", () => {
  // messenger.postMessage("PHASE_OUT");
  // messenger.postMessage("SET_PROCESS", Processes.PICKING_SURFACE)
  const selectedObjects = messenger.postMessage("GET_SELECTED_OBJECTS")[0];
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

messenger.addMessageHandler("SHOULD_REMOVE_SKETCH", (acc, id) => {
  if (cram.state.sketches[id]) {
    cram.state.renderer.sketches.remove(cram.state.sketches[id]);
    delete cram.state.sketches[id];
  }
});

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



messenger.addMessageHandler("RESTORE_CONTAINERS", (acc, ...args) => {
  const keys = Object.keys(cram.state.containers);
  keys.forEach((key) => {
    messenger.postMessage("SHOULD_REMOVE_CONTAINER", key);
  });
  if (args && args[0] && args[0] instanceof Array) {
    args[0].forEach((saveObj) => {
      switch (saveObj["kind"]) {
        case "source":
          {
            const src = new Source("new source", { ...saveObj }).restore(saveObj);
            // emit("ADD_SOURCE", src);
            messenger.postMessage("SHOULD_ADD_SOURCE", src, false);
            // cram.state.containers[src.uuid] = src;
            // cram.state.sources.push(src.uuid);
            // cram.state.renderer.add(src);
          }
          break;
        case "receiver":
          {
            const rec = new Receiver("new receiver", { ...saveObj }).restore(saveObj);
            // emit("ADD_RECEIVER", rec);
            messenger.postMessage("SHOULD_ADD_RECEIVER", rec, false);
            // cram.state.containers[rec.uuid] = rec;
            // cram.state.sources.push(rec.uuid);
            // cram.state.renderer.add(rec);
          }
          break;
        case "room":
          {

            // console.log(surfaces);
            // console.log(saveObj.surfaces);
            const room = new Room(saveObj.name || "room").restore(saveObj)
            cram.state.containers[room.uuid] = room;
            emit("ADD_ROOM", room);
            cram.state.renderer.addRoom(room);

            // messenger.postMessage("ADDED_ROOM", room);
          }
          break;
        default:
          break;
      }
    });
  }
});

messenger.addMessageHandler("RESTORE_SOLVERS", (acc, ...args) => {
  const keys = Object.keys(cram.state.solvers);
  keys.forEach((key) => {
    messenger.postMessage("SHOULD_REMOVE_SOLVER", key);
  });
  if (args && args[0] && args[0] instanceof Array) {
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


messenger.addMessageHandler("OPEN", () => {
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
      messenger.postMessage("RESTORE", { file, json });

      tempinput.remove();
    } catch (e) {
      console.warn(e);
    }
  });
  tempinput.click();
});

messenger.addMessageHandler("RESTORE", (acc, ...args) => {
  const props = args && args[0];
  const file = props.file;
  const json = props.json;
  const version = (json.meta && json.meta.version) || "0.0.0";
  console.log(version);
  if (gte(version, "0.2.1")) {
    console.log(json);
    messenger.postMessage("RESTORE_CONTAINERS", json.containers);
    messenger.postMessage("RESTORE_SOLVERS", json.solvers);
    messenger.postMessage("SET_PROJECT_NAME", json.meta.name);
  } else {
    messenger.postMessage("RESTORE_CONTAINERS", json);
    messenger.postMessage("SET_PROJECT_NAME", file.name.replace(".json", ""));
  }
});


hotkeys.setScope("NORMAL");

window.addEventListener("resize", () => emit("RENDER"));

registerAllEvents();



async function finishedLoading() {
  // const filepath = "/res/saves/concord2.json";
  // const filename = filepath.slice(filepath.lastIndexOf("/") + 1);
  // const filedata = await(await fetch(filepath)).text();
  // const json = JSON.parse(filedata);
  const json = examples.shoebox as SaveState;
  // const file = createFileFromData(filename, [filedata]);
  // console.log(json);

  // messenger.postMessage("RESTORE", { file, json });
  emit("RESTORE", { json });
  emit("REGISTER_SHORTCUTS");
  expose({
    chroma,
    ac,
    THREE,
  });
  emit("ADD_IMAGESOURCE");
  emit("ADD_RT60");
  setTimeout(()=>{
    emit("TOGGLE_RESULTS_PANEL", false);
    emit("RENDER");
  }, 150);

}

// the main app
ReactDOM.render(
  <App {...cram.state} />,
  document.getElementById("root"),
  finishedLoading
);

history.clear();
