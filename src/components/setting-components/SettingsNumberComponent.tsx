import React, { useState } from "react";
import { Setting } from "../../setting";

import "./SettingsNumberComponent.css";

export interface SettingsNumberComponentProps {
  setting: Setting<string>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SettingsNumberComponent(
  props: SettingsNumberComponentProps
) {
  // const [stagedValue, setStagedValue] = useState(props.setting.value);
  return (
    <input
      type="number"
      value={props.setting.staged_value}
      onChange={props.onChange}
      className="settings-number-component"
    />
  );
}
