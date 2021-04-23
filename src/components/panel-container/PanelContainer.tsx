import React from "react";
// needed to import in src/css/index.ts
// import "./PanelContainer.css"
export interface PanelContainerProps {
  children?: any;
  className?: string;
  margin?: boolean;
}

export default function PanelContainer(props: PanelContainerProps) {
  const className = props.className || "panel full";
  return (
    <div className={className}>
      {props.children}
    </div>
  );
}
