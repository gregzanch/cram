import { KeyValuePair } from "./common/key-value-pair";
import { uuid } from "uuidv4";

export type EventHandler = (...args) => void;

declare global {
    type EventWithPayload<T> = {
        payload: T,
        meta: any
    }
    interface EventTypes {
        TEST_MESSAGE: [string];
    }
};



type EventHandlers =  {
    [key in keyof EventTypes]: Set<any>
};

export default class Messenger{
    static postMessage(arg0: string) {
      throw new Error("Method not implemented.");
    }
    private dictionary: KeyValuePair<KeyValuePair<EventHandler>>;
    private messageListeners: KeyValuePair<EventHandler>;
    private events: EventHandlers;
    lastMessage: string;
    constructor() {
        this.dictionary = {};
        this.messageListeners = {};
        this.events = {} as EventHandlers;
        this.lastMessage = "";
    }
    addMessageHandler(message: string, handler: EventHandler): string[] {
        const id = uuid();
        if (!this.dictionary[message]) {
            this.dictionary[message] = {
                [id]: handler
            }
            return [message, id];
        } else {
            this.dictionary[message][id] = handler;
            return [message, id];
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
        if (message != this.lastMessage) {
            this.lastMessage = message;
            // console.log(message);
        }
        // if message exists
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
    on<T extends keyof EventTypes>(event: T, callback: (e: EventTypes[T]) => void) {
        if(!this.events[event]){
            this.events[event] = new Set();
        } 
        this.events[event].add(callback);
        return (() => {
            this.events[event].delete(callback);
        }).bind(this) as () => void;
    }
    emit<T extends keyof EventTypes>(event: T, payload: EventTypes[T]) {
        if(!this.events[event]) return;
        
        for(const handler of this.events[event]){
            const handlerResult = handler(payload);
            if(typeof handlerResult !== "undefined" && !handlerResult){
                break;
            }
        }
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

export const messenger = new Messenger();
export const emit = messenger.emit.bind(messenger) as Messenger['emit'];
export const on = messenger.on.bind(messenger) as Messenger['on'];
export const postMessage = messenger.postMessage.bind(messenger) as Messenger['postMessage'];
export const addMessageHandler = messenger.addMessageHandler.bind(messenger) as Messenger['addMessageHandler'];
export const removeMessageHandler = messenger.removeMessageHandler.bind(messenger) as Messenger['removeMessageHandler'];