import * as THREE from "three";
import Container from "../objects/container";
import { TransformControls } from "./TransformControls";
type point = {
  x: number;
  y: number;
};
const dist = (p1: point, p2: THREE.Vector3) => Math.sqrt((p2.y - p1.y) ** 2 + (p2.x - p1.x) ** 2);
const THRESHOLD = 1e-8;
export default class PickHelper {
  pickPosition: { x: number; y: number };
  raycaster: THREE.Raycaster;
  pickedObject: any;
  pickedPoint: THREE.Vector3;
  pickedObjectSavedColor: number;
  hover: null;
  scene: any;
  camera: any;
  objects: Container[];
  mount: any;
  __pickedObject: any;
  __pickedPoint: any;
  constructor(scene, camera, mount) {
    this.pickPosition = { x: 0, y: 0 };
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedPoint = new THREE.Vector3(0, 0, 0);
    this.pickedObjectSavedColor = 0;
    this.hover = null;
    this.scene = scene;
    this.camera = camera;
    this.objects = [] as Container[];
    this.mount = mount;
  }

  // This really needs to be refactored... what a mess
  pick(event, objects = this.objects, scene = this.scene, camera = this.camera, mount = this.mount) {
    this.setPickPosition(event, mount);
    this.raycaster.setFromCamera(this.pickPosition, this.camera);

    const intersectedObjects = this.raycaster.intersectObjects(objects, true);

    if (intersectedObjects.length) {
      let i = 0;
      let clickedOnSourceReceiver = false;
      let sourceReceiverIndex = 0;
      let clickedOnTransformControl = false;
      let transformControlIndex = 0;

      // console.log(intersectedObjects);

      const indicesWithinThreshold = [] as number[];
      for (let i = 0; i < intersectedObjects.length; i++) {
        const d = dist(this.pickPosition, intersectedObjects[i].point.clone().project(this.camera));
        if (d < THRESHOLD) {
          indicesWithinThreshold.push(i);
        }

        //@ts-ignore
        if (
          intersectedObjects[i].object instanceof TransformControls ||
          intersectedObjects[i].object.parent instanceof TransformControls ||
          (intersectedObjects[i].object &&
            intersectedObjects[i].object.parent &&
            // @ts-ignore
            intersectedObjects[i].object.parent["parent"] &&
            // @ts-ignore
            (intersectedObjects[i].object.parent["parent"]["type"] === "TransformControlsGizmo" ||
              // @ts-ignore
              intersectedObjects[i].object.parent["parent"]["type"] === "TransformControls"))
        ) {
          clickedOnTransformControl = true;
          transformControlIndex = i;
        } else if (
          intersectedObjects[i].object &&
          intersectedObjects[i].object.parent &&
          //@ts-ignore
          intersectedObjects[i].object.parent["kind"] &&
          //@ts-ignore
          intersectedObjects[i].object.parent["kind"].match(/source|receiver/gim)
        ) {
          clickedOnSourceReceiver = true;
          sourceReceiverIndex = i;
        }
      }

      if (clickedOnTransformControl) {
        return {
          clickedOnTransformControl,
          clickedOnSourceReceiver,
          pickedObject: intersectedObjects[transformControlIndex].object
        };
      } else if (clickedOnSourceReceiver) {
        this.pickedObject = intersectedObjects[sourceReceiverIndex].object.parent;
        this.pickedPoint = intersectedObjects[sourceReceiverIndex].point;

        return {
          clickedOnTransformControl,
          clickedOnSourceReceiver,
          pickedObject: this.pickedObject
        };
      } else if (indicesWithinThreshold[0]) {
        this.pickedObject = intersectedObjects[indicesWithinThreshold[0]].object.parent;
        this.pickedPoint = intersectedObjects[indicesWithinThreshold[0]].point;
        return {
          clickedOnSourceReceiver,
          clickedOnTransformControl,
          pickedObject: this.pickedObject
        };
      } else {
        this.pickedObject = intersectedObjects[0].object.parent;
        this.pickedPoint = intersectedObjects[0].point;
        return {
          clickedOnSourceReceiver,
          clickedOnTransformControl,
          pickedObject: this.pickedObject
        };
      }
    } else {
      this.pickedObject = false;
    }
    return {
      clickedOnSourceReceiver: false,
      clickedOnTransformControl: false,
      pickedObject: false
    };
  }

  getPickedPoint() {
    return [this.pickedPoint.x, this.pickedPoint.y, this.pickedPoint.z];
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
