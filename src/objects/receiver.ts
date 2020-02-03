
import * as THREE from "three";
import Container, { ContainerProps } from "./container";

export interface ReceiverProps extends ContainerProps{
        
}

export default class Receiver extends Container{
    constructor(name: string, props?: ReceiverProps) {
        super(name);
        this.kind = "receiver";
        this.add(new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xA2C982,
                reflectivity: 0.5,
            })
        ));
    }
}