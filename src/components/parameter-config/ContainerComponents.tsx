import React, { useEffect, useState } from "react";
import { emit, on } from "../../messenger";
import { Source, Receiver, Surface, Room } from "../../objects";
import { useContainer } from "../../store";
import PropertyRow from "./property-row/PropertyRow";
import PropertyRowLabel from "./property-row/PropertyRowLabel";
import PropertyRowButton from "./property-row/PropertyRowButton";
import { PropertyRowCheckbox } from "./property-row/PropertyRowCheckbox";
import { PropertyRowTextInput } from "./property-row/PropertyRowTextInput";
import { PropertyRowNumberInput } from "./property-row/PropertyRowNumberInput";
import { AllowedNames, ensureArray } from '../../common/helpers';
import { PropertyRowVectorInput } from "./property-row/PropertyRowVectorInput";
import { PropertyRowSelect } from "./property-row/PropertyRowSelect";


type SetPropertyEventTypes =
  | AllowedNames<EventTypes, SetPropertyPayload<Source>>
  | AllowedNames<EventTypes, SetPropertyPayload<Receiver>>
  | AllowedNames<EventTypes, SetPropertyPayload<Surface>>
  | AllowedNames<EventTypes, SetPropertyPayload<Room>>;

type Containers = Source | Receiver | Surface | Room;

export function useContainerProperty<T extends Containers, K extends keyof T>(
  uuid: string,
  property: K,
  event: SetPropertyEventTypes
) {
  const defaultValue = useContainer<T[K]>(
    (state) => (state.containers[uuid] as T)[property]
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

type Option =  { value: string, label: string }

type PropertyRowInputElement = ({ value, onChange, options }: { value: any, onChange: any, options?: Option[]}) => JSX.Element;
type ConnectedPropertyRowInputElement = ({ uuid, property }) => JSX.Element;
const connectComponent = <T extends Containers>(
  event: SetPropertyEventTypes,
  Element: PropertyRowInputElement
) => <K extends keyof T>({ uuid, property, options }: {
  uuid: string;
  property: K;
  options?: Option[];
}) => {
  const [state, changeHandler] = useContainerProperty<T, K>(uuid, property, event);
  return <Element value={state} onChange={changeHandler} {...{ options }} />
};



type Props<T extends Containers, K extends keyof T> = {
  uuid: string;
  property: K | K[];
  label: string;
  tooltip: string;
  options?: Option[]
};

export const createPropertyInput = <T extends Containers>(
  Element: ConnectedPropertyRowInputElement
  ) => <K extends keyof T>({ uuid, property, label, tooltip, options }: Props<T, K>) => {
    return (
      <PropertyRow>
        <PropertyRowLabel label={label} hasToolTip tooltip={tooltip} />
        <div>{ensureArray(property).map((prop, index) => <Element uuid={uuid} property={prop} key={`${uuid}-${prop}-${index}`} {...{options}}/>)}</div>
      </PropertyRow>
  );
};

export const createPropertyInputs = <T extends Containers>(event: SetPropertyEventTypes) => ({
  PropertyTextInput: createPropertyInput<T>(connectComponent<T>(event, PropertyRowTextInput)),
  PropertyNumberInput: createPropertyInput<T>(connectComponent<T>(event, PropertyRowNumberInput)),
  PropertyCheckboxInput: createPropertyInput<T>(connectComponent<T>(event, PropertyRowCheckbox)),
  PropertyVectorInput: createPropertyInput<T>(connectComponent<T>(event, PropertyRowVectorInput)),
  PropertySelect: createPropertyInput<T>(connectComponent<T>(event, PropertyRowSelect)),
})

