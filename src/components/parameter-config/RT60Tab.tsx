import React, { useReducer } from 'react';
import { RT60 } from '../../compute/rt';
import Messenger from "../../messenger";
import RT60Properties from '../ObjectProperties/RT60Properties';
import {ImageSourceSolver} from "../../compute/raytracer/image-source/index"; 
import { emit, on } from "../../messenger";
import { ObjectPropertyInputEvent } from "../ObjectProperties";
import { useContainer, useSolver } from "../../store";
import GridRow from "../GridRow";
import TextInput from "../text-input/TextInput";
import NumberInput from "../number-input/NumberInput";
import { filteredMapObject, pickProps, unique } from "../../common/helpers";
import GridRowSeperator from "../GridRowSeperator";
import Select from 'react-select';
import useToggle from "../hooks/use-toggle";
import { createPropertyInputs, useSolverProperty, PropertyButton } from "./SolverComponents";
import PropertyRowFolder from "./property-row/PropertyRowFolder";
import PropertyRow from "./property-row/PropertyRow";
import PropertyRowLabel from "./property-row/PropertyRowLabel";
import PropertyRowCheckbox from "./property-row/PropertyRowCheckbox";
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';

export interface RT60TabProps {
  uuid: string; 
}

export interface RT60TabState {
  
}

function useRT60Properties(properties: (keyof RT60)[], rt60solver: RT60, set: any) {
  const [state, setState] = useState(pickProps(properties, rt60solver));
  const setFunction = <T extends keyof typeof state>(property: T, value: typeof state[T]) => {
    setState({ ...state, [property]: value });
    // set((solvers) => void (solvers.solvers[raytracer.uuid][property] = value));
  };
  return [state, setFunction] as [typeof state, typeof setFunction];
};

const { PropertyTextInput, PropertyNumberInput, PropertyCheckboxInput } = createPropertyInputs<RT60>(
  "RT60_SET_PROPERTY"
);

const General = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="General" open={open} onOpenClose={toggle}>
      <PropertyTextInput uuid={uuid} label="Name" property="name" tooltip="Sets the name of this solver" />
      <PropertyButton event="UPDATE_RT60" args={uuid} label="Update" tooltip="Updates RT Calculation"/>
    </PropertyRowFolder>
  );
};

const Settings = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Room Settings" open={open} onOpenClose={toggle}>
    <PropertyNumberInput
        uuid={uuid}
        label="Room Volume"
        property="displayVolume"
        tooltip="Overrides the calculated room volume"
        elementProps={{
          step: 0.01
        }}
      />
    </PropertyRowFolder>
  );
};


const Export = ({uuid}: { uuid: string }) => {
  const [open, toggle] = useToggle(true); 
  const {noResults} = useSolver(state=>pickProps(["noResults"], state.solvers[uuid] as RT60))
  const [, forceUpdate] = useReducer((c) => c + 1, 0) as [never, () => void]

  useEffect(()=>on("UPDATE_RT60", (e)=>{
    forceUpdate();
  }));

  return(
    <PropertyRowFolder label="Export" open={open} onOpenClose={toggle}>
      <PropertyButton event="DOWNLOAD_RT60_RESULTS" args={uuid} label="Download RT Results" disabled={noResults} tooltip="Download RT Results as CSV File"/>
    </PropertyRowFolder>
  )
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


export const RT60Tab = ({ uuid }: RT60TabProps) => {
  return (
    <div>
      <General uuid={uuid} />
      <Settings uuid={uuid} />
      <Export uuid={uuid} />
    </div>
  );
};

export default RT60Tab; 


// export default class RT60Tab extends React.Component<RT60TabProps, RT60TabState> {
//   constructor(props: RT60TabProps) {
//     super(props);
//     this.state = {
      
//     }
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
//     this.props.messenger.postMessage("RESULTS_SHOULD_UPDATE");
//     this.props.messenger.postMessage("GUTTER_SHOULD_UPDATE");
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
//     // switch (e.currentTarget.name) {
//     //   default: break;
//     // }
//     this.forceUpdate();
//   }
//   render() {
//     return (
//       <RT60Properties
//         messenger={this.props.messenger}
//         object={this.props.solver}
//         onPropertyChange={this.handleObjectPropertyChange}
//         onPropertyValueChangeAsNumber={this.handleObjectPropertyValueChangeAsNumber}
//         onPropertyValueChangeAsString={this.handleObjectPropertyValueChangeAsString}
//         onButtonClick={this.handleObjectPropertyButtonClick}
//       />
//     );
//   }
// }

// function getSourcesAndReceivers(getSourcesAndReceivers: any): [any, any] {
//   throw new Error('Function not implemented.');
// }
// function useImageSourceProperties(arg0: string[], imagesourcesolver: any, set: any): [any, any] {
//   throw new Error('Function not implemented.');
// }

