import React from "react";

const css = (x, ...args) => args ? x[0] + args.reduce((a, b, i) => a + b + x[i + 1], "") : x[0];


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
export interface FormattedInputProps {
	onValueChange: (id: string, value: string) => void;
	format: (value: string) => string;
	value: string;
	name?: string;
	id: string;
	style?: React.CSSProperties;
	extraClassNames?: string | string[];
	onSubmit?: (e: React.FormEvent) => void;
	usingExpression?: boolean;
	expression?: string;
}

export interface FormattedInputState {
	value: string;
	value_formatted: string;
	focused: boolean;
  using_expression: boolean;
  expression: string;
}



export default class FormattedInput extends React.PureComponent<FormattedInputProps, FormattedInputState> {
  constructor(props: FormattedInputProps) {
    super(props);
    this.state = {
      value: props.value,
      value_formatted: props.format(props.value),
      using_expression: props.usingExpression || false,
      expression: props.expression || "",
      focused: false
    }
  }
  componentWillReceiveProps(nextProps: FormattedInputProps, nextContext) {
    if (nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value,
        value_formatted: nextProps.format(nextProps.value),
        // expression: nextProps.expression || "",
        // using_expression: nextProps.usingExpression || false
      })
    }
  }
  render() {
    const { format, onValueChange, id } = this.props;
    const onSubmit = this.props.onSubmit || ((e: React.FormEvent) => e.preventDefault());
    const name = this.props.name || id;
    const classNames = ["formatted-input"].concat(this.props.extraClassNames || []).join(" ");
    // console.log(this.props.id, this.props.value, this.state.value, this.state.value_formatted);


    return (
		<form onSubmit={onSubmit}>
			<input
				type="text"
				name={name}
				id={id}
				className={classNames}
				value={
					this.state.focused
						? this.props.usingExpression
							? this.props.expression
							: this.state.value
						: this.state.value_formatted
				}
				property={this.state.using_expression ? "true" : "false"}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					this.setState(
						{
							value: e.target.value,
							value_formatted: format(e.target.value)
						},
						() => onValueChange(id, this.state.value)
					);
				}}
				onBlur={(e: React.FocusEvent) => {
					this.setState({
						focused: false
					});
				}}
				onFocus={(e: React.FocusEvent) => {
					this.setState({
						focused: true
					});
				}}
			/>
		</form>
	);
  }
}