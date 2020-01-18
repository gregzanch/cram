import React from "react";
import GridRow from "../containers/GridRow";
import RowItem from "../containers/RowItem";
import Parameter, {ParameterList} from "../common/parameter";
import FormattedInput from "./FormattedInput";
import GridRowHeader from './GridRowHeader';

import IconExpression from './icons/IconExpression';


interface ParameterPanelProps {
  onParameterChange: (id: string, value: string | number) => void;
  onParameterSubmit: (e: React.FormEvent) => void;
  parameters: ParameterList;
  parameterGroups: string[];
}

const GridRowStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr 100px 100px 1fr"
};

const RowStyle: React.CSSProperties = {
  textAlign: "end",
  paddingRight: ".5em",
  paddingLeft: ".5em",
  fontFamily: "Roboto",
  fontSize: "8pt"
};
const labelStyle: React.CSSProperties = {
  fontWeight: "lighter"
};

const css = x => x[0];

export const ParameterPanelStyle = css`
  .parameter-row-input {
    font-family: "Roboto";
    font-size: 11px;
    border-top: none;
    border-left: none;
    border-right: none;
    border-bottom-width: 1px;
    text-align: center;
    cursor: default;
    height: 1em;
    margin-top: auto;
    margin-bottom: auto;
    max-width: 100px;
  }
  .parameter-row-input:focus {
    outline: none;
    background-color: rgba(0, 0, 20, 0.05);
    cursor: unset;
  }
  .parameter-row-input:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  .parameter-row-label {
    font-weight: lighter;
  }
`;



export default function ParameterPanel(props: ParameterPanelProps) {
  const groups = {};
  props.parameterGroups.forEach(x => {
    groups[x] = [];
  });
  const using_expr = (k) => props.parameters[k].expression ? props.parameters[k].expression !== "" : false;
  for (const k in props.parameters) {
    groups[props.parameters[k].category].push(
		<GridRow key={k} style={GridRowStyle}>
			<RowItem style={RowStyle}></RowItem>
			<RowItem style={RowStyle}>
				<label style={labelStyle}>
					{using_expr(k) ? (
						<span className="icon-expression">λ</span>
					) : (
						""
					)}
					{props.parameters[k].label}
				</label>
			</RowItem>
			<RowItem>
				<FormattedInput
					extraClassNames={["parameter-row-input"]}
					id={props.parameters[k].id}
					value={String(props.parameters[k].value)}
					onValueChange={props.onParameterChange}
					onSubmit={props.onParameterSubmit}
					format={props.parameters[k].format}
					expression={props.parameters[k].expression || ""}
					usingExpression={using_expr(k)}
				/>
			</RowItem>
		</GridRow>
	);
  }
  return (
    <div>
      {props.parameterGroups.map((x,i) => {
        return (
          <div key={"grid-row-group"+i}>
            <GridRowHeader>{x}</GridRowHeader>
            {groups[x]}
          </div>
        );
      })}
    </div>
  );
}
