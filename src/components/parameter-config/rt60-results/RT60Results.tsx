import React, { useState } from "react";
import RT60 from "../../../compute/rt";
import Messenger from "../../../state/messenger";
import {whole_octave} from "../../../compute/acoustics";
import GridRow from "../../grid-row/GridRow";
export interface RT60ResultsProps {
  rt60: RT60;
  messenger: Messenger;
}

export interface RT60ResultsState {

}

export default class RT60Results extends React.Component<RT60ResultsProps, RT60ResultsState> {

  constructor(props: RT60ResultsProps) {
    super(props);
    this.state = {

    };

  }
  componentWillUnmount() {

  }
  render() {
    return (
      <div className="rt60-results">
      </div>
    );
  }
}
