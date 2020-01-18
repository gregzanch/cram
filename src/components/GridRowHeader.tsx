import * as React from 'react';
import GridRow from '../containers/GridRow';
import RowItem from '../containers/RowItem';

export const RowHeaderStyle: React.CSSProperties = {
	textAlign: "left",
	paddingRight: ".5em",
	paddingLeft: ".5em",
	paddingBottom: ".5em",
	fontFamily: "Roboto",
	fontSize: "10pt"
};
export const RowHeaderTextStyle: React.CSSProperties = {
	fontWeight: "lighter"
};
export const GridRowHeadertyle: React.CSSProperties = {
	gridTemplateColumns: "1fr"
};



export interface GridRowHeaderProps {
	children?: Element|Element[]|string|number;
	rowHeaderStyle?: React.CSSProperties;
	rowHeaderTextStyle?: React.CSSProperties;
	gridRowHeaderStyle?: React.CSSProperties;
}

export default function GridRowHeader(props: GridRowHeaderProps) {
    const grhs = props.gridRowHeaderStyle ? Object.assign(GridRowHeadertyle, props.gridRowHeaderStyle) : GridRowHeadertyle;
    const rhs = props.rowHeaderStyle ? Object.assign(RowHeaderStyle, props.rowHeaderStyle) : RowHeaderStyle;
    const rhts = props.rowHeaderTextStyle ? Object.assign(RowHeaderTextStyle, props.rowHeaderTextStyle) : RowHeaderTextStyle;
    return (
        <GridRow style={grhs}>
			<RowItem style={rhs}>
				<span style={rhts}>{props.children}</span>
			</RowItem>
		</GridRow>
	);
}