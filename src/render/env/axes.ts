import * as THREE from "three";

import Container from "../../objects/container";

export interface AxesProps {
  Xaxis?: boolean;
  Yaxis?: boolean;
  Zaxis?: boolean;
}


export default class Axes extends Container {
  Xaxis: THREE.Line;
  Yaxis: THREE.Line;
  Zaxis: THREE.Line;
	constructor(name?: string, props?: AxesProps) {
		super(name || "axes");
		this.Xaxis = new THREE.Line(this.makeLine(
			new THREE.Vector3(-1000, 0, 0),
			new THREE.Vector3(+1000, 0, 0)
    ), new THREE.LineBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3,
      visible: (props && props.Xaxis) || true
    }));

    this.Yaxis = new THREE.Line(
		this.makeLine(
			new THREE.Vector3(0, -1000, 0),
			new THREE.Vector3(0, +1000, 0)
		),
		new THREE.LineBasicMaterial({
			color: 0x38a10c,
			transparent: true,
			opacity: 0.3,
			visible: (props && props.Yaxis) || true
		})
	);

		this.Zaxis = new THREE.Line(
			this.makeLine(
				new THREE.Vector3(0, 0, -1000),
				new THREE.Vector3(0, 0, +1000)
			),
			new THREE.LineBasicMaterial({
				color: 0x0000ff,
				transparent: true,
				opacity: 0.3,
				visible: (props && props.Zaxis) || false
			})
		);
    
    this.add(this.Xaxis, this.Yaxis, this.Zaxis);
  }
  makeLine(start: THREE.Vector3, end: THREE.Vector3) {
    const geometry = new THREE.Geometry();
		geometry.vertices.push(start);
    geometry.vertices.push(end);
    return geometry;
  }
}
