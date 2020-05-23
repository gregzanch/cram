import React from "react";
import TextInput from "../text-input/TextInput";
import NumberInput from "../number-input/NumberInput";
import { ObjectPropertyInputEvent } from '.';
import CheckboxInput from "../checkbox-input/CheckboxInput";
import GridRow from '../grid-row/GridRow';

import Source from '../../objects/source';
import { FDTD } from "../../compute/fdtd";
import Receiver from "../../objects/receiver";


export interface FDTDPropertiesProps {
	object: FDTD;
  onPropertyChange: (e: ObjectPropertyInputEvent) => void;
	onPropertyValueChangeAsNumber: (id: string, prop: string, valueAsNumber: number) => void;
	onPropertyValueChangeAsString: (id: string, prop: string, valueAsString: string) => void;
}



const FDTDPropertiesContainerStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "auto auto",
	padding: ".25em",
	gridRowGap: ".25em",
	gridColumnGap: ".25em"
};


export default function FDTDProperties(props: FDTDPropertiesProps) {

	const XYZProps = {
    style: {
		  width: "30%"
	  },
    onChange: props.onPropertyChange
	}
	
	
	return (
		<div>
			<div style={FDTDPropertiesContainerStyle}>
				
				{props.object.hasOwnProperty('name') && (
					<GridRow label={"name"}>
						<TextInput name="name" value={props.object.name} onChange={props.onPropertyChange} />
					</GridRow>
				)}
				{props.object.hasOwnProperty('_gain') && (
					<GridRow label={"gain"}>
						<NumberInput name="gain" value={props.object.gain} onChange={props.onPropertyChange} />
					</GridRow>
				)}
				{props.object.hasOwnProperty('_threshold') && (
					<GridRow label={"threshold"}>
						<NumberInput name="threshold" value={props.object.threshold} onChange={props.onPropertyChange} />
					</GridRow>
				)}
				{props.object.hasOwnProperty('dx') && (
					<GridRow label={"dx"}>
						<NumberInput name="dx" value={props.object.dx} onChange={props.onPropertyChange} disabled={props.object.running}/>
					</GridRow>
				)}
				{props.object.hasOwnProperty('dt') && (
					<GridRow label={"dt"}>
						<NumberInput name="dt" value={props.object.dt} onChange={props.onPropertyChange} disabled={props.object.running}/>
					</GridRow>
				)}
				{props.object.hasOwnProperty('q') && (
					<GridRow label={"q"}>
						<NumberInput name="q" value={props.object.q} onChange={props.onPropertyChange} />
					</GridRow>
				)}
				{props.object.hasOwnProperty('r') && (
					<GridRow label={"r"}>
						<NumberInput name="r" value={props.object.r} onChange={props.onPropertyChange} />
					</GridRow>
				)}
				
				{/* {props.object.hasOwnProperty('visible') && (
					<GridRow label={"visible"}>
						<CheckboxInput name="visible" checked={props.object.visible} onChange={props.onPropertyChange} />
					</GridRow>
				)}
				
				{props.object.hasOwnProperty('position') && (
					<GridRow label={"position"}>
						<NumberInput name="x" value={props.object.position.x} {...XYZProps}/>
						<NumberInput name="y" value={props.object.position.y} {...XYZProps}/>
						<NumberInput name="z" value={props.object.position.z} {...XYZProps}/>
					</GridRow>
				)}

				{props.object.hasOwnProperty('scale') && (
					<GridRow label={"scale"}>
						<NumberInput name="scalex" value={props.object.scale.x} {...XYZProps}/>
						<NumberInput name="scaley" value={props.object.scale.y} {...XYZProps}/>
						<NumberInput name="scalez" value={props.object.scale.z} {...XYZProps} />
					</GridRow>
				)}

				{props.object.hasOwnProperty('rotation') && (
					<GridRow label={"rotation"}>
						<NumberInput name="rotationx" value={props.object.rotation.x} {...XYZProps}/>
						<NumberInput name="rotationy" value={props.object.rotation.y} {...XYZProps}/>
						<NumberInput name="rotationz" value={props.object.rotation.z} {...XYZProps}/>
					</GridRow>
				)} */}
			</div>
		</div>
	);
}
