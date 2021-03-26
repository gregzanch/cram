import create from "zustand";
import { FullOptions, Searcher } from "fast-fuzzy";
import produce from "immer";
import materials from "../db/material.json";
import { AcousticMaterial } from "../db/acoustic-material";
import Surface from '../objects/surface';
import {on} from '../messenger';
import { useContainer } from "./container-store";
import { ensureArray } from "../common/helpers";
import { KeyValuePair } from "../common/key-value-pair";

export type MaterialStore = {
  materials: Map<string, AcousticMaterial>;
  materialSearcher: Searcher<AcousticMaterial, FullOptions<AcousticMaterial>>;
  search: (query: string) => ReturnType<MaterialStore["materialSearcher"]["search"]>;
  set: SetFunction<MaterialStore>;
  bufferLength: number;
  selectedMaterial: string;
  query: string;
}

export const useMaterial = create<MaterialStore>((set, get, api) => ({
  materials: new Map(materials.map(material=>[material.uuid, material] as [string, AcousticMaterial])),
  materialSearcher: new Searcher(materials, {
    keySelector: (obj) => obj.material
  }),
  search: (query: string) => query ? get().materialSearcher.search(query) : [...get().materials.values()],
  set: (fn) => set(produce(fn)),
  bufferLength: 30,
  selectedMaterial: "",
  query: ""
}));

declare global {
  interface EventTypes {
    ASSIGN_MATERIAL: {
      material: AcousticMaterial,
      target: Surface | Surface[]
    }
  }
}

on("ASSIGN_MATERIAL", ({material, target}) => {
  useContainer.getState().set((store)=> {
    ensureArray(target).forEach(surface => {
      (store.containers[surface.uuid] as Surface).acousticMaterial = material;
    })
  })
})

