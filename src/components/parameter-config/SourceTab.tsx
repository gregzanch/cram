import React from "react";
import Source, { DirectivityHandler, SignalSource, SignalSourceOptions } from "../../objects/source";
import Container from "../../objects/container";
import { useContainer } from "../../store";
import { filteredMapObject, pickProps } from "../../common/helpers";
import PropertyRow from "./property-row/PropertyRow";
import PropertyRowFolder from "./property-row/PropertyRowFolder";
import { createPropertyInputs, useContainerProperty } from "./ContainerComponents";
import useToggle from "../hooks/use-toggle";
import PropertyRowLabel from "./property-row/PropertyRowLabel";
import PropertyRowCheckbox from "./property-row/PropertyRowCheckbox";
import PropertyButton from "./property-row/PropertyButton";
import { CLFParser } from "../../import-handlers/CLFParser";

const { PropertyTextInput, PropertyNumberInput, PropertyCheckboxInput, PropertyVectorInput, PropertySelect } = createPropertyInputs<Source>(
  "SOURCE_SET_PROPERTY"
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


const Configuration = ({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="Configuration" open={open} onOpenClose={toggle}>
      <PropertyNumberInput
        uuid={uuid}
        label="θ Theta"
        property="theta"
        tooltip="Sets theta" 
      />
      <PropertyNumberInput
        uuid={uuid}
        label="φ Phi"
        property="phi"
        tooltip="Sets phi" 
      />
    </PropertyRowFolder>
  );
};

const FDTDConfig =({ uuid }: { uuid: string }) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="FDTD Config" open={open} onOpenClose={toggle}>
      <PropertySelect 
        uuid={uuid} 
        label="Signal Source" 
        tooltip="The source thats generating it's signal"
        property="signalSource"
        options={SignalSourceOptions}
      />
      <PropertyNumberInput uuid={uuid} label="Frequency" property="frequency" tooltip="The source's frequency" />
      <PropertyNumberInput uuid={uuid} label="Amplitude" property="amplitude" tooltip="The source's amplitude" />
      <PropertyButton label="Signal Data" tooltip="The source's signal data" event="SOURCE_CALL_METHOD" args={{ uuid, method: "saveSamples" }} />
    </PropertyRowFolder>
  )
}

const CLFConfig = ({uuid}: {uuid: string}) => {
  const [open, toggle] = useToggle(true);
  return (
    <PropertyRowFolder label="CLF Config" open={open} onOpenClose={toggle}>
      <PropertySelect 
        uuid={uuid} 
        label="Signal Source" 
        tooltip="The source thats generating it's signal"
        property="signalSource"
        options={SignalSourceOptions}
      />
      <PropertyNumberInput uuid={uuid} label="Frequency" property="frequency" tooltip="The source's frequency" />
      <PropertyNumberInput uuid={uuid} label="Amplitude" property="amplitude" tooltip="The source's amplitude" />
      <PropertyButton label="Signal Data" tooltip="The source's signal data" event="SOURCE_CALL_METHOD" args={{ uuid, method: "saveSamples" }} />
      <PropertyRow>
        <PropertyRowLabel label="CLF Data" tooltip="Import CLF directivity text files"/>
        <div>
          <input
          type = "file"
          id = "clfinput"
          accept = ".tab"
          onChange={(e) => {
              console.log(e.target.files);
              const reader = new FileReader();
              
              reader.addEventListener('loadend', (loadEndEvent) => {
                  let filecontents:string = reader.result as string; 
                  let clf = new CLFParser(filecontents);
                  let clf_results = clf.parse();
                  const source = useContainer.getState().containers[uuid] as Source;
                  source.directivityHandler = new DirectivityHandler(1,clf_results); 


                  // display CLF parser object (debugging)
                  console.log(clf);
                  // display CLF parser results (debugging)
                  console.log(clf_results);
              });

              reader.readAsText(e.target!.files![0]);
              
            }
          }
          />
        </div>
      </PropertyRow>
    </PropertyRowFolder>
  )
}

// const StyleProperties = ({ uuid }: { uuid: string }) => {
//   const [open, toggle] = useToggle(true);
//   return (
//     <PropertyRowFolder label="Style Properties" open={open} onOpenClose={toggle}>
//       <PropertyNumberInput
//         uuid={uuid}
//         label="Point Size"
//         property="pointSize"
//         tooltip="Sets the size of each interection point"
//       />
//       <PropertyCheckboxInput
//         uuid={uuid}
//         label="Rays Visible"
//         property="raysVisible"
//         tooltip="Toggles the visibility of the rays"
//       />
//       <PropertyCheckboxInput
//         uuid={uuid}
//         label="Points Visible"
//         property="pointsVisible"
//         tooltip="Toggles the visibility of the intersection points"
//       />
//     </PropertyRowFolder>
//   );
// };
// const ContainerControls = ({ uuid }: { uuid: string }) => {
//   const [open, toggle] = useToggle(true);
//   return (
//     <PropertyRowFolder label="Container Controls" open={open} onOpenClose={toggle}>
//       <PropertyCheckboxInput uuid={uuid} label="Running" property="isRunning" tooltip="Starts/stops the raytracer" />
//       <PropertyButton event="RAYTRACER_CLEAR_RAYS" args={uuid} label="Clear Rays" tooltip="Clears all of the rays" />
//     </PropertyRowFolder>
//   );
// };

export const SourceTab = ({ uuid }: { uuid: string }) => {
  return (
    <div>
      <General uuid={uuid} />
      <Visual uuid={uuid} />
      <Transform uuid={uuid} />
      <Configuration uuid={uuid} />
      <FDTDConfig uuid={uuid} />
    </div>
  );
};

export default SourceTab;
