import create from "zustand";
import { Searcher } from "fast-fuzzy";
import produce from "immer";
import { KeyValuePair } from "../common/key-value-pair";
import Container from "../objects/container";

export type SettingKind = "text" | "number" | "checkbox" | "radio" | "color" | "select" | "keybinding";

export type SettingOption<T> = {
  value: T;
  id: string;
  name: string;
  description: string;
}

export type Setting<T, K extends SettingKind> = {
  id: string;
  name: string;
  description: string;
  kind: K;
  value: T;
  default_value: T;
  staged_value: T;
  options?: SettingOption<T>[];
}

type ApplicationSettings = {
  general: {
    fogColor: Setting<string, "color">;
    defaultSaveName: Setting<string, "text">;
  },
  editor: {
    transformSnapFine: Setting<number, "number">;
    transformSnapNormal: Setting<number, "number">;
    transformSnapCoarse: Setting<number, "number">;
  },
  keybindings: {
    SHOW_IMPORT_DIALOG: Setting<string, "keybinding">;
  }
}

const defaultSettings: ApplicationSettings = {
  general: {
    fogColor: {
      id: "fogColor",
      name: "Fog Color",
      description: "Changes the color of the scene's fog",
      kind: "color",
      value: "#ffffff",
      staged_value: "#ffffff",
      default_value: "#ffffff"
    },
    defaultSaveName: {
      id: "defaultSaveName",
      name: "Default Save Name",
      description: "The default name when saving",
      kind: "text",
      value: "new-project",
      staged_value: "new-project",
      default_value: "new-project"
    }
  },
  editor: {
    transformSnapFine: {
      id: "transformSnapFine",
      name: "Transform - Snap (fine)",
      description: "The fine step size when transforming an object",
      kind: "number",
      value: 0.001,
      staged_value: 0.001,
      default_value: 0.001
    },
    transformSnapNormal: {
      id: "transformSnapNormal",
      name: "Transform - Snap (normal)",
      description: "The fine step size when transforming an object",
      kind: "number",
      value: 0.1,
      staged_value: 0.1,
      default_value: 0.1
    },
    transformSnapCoarse: {
      id: "transformSnapCoarse",
      name: "Transform - Snap (coarse)",
      description: "The fine step size when transforming an object",
      kind: "number",
      value: 1,
      staged_value: 1,
      default_value: 1
    }
  },
  keybindings: {
    SHOW_IMPORT_DIALOG: {
      id: "SHOW_IMPORT_DIALOG",
      name: "Import",
      description: "Shows the import dialog window",
      kind: "keybinding",
      value: "⌃+i, ⌘+i",
      staged_value: "⌃+i, ⌘+i",
      default_value: "⌃+i, ⌘+i"
    }
  }
};


export type SettingsStore = {
  settings: ApplicationSettings;
  set: SetFunction<SettingsStore>;
};

export const useSetting = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  set: (fn) => set(produce(fn))
}));

