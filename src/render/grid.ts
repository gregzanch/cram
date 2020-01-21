import * as THREE from 'three';
import shaders from './shaders/grid';
export default class Grid extends THREE.Mesh{
  constructor(width?: number | undefined, height?: number | undefined, widthSegments?: number | undefined, heightSegments?: number | undefined) {
    super();
    this.geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
    this.material = new THREE.ShaderMaterial({
      vertexShader: shaders.vs,
      fragmentShader: shaders.fs,
      visible: true,
      transparent: true,
      side: THREE.DoubleSide,
    })
    this.rotateX(Math.PI / 2);
  }
}