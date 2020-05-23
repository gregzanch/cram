import React from "react";
import "./PropertyRowLabel.css";
import Label from '../../../label/Label';

export interface PropertyRowLabelProps {
  label: string;
  tooltip?: string;
  hasToolTip?: boolean;
}
export default function PropertyRowLabel(props: PropertyRowLabelProps) {
  return (
    <div className="property-row-label-container">
      <Label hasTooltip={props.hasToolTip} tooltipText={props.tooltip || ""}>
        {props.label}
      </Label>
    </div>
  );
}
