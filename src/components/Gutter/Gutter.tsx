import React, {useState} from 'react';
import Messenger from '../../messenger';


import Stats, {StatsProps, Stat} from './Stats';
import { ParametersPanel } from './ParametersPanel';
import MaterialsPanel from './MaterialsPanel';
import { ChartTab } from './ChartTab';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { SvgIcon } from '@material-ui/core';
import MoreVert from '@material-ui/icons/MoreVert';
import CloseIcon from '@material-ui/icons/Close';
import './Gutter.css';
import { KeyValuePair } from '../../common/key-value-pair';
import Solver from '../../compute/solver';
import RT60Tab from './RT60Tab';
import { RT60 } from '../../compute/rt';
import RayTracerTab from './RayTracerTab';
import RayTracer from '../../compute/raytracer';
import RendererTab from './RendererTab';


export interface GutterProps {
  solvers: KeyValuePair<Solver>;
  messenger: Messenger;
}

export interface GutterState {
  selectedTabIndex: number;
}

export default class Gutter extends React.Component<GutterProps, GutterState>{
  constructor(props: GutterProps) {
    super(props);
    this.state = {
      selectedTabIndex: 1
    }
    this.handleTabChange = this.handleTabChange.bind(this);
  } 
  handleTabChange(tabIndex: number) {
    this.setState({
      selectedTabIndex: tabIndex
    })
  }
  render() {
    const keys = Object.keys(this.props.solvers);
    
    return (
      <div
        style={{
          height: "100%",
          margin: "0"
        }}>
        <Tabs selectedIndex={this.state.selectedTabIndex} onSelect={this.handleTabChange}>
          <TabList>
            <Tab disabled />
              <Tab key={"gutter-tabname-" + keys.length}>
                Renderer
              </Tab>
            {keys.map((x, i) => {
              return (
                <Tab key={"gutter-tabname-" + i}>
                  <div className="tab-text-container">
                    {this.props.solvers[x].name}
                  </div>
                </Tab>
              );
            })}
          </TabList>
          <TabPanel />
          <TabPanel key={"gutter-tabpanel-" + keys.length}>
            <RendererTab messenger={this.props.messenger} />
          </TabPanel>
          {keys.map((x, i) => {
            switch (this.props.solvers[x].kind) {
              case "ray-tracer":
                return (
                  <TabPanel key={"gutter-tabpanel-" + i}>
                    <RayTracerTab
                      solver={this.props.solvers[x] as RayTracer}
                      messenger={this.props.messenger}
                    />
                  </TabPanel>
                );
              case "rt60":
                return (
                  <TabPanel key={"gutter-tabpanel-" + i}>
                    <RT60Tab solver={this.props.solvers[x] as RT60} />
                  </TabPanel>
                );
              default:
                return <TabPanel key={"gutter-tabpanel-" + i} />;
            }
          })}
        </Tabs>
      </div>
    );
  }
  
}