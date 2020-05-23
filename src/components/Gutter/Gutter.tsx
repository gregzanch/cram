import React, {useState} from 'react';
import Messenger from '../../messenger';
import { uuid } from 'uuidv4';
import UPlot from './UPlot';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ContextMenu from "../context-menu/ContextMenu";
import './Gutter.css';

export enum TabTypes {
  LOG = 0,
  DEBUG_STATS = 1,
  RECEIVER_FDTD = 2,
}

export interface TabInfo {
  uuid: string;
  name: string;
  type: TabTypes
}

export interface GutterProps {
  messenger: Messenger;
}

export interface GutterState {
  selectedTabIndex: number;
  tabs: TabInfo[];
}

export default class Gutter extends React.Component<GutterProps, GutterState>{
  constructor(props: GutterProps) {
    super(props);
    this.state = {
      selectedTabIndex: 1,
      tabs: [
        { uuid: uuid(), name: "Debug Stats", type: TabTypes.DEBUG_STATS },
        { uuid: uuid(), name: "Log", type: TabTypes.LOG }
      ]
    };
    
    this.handleTabChange = this.handleTabChange.bind(this);
    this.removeTab = this.removeTab.bind(this);
    
    this.props.messenger.addMessageHandler("SHOW_RECEIVER_FDTD", (acc, ...args) => {
      console.log(args);
      const receiver_id = args[0].uuid;
      const name = args[0].name;
      const tabs = this.state.tabs.concat({ uuid: receiver_id, name, type: TabTypes.RECEIVER_FDTD });
      const selectedTabIndex = tabs.length;
      this.setState({
        tabs,
        selectedTabIndex
      })
    })
  } 
  handleTabChange(tabIndex: number) {
    this.setState({
      selectedTabIndex: tabIndex,
    })
  }
  removeTab(tab: TabInfo) {
    const newTabs = this.state.tabs.filter(x => x.uuid !== tab.uuid);
    this.setState({
      selectedTabIndex: this.state.selectedTabIndex - 1,
      tabs: newTabs
    });
  }
  render() {
    
    return (
      <div
        style={{
          height: "100%",
          margin: "0"
        }}>
        <Tabs selectedIndex={this.state.selectedTabIndex} onSelect={this.handleTabChange}>
          <TabList>
            <Tab disabled />
            {this.state.tabs.map((x, i) => (
              <Tab key={"gutter-tabname-" + i}>
                <ContextMenu
                  items={["Close"]}
                  handleMenuItemClick={(e) => {
                    switch (e.target.textContent) {
                      case "Close": this.removeTab(x); break;
                      default: break;
                    }
                  }}
                  key={x.uuid + "gutter-context-menu"}>
                  <div className="tab-text-container">{x.name}</div>
                </ContextMenu>
              </Tab>
            ))}
          </TabList>
          <TabPanel />
          {this.state.tabs.map((x, i) => {
            switch (x.type) {
              case TabTypes.LOG:
                return  <TabPanel key={"gutter-tabpanel-log"}><div></div></TabPanel>;
              case TabTypes.DEBUG_STATS:
                return <TabPanel key={"gutter-tabpanel-debug-stats"}>
                  <div id="gutter-debug-stats"></div>
                </TabPanel>;
              case TabTypes.RECEIVER_FDTD:
                return <TabPanel key={"gutter-tabpanel-" + i}><div>{x.name}</div></TabPanel>;
              default:
                return <TabPanel key={"gutter-tabpanel-" + i}><div></div></TabPanel>;
            }
          })}
        </Tabs>
      </div>
    );
  }
  
}