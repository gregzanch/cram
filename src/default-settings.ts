import { Setting } from "./setting";


const defaultSettings = {
  general: {
    fog_color: new Setting<string>({
      id: "fog_color",
      name: "Fog Color",
      description: "Changes the color of the scene's fog",
      kind: "color",
      value: "#ffffff",
      default_value: "#ffffff"
    }),
    default_save_name: new Setting<string>({
      id: "default_save_name",
      name: "Default Save Name",
      description: "The default name when saving",
      kind: "text",
      value: "new-project",
      default_value: "new-project"
    })
  },
  editor: {
    transform_snap_fine: new Setting<number>({
      id: "transform_snap_fine",
      name: "Transform - Snap (fine)",
      description: "The fine step size when transforming an object",
      kind: "number",
      value: 0.001,
      default_value: 0.001
    }),
    transform_snap_normal: new Setting<number>({
      id: "transform_snap_normal",
      name: "Transform - Snap (normal)",
      description: "The fine step size when transforming an object",
      kind: "number",
      value: 0.1,
      default_value: 0.1
    }),
    transform_snap_coarse: new Setting<number>({
      id: "transform_snap_coarse",
      name: "Transform - Snap (coarse)",
      description: "The fine step size when transforming an object",
      kind: "number",
      value: 1,
      default_value: 1
    })
  },
  keybindings: {
    SHOW_IMPORT_DIALOG: new Setting<string>({
      id: "SHOW_IMPORT_DIALOG",
      name: "Import",
      description: "Shows the import dialog window",
      kind: "keybinding",
      value: "⌃+i, ⌘+i",
      default_value: "⌃+i, ⌘+i"
    })
  }
};

export type ApplicationSettings = typeof defaultSettings;
export type GeneralSettings = typeof defaultSettings.general;
export type EditorSettings = typeof defaultSettings.editor;
export type KeyBindingsSettings = typeof defaultSettings.keybindings;
export type SettingsCategory = GeneralSettings | EditorSettings | KeyBindingsSettings;
export type SettingsCategories = keyof ApplicationSettings;


export {
  defaultSettings
}
export default defaultSettings;