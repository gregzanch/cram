
import * as THREE from "three";
import Container, { ContainerProps } from "./container";
import { MATCAP_PORCELAIN_WHITE, MATCAP_RAZIN } from './asset-store';

// import { vs, fs } from '../render/shaders/glow';

export interface ReceiverProps extends ContainerProps{
    
}

const defaults = {
  color: 0xdd6f6f
};

export default class Receiver extends Container{
  mesh: THREE.Mesh;
  constructor(name: string, props?: ReceiverProps) {
    super(name);
    this.kind = "receiver";
//     const glowmaterial = new THREE.ShaderMaterial({
//       uniforms: {
//         c: { type: "f", value: 1.0 },
//         p: { type: "f", value: 1.4 },
//         glowColor: { type: "c", value: new THREE.Color(0xffff00) },
//         viewVector: { type: "v3", value: camera.position }
//       },
//       vertexShader: vs,
//       fragmentShader: fs,
//       side: THREE.FrontSide,
//       blending: THREE.AdditiveBlending,
//       transparent: true
// });
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 32, 16),
      new THREE.MeshMatcapMaterial({
        color: defaults.color,
        matcap: MATCAP_PORCELAIN_WHITE,
      })
    );
    this.mesh.userData['kind'] = 'receiver';
    this.add(this.mesh);
    this.select = () => {
      this.selected = true;
      // this.mesh.
      console.log("receiver selected");
    };
    this.deselect = () => {
      this.selected = false;
    };
  }
  get color() {
      return String.fromCharCode(35)+(this.mesh.material as THREE.MeshBasicMaterial).color.getHexString();
  }
  set color(col: string) {
      (this.mesh.material as THREE.MeshBasicMaterial).color.setStyle(col)
  }

}