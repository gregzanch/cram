import React, { useEffect, useState } from "react";
import RayTracer from "../../compute/raytracer";
import { emit, on } from "../../messenger";
import { ObjectPropertyInputEvent } from "../ObjectProperties";
import { useContainer, useSolver } from "../../store";
import GridRow from "../grid-row/GridRow";
import TextInput from "../text-input/TextInput";
import NumberInput from "../number-input/NumberInput";
import { filteredMapObject, pickProps } from "../../common/helpers";
import Select from "react-select";
import PropertyRow from "./property-row/PropertyRow";
import PropertyRowFolder from "./property-row/PropertyRowFolder";
import Solver from "../../compute/solver";
import { createPropertyInputs, useSolverProperty } from "./SolverComponents";
import useToggle from "../hooks/use-toggle";
import PropertyRowLabel from "./property-row/PropertyRowLabel";
import PropertyRowCheckbox from "./property-row/PropertyRowCheckbox";
import PropertyButton from "./property-row/PropertyButton";

const { PropertyTextInput, PropertyNumberInput, PropertyCheckboxInput } = createPropertyInputs<RayTracer>(
  "RAYTRACER_SET_PROPERTY"
);

// const Option = ({ item }) => <option value={item.uuid}>{item.name}</option>;

export const ReceiverSelect = ({ uuid }: { uuid: string }) => {
  const receivers = useContainer((state) => {
    return filteredMapObject(state.containers, (container) =>
      container.kind === "receiver" ? pickProps(["uuid", "name"], container) : undefined
    ) as { uuid: string; name: string }[];
  });

  const [receiverIDs, setReceiverIDs] = useSolverProperty<RayTracer, "receiverIDs">(
    uuid,
    "receiverIDs",
    "RAYTRACER_SET_PROPERTY"
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
    "RAYTRACER_SET_PROPERTY"
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


const General = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="General" open={open} onOpenClose={toggle}>
      <PropertyTextInput uuid={uuid} label="Name" property="name" tooltip="Sets the name of this solver" />
    </PropertyRowFolder>
  );
};

const Parameters = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Parameters" open={open} onOpenClose={toggle}>
      <PropertyNumberInput uuid={uuid} label="Rate (ms)" property="updateInterval" tooltip="Sets the callback rate" />
      <PropertyNumberInput
        uuid={uuid}
        label="Order"
        property="reflectionOrder"
        tooltip="Sets the maximum reflection order"
      />
      <PropertyNumberInput
        uuid={uuid}
        label="Passes"
        property="passes"
        tooltip="Number of rays shot on each callback"
      />
    </PropertyRowFolder>
  );
};

const RecieverConfiguration = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Reciever Configuration" open={open} onOpenClose={toggle}>
      <ReceiverSelect uuid={uuid} />
      <PropertyCheckboxInput
        uuid={uuid}
        label="Ignore Receivers"
        property="runningWithoutReceivers"
        tooltip="Ignores receiver intersections"
      />
    </PropertyRowFolder>
  );
};

const SourceConfiguration = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Source Configuration" open={open} onOpenClose={toggle}>
      <SourceSelect uuid={uuid} />
    </PropertyRowFolder>
  );
};

const StyleProperties = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Style Properties" open={open} onOpenClose={toggle}>
      <PropertyNumberInput
        uuid={uuid}
        label="Point Size"
        property="pointSize"
        tooltip="Sets the size of each interection point"
      />
      <PropertyCheckboxInput
        uuid={uuid}
        label="Rays Visible"
        property="raysVisible"
        tooltip="Toggles the visibility of the rays"
      />
      <PropertyCheckboxInput
        uuid={uuid}
        label="Points Visible"
        property="pointsVisible"
        tooltip="Toggles the visibility of the intersection points"
      />
    </PropertyRowFolder>
  );
};
const SolverControls = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Solver Controls" open={open} onOpenClose={toggle}>
      <PropertyCheckboxInput uuid={uuid} label="Running" property="isRunning" tooltip="Starts/stops the raytracer" />
      <PropertyButton event="RAYTRACER_CLEAR_RAYS" args={uuid} label="Clear Rays" tooltip="Clears all of the rays" />
    </PropertyRowFolder>
  );
};

const Output = ({uuid}: {uuid: string}) => {
  const [open, toggle] = useToggle(true);
  const [impulseResponsePlaying, setImpulseResponsePlaying] = useSolverProperty<RayTracer, "impulseResponsePlaying">(uuid, "impulseResponsePlaying", "RAYTRACER_SET_PROPERTY");
  return (
    <PropertyRowFolder label="Impulse Response" open={open} onOpenClose={toggle}>
      <PropertyButton event="RAYTRACER_PLAY_IR" args={uuid} label="Play" tooltip="Plays the calculated impulse response" disabled={impulseResponsePlaying} />
      <PropertyButton event="RAYTRACER_DOWNLOAD_IR" args={uuid} label="Download" tooltip="Plays the calculated impulse response" />
    </PropertyRowFolder>
  );
}

export const RayTracerTab = ({ uuid }: { uuid: string }) => {
  return (
    <div>
      <General uuid={uuid} />
      <Parameters uuid={uuid} />
      <SourceConfiguration uuid={uuid} />
      <RecieverConfiguration uuid={uuid} />
      <StyleProperties uuid={uuid} />
      <SolverControls uuid={uuid} />
      <Output uuid={uuid} />
    </div>
  );
};

export default RayTracerTab;
