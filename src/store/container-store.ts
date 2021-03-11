import create from "zustand";
import produce from "immer";
import { KeyValuePair } from "../common/key-value-pair";
import { SetFunction } from ".";
import Container from "../objects/container";
import { AllowedNames, omit } from '../common/helpers';


export type ContainerStore = {
  containers: KeyValuePair<Container>;
  selectedObjects: Set<string>;
  set: SetFunction<ContainerStore>;
};

export const useContainer = create<ContainerStore>((set) => ({
  containers: {},
  selectedObjects: new Set(),
  set: (fn) => set(produce(fn))
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
  useContainer.setState(state => ({
    ...state, 
    containers: omit([uuid], state.containers)
  }), true);
}


export const setContainerProperty = ({uuid, property, value}) => {
  useContainer.getState().set(store => {
    store.containers[uuid][property]=value;
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
    args?: Parameters<T[K]>
  }
  type CallContainerMethod<T extends Container> = CallMethodArgs<T, AllowedNames<T, Function>>;
}

