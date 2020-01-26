import { KeyValuePair } from "./common/key-value-pair";

export type EventHandler = (...args) => void;


export default class Messenger{
    private dictionary: KeyValuePair<EventHandler[]>;
    constructor() {
        this.dictionary = {};
    }
    addMessageHandler(message: string, handler: EventHandler) {
        
        // if action has not been added to dictionary
        if (!this.dictionary[message]) {
            
            // add it to the dictionary inside an array
            this.dictionary[message] = [handler];
        } else {
            
            // push it on to the array of action handlers
			this.dictionary[message].push(handler);
		}
    }
    postMessage(message: string, ...args) {
        
        // if messgae exists
        if (this.dictionary[message]) {
            
            // accumulates the results of each handler
            let accumulator = [] as any[];
            
            // for each message handler
            for (let i = 0; i < this.dictionary[message].length; i++) {
                
                // call the message handler with the acculated results and the original arguments
                const results = this.dictionary[message][i](accumulator, ...args);
                
                // push results on the accumulator
				accumulator.push(results);
			}
		}
    }
}