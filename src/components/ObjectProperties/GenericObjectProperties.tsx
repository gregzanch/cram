import React from "react";
import TextInput from "../text-input/TextInput";
import NumberInput, { ObjectPropertyInputEvent } from ".";
import CheckboxInput from "../CheckboxInput";
import Source from '../../objects/source';
import GridRow from '../GridRow';

export interface GenericObjectPropertiesProps {
	object: Source;
    onPropertyChange: (e: ObjectPropertyInputEvent) => void;
	onPropertyValueChangeAsNumber: (id: string, prop: string, valueAsNumber: number) => void;
	onPropertyValueChangeAsString: (id: string, prop: string, valueAsString: string) => void;
}



const GenericObjectPropertiesContainerStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "auto auto",
	padding: ".25em",
	gridRowGap: ".25em",
	gridColumnGap: ".25em"
};


export default function GenericObjectProperties(props: GenericObjectPropertiesProps) {

	const XYZProps = {
    style: {
		  width: "30%"
	  },
    onChange: props.onPropertyChange
	}
	
	
	return (
		<div>
			<div style={GenericObjectPropertiesContainerStyle}>
				{props.object.hasOwnProperty('name') && (
					<GridRow label={"name"}>
						<TextInput name="name" value={props.object.name} onChange={props.onPropertyChange} />
					</GridRow>
				)}
			</div>
		</div>
	);
}
