import * as THREE from "three";
import Container from "../objects/container";

export default class PickHelper {
  pickPosition: { x: number; y: number; };
  raycaster: THREE.Raycaster;
  pickedObject: any;
  pickedObjectSavedColor: number;
  hover: null;
  scene: any;
  camera: any;
  objects: Container[];
  mount: any;
  constructor(scene, camera, mount) {
    this.pickPosition = { x: 0, y: 0 };
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
    this.hover = null;
    this.scene = scene;
    this.camera = camera;
    this.objects = [] as Container[];
    this.mount = mount;
  }

  pick(event, objects = this.objects, scene = this.scene, camera=this.camera, mount=this.mount) {
    this.setPickPosition(event, mount);
    this.raycaster.setFromCamera(this.pickPosition, this.camera);

    const intersectedObjects = this.raycaster.intersectObjects(objects, true);
    if (intersectedObjects.length) {
      let i = 0;
      let found = false;
      while (!found && i < intersectedObjects.length) {
        //@ts-ignore
        if (intersectedObjects[i]?.object?.parent?.kind.match(/source|receiver/gmi)) {
          this.pickedObject = intersectedObjects[i].object.parent;
          found = true;
        }
        i++;
      }
      if (!found) {
        this.pickedObject = intersectedObjects[0].object.parent;
      }
    } else {
      this.pickedObject = false;
    }
    return this.pickedObject;
  }

  pickOnce(event, scene, camera, mount) {
    this.setPickPosition(event, mount);
    let normalizedPosition = this.pickPosition;

    this.raycaster.setFromCamera(normalizedPosition, camera);

    const intersectedObjects = this.raycaster.intersectObjects(scene.children, true);
    if (intersectedObjects.length) {
      if (intersectedObjects[0].object === this.pickedObject) {
        return false;
      }
      this.pickedObject = intersectedObjects[0].object;
    } else {
      this.pickedObject = false;
    }
    return this.pickedObject;
  }

  pickCenter(scene, camera, mount) {
    this.setPickPositionCenter(mount);
    let normalizedPosition = this.pickPosition;

    this.raycaster.setFromCamera(normalizedPosition, camera);

    const intersectedObjects = this.raycaster.intersectObjects(scene.children, true);
    if (intersectedObjects.length) {
      this.pickedObject = intersectedObjects[0].object;
    } else {
      this.pickedObject = false;
    }
    return this.pickedObject;
  }

  setPickPosition(event, mount) {
    const pos = this.getCanvasRelativePosition(event, mount);
    // console.log(pos);
    // console.log(mount.clientWidth, mount.clientHeight);
    this.pickPosition.x = (pos.x / mount.clientWidth) * 2 - 1;
    this.pickPosition.y = (pos.y / mount.clientHeight) * -2 + 1;
  }

  setPickPositionCenter(mount) {
    const pos = { x: mount.clientWidth / 2, y: mount.clientHeight / 2 };
    this.pickPosition.x = (pos.x / mount.clientWidth) * 2 - 1;
    this.pickPosition.y = (pos.y / mount.clientHeight) * -2 + 1;
  }

  getCanvasRelativePosition(event, mount) {
    const rect = mount.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  clearPickPosition() {
    this.pickPosition.x = -100000;
    this.pickPosition.y = -100000;
  }
}
