import React from "react";
import Messenger from "../../messenger";


import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { KeyValuePair } from "../../common/key-value-pair";
import Solver from "../../compute/solver";
import RT60Tab from "./RT60Tab";
import { RT60 } from "../../compute/rt";
import RayTracer from "../../compute/raytracer";
import RayTracerResults from "./RayTracerResults";
import RT60Results from "./RT60Results";

export interface ResultsProps {
  solvers: KeyValuePair<Solver>;
  messenger: Messenger;
}

export interface ResultsState {
  selectedTabIndex: number;
}

export default class Results extends React.Component<ResultsProps, ResultsState> {
  updateHandlerIDs: string[][];
  constructor(props: ResultsProps) {
    super(props);
    this.state = {
      selectedTabIndex: 1
    };
    this.handleTabChange = this.handleTabChange.bind(this);
    this.updateHandlerIDs = [] as string[][];
    this.updateHandlerIDs.push(this.props.messenger.addMessageHandler("RESULTS_SHOULD_UPDATE", () => this.forceUpdate()));
  }
  componentWillUnmount() {
    for (let i = 0; i < this.updateHandlerIDs.length; i++){
      this.props.messenger.removeMessageHandler(this.updateHandlerIDs[i][0], this.updateHandlerIDs[i][1]);
    }
  }
  handleTabChange(tabIndex: number) {
    this.setState({
      selectedTabIndex: tabIndex
    });
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
            {keys.map((x, i) => {
              return (
                <Tab key={"gutter-tabname-" + i}>
                  <div className="tab-text-container">{this.props.solvers[x].name}</div>
                </Tab>
              );
            })}
          </TabList>
          <TabPanel />
          {keys.map((x, i) => {
            switch (this.props.solvers[x].kind) {
              case "ray-tracer":
                return (
                  <TabPanel key={"gutter-tabpanel-" + i}>
                    <RayTracerResults messenger={this.props.messenger} raytracer={this.props.solvers[x] as RayTracer}/>
                  </TabPanel>
                );
              case "rt60":
                return (
                  <TabPanel key={"gutter-tabpanel-" + i}>
                    <RT60Results messenger={this.props.messenger} rt60={this.props.solvers[x] as RT60} />
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
