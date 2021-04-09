// https://dsp.stackexchange.com/questions/17121/calculation-of-reverberation-time-rt60-from-the-impulse-response

import { uuid } from "uuidv4";
import { audioEngine, FilteredSource } from "../audio-engine/audio-engine";
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

    public bandpassSources: FilteredSource[];
    public bandpassData: Float32Array[]; 

    public impulseResponsePlaying: boolean; 

    public filterTest: any; 

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

        this.filterTest = null;
    }

    calculateBroadbandEnergyDecay(){

    }

    play(source){
        if (audioEngine.context.state === 'suspended') {
            audioEngine.context.resume();
          }

        //source.connect(filter);
        //filter.connect(audioEngine.context.destination);
        source.start();

        emit("ENERGYDECAY_SET_PROPERTY", { uuid: this.uuid, property: "impulseResponsePlaying", value: true });
        source.onended = () => {
            source.stop();
            source.disconnect(audioEngine.context.destination);
            emit("ENERGYDECAY_SET_PROPERTY", { uuid: this.uuid, property: "impulseResponsePlaying", value: false });
        }
    }

    set broadbandIR(f: ArrayBuffer){
        let self = this; 
        audioEngine.context.decodeAudioData(f, async function(buffer) {

            let decodeddata = trimIR(buffer.getChannelData(0)); 

            self.broadbandIRSource = audioEngine.createBufferSource(decodeddata);
            self.broadbandIRData = decodeddata;
            self.broadbandIRSampleRate = buffer.sampleRate; 

            self.filterTest = audioEngine.createFilteredSource(decodeddata,8000,1.414,1); 

            let broadbandarray: Float32Array[] = []; 
            for(let f = 0; f<filterFreqs.length; f++){
                broadbandarray[f] = decodeddata; 
            }

            for(let f = 0; f<filterFreqs.length; f++){
                const offlineContext = audioEngine.createOfflineContext(1, decodeddata.length, buffer.sampleRate);
                const filteredsource = audioEngine.createFilteredSource(decodeddata, filterFreqs[f], 1.414,1,offlineContext);
                filteredsource.gain.connect(offlineContext.destination);
                filteredsource.source.start(); 

                let data = await offlineContext.startRendering(); 
                console.log(data.getChannelData(0)); 
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

