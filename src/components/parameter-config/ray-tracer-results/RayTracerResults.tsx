import React, {useState} from 'react';
import RayTracer from '../../../compute/raytracer';
import Messenger from '../../../state/messenger';
import GridRow from '../../grid-row/GridRow';
import { whole_octave } from '../../../compute/acoustics';
import { Actions } from '../../../state/actions';

export interface RayTracerResultsProps{
  raytracer: RayTracer;
  messenger: Messenger;
}

export interface RayTracerResultsState{
  t60: number[][];
}

export default class RayTracerResults extends React.Component<RayTracerResultsProps, RayTracerResultsState>{
  // updateHandlerID: string[];
  constructor(props: RayTracerResultsProps) {
    super(props);
    this.state = {
      t60: props.raytracer.room.calculateRT60FromHits(whole_octave)
    };
    
    // this.updateHandlerID = this.props.messenger.addMessageHandler(Actions.RESULTS_SHOULD_UPDATE, () => {
    //   this.setState({
    //     t60: props.raytracer.room.calculateRT60FromHits(whole_octave)
    //   });
    // });
  }
  componentWillUnmount() {
    // if (Actions[this.updateHandlerID[0]]) {
    //   this.props.messenger.removeMessageHandler(Actions[this.updateHandlerID[0]], this.updateHandlerID[1]);
    // }
  }
  render() {
    return (
      <div className="raytracer-results">
        <GridRow label={"T60"}>
          <table>
            <thead>
              <tr>
                <th>Frequency</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {this.state.t60[0].map((x, i) => (
                <tr key={this.props.raytracer.uuid+"-t60-" + i}>
                  <td>{x}Hz</td>
                  <td>{this.state.t60[1][i].toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GridRow>
      </div>
    );
  }
}