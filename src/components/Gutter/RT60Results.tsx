import React, { useState } from "react";
import RT60 from "../../compute/rt";
import Messenger from "../../messenger";
import {whole_octave} from "../../compute/acoustics";
import GridRow from "../grid-row/GridRow";
export interface RT60ResultsProps {
  rt60: RT60;
  messenger: Messenger;
}

export interface RT60ResultsState {
  sabineRT: number[][];
}

export default class RT60Results extends React.Component<RT60ResultsProps, RT60ResultsState> {
  updateHandlerID: string[];
  constructor(props: RT60ResultsProps) {
    super(props);
    this.state = {
      sabineRT: props.rt60.sabine(whole_octave)
    };
    this.updateHandlerID = this.props.messenger.addMessageHandler("RESULTS_SHOULD_UPDATE", () => {
      this.setState({
        sabineRT: props.rt60.sabine(whole_octave)
      });
    });
    console.log(this.updateHandlerID);
  }
  componentWillUnmount() {
    this.props.messenger.removeMessageHandler(this.updateHandlerID[0], this.updateHandlerID[1]);
  }
  render() {
    return (
      <div className="rt60-results">
        <GridRow label={"sabine"}>
          <table>
            <thead>
              <tr>
                <th>Frequency</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {this.state.sabineRT[0].map((frequency, i) => (
                <tr key={this.props.rt60.uuid + "-sabineRT-" + frequency}>
                  <td>{frequency}Hz</td>
                  <td>{this.state.sabineRT[1][i].toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GridRow>
{/* 
        {this.state.sabineRT[0].map((frequency, i) => (
          <div key={this.props.rt60.uuid + "-sabineRT-" + frequency} className="">
            <span>{frequency}Hz</span>
            <span>{this.state.sabineRT[1][i]}</span>
          </div>
        ))} */}
      </div>
    );
  }
}
