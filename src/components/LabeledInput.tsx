import React, { useState } from "react";

export interface LabeledInputProps {
  label: string;
  id?: string;
  defaultValue?: string;
  listener: (id: string, v: string) => void;
}

export default function LabeledInput(props: LabeledInputProps) {
  const [val, setVal] = useState("");

  const handleChange = e => {
    setVal(e.target.value);
    props.listener(props.id || props.label, e.target.value);
  };

  return (
    <span>
      <label>{props.label}</label>
      <input
        type="text"
        onChange={handleChange}
        value={val}
        placeholder={props.defaultValue || ""}
      />
    </span>
  );
}
