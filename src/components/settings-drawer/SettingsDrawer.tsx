import React, { useState } from "react";

import { Drawer, Position, InputGroup, Button } from "@blueprintjs/core";

import { KeyValuePair } from "../../common/key-value-pair";

import "./SettingsDrawer.css";
import Tabs from "@material-ui/core/Tabs/Tabs";
import { useAppStore } from "../../store";
import { useSetting } from "../../store/settings-store";

export interface SettingsDrawerProps {
  size: number | string;
  onClose: (
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ) => void;
  isOpen: boolean;
  children?: React.ReactNode | React.ReactNode[];
  onSubmit?: (((event: React.MouseEvent<HTMLElement, MouseEvent>) => void) & ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void))
}



export default function SettingsDrawer(props: SettingsDrawerProps) {
  const [selectedTabId, setSelectedTabId] = useState("renderer");
  const isOpen = useAppStore(store => store.settingsDrawerVisible);
  const set = useAppStore(store => store.set);
  // const {settings, set} = useSetting(state=>state);

  return (
    <Drawer
      position={Position.RIGHT}
      size="55%"
      autoFocus={true}
      enforceFocus={true}
      hasBackdrop={true}
      onClose={e=>set(draft=>{ draft.settingsDrawerVisible = false })}
      isOpen={isOpen}
      canOutsideClickClose={true}
      canEscapeKeyClose={true}
      isCloseButtonShown={true}
      title={
        <div className="settings-title-bar">
          <div className="settings-title-bar-title">Settings</div>
					<div className="settings-title-bar-apply">
						<Button text="Apply" rightIcon="small-tick" minimal intent="success" style={{
							display: "inline"
						}} onClick={props.onSubmit}/>
					</div>
        </div>
      }
      
      >
      {/* <Tabs selectedIndex={selectedIndex} onSelect={e=>setSelectedIndex(e)}>
        <TabList>
          <Tab disabled />
          {Object.keys(this.state.settings).map((key) => {
            return <Tab key={"settings-tabname-" + key}>{properCase(key)}</Tab>;
          })}
        </TabList>
        <TabPanel />
        {Object.keys(this.state.settings).map((key) => {
          return (
            <TabPanel key={"settings-tabpanel-" + key}>
              <SettingsPanel messenger={messenger} category={key} />
            </TabPanel>
          );
        })}
      </Tabs> */}
    </Drawer>
  );
}
