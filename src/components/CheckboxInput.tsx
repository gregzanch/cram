import React from "react";
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { ObjectPropertyInputEvent } from "./NumberInput";
export interface CheckboxInputProps {
	name: string;
	className?: string;
	checked: boolean;
	checkedNode?: React.ReactNode
	uncheckedNode?: React.ReactNode
	onChange: (e: ObjectPropertyInputEvent) => void;
}

export function CheckboxInput(props: CheckboxInputProps) {
	return (
		<label className="checkbox-container">
			<input
				className={"checkbox-input"}
				type="checkbox"
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
				props.onChange({
					name: e.currentTarget.name,
					type: e.currentTarget.type,
					value: e.currentTarget.checked,
					checked: e.currentTarget.checked,
					id: e.currentTarget.id
				})
				}}
				name={props.name}
				checked={props.checked}
			/>
			{props.checked ? (props.checkedNode || <VisibilityIcon fontSize="small" className="checkbox-checkmark"/>) : (props.uncheckedNode || <VisibilityOffIcon fontSize="small" className="checkbox-checkmark"/>)}
		</label> 
	)
}

export default CheckboxInput;
