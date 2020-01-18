import React from "react";
import ReactDOM from "react-dom";
import SplitterLayout from "react-splitter-layout";
import "./css/split-container.css";
import "./css/styles.css";
import "./css/panel.css";
import "./css/tree.css";
import "./css/track-slider.css";
import "./css/flair.css"
import "./css/float-controls.css";
import "./css/play-button.css";
import ParameterPanel, {
	ParameterPanelStyle
} from "./components/ParameterPanel";
import Parameter, {ParameterList} from "./common/parameter";
import PlayButton from './components/PlayButton';


import PanelContainer from "./containers/PanelContainer";
import ConditionPanel from "./components/ConditionPanel";
import Renderer from "./render/renderer";

import * as math from "mathjs";
import { BeamParams } from "./geometry/beam";
import expose from "./common/expose";

const { parse, evaluate } = math;

expose({ math });

function isInt(val: number) {
	return Math.floor(val) == val;
}

function formatParamter(val: string) {
	const num = Number(val);
	if (!num) {
		return val;
	}
	if (num <= 0.001 || num >= 1000) {
		return num.toExponential(3);
	}
	return isInt(num) ? num.toString() : num.toFixed(4);
}

function formatFunction(val: string) {
	return val;
}

interface AppState {
	params: BeamParams;
	paramGroups: string[];
	running: boolean;
}

class App extends React.Component {
	state: AppState;
	canvas: React.RefObject<HTMLCanvasElement>;
	prog: any;
	renderer: Renderer;
	constructor(props) {
		super(props);
		this.state = {
			paramGroups: ["geometry", "material", "simulation", "boundary"],
			running: false,
			params: {
				length: new Parameter({
					id: "length",
					value: 1.2192,
					label: "Length",
					category: "geometry",
					format: formatParamter
				}),
				width: new Parameter({
					id: "width",
					value: 0.0508,
					label: "Width",
					category: "geometry",
					format: formatParamter
				}),
				height: new Parameter({
					id: "height",
					value: 0.003,
					label: "Height",
					category: "geometry",
					format: formatParamter
				}),
				mass: new Parameter({
					id: "mass",
					value: 0.501676416,
					label: "Mass",
					category: "geometry",
					format: formatParamter
				}),
				modulus: new Parameter({
					id: "modulus",
					value: 6.89e10,
					label: "Young's Modulus",
					category: "material",
					format: formatParamter
				}),
				density: new Parameter({
					id: "density",
					value: 2700,
					label: "Density",
					category: "material",
					format: formatParamter
				}),
				resolution: new Parameter({
					id: "resolution",
					value: 50,
					label: "Resolution",
					category: "simulation",
					format: formatParamter
				}),
				timestep: new Parameter({
					id: "timestep",
					value: 1e-5,
					label: "Δt",
					category: "simulation",
					format: formatParamter
				}),
				f: new Parameter({
					id: "f",
					value: "0",
					label: "f(x)=",
					category: "boundary",
					format: formatFunction
				}),
				g: new Parameter({
					id: "g",
					value: "0",
					label: "g(x)=",
					category: "boundary",
					format: formatFunction
				})
			}
		};
		this.canvas = React.createRef<HTMLCanvasElement>();
		this.parameterChangeHandler = this.parameterChangeHandler.bind(this);
		this.parameterSubmitHandler = this.parameterSubmitHandler.bind(this);
		this.renderer = {} as Renderer;
	}

	componentDidMount() {
		this.canvas.current &&
			(this.renderer = new Renderer(
				this.canvas.current,
				this.state.params,
				{
					running: this.state.running,
				}
			));
		Object.assign(window, {
			r: this.renderer
		});
	}
	parameterChangeHandler(
		id,
		value,
		submit: boolean = false,
		expression: string = ""
	) {
		const { params } = this.state;
		params[id].value = value;
		params[id].expression = expression;
		this.setState({ params }, function() {
			this.renderer.updateParameter(id, value, submit, expression);
		});
	}
	parameterSubmitHandler(e: React.FormEvent) {
		const elt = e.currentTarget.firstElementChild;
		if (elt) {
			const val = (elt as HTMLInputElement).value.trim();
			let res = val;
			let expr = val;
			let fn;
			if (elt.id === "f" || elt.id === "g") {
				let success = false;
				try {
					success = true;
					const node = parse(expr);
					const k = node.compile();
					fn = x => k.evaluate({ x });
					console.log(node);
				}
				catch (err) {
					success = false;
					console.log(err.toString());
				}
				if (success) {
					this.renderer.updateFG(elt.id,fn);
				}
			}
			else if (res[0] === "=") {
				let success = false;
				try {
					success = true;
					res = evaluate(val.slice(1));
				} catch (err) {
					console.log(err.toString());
				}
				if (success) {
					this.parameterChangeHandler(
						elt.id,
						res.toString(),
						true,
						expr
					);
				}
			} else {
				this.parameterChangeHandler(elt.id, res.toString(), true);
			}
		}
		e.preventDefault();
	}
	onConditionChange(id: string, value: string) {
		console.log(id, value);
	}
	run() {
		if (this.renderer) {
			this.renderer.running = !this.renderer.running;
		}
	}
	render() {
		return (
			<div>
				<SplitterLayout
					secondaryMinSize={250}
					primaryMinSize={250}
					secondaryInitialSize={250}
					primaryIndex={1}>
					<SplitterLayout
						vertical={true}
						primaryMinSize={10}
						secondaryMinSize={10}
						percentage={true}>
						<PanelContainer>
							<style>{ParameterPanelStyle}</style>

							<ParameterPanel
								onParameterSubmit={this.parameterSubmitHandler}
								parameters={this.state.params}
								onParameterChange={this.parameterChangeHandler}
								parameterGroups={this.state.paramGroups}
							/>
						</PanelContainer>
						<PanelContainer>
							<PlayButton
								playing={this.state.running}
								onClick={(e: React.MouseEvent) => {
									const r = !this.state.running;
									this.setState({ running: r }, this.run);
								}}
							/>
							<button onClick={(e: React.MouseEvent) => { this.renderer.beam.resetTime(); }}>
								Reset Time
							</button>
						</PanelContainer>
					</SplitterLayout>
					<div className="webgl-canvas">
						<div className="float-controls">
						</div>
						<canvas ref={this.canvas} />
					</div>
				</SplitterLayout>
			</div>
		);
	}
}

ReactDOM.render(<App />, document.getElementById("root"));
