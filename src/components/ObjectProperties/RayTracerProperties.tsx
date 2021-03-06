import React from "react";
import TextInput from "../text-input/TextInput";
import NumberInput from "../number-input/NumberInput";
import { ObjectPropertyInputEvent } from '.';
import CheckboxInput from "../checkbox-input/CheckboxInput";
import Source from '../../objects/source';
import GridRow from '../grid-row/GridRow';
import GridRowSeperator from '../grid-row/GridRowSeperator';
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
  
  const [plotMode, setPlotMode] = React.useState(
    props.object.plotStyle.mode
      ? props.object.plotStyle.mode.split("+").map((x) => {
          return {
            value: x,
            label: x,
            key: x,
            id: x
          };
        })
      : [
          {
            value: "lines",
            label: "lines",
            key: "lines",
            id: "lines"
          }
        ]
  );
  
  const plotModeOptions = [
    {
      value: "lines",
      label: "lines",
      key: "lines",
      id: "lines"
    },
    {
      value: "markers",
      label: "markers",
      key: "markers",
      id: "markers"
    }
  ];
  
  const XYZProps = {
    style: {
      width: "30%"
    },
    onChange: props.onPropertyChange,
  };

  const onSourceChange = (e) => {
    props.messenger.postMessage("RAYTRACER_SOURCE_CHANGE", !e ? [] : e, props.object.uuid);
  }

  const onReceiverChange = e => {
    props.messenger.postMessage("RAYTRACER_RECEIVER_CHANGE", !e? [] : e, props.object.uuid);
  };

  const onPlotModeChange = e => {
    setPlotMode(e);
    props.object.updatePlotStyle({
      mode: e ? e.map(x => x.value).join("+") : "none"
    })
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

        {props.object.hasOwnProperty("passes") && (
          <GridRow label={"passes"}>
            <NumberInput name="passes" value={props.object.passes} {...XYZProps} min={1} step={1} />
          </GridRow>
        )}

        {props.object.hasOwnProperty("_pointSize") && (
          <GridRow label={"point size"}>
            <NumberInput name="pointSize" value={props.object.pointSize} {...XYZProps} min={1} step={1} />
          </GridRow>
        )}

        {props.object.hasOwnProperty("_raysVisible") && (
          <GridRow label="show rays">
            <CheckboxInput
              checkedNode={<div className="checked-icon"></div>}
              uncheckedNode={<div className="unchecked-icon" />}
              name={"raysVisible"}
              onChange={props.onPropertyChange}
              checked={props.object.raysVisible}
            />
          </GridRow>
        )}

        {props.object.hasOwnProperty("_pointsVisible") && (
          <GridRow label="show intersections">
            <CheckboxInput
              checkedNode={<div className="checked-icon"></div>}
              uncheckedNode={<div className="unchecked-icon" />}
              name={"pointsVisible"}
              onChange={props.onPropertyChange}
              checked={props.object.pointsVisible}
            />
          </GridRow>
        )}

        {props.object.hasOwnProperty("_runningWithoutReceivers") && (
          <GridRow label="ignore receivers">
            <CheckboxInput
              checkedNode={<div className="checked-icon"></div>}
              uncheckedNode={<div className="unchecked-icon" />}
              name={"runningWithoutReceivers"}
              onChange={props.onPropertyChange}
              checked={props.object.runningWithoutReceivers}
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
          <Button
            name="ray-tracer-clear"
            icon="cross"
            onClick={props.onButtonClick}
            minimal
            className={"bp3-small-icon-button"}
          />
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
            onClick={(e) =>
              props.messenger.postMessage(
                "RAYTRACER_CALCULATE_RESPONSE",
                props.object.uuid,
                props.object.reflectionLossFrequencies
              )
            }
          />
        </GridRow>

        <GridRowSeperator />

        {props.object.hasOwnProperty("intensitySampleRate") && (
          <GridRow label={"Sample Rate"}>
            <NumberInput
              name="intensitySampleRate"
              value={props.object.intensitySampleRate}
              {...XYZProps}
              min={32}
              step={1}
            />
          </GridRow>
        )}
        <GridRow span={2}>
          <Button text="Calculate Response by Intensity" onClick={(e) => props.object.calculateResponseByIntensity()} />
        </GridRow>
        <GridRow span={2}>
          <Button text="Show Plot" onClick={(e) => props.object.showPlot()} />
        </GridRow>
        <GridRow span={2}>
          <Button text="Hide Plot" onClick={(e) => props.object.hidePlot()} />
        </GridRow>

        <GridRow span={2}>
          <Button text="Plot Response by Intensity" onClick={(e) => props.object.plotResponseByIntensity()} />
        </GridRow>
        <GridRow label="Plot Mode"></GridRow>
        
        <GridRow span={2}>
          <Select
            defaultValue={plotMode}
            isMulti
            name="plotMode"
            options={plotModeOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            key={"plotMode"}
            styles={customStyles}
            onChange={onPlotModeChange}
          />
        </GridRow>

        <GridRowSeperator />
        <GridRow span={2}>
          <Button
            text="Quick Estimate"
            onClick={(e) => props.messenger.postMessage("RAYTRACER_QUICK_ESTIMATE", props.object.uuid)}
          />
        </GridRow>

        {/* <GridRow span={2}>
          <Button text="Test WASM" onClick={(e) => props.messenger.postMessage("RAYTRACER_TEST_WASM", props.object.uuid, Math.random())} />
        </GridRow> */}
      </div>
    </div>
  );
}
