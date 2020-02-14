import React from 'react';

import "./SettingsPanelBlock.css";

export interface SettingsPanelBlockProps{
  title: React.ReactNode;
  children?: React.ReactNode;
};

export default function SettingsPanelBlock(props: SettingsPanelBlockProps) {
  return (
    <div className="settings-panel-block">
      <div className="settings-panel-block-title">
        {props.title}
      </div>
      <div className="settings-panel-block-content">
        {props.children}
      </div>
    </div>
  )
};