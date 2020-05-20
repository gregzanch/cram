import React from "react";
import "./PropertyRow.css";
export interface PropertyRowProps{
  children: React.ReactNode[];
}
export default function PropertyRow(props: PropertyRowProps) {
  return (
    <div className="property-row-container">
      {props.children}
    </div>
  )
}