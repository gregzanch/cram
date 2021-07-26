import { normalize, wavAsBlob } from '../compute/acoustics';
import {saveAs} from 'file-saver';
import {Flower, Fupper} from '../compute/acoustics';
import { filterSignals } from './envelope';
import{throwif} from '../common/throwif';


type BiquadFilterType = "bandpass"|"lowpass"|"highpass"| "lowshelf"|"highshelf"|"peaking"|"notch"|"allpass";

export type FilteredSource = {
  source: AudioBufferSourceNode;
  lowpass: BiquadFilterNode;
  highpass: BiquadFilterNode;
  gain: GainNode;
}

//@ts-ignore
const AudioContext = (window.AudioContext || window.webkitAudioContext);
//@ts-ignore
const OfflineAudioContext = (window.OfflineAudioContext || window.webkitOfflineAudioContext);

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
   * Renders an offline audio context in a more browser agnostic way.
   * neither Safari or Edge like `await context.startRendering()`
   * @param context offline audio context
   * @returns {Promise<AudioBuffer>} the rendered buffer
   */
  public async renderContextAsync(context: OfflineAudioContext): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      context.oncomplete = function(event: OfflineAudioCompletionEvent) {
        if(!event.renderedBuffer){
          reject("failed to get renderedBuffer after context completed rendering");
        } else {
          resolve(event.renderedBuffer);
        }
      };
      context.startRendering();
    });
  }

  /**
   * Creates a buffer source node filled with the supplied data
   * @param buffer The buffer of samples in a Float32Array
   * @param context audio context to use
   * @returns the buffer source
   */
  public createBufferSource(buffer: Float32Array, context: AudioContext|OfflineAudioContext = this.context){
    const source = context.createBufferSource();
    source.buffer = context.createBuffer(1, buffer.length, this.context.sampleRate);
    const sourceBuffer = source.buffer.getChannelData(0);
    sourceBuffer.set(buffer, 0);
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
    filter.Q.value = Q;
    filter.frequency.value = freq;
    return filter;
  }

  /**
   * Creates a bandpass filter node
   * @param freq center frequency
   * @param Q Q-factor (reciprocal of the fractional bandwidth)
   * @param context audio context to use
   * @returns a bandpass filter
   */
  public createBiquadFilter(type: BiquadFilterType, freq: number, Q: number = 1.414, gain: number = 1, context: AudioContext|OfflineAudioContext = this.context){
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.Q.value = Q;
    filter.frequency.value = freq;
    filter.gain.value = gain;
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
    gain.gain.value = value;
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
    const lower = Flower(1, freq) as number;
    const upper = Fupper(1, freq) as number;
    const filteredSource = {
      source: this.createBufferSource(buffer, context),
      lowpass: this.createBiquadFilter("lowpass", upper, Q, 1, context),
      highpass: this.createBiquadFilter("highpass", lower, Q, 1, context),
      gain: this.createGainNode(gain, context)
    }
    filteredSource.source.connect(filteredSource.lowpass);
    filteredSource.lowpass.connect(filteredSource.highpass);
    filteredSource.highpass.connect(filteredSource.gain);
    // filteredSource.gain.connect(context.destination);
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

    const maxFrequency = frequencies.reduce((a,b)=>Math.max(a,b));

    for(let i = 0; i < frequencies.length; i++){
      sources.push(this.createFilteredSource(dataBuffers[i], frequencies[i], 0.707, 1, context));
    }
    return sources;
  }

  public diracDelta(length: number = 8192, offset: number = 0){
    const samples = new Float32Array(Array(length).fill(0)); 
    samples[offset] = 1;
    return samples;
  }

  async testFilters(frequencies, sampleRate=44100) {

    const samples = Array(frequencies.length).fill(0).map(x=>this.diracDelta());
    const offlineContext = this.createOfflineContext(1, samples[0].length, sampleRate);
    const sources = this.createFilteredSources(samples, frequencies, offlineContext);
    const merger = this.createMerger(sources.length, offlineContext);
    
    for(let i = 0; i<sources.length; i++){
      sources[i].gain.connect(merger, 0, i);
    }

    merger.connect(offlineContext.destination);
    sources.forEach(source => source.source.start());
    const impulseResponse = await this.renderContextAsync(offlineContext);
    const blob = wavAsBlob([normalize(impulseResponse.getChannelData(0))], { sampleRate, bitDepth: 32 });
    saveAs(blob, "testFilters.wav");

    // this.impulseResponse = audioEngine.context.createBufferSource(); 
  }

  public get sampleRate(){
    return this.context.sampleRate;
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



