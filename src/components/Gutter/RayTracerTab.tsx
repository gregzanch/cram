import React from "react";
import "./RayTracerTab.css";
import RayTracer from "../../compute/raytracer";
import Plot from "react-plotly.js";
import { Button } from "@blueprintjs/core";
import ObjectProperties from "../ObjectProperties";
import Messenger from "../../messenger";
import { ObjectPropertyInputEvent } from "../NumberInput";

export interface RayTracerTabProps {
  solver: RayTracer;
  messenger: Messenger;
}

export interface RayTracerTabState {

}
const colors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"];
export default class RayTracerTab extends React.Component<RayTracerTabProps, RayTracerTabState> {
  constructor(props: RayTracerTabProps) {
    super(props);
    this.state = {
      
    };
    this.handleObjectPropertyChange = this.handleObjectPropertyChange.bind(this);
    this.handleObjectPropertyValueChangeAsNumber = this.handleObjectPropertyValueChangeAsNumber.bind(this);
    this.handleObjectPropertyValueChangeAsString = this.handleObjectPropertyValueChangeAsString.bind(this);
    this.handleObjectPropertyButtonClick = this.handleObjectPropertyButtonClick.bind(this);
  }

  handleObjectPropertyChange(e: ObjectPropertyInputEvent) {
		const prop = e.name;
		switch (e.type) {
			case "checkbox":
				this.props.solver[prop] = e.value;
				break;
			case "text":
				this.props.solver[prop] = e.value;
				break;
			case "number":
				this.props.solver[prop] = Number(e.value);
				break;
      default:
				  this.props.solver[prop] = e.value;
				break;
    }
    this.forceUpdate();
	}
  handleObjectPropertyValueChangeAsNumber(
		id: string,
		prop: string,
		valueAsNumber: number
	) {
    this.props.solver[prop] = valueAsNumber;
    this.forceUpdate();
	}
	handleObjectPropertyValueChangeAsString(
		id: string,
		prop: string,
		valueAsString: string
	) {
    this.props.solver[prop] = valueAsString;
    this.forceUpdate();
  }
  handleObjectPropertyButtonClick(e: React.MouseEvent<HTMLInputElement, MouseEvent>) {
    switch (e.currentTarget.name) {
      case "ray-tracer-play":
        this.props.messenger.postMessage("RAYTRACER_SHOULD_PLAY", this.props.solver.uuid);
        break;
      case "ray-tracer-pause":
        this.props.messenger.postMessage("RAYTRACER_SHOULD_PAUSE", this.props.solver.uuid);
        break;
      case "ray-tracer-clear":
        this.props.messenger.postMessage("RAYTRACER_SHOULD_CLEAR", this.props.solver.uuid);
        break;
      default: break;
    }
    this.forceUpdate();
	}
  render() {
    return (
      <div className="raytracer_tab">
        <ObjectProperties
          messenger={this.props.messenger}
          object={this.props.solver}
          onPropertyChange={this.handleObjectPropertyChange}
          onPropertyValueChangeAsNumber={this.handleObjectPropertyValueChangeAsNumber}
          onPropertyValueChangeAsString={this.handleObjectPropertyValueChangeAsString}
          onButtonClick={this.handleObjectPropertyButtonClick}
        />
      </div>
    );
  }
  
  // render() {
  //   const receiverIntersectionData = this.getAllReceiverIntersectionData();
  //   const chartdata = this.props.solver.chartdata.map((d, i) => {
  //     return {
  //       x: d.x,
  //       y: d.y,
  //       type: "scatter",
  //       name: d.label,
  //       mode: "lines",
  //       marker: { color: colors[i % colors.length] }
  //     };
  //   });
  //   return (
  //     <div className="raytracer_tab">
  //       <Button onClick={e => this.forceUpdate()} text="refresh" icon="refresh" minimal />
  //       <div className="raytracer_tab-plots-container">
  //         <div className="raytracer_tab-intersection_plot-container">
  //           {receiverIntersectionData && receiverIntersectionData.length > 0 && (
  //             <Plot
  //               data={receiverIntersectionData}
  //               layout={{
  //                 margin: {
  //                   l: 5,
  //                   r: 5,
  //                   b: 5,
  //                   t: 10
  //                 },
  //                 scene: {
  //                   aspectratio: {
  //                     x: 2,
  //                     y: 2,
  //                     z: 2
  //                   },
  //                   camera: {
  //                     center: {
  //                       x: 0,
  //                       y: 0,
  //                       z: 0
  //                     },
  //                     eye: {
  //                       x: 2,
  //                       y: 2,
  //                       z: 2
  //                     },
  //                     up: {
  //                       x: 0,
  //                       y: 0,
  //                       z: 1
  //                     }
  //                   },
  //                   xaxis: {
  //                     type: "linear",
  //                     zeroline: false
  //                   },
  //                   yaxis: {
  //                     type: "linear",
  //                     zeroline: false
  //                   },
  //                   zaxis: {
  //                     type: "linear",
  //                     zeroline: false
  //                   }
  //                 }
  //               }}
  //               config={{
  //                 responsive: true
  //               }}
  //               className="raytracer_tab-intersection_plot"
  //               style={{ width: "100%", height: "300px" }}
  //             />
  //           )}
  //         </div>
  //         <div className="raytracer_tab-response_plot-container">
  //           {chartdata && chartdata.length > 0 && (
  //             <Plot
  //               data={chartdata}
  //               className="raytracer_tab-response_plot"
  //               layout={{ title: "Energy Response" }}
  //               config={{ responsive: true }}
  //               style={{ width: "100%", height: "300px" }}
  //             />
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  
}
