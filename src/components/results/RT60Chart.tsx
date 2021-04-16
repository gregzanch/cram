import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { Group } from '@visx/group';
import { BarGroup } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { timeParse, timeFormat } from 'd3-time-format';
import { Grid, GridRows } from '@visx/grid';
import { Result, ResultKind, useResult } from '../../store/result-store';
import { pickProps } from '../../common/helpers';
import { on } from '../../messenger';
import styled from 'styled-components';
import { LegendItem, LegendOrdinal } from '@visx/legend';
import PropertyRowLabel from '../parameter-config/property-row/PropertyRowLabel';
import { BREADCRUMBS_COLLAPSED } from '@blueprintjs/core/lib/esm/common/classes';

export type BarGroupProps = {
  uuid: string; 
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  events?: boolean;
};

export interface RTData {
  frequency: number;
  sabine: number;
  eyring: number; 
  ap: number; 
}

const testrtdata: RTData[] = [
  {
    frequency: 125,
  sabine: 0.2,
  eyring: 0.35,
  ap: 0.2,
  },
  {
    frequency: 250,
  sabine: 0.4,
  eyring: 0.55,
  ap: 0.2,
  },
  {
    frequency: 500,
  sabine: 0.2,
  eyring: 0.2,
  ap: 0.2,
  },
  {
    frequency: 1000,
  sabine: 0.3,
  eyring: 0.45,
  ap: 0.2,
  },
  {
    frequency: 2000,
  sabine: 0.2,
  eyring: 0.45,
  ap: 0.2,
  },
  {
    frequency: 4000,
  sabine: 0.2,
  eyring: 0.25,
  ap: 0.2,
}];

//type CityName = 'New York' | 'San Francisco' | 'Austin';

const blue = '#48beff';
const green = '#43c593';
const darkgreen = '#14453d';
const black = '#000000';

export const background = '#612efb';

type RtType = 'Sabine' | 'Eyring' | 'AP'; 

const defaultMargin = { top: 0, right: 0, bottom: 40, left: 0 };

const parseDate = timeParse('%Y-%m-%d');
const format = timeFormat('%b %d');
const formatDate = (date: string) => format(parseDate(date) as Date);

// accessors
const getFreq = (d: RTData) => d.frequency;
const getFreqAsString = (d: RTData) => (d.frequency).toString()
const getSabine = (d: RTData) => d.sabine; 
const getEyring = (d: RTData) => d.eyring; 

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

export const Chart = ({
  uuid, 
  width = 500,
  height = 300,
  events = false,
}: BarGroupProps) => {

  const {info, data: _data, from} = useResult(state=>pickProps(["info", "data", "from"], state.results[uuid] as Result<ResultKind.StatisticalRT60>));
  const [count, update] = useUpdate();
  const [data, setData] = useState(_data);
  const keys = Object.keys(data[0]).filter(d => d !== 'frequency') as RtType[];
  
  // scales
  const xScale = scaleBand<string>({
    domain: data.map(getFreqAsString),
    padding: 0.2
  });

  const rtTypeScale = scaleBand<string>({
    domain: keys,
    padding: 0.1,
  });

  const yScale = scaleLinear<number>({
    domain: [0, Math.round(Math.max(...data.map(d => Math.max(...keys.map(key => Number(d[key])))))*1.5*10)/10],
  });

  const colorScale = scaleOrdinal<string, string>({
    domain: keys,
    range: [blue, green, darkgreen],
  });

  useEffect(() => on("UPDATE_RESULT", (e) => {
    if(e.uuid === uuid){
      //@ts-ignore
      setData(e.result.data);
    }
  }), [uuid])

  const scalePadding = 60;
  const topPadding = 30; 
  const scaleWidth = width-scalePadding;
  const scaleHeight = height-topPadding;

  xScale.rangeRound([0, scaleWidth]);
  rtTypeScale.rangeRound([0, xScale.bandwidth()]);
  yScale.range([scaleHeight, 0]);

  console.log(data);

  return width < 10 ? null : (
    <svg width={width} height={height}>
    <GridRows
        scale={yScale}
        width={scaleWidth}
        height={scaleHeight}
        left={scalePadding}
      />
      <Group left={scalePadding}>
        <BarGroup
          data={data}
          keys={keys}
          height={scaleHeight}
          x0={getFreqAsString}
          x0Scale={xScale}
          x1Scale={rtTypeScale}
          yScale={yScale}
          color={colorScale}
        >
          {barGroups =>
            barGroups.map(barGroup => (
              <Group key={`bar-group-${barGroup.index}-${barGroup.x0}`} left={barGroup.x0}>
                {barGroup.bars.map(bar => (
                  <rect
                    key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                    x={bar.x}
                    y={bar.y}
                    width={15}
                    height={bar.height}
                    fill={bar.color}
                    rx={4}
                    onClick={() => {
                      if (!events) return;
                      const { key, value } = bar;
                      alert(JSON.stringify({ key, value }));
                    }}
                  />
                ))}
              </Group>
            ))
          }
        </BarGroup>
      </Group>
      <AxisBottom
        top={scaleHeight}
        left={scalePadding}
        scale={xScale}
        stroke={black}
        tickStroke={black}
        label={"Octave Band (Hz)"}
        tickLabelProps={() => ({
          fill: black,
          fontSize: 11,
          textAnchor: 'middle',
        })}
      />
      <AxisLeft 
        scale={yScale}
        stroke={black}
        left={scalePadding}
        tickStroke={black}
        label={"Reverberation Time (s)"}
        tickLabelProps={() => ({
          fill: black,
          fontSize: 11,
          textAnchor: "end",
      })}
      />
    </svg>
  );
}

export const RT60Chart = ({
  uuid, 
  width = 500,
  height = 300,
  events = false,
}: BarGroupProps) => {
  const {info, data, from} = useResult(state=>pickProps(["info", "data", "from"], state.results[uuid] as Result<ResultKind.StatisticalRT60>))
  const keys = Object.keys(data[0]).filter(d => d !== 'frequency') as RtType[];

  const rtTypeColorScale = scaleOrdinal<RtType, string>({
    domain: keys, 
    range: [blue, green, darkgreen],
  });

  function legendLabel(label: string): string {
    switch(label){
      case "sabine":
        return "Sabine"
        break;
      case "eyring":
        return "Norris-Eyring"
        break;
      case "ap":
        return "Arau-Puchades"
        break;
      default: 
        return "error"
    }
  }

  return width < 10 ? null : (
    <VerticalContainer>
      <Title>{'Statistical RT60 Results'}</Title>
      <HorizontalContainer>
        <GraphContainer>
          <Chart {...{ width, height, uuid, events }}></Chart>
        </GraphContainer>
        <VerticalContainer>
          <LegendOrdinal scale={rtTypeColorScale} labelFormat={label => legendLabel(label)}/>
        </VerticalContainer>
      </HorizontalContainer>
    </VerticalContainer>
  );
}; 

export default RT60Chart
