import React from "react";
import "./PropertyRowTextInput.css";

export interface TextInputChangeEvent {
  id?: string;
  value: string;
}

export interface PropertyRowTextInputProps {
  onChange: (event: TextInputChangeEvent) => void;
  value: string;
  id?: string;
}
export default function PropertyRowTextInput(props: PropertyRowTextInputProps) {
  return <input
    {...props.id && { id: props.id }}
    type="text"
    className="property-row-text-input"
    onChange={(e) => {
      props.onChange({
        value: e.currentTarget.value,
        id: props.id || ""
      });
    }}
    value={props.value}
  />;
}
