import create from "zustand";
import shallow from "zustand/shallow";
import Container from "../objects/container";
import { Report } from "../common/browser-report";
import { KeyValuePair } from "../common/key-value-pair";
import { EditorModes } from "../constants";
import { Processes } from "../constants/processes";
import { Setting } from "../setting";
import SettingsManager from "../settings-manager";
import Renderer from "../render/renderer";


import produce from "immer";
import { omit } from "../common/helpers";
import Solver from "../compute/solver";


export * from './container-store';
export * from './material-store';
export * from './result-store';
export * from './solver-store';
export * from './app-store';



export type SetFunction<T> = (fn: (store: T, overwrite?: boolean) => void) => void;





declare global {
  interface SetPropertyPayload<T> {
    uuid: string;
    property: keyof T;
    value: T[SetPropertyPayload<T>["property"]];
  }
}


