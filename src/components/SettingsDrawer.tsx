import React from "react";

import { Drawer, Position, InputGroup } from "@blueprintjs/core";
import { Setting } from "../common/setting";

import { KeyValuePair } from "../common/key-value-pair";

export interface SettingsDrawerProps{
	size: number|string,
	onClose: ((event?: React.SyntheticEvent<HTMLElement, Event> | undefined) => void)
	isOpen: boolean,
	children?: React.ReactNode | React.ReactNode[];
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
			title={"Settings"}
			isOpen={props.isOpen}>
			{props.children}
		</Drawer>
  );
}
