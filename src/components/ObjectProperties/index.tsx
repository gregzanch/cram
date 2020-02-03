import React from "react";
import TabUnselectedIcon from '@material-ui/icons/TabUnselected';

import FDTDProperties, { FDTDPropertiesProps } from './FDTDProperties';
import SourceProperties, { SourcePropertiesProps } from './SourceProperties';
import ReceiverProperties, { ReceiverPropertiesProps } from './ReceiverProperties';
import RayTracerProperties, {RayTracerPropertiesProps} from './RayTracerProperties';
import RoomProperties, { RoomPropertiesProps } from './RoomProperties';
import SurfaceProperties, { SurfacePropertiesProps } from './SurfaceProperties';
import GenericObjectProperties, { GenericObjectPropertiesProps } from './GenericObjectProperties';
import Container from "../../objects/container";
import Solver from "../../compute/solver";


export interface ObjectPropertiesProps {
	object: Container|Solver;
  onPropertyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onPropertyValueChangeAsNumber: (id: string, prop: string, valueAsNumber: number) => void;
  onPropertyValueChangeAsString: (id: string, prop: string, valueAsString: string) => void;
  onButtonClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export default function ObjectProperties(props: ObjectPropertiesProps) {
  switch (props.object.kind) {
    case "source":  return <SourceProperties {...props as SourcePropertiesProps}/>
    case "receiver":  return <ReceiverProperties {...props as ReceiverPropertiesProps}/>
    case "room":  return <RoomProperties {...props as RoomPropertiesProps}/>
    case "surface":  return <SurfaceProperties {...props as SurfacePropertiesProps}/>
    case "fdtd":  return <FDTDProperties {...props as FDTDPropertiesProps}/>
    case "ray-tracer":  return <RayTracerProperties {...props as RayTracerPropertiesProps}/>
  
    default: return <GenericObjectProperties {...props as GenericObjectPropertiesProps}/>
  }
}