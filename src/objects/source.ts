import * as THREE from "three";
import Container, { ContainerProps } from "./container";

export interface SourceProps extends ContainerProps {
  f?: (t: number) => number;
  theta?: number;
  phi?: number;
}

export default class Source extends Container {
  f: (t: number) => number;
  theta: number;
  phi: number;
  numRays: number;
  constructor(name: string, props?: SourceProps) {
    super(name);
    this.kind = "source";
    this.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({
          color: 0xa2c982,
          reflectivity: 0.5
        })
      )
    );
    this.f = (props && props.f) || (t => Math.sin(t));
    this.theta = (props && props.theta) || 1;
    this.phi = (props && props.phi) || 1;
    this.numRays = 0;
  }
}
