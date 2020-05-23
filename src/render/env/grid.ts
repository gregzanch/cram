import * as THREE from 'three';
import Container from '../../objects/container';
import { TEXTURE_CHECKER } from '../../objects/asset-store';
import { ModifiedGridHelper } from './modified-grid-helper.js';

export interface GridProps {
	size?: number;
	cellSize?: number;
	majorLinesEvery?: number;
	color1?: number;
	color2?: number;
	fill?: boolean;
}


export default class Grid extends Container{
	gridHelper: ModifiedGridHelper;
	majorGridHelper: ModifiedGridHelper;
  constructor(name?: string, props?: GridProps) {
		super(name || "grid");

 
		
		const size = (props && props.size) || 1000;
		const cellSize = (props && props.cellSize) || 1;
		const majorLinesEvery = (props && props.majorLinesEvery) || 10;
		const divisions = size/cellSize;
		const color1 = (props && props.color1) || 0xd4d6d8;
		const color2 = (props && props.color2) || 0xe4e7e8;
		

		TEXTURE_CHECKER.wrapS = THREE.RepeatWrapping;
		TEXTURE_CHECKER.wrapT = THREE.RepeatWrapping;
		TEXTURE_CHECKER.magFilter = THREE.NearestFilter;
    TEXTURE_CHECKER.repeat.set(divisions/2, divisions/2);

		const planeGeo = new THREE.PlaneBufferGeometry(size, size);
		planeGeo.name = "grid-checkered-plane-geometry";
		const planeMat = new THREE.MeshPhongMaterial({
			fog: true,
      map: TEXTURE_CHECKER,
			side: THREE.FrontSide,
			transparent: true,
			opacity: 0.025,
			name: "grid-checkered-material"
		});
    const mesh = new THREE.Mesh(planeGeo, planeMat);

		
		this.gridHelper = new ModifiedGridHelper(size, divisions, color1, color2, i=>i%majorLinesEvery!=0);
		this.gridHelper.renderOrder = -1;
		const material = this.gridHelper.material as THREE.LineBasicMaterial;
		material.fog = true;
	  material.transparent = true;
	  material.opacity = 0.1;
	  material.color.setRGB(0, 0, 0);
		this.add(this.gridHelper);
		
		this.majorGridHelper = new ModifiedGridHelper(size, divisions, color1, color2, (i) => i % majorLinesEvery == 0 && i != divisions/2);
		this.majorGridHelper.renderOrder = -0.5;
		const majorMaterial = this.majorGridHelper.material as THREE.LineBasicMaterial;
		majorMaterial.fog = true;
    majorMaterial.transparent = true;
    majorMaterial.opacity = 0.2;
    majorMaterial.color.setRGB(0, 0, 0);
    this.add(this.majorGridHelper);
		
	  this.add(mesh);
	}
	get mesh() {
		return this.children[2];
	}
}
