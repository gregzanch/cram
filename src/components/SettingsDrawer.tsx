import React from "react";

import { Drawer, Position, InputGroup, Button } from "@blueprintjs/core";
import { Setting } from "../common/setting";

import { KeyValuePair } from "../common/key-value-pair";

import "./SettingsDrawer.css";

export interface SettingsDrawerProps {
  size: number | string;
  onClose: (
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ) => void;
  isOpen: boolean;
  children?: React.ReactNode | React.ReactNode[];
  onSubmit?: (((event: React.MouseEvent<HTMLElement, MouseEvent>) => void) & ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void))
}


export default function SettingsDrawer(props: SettingsDrawerProps) {
  return (
    <Drawer
      position={Position.RIGHT}
      size={props.size || "35%"}
      autoFocus={true}
      enforceFocus={true}
      hasBackdrop={true}
      onClose={props.onClose}
      canOutsideClickClose={true}
      canEscapeKeyClose={true}
      isCloseButtonShown={true}
      title={
        <div className="settings-title-bar">
          <div className="settings-title-bar-title">Settings</div>
					<div className="settings-title-bar-apply">
						<Button text="Apply" rightIcon="small-tick" minimal intent="success" style={{
							display: "inline"
						}} onClick={props.onSubmit}/>
					</div>
        </div>
      }
      isOpen={props.isOpen}>
      {props.children}
    </Drawer>
  );
}
