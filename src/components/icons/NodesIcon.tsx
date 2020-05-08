import React from 'react';
import { SvgIcon, SvgIconProps } from "@material-ui/core";

export function NodesIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg width="24" height="24" viewBox="-4 -4 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 12C4 13.1046 3.10457 14 2 14C0.89543 14 0 13.1046 0 12C0 10.8954 0.89543 10 2 10C3.10457 10 4 10.8954 4 12Z" fill="black" />
        <path d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" fill="black" />
        <path d="M9 2C9 3.10457 8.10457 4 7 4C5.89543 4 5 3.10457 5 2C5 0.89543 5.89543 0 7 0C8.10457 0 9 0.89543 9 2Z" fill="black" />
        <path d="M7 2L2 12H12L7 2Z" stroke="black" />
      </svg>
    </SvgIcon>
  );
}
