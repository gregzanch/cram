import React, {useState} from "react";
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