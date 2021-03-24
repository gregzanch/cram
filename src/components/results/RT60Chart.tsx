import React from 'react';
import { Group } from '@visx/group';
import { BarGroup } from '@visx/shape';
import { AxisBottom } from '@visx/axis';
import cityTemperature, { CityTemperature } from '@visx/mock-data/lib/mocks/cityTemperature';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { timeParse, timeFormat } from 'd3-time-format';
import { Grid } from '@visx/grid';

export type BarGroupProps = {
  uuid: string; 
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  events?: boolean;
};

export interface RTData {
  freq: number;
  sabine: number;
  eyring: number; 
}

const testrtdata: RTData[] = [
  {
  freq: 125,
  sabine: 0.2,
  eyring: 0.35,
  },
  {
  freq: 250,
  sabine: 0.4,
  eyring: 0.55,
  },
  {
  freq: 500,
  sabine: 0.2,
  eyring: 1.0,
  },
  {
  freq: 1000,
  sabine: 0.3,
  eyring: 0.45,
  },
  {
  freq: 2000,
  sabine: 0.2,
  eyring: 0.45,
  },
  {
  freq: 4000,
  sabine: 0.2,
  eyring: 0.25,
}];

//type CityName = 'New York' | 'San Francisco' | 'Austin';

const black = '#000000';
const red = '#ff0000';
const purple = '#000000';
export const background = '#612efb';

const data = testrtdata; 
const keys = Object.keys(data[0]).filter(d => d !== 'freq');
const defaultMargin = { top: 40, right: 0, bottom: 40, left: 0 };

const parseDate = timeParse('%Y-%m-%d');
const format = timeFormat('%b %d');
const formatDate = (date: string) => format(parseDate(date) as Date);

// accessors
const getFreq = (d: RTData) => d.freq;

// scales
const freqScale = scaleBand<number>({
  domain: data.map(getFreq),
  padding: 0.2,
});
 const rtTypeScale = scaleBand<string>({
   domain: keys,
   padding: 0.01,
});
const rtScale = scaleLinear<number>({
  domain: [0, 1],
});
const colorScale = scaleOrdinal<string, string>({
   domain: keys,
   range: [black, red],
});

export const RT60Chart = ({
  uuid, 
  width = 400,
  height = 300,
  events = false,
  margin = defaultMargin,
}: BarGroupProps) => {
  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // update scale output dimensions
  freqScale.rangeRound([0, xMax]);
  rtTypeScale.rangeRound([0, freqScale.bandwidth()]);
  rtScale.range([yMax, 0]);

  console.log(data); 

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <Grid
        xScale={freqScale}
        yScale={rtScale}
        width={width}
        height={height}
      />
      <Group top={margin.top} left={margin.left}>
        <BarGroup
          data={data}
          keys={keys}
          height={yMax}
          x0={getFreq}
          x0Scale={freqScale}
          x1Scale={rtTypeScale}
          yScale={rtScale}
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
                    width={10}
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
        top={yMax + margin.top}
        scale={freqScale}
        stroke={black}
        tickStroke={black}
        hideAxisLine
        tickLabelProps={() => ({
          fill: black,
          fontSize: 11,
          textAnchor: 'middle',
        })}
      />
    </svg>
  );
}

export default RT60Chart
