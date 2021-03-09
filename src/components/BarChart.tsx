import React, { useEffect, useRef } from 'react'
import { select } from 'd3'
import { useResult } from '../store/result-store';

export const BarChart = ({ uuid }) => {
  const result = useResult(state=>state.results[uuid]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const canvasHeight = 400
    const canvasWidth = 600
    const scale = 20
    // const x = 
    const svgCanvas = select(ref.current!)
        .append("svg")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)
        .style("border", "1px solid black")
    svgCanvas.selectAll("rect")
        .data(result.data).enter()
            .append("rect")
            .attr("width", 40)
            .attr("height", (datapoint) => datapoint.y * scale)
            .attr("fill", "orange")
            .attr("x", (datapoint) => datapoint.x)
            .attr("y", (datapoint) => canvasHeight - datapoint.y * scale)
  }, [uuid]);
  return (
    <div ref={ref}></div>
  )
}

export default BarChart