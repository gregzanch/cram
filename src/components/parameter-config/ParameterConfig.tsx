import React, {useState} from 'react';
import Messenger from '../../messenger';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ContextMenu from "../context-menu/ContextMenu";
import './ParameterConfig.css';
import { KeyValuePair } from "../../common/key-value-pair";
import Solver from '../../compute/solver';
import RT60Tab from './RT60Tab';
import { RT60 } from '../../compute/rt';
import RayTracerTab from './RayTracerTab';
import RendererTab from './RendererTab';
import FDTD_2DTab from './FDTD_2DTab';
import { FDTD_2D } from '../../compute/2d-fdtd';
import { addToGlobalVars } from '../../common/global-vars';
import { ImageSourceTab } from './image-source-tab/ImageSourceTab';


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
    const prevTabIndex = this.state.selectedTabIndex;
    // debugger;
    if (prevTabIndex > 1) {
      const keys = Object.keys(this.props.solvers);
      if (this.props.solvers[keys[prevTabIndex - 2]] instanceof Solver) {
        this.props.solvers[keys[prevTabIndex - 2]].onParameterConfigBlur();
      }
    }
    this.setState({
      selectedTabIndex: tabIndex
    }, () => {
        if (this.state.selectedTabIndex > 1) {
          const keys = Object.keys(this.props.solvers);
          if (this.props.solvers[keys[this.state.selectedTabIndex - 2]] instanceof Solver) {
            this.props.solvers[keys[this.state.selectedTabIndex - 2]].onParameterConfigFocus();
          }
        }
    })
  }
  render() {
    const keys = Object.keys(this.props.solvers);
    
    return (
      <div
        style={{
          height: "100%",
          margin: "0"
        }}
      >
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
                        case "Delete":
                          {
                            this.props.messenger.postMessage("SHOULD_REMOVE_SOLVER", x);
                          }
                          break;
                        case "Log to Console":
                          {
                            console.log(this.props.solvers[x]);
                          }
                          break;
                        case "Add To Global Variables":
                          {
                            addToGlobalVars(this.props.solvers[x], this.props.solvers[x].name);
                          }
                          break;
                        default:
                          break;
                      }
                    }
                  }}
                  key={x + "-context-menu"}
                >
                  <div className="tab-text-container">{this.props.solvers[x].name}</div>
                </ContextMenu>
              </Tab>
            ))}
          </TabList>
          <TabPanel />
          <TabPanel key={"parameter-config-tabpanel-" + keys.length}>
            <RendererTab />
          </TabPanel>
          {keys.map((x, i) => {
            switch (this.props.solvers[x].kind) {
              case "image-source":
                return (
                  <TabPanel key={"parameter-config-tabpanel-" + i}>
                    <ImageSourceTab uuid={this.props.solvers[x].uuid} />
                  </TabPanel>
                )
              case "ray-tracer":
                return (
                  <TabPanel key={"parameter-config-tabpanel-" + i}>
                    <RayTracerTab uuid={this.props.solvers[x].uuid} />
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