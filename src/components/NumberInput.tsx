import React from "react";

export interface NumberInputProps {
	name: string;
	className?: string;
	value: number;
	style?: React.CSSProperties;
	disabled?: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function NumberInput(props: NumberInputProps) {
	return <input className={"number-input"} type="number" {...props} />;
}

export default NumberInput;
