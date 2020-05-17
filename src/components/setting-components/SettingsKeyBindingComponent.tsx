import React, { useState } from "react";
import { Setting } from "../../setting";
import hotkeys from "hotkeys-js";
import keyCodeMap from '../../common/keycodes';
import "./SettingsKeyBindingComponent.css";

export interface SettingsKeyBindingComponentProps {
  setting: Setting<string>;
  onChange: (value: string) => void;
}

export default function SettingsKeyBindingComponent(props: SettingsKeyBindingComponentProps) {
  const [listening, setListening] = useState(false);
  const [prevScope, setPrevScope] = useState(hotkeys.getScope());
  const [recordedKeyCombo, setRecordedKeyCombo] = useState([] as string[]);
  const [shouldResetOnNextKeyPress, setShouldResetOnNextKeyPress] = useState(false);
  return (
    <span>
      <input
        type="text"
        value={listening ? recordedKeyCombo.join('').toUpperCase() : props.setting.staged_value.replace(/\+/gmi,'').toUpperCase()}
        onChange={e => {
          props.onChange(e.currentTarget.value);
        }}
        className="settings-number-component"
      />
      <input
        type="button"
        value={listening ? "Done" : "Record"}
        onClick={(e) => {
        // means the component should now start listening to keyboard events
        if (!listening) {
          setPrevScope(hotkeys.getScope());
          hotkeys.setScope("keybindinginput");
        }
        else {
          hotkeys.setScope(prevScope);
          if (recordedKeyCombo.length > 0) {
            props.onChange(recordedKeyCombo.join('+'))
          }
          setRecordedKeyCombo([] as string[]);
        }
        
        setListening(!listening);
        }}
        onKeyDown={(e) => {
          if (listening) {
            if (keyCodeMap[e.keyCode][1] === "") {
              setRecordedKeyCombo([] as string[]);
            }
            else {
              const rec = shouldResetOnNextKeyPress ? [keyCodeMap[e.keyCode][1]] : recordedKeyCombo.concat(keyCodeMap[e.keyCode][1]);
              const unique = [... new Set(rec)];
              setRecordedKeyCombo(unique);
            }
          }
          if (shouldResetOnNextKeyPress) {
            setShouldResetOnNextKeyPress(false);
          }
        }}
        onKeyUp={(e) => {
          if (listening) {
            setShouldResetOnNextKeyPress(true);
          }
        }}
        className="icon-button"
      />
    </span>
  );
}



