import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { BarGroup } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
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
  eyring: 0.2,
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
const defaultMargin = { top: 0, right: 0, bottom: 40, left: 0 };

const parseDate = timeParse('%Y-%m-%d');
const format = timeFormat('%b %d');
const formatDate = (date: string) => format(parseDate(date) as Date);

// accessors
const getFreq = (d: RTData) => d.freq;
const getSabine = (d: RTData) => d.sabine; 
const getEyring = (d: RTData) => d.eyring; 

// scales
const freqScale = scaleBand<number>({
  domain: data.map(getFreq),
  padding: 0.1,
});
const rtScale = scaleLinear<number>({
  domain: [0, 2],
  range: [300, 0]
});

export const RT60Chart = ({
  uuid, 
  width = 500,
  height = 300,
  events = false,
}: BarGroupProps) => {

  const scalePadding = 60;
    const scaleWidth = width-scalePadding;
    // scales, memoize for performance
    const xScale = useMemo(
      () =>
        scaleBand<number>({
          range: [0, scaleWidth],
          domain: data.map(getFreq),
          padding: 2
        }),
      [width, data],
    );

    const rtTypeScale = scaleBand<string>({
      domain: keys,
      padding: 2,
    });

    rtTypeScale.rangeRound([0, xScale.bandwidth()]);

    const scaleHeight = height - scalePadding;
    const yScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [scaleHeight, 0],
          domain: [0, Math.max(...data.map(getSabine))*2],
        }),
      [height, data],
    );

    const colorScale = scaleOrdinal<string, string>({
      domain: keys,
      range: [black, red],
   });

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <Grid
        xScale={xScale}
        yScale={yScale}
        width={scaleWidth}
        height={scaleHeight}
        left={scalePadding}
      />
      <Group>
        <BarGroup
          data={data}
          keys={keys}
          height={scaleHeight}
          x0={getFreq}
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
        top={scaleHeight}
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

export default RT60Chart
