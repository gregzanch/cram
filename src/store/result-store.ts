import create from "zustand";
import produce from "immer";
import { KeyValuePair } from "../common/key-value-pair";
import { SetFunction } from ".";
import { on } from '../messenger';
// import { ChartDataSets } from 'chart.js';


export type XY = {
  x: number;
  y: number;
}

export interface Result {
  name: string;
  data: XY[];
  uuid: string;
}

export type ResultStore = {
  results: KeyValuePair<Result>;
  openTabIndex: number;
  set: SetFunction<ResultStore>;
}

export const useResult = create<ResultStore>((set)=>({
  results: {},
  openTabIndex: 0,
  set: (fn) => set(produce(fn))
}));

export const getResultKeys = () => Object.keys(useResult.getState().results);


declare global {
  interface EventTypes {
    ADD_RESULT: Result;
    UPDATE_RESULT: { uuid: string, result: Result };
  }
}

on("ADD_RESULT", (result) => {
  useResult.getState().set((store) => void (store.results[result.uuid] = result));
});

on("UPDATE_RESULT", ({ uuid, result }) => {
  useResult.getState().set((store) => void (store.results[result.uuid] = result));
})