// import hotkeys from 'hotkeys-js';
import { emit } from "../messenger";
import create from "zustand";
import produce from "immer";
import { on } from "../messenger";
import { Surface } from "../objects/surface";
import { KeyValuePair } from "../common/key-value-pair";
import { uuid } from "uuidv4";
import properCase from "../common/proper-case";
import hash from "object-hash";
// import HashMap from "../common/hash-map";
import hotkeys from "hotkeys-js";

export type Shortcut = {
  key: string;
  event: keyof EventTypes;
  scopes: Scopes[];
  name: string;
  description: string;
  args?: EventTypes[Shortcut["event"]];
};

export type ShortcutStore = {
  shortcuts: Map<string, Shortcut>;
  set: SetFunction<ShortcutStore>;
};

const defaultShortcuts = [{
    event: "SHOW_IMPORT_DIALOG",
    key: "ctrl+i, command+i",
    scopes: ["NORMAL", "EDITOR"],
    name: "Show Import Dialog",
    description: "Show import dialog"
  },
  {
    event: "TOGGLE_MATERIAL_SEARCH",
    key: "shift+m",
    scopes: ["NORMAL", "EDITOR"],
    name: "Toggle Material Search",
    description: "Toggle material search"
  },
  {
    event: "TOGGLE_CAMERA_ORTHO",
    key: "shift+o",
    scopes: ["NORMAL", "EDITOR"],
    name: "Toggle Camera Ortho",
    description: "Toggle camera ortho"
  },
  {
    event: "UNDO",
    key: "ctrl+z, command+z",
    scopes: ["NORMAL", "EDITOR"],
    name: "Undo",
    description: "Undo"
  },
  {
    event: "REDO",
    key: "ctrl+shift+z, command+shift+z",
    scopes: ["NORMAL", "EDITOR"],
    name: "Redo",
    description: "Redo"
  },
  {
    event: "MOVE_SELECTED_OBJECTS",
    key: "m",
    scopes: ["EDITOR"],
    name: "Move Selected Objects",
    description: "Move selected objects"
  },
  {
    event: "FOCUS_ON_SELECTED_OBJECTS",
    key: "f",
    scopes: ["EDITOR"],
    name: "Focus On Selected Objects",
    description: "Focus on selected objects"
  },
  {
    event: "FOCUS_ON_CURSOR",
    key: "shift+f",
    scopes: ["EDITOR"],
    name: "Focus On Cursor",
    description: "Focus on cursor"
  },
  {
    event: "PHASE_OUT",
    key: "escape",
    scopes: ["EDITOR", "EDITOR_MOVING"],
    name: "Phase Out",
    description: "Phase out"
  }
] as Shortcut[];

export const useShortcut = create<ShortcutStore>((set) => ({
  shortcuts: new Map(defaultShortcuts.map(shortcut=>[hash(shortcut), shortcut])),
  set: (fn) => set(produce(fn)),
}));


declare global {
  interface EventTypes {
    REGISTER_SHORTCUTS: undefined;
  }
}

on("REGISTER_SHORTCUTS", () => {
  hotkeys.unbind();
  useShortcut.getState().shortcuts.forEach((shortcut) => {
    shortcut.scopes.forEach(scope => {
      hotkeys(shortcut.key, scope, (event) => {
        emit(shortcut.event, shortcut.args);
      });
    })
  })
})