import * as THREE from "three";
import Container, { ContainerProps } from "./container";
import { MATCAP_PORCELAIN_WHITE } from './asset-store';

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
    
    const material = this.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 32, 16),
          // pointsGeometry,
          // pointsMaterial,
          new THREE.MeshMatcapMaterial({
            color: 0xa2c982,
            matcap: MATCAP_PORCELAIN_WHITE,
            
          })
        )
      );
    this.f = (props && props.f) || (t => Math.sin(t));
    this.theta = (props && props.theta) || Math.PI/4;
    this.phi = (props && props.phi) || Math.PI/2;
    this.numRays = 0;
        this.select = () => {
          this.selected = true;
          console.log("source selected");
        };
        this.deselect = () => {
          this.selected = false;
        };
  }

}
