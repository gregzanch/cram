import React from "react";

export interface TextInputProps {
	name: string;
	className?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TextInput(props: TextInputProps) {
	return <input className={"text-input"} type="text" {...props} />;
}

export default TextInput;
