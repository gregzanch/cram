import * as THREE from "three";
import Container from "../../objects/container";

export default class Lights extends Container{
  constructor(name?: string) {
    super(name || "lights");
		this.add(new Container("ambientLights"));
    this.add(new Container("geometryLights"));
    this.add(new Container("helpers"));
    this.ambientLights.add(new THREE.AmbientLight(0xffffff, 1))
    
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    // this.geometryLights.add(light);
      
    const size = 1;
    const helperColor = 0x000000;
    const helper = new THREE.DirectionalLightHelper(light,size,helperColor);
    // this.helpers.add(helper);
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
