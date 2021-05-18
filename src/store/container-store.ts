import create from "zustand";
import produce from "immer";
import { KeyValuePair } from "../common/key-value-pair";
import Container from "../objects/container";
import { AllowedNames, omit, filterObjectToArray, reach } from '../common/helpers';
import {renderer} from '../render/renderer';
import { Room } from "../objects";
import Solver from "../compute/solver";

export type ContainerStore = {
  containers: KeyValuePair<Container>;
  selectedObjects: Set<Container>;
  set: SetFunction<ContainerStore>;
  getWorkspace: () => THREE.Object3D | null;
  getRooms: () => Room[];
  withProperties: (propertiesGetter: (container: Container) => Partial<Container>) => Map<string, Partial<Container>>
  withProperty: <T>(propertyGetter: (container: Container) => T) => Map<string, T>
};

const getWorkspace = (containers: KeyValuePair<Container>) => {
  const keys= Object.keys(containers);
  if(keys.length > 0){
    let parent = containers[keys[0]] as THREE.Object3D;
    while(parent.parent && !parent.userData.hasOwnProperty("isWorkspace")){
      parent = parent.parent;
    }
    return parent;
  }
  return null;
}

const getRoomKeys = (containers: KeyValuePair<Container>) => {
  return Object.keys(containers).filter(key=>containers[key].kind === "room")
}

const getRooms = (containers: KeyValuePair<Container>) => {
  return getRoomKeys(containers).map(key=>containers[key] as Room);
} 

export const useContainer = create<ContainerStore>((set, get) => ({
  containers: {},
  selectedObjects: new Set(),
  set: (fn) => set(produce(fn)),
  getWorkspace: () => getWorkspace(get().containers),
  getRooms: () => getRooms(get().containers),
  withProperties: (propertiesGetter: (container: Container) => Partial<Container> ) => {
    const containers = get().containers;
    const containerMap = new Map<string, Partial<Container>>();
    Object.keys(containers).forEach(key=>{
      containerMap.set(key, propertiesGetter(containers[key]))
    });
    return containerMap;
  },
  withProperty:  <T>(propertyGetter: (container: Container) => T) => {
    const containers = get().containers;
    const containerMap = new Map<string, T>();
    Object.keys(containers).forEach(key=>{
      containerMap.set(key, propertyGetter(containers[key]))
    });
    return containerMap;
  },
}));

export const addContainer = <T extends Container>(ContainerClass: new(...args) => T) => (container: T|undefined) => {
  const c = container || new ContainerClass() as T;
  useContainer.setState((state) => ({ 
    ...state, 
    containers: {
      ...state.containers, 
      [c!.uuid]: c
    } 
  }), true);
};

export const removeContainer = (uuid: keyof ContainerStore['containers']) => {
  if(useContainer.getState().containers[uuid]){
    useContainer.getState().containers[uuid].dispose();
    // console.log(uuid);
    useContainer.getState().set(store=>{
      store.selectedObjects.delete(useContainer.getState().containers[uuid]);
    });
    useContainer.setState(state => ({
      ...state, 
      containers: omit([uuid], state.containers)
    }), true);

  }
}


export const setContainerProperty = ({uuid, property, value}) => {
  useContainer.getState().set(store => {
    store.containers[uuid][property]=value;
  });
}

export const setNestedContainerProperty = ({path, property, value}) => {
  useContainer.getState().set(store => {
    const container = reach(store.containers, path);
    if(container && container.hasOwnProperty(property)){
      container[property] = value;
    }
  });
}

export const callContainerMethod = ({uuid, method, args}) => {
  useContainer.getState().set(store => {
    store.containers[uuid][method](...args);
  });
}


export const getContainerKeys = () => Object.keys(useContainer.getState().containers);


declare global {
  type CallMethodArgs<T extends Object, K extends AllowedNames<T, Function>> = {
    uuid: string;
    method: K;
    isAsync?: boolean;
    args?: Parameters<T[K]>
  }
  type CallContainerMethod<T extends Container> = CallMethodArgs<T, AllowedNames<T, Function>>;
  type CallSolverMethod<T extends Solver> = CallMethodArgs<T, AllowedNames<T, Function>>;
}

