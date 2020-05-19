import React, { useState } from "react";
import { ObjectPropertyInputEvent } from "../number-input/NumberInput";

export interface TextInputProps {
  name: string;
  className?: string;
  value: string;
  verifier?: (val: string) => boolean;
  id?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  onChange: (e: ObjectPropertyInputEvent) => void;
}




export function TextInput(props: TextInputProps) {
  
   const basestyle: React.CSSProperties = {
   };
   let mergedStyles = props.style
     ? Object.assign(basestyle, props.style)
     : basestyle;


  
  const _props = {
    value: props.value,
    type: "text",
    onChange: (e: React.ChangeEvent) => {
      props.onChange({
        name: props.name,
        type: "text",
        value: (e.currentTarget as HTMLInputElement).value,
        id: props.id
      })
    },
    name: props.name, 
    // className?: props.className;
    // value: number|string;
    style: basestyle,
    disabled: props.disabled,
    className: "text-input"
  };
	return (
    <input {..._props}/>
  );
}

export default TextInput;
