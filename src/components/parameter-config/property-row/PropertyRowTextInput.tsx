import React from "react";
import styled from 'styled-components';


const StyledTextInput = styled.input`

    margin-left: .5em;
    margin-right: .5em;
    outline: none;
    border: none;
    border-radius: 2px;
    background: rgba(246, 248, 250, 0.75);
    padding: 0 10px;
    vertical-align: middle;
    color: #182026;
    -webkit-transition: -webkit-box-shadow .05s cubic-bezier(.4,1,.75,.9);
    -webkit-transition: box-shadow .05s cubic-bezier(.4,1,.75,.9);
    transition: box-shadow .05s cubic-bezier(.4,1,.75,.9);
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  :hover{
    outline: none;
    box-shadow: 0 0 0 0 rgba(19,124,189,0), 0 0 0 0 rgba(19,124,189,0), inset 0 0 0 1px rgba(16,22,26,.15), inset 0 1px 1px rgba(16,22,26,.2);
    background: rgba(246, 248, 250, 1.0);
  }
  :focus{
    box-shadow: 0 0 0 0 rgba(19,124,189,0), 0 0 0 0 rgba(19,124,189,0), inset 0 0 0 1px rgba(16,22,26,.15), inset 0 1px 1px rgba(16,22,26,.2);
    background: rgba(246, 248, 250, 0.75);
  }

`;


interface Props {
  value: string;
  onChange: ({ value }: { value: string }) => void;
}

export const PropertyRowTextInput = ({ value, onChange }: Props) => (
  <StyledTextInput
    type="text"
    onChange={(e) => onChange({ value: e.currentTarget.value })}
    value={value}
  />
)
