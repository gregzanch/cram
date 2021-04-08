// https://dsp.stackexchange.com/questions/17121/calculation-of-reverberation-time-rt60-from-the-impulse-response

import { uuid } from "uuidv4";
import { AudioEngine } from "../audio-engine/audio-engine";
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

const AudioContext = (window.AudioContext);

class EnergyDecay extends Solver{ 
    public uuid; 
    public broadbandIRData: Float32Array; 
    public broadbandIRSampleRate: number; 
    
    public context: AudioContext;
    source;

    constructor(props: EnergyDecayProps = defaults){
        super(props);
        this.kind = "energydecay";
        this.name = props.name || defaults.name;

        this.context = new AudioContext();
        this.source = this.context.createBufferSource(); 

        this.broadbandIRData = new Float32Array(); 
        this.broadbandIRSampleRate = 0; 

    }

    set broadbandIR(f: ArrayBuffer){
        console.log(f); 
        this.context.decodeAudioData(f, function(buffer) {
            this.broadbandIRData = buffer.getChannelData(0);
            this.broadbandIRSampleRate = buffer.sampleRate; 
        }) 
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
      LOAD_IR_TO_ENERGYDECAY: {
          uuid: string;
          f: File; 
      }
    }
}

on("ADD_ENERGYDECAY", addSolver(EnergyDecay))
on("ENERGYDECAY_SET_PROPERTY", setSolverProperty); 

