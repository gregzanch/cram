import React, {useState} from 'react';
import { Tab, Tabs, Icon, Text } from "@blueprintjs/core";
import Messenger from '../../messenger';
import Stats, {StatsProps, Stat} from './Stats';
import { ParametersPanel } from './ParametersPanel';


export interface GutterProps {
  messenger: Messenger;
  stats: Stat[];
}

export default function Gutter(props: GutterProps) {
  const [selectedTabId, setSelectedTabId] = useState("stats");
  
  const onChange = (newTabId: string, prevTabId: string, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setSelectedTabId(newTabId);
  };
  
  const statsTitle = (
    <Text>
      <Icon icon="chart" iconSize={16} style={{ marginRight: ".5em" }} />
      Stats
    </Text>
  );
  
  const logTitle = (
    <Text>
      <Icon icon="application" iconSize={16} style={{ marginRight: ".5em" }} />
      Log
    </Text>
  );
  
  const parametersTitle = (
    <Text>
      <Icon icon="function" iconSize={16} style={{ marginRight: ".5em" }} />
      Parameters
    </Text>
  );
  
  return (
    <div
      style={{
        height: "100%",
        margin: "0 0.5em"
      }}>
      <Tabs
        id="gutter-tabs"
        className="gutter"
        {...{ onChange, selectedTabId }}>
        <Tab
          id="stats"
          title={statsTitle}
          panel={
            <div>
              <Stats data={props.stats} />
            </div>
          }
        />
        <Tab
          id="parameters"
          title={parametersTitle}
          panel={<ParametersPanel messenger={props.messenger} />}
          panelClassName="parameter-panel"
        />
        <Tabs.Expander />
        <Tab
          id="debug-log"
          title={logTitle}
          panel={<div>Log</div>}
          panelClassName="panel-2"
        />
      </Tabs>
    </div>
  );
}

