import * as THREE from 'three';
import Container from '../../objects/container';

export interface GridProps {
	size?: number;
	divisions?: number;
	color1?: number;
	color2?: number;
}

export default class Grid extends Container{
	gridHelper: THREE.GridHelper;
  constructor(name?: string, props?: GridProps) {
		super(name || "grid");

		this.gridHelper = new THREE.GridHelper(
			(props && props.size) || 1000,
			(props && props.divisions) || 100,
			(props && props.color1) || 0xd4d6d8,
			(props && props.color2) || 0xe4e7e8
		);
		
		((this.gridHelper.geometry as THREE.BufferGeometry).getAttribute("position") as THREE.BufferAttribute).setXYZ(200, 0, 0, 0);
		((this.gridHelper.geometry as THREE.BufferGeometry).getAttribute("position") as THREE.BufferAttribute).setXYZ(201, 0, 0, 0);
		((this.gridHelper.geometry as THREE.BufferGeometry).getAttribute("position") as THREE.BufferAttribute).setXYZ(202, 0, 0, 0);
		((this.gridHelper.geometry as THREE.BufferGeometry).getAttribute("position") as THREE.BufferAttribute).setXYZ(203, 0, 0, 0);
		
		


	  this.gridHelper.rotation.set(Math.PI / 2, 0, 0, "XYZ");
	  const material = this.gridHelper.material as THREE.LineBasicMaterial;
	  material.transparent = true;
	  material.opacity = 0.2;
	  material.color.setRGB(0, 0, 0);
	  this.add(this.gridHelper);
  }
}
