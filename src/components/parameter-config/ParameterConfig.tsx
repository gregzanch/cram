import React, {useEffect, useState} from 'react';
import {on} from '../../messenger';
import { Tab, Tabs, Classes } from "@blueprintjs/core";

import './ParameterConfig.css';
import RayTracerTab from './RayTracerTab';
import RendererTab from './RendererTab';
import FDTD_2DTab from './FDTD_2DTab';
import { ImageSourceTab } from './image-source-tab/ImageSourceTab';
import { useContainer, useSolver } from '../../store';
import styled from 'styled-components';
import RT60Tab from './RT60Tab';
import EnergyDecayTab from './EnergyDecayTab';
import RoomTab from './RoomTab';
import SourceTab from './SourceTab';
import ReceiverTab from './ReceiverTab';
import SurfaceTab from './SurfaceTab';
import ARTTab from './ARTTab';


const SelectContainer = styled.div`
  display: grid;
  margin: 0 1em 1em 1em;
`;

const TabText = styled.div`
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
`;

export interface ParameterConfigState {
  selectedTabIndex: number;
  tabNames: string[];
}

const SolverComponentMap = new Map<string, ({ uuid }) => JSX.Element>([
  ["image-source", ImageSourceTab],
  ["ray-tracer", RayTracerTab],
  ["rt60", RT60Tab],
  ["fdtd-2d", FDTD_2DTab],
  ["energydecay", EnergyDecayTab],
  ["art", ARTTab]
]);

const ObjectComponentMap = new Map<string, ({ uuid }) => JSX.Element>([
  ["room", RoomTab],
  ["source", SourceTab],
  ["receiver", ReceiverTab],
  ["surface", SurfaceTab],
]);

const SolverOptionTitle = ({ uuid }) => {
  const name = useSolver((state) => state.solvers[uuid].name);
  return (
    <option value={uuid}>{name}</option>
  );
};



export const SolversTab = () => {
  const solvers = useSolver(state=>state.withProperty(solver=>solver.kind))
  const [index, setIndex] = useState(0);
  useEffect(()=>on("NEW", ()=>setIndex(0)), [])
  const [selectedSolverId, setSelectedSolverId] = useState("choose");


  const SolverParameterConfig = SolverComponentMap.get(solvers.get(selectedSolverId)!)!;
  return (
    <div>
      <SelectContainer>
        <select value={selectedSolverId} onChange={event => setSelectedSolverId(event.currentTarget.value)}>
          <option value="choose">Choose a Solver</option>
          {[...solvers].map(([uuid, _], i) => <SolverOptionTitle key={`${uuid}-${i}-tab`} uuid={uuid} />)}
        </select>
      </SelectContainer>
      {solvers.has(selectedSolverId) ? <SolverParameterConfig uuid={selectedSolverId} /> : <></>}
    </div>
  );
};


const ObjectOptionTitle = ({ uuid }) => {
  const name = useContainer((state) => state.containers[uuid].name);
  return (
    <option value={uuid}>{name}</option>
  );
};

export const ObjectsTab = () => {

  const objects = useContainer(state=>state.withProperty(object=>object.kind))
  const [index, setIndex] = useState(0);

  const [selectedObjectId, setSelectedObjectId] = useState("choose");

  useEffect(()=>on("NEW", ()=>setIndex(0)), [])
  useEffect(()=>on("SET_SELECTION", (e)=>{
    setSelectedObjectId(e[0].uuid)
  }), [])
  useEffect(()=>on("APPEND_SELECTION", (e)=>{
    setSelectedObjectId(e[e.length-1].uuid)
  }), [])
  const validSelection = selectedObjectId && objects.has(selectedObjectId);
  const ObjectParameterConfig = ObjectComponentMap.get(objects.get(selectedObjectId)!)!;
  return (
    <div>
      <SelectContainer>
        
        <select value={selectedObjectId} onChange={event => setSelectedObjectId(event.currentTarget.value)}>
        <option value="choose">Choose an Object</option>
          {[...objects].map(([uuid, _], i) => <ObjectOptionTitle key={`${uuid}-${i}-tab`} uuid={uuid} />)}
        </select>
      </SelectContainer>
      {validSelection ? <ObjectParameterConfig uuid={selectedObjectId} /> : <></>}
    </div>
  );
};





export const ParameterConfig = () => {
  const [index, setIndex] = useState(0);
  useEffect(()=>on("NEW", ()=>setIndex(0)), [])

  const [selectedTabId, setSelectedTabId] = useState("renderer")

  return (
    <div>
      <Tabs id="parameter-config-tabs" className="parameter-config-tabs-container" onChange={e=>setSelectedTabId(`${e}`)} selectedTabId={selectedTabId}>
        <Tab id="renderer" title={<TabText>Renderer</TabText>} className={Classes.BUTTON_TEXT} panel={<RendererTab />} />
        <Tab id="solvers" title={<TabText>Solvers</TabText>} className={Classes.BUTTON_TEXT} panel={<SolversTab />} />
        <Tab id="objects" title={<TabText>Objects</TabText>} className={Classes.BUTTON_TEXT} panel={<ObjectsTab />} />
      </Tabs>
    </div>
  );
};
 