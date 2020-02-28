import React, {useState} from 'react';
import Messenger from '../../messenger';

import {  Icon } from "@blueprintjs/core";
import Stats, {StatsProps, Stat} from './Stats';
import { ParametersPanel } from './ParametersPanel';
import MaterialsPanel from './MaterialsPanel';
import { ChartTab } from './ChartTab';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import './Gutter.css';


export interface GutterProps {
  messenger: Messenger;
  stats: Stat[];
  chartData?: {
    label: string;
    x: number[];
    y: number[];
  }[];
}

export default function Gutter(props: GutterProps) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(1);
  return (
    <div
      style={{
        height: "100%",
        margin: "0"
      }}>
      <Tabs selectedIndex={selectedTabIndex} onSelect={tabIndex => setSelectedTabIndex(tabIndex)}>
        <TabList>
          <Tab disabled></Tab> {/* ignore */}
          <Tab>Raytracer</Tab>
          <Tab>RT60</Tab>
        </TabList>
        <TabPanel></TabPanel> {/* ignore */}
        <TabPanel>
          <ChartTab data={props.chartData} />
        </TabPanel>
        <TabPanel></TabPanel> {/* ignore */}
      </Tabs>
    </div>
  );
}

