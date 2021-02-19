import React from "react";
import styled from 'styled-components';

const PropertyRowContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  user-select: none;
  font-size: 9pt;
`;
export interface PropertyRowProps{
  children: React.ReactNode[];
}

export default function PropertyRow(props: PropertyRowProps) {
  return (
    <PropertyRowContainer>
      {props.children}
    </PropertyRowContainer>
  )
}