import React from "react";
import styled from 'styled-components';


const StyledSelect = styled.select`

`;


interface Props {
  value: string;
  onChange: ({ value }: { value: string }) => void;
  options: {value: string, label: string}[];
}

export const PropertyRowSelect = ({ value, onChange, options }: Props) => {
  return (
    <StyledSelect
      onChange={(e) => onChange({ value: e.currentTarget.value })}
      value={value}
    >
      {options.map(({value, label}, i)=><option value={value} key={`${value}-${label}-${i}`}>{label}</option>)}
    </StyledSelect>
  )
}
