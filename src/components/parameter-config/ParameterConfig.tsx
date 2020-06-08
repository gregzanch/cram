import React, {useState} from 'react';
import Messenger from '../../messenger';


import Stats, {StatsProps, Stat} from './Stats';
import { ParametersPanel } from './ParametersPanel';
import MaterialsPanel from './MaterialsPanel';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ContextMenu from "../context-menu/ContextMenu";
import { SvgIcon } from '@material-ui/core';
import MoreVert from '@material-ui/icons/MoreVert';
import CloseIcon from '@material-ui/icons/Close';
import './ParameterConfig.css';
import { KeyValuePair } from '../../common/key-value-pair';
import Solver from '../../compute/solver';
import RT60Tab from './rt60-tab/RT60Tab';
import { RT60 } from '../../compute/rt';
import RayTracerTab from './ray-tracer-tab/RayTracerTab';
import RayTracer from '../../compute/raytracer';
import RendererTab from './renderer-tab/RendererTab';
import FDTD_2DTab from './fdtd-2d-tab/FDTD_2DTab';
import { FDTD_2D } from '../../compute/2d-fdtd';


export interface ParameterConfigProps {
  solvers: KeyValuePair<Solver>;
  messenger: Messenger;
}

export interface ParameterConfigState {
  selectedTabIndex: number;
  tabNames: string[];
}

type ClickEvent = React.MouseEvent<HTMLElement, MouseEvent>;


export default class ParameterConfig extends React.Component<ParameterConfigProps, ParameterConfigState>{
  updateHandlerIDs: string[][];
  constructor(props: ParameterConfigProps) {
    super(props);
    this.state = {
      selectedTabIndex: 1,
      tabNames: Object.keys(props.solvers).map((x) => props.solvers[x].name)
    };
    this.handleTabChange = this.handleTabChange.bind(this);
    this.updateHandlerIDs = [] as string[][];
    this.updateHandlerIDs.push(this.props.messenger.addMessageHandler("SHOULD_REMOVE_CONTAINER", () => this.forceUpdate()));
    this.updateHandlerIDs.push(this.props.messenger.addMessageHandler("GUTTER_SHOULD_UPDATE", () => this.forceUpdate()));
    
  } 
  componentWillUnmount() {
    for (let i = 0; i < this.updateHandlerIDs.length; i++){
      this.props.messenger.removeMessageHandler(this.updateHandlerIDs[i][0], this.updateHandlerIDs[i][1]);
    }
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
            <Tab key={"parameter-config-tabname-" + keys.length}>Renderer</Tab>
            {keys.map((x, i) => (
              <Tab key={"parameter-config-tabname-" + i}>
                <ContextMenu
                  handleMenuItemClick={(e) => {
                    if (e.target.textContent) {
                      switch (e.target.textContent) {
                        case "Delete": {
                            this.props.messenger.postMessage("SHOULD_REMOVE_SOLVER", x);
                        } break;
                        case "Log to Console": {
                          console.log(this.props.solvers[x]);
                        } break;
                        default:
                          break;
                      }
                    }
                  }}
                  key={x + "-context-menu"}>
                  <div className="tab-text-container">{this.props.solvers[x].name}</div>
                </ContextMenu>
              </Tab>
            ))}
          </TabList>
          <TabPanel />
          <TabPanel key={"parameter-config-tabpanel-" + keys.length}>
            <RendererTab messenger={this.props.messenger} />
          </TabPanel>
          {keys.map((x, i) => {
            switch (this.props.solvers[x].kind) {
              case "ray-tracer":
                return (
                  <TabPanel key={"parameter-config-tabpanel-" + i}>
                    <RayTracerTab solver={this.props.solvers[x] as RayTracer} messenger={this.props.messenger} />
                  </TabPanel>
                );
              case "rt60":
                return (
                  <TabPanel key={"parameter-config-tabpanel-" + i}>
                    <RT60Tab solver={this.props.solvers[x] as RT60} messenger={this.props.messenger} />
                  </TabPanel>
                );
              case "fdtd-2d":
                return (
                  <TabPanel key={"parameter-config-tabpanel-" + i}>
                    <FDTD_2DTab solver={this.props.solvers[x] as FDTD_2D} messenger={this.props.messenger} />
                  </TabPanel>
                );
              default:
                return <></>;
            }
          })}
        </Tabs>
      </div>
    );
  }
  
}