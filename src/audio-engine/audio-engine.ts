

//@ts-ignore
const AudioContext = (window.AudioContext || window.webkitAudioContext);

export class AudioEngine {
  context: AudioContext
  constructor(){
    this.context = new AudioContext();
  }
  public createBufferSource(data: Float32Array){
    const source = this.context.createBufferSource();
    source.buffer = this.context.createBuffer(1, data.length, this.context.sampleRate) 
    source.buffer.copyToChannel(data, 0);
    return source;
  }

  public createBandpassFilter(frequency: number, Q: number = 1.414){
    const filter = this.context.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(Q, this.context.currentTime);
    filter.frequency.setValueAtTime(frequency, this.context.currentTime);
    return filter;
  }

  public createGainNode(value: number){
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(value, this.context.currentTime);
    return gain;
  }

  public createMerger(count: number){
    return this.context.createChannelMerger(count);
  }

  // public createFilteredSources

}

export const audioEngine = new AudioEngine();

