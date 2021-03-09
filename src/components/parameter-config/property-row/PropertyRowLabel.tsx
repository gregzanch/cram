import React from "react";
import styled from 'styled-components'
import Label from '../../label/Label';

const PropertyRowLabelContainer = styled.div`
  text-align: right;
  min-width: 100px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export interface PropertyRowLabelProps {
  label: string;
  tooltip?: string;
  hasToolTip?: boolean;
}
export default function PropertyRowLabel(props: PropertyRowLabelProps) {
  return (
    <PropertyRowLabelContainer>
      <Label hasTooltip={props.hasToolTip} tooltipText={props.tooltip || ""}>
        {props.label}
      </Label>
    </PropertyRowLabelContainer>
  );
}
