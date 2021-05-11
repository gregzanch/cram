// https://dsp.stackexchange.com/questions/17121/calculation-of-reverberation-time-rt60-from-the-impulse-response

import FileSaver from "file-saver";
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

    public filteredData: Float32Array[]; 
    public filteredEnergyDecayData: Float32Array[]; 

    public impulseResponsePlaying: boolean; 

    public filterTest: any; 

    public T15: number[]; 
    public T20: number[];
    public T30: number[]; 

    constructor(props: EnergyDecayProps = defaults){
        super(props);
        this.kind = "energydecay";
        this.name = props.name || defaults.name;

        this.broadbandIRData = new Float32Array(); 
        this.broadbandIRSampleRate = 0; 

        this.uuid = uuid(); 

        this.filteredData = []; 
        this.filteredEnergyDecayData = [];

        this.impulseResponsePlaying = false; 

        this.filterTest = null;

        this.T15 = [];
        this.T20 = [];
        this.T30 = []; 
    }

    calculateAcParams(){
        if(this.filteredData.length == 0){
            console.error("No IR Data Loaded");
        }

        this.calculateOctavebandBackwardsIntegration();

        for(let f = 0; f<filterFreqs.length; f++){
            this.T15[f] = calculateRTFromDecay(this.filteredEnergyDecayData[f],15,this.broadbandIRSampleRate);
            this.T20[f] = calculateRTFromDecay(this.filteredEnergyDecayData[f],20,this.broadbandIRSampleRate);
            this.T30[f] = calculateRTFromDecay(this.filteredEnergyDecayData[f],30,this.broadbandIRSampleRate);
        }

        console.log(filterFreqs); 
        console.log("T10 Values: ");
        console.log(this.T15); 
        console.log("T20 Values: ");
        console.log(this.T20); 
        console.log("T30 Values: ");
        console.log(this.T30); 

        this.downloadResultsAsCSV(); 

    }

    calculateOctavebandBackwardsIntegration(){
        for(let f = 0; f<filterFreqs.length; f++){
            this.filteredEnergyDecayData[f] = schroederBackwardsIntegration(this.filteredData[f]); 
        }
    }

    downloadResultsAsCSV(){

        let precision = 4;
        let freqlabel = "Octave Band (Hz),"
        let t15label = "T15,";
        let t20label = "T20,"; 
        let t30label = "T30,"; 
    
        let CSV = [freqlabel.concat((filterFreqs).toString()),
          t15label.concat((this.T15).map((n)=>n.toFixed(precision)).toString()),
          t20label.concat((this.T20).map((n)=>n.toFixed(precision)).toString()),
          t30label.concat((this.T30).map((n)=>n.toFixed(precision)).toString()),
        ].join('\n');
    
        var csvFile = new Blob([CSV], {type: 'text/csv'});
        FileSaver.saveAs(csvFile, `energy-decay-${this.uuid}.csv`);
      }

    play(source){
        if (audioEngine.context.state === 'suspended') {
            audioEngine.context.resume();
          }

        source.connect(audioEngine.context.destination); 
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

                let data = await audioEngine.renderContextAsync(offlineContext);
                self.filteredData.push(data.getChannelData(0)); 
            }

        }) 
    }
}

function calculateRTFromDecay(decay: Float32Array,decayLength: number,sampleRate:number): number{
    const n1: number = -5; // start at -5 dB 
    const n2: number = n1-decayLength; // ex. if T30, -5 to -35 dB 

    let n1_idx = indexOfMin(abs(subFromArray(decay,n1))); 
    let n2_idx = indexOfMin(abs(subFromArray(decay,n2))); 

    let numSamples = Math.abs(n2_idx-n1_idx); 

    let decay_time = numSamples/sampleRate; 
    let reverb_time = decay_time*(60/decayLength); 

    return reverb_time; 
}

function schroederBackwardsIntegration(data: Float32Array){

    const td = data.length; // upper integration limit 

    let data_reversed: Float32Array = data.reverse(); 

    let data_reversed_sq: Float32Array = data_reversed.map((x)=>Math.pow(x,2)); 

    let data_reversed_sq_cumsum: Float32Array = cumsum(data_reversed_sq); 

    let data_sq: Float32Array = data.map((x)=>Math.pow(x,2)); 
    let data_sq_sum: number = sum(data_sq);
    
    let data_reversed_sq_cumsum_div_sum: Float32Array = data_reversed_sq_cumsum.map((x)=>(x/data_sq_sum)); 

    let bi_result: Float32Array = data_reversed_sq_cumsum_div_sum.map((x)=>{
        if(x!=0){
            return 10*Math.log10(x);
        }else{
            return 0;
        }
    }); 
    return bi_result; 
}

function indexOfMin(data: Float32Array): number{
    let min_index = 0;
    let min = data[min_index]; 

    for(let i = 0; i<data.length; i++){
        if (min > data[i]) {
            min = data[i]; 
            min_index = i; 
        }
    }
    return min_index; 
}

function sum(data: Float32Array): number{
    let sum: number = data.reduce(function(acc,currentValue) {
        return acc + currentValue; 
    }, 0); 
    return sum; 
}

function cumsum(data: Float32Array): Float32Array{
    const cumulativeSum = (sum => value => sum += value)(0);
    let cumsum_array = data.map(cumulativeSum);

    return cumsum_array; 
}

function abs(data: Float32Array): Float32Array{
    let absarray = data.map((x)=>Math.abs(x));
    return absarray; 
}

function subFromArray(data: Float32Array, sub: number): Float32Array{
    let subarray = data.map((x)=>(x-sub)); 
    return subarray; 
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
      CALCULATE_AC_PARAMS: string; 
    }
}

on("ADD_ENERGYDECAY", addSolver(EnergyDecay))
on("ENERGYDECAY_SET_PROPERTY", setSolverProperty); 
on("CALCULATE_AC_PARAMS", (uuid: string) => void (useSolver.getState().solvers[uuid] as EnergyDecay).calculateAcParams());

