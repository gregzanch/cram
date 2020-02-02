import hotkeys from "hotkeys-js";
import Messenger from "./messenger";
import fullscreen from './common/fullscreen';

export function registerHotKeys(messenger: Messenger) {
  
  hotkeys("ctrl+i, command+i", function() {
    messenger.postMessage("SHOW_IMPORT_DIALOG");
  });
  
  hotkeys("ctrl+shift+f, command+shift+f", fullscreen)
  
}



