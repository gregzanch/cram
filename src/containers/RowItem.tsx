import React from "react";

export interface RowItemProps {
  children?: any;
  style?: React.CSSProperties;
}

export default function RowItem(props: RowItemProps) {
  if (props.style) {
    return (
      <div style={{ display: "grid" }}>
        <div style={props.style}>{props.children}</div>
      </div>
    );
  } else {
    return <div style={{ display: "grid" }}>{props.children}</div>;
  }
}
