import React, {useState} from 'react';
import { Tab, Tabs, Icon, Text } from "@blueprintjs/core";
import Messenger from '../../messenger';
import Stats, {StatsProps, Stat} from './Stats';
import { ParametersPanel } from './ParametersPanel';
import MaterialsPanel from './MaterialsPanel';


export interface GutterProps {
  messenger: Messenger;
  stats: Stat[];
}

export default function Gutter(props: GutterProps) {
  const [selectedTabId, setSelectedTabId] = useState("stats");
  
  const onChange = (newTabId: string, prevTabId: string, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setSelectedTabId(newTabId);
  };
  
  const iconProps = (icon) => ({
    icon,
    iconSize: 16,
    style: {
      marginRight: ".5em"
    }
  })
  
  const statsTitle = (
    <Text>
      <Icon {...iconProps("chart")}/>
      Stats
    </Text>
  );
  
  const logTitle = (
    <Text>
      <Icon {...iconProps("application")} />
      Log
    </Text>
  );
  
  const parametersTitle = (
    <Text>
      <Icon {...iconProps("function")} />
      Parameters
    </Text>
  );
  
  const materialsTitle = (
    <Text>
      <Icon {...iconProps("database")} />
      Materials
    </Text>
  )
  
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
        <Tab
          id="materials"
          title={materialsTitle}
          panel={<MaterialsPanel messenger={props.messenger} />}
          panelClassName="materials-panel"
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

