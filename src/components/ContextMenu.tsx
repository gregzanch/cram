import React from 'react';

import { ContextMenuTarget, Menu, MenuItem, MenuDivider } from "@blueprintjs/core";
 

export interface ContextMenuProps {
    handleMenuItemClick: ((event: React.MouseEvent<HTMLElement, MouseEvent>) => void) & ((event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void);
    items?: string[];
}


@ContextMenuTarget
export class ContextMenu extends React.Component<ContextMenuProps, {}> {
    public render() {
        // root element must support `onContextMenu`
        return <div>{this.props.children}</div>;
    }
 
    public renderContextMenu() {
        // return a single element, or nothing to use default browser behavior
        const items = this.props.items || ["Delete", "!seperator", "Add To Global Variables",  "Log to Console"];
        return (
            <Menu>
                {items.map((x, i) => {
                    if (x === "!seperator") {
                        return <MenuDivider key={"context-menu-item-" + x + String(i)} />;
                    }
                    else {
                        return <MenuItem onClick={this.props.handleMenuItemClick} text={x} key={"context-menu-item-"+x} />;
                    }
                })}
            </Menu>
        );
    }
 
    public onContextMenuClose() {
        // Optional method called once the context menu is closed.
    }
}

export default ContextMenu;