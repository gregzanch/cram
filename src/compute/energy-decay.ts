// https://dsp.stackexchange.com/questions/17121/calculation-of-reverberation-time-rt60-from-the-impulse-response

import { uuid } from "uuidv4";
import { audioEngine } from "../audio-engine/audio-engine";
import { emit, on } from "../messenger";
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

const filterFreqs = [125,250,500,1000,2000,4000,8000];

class EnergyDecay extends Solver{ 
    public uuid; 
    public broadbandIRData: Float32Array; 
    public broadbandIRSampleRate: number; 
    public broadbandIRSource: any; 

    public source;

    public bandpassSources: any;
    public bandpassData: Float32Array[]; 

    public impulseResponsePlaying: boolean; 

    constructor(props: EnergyDecayProps = defaults){
        super(props);
        this.kind = "energydecay";
        this.name = props.name || defaults.name;

        this.broadbandIRData = new Float32Array(); 
        this.broadbandIRSampleRate = 0; 

        this.uuid = uuid(); 

        this.bandpassSources = []; 
        this.bandpassData = []; 

        this.impulseResponsePlaying = false; 
    }

    calculateBroadbandEnergyDecay(){

    }

    playBroadbandIR(){
        if (audioEngine.context.state === 'suspended') {
            audioEngine.context.resume();
          }

        let source = (this.bandpassSources[1]).source;

        this.source.connect(audioEngine.context.destination);
        this.source.start();

        emit("ENERGYDECAY_SET_PROPERTY", { uuid: this.uuid, property: "impulseResponsePlaying", value: true });
        this.source.onended = () => {
            this.source.stop();
            this.source.disconnect(audioEngine.context.destination);
            emit("ENERGYDECAY_SET_PROPERTY", { uuid: this.uuid, property: "impulseResponsePlaying", value: false });
        }
    }

    set broadbandIR(f: ArrayBuffer){
        let self = this; 
        audioEngine.context.decodeAudioData(f, function(buffer) {

            let decodeddata = trimIR(buffer.getChannelData(0)); 

            self.broadbandIRSource = audioEngine.createBufferSource(decodeddata);
            self.broadbandIRData = decodeddata;
            self.broadbandIRSampleRate = buffer.sampleRate; 

            let broadbandarray: Float32Array[] = []; 
            for(let f = 0; f<filterFreqs.length; f++){
                broadbandarray[f] = decodeddata; 
            }

            console.log(audioEngine.createFilteredSources(broadbandarray,filterFreqs))
            self.bandpassSources = audioEngine.createFilteredSources(broadbandarray,filterFreqs);

            for(let f = 0; f<filterFreqs.length; f++){
                self.bandpassData[f] = (self.bandpassSources[f]).source.buffer.getChannelData(0); 
            }
        }) 
    }
}

function trimIR(ir: Float32Array): Float32Array {
    let tolerance = 1e-6; 
    let startSample = 0; 
    let endSample = ir.length; 

    let sindex = 0; 
    while(Math.abs(ir[sindex]) < tolerance){
        startSample = sindex; 
        sindex++; 
    }

    sindex = ir.length
    while(Math.abs(ir[sindex]) < tolerance){
        endSample = sindex; 
        sindex--; 
    }

    return ir.slice(startSample,endSample); 
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

