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
import { filteredMapObject, pickProps } from "../../../common/helpers";
import GridRowSeperator from "../../grid-row/GridRowSeperator";
import Select from 'react-select';
import useToggle from "../../hooks/use-toggle";
import { createPropertyInputs, useSolverProperty, PropertyButton, PropertyButtonDisabled  } from "../SolverComponents";
import PropertyRowFolder from "../property-row/PropertyRowFolder";
import PropertyRow from "../property-row/PropertyRow";
import PropertyRowLabel from "../property-row/PropertyRowLabel";
import PropertyRowCheckbox from "../property-row/PropertyRowCheckbox";

export interface ImageSourceTabProps {
  uuid: string;
}

export const ReceiverSelect = ({ uuid }: { uuid: string }) => {
  const receivers = useContainer((state) => {
    return filteredMapObject(state.containers, (container) =>
      container.kind === "receiver" ? pickProps(["uuid", "name"], container) : undefined
    ) as { uuid: string; name: string }[];
  });

  const [receiverIDs, setReceiverIDs] = useSolverProperty<RayTracer, "receiverIDs">(
    uuid,
    "receiverIDs",
    "IMAGESOURCE_SET_PROPERTY"
  );

  return (
    <>
      {receivers.map((rec) => (
        <PropertyRow key={rec.uuid}>
          <PropertyRowLabel label={rec.name} hasToolTip={false} />
          <PropertyRowCheckbox
            value={receiverIDs.includes(rec.uuid)}
            onChange={(e) =>
              setReceiverIDs({
                value: e.value ? [...receiverIDs, rec.uuid] : receiverIDs.filter((x) => x !== rec.uuid)
              })
            }
          />
        </PropertyRow>
      ))}
    </>
  );
};
export const SourceSelect = ({ uuid }: { uuid: string }) => {
  const sources = useContainer((state) => {
    return filteredMapObject(state.containers, (container) =>
      container.kind === "source" ? pickProps(["uuid", "name"], container) : undefined
    ) as { uuid: string; name: string }[];
  });

  const [sourceIDs, setSourceIDs] = useSolverProperty<RayTracer, "sourceIDs">(
    uuid,
    "sourceIDs",
    "IMAGESOURCE_SET_PROPERTY"
  );

  return (
    <>
      {sources.map((src) => (
        <PropertyRow key={src.uuid}>
          <PropertyRowLabel label={src.name} hasToolTip={false} />
          <PropertyRowCheckbox
            value={sourceIDs.includes(src.uuid)}
            onChange={(e) =>
              setSourceIDs({
                value: e.value ? [...sourceIDs, src.uuid] : sourceIDs.filter((x) => x !== src.uuid)
              })
            }
          />
        </PropertyRow>
      ))}
    </>
  );
};
export const OrderSelect = ({ uuid }: { uuid: string }) => {
  const imagesourcesolver = cram.state.solvers[uuid] as ImageSourceSolver; 
  let allOrders = imagesourcesolver.possibleOrders;
  let selectedOrders = imagesourcesolver.plotOrders;  

  const [sourceIDs, setSourceIDs] = useSolverProperty<RayTracer, "sourceIDs">(
    uuid,
    "sourceIDs",
    "IMAGESOURCE_SET_PROPERTY"
  );

  return (
    <>
      {console.log("update")}
      {allOrders.map((o) => (
        <PropertyRow key={o.value}>
          <PropertyRowLabel label={o.value.toString()} hasToolTip={false} />
          <PropertyRowCheckbox
            value={selectedOrders.includes(o.value)}
            onChange={(e) =>
              emit("IMAGESOURCE_SET_PROPERTY",{uuid,property: "toggleOrder",value: o.value})
            }
          />
        </PropertyRow>
      ))}
    </>
  );
};

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

const Calculation = ({ uuid }: { uuid: string}) => {
  const [open, toggle] = useToggle(true);
  const imagesourcesolver = cram.state.solvers[uuid] as ImageSourceSolver; 
  return (
    <PropertyRowFolder label="Calculation" open={open} onOpenClose={toggle}>
      <PropertyTextInput uuid={uuid} label="Maximum Order" property="maxReflectionOrderReset" tooltip="Sets the maximum reflection order"/>
      <PropertyButtonDisabled disableCondition={imagesourcesolver.sourceIDs.length!=1 || imagesourcesolver.receiverIDs.length!=1} event="UPDATE_IMAGESOURCE" args={uuid} label="Update" tooltip="Updates Imagesource Calculation" />
      <PropertyButtonDisabled disableCondition={imagesourcesolver.sourceIDs.length!=1 || imagesourcesolver.receiverIDs.length!=1} event="RESET_IMAGESOURCE" args={uuid} label="Clear" tooltip="Clears Imagesource Calculation" />
    </PropertyRowFolder>
  );
}

const SourceConfiguration = ({ uuid }: { uuid: string}) => {
  const [open, toggle] = useToggle(true);
  const imagesourcesolver = cram.state.solvers[uuid] as ImageSourceSolver; 
  return (
    <PropertyRowFolder label="Source Configuration" open={open} onOpenClose={toggle}>
      <SourceSelect uuid={uuid} />
    </PropertyRowFolder>
  );
}

const ReceiverConfiguration = ({ uuid }: { uuid: string}) => {
  const [open, toggle] = useToggle(true);
  const imagesourcesolver = cram.state.solvers[uuid] as ImageSourceSolver; 
  return (
    <PropertyRowFolder label="Receiver Configuration" open={open} onOpenClose={toggle}>
      <ReceiverSelect uuid={uuid} />
    </PropertyRowFolder>
  );
}

const Graphing = ({ uuid }: { uuid: string}) => {
  const [open, toggle] = useToggle(true);
  const imagesourcesolver = cram.state.solvers[uuid] as ImageSourceSolver; 
  return (
    <PropertyRowFolder label="Graphing" open={open} onOpenClose={toggle}>
      <PropertyCheckboxInput uuid={uuid} label="Show Sources" property="imageSourcesVisible" tooltip="Shows/Hides Image Sources"/>
      <PropertyCheckboxInput uuid={uuid} label="Show Paths" property="rayPathsVisible" tooltip="Shows/Hides Ray Paths"/>
      {/* <Select
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
        /> */}
      <OrderSelect uuid={uuid}></OrderSelect>
    </PropertyRowFolder>
  );
}

const Developer = ({ uuid }: { uuid: string}) => {
  const [open, toggle] = useToggle(true);
  const imagesourcesolver = cram.state.solvers[uuid] as ImageSourceSolver; 
  return (
    <PropertyRowFolder label="Developer" open={open} onOpenClose={toggle}>
      <PropertyButton event="CALCULATE_LTP" args={uuid} label="Calculate LTP" tooltip="Calculates Level Time Progression"/>
    </PropertyRowFolder>
  );
}
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
    <div>
      <General uuid={uuid} />
      <Calculation uuid={uuid}/>
      <SourceConfiguration uuid={uuid}/>
      <ReceiverConfiguration uuid={uuid}/>
      <Graphing uuid={uuid}/>
      <Developer uuid={uuid}/>
    </div>
  );
};

export default ImageSourceTab;
