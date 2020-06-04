import { uuid } from 'uuidv4';

export interface AudioFileProps{
  name: string;
  filename: string;
  duration: number;
  length: number;
  numberOfChannels: number;
  channelData: Float32Array[];
  sampleRate: number;
}
export class AudioFile {
  uuid: string;
  name: string;
  filename: string;
  duration: number;
  length: number;
  numberOfChannels: number;
  sampleRate: number;
  channelData: Float32Array[];
  constructor(props: AudioFileProps) {
    this.uuid = uuid();
    this.name = props.name;
    this.filename = props.filename;
    this.duration = props.duration;
    this.sampleRate = props.sampleRate;
    this.length = props.length;
    this.numberOfChannels = props.numberOfChannels;
    this.channelData = props.channelData;
  }
  downsample(sampleRate: number) {
    const fs1 = this.sampleRate;
    const nsamples = this.channelData[0].length;
    const fs2 = sampleRate;
    const step = fs1 / fs2;
    const ksamples = nsamples / step;
    const newChannelData = [] as Float32Array[];
    for (let i = 0; i < this.numberOfChannels; i++){
      const newsamples = new Float32Array(ksamples-1);
      for (let j = 0; j < ksamples-1; j++) {
        let n = j * step;
        let n0 = Math.floor(n);
        let n1 = n0 + 1;
        let frac = n - Math.floor(n);
        let newsample = this.channelData[i][n0] + (this.channelData[i][n1] - this.channelData[i][n0]) * frac;
        newsamples[j] = newsample;
      }
      newChannelData.push(newsamples);
    }
    return newChannelData;
  }
}

export default AudioFile;