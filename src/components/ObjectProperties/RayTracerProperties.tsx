import React, { Fragment } from "react";
import TextInput from "../TextInput";
import NumberInput, { ObjectPropertyInputEvent } from "../NumberInput";
import CheckboxInput from "../CheckboxInput";
import Source from '../../objects/source';
import GridRow from '../GridRow';
import GridRowSeperator from '../GridRowSeperator';
import RayTracer from "../../compute/raytracer";
import { Button } from "@blueprintjs/core";
import Select, { components } from "react-select";
import Messenger from "../../messenger";


export interface RayTracerPropertiesProps {
  object: RayTracer;
  messenger: Messenger;
  onPropertyChange: (e: ObjectPropertyInputEvent) => void;
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

  const onSourceChange = (e) => {
    console.log(e);
    props.messenger.postMessage("RAYTRACER_SOURCE_CHANGE", !e ? [] : e, props.object.uuid);
    
  }

  const onReceiverChange = e => {
    console.log(e);
    props.messenger.postMessage("RAYTRACER_RECEIVER_CHANGE", !e? [] : e, props.object.uuid);
  };

  let sources = props.messenger.postMessage("FETCH_ALL_SOURCES")[0];
  const sourcesSelectOptions = sources.map(x => {
    return {
      value: x.uuid,
      label: x.name,
      key: x.uuid,
      id: x.uuid
    };
  });
  if (sources.length > 0) {
    sources = sources.filter(x => props.object.sourceIDs.includes(x.uuid))
  }
  const sourceSelectedOptions = sources.map(x => {
     return {
       value: x.uuid,
       label: x.name,
       key: x.uuid,
       id: x.uuid
     };
  })
  
  let receivers = props.messenger.postMessage("FETCH_ALL_RECEIVERS")[0]
  const receiverSelectOptions = receivers.map(x => {
    return {
      value: x.uuid,
      label: x.name,
      key: x.uuid,
      id: x.uuid
    };
  });    
  if (receivers.length > 0) {
    receivers = receivers.filter(x => props.object.receiverIDs.includes(x.uuid));
  }
  const receiverSelectedOptions = receivers.map(x => {
    return {
      value: x.uuid,
      label: x.name,
      key: x.uuid,
      id: x.uuid
    };
  })
   
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
  
  return (
    <div>
      <div style={RayTracerPropertiesContainerStyle}>
        {props.object.hasOwnProperty("name") && (
          <GridRow label={"name"}>
            <TextInput name="name" value={props.object.name} onChange={props.onPropertyChange} />
          </GridRow>
        )}

        {props.object.hasOwnProperty("updateInterval") && (
          <GridRow label={"rate (ms)"}>
            <NumberInput name="updateInterval" value={props.object.updateInterval} {...XYZProps} />
          </GridRow>
        )}

        {props.object.hasOwnProperty("reflectionOrder") && (
          <GridRow label={"order"}>
            <NumberInput name="reflectionOrder" value={props.object.reflectionOrder} {...XYZProps} />
          </GridRow>
        )}
        {props.object.hasOwnProperty("runWithoutReceiver") && (
          <GridRow label="stochastic">
            <CheckboxInput
              checkedNode={<div className="checked-icon"></div>}
              uncheckedNode={<div className="unchecked-icon" />}
              name={"runWithoutReceiver"}
              onChange={props.onPropertyChange}
              checked={props.object.runWithoutReceiver}
            />
          </GridRow>
        )}
        <GridRowSeperator />
        <GridRow label={"run"}>
          <Button
            name={props.object.isRunning ? "ray-tracer-pause" : "ray-tracer-play"}
            icon={props.object.isRunning ? "pause" : "play"}
            onClick={props.onButtonClick}
            minimal
            className={"bp3-small-icon-button"}
          />
        </GridRow>
        <GridRow label={"clear"}>
          <Button name="ray-tracer-clear" icon="cross" onClick={props.onButtonClick} minimal className={"bp3-small-icon-button"} />
        </GridRow>
        <GridRowSeperator />
        <GridRow label="sources"></GridRow>
        <GridRow span={2}>
          <Select
            defaultValue={sourceSelectedOptions}
            isMulti
            name="sources"
            options={sourcesSelectOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            key={"sources"}
            styles={customStyles}
            onChange={onSourceChange}
          />
        </GridRow>

        <GridRow label="receivers"></GridRow>
        <GridRow span={2}>
          <Select
            defaultValue={receiverSelectedOptions}
            isMulti
            name="receivers"
            options={receiverSelectOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            key={"receievers"}
            styles={customStyles}
            onChange={onReceiverChange}
          />
        </GridRow>

        <GridRowSeperator />
        <GridRow span={2}>
          <Button
            text="Calulate Response"
            onClick={(e) => props.messenger.postMessage("RAYTRACER_CALCULATE_RESPONSE", props.object.uuid, props.object.reflectionLossFrequencies)}
          />
        </GridRow>
        <GridRow span={2}>
          <Button text="Test WASM" onClick={(e) => props.messenger.postMessage("RAYTRACER_TEST_WASM", props.object.uuid, Math.random())} />
        </GridRow>
      </div>
    </div>
  );
}
