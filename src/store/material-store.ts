import create from "zustand";
import { Searcher } from "fast-fuzzy";
import produce from "immer";
import materials from "../db/material.json";

export const useMaterial = create((set) => ({
  materials,
  materialSearcher: new Searcher(materials, {
    keySelector: (obj) => obj.material
  }),
  set: (fn) => set(produce(fn))
}));
