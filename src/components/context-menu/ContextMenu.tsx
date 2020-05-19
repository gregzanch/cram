import React from 'react';

import { ContextMenuTarget, Menu, MenuItem } from "@blueprintjs/core";
 

export interface ContextMenuProps {
  handleMenuItemClick: ((event: React.MouseEvent<HTMLElement, MouseEvent>) => void) & ((event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void);
}


@ContextMenuTarget
export class ContextMenu extends React.Component<ContextMenuProps, {}> {
    public render() {
        // root element must support `onContextMenu`
        return <div>{this.props.children}</div>;
    }
 
    public renderContextMenu() {
        // return a single element, or nothing to use default browser behavior
        return (
            <Menu>
                <MenuItem onClick={this.props.handleMenuItemClick} text="Delete" />
                <MenuItem onClick={this.props.handleMenuItemClick} text="Log to Console" />
            </Menu>
        );
    }
 
    public onContextMenuClose() {
        // Optional method called once the context menu is closed.
    }
}

export default ContextMenu;