import React, { useState, useContext } from "react";
import { GlobalContext } from "../";
import Messenger from '../state/messenger';
import { Popover, Position, Button, Menu, MenuItem, MenuDivider, Colors, Navbar, ButtonGroup } from '@blueprintjs/core';
import NavbarMenuItemLabel from './NavbarMenuItemLabel';
import MenuItemText from './menu-item-text/MenuItemText';
import { Characters } from '../constants';

import "./NavBarComponent.css";
import Actions, { StateAction } from "../state/actions";

interface MenuItemWithMessengerProps{
  label: string;
  hotkey?: string[];
  disabled?: boolean;
  message: StateAction;
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
        <MenuItemWithMessenger label="New" message={Actions.SHOW_NEW_WARNING} hotkey={[Characters.SHIFT,"N"]} />
        <MenuItemWithMessenger label="Open" message={Actions.SHOW_OPEN_WARNING} hotkey={[Characters.COMMAND,"O"]} />
        <MenuItemWithMessenger label="Save" message={Actions.SHOW_SAVE_DIALOG} hotkey={[Characters.COMMAND,"S"]} />
        <MenuDivider />
        <MenuItemWithMessenger label="Import" message={Actions.SHOW_IMPORT_DIALOG} hotkey={[Characters.COMMAND,"I"]} />
      </Menu>
    </Popover>
  );
}

export function EditMenu(props) {
  const { messenger } = useContext(GlobalContext);
  
  const canUndo = messenger.postMessage(Actions.CAN_UNDO);
  const canRedo = messenger.postMessage(Actions.CAN_REDO);
  const canDuplicate = messenger.postMessage(Actions.CAN_DUPLICATE);

  
  return (
    <Popover minimal={true} transitionDuration={0} position={Position.BOTTOM_LEFT}>
      <Button text="Edit" />
      <Menu>
        <MenuItemWithMessenger label="Undo" message={Actions.UNDO} hotkey={[Characters.COMMAND,"Z"]} disabled={!canUndo} />
        <MenuItemWithMessenger label="Redo" message={Actions.REDO} hotkey={[Characters.SHIFT,Characters.COMMAND,"Z"]} disabled={!canRedo} />
        <MenuDivider />
        <MenuItemWithMessenger label="Duplicate" message={Actions.SHOULD_DUPLICATE_SELECTED_OBJECTS} hotkey={[Characters.SHIFT,"D"]} disabled={!canDuplicate}/>
        <MenuDivider />
        <MenuItemWithMessenger label="Cut" message={Actions.CUT} hotkey={[Characters.COMMAND,"X"]} disabled />
        <MenuItemWithMessenger label="Copy" message={Actions.COPY} hotkey={[Characters.COMMAND,"C"]} disabled />
        <MenuItemWithMessenger label="Paste" message={Actions.PASTE} hotkey={[Characters.COMMAND,"V"]} disabled />
      </Menu>
    </Popover>
  );
}


export function AddMenu(props) {
  return (
    <Popover minimal={true} transitionDuration={0} position={Position.BOTTOM_LEFT}>
      <Button text="Add" />
      <Menu>
        <MenuItemWithMessenger label="Source" message={Actions.SHOULD_ADD_SOURCE} />
        <MenuItemWithMessenger label="Receiver" message={Actions.SHOULD_ADD_RECEIVER} />
        <MenuDivider />
        <MenuItemWithMessenger label="Sketch" message={Actions.SHOULD_ADD_SKETCH} disabled />
        <MenuDivider />
        <MenuItemWithMessenger label="Ray Tracer" message={Actions.SHOULD_ADD_RAYTRACER} />
        <MenuItemWithMessenger label="2D-FDTD" message={Actions.SHOULD_ADD_FDTD_2D} />
        <MenuItemWithMessenger label="RT60" message={Actions.SHOULD_ADD_RT60} />
      </Menu>
    </Popover>
  );
}

export function ViewMenu(props) {
  return (
    <Popover minimal={true} transitionDuration={0} position={Position.BOTTOM_LEFT}>
      <Button text="View" />
      <Menu>
        <MenuItemWithMessenger label="Clear Local Storage" message={Actions.CLEAR_LOCAL_STORAGE} />
        <MenuItemWithMessenger label="Toggle Renderer Stats" message={Actions.TOGGLE_RENDERER_STATS_VISIBLE} />
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
          onClick={(e) => messenger.postMessage(Actions.SHOW_SETTINGS_DRAWER)}
        ></Button>
      </Navbar.Group>
    </Navbar>
  );
}

