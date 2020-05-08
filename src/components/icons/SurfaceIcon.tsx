import React from 'react';
import { SvgIcon, SvgIconProps } from "@material-ui/core";

export function SurfaceIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg fill="none" {...props}>
        <path fill="#C0C1C1" stroke="#303030" d="M4.6 4.6h13.8v13.8H4.6z" />
        <circle cx={4.6} cy={4.6} r={1.84} fill="#303030" />
        <circle cx={18.4} cy={4.6} r={1.84} fill="#303030" />
        <circle cx={18.4} cy={18.4} r={1.84} fill="#303030" />
        <circle cx={4.6} cy={18.4} r={1.84} fill="#303030" />
      </svg>
    </SvgIcon>
  );
}
