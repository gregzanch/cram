import React from "react";
import Room from "../../objects/room";
import PropertyRowFolder from "./property-row/PropertyRowFolder";
import { createPropertyInputs, useContainerProperty } from "./ContainerComponents";
import useToggle from "../hooks/use-toggle";
const { PropertyTextInput, PropertyNumberInput, PropertyCheckboxInput, PropertyVectorInput, PropertySelect } = createPropertyInputs<Room>(
  "ROOM_SET_PROPERTY"
);

const General = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="General" open={open} onOpenClose={toggle}>
      <PropertyTextInput uuid={uuid} label="Name" property="name" tooltip="Sets the name of this container" />
    </PropertyRowFolder>
  );
};

const Visual = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Visual" open={open} onOpenClose={toggle}>
      <PropertyCheckboxInput
        uuid={uuid}
        label="Visible"
        property="visible"
        tooltip="Toggles the visibility of this container"
      /> 
    </PropertyRowFolder>
  );
};

const Transform = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Transform" open={open} onOpenClose={toggle}>
      <PropertyVectorInput
        uuid={uuid}
        label="Position"
        property={["x", "y", "z"]}
        tooltip="Sets the container's position" 
      />
      <PropertyVectorInput
        uuid={uuid}
        label="Scale"
        property={["scalex", "scaley", "scalez"]}
        tooltip="Sets the container's scale" 
      />
      <PropertyVectorInput
        uuid={uuid}
        label="Rotation"
        property={["rotationx", "rotationy", "rotationz"]}
        tooltip="Sets the container's rotation" 
      />
    </PropertyRowFolder>
  );
};



export const RoomTab = ({ uuid }: { uuid: string }) => {
  return (
    <div>
      <General uuid={uuid} />
      <Visual uuid={uuid} />
      <Transform uuid={uuid} />
    </div>
  );
};

export default RoomTab;
