import React from "react";
import "./PropertyRowLabel.css";
import Label from '../../../label/Label';

export interface PropertyRowLabelProps {
  label: string;
  tooltip?: string;
}
export default function PropertyRowLabel(props: PropertyRowLabelProps) {
  return (
    <div className="property-row-label-container">
      <Label hasTooltip={typeof props.tooltip !== "undefined"} tooltipText={props.tooltip || ""}>
        {props.label}
      </Label>
    </div>
  );
}
