import React from 'react';

export interface TreeItemLabelProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export default function TreeItemLabel(props: TreeItemLabelProps) {
  return (
    <div className="tree-item-label-container">
      <div className="tree-item-label-label">
        {props.icon && (<div className="tree-item-label-icon"> {props.icon || ""}</div>)}
        {props.label}
      </div>
    </div>
  );
}
