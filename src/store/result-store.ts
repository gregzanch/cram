import create from "zustand";
import produce from "immer";
import { KeyValuePair } from "../common/key-value-pair";
import { on } from '../messenger';
import { result } from "lodash";
import { omit } from "../common/helpers";
// import { ChartDataSets } from 'chart.js';


export enum ResultKind {
  LevelTimeProgression = "LevelTimeProgression",
  Default = "Default"
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
});

on("UPDATE_RESULT", ({ uuid, result }) => {
  useResult.getState().set((store) => void (store.results[result.uuid] = result));
});

on("REMOVE_RESULT", ( uuid ) => {
  useResult.getState().set((store) => {
    store.results = omit([uuid], store.results)
  });
});

