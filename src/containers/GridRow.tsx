import React from "react";

export interface GridRowProps {
  children: any;
  style?: React.CSSProperties;
}
export default function GridRow(props: GridRowProps) {
  return (
    <div
      style={Object.assign(
        {
          display: "grid",
          gridTemplateRows: "auto",
          gridTemplateColumns: "auto",
          width: "100%",
          marginTop: ".25em",
          marginBottom: ".25em"
        },
        props.style || {}
      )}
    >
      {props.children}
    </div>
  );
}
