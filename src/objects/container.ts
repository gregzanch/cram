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
}