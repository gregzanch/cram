import create from "zustand";
import { Searcher } from "fast-fuzzy";
import produce from "immer";
import { KeyValuePair } from "../common/key-value-pair";
import Container from "../objects/container";




// export type SettingsStore = {
//   containers: KeyValuePair<Container>;
//   selectedObjects: Set<string>;
//   set: SetFunction<ContainerStore>;
// };

// export const useContainer = create<ContainerStore>((set) => ({
//   containers: {},
//   selectedObjects: new Set(),
//   set: (fn) => set(produce(fn))
// }));

// export const addContainer = <T extends Container>(ContainerClass: new() => T) => (container: T|undefined) => {
//   const c = container || new ContainerClass() as T;
//   useContainer.setState((state) => ({ 
//     ...state, 
//     containers: {
//       ...state.containers, 
//       [c!.uuid]: c
//     } 
//   }), true);
// };
