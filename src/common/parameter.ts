export interface ParameterProps {
  id: string;
  value: string|number;
  label: string;
  category: string;
  format?: (val: string) => string;
  expression?: string;
}

export default class Parameter {
  id: string;
  value: string;
  label: string;
  category: string;
  format: (val: string) => string;
  expression: string;
  constructor(props: ParameterProps) {
    this.id = props.id;
    this.value = props.value.toString();
    this.label = props.label;
    this.category = props.category;
    this.format = props.format || ((v: string) => v);
    this.expression = props.expression || "";
  }
}

export interface ParameterList {
  [key: string]: Parameter;
}
