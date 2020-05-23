import React from "react";
import "./PropertyRowCheckbox.css";

export interface PropertyRowCheckboxProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  checked: boolean;
}
export default function PropertyRowCheckbox(props: PropertyRowCheckboxProps){
  return (
    <input
      type="checkbox"
      className="property-row-checkbox"
      onChange={props.onChange}
      checked={props.checked}
    />
  )
}

