import * as THREE from "three";
import Container from "../objects/container";
import { SPRITE_CURSOR } from '../objects/asset-store';

class Cursor extends Container {
  sprite: THREE.Sprite;
  constructor() {
    super("cursor");

    const material = new THREE.SpriteMaterial({
      sizeAttenuation: false,
      side: THREE.DoubleSide,
      map: SPRITE_CURSOR,
      depthTest: false,
      fog: false,
      name: "cursor-material",
      transparent: true,
      blending: THREE.MultiplyBlending,
      polygonOffset: true,
      polygonOffsetFactor: 0.01
    });
    this.sprite = new THREE.Sprite(material);
    this.sprite.scale.setScalar(0.045);
    this.sprite.renderOrder = 0.1;
    this.add(this.sprite);
  }
}

export {
  Cursor
}

export default Cursor;