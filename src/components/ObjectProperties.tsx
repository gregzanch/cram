import React from "react";
import Container from "../objects/container";
import TextInput from "./TextInput";
import NumberInput from "./NumberInput";
import CheckboxInput from "./CheckboxInput";
import TabUnselectedIcon from '@material-ui/icons/TabUnselected';



export interface ObjectPropertiesProps {
  object: Container;
  onPropertyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onPropertyValueChangeAsNumber: (id: string, prop: string, valueAsNumber: number) => void;
	onPropertyValueChangeAsString: (id: string, prop: string, valueAsString: string) => void;
}

export function GridRow(props) {
	return (
		<>
			<div style={{ display: "grid", gridColumnStart: "1", gridColumnEnd: "2" }}>{props.label}</div>
			<div style={{ display: "grid", gridColumnStart: "2", gridColumnEnd: "3" }}>
				<div style={{ display: "flex", justifyContent: "space-evenly" }}>
					{props.children}
				</div>
			</div>
		</>
	)
}

const ObjectPropertiesContainerStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "auto auto",
	padding: ".25em",
	gridRowGap: ".25em",
	gridColumnGap: ".25em"
};


export default function ObjectProperties(props: ObjectPropertiesProps) {
	const XYZInputStyle: React.CSSProperties = {
		width: "30%"
	};
	const XYZProps = {
		style: XYZInputStyle
	}
	
	return (
		<div>
			<div style={ObjectPropertiesContainerStyle}>
				<GridRow label={"name"}>
					<TextInput name="name" value={props.object.name} onChange={props.onPropertyChange} />

				</GridRow>
				<GridRow label={"visible"}>

						<CheckboxInput name="visible" checked={props.object.visible} onChange={props.onPropertyChange} />

				</GridRow>
				
				<GridRow label={"position"}>

						<NumberInput name="x" value={props.object.position.x} onChange={props.onPropertyChange} {...XYZProps}/>
						<NumberInput name="y" value={props.object.position.y} onChange={props.onPropertyChange} {...XYZProps}/>
						<NumberInput name="z" value={props.object.position.z} onChange={props.onPropertyChange} {...XYZProps}/>

				</GridRow>

				<GridRow label={"scale"}>

						<NumberInput name="scalex" value={props.object.scale.x} onChange={props.onPropertyChange} {...XYZProps}/>
						<NumberInput name="scaley" value={props.object.scale.y} onChange={props.onPropertyChange} {...XYZProps}/>
						<NumberInput name="scalez" value={props.object.scale.z} onChange={props.onPropertyChange}  {...XYZProps}/>

				</GridRow>

				<GridRow label={"rotation"}>

						<NumberInput name="rotationx" value={props.object.rotation.x} onChange={props.onPropertyChange} {...XYZProps}/>
						<NumberInput name="rotationy" value={props.object.rotation.y} onChange={props.onPropertyChange} {...XYZProps}/>
						<NumberInput name="rotationz" value={props.object.rotation.z} onChange={props.onPropertyChange} {...XYZProps}/>

				</GridRow>
			</div>
		</div>
	);
}
