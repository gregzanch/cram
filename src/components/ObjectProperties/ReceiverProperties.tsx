import React from "react";
import TextInput from "../TextInput";
import NumberInput, { ObjectPropertyInputEvent } from "../NumberInput";
import CheckboxInput from "../CheckboxInput";
import Source from '../../objects/source';
import GridRow from '../GridRow';
import Receiver from "../../objects/receiver";
import ColorInput from '../ColorInput';

export interface ReceiverPropertiesProps {
  object: Receiver;
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



const ReceiverPropertiesContainerStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "auto auto",
	padding: ".25em",
	gridRowGap: ".25em",
	gridColumnGap: ".25em"
};


export default function ReceiverProperties(props: ReceiverPropertiesProps) {

	const XYZProps = {
    style: {
		  width: "30%"
	  },
    onChange: props.onPropertyChange
	}
	
	
	return (
    <div>
      <div style={ReceiverPropertiesContainerStyle}>
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
            <NumberInput name="scalex" value={props.object.scale.x} {...XYZProps} />
            <NumberInput name="scaley" value={props.object.scale.y} {...XYZProps} />
            <NumberInput name="scalez" value={props.object.scale.z} {...XYZProps} />
          </GridRow>
        )}

        {props.object.hasOwnProperty("rotation") && (
          <GridRow label={"rotation"}>
            <NumberInput name="rotationx" value={props.object.rotation.x} {...XYZProps} />
            <NumberInput name="rotationy" value={props.object.rotation.y} {...XYZProps} />
            <NumberInput name="rotationz" value={props.object.rotation.z} {...XYZProps} />
          </GridRow>
        )}

        {props.object.hasOwnProperty("mesh") && (
          <GridRow label={"color"}>
            <ColorInput
              name="color"
              value={props.object.color}
              onChange={e => {
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
