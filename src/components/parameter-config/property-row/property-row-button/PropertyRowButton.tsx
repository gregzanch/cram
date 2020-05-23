import React from "react";
import "./PropertyRowButton.css";

export interface PropertyRowButtonProps{
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  label: string;
}
export default function PropertyRowButton(props: PropertyRowButtonProps){
  return (
    <div className="property-row-button-container">
      <button className="property-row-button" onClick={props.onClick}>
        {props.label}
      </button>
    </div>
  );
}

