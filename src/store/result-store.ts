import create from "zustand";
import produce from "immer";
import { KeyValuePair } from "../common/key-value-pair";
import { emit, on } from '../messenger';
import { result } from "lodash";
import { omit } from "../common/helpers";
import useAppStore from "./app-store";
// import { ChartDataSets } from 'chart.js';


export enum ResultKind {
  LevelTimeProgression = "linear-time-progression",
  Default = "default",
  StatisticalRT60 = "statisticalRT60"
}


export interface ResultTypes {
  [ResultKind.Default]: {
    info: {};
    data: number[];
  };
  [ResultKind.LevelTimeProgression]: {
    info: {
      initialSPL: number[];
      frequency: number[];
      maxOrder: number;
    };
    data: { 
      time: number, 
      pressure: number[], 
      order: number, 
      arrival: number 
      uuid: string
    }[];
  }
  [ResultKind.StatisticalRT60]: {
    info: {
      frequency: number[];
      airabsorption: boolean;
      humidity: number;
      temperature: number; 
    };
    data: {
      sabine: number; 
      eyring: number;
      ap: number;
      frequency: number; 
    }[];
  }
}

export interface Result<Kind extends ResultKind> {
  kind: Kind;
  info: ResultTypes[Kind]["info"];
  data: ResultTypes[Kind]["data"];
  name: string;
  uuid: string;
  /**
   * the uuid of this 
   */
  from: string;
}



export type ResultStore = {
  results: KeyValuePair<Result<ResultKind>>;
  openTabIndex: number;
  set: SetFunction<ResultStore>;
}

export const useResult = create<ResultStore>((set)=>({
  results: {},
  openTabIndex: 0,
  set: (fn) => set(produce(fn))
}));

export const getResultKeys = () => Object.keys(useResult.getState().results);

export interface ResultEvent<Kind extends ResultKind> {
  uuid: string;
  item: ResultTypes[Kind]["data"]
}

declare global {
  interface EventTypes {
    ADD_RESULT: Result<ResultKind>;
    UPDATE_RESULT: { uuid: string, result: Result<ResultKind> };
    REMOVE_RESULT: string;
    RESULT_DATA_CLICKED: ResultEvent<ResultKind>
  }
}

on("ADD_RESULT", (result) => {
  useResult.getState().set((store) => void (store.results[result.uuid] = result));
  if(!useAppStore.getState().resultsPanelOpen) emit("TOGGLE_RESULTS_PANEL", true);
});

on("UPDATE_RESULT", ({ uuid, result }) => {
  useResult.getState().set((store) => void (store.results[result.uuid] = result));
  if(!useAppStore.getState().resultsPanelOpen) emit("TOGGLE_RESULTS_PANEL", true);
});

on("REMOVE_RESULT", ( uuid ) => {
  useResult.getState().set((store) => {
    store.results = omit([uuid], store.results)
  });
});

