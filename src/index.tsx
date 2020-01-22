import React from "react";
import ReactDOM, { render } from "react-dom";

import App from './containers/App';

import Messenger from './messenger';
import Source from './objects/source';
import Receiver from './objects/receiver';

import Renderer from "./render/renderer";

import { registerHotKeys } from './hotkeys';

import { fileType, allowed } from './common/file-type';

import { STLLoader } from './loaders'; 

import * as THREE from 'three';

import { KeyValuePair } from './common/key-value-pair';

import expose from './common/expose';
import Container from "./objects/container";

const STL = new STLLoader();



const state = {
	containers: {} as KeyValuePair<Container>,
	geometry: {},
	renderer: new Renderer(),
	messenger: new Messenger()
};


expose({ state }, window);


const importHandlers = {
    stl: (data) => {
        return STL.parseASCII(data);
    },
    obj: (data) => {
        return
    }
}

state.messenger.addMessageHandler("ADD_SOURCE_BUTTON_PRESSED", (res, ...args) => {
    const source = new Source("new source");
    state.containers[source.uuid] = source;
    state.renderer.add(source);
    return source;
});

state.messenger.addMessageHandler("ADD_RECEIVER_BUTTON_PRESSED", (res, ...args) => {
    const rec = new Receiver("new receiver");
    state.containers[rec.uuid] = rec;
    state.renderer.add(rec);
    return rec;
});

state.messenger.addMessageHandler("IMPORT_FILE", (res, ...args) => {
    const files = Array.from(args[0]);
    files.forEach(async (file: File) => {
        if (allowed[fileType(file.name)]) { 
            
            const objectURL = URL.createObjectURL(file);
            const result = (await (await fetch(objectURL)).text());
            const data = importHandlers[fileType(file.name)](result);
            console.log(data);
            state.renderer.addGeometry(data);

        }
    })
});

registerHotKeys(state.messenger);

ReactDOM.render(<App {...state}/>, document.getElementById("root"));
