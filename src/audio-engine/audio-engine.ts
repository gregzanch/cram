import { normalize, wavAsBlob } from '../compute/acoustics';
import {saveAs} from 'file-saver';

const throwif = (condition: boolean, message: string) => {
  if(!condition) throw Error(message);
}

type FilteredSource = {
  source: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  gain: GainNode;
}

//@ts-ignore
const AudioContext = (window.AudioContext || window.webkitAudioContext);

export class AudioEngine {
  context: AudioContext
  constructor(){
    this.context = new AudioContext();
  }

  /**
   * Creates an offline audio context for faster rendering
   * @param numberOfChannels number of channels for this context
   * @param length length of the context in samples
   * @param sampleRate sample rate in samples / second
   */
  public createOfflineContext(numberOfChannels: number, length: number, sampleRate: number){
    return new OfflineAudioContext(numberOfChannels, length, sampleRate);
  }

  /**
   * Creates a buffer source node filled with the supplied data
   * @param buffer The buffer of samples in a Float32Array
   * @param context audio context to use
   * @returns the buffer source
   */
  public createBufferSource(buffer: Float32Array, context: AudioContext|OfflineAudioContext = this.context){
    const source = context.createBufferSource();
    source.buffer = context.createBuffer(1, buffer.length, this.context.sampleRate) 
    source.buffer.copyToChannel(buffer, 0);
    return source;
  }

  /**
   * Creates a bandpass filter node
   * @param freq center frequency
   * @param Q Q-factor (reciprocal of the fractional bandwidth)
   * @param context audio context to use
   * @returns a bandpass filter
   */
  public createBandpassFilter(freq: number, Q: number = 1.414, context: AudioContext|OfflineAudioContext = this.context){
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(Q, context.currentTime);
    filter.frequency.setValueAtTime(freq, context.currentTime);
    return filter;
  }

  /**
   * Creates a gain node
   * @param value the gain value
   * @param context audio context to use
   * @returns a gain node
   */
  public createGainNode(value: number, context: AudioContext|OfflineAudioContext = this.context){
    const gain = context.createGain();
    gain.gain.setValueAtTime(value, context.currentTime);
    return gain;
  }

  
  /**
   * Creates a channel merger node
   * @param count number of input channels to merge
   * @param context audio context to use
   * @returns a channel merger node
   */
  public createMerger(count: number, context: AudioContext|OfflineAudioContext = this.context){
    return context.createChannelMerger(count);
  }

  /**
   * Creates a filtered source node 
   * @param buffer The buffer of samples in a Float32Array
   * @param freq center frequency
   * @param Q Q-factor (reciprocal of the fractional bandwidth)
   * @param gain the gain value
   * @param context audio context to use
   * @returns a filtered source node
   */
  public createFilteredSource(buffer: Float32Array, freq: number, Q: number = 1.414, gain: number = 1, context: AudioContext|OfflineAudioContext = this.context){
    const filteredSource = {
      source: this.createBufferSource(buffer, context),
      filter: this.createBandpassFilter(freq, Q, context),
      gain: this.createGainNode(gain, context)
    }
    filteredSource.source.connect(filteredSource.filter);
    filteredSource.filter.connect(filteredSource.gain);
    return filteredSource as FilteredSource;
  }

  /**
   * Creates an array of filtered source nodes
   * @param dataBuffers an array of sample buffers
   * @param frequencies an array of frequencies
   * @param context audio context to use
   * @returns an array of filtered source nodes
   */
  public createFilteredSources(dataBuffers: Float32Array[], frequencies: number[], context: AudioContext|OfflineAudioContext = this.context) {
    throwif(dataBuffers.length == frequencies.length, "There should be exactly one frequency for each data buffer.");
    const sources = [] as FilteredSource[];
    for(let i = 0; i<frequencies.length; i++){
      sources.push(this.createFilteredSource(dataBuffers[i], frequencies[i], 1.414, 1, context));
    }
    return sources;
  }

  public diracDelta(length: number = 8192, offset: number = 0){
    const samples = new Float32Array(Array(length).fill(0)); 
    samples[offset] = 1;
    return samples;
  }

  async testFilters(frequencies, sampleRate=44100) {

    const samples = this.diracDelta();
    const offlineContext = this.createOfflineContext(1, samples.length, sampleRate);
    const sources = this.createFilteredSources([samples], frequencies, offlineContext);
    const merger = this.createMerger(sources.length, offlineContext);
    
    for(let i = 0; i<sources.length; i++){
      sources[i].gain.connect(merger, 0, i);
    }

    merger.connect(offlineContext.destination);
    sources.forEach(source=>source.source.start());
    const impulseResponse = await offlineContext.startRendering();
    const blob = wavAsBlob([normalize(impulseResponse.getChannelData(0))], { sampleRate, bitDepth: 32 });
    saveAs(blob, "testFilters.wav");

    // this.impulseResponse = audioEngine.context.createBufferSource();
    
  }






}

export const audioEngine = new AudioEngine();


// function sig = filterit(order, lowfreq, highfreq)
//   y=zeros(44100,1);
//   y(1)=1;
//   [b,a]=butter(order, [lowfreq/44100, highfreq/44100]);
//   filtered=filter(b,a,y);
//   sig = filtered;
// end



