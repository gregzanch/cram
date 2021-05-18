import React, {useCallback, useEffect, useState} from 'react';
import {emit, on} from '../../messenger';
// import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { HTMLSelect, Tab, Tabs, Classes } from "@blueprintjs/core";
import ContextMenu from "../ContextMenu";
import './ParameterConfig.css';
import RayTracerTab from './RayTracerTab';
import RendererTab from './RendererTab';
import FDTD_2DTab from './FDTD_2DTab';
import { ImageSourceTab } from './image-source-tab/ImageSourceTab';
import { ContainerStore, SolverStore, useContainer, useSolver } from '../../store';
import styled from 'styled-components';
import RT60Tab from './RT60Tab';
import EnergyDecayTab from './EnergyDecayTab';
import RoomTab from './RoomTab';
import SourceTab from './SourceTab';
import ReceiverTab from './ReceiverTab';
import SurfaceTab from './SurfaceTab';


const SelectContainer = styled.div`
  display: grid;
  margin: 0 1em 1em 1em;
`;

export interface ParameterConfigState {
  selectedTabIndex: number;
  tabNames: string[];
}

type ClickEvent = React.MouseEvent<HTMLElement, MouseEvent>;



const TabTextContainer = styled.div`
  display: flex;
  align-items: flex-end;
  user-select: none;
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -o-user-select: none;
`;

const TabTitle = ({ uuid }) => {
  const name = useSolver((state) => state.solvers[uuid].name);
  const onMenu = useCallback((e) => {
    if (e.target.textContent) {
      switch (e.target.textContent) {
        case "Delete": emit("REMOVE_SOLVERS", uuid); break;
        case "Log to Console": emit("LOG_SOLVER", uuid); break;
        default: break;
      }
    }
  }, [uuid]);
  return (
    <ContextMenu handleMenuItemClick={onMenu}>
      <TabTextContainer>{name}</TabTextContainer>
    </ContextMenu>
  );
};


const SolverComponentMap = new Map<string, ({ uuid }) => JSX.Element>([
  ["image-source", ImageSourceTab],
  ["ray-tracer", RayTracerTab],
  ["rt60", RT60Tab],
  ["fdtd-2d", FDTD_2DTab],
  ["energydecay", EnergyDecayTab]
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
  // const solvers = useSolver((state: SolverStore) => Object.keys(state.solvers).reduce((acc, cur) => Object.assign(acc, {[cur]: state.solvers[cur].kind}), {} as {[key: string]: string}));
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

  const [selectedTabId, setSelectedTabId] = useState("solvers")

  return (
    <div>
      <Tabs id="parameter-config-tabs" className="parameter-config-tabs-container" onChange={e=>setSelectedTabId(`${e}`)} selectedTabId={selectedTabId}>
        <Tab id="renderer" title={<span>Renderer</span>} className={Classes.BUTTON_TEXT} panel={<RendererTab />} />
        <Tab id="solvers" title={<span>Solvers</span>} className={Classes.BUTTON_TEXT} panel={<SolversTab />} />
        <Tab id="objects" title={<span>Objects</span>} className={Classes.BUTTON_TEXT} panel={<ObjectsTab />} />
      </Tabs>
    </div>
  );
};
 

// export const ParameterConfig = () => {
//   const {keys, kinds} = useSolver((state: SolverStore) => ({
//     keys: Object.keys(state.solvers),
//     kinds: Object.keys(state.solvers).map(x=>state.solvers[x].kind)
//   }));
//   const [index, setIndex] = useState(0);
//   useEffect(()=>on("NEW", ()=>setIndex(0)), [])
//   return (
//     <div
//       style={{
//         height: "100%",
//         margin: "0"
//       }}
//     >
//       <Tabs selectedIndex={index} onSelect={e=>setIndex(e)}>
//         <TabList>
//           <Tab key={"parameter-config-tabname-" + keys.length}>Renderer</Tab>
//           {keys.map((uuid, i) => (
//             <Tab key={"parameter-config-tabname-" + i}>
//               <TabTitle uuid={uuid} />
//             </Tab>
//           ))}
//         </TabList>
        // <TabPanel key={"parameter-config-tabpanel-" + keys.length}>
        //   <RendererTab />
        // </TabPanel>
        // {keys.map((x, i) => {
        //   switch (kinds[i]) {
        //     case "image-source":
        //       return (
        //         <TabPanel key={"parameter-config-tabpanel-" + i}>
        //           <ImageSourceTab uuid={x} />
        //         </TabPanel>
        //       )
        //     case "ray-tracer":
        //       return (
        //         <TabPanel key={"parameter-config-tabpanel-" + i}>
        //           <RayTracerTab uuid={x} />
        //         </TabPanel>
        //       );
        //     case "rt60":
        //       return (
        //         <TabPanel key={"parameter-config-tabpanel-" + i}>
        //           <RT60Tab uuid={x} />
        //         </TabPanel>
        //       );
        //     case "fdtd-2d":
        //       return (
        //         <TabPanel key={"parameter-config-tabpanel-" + i}>
        //           <FDTD_2DTab uuid={x} />
        //         </TabPanel>
        //       );
        //     case "energydecay":
        //       return (
        //         <TabPanel key={"energydecay-config-tabpanel-" + i}>
        //           <EnergyDecayTab uuid={x}/>
        //         </TabPanel>
        //       );
        //     default:
        //       return <></>;
        //   }
        // })}
//       </Tabs>
//     </div>
//   );
// };