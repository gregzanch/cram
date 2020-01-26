
import * as THREE from "three";
import Container, { ContainerProps } from "./container";

export interface SourceProps extends ContainerProps{
        
}

export default class Source extends Container{
    constructor(name: string, props?: SourceProps) {
        super(name);
        this.kind = "source";
        this.add(new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xA2C982,
                reflectivity: 0.5,
            })
        ));
    }
}