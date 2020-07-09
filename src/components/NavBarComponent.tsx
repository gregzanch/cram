import React, { useState, useContext } from "react";
import { GlobalContext } from "../";
import Messenger from '../messenger';
import { Popover, Position, Button, Menu, MenuItem, MenuDivider, Colors, Navbar, ButtonGroup } from '@blueprintjs/core';
import NavbarMenuItemLabel from './NavbarMenuItemLabel';
import MenuItemText from './menu-item-text/MenuItemText';
import { Characters } from '../constants';

import "./NavBarComponent.css";

interface MenuItemWithMessengerProps{
  label: string;
  hotkey?: string[];
  disabled?: boolean;
  message: string;
}

function MenuItemWithMessenger(props: MenuItemWithMessengerProps) {
  const { messenger } = useContext(GlobalContext);
  return (
    <MenuItem
      text={<MenuItemText text={props.label} hotkey={props.hotkey||[""]} />}
      onClick={(e) => messenger.postMessage(props.message)}
      disabled={props.disabled}
    />
  );
}


export function FileMenu(props) {
  return (
    <Popover minimal={true} transitionDuration={0} position={Position.BOTTOM_LEFT}>
      <Button text="File" />
      <Menu>
        <MenuItemWithMessenger label="New" message="SHOW_NEW_WARNING" hotkey={[Characters.SHIFT,"N"]} />
        <MenuItemWithMessenger label="Open" message="SHOW_OPEN_WARNING" hotkey={[Characters.COMMAND,"O"]} />
        <MenuItemWithMessenger label="Save" message="SHOW_SAVE_DIALOG" hotkey={[Characters.COMMAND,"S"]} />
        <MenuDivider />
        <MenuItemWithMessenger label="Import" message="SHOW_IMPORT_DIALOG" hotkey={[Characters.COMMAND,"I"]} />
      </Menu>
    </Popover>
  );
}

export function EditMenu(props) {
  const { messenger } = useContext(GlobalContext);
  
  const canUndo = messenger.postMessage("CAN_UNDO")[0];
  const canRedo = messenger.postMessage("CAN_REDO")[0];
  const canDuplicate = messenger.postMessage("CAN_DUPLICATE")[0];

  
  return (
    <Popover minimal={true} transitionDuration={0} position={Position.BOTTOM_LEFT}>
      <Button text="Edit" />
      <Menu>
        <MenuItemWithMessenger label="Undo" message="UNDO" hotkey={[Characters.COMMAND,"Z"]} disabled={!canUndo} />
        <MenuItemWithMessenger label="Redo" message="REDO" hotkey={[Characters.SHIFT,Characters.COMMAND,"Z"]} disabled={!canRedo} />
        <MenuDivider />
        <MenuItemWithMessenger label="Duplicate" message="SHOULD_DUPLICATE_SELECTED_OBJECTS" hotkey={[Characters.SHIFT,"D"]} disabled={!canDuplicate}/>
        <MenuDivider />
        <MenuItemWithMessenger label="Cut" message="CUT" hotkey={[Characters.COMMAND,"X"]} disabled />
        <MenuItemWithMessenger label="Copy" message="COPY" hotkey={[Characters.COMMAND,"C"]} disabled />
        <MenuItemWithMessenger label="Paste" message="PASTE" hotkey={[Characters.COMMAND,"V"]} disabled />
      </Menu>
    </Popover>
  );
}


export function AddMenu(props) {
  return (
    <Popover minimal={true} transitionDuration={0} position={Position.BOTTOM_LEFT}>
      <Button text="Add" />
      <Menu>
        <MenuItemWithMessenger label="Source" message="SHOULD_ADD_SOURCE" />
        <MenuItemWithMessenger label="Receiver" message="SHOULD_ADD_RECEIVER" />
        <MenuDivider />
        <MenuItemWithMessenger label="Sketch" message="SHOULD_ADD_SKETCH" disabled />
        <MenuDivider />
        <MenuItemWithMessenger label="Ray Tracer" message="SHOULD_ADD_RAYTRACER" />
        <MenuItemWithMessenger label="2D-FDTD" message="SHOULD_ADD_FDTD_2D" />
        <MenuItemWithMessenger label="RT60" message="SHOULD_ADD_RT60" />
      </Menu>
    </Popover>
  );
}

export function ViewMenu(props) {
  return (
    <Popover minimal={true} transitionDuration={0} position={Position.BOTTOM_LEFT}>
      <Button text="View" />
      <Menu>
        <MenuItemWithMessenger label="Clear Local Storage" message="CLEAR_LOCAL_STORAGE" />
        <MenuItemWithMessenger label="Toggle Renderer Stats" message="TOGGLE_RENDERER_STATS_VISIBLE" />
      </Menu>
    </Popover>
  );
}


export interface NavBarComponentProps {
  canUndo: boolean;
  canRedo: boolean;
  canDuplicate: boolean;
  rendererStatsVisible: boolean;
  projectName: string;
}

export function NavBarComponent(props: NavBarComponentProps) {
  const { messenger } = useContext(GlobalContext);
  
  return (
    <Navbar className="main-nav_bar" >
      <Navbar.Group className="main-nav_bar-left_group">
        <Navbar.Group className="main-nav_bar-logo_text">cram</Navbar.Group>
        <Navbar.Divider />
        <Menu className="main-nav_bar-left_menu">
          <ButtonGroup minimal={true}>


            <FileMenu />
            <EditMenu />
            <AddMenu />
            <ViewMenu />


            
          </ButtonGroup>
        </Menu>
      </Navbar.Group>
      <Navbar.Group className="main-nav_bar-left_group main-nav_bar-projectname_text">{props.projectName}</Navbar.Group>
      <Navbar.Group className="main-nav_bar-right_group">
        <Button
          icon="cog"
          minimal={true}
          className={"main-nav_bar-right_menu-button"}
          onClick={(e) => messenger.postMessage("SHOW_SETTINGS_DRAWER")}
        ></Button>
      </Navbar.Group>
    </Navbar>
  );
}

