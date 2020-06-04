import React from 'react';
import './NavbarMenuItemLabel.css';

export interface NavbarMenuItemLabelProps{
  label: string;
  shortcut?: string;
}

function NavbarMenuItemLabel(props: NavbarMenuItemLabelProps) {
  return (
    <div className="navbar-menu-item-label">
      <div>{props.label}</div>
      <div className="navbar-menu-item-label-shortcut">{props.shortcut||""}</div>
    </div>
  );
}

export default NavbarMenuItemLabel;