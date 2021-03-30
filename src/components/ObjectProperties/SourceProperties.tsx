import React from "react";
import TextInput from "../text-input/TextInput";
import NumberInput from "../number-input/NumberInput";
import CheckboxInput from "../CheckboxInput";
import Source, { SignalSource } from "../../objects/source";
import {DirectivityHandler} from "../../objects/source"; 
import GridRow from "../GridRow";
import Messenger, { emit } from "../../messenger";
import ColorInput from "../ColorInput";
import Slider, { SliderChangeEvent } from "../slider/Slider";
import PropertyRow from "../parameter-config/property-row/PropertyRow";
import Label from "../label/Label";
import PropertyRowLabel from "../parameter-config/property-row/PropertyRowLabel";
import PropertyRowButton from "../parameter-config/property-row/PropertyRowButton";
import PropertyRowCheckbox from "../parameter-config/property-row/PropertyRowCheckbox";
import { ObjectPropertyInputEvent } from ".";
import { IToastProps } from "@blueprintjs/core/lib/esm/components/toast/toast";
import decimalPrecision from "../../common/decimal-precision";
import {CLFParser} from "../../import-handlers/CLFParser";

export interface SourcePropertiesProps {
  object: Source;
  messenger: Messenger;
  onPropertyChange: (e: ObjectPropertyInputEvent) => void;
  onPropertyValueChangeAsNumber: (id: string, prop: string, valueAsNumber: number) => void;
  onPropertyValueChangeAsString: (id: string, prop: string, valueAsString: string) => void;
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
    onChange: props.onPropertyChange
  };
  // const source = props.messenger.postMessage("FETCH_SOURCE", props.object.uuid)[0];
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
          <GridRow label={"rotation (degrees)"}>
            <NumberInput name="rotationx" value={props.object.rotation.x} {...XYZProps} />
            <NumberInput name="rotationy" value={props.object.rotation.y} {...XYZProps} />
            <NumberInput name="rotationz" value={props.object.rotation.z} {...XYZProps} />
          </GridRow>
        )}

        {props.object.hasOwnProperty("theta") && (
          <GridRow label={"theta"}>
            <NumberInput name="theta" value={props.object.theta} {...XYZProps} />
          </GridRow>
        )}

        {props.object.hasOwnProperty("phi") && (
          <GridRow label={"phi"}>
            <NumberInput name="phi" value={props.object.phi} {...XYZProps} />
          </GridRow>
        )}

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
      </div>
      <PropertyRow>
        <PropertyRowLabel label="Signal Source" tooltip="The source thats generating it's signal" />
        <select
          value={props.object.signalSource}
          name="signalSource"
          onChange={(e) => {
            props.onPropertyChange({
              value: e.currentTarget.selectedIndex,
              name: e.currentTarget.name,
              type: "select"
            });
          }}
        >
          <option value={SignalSource.NONE}>None</option>
          <option value={SignalSource.OSCILLATOR}>Oscillator</option>
          <option value={SignalSource.PINK_NOISE}>Pink Noise</option>
          <option value={SignalSource.WHITE_NOISE}>White Noise</option>
          <option value={SignalSource.PULSE}>Pulse</option>
        </select>
      </PropertyRow>
      <Slider
        id="frequency"
        label="Frequency"
        labelPosition="left"
        tooltipText="Changes the source's frequency"
        min={Math.min(props.object.frequency, 0)}
        max={Math.max(props.object.frequency, 200)}
        step={Math.min(decimalPrecision(props.object.frequency), 0.1)}
        value={props.object.frequency}
        onChange={(e: SliderChangeEvent) => {
          props.onPropertyChange({
            name: "frequency",
            type: "number",
            value: e.value
          });
        }}
      />

      <Slider
        id="phi"
        label="Phi MAX"
        labelPosition="left"
        tooltipText="Changes the source's phi"
        min={0}
        max={360}
        step={0.05}
        value={props.object.phi}
        onChange={(e: SliderChangeEvent) => {
          props.onPropertyChange({
            name: "phi",
            type: "number",
            value: e.value
          });
        }}
      />
      <Slider
        id="theta"
        label="Theta MAX"
        labelPosition="left"
        tooltipText="Changes the source's theta"
        min={0}
        max={180}
        step={0.05}
        value={props.object.theta}
        onChange={(e: SliderChangeEvent) => {
          props.onPropertyChange({
            name: "theta",
            type: "number",
            value: e.value
          });
        }}
      /> 
      <Slider
        id="amplitude"
        label="Amplitude"
        labelPosition="left"
        tooltipText="Changes the source's amplitude"
        min={0}
        max={10}
        step={0.1}
        value={props.object.amplitude}
        onChange={(e: SliderChangeEvent) => {
          props.onPropertyChange({
            name: "amplitude",
            type: "number",
            value: e.value
          });
        }}
      />
      <PropertyRow>
        <PropertyRowLabel label="Signal Data" tooltip="The signal sources signal data" />
        <div>
          <PropertyRowButton
            onClick={(e) => {
              if (props.object.fdtdSamples.length > 0) {
                props.object.saveSamples();
              } else {
                props.messenger.postMessage("SHOW_TOAST", {
                  message: `No signal data.`,
                  intent: "warning",
                  timeout: 1750,
                  icon: "issue"
                } as IToastProps);
              }
            }}
            label="Download"
          />
        </div>
      </PropertyRow>
      <PropertyRow>
        <PropertyRowLabel label="CLF Data" tooltip="Import CLF directivity text files"/>
        <div>
          <input
          type = "file"
          id = "clfinput"
          accept = ".tab"
          onChange={(e) => {
              console.log(e.target.files);
              const reader = new FileReader();
              
              reader.addEventListener('loadend', (loadEndEvent) => {
                  let filecontents:string = reader.result as string; 
                  let clf = new CLFParser(filecontents);
                  let clf_results = clf.parse();
                  let dh = new DirectivityHandler(1,clf_results); 

                  props.object.directivityHandler = dh; 

                  // display CLF parser object (debugging)
                  console.log(clf);
                  // display CLF parser results (debugging)
                  console.log(clf_results);
              });

              reader.readAsText(e.target!.files![0]);
              
            }
          }
          />
        </div>
      </PropertyRow>
    </div>
  );
}
