import React from 'react';
import Plot from 'react-plotly.js';
export interface ChartTabProps{
  data?: {
    label: string;
    x: number[];
    y: number[];
  }[];
}

const colors = [
  "#66c2a5",
  "#fc8d62",
  "#8da0cb",
  "#e78ac3",
  "#a6d854",
  "#ffd92f",
  "#e5c494",
  "#b3b3b3"
];
export function ChartTab(props: ChartTabProps) {
  if (props.data) {
    const data = props.data.map((d,i) => {
      return {
        x: d.x,
        y: d.y,
        type: 'scatter',
        title: d.label,
        mode: 'lines',
        marker: { color:  colors[i%colors.length]},
      };
    });
    return (
      <div className="chart-tab">
        <Plot
          data={data}
          layout={{ title: "IR" }}
          config={{ responsive: true }}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
        
    }
  else {
    return (<div></div>)
  }
}