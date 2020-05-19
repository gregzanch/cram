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
  hasLabel: boolean;
  label: string;
  tooltipText: string;
  hasTooltip: boolean;
  labelPosition: "top" | "bottom" | "left" | "right";
}

export interface SliderState{
  stagedValue: number;
}
const countDecimals = (n: number) => Number.isInteger(n) ? 0 : n.toString().split(".").slice(-1)[0].length;
const clamp = (v: number, a: number, b: number) => v < a ? a : v > b ? b : v;
export default class Slider extends React.Component<SliderProps, SliderState>{
  input: React.RefObject<HTMLInputElement>;
  decimals: number;
  constructor(props: SliderProps) {
    super(props);
    this.decimals = countDecimals(this.props.step);
    this.state = {
      stagedValue: this.props.value
    }
    this.input = React.createRef<HTMLInputElement>();
    this.setStagedValue = this.setStagedValue.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
    this.input.current!.value = this.state.stagedValue.toFixed(this.decimals);
  }
  setStagedValue(value: number, callback?: () => void) {
    this.input.current!.value = value.toFixed(this.decimals);
    this.setState({
      stagedValue: value
    }, callback);
  }
  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    this.setStagedValue(clamp(Number(this.input.current!.value), this.props.min, this.props.max));
    
    event.preventDefault();
  }
  render() {
    return (
			<div className="slider-container">
				{this.props.hasLabel && (
					<Label
						hasTooltip={this.props.hasTooltip}
						tooltipText={this.props.tooltipText}
					>
						{this.props.label}
					</Label>
				)}
				<div className="slider-component">
					<button
						className={"slider-step decrement"}
						onClick={(e) => {
							let value = this.state.stagedValue - this.props.step;
							if (value < this.props.min) {
								value = this.props.min;
							}
							this.setStagedValue(value, () =>
								this.props.onChange({ id: this.props.id, value })
							);
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
						id={this.props.id}
						onChange={(e) => {
							const value = e.currentTarget.valueAsNumber;
							this.setStagedValue(value, () =>
								this.props.onChange({ id: this.props.id, value })
							);
						}}
					/>
					<button
						className={"slider-step increment"}
						onClick={(e) => {
							let value = this.state.stagedValue + this.props.step;
							if (value > this.props.max) {
								value = this.props.max;
							}
							this.setStagedValue(value, () =>
								this.props.onChange({ id: this.props.id, value })
							);
						}}
					>
						+
					</button>
				</div>
				<form onSubmit={this.handleSubmit} noValidate>
					<input
						type="number"
						className={"slider-number"}
						min={this.props.min}
						max={this.props.max}
						step={this.props.step}
						id={this.props.id}
						ref={this.input}
					/>
				</form>
			</div>
		);
  }
}
