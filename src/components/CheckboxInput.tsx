import React from "react";
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
export interface CheckboxInputProps {
	name: string;
	className?: string;
	checked: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CheckboxInput(props: CheckboxInputProps) {
	return (
		<label className="checkbox-container">
			<input className={"checkbox-input"} type="checkbox" {...props} />
			{props.checked?<VisibilityIcon fontSize="small" className="checkbox-checkmark"/>:<VisibilityOffIcon fontSize="small" className="checkbox-checkmark"/>}
		</label> 
	)
}

export default CheckboxInput;
