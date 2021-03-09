import create from "zustand";
import produce from "immer";

type Version = `${number}.${number}.${number}`;

export type AppStore = {
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
  canUndo: boolean,
  canRedo: boolean,
  set: (fn: (draft: AppStore) => void) => void;
};



export const useAppStore = create<AppStore>((set) => ({
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
  set: (fn: (draft: AppStore) => void) => set(produce(fn))
}));



export default useAppStore;
