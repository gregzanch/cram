export type ConfigType = "text" | "number" | "checkbox" | "radio" | "color" | "select";

export interface SettingsProps<T> {
  value: T;
  kind: ConfigType;
  id: string;
  name: string;
  description: string;
}

export class Setting<T>{
  private _value: T;
  public kind: ConfigType;
  public id: string;
  public name: string;
  public description: string;
  public staged_value: T;
  
  constructor(props: SettingsProps<T>){
    this._value = props.value;
    this.kind = props.kind;
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.staged_value = this.value;
  }
  setStagedValue(value: T) {
    this.staged_value = value;
    return this;
  }
  submit() {
    this.value = this.staged_value;
  }
  get edited() {
    switch (this.kind) {
      case "number": return (this.value != this.staged_value);
      case "checkbox": return (this.value != this.staged_value);
      case "text": return (this.value !== this.staged_value);
      case "radio": return (this.value !== this.staged_value);
      case "select": return (this.value !== this.staged_value);
      default: return JSON.stringify(this.value) !== JSON.stringify(this.staged_value)
    }
  }
  get value() {
    return this._value;
  }
  set value(newvalue: T) {
    this._value = newvalue;
  }
}