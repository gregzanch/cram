import React from 'react';

import "./MenuItemText.css";

export interface MenuItemTextProps{
  text: string;
  hotkey: string[];
}

export default function MenuItemText(props: MenuItemTextProps) {
  const id = props.hotkey.join("");
  return (
    <div className="menu-item-text">
      <div>{props.text}</div>
      <div className="menu-item-hotkey-container">
        {props.hotkey.map((key, i) => <span className="menu-item-hotkey" key={id+props.text+String(i)}>{key}</span>)}
      </div>
    </div>
  );
}