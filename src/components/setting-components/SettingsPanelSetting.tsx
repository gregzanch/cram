import React from 'react';

import "./SettingsPanelSetting.css";

export interface SettingsPanelSettingProps{
  name: React.ReactNode;
  description: React.ReactNode;
  children?: React.ReactNode;
  edited?: boolean;
}

export default function SettingsPanelSetting(props: SettingsPanelSettingProps) {
  return (
    <div className="settings-panel-setting">
      <div className="settings-panel-setting-titleblock">
        {props.edited && <span className="settings-panel-setting-dot">•</span>}
        <div className="settings-panel-setting-name">{props.name}</div>
        <div className="settings-panel-setting-description">
          {props.description}
        </div>
      </div>
      <div className="settings-panel-setting-content">{props.children}</div>
    </div>
  );
}