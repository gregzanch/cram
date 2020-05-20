import React from "react";

export interface PanelContainerProps {
  children?: any;
  className?: string;
}

export default function PanelContainer(props: PanelContainerProps) {
  const className = props.className || "panel full";
  return (
    <div className={className}>
      <div className="panel-content">{props.children}</div>
    </div>
  );
}
