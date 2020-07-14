import React, { useState } from "react";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

import TreeItem from "@material-ui/lab/TreeItem";
import TreeItemLabel from "./tree-item-label/TreeItemLabel";
import { KeyValuePair } from "../common/key-value-pair";
import Container from "../objects/container";
import { Colors } from "@blueprintjs/core";
import ContextMenu from "./context-menu/ContextMenu";
import {
  ConstructionPlaneIcon,
  ConstructionAxisIcon,
  ConstructionPointIcon
} from "./icons";

import "./ConstructionsView.css";
import Messenger from "../messenger";
import { addToGlobalVars } from "../common/global-vars";

export interface ConstructionsViewProps {
  constructions: KeyValuePair<Container>;
  messenger: Messenger;
}



export default function ConstructionsView(props: ConstructionsViewProps) {
  const [expanded, setExpanded] = useState([""]);

  const ConstructionsLabelStyle: React.CSSProperties = {
    fontWeight: 400,
    color: Object.keys(props.constructions).length == 0 ? Colors.LIGHT_GRAY3 : "#182026",
    userSelect: "none"
  };

  const label = <TreeItemLabel label={<div style={ConstructionsLabelStyle}>Constructions</div>} />;
  const expandClickHandler = (e) => setExpanded(expanded.concat("constructions"));
  const collapseClickHandler = (e) => setExpanded(expanded.filter((x) => x !== "constructions"));
  const collapseIcon = <ExpandMoreIcon onClick={collapseClickHandler} fontSize="inherit" />;
  const expandIcon = <ChevronRightIcon onClick={expandClickHandler} fontSize="inherit" />;
  const unselctable = Object.keys(props.constructions).length == 0 ? "on" : "off";
  const keys = Object.keys(props.constructions);
  
 
  
  return (
    <TreeView
      expanded={expanded}
      className="tree-view-root"
      defaultExpanded={[]}
      defaultExpandIcon={<ExpandMoreIcon fontSize="inherit" />}
      defaultCollapseIcon={<ChevronRightIcon fontSize="inherit" />}
    >
      <ContextMenu
        items={["Show All", "Hide All", "!seperator", "Add To Global Variables", "Log to Console"]}
        handleMenuItemClick={e => {
          if (e.target.textContent) {
            switch (e.target.textContent) {
              case "Show All":
                {
                  Object.keys(props.constructions).forEach(x => {
                    props.constructions[x].visible = true;
                  });
                }
                break;

              case "Hide All":
                {
                  Object.keys(props.constructions).forEach((x) => {
                    props.constructions[x].visible = false;
                  });
                }
                break;

              case "Log to Console":
                {
                  console.log(props.constructions);
                }
                break;
              case "Add To Global Variables": {
                addToGlobalVars(props.constructions, "constructions");
              } break;

              default:
                break;
            }
          }
        }}
      >
        <TreeItem
          label={label}
          expandIcon={expandIcon}
          collapseIcon={collapseIcon}
          unselectable={unselctable}
          nodeId="constructions"
        >
          {keys.map((x: string) => {
            const construction = props.constructions[x];

            const ContextMenuSharedProps = {
              items: ["Show", "Hide", "Delete", "!seperator", "Add To Global Variables", "Log to Console"],
              handleMenuItemClick: (e) => {
                if (e.target.textContent) {
                  switch (e.target.textContent) {
                    case "Show":
                      {
                        construction.visible = true;
                      }
                      break;

                    case "Hide":
                      {
                        construction.visible = false;
                      }
                      break;

                    case "Delete":
                      {
                        props.messenger.postMessage("REMOVE_CONSTRUCTION", construction.uuid);
                      }
                      break;

                    case "Log to Console":
                      {
                        console.log(construction);
                      }
                      break;

                    case "Add To Global Variables":
                      {
                        addToGlobalVars(construction, construction.name);
                      }
                      break;

                    default:
                      break;
                  }
                }
              },
              key: x + "context-menu"
            };

            switch (construction["kind"]) {
              case "construction-point":
                {
                  return (
                    <ContextMenu {...ContextMenuSharedProps}>
                      <TreeItem
                        icon={<ConstructionPointIcon fontSize="inherit" />}
                        label={<TreeItemLabel label={<div style={{ userSelect: "none" }}>{construction.name}</div>} />}
                        draggable={false}
                        key={construction.uuid}
                        nodeId={construction.uuid}
                      />
                    </ContextMenu>
                  );
                }
                break;
              case "construction-axis":
                {
                  return (
                    <ContextMenu {...ContextMenuSharedProps}>
                      <TreeItem
                        icon={<ConstructionAxisIcon fontSize="inherit" />}
                        label={<TreeItemLabel label={<div style={{ userSelect: "none" }}>{construction.name}</div>} />}
                        draggable={false}
                        key={construction.uuid}
                        nodeId={construction.uuid}
                      />
                    </ContextMenu>
                  );
                }
                break;
              case "construction-plane":
                {
                  return (
                    <ContextMenu {...ContextMenuSharedProps}>
                      <TreeItem
                        icon={<ConstructionPlaneIcon fontSize="inherit" />}
                        label={<TreeItemLabel label={<div style={{userSelect: "none"}}>{construction.name}</div>} />}
                        draggable={false}
                        key={construction.uuid}
                        nodeId={construction.uuid}
                      />
                    </ContextMenu>
                  );
                }
                break;
              default:
                break;
            }
          })}
        </TreeItem>
      </ContextMenu>
    </TreeView>
  );
}
