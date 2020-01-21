import React from "react";
import ReactDOM from "react-dom";

import App from './containers/App';

import Messenger from './messenger';
import Source from './objects/source';
import Receiver from './objects/receiver';

import Renderer from "./render/renderer";

import { registerHotKeys } from './hotkeys';

const state = {
    sources: [] as Source[],
    receivers: [] as Receiver[],
    geometry: {},   
    renderer: new Renderer(),
    messenger: new Messenger()
};

import expose from './common/expose';


expose({ state }, window);





state.messenger.addMessageHandler("ADD_SOURCE_BUTTON_PRESSED", (res, ...args) => {
    const source = new Source("new source");
    state.sources.push(source);
    state.renderer.add(source);
    return source;
});

state.messenger.addMessageHandler("ADD_RECEIVER_BUTTON_PRESSED", (res, ...args) => {
    const rec = new Receiver("");
    state.receivers.push(rec);
    state.renderer.add(rec);
    return rec;
});

state.messenger.addMessageHandler("IMPORT_FILE", (res, ...args) => {
    const files = Array.from(args[0]);
    files.forEach(async (file: File) => {
        const objectURL = URL.createObjectURL(file);
        const result = (await (await fetch(objectURL)).text());
        // console.log(result);
    })
    console.log(args[0]);
});

registerHotKeys(state.messenger);

ReactDOM.render(<App {...state}/>, document.getElementById("root"));
