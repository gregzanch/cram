import React from "react";

import { Drawer, Position, InputGroup } from "@blueprintjs/core";
import { Setting } from "../common/setting";
import { uuid } from "uuidv4";
import { KeyValuePair } from "../common/key-value-pair";

import "../css/settings.css";

const SettingsGridRowFirstChildStyle: React.CSSProperties = {
	display: "grid",
	gridColumnStart: "1",
	gridColumnEnd: "2",
	textAlign: "center"
};

const SettingsGridRowSecondChildStyle: React.CSSProperties = {
	display: "grid",
	gridColumnStart: "2",
	gridColumnEnd: "3",
	textAlign: "center"
};

const SettingsGridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "1fr 1fr",
	gridTemplateRows: "auto"
};

export function SettingsGridRowItem(props) {
	let style =
		props.index == 0
			? SettingsGridRowFirstChildStyle
			: SettingsGridRowSecondChildStyle;
	return <div style={style}>{props.children}</div>;
}

export interface SettingsDrawerProps {
	settings: KeyValuePair<Setting<any>>;
	onSettingChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isOpen: boolean;
  size?: string;
	onClose:
		| ((
				event?: React.SyntheticEvent<HTMLElement, Event> | undefined
		  ) => void)
		| undefined;
}

const gridRowPropStyle: React.CSSProperties = {
	display: "grid",
	gridColumn: "1",
	textAlign: "center"
};
const gridRowInputStyle: React.CSSProperties = {
	display: "grid",
	gridColumn: "2",
	textAlign: "center",
	justifyContent: "center"
};
const labelStyle: React.CSSProperties = {
	fontWeight: 500,
	textAlign: "center"
};

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
			<div style={SettingsGridStyle}>
				<div style={gridRowPropStyle}>
					<h4>Property</h4>
				</div>
				<div style={gridRowInputStyle}>
					<h4>Value</h4>
				</div>

				{Object.keys(props.settings).map(key => {
					const propkey = key + ".prop";
					const inputkey = key + ".val";
					const inputprops:KeyValuePair<any> = {
						id: key,
						style: {
							display: "flex",
							justifyContent: "center"
						},
            type: props.settings[key].configType,
            onChange: props.onSettingChange
          };
          if (inputprops.type === "checkbox") {
            inputprops.checked = props.settings[key].value;
          }
          else {
            inputprops.value = props.settings[key].value;
          }
					return [
						<div key={propkey} style={gridRowPropStyle}>
							<label style={labelStyle}>{key}</label>
						</div>,
						<div key={inputkey} style={gridRowInputStyle}>
							<input {...inputprops}/>
						</div>
					];
				})}
			</div>
		</Drawer>
	);
}
