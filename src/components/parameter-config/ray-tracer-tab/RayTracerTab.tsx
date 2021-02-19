import React, { useCallback, useEffect, useRef, useState } from "react";
import "./RayTracerTab.css";
import RayTracer from "../../../compute/raytracer";
import Plot from "react-plotly.js";
import { Button } from "@blueprintjs/core";
import ObjectProperties from "../../ObjectProperties";
import Messenger, { emit, on } from "../../../messenger";
import { ObjectPropertyInputEvent } from "../../ObjectProperties";
import SplitterLayout from "react-splitter-layout";
import RayTracerResults from "../ray-tracer-results/RayTracerResults";
import PanelContainer from "../../panel-container/PanelContainer";
import RayTracerProperties from "../../ObjectProperties/RayTracerProperties";
import { useContainer, useSolver } from "../../../store";
import produce from "immer";
import GridRow from "../../grid-row/GridRow";
import TextInput from "../../text-input/TextInput";
import NumberInput from "../../number-input/NumberInput";
import { filteredMapObject, mapObject, pickProps } from "../../../common/helpers";
import GridRowSeperator from "../../grid-row/GridRowSeperator";
import Select from "react-select";
import { StringNullableChain } from "lodash";

import Slider, { SliderChangeEvent } from '../../slider/Slider';


import { clamp } from '../../../common/clamp';
import PropertyRow from "../property-row/PropertyRow";
import Label from "../../label/Label";
import PropertyRowLabel from "../property-row/PropertyRowLabel";
import PropertyRowButton from "../property-row/PropertyRowButton";
import {PropertyRowCheckbox} from "../property-row/PropertyRowCheckbox";
import PropertyRowFolder from "../property-row/PropertyRowFolder";
import { postMessage } from "../../../messenger";
import {PropertyRowTextInput} from "../property-row/PropertyRowTextInput";
import { PropertyRowNumberInput, StyledInput } from "../property-row/PropertyRowNumberInput";



export interface RayTracerTabProps {
  uuid: string;
}

function useRayTracerProperties(properties: (keyof RayTracer)[], raytracer: RayTracer, set: any) {
  const [state, setState] = useState(pickProps(properties, raytracer));
  const setFunction = <T extends keyof typeof state>(property: T, value: typeof state[T]) => {
    setState({ ...state, [property]: value });
    // set((solvers) => void (solvers.solvers[raytracer.uuid][property] = value));
  };
  return [state, setFunction] as [typeof state, typeof setFunction];
}

type DropdownOption = {
  uuid: string;
  name: string;
};

function getSourcesAndReceivers(state) {
  const sources = [] as DropdownOption[];
  const receivers = [] as DropdownOption[];
  Object.keys(state.containers).forEach((uuid) => {
    switch (state.containers[uuid].kind) {
      case "source":
        sources.push({ uuid, name: state.containers[uuid].name });
        break;
      case "receiver":
        receivers.push({ uuid, name: state.containers[uuid].name });
        break;
      default:
        console.log(state.containers);
        break;
    }
  });
  return [sources, receivers] as [DropdownOption[], DropdownOption[]];
}

type LabeledInputRowProps<T extends string | number> = {
  label: string;
  name: keyof RayTracer;
  value: T;
  onChange: (e: ObjectPropertyInputEvent) => void;
};

const LabeledTextInputRow = ({ label, name, value, onChange }: LabeledInputRowProps<string>) => (
  <GridRow label={label}>
    <TextInput name={name} value={value} onChange={onChange} />
  </GridRow>
);

const LabeledNumberInputRow = ({ label, name, value, onChange }: LabeledInputRowProps<number>) => (
  <GridRow label={label}>
    <NumberInput name={name} value={value} onChange={onChange} />
  </GridRow>
);

function useSolverProperty(uuid, property, event){
  const defaultValue = useSolver(state => state.solvers[uuid][property]);
  const [state, setState] = useState(defaultValue);
  
  useEffect(() => on(event, (props) => {
    if(props.uuid === uuid && props.property === property){
      setState(props.value)
    }
  }), [uuid])
  
  const changeHandler = e => emit(event, { uuid, property, value: e.value });

  return [state, changeHandler]
}


const PropertyTextInput = ({ uuid, property, label, tooltip }) => {
  const [state, changeHandler] = useSolverProperty(uuid, property, "RAYTRACER_SET_PROPERTY");
  return (
    <PropertyRow>
      <PropertyRowLabel label={label} hasToolTip tooltip={tooltip} />
      <PropertyRowTextInput value={state} onChange={changeHandler} />
    </PropertyRow>
  )
}

const PropertyNumberInput = ({ uuid, property, label, tooltip }) => {
  const [state, changeHandler] = useSolverProperty(uuid, property, "RAYTRACER_SET_PROPERTY");
  return (
    <PropertyRow>
      <PropertyRowLabel label={label} hasToolTip tooltip={tooltip} />
      <PropertyRowNumberInput value={state} onChange={changeHandler} />
    </PropertyRow>
  )
}

const PropertyCheckboxInput = ({ uuid, property, label, tooltip }) => {
  const [state, changeHandler] = useSolverProperty(uuid, property, "RAYTRACER_SET_PROPERTY");
  return (
    <PropertyRow>
      <PropertyRowLabel label={label} hasToolTip tooltip={tooltip} />
      <PropertyRowCheckbox value={state} onChange={changeHandler} />
    </PropertyRow>
  )
}

const PropertyButton = <T extends keyof EventTypes>({ args, event, label, tooltip }: {args: EventTypes[T], event: T, label: string, tooltip: string}) => {
  return (
    <PropertyRow>
      <PropertyRowLabel label={label} hasToolTip tooltip={tooltip} />
      <PropertyRowButton onClick={e=>emit(event, args)} label={label}/>
    </PropertyRow>
  )
}


const useToggle = (initialState: boolean) => {
  const [state, setState] = useState(initialState);
  return [state, () => void setState(!state)] as [boolean, () => void];
}


export const ReceiverSelect = ({uuid}) => {
  const receivers = useContainer(state => {
    return filteredMapObject(
      state.containers, 
      container => container.kind === "receiver" ? pickProps(["uuid", "name"], container) : undefined
    ) as {uuid: string, name: string}[]
  });

  const [receiverIDs, setReceiverIDs] = useSolverProperty(uuid, "receiverIDs", "RAYTRACER_SET_PROPERTY");


  return (
    <Select
    styles={{
      container: (provided) => ({
        ...provided,
        // height: 20
      }),
      control: (provided) => ({
        ...provided,
        minHeight: "unset"
      }),
      indicatorsContainer: (provided) => ({
        ...provided,
        padding: 0
      }),
      indicatorSeparator: (provided) => ({
        ...provided,
        padding: 0
      })
    }}
    isMulti
    isClearable
    getOptionLabel={(item) => item.name}
    getOptionValue={(item) => item.uuid}
    value={receivers.filter((x) => receiverIDs.includes(x.uuid))}
    onChange={(e) => setReceiverIDs({value: e ? e.map((x) => x.uuid) : []})}
    options={receivers.filter((x) => !receiverIDs.includes(x.uuid))}
  />)
}

export const SourceSelect = ({uuid}) => {
  const sources = useContainer(state => {
    return filteredMapObject(
      state.containers, 
      container => container.kind === "source" ? pickProps(["uuid", "name"], container) : undefined
    ) as {uuid: string, name: string}[]
  });

  const [sourceIDs, setSourceIDs] = useSolverProperty(uuid, "sourceIDs", "RAYTRACER_SET_PROPERTY");


  return (
    <Select
    isMulti
    isClearable
    getOptionLabel={(item) => item.name}
    getOptionValue={(item) => item.uuid}
    value={sources.filter((x) => sourceIDs.includes(x.uuid))}
    onChange={(e) => setSourceIDs({value: e ? e.map((x) => x.uuid) : []})}
    options={sources.filter((x) => !sourceIDs.includes(x.uuid))}
  />)
}

export const RayTracerTab = ({ uuid }: RayTracerTabProps) => {


  const [generalFolderOpen, toggleGeneralFolder] = useToggle(true);
  const [paramsFolderOpen, toggleParamsFolder] = useToggle(true);
  const [styleFolderOpen, toggleStyleFolder] = useToggle(true);
  const [receiverFolderOpen, toggleReceiverFolder] = useToggle(true);
  const [controlsFolderOpen, toggleControlsFolder] = useToggle(true);
  

  return (
    <div>
    <PropertyRowFolder label="General" open={generalFolderOpen} onOpenClose={toggleGeneralFolder}>
      <PropertyTextInput uuid={uuid} label="Name" property="name" tooltip="Sets the name of this solver"/>
    </PropertyRowFolder>

    <PropertyRowFolder label="Parameters" open={paramsFolderOpen} onOpenClose={toggleParamsFolder}>
      <PropertyNumberInput uuid={uuid} label="Rate (ms)" property="updateInterval" tooltip="Sets the callback rate"/>
      <PropertyNumberInput uuid={uuid} label="Order" property="reflectionOrder" tooltip="Sets the maximum reflection order"/>
      <PropertyNumberInput uuid={uuid} label="Passes" property="passes" tooltip="Number of rays shot on each callback"/>
    </PropertyRowFolder>

    <PropertyRowFolder label="Reciever Configuration" open={receiverFolderOpen} onOpenClose={toggleReceiverFolder}>
      {/* <ReceiverSelect uuid={uuid} /> */}
      <PropertyCheckboxInput uuid={uuid} label="Ignore Receivers" property="runningWithoutReceivers" tooltip="Ignores receiver intersections"/>
    </PropertyRowFolder>

    <PropertyRowFolder label="Style Properties" open={styleFolderOpen} onOpenClose={toggleStyleFolder}>
      <PropertyNumberInput uuid={uuid} label="Point Size" property="pointSize" tooltip="Sets the size of each interection point"/>
      <PropertyCheckboxInput uuid={uuid} label="Rays Visible" property="raysVisible" tooltip="Toggles the visibility of the rays"/>
      <PropertyCheckboxInput uuid={uuid} label="Points Visible" property="pointsVisible" tooltip="Toggles the visibility of the intersection points"/>
    </PropertyRowFolder>

    
    <PropertyRowFolder label="Solver Controls" open={controlsFolderOpen} onOpenClose={toggleControlsFolder}>
      <PropertyCheckboxInput uuid={uuid} label="Running" property="isRunning" tooltip="Starts/stops the raytracer"/>
      <PropertyButton event="RAYTRACER_CLEAR_RAYS" args={uuid} label="Clear Rays" tooltip="Clears all of the rays"/>
    </PropertyRowFolder>

    
      {/* <SourceSelect uuid={uuid} /> */}













{/*


      <GridRowSeperator />

      <GridRow label={"run"}>
        <input
          type="checkbox"
          name="isRunning"
          checked={raytracer.isRunning}
          onChange={(e) => {
            emit("RAYTRACER_SET_PROPERTY", { uuid, property: "isRunning", value: !raytracer.isRunning });
          }}
        />
      </GridRow>

      <GridRow label={"clear"}>
        <input
          type="button"
          name="clear"
          value="clear"
          onClick={(e) => {
            emit("RAYTRACER_CLEAR_RAYS", uuid);
          }}
        />
      </GridRow>

      <GridRowSeperator />
      <GridRow label="sources">
        <Select
          isMulti
          isClearable
          getOptionLabel={(item) => item.name}
          getOptionValue={(item) => item.uuid}
          value={sources.filter((x) => raytracer.sourceIDs.includes(x.uuid))}
          onChange={(e) => {
            emit("RAYTRACER_SET_PROPERTY", { uuid, property: "sourceIDs", value: e ? e.map((x) => x.uuid) : [] });
          }}
          options={sources.filter((x) => !raytracer.sourceIDs.includes(x.uuid))}
        />
      </GridRow>
      <GridRow label="receivers">
        
      </GridRow> */}
      {/* <Select
      name="Sources"
      onChange={(e) => {
        
        emit("RAYTRACER_SET_PROPERTY", {uuid, property: "sourceIDs", value: e!.map(x=>x.uuid)})
      }}
      value={"add source"}
    >
      {sortMethods.map((key: SortMethod) => {
        return (
          <option key={key} value={key}>
            {SortMethods[key]}
          </option>
        );
      })}
    </Select> */}

      <GridRow span={2}></GridRow>

      {/* 



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
        </GridRow> */}

      {/* <GridRow span={2}>
          <Button text="Test WASM" onClick={(e) => props.messenger.postMessage("RAYTRACER_TEST_WASM", props.object.uuid, Math.random())} />
        </GridRow> */}
    </div>
  );
};

export default RayTracerTab;

// export default class RayTracerTab extends React.Component<RayTracerTabProps, RayTracerTabState> {
//   constructor(props: RayTracerTabProps) {
//     super(props);
//     this.state = {
//     };
//     this.handleObjectPropertyChange = this.handleObjectPropertyChange.bind(this);
//     this.handleObjectPropertyValueChangeAsNumber = this.handleObjectPropertyValueChangeAsNumber.bind(this);
//     this.handleObjectPropertyValueChangeAsString = this.handleObjectPropertyValueChangeAsString.bind(this);
//     this.handleObjectPropertyButtonClick = this.handleObjectPropertyButtonClick.bind(this);
//   }

//   handleObjectPropertyChange(e: ObjectPropertyInputEvent) {
// 		const prop = e.name;
// 		switch (e.type) {
// 			case "checkbox":
// 				this.props.solver[prop] = e.value;
// 				break;
// 			case "text":
// 				this.props.solver[prop] = e.value;
// 				break;
// 			case "number":
// 				this.props.solver[prop] = Number(e.value);
// 				break;
//       default:
// 				  this.props.solver[prop] = e.value;
// 				break;
//     }
//     this.forceUpdate();
// 	}
//   handleObjectPropertyValueChangeAsNumber(
// 		id: string,
// 		prop: string,
// 		valueAsNumber: number
// 	) {
//     this.props.solver[prop] = valueAsNumber;
//     this.forceUpdate();
// 	}
// 	handleObjectPropertyValueChangeAsString(
// 		id: string,
// 		prop: string,
// 		valueAsString: string
// 	) {
//     this.props.solver[prop] = valueAsString;
//     this.forceUpdate();
//   }
//   handleObjectPropertyButtonClick(e: React.MouseEvent<HTMLInputElement, MouseEvent>) {
//     switch (e.currentTarget.name) {
//       case "ray-tracer-play":
//         this.props.messenger.postMessage("RAYTRACER_SHOULD_PLAY", this.props.solver.uuid);
//         break;
//       case "ray-tracer-pause":
//         this.props.messenger.postMessage("RAYTRACER_SHOULD_PAUSE", this.props.solver.uuid);
//         this.props.messenger.postMessage("RESULTS_SHOULD_UPDATE");
//         break;
//       case "ray-tracer-clear":
//         this.props.messenger.postMessage("RAYTRACER_SHOULD_CLEAR", this.props.solver.uuid);
//         this.props.messenger.postMessage("RESULTS_SHOULD_UPDATE");
//         break;
//       case "ray-tracer-show-results":
//          this.props.messenger.postMessage("GUTTER_SHOULD_SPLIT");
//         break;
//       case "ray-tracer-hide-results":
//         this.props.messenger.postMessage("GUTTER_SHOULD_MERGE");
//         break;
//       default: break;
//     }
//     this.forceUpdate();
//   }

//   render() {
//     return (
//       <RayTracerProperties
//         messenger={this.props.messenger}
//         object={this.props.solver}
//         onPropertyChange={this.handleObjectPropertyChange}
//         onPropertyValueChangeAsNumber={this.handleObjectPropertyValueChangeAsNumber}
//         onPropertyValueChangeAsString={this.handleObjectPropertyValueChangeAsString}
//         onButtonClick={this.handleObjectPropertyButtonClick}
//       />
//     );
//   }

//   // render() {
//   //   const receiverIntersectionData = this.getAllReceiverIntersectionData();
//   //   const chartdata = this.props.solver.chartdata.map((d, i) => {
//   //     return {
//   //       x: d.x,
//   //       y: d.y,
//   //       type: "scatter",
//   //       name: d.label,
//   //       mode: "lines",
//   //       marker: { color: colors[i % colors.length] }
//   //     };
//   //   });
//   //   return (
//   //     <div className="raytracer_tab">
//   //       <Button onClick={e => this.forceUpdate()} text="refresh" icon="refresh" minimal />
//   //       <div className="raytracer_tab-plots-container">
//   //         <div className="raytracer_tab-intersection_plot-container">
//   //           {receiverIntersectionData && receiverIntersectionData.length > 0 && (
//   //             <Plot
//   //               data={receiverIntersectionData}
//   //               layout={{
//   //                 margin: {
//   //                   l: 5,
//   //                   r: 5,
//   //                   b: 5,
//   //                   t: 10
//   //                 },
//   //                 scene: {
//   //                   aspectratio: {
//   //                     x: 2,
//   //                     y: 2,
//   //                     z: 2
//   //                   },
//   //                   camera: {
//   //                     center: {
//   //                       x: 0,
//   //                       y: 0,
//   //                       z: 0
//   //                     },
//   //                     eye: {
//   //                       x: 2,
//   //                       y: 2,
//   //                       z: 2
//   //                     },
//   //                     up: {
//   //                       x: 0,
//   //                       y: 0,
//   //                       z: 1
//   //                     }
//   //                   },
//   //                   xaxis: {
//   //                     type: "linear",
//   //                     zeroline: false
//   //                   },
//   //                   yaxis: {
//   //                     type: "linear",
//   //                     zeroline: false
//   //                   },
//   //                   zaxis: {
//   //                     type: "linear",
//   //                     zeroline: false
//   //                   }
//   //                 }
//   //               }}
//   //               config={{
//   //                 responsive: true
//   //               }}
//   //               className="raytracer_tab-intersection_plot"
//   //               style={{ width: "100%", height: "300px" }}
//   //             />
//   //           )}
//   //         </div>
//   //         <div className="raytracer_tab-response_plot-container">
//   //           {chartdata && chartdata.length > 0 && (
//   //             <Plot
//   //               data={chartdata}
//   //               className="raytracer_tab-response_plot"
//   //               layout={{ title: "Energy Response" }}
//   //               config={{ responsive: true }}
//   //               style={{ width: "100%", height: "300px" }}
//   //             />
//   //           )}
//   //         </div>
//   //       </div>
//   //     </div>
//   //   );
//   // }

// }
