import * as THREE from 'three';
import Container from '../../objects/container';
import { TEXTURE_CHECKER } from '../../objects/asset-store';

export interface GridProps {
	size?: number;
	divisions?: number;
	color1?: number;
	color2?: number;
	fill?: boolean;
}

export default class Grid extends Container{
	gridHelper: THREE.GridHelper;
  constructor(name?: string, props?: GridProps) {
		super(name || "grid");

 
		
		const size = (props && props.size) || 1000;
		const divisions = (props && props.divisions) || 100;
		const color1 = (props && props.color1) || 0xd4d6d8;
		const color2 = (props && props.color2) || 0xe4e7e8;
		

		TEXTURE_CHECKER.wrapS = THREE.RepeatWrapping;
		TEXTURE_CHECKER.wrapT = THREE.RepeatWrapping;
		TEXTURE_CHECKER.magFilter = THREE.NearestFilter;
    TEXTURE_CHECKER.repeat.set(size/20, size/20);

    const planeGeo = new THREE.PlaneBufferGeometry(size, size);
    const planeMat = new THREE.MeshPhongMaterial({
      map: TEXTURE_CHECKER,
			side: THREE.FrontSide,
			transparent: true,
			opacity: 0.05,
		});
    const mesh = new THREE.Mesh(planeGeo, planeMat);

		
		this.gridHelper = new THREE.GridHelper(size, divisions, color1, color2);
		((this.gridHelper.geometry as THREE.BufferGeometry).getAttribute("position") as THREE.BufferAttribute).setXYZ(200, 0, 0, 0);
		((this.gridHelper.geometry as THREE.BufferGeometry).getAttribute("position") as THREE.BufferAttribute).setXYZ(201, 0, 0, 0);
		((this.gridHelper.geometry as THREE.BufferGeometry).getAttribute("position") as THREE.BufferAttribute).setXYZ(202, 0, 0, 0);
		((this.gridHelper.geometry as THREE.BufferGeometry).getAttribute("position") as THREE.BufferAttribute).setXYZ(203, 0, 0, 0);
		

		this.gridHelper.rotation.set(Math.PI / 2, 0, 0, "XYZ");
		this.gridHelper.renderOrder = -1;
	  const material = this.gridHelper.material as THREE.LineBasicMaterial;
	  material.transparent = true;
	  material.opacity = 0.2;
	  material.color.setRGB(0, 0, 0);
	  this.add(this.gridHelper);
	  this.add(mesh);
	}
	get mesh() {
		return this.children[1];
	}
}
