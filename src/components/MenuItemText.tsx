import React from 'react';
import { Colors } from '@blueprintjs/core';
import { Characters } from '../constants';

export interface MenuItemTextProps{
  text: string;
  hotkey: string;
}

export default function MenuItemText(props: MenuItemTextProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between"
      }}>
      <div>{props.text}</div>
      <div style={{ color: Colors.LIGHT_GRAY1 }}>{props.hotkey||""}</div>
    </div>
  );
}