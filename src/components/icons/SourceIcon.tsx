import React from "react";
import WifiIcon from "@material-ui/icons/Wifi";
import { SvgIconProps } from "@material-ui/core";

export function SourceIcon(props: SvgIconProps) {
  return <WifiIcon transform="rotate(45)" fillOpacity={0.95} {...props} />;
}