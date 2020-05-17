import React, {useState} from "react";
import {Setting} from '../../setting';

import "./SettingsTextComponent.css";

export interface SettingsTextComponentProps {
  setting: Setting<string>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SettingsTextComponent(props: SettingsTextComponentProps) {
  // const [stagedValue, setStagedValue] = useState(props.setting.value);
  return (
    <input
      type="text"
      value={props.setting.staged_value}
      onChange={props.onChange}
      className="settings-text-component"
    />
  );
  }
