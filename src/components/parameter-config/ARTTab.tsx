import React, { useReducer } from 'react';
import { ART } from '../../compute/radiance/art';
import { on } from "../../messenger";
import { useSolver } from "../../store";
import { pickProps } from "../../common/helpers";
import useToggle from "../hooks/use-toggle";
import { createPropertyInputs, PropertyButton } from "./SolverComponents";
import PropertyRowFolder from "./property-row/PropertyRowFolder";
import { useState } from 'react';
import { useEffect } from 'react';

export interface ARTTabProps {
  uuid: string; 
}

export interface ARTTabState {
  
}

function useARTProperties(properties: (keyof ART)[], artsolver: ART, set: any) {
  const [state, setState] = useState(pickProps(properties, artsolver));
  const setFunction = <T extends keyof typeof state>(property: T, value: typeof state[T]) => {
    setState({ ...state, [property]: value });
    // set((solvers) => void (solvers.solvers[raytracer.uuid][property] = value));
  };
  return [state, setFunction] as [typeof state, typeof setFunction];
};

const { PropertyTextInput, PropertyNumberInput, PropertyCheckboxInput } = createPropertyInputs<ART>(
  "ART_SET_PROPERTY"
);

const General = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="General" open={open} onOpenClose={toggle}>
      <PropertyTextInput uuid={uuid} label="Name" property="name" tooltip="Sets the name of this solver" />
    </PropertyRowFolder>
  );
};

const Settings = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Room Settings" open={open} onOpenClose={toggle}>
    </PropertyRowFolder>
  );
};





export const ARTTab = ({ uuid }: ARTTabProps) => {
  return (
    <div>
      <General uuid={uuid} />
      <Settings uuid={uuid} />
    </div>
  );
};

export default ARTTab; 

