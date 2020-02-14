
import * as THREE from "three";
import Container, { ContainerProps } from "./container";
import { MATCAP_PORCELAIN_WHITE, MATCAP_RAZIN } from './asset-store';

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