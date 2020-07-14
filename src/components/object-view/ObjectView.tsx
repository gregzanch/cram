import React, { useState } from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { SvgIcon } from "@material-ui/core";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import hotkeys from 'hotkeys-js';


import TreeItem from "@material-ui/lab/TreeItem";
import TreeItemLabel from '../tree-item-label/TreeItemLabel';
import Source from "../../objects/source";
import Receiver from "../../objects/receiver";
import properCase from "../../common/proper-case";
import { KeyValuePair } from "../../common/key-value-pair";
import Container from "../../objects/container";
import Surface from "../../objects/surface";
import Solver from "../../compute/solver";
import { Colors } from "@blueprintjs/core";
import { Icon } from "@fortawesome/fontawesome-svg-core";
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
} from '../icons';
import "./ObjectView.css";
import Messenger from "../../messenger";
import { addToGlobalVars } from "../../common/global-vars";

export interface ObjectViewProps {
  containers: KeyValuePair<Container>;
  onDelete: (...args) => void;
  onClick: (...args) => void;
  messenger: Messenger;
}

type ClickEvent = React.MouseEvent<HTMLElement, MouseEvent>;


export interface MapChildrenProps {
  container: Container | THREE.Object3D,
  objectViewProps: ObjectViewProps,
  expanded: string[],
  setExpanded: (value: React.SetStateAction<string[]>) => void
}

function MapChildren(props: MapChildrenProps) {
  
  const { container, objectViewProps, expanded, setExpanded } = props;
  
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
    const onClick = (e: ClickEvent) => objectViewProps.onClick(container, e);
    const collapseIcon = <ExpandMoreIcon onClick={(e) => setExpanded(expanded.filter((x) => x !== container.uuid))} fontSize="inherit" />;
    const expandIcon = <ChevronRightIcon onClick={(e) => setExpanded(expanded.concat(container.uuid))} fontSize="inherit" />;

    const label = <TreeItemLabel {...{ label: genericLabel, meta }} />;
    const roomLabel = <TreeItemLabel icon={<RoomIcon fontSize="inherit" />} {...{ label: genericLabel, meta }} />;

    const ContextMenuSharedProps = {
      handleMenuItemClick: (e) => {
        if (e.target.textContent) {
          switch (e.target.textContent) {
            case "Delete": {
              objectViewProps.onDelete(container);
            } break;
            case "Log to Console": {
              console.log(container);
            } break;
            case "Add To Global Variables": {
              addToGlobalVars(container, container.name);
            } break;
            case "Merge Surfaces": {
              if (container instanceof Surface) {
                const selection = objectViewProps.messenger.postMessage("GET_SELECTED_OBJECTS")[0];
                if (selection.length > 1) {
                  const selectionHasNonSurfaces = selection.filter(x => x.kind !== "surface").length > 0;
                  if (selectionHasNonSurfaces) {
                    return;
                  }
                  const newsurface = container.mergeSurfaces(selection);
                  container.room.surfaces.add(newsurface);
                  selection.forEach(x => {
                    objectViewProps.onDelete(x);
                  });
                }
              }
            } break;
            case "Hide": {
              const selection = objectViewProps.messenger.postMessage("GET_SELECTED_OBJECTS")[0];
              container.visible = false;
              selection.forEach((obj: Container) => {
                obj.visible = false;
              })
            } break;
            case "Show": {
              const selection = objectViewProps.messenger.postMessage("GET_SELECTED_OBJECTS")[0];
              container.visible = true;
              selection.forEach((obj: Container) => {
                obj.visible = true;
              });
            } break;
            default:
              break;
          }
        }
      },
      key: key + "context-menu"
    };
    const onKeyDown = e => { e.preventDefault(); };
    
    switch (container["kind"]) {
      case "surface":
        {
          let items = ["Show", "Hide", "Delete", "!seperator", "Add To Global Variables", "Log to Console"];
          const selectedObjectTypes = objectViewProps.messenger.postMessage("GET_SELECTED_OBJECT_TYPES")[0];
          if (selectedObjectTypes.length > 1 && selectedObjectTypes.filter((x: string) => x !== "surface").length == 0) {
            items = ["Merge Surfaces", "!seperator"].concat(items);
          }
          return (
            <ContextMenu items={items} {...ContextMenuSharedProps}>
              <TreeItem
                {...{ icon: <NodesIcon fontSize="inherit" />, className, label, onClick, draggable, key, nodeId }}
                
              />
            </ContextMenu>
          );
        } break;

      case "source":
        {
          let items = ["Show", "Hide", "Delete", "!seperator", "Add To Global Variables", "Log to Console"];
          return (
            <ContextMenu items={items} {...ContextMenuSharedProps}>
              <TreeItem
                {...{
                  icon: <SourceIcon fontSize="inherit" />,
                  className,
                  label,
                  onClick,
                  draggable,
                  key,
                  nodeId,
                  onKeyDown
                }}
              />
            </ContextMenu>
          );
        } break;
      case "receiver":
        {
          let items = ["Show", "Hide", "Delete", "!seperator", "Add To Global Variables", "Log to Console"];
          return (
            <ContextMenu items={items} {...ContextMenuSharedProps}>
              <TreeItem
                {...{
                  icon: <ReceiverIcon fontSize="inherit" />,
                  className,
                  label,
                  onClick,
                  draggable,
                  key,
                  nodeId,
                  onKeyDown
                }}
              />
            </ContextMenu>
          );
        } break;

      case "room":
        {
          return (
            <ContextMenu {...ContextMenuSharedProps}>
              <TreeItem
                {...{
                  label: roomLabel,
                  onClick,
                  draggable,
                  key,
                  nodeId,
                  collapseIcon,
                  className,
                  expandIcon,
                  onKeyDown
                }}
              >
                {container.children.map((x) => (
                  <MapChildren
                    container={x}
                    objectViewProps={objectViewProps}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    key={x.uuid + "-map-children"}
                  />
                ))}
              </TreeItem>
            </ContextMenu>
          );
        } break;
      
      case "container":
        return (
          <ContextMenu {...ContextMenuSharedProps}>
            <TreeItem
              label={
                <TreeItemLabel
                  icon={<SurfaceIcon fontSize="inherit" />}
                  label={container.name || "untitled"}
                  onClick={onClick}
                />
              }
              collapseIcon={
                <ExpandMoreIcon
                  onClick={(e) => setExpanded(expanded.filter((x) => x !== container.uuid))}
                  fontSize="inherit"
                />
              }
              expandIcon={
                <ChevronRightIcon onClick={(e) => setExpanded(expanded.concat(container.uuid))} fontSize="inherit" />
              }
              className={className}
              {...sharedProps}
            >
              {container.children.map((x) => (
                <MapChildren
                  container={x}
                  objectViewProps={objectViewProps}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  key={x.uuid + "-map-children"}
                />
              ))}
            </TreeItem>
          </ContextMenu>
        );

      default:
        return (
          <ContextMenu {...ContextMenuSharedProps}>
            <TreeItem
              label={<TreeItemLabel label={container.name || "untitled"} />}
              onKeyDown={onKeyDown}
              {...sharedProps}
              collapseIcon={
                <ExpandMoreIcon
                  onClick={(e) => setExpanded(expanded.filter((x) => x !== container.uuid))}
                  fontSize="inherit"
                />
              }
              expandIcon={
                <ChevronRightIcon onClick={(e) => setExpanded(expanded.concat(container.uuid))} fontSize="inherit" />
              }
            >
              {container.children instanceof Array &&
                container.children.map((x) => (
                  <MapChildren
                    container={x}
                    objectViewProps={objectViewProps}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    key={x.uuid + "-map-children"}
                  />
                ))}
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
              objectViewProps.onDelete(container);
              break;
            default:
              break;
          }
        }
      }}
      key={container.uuid + "context-menu"}
    >
      <TreeItem
        nodeId={container.uuid}
        label={<TreeItemLabel label={container.name || "untitled"} />}
        key={container.uuid + "tree-item"}
        draggable={true}
        onKeyDown={e=>e.preventDefault()}
        onClick={(e) => objectViewProps.onClick(container, e)}
      >
        {container.children.map((x) => (
          <MapChildren
            container={x}
            objectViewProps={objectViewProps}
            expanded={expanded}
            setExpanded={setExpanded}
            key={x.uuid + "-tree-container"}
          />
        ))}
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
        onKeyDown={e => {e.preventDefault()}}
        unselectable={unselctable}
        nodeId="containers"
      >
        {keys.map((x: string) => (
          <MapChildren
            container={props.containers[x]}
            objectViewProps={props}
            expanded={expanded}
            setExpanded={setExpanded}
            key={props.containers[x].uuid+"tree-item-container"}
          />
        ))}
      </TreeItem>
    </TreeView>
  );
}
