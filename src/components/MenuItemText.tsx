import React from 'react';

import styled from 'styled-components';

const MenuItemTextComponent = styled.div`
  display: flex;
  justify-content: space-between;
`;

const MenuItemHotKeyContainer = styled.div`
  display: flex;  
  justify-content: space-between;
`;

const MenuItemHotKey = styled.span`
  min-width: 10px;
`;

export interface MenuItemTextProps{
  text: string;
  hotkey: string[];
}

export default function MenuItemText(props: MenuItemTextProps) {
  const id = props.hotkey.join("");
  return (
    <MenuItemTextComponent>
      <div>{props.text}</div>
      <MenuItemHotKeyContainer>
        {props.hotkey.map((key, i) => <MenuItemHotKey key={id+props.text+String(i)}>{key}</MenuItemHotKey>)}
      </MenuItemHotKeyContainer>
    </MenuItemTextComponent>
  );
}