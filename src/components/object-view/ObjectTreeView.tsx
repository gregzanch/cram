import React, { useState, useContext, useMemo } from "react";
import { GlobalContext } from '../../';
import ContextMenu from "../context-menu/ContextMenu";
import {
  NodesIcon,
  FDTDIcon,
  RoomIcon,
  SurfaceIcon,
  RayTracerIcon,
  SourceIcon,
  ReceiverIcon,
  RT60Icon
} from "../icons";
import "./ObjectView.css";

import { addToGlobalVars } from "../../common/global-vars";



export default function ObjectTreeView(props) {
  
  const messenger = useContext(GlobalContext);
  
  // const [containers, setContainers] = useState(props.containers);
  
  
  
  const memoizedProps = useMemo(() => {
    return {
      objects: props.containers
    };
  }, []);
  
  
  
  
}
