import React, { Fragment } from "react";
import styled from "styled-components";

export interface GridRowProps {
  label?: React.ReactNode | React.ReactNode[];
  children?: React.ReactNode | React.ReactNode[];
  span?: number;
  style?: React.CSSProperties;
}

const Label = styled.div`
  display: grid;
  grid-column-start: 1;
  grid-column-end: 2;
  text-align: end;
`;

const InputContainer = styled.div`
  display: grid;
  grid-column-start: 2;
  grid-column-end: 3;
`;

export default function GridRow(props: GridRowProps) {
  return (
    <Fragment>
      <Label>{props.label}</Label>
      <InputContainer>{props.children}</InputContainer>
    </Fragment>
  );
}
