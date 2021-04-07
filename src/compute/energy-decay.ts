// https://dsp.stackexchange.com/questions/17121/calculation-of-reverberation-time-rt60-from-the-impulse-response

import { uuid } from "uuidv4";
import { on } from "../messenger";
import { addSolver, setSolverProperty, useSolver } from "../store/solver-store";
import Solver, { SolverParams } from "./solver";

// import audio

// filter response at appropriate octave band (butterworth 3rd order)

// hilbert transform of signal

// convert to decibel scale

// schroeder integration 

// linear interpolation of decay curve to obtain T20, T30, etc...

export interface EnergyDecayProps extends SolverParams{
    //uuid?: string;
    // containers: KVP<Container>; 
}

export type EnergyDecaySaveObject = {
    uuid: string;
    name: string;
    kind: "energydecay";
}

const defaults = {
    name: "Energy Decay",
};

class EnergyDecay extends Solver{ 
    public uuid; 

    constructor(props: EnergyDecayProps = defaults){
        super(props);
        this.kind = "energydecay";
        this.name = props.name || defaults.name;
        this.uuid = uuid(); 

    }

    loadBroadbandIR(){
        const reader = new FileReader();
        reader.addEventListener('loadend', (loadEndEvent) => {
            console.log(reader.result);
        });
    }
}

export default EnergyDecay

// this allows for nice type checking with 'on' and 'emit' from messenger
declare global {
    interface EventTypes {
      ADD_ENERGYDECAY: EnergyDecay | undefined,
      ENERGYDECAY_SET_PROPERTY: {
        uuid: string;
        property: keyof EnergyDecay;
        value: EnergyDecay[EventTypes["ENERGYDECAY_SET_PROPERTY"]["property"]]; 
      }
      LOAD_IR_TO_ENERGYDECAY: string;
    }
}

on("ADD_ENERGYDECAY", addSolver(EnergyDecay))
on("ENERGYDECAY_SET_PROPERTY", setSolverProperty); 
on("LOAD_IR_TO_ENERGYDECAY", (uuid: string) => void (useSolver.getState().solvers[uuid] as EnergyDecay).loadBroadbandIR()); 

