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



export type SetFunction<T> = (fn: (store: T, overwrite?: boolean) => void) => void;


export * from './container-store';
export * from './material-store';
export * from './solver-store';




// todo remove
export type State = {
  renderer: Renderer;

  history: History;
  settings: {
    general: {
      fog_color: Setting<string>;
      default_save_name: Setting<string>;
    };
    editor: {
      transform_snap_fine: Setting<number>;
      transform_snap_normal: Setting<number>;
      transform_snap_coarse: Setting<number>;
    };
    keybindings: {
      SHOW_IMPORT_DIALOG: Setting<string>;
    };
  };
  settingsManagers: KeyValuePair<SettingsManager>;
  editorMode: EditorModes;
  currentProcess: Processes;
  browser: Report;
  projectName: string;
};

// create<State>((set) => ({
//   audiofiles: {} as KeyValuePair<AudioFile>,
//   time: 0,
//   selectedObjects: [] as Container[],
//   materials,
//   materialSearcher: new Searcher(materials, {
//     keySelector: (obj) => obj.material
//   }),
//   constructions: {} as KeyValuePair<Container>,
//   sketches: {} as KeyValuePair<Sketch>,
//   solvers: {} as KeyValuePair<Solver>,
//   simulation: "",
//   renderer: {} as Renderer,
//   history: new History(),
//   settings: defaultSettings as ApplicationSettings,
//   settingsManagers: {} as KeyValuePair<SettingsManager>,
//   editorMode: EditorModes.OBJECT as EditorModes,
//   currentProcess: Processes.NONE as Processes,
//   browser: browserReport(navigator.userAgent),
//   projectName: defaultSettings.general.default_save_name.value
// }));
