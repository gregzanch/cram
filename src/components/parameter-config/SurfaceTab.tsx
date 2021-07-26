import React, { useEffect, useReducer, useState } from "react";
import Surface from "../../objects/surface";
import PropertyRowFolder from "./property-row/PropertyRowFolder";
import { createPropertyInputs, useContainerProperty } from "./ContainerComponents";
import useToggle from "../hooks/use-toggle";
import { useContainer } from "../../store";
import { PropertyButton } from "./property-row/PropertyButton";
import { on } from "../../messenger";
import { ensureArray } from "../../common/helpers";
const { PropertyTextInput, PropertyNumberInput, PropertyCheckboxInput, PropertyVectorInput, PropertySelect } = createPropertyInputs<Surface>(
  "SURFACE_SET_PROPERTY"
);


const General = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="General" open={open} onOpenClose={toggle}>
      <PropertyTextInput uuid={uuid} label="Name" property="name" tooltip="Sets the name of this container" />
    </PropertyRowFolder>
  );
};

const TessellationCheckbox = ({ uuid }: { uuid: string }) => {
  const [isTessellated, _] = useContainerProperty<Surface, "isTessellated">(uuid, "isTessellated", "SURFACE_SET_PROPERTY");
  if(!isTessellated) return null;
  return (
    <PropertyCheckboxInput
      uuid={uuid}
      label="Tessellation"
      property="tessellatedMeshVisible"
      tooltip="Shows/hides the tessellation of this surface"
    /> 
  )
}

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
      <PropertyCheckboxInput
        uuid={uuid}
        label="Wireframe"
        property="wireframeVisible"
        tooltip="Shows/hides the wireframe of this surface"
      /> 

      <TessellationCheckbox uuid={uuid} />

      <PropertyCheckboxInput
        uuid={uuid}
        label="Vertex Normals"
        property="displayVertexNormals"
        tooltip="Shows/hides the vertex normals of this surface"
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

const MaterialButton = ({uuid}: {uuid: string}) => {
  const name = useContainer(state=>(state.containers[uuid] as Surface).acousticMaterial.name);
  const [, forceUpdate] = useReducer((c) => c + 1, 0) as [never, () => void]
  useEffect(()=>on("ASSIGN_MATERIAL", ({ target })=>{
    const surfaceInTarget = ensureArray(target).reduce((acc, curr) => acc || curr.uuid === uuid, false);
    if(surfaceInTarget){
      forceUpdate();
    }
  }), [uuid]);
  return (
    <PropertyButton label="Material" buttonLabel={name} event="OPEN_MATERIAL_DRAWER" args={undefined} tooltip="Opens the material search screen"/>
  )
}

const Material = ({uuid}: {uuid: string}) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Material" open={open} onOpenClose={toggle}>
      <MaterialButton uuid={uuid} />
    </PropertyRowFolder>
  )
}


const Scattering = ({uuid}: {uuid: string}) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Scattering" open={open} onOpenClose={toggle}>
      <PropertyNumberInput uuid={uuid} label="Scattering Coefficient" tooltip="Sets this surface's scattering coefficient" property="scatteringCoefficient" />
    </PropertyRowFolder>
  )
}


export const SurfaceTab = ({ uuid }: { uuid: string }) => {
  return (
    <div>
      <General uuid={uuid} />
      <Visual uuid={uuid} />
      <Transform uuid={uuid} />
      <Material uuid={uuid} />
      <Scattering uuid={uuid} />
    </div>
  );
};

export default SurfaceTab;
