import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Result, useResult, ResultKind, ResultTypes } from '../../store/result-store';

import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { GradientTealBlue } from '@visx/gradient';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Axis, Orientation, SharedAxisProps, AxisScale, AxisBottom, AxisLeft } from '@visx/axis';
import { Zoom } from '@visx/zoom';
import { Grid } from '@visx/grid';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import styled from 'styled-components';
import {
  Legend,
  LegendLinear,
  LegendQuantile,
  LegendOrdinal,
  LegendSize,
  LegendThreshold,
  LegendItem,
  LegendLabel,
} from '@visx/legend';
import { scaleOrdinal } from 'd3-scale';
import { pickProps, unique } from '../../common/helpers';
import { emit, on } from '../../messenger';
import chroma from 'chroma-js';
import { ImageSourceSolver } from '../../compute/raytracer/image-source';
import { useSolver } from '../../store';
import PropertyRowCheckbox from "../parameter-config/property-row/PropertyRowCheckbox";
import { createPropertyInputs } from '../parameter-config/SolverComponents';
// accessors
const getSabine = (d) => d.sabine;
const getEyring = (d) => d.eyring;
const getFreq = (d) => d.frequency;

export type RT60ChartProps = {
  uuid: string;
  width?: number;
  height?: number;
  events?: boolean;
};

//const range = (start: number, stop: number) => [...Array(stop-start)].map((x,i) => start + i)
//const colorScale = chroma.scale(['#ff8a0b', '#000080']).mode('lch');
//const getOrderColors = (n: number) => colorScale.colors(n);



const legendGlyphSize = 12;



const VerticalContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  display: flex; 
  justify-content: center;
`;

const HorizontalContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;

const LegendContainer = styled.div`
 display: flex;
 flex-direction: column;
 align-items: center;
 padding: 0px 16px;
`;

const GraphContainer = styled.div`
  display: flex;
  flex: 8;
  width: 80%;
`;

const useUpdate = () => {
  const [updateCount, setUpdateCount] = useState<number>(0);
  return [updateCount, () => setUpdateCount(updateCount + 1)] as  [number, () => void];
}

const Chart = ({ uuid, width = 400, height = 200, events = false }: RT60ChartProps) => {
    const {info, data: _data, from} = useResult(state=>pickProps(["info", "data", "from"], state.results[uuid] as Result<ResultKind.StatisticalRT60>));
    
    const [count, update] = useUpdate();
    const [data, setData] = useState(_data);


    useEffect(() => on("UPDATE_RESULT", (e) => {
      if(e.uuid === uuid){
        //@ts-ignore
        setData(e.result.data);
        // update();
      }
    }), [uuid])

    const scalePadding = 60;
    const scaleWidth = width-scalePadding;
    // scales, memoize for performance
    const xScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [0, scaleWidth],
          domain: [0, Math.max(...data.map(getFreq))],
        }),
      [width, data],
    );
    
    const scaleHeight = height - scalePadding;
    const yScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [scaleHeight, 0],
          domain: [0, Math.max(...data.map(getEyring))],
        }),
      [height, data],
    );

    return (
      <svg width={width} height={height}>
      {/* <rect width={width} height={height} fill={"#fff"} rx={14} /> */}
      <Grid
        xScale={xScale}
        yScale={yScale}
        width={scaleWidth}
        height={scaleHeight}
        left={scalePadding}
        // numTicksRows={numTicksForHeight(height)}
        // numTicksColumns={numTicksForWidth(width)}
      />
      <Group>
        {data.map(d => {
          const freq = getFreq(d);
          const barHeight = scaleHeight - yScale(getSabine(d));
          const barX = xScale(freq) + scalePadding;
          const barY = scaleHeight - barHeight;
          return (
            <Bar
              key={`bar-${d.frequency}`}
              x={barX}
              y={barY}
              width={4}
              height={barHeight}
              className="test-bar-class"
              onMouseOver={()=>{
                
              }}  
              onClick={() => {
                console.log(d.frequency); 
              }}
            />
          );
        })}
      </Group>
      <AxisBottom {...{scale: xScale, top: scaleHeight, left: scalePadding, label: "Octave Band (Hz)" }} />
      <AxisLeft {...{scale: yScale, left: scalePadding, label: "RT60 (s)" }} />
    </svg>
    )

}


export const RT60Chart = ({ uuid, width = 400, height = 300, events = false }: RT60ChartProps) => {
  const {name, info, from} = useResult(state=>pickProps(["name", "info", "from"], state.results[uuid] as Result<ResultKind.StatisticalRT60>));

  useEffect(() => on("UPDATE_RESULT", (e)=>{
    if(e.uuid === uuid){
      //@ts-ignore
      //setMaxOrder(e.result.info.maxOrder);
    }
  }), [uuid]);  

  return width < 10 ? null : (
    <VerticalContainer>
      <Title>{name}</Title>
    <HorizontalContainer>
      <GraphContainer>
        <ParentSize debounceTime={10}>
          {({ width })=><Chart {...{ width, height, uuid, events }} />}
        </ParentSize>
      </GraphContainer>
      {/* <LegendOrdinal labelFormat={label => `Order ${label}`}>
          {labels => (
            <LegendContainer>
              {labels.map((label, i) => (
                <LegendItem
                  key={`legend-quantile-${i}`}
                  margin="0 5px"
                  onClick={() => {
                    //if (events) alert(`clicked: ${JSON.stringify(label)}`);
                  }}
                >
                  <svg width={legendGlyphSize} height={legendGlyphSize}>
                    <rect fill={label.value} width={legendGlyphSize} height={legendGlyphSize} />
                  </svg>
                  <LegendLabel align="left" margin="0 0 0 4px">
                    {label.text}
                  </LegendLabel>
                  <PropertyRowCheckbox
                    value={plotOrders.includes(label.datum)}
                    onChange={(e) =>
                      {
                        const newPlotOrders = e.value ? unique([...plotOrders, label.datum]) : plotOrders.reduce((acc, curr) => curr === label.datum ? acc : [...acc, curr], []);
                        emit("IMAGESOURCE_SET_PROPERTY", { uuid: from, property: "plotOrders", value: newPlotOrders })
                        if(this != undefined){
                          //@ts-ignore
                          console.log(this.refs.complete.state.checked)
                        }
                      }
                    }
                  />
                </LegendItem>
              ))}
            </LegendContainer>
          )}
        </LegendOrdinal> */}
      </HorizontalContainer>
    </VerticalContainer>
  );
}

export default RT60Chart