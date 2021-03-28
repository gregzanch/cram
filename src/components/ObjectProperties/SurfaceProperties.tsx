import React from "react";
import TextInput from "../text-input/TextInput";
import NumberInput from "../number-input/NumberInput";
import { ObjectPropertyInputEvent } from ".";
import CheckboxInput from "../CheckboxInput";
import Source from '../../objects/source';
import GridRow from '../GridRow';
import Surface from '../../objects/surface';
import GridRowSeperator from "../GridRowSeperator";

import Messenger from "../../messenger";
import { Button, Tag } from "@blueprintjs/core";



export interface SurfacePropertiesProps {
	object: Surface;
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


// const MaterialMultiSelect = MultiSelect.ofType<AcousticMaterial>();

const SurfacePropertiesContainerStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "auto auto",
	padding: ".25em",
	gridRowGap: ".25em",
	gridColumnGap: ".25em"
};

const customStyles = {
  indicatorsContainer: (provided, state) => ({
    ...provided,
    padding: 0
  }),
  clearIndicator: (provided, state) => ({
    ...provided,
    padding: 0
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    padding: 0
  }),
  control: (provided, state) => ({
    ...provided,
    minHeight: 0
  }),
  container: (provided, state) => ({
    ...provided,
    width: "100%"
  })
};






export default function SurfaceProperties(props: SurfacePropertiesProps) {

	const XYZProps = {
    style: {
		  width: "30%"
	  },
    onChange: props.onPropertyChange
	}
	
	async function getMaterialSuggestions(value: string) {
		const materials = props.messenger.postMessage("SEARCH_ALL_MATERIALS", value)[0];

		return new Promise<any[]>((resolve, reject) => { 
			let res = materials;
			if (res) {
				resolve(res);
				return;
			}
			else {
				reject("problem occured")
			}
		})
	}

	
	return (
    <div>
      <div style={SurfacePropertiesContainerStyle}>
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

        {
          <GridRow label={"wireframe"}>
            <CheckboxInput name="wireframeVisible" checked={props.object.wireframeVisible} onChange={props.onPropertyChange} />
          </GridRow>
        }

        {props.object.hasOwnProperty("_displayVertexNormals") && (
          <GridRow label={"vertex normals"}>
            <CheckboxInput name="displayVertexNormals" checked={props.object.displayVertexNormals} onChange={props.onPropertyChange} />
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
            <NumberInput name="scalex" value={props.object.scale.x} min={10e-10} {...XYZProps} />
            <NumberInput name="scaley" value={props.object.scale.y} min={10e-10} {...XYZProps} />
            <NumberInput name="scalez" value={props.object.scale.z} min={10e-10} {...XYZProps} />
          </GridRow>
        )}

        {props.object.hasOwnProperty("rotation") && (
          <GridRow label={"rotation"}>
            <NumberInput name="rotationx" value={props.object.rotation.x} {...XYZProps} />
            <NumberInput name="rotationy" value={props.object.rotation.y} {...XYZProps} />
            <NumberInput name="rotationz" value={props.object.rotation.z} {...XYZProps} />
          </GridRow>
        )}
        <GridRowSeperator marginBottom={".125em"} />

        {props.object.hasOwnProperty("numHits") && (
          <GridRow label={"hit count"}>
            <span>{props.object.numHits}</span>
          </GridRow>
        )}
        <GridRowSeperator marginBottom={".125em"} />
        <GridRow
          label="material"
          style={{
            display: "unset"
          }}>
          {props.object instanceof Surface && (props.object as Surface) && (
            // (<Button text={props.object.acousticMaterial.name} minimal={true} />)
            <>
              <Tag
              // onRemove={removable && onRemove}
              // icon={icon === true ? "home" : undefined}
              >
                {props.object.acousticMaterial.name}
              </Tag>
              <Button icon="edit" minimal small onClick={(e) => props.messenger.postMessage("OPEN_MATERIAL_SEARCH", props.object)} />
            </>
          )}
        </GridRow>

        <GridRowSeperator marginBottom={".125em"} />
        {props.object.hasOwnProperty("uuid") && (
          <GridRow label={"uuid"}>
            <span className="muted-text">{props.object.uuid}</span>
          </GridRow>
        )}
      </div>
    </div>
  );
}
