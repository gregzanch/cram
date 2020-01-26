export type ConfigType = "text" | "number" | "checkbox" | "radio";


export class Setting<T>{
  private _value: T
  public configType: ConfigType;
  constructor(value: T, configType: ConfigType){
    this._value = value;
    this.configType = configType;
  }
  get value() {
    return this._value;
  }
  set value(newvalue: T) {
    this._value = newvalue;
  }
}