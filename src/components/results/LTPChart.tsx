import React, { useEffect, useMemo, useRef } from 'react'
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
import { pickProps } from '../../common/helpers';
// accessors
const getTime = (d) => d.time;
const getPressure = (d) => d.pressure[0];

export type LTPChartProps = {
  uuid: string;
  width?: number;
  height?: number;
  events?: boolean;
};

const orderColors = [
  "#ffa600",
  "#ff7c43",
  "#f95d6a",
  "#d45087",
  "#a05195",
  "#665191",
  "#2f4b7c",
  "#003f5c",
]

const range = (start: number, stop: number) => [...Array(stop-start)].map((x,i) => start + i)



const ordinalColorScale = scaleOrdinal(
  range(1, orderColors.length),
  orderColors
);

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



const Chart = ({ uuid, width = 400, height = 200, events = false }: LTPChartProps) => {
    const {info, data} = useResult(state=>pickProps(["info", "data"], state.results[uuid] as Result<ResultKind.LinearTimeProgression>));
    const scalePadding = 60;
    const scaleWidth = width-scalePadding;
    // scales, memoize for performance
    const xScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [0, scaleWidth],
          domain: [0, Math.max(...data.map(getTime))],
        }),
      [width],
    );
    
    const scaleHeight = height - scalePadding;
    const yScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [scaleHeight, 0],
          domain: [0, Math.max(...data.map(getPressure))],
        }),
      [height],
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
          const barX = xScale(time);
          const barY = scaleHeight - barHeight;
          return (
            <Bar
              key={`bar-${d.arrival}`}
              x={barX}
              y={barY}
              width={4}
              height={barHeight}
              fill={ordinalColorScale(d.order)}
              onMouseOver={()=>{

              }}
              onClick={() => {
                if (events) alert(`clicked: ${JSON.stringify(Object.values(d))}`);
              }}
            />
          );
        })}
      </Group>
      <AxisBottom scale={xScale} top={scaleHeight} left={scalePadding} label="Time (s)" />
      <AxisLeft scale={yScale} left={scalePadding} label="SPL (dB)"/>
    </svg>
    )

}


export const LTPChart = ({ uuid, width = 400, height = 300, events = false }: LTPChartProps) => {
  const name = useResult(state=>state.results[uuid].name);
  return width < 10 ? null : (
    <VerticalContainer>
      <Title>{name}</Title>
    <HorizontalContainer>
      <GraphContainer>
        <ParentSize debounceTime={10}>
          {({ width })=><Chart {...{ width, height, uuid, events }} />}
        </ParentSize>
      </GraphContainer>
    <LegendOrdinal scale={ordinalColorScale} labelFormat={label => `Order ${label}`}>
          {labels => (
            <LegendContainer>
              {labels.map((label, i) => (
                <LegendItem
                  key={`legend-quantile-${i}`}
                  margin="0 5px"
                  onClick={() => {
                    if (events) alert(`clicked: ${JSON.stringify(label)}`);
                  }}
                >
                  <svg width={legendGlyphSize} height={legendGlyphSize}>
                    <rect fill={label.value} width={legendGlyphSize} height={legendGlyphSize} />
                  </svg>
                  <LegendLabel align="left" margin="0 0 0 4px">
                    {label.text}
                  </LegendLabel>
                </LegendItem>
              ))}
            </LegendContainer>
          )}
        </LegendOrdinal>
      </HorizontalContainer>
    </VerticalContainer>
  );
}

export default LTPChart