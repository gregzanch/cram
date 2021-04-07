import React, {useCallback, useEffect, useState} from 'react';
import {emit, on} from '../../messenger';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ContextMenu from "../ContextMenu";
import './ParameterConfig.css';
import RayTracerTab from './RayTracerTab';
import RendererTab from './RendererTab';
import FDTD_2DTab from './FDTD_2DTab';
import { ImageSourceTab } from './image-source-tab/ImageSourceTab';
import { SolverStore, useSolver } from '../../store';
import styled from 'styled-components';
import RT60Tab from './RT60Tab';
import EnergyDecayTab from './EnergyDecayTab';


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



export const ParameterConfig = () => {
  const {keys, kinds} = useSolver((state: SolverStore) => ({
    keys: Object.keys(state.solvers),
    kinds: Object.keys(state.solvers).map(x=>state.solvers[x].kind)
  }));
  const [index, setIndex] = useState(0);
  useEffect(()=>on("NEW", ()=>setIndex(0)), [])
  return (
    <div
      style={{
        height: "100%",
        margin: "0"
      }}
    >
      <Tabs selectedIndex={index} onSelect={e=>setIndex(e)}>
        <TabList>
          <Tab key={"parameter-config-tabname-" + keys.length}>Renderer</Tab>
          {keys.map((uuid, i) => (
            <Tab key={"parameter-config-tabname-" + i}>
              <TabTitle uuid={uuid} />
            </Tab>
          ))}
        </TabList>
        <TabPanel key={"parameter-config-tabpanel-" + keys.length}>
          <RendererTab />
        </TabPanel>
        {keys.map((x, i) => {
          switch (kinds[i]) {
            case "image-source":
              return (
                <TabPanel key={"parameter-config-tabpanel-" + i}>
                  <ImageSourceTab uuid={x} />
                </TabPanel>
              )
            case "ray-tracer":
              return (
                <TabPanel key={"parameter-config-tabpanel-" + i}>
                  <RayTracerTab uuid={x} />
                </TabPanel>
              );
            case "rt60":
              return (
                <TabPanel key={"parameter-config-tabpanel-" + i}>
                  <RT60Tab uuid={x} />
                </TabPanel>
              );
            case "fdtd-2d":
              return (
                <TabPanel key={"parameter-config-tabpanel-" + i}>
                  <FDTD_2DTab uuid={x} />
                </TabPanel>
              );
            case "energydecay":
              return (
                <TabPanel key={"energydecay-config-tabpanel-" + i}>
                  <EnergyDecayTab uuid={x}/>
                </TabPanel>
              );
            default:
              return <></>;
          }
        })}
      </Tabs>
    </div>
  );
};