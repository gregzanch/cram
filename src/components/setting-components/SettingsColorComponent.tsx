import React, { useState } from "react";
import { Setting } from "../../common/setting";

import "./SettingsColorComponent.css";

export interface SettingsColorComponentProps {
  setting: Setting<string>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SettingsColorComponent(
  props: SettingsColorComponentProps
) {
  // const [stagedValue, setStagedValue] = useState(props.setting.value);
  return (
    <input
      type="color"
      value={props.setting.staged_value}
      onChange={props.onChange}
      className="settings-color-component"
    />
  );
}
