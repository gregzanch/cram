import React, { useEffect, useRef } from "react";
// import '../node_modules/react-vis/dist/style.css';
import { useResult, getResultKeys, ResultStore } from "../store/result-store";

import { uuid } from "uuidv4";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useState } from "react";


import LTPChart from "./results/LTPChart";
import { ParentSize } from "@visx/responsive";

const TabTitle = ({ uuid }) => {
  const name = useResult((state) => state.results[uuid].name);
  return <span>{name}</span>;
};


const resultKeys = (state: ResultStore) => Object.keys(state.results);

export const ResultsPanel = () => {
  const keys = useResult(resultKeys);
  const [index, setIndex] = useState(0);

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
          <TabPanel key={key}><LTPChart uuid={key} events />
          </TabPanel>
        ))}
      </Tabs>
    </div>
  ) : <div>No Results Yet!</div>;
};
