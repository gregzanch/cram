import React from "react";
import TextInput from "../text-input/TextInput";
import NumberInput from "../number-input/NumberInput";
import { ObjectPropertyInputEvent } from ".";
import CheckboxInput from "../CheckboxInput";
import GridRow from "../GridRow";
import Receiver from "../../objects/receiver";
import ColorInput from "../ColorInput";
import PropertyRow from "../parameter-config/property-row/PropertyRow";
import PropertyRowLabel from "../parameter-config/property-row/PropertyRowLabel";
import PropertyRowButton from "../parameter-config/property-row/PropertyRowButton";
import GridRowSeperator from "../GridRowSeperator";
import Messenger from "../../messenger";
import { IToastProps } from "@blueprintjs/core";

export interface ReceiverPropertiesProps {
  messenger: Messenger;
  object: Receiver;
  onPropertyChange: (e: ObjectPropertyInputEvent) => void;
  onPropertyValueChangeAsNumber: (id: string, prop: string, valueAsNumber: number) => void;
  onPropertyValueChangeAsString: (id: string, prop: string, valueAsString: string) => void;
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
  };

  // const [name, setName] = useState(props.object.name);
  // const [visible, setVisible] = useState(props.object.visible);

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
        <GridRowSeperator />
      </div>
      <PropertyRow>
        <PropertyRowLabel label="Recorded Data" tooltip="The recorded samples from an FDTD-2D simulation" />
        <div>
          {/* <PropertyRowButton
            onClick={() => {
              if (props.object.fdtdSamples.length > 0) {
                props.messenger.postMessage("SHOW_RECEIVER_FDTD", { uuid: props.object.uuid, name: props.object.name + " - Data" });
              } else {
                props.messenger.postMessage("SHOW_TOAST", {
                  message: `No data has been recorded!`,
                  intent: "warning",
                  timeout: 1750,
                  icon: "issue"
                } as IToastProps);
              }
            }}
            label="Open in Gutter"
          /> */}
          <PropertyRowButton
            onClick={() => {
              if (props.object.fdtdSamples.length > 0) {
                props.object.saveSamples();
              } else {
                props.messenger.postMessage("SHOW_TOAST", {
                  message: `No data has been recorded!`,
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
    </div>
  );
}
