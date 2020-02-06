import React from "react";

export interface GridRowSeperatorProps {
  label?: React.ReactNode | React.ReactNode[];
  children?: React.ReactNode | React.ReactNode[];
  span?: number;
  color?: string;
  marginTop?: string;
  marginBottom?: string;
}

export default function GridRowSeperator(props: GridRowSeperatorProps) {
  return (
    <div style={{
      display: "grid",
      gridColumnStart: "1",
      gridColumnEnd: "3"
    }}>
      <div style={{
        borderBottomStyle: "solid",
        borderBottomWidth: "1px",
        borderBottomColor: props.color || "rgba(0,0,0,0.2)",
        width: "100%",
        marginTop: props.marginTop || "1em",
        marginBottom: props.marginBottom || "1em"
      }}/>
    </div>
  )
}
