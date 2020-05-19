import React from "react";
import "./Label.css";

const joinClasses = (args: string[]) => args.join(" ");

export interface LabelProps {
  children?: React.ReactNode;
  tooltipText?: string;
  hasTooltip?: boolean;
  tooltipWidth?: number;
}

export default function Label(props: LabelProps) {
  const tooltipClassName = props.hasTooltip ? "tooltip" : "";
  const labelClassName = "label";
  const containerProps = {
    className: joinClasses([labelClassName, tooltipClassName])
  };
  return (
    <div {...containerProps}>
      {props.children}
      <span
        className="tooltiptext"
        style={
          {
            // width: props.tooltipWidth || 120
          }
        }
      >
        {props.tooltipText}
      </span>
    </div>
  );
}
