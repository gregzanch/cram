import React from "react";
import ReactDOM, { render } from "react-dom";

import App from './containers/App';
import browserReport from './common/browser-report';
import Messenger from './messenger';
import Source from './objects/source';
import Receiver from './objects/receiver';

import Renderer from "./render/renderer";

import { registerHotKeys } from './hotkeys';

import { fileType, allowed } from './common/file-type';

import { STLLoader, OBJLoader } from './render/loaders'; 

import OBJParser from './render/loaders/OBJLoader';


import * as THREE from 'three';

import { KeyValuePair } from './common/key-value-pair';

import expose from './common/expose';
import Container from "./objects/container";
import { Setting } from "./common/setting";

const STL = new STLLoader();

import { chunk } from './common/chunk';


//@ts-ignore
import triangleroom from '!raw-loader!./res/triangle.stl';
//@ts-ignore
import testroom from '!raw-loader!./res/models/room.obj';

import Solver from './compute/solver';

import Room from "./objects/room";
import Surface from "./objects/surface";

import test from './compute/kernel';

console.log(test());

expose({ chunk, THREE }, window);


const state = {
    browser: browserReport(navigator.userAgent),
    containers: {} as KeyValuePair<Container>,
    solutions: {} as KeyValuePair<Solver>,
	renderer: new Renderer(),
    messenger: new Messenger(),
    settings: {
        lightHelpersVisible: new Setting(true, "checkbox")
    } as KeyValuePair<Setting<any>>
};


expose({ state }, window);


const importHandlers = {
    stl: (data) => {
        return STL.parseASCII(data);
    },
    obj: (data) => {
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
            buffer.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verts), 3, false));
            buffer.setAttribute("normals", new THREE.BufferAttribute(new Float32Array(vertNormals), 3, false));
            buffer.setAttribute("texCoords", new THREE.BufferAttribute(new Float32Array(texCoords), 3, false));
            return {
                name: model.name,
                geometry: buffer
            }
        })

        return models
    }
}

state.messenger.addMessageHandler("ADD_SOURCE_BUTTON_PRESSED", (acc, ...args) => {
    const source = new Source("new source");
    state.containers[source.uuid] = source;
    state.renderer.add(source);
    return source;
});

state.messenger.addMessageHandler("ADD_RECEIVER_BUTTON_PRESSED", (acc, ...args) => {
    const rec = new Receiver("new receiver");
    state.containers[rec.uuid] = rec;
    state.renderer.add(rec);
    return rec;
});

state.messenger.addMessageHandler("ADDED_ROOM",  (acc, ...args) => args[0])

state.messenger.addMessageHandler("IMPORT_FILE", (acc, ...args) => {
    const files = Array.from(args[0]);
    files.forEach(async (file: File) => {
        if (allowed[fileType(file.name)]) { 
            
            const objectURL = URL.createObjectURL(file);
            const result = (await (await fetch(objectURL)).text());
            const models = importHandlers.obj(result);
            const surfaces = models.map(
                model => new Surface(model.name, { geometry: model.geometry })
            );
            const room = new Room("new room", {
                surfaces
            });
            state.containers[room.uuid] = room;
            state.renderer.addRoom(room);
            state.messenger.postMessage("ADDED_ROOM", room);
        }
    })
});

state.messenger.addMessageHandler("APP_MOUNTED", (acc, ...args) => {
    state.renderer.init(args[0]);
});

setTimeout(() => {
    // const parser = new OBJParser();
    // const geometry = parser.parse(testroom)
    const models = importHandlers.obj(testroom);
    
    const surfaces = models.map(model => new Surface(model.name, { geometry: model.geometry }));
    const room = new Room("room", {
        surfaces
    });
    state.containers[room.uuid] = room;
    state.renderer.addRoom(room);
    state.messenger.postMessage("ADDED_ROOM", room);
}, 200);


state.messenger.addMessageHandler("SETTING_CHANGE", (acc, ...args) => {
    const { setting, value } = args[0];
    console.log(setting, value);
    state.renderer.settingChanged(setting, value);
})

registerHotKeys(state.messenger);

ReactDOM.render(<App {...state}/>, document.getElementById("root"));
