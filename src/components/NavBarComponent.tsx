import React, { useState, useContext } from "react";
import Messenger, { emit, postMessage } from "../messenger";
import { Position, Button, Menu, MenuItem, MenuDivider, Colors, Navbar, ButtonGroup } from "@blueprintjs/core";
import { Popover2 , Classes} from "@blueprintjs/popover2";
import NavbarMenuItemLabel from "./NavbarMenuItemLabel";
import MenuItemText from "./menu-item-text/MenuItemText";
import { Characters } from "../constants";
import create from "zustand";
import "./NavBarComponent.css";
import { useAppStore } from "../store";

interface MenuItemWithMessengerProps {
  label: string;
  hotkey?: string[];
  disabled?: boolean;
  message: string;
}

function MenuItemWithMessenger(props: MenuItemWithMessengerProps) {
  return (
    <MenuItem
      className={Classes.POPOVER2_DISMISS}
      text={<MenuItemText text={props.label} hotkey={props.hotkey || [""]} />}
      onClick={(e) => postMessage(props.message)}
      disabled={props.disabled}
    />
  );
}

type InteractionKind = "click" | "click-target" | "hover" | "hover-target" | undefined;

type MenuProps = {
  isOpen: boolean;
  onInteraction: (nextOpenState: boolean) => void;
}

export function FileMenu(props: MenuProps) {
  return (
    <Popover2
      minimal={true}
      transitionDuration={0}

      isOpen={props.isOpen}
      hoverOpenDelay={0}
      hoverCloseDelay={0}
      renderTarget={({ isOpen, ref, ...p }) => (
        <Button {...p} active={isOpen} elementRef={ref as React.RefObject<HTMLButtonElement>} text="File" />
      )}
      onInteraction={(e)=>props.onInteraction(e)}
      content={
        <Menu>
          <MenuItemWithMessenger label="New" message="SHOW_NEW_WARNING" hotkey={[Characters.SHIFT, "N"]} />
          <MenuItemWithMessenger label="Open" message="SHOW_OPEN_WARNING" hotkey={[Characters.COMMAND, "O"]} />
          <MenuItemWithMessenger label="Save" message="SHOW_SAVE_DIALOG" hotkey={[Characters.COMMAND, "S"]} />
          <MenuDivider />
          <MenuItemWithMessenger label="Import" message="SHOW_IMPORT_DIALOG" hotkey={[Characters.COMMAND, "I"]} />
        </Menu>
      }
      placement="bottom-start"
    />
  );
}

export function EditMenu(props: MenuProps) {
  const canUndo = postMessage("CAN_UNDO")[0];
  const canRedo = postMessage("CAN_REDO")[0];
  const canDuplicate = postMessage("CAN_DUPLICATE")[0];


  return (

    <Popover2
      minimal={true}
      onInteraction={(e)=>props.onInteraction(e)}
      transitionDuration={0}
      isOpen={props.isOpen}
      renderTarget={({ isOpen, ref, ...p }) => (
        <Button {...p} active={isOpen} elementRef={ref as React.RefObject<HTMLButtonElement>} text="Edit" />
      )}
      content={
        <Menu>
        <MenuItemWithMessenger label="Undo" message="UNDO" hotkey={[Characters.COMMAND, "Z"]} disabled={!canUndo} />
        <MenuItemWithMessenger
          label="Redo"
          message="REDO"
          hotkey={[Characters.SHIFT, Characters.COMMAND, "Z"]}
          disabled={!canRedo}
        />
        <MenuDivider />
        <MenuItemWithMessenger
          label="Duplicate"
          message="SHOULD_DUPLICATE_SELECTED_OBJECTS"
          hotkey={[Characters.SHIFT, "D"]}
          disabled={!canDuplicate}
        />
        <MenuDivider />
        <MenuItemWithMessenger label="Cut" message="CUT" hotkey={[Characters.COMMAND, "X"]} disabled />
        <MenuItemWithMessenger label="Copy" message="COPY" hotkey={[Characters.COMMAND, "C"]} disabled />
        <MenuItemWithMessenger label="Paste" message="PASTE" hotkey={[Characters.COMMAND, "V"]} disabled />
      </Menu>
      }
      placement="bottom-start"
    />
  );
}

export function AddMenu(props: MenuProps) {
  return (
    <Popover2
    minimal={true}

    transitionDuration={0}
    isOpen={props.isOpen}
    renderTarget={({ isOpen, ref, ...p }) => (
      <Button {...p} active={isOpen} elementRef={ref as React.RefObject<HTMLButtonElement>} text="Add" />
    )}
    onInteraction={(e)=>props.onInteraction(e)}
    content={
      <Menu>
      <MenuItemWithMessenger label="Source" message="SHOULD_ADD_SOURCE" />
      <MenuItemWithMessenger label="Receiver" message="SHOULD_ADD_RECEIVER" />
      <MenuDivider />
      <MenuItemWithMessenger label="Sketch" message="SHOULD_ADD_SKETCH" disabled />
      <MenuDivider />
      <MenuItemWithMessenger label="Ray Tracer" message="SHOULD_ADD_RAYTRACER" />
      <MenuItemWithMessenger label="Image Source" message="SHOULD_ADD_IMAGE_SOURCE"/>
      <MenuItemWithMessenger label="2D-FDTD" message="SHOULD_ADD_FDTD_2D" />
      <MenuItemWithMessenger label="RT60" message="SHOULD_ADD_RT60" />
    </Menu>
    }
    placement="bottom-start"
  />
  );
}

export function ViewMenu(props: MenuProps) {
  return (
    <Popover2
    minimal={true}
    onInteraction={(e)=>props.onInteraction(e)}
    isOpen={props.isOpen}
    transitionDuration={0}
    renderTarget={({ isOpen, ref, ...p }) => (
      <Button {...p} active={isOpen} elementRef={ref as React.RefObject<HTMLButtonElement>} text="View" />
    )}
    content={
      <Menu>
        <MenuItemWithMessenger label="Clear Local Storage" message="CLEAR_LOCAL_STORAGE" />
        <MenuItemWithMessenger label="Toggle Renderer Stats" message="TOGGLE_RENDERER_STATS_VISIBLE" />
      </Menu>
    }
    placement="bottom-start"
  />
  );
}

export function ToolMenu(props: MenuProps) {
  return (
    <Popover2
    minimal={true}
    onInteraction={(e)=>props.onInteraction(e)}
    isOpen={props.isOpen}
    transitionDuration={0}
    renderTarget={({ isOpen, ref, ...p }) => (
      <Button {...p} active={isOpen} elementRef={ref as React.RefObject<HTMLButtonElement>} text="Tools" />
    )}
    content={
      <Menu>
        <MenuItemWithMessenger label="CLF Viewer" message="OPEN_CLF_VIEWER" />
        <MenuItemWithMessenger label="Image Source Test" message="SHOULD_ADD_IMAGE_SOURCE" />
      </Menu>
    }
    placement="bottom-start"
    />

  );
}

export function ExamplesMenu(props: MenuProps) {
  return (
    <Popover2
    minimal={true}
    onInteraction={(e)=>props.onInteraction(e)}
    isOpen={props.isOpen}
    transitionDuration={0}
    renderTarget={({ isOpen, ref, ...p }) => (
      <Button {...p} active={isOpen} elementRef={ref as React.RefObject<HTMLButtonElement>} text="Examples" />
    )}
    content={
      <Menu>
        <MenuItemWithMessenger label="Shoebox" message="OPEN_EXAMPLE_SHOEBOX" />
      </Menu>
    }
    placement="bottom-start"
  />
  );
}




const ProjectName = () => {
  const projectName = useAppStore(state=>state.projectName);
  return (
    <Navbar.Group className="main-nav_bar-left_group main-nav_bar-projectname_text">{projectName}</Navbar.Group>
  )
}





type NavBarStore = {
  openMenu: number|null;
  setOpenMenu: (openMenu: number|null) => void;
}

export const useNavBarStore = create<NavBarStore>((set) => ({
  openMenu: null,
  setOpenMenu: (openMenu: number|null) => set({openMenu})
}));

export default useAppStore;


export function NavBarComponent() {
  const {openMenu, setOpenMenu} = useNavBarStore();

  return (
    <Navbar className="main-nav_bar">
      <Navbar.Group className="main-nav_bar-left_group">
        <Navbar.Group className="main-nav_bar-logo_text">cram</Navbar.Group>
        <Navbar.Divider />
        <Menu className="main-nav_bar-left_menu">
          <ButtonGroup minimal={true}>
            <FileMenu onInteraction={(e)=>e ? setOpenMenu(1) : setOpenMenu(null)} isOpen={openMenu === 1}/>
            <EditMenu onInteraction={(e)=>e ? setOpenMenu(2): setOpenMenu(null)} isOpen={openMenu === 2}/>
            <AddMenu  onInteraction={(e)=>e ? setOpenMenu(3): setOpenMenu(null)} isOpen={openMenu === 3}/>
            <ViewMenu onInteraction={(e)=>e ? setOpenMenu(4): setOpenMenu(null)} isOpen={openMenu === 4}/>
            <ToolMenu onInteraction={(e)=>e ? setOpenMenu(5): setOpenMenu(null)} isOpen={openMenu === 5}/>
            <ExamplesMenu onInteraction={(e)=>e ? setOpenMenu(6): setOpenMenu(null)} isOpen={openMenu === 6}/>
          </ButtonGroup>
        </Menu>
      </Navbar.Group>
      <ProjectName />
      <Navbar.Group className="main-nav_bar-right_group">
        <Button
          icon="cog"
          minimal={true}
          className={"main-nav_bar-right_menu-button"}
          onClick={(e) => postMessage("SHOW_SETTINGS_DRAWER")}
        ></Button>
      </Navbar.Group>
    </Navbar>
  );
}
