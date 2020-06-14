import React from 'react';

type ClickEvent = React.MouseEvent<HTMLElement, MouseEvent>;

export interface TreeItemLabelProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: (e: ClickEvent) => void;
}

export default function TreeItemLabel(props: TreeItemLabelProps) {
  const extraProps = {} as any;
  if (props.onClick) {
    extraProps.onClick = props.onClick;
  }
  return (
    <div className="tree-item-label-container" {...extraProps}>
      <div className="tree-item-label-label">
        {props.icon && (<div className="tree-item-label-icon"> {props.icon || ""}</div>)}
        {props.label}
      </div>
    </div>
  );
}
