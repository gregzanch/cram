import React, {useState} from "react";
import TabUnselectedIcon from '@material-ui/icons/TabUnselected';
import FDTDProperties, { FDTDPropertiesProps } from './FDTDProperties';
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
import { ObjectPropertyInputEvent } from "../number-input/NumberInput";


export interface ObjectPropertiesProps {
  object: Container | Solver;
  messenger?: Messenger;
  onPropertyChange: (e: ObjectPropertyInputEvent) => void;
	onPropertyValueChangeAsNumber: (id: string, prop: string, valueAsNumber: number) => void;
  onPropertyValueChangeAsString: (id: string, prop: string, valueAsString: string) => void;
  onButtonClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  showingResults?: boolean;
}

export interface ObjectPropertiesState{
}

export default class ObjectProperties extends React.Component<ObjectPropertiesProps, ObjectPropertiesState>{
  constructor(props: ObjectPropertiesProps) {
    super(props);
    this.state = {
    }
  }
  shouldComponentUpdate(nextProps: Readonly<ObjectPropertiesProps>, nextState: Readonly<ObjectPropertiesState>, nextContext: any) {
    return true
  }
  render() {
    switch (this.props.object.kind) {
      case "source": return <SourceProperties {...this.props as SourcePropertiesProps} />;
      case "receiver": return <ReceiverProperties {...this.props as ReceiverPropertiesProps} />;
      case "room": return <RoomProperties {...this.props as RoomPropertiesProps} />;
      case "surface": return <SurfaceProperties {...this.props as SurfacePropertiesProps} />;
      case "fdtd": return <FDTDProperties {...this.props as FDTDPropertiesProps} />;
      case "ray-tracer": return <RayTracerProperties {...this.props as RayTracerPropertiesProps} />;
      case "rt60": return <RT60Properties {...(this.props as RT60PropertiesProps)} />;
  
      default: return <GenericObjectProperties {...this.props as GenericObjectPropertiesProps} />;
    }
  }
}