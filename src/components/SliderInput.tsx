import React, { useState } from 'react';

export interface SliderInputProps {
  value: number;
  id: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  onChange: (e: React.FormEvent) => void;
}

export default function SliderInput(props: SliderInputProps) {
  const [value, setValue] = useState(props.value);

  const inputProps = {} as React.InputHTMLAttributes<HTMLInputElement>;
  inputProps.type = "range";
  inputProps.className = "slider-input";
  props.className && (inputProps.className += " " + props.className);
  props.min && (inputProps.min = props.min);
  props.max && (inputProps.max = props.max);
  props.step && (inputProps.step = props.step);

  
  return (
    <input
      id={props.id}
      value={value}
      // onDoubleClick={() => setEdit(true)}
      // onBlur={() => setEdit(false)}
      onChange={props.onChange}
      onInput={props.onChange}
      {...inputProps}
    />  
  )
}