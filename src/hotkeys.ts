import hotkeys from "hotkeys-js";
import Messenger from "./messenger";
import fullscreen from './common/fullscreen';

export function registerHotKeys(messenger: Messenger) {
  
  hotkeys("ctrl+i, command+i", function () { messenger.postMessage("SHOW_IMPORT_DIALOG") });
  hotkeys("shift+/", function () { messenger.postMessage("SHOW_TERMINAL") })
  hotkeys("shift+m", function () { messenger.postMessage("TOGGLE_MATERIAL_SEARCH") })
  hotkeys("shift+n", function () { messenger.postMessage("SHOW_NEW_WARNING"); })
  hotkeys("shift+o", function(){messenger.postMessage("TOGGLE_CAMERA_ORTHO")})
  hotkeys("ctrl+shift+f, command+shift+f", fullscreen);
}



