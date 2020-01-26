import Solver from './solver';
import * as THREE from 'three';
import Room from '../objects/room';
import { KeyValuePair } from '../common/key-value-pair';
import Container from '../objects/container';

export interface RayTracerParams {
  containers?: KeyValuePair<Container>;
  updateInterval?: number;
  reflectionOrder?: number;
}

export const defaults = {
  containers: ({} as KeyValuePair<Container>),
  updateInterval: 20,
  reflectionOrder: 20
}

export default class RayTracer extends Solver {
  containers!: KeyValuePair<Container>;
  updateInterval!: number;
  reflectionOrder!: number;
  constructor(params: RayTracerParams) { 
    super(params);
    const para = { ...defaults, ...params };
    Object.keys(para).forEach(key => {
      this[key] = para[key];
    });
  }
  ensureSourceExists() {
    for (const key in this.containers) {
      if (this.containers[key].kind === "source") {
        return true;
      }
    }
    return false;
  }
}