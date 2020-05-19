import React, {useState} from "react";

export interface ColorInputProps {
  name: string;
  className?: string;
  value: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ColorInput(props: ColorInputProps) {
  return (<div>
    <input type="color" onChange={props.onChange} name={props.name} className={props.className||""} value={props.value} />
  </div>)
}




export default ColorInput;
