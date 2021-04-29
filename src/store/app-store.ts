import create from "zustand";
import produce from "immer";
import { on } from "../messenger";
import { Surface } from "../objects/surface";
import { UNITS } from "../enums/units";

type Version = `${number}.${number}.${number}`;

export type AppStore = {
  units: UNITS,
  version: Version,
  canDuplicate: boolean,
  rendererStatsVisible: boolean,
  saveDialogVisible: boolean,
  projectName: string,
  openWarningVisible: boolean,
  newWarningVisible: boolean,
  materialDrawerOpen: boolean,
  importDialogVisible: boolean,
  selectedObjects: string | undefined;
  settingsDrawerVisible: boolean,
  resultsPanelOpen: boolean;
  canUndo: boolean,
  canRedo: boolean,
  set: (fn: (draft: AppStore) => void) => void;
};



export const useAppStore = create<AppStore>((set) => ({
  units: UNITS.METERS,
  version: "0.2.1",
  canDuplicate: false,
  rendererStatsVisible: false,
  saveDialogVisible: false,
  projectName: "",
  openWarningVisible: false,
  newWarningVisible: false,
  importDialogVisible: false,
  selectedObjects: undefined,
  canRedo: false,
  canUndo: false,
  materialDrawerOpen: false,
  settingsDrawerVisible: false,
  resultsPanelOpen: false,
  set: (fn: (draft: AppStore) => void) => set(produce(fn))
}));

declare global {
  interface EventTypes {
    OPEN_MATERIAL_DRAWER: Surface | undefined;
    TOGGLE_MATERIAL_SEARCH: undefined;
  }
}

on("OPEN_MATERIAL_DRAWER", (surface) => {
  useAppStore.getState().set(draft => {
    draft.materialDrawerOpen = true;
  })
})

on("TOGGLE_MATERIAL_SEARCH", () => {
  useAppStore.getState().set(draft => {
    draft.materialDrawerOpen = true;
  })
})

on("TOGGLE_RESULTS_PANEL", (open) => {
  useAppStore.getState().set(draft => {
    if(typeof open !== "undefined"){
      draft.resultsPanelOpen = open;
    } else {
      draft.resultsPanelOpen = !draft.resultsPanelOpen;
    }
  })
})

export default useAppStore;
