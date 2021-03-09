import create from "zustand";
import produce from "immer";
import { KeyValuePair } from "../common/key-value-pair";
import { SetFunction } from ".";
import Container from "../objects/container";



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

export const getContainerKeys = () => Object.keys(useContainer.getState().containers);