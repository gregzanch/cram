import React from "react";
import "./Vector3Input.css";

export interface Vector3InputChangeEvent {
  id?: string;
  value: number[];
}

export interface Vector3InputProps {
  id?: string;
  value: number[];
  onChange: (event: Vector3InputChangeEvent) => void;
  min: number;
  max: number;
  step: number;
}

export interface Vector3InputState {
  stagedValue: number[];
}
const countDecimals = (n: number) => (Number.isInteger(n) ? 0 : n.toString().split(".").slice(-1)[0].length);
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

export default class Vector3Input extends React.Component<Vector3InputProps, Vector3InputState> {
  inputX: React.RefObject<HTMLInputElement>;
  inputY: React.RefObject<HTMLInputElement>;
  inputZ: React.RefObject<HTMLInputElement>;
  decimals: number;
  constructor(props: Vector3InputProps) {
    super(props);
    this.decimals = countDecimals(this.props.step);
    this.state = {
      stagedValue: this.props.value
    };
    this.inputX = React.createRef<HTMLInputElement>();
    this.inputY = React.createRef<HTMLInputElement>();
    this.inputZ = React.createRef<HTMLInputElement>();
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
    this.inputX.current!.value = (this.state.stagedValue && this.state.stagedValue[0].toFixed(this.decimals)) || "0";
    this.inputY.current!.value = (this.state.stagedValue && this.state.stagedValue[1].toFixed(this.decimals)) || "0";
    this.inputZ.current!.value = (this.state.stagedValue && this.state.stagedValue[2].toFixed(this.decimals)) || "0";
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    
    const valueX = clamp(Number(this.inputX.current!.value), this.props.min, this.props.max);
    const valueY = clamp(Number(this.inputY.current!.value), this.props.min, this.props.max);
    const valueZ = clamp(Number(this.inputZ.current!.value), this.props.min, this.props.max);
    
    this.props.onChange({ value: [valueX, valueY, valueZ] });

    event.preventDefault();
  }
  render() {
    return (
      <div className="vector3-input-container">
        <form onSubmit={this.handleSubmit} noValidate>
          <input
            type="number"
            className={"vector3-input-number"}
            min={this.props.min}
            max={this.props.max}
            step={this.props.step}
            id={this.props.id + "-x"}
            ref={this.inputX}
          />
        </form>
        <form onSubmit={this.handleSubmit} noValidate>
          <input
            type="number"
            className={"vector3-input-number"}
            min={this.props.min}
            max={this.props.max}
            step={this.props.step}
            id={this.props.id + "-y"}
            ref={this.inputY}
          />
        </form>
        <form onSubmit={this.handleSubmit} noValidate>
          <input
            type="number"
            className={"vector3-input-number"}
            min={this.props.min}
            max={this.props.max}
            step={this.props.step}
            id={this.props.id + "-z"}
            ref={this.inputZ}
          />
        </form>
      </div>
    );
  }
}
