import React from "react";
import Container from "../objects/container";

import {
  InputGroup, FormGroup, Label, NumericInput
} from '@blueprintjs/core';




export interface ObjectPropertiesProps {
  object: Container;
  onPropertyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ObjectProperties(props: ObjectPropertiesProps) {
	return (
		<div>
			<FormGroup
				label="name"
				labelFor={props.object.uuid+".name"}
				inline={true}
				style={{
					textAlign: "right",
					alignItems: "center",
					justifyContent: "space-evenly"
				}}>
				<InputGroup
					id={props.object.uuid+".name"}
					value={props.object.name}
					onChange={props.onPropertyChange}
					fill
					small
				/>
			</FormGroup>
			<FormGroup
        label="x"
        labelFor={props.object.uuid+".x"}
				inline={true}
				style={{
					textAlign: "right",
					alignItems: "center",
					justifyContent: "space-evenly"
				}}>
				<NumericInput
          id={props.object.uuid +".x"}
					value={props.object.x}
					onChange={props.onPropertyChange}
					fill
				/>
			</FormGroup>
		</div>
	);
}
