import React from "react";

import {
  Button,
  H5,
  Hotkey,
  Hotkeys,
  HotkeysTarget,
  KeyCombo,
  MenuItem,
  Position,
  Switch,
  Toaster
} from "@blueprintjs/core";
import { Omnibar, IOmnibarProps } from "@blueprintjs/select";
import { AcousticMaterial } from '../..'

const MaterialBarComponent = Omnibar.ofType<AcousticMaterial>();


export interface MaterialBarProps extends IOmnibarProps<AcousticMaterial>{
  onItemSelect: (
    item: AcousticMaterial,
    event?: React.SyntheticEvent<HTMLElement, Event>
  ) => void;
  onClose: (event?: React.SyntheticEvent<HTMLElement, Event>) => void;
}

export function MaterialBar(props: MaterialBarProps) {
  return (
    <MaterialBarComponent {...props}/>
  );
}

export default MaterialBar;