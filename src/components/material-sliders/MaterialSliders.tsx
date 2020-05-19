import React from 'react';
import { Button } from '@blueprintjs/core';
import {absorptionGradient, Absorption} from '../absorption-gradient/AbsorptionGradient';

interface MaterialSlidersProps {
  values?: number[];
}
export interface MaterialSlidersState{
  values: number[];
}
export default class MaterialSliders extends React.Component<MaterialSlidersProps, MaterialSlidersState> {
  // canvas: React.RefObject<HTMLCanvasElement>

  constructor(props: MaterialSlidersProps) {
    super(props);
    this.state = {
      values: props.values || Array(8).fill(0)
    }
    // this.canvas = React.createRef<HTMLCanvasElement>();
  }
  componentDidMount() {
    // this.canvas.current?.getContext("webgl2")
  }
  render() {
    return (
      <div className="material-sliders">
        <div>
          {this.state.values.map((x, i) => {
            return (
              <input
                type="number"
                value={x}
                key={"ms-" + i.toString()}
                min={0}
                max={1}
                step={0.01}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const values = [...this.state.values];
                  values[i] = e.currentTarget.valueAsNumber;
                  this.setState({ values });
                }}
              />
            );
          })}
          <Button text="find" minimal small />
        </div>
        <div
          className="search-gradient"
          style={{
            background: `${absorptionGradient(this.state.values)}`,
            width: "300px"
          }}
        />
      </div>
    );
  }
}