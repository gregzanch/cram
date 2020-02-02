import { KeyValuePair } from "./common/key-value-pair";
import { uuid } from "uuidv4";

export type EventHandler = (...args) => void;


export default class Messenger{
    private dictionary: KeyValuePair<KeyValuePair<EventHandler>>;
    private messageListeners: KeyValuePair<EventHandler>;
    constructor() {
        this.dictionary = {};
        this.messageListeners = {};
    }
    addMessageHandler(message: string, handler: EventHandler): string {
        const id = uuid();
        if (!this.dictionary[message]) {
            this.dictionary[message] = {
                [id]: handler
            }
            return id;
        } else {
            this.dictionary[message][id] = handler;
            return id;
        }
    }
    removeMessage(message: string) {
        if (this.dictionary[message]) {
            delete this.dictionary[message];
        }
    }
    removeMessageHandler(message: string, id: string) {
        if (this.dictionary[message][id]) {
            delete this.dictionary[message][id];
        }
    }
    postMessage(message: string, ...args) {
        // if messgae exists
        if (this.dictionary[message]) {
            // accumulates the results of each handler
            let accumulator = [] as any[];
            
            // for each message handler
            Object.keys(this.dictionary[message]).forEach(key => {
                // call the message handler with the acculated results and the original arguments
                const results = this.dictionary[message][key](accumulator, ...args);
                accumulator.push(results);
            })
            return accumulator;
        }
        return [] as any[];
    }
    addMessageListener(callback: EventHandler) {
        const id = uuid();
        this.messageListeners[id] = callback;
    }
    removeMessageListener(id) {
        if (this.messageListeners[id]) {
            delete this.messageListeners[id];
        }
    }
}