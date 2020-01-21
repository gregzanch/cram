export type EventHandler = (...args) => void;

export interface Assoc{
    [message: string]: EventHandler[]
}
export default class Messenger{
    private assoc: Assoc;
    constructor() {
        this.assoc = {};
    }
    addMessageHandler(message: string, handler: EventHandler) {
        if (!this.assoc[message]) {
            this.assoc[message] = [handler];
        }
        else {
            this.assoc[message].push(handler);
        }
    }
    postMessage(message: string, ...args) {
        if (this.assoc[message]) {
            let res = [] as any[];
            for (let i = 0; i < this.assoc[message].length; i++){
                res.push(this.assoc[message][i](res, ...args));
            }
        }
    }
}