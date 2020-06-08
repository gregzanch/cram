
import * as THREE from 'three';
import Container from './container';

export interface ConstructionAxisProps {
  /** starting point */
  p0: THREE.Vector3;
  
  /** ending point */
  p1: THREE.Vector3;
  
  /** axis color */
  color?: number;
}

class ConstructionAxis extends Container {
  line: THREE.Line;
  constructor(name: string, props: ConstructionAxisProps) {
    super(name);
    this.kind = "construction-axis";
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([props.p0.x, props.p0.y, props.p0.z, props.p1.x, props.p1.y, props.p1.z]),
        3,
        false
      )
    );

    const material = new THREE.LineDashedMaterial({
      color: props.color || 0xbc7904,
      transparent: true,
      opacity: 0.15,
      dashSize: 0.5,
      gapSize: 0.125
    });

    this.line = new THREE.Line(geometry, material);
    this.renderOrder = -1.0;
    this.line.computeLineDistances();
    this.add(this.line);
  }
  select() {
    this.selected = true;
    (this.line.material as THREE.LineDashedMaterial).opacity = 1.0;
  }
  deselect() {
    this.selected = false;
    (this.line.material as THREE.LineDashedMaterial).opacity = 0.15;
  }
}

export { ConstructionAxis }
export default ConstructionAxis;