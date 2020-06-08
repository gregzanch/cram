import React from "react";
import { SvgIcon, SvgIconProps } from "@material-ui/core";

export function ConstructionPointIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.5 7L8 4H20.5V16L17 19.5H4.5V15" stroke="#2D2D2D" strokeWidth="2" />
        <rect x="2" y="8" width="6" height="6" fill="#FFA200" />
      </svg>
    </SvgIcon>
  );
}
