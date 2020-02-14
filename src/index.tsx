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
import { STLLoader, OBJLoader } from "./render/loaders";
import OBJParser from "./render/loaders/OBJLoader";
import EasingFunctions from "./common/easing";
import * as THREE from "three";
import { KeyValuePair } from "./common/key-value-pair";
import expose from "./common/expose";
import Container from "./objects/container";
import { Setting } from "./common/setting";
import {randomInteger} from './common/random';
const STL = new STLLoader();
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

// const options: Fuse.FuseOptions<AcousticMaterial> = {
//   caseSensitive: false,
//   keys: [
//     {
//       name: "name",
//       weight: 0.4
//     },
//     {
//       name: "tags",
//       weight: 0.3
//     },
//     {
//       name: "material",
//       weight: 0.3
//     }
//   ],
//   shouldSort: true,
//   threshold: 0.6,
//   location: 0,
//   distance: 100,
//   maxPatternLength: 32,
//   minMatchCharLength: 1
// };

expose({ ac, chunk, THREE, EasingFunctions }, window);

const materialsIndex = {} as KeyValuePair<AcousticMaterial>;

materials.forEach(x => {
    materialsIndex[x._id] = x;
});

const state = {
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
    lightHelpersVisible: new Setting(true, "checkbox")
  } as KeyValuePair<Setting<any>>
};

state.renderer = new Renderer({
  messenger: state.messenger
});

const importHandlers = {
  stl: data => {
    return STL.parseASCII(data);
  },
  obj: data => {
    const loader = new OBJLoader(data);
    const res = loader.parse();

    const [vertices, vertexNormals, textureCoords] = res.models.reduce(
      (a, b) => [
        a[0].concat(b.vertices),
        a[1].concat(b.vertexNormals),
        a[2].concat(b.textureCoords)
      ],
      [[] as any[], [] as any[], [] as any[]]
    );
    const models = res.models.map(model => {
      const buffer = new THREE.BufferGeometry();
      const verts = [] as number[];
      const vertNormals = [] as number[];
      const texCoords = [] as number[];
      model.faces.forEach(face => {
        face.vertices.forEach(vertex => {
          const v = vertices[vertex.vertexIndex - 1];
          v && verts.push(v.x, v.y, v.z);
          const vn = vertexNormals[vertex.vertexNormalIndex - 1];
          vn && vertNormals.push(vn.x, vn.y, vn.z);
          const tc = textureCoords[vertex.textureCoordsIndex - 1];
          tc && texCoords.push(tc.u, tc.v, tc.w);
        });
      });
      buffer.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(verts), 3, false)
      );
      buffer.setAttribute(
        "normals",
        new THREE.BufferAttribute(new Float32Array(vertNormals), 3, false)
      );
      buffer.setAttribute(
        "texCoords",
        new THREE.BufferAttribute(new Float32Array(texCoords), 3, false)
      );
      return {
        name: model.name,
        geometry: buffer
      };
    });

    return models;
  }
};

state.messenger.addMessageHandler("SET_SELECTION", (acc, ...args) => {
  Object.keys(state.containers).forEach(x => {
    if ((args[0] as string[]).includes(x)) {
      state.containers[x].select();
    }
    else {
      state.containers[x].traverse(obj => {
        if ((args[0] as string[]).includes(obj.uuid)) {
            obj instanceof Container && (obj as Container).select();  
        }
        else {
            obj instanceof Container && (obj as Container).deselect();
        }
      })
    }
  });
  // (args[0] as string[]).forEach(x => {
  //   const obj = state.renderer.scene.getObjectByProperty('uuid', x);
  //   if (obj) {
  //     (obj as Container).select()
  //   }
  // })
});


state.messenger.addMessageHandler("FETCH_ALL_MATERIALS", (acc, ...args) => {
  return state.materials;
});

state.messenger.addMessageHandler("SEARCH_ALL_MATERIALS", (acc, ...args) => {
  const res = state.materialSearcher.search(args[0]);
  return res;
});

state.messenger.addMessageHandler("DESELECT_ALL_OBJECTS2", (acc, ...args) => {
  Object.keys(state.containers).forEach(x => {
    state.containers[x].deselect();
  });
});

state.messenger.addMessageHandler("SHOULD_ADD_RAYTRACER", (acc, ...args) => {
  const raytracer = new RayTracer({
    messenger: state.messenger,
    name: "ray-tracer",
    containers: state.containers,
    reflectionOrder: 100,
    updateInterval: 20,
    renderer: state.renderer
  });
  state.solvers[raytracer.uuid] = raytracer;
  return raytracer;
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

state.messenger.addMessageHandler("NEW", (acc, ...args) => {
  
});

state.messenger.addMessageHandler("RAYTRACER_CALCULATE_RESPONSE", (acc, id, frequencies) => {
  (state.solvers[id] instanceof RayTracer) && (state.solvers[id] as RayTracer).calculateWithDiffuse(frequencies);
})


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
  return state.solvers[args[0]].running;
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

setTimeout(() => {

  const { uuid: sourceid } = state.messenger.postMessage(
    "SHOULD_ADD_SOURCE"
  )[0];
  (state.containers[sourceid] as Source).position.set(29,8,2.5);
  (state.containers[sourceid] as Source).scale.set(3,3,3);

  const { uuid: receiverId } = state.messenger.postMessage(
    "SHOULD_ADD_RECEIVER"
  )[0];
  const models = importHandlers.obj(testroom);

  const surfaces = models.map(
    model =>
      new Surface(model.name, {
        geometry: model.geometry,
        acousticMaterial: state.materials[randomInteger(0,state.materials.length-1)]
      })
  );
  const room = new Room("room", {
    surfaces
  });
  state.containers[room.uuid] = room;
  state.renderer.addRoom(room);

  state.messenger.postMessage("ADDED_ROOM", room);



  (state.containers[receiverId] as Receiver).position.set(6,9,1.8);
  (state.containers[receiverId] as Receiver).scale.set(5, 5, 5);


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

state.messenger.addMessageHandler("SETTING_CHANGE", (acc, ...args) => {
  const { setting, value } = args[0];
  console.log(setting, value);
  state.renderer.settingChanged(setting, value);
});

registerHotKeys(state.messenger);

ReactDOM.render(<App {...state} />, document.getElementById("root"));
