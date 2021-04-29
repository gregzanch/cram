import React, { useEffect, useRef } from "react";

import { useResult, getResultKeys, ResultStore } from "../store/result-store";

import { uuid } from "uuidv4";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useState } from "react";


import LTPChart from "./results/LTPChart";
import RT60Chart from "./results/RT60Chart"; 
import { ParentSize } from "@visx/responsive";
import PanelEmptyText from "./panel-container/PanelEmptyText";



const TabTitle = ({ uuid }) => {
  const name = useResult((state) => state.results[uuid].name);
  return <span>{name}</span>;
};


const resultKeys = (state: ResultStore) => Object.keys(state.results);

export const ResultsPanel = () => {
  const keys = useResult(resultKeys);
  const [index, setIndex] = useState(0);

  console.log(keys); 

  return keys.length > 0 ? (
    <div
      style={{
        margin: "0",
        background: "#fff"
      }}
    >
      <Tabs
        selectedIndex={index}
        onSelect={(index) => {
          // set((store)=>{store.openTabIndex=index})
          setIndex(index);
        }}
      >
        <TabList>
          {keys.map((key) => (
            <Tab key={key}>
              <TabTitle uuid={key} />
            </Tab>
          ))}
        </TabList>
        {keys.map((key) => (
          <TabPanel key={key}><ChartSelect uuid={key}/>
          </TabPanel>
        ))}
      </Tabs>
    </div>
  ) : <PanelEmptyText>No Results Yet!</PanelEmptyText>;
};

const ChartSelect = (uuid) => {

  useResult((state) => console.log(state.results[uuid.uuid])); 
  console.log(uuid); 

  switch (useResult((state) => state.results[uuid.uuid].kind)){

    case "linear-time-progression":
      return <LTPChart uuid={uuid.uuid} events />
    break

    case "statisticalRT60":
      return <RT60Chart uuid={uuid.uuid} events />
    break

    default:
      return null;
  }

};
