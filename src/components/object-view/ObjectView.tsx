import React, { useCallback, useEffect, useState } from "react";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

import TreeItem from "@material-ui/lab/TreeItem";
import TreeItemLabel from "../tree-item-label/TreeItemLabel";
import properCase from "../../common/proper-case";
import { KeyValuePair } from "../../common/key-value-pair";
import Container from "../../objects/container";
import { Colors } from "@blueprintjs/core";
import ContextMenu from "../ContextMenu";
import { NodesIcon, RoomIcon, SurfaceIcon, SourceIcon, ReceiverIcon } from "../icons";
import "./ObjectView.css";
import Messenger, { emit, on } from "../../messenger";
import { useContainer } from "../../store";
import { pickProps } from "../../common/helpers";




type ClickEvent = React.MouseEvent<HTMLElement, MouseEvent>;

export interface MapChildrenProps {
  parent: string;
  container: Container;
  expanded: string[];
  setExpanded: (value: React.SetStateAction<string[]>) => void;
}

function MapChildren(props: MapChildrenProps) {
  const { container, expanded, setExpanded, parent } = props;
  const [selected, setSelected] = useState(container.selected);
  const [name, setName] = useState(container.name);
  const className = selected ? "container-selected" : "";
  const draggable = true;
  const key = container.uuid;
  const nodeId = container.uuid;
  const meta = properCase(container["kind"]);
  const genericLabel = name || "untitled";
  const onClick = useCallback((e: ClickEvent) => {
    if (container["kind"] !== "room") {
      emit(e.shiftKey ? "APPEND_SELECTION" : "SET_SELECTION", [container]);
    }
  }, [container]);

  useEffect(()=>on("APPEND_SELECTION", (containers) => {
    if(containers.includes(container)){
      setSelected(true);
    }
  }), [container])

  useEffect(()=>on("SET_SELECTION", (containers) => {
    setSelected(containers.includes(container))
  }), [container])

  const event = `${container.kind.toUpperCase()}_SET_PROPERTY` as "SOURCE_SET_PROPERTY";
  useEffect(() => on(event, ({uuid, property, value}) => {
    if(uuid === container.uuid && property === "name") {
      console.log(value);
      setName(value as string);
    }
  }), [container.uuid])

  const collapseIcon = (
    <ExpandMoreIcon onClick={() => setExpanded(expanded.filter((x) => x !== container.uuid))} fontSize="inherit" />
  );
  const expandIcon = (
    <ChevronRightIcon onClick={() => setExpanded(expanded.concat(container.uuid))} fontSize="inherit" />
  );

  const label = <TreeItemLabel {...{ label: genericLabel, meta }} />;
  const roomLabel = <TreeItemLabel icon={<RoomIcon fontSize="inherit" />} {...{ label: genericLabel, meta }} />;

  const ContextMenuSharedProps = {
    handleMenuItemClick: (e) => {
      if (e.target.textContent) {
        switch (e.target.textContent) {
          case "Delete": {
            const newExpanded = new Set(expanded);
            container.traverse((object: Container) => {
              if(newExpanded.has(object.uuid)){
                newExpanded.delete(object.uuid);
              }
            });
            emit("DESELECT_ALL_OBJECTS");
            setExpanded([...newExpanded]);
            const toDelete = [] as string[];
            container.traverse((object: Container) => {
              if(object["kind"] && ["surface", "source", "receiver", "room"].includes(object["kind"])){
                toDelete.push(object.uuid);
              }
            });
            emit("REMOVE_CONTAINERS", toDelete);
          } break;
          case "Log to Console": console.log(container); break;
          default: break;
        }
      }
    },
    key: key + "context-menu",
    items: ["Delete", "Log to Console"]
  };
  const onKeyDown = (e) => {
    e.preventDefault();
  };

  if(container.parent?.uuid !== parent){
    return <></>;
  }

  switch (container["kind"]) {
    case "surface":
         return (
          <ContextMenu {...ContextMenuSharedProps}>
            <TreeItem icon={<NodesIcon fontSize="inherit" />} {...{ className, label, onClick, draggable, key, nodeId }} />
          </ContextMenu>
        ) 

    case "source":
      return (
        <ContextMenu {...ContextMenuSharedProps}>
          <TreeItem icon={<SourceIcon fontSize="inherit" />} {...{ className, label, onClick, draggable, key, nodeId }} />
        </ContextMenu>
      );
    case "receiver":
      return (
        <ContextMenu {...ContextMenuSharedProps}>
          <TreeItem icon={<ReceiverIcon fontSize="inherit" />} {...{ className, label, onClick, draggable, key, nodeId }} />
        </ContextMenu>
      );

    case "room":
        return (
          <ContextMenu {...ContextMenuSharedProps}>
            <TreeItem label={roomLabel} {...{ onClick, draggable, key, nodeId, collapseIcon, className, expandIcon, onKeyDown }}>
              {(container.children.filter(x => x instanceof Container && x.parent?.uuid === container.uuid) as Container[]).map((x) => (
                <MapChildren
                  parent={container.uuid}
                  container={x}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  key={x.uuid + "-map-children"}
                />
              ))}
            </TreeItem>
          </ContextMenu>
        );

    case "container":
        return <ContextMenu {...ContextMenuSharedProps}>
        <TreeItem label={label} {...{ onClick, draggable, key, nodeId, collapseIcon, className, expandIcon, onKeyDown }}>{
          (container.children.filter(x=>x instanceof Container && x.parent?.uuid === container.uuid) as Container[]).map((x) => (
          <MapChildren
            parent={container.uuid}
            container={x}
            expanded={expanded}
            setExpanded={setExpanded}
            key={x.uuid + "-map-children"}
          />
        ))}            </TreeItem>
        </ContextMenu>
    default: return <></>;
  }
}

export default function ObjectView() {
  const {containers, getWorkspace} = useContainer(state=>pickProps(["containers", "getWorkspace"], state));
  const [expanded, setExpanded] = useState(["containers"]);

  const ContainerLabelStyle = {
    fontWeight: 400,
    color: Object.keys(containers).length == 0 ? Colors.LIGHT_GRAY3 : "#182026"
  };

  const label = <TreeItemLabel label={<div style={ContainerLabelStyle}>Objects</div>} />;
  const expandClickHandler = () => setExpanded(expanded.concat("containers"));
  const collapseClickHandler = () => setExpanded(expanded.filter((x) => x !== "containers"));
  const collapseIcon = <ExpandMoreIcon onClick={collapseClickHandler} fontSize="inherit" />;
  const expandIcon = <ChevronRightIcon onClick={expandClickHandler} fontSize="inherit" />;
  const unselctable = Object.keys(containers).length == 0 ? "on" : "off";
  const keys = Object.keys(containers);
  const workspace = getWorkspace();

  if(!workspace){
    return <></>
  }
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
        onKeyDown={(e) => {
          e.preventDefault();
        }}
        unselectable={unselctable}
        nodeId="containers"
      >
        {keys.map((x: string) => (
          <MapChildren
            parent={workspace ? workspace.uuid : ""}
            container={containers[x]}
            expanded={expanded}
            setExpanded={setExpanded}
            key={containers[x].uuid + "tree-item-container"}
          />
        ))}
      </TreeItem>
    </TreeView>
  );
}
