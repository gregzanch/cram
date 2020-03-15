import React from "react";
import "./RayTracerTab.css";
import RayTracer from "../../compute/raytracer";
import Plot from "react-plotly.js";
import { Button } from "@blueprintjs/core";

export interface RayTracerTabProps {
  solver: RayTracer;
}

export interface RayTracerTabState {

}
const colors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"];
export default class RayTracerTab extends React.Component<RayTracerTabProps, RayTracerTabState> {
  constructor(props: RayTracerTabProps) {
    super(props);
    this.state = {
      
    };
    this.getAllReceiverIntersectionData = this.getAllReceiverIntersectionData.bind(this);
  }
  getAllReceiverIntersectionData() {
    var trace1 = {
      mode: "markers",
      marker: {
        size: 12,
        line: {
          color: "rgba(217, 217, 217, 0.14)",
          width: 0.5
        },
        opacity: 0.8
      },
      type: "scatter3d"
    };
    return this.props.solver.receiverIDs.length > 0 && this.props.solver.receiverIDs.map(id => {
      const data = {
        id,
        x: [] as number[],
        y: [] as number[],
        z: [] as number[],
        mode: "markers",
        marker: {
          size: 4,
          line: {
            color: "rgba(0,0,0,1)",
            width: 0.5
          },
          opacity: 1
        },
        type: "scatter3d",
      }
      this.props.solver.getReceiverIntersectionPoints(id).forEach(point => {
        data.x.push(point.x);
        data.y.push(point.y);
        data.z.push(point.z);
      });
      return data
    });
  }
  
  render() {
    const receiverIntersectionData = this.getAllReceiverIntersectionData();
    const chartdata = this.props.solver.chartdata.map((d, i) => {
      return {
        x: d.x,
        y: d.y,
        type: "scatter",
        name: d.label,
        mode: "lines",
        marker: { color: colors[i % colors.length] }
      };
    });
    return (
      <div className="raytracer_tab">
        <Button onClick={e => this.forceUpdate()} text="refresh" icon="refresh" minimal />
        <div className="raytracer_tab-plots-container">
          <div className="raytracer_tab-intersection_plot-container">
            {receiverIntersectionData && receiverIntersectionData.length > 0 && (
              <Plot
                data={receiverIntersectionData}
                layout={{
                  margin: {
                    l: 5,
                    r: 5,
                    b: 5,
                    t: 10
                  },
                  scene: {
                    aspectratio: {
                      x: 2,
                      y: 2,
                      z: 2
                    },
                    camera: {
                      center: {
                        x: 0,
                        y: 0,
                        z: 0
                      },
                      eye: {
                        x: 2,
                        y: 2,
                        z: 2
                      },
                      up: {
                        x: 0,
                        y: 0,
                        z: 1
                      }
                    },
                    xaxis: {
                      type: "linear",
                      zeroline: false
                    },
                    yaxis: {
                      type: "linear",
                      zeroline: false
                    },
                    zaxis: {
                      type: "linear",
                      zeroline: false
                    }
                  }
                }}
                config={{
                  responsive: true
                }}
                className="raytracer_tab-intersection_plot"
                style={{ width: "100%", height: "300px" }}
              />
            )}
          </div>
          <div className="raytracer_tab-response_plot-container">
            {chartdata && chartdata.length > 0 && (
              <Plot
                data={chartdata}
                className="raytracer_tab-response_plot"
                layout={{ title: "Energy Response" }}
                config={{ responsive: true }}
                style={{ width: "100%", height: "300px" }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}
