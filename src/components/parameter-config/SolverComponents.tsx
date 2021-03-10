import React, { useEffect, useState } from "react";
import { emit, on } from "../../messenger";
import { useSolver } from "../../store";
import PropertyRow from "./property-row/PropertyRow";
import PropertyRowLabel from "./property-row/PropertyRowLabel";
import PropertyRowButton from "./property-row/PropertyRowButton";
import { PropertyRowCheckbox } from "./property-row/PropertyRowCheckbox";
import { PropertyRowTextInput } from "./property-row/PropertyRowTextInput";
import { PropertyRowNumberInput } from "./property-row/PropertyRowNumberInput";
import Solver from "../../compute/solver";
import RayTracer from "../../compute/raytracer";
import FDTD_2D from "../../compute/2d-fdtd"
import {AllowedNames } from '../../common/helpers';
import { ImageSourceSolver } from "../../compute/raytracer/image-source";

type SetPropertyEventTypes =
  | AllowedNames<EventTypes, SetPropertyPayload<FDTD_2D>>
  | AllowedNames<EventTypes, SetPropertyPayload<RayTracer>>
  | AllowedNames<EventTypes, SetPropertyPayload<ImageSourceSolver>>;

export function useSolverProperty<T extends RayTracer | FDTD_2D|ImageSourceSolver, K extends keyof T>(
  uuid: string,
  property: K,
  event: SetPropertyEventTypes
) {
  const defaultValue = useSolver<T[K]>(
    (state) => (state.solvers[uuid] as T)[property]
  );
  const [state, setState] = useState<T[K]>(defaultValue);
  useEffect(
    () => on(event, (props) => {
      //@ts-ignore
      if(props.uuid === uuid && props.property === property) setState(props.value) 
    }),
    [uuid]
  );
  //@ts-ignore
  const changeHandler = (e) => emit(event, { uuid, property, value: e.value });

  return [state, changeHandler] as [typeof state, typeof changeHandler];
}

type PropertyRowInputElement = ({ value, onChange }) => JSX.Element;
type Props<T extends RayTracer | FDTD_2D|ImageSourceSolver, K extends keyof T> = {
  uuid: string;
  property: K;
  label: string;
  tooltip: string;
};

export const createPropertyInput = <T extends RayTracer | FDTD_2D|ImageSourceSolver>(
  event: SetPropertyEventTypes,
  Element: PropertyRowInputElement
) => <K extends keyof T>({ uuid, property, label, tooltip }: Props<T, K>) => {
  const [state, changeHandler] = useSolverProperty<T, K>(uuid, property, event);
  return (
    <PropertyRow>
      <PropertyRowLabel label={label} hasToolTip tooltip={tooltip} />
      <Element value={state} onChange={changeHandler} />
    </PropertyRow>
  );
};

export const createPropertyInputs = <T extends RayTracer|FDTD_2D|ImageSourceSolver>(event: SetPropertyEventTypes) => ({
  PropertyTextInput: createPropertyInput<T>(event, PropertyRowTextInput),
  PropertyNumberInput: createPropertyInput<T>(event, PropertyRowNumberInput),
  PropertyCheckboxInput: createPropertyInput<T>(event, PropertyRowCheckbox),
})

export const PropertyButton = <T extends keyof EventTypes>({
  args,
  event,
  label,
  tooltip
}: {
  args: EventTypes[T];
  event: T;
  label: string;
  tooltip: string;
}) => {
  return (
    <PropertyRow>
      <PropertyRowLabel label={label} hasToolTip tooltip={tooltip} />
      <PropertyRowButton onClick={(e) => emit(event, args)} label={label} />
    </PropertyRow>
  );
};
