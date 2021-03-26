import React from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Label from "../../label/Label";
import styled from "styled-components";

const PropertyRowFolderLabel = styled.div`
  :hover {
    background-color: #eaeef1;
    cursor: pointer;
    user-select: none;
  }
`;

const PropertyRowFolderContainer = styled.div`
  > * {
    --transition-time: 50ms;
    --folder-contents-shadow-top: inset 0px 15px 10px -15px rgba(221, 226, 230, 0.5);
    --folder-contents-shadow-bottom: inset 0px -15px 10px -15px rgba(221, 226, 230, 0.5);
    --transition-function: cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  padding-bottom: .25em;
`;

const PropertyRowFolderContents = styled.div`
  
    height: 100px;
    padding-top: 0.5em;
    padding-bottom: 0.5em;
    overflow: hidden;

    /* -webkit-box-shadow: var(--folder-contents-shadow-top), var(--folder-contents-shadow-bottom); */
    /* -moz-box-shadow: var(--folder-contents-shadow-top), var(--folder-contents-shadow-bottom); */
    /* box-shadow: var(--folder-contents-shadow-top), var(--folder-contents-shadow-bottom); */
    /* background-color: #000000; */

    -webkit-transition: all var(--transition-time) var(--transition-function);
    -moz-transition: all var(--transition-time) var(--transition-function);
    -o-transition: all var(--transition-time) var(--transition-function);
    transition: all var(--transition-time) var(--transition-function);
    
    [hidden] {
      height: 0;
      padding-top: 0;
      padding-bottom: 0;
    
      -webkit-transition: all var(--transition-time) var(--transition-function);
      -moz-transition: all var(--transition-time) var(--transition-function);
      -o-transition: all var(--transition-time) var(--transition-function);
      transition: all var(--transition-time) var(--transition-function);
    }
`;

export interface PropertyRowFolderProps {
  label: string;
  open: boolean;
  children: React.ReactNode;
  id?: string;
  onOpenClose: (id?: string) => void;
}
export default function PropertyRowFolder(props: PropertyRowFolderProps) {
  const contentClassNames = ["property-row-folder-contents", "property-row-folder-contents-hidden"];
  const contentStyle = {} as React.CSSProperties;
  if (props.open) {
    // contentStyle.height = `calc(${props.children.length}rem + 1em)`;
    contentStyle.height = `max-content`;
  }
  return (
    <PropertyRowFolderContainer>
      <PropertyRowFolderLabel onClick={() => props.onOpenClose(props.id)}>
        <span style={{ verticalAlign: "middle" }}>
          {props.open ? <ExpandMoreIcon fontSize="inherit" /> : <ChevronRightIcon fontSize="inherit" />}
        </span>
        <Label hasTooltip={false} style={{ display: "inline-block" }}>
          {props.label}
        </Label>
      </PropertyRowFolderLabel>
      <PropertyRowFolderContents hidden={!props.open} style={contentStyle}>
        {props.children}
      </PropertyRowFolderContents>
    </PropertyRowFolderContainer>
  );
}
