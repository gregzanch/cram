import React from "react";
import GridRow from "../containers/GridRow";
import RowItem from "../containers/RowItem";
import TexInput, { TexChangeObject } from "./TexInput";
import GridRowHeader from './GridRowHeader';
import { evaluate, parser as Parser, parse } from 'mathjs';




const GridRowStyle: React.CSSProperties = {
	gridTemplateColumns: "1fr"
};

const RowStyle: React.CSSProperties = {
    textAlign: "left",
    marginLeft: "1.5em",
	paddingRight: ".5em",
	paddingLeft: ".5em",
	fontFamily: "Roboto",
	fontSize: "8pt"
};
const TexInputContainerStyle: React.CSSProperties = {
	textAlign: "center",

	fontFamily: "Roboto",
    fontSize: "8pt",
    gridColumn: "1 / 3",
    width: '100%'
};


const TexInputGridRowStyle: React.CSSProperties = {
	gridTemplateColumns: "1fr"
};
const labelStyle: React.CSSProperties = {
	fontWeight: "lighter"
};

export interface ConditionPanelProps{
    f?: string;
	g?: string;
	onChange: (id: string, value: string) => void
}
export interface ConditionPanelState{
    f: string;
    g: string;
}


export default class ConditionPanel extends React.Component<ConditionPanelProps, ConditionPanelState> {
    constructor(props: ConditionPanelProps) {
        super(props);
        this.state = {
            f: props.f || "",
            g: props.g || "",
        }
	}
	handleChange(e: TexChangeObject) {
		
	}
    render() {
        return (
			<div>
				<div>
					<GridRowHeader gridRowHeaderStyle={{ marginTop: ".5em" }}>
						boundary conditions
					</GridRowHeader>

					<GridRow style={GridRowStyle}>
						<RowItem style={RowStyle}>
							<label style={labelStyle}>initial position</label>
						</RowItem>
					</GridRow>

					<GridRow style={TexInputGridRowStyle}>
						<RowItem style={TexInputContainerStyle}>
							<TexInput
								id={"f"}
								latex={this.props.f || ""}
								onChange={this.handleChange}
							/>
						</RowItem>
					</GridRow>
					<GridRow style={GridRowStyle}>
						<RowItem style={RowStyle}>
							<label style={labelStyle}>initial velocity</label>
						</RowItem>
					</GridRow>

					<GridRow style={TexInputGridRowStyle}>
						<RowItem style={TexInputContainerStyle}>
							<TexInput
								id={"g"}
								latex={this.props.g || ""}
								onChange={this.handleChange}
							/>
						</RowItem>
					</GridRow>
				</div>
			</div>
		);
    }
}
