import React, { useEffect, useRef } from 'react';
// import '../node_modules/react-vis/dist/style.css';
import {useResult, getResultKeys} from '../store/result-store';

import { uuid } from "uuidv4";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useState } from 'react';


import BarChart from './BarChart';





const TabTitle = ({ uuid }) => {
  const name = useResult(state => state.results[uuid].name);
  return <span>{name}</span>
}


export const ResultsPanel = () => {
  const { keys, openTabIndex, set } = useResult(state => ({
    keys: Object.keys(state.results),
    openTabIndex: state.openTabIndex,
    set: state.set
  }));
  const [index, setIndex] = useState(1);

  return (
      <div
        style={{
          height: "100%",
          margin: "0",
          background: "#fff"
        }}
      >
        <Tabs selectedIndex={index} onSelect={(index)=>{
          // set((store)=>{store.openTabIndex=index})
          setIndex(index);
        }}>
          <TabList>
            <Tab>{"test"}</Tab>
            {keys.map(key=><Tab key={key}><TabTitle uuid={key}/></Tab>)}
          </TabList>
          <TabPanel><div>sdfkjdslkfj</div></TabPanel>
          {
            keys.map(key=>(<TabPanel key={key}><BarChart uuid={key}/></TabPanel>))
          }
        </Tabs>
      </div>
  )
}