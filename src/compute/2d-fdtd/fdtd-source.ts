import map from '../../common/map';
import { Vector3 } from 'three';

export interface FDTDSourceProps {
  x: number;
  y: number;
  amplitude: number;
  frequency: number;
  phase: number;
}

class FDTDSource{
  x: number;
  y: number;

  amplitude: number;
  frequency: number;
  phase: number;
  value: number;
  previousValue: number;
  velocity: number;
  rgba: number[];
  previousX: number;
  previousY: number;
  shouldClearPreviousPosition: boolean;
  constructor(props: FDTDSourceProps) {
    this.x = props.x;
    this.y = props.y;

    this.previousX = this.x;
    this.previousY = this.y;
    this.shouldClearPreviousPosition = false;
    this.amplitude = props.amplitude;
    this.frequency = props.frequency;
    this.phase = props.phase;
    this.value = 0;
    this.previousValue = 0;
    this.velocity = 0;
    this.rgba = [0, 0, 0, 1];
    this.update = this.update.bind(this);
  }
  update(time: number) {
    this.previousValue = this.value;
    this.value = this.amplitude * Math.sin(2 * Math.PI * this.frequency * time + this.phase);
    this.velocity = this.value - this.previousValue;
    this.rgba[0] = map(this.value, -100, 100, 0, 255);
    this.rgba[1] = map(this.velocity, -100, 100, 0, 255);
    this.rgba[3] = 0;
  }
  move(x: number, y: number) {
    this.previousX = this.x;
    this.previousY = this.y;
    this.x = x;
    this.y = y;
    this.shouldClearPreviousPosition = true;
  }
}

export {
  FDTDSource
}

export default FDTDSource;