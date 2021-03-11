import { emit } from "../../../messenger";;
import React from "react";
import PropertyRow from "./PropertyRow";
import PropertyRowButton from "./PropertyRowButton";
import PropertyRowLabel from "./PropertyRowLabel";

export const PropertyButton = <T extends keyof EventTypes>({
  args,
  event,
  label,
  tooltip
}: {
  args: EventTypes[T];
  event: T;
  label: string;
  tooltip: string;
}) => {
  return (
    <PropertyRow>
      <PropertyRowLabel label={label} hasToolTip tooltip={tooltip} />
      <PropertyRowButton onClick={(e) => emit(event, args)} label={label} />
    </PropertyRow>
  );
};



export default PropertyButton;