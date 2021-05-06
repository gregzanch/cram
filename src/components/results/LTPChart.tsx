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
import PropertyRowLabel from '../parameter-config/property-row/PropertyRowLabel';
import PropertyRow from '../parameter-config/property-row/PropertyRow';
// accessors
const getTime = (d) => d.time;
const getPressure = (d) => d.pressure[0];
const getOrder = (d) => d.order;

export type LTPChartProps = {
  uuid: string;
  width?: number;
  height?: number;
  events?: boolean;
};



const range = (start: number, stop: number) => [...Array(stop-start)].map((x,i) => start + i)
const colorScale = chroma.scale(['#ff8a0b', '#000080']).mode('lch');
const getOrderColors = (n: number) => colorScale.colors(n);



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

const FrequencyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 16px;
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

const Chart = ({ uuid, width = 400, height = 200, events = false }: LTPChartProps) => {
    const {info, data: _data, from} = useResult(state=>pickProps(["info", "data", "from"], state.results[uuid] as Result<ResultKind.LevelTimeProgression>));
    
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
          domain: [0, Math.max(...data.map(getTime))],
        }),
      [width, data],
    );
    
    const scaleHeight = height - scalePadding;
    const yScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [scaleHeight, 0],
          domain: [Math.min(...data.map(getPressure))*0.75, Math.max(...data.map(getPressure))],
        }),
      [height, data],
    );

    const ordinalColorScale = useMemo(
      () => scaleOrdinal(
      range(0, info.maxOrder+1),
      getOrderColors(info.maxOrder+1)
    ),
      [info.maxOrder]
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
          const time = getTime(d);
          const barHeight = scaleHeight - yScale(getPressure(d));
          const barX = xScale(time) + scalePadding;
          const barY = scaleHeight - barHeight;
          return (
            <Bar
              key={`bar-${d.arrival}`}
              x={barX}
              y={barY}
              width={3}
              height={barHeight}
              fill={ordinalColorScale(d.order)}
              className="test-bar-class"
              // stroke={"#ffff00"}
              // strokeWidth={1}
              onMouseOver={()=>{
                
              }}  
              onClick={() => {
                let imagesourcesolver = useSolver.getState().solvers[from] as ImageSourceSolver;
                if (events) imagesourcesolver.toggleRayPathHighlight(d.uuid);
              }}
            />
          );
        })}
      </Group>
      <AxisBottom {...{scale: xScale, top: scaleHeight, left: scalePadding, label: "Time (s)" }} />
      <AxisLeft {...{scale: yScale, left: scalePadding, label: "Sound Pressure Level (dB re: 20uPa)" }} />
    </svg>
    )

}


export const LTPChart = ({ uuid, width = 400, height = 300, events = false }: LTPChartProps) => {

  console.log(uuid);
  
  const {name, info, from} = useResult(state=>pickProps(["name", "info", "from"], state.results[uuid] as Result<ResultKind.LevelTimeProgression>));
  const initialPlotOrders = useSolver(state=>(state.solvers[from] as ImageSourceSolver).plotOrders);
  const frequencies = useSolver(state=>(state.solvers[from] as ImageSourceSolver).frequencies);

  const [plotOrders, setPlotOrders] = useState(initialPlotOrders);
  const [order, setMaxOrder] = useState(info.maxOrder);

  useEffect(() => on("UPDATE_RESULT", (e)=>{
    if(e.uuid === uuid){
      //@ts-ignore
      setMaxOrder(e.result.info.maxOrder);
    }
  }), [uuid]);  

  useEffect(() => on("IMAGESOURCE_SET_PROPERTY", (e)=>{
    if(e.uuid === from && e.property === "plotOrders"){
        setPlotOrders(e.value);
    }
  }), [uuid]);  

  const ordinalColorScale = useMemo(
    () => scaleOrdinal(
    range(0, order+1),
    getOrderColors(order+1)
  ),
    [order]
  );


  // const {from} = useResult(state=>pickProps(["from"], state.results[uuid] as Result<ResultKind.LevelTimeProgression>));
  // let imagesourcesolver = useSolver.getState().solvers[from] as ImageSourceSolver;

  // const { PropertyTextInput, PropertyNumberInput, PropertyCheckboxInput } = createPropertyInputs<ImageSourceSolver>(
    // "IMAGESOURCE_SET_PROPERTY"
  // );

  return width < 10 ? null : (
    <VerticalContainer>
      <Title>{name}</Title>
    <HorizontalContainer>
      <GraphContainer>
        <ParentSize debounceTime={10}>
          {({ width })=><Chart {...{ width, height, uuid, events }} />}
        </ParentSize>
      </GraphContainer>
      <VerticalContainer>
        <LegendOrdinal scale={ordinalColorScale} labelFormat={label => `Order ${label}`}>
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
          </LegendOrdinal>
          <FrequencyContainer>
            <Title><b>Octave Band (Hz)</b></Title>
            <LegendContainer>
              {frequencies.map((f)=>(
                <LegendItem
                  key={`freq-control-${f}`}
                  margin="0 5px"
                  onClick={() => {
                    //if (events) alert(`clicked: ${JSON.stringify(label)}`);
                }}>
                  <PropertyRowLabel
                    label={f.toString()}
                  />
                  <PropertyRowCheckbox
                    value={(f)==(info.frequency[0])}
                    onChange = {(e) => 
                      emit("IMAGESOURCE_SET_PROPERTY", { uuid: from, property: "plotFrequency", value: f })
                    }
                  />
                </LegendItem>
              ))}
            </LegendContainer>
          </FrequencyContainer>
        </VerticalContainer>
      </HorizontalContainer>
    </VerticalContainer>
  );
}

export default LTPChart