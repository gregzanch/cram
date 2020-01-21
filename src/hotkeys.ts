import hotkeys from "hotkeys-js";
import Messenger from "./messenger";

export function registerHotKeys(messenger: Messenger) {
  
  hotkeys("ctrl+i, command+i", function() {
    messenger.postMessage("SHOW_IMPORT_DIALOG");
  });
  
}

