import React from "react";
import TextInput from "../TextInput";
import NumberInput, { ObjectPropertyInputEvent } from "../NumberInput";
import CheckboxInput from "../CheckboxInput";
import Source from '../../objects/source';
import GridRow from '../GridRow';
import Messenger from "../../messenger";
import ColorInput from "../ColorInput";

export interface SourcePropertiesProps {
  object: Source;
  messenger: Messenger;
  onPropertyChange: (e: ObjectPropertyInputEvent) => void;
  onPropertyValueChangeAsNumber: (
    id: string,
    prop: string,
    valueAsNumber: number
  ) => void;
  onPropertyValueChangeAsString: (
    id: string,
    prop: string,
    valueAsString: string
  ) => void;
}



const SourcePropertiesContainerStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "auto auto",
	padding: ".25em",
	gridRowGap: ".25em",
	gridColumnGap: ".25em"
};


export default function SourceProperties(props: SourcePropertiesProps) {

	const XYZProps = {
    style: {
		  width: "30%"
	  },
		onChange: props.onPropertyChange,
	}
	
	const source = props.messenger.postMessage("FETCH_SOURCE", props.object.uuid)[0];
	// console.log(source);
	
	
	return (
    <div>
      <div style={SourcePropertiesContainerStyle}>
        {props.object.hasOwnProperty("name") && (
          <GridRow label={"name"}>
            <TextInput name="name" value={props.object.name} onChange={props.onPropertyChange} />
          </GridRow>
        )}

        {props.object.hasOwnProperty("visible") && (
          <GridRow label={"visible"}>
            <CheckboxInput name="visible" checked={props.object.visible} onChange={props.onPropertyChange} />
          </GridRow>
        )}

        {props.object.hasOwnProperty("position") && (
          <GridRow label={"position"}>
            <NumberInput name="x" value={props.object.position.x} {...XYZProps} />
            <NumberInput name="y" value={props.object.position.y} {...XYZProps} />
            <NumberInput name="z" value={props.object.position.z} {...XYZProps} />
          </GridRow>
        )}

        {props.object.hasOwnProperty("scale") && (
          <GridRow label={"scale"}>
            <NumberInput name="scalex" value={props.object.scale.x} {...XYZProps} min={10e-10} />
            <NumberInput name="scaley" value={props.object.scale.y} {...XYZProps} min={10e-10} />
            <NumberInput name="scalez" value={props.object.scale.z} {...XYZProps} min={10e-10} />
          </GridRow>
        )}

        {props.object.hasOwnProperty("rotation") && (
          <GridRow label={"rotation"}>
            <NumberInput name="rotationx" value={props.object.rotation.x} {...XYZProps} />
            <NumberInput name="rotationy" value={props.object.rotation.y} {...XYZProps} />
            <NumberInput name="rotationz" value={props.object.rotation.z} {...XYZProps} />
          </GridRow>
        )}

        {/* {props.object.hasOwnProperty("theta") && (
          <GridRow label={"theta"}>
            <NumberInput name="theta" value={props.object.theta} {...XYZProps} />
          </GridRow>
        )}
        {props.object.hasOwnProperty("phi") && (
          <GridRow label={"phi"}>
            <NumberInput name="phi" value={props.object.phi} {...XYZProps} />
          </GridRow>
        )} */}
        {props.object.hasOwnProperty("mesh") && (
          <GridRow label={"color"}>
            <ColorInput
              name="color"
              value={props.object.getColorAsString()}
              onChange={(e) => {
                props.onPropertyChange({
                  value: e.currentTarget.value,
                  name: e.currentTarget.name,
                  id: e.currentTarget.id,
                  type: e.currentTarget.type,
                  checked: undefined
                });
              }}
            />
          </GridRow>
        )}
        {props.object.hasOwnProperty("uuid") && (
          <GridRow label={"uuid"}>
            <span className="muted-text">{props.object.uuid}</span>
          </GridRow>
        )}
      </div>
    </div>
  );
}
