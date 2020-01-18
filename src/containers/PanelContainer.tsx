import React from "react";

export interface PanelContainerProps {
  children?: any;
}

export default function PanelContainer(props: PanelContainerProps) {
  return (
    <div className="panel full">
      <div className="panel-content">{props.children}</div>
    </div>
  );
}
