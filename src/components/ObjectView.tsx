import React, { useState } from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { SvgIcon } from "@material-ui/core";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";



import TreeItem from "@material-ui/lab/TreeItem";
import TreeItemLabel from './TreeItemLabel';
import Source from "../objects/source";
import Receiver from "../objects/receiver";
import properCase from "../common/proper-case";
import { KeyValuePair } from "../common/key-value-pair";
import Container from "../objects/container";
import Surface from "../objects/surface";
import Solver from "../compute/solver";
import { Colors } from "@blueprintjs/core";
import { Icon } from "@fortawesome/fontawesome-svg-core";
import ContextMenu from "./ContextMenu";
import {
  NodesIcon,
  FDTDIcon,
  RoomIcon,
  SurfaceIcon,
  RayTracerIcon,
  SourceIcon,
  ReceiverIcon,
  RT60Icon
} from './icons';
import "./ObjectView.css";


export interface ObjectViewProps {
  containers: KeyValuePair<Container>;
  onDelete: (...args) => void;
  onClick: (...args) => void;
  
}

type ClickEvent = React.MouseEvent<HTMLElement, MouseEvent>;


  function mapchildren(container: Container | THREE.Object3D, props: ObjectViewProps, expanded: string[], setExpanded) {
    if (container["kind"]) {
      const sharedProps = {
        draggable: true,
        key: container.uuid,
        nodeId: container.uuid
      };
      const className = (container as Container).selected ? "container-selected" : "";
      const draggable = true;
      const key = container.uuid;
      const nodeId = container.uuid;
      const meta = properCase(container["kind"]);
      const genericLabel = container.name || "untitled";
      const onClick = (e: ClickEvent) => props.onClick(container, e);
      const collapseIcon = <ExpandMoreIcon onClick={(e) => setExpanded(expanded.filter((x) => x !== container.uuid))} fontSize="inherit" />;
      const expandIcon = <ChevronRightIcon onClick={(e) => setExpanded(expanded.concat(container.uuid))} fontSize="inherit" />;

      const label = <TreeItemLabel {...{ label: genericLabel, meta }} />;
      const roomLabel = <TreeItemLabel icon={<RoomIcon fontSize="inherit" />} {...{ label: genericLabel, meta }} />;

      const ContextMenuSharedProps = {
        handleMenuItemClick: (e) => {
          if (e.target.textContent) {
            switch (e.target.textContent) {
              case "Delete":
                props.onDelete(container);
                break;
              default:
                break;
            }
          }
        },
        key: key + "context-menu"
      };

      switch (container["kind"]) {
        case "surface":
          return (
            <ContextMenu {...ContextMenuSharedProps}>
              <TreeItem {...{ icon: <NodesIcon fontSize="inherit" />, className, label, onClick, draggable, key, nodeId }} />
            </ContextMenu>
          );

        case "source":
          return (
            <ContextMenu {...ContextMenuSharedProps}>
              <TreeItem {...{ icon: <SourceIcon fontSize="inherit" />, className, label, onClick, draggable, key, nodeId }} />
            </ContextMenu>
          );

        case "receiver":
          return (
            <ContextMenu {...ContextMenuSharedProps}>
              <TreeItem {...{ icon: <ReceiverIcon fontSize="inherit" />, className, label, onClick, draggable, key, nodeId }} />
            </ContextMenu>
          );

        case "room":
          return (
            <ContextMenu {...ContextMenuSharedProps}>
              <TreeItem {...{ label: roomLabel, onClick, draggable, key, nodeId, collapseIcon, className, expandIcon }}>
                {container.children.map((x) => mapchildren(x, props, expanded, setExpanded))}
              </TreeItem>
            </ContextMenu>
          );
        
        case "container":
          return (
            <ContextMenu {...ContextMenuSharedProps}>
              <TreeItem
                label={<TreeItemLabel icon={<SurfaceIcon fontSize="inherit" />} label={container.name || "untitled"} />}
                collapseIcon={<ExpandMoreIcon onClick={(e) => setExpanded(expanded.filter((x) => x !== container.uuid))} fontSize="inherit" />}
                expandIcon={<ChevronRightIcon onClick={(e) => setExpanded(expanded.concat(container.uuid))} fontSize="inherit" />}
                className={className}
                {...sharedProps}>
                {container.children.map((x) => mapchildren(x, props, expanded, setExpanded))}
              </TreeItem>
            </ContextMenu>
          );

        default:
          return (
            <ContextMenu {...ContextMenuSharedProps}>
              <TreeItem
                label={<TreeItemLabel label={container.name || "untitled"} />}
                {...sharedProps}
                collapseIcon={<ExpandMoreIcon onClick={(e) => setExpanded(expanded.filter((x) => x !== container.uuid))} fontSize="inherit" />}
                expandIcon={<ChevronRightIcon onClick={(e) => setExpanded(expanded.concat(container.uuid))} fontSize="inherit" />}
                >
                {container.children instanceof Array && container.children.map((x) => mapchildren(x, props, expanded, setExpanded))}
              </TreeItem>
            </ContextMenu>
          );
      }
    }
    return (
      <ContextMenu
        handleMenuItemClick={(e) => {
          if (e.target.textContent) {
            switch (e.target.textContent) {
              case "Delete":
                props.onDelete(container);
                break;
              default:
                break;
            }
          }
        }}
        key={container.uuid + "context-menu"}>
        <TreeItem
          nodeId={container.uuid}
          label={<TreeItemLabel label={container.name || "untitled"} />}
          key={container.uuid}
          draggable={true}
          onClick={(e) => props.onClick(container, e)}>
          {container.children.map((x) => mapchildren(x, props, expanded, setExpanded))}
        </TreeItem>
      </ContextMenu>
    );
  }

export default function ObjectView(props) {

  const [expanded, setExpanded] = useState([""]);
  
  const ContainerLabelStyle ={
    fontWeight: 400,
    color: Object.keys(props.containers).length == 0 ? Colors.LIGHT_GRAY3 : "#182026"
  }

  
  const label = <TreeItemLabel label={<div style={ContainerLabelStyle}>Objects</div>}/>;
  const expandClickHandler = e => setExpanded(expanded.concat("containers"));
  const collapseClickHandler = e => setExpanded(expanded.filter(x => x !== "containers"));
  const collapseIcon = <ExpandMoreIcon onClick={collapseClickHandler} fontSize="inherit" />;
  const expandIcon = <ChevronRightIcon onClick={expandClickHandler} fontSize="inherit" />;
  const unselctable = Object.keys(props.containers).length == 0 ? "on" : "off";
  const keys = Object.keys(props.containers);
  return (
    <TreeView
      expanded={expanded}
      className="tree-view-root"
      defaultExpanded={[]}
      defaultExpandIcon={<ExpandMoreIcon fontSize="inherit" />}
      defaultCollapseIcon={<ChevronRightIcon fontSize="inherit" />}
    >
      <TreeItem
        label={label}
        expandIcon={expandIcon}
        collapseIcon={collapseIcon}
        unselectable={unselctable}
        nodeId="containers"
      >
        {keys.map((x: string) => mapchildren(props.containers[x], props, expanded, setExpanded))}
      </TreeItem>
    </TreeView>
  );
}
