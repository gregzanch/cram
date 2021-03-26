import create from "zustand";
import produce from "immer";
import { on } from "../messenger";


export type HistoryStore = {};

export const useHistory = create<HistoryStore>((set) => ({}));

declare global {
  interface EventTypes {
    UNDO: undefined;
    REDO: undefined;
  }
}

on("UNDO", () => {})
on("REDO", () => {})

export default useHistory;
