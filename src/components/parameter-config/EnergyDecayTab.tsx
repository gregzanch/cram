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
import PropertyRowFolder, { PropertyRowFolderProps } from "./property-row/PropertyRowFolder";
import PropertyRow from "./property-row/PropertyRow";
import PropertyRowLabel from "./property-row/PropertyRowLabel";
import PropertyRowCheckbox from "./property-row/PropertyRowCheckbox";
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import EnergyDecay from '../../compute/energy-decay';

export interface EnergyDecayTabProps {
    uuid: string; 
}
  
export interface EnergyDecayTabState {
    
}
  
function useEnergyDecayProperties(properties: (keyof EnergyDecay)[], ed: EnergyDecay, set: any) {
    const [state, setState] = useState(pickProps(properties, ed));
    const setFunction = <T extends keyof typeof state>(property: T, value: typeof state[T]) => {
        setState({ ...state, [property]: value });
    };
    return [state, setFunction] as [typeof state, typeof setFunction];
};
  
const { PropertyTextInput, PropertyNumberInput, PropertyCheckboxInput } = createPropertyInputs<EnergyDecay>(
    "ENERGYDECAY_SET_PROPERTY"
);

const General = ({ uuid }: { uuid: string }) => {
    const [open, toggle] = useToggle(true);
    return (
      <PropertyRowFolder label="General" open={open} onOpenClose={toggle}>
        <PropertyTextInput uuid={uuid} label="Name" property="name" tooltip="Sets the name of the solver" />
        <PropertyRow>
            <PropertyRowLabel label={"Upload IR"}></PropertyRowLabel>
            <div style={{alignItems:'center'}}>
                <input
                type = "file"
                id = "irinput"
                accept = ".wav"
                onChange={(e) => {
                    //console.log(e.target.files);
                    const reader = new FileReader();
                    
                    reader.addEventListener('loadend', (loadEndEvent) => {
                        emit("ENERGYDECAY_SET_PROPERTY",{uuid: uuid, property: "broadbandIR", value:reader.result}); 
                    });

                    reader.readAsArrayBuffer(e.target!.files![0]);
                    }
                }
                />
        </div>
        </PropertyRow>
        <PropertyButton event="CALCULATE_AC_PARAMS" args={uuid} label="Calculate Parameters" tooltip="Calculates Acoustical Parameters from Uploaded IR" />
      </PropertyRowFolder>
    );
};

export const EnergyDecayTab = ({ uuid }: EnergyDecayTabProps) => {
    return (
        <General uuid={uuid} />
    );
};

export default EnergyDecayTab; 
  