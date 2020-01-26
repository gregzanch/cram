import * as THREE from "three";
import Container from "../../objects/container";

export default class Lights extends Container{
  constructor(name?: string) {
    super(name || "lights");
		this.add(new Container("ambientLights"));
    this.add(new Container("geomertyLights"));
    this.add(new Container("helpers"));
    this.ambientLights.add(new THREE.AmbientLight(0xffffff, 5))
    
    // for (let i = 0; i < 8; i++) {
    //   const color = 0xffffff;
    //   const intensity = 1;
    //   const pointlight = new THREE.PointLight(color, intensity);
    //   this.geometryLights.add(pointlight);
      
    //   const size = .1;
    //   const helperColor = 0xc4c6c8;
    //   const helper = new THREE.PointLightHelper(pointlight, size, helperColor);
    //   this.helpers.add(helper);
    // }
  }
  setHelpersVisible(visible) {
    this.helpers.visible = visible;
  }
  get ambientLights() {
    return this.children[0];
  }
  get geometryLights() {
    return this.children[1];
  }
  get helpers() {
    return this.children[2];
  }
}
