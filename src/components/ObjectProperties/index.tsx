import React, {useState} from "react";
import TabUnselectedIcon from '@material-ui/icons/TabUnselected';
import SourceProperties, { SourcePropertiesProps } from './SourceProperties';
import ReceiverProperties, { ReceiverPropertiesProps } from './ReceiverProperties';
import RayTracerProperties, {RayTracerPropertiesProps} from './RayTracerProperties';
import RoomProperties, { RoomPropertiesProps } from './RoomProperties';
import RT60Properties, { RT60PropertiesProps } from "./RT60Properties";
import SurfaceProperties, { SurfacePropertiesProps } from './SurfaceProperties';
import GenericObjectProperties, { GenericObjectPropertiesProps } from './GenericObjectProperties';
import Container from "../../objects/container";
import Solver from "../../compute/solver";
import Messenger from "../../messenger";
import { SourceTab } from "../parameter-config/SourceTab";
import { useContainer } from "../../store";
import { pickProps } from "../../common/helpers";
import { ReceiverTab } from "../parameter-config/ReceiverTab";
import { RoomTab } from "../parameter-config/RoomTab";
import SurfaceTab from "../parameter-config/SurfaceTab";

export interface ObjectPropertyInputEvent {
  name: string;
  type: string;
  value: any;
  checked?: boolean;
  id?: string;
}

export const ObjectProperties = () => {
  const containers = useContainer(state => state.selectedObjects);
  
  if(containers.size == 0) return <div>Nothing Selected</div>

  if(containers.size == 1) {
    const {uuid, kind} = [...containers.values()][0];
    switch (kind) {
      case "source": return <SourceTab uuid={uuid} />
      case "receiver": return <ReceiverTab uuid={uuid} />
      case "room": return <RoomTab uuid={uuid} />
      case "surface": return <SurfaceTab uuid={uuid} />
      default: return <></>
    }
  } 

  else return <div>Multiple Items Selected</div>
}

export default ObjectProperties;