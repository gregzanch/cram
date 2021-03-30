import React, { useCallback, useEffect, useReducer, useRef, useState } from "react";
import "./ImageSourceTab.css";
import RayTracer from "../../../compute/raytracer";
import {ImageSourceSolver} from "../../../compute/raytracer/image-source/index"; 
import { emit, on } from "../../../messenger";
import { ObjectPropertyInputEvent } from "../../ObjectProperties";
import { useContainer, useSolver } from "../../../store";
import GridRow from "../../GridRow";
import TextInput from "../../text-input/TextInput";
import NumberInput from "../../number-input/NumberInput";
import { filteredMapObject, pickProps, unique } from "../../../common/helpers";
import GridRowSeperator from "../../GridRowSeperator";
import Select from 'react-select';
import useToggle from "../../hooks/use-toggle";
import { createPropertyInputs, useSolverProperty, PropertyButton  } from "../SolverComponents";
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

  const [receiverIDs, setReceiverIDs] = useSolverProperty<ImageSourceSolver, "receiverIDs">(
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

  const [sourceIDs, setSourceIDs] = useSolverProperty<ImageSourceSolver, "sourceIDs">(
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


const { PropertyTextInput, PropertyNumberInput, PropertyCheckboxInput } = createPropertyInputs<ImageSourceSolver>(
  "IMAGESOURCE_SET_PROPERTY"
);


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
  const {sourceIDs, receiverIDs} = useSolver(state=>pickProps(["sourceIDs", "receiverIDs"], state.solvers[uuid] as ImageSourceSolver));
  const disabled = !(sourceIDs.length > 0 && receiverIDs.length > 0);
  const [, forceUpdate] = useReducer((c) => c + 1, 0) as [never, () => void]
  useEffect(()=>on("IMAGESOURCE_SET_PROPERTY", (e)=>{
    if(e.uuid === uuid && (e.property === "sourceIDs" || e.property === "receiverIDs")){
      forceUpdate();
    }
  }))
  return (
    <PropertyRowFolder label="Calculation" open={open} onOpenClose={toggle}>
      <PropertyNumberInput uuid={uuid} label="Maximum Order" property="maxReflectionOrderReset" tooltip="Sets the maximum reflection order"/>
      <PropertyButton disabled={disabled} event="UPDATE_IMAGESOURCE" args={uuid} label="Update" tooltip="Updates Imagesource Calculation" />
      <PropertyButton disabled={disabled} event="RESET_IMAGESOURCE" args={uuid} label="Clear" tooltip="Clears Imagesource Calculation" />
    </PropertyRowFolder>
  );
}

const SourceConfiguration = ({ uuid }: { uuid: string}) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Source Configuration" open={open} onOpenClose={toggle}>
      <SourceSelect uuid={uuid} />
    </PropertyRowFolder>
  );
}

const ReceiverConfiguration = ({ uuid }: { uuid: string}) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Receiver Configuration" open={open} onOpenClose={toggle}>
      <ReceiverSelect uuid={uuid} />
    </PropertyRowFolder>
  );
}

const Graphing = ({ uuid }: { uuid: string}) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Graphing" open={open} onOpenClose={toggle}>
      <PropertyCheckboxInput uuid={uuid} label="Show Sources" property="imageSourcesVisible" tooltip="Shows/Hides Image Sources"/>
      <PropertyCheckboxInput uuid={uuid} label="Show Paths" property="rayPathsVisible" tooltip="Shows/Hides Ray Paths"/>
    </PropertyRowFolder>
  );
}

const ImpulseResponse = ({uuid}: { uuid: string}) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Impulse Response" open={open} onOpenClose={toggle}>
      <PropertyButton event="IMAGESOURCE_PLAY_IR" args={uuid} label="Play" tooltip="Plays the calculated impulse response" disabled={false} />
      <PropertyButton event="IMAGESOURCE_DOWNLOAD_IR" args={uuid} label="Download" tooltip="Plays the calculated impulse response" />
    </PropertyRowFolder>
  )
}

const Developer = ({ uuid }: { uuid: string}) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Developer" open={open} onOpenClose={toggle}>
      <PropertyButton event="CALCULATE_LTP" args={uuid} label="Calculate LTP" tooltip="Calculates Level Time Progression"/>
    </PropertyRowFolder>
  );
}
export const ImageSourceTab = ({ uuid }: ImageSourceTabProps) => {

  return (
    <div>
      <General uuid={uuid} />
      <Calculation uuid={uuid}/>
      <SourceConfiguration uuid={uuid}/>
      <ReceiverConfiguration uuid={uuid}/>
      <Graphing uuid={uuid}/>
      <ImpulseResponse uuid={uuid}/>
      <Developer uuid={uuid}/>
    </div>
  );
};

export default ImageSourceTab;
