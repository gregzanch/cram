export interface FDTDSourceProps {
  x: number;
  y: number;
  r: number;
  amplitude: number;
  frequency: number;
  phase: number;
}

class FDTDSource{
  x: number;
  y: number;
  r: number;
  amplitude: number;
  frequency: number;
  phase: number;
  value!: number;
  constructor(props: FDTDSourceProps) {
    this.x = props.x;
    this.y = props.y;
    this.r = props.r;
    this.amplitude = props.amplitude;
    this.frequency = props.frequency;
    this.phase = props.phase;
    this.value = 0;
    this.update = this.update.bind(this);
    this.update = this.update.bind(this);
  }
  update(time: number) {
    this.value = Math.round((this.amplitude * Math.sin(2 * Math.PI * this.frequency * time + this.phase) + 1) / 2 * 255);
    return this.value;
  }
  get fillStyle() {
    return "#"+this.value.toString(16) + "000000";
  }
}

export {
  FDTDSource
}

export default FDTDSource;