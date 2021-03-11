import React, { useCallback, useEffect, useRef, useState } from "react";
import "./ImageSourceTab.css";
import RayTracer from "../../../compute/raytracer";
import {ImageSourceSolver} from "../../../compute/raytracer/image-source/index"; 
import { emit, on } from "../../../messenger";
import { ObjectPropertyInputEvent } from "../../ObjectProperties";
import { useContainer, useSolver } from "../../../store";
import GridRow from "../../grid-row/GridRow";
import TextInput from "../../text-input/TextInput";
import NumberInput from "../../number-input/NumberInput";
import { pickProps } from "../../../common/helpers";
import GridRowSeperator from "../../grid-row/GridRowSeperator";
import Select from 'react-select';
import useToggle from "../../hooks/use-toggle";
import { createPropertyInputs, useSolverProperty } from "../SolverComponents";
import PropertyRowFolder from "../property-row/PropertyRowFolder";
import PropertyButton from '../property-row/PropertyButton';

export interface ImageSourceTabProps {
  uuid: string;
}

const { PropertyTextInput, PropertyNumberInput, PropertyCheckboxInput } = createPropertyInputs<ImageSourceSolver>(
  "IMAGESOURCE_SET_PROPERTY"
);

function useImageSourceProperties(properties: (keyof ImageSourceSolver)[], imagesourcesolver: ImageSourceSolver, set: any) {
  const [state, setState] = useState(pickProps(properties, imagesourcesolver));
  const setFunction = <T extends keyof typeof state>(property: T, value: typeof state[T]) => {
    setState({ ...state, [property]: value });
    // set((solvers) => void (solvers.solvers[raytracer.uuid][property] = value));
  };
  return [state, setFunction] as [typeof state, typeof setFunction];
}

type DropdownOption = {
  uuid: string, 
  name: string
};

function getSourcesAndReceivers(state) {
  const sources = [] as DropdownOption[];
  const receivers = [] as DropdownOption[];
  Object.keys(state.containers).forEach((uuid) => {
    switch (state.containers[uuid].kind) {
      case "source":
        sources.push({uuid, name: state.containers[uuid].name});
        break;
      case "receiver":
        receivers.push({uuid, name: state.containers[uuid].name});
        break;
      default:
        console.log(state.containers)
        break;
    }
  });
  return [sources, receivers] as [DropdownOption[], DropdownOption[]];
}

type LabeledInputRowProps<T extends string | number> = {
  label: string;
  name: keyof RayTracer;
  value: T,
  onChange: (e: ObjectPropertyInputEvent) => void
}

const LabeledTextInputRow = ({label, name, value, onChange}: LabeledInputRowProps<string>) => (
  <GridRow label={label}>
    <TextInput name={name} value={value} onChange={onChange} />
  </GridRow>
)

const LabeledNumberInputRow = ({label, name, value, onChange}: LabeledInputRowProps<number>) => (
  <GridRow label={label}>
    <NumberInput name={name} value={value} onChange={onChange} />
  </GridRow>
)


const General = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="General" open={open} onOpenClose={toggle}>
      <PropertyTextInput uuid={uuid} label="Name" property="name" tooltip="Sets the name of this solver" />
    </PropertyRowFolder>
  );
};

export const ImageSourceTab = ({ uuid }: ImageSourceTabProps) => {
  const [imagesourcesolver, set] = useSolver<[ImageSourceSolver, any]>((state) => [state.solvers[uuid] as ImageSourceSolver, state.set]);
  const [sources, receivers] = useContainer(getSourcesAndReceivers);
  const [state, setState] = useImageSourceProperties(["name"], imagesourcesolver, set);

  useEffect(() => {
    return on("IMAGESOURCE_SET_PROPERTY", (props) => {
      if (props.uuid === uuid) setState(props.property, props.value);
    });
  }, []);


  const onChangeHandler =  useCallback((e: ObjectPropertyInputEvent) => {
    emit("IMAGESOURCE_SET_PROPERTY", { uuid, property: e.name as keyof ImageSourceSolver, value: e.value });
  }, [uuid]);


  return (
    <div style={{display: 'grid'}}>
      <General uuid={uuid} />
      <LabeledTextInputRow label="Name" name="name" value={state.name} onChange={onChangeHandler} />
    
      <GridRow label={"Maximum Order"}>
        <NumberInput
          name="maxReflectionOrder"
          value={imagesourcesolver.maxReflectionOrder}
          onChange={(e) => {
            emit("IMAGESOURCE_SET_PROPERTY", { uuid, property: "maxReflectionOrder", value: e.value });
          }}
        />
      </GridRow>

      <GridRowSeperator />

      <GridRow label={"Calculate Image Sources"}>
        <button
          disabled={imagesourcesolver.sourceIDs.length==0 || imagesourcesolver.receiverIDs.length==0}
          onClick={(e) => {
            imagesourcesolver.updateImageSourceCalculation(); 
          }}>
          Update
        </button>
      </GridRow>

      <GridRow label={"Clear Calculation"}>
        <button
          disabled={imagesourcesolver.sourceIDs.length==0 || imagesourcesolver.receiverIDs.length==0}
          onClick={(e) => {
            imagesourcesolver.reset(); 
          }}>
          Clear
        </button>
      </GridRow>

      <GridRow label={"Show Image Sources"}>
        <input
          type="checkbox"
          name="imagesourcesolver"
          checked={imagesourcesolver.imageSourcesVisible}
          onChange={(e) => {
            emit("IMAGESOURCE_SET_PROPERTY", { uuid, property: "imageSourcesVisible", value: !imagesourcesolver.imageSourcesVisible });
          }}
        />
      </GridRow>

      <GridRow label={"Show Ray Paths"}>
        <input
          type="checkbox"
          name="imagesourcesolver"
          checked={imagesourcesolver.rayPathsVisible}
          onChange={(e) => {
            emit("IMAGESOURCE_SET_PROPERTY", { uuid, property: "rayPathsVisible", value: !imagesourcesolver.rayPathsVisible });
          }}
        />
      </GridRow>

      <GridRowSeperator /> 
      <GridRow label="orders">
          <Select
            isMulti
            isClearable
            value={imagesourcesolver.selectedPlotOrders}
            onChange={e=>{
              console.log(e?.map(x => x.value));
              emit("IMAGESOURCE_SET_PROPERTY", {uuid, property: "plotOrdersControl", value: e ? e.map(x => x.value) : []});
              (imagesourcesolver.imageSourcesVisible) && (imagesourcesolver.drawImageSources());
              (imagesourcesolver.rayPathsVisible) && (imagesourcesolver.drawRayPaths()); 
              console.log(imagesourcesolver.selectedPlotOrders);
            }}
            options={imagesourcesolver.possibleOrders.filter(x=>!imagesourcesolver.plotOrders.includes(x.value))}
          />
      </GridRow>

      <GridRowSeperator />
      <GridRow label="sources">
      <Select
        isMulti
        isClearable
        getOptionLabel={item=>item.name}
        getOptionValue={item=>item.uuid}
        value={sources.filter(x=>imagesourcesolver.sourceIDs.includes(x.uuid))}
        onChange={e=>{
          emit("IMAGESOURCE_SET_PROPERTY", {uuid, property: "sourceIDs", value: e ? e.map(x=>x.uuid) : []})
        }}
        options={sources.filter(x=>!imagesourcesolver.sourceIDs.includes(x.uuid))}
      />    
      </GridRow>
      <GridRow label="receivers">
      <Select
        isMulti
        isClearable
        getOptionLabel={item=>item.name}
        getOptionValue={item=>item.uuid}
        value={receivers.filter(x=>imagesourcesolver.receiverIDs.includes(x.uuid))}
        onChange={e=>{
          emit("IMAGESOURCE_SET_PROPERTY", {uuid, property: "receiverIDs", value: e ? e.map(x=>x.uuid) : []})
        }}
        options={receivers.filter(x=>!imagesourcesolver.receiverIDs.includes(x.uuid))}
      />    
      </GridRow>

      <GridRowSeperator />
      <GridRow label="calculate LTP">
        <button
          onClick={(e) => {
            imagesourcesolver.calculateLTP(343); 
          }}>
          Calculate LTP (to CONSOLE)
        </button>
      </GridRow>

    </div>
  );
};

export default ImageSourceTab;
