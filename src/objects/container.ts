import * as THREE from 'three';

type UserData =  {
  [key: string]: any;
}

export interface ContainerProps {
  userData?: UserData;
  children?: THREE.Object3D[]
}

export default class Container extends THREE.Group{
  constructor(name: string, props?: ContainerProps) {
    super();
    this.name = name;
    props && (() => { 
      for (const key in props) {
        this[key] = props[key];
      }
    })();
  }
  get x() {
    return this.position.x;
  }
  set x(val) {
    this.position.setX(val);
  }
  get y() {
    return this.position.y;
  }
  set y(val) {
    this.position.setY(val);
  }
  get z() {
    return this.position.z;
  }
  set z(val) {
    this.position.setZ(val);
  }
}