import React, { useState } from "react";

export interface NumberInputProps {
  name: string;
  className?: string;
  value: number | string;
  style?: React.CSSProperties;
  disabled?: boolean;
  step?: number;
  min?: number;
  max?: number;
  id?: string;
  onChange: (e: ObjectPropertyInputEvent) => void;
  verifier?: (val: string | number) => boolean;
}

export interface ObjectPropertyInputEvent {
  name: string;
  type: string;
  value: any;
  checked?: boolean;
  id?: string;
}

export function NumberInput(props: NumberInputProps) {
  const _props = {
    onChange: e =>
      props.onChange({
        value: e.currentTarget.value,
        name: props.name,
        id: props.id,
        type: "number"
      }),
    name: props.name,
    className: ["number-input", props.className || ""].join(" "),
    value: props.value,
    style: props.style,
    disabled: props.disabled,
    step: props.step,
    min: props.min,
    max: props.max,
    id: props.id,
    type: "number"
  };
  return <input {..._props} />;
}

export default NumberInput;
