import React from 'react';
import "uplot/dist/uPlot.min.css";
import uPlot from 'uplot';

export interface UPlotProps {
  opts: uPlot.Options;
  data: uPlot.AlignedData;
}

export interface UPlotState{ }


export default class UPlot extends React.Component<UPlotProps, UPlotState> {
  divRef: React.RefObject<HTMLDivElement>;
  uplot!: uPlot;
  constructor(props: UPlotProps) {
    super(props);
    this.state = {};
    this.divRef = React.createRef<HTMLDivElement>();
  }
  componentDidMount() {
    this.uplot = new uPlot(this.props.opts, this.props.data, this.divRef.current!);
    this.divRef
  }
  render() {
    return <div ref={this.divRef}></div>;
  }
}