import React, { useReducer } from 'react'
import Messenger from "../../messenger";
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
import { BouncyBallSolver } from '../../compute/bouncyball';


export interface BouncyBallSolverTabProps {
    uuid: string; 
}
  
export interface BouncyBallSolverTabState {

}

const { PropertyTextInput, PropertyNumberInput, PropertyCheckboxInput } = createPropertyInputs<BouncyBallSolver>(
    "BOUNCYBALLSOLVER_SET_PROPERTY"
);

const General = ({ uuid }: { uuid: string }) => {
    const [open, toggle] = useToggle(true);
    const {running} = useSolver(state=>pickProps(["running"], state.solvers[uuid] as BouncyBallSolver));
    const [, forceUpdate] = useReducer((c) => c + 1, 0) as [never, () => void]
    useEffect(()=>on("START_BOUNCYBALL", (e)=>{
      forceUpdate(); 
    }))
    useEffect(()=>on("RESET_BOUNCYBALLSOLVER", (e)=> {
      forceUpdate(); 
    }))
    return (
        <PropertyRowFolder label="General" open={open} onOpenClose={toggle}>
            <PropertyTextInput uuid={uuid} label="Name" property="name" tooltip="Sets the name of this solver" />
            <PropertyNumberInput uuid={uuid} label="Total Balls" property="total_number_balls" tooltip="Sets total number balls"/>
            <PropertyNumberInput uuid={uuid} label="Speed" property="distance_per_frame" tooltip="Sets the ball travel distance per frame"/>
            <PropertyNumberInput uuid={uuid} label="Framerate" property="framerate" tooltip="Sets framerate"/>
            <PropertyButton disabled={running} event="START_BOUNCYBALL" args={uuid} label="Start" tooltip="Starts Bouncy (Billiard) Ball Simulation"/>
            <PropertyButton disabled={!running} event="RESET_BOUNCYBALLSOLVER" args={uuid} label="Reset" tooltip="Reset Bouncy (Billiard) Ball Simulation"/>
        </PropertyRowFolder>
    );
};

export const SourceSelect = ({ uuid }: { uuid: string }) => {
    const sources = useContainer((state) => {
      return filteredMapObject(state.containers, (container) =>
        container.kind === "source" ? pickProps(["uuid", "name"], container) : undefined
      ) as { uuid: string; name: string }[];
    });
  
    const [sourceIDs, setSourceIDs] = useSolverProperty<BouncyBallSolver, "sourceIDs">(
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

export const BouncyBallSolverTab = ({ uuid }: BouncyBallSolverTabProps) => {
    return (
        <div>
            <General uuid={uuid} />
            <SourceSelect uuid={uuid}/>
        </div>
    );
};

export default BouncyBallSolverTab; 