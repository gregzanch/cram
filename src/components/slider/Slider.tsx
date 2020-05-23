import React from "react";
import Label from "../label/Label";
import "./Slider.css";

export interface SliderChangeEvent {
  id: string;
  value: number;
}

export interface SliderProps {
  id: string;
  value: number;
  onChange: (event: SliderChangeEvent) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  tooltipText: string;
  labelPosition: "top" | "bottom" | "left" | "right";
  hasToolTip?: boolean;
}

export interface SliderState{
  stagedValue: number;
  editing: boolean;
}
const countDecimals = (n: number) => Number.isInteger(n) ? 0 : n.toString().split(".").slice(-1)[0].length;
const clamp = (v: number, a: number, b: number) => v < a ? a : v > b ? b : v;


export default class Slider extends React.Component<SliderProps, SliderState>{
  decimals: number;
  constructor(props: SliderProps) {
    super(props);
    this.decimals = countDecimals(this.props.step);
    const v = typeof this.props.value !== "undefined" ? this.props.value : 0;
    this.state = {
      stagedValue: Number(v.toFixed(this.decimals)),
      editing: false
    };
    this.setStagedValue = this.setStagedValue.bind(this);
  }
  setStagedValue(value: number, callback?: () => void) {
    this.setState({
      stagedValue: value
    }, callback);
  }
  render() {
    return (
      <div className="slider-container">
        <div className="slider-label-container">
          <Label hasTooltip={this.props.hasToolTip} tooltipText={this.props.tooltipText}>
            {this.props.label}
          </Label>
        </div>
        <div className="slider-component">
          <button
            className={"slider-step decrement"}
            onClick={(e) => {
              let value = this.state.stagedValue - this.props.step;
              if (value < this.props.min) {
                value = this.props.min;
              }
              this.setStagedValue(value, () => this.props.onChange({ id: this.props.id, value }));
            }}
          >
            -
          </button>
          <input
            type="range"
            className={"slider"}
            min={this.props.min}
            max={this.props.max}
            step={this.props.step}
            value={this.props.value}
            id={this.props.id + "-slider-" + window.crypto.getRandomValues(new Uint32Array(1))[0].toString()}
            onChange={(e) => {
              const value = e.currentTarget.valueAsNumber;
              this.setStagedValue(value, () => this.props.onChange({ id: this.props.id, value }));
            }}
          />
          <button
            className={"slider-step increment"}
            onClick={(e) => {
              let value = this.state.stagedValue + this.props.step;
              if (value > this.props.max) {
                value = this.props.max;
              }
              this.setStagedValue(value, () => this.props.onChange({ id: this.props.id, value }));
            }}
          >
            +
          </button>
        </div>
        <input
          type="number"
          className={"slider-number"}
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
          id={this.props.id + "-number"}
          value={this.state.editing ? this.state.stagedValue : this.props.value}
          onFocus={e => {
            this.setState({
              stagedValue: this.props.value,
              editing: true
            });
          }}
          onBlur={e => {
            this.setState({editing: false})
          }}
          onChange={(e) => {
            let v = e.currentTarget.value;
            if (e.currentTarget.value === ".") {
              v = "0."
            }
            this.setStagedValue(Number(v));
          }}
          onKeyDown={(e) => {
            switch (e.key) {
              case "Enter": {
                const value = clamp(Number(this.state.stagedValue.toFixed(this.decimals)), this.props.min, this.props.max);
                this.setStagedValue(value, () => this.props.onChange({ id: this.props.id, value }));
                const elt = document.getElementById(this.props.id + "-number");
                elt && elt.blur();
              } break;
              case "Escape": {
                const value = this.props.value;
                this.setStagedValue(value);
                const elt = document.getElementById(this.props.id + "-number");
                elt && elt.blur();
                // e.preventDefault();
              } break;
              default: break;
            }
          }}
        />
      </div>
    );
  }
}
