import React from "react";
import styled from 'styled-components';

const PropertyRowButtonContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

const StyledButton = styled.button`


  margin-left: 0.5em;
  margin-right: 0.5em;
  border-radius: .25rem;
  margin-top: .125em;
  margin-bottom: .125em; 
  width: 100%;
  color: #212529;
  background-color: #f8f9fa;
  border-color: #f8f9fa;
  user-select: none;
  border: 1px solid transparent;


  :hover {
      color: #212529;
      background-color: #e2e6ea;
      border-color: #dae0e5;
  }

  :active{
      color: #212529;
      background-color: #dae0e5;
      border-color: #d3d9df;
  }

  :disabled{
      color: #676f78;
      background-color: #c3c5c7;
      border-color: #d3d9df;
  }

`;


export interface PropertyRowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  label: string;
}
export default function PropertyRowButton(props: PropertyRowButtonProps){
  return (
    <PropertyRowButtonContainer>
      <StyledButton {...props}>
        {props.label}
      </StyledButton>
    </PropertyRowButtonContainer>
  );
}
