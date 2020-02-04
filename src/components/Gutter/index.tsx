import React, {useState} from 'react';
import { Tab, Tabs, Icon, Text } from "@blueprintjs/core";
import Messenger from '../../messenger';
import Stats, {StatsProps, Stat} from './Stats';


export interface GutterProps {
  messenger: Messenger;
  stats: Stat[];
}

export default function Gutter(props: GutterProps) {
  const [selectedTabId, setSelectedTabId] = useState("stats");
  
  const onChange = (newTabId: string, prevTabId: string, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setSelectedTabId(newTabId);
  };
  return (
    <div
      style={{
        height: "100%",
        margin: "0 0.5em"
      }}>
      <Tabs
        id="guutter-tabs"
        className="gutter"
        {...{ onChange, selectedTabId }}>
        <Tab
          id="stats"
          title={
            <Text>
              <Icon
                icon="chart"
                iconSize={16}
                style={{ marginRight: ".5em" }}
              />
              Stats
            </Text>
          }
          panel={
            <div><Stats data={props.stats}/></div>
          }
        />
        <Tab
          id="debug-log"
          title={
            <Text>
              <Icon
                icon="application"
                iconSize={16}
                style={{ marginRight: ".5em" }}
              />
              Log
            </Text>
          }
          panel={<div>panel2</div>}
          panelClassName="panel-2"
        />
        <Tabs.Expander />
      </Tabs>
    </div>
  );
}

