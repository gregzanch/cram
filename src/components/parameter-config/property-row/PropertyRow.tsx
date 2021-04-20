import React from "react";
import styled from 'styled-components';

const PropertyRowContainer = styled.div`
  display: grid;
  grid-template-columns: 3fr 8fr 2fr;
  user-select: none;
  font-size: 9pt;
  margin-bottom: .125em;
  :last-child {
    margin-bottom: 0;
  }
`;
export interface PropertyRowProps{
  children: React.ReactNode;
}

export default function PropertyRow(props: PropertyRowProps) {
  return (
    <PropertyRowContainer>
      {props.children}
    </PropertyRowContainer>
  )
}