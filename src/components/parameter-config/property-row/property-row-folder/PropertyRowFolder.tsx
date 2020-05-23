
import React from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import "./PropertyRowFolder.css";
import Label from "../../../label/Label";

export interface PropertyRowFolderProps {
  label: string;
  open: boolean;
  children: React.ReactNodeArray;
  id: string;
  onOpenClose: (id: string) => void;
}
export default function PropertyRowFolder(props: PropertyRowFolderProps) {
  const contentClassNames = ["property-row-folder-contents", "property-row-folder-contents-hidden"];
  const contentStyle = {} as React.CSSProperties;
  if (props.open) {
    // contentStyle.height = `calc(${props.children.length}rem + 1em)`;
    contentStyle.height = `max-content`;
  }
  return (
    <div className="property-row-folder-container">
      <div onClick={() => props.onOpenClose(props.id)} className="property-row-folder-label">
        <span style={{ verticalAlign: "middle" }}>{props.open ? <ExpandMoreIcon fontSize="inherit" /> : <ChevronRightIcon fontSize="inherit" />}</span>
        <Label hasTooltip={false} style={{ display: "inline-block" }}>
          {props.label}
        </Label>
      </div>
      <div className={props.open ? contentClassNames[0] : contentClassNames.join(" ")} style={contentStyle}>
        {props.children}
      </div>
    </div>
  );
}

