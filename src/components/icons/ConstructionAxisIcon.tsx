import React from "react";
import { SvgIcon, SvgIconProps } from "@material-ui/core";

export function ConstructionAxisIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 19.5L20.5 16V4H8L4.5 8V19.5H11" stroke="#2D2D2D" strokeWidth="2" />
        <rect x="12" y="8" width="4" height="14" fill="#FFA200" />
      </svg>
    </SvgIcon>
  );
}
