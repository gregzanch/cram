import React from "react";
import TextInput from "../TextInput";
import NumberInput from "../NumberInput";
import CheckboxInput from "../CheckboxInput";
import Source from '../../objects/source';
import GridRow from '../GridRow';
import RayTracer from "../../compute/raytracer";
import { Button } from "@blueprintjs/core";

export interface RayTracerPropertiesProps {
	object: RayTracer;
  onPropertyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onPropertyValueChangeAsNumber: (id: string, prop: string, valueAsNumber: number) => void;
	onPropertyValueChangeAsString: (id: string, prop: string, valueAsString: string) => void;
	onButtonClick: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}



const RayTracerPropertiesContainerStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "auto auto",
	padding: ".25em",
	gridRowGap: ".25em",
	gridColumnGap: ".25em"
};


export default function RayTracerProperties(props: RayTracerPropertiesProps) {

	const XYZProps = {
    style: {
      width: "30%"
    },
    onChange: props.onPropertyChange,
  };
	
	
	return (
    <div>
      <div style={RayTracerPropertiesContainerStyle}>
        {props.object.hasOwnProperty("name") && (
          <GridRow label={"name"}>
            <TextInput
              name="name"
              value={props.object.name}
              onChange={props.onPropertyChange}
            />
          </GridRow>
        )}

        {/* {props.object.hasOwnProperty('visible') && (
					<GridRow label={"visible"}>
						<CheckboxInput name="visible" checked={props.object.visible} onChange={props.onPropertyChange} />
					</GridRow>
				)} */}

        {props.object.hasOwnProperty("updateInterval") && (
          <GridRow label={"Rate (ms)"}>
            <NumberInput
              name="updateInterval"
              value={props.object.updateInterval}
              {...XYZProps}
            />
          </GridRow>
        )}

        {props.object.hasOwnProperty("reflectionOrder") && (
          <GridRow label={"Order"}>
            <NumberInput
              name="reflectionOrder"
              value={props.object.reflectionOrder}
              {...XYZProps}
            />
          </GridRow>
        )}

        {
          <GridRow label={"run"}>
            <Button
              name={props.object.isRunning ? "ray-tracer-pause" : "ray-tracer-play"}
              icon={props.object.isRunning ? "pause" : "play"}
              onClick={props.onButtonClick}
              minimal
              className={"bp3-small-icon-button"}
            />
          </GridRow>
        }
        {
          <GridRow label={"clear"}>
            <Button
              name="ray-tracer-clear"
              icon="cross"
              onClick={props.onButtonClick}
              minimal
              className={"bp3-small-icon-button"}
            />
          </GridRow>
        }
      </div>
    </div>
  );
}
